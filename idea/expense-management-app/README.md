# Expense Management App

Personal app tự động tracking chi tiêu từ email mua hàng Gmail.

## Cấu trúc Monorepo

```
expense-management-app/
├── api/          # Vercel Serverless Functions
├── web/          # React + Vite frontend
├── package.json  # workspaces + scripts gốc
├── vercel.json       # deploy + chế độ dev gộp 1 port
└── vercel.api.json   # dev API-only (không chạy Vite)
```

## Cài đặt

```bash
cd idea/expense-management-app
npm install
# Tạo .env từ .env.example và điền keys
```

## Chạy local

### Chế độ tách (khuyến nghị khi dev UI) — 1 terminal

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Web (Vite) | http://localhost:5173 |
| API (Vercel) | http://localhost:3000 |

Vite proxy `/api` → `http://localhost:3000`. Test API: http://localhost:3000/api/health

API dùng `vercel.api.json` riêng (không có `devCommand`) để tránh Vercel khởi động thêm Vite trùng port.

### Chế độ tách — 2 terminal

```bash
# Terminal 1 — API
cd api && npm run dev

# Terminal 2 — Web
cd web && npm run dev
```

### Chế độ gộp 1 port (OAuth cookie cùng origin)

```bash
npx vercel dev
```

Mở http://localhost:3000 — frontend + API cùng origin, phù hợp test OAuth.

## Troubleshooting

| Triệu chứng | Nguyên nhân | Cách xử lý |
|-------------|-------------|------------|
| Web chạy ở `5174` thay vì `5173` | Port 5173 đang bị process cũ chiếm | Tắt terminal/`npm run dev` cũ, chạy lại |
| `3000` không lên / API không phản hồi | Port 3000 bị chiếm hoặc Vercel dev lỗi build | Tắt process cũ trên port 3000; chạy lại `npm run dev` |
| `'yarn' is not recognized` | Project Vercel trên dashboard cấu hình dùng yarn | Vào Vercel Project Settings → Build & Development → đổi Install Command thành `npm install`, hoặc bỏ qua nếu log vẫn hiện `Ready! Available at http://localhost:3000` |

## Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Deploy | Vercel |
| Backend | Vercel Serverless Functions |
| Lưu trữ | Google Sheets |
| Auth | Google OAuth 2.0 |
| Email + AI | Gmail API + Gemini API |

## Roadmap

Xem [`ROADMAP.md`](ROADMAP.md) — checklist chi tiết.

## Trạng thái

- [x] UI + backend API
- [x] Google OAuth
- [x] Google Sheets
- [x] Gmail + Gemini sync
- [x] Deploy production

---

## 🚀 Deploy (Tổng quan các nền tảng)

| Nền tảng | Loại | Auto-deploy | Cron Jobs | Free tier |
|----------|------|-------------|-----------|-----------|
| **Vercel** | Serverless | ✅ push → main | ✅ (Pro plan) | ✅ |
| **Render** | Web Service + Static | ✅ push → main | ✅ Cron Job service | ✅ (có sleep) |
| **Fly.io** | Docker container | ✅ Deploy Hook | ✅ Scheduled machines | ✅ ($5 credit) |

---

## 🟦 Deploy lên Render (Blueprint — 1-click)

**Cơ chế**: Render kết nối GitHub, tự pull và deploy mỗi khi push lên `main`. Không cần GitHub Actions.

### Bước 1 — Cấu hình `render.yaml`

File `render.yaml` đã có sẵn ở root, định nghĩa đủ 2 services:
- `expense-api` — Express Web Service
- `expense-web` — React Static Site

Mở file và chỉnh 2 giá trị:
```yaml
region: singapore   # Đổi thành region gần bạn nhất
app: expense-api    # Đổi tên app nếu muốn
```

### Bước 2 — Connect Render với GitHub (1 lần)

