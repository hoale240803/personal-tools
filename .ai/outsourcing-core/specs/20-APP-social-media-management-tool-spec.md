# ĐẶC TẢ KỸ THUẬT & THỰC THI: SOCIAL MEDIA MANAGEMENT TOOL (MULTI-PLATFORM AI CONTENT MANAGER)

> **Dự án:** `social-media-management-tool`  
> **Phân nhóm:** Core SaaS / POS / Finance (Nhóm 1)  
> **Đơn vị lập đặc tả:** AISE Squad 1 — BA Team (`intake`, `ba`, `requirement_challenger`) & PM Team (`orchestrator`, `estimator_cost_controller`)  
> **Nguồn tham chiếu:** `idea/social-media-management-tool/AGENT_STATE.md`, `idea/social-media-management-tool/README.md`, `idea/social-media-management-tool/SETUP.md`  
> **Trạng thái:** Dev-Ready & Test-Ready  

---

## PHẦN 1 — INTAKE & PHÂN LOẠI HỢP ĐỒNG (`intake`)

### 1.1 Nhãn Bảo Mật & Rủi Ro (Security & Risk Tags)
- `auth`: Xác thực người dùng bằng Email/Password kết hợp phân quyền RBAC (`ADMIN`, `EDITOR`, `VIEWER`) và quản lý OAuth Access/Refresh Tokens của các nền tảng mạng xã hội (TikTok, Instagram, Facebook) được mã hóa lưu trữ an toàn.
- `pii`: Lưu trữ thông tin tài khoản người dùng (Email, tên hiển thị, cài đặt thông báo, lịch sử đăng bài và liên kết tài khoản mạng xã hội).
- `external_api`: Tích hợp dịch vụ lưu trữ ảnh/media đám mây (Cloudinary), AI sinh nội dung/caption/hashtags (Claude API / Gemini API), hệ thống hàng đợi xử lý bất đồng bộ (BullMQ + Redis), và API đăng bài đa nền tảng (Meta Graph API cho Facebook/Instagram, TikTok Content Posting API).
- `payment`: Không thu phí trực tiếp trong phạm vi MVP hiện tại, nhưng chịu rủi ro chi phí gọi API bên thứ ba (AI Token & Cloud Media Bandwidth) cần kiểm soát định mức (Quota/Rate-limit).

### 1.2 Bảng Phân Tách: Stated Facts, Explicit Assumptions & Clarification Questions

