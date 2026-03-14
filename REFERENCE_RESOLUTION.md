# REFERENCE_RESOLUTION.md

**Document Type:** Reference Resolution Contract  
**Task ID:** W1-T003b  
**Owner:** spec-steward  
**Date:** 2025-01-21  
**Status:** CONFIRMED — Bounded reference contract for Wave 1

---

## 1. Reference Field Patterns

### Single Reference Format

A reference field contains an ID string that points to another entity.

```json
{
  "reward": "reward_gold_chest_001"
}
```

### Reference Field Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "openmmo://schemas/reference.schema.json",
  "title": "OpenMMO Reference",
  "description": "Reference to another OpenMMO entity. Value must be a valid ID per ID_FORMAT.md.",
  "type": "string",
  "pattern": "^[a-z][a-z0-9]{1,15}_[a-z][a-z0-9_]{0,46}$",
  "minLength": 4,
  "maxLength": 64
}
```

### Array of References

Fields that accept multiple references use arrays:

```json
{
  "requires_items": [
    "item_iron_sword_001",
    "item_leather_armor_001"
  ]
}
```

### Optional vs Required References

| Cardinality | Schema Pattern | Example |
|-------------|----------------|---------|
| Optional single | `{"type": "string", ...}` | `"reward": "reward_daily_bonus"` or omitted |
| Required single | `{"type": "string", ...}` in `required` | Must provide valid ID |
| Optional array | `{"type": "array", "items": {...}}` | Can be empty array or omitted |
| Required array | Array in `required` | Must provide array (can be empty) |

---

## 2. Reference Target Rules

### Valid Reference Types (Wave 1)

| Source Entity | Can Reference | Target Category | Example |
|---------------|---------------|-----------------|---------|
| Item | Reward (on use) | `reward` | Item grants reward when used |
| Reward | Item | `item` | Reward contains items |
| Reward | Currency | `currency` | Reward grants currency |

### Invalid References (Wave 1)

| Source | Target | Status | Reason |
|--------|--------|--------|--------|
| Item | Item | ❌ NOT ALLOWED | No item-to-item references in Wave 1 |
| Currency | Any | ❌ NOT ALLOWED | Currency is leaf type |
| Reward | Reward | ❌ NOT ALLOWED | No nested reward chains in Wave 1 |

### Reference Type Validation Matrix

```
Source ↓ / Target → | item | reward | currency
-------------------|------|--------|----------
item               |  NO  |  YES   |   NO
reward             | YES  |   NO   |  YES
currency           |  NO  |   NO   |   NO
```

---

## 3. Resolution Expectations (Spec Level)

### What "Resolution" Means

At the specification level, "resolving a reference" means:

1. **Parse** the reference value as a valid ID per ID_FORMAT.md
2. **Extract** the category prefix (e.g., `item` from `item_iron_sword`)
3. **Validate** the target category is allowed per Section 2 (Target Rules)
4. **Locate** the target entity by ID within its category namespace
5. **Return** the target entity's full definition

### Resolution Steps (Conceptual)

```
Reference: "item_iron_sword_001"
  ↓
Parse → Valid ID per T003a
  ↓
Extract Category → "item"
  ↓
Validate Target Rules → "item" is valid target for source
  ↓
Locate → Find entity with ID "item_iron_sword_001" in item namespace
  ↓
