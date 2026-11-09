# Tài Liệu Đặc Tả Thực Thi (Dev-Ready & Test-Ready): DM Jobs Outreach Tool (`dm-jobs`)

> **Phiên bản:** 1.0.0  
> **Đơn vị lập đặc tả:** AISE Squad 2 (`intake` + `ba` + `requirement_challenger` + `orchestrator` + `estimator_cost_controller`)  
> **Nguồn dữ liệu gốc:** `idea/dm-jobs/requirement.md`  
> **Mục tiêu hệ thống:** Hệ thống tự động hóa liên hệ xin việc bán thời gian / toàn thời gian (Part-time / Cleaning Service / Sales...) tới danh sách cửa hàng/doanh nghiệp mục tiêu (`Target Business HR / Assistant`) với **kiến trúc hạ tầng miễn phí 100% ($0 Free-Tier Infra)**, hỗ trợ nhập danh bạ (Excel/CSV/Manual/Google Maps), gửi lời chào phân nhánh theo ngành nghề, kịch bản hỏi đáp Q&A tự động có kiểm soát, tôn trọng tuyệt đối lệnh `STOP` (Opt-out chống spam) và chuyển tiếp thông minh cho người dùng (`Human Handoff + Email Notification`) khi có phản hồi hoặc nằm ngoài kịch bản mẫu.

---

## PHẦN 1 — INTAKE & PHÂN LOẠI (`intake`)

### 1.1 Bảng Phân Tách Yêu Cầu (`Stated Facts` / `Explicit Assumptions` / `Clarification Questions`)

| Phân loại | Mã tham chiếu | Nội dung chi tiết | Nguồn / Lý do kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-001` | Người dùng tìm việc part-time (VD: cleaning service, sales...) và muốn nhắn tin hỏi HR Manager / Assistant của các cơ sở kinh doanh (tham chiếu link Google Maps `https://maps.app.goo.gl/wGMNYkdUiMU4ySz46`) xem họ có đang tuyển dụng hay không để tiết kiệm thời gian thủ công. | `requirement.md` (L1-3, L5) |
| **Stated Fact** | `SF-002` | **Bước 1 (Lead Import):** Nhập danh sách doanh nghiệp mục tiêu (`Target Business HR`: Tên cơ sở/người liên hệ, Số điện thoại, Ngành nghề) qua file **Excel, CSV, nhập tay, hoặc kết quả tìm kiếm Google Maps**. | `requirement.md` (L8) |
| **Stated Fact** | `SF-003` | **Bước 2 (First Greeting / Conversation Flow theo loại công việc):** Thiết lập lời chào riêng cho từng kiểu công việc (VD: với `cleaning service` gửi lời chào `"Hello A"`, với `sale` gửi `"Hello B"`). | `requirement.md` (L9-11) |
| **Stated Fact** | `SF-004` | **Máy trạng thái hội thoại & Human Handoff:** Nếu đối phương trả lời -> chuyển sang trạng thái `RESPONSED`. Nếu câu trả lời khớp kịch bản Q&A cài sẵn thì trả lời theo mẫu (dưới tác động/xác nhận của người dùng); nếu nằm ngoài kịch bản mẫu thì **thông báo ngay qua Email cho người dùng** để người dùng trực tiếp vào nhắn tin đúng ý hơn là văn mẫu. | `requirement.md` (L3, L13) |
| **Stated Fact** | `SF-005` | **Chống Spam (`STOP` Compliance) & Hạ tầng $0 (100% Free Infra):** Tuyệt đối không spam nếu họ nhắn `STOP`. Người tìm việc part-time không có nhiều chi phí nên toàn bộ kiến trúc phải dùng **hạ tầng miễn phí hoàn toàn ($0)**. | `requirement.md` (L5) |
| **Explicit Assumption** | `EA-001` | **Kiến trúc $0 Free-Tier Infrastructure:** Sử dụng: (1) **Database & Backend:** SQLite local / Google Sheets + Google Apps Script (miễn phí 100%), (2) **Email Alert:** Gmail SMTP App Password / Apps Script `MailApp` (miễn phí 100 email/ngày), (3) **Kênh gửi tin nhắn $0:** Hỗ trợ **Assisted Click-to-Message / Deep-Link Queue** (`sms:`, `https://wa.me/`, Google Voice Web / Android SMS Gateway cá nhân của chính điện thoại người dùng) kết hợp Webhook nhận tin phản hồi mà không phải thuê bao Twilio trả phí đắt đỏ. | Giải quyết triệt để bài toán "infra free hoàn toàn" cho người lao động tìm việc part-time. |
| **Explicit Assumption** | `EA-002` | **Chuẩn hóa Số điện thoại E.164 & Chốt chặn DNC (`Do-Not-Contact`):** Mọi số điện thoại từ Google Maps / CSV (VD: `(734) 555-0199`, `734-555-0199`) đều được chuẩn hóa về định dạng `+17345550199` để làm khóa chính chống nhắn trùng và kiểm tra danh sách đen `STOP` vĩnh viễn. | Ngăn chặn việc nhập 2 file CSV có cùng 1 số điện thoại dẫn đến nhắn tin 2 lần cho cùng 1 HR. |
| **Clarification Question** | `CQ-001` | **Câu hỏi:** Khi câu trả lời của HR khớp với một nhánh trong kịch bản Q&A (`SCRIPT_MATCHED`), hệ thống nên tự động gửi ngay câu hỏi tiếp theo hay đặt vào hàng đợi `PENDING_USER_APPROVAL` (1-click duyệt gửi)?<br>- **Option A (Khuyến nghị):** Hỗ trợ cấu hình `autoReplyMode`: mặc định là `SEMI_AUTO_APPROVAL` (soạn sẵn câu trả lời Q&A chuẩn xác và gửi thông báo để người dùng bấm 1 nút duyệt gửi, đúng với ý *"dưới tác động của người dùng"* trong đề bài), hoặc bật `FULL_AUTO` cho câu hỏi sàng lọc đầu tiên.<br>- **Option B:** Tự động gửi 100% mọi câu trong Q&A. | Khuyến nghị **Option A** để vừa nhanh vừa an toàn, tự nhiên như người thật nhắn. |

