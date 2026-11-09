# Tài Liệu Đặc Tả Thực Thi (Dev-Ready & Test-Ready): Find Job Tool (`find-job-tool`)

> **Phiên bản:** 1.0.0  
> **Đơn vị lập đặc tả:** AISE Squad 2 (`intake` + `ba` + `requirement_challenger` + `orchestrator` + `estimator_cost_controller`)  
> **Nguồn dữ liệu gốc:** `idea/find-job-tool/find-job-tool.md`, `idea/find-job-tool/requirement.md`  
> **Mục tiêu hệ thống:** Công cụ tự động săn việc làm trên Craigslist và ZipRecruiter (hỗ trợ mở rộng RSS/Public Job Feeds), phân loại thông minh theo **2 nhóm công việc chính** và **8 danh mục chuyên ngành (Taxonomy)** (Cleaning, Move-in/Move-out, Food/Beverage Route Sales, Real Estate Sales, Insurance Sales, Automotive Sales, Telecom/Wifi Sales, B2B/Retail Tech Sales), chấm điểm độ khớp, khử trùng lặp và gửi thông báo tức thời qua Telegram Chat hoặc Email (VD: `trunglvleo@gmail.com`).

---

## PHẦN 1 — INTAKE & PHÂN LOẠI (`intake`)

### 1.1 Bảng Phân Tách Yêu Cầu (`Stated Facts` / `Explicit Assumptions` / `Clarification Questions`)

