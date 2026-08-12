# WBS — AI Social Content Management Tool

## 🗂️ Modules Overview
```
0. Project Setup
1. Authentication & User Management
2. Workspace
3. Content Management ⭐
4. AI Content Generator ⭐⭐⭐
5. Platform Integration ⭐⭐⭐
6. Publish Engine ⭐⭐⭐⭐
7. History Management
8. Analytics ⭐⭐
9. Notification
10. Settings
11. Admin
```

## 📅 Phases & Priorities

| Phase | Scope | Mục tiêu |
|-------|-------|----------|
| **Phase 1 — MVP** | Module 0,1,2,3,4(partial),5(IG+FB),6,7,9 | Có thể dùng thực tế để đăng bài |
| **Phase 2 — Beta** | Module 4(full),8,10 + TikTok/GBusiness | Thêm analytics, multi-platform |
| **Phase 3 — Full** | Module 11 + Website CMS + Multi AI | Full production |

Priority: 🔴 P0 (MVP Must), 🟠 P1 (Beta), 🟡 P2 (Nice-to-have)

---

## 0. Project Setup — Phase 1

### 0.1 Repository 🔴 P0
- Mono-repo: `social-media-management-tool/`
  - `frontend/` → Next.js 14 App Router
  - `backend/` → Node.js + Express
  - `shared/` → Types/constants dùng chung

### 0.2 Architecture 🔴 P0
- Frontend: Next.js 14 (App Router) + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM
- Queue: BullMQ + Redis
- Media Storage: Cloudinary
- Auth: JWT (access 15m + refresh 7d)

### 0.3 Database Setup 🔴 P0
- Cài đặt PostgreSQL
- Setup Prisma schema (xem `tech-stack.md`)
- Migration strategy + seed data

### 0.4 Environment 🔴 P0
- `.env` template cho backend (không commit secret)
- `settings.json` pattern theo agent-rules

### 0.5 Logging 🔴 P0
- Winston logger (backend)
- Log levels: ERROR, WARN, INFO, DEBUG
- Structured JSON logging để dễ parse

### 0.6 Error Handling 🔴 P0
- Global error middleware (Express)
- Chuẩn response format: `{ success, data, error, message }`
- HTTP status codes nhất quán

### 0.7 CI/CD 🟡 P2
- GitHub Actions: lint + test on PR
- Auto deploy khi merge vào `main`

### 0.8 Testing Strategy 🟠 P1
- Backend: Jest + Supertest (unit + integration tests)
- Frontend: Playwright (E2E)
- Coverage target: ≥ 70% cho core modules

---

## 1. Authentication — Phase 1

### 1.1 Login 🔴 P0
- POST `/api/auth/login` — email + password
- Return: access token + refresh token (HttpOnly cookie)

### 1.2 Register 🔴 P0
- POST `/api/auth/register`
- Email verification flow (optional MVP)

### 1.3 Forgot Password 🔴 P0
- POST `/api/auth/forgot-password` → gửi email reset link
- POST `/api/auth/reset-password` → validate token, set new password

### 1.4 User Profile 🔴 P0
- GET/PATCH `/api/users/me`
- Fields: name, avatar, language (vi/en)

### 1.5 Token Refresh 🔴 P0
- POST `/api/auth/refresh` — dùng refresh token → trả access token mới

### 1.6 RBAC Roles 🟠 P1
- **Owner**: full quyền trong workspace
- **Editor**: CRUD content, publish
- **Viewer**: chỉ xem, không publish

---

## 2. Workspace — Phase 1

_Một user có thể có nhiều business (workspace):_
```
Hoa
├── Nhà Đẹp BDS
├── H&H Nails
└── Coffee ABC
```

### 2.1 Create Workspace 🔴 P0
- POST `/api/workspaces`
- Fields: name, business type, logo, timezone

### 2.2 Edit Workspace 🔴 P0
- PATCH `/api/workspaces/:id`

### 2.3 Delete Workspace 🔴 P0
- DELETE `/api/workspaces/:id`
- Soft delete — giữ lại history posts

### 2.4 Switch Workspace 🔴 P0
- Frontend state: `activeWorkspaceId` trong context/cookie
- Mọi API request đều gửi kèm `workspaceId`

### 2.5 Media Storage (Cloudinary) 🔴 P0
- Upload ảnh lên **Cloudinary** thay vì lưu local server
- Backend: `CloudinaryService.js` xử lý upload + delete
- Lưu `cloudinary_public_id` + `secure_url` vào DB
- Tự động xóa ảnh Cloudinary khi draft bị xóa

### 2.6 Team Member 🟠 P1
- Invite member bằng email
- Assign role (Editor, Viewer)
- Revoke access

---

## 3. Content Management ⭐ — Phase 1

> **Đây là module lớn nhất và là core của ứng dụng.**

### 3.1 Draft 🔴 P0

#### Create Draft
- POST `/api/posts` → tạo draft trống với `status = DRAFT`

#### Edit Draft
- PATCH `/api/posts/:id`

