# Fixture Library

The OpenMMO fixture library provides test data for validating the schemas, validator, and CLI.

## Overview

| Category | Count | Purpose |
|----------|-------|---------|
| Valid items | 11 | Examples of correct item definitions |
| Invalid items | 6 | Demonstrations of validation errors |
| Boundary items | 3 | Edge cases at schema limits |
| Valid rewards | 6 | Examples of correct reward definitions |
| Invalid rewards | 5 | Demonstrations of validation errors |
| **Total** | **31** | Comprehensive test coverage |

## Directory Structure

```
Fixtures/
├── items/
│   ├── valid/        # Valid item fixtures
│   ├── invalid/      # Invalid item fixtures
│   └── boundary_*.json # Boundary case fixtures
├── rewards/
│   ├── valid/        # Valid reward fixtures
│   └── invalid/      # Invalid reward fixtures
└── FIXTURE_MANIFEST.md # Complete fixture registry
```

## Valid Item Fixtures

### Consumables

**01_consumable_potion.json** — Health potion with reward reference
```json
{
  "id": "item_health_potion_small",
  "name": "Small Health Potion",
  "item_type": "consumable",
  "stackable": true,
  "max_stack_size": 20,
  "on_use_reward": "reward_heal_small",
  "destroy_on_use": true
}
```

**02_consumable_mana.json** — Mana potion

### Equipment

**03_equipment_weapon.json** — Iron sword (main_hand)

**04_equipment_armor.json** — Leather armor (chest)

**05_equipment_helmet.json** — Steel helmet (head)

**06_equipment_accessory.json** — Gold ring (ring)

**11_equipment_shield.json** — Wooden shield (off_hand)

### Materials

**07_material_ore.json** — Iron ore (stackable to 99)

**08_material_herb.json** — Healing herb

**09_material_crystal.json** — Magic crystal

### Quest Items

**10_quest_key.json** — Ancient quest key (not sellable)

## Invalid Item Fixtures

| Fixture | Error | Purpose |
|---------|-------|---------|
| `01_missing_required_name.json` | REQUIRED_FIELD_MISSING | Missing `name` field |
| `02_missing_required_type.json` | REQUIRED_FIELD_MISSING | Missing `item_type` field |
| `03_invalid_enum_type.json` | INVALID_ENUM_VALUE | Invalid item_type value |
| `04_equipment_missing_slot.json` | REQUIRED_FIELD_MISSING | Equipment without slot |
| `05_invalid_enum_rarity.json` | INVALID_ENUM_VALUE | Invalid rarity value |
| `06_additional_properties.json` | INVALID_TYPE | Extra field not allowed |

## Boundary Item Fixtures

| Fixture | Boundary Test |
|---------|---------------|
| `boundary_01_max_length.json` | Name at 100 chars, description at 500 chars |
| `boundary_02_max_stack.json` | max_stack_size at 9999 |
| `boundary_03_max_level.json` | level_requirement at 100, damage at 999 |

## Valid Reward Fixtures

### Currency Only

**01_currency_gold.json** — Single gold reward
```json
{
  "id": "reward_gold_small",
  "name": "Small Gold Pouch",
  "currency": [
    { "currency_type": "gold", "amount": 50 }
  ]
}
```

**02_currency_mixed.json** — Gold + premium currency

### Items Only

**03_item_single.json** — Single item reward

**04_item_multiple.json** — Multiple items (starter kit)

### Experience

**05_experience.json** — Character XP reward

### Mixed

**06_mixed_full.json** — Items + currency + experience

## Invalid Reward Fixtures

| Fixture | Error | Purpose |
|---------|-------|---------|
| `01_no_content.json` | INVALID_TYPE | No items/currency/experience |
| `02_invalid_currency_type.json` | INVALID_ENUM_VALUE | Invalid currency_type |
| `03_invalid_experience_type.json` | INVALID_ENUM_VALUE | Invalid experience_type |
| `04_zero_quantity.json` | NUMBER_OUT_OF_RANGE | quantity: 0 (below minimum) |
| `05_additional_properties.json` | INVALID_TYPE | Extra field not allowed |

## Using Fixtures

### Validate All Valid Fixtures

```bash
./CLI/bin/openmmo validate Fixtures/items/valid/*.json
./CLI/bin/openmmo validate Fixtures/rewards/valid/*.json
```

### Test Error Handling

```bash
# Should fail with REQUIRED_FIELD_MISSING
./CLI/bin/openmmo validate Fixtures/items/invalid/01_missing_required_name.json

# Should fail with INVALID_ENUM_VALUE
./CLI/bin/openmmo validate Fixtures/items/invalid/03_invalid_enum_type.json
```

### Use as Templates

Copy a valid fixture as a starting point:

```bash
cp Fixtures/items/valid/03_equipment_weapon.json my_sword.json
vim my_sword.json
./CLI/bin/openmmo validate my_sword.json
```

## Cross-References

Some fixtures reference each other:

- `item_health_potion_small` → `reward_heal_small`
- `reward_starter_kit` → `item_iron_sword`, `item_leather_armor`, etc.

## Testing the Validator

The fixtures are used by the validator test suite:

```bash
cd Validator
npm test
```

Tests validate:
- All valid fixtures pass
- All invalid fixtures fail with expected errors
- Boundary cases pass

## Adding New Fixtures

To add a new fixture:

1. Create the JSON file in appropriate directory
2. Follow naming convention: `NN_description.json`
3. Run validation: `./CLI/bin/openmmo validate your_fixture.json`
4. Update FIXTURE_MANIFEST.md
5. Add to test suite if needed

### Naming Conventions

**Valid fixtures:** `NN_type_description.json`
- `01_consumable_potion.json`
- `03_equipment_weapon.json`

**Invalid fixtures:** `NN_error_description.json`
- `01_missing_required_name.json`
- `03_invalid_enum_type.json`

**Boundary fixtures:** `boundary_NN_description.json`
- `boundary_01_max_length.json`

## Fixture Manifest

For the complete fixture registry with expected outcomes, see:

**[FIXTURE_MANIFEST.md](../Fixtures/FIXTURE_MANIFEST.md)**

## Coverage Summary

| Aspect | Coverage |
|--------|----------|
| Item types | All 4 types (consumable, equipment, material, quest) |
| Equipment slots | 5 slots covered |
| Reward content | Items, currency, experience, mixed |
| Error types | All major validation errors |
| Boundary conditions | Length limits, numeric limits |
| Cross-references | Item→Reward, Reward→Item |