| Phân loại | Mã tham chiếu | Nội dung chi tiết | Nguồn / Lý do kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-001` | Kiểm tra tin tuyển dụng trên **Craigslist** và **ZipRecruiter**. Nếu thấy công việc thỏa mãn điều kiện thì thông báo vào **Telegram Chat** hoặc gửi **Email** (ví dụ: `trunglvleo@gmail.com`). | `find-job-tool.md` (L1-4) |
| **Stated Fact** | `SF-002` | **Nhóm 1 — Công việc cố định, ngắn hạn (`SHORT_TERM_FIXED`):**<br>- **1.1 Công việc dọn dẹp (`CLEANING_DOMESTIC`):** House cleaning, Home cleaning, Housekeeper, Housekeeping, Maid service, Maid, Residential cleaner, Deep clean, Deep cleaning.<br>- **1.2 Chuyển nhà / Trả phòng kiếm tiền nhanh (`MOVE_IN_OUT_CLEANING`):** Move out cleaning, Move in cleaning. | `find-job-tool.md` (L6-19) |
| **Stated Fact** | `SF-003` | **Nhóm 1.3 đến 1.8 & Nhóm 2 — Công việc Sales / Dài hạn dựa vào hoa hồng (`LONG_TERM_COMMISSION`):**<br>- **1.3 Food/Beverage & Route Sales:** Route Sales Representative, Merchandiser, Sales Merchandiser, Outside Sales Representative (Food/Beverage), Territory Sales Manager, Beverage Sales, Snack Food Sales, Grocery Sales Representative, Wholesale Food Sales, Food Distributor Sales.<br>- **1.4 Real Estate Sales:** Real Estate Sales Agent, New Home Sales Consultant, Leasing Consultant, Leasing Agent, Commercial Real Estate Agent.<br>- **1.5 Insurance Sales:** Insurance Account Manager, Life Insurance Producer, Health Insurance Agent, Property and Casualty Sales Representative, Insurance Sales Agent.<br>- **1.6 Automotive Sales:** Internet Sales Manager, BDC Representative, Dealership Sales Associate, Automotive Sales Consultant, Car Sales Representative, Commercial Truck Sales Representative.<br>- **1.7 Telecom / Wifi Sales:** In-Home Sales Representative, Account Executive - Small Business (Telecom), Retail Sales Consultant (Telecom), Wireless Retail Sales Associate.<br>- **1.8 Tech / Electronics Sales:** B2B Hardware Sales Representative, Retail Sales Associate - Electronics, Computer Sales Consultant, Technology Sales Associate. | `find-job-tool.md` (L20-69) |
| **Stated Fact** | `SF-004` | File `idea/find-job-tool/requirement.md` hiện đang trống (0 byte); toàn bộ nội dung nghiệp vụ nằm tại `find-job-tool.md`. | `requirement.md` (L1) |
| **Explicit Assumption** | `EA-001` | **Cơ chế thu thập dữ liệu tuân thủ Anti-Bot:** Craigslist và ZipRecruiter có cơ chế bảo vệ chống bot nếu cào HTML ồ ạt. Hệ thống ưu tiên sử dụng: (1) **Craigslist RSS/Search XML/HTML công khai** với tần suất lịch sự (`Rate Limit` + `User-Agent` chuẩn), (2) **ZipRecruiter Official Partner/Job Feed / RSS / Email Alert Parser**, và (3) Cho phép người dùng cấu hình danh sách khu vực (`locations`, VD: `detroit`, `annarbor`, `losangeles`) trong `settings.json`. | Đảm bảo chạy ổn định 24/7 mà không vi phạm quy định vượt CAPTCHA. |
| **Explicit Assumption** | `EA-002` | **Bộ lọc từ khóa phủ định (`Negative Keywords`) & Chống tin rác/đa cấp (MLM Scam Filter):** Trên Craigslist và ZipRecruiter có rất nhiều tin tuyển dụng giả mạo hoặc yêu cầu đóng phí trước. Hệ thống tự động loại bỏ hoặc gắn cờ cảnh báo cho các tin chứa từ khóa lừa đảo (`"pay training fee"`, `"buy starter kit"`, `"crypto investment"`) và phân biệt rõ `"Housekeeper"` với `"Software Data Cleaning"`. | Tránh làm phiền người dùng bằng các thông báo sai ngành nghề. |
| **Clarification Question** | `CQ-001` | **Câu hỏi:** Người dùng muốn nhận thông báo ngay lập tức cho từng công việc lẻ (`INSTANT_PER_JOB`) hay gom thành bản tin tổng hợp mỗi lần quét (`BATCH_DIGEST`)?<br>- **Option A (Khuyến nghị):** Mặc định gom thành **Smart Digest theo từng đợt quét** (tối đa 10 jobs/tin nhắn Telegram và 1 email tổng hợp đẹp mắt mỗi chu kỳ 15–30 phút) để không làm cháy quota SMTP/Telegram.<br>- **Option B:** Gửi 1 email riêng cho từng job tìm thấy. | Khuyến nghị **Option A** (có thể bật/tắt qua `notificationMode` trong `settings.json`). |

### 1.2 Nhãn Bảo Mật, Tuân Thủ & Rủi Ro (`Security & Compliance Tags`)

- **[COMPLIANCE-ANTI-BOT]:** Không sử dụng công cụ giải CAPTCHA hay vượt Cloudflare Turnstile trên ZipRecruiter/Craigslist. Khi gặp HTTP `403`/`429` hoặc trang CAPTCHA, adapter phải dừng ngay chu kỳ quét hiện tại cho nguồn đó, kích hoạt `Exponential Backoff` và hỗ trợ `browser_handoff` hoặc đọc từ nguồn RSS/API hợp lệ.
- **[SECURITY-SECRETS]:** Địa chỉ email nhận thông báo (`trunglvleo@gmail.com` làm mặc định trong ví dụ cấu hình), `SMTP_APP_PASSWORD`, và `TELEGRAM_BOT_TOKEN` phải nằm hoàn toàn trong `settings.json`.

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1 Bảng Yêu Cầu Nghiệp Vụ Có Mã Truy Vết (`REQ-001` .. `REQ-010`)

| Mã REQ | Tên Yêu Cầu | Mô tả nghiệp vụ chi tiết | Truy vết nguồn | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | **8-Category Job Taxonomy Dictionary** | Quản lý bộ từ điển chuẩn hóa cho 2 nhóm công việc (`SHORT_TERM_FIXED`, `LONG_TERM_COMMISSION`) và 8 danh mục con (`1.1` đến `1.8`) với đầy đủ 36+ cụm từ khóa gốc từ tài liệu yêu cầu. | `find-job-tool.md` L6-69 | `P0 Must-Have` |
| `REQ-002` | **Craigslist Job & Gig Scraper Service** | Quét tin tuyển dụng và việc làm ngắn hạn (`jobs` + `gigs/domestic`) trên Craigslist theo danh sách khu vực cấu hình, bóc tách Tiêu đề, URL, Khu vực, Mức lương/Hoa hồng (nếu có), và Thời gian đăng. | `find-job-tool.md` L1, L8-19 | `P0 Must-Have` |
| `REQ-003` | **ZipRecruiter Job Feed Service** | Quét và chuẩn hóa tin tuyển dụng từ ZipRecruiter theo từ khóa danh mục và khu vực, xử lý an toàn khi gặp giới hạn tốc độ hoặc trang chặn. | `find-job-tool.md` L1, L20-66 | `P0 Must-Have` |
| `REQ-004` | **Smart Keyword & Context Matcher** | Đối chiếu tiêu đề và mô tả công việc với bộ từ điển 8 danh mục (hỗ trợ khớp cụm từ chính xác, từ đồng nghĩa và loại trừ `Negative Keywords` như `"data cleaning"`), tính điểm `matchScore` và phân loại vào đúng danh mục `1.1`..`1.8`. | `find-job-tool.md` L3-69 | `P0 Must-Have` |
| `REQ-005` | **Cross-Platform Job Deduplication** | Khử trùng lặp tin tuyển dụng dựa trên URL chuẩn hóa và chữ ký nội dung (`normalize(title + company + location)`) để một công việc đăng ở cả Craigslist lẫn ZipRecruiter (hoặc đăng lại nhiều lần) chỉ thông báo 1 lần. | Yêu cầu kỹ thuật cốt lõi | `P0 Must-Have` |
| `REQ-006` | **Telegram Notification Dispatcher** | Gửi thông báo công việc mới khớp điều kiện vào Telegram Chat với định dạng Markdown rõ ràng: Nhóm việc, Danh mục (VD: `[1.2 Move-in/Move-out Cleaning]`), Tiêu đề, Khu vực, Mức lương, Từ khóa khớp và Link ứng tuyển. | `find-job-tool.md` L3 | `P0 Must-Have` |
| `REQ-007` | **Email Notification Dispatcher** | Gửi email tổng hợp hoặc tức thời về địa chỉ người nhận cấu hình (VD: `trunglvleo@gmail.com`) qua giao thức SMTP với bảng HTML trực quan phân nhóm theo `Short-term` và `Commission Sales`. | `find-job-tool.md` L3-4 | `P0 Must-Have` |
| `REQ-008` | **Compensation & Commission Extractor** | Tự động nhận diện và bóc tách thông tin thu nhập từ tiêu đề/mô tả (`$25/hr`, `$150/day`, `Commission + Base`, `Weekly Pay`) để gắn nhãn loại hình (`SHORT_TERM_FIXED` vs `LONG_TERM_COMMISSION`). | `find-job-tool.md` L6, L16, L69 | `P1 Should-Have` |
| `REQ-009` | **Configurable User Category Subscription** | Cho phép người dùng bật/tắt từng danh mục trong `settings.json` (VD: chỉ bật `1.1 Cleaning`, `1.2 Move-out`, và `1.3 Food/Beverage Sales`, tắt `1.5 Insurance`). | Tối ưu trải nghiệm thực tế | `P1 Should-Have` |
| `REQ-010` | **Execution Health Log & CLI Summary Report** | Xuất báo cáo mỗi chu kỳ quét: tổng số tin quét được từ mỗi nguồn, số tin khớp theo từng danh mục `1.1`..`1.8`, số tin bị chặn trùng lặp và trạng thái gửi Telegram/Email. | Hỗ trợ vận hành & QA | `P2 Nice-to-Have` |

---

### 2.2 Data Structures, Constants & `settings.json` Schema (No Magic Numbers / Strings)

#### A. Bảng `CONSTANTS` & `ENUMS` (`src/constants/JobToolConstants.js`)

```javascript
export const JobDurationType = Object.freeze({
  SHORT_TERM_FIXED: "SHORT_TERM_FIXED",           // 1. Công việc cố định, ngắn hạn
  LONG_TERM_COMMISSION: "LONG_TERM_COMMISSION",   // 2. Công việc dài hạn, dựa vào hoa hồng
});

