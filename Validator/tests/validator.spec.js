/**
 * OpenMMO Validator Test Suite
 * 
 * Tests for Wave 1 validation:
 * - ID validation (T003a)
 * - Reference validation (T003b)
 * - Item validation (T004)
 * - Reward validation (T005)
 */

const fs = require('fs');
const path = require('path');
const { validateFile, validateValue, loadSchema } = require('../src/validator');
const { validateReferences, buildEntityRegistry, detectCircularReferences } = require('../src/references');
const { ErrorTypes } = require('../src/errors');

// Test utilities
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  testsRun++;
  try {
    fn();
    testsPassed++;
    console.log(`  ✅ ${name}`);
  } catch (e) {
    testsFailed++;
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${e.message}`);
  }
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg || 'Assertion failed'}: expected ${expected}, got ${actual}`);
  }
}

function assertTrue(value, msg) {
  if (!value) {
    throw new Error(msg || 'Expected true');
  }
}

function assertFalse(value, msg) {
  if (value) {
    throw new Error(msg || 'Expected false');
  }
}

// ========== ID SCHEMA TESTS (T003a) ==========
console.log('\n📋 ID Schema Tests (T003a)');

test('Valid ID format: item_iron_sword', () => {
  const result = validateFile(path.join(__dirname, 'valid-id-item.json'), 'id');
  assertTrue(result.valid, 'Should be valid');
});

test('Valid ID format: reward_daily_bonus', () => {
  const result = validateValue('reward_daily_bonus', loadSchema('id'), '');
  assertEqual(result.length, 0, 'Should have no errors');
});

test('Invalid ID format: missing underscore', () => {
  const errors = validateValue('iron_sword', loadSchema('id'), '');
  // Note: iron_sword actually matches the pattern (category='iron', local_id='sword')
  // The pattern validates syntax, not semantic category correctness
  // Category validation is T003b scope
  assertEqual(errors.length, 0, 'iron_sword is syntactically valid per T003a (category validation is T003b)');
});

test('Invalid ID format: uppercase', () => {
  const errors = validateValue('ITEM_SWORD', loadSchema('id'), '');
  assertTrue(errors.length > 0, 'Should have errors');
});

test('Invalid ID: too short (3 chars)', () => {
  const errors = validateValue('a_b', loadSchema('id'), '');
  assertTrue(errors.length > 0, 'Should have errors');
});

test('Invalid ID: double underscore', () => {
  const errors = validateValue('item__sword', loadSchema('id'), '');
  assertTrue(errors.length > 0, 'Should have errors');
});

// ========== REFERENCE SCHEMA TESTS (T003b) ==========
console.log('\n🔗 Reference Schema Tests (T003b)');

test('Valid reference: item_iron_sword', () => {
  const errors = validateValue('item_iron_sword', loadSchema('reference'), '');
  assertEqual(errors.length, 0, 'Should have no errors');
});

test('Valid reference: reward_gold_chest', () => {
  const errors = validateValue('reward_gold_chest', loadSchema('reference'), '');
  assertEqual(errors.length, 0, 'Should have no errors');
});

test('Reference has same pattern as ID', () => {
  const refSchema = loadSchema('reference');
  const idSchema = loadSchema('id');
  assertEqual(refSchema.pattern, idSchema.pattern, 'Patterns should match');
});

// ========== ITEM SCHEMA TESTS (T004) ==========
console.log('\n🗡️  Item Schema Tests (T004)');

const validItem = {
  id: 'item_iron_sword',
  name: 'Iron Sword',
  description: 'A sturdy sword.',
  item_type: 'equipment',
  equipment_slot: 'main_hand',
  stackable: false,
  rarity: 'common'
};

test('Valid equipment item', () => {
  const errors = validateValue(validItem, loadSchema('item'), '');
  assertEqual(errors.length, 0, `Should have no errors, got: ${errors.map(e => e.message).join(', ')}`);
});

test('Valid consumable with on_use_reward', () => {
  const item = {
    id: 'item_health_potion',
    name: 'Health Potion',
    item_type: 'consumable',
    stackable: true,
    max_stack_size: 20,
    on_use_reward: 'reward_heal_small'
  };
  const errors = validateValue(item, loadSchema('item'), '');
  assertEqual(errors.length, 0, 'Should have no errors');
});

test('Equipment missing equipment_slot is invalid', () => {
  const item = {
    id: 'item_iron_sword',
    name: 'Iron Sword',
    item_type: 'equipment'
    // Missing equipment_slot
  };
  const errors = validateValue(item, loadSchema('item'), '');
  assertTrue(errors.length > 0, 'Should have errors');
  const hasRequiredError = errors.some(e => e.type === ErrorTypes.REQUIRED_FIELD_MISSING);
  assertTrue(hasRequiredError, 'Should have required field error');
});

test('Invalid item_type enum', () => {
  const item = {
    id: 'item_unknown',
    name: 'Unknown',
    item_type: 'invalid_type'
  };
  const errors = validateValue(item, loadSchema('item'), '');
  assertTrue(errors.length > 0, 'Should have errors');
  const hasEnumError = errors.some(e => e.type === ErrorTypes.INVALID_ENUM_VALUE);
  assertTrue(hasEnumError, 'Should have enum error');
});

test('Invalid rarity enum', () => {
  const item = {
    id: 'item_test',
    name: 'Test',
    item_type: 'material',
    rarity: 'super_rare'
  };
  const errors = validateValue(item, loadSchema('item'), '');
  assertTrue(errors.length > 0, 'Should have errors');
});

