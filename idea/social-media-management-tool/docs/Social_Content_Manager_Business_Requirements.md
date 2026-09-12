# Social Content Manager — Business Requirements & WBS (MVP)

## 1. Product Vision

Build a personal-first social content management tool that turns original images + a short description into a ready-to-review social post — with **TikTok as the primary publishing platform** and a **Holiday Auto-Scheduler** as the flagship feature.

**Primary journey (manual post)**

`Upload original images → Describe content → AI prepares content → User reviews/edits → Publish to TikTok / Instagram / Facebook`

**Primary journey (Holiday Auto-Scheduler)**

`Configured holiday date triggers → System retrieves holiday poster → AI generates platform-specific caption → Preview sent to admin via Telegram → Admin approves → System publishes to TikTok → Result sent to Telegram`

The product should reduce repetitive work around:
- holiday/event content planning
- caption writing
- hashtags
- CTA
- location
- platform-specific formatting
- publishing
- post history
- admin approval before every scheduled post

The AI prepares the post. **The user (admin) remains the final approver — via Telegram — before any scheduled post goes live.**

## 2. MVP Scope

### Included

**Platform priority order:**
1. **TikTok** *(primary — Holiday Scheduler)*
2. Instagram
3. Facebook

**Holiday Auto-Scheduler (TikTok — flagship feature):**
- Holiday/event calendar configuration (name, date MM-DD, scheduled time, active toggle)
- Holiday poster library (upload & link poster to each holiday)
- Automated scheduler trigger (node-cron) at configured date + time
- AI caption + hashtag generation for TikTok on holiday context
- Telegram preview notification to admin (poster image + caption + Approve/Reject inline buttons)
- Approval token with 12-hour timeout
- TikTok publish on admin Telegram approval
- Telegram result notification after publish

**Manual post creation (all platforms):**
- Upload one or multiple images
- Image preview/reorder/remove
- Short description input
- AI caption generation
- AI hashtag generation
- CTA generation/selection
- Location suggestion/edit/confirmation
- Saved personal writing style
- Manual editing
- Platform preview
- Publish now
- Per-platform success/failure
- Retry failed publishing
- Save draft
- History
- Social connection status
- Audit/publishing metadata

### Not in MVP
- Google Business Profile/Maps
- Multi-user/team collaboration
- Advanced analytics
- Automated weekly reports
- Canva API integration (posters uploaded manually)
- Google Drive integration

## 3. UX Model

### Screen 0 — Holiday Calendar Manager *(new — primary entry point)*
Admin can:
- view upcoming holiday auto-post schedule
- add/edit holiday events (name, date, time, active toggle)
- upload/replace poster for each holiday
- manually trigger a test preview to Telegram
- see history of past holiday posts

### Screen 1 — Create Post
Based on the supplied Canva concept:
1. Upload images
2. Enter description
3. Select platforms (TikTok first in list)
4. Click **Prepare Post**
5. AI generation state is visible
6. Move to review

### Screen 2 — Review / History
User can:
- preview the post
- edit caption
- edit hashtags
- edit CTA
- edit/confirm location
- see platform-specific preview (TikTok vertical format first)
- save draft
- publish

### Screen 3 — Settings
User can configure:
- TikTok connection
- Instagram connection
- Facebook connection
- writing style/tone
- language
- CTA defaults
- hashtag rules
- location defaults
- AI provider/model
- Telegram bot token + chat ID
- Holiday Scheduler global on/off toggle

## 4. Core Workflows

### WF-12 — Holiday Auto-Post to TikTok via Telegram Approval *(flagship)*
1. Admin pre-configures holiday event: Christmas Day (25/12), time 9:00 AM, poster = "H&H Nails and lash | Christmas Day".
2. On 25/12 at 9:00 AM, HolidaySchedulerWorker triggers.
3. System loads the linked poster from the library.
4. AI generates TikTok-optimised caption + hashtags based on holiday context + brand style.
5. System sends Telegram message to admin chat:
   - Poster image preview
   - Generated caption
   - Two inline buttons: ✅ **Đăng lên TikTok** | ❌ **Bỏ qua**
6. Admin reviews on Telegram and taps ✅ **Đăng lên TikTok**.
7. System validates approval token (not expired, not consumed).
8. System publishes to TikTok via TikTokAdapter.
9. System sends result to Telegram: ✅ Đã đăng thành công (link bài đăng) | ❌ Thất bại (lý do).

