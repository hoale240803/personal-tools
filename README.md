# personal-tools — AI Operating System

> **Status:** Phase 1 Active | **Manager:** Antigravity | **Engineer:** Cline | **Owner:** Human

A monorepo of personal software projects, operated as an **AI-managed engineering workspace**.

---

## What This Is

`personal-tools` is not just a collection of tools — it is an **AI Operating System** where two AI agents collaborate as a software engineering team:

| Role | Agent | Responsibilities |
|------|-------|-----------------|
| **Engineering Manager** | Antigravity | Reads plans, selects tasks, writes ACTIVE-TASK, verifies work, closes tasks, generates daily reports |
| **Software Engineer** | Cline | Discovers projects, implements code, runs tests, self-reviews, updates state, commits on ACCEPTED |
| **Product Owner** | Human | Sets priorities, approves major decisions, fills PLAN.md, unblocks blockers |

The foundation is a shared `.ai/` state directory that both agents read and write, with a **one-active-task-at-a-time** discipline in Phase 1.

---

## Workspace Structure

```
personal-tools/
│
├── .agents/rules/workspace.md     ← Antigravity Manager behavior rules
│
├── .ai/                           ← Shared AI state (read/write by both agents)
│   ├── PLAN.md                    ← Product direction (Human-owned)
│   ├── BACKLOG.md                 ← Engineering queue (Manager-maintained)
│   ├── ACTIVE-TASK.md             ← Current assignment contract
│   ├── AGENT-STATE.md             ← Execution state (Engineer updates)
│   ├── DECISIONS.md               ← Architecture Decision Records
│   └── reports/YYYY-MM-DD.md     ← Daily history (one file per day)
│
├── .cline/
│   ├── workflows/                 ← Workflow prompts (morning / progress / end-of-day)
│   └── skills/                   ← Cline execution skills
│
├── agent-rules/                   ← Engineering standards (source of truth)
│   ├── agent-rules.md             ← 7 coding rules (full)
│   ├── agent-rules-minify.md      ← Condensed version
│   ├── rules-vie.md               ← Vietnamese version
│   └── global-rules.md            ← Workspace-level non-coding rules
│
└── idea/                          ← Software projects
    ├── expense-management-app/    ← P0 ACTIVE — Expense tracker (Gmail → Sheets)
    ├── find-job-tool/             ← P1 — Job scraper (Craigslist)
    └── [15+ other projects]       ← P2+ — Inactive, pending prioritization
```

---

## Source-of-Truth Hierarchy

```
LEVEL 1  .ai/PLAN.md          → WHY we build / WHAT success looks like   [Human]
LEVEL 2  .ai/BACKLOG.md       → WHAT needs to be done, in what order     [Antigravity]
LEVEL 3  .ai/ACTIVE-TASK.md   → WHO is doing WHAT right now              [Antigravity ✍ / Cline 📝]
LEVEL 4  .ai/AGENT-STATE.md   → WHERE we are in the current task         [Cline]
LEVEL 5  agent-rules/         → HOW we work                              [Human — rarely changes]
LEVEL 6  .ai/reports/         → WHAT happened (daily history)            [Cline generates / Antigravity reviews]
LEVEL 7  idea/<project>/      → THE ACTUAL CODE                          [Cline]
```

---

## Task Lifecycle

```
BACKLOG → READY → IN_PROGRESS → REVIEW → DONE
                      ↓                    ↑
                   BLOCKED ──(resolved)────┘
```

> ⚠️ **Only Antigravity may mark a task `DONE`.**
> Cline implements and may commit (when ACCEPTED), but never closes tasks or generates reports.

---

## Active Projects

| Project | Priority | Status | Description |
|---------|----------|--------|-------------|
| `expense-management-app` | **P0** | 🟢 ACTIVE | Personal expense tracker from Gmail purchase emails. Backend (Vercel + Google OAuth + Sheets + Gemini) complete locally. Pending production deployment. |
| `find-job-tool` | P1 | 🟡 BACKLOG | Craigslist job scraper with Telegram notifications. Spec complete, no implementation yet. |
| `trading-tool` | P2 | 🔵 Monitoring | Has active GitHub Action (`alert.yml`) for trading signals. No AI task assigned. |

---

## Engineering Standards

All code in this repository follows the 7 rules in [`agent-rules/agent-rules.md`](agent-rules/agent-rules.md):

1. No hardcoded credentials — all secrets via environment variables
2. All functions documented with JSDoc / TSDoc
3. Linear, readable code structure — no deeply nested callbacks
4. Service files separated from route handlers
5. No magic numbers or strings — use named constants
6. Single responsibility per function/module
7. Reuse over duplication — check existing utilities first

---

## Human Quick Reference

| I want to… | Where to look |
|-----------|---------------|
| Set sprint goals / priorities | `.ai/PLAN.md` ← **you fill this** |
| See what's being worked on | `.ai/ACTIVE-TASK.md` |
| Check what happened today | `.ai/reports/YYYY-MM-DD.md` |
| Review engineering queue | `.ai/BACKLOG.md` |
| Understand a past decision | `.ai/DECISIONS.md` |
| Trigger morning workflow | Ask Antigravity: *"Run morning workflow"* |
| Trigger end-of-day report | Ask Antigravity: *"Run end-of-day workflow"* |

---

*This workspace is managed by the AI Operating System described in `.ai/` and `.agents/`. Do not manually edit `.ai/` files unless you understand the agent lifecycle.*
