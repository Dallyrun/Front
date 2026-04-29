# Feedback Loop

Use this file for reusable learnings from failed checks, review feedback, debugging, performance work, or trade-off decisions. Keep entries short and actionable.

Add an entry when:

- CI, local verification, or a reviewer catches something that future work could avoid.
- A bug fix reveals a project-specific testing, API, routing, styling, or state-management pattern.
- The same correction is needed more than once.
- A decision creates a trade-off future agents or teammates should remember.

Do not add an entry for routine code changes, simple documentation edits, or passing verification with no new lesson.

When the same lesson appears twice, promote it into a stronger harness: a test, lint rule, script, PR checklist item, or explicit `AGENTS.md` rule.

## Entry Template

```md
## YYYY-MM-DD - Short title

- Trigger:
- Symptom:
- Root cause:
- Fix:
- Harness update:
```
