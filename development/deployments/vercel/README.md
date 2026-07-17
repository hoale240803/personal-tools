# Vercel Deployment

## Status
⚠️ **Giới hạn:** 12 Serverless Functions trên Hobby plan
❌ **Khuyến nghị:** Migrate sang Render hoặc Railway

## Deploy

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login
```bash
vercel login
```

### 3. Deploy
```bash
vercel
```

### 4. Setup Environment Variables
```bash
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add SESSION_SECRET
vercel env add GEMINI_API_KEY
vercel env add GMAIL_USER
```

### 5. Production Deploy
```bash
vercel --prod
```

## Giải quyết lỗi "12 Functions Limit"

### Option A: Upgrade Plan
- Chuyển sang Pro plan ($20/month)

### Option B: Migrate sang Render ⭐ (Khuyến nghị)
- Xem: `../render/README.md`
- Không giới hạn functions, miễn phí

### Option C: Gộp API endpoints
- Sử dụng catch-all route: `api/[...route].ts`
- Giảm số lượng files sang dưới 12

## Links

- 📖 [Vercel Docs](https://vercel.com/docs)
- 🔧 [vercel.json Config](https://vercel.com/docs/projects/project-configuration)
