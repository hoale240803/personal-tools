# Social Content Manager — Architecture Plan

## 1. Purpose

This document defines the technical architecture for the Social Content Manager MVP.

Phase 1 is a personal-use application focused on:
- Instagram
- Facebook
- original image upload
- AI caption generation
- AI hashtags
- CTA
- location suggestion
- personal writing style
- human review/edit
- publish now
- drafts/history
- publish error handling and retry

The architecture must later support:
- multiple users
- multiple brands/workspaces
- TikTok
- Google Business Profile
- scheduling
- analytics
- team roles

**Core principle: AI prepares content. The user approves it. Social adapters publish it.**

---

## 2. SDK Decision

Use:

`hl-sdk-ts`

GitHub:
https://github.com/hoale240803/hl-sdk-ts

The repository currently identifies itself as `@hl/facebook-sdk`, is TypeScript-based, and contains separate `services`, `helpers`, `types`, and `errors` areas. Its package scripts also include Facebook, Instagram, LinkedIn, Gemini and Google-auth test targets. Its agent rules require service/helper separation and credentials in `settings.json`.

Do not let application business logic depend directly on SDK-specific method names/types.

Required boundary:

```text
Application
    ↓
SocialPlatformService
    ↓
InstagramAdapter / FacebookAdapter
    ↓
hl-sdk-ts
    ↓
Meta APIs
```

---

## 3. Architecture Style

Use a **modular monolith** for the MVP.

Do not start with microservices. The first release has one primary user, modest content volume and simple workflows. Explicit module boundaries still allow later extraction.

```text
┌──────────────────────────────────────────────────────────────┐
│                        Web Application                       │
│  Create Post │ Review │ History │ Settings │ Calendar       │
└──────────────────────────────┬───────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────┐
│                         Application API                      │
│  PostController │ SocialAccountController │ AIController    │
└──────────────────────────────┬───────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────┐
│                       Application Layer                      │
│ CreatePost │ PrepareContent │ Review │ Publish │ Draft/History│
└───────────────┬──────────────────────┬───────────────────────┘
                ↓                      ↓
┌─────────────────────────┐   ┌────────────────────────────────┐
│      AI Boundary        │   │       Social Boundary          │
│ AIContentService        │   │ SocialPlatformService          │
│ StyleService            │   │ InstagramAdapter               │
│ PromptBuilder           │   │ FacebookAdapter                 │
└─────────────────────────┘   └───────────────┬────────────────┘
                                               ↓
                                      ┌─────────────────┐
                                      │   hl-sdk-ts     │
                                      └────────┬────────┘
                                               ↓
                                      Instagram/Facebook
```

---

## 4. Module Structure

```text
src/
├── app/
│   ├── controllers/
│   ├── routes/
│   └── middleware/
│
├── modules/
│   ├── posts/
│   ├── media/
│   ├── ai-content/
│   ├── social/
│   ├── publishing/
│   ├── drafts/
│   ├── history/
│   └── settings/
│
├── integrations/
│   ├── hl-sdk/
│   └── ai/
│
├── infrastructure/
│   ├── database/
│   ├── storage/
│   ├── logging/
│   └── config/
│
└── shared/
    ├── types/
    ├── errors/
    ├── helpers/
    └── constants/
```

### Module responsibilities

**Posts**
- create/update/load posts
- post status transitions
- attach media/platform content
- validate post state

**Media**
- upload/validate images
- object storage
- previews/metadata
- reorder/remove media

**AI Content**
- prompt construction
- personal style
- caption/hashtag/CTA/location generation
- platform adaptation
- regeneration
- AI response validation

**Social**
- social account connections
- connection status
- platform adapters

**Publishing**
- validation
- publish attempts
- idempotency
- retries
- results

**Drafts/History**
- save/resume drafts
- list previous posts
- duplicate/reuse

---

## 5. hl-sdk-ts Integration Boundary

Only files under this directory may directly import the SDK:

