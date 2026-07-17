# Render Deployment ⭐

## Status
✅ **Khuyến nghị cho Free tier**
✅ **Unlimited Serverless Functions**
✅ **Hỗ trợ Cron jobs**
✅ **Tự động deploy từ GitHub**

## Deploy

### 1. Tạo Render Account
```
https://render.com
→ Sign up with GitHub
```

### 2. Connect Repository
- Dashboard → **"New +"** → **"Blueprint"**
- Chọn repository: `personal-tools`
- Chọn branch mong muốn

### 3. Cấu hình Environment Variables

```
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
SESSION_SECRET=<random-string>
GEMINI_API_KEY=<your-gemini-api-key>
GMAIL_USER=<your-gmail@gmail.com>
NODE_ENV=production
```

### 4. Deploy
- Nhấn **"Deploy Blueprint"**
- Render sẽ tự động build & deploy

## Lợi ích

✅ **Unlimited Functions** - Không giới hạn số lượng API endpoints
✅ **Cron Jobs** - Hỗ trợ scheduled tasks
✅ **Auto Deploy** - Tự động deploy khi push code
✅ **Free Tier** - Hoàn toàn miễn phí

## Links

- 📖 [Render Docs](https://render.com/docs)
- 📋 [Blueprint Reference](https://render.com/docs/infrastructure-as-code)
