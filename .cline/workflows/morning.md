# Morning Workflow

> **Trigger:** Antigravity Scheduled Task at 08:00, or manual invocation
> **Agent:** Antigravity (reads state) + Cline (begins execution)
> **Purpose:** Start the working day, resume or assign a task, begin implementation

---

## Antigravity: Morning Orchestration

Execute these steps in order:

### 1. Read Product Direction

```
Read: .ai/PLAN.md
```

Understand the current sprint goal and active project priorities.
If `PLAN.md` is empty or missing content, STOP and notify Human.
Do not invent priorities.

### 2. Read Engineering Queue

```
Read: .ai/BACKLOG.md
```

Identify all tasks with status `READY`, sorted by Epic priority.

### 3. Read Yesterday's Report

```
Read: .ai/reports/<yesterday's date>.md
```

If no report exists for yesterday, check `AGENT-STATE.md` for last
known state. Understand what was completed, what remains, any blockers.

### 4. Read Current Task State

```
Read: .ai/ACTIVE-TASK.md
```

**Decision tree:**

```
Status = IN_PROGRESS
  → Check AGENT-STATE.md for Cline's last action
  → Is Cline making progress? Resume.
  → Is Cline stuck/blocked? Read Blockers section.
    → Can you resolve the blocker? Resolve and resume.
    → Cannot resolve? Escalate to Human.

Status = BLOCKED
  → Read Blockers section of ACTIVE-TASK.md
  → Escalate to Human with specific question

Status = REVIEW
  → Perform Manager Verification (see .agents/rules/workspace.md)
  → Issue verdict: ACCEPTED / NEEDS_MORE_WORK / REJECTED

Status = DONE or empty
  → Proceed to select next task (Step 5)

Status = CANCELLED
  → Proceed to select next task (Step 5)
```

### 5. Select Next Task (if needed)

From `BACKLOG.md`, select the highest-priority `READY` task, considering:
- Epic priority (P0 before P1 before P2)
- Dependencies: are all `Depends on:` tasks DONE?
- Does this task require human credentials or setup? → Check with Human first.

### 6. Write ACTIVE-TASK.md

Create a complete assignment contract. See `ACTIVE-TASK.md` schema in
the Architecture Plan V2.2. Every field must be filled.

Update `BACKLOG.md`: set selected task status to `IN_PROGRESS`.

### 7. Signal Cline

Prompt Cline with:

> "Read `.ai/ACTIVE-TASK.md` and begin the task-execution skill."

---

## Cline: Morning Execution Start

When signaled by Antigravity:

1. Read `.ai/ACTIVE-TASK.md`
2. Run `project-discovery` skill on Target Project
3. Begin `task-execution` skill from Step 3 (Git Branch)
4. Update `.ai/AGENT-STATE.md` as you work
