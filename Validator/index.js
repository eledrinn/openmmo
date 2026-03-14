/**
 * OpenMMO Validator - Main Entry Point
 * 
 * Validates OpenMMO entities against Wave 1 schemas:
 * - id (T003a)
 * - reference (T003b)
 * - item (T004)
 * - reward (T005)
 * 
 * Usage:
 *   const { validateEntity, validateProject } = require('./Validator');
 *   const result = validateEntity('path/to/item.json', 'item');
 */

const { validateFile, validateFiles, loadSchema, validateValue } = require('./src/validator');
const { validateReferences, buildEntityRegistry, detectCircularReferences } = require('./src/references');
const { ValidationError, ErrorTypes, formatError } = require('./src/errors');
const fs = require('fs');
const path = require('path');

/**
 * Validate a single entity file
 */
function validateEntity(filePath, schemaName) {
  const result = validateFile(filePath, schemaName);
  return {
    file: filePath,
    valid: result.valid,
    errors: result.errors.map(formatError),
    data: result.data
  };
}

/**
 * Validate all entities in a directory
 */
function validateDirectory(dirPath, schemaName) {
  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(dirPath, f));
  
  const results = validateFiles(files, schemaName);
  return results.map(r => ({
    file: r.file,
    valid: r.valid,
    errors: r.errors.map(formatError),
    data: r.data
  }));
}

/**
 * Validate a full project (all schemas)
 */
function validateProject(basePath) {
  const results = {
    valid: true,
    items: [],
    rewards: [],
    errors: []
  };
  
  // Validate items
  const itemsDir = path.join(basePath, 'Fixtures', 'items');
  if (fs.existsSync(itemsDir)) {
    results.items = validateDirectory(itemsDir, 'item');
  }
  
  // Validate rewards
  const rewardsDir = path.join(basePath, 'Fixtures', 'rewards');
  if (fs.existsSync(rewardsDir)) {
    results.rewards = validateDirectory(rewardsDir, 'reward');
  }
  
  // Check for circular references
  const allEntities = {};
  for (const item of results.items) {
    if (item.data && item.data.id) {
      allEntities[item.data.id] = item.data;
    }
  }
  for (const reward of results.rewards) {
    if (reward.data && reward.data.id) {
      allEntities[reward.data.id] = reward.data;
    }
  }
  
  const circularErrors = detectCircularReferences(allEntities);
  if (circularErrors.length > 0) {
    results.valid = false;
    results.errors = circularErrors.map(formatError);
  }
  
  // Overall validity
  const allResults = [...results.items, ...results.rewards];
  results.valid = results.valid && allResults.every(r => r.valid);
  
  return results;
}

/**
 * Get validation summary
 */
function getSummary(results) {
  if (Array.isArray(results)) {
    const valid = results.filter(r => r.valid).length;
    const invalid = results.filter(r => !r.valid).length;
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    return { valid, invalid, totalFiles: results.length, totalErrors };
  }
  
  if (results.items && results.rewards) {
    const itemSummary = getSummary(results.items);
    const rewardSummary = getSummary(results.rewards);
    return {
      valid: itemSummary.valid + rewardSummary.valid,
      invalid: itemSummary.invalid + rewardSummary.invalid,
      totalFiles: itemSummary.totalFiles + rewardSummary.totalFiles,
      totalErrors: itemSummary.totalErrors + rewardSummary.totalErrors + (results.errors?.length || 0)
    };
  }
  
  return { valid: results.valid ? 1 : 0, invalid: results.valid ? 0 : 1, totalFiles: 1, totalErrors: results.errors?.length || 0 };
}

module.exports = {
  validateEntity,
  validateDirectory,
  validateProject,
  getSummary,
  validateFile,
  validateFiles,
  validateValue,
  loadSchema,
  validateReferences,
  buildEntityRegistry,
  detectCircularReferences,
  ValidationError,
  ErrorTypes,
  formatError
};
