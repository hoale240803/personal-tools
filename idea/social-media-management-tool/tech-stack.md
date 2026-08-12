# Tech Stack — AI Social Content Management Tool

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                   Next.js 14 (Frontend)               │
│         App Router + TypeScript + Tailwind            │
└───────────────────────┬──────────────────────────────┘
                        │ REST API (HTTP/JSON)
┌───────────────────────▼──────────────────────────────┐
│              Node.js + Express (Backend)              │
│              TypeScript + Prisma ORM                  │
│  ┌─────────────┐  ┌──────────┐  ┌─────────────────┐ │
│  │  Auth Layer │  │ Services │  │  Queue Workers   │ │
│  │  JWT/bcrypt │  │ (per mod)│  │  BullMQ + Redis  │ │
│  └─────────────┘  └──────────┘  └─────────────────┘ │
└──────┬────────────┬──────────────┬────────────────────┘
       │            │              │
┌──────▼───┐  ┌─────▼──────┐  ┌──▼────────────┐
│PostgreSQL│  │  Cloudinary │  │ Redis (Queue) │
│(Prisma)  │  │(Media Store)│  │  + BullMQ     │
└──────────┘  └────────────┘  └───────────────┘
                                        │
                        ┌───────────────▼───────────┐
                        │ Platform APIs              │
                        │ Instagram Graph API        │
                        │ Facebook Graph API         │
                        │ TikTok for Business (P2)   │
                        └───────────────────────────┘
```

---

> [!IMPORTANT]
> ## ⚠️ Lưu Ý Quan Trọng: Sử Dụng hl-sdk-ts cho Tích Hợp Bên Thứ 3
>
> **Tất cả các tích hợp với dịch vụ bên thứ 3** (Instagram Graph API, Facebook Graph API, TikTok for Business, AI providers như Gemini/OpenAI/Claude, Cloudinary, v.v.) **PHẢI được thực hiện thông qua thư viện:**
>
> 📦 **[`hl-sdk-ts`](https://github.com/hoale240803/hl-sdk-ts)**
>
> **Lý do:**
> - Chuẩn hóa cách gọi API bên thứ 3 trong toàn bộ dự án
> - Tái sử dụng logic xử lý lỗi, retry, và authentication đã được đóng gói sẵn
> - Dễ bảo trì và cập nhật khi API bên thứ 3 thay đổi
> - Đảm bảo consistency giữa các platform service (`InstagramService`, `FacebookService`, `TikTokService`, v.v.)
>
> **Áp dụng cho các module:**
> - `backend/src/services/platforms/` — tất cả platform services
> - `backend/src/services/providers/` — tất cả AI providers
> - `backend/src/services/CloudinaryService.ts` — media upload

---

## 📦 Dependencies

### Frontend (`frontend/`)
```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "typescript": "5.x",
    "axios": "^1.6",
    "@tanstack/react-query": "^5.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "react-dropzone": "^14.x",
    "react-beautiful-dnd": "^13.x",
    "date-fns": "^3.x",
    "lucide-react": "^0.x"
  }
}
```

### Backend (`backend/`)
```json
{
  "dependencies": {
    "express": "^4.x",
    "typescript": "5.x",
    "@prisma/client": "^5.x",
    "prisma": "^5.x",
    "jsonwebtoken": "^9.x",
    "bcrypt": "^5.x",
    "bullmq": "^5.x",
    "ioredis": "^5.x",
    "cloudinary": "^2.x",
    "winston": "^3.x",
    "zod": "^3.x",
    "cors": "^2.x",
    "express-rate-limit": "^7.x",
    "multer": "^1.x",
    "nodemailer": "^6.x",
    "crypto": "built-in"
  }
}
```

---

## 🗄️ Database Schema (PostgreSQL + Prisma)

```prisma
// schema.prisma