```text
src/integrations/hl-sdk/
├── HlSdkFactory.ts
├── HlFacebookAdapter.ts
├── HlInstagramAdapter.ts
├── HlAuthAdapter.ts
├── HlSdkErrorMapper.ts
└── HlSdkTypes.ts
```

Business/application modules must not import `hl-sdk-ts`.

The application depends on its own interface:

```ts
interface SocialPlatformService {
  connect(input: ConnectAccountInput): Promise<SocialAccount>;
  disconnect(accountId: string): Promise<void>;
  getConnectionStatus(accountId: string): Promise<ConnectionStatus>;
  validatePublish(input: PublishValidationInput): Promise<ValidationResult>;
  publish(input: PublishInput): Promise<PublishResult>;
}
```

Before implementing SDK calls, the coding agent must inspect the actual exports/specs in `hl-sdk-ts`. It must not invent method names.

---

## 6. AI Architecture

AI is also behind an application boundary:

```text
AIContentService
      ├── GeminiAdapter
      ├── OpenAIAdapter
      ├── ClaudeAdapter
      └── LocalModelAdapter
```

Suggested contract:

```ts
interface AIContentService {
  prepareContent(input: PrepareContentInput): Promise<PreparedContent>;
  regenerateContent(input: RegenerateContentInput): Promise<PreparedContent>;
}
```

Input includes:
- image references
- user description
- content goal
- content pillar
- target platforms
- StyleProfile
- location context

Output includes:
- platform-specific caption
- hashtags
- CTA
- location suggestion
- warnings

AI must never directly publish.

---

## 7. Personal Style

Make personal style a first-class domain object:

```text
StyleProfile
├── language
├── tone
├── brandVoice
├── emojiLevel
├── captionStructure
├── CTA rules
├── hashtag rules
├── required hashtags
├── banned hashtags
├── preferred words
├── banned words
└── location defaults
```

Flow:

```text
User
  ↓
StyleProfile
  ↓
PromptBuilder
  ↓
AIContentService
  ↓
Prepared Content
```

Do not hard-code the user's writing style inside controllers or prompts.

---

## 8. Data Model

### User

```text
User
- id
- name
- email
- timezone
- defaultStyleProfileId
- createdAt
- updatedAt
```

Keep `userId` even in personal MVP so multi-user expansion does not require rewriting the model.

### StyleProfile

```text
StyleProfile
- id
- userId
- name
- language
- tone
- brandVoice
- emojiLevel
- captionTemplate
- ctaRules
- hashtagRules
- requiredHashtags
- bannedHashtags
- preferredWords
- bannedWords
- createdAt
- updatedAt
```

### SocialAccount

```text
SocialAccount
- id
- userId
- platform
- externalAccountId
- accountName
- connectionStatus
- credentialReference
- connectedAt
- lastValidatedAt
- lastErrorCode
- lastErrorMessage
```

Never store raw access tokens in ordinary business records.

### Post

```text
Post
- id
- userId
- status
- description
- goal
- contentPillar
- location
- createdAt
- updatedAt
```

### PostMedia

```text
PostMedia
- id
- postId
- storageKey
- mediaType
- sortOrder
- width
- height
- createdAt
```

### PostPlatformContent

```text
PostPlatformContent
- id
- postId
- platform
- caption
- hashtags
- cta
- location
- aiGenerated
- userEdited
- approvedAt
- createdAt
- updatedAt
```

This allows Instagram and Facebook to have different final content.

### PublishAttempt

```text
PublishAttempt
- id
- postId
- platform
- idempotencyKey
- status
- externalPostId
- externalPostUrl
- errorCode
- errorMessage
- startedAt
- completedAt
```

---

## 9. Post State Machine

Use explicit states:

```text
DRAFT
  ↓
PREPARING
  ↓
READY_FOR_REVIEW
  ↓
PUBLISHING
  ├──→ PUBLISHED
  ├──→ PARTIAL_SUCCESS
  └──→ FAILED
             ↓
           RETRY
             ↓
         PUBLISHING
```

