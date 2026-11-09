# ĐẶC TẢ KỸ THUẬT & NGHIỆP VỤ: REAL ESTATE LOCAL DETECTIVE TOOL (`real-estate-local-detective-tool`)

> **Phiên bản:** 1.0.0 (Dev-Ready & Test-Ready)
> **Đội ngũ phụ trách:** AISE Squad 3 — BA Team (`intake`, `ba`, `requirement_challenger`) & PM Team (`orchestrator`, `estimator_cost_controller`)
> **Nguồn yêu cầu gốc:** `idea/real-estate-local-detective-tool/requirement.md`

---

## PHẦN 1 — INTAKE & PHÂN LOẠI (`intake`)

### 1.1. Bảng Phân Tách Dữ Kiện (`Stated Facts`, `Explicit Assumptions`, `Clarification Questions`)

| Phân loại | Mã định danh | Nội dung chi tiết | Nguồn / Lý do kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-001` | Trong lúc đi khảo sát thực địa (Field Survey), người môi giới bất động sản (Real Estate Agent/Broker) ghi chú nhanh vào **bản nháp (`Draft`)** các thông tin: **địa chỉ nhà, công năng nhà, giá chào, kiểu tài sản**, v.v. | Trích nguyên văn dòng 1 file `requirement.md` |
| **Stated Fact** | `SF-002` | Công cụ lưu tạm bài đăng nháp này vào hệ thống của công ty; sau khi người môi giới **về nhà chỉnh sửa cho hoàn thiện** thì có thể **đẩy bài đăng này lên Facebook, Instagram, ...** | Trích nguyên văn dòng 3 file `requirement.md` |
| **Stated Fact** | `SF-003` | Hệ thống có chức năng **Quản lý tương tác bài đăng (Post Engagement Tracking)** trên các nền tảng đã đăng, cụ thể gồm 3 chỉ số bắt buộc: (1) **Có bao nhiêu người xem (`Views / Reach`)**, (2) **Bao nhiêu người thả `Reaction`**, (3) **Bao nhiêu người `Comment`**. | Trích nguyên văn dòng 5–9 file `requirement.md` |
| **Explicit Assumption** | `EA-001` | **Kiến trúc Offline-First (`LocalStorage / IndexedDB Outbox Queue`):** Khi người môi giới đi khảo sát nhà trong hẻm sâu, tầng hầm chung cư hoặc vùng ven đô thị, kết nối 4G/5G thường chập chờn hoặc mất hẳn. Hệ thống bắt buộc phải lưu bản nháp (`PropertySurveyDraft`) vào bộ nhớ cục bộ trên thiết bị ngay lập tức (`0ms latency`) và tự động đồng bộ lên máy chủ công ty (`Company Sync Queue`) khi có mạng trở lại. | Giả định kỹ thuật sống còn cho ứng dụng khảo sát thực địa (Field Productivity). |
| **Explicit Assumption** | `EA-002` | **Chuẩn hóa Quy định Đăng bài qua Meta Graph API (Facebook Page & Instagram Business):** Meta không cho phép ứng dụng bên thứ 3 tự động đăng bài lên trang cá nhân bằng mật khẩu mà bắt buộc thông qua **Facebook Page API** và **Instagram Graph API** (tài khoản Instagram Professional/Business gắn với Page). Riêng Instagram bắt buộc bài đăng phải có ít nhất `1 hình ảnh hoặc video` kèm caption tối đa `2,200 ký tự` và tối đa `30 hashtags`. | Đảm bảo tính khả thi kỹ thuật và tuân thủ chính sách của Meta để Dev không bị block. |
| **Explicit Assumption** | `EA-003` | **Bảo vệ Bí mật Nguồn hàng (`Private Owner Notes vs Public Listing Content`):** Trong lúc đi khảo sát, môi giới luôn ghi chú cả thông tin nhạy cảm (Số điện thoại chủ nhà, số nhà chính xác trong sổ đỏ, hoa hồng môi giới, điểm yếu phong thủy) lẫn thông tin quảng cáo. Khi đẩy bài lên Facebook/Instagram, hệ thống chỉ xuất phần nội dung công khai (`publicCaption`), tuyệt đối không làm lộ ghi chú nội bộ (`privateBrokerNotes`). | Bảo vệ nồi cơm (nguồn hàng kín) của người môi giới bất động sản. |

### 1.2. Danh sách Câu hỏi Làm rõ (`Clarification Questions`)

1. **CQ-001: Cơ chế xuất bản lên các kênh ngoài Facebook Page & Instagram Business (như Zalo, TikTok, Facebook cá nhân) xử lý như thế nào khi API chính thức bị hạn chế?**
   - **Option A (Khuyến nghị):** Tích hợp **Direct API Publishing** cho Facebook Page & Instagram Business (qua Meta Graph API cấu hình trong `settings.json`), đồng thời cung cấp nút **1-Click Smart Copy & Share Pack** (tự động copy caption đã định dạng đẹp + tải bộ ảnh đã đóng dấu watermark công ty) để dán lên Facebook cá nhân/Zalo trong 3 giây.
   - **Option B:** Dùng công cụ giả lập trình duyệt tự động đăng nhập tài khoản cá nhân (rủi ro khóa tài khoản Facebook rất cao).
   - *Quyết định mặc định cho bản Spec này:* Chọn **Option A** để vừa an toàn tuyệt đối cho tài khoản của môi giới vừa đáp ứng đầy đủ nhu cầu đăng đa kênh.

2. **CQ-002: Tần suất cập nhật số liệu tương tác (`Views`, `Reactions`, `Comments`) là bao lâu?**
   - **Option A (Khuyến nghị):** Tự động đồng bộ định kỳ mỗi `15 phút` (cấu hình trong `settings.json`) kết hợp nút `Làm mới ngay (Refresh Metrics)` trên màn hình quản lý bài đăng, kèm bộ nhớ đệm (Cache) để tránh chạm giới hạn Rate Limit của Meta API.
   - **Option B:** Gọi API liên tục mỗi giây (sẽ bị khóa token).
   - *Quyết định mặc định cho bản Spec này:* Chọn **Option A**.

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1. Bảng Yêu Cầu Nghiệp Vụ (`REQ-001` .. `REQ-010`)

| Mã REQ | Tên Yêu Cầu | Mô tả nghiệp vụ chi tiết | Truy vết nguồn | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | Ghi chú Khảo sát Thực địa Nhanh (`Field Survey Draft Capture`) | Cho phép môi giới tạo nhanh bản nháp khảo sát gồm: Địa chỉ (`address`), Kiểu tài sản (`propertyType`: Nhà phố, Căn hộ, Đất nền, Biệt thự, Mặt bằng), Giá chào (`askingPrice`), Diện tích (`areaM2`), Công năng (`bedrooms`, `bathrooms`, `floors`, `direction`, `legalStatus`), Hình ảnh thực tế và Ghi chú nội bộ. | `SF-001` | **P0 Must-Have** |
| `REQ-002` | Lưu Trữ Offline-First & Đồng bộ Kho Công ty (`Offline Draft & Company Sync`) | Tự động lưu bản nháp vào bộ nhớ thiết bị (`IndexedDB`/`LocalStorage`) ngay khi gõ kể cả khi mất mạng; đánh dấu trạng thái đồng bộ (`LOCAL_ONLY`, `SYNCING`, `SYNCED_TO_COMPANY`) và tự động đẩy lên kho dữ liệu công ty khi có mạng. | `SF-001`, `SF-002`, `EA-001` | **P0 Must-Have** |
| `REQ-003` | Hoàn thiện Bài đăng tại Nhà & Sinh Caption Đa Kênh (`At-Home Listing Polisher`) | Chuyển hóa thông số thô lúc đi khảo sát thành bài đăng hoàn chỉnh có tiêu đề thu hút, danh sách công năng rõ ràng, hashtags tự động và tách riêng phần `privateBrokerNotes` (SĐT chủ nhà, số nhà nhạy cảm) khỏi nội dung đăng công khai. | `SF-002`, `EA-003` | **P0 Must-Have** |
| `REQ-004` | Kiểm định Điều kiện Đăng bài theo Nền tảng (`Platform Publishing Validator`) | Kiểm tra bài đăng trước khi đẩy lên mạng xã hội: đã chuyển sang trạng thái `READY_TO_PUBLISH`, có giá chào và địa chỉ khu vực hợp lệ; với Instagram bắt buộc có `>= 1` ảnh/video, caption `<= 2,200 ký tự` và `<= 30 hashtags`. | `SF-002`, `EA-002` | **P0 Must-Have** |
| `REQ-005` | Đẩy Bài đăng lên Facebook & Instagram (`Multi-Channel Social Publisher`) | Gọi API xuất bản bài đăng lên Facebook Page và Instagram Business từ một giao diện duy nhất, lưu lại `externalPostId` và `permalinkUrl` của từng nền tảng. | `SF-002` | **P0 Must-Have** |
| `REQ-006` | Quản lý & Đồng bộ Chỉ số Tương tác (`Views, Reactions, Comments Tracker`) | Thu thập và hiển thị bảng thống kê tương tác cho từng bất động sản trên từng kênh (`FACEBOOK`, `INSTAGRAM`) gồm đúng 3 chỉ số cốt lõi: **Số người xem (`viewsCount`)**, **Số lượt thả cảm xúc (`reactionsCount`)**, **Số bình luận (`commentsCount`)** cùng tổng hợp toàn chiến dịch. | `SF-003` | **P0 Must-Have** |
| `REQ-007` | Chống Đăng Trùng Bài (`Idempotent Publish Guard`) | Ngăn chặn việc bấm nút "Đăng bài" nhiều lần khi mạng chậm khiến cùng 1 căn nhà bị đăng lặp 2–3 bài giống hệt nhau trên cùng một fanpage. | `SF-002` | **P1 Should-Have** |
| `REQ-008` | Chốt chặn Bảo mật Thông tin Chủ nhà (`Owner PII Leak Prevention`) | Tự động quét nội dung `publicCaption` trước khi đăng lên MXH; nếu phát hiện trùng số điện thoại chủ nhà lưu trong `ownerPhonePrivate`, hệ thống chặn và cảnh báo môi giới để tránh bị đối thủ "cướp nguồn" (luồn cò). | `SF-001`, `SF-002`, `EA-003` | **P1 Should-Have** |
| `REQ-009` | Xếp hạng Bài đăng Hiệu quả & Tính Tỷ lệ Tương tác (`Engagement Rate Analytics`) | Tính toán tỷ lệ tương tác `engagementRatePercent = ((reactionsCount + commentsCount) / viewsCount) * 100` để giúp môi giới biết căn nhà nào đang được khách quan tâm nhiều nhất. | `SF-003` | **P1 Should-Have** |
| `REQ-010` | Lọc & Tìm kiếm Kho Nguồn Hàng Khảo sát | Tìm kiếm nhanh các bản nháp khảo sát theo quận/huyện, khoảng giá chào, kiểu tài sản hoặc trạng thái bài đăng (`DRAFT`, `READY`, `PUBLISHED`). | `SF-001`, `SF-002` | **P2 Nice-to-Have** |

### 2.2. Data Structures, Constants & `settings.json` Schema

#### Bảng `CONSTANTS` & `ENUMS` (Tuân thủ nghiêm ngặt luật No Magic Numbers/Strings)

```typescript
export enum PropertyType {
  TOWNHOUSE = 'TOWNHOUSE',           // Nhà phố
  APARTMENT = 'APARTMENT',           // Căn hộ chung cư
  LAND_PLOT = 'LAND_PLOT',           // Đất nền
  VILLA = 'VILLA',                   // Biệt thự
  COMMERCIAL_SPACE = 'COMMERCIAL_SPACE', // Mặt bằng kinh doanh
}

