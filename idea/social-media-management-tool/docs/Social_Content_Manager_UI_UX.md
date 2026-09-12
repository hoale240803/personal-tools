# Social Content Manager -- UI/UX Specification

> **Status:** Approved for implementation
> **Revision:** 2026-08-29 -- Cross-document consistency revision applied (D1-D6)
> **Decisions applied:** D1 (Single-user auth), D2 (Credentials outside DB), D3 (Instagram-first), D5 (Scheduling Post-MVP - Schedule button removed), D6 (Explicit Save Draft only)
> **Do NOT modify** Business Requirements or Architecture Plan based on this document.

---

## 1. Design Principles

- **Clarity first.** The user is a solo creator. The UI must guide them through a clear workflow, not overwhelm them with options.
- **State is always visible.** Every post shows its current state (DRAFT, PREPARING, READY_FOR_REVIEW, PUBLISHED, FAILED, PARTIAL_SUCCESS).
- **Approval is required.** AI never publishes autonomously. The Publish Now button is always a deliberate user action.
- **Error states are explicit.** Every failure shows what failed, why, and what to do next.
- **MVP scope is enforced.** Post-MVP features (scheduling, auto-save, cloud storage, multi-user) are not shown in this UI spec.

---

## 2. Navigation Structure

The application has three primary navigation destinations, matching the BRD (Section 3 UX Model):

```
Navigation Bar
+-- Create Post    (Screen 1)
+-- History        (Screen 2 -- Review + History combined)
+-- Settings       (Screen 3)
```

Modal/overlay surfaces (not top-level navigation):
- Post Review / Edit (entered from History or Create Post flow)
- Publish Result overlay
- Connection Error modal
- Regenerate instruction modal

---

## 3. Screen Definitions

---

### Screen 0 -- Login

**Purpose:** Single-user authentication gate. Required before accessing any protected screen.

**Decision D1:** There is no registration screen, password reset screen, or multi-user management in MVP. The single user authenticates with credentials configured in settings.json.

**Main components:**

| Component | Description |
|-----------|-------------|
| App Logo / Name | Centered branding |
| Username Field | Input for configured username |
| Password Field | Password input (masked) |
| Login Button | Submits credentials to POST /auth/login |
| Error Message | "Invalid credentials." (does not reveal which field is wrong) |

**System responses:**

| Trigger | Response |
|---------|---------|
| Valid credentials | Session created. Redirect to Create Post. |
| Invalid credentials | Error message shown. Fields cleared (not password). |
| Accessing protected page without session | Redirect to /login |

**Navigation:**
- -> Create Post (on success)

---

### Screen 1 -- Create Post

**Purpose:** Primary entry point for creating a new social post. Guides the user through the content creation workflow from image upload to AI preparation.

**User:** Primary user (personal use).

**Entry points:**
- Direct navigation via "Create Post" in the nav bar
- "New Post" button from History screen

**Frontend state machine (Architecture Plan Section 15):**
```
EMPTY -> MEDIA_SELECTED -> DESCRIPTION_READY -> PREPARING -> READY_FOR_REVIEW
```
After READY_FOR_REVIEW, the user transitions to the Review screen.

**Main components:**

| Component | Description |
|-----------|-------------|
| Image Upload Zone | Drag-and-drop or click-to-upload. Accepts multiple images. |
| Image Preview Strip | Thumbnails with reorder (drag) and remove (x) controls. |
| Description Input | Short text area for describing the post content/goal. |
| Platform Selector | Toggle buttons for Instagram and/or Facebook. |
| Prepare Post Button | Primary CTA. Triggers AI content generation. |
| AI Generation Indicator | Visible progress state during AI preparation (spinner + "Preparing your content..."). |

**User actions:**

| Action | Trigger |
|--------|---------|
| Upload image(s) | Drag-drop or file picker |
| Reorder images | Drag handles in preview strip |
| Remove image | x button on thumbnail |
| Enter description | Text area input |
| Select/deselect platform | Toggle button |
| Click Prepare Post | Primary button |
| Save Draft | Secondary button -- saves current state without preparing |
| Cancel / clear | Reset the form |

**Save Draft (Decision D6):**
The "Save Draft" button on Create Post saves the post in DRAFT status without triggering AI preparation. There is no auto-save. If the user navigates away without clicking Save Draft, a browser confirmation dialog warns of unsaved changes. The draft is only persisted when the user explicitly clicks Save Draft.

**System responses:**

