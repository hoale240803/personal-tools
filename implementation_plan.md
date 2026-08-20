# AI Operating System — Architecture Plan V2

> **Version:** 2.1 | **Date:** 2026-08-19 | **Status:** APPROVED — READY FOR EXECUTION
> **Corrections applied:** WIP preservation · PLAN.md human-owned · commit-after-verification
> **Scope:** Planning & Architecture only. NO files have been created or modified.

---

## 1. Executive Summary

This plan transforms `personal-tools` into an **AI-managed software engineering workspace** where:

- **Antigravity** acts as Engineering Manager: reads plans, selects tasks, monitors progress, writes reports, escalates blockers
- **Cline** acts as Software Engineer: inspects projects, implements code, runs tests, updates state, commits work
- **Human** acts as Product Owner: sets priorities, approves major decisions, unblocks blockers

The foundation is a shared `.ai/` state directory that both agents read and write, with clearly separated responsibilities and a one-active-task-at-a-time discipline for Phase 1.

**Pilot project for Phase 1 validation:** `idea/expense-management-app` (already has `AGENT_STATE.md`, `ROADMAP.md`, active git work — clearly the most mature and currently active project).

---

## 2. Current Repository Assessment

### 2.1 Git State (Critical — Must Not Be Lost)

```
Branch:   main (up to date with origin/main)
Unstaged: idea/expense-management-app/api/auth/me.ts
          idea/expense-management-app/api/lib/google.ts
          idea/expense-management-app/api/lib/session.ts
Untracked: .ai/  .cline/  agent-rules/global-rules.md
           idea/best-saler/  idea/memory-app/
```

> [!CAUTION]
> There are **3 unstaged changes** in `expense-management-app`. These must be preserved.
> The new workspace infrastructure (.ai/, .cline/) is currently untracked.
> Implementation must NOT discard or overwrite these changes.

### 2.2 Project Inventory

| Project | State | Has AGENT_STATE? | Notes |
|---------|-------|-----------------|-------|
| `expense-management-app` | 🟢 **ACTIVE** | ✅ Rich (77 lines) | Most mature, has unstaged changes, 3 modified files |
| `find-job-tool` | 🟡 Documented | ✅ Empty file | Has spec (find-job-tool.md) + empty AGENT_STATE |
| `best-saler` | 🟡 New | ❌ | Untracked, minimal content |
| `memory-app` | 🟡 New | ❌ | Untracked, minimal content |
| `trading-tool` | 🟡 Has GitHub Action | ❌ | alert.yml references it |
| Others (15+) | 🔴 Inactive | ❌ | Only `idea/` directory exists |

### 2.3 Existing Infrastructure Assessment

| Path | Content Status | Quality | Decision |
|------|---------------|---------|---------|
| `.ai/ACTIVE-TASK.md` | Empty | — | Fill with schema |
| `.ai/BACKLOG.md` | Empty | — | Fill from EPIC 1 + projects |
| `.ai/DAILY-REPORTS.md` | Empty | — | **Replace** with `reports/YYYY-MM-DD.md` pattern |
| `.ai/DECISIONS.md` | Empty | — | Fill with ADR template |
| `.ai/PLAN.md` | Empty | — | Fill with current product direction |
| `.cline/cron/` (3 files) | All empty | — | Rename folder → keep concept, define as workflow prompts |
| `.cline/skills/` (5 skills) | All SKILL.md empty | — | Fill with actual content |
| `agent-rules/agent-rules.md` | ✅ Excellent (85 lines) | High | Preserve as-is |
| `agent-rules/agent-rules-minify.md` | ✅ Good | High | Preserve as-is |
| `agent-rules/rules-vie.md` | ✅ Good | High | Preserve as-is |
| `agent-rules/global-rules.md` | Empty | — | Fill with workspace-level rules |
| `.github/workflows/alert.yml` | ✅ Functional | Good | Preserve — Do NOT touch |
| `.github/workflows/quick-agent.yml` | Skeleton, missing runner | Low | Phase 2 — Do NOT touch now |
| `.github/prompts/agent-rules-minify.md` | ✅ Same as agent-rules | OK | Preserve |
| `EPIC 1 - Workflow Engine.ini` | Has content | Unclear | See §2.4 |

### 2.4 Unresolved Artifact: `EPIC 1 - Workflow Engine.ini`

This file at the repository root describes a "Workflow Engine" with Features 1.1–1.3 and tasks WF-001 to WF-014. It is **not associated with any identifiable project** under `idea/`. Possibilities:

- It is a future planned project (not yet created under `idea/`)
- It is meta-infrastructure for the AI workspace itself
- It is an orphaned planning artifact from a previous session

**Decision:** **Preserve the file exactly as-is.** Its content (WF-001 to WF-014) will be referenced in `BACKLOG.md` under a separate Epic with status UNRESOLVED pending human review. Do not rename, move, or delete.

---

## 3. Problems Found in Previous Plan (V1)

| # | Problem | Impact | Fix in V2 |
|---|---------|--------|-----------|
| 1 | Proposed single `DAILY-REPORTS.md` (append-only, grows forever) | Unbounded file size, poor retrieval | Replace with `reports/YYYY-MM-DD.md` per-day |
| 2 | Proposed creating `AGENT_STATE.md` in every `idea/` project | Creates 19+ empty state files for inactive projects | Workspace-level `AGENT-STATE.md` only; project-level only when justified |
| 3 | Proposed `scripts/agent_runner.py` and `ai-daily-sync.yml` | Phase 2/3 complexity in Phase 1 | Explicitly deferred to Phase 2 |
| 4 | Used `.cline/cron/` as "scheduler" | Markdown files are not schedulers; misleading naming | Rename concept to `workflows/` — treat as workflow prompt definitions |
| 5 | Proposed duplicating `agent-rules/` content into `.cline/skills/` | Dual source of truth for coding rules | Skills reference `agent-rules/`, never duplicate them |
| 6 | V1 did not acknowledge unstaged changes in `expense-management-app` | Risk of data loss | Explicit preservation requirement |
| 7 | V1 did not check for existing `AGENT_STATE.md` in projects | Would overwrite real data | Found real data in `expense-management-app/AGENT_STATE.md` |
| 8 | Proposed `EPIC 1 - Workflow Engine.ini` be moved/deleted | Might lose important planning data | Preserved, referenced in backlog as UNRESOLVED |
| 9 | `DONE` implicitly meant accepted | Manager verification step missing | Explicit `DONE ≠ ACCEPTED` in lifecycle |
| 10 | Did not check git branch topology | Unaware of diverged branches | Found 2 branches (main + unnamed); documented |

