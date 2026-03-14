# Getting Started with OpenMMO Wave 1

This guide helps you get started with OpenMMO Wave 1, which includes item and reward schemas, a validator, and a CLI tool.

## Prerequisites

- Node.js 18+ (for running tests)
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd openmmo
```

2. Verify installation:
```bash
./CLI/bin/openmmo validate --help
```

You should see the help text for the validate command.

## Your First Validation

Let's validate an item:

```bash
./CLI/bin/openmmo validate Fixtures/items/valid/01_consumable_potion.json
```

Expected output:
```
✓ Fixtures/items/valid/01_consumable_potion.json
✓ Validation passed
```

Now try an invalid item:

```bash
./CLI/bin/openmmo validate Fixtures/items/invalid/04_equipment_missing_slot.json
```

Expected output:
```
✗ Fixtures/items/invalid/04_equipment_missing_slot.json
  [REQUIRED_FIELD_MISSING] at equipment_slot Required field missing: equipment_slot
✗ Validation failed: 1 error(s)
```

## Creating Your First Item

Create a file `my_item.json`:

```json
{
  "id": "item_my_sword",
  "name": "My Custom Sword",
  "description": "A sword I created",
  "item_type": "equipment",
  "equipment_slot": "main_hand",
  "stackable": false,
  "rarity": "common",
  "stats": {
    "damage": 10
  }
}
```

Validate it:

```bash
./CLI/bin/openmmo validate my_item.json
```

## Creating Your First Reward

Create a file `my_reward.json`:

```json
{
  "id": "reward_my_loot",
  "name": "My Reward",
  "items": [
    { "item": "item_my_sword", "quantity": 1 }
  ],
  "currency": [
    { "currency_type": "gold", "amount": 100 }
  ]
}
```

Validate it:

```bash
./CLI/bin/openmmo validate my_reward.json
```

## Understanding Validation Errors

Common errors and fixes:

| Error | Cause | Fix |
|-------|-------|-----|
| `REQUIRED_FIELD_MISSING` | Missing required field | Add the missing field |
| `INVALID_ENUM_VALUE` | Value not in allowed list | Use a valid enum value |
| `STRING_TOO_LONG` | String exceeds max length | Shorten the string |
| `INVALID_PATTERN` | ID doesn't match pattern | Use format: `category_localid` |

## Next Steps

- Read the [Schema Reference](schemas.md) for full field documentation
- Learn about [Validation](validator.md) options
- Explore the [CLI](cli.md) commands
- Check out the [Fixtures](fixtures.md) for examples

## Getting Help

```bash
# Show CLI help
./CLI/bin/openmmo validate --help

# Validate with verbose output
./CLI/bin/openmmo validate -v my_item.json

# Output as JSON for scripting
./CLI/bin/openmmo validate --json my_item.json
```
