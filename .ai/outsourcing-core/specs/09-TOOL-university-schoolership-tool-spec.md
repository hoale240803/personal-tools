# Tài Liệu Đặc Tả Thực Thi (Dev-Ready & Test-Ready): University Scholarship Tool (`university-schoolership-tool`)

> **Phiên bản:** 1.0.0  
> **Đơn vị lập đặc tả:** AISE Squad 2 (`intake` + `ba` + `requirement_challenger` + `orchestrator` + `estimator_cost_controller`)  
> **Nguồn dữ liệu gốc:** `idea/university-schoolership-tool/requirement.md`  
> **Mục tiêu hệ thống:** Hệ thống tìm kiếm, đối chiếu điều kiện (Eligibility Matching Engine) và cảnh báo học bổng đại học theo trường (`Target Universities`) và hồ sơ năng lực của ứng viên (GPA quy đổi chuẩn, IELTS/TOEFL, SAT/ACT, Ngành học, Bậc học, Quốc tịch/Tình trạng cư trú, Nhu cầu tài chính), tự động gửi thông báo qua **Gmail (Email)** và **Telegram** khi phát hiện học bổng có các điều kiện được đáp ứng và còn hạn nộp hồ sơ.

---

## PHẦN 1 — INTAKE & PHÂN LOẠI (`intake`)

### 1.1 Bảng Phân Tách Yêu Cầu (`Stated Facts` / `Explicit Assumptions` / `Clarification Questions`)