### 1.2 Nhãn Bảo Mật, Tuân Thủ & Rủi Ro (`Security & Compliance Tags`)

- **[COMPLIANCE-TCPA-OPT-OUT]:** Tuân thủ nghiêm ngặt quy định chống spam tin nhắn. Bất kỳ tin nhắn phản hồi nào chứa từ khóa từ chối (`STOP`, `UNSUBSCRIBE`, `CANCEL`, `REMOVE`, `DO NOT TEXT`, `WRONG NUMBER`, `KHÔNG LÀM PHIỀN`) đều kích hoạt khóa cứng `OPTED_OUT_STOP` ở tầng cơ sở dữ liệu. Mọi lệnh gửi tin về sau tới số điện thoại đó đều bị chặn ở mức hệ thống (`Hard Guard`).
- **[COMPLIANCE-ANTI-BOT]:** Đối với dữ liệu từ Google Maps (`https://maps.app.goo.gl/...`), không dùng bot vượt CAPTCHA của Google; sử dụng công cụ bóc tách từ dữ liệu người dùng copy/export hợp lệ (CSV/JSON/vCard) hoặc Google Places API Free Tier.

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1 Bảng Yêu Cầu Nghiệp Vụ Có Mã Truy Vết (`REQ-001` .. `REQ-010`)

| Mã REQ | Tên Yêu Cầu | Mô tả nghiệp vụ chi tiết | Truy vết nguồn | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | **Multi-Source Target Business Importer** | Nhập danh sách `Target Business HR` (Tên doanh nghiệp/HR, Số điện thoại, Loại hình công việc, Địa chỉ/Link Google Maps) từ file CSV, Excel (`.xlsx`), nhập tay hoặc kết quả tìm kiếm Google Maps; chuẩn hóa số điện thoại về chuẩn `E.164`. | `requirement.md` L1, L8 | `P0 Must-Have` |
| `REQ-002` | **Job-Type Greeting Template Engine** | Cấu hình và tự động chọn mẫu lời chào đầu tiên (`First Greeting`) theo từng loại công việc (`CLEANING_SERVICE` -> Mẫu A, `SALES` -> Mẫu B, `RESTAURANT` -> Mẫu C...) có cá nhân hóa biến `{businessName}`, `{hrName}`. | `requirement.md` L9-11 | `P0 Must-Have` |
| `REQ-003` | **Conversation Lifecycle State Machine** | Quản lý vòng đời trạng thái của từng liên hệ: `NEW_TARGET` -> `GREETING_SENT` -> `RESPONSED` -> `IN_QA_FLOW` -> `NEEDS_HUMAN_REPLY` -> `QUALIFIED_MATCH` / `REJECTED_NOT_HIRING` / `OPTED_OUT_STOP`. | `requirement.md` L3, L13 | `P0 Must-Have` |
| `REQ-004` | **Hard Opt-Out (`STOP`) & Anti-Spam Guard** | Tự động nhận diện lệnh `STOP` (và các biến thể từ chối) từ tin nhắn đến, chuyển ngay trạng thái sang `OPTED_OUT_STOP`, đưa số điện thoại vào danh sách chặn vĩnh viễn (`DNC Blacklist`) và chặn mọi tin nhắn đi tiếp theo. | `requirement.md` L5 | `P0 Must-Have` |
| `REQ-005` | **Rule-Based Q&A Flow & Intent Matcher** | Cho phép thiết lập kịch bản các câu hỏi/trả lời sàng lọc điều kiện làm việc (Giờ làm, Mức lương/giờ, Địa điểm, Yêu cầu kinh nghiệm). Nếu HR trả lời khớp kịch bản (`YES_HIRING`, `ASK_EXPERIENCE`, `ASK_SCHEDULE`), hệ thống gợi ý hoặc phản hồi theo mẫu đã duyệt. | `requirement.md` L3, L13 | `P0 Must-Have` |
| `REQ-006` | **Unmatched Reply Detection & Email Handoff Alert** | Khi nhận được phản hồi đầu tiên từ HR hoặc khi nội dung trả lời **không khớp** với kịch bản Q&A mẫu, lập tức chuyển trạng thái sang `RESPONSED` / `NEEDS_HUMAN_REPLY` và gửi Email thông báo cho người dùng vào tiếp quản. | `requirement.md` L3, L13 | `P0 Must-Have` |
| `REQ-007` | **Zero-Cost ($0) Free-Tier Architecture & Storage** | Lưu trữ toàn bộ danh bạ, lịch sử hội thoại, kịch bản Q&A và danh sách chặn `STOP` trên nền tảng miễn phí 100% (Local JSON/SQLite hoặc Google Sheets + Apps Script) và hỗ trợ gửi tin qua cổng miễn phí. | `requirement.md` L5 | `P0 Must-Have` |
| `REQ-008` | **Daily Rate Limiter & Quiet Hours Guard** | Giới hạn số lượng tin nhắn chào mới mỗi ngày (`MAX_DAILY_GREETINGS`) và chỉ cho phép gửi trong khung giờ hành chính của doanh nghiệp (`09:00 - 18:00` giờ địa phương) để tránh bị đánh dấu spam. | `requirement.md` L5 | `P1 Should-Have` |
| `REQ-009` | **Duplicate Contact Prevention Across Imports** | Khi người dùng import nhiều file CSV hoặc nhiều lần tìm kiếm Google Maps chồng lấp khu vực, hệ thống tự động phát hiện số điện thoại đã tồn tại và giữ nguyên lịch sử hội thoại cũ thay vì tạo bản ghi mới và nhắn lại từ đầu. | Yêu cầu kỹ thuật cốt lõi | `P1 Should-Have` |
| `REQ-010` | **Interactive Outreach Dashboard & Quick Reply UI** | Cung cấp bảng điều khiển hiển thị các cuộc hội thoại cần người dùng phản hồi (`NEEDS_HUMAN_REPLY`) lên đầu danh sách kèm lịch sử chat để người dùng trả lời chỉ trong vài giây. | `requirement.md` L6, L13 | `P2 Nice-to-Have` |