#### Delete Draft
- DELETE `/api/posts/:id` (soft delete + xóa ảnh trên Cloudinary)

#### Duplicate Draft
- POST `/api/posts/:id/duplicate`

### 3.2 Upload Image 🔴 P0
- Upload lên Cloudinary qua backend (không upload thẳng từ client)
- Tối đa **10 ảnh/post**, mỗi ảnh **≤ 10MB**
- Format: JPG, PNG, WEBP
- Reorder: drag-and-drop (lưu `position` index)
- Crop / Rotate: basic transform qua Cloudinary URL params
- Delete: xóa khỏi Cloudinary + DB

### 3.3 Image Manager 🟠 P1
- Thư viện ảnh đã upload trong workspace
- Tái sử dụng ảnh cũ cho post mới

### 3.4 Description (Raw Input) 🔴 P0
- Text area nhập mô tả thô: loại sản phẩm, giá, location, điểm đặc biệt
- Template gợi ý theo business type
- Trường `location` (optional)
- Lưu auto-save mỗi 30 giây

### 3.5 Platform Selection 🔴 P0
- Checkbox chọn platforms: Instagram, Facebook, TikTok, Google Business
- Sau khi chọn → generate caption cho từng platform

### 3.6 Auto Save 🔴 P0
- Debounce 30s sau mỗi lần user ngừng gõ
- Indicator: "Đã lưu lúc HH:MM"

### 3.7 Version History 🟠 P1
- Giữ tối đa 10 versions của caption (trước khi AI update)

---

## 4. AI Generator ⭐⭐⭐ — Phase 1 (partial)

> Đây là phần "AI" — core value của sản phẩm.

### 4.1 Prompt Builder 🔴 P0
- Input: raw description + business type + platform + language + tone
- Build system prompt theo template: không hardcode
- Mỗi platform có **Platform Rule** riêng (character limit, hashtag style)
- Ngôn ngữ: Tiếng Việt (default), Tiếng Anh

### 4.2 AI Provider Interface 🔴 P0
> **⚠️ Không hardcode Gemini. Dùng interface để dễ swap provider.**

```typescript
// AIProvider interface
interface AIProvider {
  generateCaption(prompt: string): Promise<string>;
  isAvailable(): Promise<boolean>;
}
// Implementations: GeminiProvider, OpenAIProvider, ClaudeProvider
```
- MVP: GeminiProvider (Gemini 1.5 Flash — free tier)
- Phase 2: Thêm OpenAIProvider, ClaudeProvider

### 4.3 Caption Generator 🔴 P0
- Generate: tạo caption từ raw description
- Regenerate: tạo lại caption mới
- Improve: cải thiện caption hiện tại
- Shorter / Longer: rút gọn / mở rộng
- Formal / Friendly: đổi tone

### 4.4 Hashtag Generator 🟠 P1
- Auto gợi ý hashtag dựa trên nội dung + business type
- Tối đa 30 hashtag cho Instagram

### 4.5 Emoji Generator 🟠 P1
- Thêm emoji phù hợp vào caption

### 4.6 CTA Generator 🟠 P1
- Gợi ý Call-To-Action: "Link in bio", "Đặt lịch ngay", "Gọi ngay..."

### 4.7 Content Version 🟠 P1
- Lưu mỗi version AI generate (tối đa 10 versions/post)
- User có thể chọn lại version trước

### 4.8 AI History 🟠 P1
- Xem toàn bộ lịch sử AI calls của workspace
- Retain: 90 ngày

---

## 5. Platform Integration ⭐⭐⭐ — Phase 1

### 5.1 OAuth Flow 🔴 P0
- Redirect → Platform OAuth → Callback → exchange code → lấy tokens
- **Token Storage Strategy:**
  - Access token + refresh token **encrypt AES-256** trước khi lưu DB
  - Table: `platform_accounts(id, workspace_id, platform, encrypted_access_token, encrypted_refresh_token, token_expires_at, status)`
  - Decrypt chỉ khi cần dùng (trong service layer)

### 5.2 Instagram Integration 🔴 P0
- Connect / Disconnect
- Refresh Token (Instagram token tồn tại 60 ngày → auto refresh)
- Permission check: `instagram_basic`, `instagram_content_publish`
- Webhook: nhận `PUBLISHED` / `ERROR` callback từ Instagram Graph API

### 5.3 Facebook Integration 🔴 P0
- Connect Page (không phải personal account)
- Page Access Token management
- Refresh Token flow

### 5.4 TikTok Integration 🟠 P1
- TikTok for Business API
- Khác biệt: video-first platform → cần handle video upload

### 5.5 Google Business Profile 🟡 P2
- Google OAuth → Google Business Profile API
- Đăng "Posts" lên Google Business listing

### 5.6 Website CMS 🟡 P2
- Webhook/API tích hợp với WordPress, custom CMS

---

## 6. Publish Engine ⭐⭐⭐⭐ — Phase 1

### 6.1 Rule Validation 🔴 P0

