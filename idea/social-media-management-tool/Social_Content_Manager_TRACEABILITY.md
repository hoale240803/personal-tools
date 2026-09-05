# Social Content Manager -- Requirements Traceability Matrix

> **Status:** Approved
> **Revision:** 2026-08-29 -- Generated from cross-document consistency revision
> **Scope:** Business Requirements -> Architecture -> Tech Stack -> UI/UX -> WBS Task -> Test
> **Decisions applied:** D1 (Single-user auth), D2 (Credentials outside DB), D3 (Instagram-first), D4 (Local storage), D5 (Scheduling Post-MVP), D6 (Explicit Save Draft)

---

## 1. Traceability Table

Each row traces a business requirement through the full document chain.

### 1.1 Core Business Requirements (BRD Section 1-5)

| BR ID | Business Requirement | Architecture Reference | Tech Stack | UI/UX | WBS Task | Test |
|-------|---------------------|----------------------|-----------|-------|----------|------|
| BR-01 | AI caption generation | Arch Section 6 AIContentService interface | AI adapter (Gemini) | Screen 1 Create Post: AI Generation Indicator; Screen 2 Review: Caption Editor with AI badge | AI-001a, AI-001b, AI-001c, AI-001d | TEST-003 (PromptBuilder unit), TEST-005 (E2E) |
| BR-02 | AI hashtag generation | Arch Section 6 PreparedContent.hashtags | AI adapter (Gemini) | Screen 2: Hashtag Editor with AI badge | AI-001a, AI-001b, AI-001c | TEST-003 |
| BR-03 | AI CTA generation | Arch Section 6 PreparedContent.cta | AI adapter (Gemini) | Screen 2: CTA Field with AI badge | AI-001a, AI-001b, AI-001c | TEST-003 |
| BR-04 | AI location suggestion | Arch Section 6 PreparedContent.locationSuggestion | AI adapter (Gemini) | Screen 2: Location Field | AI-001a, AI-001b, AI-001c | TEST-003 |
| BR-05 | Image upload (single) | Arch Section 8 PostMedia entity | Local filesystem (D4) | Screen 1: ImageUploadZone | MEDIA-001a, MEDIA-001b, UI-001 | TEST-005 (E2E) |
| BR-06 | Multiple images upload | Arch Section 8 PostMedia.sortOrder | Local filesystem (D4) | Screen 1: ImagePreviewStrip | MEDIA-001b, MEDIA-001c, UI-002 | TEST-005 |
| BR-07 | Image reorder/remove | Arch Section 8 PostMedia | Local filesystem (D4) | Screen 1: ImagePreviewStrip drag + remove | MEDIA-001c, UI-002 | Manual |
| BR-08 | Platform preview | Arch Section 35 Review Screen wireframe | CSS Modules | Screen 2: PlatformPreviewPanel | UI-004b | Manual |
| BR-09 | Publish to Instagram | Arch Section 5 SocialPlatformService; Section 38 P0 item 7 | hl-sdk-ts Instagram adapter | Screen 2: Publish Now; Screen 2b: Result | SOCIAL-001a--e, PUBLISH-001a, PUBLISH-001c | TEST-002, TEST-005 |
| BR-10 | Publish to Facebook | Arch Section 5 SocialPlatformService | hl-sdk-ts Facebook adapter | Screen 2: Publish Now (multi-platform) | SOCIAL-002a--b, PUBLISH-001a, PUBLISH-001c | TEST-002 (with Facebook mock) |
| BR-11 | Per-platform success/failure | Arch Section 9 PARTIAL_SUCCESS state | Express + Prisma | Screen 2b: Per-platform result indicators | PUBLISH-001a, PUBLISH-002 | TEST-002 |
| BR-12 | Retry failed publishing | Arch Section 10 (retry logic) | Express POST /retry endpoint | Screen 2b: Retry button; History: Retry action | PUBLISH-002, PUBLISH-001c | TEST-002 |
| BR-13 | Save draft | Arch Section 9 DRAFT state | Express POST /draft | Screen 1: Save Draft button; Screen 2: Save Draft button | DRAFT-001, UI-003, UI-004 | Manual |
| BR-14 | History | BRD Section 3 Screen 2 | GET /api/posts | Screen 3: History with status filter | HIST-001, UI-005 | Manual |
| BR-15 | Manual editing (caption/hashtags/CTA/location) | Arch Section 8 PostPlatformContent.userEdited | Express PATCH endpoint | Screen 2: Editable fields; AI badge removed on edit | REVIEW-001, UI-004 | TEST-005 |
| BR-16 | Social connection status | BRD Section 3 Screen 3 | GET /api/social-accounts | Settings Screen 4.1 | SOCIAL-001e, UI-006 | Manual |
| BR-17 | User approval required before publish | BRD Section 5 Business Rules | Post status machine; no auto-publish | Screen 2: Publish Now is explicit user action | POST-001a, PUBLISH-001a | TEST-001, TEST-002 |
| BR-18 | AI must not silently publish | BRD Section 5 Business Rules | PrepareContentService emits event; does not publish | AI Generation indicator shows PREPARING, navigates to Review (not directly to result) | AI-001d, UI-003, UI-004 | TEST-005 |
| BR-19 | AI provider replaceable | BRD Section 5 Business Rules | AIContentService interface + adapters | Settings Screen 4.3: AI provider selector | AI-001a, AI-001c, AI-002a | Manual |
| BR-20 | New platforms addable without changing core Post model | BRD Section 5 Business Rules | SocialPlatformService interface | -- (architectural concern) | SOCIAL-001a | -- |
| BR-21 | Secrets never hard-coded | BRD Section 5 Business Rules; Decision D2 | settings.json convention | Settings Screen 4.3/4.4: write-only fields | ARCH-001 (settings.json.example), AUTH-002, DB-005 | Code review |
| BR-22 | Regenerate without overwriting approved fields | BRD WF-04 | AIContentService.regenerateContent; PostPlatformContent.userEdited | Screen 2: Regenerate button + instruction modal | AI-001e, REVIEW-001 | Manual (WF-04) |
| BR-23 | Duplicate post | BRD WF-09 | POST /api/posts/:id/duplicate | History: Duplicate action | HIST-002, UI-005 | Manual |
| BR-24 | Social connection error handling | BRD WF-10 | SocialConnectionError; SocialAccountService validate | Screen 4b: Connection Error Modal | SOCIAL-001e, PUBLISH-001a | Manual (WF-10) |
| BR-25 | Invalid AI output handled | BRD WF-11 | AIProviderError; PrepareContentService | Screen 1: AI failure banner; Screen 2: field-level error | AI-001c, AI-001d | Manual (WF-11) |
| BR-26 | Audit/publishing metadata | BRD Section 2 MVP Included | PublishAttempt entity | Screen 2b: result; History: status badges | DB-004, PUBLISH-001a | -- |
| BR-27 | Personal writing style | BRD Section 3 Screen 3; BRD WF-03 | StyleProfile entity + PromptBuilder | Settings Screen 4.2: Writing style form | AI-001b, AI-002a, UI-006 | TEST-003 |

