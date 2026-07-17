# Railway Deployment

## Status
✅ **Performance cao**
✅ **$5/tháng free credit**
✅ **Unlimited Functions**
✅ **Hỗ trợ Cron jobs**

## Deploy

### 1. Tạo Railway Account
```
https://railway.app
→ Sign up with GitHub
```

### 2. Tạo New Project
- Dashboard → **"New Project"** → **"Deploy from GitHub"**
- Chọn repository: `personal-tools`
- Railway sẽ auto-detect Node.js project

### 3. Setup Environment Variables
Railway dashboard → Variables:

```
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
SESSION_SECRET=<random-string>
GEMINI_API_KEY=<your-gemini-api-key>
GMAIL_USER=<your-gmail@gmail.com>
NODE_ENV=production
GOOGLE_REDIRECT_URI=https://<railway-api-domain>/api/auth/callback
```

### 4. Deploy
- Railway tự động deploy khi push code

## Lợi ích

✅ **$5/tháng free credit** - Đủ cho side projects
✅ **Performance tốt** - Nhanh hơn Render trên free tier
✅ **Giao diện đẹp** - Dashboard dễ dùng
✅ **Auto deploy** - Tự động deploy từ GitHub

## Links

- 📖 [Railway Docs](https://docs.railway.app)
- 🔧 [Procfile Reference](https://docs.railway.app/deploy/deployments#procfile)
