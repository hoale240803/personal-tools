# End-of-Day Workflow

> **Trigger:** Antigravity Scheduled Task at ~18:00, or end of session
> **Agent:** Antigravity
> **Purpose:** Close the day, generate daily report, update all state files

---

## Step 1 — Read Current Task State

```
Read: .ai/ACTIVE-TASK.md  → current status
Read: .ai/AGENT-STATE.md  → Cline's last state
```

---

## Step 2 — Inspect Git Activity

```bash
# Today's commits
git log --oneline --since="00:00" --all

# Files changed (on working branch)
cd idea/<project>
git diff --stat main...<project>-cline
git log --oneline -10
```

---

## Step 3 — Inspect Test Results

Read `.ai/AGENT-STATE.md` Build / Test Results section.
Note: PASS / FAIL, number of tests, any regressions.

---

## Step 4 — Collect Day Summary

Gather:

| Data | Source |
|------|--------|
| Completed tasks | BACKLOG.md (DONE) |
| In-progress tasks | ACTIVE-TASK.md (IN_PROGRESS / REVIEW) |
| Blocked tasks | ACTIVE-TASK.md (BLOCKED) |
| Commits | `git log --oneline --since="00:00"` |
| Files changed | `git diff --stat` |
| Test results | AGENT-STATE.md |
| New decisions | DECISIONS.md (check for today's ADRs) |
| Blockers/risks | ACTIVE-TASK.md Blockers section |

---

## Step 5 — Generate Daily Report

Use the `daily-report` skill to write:

```
.ai/reports/YYYY-MM-DD.md
```

Fill every section. Be concise but complete.
The human should be able to read this in under 3 minutes.

---

## Step 6 — Update AGENT-STATE.md

Record EOD snapshot:

```
Phase: End-of-Day
Last action: Generated daily report YYYY-MM-DD. Task status: <status>.
Next action: <recommended first action tomorrow>
```

---

## Step 7 — Update BACKLOG.md

For tasks whose status changed today:
- ACCEPTED + committed → `DONE`
- Still implementing → leave as `IN_PROGRESS`
- Awaiting verification → leave as `REVIEW`
- Blocked → set to `BLOCKED` with note

---

## Step 8 — Commit .ai/ State Files

**Project code commit:** already done at ACCEPTED verdict (if any).

**Workspace state commit:**

```bash
git add .ai/reports/YYYY-MM-DD.md
git add .ai/BACKLOG.md
git add .ai/ACTIVE-TASK.md
git add .ai/AGENT-STATE.md
git commit -m "workspace | chore: daily report YYYY-MM-DD"
git push origin main
```

Only `.ai/` files. No project code.

---

## Step 9 — Identify Human Input Needed

Before ending:

- List any decisions that require human input
- List any tasks that are blocked by human action
- Include these in the `Human Input Required` section of the daily report

---

## What NOT to Do

- Do NOT commit project code in this workflow
- Do NOT mark a task DONE without prior Manager Verification + ACCEPTED
- Do NOT generate the report if you have not completed Manager Verification
  for any task in REVIEW status — do verification first, then report
- Do NOT modify `.ai/PLAN.md` with new priorities
