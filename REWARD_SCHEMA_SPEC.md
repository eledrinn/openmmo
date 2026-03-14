# REWARD_SCHEMA_SPEC.md

**Document Type:** Reward Schema Specification  
**Task ID:** W1-T005  
**Owner:** schema-drafter  
**Supervisor:** spec-steward  
**Date:** 2025-01-21  
**Status:** CONFIRMED — Wave 1 Reward Schema

---

## 1. Schema Overview

**File:** `Schemas/reward.schema.json`  
**Base:** JSON Schema Draft 2020-12  
**Entity:** OpenMMO Reward  
**Reward Types:** loot, quest, crafting, vendor, achievement (organizational only)

---

## 2. Entity Shape

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID reference | Unique reward identifier (`reward_*` format per T003a) |
| `name` | string | Display name (1-100 chars) |

### Content Requirement

A reward MUST contain at least one of:
- `items` (array of item rewards)
- `currency` (array of currency rewards)
- `experience` (array of experience rewards)

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Reward description (max 500 chars) |
| `items` | array | Item rewards list (max 10 entries) |
| `currency` | array | Currency rewards list (max 5 entries) |
| `experience` | array | Experience rewards list (max 3 entries) |
| `reward_type` | enum | Classification: loot, quest, crafting, vendor, achievement |
| `tags` | string[] | Categorization tags (max 10) |

---

## 3. Reward Content Structures

### Item Rewards

**Structure:**
```json
{
  "item": "item_iron_sword",
  "quantity": 1
}
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `item` | reference | Must reference `item_*` per T003b | Item to award |
| `quantity` | integer | 1-9999, default: 1 | How many of this item |

**Array Limits:**
- Maximum 10 item entries per reward
- Each entry can have different quantity

### Currency Rewards

**Structure:**
```json
{
  "currency_type": "gold",
  "amount": 100
}
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `currency_type` | enum | gold, premium, honor_points, reputation | Currency to award |
| `amount` | integer | 1-999999999 | How much currency |

**Currency Types (Wave 1):**

| Type | Description |
|------|-------------|
| `gold` | Standard in-game currency |
| `premium` | Premium/paid currency |
| `honor_points` | PvP currency |
| `reputation` | Faction reputation |

**Array Limits:**
- Maximum 5 currency entries per reward

### Experience Rewards

**Structure:**
```json
{
  "experience_type": "character",
  "amount": 1000
}
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `experience_type` | enum | character, skill, profession | Type of experience |
| `amount` | integer | 1-999999999 | Experience points |

**Experience Types (Wave 1):**

| Type | Description |
|------|-------------|
| `character` | Character level experience |
| `skill` | Skill-specific experience |
| `profession` | Crafting profession experience |

**Array Limits:**
- Maximum 3 experience entries per reward

---

## 4. Reference Alignment

### T003a Alignment (ID Format)

| Aspect | Compliance |
|--------|------------|
| ID format | `reward_*` prefix per ID_FORMAT.md |
| Pattern validation | `$ref: id.schema.json` |
| Examples | All examples use valid `reward_*` format |

### T003b Alignment (Reference Resolution)

| Aspect | Compliance |
|--------|------------|
| Item references | Use `reference.schema.json` |
| Target validation | Must reference `item_*` per REFERENCE_RESOLUTION.md Section 2 |
| Resolution | T006 validates item existence |

### T004 Alignment (Item Schema)

| Aspect | Compliance |
|--------|------------|
| Item rewards | Reference items defined in item.schema.json |
| Quantity constraints | Respect item.stackable from T004 |
| Item validation | T006 cross-validates item IDs |

---

## 5. Reward Types (Organizational)

The `reward_type` field is for categorization only — no behavioral differences:

| Type | Use Case |
|------|----------|
| `loot` | Enemy drops, chest contents |
| `quest` | Quest completion rewards |
| `crafting` | Crafting output rewards |
| `vendor` | Vendor purchase grants |
| `achievement` | Achievement completion rewards |

**Note:** All reward types have identical structure. Runtime systems may filter by type, but schema does not enforce type-specific behavior.

---

## 6. Canonical Examples

### Valid Example: Currency Only

```json
{
  "id": "reward_gold_chest",
  "name": "Gold Chest",
  "description": "A chest containing gold coins.",
  "currency": [
    { "currency_type": "gold", "amount": 100 }
  ],
  "reward_type": "loot"
}
```

### Valid Example: Item Only

```json
{
  "id": "reward_heal_potion_drop",
  "name": "Healing Potion Drop",
  "description": "Drops a healing potion.",
  "items": [
    { "item": "item_health_potion_small", "quantity": 1 }
  ],
  "reward_type": "loot"
}
```

### Valid Example: Mixed Reward

```json
{
  "id": "reward_level_up_bonus",
  "name": "Level Up Bonus",
  "description": "Experience and currency for leveling up.",
  "items": [
    { "item": "item_enchanted_scroll", "quantity": 1 }
  ],
  "currency": [
    { "currency_type": "gold", "amount": 500 },
    { "currency_type": "premium", "amount": 10 }
  ],
  "experience": [
    { "experience_type": "character", "amount": 1000 }
  ],
  "reward_type": "achievement",
  "tags": ["level_up", "bonus"]
}
```

### Valid Example: Multiple Items

```json
{
  "id": "reward_starter_kit",
  "name": "Starter Kit",
  "description": "Basic equipment for new adventurers.",
  "items": [
    { "item": "item_iron_sword", "quantity": 1 },
    { "item": "item_leather_armor", "quantity": 1 },
    { "item": "item_health_potion_small", "quantity": 5 }
  ],
  "reward_type": "quest"
}
```

### Invalid Examples

| Invalid JSON | Reason |
|--------------|--------|
| No `items`, `currency`, or `experience` | At least one content type required |
| `item: "reward_gold_chest"` | Wrong reference type (must be `item_*`) |
| `currency_type: "gems"` | Not in enum (use defined currency types) |
| `quantity: 0` | Minimum is 1 |
| `items` array with 11 entries | Exceeds maxItems: 10 |

---

## 7. Explicit Exclusions (Deferred)

### Deferred to T006 (Validator)

| Feature | Why Deferred | T006 Responsibility |
|---------|--------------|---------------------|
| Item existence validation | Runtime check | Validator confirms item IDs exist |
| Stackability enforcement | Item property check | Validator confirms quantity respects item.stackable |
| Reference target validation | Cross-entity check | Validator enforces `item` → `item_*` only |

### Deferred to Post-Wave 1

| Feature | Why Deferred | Future Wave |
|---------|--------------|-------------|
| Weighted loot tables | Complexity | Wave 2 |
| Rarity-based drops | Drop system | Wave 2 |
| Conditional rewards | Quest state | Wave 2 |
| Time-limited rewards | Events | Wave 2 |
| Account-bound rewards | Binding system | Wave 2 |

### Explicitly Out of Scope

- ❌ **Runtime resolution** — When/how rewards are granted (runtime concern)
- ❌ **Economy balancing** — Drop rates, value curves (design concern)
- ❌ **Vendor pricing** — Cost calculations (vendor system)
- ❌ **Quest integration** — Quest reward wiring (quest system)
- ❌ **Inventory management** — Adding/removing from inventory (inventory system)
- ❌ **Loot table complexity** — Weighted pools, conditions (Wave 2)
- ❌ **Reward UI** — Presentation layer (client concern)
- ❌ **Reward animation** — Visual effects (client concern)

---

## 8. Sign-offs

### Schema Drafter (Owner)
I confirm this reward schema is complete for Wave 1 scope.

| Field | Value |
|-------|-------|
| Status | ✅ CONFIRMED |
| Date | 2025-01-21 |
| Evidence | This document, Schemas/reward.schema.json |
| Scope Check | No runtime, economy, vendor, quest, inventory, or loot table logic included |

---

### Spec Steward (Contract Alignment)
I confirm canonical naming and contract alignment.

| Field | Value |
|-------|-------|
| Status | ✅ CONFIRMED |
| Naming Review | All fields snake_case per SCHEMA_CONVENTIONS.md |
| T003a Alignment | ID field uses `openmmo://schemas/id.schema.json`; examples use `reward_*` format |
| T003b Alignment | Item references use `openmmo://schemas/reference.schema.json`; targets `item_*` per Section 2 |
| T004 Alignment | Item rewards reference items per item.schema.json |
| Date | 2025-01-21 |
| Evidence | This document |