---

## 4. Final Architecture

```
personal-tools/                     ← Monorepo root
│
├── .agents/                        ← [NEW] Antigravity customization root
│   └── rules/
│       └── workspace.md            ← [NEW] Antigravity Manager behavior for this workspace
│
├── .ai/                            ← Shared AI state (read/write by both agents)
│   ├── PLAN.md                     ← [FILL] Product direction (Human-owned, agents read)
│   ├── BACKLOG.md                  ← [FILL] Engineering queue (Manager-maintained)
│   ├── ACTIVE-TASK.md              ← [FILL] Current assignment handoff contract
│   ├── AGENT-STATE.md              ← [NEW] Workspace execution state (Engineer updates)
│   ├── DECISIONS.md                ← [FILL] Architecture Decision Records
│   └── reports/                   ← [NEW dir] Daily history
│       └── YYYY-MM-DD.md           ← [TEMPLATE] Per-day report (Engineer generates)
│
├── .cline/
│   ├── workflows/                  ← [RENAME from cron/] Workflow prompt definitions
│   │   ├── morning.md              ← [FILL] Morning workflow prompt for Cline
│   │   ├── progress-check.md       ← [FILL] Mid-day check prompt
│   │   └── end-of-day.md           ← [FILL] End-of-day report generation prompt
│   └── skills/
│       ├── project-discovery/SKILL.md  ← [FILL] How to inspect a new project
│       ├── task-execution/SKILL.md     ← [FILL] Full task execution protocol
│       ├── code-review/SKILL.md        ← [FILL] Self-review checklist (references agent-rules)
│       ├── daily-report/SKILL.md       ← [FILL] How to generate daily reports
│       └── testing/SKILL.md            ← [FILL] Test strategy and execution
│
├── agent-rules/                    ← [PRESERVE ALL] Engineering standards source of truth
│   ├── agent-rules.md              ← [PRESERVE] 7 coding rules (full)
│   ├── agent-rules-minify.md       ← [PRESERVE] Condensed version
│   ├── rules-vie.md                ← [PRESERVE] Vietnamese version
│   └── global-rules.md             ← [FILL] Workspace-level non-coding rules
│
├── .github/
│   ├── prompts/
│   │   └── agent-rules-minify.md   ← [PRESERVE]
│   └── workflows/
│       ├── alert.yml               ← [PRESERVE] Trading alert — do not touch
│       └── quick-agent.yml         ← [PRESERVE] Phase 2 — do not touch now
│
├── idea/
│   ├── expense-management-app/     ← PILOT PROJECT
│   │   ├── AGENT_STATE.md          ← [PRESERVE] Already has real content
│   │   ├── ROADMAP.md              ← [PRESERVE] Excellent project roadmap
│   │   └── ...                     ← [PRESERVE ALL] No source code changes
│   ├── find-job-tool/
│   │   ├── AGENT_STATE.md          ← [PRESERVE] Currently empty — future use
│   │   └── ...
│   └── [all others]                ← [PRESERVE] No project-level AGENT_STATE added yet
│
├── EPIC 1 - Workflow Engine.ini    ← [PRESERVE] Unresolved artifact — human review needed
├── README.md                       ← [PRESERVE] Will update in Phase 1 to describe AI OS
└── .gitignore                      ← [PRESERVE] Already good
```

---

## 5. Responsibility Matrix

| Responsibility | Human | Antigravity (Manager) | Cline (Engineer) |
|----------------|-------|----------------------|-----------------|
| Set product goals | ✅ Primary | Read only | No access |
| Define sprint priorities | ✅ Approve | ✅ Propose | No access |
| Maintain `PLAN.md` | ✅ Primary owner | Read | Read |
| Maintain `BACKLOG.md` | Review | ✅ Primary owner | Read |
| Write `ACTIVE-TASK.md` | — | ✅ Owner | Read + update status |
| Write `AGENT-STATE.md` | — | Read | ✅ Owner |
| Generate daily reports | — | Review | ✅ Generate |
| Write `DECISIONS.md` | ✅ Approve major | ✅ Record | Propose |
| Implement code | ✅ Scope only | — | ✅ Owner |
| Write tests | — | — | ✅ Owner |
| Run build/lint/test | — | — | ✅ Owner |
| Git commit | — | — | ✅ Owner |
| Review code | — | ✅ Manager verification | Self-review |
| Approve `DONE → ACCEPTED` | — | ✅ Owner | — |
| Approve destructive ops | ✅ Required | Escalate | Never do alone |
| Approve scope changes | ✅ Required | Escalate | Never do alone |

---

## 6. Source-of-Truth Hierarchy

