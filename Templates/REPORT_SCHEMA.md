# OpenMMO Monitoring Report Schema

All monitoring and cron jobs must emit JSON objects that match the schema below.

```
{
  "timestamp": "ISO-8601 UTC string",
  "project": "OpenMMO",
  "source_job": "task-health | branch-health | spec-integrity | docs-parity | release-readiness | incident-detector",
  "status": "pass | warn | fail",
  "summary": "One-sentence description of the finding",
  "blockers": ["list of blocking issues or empty array"],
  "affected_tasks": ["Task IDs impacted"],
  "affected_agents": ["role names affected"],
  "recommended_escalation_target": "role or channel for next action",
  "confidence": 0.0-1.0,
  "evidence_links": ["absolute file paths, log URLs, or commit hashes inside OpenMMO namespace"]
}
```

Reports missing any field are considered invalid and must be re-run before announcing status.