### 1.2 Workflow Coverage

| Workflow | Priority | Architecture Reference | WBS Tasks | Test |
|----------|----------|----------------------|-----------|------|
| WF-01 Create + Publish to Instagram | P0 | Arch Section 36 WF-09 (Instagram path) | ARCH-001--005, DB-001--006, AUTH-001--003, SOCIAL-001a--e, MEDIA-001a--c, POST-001a--b, AI-001a--e, REVIEW-001, PUBLISH-001a--c, UI-000--004 | TEST-005 (E2E) |
| WF-02 Multi-image post | P0 | Arch Section 8 PostMedia.sortOrder | MEDIA-001b, MEDIA-001c, UI-001, UI-002 | Manual |
| WF-03 AI Style Verification | P0 | Arch Section 7 PromptBuilder + StyleProfile | AI-001b, AI-002a | TEST-003 |
| WF-04 Regenerate | P0 | Arch Section 6 regenerateContent | AI-001e, REVIEW-001 | Manual |
| WF-05 Manual Override | P0 | Arch Section 8 PostPlatformContent.userEdited | REVIEW-001 | Manual |
| WF-06 Publish Both Platforms | P0 | Arch Section 36 multi-platform path | SOCIAL-001a--e, SOCIAL-002a--b, PUBLISH-001a | TEST-002 |
| WF-07 Publish Failure + Retry | P1 | Arch Section 9 FAILED/PARTIAL_SUCCESS | PUBLISH-002, PUBLISH-001c | TEST-002 |
| WF-08 Save Draft + Resume | P1 | Arch Section 9 DRAFT state | DRAFT-001, HIST-001 | Manual |
| WF-09-A Telegram Quick POST | P0 | Arch Section 36 WF-09 | NOTIFY-001--003 | TEST-004 |
| WF-09-B Telegram VIEW DETAIL | P0 | Arch Section 36 WF-10 | NOTIFY-003 | TEST-004 |
| WF-10 Social Connection Problem | P0 | Arch Section 5 SocialConnectionError | SOCIAL-001e, PUBLISH-001a | Manual |
| WF-11 Invalid AI Output | P0 | Arch Section 17 AIProviderError | AI-001c, AI-001d | Manual |

