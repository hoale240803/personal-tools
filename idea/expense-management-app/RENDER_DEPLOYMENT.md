# Deploy to Render

## Setup Hướng dẫn

### 1. Tạo Render Account
- Truy cập: https://render.com
- Đăng ký/Đăng nhập bằng GitHub

### 2. Connect Repository
- Trên Render Dashboard, chọn **"New +"** → **"Blueprint"**
- Chọn repository `personal-tools`
- Chọn branch `feature/render-deployment`

### 3. Cấu hình Environment Variables

**Cho Backend (expense-management-api):**
```
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
SESSION_SECRET=<random-string>
GEMINI_API_KEY=<your-gemini-key>
GMAIL_USER=<your-gmail>
```

**Lưu ý:** `GOOGLE_REDIRECT_URI` sẽ tự động set thành:
```
https://expense-management-api.onrender.com/api/auth/callback
```

### 4. Deploy
- Nhấn **"Deploy"** - Render sẽ tự động:
  - Build backend (Express.js)
  - Build frontend (React)
  - Deploy cả hai service

### 5. Kết quả
Bạn sẽ có 2 URLs:
- **Frontend:** `https://expense-management-web.onrender.com`
- **Backend API:** `https://expense-management-api.onrender.com/api`

## Lợi ích so với Vercel
✅ Không giới hạn Serverless Functions (miễn phí)
✅ Deploy từ 1 blueprint file
✅ Tự động update khi push code
✅ Hỗ trợ cron jobs cho gmail/watch & gmail/flush

## Lưu ý quan trọng
- File `render.yaml` định nghĩa 2 services: backend API + static frontend
- Khi push code lên branch `feature/render-deployment`, Render sẽ tự động redeploy
- Free tier trên Render có một số hạn chế (spin down sau 15 phút inactivity)

## Tương lai
Nếu muốn upgrade:
- Chuyển từ `free` → `starter` plan (~$7/month)
- Vô hiệu hóa auto spin-down

