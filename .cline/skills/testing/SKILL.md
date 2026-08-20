---
name: testing
description: >
  Testing strategy and execution protocol for Cline. Covers running
  existing tests, writing new tests, and reporting results to AGENT-STATE.md.
---

# Testing Protocol

## When to Run This Skill

Run after implementation (Step 5 of task-execution skill), before self-review.

---

## Step 1 — Check What Tests Exist

```bash
# Node/TypeScript projects
ls idea/<project>/
cat idea/<project>/package.json | grep -A10 '"scripts"'

# Python projects
ls idea/<project>/tests/ 2>/dev/null || ls idea/<project>/test/ 2>/dev/null
cat idea/<project>/requirements.txt | grep -i pytest
```

Determine:
- Does a test runner exist? (Jest, Vitest, Pytest, Mocha, etc.)
- Where are test files? (`__tests__/`, `*.test.ts`, `*.spec.js`, `tests/`)
- What is the test command?

---

## Step 2 — Run Existing Tests (Baseline)

Run all existing tests before making changes (if not already done in discovery):

```bash
cd idea/<project>
npm test           # Node/TypeScript
# or
python -m pytest   # Python
```

Record results in `.ai/AGENT-STATE.md`:
```
Build / Test Results:
  Baseline: N tests passed, N failed, N skipped
```

If baseline has failures: document them. Do not fix unrelated failing tests
unless they are directly caused by your implementation.

---

## Step 3 — Write New Tests (When Required)

Write tests when acceptance criteria include testable behavior.

### Test Naming Convention

```
describe('<ServiceName>', () => {
  it('should <expected behavior> when <condition>', () => {
    // arrange
    // act
    // assert
  })
})
```

### What to Test

- Happy path: expected input → expected output
- Edge cases mentioned in acceptance criteria
- Error handling: invalid input, API failure, missing config

### What NOT to Test

- Implementation details (test behavior, not internals)
- Third-party library internals
- Code that requires live external APIs (mock instead)

### File Naming

Place tests adjacent to the file under test or in a `__tests__/` directory:
- `GmailService.ts` → `GmailService.test.ts` or `__tests__/GmailService.test.ts`

---

## Step 4 — Run Final Tests

After implementing and writing tests, run the full suite:

```bash
cd idea/<project>
npm run build && npm test
# or
python -m pytest -v
```

---

## Step 5 — Record Results

Update `.ai/AGENT-STATE.md` Build / Test Results:

```
Build / Test Results:
  Build: PASS | FAIL
  Tests: N passed, N failed, N skipped
  New tests added: N
  Coverage notes: (optional)
  Failures: (list if any — explain if acceptable)
```

---

## Step 6 — Lint (If Available)

```bash
npm run lint       # or equivalent
```

Record any lint errors. Fix lint errors before marking REVIEW unless they
are pre-existing and unrelated to your changes.

---

## Acceptance Gate

Before proceeding to self-review:

```
[ ] Build passes
[ ] All pre-existing tests still pass
[ ] New tests pass
[ ] Lint passes (or pre-existing failures are documented)
[ ] Test results recorded in AGENT-STATE.md
```