1. Vào [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint**
2. **Connect a repository** → chọn repo `expense-management-app`
3. Render tự detect `render.yaml` và liệt kê 2 services
4. Bấm **Apply** → cả 2 services được tạo tự động

### Bước 3 — Set Environment Variables (1 lần)

Vào từng service → **Environment** → thêm các biến:

**API service** (`expense-api`):
| Variable | Giá trị |
|----------|---------|
| `GEMINI_API_KEY` | Lấy từ Google AI Studio |
| `GOOGLE_CLIENT_ID` | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | `https://expense-api.onrender.com/api/auth/callback` |
| `APP_ORIGIN` | `https://expense-web.onrender.com` |
| `USER_SESSIONS` | JSON array từ `.dev-session.json` |
| `PUBSUB_TOPIC_NAME` | Pub/Sub topic name |
> `SESSION_SECRET` và `CRON_SECRET` đã được `render.yaml` tự `generateValue`.

**Web service** (`expense-web`): Không cần env var thêm vì đây là static site.

### Bước 4 — Cập nhật Google OAuth

Trong Google Cloud Console → Credentials → OAuth Client:
- **Authorized redirect URIs**: thêm `https://expense-api.onrender.com/api/auth/callback`
- **Authorized JavaScript origins**: thêm `https://expense-web.onrender.com`

### Sau đó — Auto-deploy

```bash
# Chỉ cần push code, Render tự deploy!
git push origin main
```

Theo dõi tại: **Render Dashboard → service → Events**

---

## 🟣 Deploy lên Fly.io (Deploy Hook + GitHub Actions)

**Cơ chế**: GitHub Actions gọi Fly.io Deploy Hook URL mỗi khi push lên `main` → Fly.io build Docker image và deploy.

### Bước 1 — Cài flyctl và tạo apps (1 lần)

```bash
# Cài flyctl
# Windows (PowerShell):
iwr https://fly.io/install.ps1 -useb | iex

# Đăng nhập
flyctl auth login

# Tạo API app (chạy từ root project)
flyctl apps create expense-api --config fly.api.toml

# Tạo Web app
flyctl apps create expense-web --config fly.web.toml
```

### Bước 2 — Set secrets cho API (1 lần)

```bash
flyctl secrets set \
  GEMINI_API_KEY="..." \
  GOOGLE_CLIENT_ID="..." \
  GOOGLE_CLIENT_SECRET="..." \
  GOOGLE_REDIRECT_URI="https://expense-api.fly.dev/api/auth/callback" \
  APP_ORIGIN="https://expense-web.fly.dev" \
  SESSION_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")" \
  CRON_SECRET="$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")" \
  USER_SESSIONS='[{"email":"...","refreshToken":"...","spreadsheetId":"..."}]' \
  --config fly.api.toml
```

### Bước 3 — Lấy Deploy Hook URLs

```bash
# Lấy Deploy Hook cho API
flyctl deploy-hooks create --app expense-api

# Lấy Deploy Hook cho Web
flyctl deploy-hooks create --app expense-web
```

Copy 2 URLs dạng: `https://api.fly.io/v1/apps/.../deploy_hooks/...`

### Bước 4 — Thêm GitHub Secrets

Vào repo GitHub → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret name | Giá trị |
|-------------|---------|
| `FLY_DEPLOY_HOOK_API` | Deploy Hook URL của `expense-api` |
| `FLY_DEPLOY_HOOK_WEB` | Deploy Hook URL của `expense-web` |

### Sau đó — Auto-deploy

```bash
# Push lên main → GitHub Actions tự gọi Deploy Hooks → Fly.io deploy
git push origin main
```

Theo dõi tại: [fly.io/dashboard](https://fly.io/dashboard)

---

## 🚀 Deploy lên Vercel (Production)

Chiến lược: **1 Vercel project duy nhất** từ root monorepo — web + API cùng project, cron jobs hoạt động tự động.

### Bước 1 — Push code lên GitHub

Đảm bảo repo đã có trên GitHub và `.gitignore` đã loại trừ `.env`, `node_modules`, `dist`.

```bash
git add .
git commit -m "chore: prepare for vercel deploy"
git push origin main
```

### Bước 2 — Tạo Vercel Project từ GitHub

1. Vào [vercel.com/new](https://vercel.com/new) → **Import Git Repository**
2. Chọn repo `expense-management-app`
3. Trong **Configure Project**, để nguyên các giá trị mặc định (project đã có `vercel.json` tự cấu hình đủ rồi)
4. **CHƯA bấm Deploy** — cần set env vars trước (Bước 3)

> **Framework Preset**: chọn `Other` (không phải Next.js hay Vite)

### Bước 3 — Cấu hình Environment Variables

Vào **Project Settings → Environment Variables**, thêm tất cả các biến sau cho scope **Production** (và **Preview** nếu muốn):

| Variable | Giá trị | Ghi chú |
|----------|---------|---------|
| `GOOGLE_CLIENT_ID` | `591704224566-...` | Lấy từ Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Lấy từ Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | `https://<your-app>.vercel.app/api/auth/callback` | ⚠️ Phải là production URL |
| `GEMINI_API_KEY` | `AQ.Ab8RN6...` | Lấy từ Google AI Studio |
| `SPREADSHEET_ID` | `1N8H_Oxc...` | ID của Google Sheet |
| `SESSION_SECRET` | *(generate mới)* | Dùng `openssl rand -base64 32` |
| `APP_ORIGIN` | `https://<your-app>.vercel.app` | URL frontend production (không có `/`) |
| `PUBSUB_TOPIC_NAME` | `projects/.../topics/gmail-push` | Tên Pub/Sub topic |
| `LOG_EMAIL_BODY` | `false` | Tắt debug log ở production |

> **Tạo SESSION_SECRET mới cho production:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
> ```

### Bước 4 — Cập nhật Google OAuth Redirect URI

⚠️ Bước này bắt buộc — nếu bỏ qua sẽ gặp lỗi `redirect_uri_mismatch` khi đăng nhập.

1. Vào [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**
2. Chọn OAuth 2.0 Client ID đang dùng
3. Trong **Authorized redirect URIs**, thêm:
   ```
   https://<your-app>.vercel.app/api/auth/callback
   ```
4. Trong **Authorized JavaScript origins**, thêm:
   ```
   https://<your-app>.vercel.app
   ```
5. **Save**

### Bước 5 — Deploy

Quay lại Vercel Dashboard và bấm **Deploy** (hoặc push thêm 1 commit để trigger CI/CD).

Sau deploy thành công:
- 🌐 Frontend: `https://<your-app>.vercel.app`
- 🔌 API health: `https://<your-app>.vercel.app/api/health`

### Cron Jobs (tự động)

`vercel.json` đã cấu hình sẵn 2 cron jobs (chỉ chạy trên Vercel Pro/Team — free plan không hỗ trợ):

| Job | Schedule | Mô tả |
|-----|----------|--------|
| `/api/gmail/watch` | Mỗi 6 tiếng | Renew Gmail Push Notification |
| `/api/gmail/flush` | 23:59 UTC hàng ngày | Flush pending queue |

### CI/CD tự động

Sau khi link GitHub xong, mọi commit push lên `main` sẽ tự động trigger deploy. Pull Request sẽ tạo **Preview deployment** riêng với URL tạm.

```bash
# Deploy production: chỉ cần push
git push origin main

# Kiểm tra logs deploy
# Vercel Dashboard → Project → Deployments
```