export const JobCategoryCode = Object.freeze({
  CLEANING_DOMESTIC: "1.1_CLEANING_DOMESTIC",
  MOVE_IN_OUT_CLEANING: "1.2_MOVE_IN_OUT_CLEANING",
  FOOD_BEVERAGE_ROUTE_SALES: "1.3_FOOD_BEVERAGE_ROUTE_SALES",
  REAL_ESTATE_SALES: "1.4_REAL_ESTATE_SALES",
  INSURANCE_SALES: "1.5_INSURANCE_SALES",
  AUTOMOTIVE_SALES: "1.6_AUTOMOTIVE_SALES",
  TELECOM_WIFI_SALES: "1.7_TELECOM_WIFI_SALES",
  TECH_ELECTRONICS_SALES: "1.8_TECH_ELECTRONICS_SALES",
});

export const JobSourcePlatform = Object.freeze({
  CRAIGSLIST: "CRAIGSLIST",
  ZIPRECRUITER: "ZIPRECRUITER",
});

export const JOB_TAXONOMY_DICTIONARY = Object.freeze({
  [JobCategoryCode.CLEANING_DOMESTIC]: {
    label: "Công việc dọn dẹp (Clean / Domestic Gigs)",
    durationType: JobDurationType.SHORT_TERM_FIXED,
    keywords: [
      "house cleaning", "home cleaning", "housekeeper", "housekeeping",
      "maid service", "maid", "residential cleaner", "deep clean", "deep cleaning"
    ],
    negativeKeywords: ["data cleaning", "code cleaning", "dry cleaning software"]
  },
  [JobCategoryCode.MOVE_IN_OUT_CLEANING]: {
    label: "Chuyển nhà / Trả phòng (Move-in / Move-out Cleaning)",
    durationType: JobDurationType.SHORT_TERM_FIXED,
    keywords: [
      "move out cleaning", "move-out cleaning", "move in cleaning", "move-in cleaning",
      "turnover cleaning", "apartment make ready"
    ],
    negativeKeywords: ["data migration"]
  },
  [JobCategoryCode.FOOD_BEVERAGE_ROUTE_SALES]: {
    label: "Sale Representative (Food / Beverage / Route)",
    durationType: JobDurationType.LONG_TERM_COMMISSION,
    keywords: [
      "route sales representative", "merchandiser", "sales merchandiser",
      "outside sales representative", "territory sales manager", "beverage sales",
      "snack food sales", "grocery sales representative", "wholesale food sales",
      "food distributor sales"
    ],
    negativeKeywords: []
  },
  [JobCategoryCode.REAL_ESTATE_SALES]: {
    label: "Sale Bất động sản (Real Estate)",
    durationType: JobDurationType.LONG_TERM_COMMISSION,
    keywords: [
      "real estate sales agent", "real estate agent", "new home sales consultant",
      "leasing consultant", "leasing agent", "commercial real estate agent"
    ],
    negativeKeywords: []
  },
  [JobCategoryCode.INSURANCE_SALES]: {
    label: "Sale Bảo hiểm (Insurance)",
    durationType: JobDurationType.LONG_TERM_COMMISSION,
    keywords: [
      "insurance account manager", "life insurance producer", "health insurance agent",
      "property and casualty sales representative", "insurance sales agent"
    ],
    negativeKeywords: []
  },
  [JobCategoryCode.AUTOMOTIVE_SALES]: {
    label: "Sale Xe hơi (Automotive)",
    durationType: JobDurationType.LONG_TERM_COMMISSION,
    keywords: [
      "internet sales manager", "bdc representative", "business development center",
      "dealership sales associate", "automotive sales consultant",
      "car sales representative", "commercial truck sales representative"
    ],
    negativeKeywords: []
  },
  [JobCategoryCode.TELECOM_WIFI_SALES]: {
    label: "Sale Wifi / Internet / Telecom",
    durationType: JobDurationType.LONG_TERM_COMMISSION,
    keywords: [
      "in-home sales representative", "account executive - small business",
      "retail sales consultant", "wireless retail sales associate", "telecom sales", "fiber internet sales"
    ],
    negativeKeywords: []
  },
  [JobCategoryCode.TECH_ELECTRONICS_SALES]: {
    label: "Sale Thiết bị Công nghệ (Tech / Electronics)",
    durationType: JobDurationType.LONG_TERM_COMMISSION,
    keywords: [
      "b2b hardware sales representative", "retail sales associate - electronics",
      "computer sales consultant", "technology sales associate"
    ],
    negativeKeywords: []
  }
});

