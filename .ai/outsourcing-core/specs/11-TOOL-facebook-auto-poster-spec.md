# ĐẶC TẢ KỸ THUẬT & THỰC THI: FACEBOOK AUTO POSTER (NAIL SALON SOCIAL POSTER & BRAND KIT PIPELINE)

> **Dự án:** `facebook-auto-poster`  
> **Phân nhóm:** Core SaaS / POS / Finance (Nhóm 1)  
> **Đơn vị lập đặc tả:** AISE Squad 1 — BA Team (`intake`, `ba`, `requirement_challenger`) & PM Team (`orchestrator`, `estimator_cost_controller`)  
> **Nguồn tham chiếu:** `idea/facebook-auto-poster/nail-salon-poster-proposal.md`, `idea/facebook-auto-poster/ticket-script.md`, `idea/facebook-auto-poster/quick-start.md`  
> **Trạng thái:** Dev-Ready & Test-Ready  

---

## PHẦN 1 — INTAKE & PHÂN LOẠI HỢP ĐỒNG (`intake`)

### 1.1 Nhãn Bảo Mật & Rủi Ro (Security & Risk Tags)
- `auth`: Lưu trữ và bảo vệ thông tin nhạy cảm của từng tiệm nail: Facebook Page Access Token (khi dùng Graph API) và phiên đăng nhập trình duyệt / Cookies (khi dùng Playwright). Tuyệt đối không lưu plaintext trong file `.json` thông thường.
- `pii`: Xử lý hình ảnh và video thật có bàn tay khách hàng, hình xăm hoặc khuôn mặt khách tại tiệm nail — bắt buộc phải có trường xác nhận sự đồng ý của khách (`customerConsentConfirmed`) trước khi cho phép lên lịch đăng.
- `external_api`: Tích hợp **Facebook Graph API** (`pages_manage_posts`, `pages_read_engagement`, `pages_show_list`, `publish_video`), **Playwright Chromium** (`quick-start.md`), **Google Gemini API** (sinh caption tiếng Anh theo mùa/sự kiện và đồ họa quảng cáo), cùng công cụ xử lý đa phương tiện cục bộ **Pillow** (ảnh) và **FFmpeg** (video).
- `payment`: Chi phí gọi API Gemini (text/image generation) cần được kiểm soát qua cấu hình hạn mức.

### 1.2 Bảng Phân Tách: Stated Facts, Explicit Assumptions & Clarification Questions