```
LEVEL 1 — PRODUCT DIRECTION
  .ai/PLAN.md
  Owner: Human | Agents: read-only
  "WHY we are building, WHAT success looks like"

LEVEL 2 — ENGINEERING QUEUE
  .ai/BACKLOG.md
  Owner: Antigravity | Human: approves priority
  "WHAT needs to be done, in what order"

LEVEL 3 — CURRENT ASSIGNMENT
  .ai/ACTIVE-TASK.md
  Owner: Antigravity (write) + Cline (status updates)
  "WHO is doing WHAT right now"

LEVEL 4 — EXECUTION STATE
  .ai/AGENT-STATE.md
  Owner: Cline
  "WHERE we are in the current task, last action, next action"

LEVEL 5 — STANDARDS
  agent-rules/ (coding standards)
  .agents/rules/ (Antigravity workspace behavior)
  .cline/skills/ (Cline execution knowledge)
  Owner: Human (set once, rarely changes)
  "HOW we work"

LEVEL 6 — HISTORY
  .ai/reports/YYYY-MM-DD.md
  Owner: Cline (generate) + Antigravity (review)
  "WHAT happened"

LEVEL 7 — PROJECT REALITY
  idea/<project>/
  Owner: Cline
  "THE ACTUAL CODE"
```

> [!IMPORTANT]
> Rules in `agent-rules/` are the SINGLE source for coding standards.
> `.cline/skills/` must REFERENCE them, never duplicate them.
> `.agents/rules/workspace.md` covers Antigravity orchestration behavior only.

---

## 7. `.ai/` Structure

### 7.1 `PLAN.md` — Product Direction

Human-maintained. Short, readable. Contains:
- Current sprint goal (1-2 sentences)
- Active projects and their business goal
- Success criteria for each
- Priority ranking
- Constraints and non-goals

Agents read this to understand context. Antigravity must NOT silently modify business priorities.

### 7.2 `BACKLOG.md` — Engineering Queue

Format:

```markdown
# BACKLOG

## [EPIC-ID] Epic Name
Project: idea/<project>
Priority: P0 | P1 | P2
Status: ACTIVE | PAUSED | UNRESOLVED

### [STORY-ID] Story Name
- [TASK-ID] Task description | Status: BACKLOG|READY|IN_PROGRESS|BLOCKED|REVIEW|DONE|CANCELLED
  - Acceptance: criterion 1, criterion 2
  - Depends on: TASK-ID (if any)
```

**Lifecycle states:**
```
BACKLOG → READY → IN_PROGRESS → REVIEW → DONE
                      ↓                    ↑
                   BLOCKED ─── (resolved) ─┘
                      ↓
                   CANCELLED
```

`DONE` = Manager verified. `IN_PROGRESS` alone does NOT mean done.

### 7.3 `ACTIVE-TASK.md` — Assignment Contract

Machine-readable + human-readable handoff. See §13 for full schema.

### 7.4 `AGENT-STATE.md` — Workspace Execution State

Cline updates this continuously. Contains:
- Current project
- Current branch
- Last action taken
- Next action planned
- Files modified in this session
- Blockers (if any)
- Tests run and results
- Timestamp

This is the crash-recovery state. Another agent can resume from it.

### 7.5 `DECISIONS.md` — Architecture Decisions (ADR)

Append-only. Format:

```markdown
## ADR-001 — Decision Title
Date: YYYY-MM-DD | Status: ACCEPTED | Author: Antigravity|Cline|Human

### Context
Why this decision was needed.

### Decision
What was decided.

### Consequences
Trade-offs and implications.
```

### 7.6 `reports/YYYY-MM-DD.md` — Daily Reports

One file per day. Never overwrite past days. See §16 for content schema.

---

## 8. `.agents/rules/` Structure

### `.agents/rules/workspace.md`

This file defines Antigravity's role. It must NOT contain coding standards (those are in `agent-rules/`).

Content outline:

```markdown
# Antigravity: Engineering Manager — personal-tools Workspace

## Role
Engineering Manager / Orchestrator for all projects under personal-tools.

## Workspace Scope
- Monorepo at d:/Workspace/personal-tools
- Software projects live under idea/
- Shared AI state lives in .ai/

## Primary Responsibilities
1. Read .ai/PLAN.md to understand current product direction
2. Read .ai/BACKLOG.md to identify next READY task
3. Write .ai/ACTIVE-TASK.md with full assignment contract
4. Monitor execution via .ai/AGENT-STATE.md
5. Verify task completion before marking DONE
6. Generate or review .ai/reports/YYYY-MM-DD.md
7. Escalate blockers to Human

## Project Isolation Rules
- Always identify Target Project before any action
- Never modify unrelated projects
- Never perform cross-project refactors

## Human Approval Required For
[See §18]

## Task Lifecycle
[See §12]

## Engineering Standards
- Coding rules: see agent-rules/agent-rules.md
- Do not duplicate coding rules here
```

---

## 9. `.cline/skills/` Structure

Each skill defines HOW Cline performs a specific type of work.

### Critical Rule
Skills REFERENCE `agent-rules/agent-rules.md`. They do NOT copy or paraphrase coding rules.

### 9.1 `task-execution/SKILL.md`
The primary skill. Defines the full task lifecycle from task receipt to completion. References `agent-rules.md` for coding standards.

### 9.2 `project-discovery/SKILL.md`
How to inspect a new project before touching it:
1. Read project README
2. Read ROADMAP.md or equivalent
3. Read AGENT_STATE.md (if exists)
4. Map directory structure
5. Identify build/test commands
6. Report findings before coding

### 9.3 `code-review/SKILL.md`
Self-review checklist keyed to the 7 rules in `agent-rules.md`:
- Rule 1: No hardcoded credentials
- Rule 2: All functions documented
- Rule 3: Linear code structure
- Rule 4: Service files separated
- Rule 5: No magic numbers/strings
- Rule 6: Single responsibility
- Rule 7: Code reuse verified
- Plus: git diff review, test coverage check

### 9.4 `testing/SKILL.md`
- How to run existing tests in a project
- How to write new tests
- What test output to report in AGENT-STATE.md

### 9.5 `daily-report/SKILL.md`
- Format for `.ai/reports/YYYY-MM-DD.md`
- What git commands to run (log, diff --stat)
- How to summarize task state

---

## 10. `agent-rules/` Integration

