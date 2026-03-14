# SCHEMA_CONVENTIONS.md

**Document Type:** Canonical Schema Conventions  
**Task ID:** W1-T002  
**Owner:** spec-steward  
**Date:** 2025-01-21  
**Status:** CONFIRMED — Conventions established for Wave 1

---

## 1. JSON Schema Version

**Standard:** JSON Schema Draft 2020-12  
**Rationale:** Latest stable version with broad tooling support  
**Declaration:**
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema"
}
```

---

## 2. Schema Identification

### $id Convention
**Format:** `openmmo://schemas/{name}.schema.json`  
**Examples:**
- `openmmo://schemas/id.schema.json`
- `openmmo://schemas/item.schema.json`
- `openmmo://schemas/reward.schema.json`
- `openmmo://schemas/reference.schema.json`

### File Naming
**Format:** `{entity}.schema.json` (lowercase, snake_case entity name)  
**Location:** `/home/cada/.openclaw/workspace/openmmo/Schemas/`  
**Examples:**
- `id.schema.json`
- `item.schema.json`
- `reward.schema.json`

---

## 3. Property Naming Conventions

### Field Names
- ** snake_case** for all property names
- ** lowercase** with underscores as separators
- ** no abbreviations** (use `identifier` not `id` when standalone)
- ** exception:** `id` is acceptable for the canonical identifier field

### Examples
| Good | Bad | Reason |
|------|-----|--------|
| `item_type` | `itemType` | Must be snake_case |
| `item_type` | `type` | Avoid reserved words |
| `max_stack_size` | `maxStack` | No abbreviations |
| `created_at` | `createdAt` | snake_case, not camelCase |

---

## 4. Required vs Optional Fields

### Required Fields Convention
- Use `required` array at schema root
- Minimum viable set for functional use
- Identity fields always required
- Timestamps optional unless business-critical

### Pattern
```json
{
  "required": ["id", "name", "item_type"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "description": { "type": "string" },
    "item_type": { "type": "string" }
  }
}
```

---

## 5. Type Constraints

### String Fields
```json
{
  "type": "string",
  "minLength": 1,
  "maxLength": 100,
  "pattern": "^[a-z_]+$"
}
```

### Integer Fields
```json
{
  "type": "integer",
  "minimum": 0,
  "maximum": 2147483647
}
```

### Enum Fields
```json
{
  "type": "string",
  "enum": ["consumable", "equipment", "material", "quest"]
}
```

### Boolean Fields
```json
{
  "type": "boolean",
  "default": false
}
```

---

## 6. Reference Patterns

### Cross-Reference Format
**Pattern:** `{type}:{id}`  
**Examples:**
- `item:iron_sword_001`
- `reward:gold_chest_001`

### Reference Schema Structure
```json
{
  "type": "object",
  "properties": {
    "ref": {
      "type": "string",
      "pattern": "^[a-z_]+:[a-z0-9_]+$"
    },
    "type": { "type": "string" },
    "id": { "type": "string" }
  },
  "required": ["ref"]
}
```

---

## 7. Metadata Fields

### Standard Metadata (Optional)
| Field | Type | Purpose |
|-------|------|---------|
| `created_at` | string (ISO-8601) | Creation timestamp |
| `updated_at` | string (ISO-8601) | Last modification |
| `version` | integer | Schema version for migrations |
| `author` | string | Creator identifier |

### Example
```json
{
  "_meta": {
    "created_at": "2025-01-21T00:00:00Z",
    "version": 1
  }
}
```

---

## 8. Extension Points

### Future-Proofing Pattern
Use `additionalProperties: false` at schema root to prevent accidental extension. Future waves must explicitly update schemas.

```json
{
  "additionalProperties": false,
  "properties": {
    "...": "..."
  }
}
```

### Extension Strategy for Future Waves
1. Add new optional fields in minor versions
2. Use `_ext` prefix for experimental fields
3. Major version bump for breaking changes
4. Migration scripts required for field renames

---

## 9. Documentation Requirements

### Schema-Level Documentation
Every schema MUST include:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "openmmo://schemas/example.schema.json",
  "title": "Human-Readable Name",
  "description": "Purpose and scope of this schema"
}
```

### Property-Level Documentation
Every property SHOULD include:
```json
{
  "properties": {
    "field_name": {
      "type": "string",
      "description": "What this field represents"
    }
  }
}
```

---

## 10. Validation Patterns

### Pattern Validation
Use `pattern` for string constraints:
```json
{
  "id": {
    "type": "string",
    "pattern": "^[a-z][a-z0-9_]{0,63}$"
  }
}
```

### Range Validation
Use `minimum`/`maximum` for numeric constraints:
```json
{
  "quantity": {
    "type": "integer",
    "minimum": 1,
    "maximum": 9999
  }
}
```

### Array Validation
Use `items` and `minItems`/`maxItems`:
```json
{
  "tags": {
    "type": "array",
    "items": { "type": "string" },
    "minItems": 0,
    "maxItems": 10
  }
}
```

---

## 11. Wave 1 Schema-Specific Conventions

### ID System (T003a)
- ID format: `[a-z][a-z0-9_]{0,63}`
- Namespace prefix: `{category}_` (e.g., `item_`, `reward_`)
- Uniqueness: Global within entity type

### Item Schema (T004)
- Required: `id`, `name`, `item_type`
- Types: `consumable`, `equipment`, `material`, `quest`
- Stats nested under `stats` object
- Requirements nested under `requirements` object

### Reward Schema (T005)
- Types: `item`, `currency`, `experience`
- Item rewards use reference pattern
- Currency uses `amount` + `currency_type`
- Experience uses `amount` + `experience_type`

### Reference Resolution (T003b)
- Format: `{type}:{id}`
- Resolution: Lookup by type prefix
- Circular references: Detected at validation time

---

## 12. Sign-offs

### Spec Steward (Owner)
I confirm these conventions are established and appropriate for Wave 1 schemas.

| Field | Value |
|-------|-------|
| Status | ✅ CONFIRMED |
| Date | 2025-01-21 |
| Evidence | This document |

---

### Chief Architect (Approval)
I confirm these conventions support the Wave 1 architecture.

| Field | Value |
|-------|-------|
| Status | ✅ CONFIRMED |
| Conditions | None |
| Date | 2025-01-21 |
| Evidence | This document |

---

## Evidence Links

- `SCHEMA_CONVENTIONS.md` (this document)
- `Templates/TASK_TEMPLATE.md`
- `Planning/W1-PLAN-001-decomposition.md`
- `GOVERNANCE-WAVE1.md`

---

*These conventions apply to all Wave 1 schema work. Future waves may extend but must maintain backward compatibility or provide migration paths.*
