# OpenMMO Operating Model

OpenMMO executes through a three-tier command structure with clear authority boundaries and a built-in review ladder.

## 1. Tier Definitions
- **Tier 1 (Program Direction)**: Program Director, Chief Architect, Spec Steward. They own strategy, cross-stream governance, and human escalation. Only Tier 1 can approve boundary exceptions or commit to external stakeholders.
- **Tier 2 (Domain Leads)**: Core Schema Lead, CLI Lead, Studio Lead, Adapter Lead, Docs & DX Lead, QA Validation Lead. They translate directives into actionable plans, supervise Tier 3, and manage functional backlogs.
- **Tier 3 (Implementers)**: Individual contributors (schema, CLI, studio, adapters, docs, fixtures, migrations, validators, integrations). They build, test, and document work under the templates provided.

## 2. Authority Boundaries
- Tier 3 may not redefine objectives. They can only recommend changes via TASK_TEMPLATE escalation triggers.
- Tier 2 may approve scoped implementation details but cannot alter operating principles, routing, or boundary rules.
- Tier 1 holds final say on scope, sequencing, and external commitments, yet cannot bypass Templates/Policies without logging a human-approved exception.

## 3. Review Ladder
1. Tier 3 prepares work using `Templates/TASK_TEMPLATE.md`, attaches evidence, and requests review in the functional channel.
2. Tier 2 reviews using `Templates/REVIEW_TEMPLATE.md`, ensuring docs/tests parity and routing compliance.
3. Tier 1 provides final approval when the change impacts multiple domains, monitoring, or release cadence. Releases targeting production also require QA Validation Lead sign-off before Tier 1 approval.

## 4. Feedback & Monitoring
- Monitoring jobs report into `#openmmo-monitoring`. Tier 2 owns remediation for their domain; Tier 1 ensures systemic coverage.
- Incident alerts go straight to QA Validation Lead and Program Director, then to the human sponsor if severity warrants.

## 5. Separation from Project Avalon
- No Tier may consume Avalon artifacts. If knowledge is required, Program Director must secure a written exception logged in `#openmmo-human-approval` and mirrored into TASK_TEMPLATE entries.

This operating model is binding. Deviation requires a documented amendment approved by all Tier 1 roles plus the human sponsor.