| Phân loại | Mã tham chiếu | Nội dung chi tiết | Nguồn / Cơ sở |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-01` | Ứng dụng hiện có bản Interactive Demo (React 18 + Vite + Tailwind CSS + Lucide React chạy ở cổng `3000`) gồm 6 màn hình chính: `LoginScreen`, `CreatePostFlow` (wizard 3 bước), `AIPreparingState`, `PublishResult`, `HistoryScreen`, và `SettingsScreen`. | `README.md`, `SETUP.md` |
| **Stated Fact** | `SF-02` | Luồng tạo bài đăng (`CreatePostFlow`) gồm 3 bước: Bước 1 Upload ảnh (Drag & drop, preview, file validation); Bước 2 Nhập chi tiết bài đăng (chọn loại nội dung `General`, `Product`, `Promo`, viết mô tả, thêm hashtags, chọn nền tảng `TikTok`, `Instagram`, `Facebook`); Bước 3 Xem lại & Chỉnh sửa (`ReviewPost`). | `README.md` (Features #2) |
| **Stated Fact** | `SF-03` | Trạng thái chuẩn bị AI (`AIPreparingState`) hiển thị tiến trình và checklist công việc AI đang xử lý trước khi chuyển sang màn hình kết quả xuất bản (`PublishResult`) theo từng nền tảng. | `README.md` (Features #3 & #4) |
| **Stated Fact** | `SF-04` | Màn hình Lịch sử (`HistoryScreen`) cho phép lọc bài đăng theo 4 trạng thái: `All`, `Published`, `Draft`, `Failed`, hiển thị huy hiệu nền tảng và các thao tác `View`, `Share`, `Delete`. | `README.md` (Features #5) |
| **Stated Fact** | `SF-05` | Màn hình Cài đặt (`SettingsScreen`) quản lý kết nối tài khoản mạng xã hội, tùy chọn thông báo và chọn `Style Profile` (hồ sơ phong cách viết bài). | `README.md` (Features #6) |
| **Stated Fact** | `SF-06` | Kiến trúc mục tiêu cho bản Production (`AGENT_STATE.md` & `README.md`): Kết nối Backend Express + TypeScript + Prisma ORM, lưu trữ media trên Cloudinary, hàng đợi tác vụ BullMQ + Redis, phân quyền RBAC và chiến lược lưu trữ Token mã hóa. | `AGENT_STATE.md`, `README.md` (Next Steps) |
| **Explicit Assumption** | `EA-01` | Giới hạn kích thước file ảnh tải lên ở Bước 1 là tối đa `10MB` với các định dạng MIME hợp lệ: `image/jpeg`, `image/png`, `image/webp`. | Chuẩn an toàn Upload Media |
| **Explicit Assumption** | `EA-02` | Khi đăng lên nhiều nền tảng cùng lúc (ví dụ chọn cả `Facebook`, `Instagram`, `TikTok`), kết quả xuất bản được theo dõi độc lập trên từng nền tảng (`PlatformPublishStatus`): nếu 2 nền tảng thành công và 1 nền tảng lỗi, bài đăng mang trạng thái `PARTIALLY_PUBLISHED` (hoặc hiển thị chi tiết từng kênh trong `PublishResult`) và cho phép bấm `Retry` riêng kênh bị lỗi. | Chống mất trạng thái khi đăng đa kênh |

### 1.3 Câu Hỏi Làm Rõ (Clarification Questions)

| Mã | Câu hỏi | Các lựa chọn (Options) | Khuyến nghị (Recommendation) |
| :--- | :--- | :--- | :--- |
| `CQ-01` | Kiến trúc Frontend khi nâng cấp từ bản Demo lên Production sẽ giữ nguyên **Vite React SPA** hiện có (`src/components/*.jsx` chuyển sang TypeScript) hay khởi tạo lại từ đầu bằng **Next.js**? | **Option A:** Giữ và nâng cấp trực tiếp codebase Vite + React 18 hiện có sang TypeScript + kết nối Backend Express API.<br>**Option B:** Viết lại hoàn toàn sang Next.js App Router. | **Khuyến nghị Option A:** Tận dụng 100% 8 React components và hệ thống thiết kế Tailwind sẵn có trong `README.md`/`SETUP.md`, chỉ cần bổ sung lớp API Service và Backend Express + Prisma. |
| `CQ-02` | Khi một nền tảng mạng xã hội (ví dụ TikTok) chỉ hỗ trợ video hoặc yêu cầu ảnh tỷ lệ chuẩn trong khi người dùng upload 1 ảnh tĩnh bất kỳ, hệ thống xử lý ra sao? | **Option A:** Kiểm tra điều kiện tương thích của từng nền tảng ngay ở Bước 2 (cảnh báo hoặc tự động crop/chuyển đổi qua Cloudinary transformation trước khi đăng).<br>**Option B:** Cứ gửi thẳng lên API và báo lỗi sau. | **Khuyến nghị Option A:** Kiểm tra quy tắc nền tảng (`PlatformValidationRule`) ngay tại Bước 2 và áp dụng Cloudinary auto-crop theo tỷ lệ chuẩn của từng mạng xã hội. |

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1 Bảng Yêu Cầu Nghiệp Vụ (Traceability Matrix)

| Mã REQ | Tên yêu cầu | Mô tả nghiệp vụ chi tiết | Nguồn gốc | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | Đăng nhập, Quản lý Phiên & RBAC (`AuthService`) | Xác thực Email/Password, hỗ trợ `Remember Me`, cấp JWT token và kiểm tra quyền hạn theo vai trò (`ADMIN`, `EDITOR`, `VIEWER`). | `README.md` #1, `AGENT_STATE.md` | **P0 Must-Have** |
| `REQ-002` | Tải ảnh lên & Kiểm tra hợp lệ (`MediaUploadService`) | Hỗ trợ Drag & Drop hoặc chọn file ảnh, kiểm tra định dạng (`JPG/PNG/WEBP`) và dung lượng (`<= 10MB`), tải lên Cloudinary (hoặc Local Storage adapter khi chạy dev). | `README.md` #2 Step 1, `AGENT_STATE.md` | **P0 Must-Have** |
| `REQ-003` | Khởi tạo Chi tiết Bài đăng & Chọn Nền tảng (`PostDraftService`) | Cho phép chọn loại nội dung (`General`, `Product`, `Promo`), nhập mô tả gốc, danh sách hashtags và chọn ít nhất 1 nền tảng (`TikTok`, `Instagram`, `Facebook`). | `README.md` #2 Step 2 | **P0 Must-Have** |
| `REQ-004` | AI Chuẩn bị & Tối ưu Nội dung theo Style Profile (`AIContentService`) | Dựa trên loại bài đăng, ảnh, mô tả gốc và `StyleProfile` của người dùng, gọi AI (Claude/Gemini hoặc Mock AI) để sinh/tối ưu caption, gợi ý bộ hashtags và CTA phù hợp. | `README.md` #3 & #6 | **P0 Must-Have** |
| `REQ-005` | Xem trước & Chỉnh sửa Trước xuất bản (`PostReviewService`) | Hiển thị bản xem trước bài đăng hoàn chỉnh, cho phép chỉnh sửa trực tiếp caption và hashtags ở Bước 3 trước khi xác nhận xuất bản. | `README.md` #2 Step 3 | **P0 Must-Have** |
| `REQ-006` | Xuất bản Đa nền tảng qua Hàng đợi (`PublishQueueService`) | Đẩy lệnh xuất bản vào hàng đợi (BullMQ/In-Memory Queue), gọi adapter của từng nền tảng đã chọn, ghi nhận kết quả thành công/thất bại và mã bài đăng từng kênh. | `README.md` #4, `AGENT_STATE.md` | **P0 Must-Have** |
| `REQ-007` | Quản lý Lịch sử Bài đăng & Bộ lọc (`PostHistoryService`) | Hiển thị danh sách bài đăng, lọc theo trạng thái (`All`, `Published`, `Draft`, `Failed`), xem chi tiết, chia sẻ link và xóa bài đăng. | `README.md` #5 | **P1 Should-Have** |
| `REQ-008` | Quản lý Kết nối Mạng xã hội & Mã hóa Token (`SocialConnectionService`) | Lưu kết nối OAuth của `TikTok`, `Instagram`, `Facebook`; mã hóa `accessToken`/`refreshToken` bằng AES-256-GCM trước khi lưu vào DB. | `README.md` #6, `AGENT_STATE.md` | **P1 Should-Have** |
| `REQ-009` | Cài đặt Style Profile & Thông báo (`UserSettingsService`) | Lưu cấu hình giọng văn AI (`StyleProfile`: Professional, Casual, Energetic, Luxury) và bật/tắt thông báo khi đăng bài xong hoặc lỗi. | `README.md` #6 | **P1 Should-Have** |
| `REQ-010` | Thống kê Kết quả Xuất bản (`AnalyticsSummaryService`) | Tổng hợp số lượng bài đã đăng, tỷ lệ thành công theo từng nền tảng và hiển thị trên màn hình `PublishResult` / `Dashboard`. | `README.md` #4 | **P2 Nice-to-Have** |

### 2.2 Data Structures, Constants & `settings.json` Schema

#### A. Bảng `CONSTANTS` & `ENUMS` (Tuân thủ nghiêm ngặt No Magic Numbers/Strings)

```typescript
export enum SocialPlatform {
  TIKTOK = 'tiktok',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
}

export enum ContentType {
  GENERAL = 'General',
  PRODUCT = 'Product',
  PROMO = 'Promo',
}

export enum PostStatus {
  DRAFT = 'Draft',
  PUBLISHING = 'Publishing',
  PUBLISHED = 'Published',
  PARTIALLY_PUBLISHED = 'PartiallyPublished',
  FAILED = 'Failed',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export enum StyleProfile {
  FRIENDLY_CASUAL = 'FRIENDLY_CASUAL',
  PROFESSIONAL = 'PROFESSIONAL',
  BOLD_PROMO = 'BOLD_PROMO',
  LUXURY_AESTHETIC = 'LUXURY_AESTHETIC',
}

export const SOCIAL_MANAGER_CONSTANTS = {
  MAX_IMAGE_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB
  ALLOWED_IMAGE_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  MAX_CAPTION_LENGTH_INSTAGRAM: 2200,
  MAX_CAPTION_LENGTH_TIKTOK: 2200,
  MAX_CAPTION_LENGTH_FACEBOOK: 63206,
  MAX_HASHTAGS_COUNT: 30,
  PUBLISH_MAX_RETRY_ATTEMPTS: 3,
  PUBLISH_RETRY_BACKOFF_MS: 2000,
  AI_GENERATION_TIMEOUT_MS: 15000,
  DESIGN_COLORS: {
    PRIMARY_PURPLE: '#7C3AED',
    SECONDARY_BLUE: '#3B82F6',
    SUCCESS_GREEN: '#10B981',
    ERROR_RED: '#EF4444',
  },
} as const;
```

#### B. Core TypeScript Interfaces (`src/types/social.ts`)

```typescript
export interface PlatformPublishDetail {
  platform: SocialPlatform;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  externalPostId?: string;
  externalUrl?: string;
  errorMessage?: string;
  publishedAt?: string;
}

export interface SocialPost {
  id: string;
  authorId: string;
  imageUrl: string;
  imageMimeType: string;
  imageSizeBytes: number;
  contentType: ContentType;
  caption: string;
  hashtags: string[];
  targetPlatforms: SocialPlatform[];
  status: PostStatus;
  platformResults: PlatformPublishDetail[];
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAccountConnection {
  id: string;
  userId: string;
  platform: SocialPlatform;
  accountHandle: string;
  isConnected: boolean;
  encryptedAccessToken: string;
  tokenExpiresAt: string;
}

export interface UserPreferences {
  userId: string;
  styleProfile: StyleProfile;
  emailNotifications: boolean;
  pushNotifications: boolean;
}
```

#### C. `settings.json` Schema (Quản lý cấu hình & biến môi trường an toàn)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SocialMediaManagementToolSettings",
  "type": "object",
  "required": ["envKeys", "uploadLimits", "aiConfig", "queueConfig"],
  "properties": {
    "envKeys": {
      "type": "object",
      "properties": {
        "databaseUrlKey": { "type": "string", "default": "DATABASE_URL" },
        "jwtSecretKey": { "type": "string", "default": "JWT_SECRET" },
        "tokenEncryptionKey": { "type": "string", "default": "SOCIAL_TOKEN_ENCRYPTION_KEY" },
        "aiApiKey": { "type": "string", "default": "AI_PROVIDER_API_KEY" },
        "cloudinaryUrlKey": { "type": "string", "default": "CLOUDINARY_URL" },
        "redisUrlKey": { "type": "string", "default": "REDIS_URL" }
      }
    },
    "uploadLimits": {
      "type": "object",
      "properties": {
        "maxFileSizeBytes": { "type": "number", "default": 10485760 },
        "allowedMimeTypes": {
          "type": "array",
          "items": { "type": "string" },
          "default": ["image/jpeg", "image/png", "image/webp"]
        },
        "maxHashtagsPerPost": { "type": "number", "default": 30 }
      }
    },
    "aiConfig": {
      "type": "object",
      "properties": {
        "useMockAi": { "type": "boolean", "default": true },
        "defaultStyleProfile": { "type": "string", "default": "FRIENDLY_CASUAL" },
        "timeoutMs": { "type": "number", "default": 15000 }
      }
    },
    "queueConfig": {
      "type": "object",
      "properties": {
        "useMockPublishers": { "type": "boolean", "default": true },
        "maxRetryAttempts": { "type": "number", "default": 3 },
        "retryBackoffMs": { "type": "number", "default": 2000 }
      }
    }
  }
}
```

### 2.3 Kiến Trúc Service & Helper (Tuân thủ Rule 4 & Single Responsibility Principle)

| Tên File | Role (Service / Helper) | Chữ ký hàm chính (Method Signatures) | Mục đích (Docstring tóm tắt) |
| :--- | :--- | :--- | :--- |
| `src/services/MediaUploadService.ts` | **Service** | `uploadAndValidateImage(file: FileMetadata, buffer?: Uint8Array): Promise<{ imageUrl: string; width: number; height: number }>` | Kiểm tra file ảnh hợp lệ và tải lên Cloudinary / Local Storage. |
| `src/services/MediaUploadServiceHelper.ts` | **Helper** | `validateImageFile(file: { name: string; mimeType: string; sizeBytes: number }): { valid: boolean; errorCode?: string }`<br>`sanitizeFileName(rawName: string): string` | Kiểm tra MIME type, magic bytes, giới hạn dung lượng `10MB` và làm sạch tên file. |
| `src/services/AIContentService.ts` | **Service** | `generateOptimizedPostContent(input: { rawDescription: string; contentType: ContentType; styleProfile: StyleProfile; platforms: SocialPlatform[] }): Promise<{ caption: string; hashtags: string[]; checklistSteps: string[] }>` | Gọi AI (hoặc Mock AI) tối ưu hóa caption và bộ hashtags theo `StyleProfile` và loại bài đăng. |
| `src/services/AIContentServiceHelper.ts` | **Helper** | `normalizeHashtags(rawTags: string[]): string[]`<br>`validatePlatformCaptionConstraints(caption: string, hashtags: string[], platforms: SocialPlatform[]): { valid: boolean; violations: string[] }` | Chuẩn hóa tiền tố `#`, loại bỏ hashtag trùng, kiểm tra giới hạn `30` hashtags và `2200` ký tự của Instagram/TikTok. |
| `src/services/PostPublishService.ts` | **Service** | `publishPostToPlatforms(post: SocialPost, connections: SocialAccountConnection[]): Promise<SocialPost>`<br>`retryFailedPlatforms(postId: string): Promise<SocialPost>` | Điều phối xuất bản bài đăng lên nhiều nền tảng song song (`Promise.allSettled`), hỗ trợ Idempotency và Retry kênh lỗi. |
| `src/services/PostPublishServiceHelper.ts` | **Helper** | `computeOverallPostStatus(results: PlatformPublishDetail[]): PostStatus`<br>`encryptSocialToken(plainToken: string, secretHex: string): string`<br>`decryptSocialToken(cipherText: string, secretHex: string): string` | Tính trạng thái tổng hợp của bài đăng (`Published`, `PartiallyPublished`, `Failed`) và mã hóa/giải mã OAuth token bằng AES-256-GCM. |

### 2.4 Ma Trận 5 Trạng Thái UX (5-State UX Matrix)

| Màn hình / Luồng | 1. Ideal State (Hoạt động chuẩn) | 2. Loading State (Đang xử lý) | 3. Empty State (Chưa có dữ liệu) | 4. Error State (Lỗi kết nối / Nghiệp vụ) | 5. Partial / Overflow State (Quá tải / Một phần) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Wizard Tạo Bài Đăng 3 Bước (`CreatePostFlow` & `ReviewPost`)** | Bước 1 hiện ảnh xem trước sắc nét; Bước 2 chọn loại bài, nhập mô tả/hashtag và tích chọn nền tảng; Bước 3 xem trước và sửa trực tiếp caption/hashtag mượt mà. | Bước 1 hiện thanh tiến trình `%` tải ảnh lên; khi bấm `Publish` chuyển sang màn hình `AIPreparingState` với checklist 4 bước chạy tuần tự. | Bước 1 khi chưa chọn ảnh: Khung viền nét đứt `"Kéo thả ảnh vào đây hoặc bấm để chọn (JPG, PNG, WEBP tối đa 10MB)"`. Nút `Next` bị khóa nếu chưa có ảnh hoặc chưa chọn nền tảng. | Chọn file `.exe`/`.pdf` hoặc ảnh `> 10MB`: Hiện thông báo lỗi đỏ(`#EF4444`) ngay dưới khung upload `"Định dạng không hỗ trợ hoặc dung lượng vượt quá 10MB"`. | Khi người dùng nhập `> 30` hashtags hoặc caption dài `> 2200` ký tự khi đã chọn Instagram/TikTok: Hiện cảnh báo vàng kèm bộ đếm ký tự đỏ `2250/2200` và nút **[AI Rút Gọn Tự Động]**. |
| **Màn hình Kết quả Xuất bản (`PublishResult`)** | Tất cả các nền tảng được chọn đều báo tích xanh `#10B981` kèm link xem bài đăng và thống kê tóm tắt. | Nền tảng nào đang chờ phản hồi từ hàng đợi hiển thị badge `"Đang đăng..."` với spinner. | Không áp dụng (chỉ vào màn hình này sau khi đã gửi lệnh Publish). | Tất cả nền tảng đều thất bại (do hết hạn OAuth token hoặc mất mạng): Hiện card lỗi đỏ kèm nút **[Kết nối lại tài khoản]** và **[Lưu vào Bản nháp (Draft)]**. | **Partial Success:** Đăng lên Facebook & Instagram thành công nhưng TikTok bị lỗi timeout -> Hiện rõ 2 kênh `Success`, 1 kênh `Failed` kèm nút **[Thử lại kênh lỗi (Retry TikTok)]** mà không đăng trùng lại 2 kênh kia. |
| **Màn hình Lịch sử (`HistoryScreen`)** | Hiển thị danh sách bài đăng kèm ảnh thu nhỏ, huy hiệu nền tảng (`TikTok`, `IG`, `FB`), bộ lọc tab (`All`, `Published`, `Draft`, `Failed`) và nút `View`, `Share`, `Delete`. | Hiển thị 4 thẻ Skeleton cards khi đang tải danh sách lịch sử. | Khi bộ lọc đang chọn (VD: `Failed`) không có bài nào: `"Không có bài đăng nào ở trạng thái [Failed]."` kèm nút **[Tạo bài đăng mới]**. | Khi gọi API xóa bài đăng thất bại: Hoàn tác giao diện (optimistic rollback) và hiện Toast đỏ `"Không thể xóa bài đăng. Vui lòng thử lại."` | Khi lịch sử có `> 50` bài đăng hoặc caption rất dài: Cắt ngắn caption 2 dòng (`truncate`), phân trang hoặc cuộn vô tận (Infinite Scroll) để không làm giật DOM. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

| # | Lỗ hổng / Rủi ro thực tế (Vulnerability / Edge Risk) | Tác động nếu không chặn | Quy tắc Khóa Chặn Cụ Thể Trong Code (Technical Guardrail) |
| :--- | :--- | :--- | :--- |
| **1** | **Đăng trùng bài lên mạng xã hội khi người dùng bấm đúp nút "Confirm & Publish" hoặc khi bấm Retry** (`Double Submit` & `Duplicate Post`) | Bấm nút Publish 2 lần hoặc khi chỉ có TikTok lỗi mà bấm Retry lại chạy lại cả Facebook & Instagram khiến fanpage bị lặp 2 bài giống hệt nhau. | 1. Sinh `idempotencyKey` duy nhất cho mỗi bản nháp khi bước vào `ReviewPost`.<br>2. Trong `PostPublishService.retryFailedPlatforms(postId)`: Chỉ lọc các nền tảng có `status === 'FAILED'` để gửi lại, giữ nguyên kết quả của các nền tảng đã `SUCCESS`. |
| **2** | **Một nền tảng bị lỗi API làm sập toàn bộ tiến trình đăng đa kênh** (`Cascading Failure in Multi-Platform Publish`) | Dùng `Promise.all()` khi đăng đồng thời lên Facebook, Instagram và TikTok sẽ khiến cả 3 bị đánh dấu thất bại nếu 1 kênh bị timeout. | Bắt buộc dùng `Promise.allSettled()` trong `PostPublishService.publishPostToPlatforms()`, thu thập từng `PlatformPublishDetail` độc lập và tính trạng thái tổng hợp qua `computeOverallPostStatus()` (`PUBLISHED`, `PARTIALLY_PUBLISHED`, hoặc `FAILED`). |
| **3** | **Lộ OAuth Access Token của khách hàng trong Database hoặc Log** (`Plaintext Credential Exposure`) | Lưu trực tiếp token của Facebook Page / Instagram / TikTok dưới dạng văn bản thuần trong bảng DB hoặc in ra console log khi lỗi. | 1. Bắt buộc mã hóa token bằng thuật toán `AES-256-GCM` (`encryptSocialToken` / `decryptSocialToken`) với khóa đọc từ biến môi trường `SOCIAL_TOKEN_ENCRYPTION_KEY`.<br>2. Tuyệt đối không trả trường `encryptedAccessToken` về phía Frontend API response. |
| **4** | **Tải lên file độc hại giả danh ảnh hoặc vượt giới hạn Caption/Hashtag của từng nền tảng** (`Validation Bypass` & `API Rejection`) | Đổi đuôi file `.html`/`.exe` thành `.jpg` để upload, hoặc gửi 45 hashtags lên Instagram khiến Graph API từ chối thẳng ở bước cuối cùng sau khi đã tốn tiền gọi AI. | 1. Kiểm tra đồng thời MIME type, phần mở rộng và kích thước `0 < sizeBytes <= 10MB` trong `MediaUploadServiceHelper.validateImageFile()`.<br>2. Kiểm tra giới hạn `hashtags.length <= 30` và `caption.length <= 2200` (nếu có chọn IG/TikTok) ngay trước khi cho phép chuyển sang trạng thái xuất bản. |
| **5** | **AI API bị treo quá lâu làm đơ màn hình `AIPreparingState` của người dùng** (`External AI Timeout`) | Màn hình loading xoay vô tận nếu Claude/Gemini API không phản hồi. | Thiết lập `AI_GENERATION_TIMEOUT_MS = 15000` (15 giây). Nếu quá hạn hoặc lỗi mạng, tự động fallback về mô tả và bộ hashtag gốc của người dùng kèm thông báo nhẹ để người dùng vẫn chỉnh sửa ở `ReviewPost` và đăng bài bình thường. |

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1 Kịch Bản Kiểm Thử 3 Tầng (`Given / When / Then`)

#### Tầng 1: P0 Happy Paths (Người dùng hay xài nhất)
- **TC-P0-01 (Hoàn tất luồng tạo bài 3 bước & Xuất bản thành công lên cả 3 nền tảng):**
  - *Given:* Người dùng đã kết nối tài khoản `TikTok`, `Instagram`, `Facebook`; tải lên ảnh `product.png` (`2MB`, `image/png`), chọn loại `Product`, nhập mô tả và hashtags `["#sale", "#fashion"]`.
  - *When:* Đi qua bước AI chuẩn bị, xác nhận tại `ReviewPost` và gọi `publishPostToPlatforms()`.
  - *Then:* Bài đăng trả về trạng thái ` PostStatus.PUBLISHED`, cả 3 phần tử trong `platformResults` đều có `status === 'SUCCESS'` và xuất hiện ở đầu danh sách `HistoryScreen`.
- **TC-P0-02 (Chuẩn hóa Hashtags & Tối ưu nội dung theo Style Profile):**
  - *Given:* Người dùng nhập danh sách hashtags lộn xộn `["travel", "#Travel", "  #food  ", ""]` và chọn `StyleProfile.BOLD_PROMO`.
  - *When:* Gọi `normalizeHashtags()` và `generateOptimizedPostContent()`.
  - *Then:* Danh sách hashtags được làm sạch còn `["#travel", "#food"]` (tự thêm dấu `#`, xóa khoảng trắng, loại bỏ trùng lặp không phân biệt hoa thường), và caption sinh ra có cấu trúc kèm CTA khuyến mãi.
- **TC-P0-03 (Lọc lịch sử bài đăng theo trạng thái `Published` / `Draft` / `Failed`):**
  - *Given:* Lịch sử có 3 bài `Published`, 2 bài `Draft`, 1 bài `Failed`.
  - *When:* Người dùng chọn bộ lọc trạng thái `Draft` hoặc `Failed`.
  - *Then:* Danh sách trả về khớp chính xác số lượng và trạng thái tương ứng (`2` bài cho `Draft`, `1` bài cho `Failed`).

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-NEG-01 (Từ chối file upload sai định dạng hoặc vượt quá 10MB):**
  - *Given:* Người dùng chọn file `malware.exe` (`mimeType = "application/x-msdownload"`) hoặc ảnh `huge.png` (`sizeBytes = 12 * 1024 * 1024`).
  - *When:* Gọi `validateImageFile()`.
  - *Then:* Hàm trả về `{ valid: false, errorCode: "UNSUPPORTED_MIME_TYPE" }` (hoặc `"FILE_TOO_LARGE"`), chặn tải lên ngay từ Bước 1.
- **TC-NEG-02 (Xử lý lỗi xuất bản 1 phần `PARTIALLY_PUBLISHED` và chỉ Retry kênh lỗi):**
  - *Given:* Bài đăng chọn `Facebook` và `TikTok`. Khi xuất bản lần 1, `Facebook` thành công (`SUCCESS`), nhưng `TikTok` bị lỗi mạng (`FAILED`).
  - *When:* Gọi `retryFailedPlatforms(postId)`.
  - *Then:* Hệ thống chỉ gọi lại adapter của `TikTok` (tuyệt đối không gọi lại `Facebook`), và sau khi `TikTok` thành công thì trạng thái tổng của bài đăng chuyển từ `PARTIALLY_PUBLISHED` sang `PUBLISHED`.
- **TC-NEG-03 (Kiểm tra quyền RBAC: Tài khoản `VIEWER` cố tình gọi lệnh tạo hoặc xóa bài đăng):**
  - *Given:* Người dùng có vai trò `UserRole.VIEWER`.
  - *When:* Gọi hàm tạo bài đăng mới hoặc xóa bài đăng trong lịch sử.
  - *Then:* Hệ thống từ chối với lỗi `FORBIDDEN_INSUFFICIENT_ROLE`.

#### Tầng 3: Boundary & Rare Edge Cases (0, -1, MAX, Empty, Duplicate, Concurrent)
- **TC-BND-01 (Biên kích thước file ảnh: `0 bytes`, đúng `10MB` (`10485760` bytes), và `10MB + 1 byte`):**
  - *Given:* 3 file ảnh có dung lượng lần lượt là `0`, `10485760`, và `10485761` bytes.
  - *When:* Kiểm tra qua `validateImageFile()`.
  - *Then:* File `0 bytes` bị từ chối (`EMPTY_FILE`); file `10485760 bytes` hợp lệ (`valid: true`); file `10485761 bytes` bị từ chối (`FILE_TOO_LARGE`).
- **TC-BND-02 (Biên số lượng Hashtags: `30` hashtags vs `31` hashtags và độ dài Caption `2200` vs `2201` ký tự):**
  - *Given:* Bài đăng chọn nền tảng `Instagram`.
  - *When:* Kiểm tra với `30` hashtags & `2200` ký tự so với `31` hashtags hoặc `2201` ký tự.
  - *Then:* `30` hashtags & `2200` ký tự được chấp nhận (`valid: true`); `31` hashtags hoặc `2201` ký tự bị chặn với danh sách lỗi `violations` chi tiết.
- **TC-BND-03 (Chống Double Publish khi gửi 2 lệnh xuất bản cùng `idempotencyKey` đồng thời):**
  - *Given:* Bài đăng có `idempotencyKey = "post_idem_001"` đang ở trạng thái `PUBLISHING`.
  - *When:* Một request thứ 2 mang cùng `idempotencyKey = "post_idem_001"` được gửi tới đồng thời.
  - *Then:* Request thứ 2 bị chặn ngay với lỗi `DUPLICATE_PUBLISH_REQUEST`, đảm bảo chỉ có 1 tiến trình xuất bản chạy.

### 4.2 Quy Trình 5 Bước Kiểm Chứng Bề Mặt Thật Cho QA Reviewer

1. **Step 1 — Launch (Khởi chạy Ứng dụng & Kiểm tra Build):**
   - Di chuyển vào thư mục `d:\Workspace\personal-tools\idea\social-media-management-tool`, chạy `npm install && npm run build` để xác nhận Vite + React + TypeScript/JavaScript bundle không có lỗi cú pháp.
2. **Step 2 — Doctor (Kiểm tra Cấu hình & Bảo mật):**
   - Kiểm tra file `src/config/settings.json` tồn tại, hợp lệ, không chứa khóa bí mật plaintext, và chức năng mã hóa `encryptSocialToken`/`decryptSocialToken` hoạt động đối xứng 100%.
3. **Step 3 — Drive (Thực thi Bộ Test 3 Tầng & Luồng Tương tác 6 Màn hình):**
   - Chạy bộ test tự động (`npx vitest run`) kiểm tra toàn bộ Services & Helpers: `MediaUploadServiceHelper`, `AIContentServiceHelper`, `PostPublishServiceHelper`, `PostPublishService`.
   - Khởi chạy dev server (`npm run dev`), kiểm tra luồng: Login -> Upload ảnh -> Điền thông tin + Chọn TikTok/IG/FB -> Review -> AI Preparing -> Publish Result -> History Filter (`All`/`Published`/`Draft`/`Failed`) -> Settings.
4. **Step 4 — Evidence (Thu thập Bằng chứng QA):**
   - Lưu log kết quả chạy test, ảnh chụp màn hình 6 bước trong ứng dụng và kết quả kiểm thử trạng thái `PARTIALLY_PUBLISHED` -> `Retry` -> `PUBLISHED`.
5. **Step 5 — Cleanup (Dọn dẹp sau kiểm thử):**
   - Tắt dev server trên cổng `3000`, xóa các file ảnh/mock tạm sinh ra trong lúc test, đảm bảo `git status` sạch.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role phụ trách | File mục tiêu | Mô tả chi tiết hàm cần viết | Phụ thuộc | Lệnh Verify & Tiêu chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `idea/social-media-management-tool/src/config/settings.json` & `src/types/social.ts` | Tạo file cấu hình `settings.json` và định nghĩa toàn bộ `ENUMS`, `SOCIAL_MANAGER_CONSTANTS` cùng các Interfaces (`SocialPost`, `PlatformPublishDetail`, `SocialAccountConnection`). | *None* | Parse JSON và kiểm tra kiểu TypeScript (`npx tsc --noEmit` hoặc linter) xanh 100%. |
| `TASK-002` | **Developer** | `idea/social-media-management-tool/src/services/MediaUploadServiceHelper.ts` | Viết `validateImageFile()` (kiểm tra `0 < sizeBytes <= 10MB`, MIME types `jpeg/png/webp`) và `sanitizeFileName()`. | **Hard:** `TASK-001` | Đầy đủ JSDoc cho từng hàm, không có magic numbers. |
| `TASK-003` | **Developer** | `idea/social-media-management-tool/src/services/AIContentServiceHelper.ts` | Viết `normalizeHashtags()` (chuẩn hóa `#`, xóa trùng lặp) và `validatePlatformCaptionConstraints()` (kiểm tra giới hạn `2200` ký tự của IG/TikTok và tối đa `30` hashtags). | **Hard:** `TASK-001` | Hàm thuần túy (pure functions), dễ kiểm thử độc lập. |
| `TASK-004` | **Test Engineer** | `idea/social-media-management-tool/tests/media-and-ai-helper.test.ts` | Viết Unit Test 3 tầng cho `MediaUploadServiceHelper` & `AIContentServiceHelper`: biên `0 bytes`, `10MB`, `10MB + 1`, sai MIME, chuẩn hóa hashtags, và biên `30`/`31` hashtags. | **Hard:** `TASK-002`, `TASK-003` | `npx vitest run tests/media-and-ai-helper.test.ts` xanh 100%. |
| `TASK-005` | **Developer** | `idea/social-media-management-tool/src/services/PostPublishServiceHelper.ts` | Viết `computeOverallPostStatus()` (`Published` / `PartiallyPublished` / `Failed`) và cặp hàm mã hóa token `encryptSocialToken()` / `decryptSocialToken()` dùng `AES-256-GCM`. | **Hard:** `TASK-001` | Mã hóa và giải mã khôi phục đúng chuỗi gốc, ném lỗi khi sai key/tampered ciphertext. |
| `TASK-006` | **Developer** | `idea/social-media-management-tool/src/services/PostPublishService.ts` | Viết `publishPostToPlatforms()` dùng `Promise.allSettled()`, kiểm tra khóa `idempotencyKey` chống bấm đúp, và `retryFailedPlatforms()` chỉ gửi lại các kênh bị `FAILED`. | **Hard:** `TASK-005` | Xử lý đầy đủ cả 3 trạng thái kết quả và phân quyền RBAC (`ADMIN`/`EDITOR` mới được publish). |
| `TASK-007` | **Test Engineer** | `idea/social-media-management-tool/tests/post-publish-service.test.ts` | Viết Unit & Integration Test cho `PostPublishService` & Helper: đăng 3 kênh thành công, 1 kênh lỗi (`PARTIALLY_PUBLISHED`) -> `retryFailedPlatforms()` chỉ gọi lại 1 kênh lỗi, chặn Double Publish, chặn `VIEWER` đăng bài. | **Hard:** `TASK-006` | `npx vitest run tests/post-publish-service.test.ts` xanh 100%. |
| `TASK-008` | **Developer** | `idea/social-media-management-tool/src/services/PostHistoryService.ts` | Viết dịch vụ quản lý lịch sử bài đăng (`listPostsByFilter`, `saveDraftPost`, `deletePostById`) hỗ trợ lọc theo `All`, `Published`, `Draft`, `Failed` và tìm kiếm từ khóa. | **Hard:** `TASK-001` | Đầy đủ hàm CRUD in-memory/storage có kiểm tra quyền RBAC. |
| `TASK-009` | **Developer** | `idea/social-media-management-tool/src/components/CreatePostFlow.jsx` & `PublishResult.jsx` | Tích hợp `MediaUploadServiceHelper`, `AIContentServiceHelper` và `PostPublishService` vào giao diện Wizard tạo bài và màn hình `PublishResult` (bổ sung nút Retry riêng cho kênh bị lỗi). | **Soft:** `TASK-006`, `TASK-008` | `npm run build` thành công, UI hiển thị đủ 5 trạng thái UX. |
| `TASK-010` | **Test Engineer** | `idea/social-media-management-tool/tests/history-and-e2e-flow.test.ts` | Viết bài kiểm thử luồng tích hợp End-to-End từ tạo Draft -> Validate -> AI Optimize -> Publish -> Lọc trên History -> Xóa bài đăng. | **Hard:** `TASK-008`, `TASK-009` | `npx vitest run` chạy toàn bộ test suite dự án đạt 100% pass. |
