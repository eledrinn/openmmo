# ITEM_SCHEMA_SPEC.md

**Document Type:** Item Schema Specification  
**Task ID:** W1-T004  
**Owner:** schema-drafter  
**Supervisor:** spec-steward  
**Date:** 2025-01-21  
**Status:** CONFIRMED — Wave 1 Item Schema

---

## 1. Schema Overview

**File:** `Schemas/item.schema.json`  
**Base:** JSON Schema Draft 2020-12  
**Entity:** OpenMMO Item  
**Item Types:** consumable, equipment, material, quest

---

## 2. Entity Shape

### Required Fields (All Items)

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID reference | Unique item identifier (`item_*` format per T003a) |
| `name` | string | Display name (1-100 chars) |
| `item_type` | enum | Category: consumable, equipment, material, quest |

### Optional Fields (All Items)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `description` | string | — | Item description (max 500 chars) |
| `icon` | string | — | Icon identifier for UI |
| `stackable` | boolean | false | Can stack in inventory |
| `max_stack_size` | integer | 1 | Max per stack (1-9999) |
| `rarity` | enum | "common" | Tier: common, uncommon, rare, epic, legendary |
| `level_requirement` | integer | — | Min level to use (1-100) |
| `quest_binding` | boolean | false | Bound to quest (quest items) |
| `destroy_on_use` | boolean | false | Consumed on use |
| `sellable` | boolean | true | Can sell to vendors |
| `tags` | string[] | [] | Categorization tags (max 10) |

### Equipment-Specific Fields

| Field | Type | Required For | Description |
|-------|------|--------------|-------------|
| `equipment_slot` | enum | equipment | Slot: head, chest, legs, feet, hands, main_hand, off_hand, neck, ring, trinket |
| `stats` | object | — | Stat modifiers (see below) |

### Consumable-Specific Fields

| Field | Type | Description |
|-------|------|-------------|
| `on_use_reward` | reference | References reward granted on use (per T003b) |

---

## 3. Field Types and Constraints

### ID Field
- **Schema:** `$ref: openmmo://schemas/id.schema.json` (T003a)
- **Format:** `item_{local_id}` per ID_FORMAT.md
- **Example:** `item_iron_sword`, `item_health_potion_small`

### References
- **on_use_reward:** `$ref: openmmo://schemas/reference.schema.json` (T003b)
- **Target:** Must reference a `reward_*` entity per REFERENCE_RESOLUTION.md Section 2

### Stats Object
```json
{
  "strength": integer,
  "dexterity": integer,
  "intelligence": integer,
  "vitality": integer,
  "armor": integer (min: 0),
  "damage": integer (min: 0)
}
```
- Additional stat properties allowed via `additionalProperties: { "type": "integer" }`

### Conditional Validation

**Equipment Slot Required:**
- If `item_type` = "equipment", then `equipment_slot` is required

**Stack Size Minimum:**
- If `stackable` = true, then `max_stack_size` minimum is 2

---

## 4. Item Type Variations

### Consumable
- Can be stacked (typically)
- Has `on_use_reward` reference
- Usually `destroy_on_use: true`
- Examples: potions, scrolls, food

### Equipment
- Must specify `equipment_slot`
- Typically not stackable (`stackable: false`)
- Has `stats` for modifiers
- Has `level_requirement`
- Examples: weapons, armor, accessories

### Material
- Usually stackable
- No special behavior fields
- Used for crafting (Wave 2+)
- Examples: ore, herbs, cloth

### Quest
- Usually `quest_binding: true`
- Often not sellable (`sellable: false`)
- May be non-stackable
- Examples: quest keys, objectives

---

## 5. Canonical Examples

### Valid Example: Consumable

```json
{
  "id": "item_health_potion_small",
  "name": "Small Health Potion",
  "description": "Restores a small amount of health when consumed.",
  "item_type": "consumable",
  "icon": "potion_red_small",
  "stackable": true,
  "max_stack_size": 20,
  "rarity": "common",
  "on_use_reward": "reward_heal_small",
  "destroy_on_use": true
}
```

### Valid Example: Equipment

```json
{
  "id": "item_iron_sword",
  "name": "Iron Sword",
  "description": "A sturdy sword forged from iron.",
  "item_type": "equipment",
  "icon": "sword_iron",
  "stackable": false,
  "rarity": "common",
  "equipment_slot": "main_hand",
  "level_requirement": 5,
  "stats": {
    "damage": 12,
    "strength": 2
  },
  "sellable": true
}
```

### Valid Example: Material

```json
{
  "id": "item_iron_ore",
  "name": "Iron Ore",
  "description": "Raw iron ore ready for smelting.",
  "item_type": "material",
  "stackable": true,
  "max_stack_size": 99,
  "rarity": "common",
  "sellable": true,
  "tags": ["metal", "crafting"]
}
```

### Valid Example: Quest Item

```json
{
  "id": "item_ancient_key",
  "name": "Ancient Key",
  "description": "A mysterious key found in the ruins.",
  "item_type": "quest",
  "quest_binding": true,
  "sellable": false,
  "stackable": false
}
```

### Invalid Examples

