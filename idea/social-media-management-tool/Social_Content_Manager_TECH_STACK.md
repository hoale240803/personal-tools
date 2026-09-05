# Social Content Manager — Technology Stack

> **Status:** Approved for implementation
> **Revision:** 2026-08-29 — Cross-document consistency revision applied (D1-D6)
> **Decisions applied:** D1 (Single-user auth), D2 (Credentials outside DB), D3 (Instagram-first), D4 (Local storage MVP), D5 (Scheduling Post-MVP), D6 (Explicit Save Draft)
> **Do NOT modify** Business Requirements or Architecture Plan based on this document.

---

## Guiding Principle

> Do not optimize for complexity. Prefer the simplest architecture that satisfies the requirements.

The architecture plan mandates a **modular monolith** for the MVP. This tech stack reflects that decision. No microservices, no separate deployment units, no premature extraction.

---

## 1. Frontend

### Technology: Next.js (App Router) + TypeScript

**Why needed:**
The product requires multiple screens (Create Post, Review, History, Settings), explicit workflow states (EMPTY -> MEDIA_SELECTED -> PREPARING -> READY_FOR_REVIEW -> PUBLISHING -> RESULT), and reactive UI updates (upload progress, AI preparation state, publish results per platform).

> **Note on UI updates:** UI state changes are driven by polling GET /api/posts/:id or by response data from API calls. There is no WebSocket or SSE in MVP. Any prior reference to "real-time updates" means "reactive response to API state changes."

**Why it fits:**
- Next.js provides a clean file-based routing system that maps directly to the three primary screens defined in the BRD.
- The architecture plan defines an explicit frontend state machine (Section 15). React state management maps naturally to this.
- TypeScript aligns with the TypeScript backend and the hl-sdk-ts SDK.

**Relationship to architecture:**
Sits at the top of the dependency hierarchy. Calls the Application API only. Never calls hl-sdk-ts or Meta APIs directly (Architecture Plan Section 16).

**MVP or Later:** MVP -- required from Sprint 1.

### Styling: Vanilla CSS / CSS Modules

**MVP or Later:** MVP.

### State Management: React built-in (useState / useReducer / Context)

**Why needed:** The frontend state machine (Architecture Plan Section 15) has 9 named states. A reducer is the natural fit for managing explicit state transitions.

**MVP or Later:** MVP.

---

## 2. Backend

### Technology: Node.js + Express + TypeScript

**Why needed:**
The Architecture Plan defines a modular monolith with controllers, application services, domain modules, and integration adapters.

**Why it fits:**
- TypeScript is consistent with hl-sdk-ts (TypeScript-based per Architecture Plan Section 2).
- Express is minimal and aligns with the "simplest architecture" principle.
- Module structure maps directly to Express routers.
- The API surface defined in Architecture Plan Section 12 is a standard REST API.

**Relationship to architecture:**
Implements the Application Layer. Only the src/integrations/hl-sdk/ subdirectory imports hl-sdk-ts.

**MVP or Later:** MVP.

### Runtime: Node.js 20 LTS

**MVP or Later:** MVP.

---

## 3. Database

### Technology: PostgreSQL

**Why needed:**
The data model includes relational entities: User, StyleProfile, SocialAccount, Post, PostMedia, PostPlatformContent, PublishAttempt, NotificationPreference, NotificationDelivery, ReviewActionToken. These require FK relationships and ACID transactions.

**Relationship to architecture:**
Accessed only through the ORM. Domain entities must not directly depend on ORM types (Architecture Plan Section 19).

**MVP or Later:** MVP.

### ORM: Prisma

**MVP or Later:** MVP.

---

## 4. Authentication

### Technology: Session-based auth with fixed single-user credentials (MVP)

**Decision D1 -- Single-user MVP:**
This is a personal-use tool. MVP implements single-user authentication using a fixed credential stored in settings.json (the local secure configuration file, never committed). There is no user registration, no password-reset flow, and no multi-user management in MVP.

> **Rationale:** Email/password with bcrypt stored in the database, a UserCredential entity, and multi-user account management are Post-MVP. Adding them now creates unnecessary complexity ("Multi-user/team collaboration: Not in MVP" per BRD).

**What MVP implements:**
- POST /auth/login: reads configured credential from settings.json, validates bcrypt hash (hash never stored in DB).
- Session cookie (express-session) attaches a fixed single userId to the session.
- requireAuth middleware protects all API routes.
- POST /auth/logout: destroys session.

**What MVP defers to Post-MVP:**
- User credentials stored in the database.
- Email uniqueness constraint and registration endpoint.
- Password change UI.
- Multi-user session isolation.

**Decision D2 -- Credentials outside the database:**
The single user's hashed password is stored in settings.json (local secure config, gitignored). It is NOT stored in the PostgreSQL database. The User row in the database exists for FK references only; it contains no credential fields.

**Relationship to architecture:**
Session middleware in src/app/middleware/. Controllers extract userId from session. Domain modules never handle raw session data.

