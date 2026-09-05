# Social Content Manager — Consistency Audit

> **Status:** For Human Review
> **Audit scope:** Business Requirements → Architecture Plan → Tech Stack → UI/UX → WBS
> **Date:** 2026-08-27
> **Author:** Antigravity (Product/Architecture Reviewer)

---

## Audit Method

Each document was compared against the others for:
- Contradictions (one document says X, another says Y)
- Missing requirements (BRD requirement with no architecture, tech, UI, or WBS coverage)
- Architecture gaps (architecture decision with no tech or WBS implementation)
- Technology decisions not supported by architecture
- UI flows missing from requirements
- WBS tasks without clear dependencies
- Requirements with no implementation task

---

## 1. Findings — Contradictions

### C-01: BRD excludes scheduling; Architecture Plan includes it as P0

**Documents:**
- BRD §2 "Not in MVP: Future scheduling/recurring posting"
- Architecture Plan §35 shows "Schedule" button on Review screen
- Architecture Plan §36 WF-09 diagram shows "SCHEDULE" as a path from VIEW DETAIL
- Architecture Plan §38 lists "Schedule" at P1 (after Retry and History)
- Architecture Plan §39 lists WF-11 "View Detail → Schedule" as P1

**Assessment:** This is not a contradiction at the detailed level — the BRD excludes scheduling and the Architecture Plan places it at P1 (Post-MVP), not P0. However, the Architecture Plan §35 wireframe shows a "Schedule" button on the Review screen, which implies it must appear in the MVP UI.

**Unresolved:** Should the Schedule button appear (disabled/greyed) in the MVP Review screen, or be omitted entirely? This is captured as OQ-6 in the UI/UX document.

---

### C-02: Telegram notification is in the Architecture Plan but NOT in the BRD MVP scope

**Documents:**
- BRD §2 MVP Scope: No mention of Telegram. No notification system listed.
- BRD §3 UX Model: Screens 1–3 defined. No Telegram screen.
- Architecture Plan §26–§40: Telegram is a P0 feature with significant architecture.

**Assessment:** The Architecture Plan extends the BRD. Telegram notification is NOT listed in the BRD MVP scope, but the Architecture Plan explicitly places it at P0 (position 8 in §38). This means the architecture added a requirement not present in the BRD.

**Impact:** The Tech Stack and WBS treat Telegram as MVP based on the Architecture Plan. If the BRD is the authoritative source and the Architecture Plan extended scope without authorization, Telegram should be moved to P1.

**This is a key contradiction requiring human resolution.**

---

### C-03: WF numbering mismatch between BRD and Architecture Plan

**Documents:**
- BRD §4 defines WF-01 through WF-11 (11 workflows)
- Architecture Plan §39 defines WF-01 through WF-14 (14 workflows, different numbering)
- BRD WF-09 = "Reuse Previous Post"
- Architecture Plan WF-09 = "AI Ready → Telegram → Quick POST"

**Assessment:** The Architecture Plan renumbered and added workflows (WF-09 through WF-14 are all new in the Architecture Plan). The BRD workflows WF-09, WF-10, WF-11 were effectively replaced by different workflow definitions. This creates ambiguity when referencing WF numbers across documents.

**Impact:** The WBS and this audit use the Architecture Plan numbering for WF-09 through WF-14 (since those are in the latest document). The BRD original WF-09 (Reuse Previous Post), WF-10 (Social Connection Problem), and WF-11 (Invalid AI Output) still need implementation tasks even though they were renumbered.

**Resolution needed:** Establish canonical WF numbering before implementation. Recommended: Use Architecture Plan §39 as the authoritative workflow table.

---

## 2. Findings — Missing Requirements (BRD has requirement, no coverage)

### M-01: BRD mentions "goal" and "content pillar" fields — no UI screen covers them

**BRD §6 Post entity:**
- `goal`
- `content_pillar`

**BRD §7 AI Service Contract Input:**
- `goal`
- `content pillar`

**Coverage gap:**
- Architecture Plan includes these fields in the Post data model.
- Tech Stack does not address them specifically.
- **UI/UX does not show how the user inputs goal and content pillar on the Create Post screen.**
- WBS TASK POST-001b notes these fields can be PATCHed but does not define the UI for inputting them.

