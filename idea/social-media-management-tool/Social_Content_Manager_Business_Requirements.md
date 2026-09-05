# Social Content Manager — Business Requirements & WBS (MVP)

## 1. Product Vision

Build a personal-first social content management tool that turns original images + a short description into a ready-to-review social post.

**Primary journey**

`Upload original images → Describe content → AI prepares content → User reviews/edits → Publish to Instagram/Facebook`

The product should reduce repetitive work around:
- caption writing
- hashtags
- CTA
- location
- platform-specific formatting
- publishing
- post history

The AI prepares the post. **The user remains the final approver in MVP.**

## 2. MVP Scope

### Included
- Instagram
- Facebook
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
- TikTok
- Google Business Profile/Maps
- Multi-user/team collaboration
- Advanced analytics
- Automated weekly reports
- Future scheduling/recurring posting

## 3. UX Model

### Screen 1 — Create Post
Based on the supplied Canva concept:
1. Upload images
2. Enter description
3. Select platforms
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
- see platform-specific preview
- save draft
- publish

### Screen 3 — Settings
User can configure:
- Instagram connection
- Facebook connection
- writing style/tone
- language
- CTA defaults
- hashtag rules
- location defaults
- AI provider/model

## 4. Core Workflows

### WF-01 — Create & Publish One Post
1. User opens Create Post.
2. Uploads an image.
3. Enters a short description.
4. Selects Instagram and/or Facebook.
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

### WF-06 — Publish to Both Platforms
1. Select Instagram + Facebook.
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
- User approval is required before publishing.
- User edits override AI output.
- Regeneration must not overwrite approved fields unexpectedly.
- Instagram and Facebook publishing are independent operations.
- A partial failure is valid: one platform may succeed while another fails.
- Retry must be safe and should avoid duplicate posts.
- Secrets/tokens must never be hard-coded.
- New platforms should be addable without changing the core Post business model.
- AI provider should be replaceable through an abstraction/service boundary.

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

### Sprint 1 — Vertical Slice
- Project foundation
- Social connection abstraction
- Upload image
- Description input
- AI caption/hashtag generation
- Review/edit
- One-platform publish
- Publish result

**Goal:** WF-01 works end-to-end for one platform.

### Sprint 2 — Instagram + Facebook
- Second platform adapter
- Multi-platform selection
- Platform-specific preview
- Partial success/failure
- Retry
- Connection error handling

**Goal:** WF-06 and WF-07 work reliably.

### Sprint 3 — Personal Style
- StyleProfile
- CTA rules
- Hashtag rules
- Location defaults
- Regeneration
- Style verification

**Goal:** User can repeatedly generate content that feels consistent with their own style.

### Sprint 4 — Draft & History
- Draft persistence
- History
- Post detail
- Duplicate/reuse

**Goal:** User can manage content instead of creating one-off posts.

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
2. Implement complete workflows vertically.
3. Keep AI generation separate from social publishing.
4. Use adapters/interfaces for Instagram and Facebook.
5. Keep AI provider replaceable.
6. Preserve manual edits.
7. Make publishing idempotent/retry-safe.
8. Never log or commit secrets.
9. Add tests for P0 workflows.
10. Update implementation status against the WBS after each completed ticket.

## 11. First Tickets to Give an AI Coding Agent

- WBS-1.0 Foundation
- WBS-1.1 Project setup
- WBS-1.2 Domain/storage model
- WBS-2.1 Instagram connection
- WBS-3.0 Image upload
- WBS-3.2 Description input
- WBS-4.1 AI caption generation
- WBS-4.2 AI hashtag generation
- WBS-5.1 Caption editor
- WBS-6.1 Instagram publish
- WBS-6.4 Publish result
- WBS-1.3 Logging/error handling

After these pass WF-01, add Facebook and multi-platform publishing.