The existing `agent-rules/` directory is the **engineering standards source of truth**.

| File | Status | Integration |
|------|--------|-------------|
| `agent-rules.md` | ✅ Preserve exactly | Referenced by `.cline/skills/task-execution/` and `code-review/` |
| `agent-rules-minify.md` | ✅ Preserve exactly | Referenced by `.github/prompts/` (already) |
| `rules-vie.md` | ✅ Preserve exactly | Vietnamese version for human reference |
| `global-rules.md` | Empty → Fill | Workspace-level non-coding rules (commit conventions, secrets, etc.) |

### `global-rules.md` Content Outline
```markdown
# Global Workspace Rules

1. Commit format: <project-name> | <type>: message
2. Secrets: never in .ai/, reports/, skills/, prompts, or commits
3. .ai/ files are shared memory — always update after session
4. One active task at a time (Phase 1)
5. Do not modify projects outside current task scope
6. AGENT-STATE.md must be updated before ending any session
```

---

## 11. Project Isolation Strategy

```
Rule: Target Project must be explicitly named in ACTIVE-TASK.md
      before Cline begins any implementation work.

Rule: Cline reads ACTIVE-TASK.md → identifies Target Project →
      runs project-discovery skill → begins work.

Rule: Never touch idea/<other-project> while working on assigned project.

Rule: No shared infrastructure between projects without explicit
      ADR in DECISIONS.md and human approval.

Rule: Global dependency upgrades require human approval.
```

**Active project state files (Phase 1):**
- `idea/expense-management-app/AGENT_STATE.md` — EXISTS and has content. Preserve.
- `idea/find-job-tool/AGENT_STATE.md` — EXISTS but empty. Usable as-is.
- All other projects — NO project-level state file created in Phase 1.

---

## 12. Task Lifecycle

### CLINE Responsibilities (stops at REVIEW)

```
CLINE:

  1. Read ACTIVE-TASK.md
  2. Run project-discovery skill
  3. Implement code
  4. Write / run tests
  5. Self-review (code-review skill)
  6. Update AGENT-STATE.md
  7. Update ACTIVE-TASK.md → Status: REVIEW
  8. STOP — wait for Manager Verification

  ⚠️ Cline may NEVER mark a task DONE.
  ⚠️ Cline may NEVER independently transition BACKLOG status.
```

### ANTIGRAVITY Responsibilities (authoritative task-closing authority)

```
ANTIGRAVITY (upon seeing ACTIVE-TASK = REVIEW):

  1. Read ACTIVE-TASK.md
  2. Inspect git diff on <project>-cline branch
  3. Verify all acceptance criteria
  4. Verify test / build results
  5. Verify scope (no unrelated changes)
  6. Issue verdict:

     ┌───────────────────┬──────────────────┬──────────────┐
     │    ACCEPTED       │ NEEDS_MORE_WORK  │   REJECTED      │
     └───────────────────┼──────────────────┼──────────────┘
              │                       │                  │
              ▼                       └───────────────▼
    Authorize Cline to commit          Cline fixes / resumes
              │                       (task returns to IN_PROGRESS)
              ▼
    Cline creates Git commit
    (project code on <project>-cline)
              │
              ▼
    ANTIGRAVITY verifies commit exists
    and contains ONLY expected changes
              │
              ▼
    ANTIGRAVITY → BACKLOG.md: DONE
    ANTIGRAVITY → ACTIVE-TASK.md: DONE
    ANTIGRAVITY generates .ai/reports/YYYY-MM-DD.md
    ANTIGRAVITY commits .ai/ state files
```

> [!IMPORTANT]
> **Antigravity is the sole, authoritative task-closing authority.**
> Cline implements and commits code (when authorized), but:
> - Cline may NEVER change BACKLOG status to DONE
> - Cline may NEVER change ACTIVE-TASK status to DONE
> - Cline may NEVER generate or update the daily report
> - All task-closing actions belong exclusively to Antigravity

---

## 13. ACTIVE-TASK Handshake Protocol

Full schema for `ACTIVE-TASK.md`:

```markdown
# ACTIVE TASK

## Assignment
- **Task ID:** [EPIC-ID]-[TASK-ID]
- **Project:** idea/<project-name>
- **Assigned To:** Cline
- **Assigned By:** Antigravity
- **Assigned At:** YYYY-MM-DD HH:MM
- **Status:** READY | IN_PROGRESS | REVIEW | BLOCKED | DONE | CANCELLED

## Objective
One-paragraph description of what this task achieves.

## Requirements
- Requirement 1
- Requirement 2

## Acceptance Criteria
- [ ] Criterion 1 (must be verifiable)
- [ ] Criterion 2

## Dependencies
- Depends on: [TASK-ID] (if any)
- Requires human input: Yes/No + what

## Execution State
- **Started At:** YYYY-MM-DD HH:MM
- **Current Phase:** Discovery | Implementation | Testing | Review
- **Last Action:** What Cline last did
- **Next Action:** What Cline will do next
- **Git Branch:** <project>-cline (or main for workspace files)

## Files Modified
- path/to/file.ts — what changed

## Tests
- [ ] Unit tests written
- [ ] Build passes
- [ ] Lint passes
- [ ] Manual verification

## Blockers
- None | Description of blocker + what is needed to unblock

## Manager Verification
- **Reviewed At:** YYYY-MM-DD HH:MM
- **Verdict:** ACCEPTED | REJECTED | NEEDS_MORE_WORK
- **Notes:** Manager comments
```

---

## 14. Morning Workflow

**Trigger:** Antigravity Scheduled Task at 08:00 (or manual invocation)