| Phân loại | Mã tham chiếu | Nội dung chi tiết | Nguồn / Cơ sở |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-01` | Hệ thống nền tảng hiện có `fb_gui.py` (Playwright + Tkinter, cài đặt qua `python -m pip install playwright` và `playwright install chromium`) đã đăng bài thành công theo lịch. Mục tiêu nâng cấp thành **Nail Salon Social Poster** biến nguyên liệu thô (ảnh/video phôi) thành bài đăng hoàn chỉnh theo đúng **Brand Kit** của từng tiệm. | `nail-salon-poster-proposal.md` (§1), `quick-start.md` |
| **Stated Fact** | `SF-02` | Cấu trúc bài ảnh chuẩn của tiệm nail (phân tích từ mẫu H&H Nails and Lash): Ghép 1–4 ảnh thật công việc của tiệm thành lưới (tỷ lệ `4:5`, `1:1`, `9:16`), thêm logo/khung bằng **Python + Pillow** (Mức 1). Không dùng AI gen mẫu nail giả làm thành phẩm của tiệm; nếu dùng ảnh AI cho đồ họa quảng cáo phải gắn nhãn `aiGeneratedLabel`. | `nail-salon-poster-proposal.md` (§1, §3.1, §4.1) |
| **Stated Fact** | `SF-03` | Cấu trúc bài video chuẩn: Video dọc `9:16` (`1080x1920`), có chữ overlay ở dưới (VD: `"Find your next nail inspo ✨"`), logo, nền đen hai bên hoặc crop chuẩn bằng **FFmpeg** (Phương án V1 khuyên dùng để tự động hóa 100% ra thẳng file MP4, tùy chọn V2 xuất draft CapCut). | `nail-salon-poster-proposal.md` (§1, §4.2) |
| **Stated Fact** | `SF-04` | Cấu trúc Caption 3 khối bằng tiếng Anh (cho khách Mỹ): (1) Câu mở đầu theo mùa/sự kiện + emoji đúng giọng tiệm (`voice`) + CTA -> (2) Dòng địa điểm cố định (`📍Tên tiệm \| Thành phố`) -> (3) Cụm hashtag (`local` + `brand` + `niche`). | `nail-salon-poster-proposal.md` (§1, §3.1, §6) |
| **Stated Fact** | `SF-05` | Pipeline bắt buộc có **Hàng chờ duyệt (Approval Queue)**: Chủ tiệm xem trước media đã áp style + sửa caption + bấm `OK (Approve)` trước khi tool được phép đăng; không tự đăng bài chưa được duyệt (trừ khi tiệm bật cờ auto-approve sau khi đã tin tưởng). | `nail-salon-poster-proposal.md` (§2 Q4, §3.2, §3.3) |
| **Stated Fact** | `SF-06` | Kiến trúc `Publisher` phải thiết kế theo Adapter Pattern có thể thay ruột linh hoạt giữa **Playwright Publisher** (giai đoạn thử 1–3 tiệm) và **Facebook Graph API Publisher** (chính thống cho Facebook Page: gửi `published=false` kèm `scheduled_publish_time` cách hiện tại từ **10 phút đến 30 ngày**). | `nail-salon-poster-proposal.md` (§5, §6) |
| **Explicit Assumption** | `EA-01` | Ngôn ngữ lập trình chính của dự án là **Python 3.10+** (tương thích trực tiếp với `fb_gui.py`, `playwright`, `Pillow`, `ffmpeg-python` và `sqlite3`/`json` storage như nêu trong `nail-salon-poster-proposal.md` §4 & §6). | `nail-salon-poster-proposal.md`, `quick-start.md` |
| **Explicit Assumption** | `EA-02` | Mỗi bài đăng có hộp kiểm bắt buộc `customer_consent_confirmed: bool` (Xác nhận khách hàng đã đồng ý cho sử dụng hình ảnh tay/mặt) theo đúng yêu cầu quản trị rủi ro tại Mục 2 Q10 và Mục 8.2. | `nail-salon-poster-proposal.md` (§2 Q10, §8.2) |

### 1.3 Câu Hỏi Làm Rõ (Clarification Questions)

| Mã | Câu hỏi | Các lựa chọn (Options) | Khuyến nghị (Recommendation) |
| :--- | :--- | :--- | :--- |
| `CQ-01` | Khi người vận hành thả 3 ảnh có kích thước và tỷ lệ khác nhau vào thư mục nguyên liệu để ghép lưới 3 ảnh (`3-photo grid`), Pillow nên xử lý vùng biên như thế nào? | **Option A:** Smart Center-Crop về cùng tỷ lệ ô lưới để lấp đầy khung không có viền thừa.<br>**Option B:** Pad viền theo màu `colors.primary` của Brand Kit.<br>**Option C:** Kéo giãn ảnh (Stretch). | **Khuyến nghị Option A (kèm tùy chọn Option B trong Brand Kit):** Center-crop giữ đúng tỷ lệ tự nhiên của bàn tay khách, không bao giờ kéo méo ảnh (Stretch). |
| `CQ-02` | Nhạc nền cho video FFmpeg lấy từ nguồn nào để không bị Meta tắt tiếng (Mute) hoặc đánh bản quyền trên Facebook Page doanh nghiệp? | **Option A:** Chỉ sử dụng thư viện file âm thanh Royalty-Free (`.mp3`/`.wav`) được cấp phép thương mại nằm trong thư mục `assets/audio/` của Brand Kit, hoặc giữ âm thanh gốc / tắt tiếng.<br>**Option B:** Lấy nhạc thịnh hành từ TikTok/CapCut. | **Khuyến nghị Option A:** Tuyệt đối chỉ dùng kho nhạc Royalty-Free hoặc tắt nhạc theo đúng cảnh báo pháp lý tại Mục 4.2 của `nail-salon-poster-proposal.md`. |

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1 Bảng Yêu Cầu Nghiệp Vụ (Traceability Matrix)

| Mã REQ | Tên yêu cầu | Mô tả nghiệp vụ chi tiết | Nguồn gốc | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | Quản lý Đa Tiệm & Cấu hình Brand Kit (`BrandKitService`) | Lưu và đọc hồ sơ `BrandKit` cho từng tiệm nail (tên tiệm, thành phố, `location_line`, `voice`, bảng màu `primary`/`accent`, đường dẫn `logo`, bộ `hashtags` 3 nhóm `local`/`brand`/`niche`, `cta`, và `video_overlay_templates`). | `nail-salon-poster-proposal.md` §3.1 & §6 | **P0 Must-Have** |
| `REQ-002` | Xử lý & Ghép Lưới Ảnh Tự động bằng Pillow (`ImageMediaEngine`) | Nhận 1–4 ảnh thật, kiểm tra hợp lệ, crop theo tỷ lệ (`4:5`, `1:1`, `9:16`), ghép lưới (`1`, `2`, `3`, `4` ảnh) và đóng dấu Logo PNG trong suốt theo Brand Kit. | `nail-salon-poster-proposal.md` §4.1 (Mức 1) | **P0 Must-Have** |
| `REQ-003` | Xử lý Video Dọc 9:16 Tự động bằng FFmpeg (`VideoMediaEngine`) | Nhận video phôi, xây dựng lệnh FFmpeg scale/pad về `1080x1920` (nền đen hoặc mờ hai bên), chèn chữ overlay ở dưới, chèn logo và ghép nhạc Royalty-Free tùy chọn để xuất thẳng ra file `.mp4`. | `nail-salon-poster-proposal.md` §4.2 (Hướng V1) | **P0 Must-Have** |
| `REQ-004` | Sinh Caption Tiếng Anh 3 Khối theo Brand Kit (`CaptionGeneratorService`) | Kết hợp thông tin từ Brand Kit + dịp/mùa trong năm (Halloween, Valentine, Summer...) gọi Gemini API (hoặc Template Engine dự phòng) để tạo caption 3 khối: Hook/Body + `location_line` + Hashtags, đảm bảo không tự bịa giá/khuyến mãi ngoài Brand Kit. | `nail-salon-poster-proposal.md` §1, §3.2, §8.6 | **P0 Must-Have** |
| `REQ-005` | Hàng Chờ Duyệt & Kiểm soát Đồng ý Khách hàng (`ApprovalQueueService`) | Lưu bài đăng ở trạng thái `PENDING_APPROVAL`; cho phép chủ tiệm xem trước, sửa caption, tích chọn `customer_consent_confirmed` và gắn nhãn `is_ai_generated` (nếu là ảnh quảng cáo AI) trước khi chuyển sang `APPROVED`. | `nail-salon-poster-proposal.md` §3.2, §3.3, §8.2, §8.3 | **P0 Must-Have** |
| `REQ-006` | Bộ Lên Lịch & Rải Bài Tự động (`SchedulerService`) | Cho phép chọn ngày giờ đăng cụ thể hoặc tự động rải bài vào các khung giờ cố định trong tuần (VD: Thứ 3, Thứ 5, Thứ 7 lúc 10:00 AM); kiểm tra ràng buộc thời gian hợp lệ. | `nail-salon-poster-proposal.md` §3.3 (US-3) | **P0 Must-Have** |
| `REQ-007` | Kiến trúc Publisher Đa Ruột: Graph API & Playwright (`PublisherService`) | Cung cấp giao diện `BasePublisher` thống nhất với 2 cài đặt: `GraphApiPublisher` (kiểm tra cửa sổ lên lịch 10 phút – 30 ngày của Meta) và `PlaywrightPublisher` (điều khiển Chromium có chụp ảnh màn hình khi lỗi). | `nail-salon-poster-proposal.md` §5, §8.7 | **P0 Must-Have** |
| `REQ-008` | Mã hóa Token & Phiên Đăng nhập (`CredentialVaultService`) | Mã hóa Facebook Page Access Token và đường dẫn phiên đăng nhập Playwright trước khi lưu xuống đĩa; đọc khóa giải mã từ biến môi trường. | `nail-salon-poster-proposal.md` §8.5 | **P1 Should-Have** |
| `REQ-009` | Ghi Nhật ký Xuất bản & Thử lại Bài lỗi (`PublishLogService`) | Lưu chi tiết lịch sử đăng bài (`PublishLog`: thời gian, trạng thái, link bài đăng hoặc thông báo lỗi + đường dẫn ảnh chụp màn hình lỗi) và cho phép bấm `Retry`. | `nail-salon-poster-proposal.md` §3.3 (US-6) | **P1 Should-Have** |
| `REQ-010` | Xuất Bản Nháp CapCut Tùy chọn & Tự động tạo Ticket GitHub (`CapCutDraftExporter` & `TicketScript`) | Hỗ trợ xuất cấu trúc draft JSON cơ bản cho CapCut (Hướng V2 tùy chọn) và tích hợp script kiểm tra tạo issue theo nhãn `idea/facebook-auto-poster`. | `nail-salon-poster-proposal.md` §4.2, `ticket-script.md` | **P2 Nice-to-Have** |

### 2.2 Data Structures, Constants & `settings.json` Schema

#### A. Bảng `CONSTANTS` & `ENUMS` (Python `src/core/constants.py` — Tuân thủ No Magic Numbers/Strings)

```python
from enum import Enum

