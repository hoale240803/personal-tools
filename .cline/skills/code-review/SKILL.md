---
name: code-review
description: >
  Self-review checklist for Cline to verify code quality before setting
  ACTIVE-TASK.md to REVIEW. Keyed directly to the 7 rules in
  agent-rules/agent-rules.md. Run this before updating task status.
---

# Self-Review Checklist

Run this skill after implementation and testing, before marking the task
as `REVIEW` in `ACTIVE-TASK.md`.

**Reference:** `agent-rules/agent-rules.md` (full rules)
**Reference:** `agent-rules/agent-rules-minify.md` (condensed)

---

## Pre-Check: Scope

```
[ ] I only modified files inside idea/<target-project>/
[ ] I did not touch any frozen WIP files
[ ] I did not modify any other project
[ ] I did not perform any repository-wide changes
```

---

## Rule 1: Credential Management

```
[ ] No credentials, secrets, tokens, or API keys are hardcoded in any file
[ ] All sensitive values reference settings.json or environment variables
[ ] No .env file with real credentials was committed
```

---

## Rule 2: Explicit Code Documentation

```
[ ] Every new function/method has a block comment that states:
    - What it does (purpose)
    - Input parameters and their types
    - Return value
[ ] Existing functions I modified still have accurate comments
```

---

## Rule 3: Linear Code Structure

```
[ ] Code flows top-to-bottom without unnecessary nesting
[ ] No deeply nested ternary operators (max 1 level)
[ ] Control flow is readable without mental unwrapping
```

---

## Rule 4: Service-Oriented Architecture & Helpers

```
[ ] New functionality is in an appropriately named Service file
    (e.g., CraigslistService.js, GmailService.ts)
[ ] Repeated sub-functions in large services are extracted to Helper files
    (e.g., CraigslistServiceHelper.js)
[ ] Service files are not bloated with unrelated logic
```

---

## Rule 5: No Magic Code

```
[ ] No magic numbers (use named constants)
[ ] No magic strings (use named constants or config values)
[ ] All variable, function, and class names are descriptive and clear
[ ] No unexplained shortcut logic
```

---

## Rule 6: Single Responsibility Principle

```
[ ] Each function performs exactly ONE task
[ ] No function does two unrelated things
[ ] Functions that grew too large have been split
```

---

## Rule 7: Code Reuse

```
[ ] I checked for existing utility functions before creating new ones
[ ] I reused existing services/helpers where applicable
[ ] I did not create a new abstraction when an existing one would work
```

---

## Git Diff Review

```bash
git diff main...<project>-cline
```

```
[ ] Only expected files appear in the diff
[ ] No debug/temporary code left in (console.log, TODO hacks, etc.)
[ ] No unintended whitespace-only changes
[ ] No secrets visible in the diff
[ ] Commit will be clean and purposeful
```

---

## Acceptance Criteria Check

Re-read the `Acceptance Criteria` section of `.ai/ACTIVE-TASK.md`.

```
[ ] Every acceptance criterion is verifiable as met
[ ] Tests cover the criteria where applicable
[ ] No criterion is partially implemented without a noted reason
```

---

## Final Gate

If ALL boxes above are checked:
→ Proceed to Step 7 of task-execution skill (set ACTIVE-TASK = REVIEW)

If ANY box is NOT checked:
→ Fix the issue before marking REVIEW
→ If a fix is impossible due to a blocker, document it in ACTIVE-TASK.md
  Blockers section and update AGENT-STATE.md