Manual editing occurs while the post is `READY_FOR_REVIEW`.

Do not allow arbitrary status transitions.

---

## 10. Publishing Architecture

Publishing is a business process, not a raw HTTP request.

```text
User clicks Publish
        ↓
PublishPostService
        ↓
Validate post
        ↓
Create PublishAttempt
        ↓
Platform Adapter
        ↓
hl-sdk-ts
        ↓
Meta API
        ↓
PublishResult
        ↓
Persist result
        ↓
Update Post status
```

Instagram and Facebook must be executed independently.

Example:

```text
Instagram = SUCCESS
Facebook  = FAILED
```

Overall status:

```text
PARTIAL_SUCCESS
```

The application must preserve both results.

---

## 11. Idempotency and Retry

A timeout can happen after a social platform has already accepted the post.

Therefore every publish attempt needs:

```text
publishAttemptId
postId
platform
idempotencyKey
status
externalPostId
externalPostUrl
startedAt
completedAt
errorCode
errorMessage
```

Retry must first determine whether the previous attempt may have succeeded.

The goal is to prevent duplicate posts.

---

## 12. API Design

### Posts

```http
POST   /api/posts
GET    /api/posts/:id
PATCH  /api/posts/:id
DELETE /api/posts/:id
```

### Media

```http
POST /api/media
DELETE /api/media/:id
PATCH /api/posts/:postId/media/order
```

### AI

```http
POST /api/posts/:id/prepare
POST /api/posts/:id/regenerate
```

### Review

```http
PATCH /api/posts/:id/platform-content/:platform
POST  /api/posts/:id/approve
```

### Publishing

```http
POST /api/posts/:id/publish
POST /api/posts/:id/publish/retry
GET  /api/posts/:id/publish-attempts
```

### Social Accounts

```http
GET    /api/social-accounts
POST   /api/social-accounts/:platform/connect
DELETE /api/social-accounts/:id
POST   /api/social-accounts/:id/validate
```

---

## 13. Create Post Workflow

```text
Browser
   │
   │ upload image
   ↓
Media API
   ↓
Object Storage
   ↓
mediaId
   │
   │ create post
   ↓
Post API
   ↓
Post = DRAFT
   │
   │ Prepare
   ↓
PrepareContentService
   ├── Load StyleProfile
   ├── Load media metadata
   ├── Load description
   └── Build AI input
             ↓
       AIContentService
             ↓
       PreparedContent
             ↓
       PostPlatformContent
             ↓
       READY_FOR_REVIEW
```

---

## 14. Publish Workflow

```text
Browser
   │
   │ Publish
   ↓
PublishPostService
   ├── validate Post
   ├── validate SocialAccount
   ├── validate platform content
   └── create PublishAttempt
             ↓
      InstagramAdapter
             ↓
         hl-sdk-ts
             ↓
         Instagram
             ↓
       PublishResult
             ↓
      Persist result
```

Facebook follows the same pattern through `FacebookAdapter`.

---

## 15. Frontend State

The Create Post UI should use explicit workflow states:

```text
EMPTY
 ↓
MEDIA_SELECTED
 ↓
DESCRIPTION_READY
 ↓
PREPARING
 ↓
READY_FOR_REVIEW
 ↓
EDITING
 ↓
PUBLISHING
 ↓
RESULT
```

Important UI states:
- uploading
- upload failed
- preparing
- AI generation failed
- ready
- editing
- publishing
- Instagram success
- Facebook success
- partial success
- publish failed
- retrying

Avoid deriving the workflow from many unrelated booleans.

---

## 16. Security

The browser must call the application API, not `hl-sdk-ts` or Meta APIs directly.

```text
Browser
   ↓
Application API
   ↓
hl-sdk-ts
   ↓
Meta
```

Never expose:
- access tokens
- refresh tokens
- social client secrets
- AI API keys

