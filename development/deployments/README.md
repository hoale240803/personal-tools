# Deployment Configurations

Bộ sưu tập cấu hình deployment cho các projects trên các nền tảng khác nhau.

## 📊 Bảng so sánh

| Platform | Giá | Giới hạn Functions | Cron Jobs | Khuyến nghị |
|----------|-----|-------------------|-----------|-----------|
| **Render** | Free | ✅ Không giới hạn | ✅ Có | ⭐⭐⭐ |
| **Railway** | Free ($5) | ✅ Không giới hạn | ✅ Có | ⭐⭐⭐ |
| **Vercel** | Free (12 fn) | ⚠️ 12/plan | ✅ Có | ⚠️ Limited |
| **Heroku** | $7+/tháng | ✅ Unlimited | ✅ Có | ❌ Quá đắt |

## 🚀 Chọn nền tảng

- **Khuyến nghị:** Render - Free, unlimited, tốc độ nhanh
- **Alternative:** Railway - $5/tháng credit, performance cao
- **Legacy:** Vercel - Giới hạn 12 functions

## 📁 Cấu trúc

```
deployments/
├── README.md
├── vercel/
│   ├── README.md
│   └── vercel.json
├── render/
│   ├── README.md
│   └── render.yaml
├── railway/
│   ├── README.md
│   ├── railway.json
│   └── Procfile
└── heroku/
    ├── README.md
    ├── Procfile
    └── runtime.txt
```

## 🔐 Environment Variables (Chung)

```
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
SESSION_SECRET=<random-secure-string>
GEMINI_API_KEY=<your-gemini-api-key>
GMAIL_USER=<your-gmail@gmail.com>
NODE_ENV=production
```