```
1. Read .ai/PLAN.md
   → Understand current sprint goal and priorities

2. Read .ai/BACKLOG.md
   → Identify tasks with Status: READY, sorted by priority

3. Read .ai/reports/<yesterday>.md
   → Understand what was completed, what remains, any blockers

4. Read .ai/ACTIVE-TASK.md
   → Is there an in-progress task?
   IF YES and Status=IN_PROGRESS → resume or check if blocked
   IF YES and Status=BLOCKED → escalate to Human
   IF YES and Status=REVIEW → perform Manager Verification
   IF empty or Status=DONE → proceed to select next task

5. Select next READY task from BACKLOG.md
   → Validate dependencies are met
   → Check: does target project need human credentials/setup?

6. Write ACTIVE-TASK.md with full assignment contract

7. Update BACKLOG.md: selected task → IN_PROGRESS

8. Invoke Cline (or prompt: "Read .ai/ACTIVE-TASK.md and begin")

9. Cline: run project-discovery skill on target project
   → Read project README, ROADMAP, AGENT_STATE (if any)
   → Run build/test to confirm baseline

10. Cline: begin implementation following task-execution skill
    → Follow agent-rules.md throughout
```

**Workflow prompt location:** `.cline/workflows/morning.md`

---

## 15. Progress Check Workflow

**Trigger:** On-demand or scheduled mid-day

```
1. Read .ai/ACTIVE-TASK.md → current status
2. Read .ai/AGENT-STATE.md → last action, next action
3. Run: git diff --stat (inside target project)
4. Check test results (from AGENT-STATE.md)
5. Evaluate:
   - Is scope expanding unexpectedly? → Flag to Human
   - Is task blocked? → Update ACTIVE-TASK.md Status: BLOCKED
   - Is task progressing normally? → No action needed
   - Is task complete? → Proceed to Manager Verification
6. Update AGENT-STATE.md with current timestamp
```

**NOT a restart mechanism.** Does not re-run implementation.

**Workflow prompt location:** `.cline/workflows/progress-check.md`

---

## 16. End-of-Day Workflow

**Trigger:** Antigravity Scheduled Task at ~18:00 or end of session

```
1. Read .ai/ACTIVE-TASK.md → current status

2. Run git inspection (inside target project):
   git log --oneline --since="00:00" (today's commits)
   git diff --stat HEAD~N (changes)

3. Check build/test status from AGENT-STATE.md

4. Collect:
   - Completed tasks today
   - Tasks still in progress
   - Blocked tasks
   - Files changed
   - Tests passing/failing
   - Decisions made
   - Risks identified

5. Generate .ai/reports/YYYY-MM-DD.md with schema:

---
# Daily Report — YYYY-MM-DD

## Summary
One paragraph.

## Completed Tasks
- [TASK-ID] description

## In Progress
- [TASK-ID] description | phase

## Blocked
- [TASK-ID] description | blocker | needs: what

## Test Results
- build: PASS|FAIL
- tests: N passed, N failed

## Commits
- hash — message

## Files Changed
- file — change summary

## Decisions
- [ADR-N] title

## Risks
- description

## Next Actions (recommended)
1. ...

## Human Input Required
- item (if any)
---

6. Update .ai/AGENT-STATE.md with EOD snapshot

7. Update .ai/BACKLOG.md if task status changed:
   → IN_PROGRESS tasks: leave as-is
   → Verified/ACCEPTED tasks: → DONE (commit already happened at verification)
   → Tasks awaiting verification: → REVIEW (no commit yet)

8. Commit .ai/ workspace state files ONLY (not project code)
   Project code commits happen only after Manager Verification (ACCEPTED)
   .ai/ state files may be committed at EOD regardless of task status
```

**Workflow prompt location:** `.cline/workflows/end-of-day.md`

---

## 17. Git Workflow

```
Branch strategy:
  main                    ← stable, always protected
  <project>-cline         ← Cline's working branch for each project
                             Example: expense-management-app-cline

Commit format (from global-rules.md):
  <project-name> | <type>: message
  Example: expense-management-app | feat: add rolling session refresh

Commit rules:
  - Never commit secrets
  - Commit .ai/ workspace files separately from project code
  - Never force-push to main
  - Never reset or rewrite history

Current unstaged changes (WIP — DO NOT TOUCH):
  idea/expense-management-app/api/auth/me.ts
  idea/expense-management-app/api/lib/google.ts
  idea/expense-management-app/api/lib/session.ts

  → These are existing WIP. Preserve exactly as-is.
  → DO NOT commit, stash, reset, restore, or overwrite these files.
  → DO NOT run git add, git stash, git checkout, or git restore on them.
  → The Human will handle these files independently when appropriate.
  → Phase 1 workspace setup must not touch or reference these files.

Current untracked directories:
  .ai/  .cline/  idea/best-saler/  idea/memory-app/
  agent-rules/global-rules.md

  → These will be committed as part of Phase 1 workspace setup.
  → Committing .ai/ and .cline/ is safe — they do not overlap with the WIP files.
```

---

## 18. Human Approval Boundaries

### Must Always Stop and Ask Human

| Category | Examples |
|----------|---------|
| Destructive operations | Delete files, reset history, drop database |
| Production deployment | Any deploy to live environment |
| Major architecture change | Changing stack, framework, storage layer |
| Business priority change | Reordering sprint goals in PLAN.md |
| Security-sensitive change | Credentials, OAuth config, secrets management |
| Database migration | Schema changes with data risk |
| External service creation | New accounts, APIs, cloud resources |
| Spend money | Any paid service or API |
| Ambiguous requirements | When 2+ materially different solutions exist |
| Scope expansion | Task growing beyond original definition |

### May Proceed Autonomously

| Category | Condition |
|----------|-----------|
| Implementation | Within defined task scope and acceptance criteria |
| Test writing | Within target project |
| Refactor | Within target project, within task scope |
| State file updates | `.ai/` files, AGENT_STATE.md |
| Daily report generation | Read-only analysis + write report |
| Task selection | Next READY task from backlog |
| Self-review | Code quality checks |

---