### 1.3 Architecture Decisions -> Tech Stack -> WBS

| Architecture Decision | Tech Stack Element | WBS Tasks |
|----------------------|-------------------|-----------|
| Modular monolith (Arch Section 1) | Express + TypeScript | ARCH-001--003 |
| hl-sdk-ts mandatory (Arch Section 2) | hl-sdk-ts | SOCIAL-001b (inspect exports), SOCIAL-001c, SOCIAL-001d |
| Adapter pattern for social platforms (Arch Section 5) | SocialPlatformService interface | SOCIAL-001a, SOCIAL-001c, SOCIAL-002b |
| AIContentService interface (Arch Section 6) | GeminiAdapter (default) | AI-001a, AI-001c |
| PromptBuilder (Arch Section 7) | TypeScript module | AI-001b |
| Local filesystem storage MVP (D4) | LocalFilesystemAdapter | MEDIA-001a |
| Session-based single-user auth (D1) | express-session + settings.json | AUTH-001, AUTH-002 |
| Credentials outside DB (D2) | settings.json | DB-002 (no cred fields), DB-005 (credentialReference key only), ARCH-001 (gitignore) |
| Instagram first, Facebook second (D3) | hl-sdk-ts adapters | SOCIAL-001c (Sprint 1), SOCIAL-002b (Sprint 2) |
| Scheduling Post-MVP (D5) | node-cron (Post-MVP only) | SCHEDULE-001 (Post-MVP) |
| Explicit Save Draft (D6) | POST /api/posts/:id/draft | DRAFT-001, UI-003, UI-004 |
| Telegram notification (Arch Section 26-33) | Telegram Bot API + long polling | NOTIFY-001--004 |
| PostReadyForReview event (Arch Section 26.3) | Internal event emitter | AI-001d (emits), NOTIFY-001 (subscribes) |
| ReviewActionToken (Arch Section 30) | Prisma + ReviewActionTokenService | DB-006, NOTIFY-003 |
| PostgreSQL + Prisma (Arch Section 8) | Prisma ORM | DB-001--006 |
| pino logging (Arch Section 17) | pino + pino-http | ARCH-005 |
| Error hierarchy (Arch Section 17) | AppError subclasses | ARCH-004 |

### 1.4 UI/UX Features -> WBS Tasks