### WF-13 — Holiday Telegram Approval Timeout / Rejection
1. HolidaySchedulerWorker sends Telegram preview (same as WF-12 step 5).
2. Admin taps ❌ **Bỏ qua** → System marks token consumed, logs as SKIPPED, no post published.
   OR: Admin does not respond within 12 hours → token expires, system logs as EXPIRED, sends Telegram notification: "⏰ Đã hết hạn duyệt bài Christmas Day — bài không được đăng."
3. Holiday event status updated to SKIPPED/EXPIRED in history.

### WF-01 — Create & Publish One Post
1. User opens Create Post.
2. Uploads an image.
3. Enters a short description.
4. Selects TikTok and/or Instagram and/or Facebook.
5. Clicks Prepare Post.
6. AI generates caption + hashtags + CTA + location suggestion.
7. User reviews and edits.
8. User clicks Publish.
9. System publishes to each selected platform.
10. UI shows per-platform result.

### WF-02 — Multi-image Post
1. Upload multiple images.
2. Reorder/remove images.
3. Enter description.
4. Prepare content.
5. Review media order and generated content.
6. Publish.

### WF-03 — AI Style Verification
1. User configures personal writing style.
2. Create a post.
3. Generate content.
4. System checks tone/language/CTA/hashtag rules.
5. User fixes anything that does not match.
6. Publish.

### WF-04 — Regenerate
1. AI content is not acceptable.
2. User clicks Regenerate.
3. Optional instruction: shorter, more professional, fewer emojis, etc.
4. AI regenerates the requested content.
5. Previously approved/manual fields must not be silently overwritten.

### WF-05 — Manual Override
1. User edits caption/hashtags/CTA/location.
2. User saves.
3. User publishes.
4. Manual values are the source of truth for that post.

### WF-06 — Publish to Multiple Platforms
1. Select TikTok + Instagram + Facebook (any combination).
2. Prepare and review.
3. Publish.
4. Execute platform publishing independently.
5. If one succeeds and one fails, preserve both results separately.

### WF-07 — Publish Failure
1. Publishing fails.
2. Show clear failure reason.
3. Preserve post as retryable.
4. User fixes the problem if needed.
5. Retry without rebuilding the post.

### WF-08 — Save Draft
1. User starts a post.
2. User clicks Save Draft.
3. User leaves.
4. User opens History.
5. User resumes editing.

### WF-09 — Reuse Previous Post
1. Open History.
2. Select an existing post.
3. Duplicate it into a new draft.
4. Edit media/content.
5. Prepare/publish.
6. Original post remains unchanged.

### WF-10 — Social Connection Problem
1. User attempts to publish.
2. System detects invalid/expired/missing connection.
3. Show affected platform.
4. User reconnects.
5. Retry.

### WF-11 — Invalid AI Output
1. AI returns empty/invalid content.
2. Validation blocks publishing.
3. Show field-level error.
4. User regenerates or edits manually.

## 5. Business Rules

- AI must never silently publish in MVP.
- **For Holiday Scheduler: admin Telegram approval is mandatory before publishing to TikTok.**
- **Holiday approval token expires after 12 hours — expired token must never trigger a publish.**
- **A consumed approval token must never be reused — prevent duplicate posts.**
- User approval is required before publishing (manual posts).
- User edits override AI output.
- Regeneration must not overwrite approved fields unexpectedly.
- TikTok, Instagram, and Facebook publishing are independent operations.
- A partial failure is valid: one platform may succeed while another fails.
- Retry must be safe and should avoid duplicate posts.
- Secrets/tokens must never be hard-coded.
- New platforms should be addable without changing the core Post business model.
- AI provider should be replaceable through an abstraction/service boundary.
- **TikTok is the primary platform; its adapter must be implemented before Instagram in Sprint 1.**

## 6. Suggested Domain Model

### User
- id
- name
- language
- timezone
- style_profile_id

### StyleProfile
- tone
- language
- emoji_level
- caption_template
- CTA_rules
- hashtag_rules
- banned_words
- required_words/hashtags

### SocialAccount
- id
- user_id
- platform
- external_account_id
- connection_status
- token_reference
- connected_at
- last_error

### Post
- id
- user_id
- status: DRAFT / READY / PUBLISHING / PARTIAL_SUCCESS / PUBLISHED / FAILED
- description
- goal
- content_pillar
- location
- created_at
- updated_at

