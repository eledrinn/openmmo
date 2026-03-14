# Wave 1 Task Decomposition — W1-PLAN-001

**Program Director:** openmmoprogramdirector  
**Date:** 2025-01-21  
**Status:** Approved with Adjustments — Pending Role Sign-offs  
**Authorization:** Human-approved roadmap scope (governance, schemas, IDs/references, items, rewards, validator, CLI validate, fixtures, docs)

**Revision Notes:**
- REVISED: T003 split into T003a/T003b to prevent scope creep
- REVISED: QA involvement starts in Phase 2 (T003a, T003b, T004, T005)

---

## Wave 1 Scope Boundaries

### IN SCOPE (Authorized)
| Area | Deliverable |
|------|-------------|
| Governance | docs confirmation, conventions documentation |
| Schema Core | ID system, reference patterns, item schema, reward schema |
| Validation | JSON Schema validator engine |
| CLI | `openmmo validate` command |
| Fixtures | Sample item/reward fixtures |
| Documentation | Schema specs, CLI usage, fixture guides |

### OUT OF SCOPE (Explicitly Forbidden)
| Area | Reason |
|------|--------|
| Quests | Wave 2+ |
| Objectives | Wave 2+ |
| Adapters beyond validation needs | Scope creep |
| Studio UI | Wave 2+ |
| Godot integration | Wave 2+ |
| Plugin SDK | Wave 2+ |
| Release packaging | Post-Wave 1 |

---

## Task Breakdown

### Phase 1: Foundation (Dependencies: None)

#### W1-T001: Governance Documentation Confirmation
```yaml
Task ID: W1-T001
Title: Confirm and finalize Wave 1 governance documentation
Owner: spec-steward
Supervisor: program-director
QA Review: Not required (governance only)
Allowed Paths:
  - /home/cada/.openclaw/workspace/openmmo/Policies/
  - /home/cada/.openclaw/workspace/openmmo/Templates/
Outputs:
  - GOVERNANCE-WAVE1.md (confirms all policies current)
Acceptance Criteria:
  1. All Wave 1 policies reviewed and signed
  2. Task template validated for Wave 1 scope
  3. Review chain documented
Estimated Effort: 1 unit
```

#### W1-T002: Schema Conventions Document
```yaml
Task ID: W1-T002
Title: Establish canonical schema conventions
Owner: spec-steward
Supervisor: chief-architect
QA Review: Not required (conventions only)
Dependencies: W1-T001
Allowed Paths:
  - /home/cada/.openclaw/workspace/openmmo/Templates/
  - /home/cada/.openclaw/workspace/openmmo/Schemas/
Outputs:
  - SCHEMA_CONVENTIONS.md
Acceptance Criteria:
  1. Naming conventions documented
  2. JSON Schema version specified
  3. Required/optional field patterns defined
  4. Extension points identified
Estimated Effort: 2 units
```

---

### Phase 2: Core Schema System (Dependencies: Phase 1)

#### W1-T003a: ID Format and Naming Rules
```yaml
Task ID: W1-T003a
Title: Define ID format, naming, and uniqueness rules
Owner: spec-steward
Supervisor: chief-architect
QA Review: REQUIRED — qa-validation-lead approves testability
Dependencies: W1-T002
Allowed Paths:
  - /home/cada/.openclaw/workspace/openmmo/Schemas/
  - /home/cada/.openclaw/workspace/openmmo/Templates/
Outputs:
  - ID_FORMAT.md (format specification)
  - id.schema.json (validation schema)
Acceptance Criteria:
  1. ID string format defined (prefix, pattern, length limits)
  2. Uniqueness constraints specified
  3. ID schema validates format via regex/pattern
  4. qa-validation-lead approves test strategy
NARROWLY BOUNDED: Stop here. Do NOT include reference resolution.
Estimated Effort: 1 unit
Escalation Trigger: If scope expands beyond format/naming, split to T003b immediately
```

#### W1-T003b: Reference Resolution Rules
```yaml
Task ID: W1-T003b
Title: Define reference resolution patterns
Owner: spec-steward
Supervisor: chief-architect
QA Review: REQUIRED — qa-validation-lead approves acceptance/test shape
Dependencies: W1-T003a
Allowed Paths:
  - /home/cada/.openclaw/workspace/openmmo/Schemas/
  - /home/cada/.openclaw/workspace/openmmo/Templates/
Outputs:
  - REFERENCE_RESOLUTION.md
  - reference.schema.json (for cross-references)
Acceptance Criteria:
  1. Reference format defined (links to T003a IDs)
  2. Resolution pattern specified
  3. Circular reference prevention documented
  4. qa-validation-lead approves test cases
Estimated Effort: 1 unit
```

