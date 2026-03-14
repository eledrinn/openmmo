# OpenMMO Review and Merge Policy

All OpenMMO repositories and work products must observe the following controls before any merge, publish, or rollout action occurs.

## 1. Protected Branches
- `main`, `release/*`, and any branch prefixed with `openmmo/prod-` are protected.
- Only Tier 2 leads (or their Tier 1 delegates) may press merge on protected branches.
- Fast-forward merges only; rebases on protected branches require Program Director approval recorded in `#openmmo-human-approval`.

## 2. Required Approvals
- Every change needs at least one Tier 2 approval plus author sign-off on the TASK_TEMPLATE completion note.
- Cross-domain changes (touching multiple Templates/Policies) require an additional Tier 1 reviewer.
- QA Validation Lead approval is mandatory for anything that affects runtime behaviour, migrations, or monitoring.

## 3. Tests & Evidence Gating
- CI must demonstrate passing unit, integration, and monitoring hook checks before merge.
- Evidence (logs, screenshots, recordings) must be attached within the TASK_TEMPLATE and linked in the REVIEW_TEMPLATE under "Evidence".
- Docs parity confirmation from Docs & DX Lead is required before code merges that change user experience or schema.

## 4. Documentation Requirements
- Each PR or change record references the relevant sections of `Policies/OPERATING_PRINCIPLES.md` and `Routing/CHANNEL_MAP.md` to confirm compliance.
- Release notes and schema diffs must be updated in the same change set; otherwise the merge is blocked.

## 5. Compliance & Audit Trail
- Review discussions stay inside approved channels. Screenshots or logs copied elsewhere violate Boundary Rules.
- Merge decisions are summarized in `#openmmo-director` with task IDs and reviewer names.
- Any override (force merge, skipped test) demands a human-approved exception posted in `#openmmo-human-approval` plus an entry in `Playbooks/ACTIVATION_CHECKLIST.md` under "Open Human Decisions".

No change is considered merged until all these steps are complete. Violations trigger an incident report and immediate rollback planning.