Follow the SDK repository's agent rule that credentials belong in `settings.json` for local development. For production, inject secrets through the deployment secret manager/environment.

---

## 17. Error Architecture

Application-level errors:

```text
AppError
├── ValidationError
├── AuthenticationError
├── AuthorizationError
├── SocialConnectionError
├── SocialPublishError
├── AIProviderError
├── MediaUploadError
├── IdempotencyError
└── ConfigurationError
```

SDK-specific errors must be translated:

```text
hl-sdk-ts error
      ↓
HlSdkErrorMapper
      ↓
Application error
      ↓
API response
      ↓
User-friendly UI
```

Do not expose raw SDK errors to the frontend.

---

## 18. Testing

```text
tests/
├── unit/
│   ├── posts/
│   ├── ai-content/
│   ├── publishing/
│   └── style/
│
├── integration/
│   ├── social/
│   ├── database/
│   └── storage/
│
└── e2e/
    ├── wf-01-create-publish/
    ├── wf-04-regenerate/
    ├── wf-06-multi-platform/
    ├── wf-07-retry/
    └── wf-08-draft/
```

P0 workflows must have automated tests.

---

## 19. Dependency Rules

Required dependency direction:

```text
UI
 ↓
API
 ↓
Application
 ↓
Domain
 ↓
Infrastructure / Integrations
```

Forbidden:

```text
Controller → hl-sdk-ts
Domain → hl-sdk-ts
Domain → ORM
AI Prompt → Facebook API
Post Entity → Instagram SDK
```

Only the integration layer knows SDK-specific details.

---

## 20. Repository Structure

Recommended:

```text
social-content-manager/
│
├── .ai/
│   ├── PLAN.md
│   ├── ARCHITECTURE.md
│   ├── BUSINESS_REQUIREMENTS.md
│   └── WORKFLOWS.md
│
├── agent-rules/
│   ├── architecture.md
│   ├── coding.md
│   ├── testing.md
│   └── security.md
│
├── apps/
│   └── web/
│
├── src/
│   ├── app/
│   ├── modules/
│   │   ├── posts/
│   │   ├── media/
│   │   ├── ai-content/
│   │   ├── social/
│   │   ├── publishing/
│   │   ├── drafts/
│   │   ├── history/
│   │   └── settings/
│   ├── integrations/
│   │   ├── hl-sdk/
│   │   └── ai/
│   ├── infrastructure/
│   │   ├── database/
│   │   ├── storage/
│   │   └── logging/
│   └── shared/
│
├── tests/
├── settings.json
├── package.json
└── README.md
```

---

## 21. First Vertical Slice

Do not implement the whole product at once.

First implement:

```text
Upload image
    ↓
Create Post
    ↓
Enter description
    ↓
Prepare with AI
    ↓
Generate Instagram caption
    ↓
Generate hashtags
    ↓
Review/Edit
    ↓
Publish Instagram
    ↓
Show result
```

This is the first Golden Workflow: **WF-01**.

Only after WF-01 works should Facebook and multi-platform publishing be added.

---

## 22. First Architecture Tickets

### ARCH-001 — Application skeleton
Create the project structure and dependency boundaries.

Acceptance:
- app starts
- modules exist
- integration layer exists
- tests run
- business logic has no direct SDK dependency

### ARCH-002 — hl-sdk-ts integration
Create:
- `HlSdkFactory`
- `HlInstagramAdapter`
- `HlFacebookAdapter`
- `HlSdkErrorMapper`

Acceptance:
- only integration layer imports SDK
- SDK configuration is isolated
- SDK errors are mapped
- adapters are mockable

The agent must inspect the actual SDK exports/specs before implementation.

### POST-001 — Post domain
Implement:
- Post
- PostMedia
- PostPlatformContent
- state transitions

### MEDIA-001 — Image upload
Implement:
- validation
- object storage
- metadata
- ordering

### AI-001 — AI content contract
Implement:
- AIContentService
- PrepareContentInput
- PreparedContent
- PromptBuilder
- response validation

