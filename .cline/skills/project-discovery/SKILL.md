---
name: project-discovery
description: >
  Protocol for Cline to inspect and understand a target project before
  writing any code. Always run this skill when starting work on a project
  or resuming after a context gap.
---

# Project Discovery Protocol

Run this skill **before writing any implementation code** on a new or
resumed task. Do not skip steps.

---

## Step 1 — Confirm Target Project

Read `.ai/ACTIVE-TASK.md` → confirm the `Project` field.

Only work in the named project directory: `idea/<project-name>/`

---

## Step 2 — Read Project Documentation

In order:

1. `idea/<project>/README.md` — overview, setup, usage
2. `idea/<project>/ROADMAP.md` — phases, what's done, what's next
3. `idea/<project>/AGENT_STATE.md` — prior agent work (if exists)

If none of these files exist, note it and proceed with directory inspection.

---

## Step 3 — Map Directory Structure

List the project directory. Identify:

- Top-level structure (src/, api/, web/, scripts/, etc.)
- Language(s) in use (TypeScript, JavaScript, Python, etc.)
- Configuration files (package.json, tsconfig.json, requirements.txt, etc.)
- Test directories and test runner config
- Any `.env.example` files (understand required env vars)
- Any `settings.json` (understand credentials schema)

---

## Step 4 — Identify Build and Test Commands

Check `package.json` scripts (or equivalent):

```bash
cat idea/<project>/package.json
```

Note the commands for:
- `dev` / local development
- `build` / compile
- `test` / run tests
- `lint` / code quality

If a build/test command exists, run it to establish baseline:

```bash
cd idea/<project>
npm run build   # or equivalent
npm test        # or equivalent
```

Record results in `.ai/AGENT-STATE.md` (Build / Test Results section).

---

## Step 5 — Read Existing Implementation

For files relevant to the assigned task:

- Read the service files that will be modified
- Read related helper files
- Understand current patterns (naming, structure, imports)
- Identify code that can be reused (agent-rules Rule 7)

---

## Step 6 — Identify Files to NOT Touch

Before coding, explicitly list:

1. Files outside `idea/<project>/` — never touch
2. Files explicitly frozen as WIP (check `.ai/ACTIVE-TASK.md` context)
3. Files unrelated to the assigned task even within the project

Current globally frozen files:
- `idea/expense-management-app/api/auth/me.ts`
- `idea/expense-management-app/api/lib/google.ts`
- `idea/expense-management-app/api/lib/session.ts`

---

## Step 7 — Report Findings

Update `.ai/AGENT-STATE.md` with discovery summary:

```
Phase: Discovery
Last action: Completed project discovery on idea/<project>
Next action: Begin implementation of <task description>
Files to modify: [list based on task]
Build baseline: PASS/FAIL
Tests baseline: N passed, N failed
Blockers: (none or describe)
```

Then proceed to Step 4 (Implementation) of the task-execution skill.