#### W1-T004: Item Schema Completion
```yaml
Task ID: W1-T004
Title: Complete item schema beyond skeleton
Owner: schema-drafter
Supervisor: spec-steward
QA Review: REQUIRED — qa-validation-lead approves acceptance/test shape
Dependencies: W1-T003a
Allowed Paths:
  - /home/cada/.openclaw/workspace/openmmo/Schemas/
Outputs:
  - item.schema.json (enhanced from skeleton)
Acceptance Criteria:
  1. All item types covered (consumable, equipment, material, quest)
  2. Stat modifiers schema included
  3. Requirements schema included
  4. Icon/stackable fields defined
  5. References ID_FORMAT.md for IDs
  6. qa-validation-lead approves test strategy
Estimated Effort: 3 units
```

#### W1-T005: Reward Schema Specification
```yaml
Task ID: W1-T005
Title: Design reward schema for items/currency/experience
Owner: schema-drafter
Supervisor: spec-steward
QA Review: REQUIRED — qa-validation-lead approves acceptance/test shape
Dependencies: W1-T003a, W1-T004
Allowed Paths:
  - /home/cada/.openclaw/workspace/openmmo/Schemas/
Outputs:
  - reward.schema.json
Acceptance Criteria:
  1. Item rewards reference item.schema.json
  2. Currency rewards schema defined
  3. Experience rewards schema defined
  4. Reward tables/pools schema defined
  5. No quest-specific logic (Wave 2)
  6. qa-validation-lead approves test strategy
Estimated Effort: 2 units
```

---

### Phase 3: Validation Engine (Dependencies: Phase 2)

#### W1-T006: JSON Schema Validator Core
```yaml
Task ID: W1-T006
Title: Implement OpenMMO validation engine
Owner: integration-dev
Supervisor: qa-validation-lead
QA Review: REQUIRED — qa-validation-lead owns acceptance
Dependencies: W1-T004, W1-T005, W1-T003b
Allowed Paths:
  - /home/cada/.openclaw/workspace/openmmo/Validator/
Outputs:
  - validator/ (package directory)
  - src/validate.ts (or .js)
  - tests/validator.spec.ts
Acceptance Criteria:
  1. Validates item.schema.json
  2. Validates reward.schema.json
  3. Validates reference.schema.json
  4. Reports all validation errors with paths
  5. Reference integrity checking (per T003b)
  6. 100% test coverage for validation logic
Estimated Effort: 4 units
```

---

### Phase 4: CLI Tool (Dependencies: Phase 3)

#### W1-T007: CLI validate Command
```yaml
Task ID: W1-T007
Title: Implement 'openmmo validate' CLI command
Owner: cli-lead
Supervisor: chief-architect
QA Review: REQUIRED — qa-validation-lead tests CLI interface
Dependencies: W1-T006
Allowed Paths:
  - /home/cada/.openclaw/workspace/openmmo/CLI/
Outputs:
  - cli/validate.ts
  - CLI docs in docs/cli.md
Acceptance Criteria:
  1. `openmmo validate <path>` validates files
  2. `openmmo validate --all` validates project
  3. Exit code 0 on success, non-zero on failure
  4. JSON and human-readable output formats
  5. Tests for CLI interface
Estimated Effort: 3 units
```

---

### Phase 5: Fixtures & Documentation (Dependencies: Phase 4)

#### W1-T008: Fixture Library
```yaml
Task ID: W1-T008
Title: Create fixture library for items and rewards
Owner: fixture-writer
Supervisor: qa-validation-lead
QA Review: REQUIRED — qa-validation-lead validates all fixtures
Dependencies: W1-T007
Allowed Paths:
  - /home/cada/.openclaw/workspace/openmmo/Fixtures/
Outputs:
  - fixtures/items/ (*.json)
  - fixtures/rewards/ (*.json)
  - fixtures/README.md
Acceptance Criteria:
  1. Minimum 10 valid item fixtures (all types)
  2. Minimum 5 valid reward fixtures
  3. All fixtures pass `openmmo validate`
  4. Fixtures serve as documentation examples
Estimated Effort: 2 units
```

#### W1-T009: Documentation Completion
```yaml
Task ID: W1-T009
Title: Complete Wave 1 documentation
Owner: docs-dx-lead
Supervisor: program-director
QA Review: Advisory — qa-validation-lead reviews validation docs
Dependencies: W1-T008
Allowed Paths:
  - /home/cada/.openclaw/workspace/openmmo/docs/
Outputs:
  - docs/schemas.md
  - docs/cli.md
  - docs/fixtures.md
  - docs/validation.md
Acceptance Criteria:
  1. Schema documentation complete
  2. CLI usage documented with examples
  3. Fixture guide complete
  4. Validation troubleshooting guide
  5. Cross-references between docs
Estimated Effort: 2 units
```

---

## Task Ordering & Dependencies Graph

```
Phase 1: Foundation
├── W1-T001 (Governance) ──┐
└── W1-T002 (Conventions) ─┘
            │
            ▼
Phase 2: Core Schemas
├── W1-T003a (ID Format) ──┐
├── W1-T003b (References) ─┤ ◄── Split prevents scope creep
├── W1-T004 (Items) ───────┤
└── W1-T005 (Rewards) ─────┘
            │              ▲
            │              │ QA involved from T003a onward
            ▼              │
Phase 3: Validation        │
├── W1-T006 (Validator) ───┘
            │
            ▼
Phase 4: CLI
├── W1-T007 (CLI validate)
            │
            ▼
Phase 5: Fixtures & Docs
├── W1-T008 (Fixtures)
└── W1-T009 (Documentation)
```

