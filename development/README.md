# Development Tools & Shared Resources

Công cụ development và resources chia sẻ cho tất cả projects.

## 📁 Cấu trúc

```
development/
├── README.md (file này)
├── deployments/           ← Shared deployment configs
│   ├── README.md
│   ├── render/           ⭐ Khuyến nghị
│   │   ├── README.md
│   │   └── render.yaml
│   ├── railway/          ⭐ Alternative
│   │   ├── README.md
│   │   ├── railway.json
│   │   └── Procfile
│   ├── vercel/           ⚠️  Limited (12 functions)
│   │   ├── README.md
│   │   └── vercel.json
│   └── heroku/           ❌ Paid only
│       ├── README.md
│       ├── Procfile
│       └── runtime.txt
└── scripts/              ← Setup & automation scripts
    └── init-deployment-link.sh
```

## 🚀 Quick Start

### Cho project mới

```bash
# Từ repo root
./development/scripts/init-deployment-link.sh <project-name>
```

Ví dụ:
```bash
./development/scripts/init-deployment-link.sh trading-tool
```

Script sẽ:
1. ✅ Tạo symlink `idea/<project-name>/deployments` → `../../development/deployments`
2. ✅ Setup ngay mà không cần copy files

### Cho project hiện tại

Từ project folder:
```bash
cd idea/expense-management-app

# Xem available deployment options
ls -la deployments/

# Chọn platform (ví dụ Render)
cd deployments/render
cat README.md
```

## 📊 Deployment Platforms

| Platform | Giá | Status | Use Case |
|----------|-----|--------|----------|
| [Render](./deployments/render/README.md) | Free | ⭐ Khuyến nghị | Side projects, unlimited functions |
| [Railway](./deployments/railway/README.md) | $5/mo | ⭐ Tốt | Performance-focused, good DX |
| [Vercel](./deployments/vercel/README.md) | Free* | ⚠️ Limited | Next.js, limited to 12 functions |
| [Heroku](./deployments/heroku/README.md) | $7+/mo | ❌ Deprecated | Legacy, no free tier anymore |

*Vercel Hobby plan: 12 functions max

## 🔐 Shared Environment Variables

Tất cả deployment platforms đều dùng:

```
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
SESSION_SECRET=<random-secure-string>
GEMINI_API_KEY=<your-gemini-api-key>
GMAIL_USER=<your-gmail@gmail.com>
NODE_ENV=production
```

## 🛠️ Scripts

### `init-deployment-link.sh`

Tạo symlink deployment configs cho project mới.

**Usage:**
```bash
./development/scripts/init-deployment-link.sh <project-name>
```

**Options:**
- Auto-detects project location
- Handles existing deployments folder
- Works on Windows, Mac, Linux

**Example:**
```bash
# Setup deployments cho project "find-job-tool"
./development/scripts/init-deployment-link.sh find-job-tool

# Output:
# ✅ Setup complete!
# 📁 Project structure:
#    idea/find-job-tool/deployments → ../../development/deployments
```

## 📝 Maintaining Shared Configs

Khi update deployment configs:

1. **Edit file trong `development/deployments/`**
   ```bash
   vim development/deployments/render/README.md
   ```

2. **Tất cả projects tự động cập nhật**
   - Vì symlink, không cần copy lại
   - Changes apply instantly

3. **Commit changes lên Git**
   ```bash
   git add development/deployments/
   git commit -m "Update deployment configs"
   ```

## 🤔 FAQ

### Q: Symlink có work trên Windows không?
**A:** Có, Windows 10+ support symlinks. Script tự động detect OS.

### Q: Nếu xóa development/deployments thì sao?
**A:** Symlinks sẽ break. Backup first!

### Q: Có thể override deployment configs per-project không?
**A:** Có, copy file từ symlink rồi modify:
```bash
cd idea/my-project
cp deployments/render/render.yaml .
# Edit render.yaml locally
```

### Q: Tại sao dùng symlink thay vì git submodules?
**A:** Symlinks đơn giản hơn, không cần extra git commands.

## 📚 Resources

- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Heroku Docs](https://devcenter.heroku.com)

---

**Created:** 2026-07-17  
**Last Updated:** 2026-07-17
