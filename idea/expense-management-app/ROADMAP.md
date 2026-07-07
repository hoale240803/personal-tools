# ROADMAP — Expense Management App

> Checklist cho AI agent triển khai full stack. Đọc file này trước khi code.
> Mỗi phase phải hoàn thành và verify trước khi sang phase tiếp theo.

## Mục tiêu sản phẩm

Personal app tự động tracking chi tiêu từ email mua hàng Gmail.

| Trang | Chức năng |
|-------|-----------|
| Login | Google OAuth — bắt buộc để dùng app |
| Theo dõi chi phí | Danh sách giao dịch theo tháng, pagination 20/trang |
| Cài đặt | Danh mục cha / con để Gemini phân loại |

**Nguyên tắc:** đơn giản, miễn phí, truy cập mọi lúc mọi nơi.

---

## Stack đã chốt

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React + TypeScript + Vite (`web/`) |
| Deploy | **Vercel** |
| Backend | **Vercel Serverless Functions** (`api/`) |
| Lưu trữ | **Google Sheets** (Google Sheets API) |
| Auth | Google OAuth 2.0 |
| Email | Gmail API |
| AI parsing | Gemini API |

---

## Cấu trúc thư mục mục tiêu

```
expense-management-app/
├── web/                    # Frontend Vite React TS
│   └── src/
├── api/                    # Vercel serverless functions
│   ├── auth/
│   ├── expenses/
│   ├── categories/
│   └── gmail/
├── ROADMAP.md              # File này
├── AGENT_STATE.md          # Trạng thái hiện tại
└── vercel.json
```

---

## Phase 0 — UI Preview ✅

- [x] Trang Login (mock Google button)
- [x] Trang Theo dõi chi phí (bảng + card mobile)
- [x] Trang Settings (danh mục cha/con)
- [x] Month filter (`input type="month"`, mặc định tháng hiện tại)
- [x] Pagination (20 records/trang)
- [x] KPI theo tháng đã chọn
- [x] Search theo name, platform, order ID

**Verify:** `cd web && npm run dev` — UI hoạt động với mock data.

---

## Phase 1 — Google Cloud & Sheets setup

### 1.1 Google Cloud Project

