# Global Workspace Rules

> These are workspace-level operational rules that apply to all agents
> working in `personal-tools`.
>
> **Coding standards** (functions, architecture, credentials) are defined
> in `agent-rules/agent-rules.md`. Do not duplicate them here.

---

## Rule G-1: Commit Format

All Git commits must use this format:

```
<project-name> | <type>: <short description>
```

Examples:
```
expense-management-app | feat: add rolling session refresh
find-job-tool | fix: handle empty craigslist response
workspace | chore: update .ai/BACKLOG.md task statuses
```

Valid types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`

`.ai/` state file commits use project-name `workspace`.

---

## Rule G-2: Secrets Policy

Secrets, credentials, API keys, and tokens must NEVER appear in:

- `.ai/` files (PLAN, BACKLOG, ACTIVE-TASK, AGENT-STATE, DECISIONS, reports)
- `.cline/skills/` or `.cline/workflows/`
- `.agents/rules/`
- Git commit messages
- Log files

Credentials belong ONLY in:
- Each project's `settings.json` (never committed)
- Environment variables (`.env` files, gitignored)
- CI/CD secret stores (GitHub Secrets, Vercel env vars)

---

## Rule G-3: One Active Task at a Time (Phase 1)

Only one task may have status `IN_PROGRESS` in `BACKLOG.md` at any time.
Only one assignment may be active in `ACTIVE-TASK.md` at any time.

Before starting a new task, the current task must be either:
- Closed (`DONE`) by Antigravity, or
- Explicitly `CANCELLED` with a documented reason

---

## Rule G-4: AGENT-STATE.md Must Be Updated Before Session End

Cline must update `.ai/AGENT-STATE.md` with current execution state
before ending any work session — even if interrupted or blocked.

This ensures the next session can resume without context loss.

---

## Rule G-5: Project Isolation

Never modify files outside the currently assigned Target Project
(`idea/<project-name>`) unless explicitly instructed by the Manager.

Never perform repository-wide operations (refactors, dependency updates,
config changes) without explicit human approval.

---

## Rule G-6: Git Commit Authorization

**Project code commits** (files inside `idea/<project>/`) require:
1. Antigravity ACCEPTED verdict in `ACTIVE-TASK.md`
2. Cline creates the commit on `<project>-cline` branch
3. Antigravity verifies the commit before closing the task

**Workspace state commits** (files in `.ai/`, `.agents/`, `.cline/`,
`agent-rules/`) are performed by Antigravity, separately from project
code commits.

Cline must NEVER commit workspace state files.
Antigravity must NEVER commit project code files directly.

---

## Rule G-7: Task Closing Authority

Only Antigravity may:
- Set `BACKLOG.md` task status to `DONE`
- Set `ACTIVE-TASK.md` status to `DONE`
- Generate `.ai/reports/YYYY-MM-DD.md`

Cline must STOP at `ACTIVE-TASK.md` status = `REVIEW` and wait.

---

## Rule G-8: Do Not Invent Business Priorities

Neither Cline nor Antigravity may modify `.ai/PLAN.md` product content,
sprint goals, or business priorities. Only the Human may do this.

If business direction is unclear or missing from `PLAN.md`, STOP and
request human input. Do not invent or assume priorities.
