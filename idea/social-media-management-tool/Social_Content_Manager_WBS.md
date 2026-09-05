# Social Content Manager -- Work Breakdown Structure (WBS)

> **Status:** Approved for implementation
> **Revision:** 2026-08-29 -- Cross-document consistency revision applied (D1-D6)
> **Decisions applied:** D1 (Single-user auth), D2 (Credentials outside DB), D3 (Instagram-first Sprint 1, Facebook Sprint 2), D4 (Local storage MVP), D5 (Scheduling Post-MVP), D6 (Explicit Save Draft)
> **Derived from:** Business_Requirements.md + ARCHITECTURE_PLAN.md

---

## WBS Conventions

| Field | Meaning |
|-------|---------|
| **ID** | Unique task identifier |
| **Priority** | P0 = must-have MVP, P1 = important MVP, P2 = Post-MVP |
| **Depends on** | IDs that must be complete before this task can start |
| **MVP** | Yes = required for MVP. No = Post-MVP. |

---

## Dependency Graph Notes

The WBS dependency graph is acyclic:
- PUBLISH-001a (publishing) has NO dependency on any NOTIFY task.
- NOTIFY-001/002/003 depend on PUBLISH-001a unidirectionally (Telegram is a downstream consumer and remote-action trigger, not a part of publishing).
- NOTIFY-004 (result notification) is a fan-out from PUBLISH-001a. PUBLISH-001a does NOT depend on NOTIFY-004.
- SCHEDULE-001 is Post-MVP and does not appear in MVP dependency chains.

---

## EPIC 1 -- Project Foundation

---

##### TASK ARCH-001: Create monorepo scaffold

| Field | Value |
|-------|-------|
| **ID** | ARCH-001 |
| **Description** | Initialize monorepo with apps/web (Next.js) and apps/api (Express). Set up .gitignore to exclude settings.json, .env, node_modules. Create settings.json.example with all required variable names. |
| **Depends on** | None |
| **Acceptance Criteria** | (1) apps/web runs with npm run dev. (2) apps/api runs with npm run dev. (3) settings.json is gitignored. (4) settings.json.example exists. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK ARCH-002: Configure TypeScript for both apps

| Field | Value |
|-------|-------|
| **ID** | ARCH-002 |
| **Depends on** | ARCH-001 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK ARCH-003: Set up Express application entry point and middleware

| Field | Value |
|-------|-------|
| **ID** | ARCH-003 |
| **Description** | Create apps/api/src/app/index.ts. Register: JSON body parser, cookie-session, CORS, pino-http logger. GET /health returns 200 OK. |
| **Depends on** | ARCH-002 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK ARCH-004: Set up shared error model

| Field | Value |
|-------|-------|
| **ID** | ARCH-004 |
| **Description** | Create base AppError and subclasses: ValidationError, SocialConnectionError, SocialPublishError, AIProviderError, StorageError, NotFoundError, AuthError. Global error handler middleware. |
| **Depends on** | ARCH-003 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK ARCH-005: Set up pino logger

| Field | Value |
|-------|-------|
| **ID** | ARCH-005 |
| **Depends on** | ARCH-003 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK DB-001: Set up Prisma with PostgreSQL connection

| Field | Value |
|-------|-------|
| **ID** | DB-001 |
| **Description** | Install Prisma. Configure DATABASE_URL from settings.json/environment. Initial migration. PrismaClient singleton. |
| **Depends on** | ARCH-001 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK DB-002: Implement User and StyleProfile schema

| Field | Value |
|-------|-------|
| **ID** | DB-002 |
| **Description** | Add User and StyleProfile Prisma models. DECISION D1/D2: User model has NO email, password, or passwordHash fields. Comment in schema: "Credentials are stored in settings.json, NOT in this table." StyleProfile has all fields per Architecture Plan Section 8. |
| **Depends on** | DB-001 |
| **Acceptance Criteria** | (1) Migration runs. (2) User model has NO credential fields. (3) Schema comment states credentials are in settings.json. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK DB-003: Implement Post, PostMedia, PostPlatformContent schema

| Field | Value |
|-------|-------|
| **ID** | DB-003 |
| **Description** | Post status enum: DRAFT, PREPARING, READY_FOR_REVIEW, PUBLISHING, PUBLISHED, FAILED, PARTIAL_SUCCESS. PostMedia.sortOrder and PostPlatformContent.userEdited fields required. |
| **Depends on** | DB-002 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK DB-004: Implement PublishAttempt schema

| Field | Value |
|-------|-------|
| **ID** | DB-004 |
| **Depends on** | DB-003 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK DB-005: Implement SocialAccount schema