- [ ] Tạo project trên [Google Cloud Console](https://console.cloud.google.com)
- [ ] Bật APIs:
  - [ ] Gmail API
  - [ ] Google Sheets API
  - [ ] Google OAuth2 (People API nếu cần profile)
- [ ] Tạo OAuth 2.0 Client ID (Web application)
  - Authorized redirect URI: `https://<domain>/api/auth/callback`
  - Local dev: `http://localhost:5173/api/auth/callback` hoặc proxy qua Vite
- [ ] Tạo Service Account (cho Sheets backend) HOẶC dùng OAuth token user
- [ ] Lấy Gemini API key từ [Google AI Studio](https://aistudio.google.com)

### 1.2 Google Sheet schema

Tạo 1 Google Spreadsheet, share cho service account email (Editor).

**Sheet `Expenses`** — header row 1:

| Col | Field | Nguồn |
|-----|-------|-------|
| A | id | UUID, auto |
| B | purchaseDate | Ngày nhận email (YYYY-MM-DD) |
| C | name | Gemini |
| D | parentCategory | Gemini + settings |
| E | category | Gemini (Parent > Child) |
| F | amount | Gemini (number VND) |
| G | platform | Gemini |
| H | status | Gemini |
| I | orderId | Gemini |
| J | imageUrl | Gmail attachment / inline image URL |
| K | gmailMessageId | Gmail API (dedup) |
| L | createdAt | ISO timestamp |

**Sheet `Categories`** — header row 1:

| Col | Field |
|-----|-------|
| A | parentId |
| B | parentName |
| C | childId |
| D | childName |

**Sheet `SyncState`** — header row 1:

| Col | Field |
|-----|-------|
| A | userEmail |
| B | lastHistoryId |
| C | lastSyncedAt |

- [ ] Tạo spreadsheet + 3 sheets trên
- [ ] Ghi `SPREADSHEET_ID` vào env

### 1.3 Env variables

```env
# Vercel Environment Variables
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GEMINI_API_KEY=
SPREADSHEET_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=       # nếu dùng service account
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY= # JSON key, escaped newlines
SESSION_SECRET=                     # random string cho cookie JWT
```

- [ ] Tạo `.env.example` (không commit secrets)
- [ ] Add env trên Vercel dashboard

---

## Phase 2 — Vercel project & monorepo

- [ ] Tạo `vercel.json`:

```json
{
  "buildCommand": "cd web && npm run build",
  "outputDirectory": "web/dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- [ ] Cấu hình `api/` folder cho Vercel Functions (TypeScript)
- [ ] Install deps: `googleapis`, `@google/generative-ai`, `jose` (JWT session)
- [ ] Deploy lên Vercel, connect Git repo
- [ ] Verify: frontend load, `/api/health` trả `{ ok: true }`

---

## Phase 3 — Google OAuth (Login thật)

### API routes

| Method | Route | Mô tả |
|--------|-------|-------|
| GET | `/api/auth/login` | Redirect tới Google consent |
| GET | `/api/auth/callback` | Exchange code → session cookie |
| GET | `/api/auth/me` | Trả user profile nếu đã login |
| POST | `/api/auth/logout` | Xóa session |

### OAuth scopes cần request

```
openid email profile
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/spreadsheets
```

### Frontend

- [ ] Thay mock login → `window.location.href = '/api/auth/login'`
- [ ] App load gọi `/api/auth/me` — redirect login nếu 401
- [ ] Logout gọi `/api/auth/logout`

**Verify:** Login Google thật, thấy avatar + email trên header.

---

## Phase 4 — Google Sheets CRUD

### API routes

| Method | Route | Mô tả |
|--------|-------|-------|
| GET | `/api/expenses?month=2026-07&page=1&limit=20` | List + filter tháng + pagination |
| GET | `/api/categories` | Lấy danh mục cha/con |
| PUT | `/api/categories` | Cập nhật toàn bộ categories |

### Backend logic

- [ ] `lib/sheets.ts` — wrapper Google Sheets API
- [ ] `getExpenses(month, page, limit)` — filter col B theo month prefix
- [ ] `appendExpense(row)` — check duplicate `gmailMessageId` trước khi insert
- [ ] `getCategories()` / `saveCategories()` — sheet Categories

### Frontend

- [ ] Thay mock data → fetch API
- [ ] Settings page save → `PUT /api/categories`
- [ ] Loading + error states

**Verify:** CRUD categories lưu vào Sheet; expenses đọc từ Sheet.

---

## Phase 5 — Gmail sync + Gemini parsing

### Flow

```
Gmail new email
  → Fetch body + attachments
  → Gemini extract JSON
  → Match category từ Settings (fallback: "Mua sắm > Khác")
  → Append row vào Sheet Expenses
```

### Gemini prompt output schema

```json
{
  "name": "string",
  "amount": 123000,
  "platform": "Shopee",
  "status": "Đã giao | Đang giao | Đã hủy | Chờ xử lý",
  "orderId": "string",
  "parentCategory": "string",
  "childCategory": "string",
  "isPurchaseEmail": true
}
```

- [ ] `lib/gemini.ts` — gọi Gemini với email body + user categories list
- [ ] `lib/gmail.ts` — search emails: `category:purchases OR subject:(order OR đơn hàng) newer_than:7d`
- [ ] Extract inline image / first attachment URL cho `imageUrl`

### API routes

| Method | Route | Mô tả |
|--------|-------|-------|
| POST | `/api/gmail/sync` | Manual sync (user bấm nút hoặc cron) |
| GET | `/api/gmail/status` | Last sync time |

### Dedup

- [ ] Skip nếu `gmailMessageId` đã tồn tại trong Sheet

### Optional: auto sync

- [ ] Vercel Cron Job (`vercel.json` crons) gọi sync mỗi 15–30 phút
- [ ] Hoặc Gmail Push Notification qua Pub/Sub (phức tạp hơn — phase sau)

**Verify:** Forward 1 email mua hàng → sync → row mới xuất hiện đúng tháng.

---

## Phase 6 — Polish & production

- [ ] Nút "Đồng bộ Gmail" trên trang chi phí
- [ ] Toast notification khi sync xong
- [ ] Error handling: token expired → re-login
- [ ] Rate limit Gemini / Gmail API
- [ ] Favicon + meta title
- [ ] Mobile responsive final check
- [ ] README deploy instructions

**Verify:** Deploy production Vercel, test end-to-end trên mobile.

---

## Quy ước code

- TypeScript everywhere (frontend + api)
- Không hardcode secrets
- API response format:

```json
{ "data": {}, "error": null }
{ "data": null, "error": { "message": "..." } }
```

- Pagination API: `{ items, total, page, limit, totalPages }`
- Month filter: query param `month=YYYY-MM`
- Default page size: **20**

---

## Tham chiếu UI hiện tại

| File | Mô tả |
|------|-------|
| `web/src/pages/ExpensesPage.tsx` | Trang chính + month filter + pagination |
| `web/src/pages/SettingsPage.tsx` | Danh mục cha/con |
| `web/src/pages/LoginPage.tsx` | Login screen |
| `web/src/constants.ts` | `PAGE_SIZE = 20` |
| `web/src/types/index.ts` | Expense, CategoryParent types |

---

## Thứ tự ưu tiên cho agent tiếp theo

1. Phase 1 — Google Cloud + Sheet schema
2. Phase 2 — Vercel monorepo
3. Phase 3 — OAuth
4. Phase 4 — Sheets CRUD
5. Phase 5 — Gmail + Gemini
6. Phase 6 — Polish