| Trigger | Response |
|---------|---------|
| Image uploaded | Thumbnail appears in preview strip. File validated (size/type). |
| Prepare Post clicked | Post = DRAFT created. Post = PREPARING. AI generation begins. Spinner/progress indicator shown. |
| AI generation complete | Post = READY_FOR_REVIEW. Navigate to Review screen. |
| AI generation failed | Show error banner. Allow retry or manual entry. |
| Save Draft clicked | Post saved as DRAFT. Toast confirmation. |

**Loading state:** Spinner with "Preparing your content..." message. Progress indication if AI takes > 3 seconds.

**Empty state:** Upload zone with icon + "Upload your images to get started." Description area placeholder: "Describe what this post is about..."

**Error states:**
- Image file too large: inline error under upload zone.
- Unsupported file type: inline error.
- No platform selected and Prepare clicked: inline validation error.
- AI generation failed: toast/banner with option to retry or proceed manually.
- No description and Prepare clicked: inline validation error.

**Success state:** Transition to Review screen.

**Navigation:**
- -> Review screen (on AI preparation complete)
- -> History screen (nav bar)
- -> Settings screen (nav bar)

---

### Screen 2 -- Review / Edit

**Purpose:** Display AI-generated content for the user to review, edit, approve, and publish. This is the human approval gate required by the BRD.

**User:** Primary user.

**Entry points:**
- Automatic redirect from Create Post (after AI preparation)
- Tap/click a post in History (for drafts and published posts)
- "VIEW DETAIL" button from Telegram notification

**Frontend state machine (Architecture Plan Section 15):**
```
READY_FOR_REVIEW -> EDITING -> PUBLISHING -> RESULT
```

**Main components:**

| Component | Description |
|-----------|-------------|
| Post Status Badge | Shows current post state (READY FOR REVIEW, DRAFT, PUBLISHED, etc.) |
| Image Preview Carousel | Scrollable preview of uploaded images. Back/forward navigation. |
| Platform Tabs | One tab per selected platform (Instagram / Facebook). Per-platform content shown. |
| Caption Editor | Editable text area with AI-generated caption. AI-generated badge shown until user edits. |
| Hashtag Editor | Editable tag list. Add/remove individual hashtags. |
| CTA Field | Editable CTA text. |
| Location Field | Editable location text with AI suggestion. Confirm or modify. |
| Regenerate Button | Triggers content regeneration. Shows optional instruction input. |
| Save Draft Button | Saves current state as DRAFT without publishing (Decision D6). |
| Publish Now Button | Primary publish CTA. Triggers publishing flow. |
| Platform Preview Panel | Simulated per-platform preview of how the post will appear. |

> **Decision D5 -- Schedule button removed from MVP:** The Schedule button is NOT shown in the MVP Review screen. It will be added when scheduling is implemented (Post-MVP P1). No disabled/greyed-out placeholder is shown.

**User actions:**

| Action | Trigger |
|--------|---------|
| Edit caption | Click/tap caption field |
| Edit hashtags | Add/remove tag tokens |
| Edit CTA | Click/tap CTA field |
| Edit location | Click/tap location field |
| Switch platform tab | Click platform tab |
| Regenerate content | Click Regenerate -> optional instruction -> confirm |
| Save draft | Click Save Draft |
| Publish | Click Publish Now |
| Back to Create | Back navigation (draft state preserved only if Save Draft was clicked) |

**System responses:**

| Trigger | Response |
|---------|---------|
| User edits a field | Field marked as user-edited (visual indicator). AI badge removed. |
| Regenerate clicked | Show instruction input. On confirm: AI regenerates. Only non-approved fields overwritten. |
| Save Draft | Post saved as DRAFT. Toast confirmation. User stays on screen. |
| Publish clicked | Post = PUBLISHING. Publishing spinner shown. Platform results appear one by one. |
| Publish complete (all success) | Navigate to Publish Result screen (or overlay). |
| Publish partial success | Show partial result inline. Retry available for failed platform. |
| Publish failed (all) | Show failure reason. Retry button. |

**Note on UI updates during publish:**
The frontend polls GET /api/posts/:id/publish-attempts to show per-platform publish status. There is no WebSocket or SSE. Status updates are fetched on a short interval (e.g., 2s) while PUBLISHING state is active.

**Loading states:**
- AI regeneration: spinner on caption/hashtag area.
- Publishing: spinner on Publish button + platform status indicators.