**Impact:** If these fields are required AI inputs, there must be either input fields on Create Post screen or auto-detection. If they are optional metadata, they could be added to Settings as defaults.

**Open question OQ-9 added below.**

---

### M-02: BRD WF-11 — "Invalid AI Output" — no dedicated WBS task

**BRD §4 WF-11:**
> AI returns empty/invalid content → Validation blocks publishing → Show field-level error → User regenerates or edits manually

**Coverage:**
- Architecture Plan §17 defines `AIProviderError`.
- TASK AI-001c states: "Empty response throws AIProviderError."
- UI/UX §3 Screen 1 error states: "AI generation failed: toast/banner with option to retry or proceed manually."
- **No dedicated WBS task for field-level validation error display in the Review screen.**

**Resolution:** The behavior is covered in AI-001c (backend) and UI-004 (frontend), but not explicitly called out as a separate test. Recommend adding to TEST-005 or creating TEST-006 for this scenario.

---

### M-03: BRD §5 Business Rule — "Retry must be safe and should avoid duplicate posts"

**Coverage:**
- PUBLISH-001b (idempotency key strategy) — COVERED.
- TEST-002 (unit tests for PublishPostService) includes idempotency test — COVERED.

**No gap found.** Marked complete.

---

### M-04: BRD §5 Business Rule — "New platforms should be addable without changing the core Post business model"

**Coverage:**
- Architecture Plan §2 defines the adapter pattern.
- Tech Stack §7 confirms hl-sdk-ts + adapter boundary.
- WBS SOCIAL-001a defines SocialPlatformService interface.

**No gap found.** The adapter pattern satisfies this requirement.

---

### M-05: BRD §3 Screen 3 Settings — "AI provider/model" configuration

**Coverage:**
- Tech Stack §6 confirms pluggable adapter.
- UI/UX Settings screen includes AI provider section.
- WBS AI-002a covers StyleProfile; **no WBS task covers AI provider/model selection persistence.**

**Gap:** No WBS task for: storing the user's AI provider preference and selected model, reading it at content preparation time.

**Resolution needed:** Add a settings field for AI provider + model to the UserPreferences or StyleProfile entity, and a WBS task to implement it.

---

## 3. Findings — Architecture Gaps

### A-01: `PostReadyForReview` event mechanism is not defined

**Architecture Plan §26.3:**
> The notification should be triggered by the state transition, not by the frontend.

**Architecture Plan §33:**
> Orchestration: AI Preparation → Post = READY_FOR_REVIEW → PostReadyForReview Event → Notification Orchestrator

**Gap:** The event mechanism itself is not specified. Options:
- Direct function call from `PrepareContentService` to `ReviewNotificationService` (simple, synchronous)
- In-process event emitter (Node.js EventEmitter)
- External message bus (overkill for MVP)

The Tech Stack and WBS do not specify which mechanism is used.

**Resolution needed:** For MVP (personal use, single process), a direct service call or Node.js EventEmitter is sufficient. This needs to be decided before NOTIFY-001 implementation.

**Open question OQ-10 added below.**

---

### A-02: Credential storage for social accounts is vague

**Architecture Plan §8:**
> `credentialReference` — a pointer to credentials stored securely, NOT the raw token

**Architecture Plan §16:**
> Follow the SDK repository's agent rule that credentials belong in `settings.json` for local development.

**Gap:** How credentials are actually stored and referenced is not defined:
- `settings.json` (local dev) — file-based, keyed by account ID?
- Environment variable (production)?
- Encrypted in DB?
- OS keychain?

**Impact:** WBS TASK DB-005 specifies `credentialReference` as a string. WBS TASK SOCIAL-001e says "Store credential reference (not raw token)." But the implementation of credential storage is undefined.

**Resolution needed:** Define the credential storage strategy (at minimum for MVP local dev). Recommend: `settings.json` keyed by `socialAccount.id`, with a `CredentialStore` abstraction in `src/infrastructure/`.

---

### A-03: `Post.version` field is implied by Architecture Plan §29 but missing from the data model

**Architecture Plan §29:**
> Use `postVersion` / `notificationVersion` or equivalent optimistic concurrency mechanism to prevent stale Telegram notification from publishing outdated content.

**Architecture Plan §30:**
> ReviewActionToken includes `expectedPostVersion`.

**Gap:** The Post data model (Architecture Plan §8) does NOT include a `version` field. ReviewActionToken references `expectedPostVersion` but there is nothing to compare it to in the Post record.