**MVP or Later:** Session-based auth with settings.json credentials = MVP. Database-backed multi-user auth = Post-MVP.

---

## 5. File / Image Storage

### Technology: Local filesystem (MVP) -> Cloud object storage (Post-MVP)

**Decision D4 -- Local filesystem for MVP.**

**Why it fits (Local, MVP):**
- Local filesystem is the simplest approach for personal local use.
- The storageKey abstraction means swapping to cloud storage later does not change business logic.
- No external service dependencies in MVP.

**Why it fits (Post-MVP):**
- Cloud object store (AWS S3, Cloudflare R2) provides durability and URL-based access for deployed environments.

**Relationship to architecture:**
Only src/infrastructure/storage/ knows the storage backend. Media module uses a StorageService interface.

**MVP or Later:** Local filesystem = MVP. Cloud storage = Post-MVP.

---

## 6. AI / LLM Integration

### Technology: AI Provider Adapter (pluggable) -- Default: Google Gemini

**Why needed:**
AI caption, hashtag, CTA, and location generation is the core value proposition (BRD Section 1). Architecture Plan (Section 6) mandates an AIContentService interface with interchangeable adapters.

**Relationship to architecture:**
Only src/integrations/ai/ imports AI provider SDKs.

**MVP or Later:** MVP -- one adapter (Gemini) required. Additional adapters (OpenAI, Claude) = Post-MVP.

---

## 7. Social Platform Integrations

### Technology: hl-sdk-ts (GitHub: hoale240803/hl-sdk-ts)

**Why needed:**
Architecture Plan (Section 2) explicitly mandates hl-sdk-ts as the SDK.

**Decision D3 -- Instagram-first, then Facebook:**

The architecture supports both Instagram and Facebook. MVP implementation proceeds in this order:

| Sprint | Platform | Rationale |
|--------|----------|-----------|
| Sprint 1 | Instagram only | Vertical slice: one complete end-to-end publish flow. |
| Sprint 2 | Facebook added | Second adapter follows the same pattern. |

> **WARNING:** Do NOT implement a duplicate full vertical slice for Facebook in Sprint 1. The SocialPlatformService interface and HlSdkErrorMapper are shared. Only the HlFacebookAdapter is new in Sprint 2.

**Important constraint:** The coding agent must inspect actual hl-sdk-ts exports before implementing adapters. Method names must not be invented (Architecture Plan Section 24).

**MVP or Later:** Instagram adapter = MVP Sprint 1. Facebook adapter = MVP Sprint 2. LinkedIn = Post-MVP.

---

## 8. Background Jobs / Scheduling

### Technology: None (MVP) -> node-cron (Post-MVP P1)

**Decision D5 -- Scheduling is Post-MVP.**

The BRD explicitly excludes scheduling: "Not in MVP: Future scheduling/recurring posting."

**MVP:** No background job runner. No scheduler worker. No PublishSchedule entity.

**Post-MVP (P1):** node-cron added when scheduling feature is implemented.

**MVP or Later:** No background jobs in MVP. node-cron = Post-MVP P1.

---

## 9. Notification System

### Technology: Telegram Bot API (MVP) + NotificationChannel abstraction (extensible)

**Why needed:**
Architecture Plan (Sections 26-33) defines Telegram as the MVP notification channel. When a post reaches READY_FOR_REVIEW, a Telegram message with POST and VIEW DETAIL inline keyboard buttons is sent.

**Dependency graph (acyclic):**
`
Post lifecycle -> PostReadyForReview event -> ReviewNotificationService
              -> TelegramNotificationAdapter -> Telegram Bot API

Telegram callback -> ReviewActionToken validation -> PublishPostService
                                                   -> SocialPlatformService -> hl-sdk-ts
`
PublishPostService does NOT depend on TelegramNotificationAdapter. These are separate call chains with no cycle. Telegram is a remote-action interface layered on top of the publishing system; it does not own publishing.

**Decision D2 -- Telegram credentials outside the database:**
- TELEGRAM_BOT_TOKEN is stored in settings.json or environment variable. Never in the database.
- UI (Settings screen) allows entry of bot token and chat ID. API writes to settings.json. Tokens are never returned to the frontend after being saved.

**MVP or Later:** Telegram = MVP. Email, Push = Post-MVP (P2).

---

## 10. Email Integration

**MVP or Later:** Post-MVP (P2). Will implement EmailNotificationAdapter implementing NotificationChannel.

---

## 11. Deployment

### MVP: Local development machine (personal use)

### Post-MVP: Single cloud server (VPS/container)

**MVP or Later:** Local = MVP. VPS = Post-MVP.

---

## 12. Hosting

### Frontend: Next.js dev server (MVP) -> Vercel (Post-MVP)

### Backend: Express dev server (MVP) -> Same VPS (Post-MVP)

**MVP or Later:** Local = MVP. VPS + Vercel = Post-MVP.

---

## 13. Monitoring / Logging

### Technology: Structured logging with pino (MVP)