**Error states:**
- AI returned empty content: field-level error message. "Regenerate" and "Edit manually" options shown.
- Invalid content (missing caption): field-level validation error before publish is allowed.
- Social account expired: banner alert linking to Settings to reconnect.
- Platform publish error: per-platform error message with error code and retry button.
- Stale Telegram action: message "Post was changed. Please review before publishing." (WF-14 -- Architecture Plan Section 29)

**Success states:**
- Per-platform publish success indicator.
- Partial success: Instagram ok, Facebook error with retry button.

**Navigation:**
- Back to Create Post (for drafts in progress)
- -> Publish Result overlay / state
- -> Settings (via nav bar, or reconnect link)
- -> History (via nav bar)

---

### Screen 2b -- Publish Result

**Purpose:** Display the outcome of a publish attempt.

**Entry points:**
- Automatic after Publish Now is clicked
- After Telegram Quick POST action

**Main components:**

| Component | Description |
|-----------|-------------|
| Result Header | POSTED / PARTIALLY POSTED / FAILED |
| Per-platform Result | ok or error with platform name and external post URL (if available). |
| Error Detail | Human-readable error message for failed platforms. |
| Retry Button | For failed platforms. Shown when partial or full failure. |
| View on [Platform] Link | Link to the published post on Instagram/Facebook (when available). |
| Done / Back to History | Navigate away from result state. |

**Error states:**
- Connection error: "Platform connection expired. Go to Settings to reconnect." with link.
- API rate limit: "Platform rate limit reached. Try again in X minutes."
- Generic failure: "Something went wrong. Error: [error_code]."

---

### Screen 3 -- History

**Purpose:** View all posts (drafts, published, failed). Entry point to resume or duplicate posts.

**Main components:**

| Component | Description |
|-----------|-------------|
| Status Filter Pills | Filter posts by: All, Draft, Ready, Published, Failed, Partial |
| Post Cards | Thumbnail, status badge, description excerpt, date, platform indicators. |
| New Post Button | Shortcut to Create Post. |
| Duplicate Action | Per post card. Creates new draft from existing post. |
| Retry Action | For FAILED posts only. |

**Empty state:** "No posts yet." with a "Create your first post" CTA button.

**User actions:**
- Click post card -> navigate to Review screen (for that post)
- Click Duplicate -> creates new DRAFT, navigates to Create Post / Review
- Click Retry -> re-triggers publish for FAILED platforms

**Navigation:**
- -> Review screen (click post)
- -> Create Post (New Post button)
- -> Settings (nav bar)

---

### Screen 4 -- Settings

**Purpose:** Configure social connections, personal style, AI provider, and Telegram notifications.

**Sections:**

#### 4.1 Social Connections

| Component | Description |
|-----------|-------------|
| Instagram Status | Connected / Disconnected / Expired with account name |
| Instagram Connect Button | Initiates OAuth flow |
| Instagram Disconnect Button | Disconnects account |
| Facebook Status | Connected / Disconnected / Expired with account name |
| Facebook Connect Button | Initiates OAuth flow |
| Facebook Disconnect Button | Disconnects account |

**Decision D2 -- Credential storage in Settings:**
When a user connects a social platform via OAuth, the returned access token is stored in settings.json (local secure config), NOT in the database. The database SocialAccount record stores only a credentialReference key (string pointer). The UI does NOT display the raw token at any time.

#### 4.2 Writing Style

| Component | Description |
|-----------|-------------|
| Tone selector | Dropdown: Professional, Casual, Playful, Inspirational, etc. |
| Language | Text input or dropdown |
| Emoji level | Slider or dropdown: None, Light, Moderate, Heavy |
| CTA defaults | Text input for default CTA patterns |
| Hashtag rules | Text area for required/banned hashtags |
| Banned words | Text area |

#### 4.3 AI Provider

| Component | Description |
|-----------|-------------|
| Provider selector | Dropdown: Gemini (default), OpenAI (Post-MVP), Claude (Post-MVP) |
| API Key field | Write-only input. Once saved, displays only "Configured" + change link. |
| Model selector | Optional: specific model variant per provider |

**Decision D2 -- AI credentials:**
AI API keys are entered via this UI and stored in settings.json by the API. The key value is never returned to the frontend after being saved. The UI shows "Configured" status only.

#### 4.4 Telegram Notifications

| Component | Description |
|-----------|-------------|
| Bot Token field | Write-only input. Once saved, shows "Configured". |
| Chat ID field | Numeric input. |
| Test Notification button | Sends a test message to verify configuration. |

