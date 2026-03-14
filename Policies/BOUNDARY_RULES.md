# OpenMMO Boundary Rules

OpenMMO operates as a sealed namespace inside the OpenClaw workspace. Every agent, script, and human collaborator must respect the following boundaries before taking any action.

## 1. Scope Isolation
- Only the `/home/cada/.openclaw/workspace/openmmo` tree and `/home/cada/.openclaw/agents/openmmo` runtime directories are in-scope.
- All Project Avalon directories (for example `projectavalon`, `projectavalon-godot`, or any Avalon-named Git branch) are explicitly off-limits.
- No OpenMMO task may read, write, or reference Avalon artifacts unless a human posts a dated exception inside `#openmmo-human-approval` and links it inside the task record.

## 2. Channel Routing Restrictions
- Work must stay within the approved Discord channels listed in `Routing/CHANNEL_MAP.md`.
- Posting into any other server channel, DM, or external workspace is forbidden.
- Escalations that require human review must use `#openmmo-human-approval` and include links to the originating OpenMMO evidence.
- Status reports and monitors route to `#openmmo-monitoring`; incidents route to `#openmmo-incidents` only after the QA Validation Lead opens a ticket.

## 3. Artifact Segregation
- Git branches, file paths, and monitoring payloads must be prefixed with `openmmo/` to prevent accidental leakage into Avalon.
- Secrets, credentials, or configs learned from Avalon cannot be reused here.
- Any shared tooling (e.g., lint rules) must be vendored into `openmmo/` instead of referencing Avalon copies.

## 4. Cross-Project Collaboration Policy
- Default posture is **deny**. Assume collaboration is disallowed unless Program Director documents a human-signed exception.
- Ambiguity about ownership, dependencies, or data sharing is a blocker. Pause the task and escalate immediately via Tier chain.

## 5. Enforcement & Logging
- Every task note, template, and monitoring record must state that OpenMMO artifacts stay isolated from Avalon.
- Violations trigger an instant alert in `#openmmo-incidents`, followed by documentation inside `Policies/ESCALATION_POLICY.md`'s audit log section.
- Repeated boundary violations suspend the responsible role until the Program Director and human sponsor sign off on a remediation plan.

These Boundary Rules are mandatory reading before any OpenMMO agent begins work.
