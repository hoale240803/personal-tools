# Architecture Decision Records

> **Append-only log.** Never delete or modify past ADRs.
> **Format:** Each decision gets a sequential ID: ADR-001, ADR-002, etc.
> **Authors:** Human (major), Antigravity (engineering), Cline (may propose)

---

## ADR-001 — AI Operating System Architecture for personal-tools

**Date:** 2026-08-19
**Status:** ACCEPTED
**Author:** Antigravity (reviewed and approved by Human)

### Context

The `personal-tools` repository is a monorepo containing 21+ independent
software projects under `idea/`. Previously, there was no formal protocol
for how AI agents should collaborate, hand off state, or coordinate work.
Multiple agents operated without shared memory, leading to risk of regression
and lack of continuity.

### Decision

Adopt a two-agent, one-active-task AI Operating System with the following
structure:

1. **Antigravity** acts as Engineering Manager / Orchestrator
2. **Cline** acts as Software Engineer
3. **`.ai/`** is the shared state directory (PLAN, BACKLOG, ACTIVE-TASK,
   AGENT-STATE, DECISIONS, reports/)
4. **`agent-rules/`** remains the single source of truth for coding standards
5. **`.agents/rules/workspace.md`** defines Antigravity's behavior
6. **`.cline/skills/`** defines Cline's execution protocols
7. **`.cline/workflows/`** defines scheduled/triggered workflow prompts
8. **One active task at a time** (Phase 1 constraint)
9. **Antigravity is the sole task-closing authority**
10. **Git commit on project code happens only after ACCEPTED verdict**

### Consequences

- Clear separation of responsibilities between agents
- Shared state prevents context loss across sessions
- Task cannot be marked DONE without Manager Verification
- `agent-rules/` is not duplicated — only referenced
- GitHub Actions and external orchestration deferred to Phase 2+
- `EPIC 1 - Workflow Engine.ini` preserved pending human clarification
- Unstaged WIP changes in `expense-management-app` preserved as-is

### References

- `.agents/rules/workspace.md`
- `agent-rules/agent-rules.md`
- `.ai/PLAN.md`, `.ai/BACKLOG.md`, `.ai/ACTIVE-TASK.md`
- Architecture Plan V2.2 (approved 2026-08-19)

---

_[Future ADRs appended below]_