### AI-002 — Personal Style
Implement StyleProfile and PromptBuilder integration.

### SOCIAL-001 — Instagram connection
Implement:
- connect
- status
- validate
- credential reference

### PUBLISH-001 — Instagram publish
Implement:
- validation
- PublishAttempt
- idempotency key
- adapter call
- result persistence

### PUBLISH-002 — Failure/retry
Implement:
- failure state
- retry
- duplicate protection
- user-visible error

### SOCIAL-002 — Facebook
Start only after Instagram WF-01 passes.

---

## 23. Definition of Architecture Done

- [ ] Business requirements map to modules.
- [ ] WF-01 is fully defined.
- [ ] Post state machine is approved.
- [ ] Social adapter boundary is approved.
- [ ] AI service boundary is approved.
- [ ] hl-sdk-ts integration boundary is approved.
- [ ] Data model is approved.
- [ ] Error model is approved.
- [ ] Idempotency strategy is approved.
- [ ] P0 acceptance criteria are defined.
- [ ] AI coding agent has explicit dependency rules.

---

## 24. AI Agent Operating Procedure

The coding agent must work in this order:

```text
Read BUSINESS_REQUIREMENTS.md
        ↓
Read ARCHITECTURE.md
        ↓
Read WORKFLOWS.md
        ↓
Select one WBS ticket
        ↓
Inspect existing code
        ↓
Inspect hl-sdk-ts exports/specs
        ↓
Plan files + dependencies + tests
        ↓
Implement
        ↓
Run tests
        ↓
Verify acceptance criteria
        ↓
Update WBS/status
        ↓
Update AGENT_STATE.md
```

The agent must not invent SDK APIs.

---

## 25. Evolution Path

### Phase 1 — Personal MVP

```text
One User
   ↓
Modular Monolith
   ↓
Instagram + Facebook
```

### Phase 2 — Personal Power Tool

```text
One User
   ↓
Multiple Brands/Profiles
   ↓
Instagram + Facebook + TikTok + Google
   ↓
Scheduling + Analytics
```

### Phase 3 — SaaS

```text
Tenant
 ├── Users
 ├── Brand Profiles
 ├── Social Accounts
 ├── Style Profiles
 ├── Content
 └── Publishing Jobs
```

Keeping `userId`, `StyleProfile`, `PostPlatformContent`, platform adapters and `PublishAttempt` explicit from the beginning is the main architectural decision that enables this evolution without rewriting the core publishing workflow.



# 26. Review Notification & Quick Publish Architecture

## 26.1 Requirement

When AI preparation is complete and a post reaches:

```text
READY_FOR_REVIEW
```

the system should notify the user through a configurable notification channel.

MVP channel:

```text
Telegram
```

Future channels:

```text
Gmail
Push Notification
Email
Slack
Discord
```

The notification is not merely an alert. It is an **actionable review request**.

The user should be able to:

1. See a compact preview.
2. **POST** immediately.
3. **VIEW DETAIL** and review/edit first.
4. Later choose a schedule date/time.

---

## 26.2 Important Architectural Decision

Do not put Telegram logic inside `PostService` or `PublishingService`.

Use a separate notification abstraction:

```text
ReviewNotificationService
          ↓
NotificationChannel
          ├── TelegramNotificationAdapter
          ├── EmailNotificationAdapter
          ├── GmailNotificationAdapter
          └── PushNotificationAdapter
```

The business event remains:

```text
PostReadyForReview
```

The notification channel is an implementation detail.

This allows Telegram to be replaced or supplemented later without changing the post workflow.

---

## 26.3 Event-Driven Flow

Recommended flow:

```text
AI Preparation
      ↓
Post = READY_FOR_REVIEW
      ↓
PostReadyForReview Event
      ↓
Notification Orchestrator
      ↓
User Notification Preferences
      ↓
Telegram Adapter
      ↓
Telegram Message
```

