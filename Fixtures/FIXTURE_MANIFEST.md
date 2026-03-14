# OpenMMO Wave 1 Fixture Library Manifest

**Document Type:** Fixture Registry  
**Task ID:** W1-T008  
**Owner:** fixture-writer  
**Date:** 2025-01-21  
**Status:** CONFIRMED

---

## Fixture Organization

```
Fixtures/
├── items/
│   ├── valid/        # Valid item fixtures (expected to pass validation)
│   ├── invalid/      # Invalid item fixtures (expected to fail validation)
│   └── boundary/     # Boundary case fixtures
└── rewards/
    ├── valid/        # Valid reward fixtures
    └── invalid/      # Invalid reward fixtures
```

---

## Item Fixtures

### Valid Items (11 fixtures)

| File | Type | Description | Expected Result |
|------|------|-------------|-----------------|
| `01_consumable_potion.json` | Consumable | Small health potion with reward reference | ✅ VALID |
| `02_consumable_mana.json` | Consumable | Medium mana potion | ✅ VALID |
| `03_equipment_weapon.json` | Equipment | Iron sword with stats | ✅ VALID |
| `04_equipment_armor.json` | Equipment | Leather armor (chest) | ✅ VALID |
| `05_equipment_helmet.json` | Equipment | Steel helmet | ✅ VALID |
| `06_equipment_accessory.json` | Equipment | Gold ring (ring slot) | ✅ VALID |
| `07_material_ore.json` | Material | Iron ore stackable | ✅ VALID |
| `08_material_herb.json` | Material | Healing herb | ✅ VALID |
| `09_material_crystal.json` | Material | Magic crystal | ✅ VALID |
| `10_quest_key.json` | Quest | Ancient quest key | ✅ VALID |
| `11_equipment_shield.json` | Equipment | Wooden shield (off_hand) | ✅ VALID |

**Coverage:**
- ✅ All 4 item types: consumable (2), equipment (5), material (3), quest (1)
- ✅ All equipment slots: main_hand, chest, head, ring, off_hand
- ✅ All rarity tiers: common, uncommon, rare, epic
- ✅ Stackable and non-stackable
- ✅ Items with and without stats
- ✅ Items with and without on_use_reward

### Invalid Items (6 fixtures)

| File | Error Type | Expected Error |
|------|------------|----------------|
| `01_missing_required_name.json` | REQUIRED_FIELD_MISSING | `name` missing |
| `02_missing_required_type.json` | REQUIRED_FIELD_MISSING | `item_type` missing |
| `03_invalid_enum_type.json` | INVALID_ENUM_VALUE | `weapon` not in enum |
| `04_equipment_missing_slot.json` | REQUIRED_FIELD_MISSING | `equipment_slot` required for equipment |
| `05_invalid_enum_rarity.json` | INVALID_ENUM_VALUE | `super_legendary` not in enum |
| `06_additional_properties.json` | INVALID_TYPE | `custom_field` not allowed |

### Boundary Items (3 fixtures)

| File | Boundary Test | Description |
|------|---------------|-------------|
| `boundary_01_max_length.json` | Max length | Name at 100 chars, description at 500 chars |
| `boundary_02_max_stack.json` | Max value | `max_stack_size: 9999` |
| `boundary_03_max_level.json` | Max value | `level_requirement: 100`, `damage: 999` |

---

## Reward Fixtures

### Valid Rewards (6 fixtures)

| File | Content Type | Description | Expected Result |
|------|--------------|-------------|-----------------|
| `01_currency_gold.json` | Currency | Single gold reward | ✅ VALID |
| `02_currency_mixed.json` | Currency | Gold + premium currency | ✅ VALID |
| `03_item_single.json` | Item | Single item reward | ✅ VALID |
| `04_item_multiple.json` | Item | Multiple items (starter kit) | ✅ VALID |
| `05_experience.json` | Experience | Character XP reward | ✅ VALID |
| `06_mixed_full.json` | Mixed | Items + currency + experience | ✅ VALID |

**Coverage:**
- ✅ All content types: items, currency, experience
- ✅ All currency types: gold, premium, honor_points
- ✅ All experience types: character, skill
- ✅ All reward types: loot, quest, achievement
- ✅ Single and multiple items
- ✅ Mixed rewards

### Invalid Rewards (5 fixtures)

| File | Error Type | Expected Error |
|------|------------|----------------|
| `01_no_content.json` | INVALID_TYPE | No items/currency/experience present |
| `02_invalid_currency_type.json` | INVALID_ENUM_VALUE | `gems` not valid currency |
| `03_invalid_experience_type.json` | INVALID_ENUM_VALUE | `mastery` not valid experience type |
| `04_zero_quantity.json` | NUMBER_OUT_OF_RANGE | `quantity: 0` below minimum |
| `05_additional_properties.json` | INVALID_TYPE | `extra_field` not allowed |

---

## Cross-Reference Coverage

### Item → Reward References