**MVP or Later:** pino = MVP. External log service = Post-MVP.

---

## 14. Testing

### Framework: Vitest (unit + integration) + Playwright (E2E)

**Test structure:**
`
tests/
+-- unit/          (posts, ai-content, publishing, style, notifications)
+-- integration/   (social, database, storage)
+-- e2e/           (wf-01, wf-04, wf-06, wf-07, wf-08)
`

**MVP or Later:** Unit + integration tests = MVP. E2E = MVP for P0 workflows, Post-MVP for P1 workflows.

---

## 15. Local Development Environment

### Required local tools:
- Node.js 20 LTS
- PostgreSQL (local instance or Docker)
- Package manager: npm (default)

### Local configuration:
- settings.json -- local credentials (never committed), per workspace secure-config convention
- .env -- environment-specific config, gitignored
- docker-compose.yml (optional) -- for local PostgreSQL

> **Decision D2:** All secrets (social platform credentials, AI API keys, Telegram bot token, single-user password hash) live in settings.json. This file is in .gitignore and must never be committed.

### Dev servers:
- Frontend: npm run dev (Next.js, port 3000)
- Backend: npm run dev (tsx watch, port 4000)

---

## 16. Environment Variables / Secrets

### Strategy: settings.json (local) + environment variables (deployment)

Per workspace agent-rules and Architecture Plan Section 16. Credentials never committed.

**Required configuration (MVP):**
`
DATABASE_URL
SESSION_SECRET
APP_USER_PASSWORD_HASH         -- hashed password for single-user login (settings.json, NOT DB)
AI_PROVIDER                    (gemini | openai | claude)
AI_API_KEY
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
INSTAGRAM_CLIENT_ID
INSTAGRAM_CLIENT_SECRET
FACEBOOK_APP_ID
FACEBOOK_APP_SECRET
STORAGE_PATH
`

> **Decision D2:** None of the above are stored in the PostgreSQL database. SocialAccount.credentialReference stores a key name (string pointer), not the actual token value.

---

## 17. Third-Party Services

| Service | Purpose | Required for MVP | Notes |
|---------|---------|-----------------|-------|
| Meta Developer App | Instagram + Facebook OAuth, Graph API | Yes | Requires Facebook Developer account |
| Google AI (Gemini) | AI caption/hashtag/CTA generation | Yes (default) | API key required |
| Telegram Bot API | Review notifications + quick publish | Yes | BotFather token required |
| OpenAI API | Alternative AI adapter | No | Post-MVP |
| Anthropic Claude API | Alternative AI adapter | No | Post-MVP |
| AWS S3 / Cloudflare R2 | Cloud image storage | No | Post-MVP |
| SendGrid / Resend | Email notifications | No | Post-MVP (P2) |
| Datadog / Logtail | Log aggregation | No | Post-MVP |

---

## 18. Technology Decision Summary

| Layer | Technology | MVP |
|-------|-----------|-----|
| Frontend framework | Next.js (App Router) + TypeScript | Yes |
| Styling | Vanilla CSS / CSS Modules | Yes |
| Frontend state | React useReducer | Yes |
| Backend framework | Express + TypeScript | Yes |
| Runtime | Node.js 20 LTS | Yes |
| Database | PostgreSQL | Yes |
| ORM | Prisma | Yes |
| Authentication | Session-based, single-user, settings.json credentials | Yes |
| Multi-user auth (DB-backed) | -- | Post-MVP |
| File storage | Local filesystem | Yes |
| File storage (cloud) | S3 / R2 | Post-MVP |
| AI integration | Gemini adapter (default) | Yes |
| Additional AI adapters | OpenAI, Claude | Post-MVP |
| Social SDK | hl-sdk-ts | Yes |
| Instagram adapter | Sprint 1 | Yes |
| Facebook adapter | Sprint 2 | Yes |
| Background jobs / Scheduler | None | Post-MVP |
| Scheduling (node-cron) | -- | Post-MVP (P1) |
| Notifications | Telegram Bot API | Yes |
| Email notifications | TBD provider | Post-MVP (P2) |
| Logging | pino | Yes |
| Unit/Integration tests | Vitest | Yes |
| E2E tests | Playwright | Yes (P0 flows) |
| Deployment | Local (MVP) / VPS (Post-MVP) | Yes |
| Package manager | npm | Yes |

---

## Closed Decisions

### OQ-1: Authentication mechanism -- CLOSED (D1)
**Decision:** Single-user, fixed credentials in settings.json. Password hash stored in settings.json, NOT the database. Email/password DB auth is Post-MVP.

### OQ-2: Package manager -- CLOSED
**Decision:** npm (default). pnpm acceptable if preferred by the developer.

### OQ-3: Monorepo structure -- CLOSED
**Decision:** Monorepo -- apps/web/ + apps/api/ in a single repository.

### OQ-4: Telegram webhook vs. long polling -- CLOSED
**Decision:** Long polling for MVP (local dev; no public URL required). Webhook for Post-MVP deployment.