The notification should be triggered by the **state transition**, not by the frontend.

This is important because a post may become ready through:
- Web UI
- background AI processing
- regeneration
- future automation/scheduling
- API

All paths should produce the same notification behavior.

---

# 27. Telegram Review Message

## 27.1 Example

```text
📝 READY FOR REVIEW

🏠 Căn hộ 2PN view sông tuyệt đẹp
📱 Instagram + Facebook

━━━━━━━━━━━━━━━━━━

[IMAGE PREVIEW]

Caption:
Căn hộ 2PN với view sông tuyệt đẹp...
nội thất hiện đại, không gian thoáng...

#canho #hochiminh #batdongsan

📍 Bình Thạnh, Hồ Chí Minh

━━━━━━━━━━━━━━━━━━

🤖 AI prepared
✏️ Review before publishing

[ 🚀 POST ]    [ 👀 VIEW DETAIL ]
```

The exact content should be configurable through a notification template.

---

# 28. Telegram Actions

The two primary actions are:

```text
POST
VIEW DETAIL
```

### POST

This is a **quick publish** action.

Flow:

```text
Telegram
   ↓
POST
   ↓
Application API
   ↓
Validate READY_FOR_REVIEW
   ↓
PublishPostService
   ↓
InstagramAdapter
   ↓
FacebookAdapter
   ↓
Publish Result
   ↓
Telegram confirmation
```

Example:

```text
✅ POSTED

Instagram: ✅
Facebook: ✅

Published successfully.
```

If only one platform succeeds:

```text
⚠️ PARTIALLY POSTED

Instagram: ✅
Facebook: ❌

Facebook failed.
[ VIEW DETAILS ] [ RETRY FACEBOOK ]
```

### VIEW DETAIL

Open the application's post-detail page.

Recommended:

```text
Telegram
   ↓
VIEW DETAIL
   ↓
Authenticated application URL
   ↓
Post Review Screen
```

The detail page allows:

- inspect all images
- edit caption
- edit CTA
- edit hashtags
- edit location
- select/deselect platforms
- regenerate AI content
- save draft
- publish now
- schedule

---

# 29. Quick POST Safety

The POST button should not bypass all validation.

Before publishing:

```text
POST
 ↓
Check post exists
 ↓
Check status = READY_FOR_REVIEW
 ↓
Check required content
 ↓
Check selected social accounts
 ↓
Check platform-specific requirements
 ↓
Publish
```

If the post has been modified after the Telegram message was generated:

```text
Telegram POST
      ↓
Detect version mismatch
      ↓
Do NOT blindly publish
      ↓
Return:
"Post was changed. Please VIEW DETAIL."
```

Use:

```text
postVersion
notificationVersion
```

or an equivalent optimistic concurrency mechanism.

This prevents a stale Telegram notification from publishing outdated content.

---

# 30. Notification Action Security

Telegram action callbacks must never directly contain secrets or raw social credentials.

Recommended:

```text
callback_data:
review:<shortActionToken>
```

The server maps the short-lived token to:

```text
userId
postId
action
postVersion
expiresAt
```

Example:

```text
ReviewActionToken
- id
- userId
- postId
- action
- expectedPostVersion
- expiresAt
- consumedAt
```

Token rules:

- short expiration
- one-time use for POST
- server-side validation
- bound to user
- bound to post
- bound to expected version

---

# 31. Notification Domain Model

Add:

### NotificationPreference

```text
NotificationPreference
- id
- userId
- channel
- enabled
- events
- createdAt
- updatedAt
```

Example:

```text
channel = TELEGRAM
enabled = true
events = [
  POST_READY_FOR_REVIEW,
  PUBLISH_SUCCESS,
  PUBLISH_FAILURE
]
```

### NotificationDelivery

```text
NotificationDelivery
- id
- userId
- postId
- eventType
- channel
- status
- providerMessageId
- errorCode
- errorMessage
- sentAt
```

This gives the system notification history and makes failures observable.

---

