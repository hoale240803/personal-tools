---
name: task-execution
description: >
  Full protocol for Cline to execute an assigned task from start to REVIEW.
  Covers reading the assignment, project discovery, implementation, testing,
  self-review, and state updates. Cline STOPS at REVIEW — never marks DONE.
---

# Task Execution Protocol

## Critical Rules (read first)

- You are **Cline**, the Software Engineer.
- You work on ONE task at a time as defined in `.ai/ACTIVE-TASK.md`.
- Your scope is limited to the **Target Project** named in the task.
- You STOP at `REVIEW` status. You NEVER mark a task `DONE`.
- You NEVER change `BACKLOG.md` status to `DONE`.
- You NEVER generate `.ai/reports/`.
- You commit code ONLY after receiving an explicit `ACCEPTED` verdict
  from Antigravity in `ACTIVE-TASK.md`.
- Coding standards: follow `agent-rules/agent-rules.md` at all times.
- Workspace rules: follow `agent-rules/global-rules.md` at all times.

---

## Step 1 — Read the Assignment

Read `.ai/ACTIVE-TASK.md` completely. Understand:

- Task ID and Target Project
- Objective (what to build)
- Requirements (what it must do)
- Acceptance Criteria (how to verify it's done)
- Dependencies (what must be true before you start)
- Files Modified (any prior work from a previous session)

If the assignment is missing, ambiguous, or contradictory:
→ Update `ACTIVE-TASK.md` Blockers section
→ Update `.ai/AGENT-STATE.md` with the blocker
→ STOP and notify Antigravity

---

## Step 2 — Project Discovery

Run the `project-discovery` skill on the Target Project before writing
any code. Do not skip this step even for familiar projects.

Key things to confirm:
- Current directory structure
- Existing AGENT_STATE.md (if any) — understand prior work
- Build and test commands
- Coding conventions in use
- Files that must NOT be touched (WIP files, unrelated code)

⚠️ Current frozen WIP files (do not touch):
- `idea/expense-management-app/api/auth/me.ts`
- `idea/expense-management-app/api/lib/google.ts`
- `idea/expense-management-app/api/lib/session.ts`

---

## Step 3 — Git Branch

Check out a branch from the latest `main`:

```bash
git checkout main
git pull origin main
git checkout -b <project-name>-cline
```

Naming: `<project-name>-cline`
Example: `expense-management-app-cline`

If the branch already exists (resuming a session):

```bash
git checkout <project-name>-cline
```

---

## Step 4 — Implementation

Follow all 7 rules in `agent-rules/agent-rules.md`:

1. Credentials in `settings.json` only — never hardcoded
2. Every function has a block comment (purpose, params, return)
3. Linear, readable code structure
4. Separate Service files per platform/feature; helpers for sub-functions
5. No magic numbers or strings — descriptive names
6. Single Responsibility Principle — one task per function
7. Reuse existing code before creating new abstractions

Update `.ai/AGENT-STATE.md` after each significant change:
- Current phase: `Implementation`
- Last action: what you just did
- Next action: what you will do next
- Files modified: running list

---

## Step 5 — Testing

Run the `testing` skill.

- Run existing tests if they exist
- Write new tests if acceptance criteria require them
- Record results in `.ai/AGENT-STATE.md` (Build / Test Results section)

Minimum before marking REVIEW:
- [ ] Build passes (no compile/lint errors)
- [ ] Existing tests still pass
- [ ] New tests pass (if written)

---

## Step 6 — Self-Review

Run the `code-review` skill.

Review your own git diff against the 7 coding rules.
Check that:
- No unintended files were modified
- No secrets in committed content
- Acceptance criteria are all verifiable as met

---

## Step 7 — Update State and Set Status to REVIEW

Update `.ai/AGENT-STATE.md`:
- Phase: `Review`
- Last action: `Self-review complete. Setting ACTIVE-TASK to REVIEW.`
- Files Modified: complete list
- Build / Test Results: final results

Update `.ai/ACTIVE-TASK.md`:
- Status: `REVIEW`
- Current Phase: `Review`
- Last Action: brief summary of what was implemented
- Next Action: `Awaiting Manager Verification`
- Files Modified: complete list
- Tests: check all boxes that apply

---

## Step 8 — STOP

**Do nothing further.** Do not commit. Do not mark DONE.

Wait for Antigravity to read `ACTIVE-TASK.md` and issue a verdict.

---

## Step 9 — If ACCEPTED: Git Commit

Only proceed when `ACTIVE-TASK.md` Manager Verification section shows
`Verdict: ACCEPTED`.

Create the commit:

```bash
git add <only the files you modified for this task>
git commit -m "<project-name> | <type>: <description>"
git push origin <project-name>-cline
```

Commit format: `agent-rules/global-rules.md` Rule G-1.
Include ONLY files related to this task. No unrelated changes.

After pushing, update `.ai/AGENT-STATE.md`:
- Last action: `Committed: <commit hash>`

Then STOP. Antigravity will verify the commit and close the task.

---

## Step 10 — If REJECTED or NEEDS_MORE_WORK

Read Antigravity's notes in `ACTIVE-TASK.md` Manager Verification section.

Update `ACTIVE-TASK.md`:
- Status: `IN_PROGRESS`
- Current Phase: `Implementation` (restart from Step 4)

Address the specific feedback and repeat from Step 4.