## 19. Phase 1 Scope — Local AI Engineering OS

**Goal:** Prove the Manager + Engineer + `.ai/` state workflow works end-to-end.

**Includes:**
- `.agents/rules/workspace.md` (Antigravity behavior)
- `.ai/` state files filled with real content
- `agent-rules/global-rules.md` filled
- `.cline/skills/` filled with real content
- `.cline/workflows/` (renamed from `cron/`) with workflow prompts
- One pilot task run on `idea/expense-management-app`
- Daily report generated
- Git commit of workspace files

**Explicitly excluded from Phase 1:**
- `scripts/agent_runner.py`
- `.github/workflows/ai-daily-sync.yml`
- Any GitHub Actions modification
- Project-level AGENT_STATE for inactive projects
- Parallel task execution
- Any automation outside the local Antigravity+Cline flow

---

## 20. Phase 2 Scope — Improved Automation

To be designed after Phase 1 is validated.

Candidates:
- `scripts/agent_runner.py` — Python runner for GitHub Issues
- `.github/workflows/quick-agent.yml` — fix to actually work
- Automatic PR preparation from completed tasks
- Scheduled autonomous execution (Antigravity native cron)
- Richer Manager Verification (automated test result parsing)
- Project-level AGENT_STATE for active multi-project development

---

## 21. Phase 3 Scope — Parallel Engineering

To be designed after Phase 2 is validated.

Candidates:
- Multiple Cline instances with Git worktrees
- Parallel project tasks
- Specialized QA / Review agents
- CI/CD integration
- External orchestration
- Cross-project shared utilities (with explicit ADR)

---

## 22. Files To Create

| Path | Purpose | Owner | Phase |
|------|---------|-------|-------|
| `.agents/rules/workspace.md` | Antigravity Manager behavior | Human (set) / Antigravity (reads) | P1 |
| `.ai/AGENT-STATE.md` | Workspace execution state | Cline | P1 |
| `.ai/reports/` (directory) | Daily report container | System | P1 |
| `.ai/reports/YYYY-MM-DD.md` | Template/first report | Cline | P1 |

---

## 23. Files To Modify (Fill Content)

| Path | Current State | What To Fill | Owner |
|------|--------------|-------------|-------|
| `.ai/PLAN.md` | Empty | Product direction, sprint goal, priorities | Human |
| `.ai/BACKLOG.md` | Empty | Epics from EPIC 1 .ini + expense-app + other projects | Antigravity |
| `.ai/ACTIVE-TASK.md` | Empty | Full schema (§13), initially empty pending first task | Antigravity |
| `.ai/DECISIONS.md` | Empty | ADR template + first decision (this architecture) | Antigravity |
| `agent-rules/global-rules.md` | Empty | Workspace-level non-coding rules | Human/Antigravity |
| `.cline/skills/task-execution/SKILL.md` | Empty | Full task execution protocol | Antigravity |
| `.cline/skills/project-discovery/SKILL.md` | Empty | Project inspection protocol | Antigravity |
| `.cline/skills/code-review/SKILL.md` | Empty | Self-review checklist (ref agent-rules) | Antigravity |
| `.cline/skills/testing/SKILL.md` | Empty | Test strategy and execution | Antigravity |
| `.cline/skills/daily-report/SKILL.md` | Empty | Daily report generation format | Antigravity |
| `.cline/workflows/morning.md` | Empty (was cron/) | Morning workflow prompt | Antigravity |
| `.cline/workflows/progress-check.md` | Empty (was cron/) | Progress check prompt | Antigravity |
| `.cline/workflows/end-of-day.md` | Empty (was cron/) | End-of-day prompt | Antigravity |
| `README.md` | Minimal | Describe AI OS + workspace structure | Human |

> [!NOTE]
> `.cline/cron/` files (morning-planning.md, progress-check.md, daily-report.md) will have their content moved to `.cline/workflows/` (renamed files). The empty cron files will be deleted and the folder renamed in Phase 1.

---

## 24. Files To Preserve (Do Not Touch)

| Path | Reason |
|------|--------|
| `agent-rules/agent-rules.md` | Complete, high-quality coding rules |
| `agent-rules/agent-rules-minify.md` | Already in use by `.github/prompts/` |
| `agent-rules/rules-vie.md` | Valid Vietnamese version |
| `.github/workflows/alert.yml` | Functional trading alert — active |
| `.github/workflows/quick-agent.yml` | Phase 2 — do not modify now |
| `.github/prompts/agent-rules-minify.md` | In use |
| `EPIC 1 - Workflow Engine.ini` | Unresolved artifact — human review required |
| `.gitignore` | Already well-configured |
| `idea/expense-management-app/AGENT_STATE.md` | Contains real project state |
| `idea/expense-management-app/ROADMAP.md` | Excellent project roadmap |
| `idea/expense-management-app/api/auth/me.ts` | Has unstaged changes |
| `idea/expense-management-app/api/lib/google.ts` | Has unstaged changes |
| `idea/expense-management-app/api/lib/session.ts` | Has unstaged changes |
| `idea/find-job-tool/AGENT_STATE.md` | Exists (empty) — preserve for future |
| `idea/find-job-tool/find-job-tool.md` | Job search spec — valid |
| All other `idea/<project>/` contents | No scope to modify |

---

## 25. Files NOT To Create (Explicitly Excluded from Phase 1)

| Path | Reason |
|------|--------|
| `.ai/DAILY-REPORTS.md` | Replaced by `reports/YYYY-MM-DD.md` pattern |
| `scripts/agent_runner.py` | Phase 2 |
| `.github/workflows/ai-daily-sync.yml` | Phase 2 |
| `idea/*/AGENT_STATE.md` (for inactive projects) | Only for active projects — Phase 2 |
| Any custom cron/scheduler infrastructure | Use Antigravity native scheduling |
| Any new GitHub Actions | Phase 2+ |
| Shared utility libraries across projects | Requires explicit ADR + human approval |