# 32. Notification Abstraction

Use:

```ts
interface NotificationChannel {
  send(input: NotificationInput): Promise<NotificationResult>;
}
```

Then:

```ts
class TelegramNotificationAdapter
  implements NotificationChannel
```

Future:

```ts
class EmailNotificationAdapter
  implements NotificationChannel

class PushNotificationAdapter
  implements NotificationChannel
```

The application should depend on:

```ts
NotificationService
```

not:

```ts
TelegramService
```

---

# 33. Notification Orchestrator

Recommended:

```ts
interface ReviewNotificationService {
  notifyPostReadyForReview(
    postId: string
  ): Promise<NotificationResult[]>;
}
```

Internally:

```text
ReviewNotificationService
        ↓
Load NotificationPreferences
        ↓
Find enabled channels
        ↓
Create NotificationDelivery
        ↓
Send through adapters
        ↓
Persist delivery result
```

This allows:

```text
Telegram = ON
Email = OFF
Push = OFF
```

today, while supporting multiple channels later.

---

# 34. Scheduling Architecture

The `VIEW DETAIL` workflow should support:

```text
Publish Now
Schedule
Save Draft
```

Scheduling must not be implemented as a Telegram feature.

It belongs to the publishing domain.

Recommended model:

### PublishSchedule

```text
PublishSchedule
- id
- postId
- userId
- scheduledAt
- timezone
- status
- createdAt
- updatedAt
```

States:

```text
SCHEDULED
   ↓
PROCESSING
   ├──→ PUBLISHED
   ├──→ FAILED
   └──→ CANCELLED
```

Flow:

```text
User selects Schedule
        ↓
Validate post
        ↓
Create PublishSchedule
        ↓
Scheduler/Worker
        ↓
PublishPostService
        ↓
Social adapters
        ↓
Publish result
        ↓
Notification
```

---

# 35. Review Screen

The web detail screen should conceptually be:

```text
┌─────────────────────────────────────────────┐
│ ← Back                  READY FOR REVIEW    │
├─────────────────────────────────────────────┤
│                                             │
│              IMAGE PREVIEW                  │
│                                             │
├─────────────────────────────────────────────┤
│ Platforms                                   │
│ [✓ Instagram] [✓ Facebook]                 │
│                                             │
│ Caption                                     │
│ ┌─────────────────────────────────────────┐ │
│ │ AI generated caption...                 │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Hashtags                                   │
│ #... #... #...                             │
│                                             │
│ Location                                    │
│ 📍 Bình Thạnh, Hồ Chí Minh                 │
│                                             │
│ CTA                                         │
│ ...                                         │
│                                             │
│ [Regenerate] [Save Draft]                   │
│                                             │
│ [Publish Now] [Schedule]                    │
└─────────────────────────────────────────────┘
```

---

# 36. Complete End-to-End Workflow

## WF-09 — AI Ready → Telegram → Quick POST

```text
User uploads image
       ↓
Create Draft
       ↓
Enter description
       ↓
Prepare with AI
       ↓
AI generates:
  - caption
  - hashtags
  - CTA
  - location
       ↓
Post = READY_FOR_REVIEW
       ↓
PostReadyForReview Event
       ↓
Telegram Notification
       ↓
User sees preview
       ↓
       ┌───────────────────┐
       │                   │
       ▼                   ▼
     POST             VIEW DETAIL
       │                   │
       ▼                   ▼
  Validate          Review/Edit
       │                   │
       ▼              ┌────┴─────┐
   Publish             │          │
       │             POST      SCHEDULE
       ▼              │          │
  Result               ▼          ▼
       │            Publish    Scheduler
       ▼                         │
 Telegram confirmation           ▼
                            Publish later
```

---

# 37. Additional WBS

### NOTIFY-001 — Notification abstraction

Create:
- NotificationChannel
- NotificationService
- NotificationDelivery
- NotificationPreference

Acceptance:
- no business logic depends directly on Telegram
- channel can be replaced
- notification delivery is persisted