class PostMediaType(str, Enum):
    IMAGE_GRID = "IMAGE_GRID"
    VERTICAL_VIDEO = "VERTICAL_VIDEO"
    AI_PROMO_GRAPHIC = "AI_PROMO_GRAPHIC"

class ApprovalStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SCHEDULED = "SCHEDULED"
    PUBLISHED = "PUBLISHED"
    FAILED = "FAILED"

class PublisherBackendType(str, Enum):
    GRAPH_API = "GRAPH_API"
    PLAYWRIGHT = "PLAYWRIGHT"
    MANUAL_EXPORT = "MANUAL_EXPORT"

class AspectRatioPreset(str, Enum):
    PORTRAIT_4_5 = "4:5"     # 1080x1350
    SQUARE_1_1 = "1:1"       # 1080x1080
    VERTICAL_9_16 = "9:16"   # 1080x1920

POSTER_CONSTANTS = {
    "VIDEO_TARGET_WIDTH": 1080,
    "VIDEO_TARGET_HEIGHT": 1920,
    "IMAGE_DEFAULT_WIDTH": 1080,
    "IMAGE_PORTRAIT_HEIGHT": 1350,
    "MIN_GRID_IMAGES": 1,
    "MAX_GRID_IMAGES": 4,
    "META_SCHEDULE_MIN_OFFSET_SECONDS": 10 * 60,          # 10 phút theo luật Meta Graph API
    "META_SCHEDULE_MAX_OFFSET_SECONDS": 30 * 24 * 3600,   # 30 ngày theo luật Meta Graph API
    "FFMPEG_EXECUTION_TIMEOUT_SECONDS": 120,
    "PLAYWRIGHT_NAVIGATION_TIMEOUT_MS": 30000,
    "MAX_PUBLISH_RETRY_ATTEMPTS": 3,
}
```

#### B. Core Data Models (`src/core/models.py` — Python Dataclasses / Pydantic Schemas)

```python
from dataclasses import dataclass, field
from typing import Dict, List, Optional