#### Instagram Rules
- Caption: ≤ 2,200 ký tự
- Hashtag: ≤ 30
- Image count: 1–10
- Aspect ratio: 1:1, 4:5, hoặc 1.91:1

#### Facebook Rules
- Caption: ≤ 63,206 ký tự
- Image count: ≤ 30
- Không có hashtag limit (nhưng recommend ≤ 10)

#### TikTok Rules (Phase 2)
- Video: bắt buộc, 15s–10 phút
- Caption: ≤ 2,200 ký tự

### 6.2 Preview 🔴 P0
- Render preview theo layout của từng platform
- Show ảnh theo đúng thứ tự + caption đã format

### 6.3 Publish Now 🔴 P0
- POST `/api/posts/:id/publish`
- Gọi API từng platform → lưu kết quả vào `publish_logs`
- Status: `PENDING` → `PUBLISHED` / `FAILED`

### 6.4 Schedule 🔴 P0
- User chọn ngày giờ → lưu vào queue (BullMQ)
- Job processor: chạy publish khi đến giờ
- Delay jobs: BullMQ delayed job hoặc cron-based

### 6.5 Retry Logic 🔴 P0
- Tự động retry 3 lần với exponential backoff (1m → 5m → 15m)
- Sau 3 lần → status = `FAILED`, gửi notification

### 6.6 Queue Management 🟠 P1
- BullMQ + Redis
- Xem danh sách jobs đang chờ / đang chạy / failed
- Manual retry từ dashboard

### 6.7 Publish Status 🔴 P0
- Track từng platform riêng: `{ platform, status, published_at, post_url, error_message }`
- Real-time update qua polling (5s) hoặc WebSocket (Phase 2)

---

## 7. History Management — Phase 1

### 7.1 History List 🔴 P0
- Danh sách bài đăng (filter: PUBLISHED, FAILED, SCHEDULED, DRAFT)
- Phân trang (20 items/page)

### 7.2 Detail View 🔴 P0
- Xem chi tiết: ảnh, caption, platform status, thời gian đăng

### 7.3 Search 🟠 P1
- Full-text search theo caption / hashtag

### 7.4 Filter 🔴 P0
- Filter theo: platform, status, date range, workspace

### 7.5 Clone Post 🟠 P1
- Tạo draft mới từ post đã đăng (copy ảnh + caption)

### 7.6 Edit Published Post 🟠 P1
- Chỉ cho phép sửa caption (ảnh không sửa được sau khi đăng)

### 7.7 Delete 🔴 P0
- Xóa khỏi history (soft delete, không xóa trên platform)

---

## 8. Analytics ⭐⭐ — Phase 2

### 8.1 Sync Metrics 🟠 P1
- Cron job sync metrics từ platform API mỗi 6 giờ
- Store trong `post_metrics(post_id, platform, reach, impressions, likes, comments, shares, saves, synced_at)`

### 8.2 Dashboard 🟠 P1
- Overview: tổng post, tổng lượt tiếp cận, engagement rate

### 8.3 Reach 🟠 P1
### 8.4 Impression 🟠 P1
### 8.5 Likes 🟠 P1
### 8.6 Comments 🟠 P1
### 8.7 Shares 🟠 P1
### 8.8 Saves 🟠 P1

### 8.9 Export 🟡 P2
- Export CSV / PDF báo cáo theo date range

---

## 9. Notification — Phase 1

### 9.1 Publish Success 🔴 P0
- In-app + Email: "Bài đăng trên [Platform] đã được đăng thành công lúc HH:MM"

### 9.2 Publish Failed 🔴 P0
- In-app + Email: "Bài đăng bị lỗi: [error_message]. Nhấn để retry."

### 9.3 Reconnect Account 🔴 P0
- In-app banner: "[Instagram] token hết hạn, kết nối lại ngay"

### 9.4 Weekly Report 🟡 P2
- Email tổng hợp hàng tuần: số bài đăng, tổng reach, top posts

---

## 10. Settings — Phase 2

### 10.1 AI Settings 🟠 P1
- Chọn AI provider (Gemini / OpenAI / Claude)
- Nhập API key riêng (optional)

### 10.2 Theme 🟡 P2
- Dark / Light mode

### 10.3 Language 🟠 P1
- Tiếng Việt / English

### 10.4 Caption Template 🟠 P1
- Tạo template caption theo business type (BDS, Nails, F&B)

### 10.5 Default Hashtag 🟠 P1
- Set hashtag mặc định luôn được thêm vào mọi bài đăng

### 10.6 Business Information 🟠 P1
- Tên, địa chỉ, SĐT, mô tả business → AI dùng để generate

---

## 11. Admin — Phase 3

### 11.1 Manage Users 🟡 P2
- Xem, disable, delete users

### 11.2 Manage Workspace 🟡 P2
- Xem tất cả workspaces, intervene nếu cần

### 11.3 Manage AI Credits 🟡 P2
- Track AI usage per workspace
- Set quota limit

### 11.4 Audit Log 🟡 P2
- Mọi action quan trọng được log: publish, delete, settings change
- Retain: 1 năm