| Field | Value |
|-------|-------|
| **ID** | DB-005 |
| **Description** | DECISION D2: credentialReference field is a string KEY POINTER only. Actual OAuth token stored in settings.json. Schema comment must state this. No raw token field in schema. |
| **Depends on** | DB-002 |
| **Acceptance Criteria** | (1) Migration runs. (2) No raw token field exists. (3) credentialReference is a string pointer. (4) Schema comment explicitly documents the credential storage pattern. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK DB-006: Implement NotificationPreference, NotificationDelivery, ReviewActionToken schema

| Field | Value |
|-------|-------|
| **ID** | DB-006 |
| **Depends on** | DB-003 |
| **Priority** | P0 |
| **MVP** | Yes |

---

## EPIC 1 -- Authentication (FEATURE 1.3)

> **DECISION D1:** Single-user MVP. Credentials in settings.json. No email/bcrypt in DB. No user registration.

---

##### TASK AUTH-001: Implement user session middleware

| Field | Value |
|-------|-------|
| **ID** | AUTH-001 |
| **Description** | Install express-session. Configure with SESSION_SECRET from settings.json/environment. Create requireAuth middleware returning 401 if no active session. Attach fixed single userId to req.user. Protect all routes except /health and /auth/*. |
| **Depends on** | ARCH-003, DB-002 |
| **Acceptance Criteria** | (1) Protected routes return 401 without session. (2) req.user.id available in all protected controllers. (3) SESSION_SECRET never hardcoded. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK AUTH-002: Implement login endpoint (single-user, settings.json credentials)

| Field | Value |
|-------|-------|
| **ID** | AUTH-002 |
| **Description** | DECISION D1: POST /auth/login reads username + bcrypt-hashed password from settings.json (NOT from the database). Validates submitted password against the hash. On success: creates session with fixed userId. On failure: returns 401. POST /auth/logout destroys session. NO /auth/register endpoint in MVP. |
| **Depends on** | AUTH-001 |
| **Acceptance Criteria** | (1) Valid credentials return 200 + session cookie. (2) Invalid credentials return 401. (3) No database read for credential validation. (4) Logout destroys session. (5) No /auth/register endpoint exists. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK AUTH-003: Implement Next.js login screen

| Field | Value |
|-------|-------|
| **ID** | AUTH-003 |
| **Description** | Create apps/web/src/app/login/page.tsx with username + password form. POST to /auth/login. Success -> redirect to Create Post. Failure -> "Invalid credentials." Auth guard: redirect unauthenticated users to /login. No registration link. |
| **Depends on** | AUTH-002, ARCH-003 |
| **Acceptance Criteria** | (1) Login form submits credentials. (2) Success redirects to Create Post. (3) Failure shows "Invalid credentials." (4) Protected pages redirect to /login without session. (5) No registration or password reset link. |
| **Priority** | P0 |
| **MVP** | Yes |


---

## EPIC 2 -- Social Account Connections

> **DECISION D3:** Instagram is Sprint 1. Facebook is Sprint 2. Do not implement both in parallel in Sprint 1.

---

##### TASK SOCIAL-001a: Define SocialPlatformService interface

| Field | Value |
|-------|-------|
| **ID** | SOCIAL-001a |
| **Description** | Create SocialPlatformService interface with methods: connect, disconnect, getConnectionStatus, validatePublish, publish. No hl-sdk-ts import in this file. |
| **Depends on** | DB-005 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK SOCIAL-001b: Inspect hl-sdk-ts Instagram exports

| Field | Value |
|-------|-------|
| **ID** | SOCIAL-001b |
| **Description** | Clone/install hl-sdk-ts from hoale240803/hl-sdk-ts. Read and document actual exported types, methods, and error classes for Instagram. Do NOT invent API signatures. Create HL_SDK_REFERENCE.md listing discovered exports. |
| **Depends on** | ARCH-001 |
| **Acceptance Criteria** | (1) HL_SDK_REFERENCE.md exists. (2) Actual Instagram method names documented. (3) No invented method names used. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK SOCIAL-001c: Implement HlInstagramAdapter

| Field | Value |
|-------|-------|
| **ID** | SOCIAL-001c |
| **Description** | Create HlInstagramAdapter.ts implementing SocialPlatformService for Instagram. Use only methods from HL_SDK_REFERENCE.md. Map SDK errors via HlSdkErrorMapper. |
| **Depends on** | SOCIAL-001a, SOCIAL-001b |
| **Acceptance Criteria** | (1) Only src/integrations/hl-sdk/ imports hl-sdk-ts. (2) All five interface methods implemented. (3) SDK errors mapped. (4) Testable with mock SDK. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK SOCIAL-001d: Implement HlSdkErrorMapper

| Field | Value |
|-------|-------|
| **ID** | SOCIAL-001d |
| **Description** | Create HlSdkErrorMapper.ts. Map SDK error codes/types to AppError subclasses. No raw SDK error objects pass the boundary. |
| **Depends on** | ARCH-004, SOCIAL-001b |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK SOCIAL-001e: Implement connect/disconnect API endpoints (Instagram)

| Field | Value |
|-------|-------|
| **ID** | SOCIAL-001e |
| **Description** | Create GET /api/social-accounts, POST /api/social-accounts/instagram/connect, DELETE /api/social-accounts/:id, POST /api/social-accounts/:id/validate. DECISION D2: Write actual OAuth token to settings.json; store only credential reference key in DB SocialAccount.credentialReference. |
| **Depends on** | SOCIAL-001c, AUTH-001, DB-005 |
| **Acceptance Criteria** | (1) GET returns connected accounts with status. (2) POST connect triggers OAuth flow. (3) Raw tokens written to settings.json, never stored in SocialAccount table. |
| **Priority** | P0 |
| **MVP** | Yes |

---

### FEATURE 2.2 -- Facebook Connection (Sprint 2)

> **DECISION D3:** Start Facebook tasks only after Instagram end-to-end (WF-01) is verified working.

---

##### TASK SOCIAL-002a: Inspect hl-sdk-ts Facebook exports

| Field | Value |
|-------|-------|
| **ID** | SOCIAL-002a |
| **Description** | Document Facebook service/helper methods from hl-sdk-ts in HL_SDK_REFERENCE.md. Do NOT invent API signatures. |
| **Depends on** | SOCIAL-001b |
| **Sprint** | Sprint 2 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK SOCIAL-002b: Implement HlFacebookAdapter

| Field | Value |
|-------|-------|
| **ID** | SOCIAL-002b |
| **Description** | Create HlFacebookAdapter.ts implementing SocialPlatformService for Facebook. Mirror pattern from HlInstagramAdapter. Add POST /api/social-accounts/facebook/connect endpoint. |
| **Depends on** | SOCIAL-001a, SOCIAL-002a, SOCIAL-001d |
| **Sprint** | Sprint 2 |
| **Priority** | P0 |
| **MVP** | Yes |

---

## EPIC 3 -- Media Upload

> **DECISION D4:** Local filesystem for MVP. Cloud storage is Post-MVP.

---

##### TASK MEDIA-001a: Implement StorageService interface and LocalFilesystemAdapter

| Field | Value |
|-------|-------|
| **ID** | MEDIA-001a |
| **Description** | Create StorageService interface: save(file, options), delete(key), getUrl(key). Implement LocalFilesystemAdapter using STORAGE_PATH from settings.json. DECISION D4: No cloud SDK imported in MVP. |
| **Depends on** | ARCH-002 |
| **Acceptance Criteria** | (1) Interface separate from adapter. (2) Files saved to STORAGE_PATH. (3) No cloud SDK imported. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK MEDIA-001b: Implement media upload API endpoint

| Field | Value |
|-------|-------|
| **ID** | MEDIA-001b |
| **Description** | Create POST /api/media. Accept multipart file upload. Validate: JPEG/PNG/WebP only, max 10MB. Store via StorageService. Create PostMedia record with storageKey and sortOrder. |
| **Depends on** | MEDIA-001a, DB-003, AUTH-001 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK MEDIA-001c: Implement media reorder and delete endpoints

| Field | Value |
|-------|-------|
| **ID** | MEDIA-001c |
| **Description** | Create PATCH /api/posts/:postId/media/order (accepts array of mediaId + sortOrder). Create DELETE /api/media/:id (deletes DB record and file from storage). |
| **Depends on** | MEDIA-001b |
| **Priority** | P0 |
| **MVP** | Yes |

---

## EPIC 4 -- Post Domain

---

##### TASK POST-001a: Implement Post state machine

| Field | Value |
|-------|-------|
| **ID** | POST-001a |
| **Description** | Create PostStateMachine.ts. Valid transitions: DRAFT->PREPARING, PREPARING->READY_FOR_REVIEW, PREPARING->DRAFT (AI failure), READY_FOR_REVIEW->PUBLISHING, PUBLISHING->PUBLISHED, PUBLISHING->FAILED, PUBLISHING->PARTIAL_SUCCESS, PARTIAL_SUCCESS->PUBLISHING (retry), FAILED->PUBLISHING (retry). Throw ValidationError on invalid transition. |
| **Depends on** | DB-003 |
| **Acceptance Criteria** | (1) All valid transitions work. (2) Invalid transitions throw ValidationError. (3) Unit testable in isolation. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK POST-001b: Implement Post CRUD service and API endpoints

| Field | Value |
|-------|-------|
| **ID** | POST-001b |
| **Description** | Create PostService and PostRepository. POST /api/posts (create DRAFT), GET /api/posts/:id (fetch with media + platform content), PATCH /api/posts/:id (update description, goal, contentPillar, location, platforms). |
| **Depends on** | POST-001a, AUTH-001 |
| **Priority** | P0 |
| **MVP** | Yes |

---

## EPIC 5 -- AI Content Generation

---

##### TASK AI-001a: Define AIContentService interface and types

| Field | Value |
|-------|-------|
| **ID** | AI-001a |
| **Description** | Create AIContentService interface: prepareContent(PrepareContentInput): Promise<PreparedContent>, regenerateContent(RegenerateContentInput): Promise<PreparedContent>. PrepareContentInput includes image references, description, goal, contentPillar, platforms, styleProfile, locationContext. |
| **Depends on** | ARCH-002 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK AI-001b: Implement PromptBuilder

| Field | Value |
|-------|-------|
| **ID** | AI-001b |
| **Description** | Create PromptBuilder.ts. Build AI prompts from PrepareContentInput + StyleProfile. Embed tone, language, hashtag rules, CTA rules, location context. Prompt requests structured JSON output matching PreparedContent. |
| **Depends on** | AI-001a |
| **Acceptance Criteria** | (1) Prompt includes StyleProfile fields. (2) Prompt requests per-platform content. (3) Unit tests verify prompt structure. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK AI-001c: Implement GeminiAdapter

| Field | Value |
|-------|-------|
| **ID** | AI-001c |
| **Description** | Create GeminiAdapter.ts implementing AIContentService. Google Gemini API for multimodal content generation. API key read from settings.json/environment (DECISION D2: never from DB). Empty response throws AIProviderError. |
| **Depends on** | AI-001a, AI-001b |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK AI-001d: Implement PrepareContentService

| Field | Value |
|-------|-------|
| **ID** | AI-001d |
| **Description** | Create PrepareContentService.ts. Orchestrates: (1) Load Post + PostMedia + StyleProfile, (2) Build PrepareContentInput, (3) Call AIContentService, (4) Save PostPlatformContent records, (5) Transition Post to READY_FOR_REVIEW, (6) Emit PostReadyForReview event (triggers ReviewNotificationService). AI failure transitions Post back to DRAFT. |
| **Depends on** | AI-001c, POST-001a, DB-003 |
| **Acceptance Criteria** | (1) Post transitions DRAFT->PREPARING->READY_FOR_REVIEW. (2) PostPlatformContent created per selected platform. (3) AI failure -> DRAFT (not stuck in PREPARING). (4) PostReadyForReview event emitted on success. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK AI-001e: Implement prepare and regenerate API endpoints

| Field | Value |
|-------|-------|
| **ID** | AI-001e |
| **Description** | POST /api/posts/:id/prepare (triggers PrepareContentService, returns 202). POST /api/posts/:id/regenerate (accepts optional instruction, regenerates non-approved fields only, preserves userEdited=true fields). |
| **Depends on** | AI-001d, AUTH-001 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK AI-002a: Implement StyleProfile CRUD

| Field | Value |
|-------|-------|
| **ID** | AI-002a |
| **Description** | StyleProfileRepository + StyleProfileService. GET /api/settings/style, PATCH /api/settings/style. StyleProfile used by PromptBuilder for all AI calls. |
| **Depends on** | DB-002, AUTH-001 |
| **Priority** | P0 |
| **MVP** | Yes |


---

## EPIC 6 -- Content Review

---

##### TASK REVIEW-001: Implement platform content edit endpoint

| Field | Value |
|-------|-------|
| **ID** | REVIEW-001 |
| **Description** | PATCH /api/posts/:id/platform-content/:platform. Accepts caption, hashtags, cta, location. Sets userEdited=true on updated fields. |
| **Depends on** | POST-001b, DB-003, AUTH-001 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK REVIEW-002: Implement post approve endpoint

| Field | Value |
|-------|-------|
| **ID** | REVIEW-002 |
| **Description** | POST /api/posts/:id/approve. Sets approvedAt on PostPlatformContent. Validates caption is non-empty. Does not publish. |
| **Depends on** | REVIEW-001 |
| **Priority** | P1 |
| **MVP** | Yes |

---

## EPIC 7 -- Publishing

---

##### TASK PUBLISH-001a: Implement PublishPostService

| Field | Value |
|-------|-------|
| **ID** | PUBLISH-001a |
| **Description** | Create PublishPostService.ts. Orchestrates: (1) Validate Post status=READY_FOR_REVIEW, (2) Validate SocialAccount connections, (3) Validate PostPlatformContent (non-empty caption), (4) Create PublishAttempt with idempotencyKey, (5) Call platform adapter, (6) Persist result, (7) Update Post status. Instagram and Facebook execute independently. CRITICAL: This service has NO import of TelegramNotificationAdapter or ReviewNotificationService. |
| **Depends on** | POST-001a, SOCIAL-001c, DB-004, REVIEW-001 |
| **Acceptance Criteria** | (1) Invalid post status -> ValidationError. (2) Missing social account -> SocialConnectionError. (3) Empty caption -> ValidationError. (4) Instagram and Facebook publish independently. (5) No notification component imported. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK PUBLISH-001b: Implement idempotency key strategy

| Field | Value |
|-------|-------|
| **ID** | PUBLISH-001b |
| **Description** | Generate idempotencyKey = hash(postId + platform + attempt_number). On retry: if previous attempt with same key succeeded, return existing result without re-publishing. |
| **Depends on** | PUBLISH-001a |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK PUBLISH-001c: Implement publish API endpoint

| Field | Value |
|-------|-------|
| **ID** | PUBLISH-001c |
| **Description** | POST /api/posts/:id/publish (calls PublishPostService, returns per-platform results). POST /api/posts/:id/publish/retry (retries FAILED platforms). GET /api/posts/:id/publish-attempts (list publish history). |
| **Depends on** | PUBLISH-001a, PUBLISH-001b, AUTH-001 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK PUBLISH-002: Implement failure state and retry logic

| Field | Value |
|-------|-------|
| **ID** | PUBLISH-002 |
| **Description** | On failure: store errorCode + errorMessage in PublishAttempt, update Post to FAILED or PARTIAL_SUCCESS. On retry: re-validate, create new PublishAttempt, check idempotency first. Retry does not re-publish already-successful platforms. |
| **Depends on** | PUBLISH-001a, PUBLISH-001b |
| **Priority** | P0 |
| **MVP** | Yes |

---

## EPIC 8 -- Notification System (Telegram)

> **Circular dependency status: ACYCLIC.** PUBLISH-001a -> no NOTIFY dependency. NOTIFY-003 -> PUBLISH-001a (unidirectional). No cycle exists.

---

##### TASK NOTIFY-001: Implement NotificationChannel interface and ReviewNotificationService

| Field | Value |
|-------|-------|
| **ID** | NOTIFY-001 |
| **Description** | Create NotificationChannel interface: send(input): Promise<NotificationResult>. Create ReviewNotificationService: subscribes to PostReadyForReview event (emitted by AI-001d), dispatches through enabled channel adapters, persists NotificationDelivery. |
| **Depends on** | DB-006, AI-001d |
| **Acceptance Criteria** | (1) Business logic depends on NotificationChannel interface, not TelegramAdapter. (2) NotificationDelivery record created before sending. (3) If no channels enabled, no error. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK NOTIFY-002a: Implement TelegramNotificationAdapter

| Field | Value |
|-------|-------|
| **ID** | NOTIFY-002a |
| **Description** | Create TelegramNotificationAdapter.ts. DECISION D2: Read TELEGRAM_BOT_TOKEN from settings.json/environment, never from DB. Send message with inline keyboard (POST / VIEW DETAIL buttons). Store providerMessageId in NotificationDelivery. |
| **Depends on** | NOTIFY-001 |
| **Acceptance Criteria** | (1) Sends Telegram message per Architecture Plan Section 27. (2) POST + VIEW DETAIL buttons included. (3) TELEGRAM_BOT_TOKEN never hardcoded or stored in DB. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK NOTIFY-002b: Implement Telegram long-polling handler

| Field | Value |
|-------|-------|
| **ID** | NOTIFY-002b |
| **Description** | Implement Telegram bot update handling using long polling (MVP -- no public URL required). Handle callback_query events from inline keyboard. Route POST callback to ReviewActionTokenService. Route VIEW DETAIL callback to return secure detail URL. |
| **Depends on** | NOTIFY-002a, ARCH-003 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK NOTIFY-003: Implement ReviewActionToken service

| Field | Value |
|-------|-------|
| **ID** | NOTIFY-003 |
| **Description** | Create ReviewActionTokenService.ts. On POST action from Telegram: (1) Load token, (2) Validate not expired, (3) Validate not consumed, (4) Validate postVersion matches, (5) Mark consumed, (6) Call PublishPostService. On VIEW DETAIL: return secure URL to post review page. NOTE: This calls PublishPostService unidirectionally. PublishPostService does NOT call this service. No cycle. |
| **Depends on** | NOTIFY-002b, PUBLISH-001a, DB-006 |
| **Acceptance Criteria** | (1) Expired token -> error (no publish). (2) Consumed token -> error. (3) Version mismatch -> "Post was changed. Please VIEW DETAIL." (4) Valid token -> publish. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK NOTIFY-004: Send publish result to Telegram

| Field | Value |
|-------|-------|
| **ID** | NOTIFY-004 |
| **Description** | After publish completes, send result notification: POSTED / PARTIALLY POSTED / FAILED with per-platform status. PublishPostService calls a result notification hook (not TelegramAdapter directly). |
| **Depends on** | PUBLISH-001a, NOTIFY-002a |
| **Priority** | P1 |
| **MVP** | Yes |

---

## EPIC 9 -- Draft and History

> **DECISION D6:** Explicit Save Draft only. Auto-save is Post-MVP.

---

##### TASK DRAFT-001: Implement explicit Save Draft endpoint

| Field | Value |
|-------|-------|
| **ID** | DRAFT-001 |
| **Description** | DECISION D6: POST /api/posts/:id/draft saves current post as DRAFT explicitly. There is NO auto-save behavior in MVP. Save Draft button in UI triggers this endpoint. If user navigates away without clicking Save Draft, no draft is automatically persisted. |
| **Depends on** | POST-001b |
| **Acceptance Criteria** | (1) POST /draft saves post fields. (2) No automatic draft creation on navigation. (3) Draft preserved across sessions when explicitly saved. |
| **Priority** | P1 |
| **MVP** | Yes |

---

##### TASK HIST-001: Implement post history endpoint

| Field | Value |
|-------|-------|
| **ID** | HIST-001 |
| **Description** | GET /api/posts with status filtering. Returns posts with thumbnail URL, status, dates, platform badges. Ordered by updatedAt descending. |
| **Depends on** | POST-001b, MEDIA-001b |
| **Priority** | P1 |
| **MVP** | Yes |

---

##### TASK HIST-002: Implement post duplicate endpoint

| Field | Value |
|-------|-------|
| **ID** | HIST-002 |
| **Description** | POST /api/posts/:id/duplicate. Creates new DRAFT copying description, goal, contentPillar, PostPlatformContent. Does NOT copy PublishAttempts. New PostMedia records with same storageKeys. |
| **Depends on** | HIST-001 |
| **Priority** | P1 |
| **MVP** | Yes |


---

## EPIC 10 -- Frontend Implementation

---

##### TASK UI-000: Implement login page

| Field | Value |
|-------|-------|
| **ID** | UI-000 |
| **Description** | Build apps/web/src/app/login/page.tsx per UI/UX Screen 0. Username + password form. POST to /auth/login. Success -> redirect to Create Post. Failure -> "Invalid credentials." Auth guard: redirect unauthenticated users to /login. No registration link shown. |
| **Depends on** | AUTH-003 |
| **Acceptance Criteria** | (1) Login form submits credentials. (2) Success redirects. (3) "Invalid credentials." on failure. (4) Protected pages redirect to /login. (5) No registration link. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK UI-001: Implement image upload component

| Field | Value |
|-------|-------|
| **ID** | UI-001 |
| **Description** | Build ImageUploadZone component: drag-and-drop + click-to-select. Calls POST /api/media. Shows upload progress. Inline errors for file type and size violations. |
| **Depends on** | MEDIA-001b, UI-000 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK UI-002: Implement image preview strip with reorder and remove

| Field | Value |
|-------|-------|
| **ID** | UI-002 |
| **Description** | Build ImagePreviewStrip component. Shows thumbnails. Drag-to-reorder calls PATCH /api/posts/:postId/media/order. Remove button calls DELETE /api/media/:id. |
| **Depends on** | UI-001, MEDIA-001c |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK UI-003: Implement Create Post page with state machine

| Field | Value |
|-------|-------|
| **ID** | UI-003 |
| **Description** | Build apps/web/src/app/create/page.tsx. 5-state machine: EMPTY->MEDIA_SELECTED->DESCRIPTION_READY->PREPARING->READY_FOR_REVIEW. Components: ImageUploadZone + ImagePreviewStrip + DescriptionInput + PlatformSelector + PreparePostButton + AIGenerationIndicator + Save Draft button. DECISION D6: Save Draft calls POST /api/posts/:id/draft explicitly. No auto-save. Browser beforeunload warning if unsaved. |
| **Depends on** | UI-001, UI-002, AI-001e, DRAFT-001 |
| **Acceptance Criteria** | (1) State transitions correct. (2) Prepare Post disabled until media + description + platform selected. (3) AI generation indicator visible during PREPARING. (4) Navigates to Review on completion. (5) Save Draft button saves via explicit API call. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK UI-004: Implement Review/Edit page

| Field | Value |
|-------|-------|
| **ID** | UI-004 |
| **Description** | Build apps/web/src/app/posts/[id]/page.tsx. Shows: status badge, image carousel, platform tabs (Instagram/Facebook), editable caption, hashtag editor, CTA field, location field, Regenerate button, Save Draft button, Publish Now button. DECISION D5: NO Schedule button. DECISION D6: Save Draft is explicit button only. Publish status updated by polling GET /api/posts/:id/publish-attempts. |
| **Depends on** | REVIEW-001, PUBLISH-001c, AI-001e, DRAFT-001 |
| **Acceptance Criteria** | (1) All PostPlatformContent fields editable. (2) User-edited fields lose AI badge. (3) Regenerate opens instruction modal. (4) Publish triggers publish API. (5) Per-platform result shown via polling. (6) Partial failure shows retry. (7) No Schedule button present. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK UI-004b: Implement platform preview panel

| Field | Value |
|-------|-------|
| **ID** | UI-004b |
| **Description** | Build PlatformPreviewPanel component for the Review screen. Shows structured text preview per platform: thumbnail, caption, hashtags, location, CTA. Instagram: square ratio, hashtags below. Facebook: landscape ratio preferred. Required by BRD Section 3 Screen 2. Updates as user edits content. |
| **Depends on** | UI-004 |
| **Acceptance Criteria** | (1) Preview updates as user edits. (2) Instagram and Facebook tabs show different formatting. (3) Long captions truncated with "more" indicator. |
| **Priority** | P1 |
| **MVP** | Yes |

---

##### TASK UI-005: Implement History screen

| Field | Value |
|-------|-------|
| **ID** | UI-005 |
| **Description** | Build apps/web/src/app/history/page.tsx. GET /api/posts. Status filter pills. Post cards with thumbnail, status badge, date, platform indicators. Click -> Review page. Duplicate and Retry actions. Empty state: "No posts yet." + Create CTA. |
| **Depends on** | HIST-001, HIST-002 |
| **Priority** | P1 |
| **MVP** | Yes |

---

##### TASK UI-006: Implement Settings screen

| Field | Value |
|-------|-------|
| **ID** | UI-006 |
| **Description** | Build apps/web/src/app/settings/page.tsx. Sections: (1) Social connections (Instagram/Facebook connect/disconnect), (2) Writing style form (StyleProfile fields), (3) AI provider selection (write-only API key -- shows "Configured" after saving), (4) Telegram config (write-only bot token + chat ID -- shows "Configured" after saving + test notification). DECISION D2: Raw API keys and tokens never returned to frontend after saving. |
| **Depends on** | SOCIAL-001e, AI-002a, NOTIFY-002a |
| **Acceptance Criteria** | (1) Connection status shown. (2) OAuth connect flow works. (3) StyleProfile saves. (4) Telegram test sends message. (5) After saving any key/token, field shows "Configured" only. |
| **Priority** | P1 |
| **MVP** | Yes |

---

## EPIC 11 -- Testing

---

##### TASK TEST-001: Unit tests for Post state machine

| Field | Value |
|-------|-------|
| **ID** | TEST-001 |
| **Description** | Vitest unit tests for all Post state transitions. Valid transitions, invalid transitions, partial success. |
| **Depends on** | POST-001a |
| **Acceptance Criteria** | All valid transitions tested. All invalid transitions throw errors. 100% state machine coverage. |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK TEST-002: Unit tests for PublishPostService

| Field | Value |
|-------|-------|
| **ID** | TEST-002 |
| **Description** | Vitest unit tests for PublishPostService with mocked adapters. Cover: happy path (Instagram Sprint 1), partial failure, full failure, idempotency (no double-publish). No notification dependencies in these tests. |
| **Depends on** | PUBLISH-001a, PUBLISH-001b, PUBLISH-002 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK TEST-003: Unit tests for PromptBuilder

| Field | Value |
|-------|-------|
| **ID** | TEST-003 |
| **Description** | Vitest unit tests for PromptBuilder. Verify StyleProfile fields (tone, hashtag rules, CTA rules, banned words) appear correctly in generated prompt. |
| **Depends on** | AI-001b |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK TEST-004: Unit tests for ReviewActionTokenService

| Field | Value |
|-------|-------|
| **ID** | TEST-004 |
| **Description** | Vitest tests for ReviewActionTokenService. Cover: expired token rejected, consumed token rejected, version mismatch rejected, valid token triggers publish. All external services mocked. |
| **Depends on** | NOTIFY-003 |
| **Priority** | P0 |
| **MVP** | Yes |

---

##### TASK TEST-005: E2E test for WF-01 (Create + Prepare + Publish to Instagram)

| Field | Value |
|-------|-------|
| **ID** | TEST-005 |
| **Description** | Playwright E2E test: Login -> Upload image -> Enter description -> Select Instagram -> Prepare Post -> Review screen -> Publish Now -> Assert success result. AI call mocked. Instagram adapter mocked. |
| **Depends on** | UI-000, UI-003, UI-004, PUBLISH-001c |
| **Acceptance Criteria** | Full flow from Login to Publish Result. Instagram shown as published. Post status = PUBLISHED in DB. |
| **Priority** | P0 |
| **MVP** | Yes |

---

## EPIC 12 -- Post-MVP Features

> Do NOT implement until MVP is complete and verified.

---

##### TASK SCHEDULE-001: Scheduling domain (Post-MVP P1)

| Field | Value |
|-------|-------|
| **ID** | SCHEDULE-001 |
| **Description** | DECISION D5: Post-MVP only. Implement PublishSchedule entity, state machine (SCHEDULED->PROCESSING->PUBLISHED/FAILED/CANCELLED), and scheduler worker (node-cron). |
| **Depends on** | PUBLISH-001a |
| **Priority** | P1 |
| **MVP** | No |

---

##### TASK AUTOSAVE-001: Auto-save draft on navigation (Post-MVP P2)

| Field | Value |
|-------|-------|
| **ID** | AUTOSAVE-001 |
| **Description** | DECISION D6: Post-MVP only. Automatic draft creation when user navigates away from Create Post. Requires beforeunload hook + API call. |
| **Depends on** | DRAFT-001 |
| **Priority** | P2 |
| **MVP** | No |

---

##### TASK AUTH-MULTI-001: Multi-user database-backed authentication (Post-MVP P2)

| Field | Value |
|-------|-------|
| **ID** | AUTH-MULTI-001 |
| **Description** | DECISION D1: Post-MVP only. Add email + passwordHash fields to User model. Registration endpoint. Password change UI. Migrate from settings.json to database credentials. |
| **Depends on** | AUTH-002 |
| **Priority** | P2 |
| **MVP** | No |

---

##### TASK STORAGE-CLOUD-001: Cloud object storage adapter (Post-MVP P1)

| Field | Value |
|-------|-------|
| **ID** | STORAGE-CLOUD-001 |
| **Description** | DECISION D4: Post-MVP only. Implement S3Adapter or R2Adapter implementing StorageService interface. |
| **Depends on** | MEDIA-001a |
| **Priority** | P1 |
| **MVP** | No |

---

##### TASK NOTIFY-005: Email notification adapter (Post-MVP P2)

| Field | Value |
|-------|-------|
| **ID** | NOTIFY-005 |
| **Description** | Implement EmailNotificationAdapter implementing NotificationChannel. Use SendGrid or Resend. |
| **Depends on** | NOTIFY-001 |
| **Priority** | P2 |
| **MVP** | No |

---

## WBS Summary

| Epic | MVP Tasks | Post-MVP Tasks |
|------|-----------|----------------|
| EPIC 1 -- Foundation | ARCH-001--005, DB-001--006, AUTH-001--003 | AUTH-MULTI-001 (P2) |
| EPIC 2 -- Social Connections | SOCIAL-001a--e (Sprint 1), SOCIAL-002a--b (Sprint 2) | LinkedIn+ |
| EPIC 3 -- Media Upload | MEDIA-001a--c | STORAGE-CLOUD-001 (P1) |
| EPIC 4 -- Post Domain | POST-001a--b | -- |
| EPIC 5 -- AI Content | AI-001a--e, AI-002a | OpenAI/Claude adapters |
| EPIC 6 -- Review | REVIEW-001--002 | -- |
| EPIC 7 -- Publishing | PUBLISH-001a--c, PUBLISH-002 | -- |
| EPIC 8 -- Notifications | NOTIFY-001--004 | NOTIFY-005 (P2) |
| EPIC 9 -- Draft/History | DRAFT-001, HIST-001--002 | AUTOSAVE-001 (P2) |
| EPIC 10 -- Frontend | UI-000, UI-001--006, UI-004b | -- |
| EPIC 11 -- Testing | TEST-001--005 | More E2E coverage |
| EPIC 12 -- Post-MVP | -- | SCHEDULE-001, AUTOSAVE-001, AUTH-MULTI-001, STORAGE-CLOUD-001, NOTIFY-005 |

---

## Implementation Order (Sprint Sequence)

### Sprint 1 -- Instagram Vertical Slice
**Goal:** WF-01 works end-to-end. Login -> Create -> AI -> Review -> Publish to Instagram.

Tasks in order: ARCH-001, ARCH-002, ARCH-003, ARCH-004, ARCH-005, DB-001, DB-002, DB-003, DB-004, DB-005, AUTH-001, AUTH-002, AUTH-003, SOCIAL-001a, SOCIAL-001b, SOCIAL-001c, SOCIAL-001d, SOCIAL-001e, MEDIA-001a, MEDIA-001b, MEDIA-001c, POST-001a, POST-001b, AI-001a, AI-001b, AI-001c, AI-001d, AI-001e, AI-002a, REVIEW-001, PUBLISH-001a, PUBLISH-001b, PUBLISH-001c, UI-000, UI-001, UI-002, UI-003, UI-004, TEST-001, TEST-002, TEST-003, TEST-005

### Sprint 2 -- Facebook + Multi-Platform
**Goal:** WF-06 and WF-07 work. Publish to both platforms. Handle partial failures.

Tasks: SOCIAL-002a, SOCIAL-002b, PUBLISH-002, REVIEW-002, UI-004b

### Sprint 3 -- Telegram + Draft/History
**Goal:** Telegram POST and VIEW DETAIL work. Explicit Save Draft and History work.

Tasks: DB-006, NOTIFY-001, NOTIFY-002a, NOTIFY-002b, NOTIFY-003, NOTIFY-004, DRAFT-001, HIST-001, HIST-002, TEST-004, UI-005, UI-006

### Sprint 4 -- Hardening
**Goal:** All error states handled. Tests complete. Security reviewed.

Tasks: Security review, additional tests, error UX polish