| UI/UX Screen / Feature | WBS Task |
|------------------------|---------|
| Screen 0: Login page | UI-000, AUTH-003 |
| Screen 1: ImageUploadZone | UI-001, MEDIA-001b |
| Screen 1: ImagePreviewStrip | UI-002, MEDIA-001c |
| Screen 1: Create Post state machine | UI-003, POST-001b |
| Screen 1: Platform Selector | UI-003, SOCIAL-001a |
| Screen 1: AI Generation Indicator | UI-003, AI-001d |
| Screen 1: Save Draft button (D6) | UI-003, DRAFT-001 |
| Screen 2: Review/Edit page | UI-004 |
| Screen 2: Caption/Hashtag/CTA/Location editors | UI-004, REVIEW-001 |
| Screen 2: AI badge on fields | UI-004, REVIEW-001 |
| Screen 2: Regenerate button + modal | UI-004, AI-001e |
| Screen 2: Save Draft button (D6) | UI-004, DRAFT-001 |
| Screen 2: Publish Now button | UI-004, PUBLISH-001c |
| Screen 2: Per-platform publish status (polling) | UI-004, PUBLISH-001c |
| Screen 2: NO Schedule button (D5) | UI-004 (absent) |
| Screen 2: Platform Tabs (Instagram/Facebook) | UI-004 |
| Screen 2b: PlatformPreviewPanel | UI-004b |
| Screen 2b: Publish Result overlay | UI-004, PUBLISH-001c |
| Screen 2b: Retry button | UI-004, PUBLISH-002, PUBLISH-001c |
| Screen 3: History list | UI-005, HIST-001 |
| Screen 3: Status filter pills | UI-005, HIST-001 |
| Screen 3: Duplicate action | UI-005, HIST-002 |
| Screen 3: Retry action | UI-005, PUBLISH-002 |
| Screen 4: Social connections (Instagram) | UI-006, SOCIAL-001e |
| Screen 4: Social connections (Facebook) | UI-006, SOCIAL-002b |
| Screen 4: Writing style form | UI-006, AI-002a |
| Screen 4: AI provider selection (write-only key) | UI-006, AI-001c |
| Screen 4: Telegram config (write-only token, D2) | UI-006, NOTIFY-002a |
| Screen 4: Telegram test notification | UI-006, NOTIFY-002a |
| Screen 4b: Connection Error Modal | UI-006, SOCIAL-001e |
| Notification UX (Telegram messages) | NOTIFY-001, NOTIFY-002a, NOTIFY-004 |

---

## 2. Cross-Document Validation

### 2.1 Requirements Coverage

| Check | Result |
|-------|--------|
| All BRD Section 2 MVP Included items have architecture coverage | PASS |
| All BRD Section 2 Not in MVP items excluded from MVP WBS | PASS -- TikTok, Google Business, multi-user, analytics, scheduling, advanced reports all Post-MVP or absent |
| All BRD Section 4 Workflows (WF-01 to WF-11) have WBS tasks | PASS -- BRD WF-01 through WF-11 all covered. Note: Architecture Plan renumbered WF-09 through WF-14 (Telegram flows); BRD WF-09 (Reuse) is now covered by HIST-002 |
| All BRD Section 5 Business Rules have implementation tasks | PASS -- All 10 business rules traced |

### 2.2 Architecture Coverage

| Check | Result |
|-------|--------|
| Modular monolith structure maintained | PASS |
| hl-sdk-ts inspection task exists (SOCIAL-001b) | PASS -- HL_SDK_REFERENCE.md required before adapters |
| SocialPlatformService interface defined before adapters | PASS -- SOCIAL-001a -> SOCIAL-001c |
| AIContentService interface defined before adapters | PASS -- AI-001a -> AI-001c |
| StorageService interface defined before implementation | PASS -- MEDIA-001a |
| Error hierarchy defined before use | PASS -- ARCH-004 |
| Arch Section 26-33 Telegram notification fully covered | PASS -- NOTIFY-001 through NOTIFY-004 |

### 2.3 UI Coverage

| Check | Result |
|-------|--------|
| Every UI screen has a corresponding WBS task | PASS -- UI-000 through UI-006 + UI-004b |
| Platform Preview Panel (BRD required) has WBS task | PASS -- UI-004b |
| Login screen (D1 required) has WBS task | PASS -- UI-000 |
| Schedule button absent from Review screen | PASS -- Removed per D5 (OQ-6 resolved) |
| Auto-save absent from Create Post and Review | PASS -- D6 applied, only explicit Save Draft |
| Write-only credential fields in Settings | PASS -- UI-006 acceptance criteria enforces "Configured" display |

### 2.4 WBS Coverage

