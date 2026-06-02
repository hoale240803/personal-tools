# AI AGENT WORKFLOW, GIT & CODING RULES

You are part of a Multi-Agent system working on this project. Because you do not share a live memory session with other agents, you MUST strictly follow this protocol to prevent code regression, conflicts, and maintain high-quality code.

---

## 1. BEFORE YOU START (GIT & PROGRESS CHECK)

- **Git Branch Rule:** You MUST always check out a new branch from the latest `main` branch.
- **Naming Convention:** Name your branch using the exact template: `<project-name>-<ai-agent-name>`.
  - _Example:_ `expense-management-tool-claude-code`
- **Context Check:** Look for a file named `AGENT_STATE.md` in the root directory. Read it carefully to understand the CURRENT PROGRESS and what the previous agent left unfinished.

---

## 2. CODING RULES (MANDATORY STANDARDS)

You must strictly adhere to the following 7 coding principles when writing or refactoring code:

### Rule 1: Credential Management

- ALL credentials, secrets, tokens, and sensitive configurations MUST be stored inside the `settings.json` file of the tool. Never hardcode them in the source code.

### Rule 2: Explicit Code Documentation

- Every single function/method MUST include a block comment clearly stating:
  - What the function does (Its purpose).
  - Descriptions and types of all input parameters.
  - Description of the return value.

### Rule 3: Linear Code Structure

- Write code in a clean, linear, and straightforward manner to maximize readability. Avoid overly complex, deeply nested ternary operators or obscured control flows.

### Rule 4: Service-Oriented Architecture & Helpers

- **Service Isolation:** Create separate, dedicated service files for each unique functionality/platform.
  - _Examples:_ `AmazonService.js`, `CraigslistService.js`, `FacebookService.js`, `InstagramService.js`
- **Helper Extraction:** For large functions that contain repetitive sub-functions, extract those sub-logics into dedicated helper files to support the main service file.
  - _Examples:_ `AmazonSearchingServiceHelper.js`, `CraigslistFindingJobServiceHelper.js`

### Rule 5: No Magic Code

- Do NOT use magic numbers, magic strings, or unexplained logic short-cuts.
- Every variable, function, and class name MUST be descriptive and explicitly carry its intended meaning.

### Rule 6: Single Responsibility Principle (SRP)

- Each function/method MUST perform exactly ONE task or job, and do it perfectly. If a function is doing two things, split it.

### Rule 7: Code Reuse

- Maximize the reuse of existing code, utility functions, or classes already available in the repository. Only create new variables, functions, or classes if the required capability does not already exist.

---

## 3. AFTER YOU FINISH (THE HANDOVER PROTOCOL)

Before ending your current session, you MUST update or create the `AGENT_STATE.md` file using this exact Markdown structure:

```markdown
# PROJECT CURRENT STATE

## 🎯 Current Objective

- [ ] Description of the feature we are building.

## 🕒 Latest Update (Timestamp: YYYY-MM-DD HH:MM)

- **Agent Name:** [e.g., Claude Code or Copilot]
- **Current Git Branch:** [e.g., expense-management-tool-claude-code]
- **Completed Tasks:** List every file created/modified and verified against Coding Rules.
- **Unfinished/Pending Tasks:** What were you doing right before stopping?
- **Bugs/Blockers:** Any errors encountered or notes for the next agent.

## 📋 Next Steps for the Next Agent

1. Step one...
2. Step two...

## 📂 Relevant Files

- List of files modified or needing immediate attention.
```