| Phân loại | Mã tham chiếu | Nội dung chi tiết | Nguồn / Lý do kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-001` | Cho người dùng nhập vào nhu cầu tìm học bổng theo trường (`University`). | `requirement.md` (L1) |
| **Stated Fact** | `SF-002` | Kiểm tra các điều kiện của học bổng; nếu các điều kiện được đáp ứng (`Eligibility Criteria Matched`) thì thông báo cho người dùng sang **Gmail** và **Telegram**. | `requirement.md` (L1) |
| **Explicit Assumption** | `EA-001` | **Bộ tiêu chí điều kiện học bổng chuẩn (`Standard Scholarship Eligibility Criteria`):** Để kiểm tra chính xác *"các điều kiện được đáp ứng"*, hệ thống định nghĩa hồ sơ ứng viên (`StudentEligibilityProfile`) và yêu cầu học bổng (`ScholarshipRequirement`) gồm 8 chiều: (1) Trường đại học mục tiêu (`universityId` / `universityName`), (2) Bậc học (`BACHELOR`, `MASTER`, `PHD`), (3) Điểm trung bình tích lũy (`GPA` chuẩn hóa về thang `4.0`), (4) Chứng chỉ tiếng Anh (`IELTS` hoặc `TOEFL iBT`), (5) Điểm chuẩn hóa (`SAT` / `ACT` / `GRE` nếu yêu cầu), (6) Chuyên ngành (`majorCategories`, VD: `STEM`, `BUSINESS`, `ARTS`, `ANY`), (7) Đối tượng quốc tịch/cư trú (`INTERNATIONAL`, `US_CITIZEN`, `PERMANENT_RESIDENT`, `ANY`), và (8) Hạn chót nộp hồ sơ (`deadlineIso`). | Cụ thể hóa câu yêu cầu ngắn gọn trong `requirement.md` thành mô hình dữ liệu tường minh, có thể lập trình và kiểm thử tự động 100%. |
| **Explicit Assumption** | `EA-002` | **Quy đổi thang điểm GPA và Ngoại ngữ tương đương (`Cross-Scale Normalization`):** Sinh viên Việt Nam hoặc quốc tế thường nhập GPA thang `10.0` (VD: `8.5/10`) hoặc thang `4.0` (VD: `3.6/4.0`), và có thể chỉ thi `IELTS` (VD: `7.0`) trong khi trường Mỹ ghi yêu cầu `TOEFL iBT >= 90` hoặc `IELTS >= 6.5`. Hệ thống tự động quy đổi GPA thang 10 sang thang 4.0 và đối chiếu tương đương `IELTS <-> TOEFL iBT` để không bỏ sót học bổng mà sinh viên thực chất đủ điều kiện. | Tăng độ chính xác thực tế cho sinh viên săn học bổng. |
| **Explicit Assumption** | `EA-003` | **Phân tầng mức độ đáp ứng (`Eligibility Match Tier`):** Phân loại học bổng thành 3 nhóm: (1) `FULLY_ELIGIBLE` (Đáp ứng 100% mọi điều kiện cứng -> gửi thông báo ưu tiên), (2) `NEAR_ELIGIBLE_STRETCH` (Đáp ứng trường & ngành nhưng thiếu rất nhẹ $\le 0.1$ GPA hoặc thiếu điểm SAT tùy chọn -> hiển thị gợi ý cải thiện), (3) `INELIGIBLE` (Không đủ điều kiện hoặc đã hết hạn nộp). | Giúp người dùng vừa nhận được học bổng chắc chắn đủ điều kiện, vừa biết học bổng nào chỉ cần cố thêm một chút là đạt. |
| **Clarification Question** | `CQ-001` | **Câu hỏi:** Đối với các học bổng sắp hết hạn nộp hồ sơ (VD: còn `< 14 ngày` hoặc `< 7 ngày`), hệ thống có nên gửi lại thông báo nhắc hạn (`Deadline Reminder Alert`) ngay cả khi học bổng đó đã từng được thông báo lúc mới mở đơn không?<br>- **Option A (Khuyến nghị):** Có, gửi 1 thông báo khi mới phát hiện học bổng khớp điều kiện (`NEW_MATCH`) và gửi thêm 1 thông báo nhắc nhở khẩn cấp (`URGENT_DEADLINE_7D`) khi hạn chót còn $\le 7$ ngày.<br>- **Option B:** Chỉ thông báo đúng 1 lần duy nhất. | Khuyến nghị **Option A** để tránh việc sinh viên quên hạn nộp hồ sơ học bổng. |

### 1.2 Nhãn Bảo Mật, Tuân Thủ & Rủi Ro (`Security & Compliance Tags`)

- **[COMPLIANCE-ANTI-BOT]:** Khi thu thập thông tin học bổng từ cổng thông tin của các trường đại học (`.edu` portals) hoặc các kho học bổng công khai, chỉ truy cập các trang công khai, RSS feeds, hoặc dữ liệu JSON/CSV mở; tuyệt đối không vượt CAPTCHA hay cổng đăng nhập nội bộ của trường.
- **[SECURITY-SECRETS]:** Thông tin đăng nhập gửi Gmail (`SMTP_USER`, `SMTP_APP_PASSWORD`) và `TELEGRAM_BOT_TOKEN` phải được lưu trong `settings.json`, không đưa vào code.

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1 Bảng Yêu Cầu Nghiệp Vụ Có Mã Truy Vết (`REQ-001` .. `REQ-010`)

| Mã REQ | Tên Yêu Cầu | Mô tả nghiệp vụ chi tiết | Truy vết nguồn | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | **Student Profile & Target University Input** | Cho phép người dùng nhập hồ sơ năng lực cá nhân (GPA + thang điểm `4.0`/`10.0`, IELTS/TOEFL, SAT/ACT, Bậc học, Ngành học, Quốc tịch/Visa, Mức hỗ trợ tài chính mong muốn) và danh sách các trường đại học mục tiêu (`targetUniversities` + hỗ trợ tìm kiếm không phân biệt tên viết tắt như `UMich` = `University of Michigan`). | `requirement.md` L1 | `P0 Must-Have` |
| `REQ-002` | **Academic Score Normalizer (GPA & English Equivalency)** | Tự động chuẩn hóa GPA từ thang `10.0` hoặc `100` về thang `4.0` chuẩn Bắc Mỹ và quy đổi tương đương giữa `IELTS` và `TOEFL iBT` khi đối chiếu điều kiện. | `requirement.md` L1 | `P0 Must-Have` |
| `REQ-003` | **Deterministic Multi-Condition Eligibility Engine** | Kiểm tra từng điều kiện của học bổng so với hồ sơ người dùng: Trường đại học, Bậc học, Quốc tịch/Đối tượng hợp lệ, `normalizedGpa4 >= minGpa4`, `English Score >= minEnglish`, `SAT >= minSat`, Chuyên ngành, và `Deadline >= currentDate`. | `requirement.md` L1 | `P0 Must-Have` |
| `REQ-004` | **Gmail (SMTP HTML) Notification Service** | Khi phát hiện học bổng có toàn bộ điều kiện được đáp ứng (`FULLY_ELIGIBLE`), tự động gửi email thông báo về địa chỉ Gmail của người dùng với bảng đối chiếu từng tiêu chí (`GPA của bạn: 3.7 >= Yêu cầu: 3.5 ✅`), giá trị học bổng, hạn nộp và link đăng ký. | `requirement.md` L1 | `P0 Must-Have` |
| `REQ-005` | **Telegram Notification Service** | Gửi thông báo tức thời vào Telegram Chat với tóm tắt học bổng, tên trường, mức tiền hỗ trợ (`$XX,XXX` hoặc `Full Tuition`), số ngày còn lại trước hạn chót (`daysUntilDeadline`) và link nộp đơn. | `requirement.md` L1 | `P0 Must-Have` |
| `REQ-006` | **Expired Scholarship Filter & Deadline Urgency Calculator** | Tự động loại bỏ các học bổng đã quá hạn nộp hồ sơ (`deadlineIso < now` theo múi giờ chuẩn UTC) và gắn nhãn khẩn cấp `URGENT_DEADLINE` cho các học bổng còn $\le 7$ ngày. | Yêu cầu kỹ thuật cốt lõi | `P0 Must-Have` |
| `REQ-007` | **University Alias & Fuzzy Name Resolver** | Ánh xạ thông minh tên viết tắt hoặc tên thường gọi của trường đại học (VD: `"MIT"` <-> `"Massachusetts Institute of Technology"`, `"UMich"` <-> `"University of Michigan"`, `"UCLA"` <-> `"University of California, Los Angeles"`). | `requirement.md` L1 | `P1 Should-Have` |
| `REQ-008` | **Notification Deduplication & 7-Day Reminder Guard** | Lưu vết các học bổng đã gửi thông báo để không gửi lặp mỗi ngày, nhưng cho phép gửi duy nhất 1 bản tin nhắc nhở `DEADLINE_REMINDER` khi học bổng bước vào ngưỡng $\le 7$ ngày trước hạn chót. | Yêu cầu kỹ thuật cốt lõi | `P1 Should-Have` |
| `REQ-009` | **Near-Miss (Stretch) Diagnostic Report** | Đối với các học bổng tại trường mục tiêu mà người dùng đáp ứng gần hết điều kiện nhưng chỉ thiếu 1 tiêu chí nhỏ (VD: thiếu `0.5` điểm IELTS), cung cấp báo cáo giải thích rõ thiếu điều kiện nào thay vì ẩn mất hoàn toàn. | Tối ưu trải nghiệm người dùng | `P2 Nice-to-Have` |
| `REQ-010` | **Scholarship Feed Importer (JSON / CSV / Public Portal)** | Hỗ trợ nạp và cập nhật danh sách học bổng từ kho dữ liệu cấu hình hoặc import CSV/JSON từ người dùng/cố vấn du học. | Hỗ trợ vận hành thực tế | `P2 Nice-to-Have` |

---

### 2.2 Data Structures, Constants & `settings.json` Schema (No Magic Numbers / Strings)

#### A. Bảng `CONSTANTS` & `ENUMS` (`src/constants/ScholarshipToolConstants.js`)

```javascript
export const DegreeLevel = Object.freeze({
  BACHELOR: "BACHELOR",
  MASTER: "MASTER",
  PHD: "PHD",
  ANY: "ANY",
});