**Decision D2 -- Telegram credentials:**
Bot token stored in settings.json by the API. Never returned to the frontend after saving. The UI shows "Configured" status only.

**Error states:**
- OAuth error: "Connection failed: [reason]." with retry button.
- Invalid Telegram token: "Invalid bot token." shown after test.
- Test notification failed: "Could not send test message. Check bot token and chat ID."
- Expired social connection: Banner on Settings page per affected platform.

---

### Screen 4b -- Connection Error Modal

**Purpose:** When publish is attempted and a social account connection is expired/invalid.

**Trigger:** PublishPostService returns SocialConnectionError.

**Main components:**
- Error message: "Your [Platform] connection has expired."
- Affected platform name and account name.
- "Go to Settings" button.
- Cancel button.

**Behavior:** After reconnecting, user can retry without rebuilding the post.

---

## 4. MVP vs Post-MVP Feature Summary

| Feature | MVP | Post-MVP |
|---------|-----|---------|
| Single-user login | Yes | -- |
| Multi-user / registration | -- | P2 |
| Create Post (image upload) | Yes | -- |
| AI content generation | Yes | -- |
| Review / Edit | Yes | -- |
| Publish Now | Yes | -- |
| Save Draft (explicit) | Yes | -- |
| Auto-save draft | -- | P2 |
| Schedule post | -- | P1 |
| History | Yes | -- |
| Duplicate post | Yes | -- |
| Instagram connection + publish | Yes (Sprint 1) | -- |
| Facebook connection + publish | Yes (Sprint 2) | -- |
| Telegram notification + Quick POST | Yes | -- |
| Platform preview | Yes (simple) | High-fidelity Post-MVP |
| Cloud image storage | -- | P1 |
| Email notifications | -- | P2 |
| Multi-platform scheduling | -- | P1 |

---

## 5. Main End-to-End User Flows

### Flow A -- WF-01: Create & Publish to Instagram

```
1. User opens Create Post (EMPTY state)
2. Uploads one image (-> MEDIA_SELECTED)
3. Enters description (-> DESCRIPTION_READY)
4. Selects Instagram
5. Clicks "Prepare Post"
6. System: creates Draft, sends to AI (-> PREPARING)
7. AI returns: caption, hashtags, CTA, location
8. System: saves PostPlatformContent (-> READY_FOR_REVIEW)
9. Automatically navigates to Review screen
10. User reviews caption, hashtags, CTA, location
11. User clicks "Publish Now" (-> PUBLISHING)
12. System: validates, creates PublishAttempt, calls InstagramAdapter
13. Result: SUCCESS (-> PUBLISHED)
14. UI shows: Instagram link to post
15. User clicks "Done" -> History screen
```

---

### Flow B -- WF-04: Regenerate AI Content

```
1. User is on Review screen (READY_FOR_REVIEW)
2. Caption is not satisfactory
3. User clicks "Regenerate"
4. Optional instruction modal appears
5. User types: "Make it shorter and more casual"
6. Clicks "Regenerate"
7. System sends revised prompt to AI
8. Caption regenerated. Previously manually-edited hashtags NOT overwritten.
9. User reviews new caption
10. Publishes
```

---

### Flow C -- WF-07: Publish Failure & Retry

```
1. User publishes post
2. Facebook publish fails (Instagram succeeds)
3. Result: PARTIALLY POSTED
   - Instagram: ok
   - Facebook: "Invalid token"
4. User goes to Settings -> Reconnects Facebook
5. Returns to History -> Opens post
6. Post still shows as PARTIAL_SUCCESS
7. User clicks "Retry Facebook"
8. System: new PublishAttempt (idempotent)
9. Facebook succeeds
10. Post updated to PUBLISHED
```

---

### Flow D -- WF-08: Save Draft & Resume

```
1. User starts Create Post
2. Uploads images, enters description
3. Not ready to publish
4. Clicks "Save Draft" explicitly
5. Leaves app
6. Returns -> opens History
7. Finds draft post
8. Clicks post -> Review screen opens
9. Resumes editing (or clicks "Prepare" again if no AI content yet)
10. Publishes
```

> **Decision D6:** Auto-save is Post-MVP. In MVP, only the explicit "Save Draft" button persists the post. If the user navigates away without clicking Save Draft, the browser warns of unsaved changes.

---

