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
- [ ] Deploy production