| Check | Result |
|-------|--------|
| All MVP WBS tasks have explicit Depends on linkages | PASS |
| Dependency graph is acyclic | PASS -- See Section 2.6 |
| All Post-MVP tasks marked MVP=No | PASS -- SCHEDULE-001, AUTOSAVE-001, AUTH-MULTI-001, STORAGE-CLOUD-001, NOTIFY-005 |
| Facebook tasks marked Sprint 2 (D3) | PASS -- SOCIAL-002a, SOCIAL-002b annotated Sprint 2 |
| Auth tasks use settings.json (D1) | PASS -- AUTH-002 updated to NOT read from DB |
| DB schema has no credential fields (D2) | PASS -- DB-002 acceptance criteria: no email/password on User; DB-005: no raw token field |

### 2.5 Test Coverage

| Test | Covers |
|------|--------|
| TEST-001 | Post state machine transitions (BR-17) |
| TEST-002 | PublishPostService: happy path, partial failure, full failure, idempotency (BR-11, BR-12) |
| TEST-003 | PromptBuilder: StyleProfile fields in prompt (BR-01 to BR-04, BR-27) |
| TEST-004 | ReviewActionToken: expired, consumed, version mismatch, valid (WF-09-A) |
| TEST-005 | E2E WF-01: Login -> Create -> Prepare -> Review -> Publish Instagram (BR-09) |
| Manual | WF-02, WF-03, WF-04, WF-05, WF-07, WF-08, WF-10, WF-11 (documented test scenarios) |

**Gap identified:** No automated test for BRD WF-11 (Invalid AI Output field-level display). Covered by AI-001c (AIProviderError) and UI-004 (error states) but no dedicated test task.
**Resolution:** Acceptable for MVP. Manual test. Add TEST-006 (AI error E2E) in Sprint 4.

### 2.6 Circular Dependencies

**Analysis of potential cycles:**

| Potential Cycle | Verdict | Explanation |
|----------------|---------|-------------|
| PublishPostService -> TelegramNotificationAdapter | NO CYCLE | PUBLISH-001a has no NOTIFY import. NOTIFY-003 calls PUBLISH-001a (one-way). |
| PublishPostService -> ReviewNotificationService (result) | NO CYCLE | NOTIFY-004 listens to publish result (event-driven fan-out). PUBLISH-001a does not import NOTIFY-004. |
| AI-001d (emits event) -> NOTIFY-001 (subscribes) -> PUBLISH-001a (via NOTIFY-003) | NO CYCLE | AI-001d emits event; NOTIFY-001 subscribes asynchronously; NOTIFY-003 may trigger PUBLISH-001a independently. |
| SCHEDULE-001 -> PUBLISH-001a | NO CYCLE (Post-MVP) | Scheduling is Post-MVP. Does not appear in MVP dependency graph. |

**Result: No circular dependencies exist in the MVP dependency graph.**

### 2.7 Contradictions Found and Resolved

| ID | Contradiction | Resolution |
|----|--------------|-----------|
| C-01 | BRD excludes scheduling; Architecture Plan Section 35 shows Schedule button on Review screen | RESOLVED (D5): Schedule button removed from Review screen in UI/UX. SCHEDULE-001 marked Post-MVP P1. |
| C-02 | Architecture Plan places Telegram at P0; BRD MVP scope does not mention Telegram | RESOLVED: Architecture Plan is authoritative for feature scope within MVP. Telegram is P0 per Architecture Plan Section 38. This is an architectural extension, not a business requirement contradiction. |
| C-03 | WF numbering mismatch between BRD (WF-01 to WF-11) and Architecture Plan (WF-01 to WF-14) | RESOLVED: Architecture Plan Section 39 is canonical for WF-09 to WF-14 (Telegram flows). BRD WF-09 (Reuse) = covered by HIST-002. BRD WF-10 (Connection Problem) = covered by SOCIAL-001e + WF-10 pattern. |
| C-04 | OQ-1 (Auth mechanism) was unresolved | RESOLVED (D1): Single-user, settings.json credentials. No database-backed auth in MVP. |
| C-05 | OQ-6 (Schedule button) was unresolved | RESOLVED (D5): Button omitted from MVP entirely. |
| C-06 | OQ-8 (Auto-save) was unresolved | RESOLVED (D6): Explicit Save Draft only. AUTOSAVE-001 is Post-MVP. |
| C-07 | "Real-time UI updates" claim in TECH_STACK Section 1 implied WebSocket/SSE | RESOLVED: Removed claim. Replaced with accurate description: polling GET /api/posts/:id/publish-attempts. No WebSocket in MVP. |