---

## 26. Migration Plan

### Pre-Conditions

> [!CAUTION]
> **WIP files are frozen for the duration of Phase 1.**
> The following files have unstaged changes and must remain untouched:
> - `idea/expense-management-app/api/auth/me.ts`
> - `idea/expense-management-app/api/lib/google.ts`
> - `idea/expense-management-app/api/lib/session.ts`
>
> Do NOT commit, stash, reset, or restore these files.
> The Human will handle them independently. Phase 1 proceeds with them as-is.

> [!NOTE]
> **`.ai/PLAN.md` will be created as a template only.**
> Antigravity creates the file structure/headings but leaves all product direction,
> sprint goals, and business priorities empty for the Human to fill in.
> Antigravity must NOT invent or populate any product content in PLAN.md.

### Step-by-Step Migration

**Step 1 — Antigravity Workspace Rules**
Create `.agents/rules/workspace.md`
Define Antigravity's Manager role, workspace scope, human approval boundaries.
Include the commit-after-verification rule explicitly.

**Step 2 — Create/Fill `.ai/` State Files**
2a. Create `.ai/PLAN.md` as **template only** (headings + instructions, no content)
    ⚠️ Leave all product direction empty — Human fills this separately
2b. Antigravity fills `.ai/BACKLOG.md` (from EPIC 1 .ini + project knowledge)
2c. Create `.ai/AGENT-STATE.md` (empty, ready for Cline to use)
2d. Fill `.ai/DECISIONS.md` with ADR-001 (this architecture decision)
2e. Create `.ai/reports/` directory

**Step 3 — Fill `agent-rules/global-rules.md`**
Non-coding workspace rules: commit conventions, secrets policy, one-task discipline.
Include explicitly: "Git commit happens AFTER Antigravity ACCEPTED verdict."

**Step 4 — Fill Cline Skills**
In order: task-execution → project-discovery → code-review → testing → daily-report
task-execution skill must document the commit-after-verification step explicitly.

**Step 5 — Create Workflow Prompts**
Create `.cline/workflows/` directory with 3 files:
- `morning.md` (from `.cline/cron/morning-planning.md` concept)
- `progress-check.md` (from `.cline/cron/progress-check.md` concept)
- `end-of-day.md` (from `.cline/cron/daily-report.md` concept)
Delete the old empty files under `.cline/cron/`

**Step 6 — Pilot Task**
Target: `idea/expense-management-app` (confirmed: most mature project)
DO NOT touch the 3 WIP files listed in Pre-Conditions above.
Select one specific READY task from BACKLOG.md that does NOT require modifying those files.
Run: Morning Workflow → Cline Implementation → Self-Review → ACTIVE-TASK=REVIEW
→ Antigravity Manager Verification → ACCEPTED → Git Commit → BACKLOG=DONE
→ End-of-Day report generation

**Step 7 — Validate**
Human reviews:
- Daily report quality and format
- Task state accuracy in ACTIVE-TASK.md and BACKLOG.md
- Git commit was made AFTER ACCEPTED verdict (not before)
- Cline code quality against acceptance criteria
- WIP files are untouched (verify with `git status`)

**Step 8 — Iterate or Expand**
If pilot passes: add more projects to backlog, continue rhythm
If pilot fails: diagnose, adjust skills/rules, re-run

---

## 27. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Unstaged changes lost | Medium | High | Human commits before Phase 1 starts |
| `EPIC 1 - Workflow Engine.ini` purpose lost | Low | Medium | Preserved + documented in BACKLOG as UNRESOLVED |
| Cline reads wrong AGENT_STATE (project vs workspace) | Medium | Medium | Clear naming: workspace = `AGENT-STATE.md`; project = `AGENT_STATE.md` |
| Agents duplicate rules across files | Medium | Medium | Strict rule: skills REFERENCE, never COPY |
| Task `DONE` without verification | Medium | High | Explicit Manager Verification step in lifecycle |
| `.ai/` files grow too large | Low | Low | `reports/` is bounded; BACKLOG archives DONE tasks |
| Two agents writing ACTIVE-TASK simultaneously | Low | High | One-task-at-a-time discipline in Phase 1 |
| Credentials leaking into .ai/ reports | Low | Critical | global-rules.md explicitly prohibits; human review |

---

## 28. Open Questions

> [!IMPORTANT]
> **Q1 — `EPIC 1 - Workflow Engine.ini`: What is this?**
> Is this a planned software project (should live under `idea/workflow-engine/`)?
> Or is it the AI workspace orchestration layer itself?
> **Human decision required.** Currently preserved and referenced in BACKLOG as UNRESOLVED.

> [!IMPORTANT]
> **Q2 — Pilot project: expense-management-app vs find-job-tool?**
> `expense-management-app` is clearly the most active (real AGENT_STATE, unstaged changes, ROADMAP with clear phases). The original V1 plan suggested `find-job-tool` but evidence points to expense-management-app as the better pilot.
> **Human confirmation preferred** before Step 6 begins.

> [!NOTE]
> **Q3 — Human fills PLAN.md or Antigravity proposes?**
> `.ai/PLAN.md` should be human-owned. Should Antigravity draft a proposal from existing project documentation for human review, or should the human write it from scratch?

> [!NOTE]
> **Q4 — Language for skills and workflow files?**
> `agent-rules/rules-vie.md` shows a Vietnamese preference. Should `.cline/skills/` and `.cline/workflows/` be written in English (agent-parseable) or Vietnamese? Mixed approach: English structure + Vietnamese comments?

> [!NOTE]
> **Q5 — Antigravity scheduling mechanism?**
> The morning/progress/end-of-day workflows reference Antigravity Scheduled Tasks. Has this been configured, or will the human manually trigger Antigravity each time during Phase 1?

---

## Summary Table — All Files