export const CitizenshipScope = Object.freeze({
  INTERNATIONAL: "INTERNATIONAL",
  US_CITIZEN_OR_PR: "US_CITIZEN_OR_PR",
  VIETNAM_CITIZEN: "VIETNAM_CITIZEN",
  ANY: "ANY",
});

export const EligibilityStatus = Object.freeze({
  FULLY_ELIGIBLE: "FULLY_ELIGIBLE",             // Đáp ứng 100% điều kiện -> Gửi Gmail & Tele
  NEAR_ELIGIBLE_STRETCH: "NEAR_ELIGIBLE_STRETCH", // Thiếu nhẹ 1 tiêu chí điểm số
  INELIGIBLE: "INELIGIBLE",                     // Không đáp ứng điều kiện cứng
  EXPIRED: "EXPIRED",                           // Đã qua hạn nộp hồ sơ
});

export const GpaScaleType = Object.freeze({
  SCALE_4_0: "SCALE_4_0",
  SCALE_10_0: "SCALE_10_0",
  SCALE_100: "SCALE_100",
});

export const SCHOLARSHIP_CONSTANTS = Object.freeze({
  MAX_GPA_4_SCALE: 4.0,
  MAX_GPA_10_SCALE: 10.0,
  MAX_GPA_100_SCALE: 100.0,
  MAX_IELTS_SCORE: 9.0,
  MAX_TOEFL_IBT_SCORE: 120,
  MAX_SAT_SCORE: 1600,
  NEAR_ELIGIBLE_GPA_TOLERANCE: 0.15,            // Chênh lệch <= 0.15 GPA được xếp vào Near-Miss
  NEAR_ELIGIBLE_IELTS_TOLERANCE: 0.5,           // Chênh lệch <= 0.5 IELTS được xếp vào Near-Miss
  URGENT_DEADLINE_DAYS_THRESHOLD: 7,            // Còn <= 7 ngày là khẩn cấp
  MS_PER_DAY: 86400000,
});

// Bảng ánh xạ tên viết tắt trường đại học phổ biến
export const UNIVERSITY_ALIAS_MAP = Object.freeze({
  "umich": "university of michigan",
  "u of m": "university of michigan",
  "msu": "michigan state university",
  "mit": "massachusetts institute of technology",
  "ucla": "university of california, los angeles",
  "uc berkeley": "university of california, berkeley",
  "cal": "university of california, berkeley",
  "asu": "arizona state university",
  "nyu": "new york university",
  "usc": "university of southern california",
});

// Bảng quy đổi tương đương IELTS -> TOEFL iBT tối thiểu (ETS Official Concordance)
export const IELTS_TO_TOEFL_CONCORDANCE = Object.freeze([
  { minIelts: 9.0, equivalentToeflIbt: 118 },
  { minIelts: 8.5, equivalentToeflIbt: 115 },
  { minIelts: 8.0, equivalentToeflIbt: 110 },
  { minIelts: 7.5, equivalentToeflIbt: 102 },
  { minIelts: 7.0, equivalentToeflIbt: 94 },
  { minIelts: 6.5, equivalentToeflIbt: 79 },
  { minIelts: 6.0, equivalentToeflIbt: 60 },
  { minIelts: 5.5, equivalentToeflIbt: 46 },
]);
```

#### B. Core Data Interfaces (`src/types/ScholarshipToolTypes.ts`)

```typescript
export interface StudentEligibilityProfile {
  studentName: string;
  targetUniversities: string[];      // VD: ["University of Michigan", "Michigan State University"]
  IncludeAllUniversitiesIfEmpty: boolean;
  degreeLevel: string;               // DegreeLevel
  intendedMajors: string[];          // VD: ["COMPUTER_SCIENCE", "ENGINEERING"]
  citizenshipStatus: string;         // CitizenshipScope (VD: "INTERNATIONAL")
  rawGpa: number;
  gpaScale: "SCALE_4_0" | "SCALE_10_0" | "SCALE_100";
  normalizedGpa4?: number;
  ieltsScore?: number | null;
  toeflIbtScore?: number | null;
  satScore?: number | null;
  hasFinancialNeed: boolean;
}

export interface ScholarshipOpportunity {
  scholarshipId: string;
  scholarshipName: string;
  universityName: string;
  awardAmountUsd: number;
  isFullTuition: boolean;
  deadlineIso: string;               // YYYY-MM-DD
  applicationUrl: string;
  criteria: {
    allowedDegreeLevels: string[];   // ["BACHELOR"] hoặc ["ANY"]
    allowedMajors: string[];         // ["STEM", "COMPUTER_SCIENCE"] hoặc ["ANY"]
    allowedCitizenships: string[];   // ["INTERNATIONAL", "ANY"]
    minGpa4: number;                 // VD: 3.5
    minIelts?: number | null;        // VD: 6.5
    minToeflIbt?: number | null;     // VD: 80
    minSat?: number | null;          // VD: 1350 (null nếu không yêu cầu)
    requiresFinancialNeed: boolean;
  };
}