**Impact:** WBS TASK DB-006 creates ReviewActionToken with `expectedPostVersion`, but WBS TASK DB-003 does not add a `version` field to Post.

**Resolution:** Add `version` integer field to Post. Increment on every PATCH (description, content, etc.). Compare with `ReviewActionToken.expectedPostVersion` in ReviewActionTokenService.

---

### A-04: `HlAuthAdapter` is mentioned in Architecture Plan §5 but never defined in the WBS

**Architecture Plan §5:**
```
src/integrations/hl-sdk/
├── HlSdkFactory.ts
├── HlFacebookAdapter.ts
├── HlInstagramAdapter.ts
├── HlAuthAdapter.ts       ← mentioned here
├── HlSdkErrorMapper.ts
└── HlSdkTypes.ts
```

**Gap:** No WBS task creates `HlAuthAdapter` or `HlSdkFactory`. These may be needed for the OAuth connection flow.

**Resolution:** Add WBS tasks for `HlSdkFactory` and `HlAuthAdapter` as part of SOCIAL-001c or a new SOCIAL-001f task.

---

## 4. Findings — Technology Decisions Unsupported by Architecture

### T-01: Vitest is proposed but the Architecture Plan does not specify a test runner

**Assessment:** The Architecture Plan §18 defines the test directory structure and that "P0 workflows must have automated tests" but does not name a test runner. Vitest is a reasonable choice for the TypeScript + Node.js stack. No contradiction — this is a valid gap-fill by the Tech Stack.

**No human decision needed.** Vitest is acceptable.

---

### T-02: Playwright is proposed for E2E but Architecture Plan does not specify

**Assessment:** Same as T-01 — reasonable gap-fill. Playwright is the industry standard for Next.js E2E testing.

**No human decision needed.** Playwright is acceptable.

---

### T-03: pino is proposed but Architecture Plan does not name a logging library

**Assessment:** Architecture Plan §17 defines the error hierarchy and implies structured logging is needed. pino is a standard Node.js structured logger. No contradiction.

**No human decision needed.** pino is acceptable.

---

## 5. Findings — UI Flows Missing from Requirements

### U-01: Settings — Telegram configuration screen not in BRD

**BRD §3 Screen 3 (Settings):** Lists Instagram connection, Facebook connection, writing style/tone, language, CTA defaults, hashtag rules, location defaults, AI provider/model. **No Telegram configuration.**

**Architecture Plan §26–§33:** Telegram is a full subsystem requiring user configuration (bot token, chat ID, enable/disable).

**Gap:** The Telegram configuration screen exists in the UI/UX document (Settings screen) but has no backing BRD requirement. It exists because the Architecture Plan added Telegram to MVP scope.

**This is related to C-02 above.** If Telegram is confirmed as MVP, Telegram configuration in Settings must be added to the BRD. If Telegram moves to P1, this screen can be deferred.

---

### U-02: No "Pending/Scheduled" filter in History (scheduling is Post-MVP)

**No gap.** Scheduling is Post-MVP, so the SCHEDULED status filter in History is also Post-MVP. The current UI/UX document correctly includes only DRAFT, PUBLISHED, FAILED, PARTIAL_SUCCESS filters for MVP.

---

### U-03: Platform-specific preview fidelity not defined in BRD

**BRD §3 Screen 2:** "see platform-specific preview"

**Gap:** The BRD does not define whether the preview is a high-fidelity simulation or a simple structured text view. This is captured as OQ-5 in the UI/UX document.

---

## 6. Findings — WBS Tasks Without Clear Dependencies

### W-01: TASK UI-003 (Create Post page) depends on AI-001e but AI-001e depends on many backend tasks

**Assessment:** This dependency chain is long (UI-003 → AI-001e → AI-001d → AI-001c → AI-001b → AI-001a). This is expected — the frontend for AI preparation cannot be completed before the backend AI pipeline. This is correct by the BRD's "vertical slice" approach (Sprint 1).

**No change needed.** The dependency is correct and intentional.

---

### W-02: TASK NOTIFY-003 (ReviewActionTokenService) depends on NOTIFY-002b and PUBLISH-001a