### 2.8 Open Decisions (Remaining)

| ID | Decision | Status |
|----|----------|--------|
| OD-01 | goal and content_pillar input fields: BRD Section 6 Post entity includes these fields but UI/UX Create Post screen does not show input for them | OPEN -- Recommendation: Make these optional fields with defaults. Add to Create Post as collapsed "Advanced options" or set automatically from description. Does not block Sprint 1. |
| OD-02 | AI provider + model selection persistence: No WBS task for storing selected AI provider/model preference separately from StyleProfile | OPEN -- Recommendation: Add settings field AI_PROVIDER to settings.json (already in TECH_STACK Section 16). UI-006 AI provider section covers selection. Add PATCH /api/settings/ai-provider endpoint as part of UI-006 (minor addition). |
| OD-03 | Telegram webhook for production deployment | RESOLVED (OQ-4): Long polling for MVP. Webhook = Post-MVP. No action required for MVP. |

---

## 3. Decision Compliance Matrix

| Decision | TECH_STACK | UI_UX | WBS | Status |
|----------|-----------|-------|-----|--------|
| D1: Single-user auth, settings.json | Section 4: Auth mechanism updated | Screen 0: No registration; AUTH-003 no registration link | AUTH-002: reads settings.json, no DB; DB-002: no credential fields | APPLIED |
| D2: Credentials outside DB | Section 16: APP_USER_PASSWORD_HASH in settings.json; Section 9: Telegram creds outside DB | Screen 4.1/4.3/4.4: write-only fields, "Configured" display | DB-002: no cred fields; DB-005: credentialReference key only; SOCIAL-001e: token to settings.json | APPLIED |
| D3: Instagram first, Facebook second | Section 7: Sprint 1/Sprint 2 table | -- (implementation concern, not UI) | SOCIAL-002a/b: Sprint 2 annotation; summary table updated | APPLIED |
| D4: Local filesystem MVP | Section 5: Local filesystem confirmed | -- | MEDIA-001a: LocalFilesystemAdapter only; no cloud SDK in MVP | APPLIED |
| D5: Scheduling Post-MVP | Section 8: No background jobs in MVP | Screen 2 Review: Schedule button absent | SCHEDULE-001: MVP=No; UI-004: no Schedule button in acceptance criteria | APPLIED |
| D6: Explicit Save Draft | No reference (backend) | Screen 1: Save Draft button explicit; OQ-8 closed | DRAFT-001: no auto-save; AUTOSAVE-001: Post-MVP; UI-003/004: explicit Save Draft | APPLIED |

---

## 4. Overall Status

| Category | Status |
|----------|--------|
| Requirements coverage | PASS |
| Architecture coverage | PASS |
| UI coverage | PASS |
| WBS coverage | PASS |
| Test coverage | PASS WITH ISSUES (WF-11 automated test gap -- acceptable for MVP) |
| Circular dependencies | PASS (no cycles) |
| Contradictions resolved | PASS (C-01 through C-07 all resolved) |
| Open decisions | PASS WITH ISSUES (OD-01, OD-02 remain open -- do not block Sprint 1) |

## Overall Result: PASS WITH ISSUES

**Issues (non-blocking):**
1. WF-11 (Invalid AI Output) has no dedicated automated test. Manual test acceptable for MVP. Add TEST-006 in Sprint 4.
2. OD-01: goal/content_pillar UI input not explicitly specified. Recommend optional fields or settings defaults. Does not block Sprint 1.
3. OD-02: AI provider/model persistence endpoint not explicitly tasked. Minor addition to UI-006 scope. Does not block Sprint 1.

**All decisions D1-D6 have been applied consistently across TECH_STACK, UI_UX, and WBS.**