### PostMedia
- id
- post_id
- storage_reference
- sort_order
- media_type

### PostPlatformContent
- id
- post_id
- platform
- caption
- hashtags
- cta
- location
- user_edited
- approved_at

### PublishAttempt
- id
- post_id
- platform
- status
- attempted_at
- external_post_id
- external_post_url
- error_code
- error_message

## 7. AI Service Contract

Input:
- image references
- user description
- goal
- content pillar
- target platform
- StyleProfile
- location context
- previous approved style examples if configured

Output:
- caption
- hashtags[]
- CTA
- location suggestion
- platform-specific formatting
- optional validation/warnings

The AI service should not directly publish to social platforms.

## 8. Definition of Done for MVP

A feature is complete only when:
1. UI flow works.
2. Business rule is implemented.
3. Error state is handled.
4. Data is persisted correctly.
5. Automated tests cover core business rules.
6. Integration boundary is testable/mocked.
7. Logs exist for important failures.
8. No secrets are committed.
9. Acceptance criteria for the related workflow pass.

## 9. Recommended Implementation Order

### Sprint 1 — TikTok Holiday Scheduler *(flagship)*
- Project foundation + DB schema
- TikTok connection abstraction + TikTokAdapter
- Holiday event domain (HolidayEvent, HolidayPosterLibrary)
- HolidaySchedulerWorker (node-cron)
- AI caption generation for holiday context
- Telegram Approval Service (preview + inline keyboard)
- Approval token (12h timeout, consumed check)
- TikTok publish on approval
- Telegram result notification
- Holiday Calendar Manager UI (basic)

**Goal:** WF-12 and WF-13 work end-to-end for TikTok holiday posts.

### Sprint 2 — Manual Post + Instagram
- Social connection abstraction (generic)
- InstagramAdapter
- Upload image
- Description input
- AI caption/hashtag generation
- Review/edit
- One-platform manual publish
- Publish result

**Goal:** WF-01 works end-to-end for manual posts to TikTok and Instagram.

### Sprint 3 — Facebook + Multi-Platform
- FacebookAdapter
- Multi-platform selection
- Platform-specific preview
- Partial success/failure
- Retry
- Connection error handling

**Goal:** WF-06 and WF-07 work reliably across all three platforms.

### Sprint 4 — Personal Style + Draft/History
- StyleProfile
- CTA rules
- Hashtag rules
- Location defaults
- Regeneration
- Draft persistence
- History
- Post detail
- Duplicate/reuse

**Goal:** User can manage content with consistent style.

### Sprint 5 — Hardening
- Automated tests
- Idempotency
- Audit trail
- Security review
- Error UX
- Performance and media validation

## 10. AI Agent Instructions

When implementing this repository:

1. Follow the WBS priority; do not expand scope without approval.
2. **TikTok Holiday Scheduler is Sprint 1 — implement TikTokAdapter before InstagramAdapter.**
3. Implement complete workflows vertically.
4. Keep AI generation separate from social publishing.
5. Use adapters/interfaces for TikTok, Instagram, and Facebook.
6. Keep AI provider replaceable.
7. **Holiday approval token must be validated (not expired, not consumed) before triggering TikTok publish.**
8. Preserve manual edits.
9. Make publishing idempotent/retry-safe.
10. Never log or commit secrets.
11. Add tests for P0 workflows (especially WF-12 and WF-13).
12. Update implementation status against the WBS after each completed ticket.

## 11. First Tickets to Give an AI Coding Agent

- ARCH-001 — Monorepo scaffold
- ARCH-002 — TypeScript setup
- DB-001 — Prisma + PostgreSQL
- DB-002 — User + StyleProfile schema
- DB-003 — Post schema
- DB-006 — NotificationPreference + ReviewActionToken schema
- **HOLIDAY-001 — HolidayEvent schema**
- **HOLIDAY-002 — HolidayPosterLibrary**
- **HOLIDAY-003 — HolidaySchedulerWorker**
- **HOLIDAY-004 — TelegramApprovalService**
- **HOLIDAY-005 — ApprovalToken service**
- **HOLIDAY-006 — TikTokAdapter**
- NOTIFY-002a — TelegramNotificationAdapter
- NOTIFY-003 — ReviewActionTokenService (adapted for holiday)

After WF-12/WF-13 pass, add manual post + Instagram (Sprint 2).