---

### 2.2 Data Structures, Constants & `settings.json` Schema (No Magic Numbers / Strings)

#### A. Bảng `CONSTANTS` & `ENUMS` (`src/constants/DmJobsConstants.js`)

```javascript
export const OutreachContactStatus = Object.freeze({
  NEW_TARGET: "NEW_TARGET",                     // Mới import, chưa nhắn tin
  GREETING_SENT: "GREETING_SENT",               // Đã gửi lời chào đầu tiên
  RESPONSED: "RESPONSED",                       // Đối phương đã trả lời
  IN_QA_FLOW: "IN_QA_FLOW",                     // Đang trong luồng hỏi đáp Q&A theo kịch bản
  NEEDS_HUMAN_REPLY: "NEEDS_HUMAN_REPLY",       // Câu trả lời ngoài kịch bản, chờ người dùng nhắn
  QUALIFIED_MATCH: "QUALIFIED_MATCH",           // Đạt yêu cầu đôi bên, sẵn sàng phỏng vấn/đi làm
  NOT_HIRING_CLOSED: "NOT_HIRING_CLOSED",       // Họ báo hiện không tuyển người
  OPTED_OUT_STOP: "OPTED_OUT_STOP",             // Họ nhắn STOP - Cấm liên hệ vĩnh viễn
});

export const OutreachJobType = Object.freeze({
  CLEANING_SERVICE: "CLEANING_SERVICE",
  SALES_REPRESENTATIVE: "SALES_REPRESENTATIVE",
  RESTAURANT_HOSPITALITY: "RESTAURANT_HOSPITALITY",
  GENERAL_PART_TIME: "GENERAL_PART_TIME",
});

export const ReplyIntentType = Object.freeze({
  OPT_OUT_STOP: "OPT_OUT_STOP",                 // Nhắn STOP / Unsubscribe
  POSITIVE_HIRING: "POSITIVE_HIRING",           // Có tuyển ("Yes, we are hiring", "Can you work weekends?")
  NEGATIVE_NOT_HIRING: "NEGATIVE_NOT_HIRING",   // Không tuyển ("No openings right now")
  SCRIPT_QA_MATCH: "SCRIPT_QA_MATCH",           // Khớp một câu hỏi trong kịch bản Q&A
  UNMATCHED_COMPLEX: "UNMATCHED_COMPLEX",       // Ngoài kịch bản -> Chuyển người dùng trả lời
});

export const STOP_OPT_OUT_KEYWORDS = Object.freeze([
  "stop", "unsubscribe", "cancel", "remove", "opt out", "opt-out",
  "do not text", "don't text", "wrong number", "spam", "khong lam phien"
]);

export const DM_JOBS_LIMITS = Object.freeze({
  DEFAULT_COUNTRY_CODE: "+1",
  MIN_PHONE_DIGITS: 10,
  MAX_PHONE_DIGITS: 15,
  MAX_DAILY_INITIAL_MESSAGES: 25,               // Chống spam theo ngày
  MIN_DELAY_BETWEEN_MESSAGES_SEC: 45,           // Giãn cách tối thiểu giữa 2 tin nhắn
  QUIET_HOURS_START_24H: 19,                    // Không nhắn sau 19:00 tối
  QUIET_HOURS_END_24H: 9,                       // Không nhắn trước 09:00 sáng
});
```

#### B. Core Data Interfaces (`src/types/DmJobsTypes.ts`)