### Flow E -- WF-09 (Architecture): AI Ready -> Telegram -> Quick POST

```
1. User has already created + prepared a post
2. Post reaches READY_FOR_REVIEW
3. System sends Telegram message:
   - Image preview thumbnail
   - Caption preview
   - Hashtags
   - Location
   - Inline buttons: [POST] [VIEW DETAIL]
4. User taps [POST]
5. System validates:
   - Post exists
   - Status = READY_FOR_REVIEW
   - Version matches (no edits since notification sent)
   - Content valid
   - Social accounts connected
6. System publishes
7. Telegram confirmation sent
```

---

### Flow F -- WF-10 (Architecture): Telegram -> VIEW DETAIL -> Edit -> Publish

```
1. User taps [VIEW DETAIL] in Telegram
2. Secure URL opens Review screen in browser
3. User edits caption (marks field as user-edited)
4. Clicks "Publish Now"
5. System publishes
6. Result shown in UI
```

---

## 6. Platform Preview

**Required by BRD Section 3 Screen 2:**
> "see platform-specific preview"

Each platform tab (Instagram / Facebook) in the Review screen shows a simulated preview of how the post will appear on that platform.

**Preview components:**
- Thumbnail(s) ordered as per PostMedia.sortOrder
- Caption (truncated with "more" link for long captions)
- Hashtag display
- Location tag
- CTA (if applicable)

**Platform differences to reflect:**
- Instagram: square/portrait image ratio, hashtags below caption
- Facebook: landscape image ratio preferred, hashtags inline or below

**Fidelity:** Simple structured preview (MVP). High-fidelity simulation is Post-MVP.

---

## 7. Notification UX (Telegram)

Architecture Plan Section 27 defines the Telegram message format. Key points:
- Message sent when post enters READY_FOR_REVIEW state.
- Inline keyboard: [POST] [VIEW DETAIL]
- POST action: triggers publish via ReviewActionToken validation.
- VIEW DETAIL action: returns a secure URL to the web Review screen.
- Result notification sent after publish (success, partial, or failure).

**Circular dependency clarification:**
Telegram is a notification and remote-action channel. It does not own publishing. The call chain is:
```
Telegram callback -> ReviewActionToken validation -> PublishPostService
```
PublishPostService has no dependency on Telegram. There is no cycle.

---

## 8. Empty States, Loading States, and Error States Summary

| Screen | Empty State | Loading State | Error State |
|--------|------------|---------------|-------------|
| Login | -- | Login spinner | "Invalid credentials." |
| Create Post | Upload zone with icon + copy | AI preparation spinner | Field validation errors, AI failure banner |
| Review | N/A (always reached with content) | Regenerate spinner, Publish spinner (polling-based) | Field-level validation, platform publish errors, stale-post warning |
| History | "No posts yet" + Create CTA | Skeleton post cards | Network error + retry |
| Settings | "Not connected" per section | Connection status loading | OAuth error, invalid API key, Telegram test failure |
| Publish Result | N/A | Per-platform publish status (polled) | Per-platform failure with retry |

---

## 9. Accessibility Considerations

- All interactive elements must have descriptive id attributes (required by workspace rules for testing).
- Image upload zone must support keyboard interaction (Tab + Enter/Space).
- Platform toggles must be keyboard accessible.
- Error messages must be associated with their form field (aria-describedby).
- Status badges must use color + icon (not color alone) for accessibility.

---

## 10. Responsive Considerations

- Personal-use tool. Primary use case: desktop browser.
- Mobile responsiveness for the Telegram -> VIEW DETAIL flow (user may open on phone).
- Single-column layout for mobile. Two-column (preview + edit) for desktop Review screen.

---

## Closed Decisions

### OQ-5: Platform preview fidelity -- CLOSED
**Decision:** Simple structured preview for MVP. High-fidelity is Post-MVP.

### OQ-6: Schedule button in Review screen -- CLOSED (D5)
**Decision:** Option A -- Schedule button is OMITTED from MVP entirely. No greyed-out placeholder. The button will be added when scheduling is implemented (Post-MVP P1).

### OQ-7: History screen pagination vs. infinite scroll -- CLOSED
**Decision:** Pagination for MVP. Infinite scroll is Post-MVP if volume justifies it.

### OQ-8: Auto-save draft behavior -- CLOSED (D6)
**Decision:** Explicit Save Draft only. There is no auto-save in MVP. Browser navigates away warning if the user has unsaved changes. Auto-save is Post-MVP.