export const JOB_TOOL_LIMITS = Object.freeze({
  MIN_MATCH_SCORE_THRESHOLD: 60,
  MAX_JOBS_PER_TELEGRAM_MESSAGE: 10,
  DEDUP_TTL_DAYS: 30,
  HTTP_REQUEST_TIMEOUT_MS: 10000,
});
```

#### B. Core Data Interfaces (`src/types/JobToolTypes.ts`)

```typescript
export interface NormalizedJobPosting {
  jobId: string;                     // Hash định danh duy nhất
  externalId: string;
  platform: "CRAIGSLIST" | "ZIPRECRUITER";
  title: string;
  companyName: string | null;
  location: string;
  url: string;
  descriptionSnippet: string;
  compensationText: string | null;   // VD: "$25/hr", "$80,000 + Commission"
  isCommissionBased: boolean;
  durationType: "SHORT_TERM_FIXED" | "LONG_TERM_COMMISSION";
  matchedCategories: string[];       // Danh sách mã JobCategoryCode khớp
  matchedKeywords: string[];         // Các cụm từ khóa cụ thể đã khớp
  matchScore: number;                // 0 - 100
  postedAtIso: string;
}

export interface JobScanExecutionReport {
  startedAtIso: string;
  completedAtIso: string;
  totalFetched: number;
  totalMatched: number;
  totalNewUnnotified: number;
  duplicatesSkipped: number;
  matchedByCategory: Record<string, number>;
  platformStatus: {
    CRAIGSLIST: "OK" | "PARTIAL" | "BLOCKED_HANDOFF" | "ERROR";
    ZIPRECRUITER: "OK" | "PARTIAL" | "BLOCKED_HANDOFF" | "ERROR";
  };
  notificationStatus: {
    telegramSent: boolean;
    emailSent: boolean;
  };
}
```

#### C. Schema cấu hình `settings.json`

```json
{
  "searchConfig": {
    "locations": ["detroit", "annarbor", "losangeles"],
    "enabledCategories": [
      "1.1_CLEANING_DOMESTIC",
      "1.2_MOVE_IN_OUT_CLEANING",
      "1.3_FOOD_BEVERAGE_ROUTE_SALES",
      "1.4_REAL_ESTATE_SALES",
      "1.5_INSURANCE_SALES",
      "1.6_AUTOMOTIVE_SALES",
      "1.7_TELECOM_WIFI_SALES",
      "1.8_TECH_ELECTRONICS_SALES"
    ],
    "scanIntervalMinutes": 30,
    "seenJobsCacheFilePath": "./data/seen_jobs_cache.json"
  },
  "platforms": {
    "craigslist": {
      "enabled": true,
      "sections": ["jjj", "ggg"],
      "requestTimeoutMs": 10000,
      "rateLimitDelayMs": 2000
    },
    "zipRecruiter": {
      "enabled": true,
      "feedBaseUrl": "https://www.ziprecruiter.com/jobs-search",
      "requestTimeoutMs": 10000,
      "rateLimitDelayMs": 2500
    }
  },
  "notifications": {
    "mode": "BATCH_DIGEST",
    "telegram": {
      "enabled": true,
      "botToken": "REPLACE_WITH_TELEGRAM_BOT_TOKEN",
      "chatId": "REPLACE_WITH_TELEGRAM_CHAT_ID"
    },
    "email": {
      "enabled": true,
      "recipientEmail": "trunglvleo@gmail.com",
      "smtpHost": "smtp.gmail.com",
      "smtpPort": 587,
      "smtpUser": "REPLACE_WITH_SMTP_USER",
      "smtpPass": "REPLACE_WITH_SMTP_APP_PASSWORD"
    }
  }
}
```

---

### 2.3 Kiến Trúc Service & Helper (Rule 4 & Single Responsibility Principle)

Đặt tên file và phân tách trách nhiệm tuân thủ đúng chuẩn ví dụ trong đề bài (`CraigslistService.js`, `CraigslistFindingJobServiceHelper.js`, `TelegramNotificationService.js`):

1. **`CraigslistService.js` & `CraigslistFindingJobServiceHelper.js`**
   - `CraigslistFindingJobServiceHelper.buildCraigslistSearchUrls(locationCode, queryKeywords, sections)`
     - *Mục đích:* Tạo danh sách URL tìm kiếm Craigslist chuẩn cho cả mục `jobs (jjj)` và `gigs (ggg)` (rất quan trọng vì việc `Move out cleaning` / `Domestic Gigs` thường nằm ở mục Gigs trên Craigslist).
   - `CraigslistFindingJobServiceHelper.parseCraigslistFeedItems(rawXmlOrHtml, locationCode)`
     - *Mục đích:* Bóc tách các bài đăng từ dữ liệu trả về của Craigslist thành danh sách thô.
   - `CraigslistService.fetchJobsByCriteria(searchConfig, platformConfig)`
     - *Mục đích:* Điều phối việc gọi mạng tới Craigslist với rate limit an toàn và trả về danh sách job đã bóc tách.

2. **`ZipRecruiterService.js` & `ZipRecruiterFindingJobServiceHelper.js`**
   - `ZipRecruiterFindingJobServiceHelper.parseZipRecruiterListings(rawContent, location)`
     - *Mục đích:* Bóc tách tiêu đề, công ty, mức lương, và link công việc từ feed ZipRecruiter; phát hiện nếu phản hồi bị chặn bởi anti-bot (`BLOCKED_HANDOFF`).
   - `ZipRecruiterService.fetchJobsByCriteria(searchConfig, platformConfig)`
     - *Mục đích:* Thực thi truy vấn tìm việc trên ZipRecruiter và chuẩn hóa kết quả.

3. **`JobClassificationService.js` & `JobClassificationServiceHelper.js`**
   - `JobClassificationServiceHelper.matchCategoriesAndKeywords(title, description, enabledCategories)`
     - *Mục đích:* So khớp văn bản công việc với 8 nhóm từ khóa trong `JOB_TAXONOMY_DICTIONARY` theo ranh giới từ (`word boundary \b`), loại bỏ các tin chứa `negativeKeywords` (VD: `"data cleaning"`).
   - `JobClassificationServiceHelper.extractCompensationInfo(title, description)`
     - *Mục đích:* Nhận diện mức lương (`$XX/hr`, `$XXX/day`) và từ khóa hoa hồng (`commission`, `uncapped bonus`) để phân định `SHORT_TERM_FIXED` hay `LONG_TERM_COMMISSION`.
   - `JobClassificationService.classifyAndFilterJobs(rawJobs, enabledCategories)`
     - *Mục đích:* Lọc và gắn nhãn đầy đủ các công việc đạt ngưỡng `MIN_MATCH_SCORE_THRESHOLD`.

4. **`JobDeduplicationService.js` & `JobDeduplicationServiceHelper.js`**
   - `JobDeduplicationServiceHelper.computeJobFingerprint(job)`
     - *Mục đích:* Tạo mã băm định danh dựa trên `canonicalUrl` và bộ ba `normalize(title) + normalize(companyName) + normalize(location)`.
   - `JobDeduplicationService.filterNewJobsAndPersist(matchedJobs, cacheFilePath)`
     - *Mục đích:* Lọc ra các công việc hoàn toàn mới chưa từng gửi thông báo và lưu vết vào cache có thời hạn `DEDUP_TTL_DAYS`.

5. **`TelegramNotificationService.js` & `EmailNotificationService.js` (cùng `*ServiceHelper.js`)**
   - `TelegramNotificationServiceHelper.formatJobDigestMessages(newJobs, maxJobsPerMessage)`
     - *Mục đích:* Chia nhỏ danh sách việc làm thành các bản tin Telegram Markdown không vượt quá giới hạn 4096 ký tự của Telegram.
   - `EmailNotificationServiceHelper.buildJobDigestHtmlEmail(newJobs, recipientEmail)`
     - *Mục đích:* Tạo nội dung email HTML chia rõ 2 phần: **1. Công việc cố định/ngắn hạn (Cleaning, Move-out)** và **2. Công việc Sales/Hoa hồng** gửi tới `trunglvleo@gmail.com`.

---

### 2.4 Ma Trận 5 Trạng Thái UX (`5 UX States Matrix`)

| Trạng thái | Điều kiện kích hoạt | Phản hồi trên Telegram / Email / CLI Dashboard | Hành động điều hướng (CTA) |
| :--- | :--- | :--- | :--- |
| **1. Ideal State** | Tìm thấy công việc mới khớp các danh mục `1.1`..`1.8` từ cả Craigslist & ZipRecruiter. | Gửi tin nhắn Telegram & Email được nhóm gọn gàng theo danh mục (VD: `🧹 [1.1 Cleaning] 3 jobs mới`, `📦 [1.3 Food/Beverage Sales] 2 jobs mới`) kèm mức lương, địa điểm và nút bấm mở link trực tiếp. | Bấm vào link để ứng tuyển ngay hoặc đánh dấu công việc đã xem. |
| **2. Loading State** | Đang quét tuần tự qua các khu vực và 8 nhóm ngành trên Craigslist & ZipRecruiter. | CLI / Status log hiển thị tiến trình: `[Scanning Craigslist: detroit (jjj/ggg)] -> [Scanning ZipRecruiter] -> [Matching 8 Taxonomy Categories]`. | Cho phép dừng an toàn bằng `Ctrl+C` (lưu trạng thái cache trước khi thoát). |
| **3. Empty State** | Chu kỳ quét hoàn tất nhưng không có công việc mới nào khớp tiêu chí (hoặc tất cả đều đã được thông báo ở chu kỳ trước). | **Chế độ Im lặng thông minh (Silent on Empty):** Không gửi tin nhắn rác `"Không có việc mới"` vào Telegram/Email để tránh làm phiền người dùng; chỉ ghi vào log hệ thống `0 new jobs matched`. | Có thể bật cờ `--send-heartbeat` nếu người dùng muốn nhận báo cáo tổng kết cuối ngày. |
| **4. Error State** | Lỗi cấu hình `settings.json`, sai SMTP password, hoặc cả 2 trang việc làm đều mất kết nối. | Hiển thị lỗi rõ ràng kèm hướng dẫn sửa (`ERR_SMTP_AUTH_FAILED` hoặc `ERR_TELEGRAM_INVALID_CHAT_ID`), giữ lại các công việc đã cào được trong hàng đợi chưa gửi (`pending_notifications.json`) để gửi bù ở lần chạy sau. | Chạy lệnh `doctor` kiểm tra kết nối Telegram/Email và gửi lại hàng đợi tồn đọng. |
| **5. Partial / Overflow State** | ZipRecruiter yêu cầu xác thực trình duyệt (`BLOCKED_HANDOFF`) nhưng Craigslist vẫn hoạt động tốt; hoặc tìm thấy cùng lúc 45 jobs mới. | Vẫn gửi thông báo bình thường cho toàn bộ jobs từ Craigslist kèm dòng ghi chú nhỏ ở cuối bản tin: `⚠ Nguồn ZipRecruiter tạm thời cần xác thực trình duyệt`; nếu có 45 jobs thì tự động chia thành các trang 10 jobs/tin nhắn Telegram để không bị lỗi `Message Too Long`. | Bấm link mở nhanh ZipRecruiter trên trình duyệt cá nhân nếu muốn xem thủ công. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

### 3.1 Lỗ hổng 1: Nhận diện nhầm từ khóa đa nghĩa (`False Positive Keyword Collisions` — VD: "Cleaning" & "Merchandiser")
- **Rủi ro thực tế:**
  - Từ khóa `"cleaning"` hoặc `"deep clean"` trong mục `1.1` nếu chỉ dùng `string.includes("clean")` sẽ khớp nhầm với *"Data Cleaning Engineer"*, *"Dry Cleaning Cashier"*, hoặc *"Clean Driving Record Required"* (yêu cầu bằng lái sạch của tài xế xe tải!).
  - Từ khóa `"maid"` nếu không kiểm tra ranh giới từ (`\bmaid\b`) sẽ khớp nhầm với từ *"hand**maid**en"* hoặc tên đường *"Mer**maid** Ave"*.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Trong `JobClassificationServiceHelper`:
    - Bắt buộc biên dịch mọi từ khóa thành biểu thức chính quy có ranh giới từ nguyên vẹn: `new RegExp("\\b" + escapeRegex(keyword) + "\\b", "i")`.
    - Kiểm tra danh sách loại trừ ngữ cảnh (`CONTEXT_EXCLUSION_PATTERNS`): loại bỏ cụm `"clean driving record"`, `"clean background check"`, `"data cleaning"`, `"clean room technician"` trước khi chấm điểm danh mục `1.1 Cleaning`.

### 3.2 Lỗ hổng 2: Bỏ sót mảng "Gigs" (Việc làm ngắn hạn trong ngày) trên Craigslist
- **Rủi ro thực tế:** Mục `1.1 Công việc dọn dẹp` và `1.2 Move out cleaning / Move in cleaning (Kiếm tiền nhanh)` trên Craigslist thực tế có tới **70% bài đăng nằm trong mục `Gigs -> Domestic / Labor (ggg)`** chứ không nằm trong mục `Jobs (jjj)` (vì chủ nhà cần người dọn gấp trả tiền mặt trong ngày). Nếu scraper chỉ tìm trong `/search/jjj` sẽ bỏ lỡ phần lớn các kèo kiếm tiền nhanh này.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Trong `CraigslistFindingJobServiceHelper.buildCraigslistSearchUrls`:
    - Đối với nhóm `SHORT_TERM_FIXED` (`1.1` và `1.2`), bắt buộc quét đồng thời cả 2 phân vùng `/search/jjj` (Jobs) và `/search/ggg` (Gigs).

### 3.3 Lỗ hổng 3: Tràn giới hạn độ dài tin nhắn Telegram (4096 ký tự) & Mất thông báo khi SMTP lỗi tạm thời
- **Rủi ro thực tế:** Khi chạy lần đầu tiên, công cụ có thể tìm thấy 30–50 công việc cùng lúc. Nếu nối tất cả vào 1 chuỗi và gọi API Telegram `sendMessage`, Telegram sẽ trả về lỗi `400 Bad Request: message is too long` (giới hạn 4096 ký tự) và người dùng không nhận được bất kỳ thông báo nào. Hơn nữa, nếu đánh dấu `seen` trước khi gửi thành công, toàn bộ 50 jobs đó sẽ bị mất vĩnh viễn.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Trong `TelegramNotificationServiceHelper`: Chia mảng jobs thành các lô tối đa `MAX_JOBS_PER_TELEGRAM_MESSAGE (10)` công việc (và kiểm tra độ dài chuỗi `< 3800` ký tự mỗi tin).
  - **Quy tắc Commit-After-Notify:** Chỉ ghi `jobId` vào file `seen_jobs_cache.json` **sau khi** ít nhất một kênh thông báo (Telegram hoặc Email) đã trả về xác nhận gửi thành công.

### 3.4 Lỗ hổng 4: Trùng lặp bài đăng chéo miền (`Cross-Subdomain & Repost Spam`) trên Craigslist/ZipRecruiter
- **Rủi ro thực tế:** Các công ty tuyển dụng Sales (bảo hiểm, bất động sản, xe hơi, telecom) thường đăng cùng 1 nội dung tuyển dụng lặp lại ở 5 khu vực lân cận hoặc xóa đi đăng lại với `postId` mới mỗi 48 giờ.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Trong `JobDeduplicationServiceHelper.computeJobFingerprint`:
    - Không chỉ dựa vào `postId` hay `url`, mà tạo thêm khóa `contentHash = sha256(normalizeText(title) + "|" + normalizeText(companyName || "") + "|" + categoryCode)`. Nếu `contentHash` đã xuất hiện trong vòng `DEDUP_TTL_DAYS (30 ngày)`, tự động chặn gửi thông báo lặp.

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1 Kịch Bản Kiểm Thử `Given / When / Then` (3 Tầng)

#### Tầng 1: P0 Happy Paths (Người dùng sử dụng thường xuyên nhất)
- **TC-JOB-001 (Phân loại chính xác đủ 8 danh mục công việc `1.1` .. `1.8`):**
  - **Given:** Tập dữ liệu 8 tin tuyển dụng mẫu tương ứng với 8 danh mục:
    1. `"Residential Cleaner / House Cleaning Needed - $200/day"`
    2. `"Move Out Cleaning Specialist Needed This Weekend"`
    3. `"Route Sales Representative - Beverage & Snack Food Distributor"`
    4. `"Leasing Consultant / Real Estate Sales Agent"`
    5. `"Property and Casualty Sales Representative - Insurance"`
    6. `"Automotive Sales Consultant / BDC Representative"`
    7. `"In-Home Sales Representative - Fiber Internet & Wireless"`
    8. `"B2B Hardware Sales Representative - Computer & Electronics"`
  - **When:** Gọi `JobClassificationService.classifyAndFilterJobs(sampleJobs, allCategories)`.
  - **Then:** Cả 8 tin tuyển dụng đều được nhận diện đúng 100% mã danh mục từ `1.1` đến `1.8`, trong đó `1.1` và `1.2` mang nhãn `SHORT_TERM_FIXED`, còn `1.3`..`1.8` mang nhãn `LONG_TERM_COMMISSION`.
- **TC-JOB-002 (Tạo URL quét Craigslist bao phủ cả Jobs `jjj` và Gigs `ggg`):**
  - **Given:** Cấu hình tìm kiếm tại khu vực `detroit` cho nhóm việc dọn dẹp và chuyển nhà (`1.1` và `1.2`).
  - **When:** Gọi `CraigslistFindingJobServiceHelper.buildCraigslistSearchUrls("detroit", keywords, ["jjj", "ggg"])`.
  - **Then:** Trả về danh sách URL hợp lệ bao gồm cả đường dẫn `/search/jjj` và `/search/ggg`.
- **TC-JOB-003 (Định dạng và gửi thông báo qua Telegram & Email `trunglvleo@gmail.com`):**
  - **Given:** 5 công việc mới chưa từng thông báo khớp điều kiện.
  - **When:** Gọi `TelegramNotificationService.sendJobAlerts` và `EmailNotificationService.sendJobAlerts`.
  - **Then:** Tin nhắn Telegram và nội dung HTML Email tới `trunglvleo@gmail.com` hiển thị đầy đủ Tiêu đề, Danh mục, Khu vực, Mức lương và Link ứng tuyển; sau khi gửi thành công, cả 5 `jobId` được lưu vào `seen_jobs_cache.json`.

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-JOB-004 (Chặn nhầm lẫn từ khóa `"Clean Driving Record"` và `"Data Cleaning"`):**
  - **Given:** 2 tin tuyển dụng: (A) `"CDL Class A Driver - Must have clean driving record and clean background"`, (B) `"Python Data Cleaning & ETL Developer"`.
  - **When:** Gọi `JobClassificationService.classifyAndFilterJobs([jobA, jobB], allCategories)`.
  - **Then:** Cả 2 tin đều bị loại bỏ (`matchedJobs.length === 0`), tuyệt đối không bị gắn nhầm vào danh mục `1.1_CLEANING_DOMESTIC`.
- **TC-JOB-005 (Xử lý an toàn khi ZipRecruiter trả về HTTP 403 / Anti-Bot Challenge):**
  - **Given:** Craigslist trả về 4 jobs hợp lệ, nhưng ZipRecruiter trả về HTTP `403 Forbidden` (hoặc trang Cloudflare challenge).
  - **When:** Chạy chu kỳ quét tổng hợp `JobFinderOrchestratorService.runScanCycle()`.
  - **Then:** Hệ thống không bị crash, vẫn phân loại và gửi thông báo cho 4 jobs từ Craigslist, đồng thời ghi nhận `platformStatus.ZIPRECRUITER = "BLOCKED_HANDOFF"` trong báo cáo.
- **TC-JOB-006 (Không đánh dấu `seen` khi cả Telegram và Email đều gửi thất bại):**
  - **Given:** 3 công việc mới tìm thấy nhưng mạng mất kết nối tới cả Telegram API lẫn SMTP Server.
  - **When:** Thực thi bước gửi thông báo.
  - **Then:** Cả 3 công việc **không** bị ghi vào `seen_jobs_cache.json` để đảm bảo lần quét kế tiếp khi có mạng sẽ gửi lại đầy đủ.

#### Tầng 3: Boundary & Rare Edge Cases (`0`, `-1`, `MAX`, `Empty`, `Duplicate`, `Concurrent`)
- **TC-JOB-007 (Khử trùng lặp khi cùng một công việc đăng lại với ID mới hoặc đăng chéo nền tảng):**
  - **Given:** Job 1 trên Craigslist (`id: "cl-101"`, title: `"Route Sales Representative - Snack Food"`, company: `"ABC Foods"`, location: `"Detroit"`) và Job 2 trên ZipRecruiter (`id: "zr-999"`, cùng tiêu đề, cùng công ty, cùng địa điểm).
  - **When:** Chạy `JobDeduplicationService.filterNewJobsAndPersist([job1, job2], cacheFile)`.
  - **Then:** Hệ thống nhận diện cùng `contentHash`, chỉ giữ lại 1 bản ghi duy nhất để thông báo và tăng bộ đếm `duplicatesSkipped = 1`.
- **TC-JOB-008 (Phân mảnh tự động khi có > 10 jobs mới cùng lúc tránh tràn 4096 ký tự Telegram):**
  - **Given:** Danh sách `25` công việc mới tìm thấy trong 1 lần quét.
  - **When:** Gọi `TelegramNotificationServiceHelper.formatJobDigestMessages(jobs, 10)`.
  - **Then:** Trả về đúng `3` tin nhắn (10 + 10 + 5 jobs), mỗi tin nhắn đều có độ dài `< 4096` ký tự và đánh số trang `[Trang 1/3]`, `[Trang 2/3]`, `[Trang 3/3]`.

---

### 4.2 Quy Trình 5 Bước Kiểm Chứng Bề Mặt Thật Cho QA Reviewer (`5-Step Real-Surface Verification`)

1. **Bước 1 — `Launch`:**
   - Khởi tạo file cấu hình từ `settings.example.json` (với email mẫu `trunglvleo@gmail.com`) và nạp bộ từ điển 8 danh mục công việc.
2. **Bước 2 — `Doctor`:**
   - Kiểm tra cấu trúc `JOB_TAXONOMY_DICTIONARY` chứa đầy đủ 100% các từ khóa trong `find-job-tool.md` (từ `House cleaning`, `Move out cleaning` đến `Route Sales Representative`, `BDC Representative`, `Wireless Retail Sales Associate`, `B2B Hardware Sales Representative`).
3. **Bước 3 — `Drive`:**
   - Chạy luồng quét với dữ liệu feed thực tế/mock của Craigslist (`jjj` + `ggg`) và ZipRecruiter, kiểm tra bộ lọc phân loại 8 nhóm ngành, bộ lọc chống nhầm lẫn ngữ cảnh (`clean driving record`), bộ khử trùng lặp và bộ tạo nội dung Telegram/Email.
4. **Bước 4 — `Evidence`:**
   - Thu thập báo cáo JSON `JobScanExecutionReport`, mẫu tin nhắn Telegram Markdown và mẫu HTML Email đã render.
5. **Bước 5 — `Cleanup`:**
   - Xóa file cache test tạm thời (`seen_jobs_cache.test.json`) và đóng các kết nối HTTP/SMTP mock.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role Phụ Trách | File Mục Tiêu | Mô Tả Chi Tiết Hàm Cần Viết | Phụ Thuộc | Lệnh Verify & Tiêu Chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `src/constants/JobToolConstants.js` & `settings.example.json` | Khai báo đầy đủ `JobDurationType`, `JobCategoryCode`, `JOB_TAXONOMY_DICTIONARY` (đủ 8 danh mục `1.1`..`1.8` và 36+ từ khóa gốc), `CONTEXT_EXCLUSION_PATTERNS` và `settings.example.json` (có cấu hình mẫu `trunglvleo@gmail.com`). | *None* | Kiểm tra import `JobToolConstants.js` thành công, đủ 8 danh mục. |
| `TASK-002` | **Developer** | `src/services/helpers/JobClassificationServiceHelper.js` & `src/services/JobClassificationService.js` | Viết `matchCategoriesAndKeywords` (dùng regex word-boundary + loại trừ cụm từ bẫy như `"clean driving record"`), `extractCompensationInfo`, và `classifyAndFilterJobs`. | `TASK-001` (Hard) | Test với 8 mẫu job thuộc 8 ngành trả về đúng mã `1.1`..`1.8` và loại bỏ đúng job bẫy. |
| `TASK-003` | **Developer** | `src/services/helpers/CraigslistFindingJobServiceHelper.js` & `src/services/CraigslistService.js` | Viết `buildCraigslistSearchUrls` (quét cả `/search/jjj` và `/search/ggg`), `parseCraigslistFeedItems`, và `fetchJobsByCriteria`. | `TASK-001` (Hard) | Parse thử RSS/HTML feed mẫu của Craigslist trả về mảng job chuẩn hóa. |
| `TASK-004` | **Developer** | `src/services/helpers/ZipRecruiterFindingJobServiceHelper.js` & `src/services/ZipRecruiterService.js` | Viết `buildZipRecruiterSearchUrls`, `parseZipRecruiterListings`, `detectAntiBotChallenge`, và `fetchJobsByCriteria`. | `TASK-001` (Hard) | Parse thử feed mẫu ZipRecruiter và trả về trạng thái `BLOCKED_HANDOFF` an toàn khi gặp HTTP 403. |
| `TASK-005` | **Developer** | `src/services/helpers/JobDeduplicationServiceHelper.js` & `src/services/JobDeduplicationService.js` | Viết `computeJobFingerprint` (dựa trên URL chuẩn hóa + `title|company|category`), `filterNewJobs`, và `markJobsAsNotified` (tuân thủ nguyên tắc chỉ lưu sau khi gửi thông báo thành công). | `TASK-001` (Hard) | Test 2 job trùng nội dung từ 2 nguồn khác nhau chỉ giữ lại 1 job. |
| `TASK-006` | **Developer** | `src/services/helpers/TelegramNotificationServiceHelper.js` & `src/services/TelegramNotificationService.js` | Viết `formatJobDigestMessages` (tự động phân trang tối đa 10 jobs/tin, `< 3800` ký tự) và `sendJobAlerts(newJobs, telegramConfig)`. | `TASK-001` (Hard) | Test với 25 jobs chia thành đúng 3 bản tin Markdown hợp lệ. |
| `TASK-007` | **Developer** | `src/services/helpers/EmailNotificationServiceHelper.js` & `src/services/EmailNotificationService.js` | Viết `buildJobDigestHtmlEmail` (nhóm theo `Short-term Fixed` và `Long-term Commission`) và `sendJobAlerts(newJobs, emailConfig)` gửi về địa chỉ cấu hình (`trunglvleo@gmail.com`). | `TASK-001` (Hard) | HTML Email sinh ra chứa đầy đủ bảng thông tin công việc và link ứng tuyển. |
| `TASK-008` | **Developer** | `src/services/JobFinderOrchestratorService.js` | Viết `runScanCycle(settings)` kết nối toàn bộ luồng: `Fetch (Craigslist + ZipRecruiter) -> Classify (1.1..1.8) -> Deduplicate -> Notify (Telegram + Email) -> Persist Cache -> Return Report`. | `TASK-002`..`TASK-007` (Hard) | Chạy trọn vẹn 1 chu kỳ quét end-to-end trả về `JobScanExecutionReport` đầy đủ. |
| `TASK-009` | **Test Engineer** | `tests/unit/JobClassificationAndDedup.test.js` | Viết Unit Test kiểm thử bộ từ điển 8 danh mục, bộ lọc từ khóa phủ định/ngữ cảnh bẫy và bộ khử trùng lặp chéo nền tảng (`TC-JOB-001`, `004`, `007`). | `TASK-002`, `TASK-005` (Hard) | Toàn bộ unit test phân loại & khử trùng pass 100%. |
| `TASK-010` | **Test Engineer** | `tests/integration/JobFinderPipeline.test.js` | Viết Integration Test kiểm thử toàn bộ pipeline quét Craigslist/ZipRecruiter, xử lý lỗi anti-bot 403, chia trang Telegram và nguyên tắc Commit-After-Notify (`TC-JOB-002`, `003`, `005`, `006`, `008`). | `TASK-008` (Hard) | Toàn bộ test suite pass 100% và xuất báo cáo QA trace. |
