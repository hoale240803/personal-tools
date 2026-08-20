# Engineering Backlog

> **Owner:** Antigravity (Engineering Manager)
> **Human:** Reviews priorities; approves major scope changes
> **Source:** Tasks derived from `.ai/PLAN.md` product direction
>
> **Task Status Lifecycle:**
> `BACKLOG` → `READY` → `IN_PROGRESS` → `REVIEW` → `DONE`
>                              ↓                      ↑
>                          `BLOCKED` ──(resolved)──────┘
>                              ↓
>                          `CANCELLED`
>
> ⚠️ Only Antigravity may set status to `DONE`.
> ⚠️ `DONE` requires: Manager Verification + ACCEPTED verdict + Git commit verified.

---

## [EPIC-1] Expense Management App

**Project:** `idea/expense-management-app`
**Priority:** P0
**Status:** ACTIVE
**Reference:** `idea/expense-management-app/ROADMAP.md`

> Most mature project. Has existing AGENT_STATE.md with real content.
> Backend (Vercel Serverless + Google OAuth + Sheets + Gemini) is largely
> implemented locally. Primary remaining work is production deployment.

### [STORY-1.1] Production Deployment

- `[EXP-001]` Deploy app to Vercel production | Status: `DONE` ✅ *(Closed 2026-08-19 by Antigravity — ACCEPTED)*
  - Acceptance:
    - [ ] Frontend loads at production URL
    - [ ] `/api/health` returns `{ ok: true }` in production
    - [ ] Google OAuth login works end-to-end in production
  - Note: Requires human to set Vercel env vars and production redirect URI

- `[EXP-002]` Add production Google OAuth redirect URI on Google Cloud | Status: `BACKLOG`
  - Depends on: EXP-001
  - Acceptance:
    - [ ] OAuth callback works at production domain
  - Note: Human action on Google Cloud Console required

- `[EXP-003]` Verify Gmail sync works in production | Status: `BACKLOG`
  - Depends on: EXP-002
  - Acceptance:
    - [ ] Manual sync button triggers Gmail fetch
    - [ ] Parsed expense appears in Sheets and UI within 60 seconds

### [STORY-1.2] Optional: Vercel Cron Auto-Sync

- `[EXP-004]` Add Vercel Cron job for periodic Gmail sync | Status: `BACKLOG`
  - Depends on: EXP-003
  - Acceptance:
    - [ ] Cron runs every 15-30 minutes in production
    - [ ] No duplicate expenses on repeated syncs

---

## [EPIC-2] Find Job Tool

**Project:** `idea/find-job-tool`
**Priority:** P1
**Status:** BACKLOG
**Reference:** `idea/find-job-tool/find-job-tool.md`

> Monitors Craigslist / ZipRecruiter for jobs matching defined keywords.
> Sends notifications via Telegram or email when matches are found.
> No implementation exists yet — project directory has only spec files.

### [STORY-2.1] Core Job Scraper

- `[JOB-001]` Initialize project structure | Status: `BACKLOG`
  - Acceptance:
    - [ ] `package.json` or equivalent created
    - [ ] README describes setup and usage
    - [ ] `settings.json` schema documented (credentials, keywords, notification config)

- `[JOB-002]` Implement Craigslist search service | Status: `BACKLOG`
  - Depends on: JOB-001
  - Acceptance:
    - [ ] `CraigslistService.js` created (follow agent-rules Rule 4)
    - [ ] Searches by keyword list from settings.json
    - [ ] Returns structured list of job postings

- `[JOB-003]` Implement Telegram notification service | Status: `BACKLOG`
  - Depends on: JOB-001
  - Acceptance:
    - [ ] `TelegramService.js` created
    - [ ] Sends message with job title, URL, and location
    - [ ] Credentials from settings.json only (agent-rules Rule 1)

- `[JOB-004]` Integrate scraper + notification + scheduler | Status: `BACKLOG`
  - Depends on: JOB-002, JOB-003
  - Acceptance:
    - [ ] `main.js` orchestrates scrape → filter → notify
    - [ ] Runs on a configurable interval

---

## [EPIC-3] Workflow Engine

**Project:** UNRESOLVED — see note below
**Priority:** UNRESOLVED
**Status:** UNRESOLVED — awaiting human clarification

> ⚠️ The file `EPIC 1 - Workflow Engine.ini` exists at the repository root
> but cannot be associated with any existing project under `idea/`.
> It describes Features 1.1–1.3 with tasks WF-001 to WF-014.
> Human review required to determine: Is this a planned new project?
> Is it the AI workspace orchestration layer itself? Or an orphaned artifact?

### Tasks from `EPIC 1 - Workflow Engine.ini` (status: UNRESOLVED)

- `[WF-001]` Create workflow schema | Status: `BACKLOG` *(blocked: project unclear)*
- `[WF-002]` Validate workflow schema | Status: `BACKLOG` *(blocked: project unclear)*
- `[WF-003]` Seed sample workflows | Status: `BACKLOG` *(blocked: project unclear)*
- `[WF-004]` Schema unit tests | Status: `BACKLOG` *(blocked: project unclear)*
- `[WF-005]` Base node interface | Status: `BACKLOG` *(blocked: project unclear)*
- `[WF-006]` Start node | Status: `BACKLOG` *(blocked: project unclear)*
- `[WF-007]` End node | Status: `BACKLOG` *(blocked: project unclear)*
- `[WF-008]` Action node | Status: `BACKLOG` *(blocked: project unclear)*
- `[WF-009]` Decision node | Status: `BACKLOG` *(blocked: project unclear)*
- `[WF-010]` Wait node | Status: `BACKLOG` *(blocked: project unclear)*
- `[WF-011]` Execute next node | Status: `BACKLOG` *(blocked: project unclear)*
- `[WF-012]` Save execution state | Status: `BACKLOG` *(blocked: project unclear)*
- `[WF-013]` Resume execution | Status: `BACKLOG` *(blocked: project unclear)*
- `[WF-014]` Execution tests | Status: `BACKLOG` *(blocked: project unclear)*

---

## [EPIC-4] Other Tools (Inactive — Phase 2+)

The following projects exist under `idea/` but have no active development
assigned. They are listed for inventory purposes only.

| Project | Description |
|---------|-------------|
| `agent-proxy` | — |
| `bank-qr-extension` | Bank QR code generator |
| `best-buy-supplies-tool` | — |
| `best-insurance-tool` | Insurance comparison |
| `best-saler` | — *(untracked, new)* |
| `cheap-flight-tool` | Flight price monitoring |
| `cheap-used-car-tool` | Used car price monitoring |
| `company-prospect` | — |
| `detecting-new-nails-competitors-tool` | Competitor detection |
| `dm-jobs` | — |
| `expense-management-tool` | *(older version — separate from expense-management-app)* |
| `memory-app` | — *(untracked, new)* |
| `paper-work-tool` | — |
| `real-estate-local-detective-tool` | Real estate monitoring |
| `social-media-management-tool` | Social media management |
| `trading-tool` | Trading signal alerts *(has active GitHub Action)* |
| `university-scholarship-tool` | — |