**Assessment:** NOTIFY-002b (Telegram webhook/polling) and PUBLISH-001a (PublishPostService) must both be complete. This creates a long dependency chain:
- NOTIFY-003 → NOTIFY-002b → NOTIFY-002a → NOTIFY-001 → DB-006 → AI-001d (for the event) → ...

**No gap.** The dependency is architecturally correct. The Telegram quick-post feature genuinely requires all of: notification abstraction, Telegram adapter, review action tokens, and publishing.

---

## 7. Findings — Requirements With No Implementation Task

### R-01: BRD §5 Business Rule — "AI must never silently publish in MVP"

**Coverage:**
- PublishPostService (PUBLISH-001a) requires explicit user action.
- Telegram quick POST (NOTIFY-003) validates post status = READY_FOR_REVIEW and runs full validation before publishing.
- No automated publishing without user action.

**No WBS task needed** — this is a cross-cutting constraint enforced by the architecture. The acceptance criteria of PUBLISH-001a and NOTIFY-003 cover this.

---

### R-02: BRD §8 Definition of Done — "Integration boundary is testable/mocked"

**Coverage:**
- TASK SOCIAL-001c specifies "Adapter is testable with a mock SDK."
- TASK AI-001c specifies "Integration test with mocked Gemini response passes."
- TEST-002 uses "mocked adapters."

**No new WBS task needed.** This is enforced through the dependency on the adapter interface pattern. Each integration test task uses mocks.

---

### R-03: BRD §8 Definition of Done — "No secrets are committed"

**Coverage:**
- ARCH-001 creates `.gitignore` excluding `settings.json`.
- ARCH-001 creates `settings.json.example`.
- All environment variable tasks reference environment reading, not hardcoding.

**No new WBS task needed.** Enforced by agent-rules.md and accepted in ARCH-001.

---

## 8. Open Questions / Decisions Required

### OQ-1 (from Tech Stack): Authentication mechanism — email+password vs single-secret

**Decision needed before:** AUTH-001, AUTH-002, AUTH-003

---

### OQ-2 (from Tech Stack): Package manager — npm vs pnpm

**Decision needed before:** ARCH-001

---

### OQ-3 (from Tech Stack): Monorepo structure — apps/web + apps/api

**Decision needed before:** ARCH-001

---

### OQ-4 (from Tech Stack): Telegram — long polling vs webhook for local development

**Decision needed before:** NOTIFY-002b

---

### OQ-5 (from UI/UX): Platform preview fidelity — high-fidelity vs structured text

**Decision needed before:** UI-004

---

### OQ-6 (from UI/UX): Schedule button — omit in MVP or show disabled

**Decision needed before:** UI-004

---

### OQ-7 (from UI/UX): History — pagination vs infinite scroll

**Decision needed before:** UI-005

---

### OQ-8 (from UI/UX): Auto-save draft behavior on navigation away

**Decision needed before:** UI-003

---

### OQ-9 (new — from Audit M-01): Goal and content pillar — user input mechanism

**Question:** How does the user input `goal` and `content_pillar` when creating a post?

**Options:**
- **(A)** Add input fields on Create Post screen (e.g., "What is the goal of this post?" dropdown: Engagement / Awareness / Conversion)
- **(B)** Set defaults in StyleProfile / Settings (user rarely changes per-post)
- **(C)** AI infers goal from description (no user input needed)

**Impact:** These are listed as AI Service Contract inputs (BRD §7). If they are required for good AI output, Option A or B is necessary.

**Decision needed before:** UI-003, AI-001b

---

### OQ-10 (new — from Audit A-01): PostReadyForReview event mechanism

**Question:** How is the PostReadyForReview event implemented internally?

**Options:**
- **(A)** Direct function call: `PrepareContentService` directly calls `ReviewNotificationService.notifyPostReadyForReview()` (simple, synchronous, no infrastructure needed)
- **(B)** Node.js EventEmitter: Emit `post:ready-for-review` event; notification service listens (decoupled, still in-process)

**Impact:** Option A is simpler and sufficient for MVP. Option B is slightly more decoupled and easier to add more listeners later.

**Recommendation:** Option A for MVP. Option B if the team prefers event-driven style.

**Decision needed before:** NOTIFY-001, AI-001d

---

### OQ-11 (new — from Audit A-02): Social credential storage implementation

**Question:** What is the concrete mechanism for storing and retrieving social platform credentials (access tokens) in local development?