@dataclass
class BrandColors:
    primary: str = "#1F3A5F"
    accent: str = "#F4C2C2"

@dataclass
class BrandHashtags:
    local: List[str] = field(default_factory=list)
    brand: List[str] = field(default_factory=list)
    niche: List[str] = field(default_factory=list)

@dataclass
class BrandKit:
    salon_id: str
    salon_name: str
    city: str
    location_line: str
    voice: str
    colors: BrandColors
    logo_path: str
    hashtags: BrandHashtags
    cta_list: List[str]
    video_overlay_templates: List[str]
    preferred_aspect_ratio: str = "4:5"

@dataclass
class SalonPost:
    post_id: str
    salon_id: str
    media_type: PostMediaType
    raw_asset_paths: List[str]
    processed_media_path: str
    caption: str
    occasion_tag: Optional[str]
    approval_status: ApprovalStatus
    customer_consent_confirmed: bool
    is_ai_generated_graphic: bool
    ai_disclosure_label_enabled: bool
    scheduled_publish_timestamp: Optional[int]  # Unix epoch seconds
    publisher_backend: PublisherBackendType
    idempotency_key: str
    external_post_id: Optional[str] = None
    last_error_message: Optional[str] = None
    error_screenshot_path: Optional[str] = None
```

#### C. `settings.json` Schema (`src/config/settings.json` — Không lưu plaintext token)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "NailSalonAutoPosterSettings",
  "type": "object",
  "required": ["envKeys", "mediaPipeline", "publishingRules", "storage"],
  "properties": {
    "envKeys": {
      "type": "object",
      "properties": {
        "geminiApiKey": { "type": "string", "default": "GEMINI_API_KEY" },
        "metaAppIdKey": { "type": "string", "default": "META_APP_ID" },
        "metaAppSecretKey": { "type": "string", "default": "META_APP_SECRET" },
        "vaultMasterKey": { "type": "string", "default": "SALON_VAULT_MASTER_KEY" }
      }
    },
    "mediaPipeline": {
      "type": "object",
      "properties": {
        "defaultImageAspectRatio": { "type": "string", "enum": ["4:5", "1:1", "9:16"], "default": "4:5" },
        "videoWidth": { "type": "number", "default": 1080 },
        "videoHeight": { "type": "number", "default": 1920 },
        "ffmpegBinaryPath": { "type": "string", "default": "ffmpeg" },
        "ffmpegTimeoutSeconds": { "type": "number", "default": 120 },
        "allowAiFakeNailWorkPhotos": { "type": "boolean", "default": false }
      }
    },
    "publishingRules": {
      "type": "object",
      "properties": {
        "requireOwnerApprovalBeforePublish": { "type": "boolean", "default": true },
        "requireCustomerConsentCheckbox": { "type": "boolean", "default": true },
        "defaultPublisherBackend": { "type": "string", "enum": ["GRAPH_API", "PLAYWRIGHT", "MANUAL_EXPORT"], "default": "GRAPH_API" },
        "metaScheduleMinMinutes": { "type": "number", "default": 10 },
        "metaScheduleMaxDays": { "type": "number", "default": 30 },
        "maxRetryAttempts": { "type": "number", "default": 3 }
      }
    },
    "storage": {
      "type": "object",
      "properties": {
        "databaseFilePath": { "type": "string", "default": "data/salon_poster.sqlite3" },
        "brandKitsDir": { "type": "string", "default": "data/brand_kits" },
        "outputMediaDir": { "type": "string", "default": "data/processed_media" },
        "errorScreenshotsDir": { "type": "string", "default": "data/error_screenshots" }
      }
    }
  }
}
```

### 2.3 Kiến Trúc Service & Helper (Tuân thủ Rule 4 & Single Responsibility Principle)

| Tên File | Role (Service / Helper) | Chữ ký hàm chính (Method Signatures) | Mục đích (Docstring tóm tắt) |
| :--- | :--- | :--- | :--- |
| `src/services/brand_kit_service.py` | **Service** | `load_brand_kit(salon_id: str) -> BrandKit`<br>`save_brand_kit(brand_kit: BrandKit) -> None` | Quản lý đọc/ghi cấu hình Brand Kit của từng tiệm nail. |
| `src/services/brand_kit_service_helper.py` | **Helper** | `validate_brand_kit_dict(data: dict) -> BrandKit`<br>`assemble_three_block_caption(hook_text: str, cta_text: str, brand_kit: BrandKit, extra_hashtags: list[str] = None) -> str` | Kiểm tra tính hợp lệ của Brand Kit JSON và ghép nối chuẩn 3 khối Caption (Hook/CTA -> `📍Location` -> `#Hashtags`). |
| `src/services/media_engine_service.py` | **Service** | `render_styled_image_grid(image_paths: list[str], brand_kit: BrandKit, output_path: str) -> str`<br>`render_vertical_video_ffmpeg(raw_video_path: str, overlay_text: str, brand_kit: BrandKit, output_path: str, audio_path: str = None) -> str` | Xử lý ghép lưới ảnh bằng Pillow và chạy tiến trình FFmpeg xuất video dọc `1080x1920`. |
| `src/services/media_engine_service_helper.py` | **Helper** | `calculate_grid_cell_boxes(num_images: int, canvas_width: int, canvas_height: int, padding: int = 12) -> list[tuple[int, int, int, int]]`<br>`build_ffmpeg_vertical_command(input_video: str, output_video: str, overlay_text: str, logo_path: str, audio_path: str = None) -> list[str]` | Tính tọa độ các ô lưới cho 1–4 ảnh và sinh mảng tham số dòng lệnh FFmpeg an toàn (không nối chuỗi shell tránh Command Injection). |
| `src/services/approval_and_scheduler_service.py` | **Service** | `approve_post(post: SalonPost, updated_caption: str = None, consent_confirmed: bool = False) -> SalonPost`<br>`schedule_post(post: SalonPost, publish_timestamp: int, current_timestamp: int) -> SalonPost` | Quản lý hàng chờ duyệt của chủ tiệm, kiểm tra điều kiện an toàn pháp lý và lên lịch đăng. |
| `src/services/publisher_service.py` | **Service** | `publish_or_schedule_post(post: SalonPost, access_token: str = None) -> SalonPost` | Thực thi đăng bài qua `GraphApiPublisher` hoặc `PlaywrightPublisher` với cơ chế Idempotency và chụp ảnh màn hình khi lỗi. |
| `src/services/publisher_service_helper.py` | **Helper** | `validate_meta_schedule_window(scheduled_ts: int, now_ts: int) -> tuple[bool, str]`<br>`build_graph_api_feed_payload(post: SalonPost, page_access_token: str) -> dict` | Kiểm tra ràng buộc thời gian lên lịch của Meta Graph API (`10 phút <= offset <= 30 ngày`) và tạo payload chuẩn. |