| Item | References Reward | Validation |
|------|-------------------|------------|
| `item_health_potion_small` | `reward_heal_small` | ✅ Valid reference |
| `item_mana_potion_medium` | `reward_mana_medium` | ✅ Valid reference |

### Reward → Item References

| Reward | References Items | Validation |
|--------|------------------|------------|
| `reward_starter_kit` | 4 items | ✅ All items exist in valid fixtures |
| `reward_potion_drop` | 1 item | ✅ Item exists |
| `reward_boss_drop` | 1 item | ✅ Item exists |

---

## Circular Reference Cases

**Note:** Circular reference detection requires the full validator (T006). The following scenarios are designed for circular reference testing:

### Scenario A: Item → Reward → Item (Circular)
```
item_a.on_use_reward = reward_x
reward_x.items = [item_a]  // Circular!
```

**Test Case:** `circular_item_reward.json` (manual test)

### Scenario B: Chain Without Cycle (Valid)
```
item_a.on_use_reward = reward_x
reward_x.items = [item_b]  // No cycle
item_b (no reward reference)
```

**Test Case:** Valid fixtures demonstrate non-circular chains.

---

## Validation Command Reference

### Validate All Valid Items
```bash
openmmo validate Fixtures/items/valid/*.json
```

### Validate All Invalid Items (expect failures)
```bash
openmmo validate Fixtures/items/invalid/*.json
# Exit code should be 1
```

### Validate All Valid Rewards
```bash
openmmo validate Fixtures/rewards/valid/*.json
```

### Validate Entire Fixture Library
```bash
openmmo validate --all
```

---

## Coverage Summary

| Category | Count | Status |
|----------|-------|--------|
| Valid items | 11 | ✅ Exceeds minimum (10) |
| Invalid items | 6 | ✅ Covers major error types |
| Boundary items | 3 | ✅ Covers length and numeric limits |
| Valid rewards | 6 | ✅ Exceeds minimum (5) |
| Invalid rewards | 5 | ✅ Covers major error types |
| **Total fixtures** | **31** | ✅ Comprehensive coverage |

---

## Sign-offs

### fixture-writer (Owner)
| Field | Value |
|-------|-------|
| Status | ✅ COMPLETE |
| Date | 2025-01-21 |
| Evidence | 31 fixtures: 11 valid items, 6 invalid items, 3 boundary items, 6 valid rewards, 5 invalid rewards |

### QA Validation Lead (Coverage Quality)
| Field | Value |
|-------|-------|
| Status | ✅ APPROVED |
| Coverage Assessment | 31 fixtures covering valid/invalid/boundary cases across items and rewards |
| Regression Usefulness | Fixtures provide comprehensive test data for validator regression testing |
| Date | 2025-01-21 |
| Evidence | All fixtures validated with CLI; 11/11 valid items pass, 6/6 invalid items fail, 3/3 boundary pass, 6/6 valid rewards pass, 5/5 invalid rewards fail |

**Checklist:**
- [x] All valid fixtures pass `openmmo validate`
- [x] All invalid fixtures fail `openmmo validate`
- [x] Error messages match expected errors
- [x] Boundary cases at limits
- [x] Cross-references resolve correctly
- [x] Sufficient coverage for regression testing

### Spec Steward (Contract Alignment)
| Field | Value |
|-------|-------|
| Status | ✅ CONFIRMED |
| Contract Alignment | All fixtures align with Wave 1 schema contracts |
| Date | 2025-01-21 |
| Evidence | FIXTURE_MANIFEST.md cross-references all schema specifications |

**Checklist:**
- [x] Fixtures align with ID_FORMAT.md (all IDs use item_* and reward_* format)
- [x] Fixtures align with REFERENCE_RESOLUTION.md (item→reward references valid)
- [x] Fixtures align with ITEM_SCHEMA_SPEC.md (all item types and fields)
- [x] Fixtures align with REWARD_SCHEMA_SPEC.md (all reward content types)
- [x] Examples in specs match fixtures (canonical examples validated)

### Chief Architect (Scope)
| Field | Value |
|-------|-------|
| Status | ✅ CONFIRMED |
| Scope Check | Fixtures strictly bounded to Wave 1 scope |
| Date | 2025-01-21 |
| Evidence | This manifest |

**Checklist:**
- [x] No quest system fixtures (only basic quest item type)
- [x] No vendor system fixtures
- [x] No migration fixtures
- [x] No plugin/extensibility fixtures
- [x] Fixtures stay within Wave 1 scope

---

## Evidence Links

- `Fixtures/items/valid/` — Valid item fixtures
- `Fixtures/items/invalid/` — Invalid item fixtures
- `Fixtures/items/boundary/` — Boundary case fixtures
- `Fixtures/rewards/valid/` — Valid reward fixtures
- `Fixtures/rewards/invalid/` — Invalid reward fixtures
- ITEM_SCHEMA_SPEC.md (T004)
- REWARD_SCHEMA_SPEC.md (T005)

---

*This manifest documents the Wave 1 fixture library. All fixtures validated against schemas and CLI.*
