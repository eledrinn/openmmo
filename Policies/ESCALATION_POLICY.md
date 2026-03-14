# OpenMMO Escalation Policy

OpenMMO runs a strict three-tier escalation ladder to keep governance auditable and isolated from Project Avalon. Every task and monitoring job must align with this policy.

## 1. Trigger Conditions
Escalate immediately when any of the following occur:
- Scope, authority, or routing ambiguity between roles or tiers
- Cross-project contact (even a request) involving Project Avalon or any other initiative
- Security, reliability, or compliance risk that could impact production consumers
- Schedule slip > 1 business day against a committed milestone
- Monitoring job failure that cannot be resolved within one cycle
- Any need for human sponsorship, budget, or policy exceptions

## 2. Tiered Response Ladder
1. **Tier 3 → Tier 2**: Implementers notify their direct Tier 2 lead in the relevant channel (see Routing map) and attach evidence from TASK_TEMPLATE.
2. **Tier 2 → Tier 1**: Leads summarize impact, options, and recommendation. Post in the functional channel plus `#openmmo-director` if multiple domains are affected.
3. **Tier 1 → Human Sponsor**: Program Director (or delegate) opens a request in `#openmmo-human-approval`, tagging the human sponsor and linking all evidence, templates, and monitoring data.

No Tier may skip the immediate level unless the next tier is unresponsive for 2 business hours. Skips must be documented in `#openmmo-director`.

## 3. Time Expectations
- Tier 3 responders acknowledge within 30 minutes and either resolve or escalate within 2 hours.
- Tier 2 leads acknowledge within 1 hour and must ship a mitigation or escalate within 6 hours.
- Tier 1 owners acknowledge within 2 hours during working windows and must decide within 12 hours unless waiting on human input.

## 4. Documentation Requirements
- Each escalation must reference the originating task ID, channel URL, and file path.
- Decisions are logged inside `Playbooks/ACTIVATION_CHECKLIST.md` under the "Open Human Decisions" section until resolved.
- Monitoring incidents append their report ID to the `Monitoring/cron` payload stub for auditability.

## 5. Human Escalation Rules
- Only Tier 1 roles may request human approval, and they must do it in `#openmmo-human-approval` with a clear yes/no ask.
- Humans respond via the same channel; once captured, copy the decision link into the originating task record and any impacted template.
- If a human response is delayed beyond 24 hours, Program Director must post a status ping and consider scope freeze on the affected workstream.

## 6. Post-Escalation Follow-Up
- Close the loop in the originating channel with resolution details and evidence.
- Update relevant Policies, Templates, or Playbooks if the escalation revealed a gap.
- For incidents, QA Validation Lead files a retrospective inside `openmmo/Monitoring` within 48 hours.

Escalations are signals of discipline, not failure. Failing to escalate is a policy violation and must be reported to `#openmmo-incidents`.