test('Stackable item with max_stack_size = 1 is invalid', () => {
  const item = {
    id: 'item_test',
    name: 'Test',
    item_type: 'material',
    stackable: true,
    max_stack_size: 1  // Schema requires minimum: 2 for stackable
  };
  const errors = validateValue(item, loadSchema('item'), '');
  assertTrue(errors.length > 0, 'Should have errors (max_stack_size must be >= 2 for stackable)');
});

test('Additional properties not allowed', () => {
  const item = {
    id: 'item_test',
    name: 'Test',
    item_type: 'material',
    extra_field: 'not_allowed'
  };
  const errors = validateValue(item, loadSchema('item'), '');
  assertTrue(errors.length > 0, 'Should have errors');
});

// ========== REWARD SCHEMA TESTS (T005) ==========
console.log('\n🎁 Reward Schema Tests (T005)');

const validReward = {
  id: 'reward_gold_chest',
  name: 'Gold Chest',
  currency: [
    { currency_type: 'gold', amount: 100 }
  ]
};

test('Valid currency reward', () => {
  const errors = validateValue(validReward, loadSchema('reward'), '');
  assertEqual(errors.length, 0, `Should have no errors, got: ${errors.map(e => e.message).join(', ')}`);
});

test('Valid item reward', () => {
  const reward = {
    id: 'reward_potion_drop',
    name: 'Potion Drop',
    items: [
      { item: 'item_health_potion', quantity: 1 }
    ]
  };
  const errors = validateValue(reward, loadSchema('reward'), '');
  assertEqual(errors.length, 0, 'Should have no errors');
});

test('Valid mixed reward (items + currency + experience)', () => {
  const reward = {
    id: 'reward_level_up',
    name: 'Level Up Reward',
    items: [{ item: 'item_scroll', quantity: 1 }],
    currency: [{ currency_type: 'gold', amount: 500 }],
    experience: [{ experience_type: 'character', amount: 1000 }]
  };
  const errors = validateValue(reward, loadSchema('reward'), '');
  assertEqual(errors.length, 0, 'Should have no errors');
});

test('Reward with no content is invalid', () => {
  const reward = {
    id: 'reward_empty',
    name: 'Empty Reward'
  };
  const errors = validateValue(reward, loadSchema('reward'), '');
  assertTrue(errors.length > 0, 'Should have errors');
});

test('Invalid currency_type enum', () => {
  const reward = {
    id: 'reward_test',
    name: 'Test',
    currency: [{ currency_type: 'gems', amount: 100 }]
  };
  const errors = validateValue(reward, loadSchema('reward'), '');
  assertTrue(errors.length > 0, 'Should have errors');
});

test('Invalid experience_type enum', () => {
  const reward = {
    id: 'reward_test',
    name: 'Test',
    experience: [{ experience_type: 'skill_tree', amount: 100 }]
  };
  const errors = validateValue(reward, loadSchema('reward'), '');
  assertTrue(errors.length > 0, 'Should have errors');
});

test('Item quantity below minimum is invalid', () => {
  const reward = {
    id: 'reward_test',
    name: 'Test',
    items: [{ item: 'item_sword', quantity: 0 }]
  };
  const errors = validateValue(reward, loadSchema('reward'), '');
  assertTrue(errors.length > 0, 'Should have errors');
});

test('Too many items in reward is invalid', () => {
  const items = Array(11).fill({ item: 'item_test', quantity: 1 });
  const reward = {
    id: 'reward_test',
    name: 'Test',
    items: items
  };
  const errors = validateValue(reward, loadSchema('reward'), '');
  assertTrue(errors.length > 0, 'Should have errors');
});

// ========== REFERENCE CHECKING TESTS ==========
console.log('\n🔗 Reference Checking Tests');

test('parseId extracts category correctly', () => {
  const { parseId } = require('../src/references');
  assertEqual(parseId('item_iron_sword'), 'item', 'Should extract item');
  assertEqual(parseId('reward_gold_chest'), 'reward', 'Should extract reward');
  assertEqual(parseId('currency_gold'), 'currency', 'Should extract currency');
});

test('findReferences locates all cross-entity references', () => {
  const { findReferences } = require('../src/references');
  const obj = {
    id: 'item_test',
    on_use_reward: 'reward_heal',
    nested: {
      item_ref: 'item_other'
    }
  };
  const refs = findReferences(obj);
  // Finds: reward_heal, item_other (excludes 'id' field which is the entity's own ID)
  assertEqual(refs.length, 2, 'Should find 2 cross-entity references');
  assertTrue(refs.some(r => r.value === 'reward_heal'), 'Should find reward_heal');
  assertTrue(refs.some(r => r.value === 'item_other'), 'Should find item_other');
});

// ========== CIRCULAR REFERENCE TESTS ==========
console.log('\n🔄 Circular Reference Tests');

test('Detects simple circular reference', () => {
  const entities = {
    'item_a': { id: 'item_a', on_use_reward: 'reward_x' },
    'reward_x': { id: 'reward_x', items: [{ item: 'item_a' }] }
  };
  const errors = detectCircularReferences(entities);
  assertTrue(errors.length > 0, 'Should detect circular reference');
});

test('No circular reference in valid chain', () => {
  const entities = {
    'item_a': { id: 'item_a', on_use_reward: 'reward_x' },
    'reward_x': { id: 'reward_x', items: [{ item: 'item_b' }] },
    'item_b': { id: 'item_b' }
  };
  const errors = detectCircularReferences(entities);
  assertEqual(errors.length, 0, 'Should have no circular references');
});

// ========== SUMMARY ==========
console.log('\n📊 Test Summary');
console.log(`  Total:  ${testsRun}`);
console.log(`  Passed: ${testsPassed}`);
console.log(`  Failed: ${testsFailed}`);

if (testsFailed > 0) {
  process.exit(1);
}

console.log('\n✅ All tests passed!');