export enum ListingWorkflowStatus {
  FIELD_DRAFT = 'FIELD_DRAFT',             // Đang ghi nháp ngoài thực địa
  SYNCED_COMPANY_DRAFT = 'SYNCED_COMPANY_DRAFT', // Đã lưu vào kho công ty, chờ chỉnh sửa
  POLISHED_READY = 'POLISHED_READY',       // Đã hoàn thiện nội dung, sẵn sàng đăng
  PUBLISHED = 'PUBLISHED',                 // Đã đẩy lên mạng xã hội
  ARCHIVED = 'ARCHIVED',
}

export enum SocialPlatform {
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
}

export enum SyncQueueState {
  LOCAL_ONLY_OFFLINE = 'LOCAL_ONLY_OFFLINE',
  SYNC_IN_PROGRESS = 'SYNC_IN_PROGRESS',
  SYNCED_SUCCESS = 'SYNCED_SUCCESS',
  SYNC_FAILED_RETRYING = 'SYNC_FAILED_RETRYING',
}

export const REAL_ESTATE_TOOL_CONSTANTS = {
  MIN_ADDRESS_LENGTH: 5,
  MIN_ASKING_PRICE: 1,
  MAX_ASKING_PRICE: 1_000_000_000_000, // 1,000 tỷ
  FACEBOOK_MAX_CAPTION_LENGTH: 63_206,
  INSTAGRAM_MAX_CAPTION_LENGTH: 2_200,
  INSTAGRAM_MAX_HASHTAGS: 30,
  INSTAGRAM_MIN_MEDIA_COUNT: 1,
  MAX_MEDIA_PER_POST: 10,
  ENGAGEMENT_SYNC_INTERVAL_MS: 900_000, // 15 phút
} as const;
```

#### TypeScript Interfaces

```typescript
export interface PropertyFunctionality {
  areaM2: number;
  frontageWidthM?: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  houseDirection?: string; // Đông Tứ Trạch / Tây Tứ Trạch / Đông Nam...
  legalStatus: string;     // Sổ hồng riêng / Hợp đồng mua bán...
  highlightUtilities: string[]; // Gần chợ, trường học, hẻm xe hơi...
}