**Options:**
- **(A)** `settings.json` keyed by `socialAccount.id` — matches existing workspace convention
- **(B)** Encrypted in DB (using symmetric encryption, key in env var)
- **(C)** OS keychain (cross-platform complexity)

**Recommendation:** Option A for MVP (consistent with agent-rules.md §Rule 1 and Architecture Plan §16). The `credentialReference` in `SocialAccount` would be the key name in `settings.json`. Add `CredentialStore` abstraction in `src/infrastructure/` to allow swapping to Option B in production.

**Decision needed before:** SOCIAL-001e

---

### OQ-12 (new — from Audit A-03): Post version field for optimistic concurrency

**Question:** Should a `version` integer field be added to the Post entity?

**Impact:** Architecture Plan §29 requires version comparison between ReviewActionToken and the current Post state. Without a `version` field on Post, the stale-Telegram-POST protection cannot be implemented.

**Recommendation:** Yes — add `version` integer to Post schema. Increment on every PATCH. Reference in ReviewActionToken as `expectedPostVersion`.

**Decision needed before:** DB-003 (must add to schema before migration), NOTIFY-003

---

### OQ-13 (new — from Audit C-02): Telegram MVP scope confirmation

**Question:** The BRD §2 does not include Telegram in the MVP scope. The Architecture Plan adds Telegram at P0. Is Telegram confirmed as MVP scope?

**Options:**
- **(A)** Yes — confirm Telegram as MVP. The BRD scope section should be updated to reflect this.
- **(B)** No — move Telegram to P1. The Architecture Plan should be updated to reflect this.

**Impact:** If Option A: All NOTIFY-001 through NOTIFY-004 tasks remain MVP. Telegram configuration section added to Settings. If Option B: NOTIFY tasks move to Post-MVP. MVP is simpler (web-only workflow). The BRD remains unchanged.

**This is the highest-priority open question.**

---

## 9. Summary of Critical Issues Requiring Immediate Human Resolution

| # | Issue | Impact Level | Decision Before |
|---|-------|-------------|----------------|
| OQ-13 | Telegram MVP scope confirmation | 🔴 Critical | Architecture review |
| OQ-12 | Post version field for stale-post protection | 🔴 Critical | DB-003 |
| OQ-9 | Goal + content pillar user input | 🟠 High | UI-003, AI-001b |
| OQ-11 | Social credential storage mechanism | 🟠 High | SOCIAL-001e |
| OQ-10 | PostReadyForReview event mechanism | 🟡 Medium | NOTIFY-001 |
| OQ-1 | Authentication mechanism | 🟡 Medium | AUTH-001 |
| OQ-3 | Monorepo structure | 🟡 Medium | ARCH-001 |
| OQ-6 | Schedule button in MVP Review screen | 🟡 Medium | UI-004 |
| OQ-2 | Package manager | 🟢 Low | ARCH-001 |
| OQ-4 | Telegram polling vs webhook | 🟢 Low | NOTIFY-002b |
| OQ-5 | Platform preview fidelity | 🟢 Low | UI-004 |
| OQ-7 | History pagination vs scroll | 🟢 Low | UI-005 |
| OQ-8 | Auto-save draft behavior | 🟢 Low | UI-003 |

---

## 10. Defects to Fix Before Implementation

These are clear gaps that should be corrected in the specification documents (without changing Business Requirements or Architecture Plan):

| # | Fix | Target document | Severity |
|---|-----|----------------|---------|
| FIX-1 | Add `version` field to Post schema in WBS DB-003 | Social_Content_Manager_WBS.md | Required for OQ-12 |
| FIX-2 | Add WBS task for `HlSdkFactory` and `HlAuthAdapter` | Social_Content_Manager_WBS.md | Required for OAuth |
| FIX-3 | Add WBS task for AI provider/model preference persistence | Social_Content_Manager_WBS.md | Required for BRD §3 Screen 3 |
| FIX-4 | Add WBS task for `CredentialStore` abstraction | Social_Content_Manager_WBS.md | Required for social credential storage |
| FIX-5 | Establish canonical WF numbering (BRD vs Architecture Plan) | N/A — human decision | Required for unambiguous WBS references |
| FIX-6 | Clarify goal/contentPillar input in UI/UX Create Post screen | Social_Content_Manager_UI_UX.md | Depends on OQ-9 resolution |