---

## Active Roles by Phase

| Phase | Primary Roles | Review Chain | QA Involvement |
|-------|---------------|--------------|----------------|
| 1 | spec-steward | spec-steward → chief-architect → program-director | Not required |
| 2 | spec-steward, schema-drafter | schema-drafter → spec-steward → chief-architect | **REQUIRED from T003a** — qa-validation-lead approves test/acceptance shape |
| 3 | integration-dev, qa-validation-lead | integration-dev → qa-validation-lead → chief-architect | qa-validation-lead owns acceptance |
| 4 | cli-lead | cli-lead → chief-architect → program-director | qa-validation-lead tests CLI |
| 5 | fixture-writer, docs-dx-lead | fixture-writer → qa-validation-lead; docs-dx-lead → program-director | qa-validation-lead validates fixtures |

---

## QA Review Points (Revised)

| Task | QA Review Type | QA Deliverable |
|------|----------------|----------------|
| T003a | Approval | Test strategy for ID format validation |
| T003b | Approval | Acceptance criteria for reference resolution |
| T004 | Approval | Test strategy for item schema validation |
| T005 | Approval | Test strategy for reward schema validation |
| T006 | Ownership | Full test suite + 100% coverage requirement |
| T007 | Testing | CLI interface tests |
| T008 | Validation | All fixtures must pass `openmmo validate` |
| T009 | Advisory | Review validation troubleshooting docs |

---

## Anticipated Risks & Bottlenecks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **R1: ID System Complexity** | Low | High | **MITIGATED** — T003a/T003b split keeps scope bounded; escalation trigger defined |
| **R2: Reference Integrity in Validator** | Medium | Medium | W1-T006 requires spec-steward review of resolution logic; no external refs allowed |
| **R3: CLI Scope Creep** | Medium | Medium | Strict W1-T007 acceptance criteria; additional CLI commands explicitly out of scope |
| **R4: Fixture Data Quality** | Low | Medium | W1-T008 dependent on W1-T007 validation; no manual fixture creation without validation pass |
| **R5: Cross-Project Contamination** | Low | Critical | Boundary checks at every phase gate; grep audit before each review |
| **R6: Documentation Drift** | Medium | Low | W1-T009 final phase ensures docs match implementation; cannot start until fixtures complete |
| **R7: Early QA Bottleneck** | Medium | Medium | qa-validation-lead involvement in 4 Phase 2 tasks; buffer time allocated |

### Critical Path
**W1-T003a → W1-T004 → W1-T006 → W1-T007 → W1-T008**

Any delay in ID Format or Validator blocks CLI and Fixtures.

### Recommended Buffers
- Add 1 unit buffer between Phase 1 and 2 for qa-validation-lead preparation
- Add 1 unit buffer between Phase 2 and 3 for spec-steward + qa joint review
- Add 1 unit buffer between Phase 4 and 5 for QA gate

---

## Go/No-Go Criteria for Phase Transitions

| Transition | Gate Condition | Owner |
|------------|----------------|-------|
| Phase 1 → 2 | SCHEMA_CONVENTIONS.md approved | spec-steward |
| Phase 2 → 3 | T003a, T003b, T004, T005 approved by **both** spec-steward AND qa-validation-lead | program-director confirms |
| Phase 3 → 4 | Validator 100% test coverage | qa-validation-lead |
| Phase 4 → 5 | CLI tests pass, exit codes correct | cli-lead |
| Wave 1 Complete | All fixtures pass validation, docs complete | program-director |

---

## Required Approvals Before Execution

| Role | Action Required | Status |
|------|-----------------|--------|
| **human** | Approve W1-PLAN-001 decomposition | ✅ APPROVED (with adjustments) |
| chief-architect | Confirm work surfaces and package boundaries | ✅ APPROVED |
| spec-steward | Approve schema contract sequencing and T003a/T003b split | ✅ APPROVED |
| qa-validation-lead | Approve early QA involvement and test strategy | ✅ APPROVED |

**ALL APPROVALS COMPLETE — WAVE 1 EXECUTION AUTHORIZED**

---

## T003 Scope Containment Protocol

**If T003a expands beyond ID format/naming:**
1. STOP work immediately
2. Escalate to spec-steward + chief-architect
3. Split remaining work into T003b (reference resolution)
4. Document scope creep incident in Monitoring/

**Signs of T003a scope creep:**
- Discussion of reference resolution during T003a
- Proposals for circular reference detection in ID format spec
- Requirements for runtime ID resolution in format spec

---

*This decomposition follows the approved roadmap scope. No tasks exceed Wave 1 boundaries. All out-of-scope items (quests, adapters, Studio, Godot, SDK, packaging) are excluded. T003 split and early QA involvement implemented per human direction.*