### 2.4 Ma Trận 5 Trạng Thái UX (5-State UX Matrix)

| Màn hình / Luồng | 1. Ideal State (Hoạt động chuẩn) | 2. Loading State (Đang xử lý) | 3. Empty State (Chưa có dữ liệu) | 4. Error State (Lỗi kết nối / Nghiệp vụ) | 5. Partial / Overflow State (Quá tải / Một phần) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Màn hình Tạo Bài & Áp Style (`Media Engine`)** | Thả 1–4 ảnh hoặc 1 video phôi -> Hiển thị bản xem trước lưới ảnh có logo góc dưới hoặc video dọc `9:16` có chữ overlay `"Find your next nail inspo ✨"` kèm caption 3 khối. | Thanh tiến trình hiển thị rõ bước đang chạy: `"Đang ghép lưới ảnh bằng Pillow..."` hoặc `"Đang render video 9:16 bằng FFmpeg..."`. | `"Thả 1–4 ảnh thật của tiệm hoặc 1 video phôi vào đây để tạo bài đăng theo Brand Kit."` | Khi FFmpeg chưa được cài đặt hoặc file video bị hỏng: Hiện thông báo lỗi kèm hướng dẫn kiểm tra `ffmpeg` và giữ nguyên file gốc. | Khi người dùng thả `> 4` ảnh cùng lúc (VD: 7 ảnh): Hệ thống tự động lấy 4 ảnh đầu tiên cho Bài 1 và gợi ý tách 3 ảnh còn lại thành Bài nháp thứ 2. |
| **Hàng Chờ Duyệt của Chủ Tiệm (`Approval Queue`)** | Hiển thị danh sách bài `PENDING_APPROVAL`, khung sửa nhanh caption, checkbox `"Đã có sự đồng ý của khách trong ảnh/video"` và nút xanh **[Duyệt & Lên Lịch (Approve)]**. | Khoá nút `Approve` trong lúc đang lưu trạng thái và kiểm tra lịch. | `"Hàng chờ duyệt trống! Tất cả bài nháp đã được xử lý."` | Nếu chủ tiệm bấm `Approve` khi chưa tích chọn `customer_consent_confirmed`: Cảnh báo đỏ `"Bắt buộc xác nhận sự đồng ý của khách hàng trước khi duyệt đăng!"` | Khi caption sửa tay chứa thông tin nhạy cảm hoặc quá dài: Tự động hiển thị vị trí ngắt `"See more"` của Facebook để chủ tiệm biết phần mở đầu hiển thị ra sao. |
| **Màn hình Lịch & Nhật ký Đăng (`Schedule & Publish Log`)** | Hiển thị lịch đăng theo từng tiệm; bài đã đăng có trạng thái `PUBLISHED` kèm đường dẫn trực tiếp tới bài trên Facebook Page. | Trạng thái `"Đang gửi lên Facebook Graph API / Playwright..."`. | `"Chưa có lịch sử đăng bài cho tiệm này."` | Khi Playwright gặp checkpoint/2FA hoặc Graph API hết hạn token: Hiện trạng thái `FAILED`, đính kèm ảnh chụp màn hình lỗi (`error_screenshot_path`) và nút **[Đăng lại (Retry)]**. | Khi quản lý cùng lúc `> 5` tiệm nail: Cho phép lọc theo từng tiệm (`Salon Filter`) và chỉ hiển thị riêng các bài bị lỗi cần xử lý gấp. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