| Path | Action | Phase | Human Required? |
|------|--------|-------|----------------|
| `.agents/rules/workspace.md` | **CREATE** | P1 | Review |
| `.ai/PLAN.md` | **FILL** | P1 | ✅ Human writes |
| `.ai/BACKLOG.md` | **FILL** | P1 | Review |
| `.ai/ACTIVE-TASK.md` | **FILL schema** | P1 | No |
| `.ai/AGENT-STATE.md` | **CREATE** | P1 | No |
| `.ai/DECISIONS.md` | **FILL** | P1 | Review |
| `.ai/reports/` | **CREATE dir** | P1 | No |
| `agent-rules/global-rules.md` | **FILL** | P1 | Review |
| `.cline/skills/task-execution/SKILL.md` | **FILL** | P1 | No |
| `.cline/skills/project-discovery/SKILL.md` | **FILL** | P1 | No |
| `.cline/skills/code-review/SKILL.md` | **FILL** | P1 | No |
| `.cline/skills/testing/SKILL.md` | **FILL** | P1 | No |
| `.cline/skills/daily-report/SKILL.md` | **FILL** | P1 | No |
| `.cline/workflows/morning.md` | **CREATE+FILL** | P1 | No |
| `.cline/workflows/progress-check.md` | **CREATE+FILL** | P1 | No |
| `.cline/workflows/end-of-day.md` | **CREATE+FILL** | P1 | No |
| `.cline/cron/` (3 files) | **DELETE** (content moved) | P1 | No |
| `README.md` | **UPDATE** | P1 | Human reviews |
| `agent-rules/agent-rules.md` | **PRESERVE** | — | — |
| `agent-rules/agent-rules-minify.md` | **PRESERVE** | — | — |
| `agent-rules/rules-vie.md` | **PRESERVE** | — | — |
| `.github/workflows/alert.yml` | **PRESERVE** | — | — |
| `.github/workflows/quick-agent.yml` | **PRESERVE (Phase 2)** | P2 | — |
| `EPIC 1 - Workflow Engine.ini` | **PRESERVE** | — | ✅ Human review |
| `.gitignore` | **PRESERVE** | — | — |
| `idea/expense-management-app/AGENT_STATE.md` | **PRESERVE** | — | — |
| `idea/*/` all other files | **PRESERVE** | — | — |
| `scripts/agent_runner.py` | **DO NOT CREATE** | P2 | — |
| `.github/workflows/ai-daily-sync.yml` | **DO NOT CREATE** | P2 | — |
| `.ai/DAILY-REPORTS.md` | **DO NOT CREATE** | — | — |
| `idea/<inactive>/AGENT_STATE.md` (×15) | **DO NOT CREATE** | P2 | — |

---

## Implementation Sequence

**Pre-conditions:**
- WIP files in `expense-management-app` are left untouched throughout all steps
- `.ai/PLAN.md` will be created as template only; Human populates product direction separately
- Git commit on project code happens only after Antigravity issues ACCEPTED verdict
- Antigravity is the sole authority for DONE transitions and daily report generation

| Step | Action | Who | Constraint | Output |
|------|--------|-----|-----------|--------|
| 1 | Create `.agents/rules/workspace.md` | Antigravity | — | Antigravity role defined |
| 2a | Create `.ai/PLAN.md` as **template only** | Antigravity | ⚠️ Headings + instructions only; no product content | Template ready for Human |
| 2b | Fill `.ai/BACKLOG.md` | Antigravity | — | Engineering queue populated |
| 2c | Create `.ai/AGENT-STATE.md` | Antigravity | — | State file ready |
| 2d | Fill `.ai/DECISIONS.md` with ADR-001 | Antigravity | — | Architecture decision recorded |
| 2e | Create `.ai/reports/` directory | Antigravity | — | Reports dir ready |
| 3 | Fill `agent-rules/global-rules.md` | Antigravity | Include commit-after-verification + Antigravity-closes-DONE rules | Workspace rules complete |
| 4 | Fill all 5 `.cline/skills/*/SKILL.md` | Antigravity | task-execution: Cline stops at REVIEW; never marks DONE | Cline has execution knowledge |
| 5 | Create `.cline/workflows/` + 3 files; delete `.cline/cron/` empty files | Antigravity | — | Workflows defined |
| 6 | **PILOT:** Select 1 READY task; write ACTIVE-TASK.md | **Antigravity** | ⚠️ Avoid WIP files | ACTIVE-TASK.md written |
| 7 | **PILOT:** Cline — Discovery → Implement → Test → Self-Review | **Cline** | ⚠️ No commit; stop at REVIEW | ACTIVE-TASK.md → REVIEW |
| 8 | **PILOT:** Antigravity — Inspect diff, criteria, tests, scope | **Antigravity** | Issue ACCEPTED / NEEDS_MORE_WORK / REJECTED | Verdict in ACTIVE-TASK.md |
| 9 | **PILOT:** Cline — Git Commit on `<project>-cline` | **Cline** | ⚠️ Only executes if ACCEPTED verdict | Project code committed |
| 10 | **PILOT:** Antigravity — Verify commit (hash, diff, scope) | **Antigravity** | Confirms commit contains only expected changes | Commit verified |
| 11 | **PILOT:** Antigravity — BACKLOG → DONE; ACTIVE-TASK → DONE | **Antigravity** | ⚠️ Cline never does this | Task officially closed |
| 12 | **PILOT:** Antigravity — Generate `.ai/reports/YYYY-MM-DD.md` | **Antigravity** | ⚠️ Cline never does this | Daily report created |
| 13 | **PILOT:** Antigravity — Commit `.ai/` state files separately | **Antigravity** | Separate commit from project code | Workspace state in git |
| 14 | Human validates: report, git log, WIP untouched, DONE in BACKLOG | **Human** | `git status` confirms WIP intact | Go/No-go |

---

**READY FOR EXECUTION.**
