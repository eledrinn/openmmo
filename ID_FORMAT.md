# ID_FORMAT.md

**Document Type:** ID Contract Specification  
**Task ID:** W1-T003a  
**Owner:** spec-steward  
**Date:** 2025-01-21  
**Status:** CONFIRMED — Bounded ID contract for Wave 1

---

## 1. ID Format Definition

### Syntax

**Pattern:** `{category}_{local_id}`

| Component | Pattern | Length | Example |
|-----------|---------|--------|---------|
| `category` | `[a-z][a-z0-9]*` | 2-16 chars | `item`, `reward`, `currency` |
| `separator` | `_` (single underscore) | 1 char | `_` |
| `local_id` | `[a-z][a-z0-9_]*` | 1-47 chars | `iron_sword_001`, `gold_chest` |

### Full ID Pattern (Regex)
```
^[a-z][a-z0-9]{1,15}_[a-z][a-z0-9_]{0,46}$
```

### Total Length Constraints
- **Minimum:** 4 characters (`a_b`)
- **Maximum:** 64 characters total

---

## 2. Naming Rules

### Category Prefixes

| Category | Purpose | Example IDs |
|----------|---------|-------------|
| `item` | Game items | `item_iron_sword`, `item_health_potion` |
| `reward` | Reward definitions | `reward_gold_chest`, `reward_daily_bonus` |
| `currency` | Currency types | `currency_gold`, `currency_premium` |

### Local ID Conventions

1. **Use snake_case** — lowercase with underscores
2. **Start with letter** — no leading digits
3. **Be descriptive** — `iron_sword` not `iswd`
4. **Use suffixes for variants** — `iron_sword_001`, `iron_sword_002`
5. **No double underscores** — `iron_sword` not `iron__sword`
6. **No trailing underscores** — `iron_sword` not `iron_sword_`

### Reserved Patterns

| Pattern | Reserved For | Status |
|---------|--------------|--------|
| `sys_*` | System internals | Reserved, not for content |
| `temp_*` | Temporary/Testing | Reserved, not for production |
| `_*` | Private/Internal | Reserved, IDs cannot start with `_` |
| `*__*` | Double underscore | Invalid format |
| `*_` | Trailing underscore | Invalid format |

---

## 3. Uniqueness Constraints

### Scope Rules

| Scope | Uniqueness Requirement |
|-------|----------------------|
| **Global** | Full ID (`{category}_{local_id}`) must be unique across entire OpenMMO namespace |
| **Category** | Local IDs need not be unique across categories (`item_gold` ≠ `currency_gold`) |
| **Case** | IDs are case-sensitive; lowercase is canonical |

### Collision Rules

1. **No duplicates allowed** — Two entities cannot share the same full ID
2. **No aliases** — One entity has exactly one canonical ID
3. **Immutable** — Once assigned, an ID cannot change
4. **Permanent** — IDs are never reused after entity deletion

### Validation Timing

- **Format validation:** At schema validation time (syntax check)
- **Uniqueness validation:** At content ingestion time (collision check)
- **Format validation location:** T003a scope (this document)
- **Uniqueness validation location:** T006 (Validator) — not T003a scope

---

## 4. Canonical Examples

### Valid IDs

| ID | Category | Local ID | Notes |
|----|----------|----------|-------|
| `item_iron_sword` | `item` | `iron_sword` | Simple item |
| `item_iron_sword_001` | `item` | `iron_sword_001` | Variant with suffix |
| `reward_daily_login_bonus` | `reward` | `daily_login_bonus` | Multi-word local ID |
| `currency_gold` | `currency` | `gold` | Currency type |
| `ab_x` | `ab` | `x` | Minimum valid ID |

### Invalid IDs

| ID | Reason | Error |
|----|--------|-------|
| `iron_sword` | Missing category prefix | Missing underscore separator |
| `item_` | Empty local ID | Trailing underscore |
| `_iron_sword` | Leading underscore | Invalid category start |
| `item__sword` | Double underscore | Invalid local ID format |
| `ITEM_SWORD` | Uppercase | Must be lowercase |
| `item IronSword` | Space and camelCase | Invalid characters |
| `item-iron-sword` | Hyphen separator | Invalid separator |
| `sys_item_secret` | Reserved prefix | `sys_*` reserved |
| `a_${very_long_string_...}` | Exceeds 64 chars | Length violation |

---

## 5. ID Schema