export interface ScholarshipEvaluationResult {
  scholarship: ScholarshipOpportunity;
  status: "FULLY_ELIGIBLE" | "NEAR_ELIGIBLE_STRETCH" | "INELIGIBLE" | "EXPIRED";
  matchScorePct: number;
  daysUntilDeadline: number;
  isUrgentDeadline: boolean;
  metConditions: string[];           // Danh sách các điều kiện đã đạt
  unmetConditions: string[];         // Danh sách các điều kiện chưa đạt (rỗng nếu FULLY_ELIGIBLE)
}
```

#### C. Schema cấu hình `settings.json`

```json
{
  "studentProfile": {
    "studentName": "Nguyen Van A",
    "targetUniversities": ["University of Michigan", "Michigan State University", "Arizona State University"],
    "includeAllUniversitiesIfEmpty": false,
    "degreeLevel": "BACHELOR",
    "intendedMajors": ["COMPUTER_SCIENCE", "ENGINEERING", "STEM"],
    "citizenshipStatus": "INTERNATIONAL",
    "rawGpa": 8.6,
    "gpaScale": "SCALE_10_0",
    "ieltsScore": 7.0,
    "toeflIbtScore": null,
    "satScore": 1420,
    "hasFinancialNeed": true
  },
  "dataSources": {
    "scholarshipsCatalogPath": "./data/scholarships_catalog.json",
    "notifiedScholarshipsCachePath": "./data/notified_scholarships_cache.json",
    "enableUrgent7DayReminder": true
  },
  "notifications": {
    "gmail": {
      "enabled": true,
      "recipientGmail": "REPLACE_WITH_STUDENT_EMAIL@gmail.com",
      "smtpHost": "smtp.gmail.com",
      "smtpPort": 587,
      "smtpUser": "REPLACE_WITH_GMAIL_USER",
      "smtpPass": "REPLACE_WITH_GMAIL_APP_PASSWORD"
    },
    "telegram": {
      "enabled": true,
      "botToken": "REPLACE_WITH_TELEGRAM_BOT_TOKEN",
      "chatId": "REPLACE_WITH_TELEGRAM_CHAT_ID"
    }
  }
}
```

---

### 2.3 Kiến Trúc Service & Helper (Rule 4 & Single Responsibility Principle)

1. **`AcademicScoreNormalizerServiceHelper.js` & `UniversityMatcherServiceHelper.js`**
   - `AcademicScoreNormalizerServiceHelper.normalizeGpaTo4Scale(rawGpa, gpaScale)`
     - *Mục đích:* Quy đổi điểm GPA từ thang `10.0` (VD: `8.5 -> 3.6`, chuẩn quy đổi WES/Scholaro) hoặc thang `100` về thang `4.0`; kiểm tra biên hợp lệ (`0 < rawGpa <= maxScale`).
   - `AcademicScoreNormalizerServiceHelper.satisfiesEnglishRequirement(studentIelts, studentToefl, reqMinIelts, reqMinToefl)`
     - *Mục đích:* Kiểm tra điều kiện tiếng Anh có hỗ trợ quy đổi chéo `IELTS <-> TOEFL iBT` (VD: sinh viên có `IELTS 7.0` tương đương `TOEFL 94`, sẽ đạt học bổng yêu cầu `TOEFL >= 85` dù sinh viên không thi TOEFL).
   - `UniversityMatcherServiceHelper.isUniversityMatched(scholarshipUniName, targetUniversities)`
     - *Mục đích:* Chuẩn hóa tên trường qua `UNIVERSITY_ALIAS_MAP` để khớp chính xác cả tên viết tắt (`"UMich"` khớp `"University of Michigan"`).

2. **`ScholarshipEligibilityService.js` & `ScholarshipEligibilityServiceHelper.js`**
   - `ScholarshipEligibilityServiceHelper.calculateDaysUntilDeadline(deadlineIso, referenceDateIso)`
     - *Mục đích:* Tính số ngày còn lại tới hạn nộp hồ sơ theo chuẩn UTC; trả về số âm nếu đã hết hạn.
   - `ScholarshipEligibilityService.evaluateScholarshipForStudent(scholarship, studentProfile, referenceDateIso)`
     - *Mục đích:* Đánh giá toàn diện 8 điều kiện của học bổng, phân loại thành `FULLY_ELIGIBLE`, `NEAR_ELIGIBLE_STRETCH`, `INELIGIBLE`, hoặc `EXPIRED`, kèm danh sách chi tiết `metConditions` và `unmetConditions`.

3. **`ScholarshipAlertDispatcherService.js` & `ScholarshipAlertDispatcherServiceHelper.js`**
   - `ScholarshipAlertDispatcherServiceHelper.filterScholarshipsForNotification(evaluatedResults, notifiedCache, enableUrgentReminder)`
     - *Mục đích:* Lọc ra các học bổng `FULLY_ELIGIBLE` chưa từng gửi thông báo, hoặc các học bổng bước vào giai đoạn khẩn cấp `<= 7 ngày` chưa được gửi lời nhắc `URGENT_REMINDER`.
   - `ScholarshipAlertDispatcherServiceHelper.buildGmailHtmlContent(eligibleResults, studentProfile)`
     - *Mục đích:* Tạo nội dung email HTML gửi qua Gmail với bảng đối chiếu điều kiện đạt chuẩn, mức học bổng và hạn nộp.
   - `ScholarshipAlertDispatcherServiceHelper.buildTelegramMarkdownMessage(eligibleResults, studentProfile)`
     - *Mục đích:* Tạo bản tin Telegram gọn gàng, rõ ràng kèm nhãn `🔥 SẮP HẾT HẠN` nếu `daysUntilDeadline <= 7`.
   - `ScholarshipAlertDispatcherService.dispatchAlerts(eligibleResults, studentProfile, notificationConfig, notifiedCachePath)`
     - *Mục đích:* Gửi thông báo đồng thời qua Gmail và Telegram và lưu trạng thái vào cache sau khi gửi thành công.

---

### 2.4 Ma Trận 5 Trạng Thái UX (`5 UX States Matrix`)

| Trạng thái | Điều kiện kích hoạt | Phản hồi trên Gmail / Telegram / CLI Dashboard | Hành động điều hướng (CTA) |
| :--- | :--- | :--- | :--- |
| **1. Ideal State** | Tìm thấy $\ge 1$ học bổng tại trường mục tiêu mà người dùng đáp ứng đủ 100% điều kiện (`FULLY_ELIGIBLE`) và còn hạn nộp. | Gửi ngay **Gmail** & **Telegram**: `🎓 [ĐỦ ĐIỀU KIỆN HỌC BỔNG] University of Michigan - International Merit Award ($20,000/năm) | Hạn nộp: 2027-01-15 (còn 69 ngày) | Điều kiện đạt: GPA 3.65/4.0 (>= 3.5 ✅), IELTS 7.0 (>= 6.5 ✅), SAT 1420 (>= 1350 ✅)`. | Bấm nút `"Mở trang nộp hồ sơ chính thức"` hoặc `"Lưu vào lịch nộp đơn"`. |
| **2. Loading State** | Đang chuẩn hóa điểm số của ứng viên và đối chiếu với danh mục học bổng của các trường. | Hiển thị tiến trình: `[1/3] Chuẩn hóa hồ sơ (GPA 8.6/10 -> 3.65/4.0)... -> [2/3] Quét học bổng tại 3 trường mục tiêu... -> [3/3] Kiểm tra điều kiện & Gửi Gmail/Telegram...`. | Cho phép xem trước kết quả trên console trước khi gửi mail. |
| **3. Empty State** | Không có học bổng nào khớp 100% điều kiện tại các trường đã chọn, nhưng có 2 học bổng thuộc nhóm `NEAR_ELIGIBLE_STRETCH`. | Không gửi thông báo rác; hiển thị trên Dashboard: *"Chưa có học bổng khớp 100%, nhưng có 2 học bổng bạn chỉ thiếu 0.5 điểm IELTS hoặc có thể mở rộng thêm trường mục tiêu"*. | Nút `"Xem 2 học bổng Gần Đạt (Near-Miss)"` hoặc `"Mở rộng danh sách trường đại học"`. |
| **4. Error State** | Người dùng nhập điểm không hợp lệ (`GPA = 4.5` trên thang `4.0`, `IELTS = 10.5`) hoặc lỗi xác thực Gmail App Password. | Báo lỗi rõ ràng: `ERR_INVALID_GPA_VALUE (GPA 4.5 vượt quá thang điểm 4.0)` hoặc `ERR_GMAIL_AUTH_FAILED` kèm hướng dẫn tạo App Password 16 ký tự. | Nút `"Kiểm tra lại hồ sơ trong settings.json"`. |
| **5. Partial / Overflow State** | Gmail gửi thành công nhưng Telegram Bot bị lỗi mạng (hoặc ngược lại); hoặc tìm thấy học bổng chỉ còn `3 ngày` là hết hạn nộp. | Ghi nhận trạng thái gửi từng phần (`gmailSent: true, telegramSent: false`) để thử gửi bù kênh lỗi; học bổng còn $\le 7$ ngày được đóng khung đỏ `🚨 KHẨN CẤP: CÒN 3 NGÀY HẾT HẠN` ở đầu email/tin nhắn. | Ưu tiên hiển thị học bổng sắp hết hạn lên trên cùng. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

### 3.1 Lỗ hổng 1: Sai lệch khi so sánh trực tiếp GPA khác hệ quy chiếu (Thang 10.0 của Việt Nam vs Thang 4.0 của Mỹ)
- **Rủi ro thực tế:** Sinh viên Việt Nam nhập `GPA = 8.2` (thang 10) hoặc hệ thống đọc học bổng Mỹ yêu cầu `minGpa = 3.5`. Nếu so sánh số học thô `8.2 >= 3.5` thì cả học sinh trung bình (`GPA = 5.0/10`) cũng được báo là "Đủ điều kiện GPA 3.5/4.0"! Ngược lại, nếu lấy `8.2 / 10 * 4 = 3.28` (chia tuyến tính đơn giản) sẽ làm thiệt thòi lớn cho sinh viên Việt Nam vì theo chuẩn quy đổi quốc tế WES, `8.0 - 8.4/10` tại Việt Nam tương đương loại Giỏi (`3.5/4.0`).
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Trong `AcademicScoreNormalizerServiceHelper.normalizeGpaTo4Scale`:
    - Bắt buộc kiểm tra `rawGpa` không được vượt quá trần của `gpaScale` (nếu `gpaScale === "SCALE_4_0"` mà `rawGpa > 4.0` thì ném lỗi `ERR_GPA_EXCEEDS_SCALE` ngay lập tức).
    - Sử dụng bảng nội suy chuẩn hóa GPA thang 10 sang thang 4.0 (`>= 9.0 -> 4.0`, `8.5..8.9 -> 3.7`, `8.0..8.4 -> 3.5`, `7.0..7.9 -> 3.0`, `6.5..6.9 -> 2.7`, `5.0..6.4 -> 2.0`).

### 3.2 Lỗ hổng 2: Bỏ sót học bổng do chỉ có IELTS mà không có TOEFL (hoặc ngược lại) và Học bổng `Test-Optional` (Không bắt buộc SAT)
- **Rủi ro thực tế:**
  1. Nhiều trường đại học Mỹ ghi điều kiện `minToeflIbt: 80, minIelts: 6.5`. Nếu code viết điều kiện `student.ielts >= minIelts && student.toefl >= minToefl` (phép `AND`), thì mọi sinh viên chỉ thi IELTS (có `toefl = null`) sẽ bị đánh trượt oan 100%!
  2. Tương tự, với học bổng không yêu cầu SAT (`minSat: null`), nếu kiểm tra `student.satScore >= scholarship.minSat` khi `student.satScore = null` một cách cẩu thả sẽ gây lỗi so sánh.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Điều kiện chứng chỉ tiếng Anh phải dùng phép **`OR` có quy đổi tương đương (`IELTS_TO_TOEFL_CONCORDANCE`)**: sinh viên chỉ cần thỏa mãn `IELTS` HOẶC `TOEFL iBT` (quy đổi tương đương) là đạt yêu cầu ngoại ngữ.
  - Nếu `scholarship.criteria.minSat === null` hoặc `undefined`, điều kiện SAT mặc định là `PASSED (Test-Optional)`.

### 3.3 Lỗ hổng 3: Bẫy Đối tượng Quốc tịch (`US Citizens Only` vs `International Students`)
- **Rủi ro thực tế:** Rất nhiều học bổng tại các trường đại học Mỹ (như Federal Pell Grant hoặc học bổng bang) chỉ dành cho công dân/thường trú nhân Mỹ (`US_CITIZEN_OR_PR`). Nếu chỉ lọc theo Tên trường + GPA mà quên kiểm tra `allowedCitizenships`, sinh viên quốc tế sẽ nhận hàng loạt thông báo học bổng mà họ không có quyền nộp đơn.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Trong `ScholarshipEligibilityService`: Kiểm tra `allowedCitizenships` là **điều kiện tiên quyết cứng (Hard Prerequisite)**: chỉ khớp nếu `allowedCitizenships.includes("ANY")` hoặc `allowedCitizenships.includes(studentProfile.citizenshipStatus)`. Nếu lệch quốc tịch, trả về ngay `INELIGIBLE` (không bao giờ xếp vào `NEAR_ELIGIBLE_STRETCH`).

### 3.4 Lỗ hổng 4: Gửi thông báo học bổng đã hết hạn do lệch múi giờ (`Timezone Drift`)
- **Rủi ro thực tế:** Học bổng có hạn chót `"2026-11-05"`. Nếu dùng `new Date("2026-11-05")` so sánh không chuẩn múi giờ hoặc không cắt về cuối ngày UTC, hệ thống có thể gửi thông báo cho học bổng đã đóng đơn từ hôm qua.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Trong `ScholarshipEligibilityServiceHelper.calculateDaysUntilDeadline`: Chuẩn hóa cả `deadlineIso` và `referenceDateIso` về mốc `00:00:00 UTC` để tính số ngày chênh lệch chính xác tuyệt đối. Nếu `daysUntilDeadline < 0`, gắn trạng thái `EXPIRED` và chặn hoàn toàn khỏi luồng thông báo Gmail/Telegram.

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1 Kịch Bản Kiểm Thử `Given / When / Then` (3 Tầng)

#### Tầng 1: P0 Happy Paths (Người dùng sử dụng thường xuyên nhất)
- **TC-SCH-001 (Tìm kiếm học bổng theo trường có hỗ trợ tên viết tắt `UMich` và quy đổi GPA thang 10 sang thang 4.0):**
  - **Given:** Hồ sơ sinh viên quốc tế (`citizenshipStatus = "INTERNATIONAL"`) nhập trường mục tiêu `["UMich"]`, `rawGpa = 8.6` (`SCALE_10_0` -> quy đổi `>= 3.65/4.0`), `ieltsScore = 7.0`, `toeflIbtScore = null`, `satScore = 1420`, ngành `COMPUTER_SCIENCE`. Học bổng của `"University of Michigan"` yêu cầu: `BACHELOR`, `STEM/COMPUTER_SCIENCE`, `INTERNATIONAL`, `minGpa4 = 3.5`, `minIelts = 6.5`, `minToeflIbt = 85`, `minSat = 1350`, hạn nộp còn `45 ngày`.
  - **When:** Gọi `ScholarshipEligibilityService.evaluateScholarshipForStudent`.
  - **Then:** Hệ thống khớp đúng `"UMich"` với `"University of Michigan"`, quy đổi GPA đạt yêu cầu, xác nhận `IELTS 7.0` đạt yêu cầu tiếng Anh (dù `toeflIbtScore = null`), trả về `status = "FULLY_ELIGIBLE"`, `matchScorePct = 100`, `unmetConditions = []`.
- **TC-SCH-002 (Gửi thông báo học bổng khớp điều kiện qua cả Gmail và Telegram):**
  - **Given:** Kết quả `FULLY_ELIGIBLE` từ `TC-SCH-001` chưa có trong cache thông báo.
  - **When:** Gọi `ScholarshipAlertDispatcherService.dispatchAlerts`.
  - **Then:** Hệ thống sinh nội dung HTML Email gửi qua Gmail và tin nhắn Markdown gửi qua Telegram với đầy đủ Tên trường, Tên học bổng, Giá trị giải thưởng, Hạn nộp, Bảng điều kiện đã đáp ứng và lưu `scholarshipId` vào cache.

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-SCH-003 (Loại bỏ học bổng sai đối tượng Quốc tịch hoặc đã hết hạn nộp hồ sơ):**
  - **Given:** Sinh viên quốc tế (`INTERNATIONAL`) xét 2 học bổng tại trường mục tiêu:
    - Học bổng A: Chỉ dành cho `["US_CITIZEN_OR_PR"]` (dù sinh viên thừa điểm GPA 4.0).
    - Học bổng B: Hạn nộp `deadlineIso = "2020-01-01"` (đã quá hạn).
  - **When:** Gọi `ScholarshipEligibilityService.evaluateScholarshipForStudent`.
  - **Then:** Học bổng A trả về `status = "INELIGIBLE"` (với lý do `CITIZENSHIP_MISMATCH`), Học bổng B trả về `status = "EXPIRED"`; cả hai đều tuyệt đối không được gửi sang Gmail hay Telegram.
- **TC-SCH-004 (Bắt lỗi nhập điểm GPA vượt quá thang điểm hoặc điểm âm):**
  - **Given:** Người dùng cấu hình `gpaScale = "SCALE_4_0"` nhưng nhập `rawGpa = 8.5` (hoặc `rawGpa = -1.0`, hoặc `ieltsScore = 11.0`).
  - **When:** Gọi `AcademicScoreNormalizerServiceHelper.normalizeGpaTo4Scale` / validate hồ sơ.
  - **Then:** Ném lỗi `ValidationError` với mã lỗi tường minh (`ERR_GPA_EXCEEDS_SCALE`, `ERR_INVALID_SCORE_RANGE`).

#### Tầng 3: Boundary & Rare Edge Cases (`0`, `-1`, `MAX`, `Empty`, `Duplicate`, `Concurrent`)
- **TC-SCH-005 (Quy đổi chéo `IELTS -> TOEFL iBT` khi học bổng chỉ ghi yêu cầu `minToeflIbt` và biên `daysUntilDeadline === 0`):**
  - **Given:** Học bổng chỉ ghi `minToeflIbt = 90, minIelts = null`, hạn chót là **ngay hôm nay** (`daysUntilDeadline === 0`). Sinh viên chỉ có `ieltsScore = 7.0` (tương đương `TOEFL 94 >= 90`) và `toeflIbtScore = null`.
  - **When:** Đánh giá điều kiện học bổng.
  - **Then:** Sinh viên vẫn được công nhận đạt điều kiện tiếng Anh nhờ bảng quy đổi tương đương `IELTS_TO_TOEFL_CONCORDANCE`, trạng thái là `FULLY_ELIGIBLE` và bật cờ `isUrgentDeadline = true` (`daysUntilDeadline = 0` vẫn còn hạn trong ngày hôm nay).
- **TC-SCH-006 (Chống gửi trùng thông báo nhưng cho phép gửi 1 lần nhắc hạn khẩn cấp `<= 7 ngày`):**
  - **Given:** Học bổng `SCH-100` đã được gửi thông báo `INITIAL_MATCH` cách đây 1 tháng (khi còn 35 ngày).
    - Lần quét 2 (còn 20 ngày): Kiểm tra gửi thông báo.
    - Lần quét 3 (còn 5 ngày $\le 7$ ngày): Kiểm tra gửi thông báo với `enableUrgent7DayReminder = true`.
    - Lần quét 4 (còn 4 ngày): Kiểm tra gửi thông báo.
  - **When:** Chạy `ScholarshipAlertDispatcherServiceHelper.filterScholarshipsForNotification`.
  - **Then:** Lần 2 bị chặn trùng lặp; Lần 3 được phép gửi 1 thông báo nhắc hạn khẩn cấp (`URGENT_DEADLINE_REMINDER`); Lần 4 bị chặn vì đã gửi lời nhắc khẩn cấp rồi.

---

### 4.2 Quy Trình 5 Bước Kiểm Chứng Bề Mặt Thật Cho QA Reviewer (`5-Step Real-Surface Verification`)

1. **Bước 1 — `Launch`:**
   - Nạp cấu hình `settings.example.json` và danh mục học bổng mẫu (`scholarships_catalog.json`).
2. **Bước 2 — `Doctor`:**
   - Kiểm tra tính hợp lệ của hồ sơ ứng viên (`StudentEligibilityProfile`), bảng quy đổi GPA/IELTS-TOEFL và cấu hình kết nối Gmail/Telegram.
3. **Bước 3 — `Drive`:**
   - Chạy luồng đánh giá điều kiện học bổng trên tập dữ liệu gồm: học bổng khớp 100% (`FULLY_ELIGIBLE`), học bổng viết tắt tên trường (`UMich`), học bổng chỉ ghi TOEFL khi ứng viên có IELTS, học bổng thiếu nhẹ điểm (`NEAR_ELIGIBLE_STRETCH`), học bổng sai quốc tịch (`INELIGIBLE`) và học bổng hết hạn (`EXPIRED`).
4. **Bước 4 — `Evidence`:**
   - Thu thập nội dung Gmail HTML, tin nhắn Telegram Markdown, bảng phân loại `ScholarshipEvaluationResult` và log cache chống trùng lặp.
5. **Bước 5 — `Cleanup`:**
   - Xóa file cache test tạm thời (`notified_scholarships_cache.test.json`).

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role Phụ Trách | File Mục Tiêu | Mô Tả Chi Tiết Hàm Cần Viết | Phụ Thuộc | Lệnh Verify & Tiêu Chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `src/constants/ScholarshipToolConstants.js` & `settings.example.json` | Khai báo toàn bộ `DegreeLevel`, `CitizenshipScope`, `EligibilityStatus`, `GpaScaleType`, `SCHOLARSHIP_CONSTANTS`, `UNIVERSITY_ALIAS_MAP`, `IELTS_TO_TOEFL_CONCORDANCE` và `settings.example.json`. | *None* | Import thành công, không dùng bất kỳ magic numbers/strings nào. |
| `TASK-002` | **Developer** | `src/services/helpers/AcademicScoreNormalizerServiceHelper.js` | Viết `validateStudentProfileScores`, `normalizeGpaTo4Scale(rawGpa, gpaScale)` (quy đổi chuẩn thang 10 và thang 100 sang thang 4.0), và `satisfiesEnglishRequirement` (hỗ trợ quy đổi tương đương `IELTS <-> TOEFL iBT`). | `TASK-001` (Hard) | Test `GPA 8.6/10` ra `>= 3.65/4.0`, `GPA 4.5/4.0` ném lỗi, và `IELTS 7.0` thỏa mãn `TOEFL >= 90`. |
| `TASK-003` | **Developer** | `src/services/helpers/UniversityMatcherServiceHelper.js` | Viết `normalizeUniversityName(name)` và `isUniversityMatched(scholarshipUniName, targetUniversities, includeAllIfEmpty)` hỗ trợ khớp tên đầy đủ và tên viết tắt (`UMich`, `MIT`, `UCLA`, `MSU`...). | `TASK-001` (Hard) | Test `"UMich"` khớp chính xác `"University of Michigan"`. |
| `TASK-004` | **Developer** | `src/services/helpers/ScholarshipEligibilityServiceHelper.js` & `src/services/ScholarshipEligibilityService.js` | Viết `calculateDaysUntilDeadline`, `evaluateSingleScholarship` và `evaluateCatalogForStudent` kiểm tra đủ 8 điều kiện (University, Degree, Citizenship, GPA, English, SAT, Major, Financial Need, Deadline) và phân loại `FULLY_ELIGIBLE` / `NEAR_ELIGIBLE_STRETCH` / `INELIGIBLE` / `EXPIRED`. | `TASK-002`, `TASK-003` (Hard) | Phân loại chính xác các học bổng đạt, gần đạt, sai quốc tịch và hết hạn. |
| `TASK-005` | **Developer** | `src/services/helpers/ScholarshipAlertDispatcherServiceHelper.js` | Viết `filterScholarshipsForNotification` (chống gửi trùng + hỗ trợ nhắc hạn khẩn cấp $\le 7$ ngày), `buildGmailHtmlContent`, và `buildTelegramMarkdownMessage`. | `TASK-001`, `TASK-004` (Hard) | Sinh đúng nội dung HTML Gmail & Markdown Telegram kèm bảng đối chiếu các điều kiện đã đạt. |
| `TASK-006` | **Developer** | `src/services/ScholarshipAlertDispatcherService.js` | Viết `dispatchAlerts(evaluatedResults, studentProfile, notificationConfig, cacheFilePath)` gửi thông báo qua Gmail và Telegram, tuân thủ nguyên tắc Commit-After-Notify. | `TASK-005` (Hard) | Gửi thành công và cập nhật cache cho cả lần đầu lẫn lần nhắc hạn 7 ngày. |
| `TASK-007` | **Developer** | `src/services/ScholarshipCatalogService.js` | Viết dịch vụ đọc, chuẩn hóa và import danh sách học bổng từ JSON/CSV (`loadCatalog`, `importScholarshipsFromRows`). | `TASK-001` (Hard) | Đọc và validate danh sách học bổng mẫu không lỗi. |
| `TASK-008` | **Developer** | `src/services/ScholarshipFinderOrchestratorService.js` | Viết `runScholarshipSearchAndAlert(settings, referenceDateIso)` kết nối toàn bộ pipeline: `Load Profile & Catalog -> Normalize Scores -> Evaluate Eligibility -> Filter Deduplication -> Dispatch Gmail & Telegram -> Return Summary`. | `TASK-004`, `TASK-006`, `TASK-007` (Hard) | Chạy trọn vẹn luồng end-to-end trả về báo cáo tổng hợp. |
| `TASK-009` | **Test Engineer** | `tests/unit/ScoreNormalizerAndEligibility.test.js` | Viết Unit Test kiểm thử quy đổi GPA thang 10 -> 4.0, quy đổi chéo IELTS <-> TOEFL, khớp tên trường viết tắt, chặn sai quốc tịch và lọc học bổng hết hạn (`TC-SCH-001`, `003`, `004`, `005`). | `TASK-002`, `TASK-003`, `TASK-004` (Hard) | Toàn bộ unit test pass 100%. |
| `TASK-010` | **Test Engineer** | `tests/integration/ScholarshipAlertPipeline.test.js` | Viết Integration Test kiểm thử toàn bộ pipeline tìm kiếm học bổng, gửi Gmail + Telegram, chống gửi trùng và nhắc hạn khẩn cấp 7 ngày (`TC-SCH-002`, `006`). | `TASK-008` (Hard) | Toàn bộ test suite pass 100% và sinh bằng chứng QA trace. |