| Invalid JSON | Reason |
|--------------|--------|
| Missing `item_type` | Required field |
| `item_type: "weapon"` | Not in enum (use "equipment") |
| Equipment without `equipment_slot` | Conditional requirement |
| `id: "sword_001"` | Wrong format (must be `item_*`) |
| `on_use_reward: "item_potion"` | Wrong target (must be `reward_*`) |

---

## 6. Extension Points

Per SCHEMA_CONVENTIONS.md, extensions use explicit schema updates:

### Future Extensions (Post-Wave 1)

| Feature | Extension Strategy | Future Wave |
|---------|-------------------|-------------|
| Crafting recipes | Add `crafting_uses` array | Wave 2 |
| Enchantments | Add `enchantments` object | Wave 2 |
| Durability | Add `durability` + `max_durability` | Wave 2 |
| Bind on equip | Add `bind_on_equip` boolean | Wave 2 |
| Set bonuses | Add `item_set` reference | Wave 2 |

### Extension Pattern
```json
{
  "_ext": {
    "experimental_feature": "value"
  }
}
```

> Note: `additionalProperties: false` prevents accidental extensions. Future additions require schema version updates.

---

## 7. Reference Alignment

### T003a Alignment (ID Format)

| Aspect | Compliance |
|--------|------------|
| ID format | `item_*` prefix per ID_FORMAT.md |
| Pattern validation | `$ref: id.schema.json` |
| Examples | All examples use valid `item_*` format |

### T003b Alignment (Reference Resolution)

| Aspect | Compliance |
|--------|------------|
| `on_use_reward` | Uses `reference.schema.json` |
| Target rules | References `reward_*` per REFERENCE_RESOLUTION.md Section 2 |
| Resolution | T006 validates existence per T003b expectations |

---

## 8. Sign-offs

### Schema Drafter (Owner)
I confirm this item schema is complete for Wave 1 scope.

| Field | Value |
|-------|-------|
| Status | ✅ CONFIRMED |
| Date | 2025-01-21 |
| Evidence | This document, Schemas/item.schema.json |
| Scope Check | No runtime behavior, inventory, or economy logic included |

---

### Spec Steward (Contract Alignment)
I confirm canonical naming and contract alignment.

| Field | Value |
|-------|-------|
| Status | ✅ CONFIRMED |
| Naming Review | All fields snake_case per SCHEMA_CONVENTIONS.md |
| T003a Alignment | ID field uses `openmmo://schemas/id.schema.json`; examples use `item_*` format |
| T003b Alignment | `on_use_reward` uses `openmmo://schemas/reference.schema.json`; targets `reward_*` per Section 2 |
| Date | 2025-01-21 |
| Evidence | This document |

**Checklist:**
- [x] Field names follow SCHEMA_CONVENTIONS.md (snake_case)
- [x] ID references use `openmmo://schemas/id.schema.json`
- [x] Reference fields use `openmmo://schemas/reference.schema.json`
- [x] Item types use appropriate enum values (consumable, equipment, material, quest)
- [x] Equipment slots properly enumerated (10 slots)
- [x] Examples use valid ID formats

---

### Chief Architect (Scope Spillover Check)
I confirm no package/scope spillover.

| Field | Value |
|-------|-------|
| Status | ✅ CONFIRMED |
| Scope Observation | Schema properly bounded to `Schemas/` only. No runtime behavior, inventory, vendor, quest integration, balancing, or combat mechanics included. |
| Date | 2025-01-21 |
| Evidence | This document |

**Checklist:**
- [x] Schema stays in `Schemas/` — no spillover to `Validator/`, `CLI/`
- [x] No runtime behavior specifications
- [x] No inventory system design
- [x] No vendor/shop integration
- [x] No quest system integration (quest items defined but no quest logic)
- [x] No balancing/economy logic
- [x] No combat mechanics

**VERDICT:** No scope spillover detected. Schema appropriately bounded.

---

### QA Validation Lead (Downstream Approval)
I approve acceptance/test shape for T005, T006.

| Field | Value |
|-------|-------|
| Status | ✅ APPROVED |
| Test Strategy Notes | Schema is machine-checkable via JSON Schema validators. 16 properties testable. Conditional validation (equipment_slot required for equipment) testable. References testable via T003a/T003b patterns. 4 item type variations provide test matrix. |
| T005 Impact | Rewards can reference items with confidence; item reference patterns established |
| T006 Impact | Validator has complete item schema to validate against; all constraints defined |
| Date | 2025-01-21 |
| Evidence | This document, Schemas/item.schema.json |

**Acceptance Criteria for Downstream Tasks:**
- T005: Rewards reference items per this schema; reward schema can reference items via `item_*` IDs; item references validated per T003b target rules
- T006: Validator checks item.schema.json; validates ID format per T003a; validates references per T003b; validates conditional requirements (equipment_slot for equipment type)

---

## Evidence Links

- `Schemas/item.schema.json` (canonical schema)
- `ITEM_SCHEMA_SPEC.md` (this document)
- `SCHEMA_CONVENTIONS.md` (T002)
- `ID_FORMAT.md` (T003a)
- `REFERENCE_RESOLUTION.md` (T003b)
- `Planning/W1-PLAN-001-decomposition.md` (task definition)

---

*This specification defines a bounded item schema for Wave 1. Runtime behavior, inventory systems, vendors, quests, and balancing are explicitly excluded.*