**File:** `id.schema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "openmmo://schemas/id.schema.json",
  "title": "OpenMMO ID",
  "description": "Canonical identifier format for OpenMMO entities",
  "type": "string",
  "pattern": "^[a-z][a-z0-9]{1,15}_[a-z][a-z0-9_]{0,46}$",
  "minLength": 4,
  "maxLength": 64,
  "examples": [
    "item_iron_sword",
    "reward_daily_bonus",
    "currency_gold"
  ]
}
```

---

## 6. Usage in Other Schemas

### Referencing ID Format

Other schemas reference this contract via:

```json
{
  "properties": {
    "id": {
      "$ref": "openmmo://schemas/id.schema.json"
    }
  },
  "required": ["id"]
}
```

### What This Contract Provides (T003a Scope)

- ✅ Format validation (regex match)
- ✅ Length validation (min/max)
- ✅ Structure validation (category + local_id pattern)
- ✅ Naming convention documentation
- ✅ Uniqueness constraint specification

### What This Contract Does NOT Provide (Out of T003a Scope)

- ❌ Category registration validation (is category valid?)
- ❌ Existence validation (does ID point to real entity?)
- ❌ Resolution logic (how to find entity by ID?)
- ❌ Circular reference detection
- ❌ Cross-entity relationship validation

These are T003b, T004-T006 scope.

### Format vs Semantic Validation

| Aspect | T003a (This Doc) | T003b/T006 |
|--------|------------------|------------|
| Syntax check | ✅ Regex pattern | — |
| Category known | — | ✅ Category registry check |
| Entity exists | — | ✅ Existence check |
| Reference valid | — | ✅ Resolution check |

---

## 7. Sign-offs

### Spec Steward (Owner)
I confirm this ID contract is bounded to format, naming, and uniqueness rules only.

| Field | Value |
|-------|-------|
| Status | ✅ CONFIRMED |
| Date | 2025-01-21 |
| Evidence | This document |
| Scope Check | No reference resolution logic included |

---

### Chief Architect (Scope Confirmation)
I confirm this contract has NOT expanded into broader reference architecture.

| Field | Value |
|-------|-------|
| Status | ✅ CONFIRMED |
| Scope Observation | T003a properly bounded to format, naming, uniqueness only. No reference resolution logic. No circular detection. No runtime validation. |
| Date | 2025-01-21 |
| Evidence | This document |

**Scope Checklist:**
- [x] ID format defined (regex) — IN SCOPE
- [x] Naming rules documented — IN SCOPE
- [x] Uniqueness constraints specified — IN SCOPE
- [x] Canonical examples provided — IN SCOPE
- [ ] Reference resolution logic — NOT PRESENT ✓
- [ ] Circular reference detection — NOT PRESENT ✓
- [ ] Runtime validation algorithms — NOT PRESENT ✓
- [ ] Cross-entity relationship rules — NOT PRESENT ✓

**VERDICT:** No scope expansion detected. Contract is appropriately bounded.

---

### QA Validation Lead (Downstream Approval)
I approve this ID contract for downstream use in T003b, T004, T005, T006.

| Field | Value |
|-------|-------|
| Status | ✅ APPROVED |
| Test Strategy Notes | id.schema.json provides machine-checkable format validation. Regex pattern ^[a-z][a-z0-9]{1,15}_[a-z][a-z0-9_]{0,46}$ is testable. Canonical examples (valid/invalid) provide test fixtures. Length boundaries (4-64) are measurable. |
| Downstream Impact | T003b: Reference resolution can assume ID format is valid. T004/T005: Item/reward schemas can reference id.schema.json. T006: Validator has clear format contract to enforce. |
| Date | 2025-01-21 |
| Evidence | This document, Schemas/id.schema.json |

**Acceptance Criteria for Downstream Tasks:**
- T003b: Must resolve references assuming IDs match this format
- T004: Item IDs must validate against id.schema.json
- T005: Reward IDs must validate against id.schema.json
- T006: Validator must check ID format per id.schema.json pattern

---

## Evidence Links

- `ID_FORMAT.md` (this document)
- `Schemas/id.schema.json` (validation schema)
- `SCHEMA_CONVENTIONS.md` (conventions reference)
- `Planning/W1-PLAN-001-decomposition.md` (task definition)

---

*This document defines a bounded ID contract. It explicitly does not include reference resolution, circular detection, or runtime validation — those are T003b and T006 scope.*