```typescript
export interface TargetBusinessContact {
  contactId: string;                 // UUID hoặc Hash từ normalizedPhoneE164
  businessName: string;
  contactPersonName: string | null;  // Tên HR Manager / Assistant nếu biết
  rawPhone: string;
  normalizedPhoneE164: string;       // VD: "+17345550199" (Khóa duy nhất)
  jobType: string;                   // OutreachJobType
  sourceType: "CSV" | "EXCEL" | "MANUAL" | "GOOGLE_MAPS";
  googleMapsUrl?: string;
  status: string;                    // OutreachContactStatus
  isOptedOut: boolean;               // true nếu đã nhắn STOP
  optedOutAtIso?: string;
  lastMessageSentAtIso?: string;
  lastReplyReceivedAtIso?: string;
  currentQaStepId?: string | null;
  conversationHistory: Array<{
    direction: "OUTBOUND" | "INBOUND";
    text: string;
    timestampIso: string;
    handledBy: "TEMPLATE_AUTO" | "USER_MANUAL" | "INCOMING_HR";
  }>;
}

export interface QaScriptRule {
  ruleId: string;
  jobType: string;
  stepOrder: number;
  triggerKeywords: string[];         // VD: ["yes", "hiring", "available", "part time", "how much experience"]
  suggestedReplyTemplate: string;    // Câu trả lời mẫu khi khớp kịch bản
  requiresUserApproval: boolean;     // true = hỏi ý người dùng trước khi bắn tin
}

export interface IncomingReplyEvaluationResult {
  contactId: string;
  normalizedPhoneE164: string;
  detectedIntent: string;            // ReplyIntentType
  previousStatus: string;
  newStatus: string;                 // OutreachContactStatus
  matchedRuleId: string | null;
  suggestedReplyText: string | null;
  shouldSendEmailAlertToUser: boolean;
  emailAlertReason: string | null;
}
```

#### C. Schema cấu hình `settings.json`

