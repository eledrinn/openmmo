# Validator Documentation

The OpenMMO Validator validates entities against Wave 1 schemas.

## Overview

The validator is a JavaScript library that validates:
- ID format
- Reference format
- Item schema
- Reward schema
- Cross-references
- Circular references

## Using the Validator

### Programmatic API

```javascript
const { validateFile, validateProject, getSummary } = require('./Validator');

// Validate a single file
const result = validateFile('path/to/item.json', 'item');
console.log(result.valid); // true or false
console.log(result.errors);  // Array of errors if any

// Validate entire project
const project = validateProject('/path/to/openmmo');
console.log(project.valid); // Overall validity

// Get summary
const summary = getSummary(project);
console.log(summary.valid);      // Number of valid files
console.log(summary.invalid);    // Number of invalid files
console.log(summary.totalErrors); // Total error count
```

### Error Types

| Error Type | Description |
|------------|-------------|
| `REQUIRED_FIELD_MISSING` | Required field not present |
| `INVALID_TYPE` | Value has wrong type |
| `INVALID_ENUM_VALUE` | Value not in allowed enum |
| `STRING_TOO_SHORT` | String below minimum length |
| `STRING_TOO_LONG` | String exceeds maximum length |
| `NUMBER_OUT_OF_RANGE` | Number outside allowed range |
| `INVALID_PATTERN` | String doesn't match regex pattern |
| `ARRAY_TOO_LONG` | Array exceeds maximum items |
| `INVALID_REFERENCE_TARGET` | Reference points to wrong type |
| `REFERENCE_NOT_FOUND` | Referenced entity doesn't exist |
| `CIRCULAR_REFERENCE` | Circular reference detected |

### Error Object Structure

```javascript
{
  type: 'REQUIRED_FIELD_MISSING',
  message: 'Required field missing: equipment_slot',
  path: 'equipment_slot',
  value: undefined
}
```

## Validation Rules

### ID Validation

- Must match pattern: `^[a-z][a-z0-9]{1,15}_[a-z][a-z0-9_]{0,46}$`
- Length: 4-64 characters
- Lowercase only

### Item Validation

- Required fields: `id`, `name`, `item_type`
- Equipment must have `equipment_slot`
- `item_type` must be: consumable, equipment, material, quest
- `rarity` must be: common, uncommon, rare, epic, legendary
- References must use valid ID format

### Reward Validation

- Required fields: `id`, `name`
- Must have at least one of: `items`, `currency`, `experience`
- `currency_type` must be: gold, premium, honor_points, reputation
- `experience_type` must be: character, skill, profession
- Item references must point to valid items

### Reference Validation

- Items can reference rewards (via `on_use_reward`)
- Rewards can reference items (via `items`)
- All references checked for existence

### Circular Reference Detection

The validator detects circular references:

```javascript
// Circular (invalid):
item_a.on_use_reward = reward_x
reward_x.items = [item_a] // Back to item_a!

// Not circular (valid):
item_a.on_use_reward = reward_x
reward_x.items = [item_b] // Different item
item_b (no reward reference)
```

## Conditional Validation

### Equipment Slot Required

If `item_type` is "equipment", `equipment_slot` is required.

### Stack Size Minimum

If `stackable` is true and `max_stack_size` is provided, minimum is 2.

## Running Tests

```bash
cd Validator
npm test
```

Expected output:
```
📋 ID Schema Tests (T003a)
  ✅ Valid ID format: item_iron_sword
  ...

📊 Test Summary
  Total:  28
  Passed: 28
  Failed: 0

✅ All tests passed!
```

## Advanced Usage

### Custom Validation

```javascript
const { validateValue, loadSchema } = require('./Validator');

const item = { /* ... */ };
const schema = loadSchema('item');
const errors = validateValue(item, schema, '');

if (errors.length > 0) {
  errors.forEach(err => console.log(err.message));
}
```

### Building Entity Registry

```javascript
const { buildEntityRegistry } = require('./Validator');

const registry = buildEntityRegistry();
console.log(registry.item); // Set of item IDs
console.log(registry.reward); // Set of reward IDs
```

### Detecting Circular References

```javascript
const { detectCircularReferences } = require('./Validator');

const entities = {
  'item_a': { id: 'item_a', on_use_reward: 'reward_x' },
  'reward_x': { id: 'reward_x', items: [{ item: 'item_a' }] }
};

const errors = detectCircularReferences(entities);
// errors[0].message: "Circular reference detected: item_a -> reward_x -> item_a"
```

## Error Messages

The validator provides clear, actionable error messages:

```
✗ my_item.json
  [REQUIRED_FIELD_MISSING] at equipment_slot Required field missing: equipment_slot
✗ Validation failed: 1 error(s)
```

Each error includes:
- **Type:** The error category
- **Path:** Where in the document the error occurred
- **Message:** Human-readable explanation
- **Value:** The problematic value (if applicable)
