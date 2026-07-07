# AGENT STATE — Expense Management App

## Current Objective

Xây personal app tracking chi tiêu từ Gmail purchase emails.

## Latest Update (2026-07-07)

### Completed

- [x] UI preview (React + TypeScript + Vite + Tailwind)
- [x] Month filter, pagination 20/trang, search, KPI theo tháng
- [x] Settings — danh mục cha/con
- [x] **Backend Vercel Functions** (`api/`)
- [x] Google OAuth (login, callback, me, logout)
- [x] Google Sheets CRUD (expenses, categories, sync state)
- [x] Gmail sync + Gemini parsing
- [x] Frontend wired to real API
- [x] `vercel.json` monorepo config
- [x] **Fix local dev startup** — Thay `vercel dev` bằng Express dev server (`api/dev-server.ts`)

### Local Dev Fix Log (2026-07-07)

| Vấn đề | Giải pháp |
|--------|-----------|
| Port 5173 bị chiếm + `strictPort: true` crash | Đổi `strictPort: false` trong `vite.config.ts` |
| `vercel dev` không tìm được CLI global | Dùng `npx vercel dev` → nhưng vẫn bị cloud override |
| Vercel Dashboard override `packageManager` → yarn | Thay toàn bộ bằng Express local dev server |
| Recursive invocation (`vercel dev` → `devCommand` → `vercel dev`) | Express server loại bỏ hoàn toàn vấn đề này |
| `gemini.ts` có ký tự `+` thừa gây `Unexpected end of file` | Xóa ký tự thừa |

### Next Steps

- [ ] Deploy production lên Vercel
- [ ] Add production redirect URI trên Google Cloud
- [ ] Optional: Vercel Cron auto-sync

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + TypeScript + Vite (`web/`) |
| Deploy | Vercel |
| Backend | Express local server → Vercel Serverless Functions (`api/`) |
| Storage | Google Sheets |
| Auth | Google OAuth 2.0 |
| Email | Gmail API |
| AI | Gemini API |

## API Routes

| Method | Route | Mô tả |
|--------|-------|-------|
| GET | `/api/health` | Health check |
| GET | `/api/auth/login` | Redirect Google OAuth |
| GET | `/api/auth/callback` | OAuth callback |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/expenses?month=&page=&limit=` | List expenses |
| GET/PUT | `/api/categories` | Read/save categories |
| POST | `/api/gmail/sync` | Sync Gmail → Sheets |
| GET | `/api/gmail/status` | Last sync time |

## Run Local

```bash
cd idea/expense-management-app
npm install && cd web && npm install && cd ..
npm run dev
```

- **Web**: http://localhost:5173 (Vite, proxy `/api` → port 3000)
- **API**: http://localhost:3000 (Express + tsx watch, no Vercel CLI needed)

> ⚠️ `.vercel/project.json` đã được backup thành `.bak` để tránh Vercel cloud linking.
> Restore lại trước khi deploy: `cp .vercel/project.json.bak .vercel/project.json`