### NOTIFY-002 — Telegram adapter

Implement:
- Telegram bot configuration
- send message
- inline keyboard
- provider message ID
- error mapping

Acceptance:
- can send review notification
- can send publish result
- errors are captured

### NOTIFY-003 — Ready-for-review event

Implement:

```text
PostReadyForReview
```

Acceptance:
- generated exactly when post enters READY_FOR_REVIEW
- notification is not triggered by page refresh
- notification can be retried safely

### NOTIFY-004 — Review preview

Create Telegram message containing:
- thumbnail/preview
- title/idea
- platform
- caption preview
- hashtags
- location
- POST
- VIEW DETAIL

### NOTIFY-005 — Quick POST action

Implement:
- short-lived action token
- token validation
- post-version validation
- publish
- Telegram result

### NOTIFY-006 — View Detail action

Implement:
- secure detail URL
- open review screen
- preserve post context

### NOTIFY-007 — Publish result notification

Send:

```text
SUCCESS
PARTIAL_SUCCESS
FAILED
```

with appropriate next actions.

### SCHEDULE-001 — Scheduling domain

Implement:
- PublishSchedule
- timezone
- scheduledAt
- state machine

### SCHEDULE-002 — Scheduler worker

Implement:
- find due schedules
- lock/claim schedule
- invoke PublishPostService
- persist result
- notify user

---

# 38. Updated MVP Priority

The recommended order is now:

```text
P0

1. Architecture skeleton
2. hl-sdk-ts adapters
3. Post + Media
4. AI Content
5. Personal Style
6. Instagram connection
7. Instagram publish
8. Telegram notification
9. Telegram POST
10. VIEW DETAIL
11. Facebook
12. Multi-platform publish
```

Then:

```text
P1

13. Publish result notifications
14. Draft/history
15. Schedule
16. Retry
17. Notification preferences
```

Then:

```text
P2

18. Email
19. Push notification
20. Analytics
21. TikTok
22. Google Business
23. Multiple users
24. Workspaces/brands
```

---

# 39. Updated Golden Workflow Set

The architecture should now be verified against these workflows:

| ID | Workflow | Priority |
|---|---|---|
| WF-01 | Create → AI Prepare → Instagram Publish | P0 |
| WF-02 | Edit AI caption before publish | P0 |
| WF-03 | Facebook Publish | P0 |
| WF-04 | Multi-platform Publish | P0 |
| WF-05 | AI Regenerate | P0 |
| WF-06 | Publish Failure → Retry | P1 |
| WF-07 | Save Draft → Resume | P1 |
| WF-08 | Publish History | P1 |
| WF-09 | Ready → Telegram → Quick POST | P0 |
| WF-10 | Telegram → View Detail → Edit → Publish | P0 |
| WF-11 | View Detail → Schedule | P1 |
| WF-12 | Scheduled Publish → Notification Result | P1 |
| WF-13 | Notification Channel Disabled | P1 |
| WF-14 | Stale Telegram POST → Block + View Detail | P1 |

---

# 40. Architectural Principle

The final system should treat a social post as a lifecycle:

```text
IDEA
 ↓
DRAFT
 ↓
AI PREPARED
 ↓
READY FOR REVIEW
 ↓
USER APPROVED
 ↓
PUBLISHING
 ↓
PUBLISHED
```

Notification is a reaction to the lifecycle:

```text
READY_FOR_REVIEW
       ↓
Notification
```

Publishing remains independent:

```text
User Approval
       ↓
PublishPostService
       ↓
SocialPlatformService
       ↓
Platform Adapter
       ↓
hl-sdk-ts
```

Therefore:

**Telegram is not the publishing system.**

It is a **remote review/action interface** on top of the application's publishing system.

This distinction is important because it lets the same post eventually be controlled from:

```text
Web UI
Telegram
Mobile App
Email
Push Notification
API
Automation
```

without duplicating publishing logic.