model User {
  id            String      @id @default(uuid())
  email         String      @unique
  passwordHash  String
  name          String
  avatarUrl     String?
  language      String      @default("vi")
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  workspaceMembers WorkspaceMember[]
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Workspace {
  id            String   @id @default(uuid())
  name          String
  businessType  String   // "nails" | "real_estate" | "food_beverage" | "other"
  logoUrl       String?
  timezone      String   @default("Asia/Ho_Chi_Minh")
  createdAt     DateTime @default(now())
  members       WorkspaceMember[]
  posts         Post[]
  platformAccounts PlatformAccount[]
}

model WorkspaceMember {
  id          String    @id @default(uuid())
  workspaceId String
  userId      String
  role        String    // "owner" | "editor" | "viewer"
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([workspaceId, userId])
}

model Post {
  id              String    @id @default(uuid())
  workspaceId     String
  status          String    @default("DRAFT") // DRAFT | SCHEDULED | PUBLISHING | PUBLISHED | FAILED
  rawDescription  String?   @db.Text
  location        String?
  scheduledAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  workspace       Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  images          PostImage[]
  platformPosts   PlatformPost[]
  aiGenerations   AIGeneration[]
}

model PostImage {
  id              String  @id @default(uuid())
  postId          String
  cloudinaryId    String  // Cloudinary public_id
  secureUrl       String
  position        Int     // 0-indexed ordering
  width           Int?
  height          Int?
  post            Post    @relation(fields: [postId], references: [id], onDelete: Cascade)
}

model PlatformPost {
  id              String    @id @default(uuid())
  postId          String
  platform        String    // "instagram" | "facebook" | "tiktok" | "google_business"
  caption         String?   @db.Text
  hashtags        String?   @db.Text
  status          String    @default("PENDING") // PENDING | PUBLISHED | FAILED
  publishedAt     DateTime?
  platformPostId  String?   // ID từ platform sau khi đăng thành công
  platformPostUrl String?
  errorMessage    String?   @db.Text
  retryCount      Int       @default(0)
  post            Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
}

model PlatformAccount {
  id                    String    @id @default(uuid())
  workspaceId           String
  platform              String    // "instagram" | "facebook" | "tiktok"
  accountName           String
  accountId             String    // Platform's user/page ID
  encryptedAccessToken  String    @db.Text  // AES-256 encrypted
  encryptedRefreshToken String?   @db.Text  // AES-256 encrypted
  tokenExpiresAt        DateTime?
  status                String    @default("CONNECTED") // CONNECTED | DISCONNECTED | EXPIRED
  workspace             Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  @@unique([workspaceId, platform, accountId])
}

model AIGeneration {
  id          String   @id @default(uuid())
  postId      String
  platform    String
  prompt      String   @db.Text
  response    String   @db.Text
  provider    String   // "gemini" | "openai" | "claude"
  tone        String?  // "formal" | "friendly"
  createdAt   DateTime @default(now())
  post        Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
}

model Notification {
  id          String   @id @default(uuid())
  userId      String
  type        String   // "publish_success" | "publish_failed" | "reconnect_account"
  title       String
  message     String
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

---

## 📁 Folder Structure

```
social-media-management-tool/
├── frontend/                         # Next.js 14
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── posts/
│   │   │   │   ├── page.tsx          # Post list / history
│   │   │   │   ├── new/page.tsx      # Create new post
│   │   │   │   └── [id]/page.tsx     # Edit/view post
│   │   │   ├── analytics/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── workspace/page.tsx
│   │   └── api/                      # Next.js API Routes (proxy to backend)
│   ├── components/
│   │   ├── ui/                       # Reusable UI components
│   │   ├── post/
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── CaptionEditor.tsx
│   │   │   ├── PlatformPreview.tsx
│   │   │   └── PublishButton.tsx
│   │   ├── ai/
│   │   │   ├── AIGeneratorPanel.tsx
│   │   │   └── ToneSelector.tsx
│   │   └── workspace/
│   │       └── WorkspaceSwitcher.tsx
│   ├── services/                     # API call functions (frontend)
│   │   ├── PostService.ts
│   │   ├── AuthService.ts
│   │   └── AIService.ts
│   └── types/                        # Shared TypeScript types
│
├── backend/                          # Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── post.routes.ts
│   │   │   ├── workspace.routes.ts
│   │   │   ├── platform.routes.ts
│   │   │   └── analytics.routes.ts
│   │   ├── services/                 # Business logic (1 file = 1 responsibility)
│   │   │   ├── AuthService.ts
│   │   │   ├── PostService.ts
│   │   │   ├── CloudinaryService.ts
│   │   │   ├── AIService.ts
│   │   │   ├── providers/
│   │   │   │   ├── AIProvider.interface.ts
│   │   │   │   ├── GeminiProvider.ts
│   │   │   │   ├── OpenAIProvider.ts
│   │   │   │   └── ClaudeProvider.ts
│   │   │   ├── platforms/
│   │   │   │   ├── InstagramService.ts
│   │   │   │   ├── FacebookService.ts
│   │   │   │   └── TikTokService.ts
│   │   │   └── PublishService.ts
│   │   ├── helpers/                  # Sub-function helpers
│   │   │   ├── InstagramPublishHelper.ts
│   │   │   ├── PromptBuilderHelper.ts
│   │   │   └── TokenEncryptionHelper.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── rateLimiter.middleware.ts
│   │   │   └── errorHandler.middleware.ts
│   │   ├── queue/
│   │   │   ├── publishQueue.ts       # BullMQ queue definition
│   │   │   └── publishWorker.ts     # BullMQ worker processor
│   │   ├── config/
│   │   │   └── settings.json        # Credentials (gitignored)
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── app.ts                   # Express app entry
│   └── tsconfig.json
│
└── AGENT_STATE.md                   # Agent handover tracking
```

---

## 🌐 API Endpoints Map

| Method | Endpoint | Module | Phase |
|--------|----------|--------|-------|
| POST | `/api/auth/login` | Auth | MVP |
| POST | `/api/auth/register` | Auth | MVP |
| POST | `/api/auth/refresh` | Auth | MVP |
| POST | `/api/auth/forgot-password` | Auth | MVP |
| GET/PATCH | `/api/users/me` | Auth | MVP |
| GET/POST | `/api/workspaces` | Workspace | MVP |
| PATCH/DELETE | `/api/workspaces/:id` | Workspace | MVP |
| GET/POST | `/api/posts` | Content | MVP |
| PATCH/DELETE | `/api/posts/:id` | Content | MVP |
| POST | `/api/posts/:id/images` | Upload | MVP |
| DELETE | `/api/posts/:id/images/:imgId` | Upload | MVP |
| POST | `/api/posts/:id/generate` | AI | MVP |
| POST | `/api/posts/:id/publish` | Publish | MVP |
| PATCH | `/api/posts/:id/schedule` | Publish | MVP |
| GET | `/api/posts/:id/status` | Publish | MVP |
| GET/DELETE | `/api/platforms/accounts` | Platform | MVP |
| GET | `/api/platforms/:platform/oauth/url` | Platform | MVP |
| GET | `/api/platforms/:platform/oauth/callback` | Platform | MVP |
| GET | `/api/analytics/posts/:id` | Analytics | Beta |
| GET | `/api/notifications` | Notification | MVP |

---

## 🔐 Security Decisions

| Concern | Decision |
|---------|----------|
| Password | bcrypt (cost=12) |
| JWT | access=15m, refresh=7d (HttpOnly cookie) |
| Platform tokens | AES-256-GCM encrypt, key từ env var `TOKEN_ENCRYPTION_KEY` |
| API Rate limit | `express-rate-limit`: 100 req/min/IP (general), 10 req/min/user (AI) |
| CORS | Whitelist `NEXT_PUBLIC_APP_URL` only |
| File upload | Validate MIME type server-side, route qua backend trước khi lên Cloudinary |