Return → Item entity definition
```

### Resolution Failure Modes

| Failure | Cause | Handling |
|---------|-------|----------|
| Invalid format | ID doesn't match T003a regex | Format validation error (T006) |
| Invalid target | Category not allowed per Section 2 | Target rule violation (T006) |
| Not found | ID valid but entity doesn't exist | Resolution error (T006) |
| Circular | Reference chain loops back (T003b defines, T006 detects) | Circular reference error (T006) |

---

## 4. Circular Detection Boundaries

### What T003b Defines (This Document)

- ✅ Circular references exist as a concept
- ✅ Circular references are invalid
- ✅ Detection is required
- ✅ Detection is T006 (Validator) scope, NOT T003b

### What T003b Explicitly Does NOT Define

- ❌ Algorithm for detecting circular references
- ❌ Data structures for tracking reference chains
- ❌ Implementation of cycle detection
- ❌ Performance characteristics of detection
- ❌ Memory management for detection state

### Circular Reference Definition

A **circular reference** exists when:

> Entity A references Entity B, and following references from B eventually leads back to A.

**Example (Invalid):**
```
item_a → reward_x (on use)
reward_x → item_b (contains)
item_b → reward_y (on use)
reward_y → item_a (contains) ← CIRCULAR
```

**Wave 1 Simplification:**
Since items cannot reference items and rewards cannot reference rewards, circular references in Wave 1 require at minimum:
- Item → Reward → Item → Reward → ... → Item (back to start)

### T003b → T006 Handoff

T003b defines that circular references are invalid.
T006 implements detection of circular references.

| Aspect | T003b (Spec) | T006 (Implementation) |
|--------|--------------|----------------------|
| Circulars are invalid | ✅ Defined | — |
| Detection algorithm | ❌ Not defined | ✅ Implemented |
| Error message format | ❌ Not defined | ✅ Defined |
| Performance bounds | ❌ Not defined | ✅ Characterized |

---

## 5. Explicit Non-Goals (Deferred)

### Deferred to T006 (Validator)

| Feature | Why Deferred | T006 Responsibility |
|---------|--------------|---------------------|
| Resolution algorithm implementation | Implementation scope | Validator resolves references |
| Circular detection implementation | Implementation scope | Validator detects cycles |
| Reference existence checking | Runtime validation | Validator checks existence |
| Target rule enforcement | Runtime validation | Validator enforces matrix |
| Reference caching | Performance optimization | Validator may implement |
| Batch resolution | Performance optimization | Validator may implement |

### Deferred to Post-Wave 1

| Feature | Why Deferred | Future Wave |
|---------|--------------|-------------|
| Query language for references | Scope expansion | Wave 2+ |
| Graph traversal beyond single hop | Scope expansion | Wave 2+ |
| Reference versioning | Complexity | Wave 2+ |
| Soft references (nullable) | Not required | Wave 2+ |
| Cross-project references | Boundary violation | Not planned |

### Explicitly Out of Scope

- ❌ Graph database design
- ❌ General graph system or graph algorithms
- ❌ Query language (GraphQL, Cypher, etc.)
- ❌ Reference indexing strategies
- ❌ Distributed reference resolution
- ❌ Reference transaction management

---

## 6. Usage in Schemas

### Referencing an Item

```json
{
  "properties": {
    "grants_item": {
      "$ref": "openmmo://schemas/reference.schema.json",
      "description": "Reference to an item entity"
    }
  }
}
```

### Referencing with Target Constraints (Documentation Only)

```json
{
  "properties": {
    "reward": {
      "allOf": [
        {"$ref": "openmmo://schemas/reference.schema.json"},
        {"description": "Must reference a reward (reward_*) entity"}
      ]
    }
  }
}
```

> **Note:** Target category validation (e.g., ensuring `reward` field points to `reward_*` IDs) is implemented in T006, not enforced at JSON Schema level.

---

## 7. Sign-offs

### Spec Steward (Owner)
I confirm this reference contract is bounded to patterns, rules, expectations, and boundaries only.

| Field | Value |
|-------|-------|
| Status | ✅ CONFIRMED |
| Date | 2025-01-21 |
| Evidence | This document |
| Scope Check | No implementation algorithms included |

---

### Chief Architect (Scope Confirmation)
I confirm this contract has NOT expanded into runtime architecture or a general graph system.

| Field | Value |
|-------|-------|
| Status | ✅ CONFIRMED |
| Scope Observation | T003b properly bounded to reference patterns, target rules, resolution expectations, and circular detection boundaries. No runtime algorithms. No graph system. No validator implementation. |
| Date | 2025-01-21 |
| Evidence | This document |

**Scope Checklist:**
- [x] Reference patterns defined — IN SCOPE
- [x] Target rules documented — IN SCOPE
- [x] Resolution expectations at spec level — IN SCOPE
- [x] Circular detection boundaries stated — IN SCOPE
- [x] Non-goals explicitly listed — IN SCOPE
- [ ] Runtime resolution algorithms — NOT PRESENT ✅
- [ ] Graph database or graph system — NOT PRESENT ✅
- [ ] Validator implementation details — NOT PRESENT ✅

**VERDICT:** No scope expansion detected. Contract is appropriately bounded to specification only.

---

### QA Validation Lead (Downstream Approval)
I approve this reference contract for downstream use in T004, T005, T006.

| Field | Value |
|-------|-------|
| Status | ✅ APPROVED |
| Test Strategy Notes | reference.schema.json reuses id.schema.json pattern — testable via same regex. Target rules matrix (Section 2) provides test cases. Circular detection boundaries clearly state T003b defines concept, T006 implements — clear handoff. |
| Downstream Impact | T004: Items reference rewards via reference.schema.json. T005: Rewards reference items/currency via reference.schema.json. T006: Validator checks target rules per Section 2 matrix; implements circular detection per Section 4 boundaries. |
| Date | 2025-01-21 |
| Evidence | This document, Schemas/reference.schema.json |

**Acceptance Criteria for Downstream Tasks:**
- T004: Item schema uses reference.schema.json for reward references; follows target rules
- T005: Reward schema uses reference.schema.json for item/currency references; follows target rules
- T006: Validator implements resolution per Section 3; enforces target rules per Section 2; detects circulars per Section 4 boundaries

---

## Evidence Links

- `REFERENCE_RESOLUTION.md` (this document)
- `Schemas/reference.schema.json` (validation schema)
- `ID_FORMAT.md` (T003a — ID contract)
- `Schemas/id.schema.json` (T003a — ID validation)
- `Planning/W1-PLAN-001-decomposition.md` (task definition)

---

*This document defines a bounded reference-resolution contract. It explicitly does not include implementation algorithms, graph systems, or validator behavior — those are T006 and future scope.*
