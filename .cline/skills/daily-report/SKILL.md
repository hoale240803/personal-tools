---
name: daily-report
description: >
  Format and generation protocol for daily engineering reports.
  Used exclusively by Antigravity to generate .ai/reports/YYYY-MM-DD.md
  at the end of each working day. Cline does NOT use this skill.
---

# Daily Report Generation Protocol

> **Owner:** Antigravity only.
> Cline must never generate or modify daily reports.

---

## When to Generate

At end of working day, or when the end-of-day workflow is triggered.

---

## File Location

```
.ai/reports/YYYY-MM-DD.md
```

Example: `.ai/reports/2026-08-19.md`

Never overwrite a past day's report. One file per calendar day.

---

## Step 1 — Gather Data

Before writing, collect:

```bash
# Today's commits across all branches
git log --oneline --since="00:00" --all

# Files changed today
git diff --stat HEAD~N   # adjust N for today's commits

# Current branch status
git status
```

Also read:
- `.ai/ACTIVE-TASK.md` — current task status
- `.ai/AGENT-STATE.md` — last Cline state
- `.ai/BACKLOG.md` — any status changes made today

---

## Step 2 — Write the Report

Use this exact format:

```markdown
# Daily Engineering Report — YYYY-MM-DD

## Summary
[1-2 paragraphs: what was the goal today, what was achieved, overall status]

## Completed Tasks
- [TASK-ID] Description — DONE ✓
  (or: none)

## In Progress
- [TASK-ID] Description | Phase: Discovery | Implementation | Review
  (or: none)

## Blocked
- [TASK-ID] Description
  - Blocker: [description]
  - Needs: [what is required to unblock]
  (or: none)

## Build / Test Results
- Build: PASS | FAIL
- Tests: N passed, N failed
- Lint: PASS | FAIL | N/A

## Commits
- `<hash>` — <commit message>
  (or: none today)

## Files Changed
- `path/to/file` — [brief description of change]

## Decisions
- [ADR-N] Title (if any new ADR was added today)
  (or: none)

## Risks
- [Description of any risks identified today]
  (or: none)

## Recommended Next Actions
1. [Action — assigned to: Antigravity | Cline | Human]
2. ...

## Human Input Required
- [Item requiring human decision or action]
  (or: none)
```

---

## Step 3 — Update BACKLOG.md

After generating the report, update `BACKLOG.md` to reflect any status
changes that occurred today:
- Tasks moved to DONE
- Tasks moved to BLOCKED
- New tasks added

---

## Step 4 — Commit the Report and State Files

```bash
git add .ai/reports/YYYY-MM-DD.md
git add .ai/BACKLOG.md
git add .ai/ACTIVE-TASK.md
git add .ai/AGENT-STATE.md
git commit -m "workspace | chore: daily report YYYY-MM-DD"
git push origin main
```

Only `.ai/` files in this commit. No project code.