# AGENT RULES (SHORT)

- Branch: <project>-<agent_name> (from main).
- Credentials: ONLY in settings.json. No hardcode.
- Functions: 1 task/func. Add JSDoc comment (purpose, params, return).
- Style: Linear flow, descriptive names, NO magic code.
- Architecture: Separate Service files (e.g., AmazonService.js) + Helpers (e.g., AmazonHelper.js). Reuse code first.
- End Session: Update AGENT_STATE.md.
