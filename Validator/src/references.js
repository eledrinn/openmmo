/**
 * OpenMMO Reference Checker
 * 
 * Validates references between entities per T003b specification:
 * - Reference format validation (T003a)
 * - Reference target validation (T003b Section 2)
 * - Reference existence checking
 * - Circular reference detection (concept defined in T003b, implemented here)
 */

const fs = require('fs');
const path = require('path');
const { ValidationError, ErrorTypes } = require('./errors');

const FIXTURES_DIR = path.join(__dirname, '..', '..', 'Fixtures');

/**
 * Build a registry of all entity IDs from fixture files
 */
function buildEntityRegistry() {
  const registry = {
    item: new Set(),
    reward: new Set(),
    currency: new Set()
  };
  
  // Try to load from fixtures directory
  if (!fs.existsSync(FIXTURES_DIR)) {
    return registry;
  }
  
  // Load items
  const itemsDir = path.join(FIXTURES_DIR, 'items');
  if (fs.existsSync(itemsDir)) {
    const files = fs.readdirSync(itemsDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(itemsDir, file), 'utf-8');
        const item = JSON.parse(content);
        if (item.id) {
          registry.item.add(item.id);
        }
      } catch (e) {
        // Skip invalid files
      }
    }
  }
  
  // Load rewards
  const rewardsDir = path.join(FIXTURES_DIR, 'rewards');
  if (fs.existsSync(rewardsDir)) {
    const files = fs.readdirSync(rewardsDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(rewardsDir, file), 'utf-8');
        const reward = JSON.parse(content);
        if (reward.id) {
          registry.reward.add(reward.id);
        }
      } catch (e) {
        // Skip invalid files
      }
    }
  }
  
  return registry;
}

/**
 * Parse an ID to extract category
 */
function parseId(id) {
  const match = id.match(/^([a-z][a-z0-9]*)_.*$/);
  if (!match) {
    return null;
  }
  return match[1];
}

/**
 * Check if a reference is valid per T003b target rules
 * 
 * T003b Section 2 Reference Target Rules:
 * - Item can reference Reward (on_use_reward)
 * - Reward can reference Item (items array)
 * - Reward can reference Currency (currency array)
 */
function isValidReferenceTarget(sourceCategory, targetId, referenceField) {
  const targetCategory = parseId(targetId);
  if (!targetCategory) {
    return false;
  }
  
  // Item referencing Reward (on_use_reward field)
  if (sourceCategory === 'item' && referenceField === 'on_use_reward') {
    return targetCategory === 'reward';
  }
  
  // Reward referencing Item (items[].item field)
  if (sourceCategory === 'reward' && referenceField === 'items') {
    return targetCategory === 'item';
  }
  
  // Reward referencing Currency (currency[].currency_type field - not a reference)
  // Currency is an enum, not a reference
  
  return true; // Allow other cases for now, existence check will catch invalid targets
}

/**
 * Check if a reference exists in the registry
 */
function referenceExists(registry, refId) {
  const category = parseId(refId);
  if (!category || !registry[category]) {
    return false;
  }
  return registry[category].has(refId);
}

/**
 * Find all references in an object recursively
 */
function findReferences(obj, path = '', refs = []) {
  if (typeof obj !== 'object' || obj === null) {
    return refs;
  }
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      findReferences(item, `${path}[${index}]`, refs);
    });
  } else {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      // Skip 'id' field - it's the entity's own ID, not a reference to another entity
      if (key === 'id') {
        continue;
      }
      
      // Check if this looks like a reference (string matching ID pattern)
      if (typeof value === 'string' && /^[a-z][a-z0-9]*_[a-z0-9_]+$/.test(value)) {
        refs.push({
          path: currentPath,
          value: value,
          parentKey: key
        });
      }
      
      // Recurse
      if (typeof value === 'object' && value !== null) {
        findReferences(value, currentPath, refs);
      }
    }
  }
  
  return refs;
}

/**
 * Check for circular references in a set of entities
 * 
 * Per T003b: A circular reference exists when Entity A references Entity B,
 * and following references from B eventually leads back to A.
 */
function detectCircularReferences(entities) {
  const errors = [];
  const visited = new Set();
  const recursionStack = new Set();
  
  function dfs(entityId, path = []) {
    if (recursionStack.has(entityId)) {
      // Found cycle
      const cycleStart = path.indexOf(entityId);
      const cycle = path.slice(cycleStart).concat([entityId]);
      errors.push(new ValidationError(
        ErrorTypes.CIRCULAR_REFERENCE,
        `Circular reference detected: ${cycle.join(' -> ')}`,
        entityId,
        cycle
      ));
      return;
    }
    
    if (visited.has(entityId)) {
      return;
    }
    
    visited.add(entityId);
    recursionStack.add(entityId);
    
    const entity = entities[entityId];
    if (entity) {
      const refs = findReferences(entity);
      for (const ref of refs) {
        dfs(ref.value, [...path, entityId]);
      }
    }
    
    recursionStack.delete(entityId);
  }
  
  for (const entityId of Object.keys(entities)) {
    if (!visited.has(entityId)) {
      dfs(entityId);
    }
  }
  
  return errors;
}

/**
 * Validate all references in a data object
 */
function validateReferences(data, sourceCategory, registry = null) {
  const errors = [];
  
  if (!registry) {
    registry = buildEntityRegistry();
  }
  
  const refs = findReferences(data);
  
  for (const ref of refs) {
    // Check existence
    if (!referenceExists(registry, ref.value)) {
      errors.push(new ValidationError(
        ErrorTypes.REFERENCE_NOT_FOUND,
        `Referenced entity not found: ${ref.value}`,
        ref.path,
        ref.value
      ));
    }
    
    // Check target rules per T003b
    if (!isValidReferenceTarget(sourceCategory, ref.value, ref.parentKey)) {
      errors.push(new ValidationError(
        ErrorTypes.INVALID_REFERENCE_TARGET,
        `Invalid reference target: ${ref.value} from ${sourceCategory} (field: ${ref.parentKey})`,
        ref.path,
        ref.value
      ));
    }
  }
  
  return errors;
}

module.exports = {
  buildEntityRegistry,
  parseId,
  isValidReferenceTarget,
  referenceExists,
  findReferences,
  detectCircularReferences,
  validateReferences
};
