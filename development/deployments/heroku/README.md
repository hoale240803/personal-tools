# Heroku Deployment

## Status
❌ **Không có free tier** (ngừng từ 2022)
⚠️ **Cần nâng cấp plan** ($7+/tháng)

## Lưu ý quan trọng

Heroku đã **loại bỏ free tier** từ tháng 11/2022. Để deploy, bạn cần:
- Credit card hoàn chỉnh
- Minimum plan: **Eco** ($7/month)

## Deploy

### 1. Tạo Heroku Account
```
https://www.heroku.com
→ Sign up
→ Add Payment Method (bắt buộc)
```

### 2. Install Heroku CLI
```bash
npm install -g heroku
```

### 3. Login
```bash
heroku login
```

### 4. Tạo App
```bash
heroku create app-name
```

### 5. Setup Environment Variables
```bash
heroku config:set GOOGLE_CLIENT_ID=<your-client-id>
heroku config:set GOOGLE_CLIENT_SECRET=<your-client-secret>
heroku config:set SESSION_SECRET=<random-string>
heroku config:set GEMINI_API_KEY=<your-gemini-api-key>
heroku config:set GMAIL_USER=<your-gmail@gmail.com>
```

### 6. Deploy
```bash
git push heroku main
```

## Pricing

| Plan | Giá | Dyno | Memory |
|------|-----|------|--------|
| Eco | $7/mo | Shared | 512MB |
| Basic | $7/mo | Dedicated | 512MB |
| Standard | $25/mo | Dedicated | 1GB |

## Lời khuyên

Nếu đang cân nhắc Heroku vs alternatives:
- **Render**: Free, unlimited functions → TỐT HƠN
- **Railway**: $5/tháng credit, performance cao → TỐT HƠN
- **Heroku**: $7+/tháng, cũ → KHÔNG KHUYẾN NGHỊ

## Links

- 📖 [Heroku Docs](https://devcenter.heroku.com)
- 💳 [Pricing](https://www.heroku.com/pricing)
