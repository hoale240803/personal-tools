# Progress Check Workflow

> **Trigger:** On-demand or scheduled mid-day check
> **Agent:** Antigravity
> **Purpose:** Lightweight status inspection — NOT a restart or re-execution

---

## When to Run

- Scheduled mid-day (e.g., 13:00)
- Before making a decision about the task
- When you haven't heard from Cline in an unexpectedly long time
- Any time you need a current snapshot without interrupting work

---

## Step 1 — Read Current Task State

```
Read: .ai/ACTIVE-TASK.md
  → Current Status
  → Current Phase
  → Last Action
  → Next Action
  → Blockers
```

```
Read: .ai/AGENT-STATE.md
  → Last action timestamp
  → Files modified so far
  → Build/test results (if any)
  → Blockers
```

---

## Step 2 — Inspect Git State

In the Target Project directory:

```bash
cd idea/<project>
git status
git log --oneline -5
git diff --stat main...<project>-cline
```

Questions to answer:
- Are there commits on the working branch?
- How many files have been changed?
- Does the diff look appropriate for the task scope?

---

## Step 3 — Evaluate

**Is scope expanding unexpectedly?**
- Diff touches many unrelated files → Flag to Human
- Changes outside Target Project → STOP, flag as scope violation

**Is the task blocked?**
- Blockers section is non-empty → Read the blocker
- Can you resolve it? → Resolve and update ACTIVE-TASK.md
- Cannot resolve? → Escalate to Human with specific question

**Is the task progressing normally?**
- Phase is advancing (Discovery → Implementation → Testing)
- No action needed — continue monitoring

**Is the task complete (Status = REVIEW)?**
- Proceed to Manager Verification immediately

---

## Step 4 — Update State (if needed)

If you resolved a blocker or changed the task state:
- Update `ACTIVE-TASK.md` with new status/notes
- Update `BACKLOG.md` if status changed (e.g., to BLOCKED)

If everything is normal: no file changes needed.

---

## What NOT to Do

- Do NOT restart Cline's implementation from scratch
- Do NOT re-assign the task to a different project
- Do NOT mark the task DONE based on progress alone
- Do NOT commit anything during a progress check