| # | Lỗ hổng / Rủi ro thực tế (Vulnerability / Edge Risk) | Tác động nếu không chặn | Quy tắc Khóa Chặn Cụ Thể Trong Code (Technical Guardrail) |
| :--- | :--- | :--- | :--- |
| **1** | **Tự động đăng bài chưa qua chủ tiệm duyệt hoặc thiếu xác nhận đồng ý hình ảnh khách hàng** (`Legal & Brand Reputation Risk`) | AI sinh caption hứa hẹn giảm giá sai sự thật hoặc đăng ảnh lộ mặt/hình xăm của khách chưa xin phép gây khiếu nại pháp lý cho tiệm. | Trong `PublisherService.publish_or_schedule_post()`:<br>1. Bắt buộc kiểm tra `post.approval_status == ApprovalStatus.APPROVED`. Nếu còn ở `DRAFT` hoặc `PENDING_APPROVAL`, ném lỗi `UnapprovedPostPublishError`.<br>2. Bắt buộc kiểm tra `post.customer_consent_confirmed is True`.<br>3. Nếu `post.is_ai_generated_graphic is True`, bắt buộc `post.ai_disclosure_label_enabled is True` (Mục 4.1 & 8.3). |
| **2** | **Lỗi từ chối lịch đăng từ Facebook Graph API do nằm ngoài khoảng 10 phút – 30 ngày** (`Meta API Boundary Rejection`) | Meta Graph API yêu cầu `scheduled_publish_time` với `published=false` phải cách thời điểm hiện tại tối thiểu **10 phút** và tối đa **30 ngày** (Mục 5). Gửi lệch 1 giây cũng bị lỗi HTTP 400. | Trong `publisher_service_helper.validate_meta_schedule_window(scheduled_ts, now_ts)`: Kiểm tra cứng `600 <= (scheduled_ts - now_ts) <= 2592000`. Nếu nhỏ hơn 10 phút hoặc lớn hơn 30 ngày, trả về lỗi rõ ràng ngay từ bước lên lịch trước khi gọi mạng. |
| **3** | **Lỗ hổng Command Injection khi truyền chữ Overlay (`video_overlay_templates`) vào câu lệnh FFmpeg** (`Security Vulnerability`) | Nếu chủ tiệm nhập chữ overlay có dấu nháy đơn, chấm phẩy hoặc ký tự shell đặc biệt (`"Nail's Special; rm -rf"`), dùng `os.system()` hoặc `subprocess.run(..., shell=True)` sẽ thực thi lệnh độc hại hoặc làm vỡ filter `drawtext` của FFmpeg. | Trong `media_engine_service_helper.build_ffmpeg_vertical_command()`:<br>1. Tuyệt đối truyền lệnh dưới dạng danh sách tham số `list[str]` vào `subprocess.run(cmd, shell=False, timeout=120)`.<br>2. Escape toàn bộ ký tự đặc biệt (`:`, `'`, `\`) trong chuỗi `drawtext` của FFmpeg. |
| **4** | **Treo tiến trình hoặc khóa tài khoản Facebook khi dùng Playwright cho nhiều tiệm** (`Session Collision & Account Ban`) | Dùng chung 1 thư mục browser profile cho nhiều tiệm hoặc khi Facebook đổi DOM làm Playwright treo vô tận. | 1. Tách biệt thư mục `user_data_dir` theo từng `salon_id`.<br>2. Đặt timeout cứng `30000ms` cho mọi thao tác Playwright; khi bắt được `TimeoutError`, tự động gọi `page.screenshot(path=error_screenshot_path)` và ghi vào `PublishLog` để gỡ lỗi nhanh (Mục 8.7). |
| **5** | **AI tự bịa đặt chương trình khuyến mãi ("50% OFF today") không có trong Brand Kit** (`Hallucinated Claims` — Mục 8.6) | Khách tới tiệm đòi giảm giá như bài đăng trên Page làm tiệm thiệt hại. | Trong `CaptionGeneratorService`: Thiết lập bộ lọc hậu kiểm (`contains_unauthorized_price_or_discount_claim(caption, brand_kit)`): Nếu caption sinh ra chứa ký hiệu `% off`, `$`, `free` mà không nằm trong `cta_list` được phê duyệt của Brand Kit, hệ thống tự động loại bỏ câu đó hoặc gắn cờ cảnh báo đỏ trên màn hình duyệt. |

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1 Kịch Bản Kiểm Thử 3 Tầng (`Given / When / Then`)

#### Tầng 1: P0 Happy Paths (Người dùng hay xài nhất)
- **TC-P0-01 (Ghép Caption 3 khối chuẩn theo Brand Kit của tiệm Nail):**
  - *Given:* Brand Kit của tiệm `"H&H Nails and Lash"` tại `"Livonia, MI"`, `location_line = "📍H&H Nails and Lash | Livonia"`, hashtags `local=["#LivoniaNails"]`, `brand=["#HHNails"]`, `niche=["#NailInspo"]`.
  - *When:* Gọi `assemble_three_block_caption(hook_text="Spooky season nails are here 🎃", cta_text="Book your spot today", brand_kit=kit)`.
  - *Then:* Chuỗi trả về có đúng 3 khối tách biệt bằng dòng trống: Khối 1 chứa câu mở đầu + CTA, Khối 2 là `"📍H&H Nails and Lash | Livonia"`, Khối 3 là `"#LivoniaNails #HHNails #NailInspo"`.
- **TC-P0-02 (Tính toán bố cục lưới ảnh 1–4 ảnh và tạo lệnh FFmpeg video dọc `1080x1920`):**
  - *Given:* Đầu vào gồm 3 ảnh thật cho bài lưới ảnh, và 1 video phôi cùng chữ overlay `"Find your next nail inspo ✨"`.
  - *When:* Gọi `calculate_grid_cell_boxes(3, 1080, 1350)` và `build_ffmpeg_vertical_command()`.
  - *Then:* Hàm tính lưới trả về đúng 3 khung tọa độ `(x1, y1, x2, y2)` nằm trọn trong khung `1080x1350` không chồng lấn; hàm FFmpeg trả về mảng `list[str]` có filter `scale`/`pad` `1080:1920` và `drawtext` hợp lệ.
- **TC-P0-03 (Luồng Duyệt bài & Lên lịch đăng qua Graph API hợp lệ):**
  - *Given:* Bài đăng ở trạng thái `PENDING_APPROVAL`, chủ tiệm tích chọn `consent_confirmed=True`, duyệt bài và đặt lịch đăng sau `2 giờ` (`7200 giây`) kể từ hiện tại.
  - *When:* Gọi `approve_post()` -> `schedule_post()` -> `publish_or_schedule_post()`.
  - *Then:* Bài đăng chuyển sang `SCHEDULED`, payload gửi lên Graph API có `published=False` và `scheduled_publish_time = now + 7200`.

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-NEG-01 (Chặn đăng bài khi chưa được chủ tiệm duyệt hoặc chưa tích xác nhận đồng ý của khách):**
  - *Given:* Bài đăng đang ở trạng thái `PENDING_APPROVAL` hoặc có `customer_consent_confirmed = False`.
  - *When:* Gọi `publish_or_schedule_post(post)`.
  - *Then:* Hệ thống ném ngoại lệ `PermissionError` / `ValueError` (`"Post must be APPROVED and have customer consent confirmed before publishing"`) và tuyệt đối không gọi Publisher.
- **TC-NEG-02 (Chặn đồ họa quảng cáo AI nếu không bật nhãn AI disclosure):**
  - *Given:* Bài đăng có `is_ai_generated_graphic = True` nhưng `ai_disclosure_label_enabled = False`.
  - *When:* Gọi `approve_post()`.
  - *Then:* Hệ thống từ chối phê duyệt cho đến khi `ai_disclosure_label_enabled` được bật thành `True`.
- **TC-NEG-03 (Phát hiện và chặn Caption AI tự bịa đặt giảm giá `% OFF` ngoài Brand Kit):**
  - *Given:* Brand Kit không có bất kỳ CTA nào nhắc tới giảm giá, nhưng AI sinh câu `"Get 50% OFF all full sets today!"`.
  - *When:* Qua bộ kiểm tra `contains_unauthorized_price_or_discount_claim()`.
  - *Then:* Hàm trả về `True` (phát hiện claim giá/khuyến mãi trái phép) để chặn tự động thông qua.

#### Tầng 3: Boundary & Rare Edge Cases (0, -1, MAX, Empty, Duplicate, Concurrent)
- **TC-BND-01 (Biên thời gian lên lịch Meta Graph API: `9 phút 59 giây`, đúng `10 phút`, đúng `30 ngày`, và `30 ngày + 1 giây`):**
  - *Given:* Thời điểm hiện tại là `now_ts = 1700000000`.
  - *When:* Kiểm tra `validate_meta_schedule_window(scheduled_ts, now_ts)` với 4 mốc lệch: `+599s`, `+600s`, `+2592000s` (30 ngày), và `+2592001s`.
  - *Then:* `+599s` trả về `False` (quá gần); `+600s` trả về `True`; `+2592000s` trả về `True`; `+2592001s` trả về `False` (vượt quá 30 ngày).
- **TC-BND-02 (Biên số lượng ảnh đưa vào lưới: `0` ảnh, `1` ảnh, `4` ảnh, và `5` ảnh):**
  - *Given:* Danh sách đường dẫn ảnh đầu vào có độ dài `0`, `1`, `4`, và `5`.
  - *When:* Gọi `calculate_grid_cell_boxes(num_images, 1080, 1350)`.
  - *Then:* `0` ảnh hoặc `-1` ảnh hoặc `5` ảnh bị từ chối với `ValueError`; `1` ảnh đến `4` ảnh trả về đúng số khung hình tương ứng.
- **TC-BND-03 (Escape ký tự đặc biệt trong chữ Overlay của FFmpeg):**
  - *Given:* Chữ overlay có chứa dấu nháy đơn và dấu hai chấm: `"H&H's Fall Special: Book Now!"`.
  - *When:* Gọi `build_ffmpeg_vertical_command()`.
  - *Then:* Chuỗi `drawtext` được escape an toàn, không tách vỡ tham số và `shell=False` được đảm bảo.

### 4.2 Quy Trình 5 Bước Kiểm Chứng Bề Mặt Thật Cho QA Reviewer

1. **Step 1 — Launch (Kiểm tra Môi trường Python & Cấu trúc Dự án):**
   - Kiểm tra phiên bản Python (`python --version`) và thư mục `d:\Workspace\personal-tools\idea\facebook-auto-poster`.
2. **Step 2 — Doctor (Kiểm tra `settings.json` & Phụ thuộc):**
   - Xác nhận file `src/config/settings.json` hợp lệ, không chứa token plaintext, và các module trong `src/` import thành công không lỗi.
3. **Step 3 — Drive (Chạy Bộ Kiểm Thử Tự Động 3 Tầng bằng `pytest` / `unittest`):**
   - Thực thi lệnh: `python -m unittest discover -s tests -v` (hoặc `pytest`) kiểm tra toàn bộ các luồng: Brand Kit validation, ghép 3 khối caption, tính tọa độ lưới 1–4 ảnh, sinh lệnh FFmpeg video dọc 9:16, chốt chặn Hàng chờ duyệt (`consent` + `AI label`), kiểm tra biên thời gian Meta Graph API (`10m` – `30d`), và chống đăng trùng.
4. **Step 4 — Evidence (Thu thập Bằng chứng QA):**
   - Lưu log kết quả chạy test pass 100%, mẫu JSON Brand Kit và mẫu payload Graph API / lệnh FFmpeg đã kiểm chứng.
5. **Step 5 — Cleanup (Dọn dẹp sau kiểm thử):**
   - Xóa các file ảnh/database SQLite tạm trong thư mục test, đảm bảo `git status` sạch sẽ.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role phụ trách | File mục tiêu | Mô tả chi tiết hàm cần viết | Phụ thuộc | Lệnh Verify & Tiêu chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `idea/facebook-auto-poster/src/config/settings.json` & `src/core/constants.py` & `src/core/models.py` | Tạo cấu hình `settings.json`, bảng hằng số `POSTER_CONSTANTS`, các Enum và Dataclasses (`BrandKit`, `SalonPost`, `ApprovalStatus`, `PublisherBackendType`). | *None* | `python -c "import src.core.models"` chạy thành công không lỗi. |
| `TASK-002` | **Developer** | `idea/facebook-auto-poster/src/services/brand_kit_service_helper.py` & `brand_kit_service.py` | Viết `validate_brand_kit_dict()`, `assemble_three_block_caption()`, `contains_unauthorized_price_or_discount_claim()`, `load_brand_kit()`, `save_brand_kit()`. | **Hard:** `TASK-001` | Đầy đủ docstring chuẩn cho mọi hàm, không có magic numbers. |
| `TASK-003` | **Test Engineer** | `idea/facebook-auto-poster/tests/test_brand_kit_service.py` | Viết Unit Test 3 tầng kiểm thử: nạp Brand Kit mẫu H&H Nails, ghép chuẩn 3 khối caption, và chặn caption AI tự bịa đặt giảm giá `% OFF`. | **Hard:** `TASK-002` | `python -m unittest tests/test_brand_kit_service.py -v` xanh 100%. |
| `TASK-004` | **Developer** | `idea/facebook-auto-poster/src/services/media_engine_service_helper.py` & `media_engine_service.py` | Viết `calculate_grid_cell_boxes()` (1–4 ảnh), `build_ffmpeg_vertical_command()` (video dọc `1080x1920`, escape `drawtext`, `shell=False`), `render_styled_image_grid()`, `render_vertical_video_ffmpeg()`. | **Hard:** `TASK-001` | Kiểm tra biên chặt chẽ (`1 <= num_images <= 4`), chống Command Injection. |
| `TASK-005` | **Test Engineer** | `idea/facebook-auto-poster/tests/test_media_engine.py` | Viết Unit Test kiểm thử tính tọa độ lưới cho `1, 2, 3, 4` ảnh, chặn `0` ảnh và `5` ảnh, và kiểm tra mảng lệnh FFmpeg với chuỗi overlay chứa ký tự đặc biệt. | **Hard:** `TASK-004` | `python -m unittest tests/test_media_engine.py -v` xanh 100%. |
| `TASK-006` | **Developer** | `idea/facebook-auto-poster/src/services/approval_and_scheduler_service.py` | Viết `approve_post()` (bắt buộc `customer_consent_confirmed=True` và `ai_disclosure_label_enabled=True` nếu là ảnh AI) và `schedule_post()`. | **Hard:** `TASK-001` | Chặn tuyệt đối mọi bài đăng thiếu consent hoặc chưa duyệt. |
| `TASK-007` | **Developer** | `idea/facebook-auto-poster/src/services/publisher_service_helper.py` & `publisher_service.py` | Viết `validate_meta_schedule_window()` (kiểm tra biên `10 phút` đến `30 ngày`), `build_graph_api_feed_payload()`, và `publish_or_schedule_post()` hỗ trợ cả `GRAPH_API` và `PLAYWRIGHT` kèm khóa `idempotency_key`. | **Hard:** `TASK-006` | Đảm bảo bài chưa `APPROVED` không bao giờ được đẩy đi đăng. |
| `TASK-008` | **Test Engineer** | `idea/facebook-auto-poster/tests/test_approval_and_publisher.py` | Viết Unit & Integration Test 3 tầng kiểm thử: luồng duyệt bài + lên lịch hợp lệ, chặn đăng khi chưa duyệt/thiếu consent/thiếu nhãn AI, và kiểm tra biên `599s`, `600s`, `30d`, `30d+1s` của Meta Graph API. | **Hard:** `TASK-007` | `python -m unittest discover -s tests -v` chạy toàn bộ test suite đạt 100% pass. |