export interface PropertySurveyDraft {
  id: string;
  brokerId: string;
  addressPublicArea: string;     // Địa chỉ khu vực công khai (VD: "Đường Nguyễn Thị Thập, Quận 7")
  exactAddressPrivate: string;   // Số nhà chính xác (Chỉ lưu nội bộ công ty)
  ownerPhonePrivate: string;     // SĐT chủ nhà (Cấm xuất hiện trên bài đăng MXH)
  privateBrokerNotes: string;    // Ghi chú đàm phán nội bộ
  propertyType: PropertyType;
  askingPriceVnd: number;
  functionality: PropertyFunctionality;
  mediaUrls: string[];
  publicCaption: string;
  hashtags: string[];
  workflowStatus: ListingWorkflowStatus;
  syncState: SyncQueueState;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface SocialPostPublication {
  publicationId: string;
  draftId: string;
  platform: SocialPlatform;
  externalPostId: string;
  permalinkUrl: string;
  publishedAtIso: string;
}

export interface PostEngagementMetrics {
  publicationId: string;
  draftId: string;
  platform: SocialPlatform;
  viewsCount: number;      // Số người xem
  reactionsCount: number;  // Số người thả reaction
  commentsCount: number;   // Số người comment
  engagementRatePercent: number;
  lastFetchedAtIso: string;
}

export interface AggregatedListingAnalytics {
  draftId: string;
  totalViews: number;
  totalReactions: number;
  totalComments: number;
  overallEngagementRatePercent: number;
  byPlatform: Record<SocialPlatform, PostEngagementMetrics | null>;
}
```

#### Cấu trúc `settings.json` Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RealEstateLocalDetectiveSettings",
  "type": "object",
  "required": ["companyBackend", "metaGraphApi", "offlineStorage"],
  "properties": {
    "companyBackend": {
      "type": "object",
      "required": ["baseUrl", "companyApiKey", "syncRetryCount"],
      "properties": {
        "baseUrl": { "type": "string", "format": "uri" },
        "companyApiKey": { "type": "string", "description": "Token xác thực với máy chủ nội bộ công ty BĐS" },
        "syncRetryCount": { "type": "integer", "default": 3 }
      }
    },
    "metaGraphApi": {
      "type": "object",
      "required": ["graphApiVersion", "facebookPageId", "instagramBusinessAccountId", "pageAccessToken"],
      "properties": {
        "graphApiVersion": { "type": "string", "default": "v21.0" },
        "facebookPageId": { "type": "string" },
        "instagramBusinessAccountId": { "type": "string" },
        "pageAccessToken": { "type": "string", "description": "Meta Page Access Token lưu bảo mật trong settings.json" }
      }
    },
    "offlineStorage": {
      "type": "object",
      "required": ["localStorageDraftsKey", "outboxQueueKey", "metricsPollIntervalMs"],
      "properties": {
        "localStorageDraftsKey": { "type": "string", "default": "aise_re_survey_drafts_v1" },
        "outboxQueueKey": { "type": "string", "default": "aise_re_sync_outbox_v1" },
        "metricsPollIntervalMs": { "type": "integer", "default": 900000 }
      }
    }
  }
}
```

### 2.3. Kiến Trúc Service & Helper (Tuân thủ Rule 4 & SRP)

| Tên File | Loại | Hàm & Chữ ký (Method Signatures) | Mục đích (Docstring) |
| :--- | :--- | :--- | :--- |
| `src/services/FieldSurveyDraftService.ts` | `*Service` | `createOrUpdateFieldDraft(input: Partial<PropertySurveyDraft>): PropertySurveyDraft`<br>`polishDraftForPublishing(draft: PropertySurveyDraft, customCaption?: string): PropertySurveyDraft`<br>`flushOfflineQueueToCompany(drafts: PropertySurveyDraft[]): Promise<PropertySurveyDraft[]>` | Quản lý vòng đời bản nháp khảo sát từ lúc ghi nhanh ngoài thực địa (Offline-first), đồng bộ về kho công ty cho tới lúc chỉnh sửa hoàn thiện tại nhà. |
| `src/services/helpers/FieldSurveyDraftServiceHelper.ts` | `*ServiceHelper` | `validateFieldDraftInput(input: Partial<PropertySurveyDraft>): { valid: boolean; errorCode?: string }`<br>`generatePublicListingCaption(draft: PropertySurveyDraft): string`<br>`containsPrivateOwnerLeak(publicCaption: string, exactAddressPrivate: string, ownerPhonePrivate: string): boolean` | Kiểm tra tính hợp lệ của thông số nhà khảo sát, tự động sinh caption quảng cáo từ thông số công năng và phát hiện rò rỉ SĐT/số nhà nhạy cảm của chủ nhà. |
| `src/services/SocialPublishingService.ts` | `*Service` | `publishListingToPlatforms(draft: PropertySurveyDraft, targetPlatforms: SocialPlatform[], existingPublications: SocialPostPublication[]): Promise<SocialPostPublication[]>` | Kiểm tra điều kiện từng nền tảng (Facebook/Instagram), chống đăng trùng bài và thực hiện đẩy bài đăng lên mạng xã hội. |
| `src/services/helpers/SocialPublishingServiceHelper.ts` | `*ServiceHelper` | `validatePlatformConstraints(draft: PropertySurveyDraft, platform: SocialPlatform): { valid: boolean; errorCode?: string }`<br>`isDuplicatePublication(draftId: string, platform: SocialPlatform, existingPublications: SocialPostPublication[]): boolean` | Kiểm tra giới hạn ký tự, số lượng hashtag, yêu cầu hình ảnh bắt buộc của Instagram và kiểm tra bài đã đăng trước đó hay chưa. |
| `src/services/EngagementTrackingService.ts` | `*Service` | `updateEngagementMetrics(publication: SocialPostPublication, rawMetrics: { views: number; reactions: number; comments: number }): PostEngagementMetrics`<br>`aggregateListingEngagement(draftId: string, metricsList: PostEngagementMetrics[]): AggregatedListingAnalytics` | Quản lý và tổng hợp số lượt Xem (`viewsCount`), Reaction (`reactionsCount`) và Comment (`commentsCount`) theo từng bài đăng và toàn căn nhà. |
| `src/services/helpers/EngagementTrackingServiceHelper.ts` | `*ServiceHelper` | `sanitizeEngagementCount(value: number): number`<br>`calculateEngagementRatePercent(views: number, reactions: number, comments: number): number` | Chuẩn hóa các chỉ số tương tác không âm và tính tỷ lệ tương tác an toàn (không chia cho `0`). |

### 2.4. Ma Trận 5 Trạng Thái UX (`Ideal`, `Loading`, `Empty`, `Error`, `Partial/Overflow`)

| Trạng thái UX | Điều kiện kích hoạt | Hiển thị Giao diện (Visual Feedback) | Hành động khôi phục / Tương tác (CTA) |
| :--- | :--- | :--- | :--- |
| **1. Empty State** | Môi giới mới mở ứng dụng, chưa có bản nháp khảo sát nào. | Giao diện Mobile-first hiển thị nút lớn nổi bật: **"+ Tạo Bản Nháp Khảo Sát Mới"** và bộ lọc kho nguồn hàng công ty. | Bấm `+ Tạo Bản Nháp Khảo Sát Mới` để ghi nhanh địa chỉ, giá chào, công năng ngay tại hiện trường. |
| **2. Loading State** | Đang đẩy bài đăng + bộ ảnh nhà lên Facebook/Instagram hoặc đang cập nhật chỉ số tương tác. | Thanh tiến trình hiển thị riêng cho từng nền tảng: `"Đang tải ảnh lên Facebook Page (1/2)..."`, `"Đang xuất bản lên Instagram Business (2/2)..."`. | Khóa nút `Đăng bài` trong lúc đang xử lý để chống đăng trùng. |
| **3. Ideal State** | Bản nháp đã đồng bộ về công ty, chỉnh sửa xong, đăng thành công lên FB/IG và thu thập được tương tác. | Thẻ bất động sản hiển thị huy hiệu `PUBLISHED`, link mở bài viết thật trên FB/IG và 3 ô chỉ số trực quan: **👁️ Lượt xem (`Views`)**, **❤️ Cảm xúc (`Reactions`)**, **💬 Bình luận (`Comments`)** kèm biểu đồ so sánh FB vs IG. | Nút `Làm mới tương tác`, `Xem bình luận khách hàng`, hoặc `Chỉnh sửa nội dung`. |
| **4. Error State** | Cố đăng lên Instagram nhưng chưa chụp ảnh căn nhà nào, làm lộ SĐT chủ nhà trong caption, hoặc Token Meta hết hạn. | Cảnh báo đỏ chỉ rõ lỗi: *"Không thể đăng lên Instagram vì chưa có hình ảnh tài sản (Instagram yêu cầu tối thiểu 1 ảnh/video)"* hoặc *"CẢNH BÁO LỘ NGUỒN HÀNG: Caption công khai đang chứa SĐT riêng của chủ nhà!"*. | Nút `Tự động xóa SĐT chủ nhà khỏi Caption`, `Thêm ảnh khảo sát`, hoặc `Kết nối lại Fanpage`. |
| **5. Partial / Overflow State** | Mất mạng 4G khi đang khảo sát thực địa, hoặc đăng lên Facebook thành công nhưng Instagram bị lỗi quá 30 hashtags. | Khi mất mạng: hiện huy hiệu màu cam **"Đã lưu an toàn trên máy (Offline) — Sẽ tự động đẩy về công ty khi có mạng"**. Khi đăng 1 phần: hiện rõ `Facebook: Đã đăng ✅ | Instagram: Cần giảm bớt hashtag ⚠️`. | Nút `Chỉ thử đăng lại Instagram` mà không đăng lại Facebook. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

| Mã Rủi Ro | Mô tả Lỗ hổng / Rủi ro Thực tế | Mức độ nghiêm trọng | Chốt chặn Kỹ thuật Bắt buộc (Technical Guardrail) |
| :--- | :--- | :--- | :--- |
| `RISK-001` | **Mất sạch dữ liệu khảo sát khi mất sóng 4G trong hẻm/tầng hầm (`Field Connectivity Drop`):** Môi giới đứng trong nhà khách gõ 15 phút đầy đủ thông số, diện tích, giá chào rồi bấm Lưu đúng lúc rớt mạng. Nếu app chỉ gọi HTTP POST trực tiếp mà không có Offline Queue, toàn bộ ghi chú sẽ biến mất. | **CRITICAL (Blocker)** | **Lưu Offline-First Tức Thời tại `FieldSurveyDraftService`:** Mọi lệnh `createOrUpdateFieldDraft()` ghi ngay vào bộ nhớ cục bộ với trạng thái `SyncQueueState.LOCAL_ONLY_OFFLINE` trước khi gọi mạng; hàm `flushOfflineQueueToCompany()` chạy nền tự động đồng bộ khi có mạng. |
| `RISK-002` | **Lộ thông tin mật của chủ nhà lên mạng xã hội làm mất nguồn hàng (`Private Source Leak`):** Nếu môi giới vô tình gõ số điện thoại chủ nhà hoặc địa chỉ số nhà chính xác vào phần nội dung công khai, các môi giới đối thủ quét bài trên Facebook sẽ tìm tới làm việc trực tiếp với chủ nhà. | **HIGH** | **Chốt chặn `containsPrivateOwnerLeak()` trước khi Publish:** Tách bạch hoàn toàn các trường `exactAddressPrivate`, `ownerPhonePrivate`, `privateBrokerNotes` khỏi `publicCaption`. Trước khi đẩy bài lên FB/IG, nếu phát hiện chuỗi `ownerPhonePrivate` hoặc `exactAddressPrivate` nằm trong `publicCaption`, chặn xuất bản ngay với lỗi `ERR_PRIVATE_OWNER_INFO_LEAK`. |
| `RISK-003` | **Lỗi từ chối đăng bài của Instagram do vi phạm ràng buộc nền tảng (`Instagram Media & Hashtag Rejection`):** Khác với Facebook cho phép đăng bài chỉ có chữ (Text-only), Instagram Graph API lập tức trả về lỗi `HTTP 400` nếu không có media hoặc nếu caption chứa `> 30` dấu `#` hoặc `> 2,200` ký tự. | **HIGH** | **Bộ kiểm định `validatePlatformConstraints()` theo từng nền tảng:** Kiểm tra riêng biệt các giới hạn của `SocialPlatform.FACEBOOK` và `SocialPlatform.INSTAGRAM` trước khi gửi request mạng. |
| `RISK-004` | **Bấm đúp nút Đăng bài tạo ra nhiều bài trùng lặp và làm lệch số liệu tương tác (`Duplicate Post & Split Metrics`):** Nếu cùng một căn nhà bị đăng 2 lần lên cùng 1 Fanpage, lượng view/reaction/comment bị chia đôi và Fanpage bị đánh giá spam. | **MEDIUM** | **Chốt chặn Idempotency `isDuplicatePublication()`:** Kiểm tra cặp `(draftId, platform)` trong danh sách bài đã xuất bản; nếu đã tồn tại `externalPostId`, từ chối tạo bài mới và đề xuất cập nhật bài cũ. |

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1. Kịch bản Kiểm thử 3 Tầng (`Given / When / Then`)

#### Tầng 1: P0 Happy Paths (Người dùng hay xài nhất)
- **TC-T1-001: Ghi nháp khảo sát ngoài thực địa -> Lưu kho công ty -> Chỉnh sửa hoàn thiện -> Đăng lên Facebook & Instagram**
  - **Given:** Môi giới đi khảo sát một căn nhà phố Quận 7, nhập giá chào `8,500,000,000 VNĐ`, diện tích `80 m²`, `4` phòng ngủ, `4` WC, đính kèm 3 ảnh và lưu nháp.
  - **When:** Về nhà gọi `polishDraftForPublishing()` để hoàn thiện caption rồi gọi `publishListingToPlatforms(draft, [FACEBOOK, INSTAGRAM], [])`.
  - **Then:** Bản nháp chuyển từ `FIELD_DRAFT` sang `POLISHED_READY` rồi sang `PUBLISHED`; trả về 2 bản ghi `SocialPostPublication` hợp lệ cho cả Facebook và Instagram, không chứa SĐT riêng của chủ nhà trong `publicCaption`.
- **TC-T1-002: Quản lý và tổng hợp 3 chỉ số tương tác (`Views`, `Reactions`, `Comments`) trên nhiều nền tảng**
  - **Given:** Bài đăng căn nhà đã xuất bản trên Facebook (có `1,200 views`, `45 reactions`, `12 comments`) và Instagram (có `800 views`, `65 reactions`, `8 comments`).
  - **When:** Gọi `updateEngagementMetrics()` cho từng kênh và `aggregateListingEngagement()`.
  - **Then:** Kết quả tổng hợp trả về chính xác `totalViews = 2,000`, `totalReactions = 110`, `totalComments = 20`, và `overallEngagementRatePercent = 6.5%`.
- **TC-T1-003: Đồng bộ hàng đợi Offline về máy chủ công ty (`flushOfflineQueueToCompany`)**
  - **Given:** Thiết bị đang có 3 bản nháp khảo sát ở trạng thái `LOCAL_ONLY_OFFLINE`.
  - **When:** Có kết nối mạng trở lại và gọi `flushOfflineQueueToCompany()`.
  - **Then:** Cả 3 bản nháp chuyển sang trạng thái `SYNCED_SUCCESS` và `workflowStatus = SYNCED_COMPANY_DRAFT`.

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-T2-001: Chặn đăng bài lên Instagram khi bản nháp không có hình ảnh hoặc vượt quá 30 hashtags**
  - **Given:** Một bản nháp có `mediaUrls = []` hoặc có `35 hashtags`.
  - **When:** Gọi `validatePlatformConstraints(draft, SocialPlatform.INSTAGRAM)`.
  - **Then:** Trả về `{ valid: false, errorCode: 'ERR_INSTAGRAM_MEDIA_REQUIRED' }` hoặc `'ERR_INSTAGRAM_TOO_MANY_HASHTAGS'`.
- **TC-T2-002: Chặn xuất bản khi nội dung công khai làm lộ số điện thoại chủ nhà (`ERR_PRIVATE_OWNER_INFO_LEAK`)**
  - **Given:** Bản nháp có `ownerPhonePrivate = "0909123456"` và môi giới vô tình dán `"Liên hệ chủ nhà 0909123456"` vào `publicCaption`.
  - **When:** Gọi `polishDraftForPublishing()` hoặc `publishListingToPlatforms()`.
  - **Then:** Hệ thống phát hiện rò rỉ thông tin mật và ném lỗi `ERR_PRIVATE_OWNER_INFO_LEAK`.
- **TC-T2-003: Chặn đăng bài khi bản nháp chưa được hoàn thiện (`workflowStatus === FIELD_DRAFT`) hoặc bị bấm đăng trùng lần 2**
  - **Given:** Bản nháp vẫn đang ở trạng thái ghi vội ngoài đường (`FIELD_DRAFT`) hoặc đã được đăng lên Facebook trước đó.
  - **When:** Gọi `publishListingToPlatforms()`.
  - **Then:** Ném lỗi `ERR_DRAFT_NOT_POLISHED` hoặc `ERR_DUPLICATE_PUBLICATION`.

#### Tầng 3: Boundary & Rare Edge Cases (`0`, `-1`, `MAX`, `Empty`, `Duplicate`, `Concurrent`)
- **TC-T3-001: Giá trị biên `0` và `-1` cho chỉ số tương tác (`views = 0`, `reactions = -5`) khi tính Engagement Rate**
  - **Given:** Bài đăng vừa mới lên chưa có người xem (`views = 0, reactions = 0, comments = 0`) hoặc API trả về số âm bất thường (`-5`).
  - **When:** Gọi `updateEngagementMetrics()`.
  - **Then:** Các số âm được đưa về `0`, `engagementRatePercent = 0` (tuyệt đối không phát sinh `NaN` hay `Infinity` do chia cho `0`).
- **TC-T3-002: Giá chào bất động sản bằng `0`, âm (`-100`) hoặc diện tích `<= 0`**
  - **Given:** Môi giới nhập `askingPriceVnd = 0` hoặc `functionality.areaM2 = -20`.
  - **When:** Gọi `validateFieldDraftInput()`.
  - **Then:** Trả về `{ valid: false, errorCode: 'ERR_INVALID_PRICE_OR_AREA' }`.
- **TC-T3-003: Caption chạm đúng ngưỡng biên của Instagram (`2,200 ký tự` và đúng `30 hashtags`)**
  - **Given:** Caption dài đúng `2,200 ký tự` và có đúng `30 hashtags` kèm 1 ảnh.
  - **When:** Gọi `validatePlatformConstraints(draft, SocialPlatform.INSTAGRAM)`.
  - **Then:** Trả về `{ valid: true }`; nếu tăng lên `2,201 ký tự` hoặc `31 hashtags` thì lập tức trả về `{ valid: false }`.

### 4.2. Quy trình 5 Bước Kiểm Chứng Bề Mặt Thật cho QA Reviewer

1. **Step 1 — Launch:** Khởi chạy các dịch vụ quản lý khảo sát BĐS, xuất bản MXH và đo lường tương tác với cấu hình từ `settings.json`.
2. **Step 2 — Doctor:** Kiểm tra schema `settings.json`, xác nhận `REAL_ESTATE_TOOL_CONSTANTS` và các enum hoạt động chuẩn.
3. **Step 3 — Drive:** Chạy luồng thực tế từ tạo nháp Offline -> đồng bộ về công ty -> kiểm duyệt chống lộ SĐT chủ nhà -> đẩy lên Facebook & Instagram -> cập nhật và thống kê `Views`, `Reactions`, `Comments`.
4. **Step 4 — Evidence:** Lưu lại log thực thi test và bảng kết quả thống kê tương tác làm bằng chứng nghiệm thu.
5. **Step 5 — Cleanup:** Xóa dữ liệu nháp tạm sau khi hoàn tất kiểm thử.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role phụ trách | File mục tiêu | Mô tả chi tiết hàm cần viết | Phụ thuộc | Lệnh Verify + Tiêu chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `src/constants/realEstateConstants.ts` & `settings.json` | Khai báo `PropertyType`, `ListingWorkflowStatus`, `SocialPlatform`, `SyncQueueState`, `REAL_ESTATE_TOOL_CONSTANTS` và tạo `settings.json`. | Không (None) | `npx tsc --noEmit` pass 100%, không có magic number/string. |
| `TASK-002` | **Developer** | `src/types/realEstateTypes.ts` | Định nghĩa đầy đủ các interfaces: `PropertyFunctionality`, `PropertySurveyDraft`, `SocialPostPublication`, `PostEngagementMetrics`, `AggregatedListingAnalytics`. | **Hard:** `TASK-001` | `npx tsc --noEmit` không có lỗi. |
| `TASK-003` | **Developer** | `src/services/helpers/FieldSurveyDraftServiceHelper.ts` | Viết `validateFieldDraftInput()`, `generatePublicListingCaption()`, và `containsPrivateOwnerLeak()`. | **Hard:** `TASK-002` | Phát hiện chính xác 100% trường hợp lộ SĐT chủ nhà hoặc số nhà mật trong caption. |
| `TASK-004` | **Developer** | `src/services/FieldSurveyDraftService.ts` | Viết `createOrUpdateFieldDraft()`, `polishDraftForPublishing()`, và `flushOfflineQueueToCompany()`. | **Hard:** `TASK-003` | Quản lý đúng chuyển đổi trạng thái `FIELD_DRAFT` -> `SYNCED_COMPANY_DRAFT` -> `POLISHED_READY`. |
| `TASK-005` | **Developer** | `src/services/helpers/SocialPublishingServiceHelper.ts` & `src/services/SocialPublishingService.ts` | Viết `validatePlatformConstraints()`, `isDuplicatePublication()`, và `publishListingToPlatforms()`. | **Hard:** `TASK-004` | Chặn đúng lỗi thiếu ảnh/quá hashtag trên Instagram và chống đăng trùng bài. |
| `TASK-006` | **Developer** | `src/services/helpers/EngagementTrackingServiceHelper.ts` & `src/services/EngagementTrackingService.ts` | Viết `sanitizeEngagementCount()`, `calculateEngagementRatePercent()`, `updateEngagementMetrics()` và `aggregateListingEngagement()`. | **Hard:** `TASK-002` | Tính đúng tổng `Views`, `Reactions`, `Comments` và tỷ lệ tương tác mà không bị lỗi chia `0`. |
| `TASK-007` | **Developer** | `src/ui/BrokerDashboardController.ts` | Kết nối giao diện Quản lý Bản nháp Khảo sát và Bảng thống kê Tương tác Bài đăng (`Views`, `Reactions`, `Comments`). | **Hard:** `TASK-005`, `TASK-006` | Hiển thị rõ 5 trạng thái UX từ Offline Draft tới Published Analytics. |
| `TASK-008` | **Test Engineer** | `tests/fieldSurveyDraft.test.ts` | Viết Unit Test 3 tầng cho `FieldSurveyDraftService` & Helper (tạo nháp, đồng bộ offline, sinh caption, chặn lộ SĐT chủ nhà, biên giá chào/diện tích `<= 0`). | **Hard:** `TASK-004` | `npm test -- tests/fieldSurveyDraft.test.ts` pass 100%. |
| `TASK-009` | **Test Engineer** | `tests/socialPublishing.test.ts` | Viết Unit Test 3 tầng cho `SocialPublishingService` & Helper (đăng FB & IG, giới hạn `2,200` ký tự và `30` hashtags của IG, chặn đăng trùng bài). | **Hard:** `TASK-005` | `npm test -- tests/socialPublishing.test.ts` pass 100%, branch coverage `>= 90%`. |
| `TASK-010` | **Test Engineer** | `tests/engagementTracking.test.ts` | Viết Unit Test 3 tầng cho `EngagementTrackingService` (thống kê Views/Reactions/Comments, xử lý biên `views = 0` và số âm, tổng hợp đa nền tảng). | **Hard:** `TASK-006` | Toàn bộ test suite chạy xanh 100%, lưu log bằng chứng QA. |