**Checklist:**
- [x] Field names follow SCHEMA_CONVENTIONS.md (snake_case)
- [x] ID references use `openmmo://schemas/id.schema.json`
- [x] Item references use `openmmo://schemas/reference.schema.json`
- [x] Reward type enum values appropriate (loot, quest, crafting, vendor, achievement)
- [x] Currency types properly enumerated (gold, premium, honor_points, reputation)
- [x] Examples use valid ID formats

---

### Chief Architect (Scope Spillover Check)
I confirm no package/scope spillover.

| Field | Value |
|-------|-------|
| Status | ✅ CONFIRMED |
| Scope Observation | Schema properly bounded to `Schemas/` only. No runtime resolution, economy balancing, vendor integration, quest system, inventory behavior, or complex loot table algorithms included. |
| Date | 2025-01-21 |
| Evidence | This document |

**Checklist:**
- [x] Schema stays in `Schemas/` — no spillover to `Validator/`, `CLI/`
- [x] No runtime reward resolution logic
- [x] No economy balancing formulas
- [x] No vendor integration
- [x] No quest system integration
- [x] No inventory behavior specification
- [x] No complex loot table algorithms

**VERDICT:** No scope spillover detected. Schema appropriately bounded.

---

### QA Validation Lead (Downstream Approval)
I approve acceptance/test shape for T006.

| Field | Value |
|-------|-------|
| Status | ✅ APPROVED |
| Test Strategy Notes | Schema is machine-checkable via JSON Schema validators. 8 properties testable. Conditional requirement (at least one of items/currency/experience) testable. Content array limits (10/5/3) testable. References testable via T003a/T003b patterns. Examples provide test fixtures. |
| T006 Impact | Validator has complete reward schema to validate; cross-validates item references against item.schema.json (T004); validates currency/experience enums; validates content presence |
| Date | 2025-01-21 |
| Evidence | This document, Schemas/reward.schema.json |

**Acceptance Criteria for T006:**
- Validator checks reward.schema.json
- Validates ID format per T003a
- Validates item references per T003b (existence, target type)
- Validates at least one content type present (items/currency/experience)
- Cross-validates item IDs against item schema (T004)

---

## Evidence Links

- `Schemas/reward.schema.json` (canonical schema)
- `REWARD_SCHEMA_SPEC.md` (this document)
- `SCHEMA_CONVENTIONS.md` (T002)
- `ID_FORMAT.md` (T003a)
- `REFERENCE_RESOLUTION.md` (T003b)
- `ITEM_SCHEMA_SPEC.md` (T004)
- `Planning/W1-PLAN-001-decomposition.md` (task definition)

---

*This specification defines a bounded reward schema for Wave 1. Runtime behavior, economy balancing, vendors, quests, inventory, and complex loot systems are explicitly excluded.*