```json
{
  "storageConfig": {
    "contactsDbFilePath": "./data/target_contacts.json",
    "dncBlacklistFilePath": "./data/dnc_stop_blacklist.json",
    "templatesFilePath": "./data/job_templates_and_qa.json"
  },
  "outreachSafety": {
    "defaultCountryCode": "+1",
    "maxDailyInitialGreetings": 25,
    "minDelayBetweenMessagesSec": 45,
    "enforceBusinessHoursOnly": true,
    "businessHoursStart24h": 9,
    "businessHoursEnd24h": 19,
    "requireUserApprovalForQaReplies": true
  },
  "greetingTemplates": {
    "CLEANING_SERVICE": "Hi {businessName}, I noticed your cleaning service on Google Maps. Are you currently hiring part-time house cleaners? Thank you!",
    "SALES_REPRESENTATIVE": "Hello {businessName} team, I am looking for a part-time/commission sales opportunity in the area. Are you currently accepting applications?",
    "GENERAL_PART_TIME": "Hi {businessName}, I am reaching out to ask if you have any part-time job openings available right now? Thanks!"
  },
  "notifications": {
    "email": {
      "enabled": true,
      "userAlertEmail": "REPLACE_WITH_USER_EMAIL@gmail.com",
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

1. **`ContactImportService.js` & `ContactImportServiceHelper.js`**
   - `ContactImportServiceHelper.normalizePhoneToE164(rawPhone, defaultCountryCode = "+1")`
     - *Mục đích:* Làm sạch ký tự đặc biệt `( ) - .` và chuẩn hóa số điện thoại về định dạng chuẩn quốc tế `+1XXXXXXXXXX`; ném lỗi hoặc từ chối nếu số chữ số `< 10` hoặc `> 15`.
   - `ContactImportServiceHelper.parseCsvAndGoogleMapsRows(rawRows, defaultJobType)`
     - *Mục đích:* Chuyển đổi dữ liệu từ CSV/Excel hoặc danh sách bóc tách từ Google Maps thành các đối tượng `TargetBusinessContact`.
   - `ContactImportService.importAndDeduplicateContacts(rawInputList, existingContactsMap, dncBlacklistSet)`
     - *Mục đích:* Nhập danh bạ mới, tự động bỏ qua các số đã tồn tại hoặc nằm trong danh sách đen `OPTED_OUT_STOP` (`dncBlacklistSet`).

2. **`GreetingAndQaFlowService.js` & `GreetingAndQaFlowServiceHelper.js`**
   - `GreetingAndQaFlowServiceHelper.renderGreetingTemplate(jobType, businessName, contactPersonName, templatesMap)`
     - *Mục đích:* Sinh lời chào đầu tiên theo đúng ngành nghề (`CLEANING_SERVICE` -> `"Hello A"`, `SALES_REPRESENTATIVE` -> `"Hello B"`), thay thế biến `{businessName}` an toàn.
   - `GreetingAndQaFlowServiceHelper.detectStopOptOut(incomingMessageText)`
     - *Mục đích:* Kiểm tra xem tin nhắn đến có phải là lệnh `STOP` / từ chối nhận tin hay không (xử lý chính xác cả trường hợp viết hoa/thường, dấu câu như `"STOP!"`, `"Please stop texting"`).
   - `GreetingAndQaFlowServiceHelper.matchQaScriptRule(incomingMessageText, jobType, qaRules)`
     - *Mục đích:* Đối chiếu câu trả lời của HR với kịch bản Q&A đã cài đặt; phân loại thành `POSITIVE_HIRING`, `NEGATIVE_NOT_HIRING`, `SCRIPT_QA_MATCH`, hoặc `UNMATCHED_COMPLEX`.
   - `GreetingAndQaFlowService.processIncomingHrReply(contact, incomingMessageText, qaRules, dncBlacklistSet)`
     - *Mục đích:* Cập nhật trạng thái liên hệ sang `RESPONSED` / `OPTED_OUT_STOP` / `NEEDS_HUMAN_REPLY`, kích hoạt thông báo Email cho người dùng khi có phản hồi hoặc khi câu hỏi nằm ngoài kịch bản mẫu.

3. **`OutreachSafetyGuardService.js` & `OutreachSafetyGuardServiceHelper.js`**
   - `OutreachSafetyGuardServiceHelper.canSendMessageToContact(contact, dncBlacklistSet, dailySentCount, currentHour24, safetyConfig)`
     - *Mục đích:* Chốt chặn an toàn trước mọi lệnh gửi tin: kiểm tra `contact.isOptedOut === false`, không nằm trong `dncBlacklistSet`, chưa vượt `maxDailyInitialGreetings`, và nằm trong khung giờ cho phép.

4. **`UserHandoffEmailService.js` & `UserHandoffEmailServiceHelper.js`**
   - `UserHandoffEmailServiceHelper.buildHandoffAlertEmail(contact, incomingMessageText, evaluationResult)`
     - *Mục đích:* Soạn email thông báo tức thời cho người dùng khi HR phản hồi (`status = RESPONSED` hoặc `NEEDS_HUMAN_REPLY`), đính kèm toàn bộ lịch sử trò chuyện và link trả lời nhanh.

---

### 2.4 Ma Trận 5 Trạng Thái UX (`5 UX States Matrix`)

| Trạng thái | Điều kiện kích hoạt | Phản hồi trên Giao diện Quản lý / Email Notification | Hành động điều hướng (CTA) |
| :--- | :--- | :--- | :--- |
| **1. Ideal State** | Danh bạ đã import sạch sẽ; lời chào gửi đúng ngành nghề; HR trả lời `"Yes, we are hiring part-time cleaners"` -> hệ thống chuyển trạng thái `RESPONSED` và gửi Email báo tin vui cho người dùng. | Hiển thị thẻ liên hệ màu xanh `RESPONSED - Có phản hồi`, nội dung tin nhắn của HR, câu trả lời gợi ý từ bộ Q&A và gửi Email tiêu đề: `🔔 [DM-Jobs] Cơ sở ABC Cleaning vừa trả lời tin nhắn của bạn!`. | Bấm `"Duyệt gửi câu trả lời Q&A gợi ý"` hoặc `"Tự gõ tin nhắn trả lời riêng"`. |
| **2. Loading State** | Đang đọc file CSV/Excel hoặc đang xử lý hàng đợi gửi lời chào có giãn cách (`45s/tin`). | Hiển thị thanh tiến trình: `"Đang nhập & chuẩn hóa 120 liên hệ từ Google Maps/CSV..."` hoặc `"Hàng đợi gửi an toàn: Đã gửi 5/20 lời chào (Giãn cách chống spam 45s)..."`. | Nút `"Tạm dừng hàng đợi (Pause Queue)"` bất kỳ lúc nào. |
| **3. Empty State** | Chưa có liên hệ nào trong danh sách hoặc không có cuộc trò chuyện nào đang chờ phản hồi. | Hiển thị hướng dẫn trực quan 3 bước: `(1) Import CSV / Google Maps -> (2) Chọn mẫu lời chào (Cleaning / Sales) -> (3) Bắt đầu liên hệ`. | Nút `"Tải file CSV mẫu"` hoặc `"Thêm doanh nghiệp từ Google Maps"`. |
| **4. Error State** | File CSV sai định dạng, số điện thoại không hợp lệ, hoặc cố tình gửi tin nhắn tới số đã nhắn `STOP`. | Hiển thị thông báo chặn rõ ràng: `⛔ CHẶN GỬI TIN: Số +17345550199 đã yêu cầu STOP vào ngày ...` hoặc `❌ Dòng 14 CSV thiếu số điện thoại hợp lệ`. | Nút `"Tải báo cáo các dòng lỗi"` hoặc `"Xem danh sách DNC Blacklist"`. |
| **5. Partial / Overflow State** | Import 100 dòng từ Google Maps nhưng có 15 dòng không có số điện thoại, 10 dòng bị trùng, hoặc HR nhắn câu hỏi phức tạp ngoài kịch bản Q&A. | Nhập thành công 75 liên hệ hợp lệ và báo cáo rõ `15 thiếu SĐT | 10 trùng lặp`; với câu trả lời phức tạp của HR, gắn nhãn vàng nổi bật `⚠ NEEDS HUMAN REPLY (Ngoài kịch bản mẫu)` và gửi Email ngay cho người dùng. | Nút `"Mở khung chat trả lời trực tiếp"` để người dùng nhắn đúng ý mình. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

### 3.1 Lỗ hổng 1: Nguy cơ vi phạm `STOP` Opt-Out do nhập lại file CSV hoặc chuẩn hóa SĐT không đồng nhất
- **Rủi ro thực tế:** Ngày hôm trước, cửa hàng A (`(734) 555-0199`) đã nhắn `"STOP"`. Tuần sau, người dùng lại tìm kiếm Google Maps khu vực đó và import một file CSV mới chứa số `734-555-0199`. Nếu hệ thống lưu trạng thái `STOP` gắn với dòng dữ liệu cũ hoặc so sánh chuỗi thô `"(734) 555-0199" !== "734-555-0199"`, hệ thống sẽ gửi tin nhắn lần nữa và vi phạm nghiêm trọng cam kết chống spam!
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Tách riêng một bảng/file bất biến `dnc_stop_blacklist.json` chỉ lưu tập hợp các số điện thoại đã chuẩn hóa `normalizedPhoneE164` (`"+17345550199"`).
  - Mọi hàm gửi tin (`OutreachSafetyGuardService`) và hàm import (`ContactImportService`) **bắt buộc** phải gọi `normalizePhoneToE164` trước tiên và kiểm tra `dncBlacklistSet.has(normalizedPhoneE164)`. Nếu trả về `true`, ném lỗi `ERR_CONTACT_OPTED_OUT_STOP` và hủy lệnh gửi ngay lập tức.

### 3.2 Lỗ hổng 2: Nhận diện sai lệnh `STOP` (Bỏ sót biến thể hoặc Bắt nhầm câu tích cực có chữ "stop by")
- **Rủi ro thực tế:**
  1. Nếu chỉ kiểm tra `text.trim().toUpperCase() === "STOP"`, hệ thống sẽ bỏ sót các tin nhắn từ chối thực tế như `"Stop texting me"`, `"Please remove my number"`, `"Wrong number, stop"`.
  2. Ngược lại, nếu chỉ kiểm tra `text.toLowerCase().includes("stop")`, hệ thống sẽ **bắt nhầm câu mời phỏng vấn của HR**: *"Yes we are hiring! Can you **stop by** our office tomorrow at 2 PM?"* thành lệnh `OPTED_OUT_STOP` và khóa luôn cơ hội việc làm của người dùng!
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Trong `GreetingAndQaFlowServiceHelper.detectStopOptOut`:
    - Loại trừ hoàn toàn các cụm từ tích cực chứa chữ `"stop"`: `"stop by"`, `"stop in"`, `"non-stop"`, `"one stop"`.
    - Khớp chính xác tin nhắn chỉ gồm 1 từ `"stop"` / `"unsubscribe"` / `"cancel"` HOẶC chứa các cụm từ từ chối rõ nghĩa: `"stop texting"`, `"stop messaging"`, `"do not contact"`, `"don't text"`, `"remove my number"`, `"take me off"`.

### 3.3 Lỗ hổng 3: Máy móc trả lời văn mẫu khi HR hỏi câu phức tạp (Làm mất thiện cảm tuyển dụng)
- **Rủi ro thực tế:** Khi HR trả lời một câu dài hoặc hỏi nhiều ý (VD: *"We might have a weekend shift in Ann Arbor, do you have your own car and cleaning supplies?"*), nếu bot tự động bắn một câu văn mẫu ngô nghê không ăn nhập thì HR sẽ biết ngay là bot spam và từ chối tuyển dụng.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Áp dụng nguyên tắc **Conservative Script Matching (Khớp kịch bản thận trọng)**:
    - Chỉ gắn nhãn `SCRIPT_QA_MATCH` khi câu trả lời của HR khớp độ tin cậy cao với duy nhất 1 nhánh Q&A và không chứa câu hỏi mở phức tạp.
    - Trong mọi trường hợp nghi ngờ hoặc không khớp 100%, hệ thống **bắt buộc** chuyển sang trạng thái `NEEDS_HUMAN_REPLY`, **không** tự động gửi văn mẫu, và bắn Email thông báo để người dùng vào trả lời bằng ngôn ngữ tự nhiên.

### 3.4 Lỗ hổng 4: Khóa tài khoản / Chặn số điện thoại người dùng do gửi hàng loạt cùng một giây
- **Rủi ro thực tế:** Nếu người dùng import 200 cửa hàng từ Google Maps và hệ thống bắn 200 tin nhắn trong vòng 10 giây với cùng một nội dung y hệt, nhà mạng sẽ khóa chiều gửi tin nhắn của số điện thoại người dùng ngay lập tức.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Trong `OutreachSafetyGuardService`: Khóa cứng hạn mức `MAX_DAILY_INITIAL_MESSAGES = 25`, giãn cách tối thiểu `MIN_DELAY_BETWEEN_MESSAGES_SEC = 45` giây cộng thêm jitter ngẫu nhiên, và kiểm tra khung giờ hành chính (`09:00 - 19:00`).

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1 Kịch Bản Kiểm Thử `Given / When / Then` (3 Tầng)

#### Tầng 1: P0 Happy Paths (Người dùng sử dụng thường xuyên nhất)
- **TC-DMJ-001 (Import danh bạ từ CSV / Google Maps và chuẩn hóa số điện thoại E.164):**
  - **Given:** Danh sách 3 doanh nghiệp từ Google Maps/CSV:
    1. `{ businessName: "Sparkle Home Cleaning", rawPhone: "(734) 555-0101", jobType: "CLEANING_SERVICE" }`
    2. `{ businessName: "Metro Auto Sales", rawPhone: "313-555-0202", jobType: "SALES_REPRESENTATIVE" }`
    3. Bản ghi trùng số điện thoại `"734.555.0101"`.
  - **When:** Gọi `ContactImportService.importAndDeduplicateContacts`.
  - **Then:** Hệ thống chuẩn hóa đúng thành `"+17345550101"` và `"+13135550202"`, loại bỏ bản ghi thứ 3 bị trùng, trả về đúng 2 liên hệ ở trạng thái `NEW_TARGET`.
- **TC-DMJ-002 (Sinh lời chào phân nhánh đúng theo từng loại công việc):**
  - **Given:** Liên hệ 1 có `jobType = "CLEANING_SERVICE"` và Liên hệ 2 có `jobType = "SALES_REPRESENTATIVE"`.
  - **When:** Gọi `GreetingAndQaFlowService.prepareInitialGreeting(contact, templatesMap)`.
  - **Then:** Liên hệ 1 nhận đúng mẫu lời chào dành cho Cleaning Service có chèn tên `"Sparkle Home Cleaning"`, Liên hệ 2 nhận đúng mẫu lời chào dành cho Sales có chèn tên `"Metro Auto Sales"`, và trạng thái chuyển sang `GREETING_SENT`.
- **TC-DMJ-003 (Xử lý phản hồi của HR: Chuyển trạng thái `RESPONSED`, khớp Q&A hoặc báo Email khi ngoài kịch bản):**
  - **Given:** Liên hệ đang ở trạng thái `GREETING_SENT`.
    - Trường hợp A: HR nhắn `"Yes, we are hiring! How many years of experience do you have?"` (khớp kịch bản Q&A bước hỏi kinh nghiệm).
    - Trường hợp B: HR nhắn `"Can you call our manager Sarah at extension 402 after 3pm?"` (ngoài kịch bản mẫu).
  - **When:** Gọi `GreetingAndQaFlowService.processIncomingHrReply`.
  - **Then:**
    - Trường hợp A chuyển sang `RESPONSED` / `IN_QA_FLOW`, tạo sẵn `suggestedReplyText` từ kịch bản Q&A và gửi thông báo cho người dùng xác nhận.
    - Trường hợp B chuyển sang `NEEDS_HUMAN_REPLY`, `suggestedReplyText = null`, và kích hoạt `UserHandoffEmailService` gửi Email thông báo ngay cho người dùng vào nhắn trực tiếp.

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-DMJ-004 (Chốt chặn cứng khi HR nhắn `STOP` — Hard Opt-Out Compliance):**
  - **Given:** Liên hệ `"+17345550101"` nhắn phản hồi `"STOP"` (hoặc `"Please stop texting me"`).
  - **When:** Hệ thống xử lý tin nhắn đến và sau đó có một lệnh cố tình gửi thêm tin nhắn cho `"+17345550101"`.
  - **Then:** Trạng thái liên hệ chuyển ngay lập tức sang `OPTED_OUT_STOP`, số `"+17345550101"` được ghi vào `dncBlacklistSet`, không gửi bất kỳ tin nhắn tự động nào nữa, và lệnh cố tình gửi tin bị `OutreachSafetyGuardService` chặn đứng với lỗi `ERR_CONTACT_OPTED_OUT_STOP`.
- **TC-DMJ-005 (Từ chối số điện thoại rác / rỗng khi Import):**
  - **Given:** Dòng dữ liệu CSV có `rawPhone = "123"` hoặc `rawPhone = ""` hoặc `"abc-def-ghij"`.
  - **When:** Gọi `ContactImportService.importAndDeduplicateContacts`.
  - **Then:** Các dòng lỗi bị tách riêng vào mảng `rejectedRows` kèm lý do `INVALID_PHONE_FORMAT`, không làm crash quá trình import các dòng hợp lệ khác.

#### Tầng 3: Boundary & Rare Edge Cases (`0`, `-1`, `MAX`, `Empty`, `Duplicate`, `Concurrent`)
- **TC-DMJ-006 (Phân biệt thông minh giữa `"STOP"` từ chối và `"stop by"` mời phỏng vấn):**
  - **Given:** HR nhắn tin: `"Hi! Yes we have part-time cleaning shifts. Can you stop by our office tomorrow morning?"`.
  - **When:** Gọi `GreetingAndQaFlowServiceHelper.detectStopOptOut(text)`.
  - **Then:** Hàm trả về `false` (tuyệt đối không khóa nhầm thành `OPTED_OUT_STOP`), và phân loại đúng vào nhánh phản hồi tích cực cần người dùng/Q&A xử lý.
- **TC-DMJ-007 (Chặn gửi vượt hạn mức ngày `MAX_DAILY_INITIAL_MESSAGES` và ngoài khung giờ hành chính):**
  - **Given:** Người dùng đã gửi đủ `25` lời chào trong ngày (`dailySentCount = 25`) hoặc đồng hồ hệ thống đang là `22:30` đêm (`currentHour24 = 22`).
  - **When:** Gọi `OutreachSafetyGuardServiceHelper.canSendMessageToContact`.
  - **Then:** Trả về `{ allowed: false, reason: "DAILY_LIMIT_REACHED" }` (hoặc `"OUTSIDE_BUSINESS_HOURS"`), giữ liên hệ ở trạng thái `NEW_TARGET` chờ sáng hôm sau.

---

### 4.2 Quy Trình 5 Bước Kiểm Chứng Bề Mặt Thật Cho QA Reviewer (`5-Step Real-Surface Verification`)

1. **Bước 1 — `Launch`:**
   - Khởi tạo môi trường với `settings.example.json` và cơ sở dữ liệu JSON/SQLite hoàn toàn miễn phí ($0 infra).
2. **Bước 2 — `Doctor`:**
   - Kiểm tra sự tồn tại và quyền ghi của `target_contacts.json`, `dnc_stop_blacklist.json`, và kiểm tra bộ quy tắc `STOP_OPT_OUT_KEYWORDS`.
3. **Bước 3 — `Drive`:**
   - Thực thi trọn vẹn workflow: (B1) Import danh sách cửa hàng Cleaning & Sales từ dữ liệu Google Maps/CSV -> (B2) Sinh lời chào theo từng ngành -> (B3) Giả lập 3 luồng phản hồi từ HR: (1) Nhắn `STOP`, (2) Nhắn `"Can you stop by tomorrow?"` / khớp Q&A, (3) Nhắn câu hỏi ngoài kịch bản -> Kiểm tra việc sinh Email thông báo cho người dùng.
4. **Bước 4 — `Evidence`:**
   - Lưu lại trace trạng thái hội thoại (`NEW_TARGET -> GREETING_SENT -> RESPONSED / NEEDS_HUMAN_REPLY / OPTED_OUT_STOP`) và nội dung Email Handoff.
5. **Bước 5 — `Cleanup`:**
   - Xóa các file database tạm thời tạo ra trong quá trình kiểm thử.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role Phụ Trách | File Mục Tiêu | Mô Tả Chi Tiết Hàm Cần Viết | Phụ Thuộc | Lệnh Verify & Tiêu Chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `src/constants/DmJobsConstants.js` & `settings.example.json` | Định nghĩa đầy đủ `OutreachContactStatus`, `OutreachJobType`, `ReplyIntentType`, `STOP_OPT_OUT_KEYWORDS`, `DM_JOBS_LIMITS` và file cấu hình mẫu `settings.example.json`. | *None* | Import kiểm tra không lỗi cú pháp, không chứa magic numbers/strings. |
| `TASK-002` | **Developer** | `src/services/helpers/ContactImportServiceHelper.js` & `src/services/ContactImportService.js` | Viết `normalizePhoneToE164`, `parseCsvAndGoogleMapsRows`, và `importAndDeduplicateContacts` (loại bỏ trùng lặp và chặn ngay từ đầu các số nằm trong `dncBlacklistSet`). | `TASK-001` (Hard) | Test import danh sách lẫn lộn SĐT hợp lệ, SĐT trùng, SĐT lỗi và SĐT trong blacklist trả về kết quả phân loại chính xác. |
| `TASK-003` | **Developer** | `src/services/helpers/OutreachSafetyGuardServiceHelper.js` & `src/services/OutreachSafetyGuardService.js` | Viết `canSendMessageToContact` kiểm tra 4 chốt chặn: (1) Không phải `OPTED_OUT_STOP`, (2) Không nằm trong `dncBlacklistSet`, (3) Chưa vượt quota ngày, (4) Trong khung giờ hành chính. | `TASK-001` (Hard) | Mọi liên hệ đã `STOP` hoặc ngoài giờ `09:00-19:00` đều bị chặn 100%. |
| `TASK-004` | **Developer** | `src/services/helpers/GreetingAndQaFlowServiceHelper.js` | Viết 3 hàm xử lý ngôn ngữ cốt lõi: `renderGreetingTemplate` (theo ngành nghề Cleaning vs Sales), `detectStopOptOut` (phân biệt chính xác `"STOP"` với `"stop by"`), và `matchQaScriptRule` (khớp kịch bản Q&A). | `TASK-001` (Hard) | Test `"STOP"` trả về `true`, `"Can you stop by at 2pm?"` trả về `false`. |
| `TASK-005` | **Developer** | `src/services/GreetingAndQaFlowService.js` | Viết `prepareInitialGreeting` và `processIncomingHrReply` điều phối máy trạng thái (`NEW_TARGET -> GREETING_SENT -> RESPONSED / IN_QA_FLOW / NEEDS_HUMAN_REPLY / OPTED_OUT_STOP`). | `TASK-003`, `TASK-004` (Hard) | Chuyển trạng thái chính xác cho từng loại tin nhắn phản hồi của HR và cập nhật `conversationHistory`. |
| `TASK-006` | **Developer** | `src/services/helpers/UserHandoffEmailServiceHelper.js` & `src/services/UserHandoffEmailService.js` | Viết `buildHandoffAlertEmail` và `notifyUserOnHrReply` để gửi Email thông báo cho người dùng ngay khi HR trả lời hoặc khi câu hỏi nằm ngoài kịch bản mẫu. | `TASK-001`, `TASK-005` (Hard) | Email sinh ra có đầy đủ tên cơ sở, SĐT, link Google Maps, lịch sử chat và lý do cần người dùng phản hồi. |
| `TASK-007` | **Developer** | `src/services/FreeTierStorageService.js` | Viết dịch vụ lưu trữ bền vững $0 trên file JSON/SQLite local (và hỗ trợ xuất/nhập Google Sheets JSON) cho `contacts`, `dncBlacklist`, và `qaRules`. | `TASK-001` (Hard) | Đọc/ghi nguyên tử (atomic write) không làm hỏng file dữ liệu. |
| `TASK-008` | **Developer** | `src/services/DmJobsOrchestratorService.js` | Kết nối toàn bộ workflow B1 (Import) -> B2 (Greeting Batch) -> B3 (Webhook/Incoming Reply Processing & Email Handoff). | `TASK-002`..`TASK-007` (Hard) | Chạy luồng end-to-end từ import đến xử lý tin nhắn đến thành công. |
| `TASK-009` | **Test Engineer** | `tests/unit/StopComplianceAndPhoneNormalization.test.js` | Viết Unit Test chuyên sâu cho chuẩn hóa SĐT E.164, phát hiện `STOP` vs `"stop by"`, và chốt chặn `OutreachSafetyGuardService` (`TC-DMJ-001`, `004`, `005`, `006`, `007`). | `TASK-002`, `TASK-003`, `TASK-004` (Hard) | Toàn bộ unit test an toàn & chống spam pass 100%. |
| `TASK-010` | **Test Engineer** | `tests/integration/DmJobsWorkflow.test.js` | Viết Integration Test kiểm thử toàn bộ kịch bản B1 + B2 + B3 (Cleaning Service greeting, Sales greeting, Q&A match, Unmatched human handoff email, Re-import DNC persistence) (`TC-DMJ-002`, `003`). | `TASK-008` (Hard) | Toàn bộ test suite xanh 100% và sinh bằng chứng QA trace. |
