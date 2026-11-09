# ĐẶC TẢ KỸ THUẬT & THỰC THI: EXPENSE MANAGEMENT TOOL (GOOGLE APPS SCRIPT & MULTI-BANK DYNAMIC LEDGER)

> **Dự án:** `expense-management-tool`  
> **Phân nhóm:** Core SaaS / POS / Finance (Nhóm 1)  
> **Đơn vị lập đặc tả:** AISE Squad 1 — BA Team (`intake`, `ba`, `requirement_challenger`) & PM Team (`orchestrator`, `estimator_cost_controller`)  
> **Nguồn tham chiếu:** `idea/expense-management-tool/expense-management.md`, `idea/expense-management-tool/bank.md`, `idea/expense-management-tool/AGENT_STATE.md`  
> **Trạng thái:** Dev-Ready & Test-Ready  

---

## PHẦN 1 — INTAKE & PHÂN LOẠI HỢP ĐỒNG (`intake`)

### 1.1 Nhãn Bảo Mật & Rủi Ro (Security & Risk Tags)
- `auth`: Lớp bảo mật bằng mã PIN / Passcode (`showSecurityModal`, `validatePasscode`, lưu trong `settings.json` / `PropertiesService`), ẩn/khóa các sheet nhạy cảm cho đến khi người dùng xác thực thành công trong phiên làm việc.
- `payment`: Tự động phân tích email biến động số dư từ nhiều ngân hàng (Chase `no.reply.alerts@chase.com`, `no-reply@alert.chase.com`, Bank of America, Venmo...) để phân loại `Income` (Thu) / `Expense` (Chi) và ghi vào sổ cái tài chính (Ledger).
- `pii`: Đọc hộp thư Gmail cá nhân (qua nhãn `Finance-Alerts` hoặc bộ lọc tìm kiếm rộng) chứa thông tin giao dịch thẻ tín dụng, thẻ ghi nợ, tên cửa hàng (Merchant) và số tiền.
- `external_api`: Thực thi trong môi trường **Google Apps Script (GAS)** tương tác với `SpreadsheetApp`, `GmailApp`, `HtmlService`, `PropertiesService`, và hỗ trợ nhận tín hiệu thời gian thực qua `doPost(e)` Webhook (Google Cloud Pub/Sub).

### 1.2 Bảng Phân Tách: Stated Facts, Explicit Assumptions & Clarification Questions

| Phân loại | Mã tham chiếu | Nội dung chi tiết | Nguồn / Cơ sở |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-01` | Hệ thống chạy trên Google Apps Script (GAS) — toàn bộ các file `.gs` chia sẻ chung một Global Scope duy nhất, **tuyệt đối không sử dụng** cú pháp `require()`, `import`, `export` của Node.js trong các file `.gs` triển khai lên GAS. | `AGENT_STATE.md` (Critical Architectural Decision) |
| **Stated Fact** | `SF-02` | Cấu trúc bảng tính tháng chuẩn: Hàng `1–79` là bảng dự toán ngân sách động (Dynamic Budgeting Table) theo danh mục Cha-Con có gom nhóm (`shiftRowGroupDepth(1)` + `collapseAllRowGroups()`); Hàng `80` là dòng ranh giới tổng kết (`=SUM(B2:B79)`, `=SUM(D86:D500)`, `=B80-C80`); Hàng `83` là tiêu đề khu vực; Hàng `85` là Header của Sổ cái (Ledger Header). | `AGENT_STATE.md` |
| **Stated Fact** | `SF-03` | Quy tắc sống còn khi thêm giao dịch (`insertTransaction`): Bắt buộc dùng `insertRowAfter(85)` để chèn dòng mới tại **Hàng 86** (ngay dưới Header hàng 85, không bao giờ ghi đè hàng 85) và gọi `copyRowFormatting()` để kế thừa định dạng tiền tệ (`"0 đ"` hoặc định dạng tiền tệ của sheet), font chữ và màu nền. | `AGENT_STATE.md` (Important Note) |
| **Stated Fact** | `SF-04` | Yêu cầu nâng cấp Multi-Bank & Dynamic Income/Expense (`expense-management.md` Option 1 & Option 2): Đọc cấu hình từ tab `Config` gồm 4 cột cho quy tắc ngân hàng: `[Sender Email]`, `[Keyword]`, `[Transaction Type (Income/Expense)]`, `[Account Name]`. Ví dụ sender thực tế trong `bank.md`: `no.reply.alerts@chase.com` hoặc `no-reply@alert.chase.com`. | `expense-management.md`, `bank.md` |
| **Stated Fact** | `SF-05` | Hỗ trợ 2 chế độ thu thập email ngân hàng: (1) Quét định kỳ bằng `GmailApp.search()` trên nhãn `Finance-Alerts` hoặc bộ lọc rộng; (2) Nhận sự kiện real-time qua hàm `doPost(e)` khi được kích hoạt bởi Google Pub/Sub Webhook. | `expense-management.md` (Option 1 & Option 2) |
| **Stated Fact** | `SF-06` | Các cột của sổ cái giao dịch (Ledger Columns từ hàng 85 trở xuống) cần ghi nhận đầy đủ: `Date`, `Type (Income/Expense)`, `Account/Bank`, `Amount`, `Merchant/Description` (kèm khớp danh mục `"Parent > Child"`). | `expense-management.md`, `AGENT_STATE.md` |
| **Explicit Assumption** | `EA-01` | Vì tab `Config` vừa được dùng cho danh mục Cha-Con (`AGENT_STATE.md`) vừa được yêu cầu chứa 4 cột quy tắc Multi-Bank (`expense-management.md`), thiết kế chuẩn sẽ đặt **Bảng Danh Mục Cha-Con** ở cột `A:B` (`Parent Category`, `Child Category`) và **Bảng Quy Tắc Ngân Hàng (Bank Rules)** ở cột `D:G` (`Sender Email`, `Keyword`, `Transaction Type`, `Account Name`) trên cùng tab `Config` (hoặc hỗ trợ đọc tab `BankConfig` riêng nếu tồn tại). | Hợp nhất liền mạch `AGENT_STATE.md` và `expense-management.md` |
| **Explicit Assumption** | `EA-02` | Để chạy kiểm thử tự động (Unit Test bằng Vitest/Jest tại local trước khi `npx clasp push`), các hàm xử lý logic thuần trong `.gs` được kiểm thử thông qua bộ টেস্ট runner nạp global context giả lập (`MockSpreadsheetApp`, `MockGmailApp`). | Đảm bảo khả năng kiểm thử tự động CI/CD |

### 1.3 Câu Hỏi Làm Rõ (Clarification Questions)

| Mã | Câu hỏi | Các lựa chọn (Options) | Khuyến nghị (Recommendation) |
| :--- | :--- | :--- | :--- |
| `CQ-01` | Khi 1 email từ `no.reply.alerts@chase.com` chứa nhiều từ khóa hoặc khớp nhiều dòng trong bảng `Config`, thứ tự ưu tiên khớp quy tắc sẽ như thế nào? | **Option A:** Khớp theo thứ tự từ trên xuống dưới (First-match wins).<br>**Option B:** Khớp từ khóa dài nhất / cụ thể nhất trước (Longest keyword match wins, ví dụ `"direct deposit"` ưu tiên hơn `"deposit"`).<br>**Option C:** Tạo nhiều giao dịch cho mỗi từ khóa khớp. | **Khuyến nghị Option B:** Sắp xếp các rule của cùng một `Sender Email` theo độ dài `Keyword` giảm dần trước khi so khớp (Case-insensitive) để tránh nhận nhầm. |
| `CQ-02` | Các ngân hàng Mỹ (Chase, BoA, Venmo) gửi số tiền bằng `USD` (`$25.50`), trong khi giao diện hiện tại định dạng `"0 đ"` (`VND`). Sổ cái cần xử lý đa tiền tệ như thế nào? | **Option A:** Lưu nguyên số trị số học từ email và cho phép cấu hình `currencyFormat` + `exchangeRateUsdToVnd` trong `settings.json` (mặc định nếu `exchangeRate = 1` thì giữ nguyên số gốc).<br>**Option B:** Chỉ lưu USD.<br>**Option C:** Chỉ lưu VND. | **Khuyến nghị Option A:** Cấu hình linh hoạt trong `settings.json` để dùng được cho cả tài khoản ngân hàng Mỹ (`USD`) lẫn chi tiêu tại Việt Nam (`VND`). |

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1 Bảng Yêu Cầu Nghiệp Vụ (Traceability Matrix)

| Mã REQ | Tên yêu cầu | Mô tả nghiệp vụ chi tiết | Nguồn gốc | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | Xác thực Passcode & Bảo vệ Sheet (`SecurityService`) | Hiển thị hộp thoại nhập Passcode (`showSecurityModal`), kiểm tra với cấu hình trong `PropertiesService` / `settings.json`, cho phép đổi mã PIN (`setPasscode`). | `AGENT_STATE.md` Phase 2 & 4 | **P0 Must-Have** |
| `REQ-002` | Khởi tạo Bố cục Sheet Tháng Chuẩn Hàng 1–85 (`SpreadsheetService`) | Xây dựng bảng ngân sách động Hàng `1–79`, dòng tổng kết Hàng `80` (`=SUM(B2:B79)`, `=SUM(D86:D500)`, `=B80-C80`), tiêu đề Hàng `83` và Header Sổ cái Hàng `85`. | `AGENT_STATE.md` | **P0 Must-Have** |
| `REQ-003` | Chèn Giao dịch tại Hàng 86 & Kế thừa Định dạng (`insertTransaction`) | Luôn dùng `insertRowAfter(85)` để thêm giao dịch mới ở Hàng `86`, sao chép đầy đủ định dạng số tiền, font, màu sắc và căn lề từ dòng mẫu. | `AGENT_STATE.md` (Critical Function) | **P0 Must-Have** |
| `REQ-004` | Đọc Cấu hình Đa Ngân hàng Động (`BankConfigService`) | Đọc các quy tắc `[Sender Email]`, `[Keyword]`, `[Transaction Type (Income/Expense)]`, `[Account Name]` từ tab `Config` vào bộ nhớ để định tuyến phân loại. | `expense-management.md` Option 1 & 2 | **P0 Must-Have** |
| `REQ-005` | Bóc tách Email Đa Ngân hàng (`EmailParserService`) | Hỗ trợ trích xuất `Date`, `Amount`, `Merchant/Description` bằng bộ Regex linh hoạt thích ứng với nhiều mẫu email ngân hàng (Chase `no.reply.alerts@chase.com`, Venmo, Bank of America...). | `expense-management.md`, `bank.md` | **P0 Must-Have** |
| `REQ-006` | Quét Gmail theo Nhãn & Chống trùng lặp (`GmailPollingService`) | Tìm email qua nhãn `Finance-Alerts` (hoặc query cấu hình), kiểm tra `messageId` đã xử lý trong `PropertiesService` / cột ẩn để không chèn trùng, sau đó gọi `insertTransaction()`. | `expense-management.md` Option 1, `AGENT_STATE.md` | **P0 Must-Have** |
| `REQ-007` | Webhook Thời gian thực `doPost(e)` (`WebhookHandlerService`) | Xử lý sự kiện HTTP POST từ Google Pub/Sub, tải bảng `Config` vào bộ nhớ, phân loại `Income`/`Expense` theo sender + keyword và ghi ngay vào Ledger. | `expense-management.md` Option 2 | **P1 Should-Have** |
| `REQ-008` | Tự động Khớp Danh mục `"Parent > Child"` (`CategoryMatcher`) | Đối chiếu `Merchant/Description` với danh sách danh mục trong `Config` để điền tự động cột Danh mục khi thêm giao dịch tay hoặc từ Gmail. | `AGENT_STATE.md` | **P1 Should-Have** |
| `REQ-009` | Gom nhóm Hàng & Thu gọn/Mở rộng (`GroupingService`) | Áp dụng `shiftRowGroupDepth(1)` cho các dòng danh mục con (Hàng `1–79`), mặc định thu gọn (`collapseAllRowGroups()`) và điều khiển qua Sidebar/Dialog. | `AGENT_STATE.md` | **P1 Should-Have** |
| `REQ-010` | Bảng điều khiển KPI & Menu Nhanh (`UIService`) | Hiển thị HTML Sidebar `"MENU NHANH"` và Dashboard 3 chỉ số: `Tổng Thu` (Xanh), `Tổng Chi` (Đỏ), `Số Dư Còn Lại` (Cam). | `AGENT_STATE.md` | **P2 Nice-to-Have** |

### 2.2 Data Structures, Constants & `settings.json` Schema

#### A. Bảng `CONSTANTS` & `ENUMS` (Định nghĩa tập trung trong `Main.gs`, không dùng Magic Numbers)

```typescript
export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

export enum SupportedBankVendor {
  CHASE = 'CHASE',
  BANK_OF_AMERICA = 'BANK_OF_AMERICA',
  VENMO = 'VENMO',
  GENERIC = 'GENERIC',
}

export const GAS_LEDGER_CONSTANTS = {
  BUDGET_START_ROW: 2,
  BUDGET_MAX_ROW: 79,
  SUMMARY_BOUNDARY_ROW: 80,
  SECTION_TITLE_ROW: 83,
  LEDGER_HEADER_ROW: 85,
  LEDGER_INSERT_ROW_POSITION: 86,
  LEDGER_SUM_END_ROW: 500,
  CONFIG_SHEET_NAME: 'Config',
  DEFAULT_MONTHLY_SHEET_NAME: 'Chi Tiêu Tháng',
  DEFAULT_GMAIL_LABEL: 'Finance-Alerts',
  MIN_PASSCODE_LENGTH: 4,
  PROCESSED_MSG_IDS_PROPERTY_KEY: 'PROCESSED_GMAIL_MESSAGE_IDS_V1',
  MAX_STORED_MESSAGE_IDS: 500,
  DEFAULT_CURRENCY_FORMAT: '#,##0 "đ"',
} as const;
```

#### B. Core Data Interfaces (Mô hình dữ liệu chuẩn cho GAS & Test Suite)

```typescript
export interface BankRoutingRule {
  senderEmail: string;          // e.g., "no.reply.alerts@chase.com" | "no-reply@alert.chase.com"
  keyword: string;              // e.g., "charged" | "direct deposit" | "sent you"
  transactionType: TransactionType; // "Income" | "Expense"
  accountName: string;          // e.g., "Chase Credit" | "Chase Debit"
}

export interface CategoryConfigPair {
  parent: string;
  child: string;
  budgetAmount?: number;
}

export interface ParsedBankTransaction {
  messageId: string;
  date: string;                 // DD/MM/YYYY or YYYY-MM-DD
  transactionType: TransactionType;
  accountName: string;
  amount: number;
  merchantDescription: string;
  matchedCategory: string;      // "Parent > Child"
}

export interface MonthlyMetrics {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
```

#### C. `settings.json` Schema (`src/config/settings.json` & `PropertiesService`)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ExpenseManagementToolGasSettings",
  "type": "object",
  "required": ["security", "sheetConfig", "gmailConfig", "currencyConfig"],
  "properties": {
    "security": {
      "type": "object",
      "properties": {
        "passcodePropertyKey": { "type": "string", "default": "APP_SECURITY_PASSCODE" },
        "securityEnabled": { "type": "boolean", "default": true },
        "sessionTimeoutMinutes": { "type": "number", "default": 60 }
      }
    },
    "sheetConfig": {
      "type": "object",
      "properties": {
        "configSheetName": { "type": "string", "default": "Config" },
        "defaultMonthlySheetName": { "type": "string", "default": "Chi Tiêu Tháng" },
        "ledgerHeaderRow": { "type": "number", "default": 85 },
        "ledgerInsertRow": { "type": "number", "default": 86 },
        "summaryBoundaryRow": { "type": "number", "default": 80 }
      }
    },
    "gmailConfig": {
      "type": "object",
      "properties": {
        "financeAlertLabel": { "type": "string", "default": "Finance-Alerts" },
        "fallbackSearchQuery": {
          "type": "string",
          "default": "label:Finance-Alerts OR from:(no.reply.alerts@chase.com OR no-reply@alert.chase.com) newer_than:7d"
        },
        "maxThreadsPerRun": { "type": "number", "default": 25 }
      }
    },
    "currencyConfig": {
      "type": "object",
      "properties": {
        "numberFormatPattern": { "type": "string", "default": "#,##0 \"đ\"" },
        "usdToVndExchangeRate": { "type": "number", "default": 1 }
      }
    }
  }
}
```

### 2.3 Kiến Trúc Service & Helper (Tuân thủ GAS Flat Global Scope & SRP)

> **Lưu ý kiến trúc GAS:** Trên Google Apps Script, các file `.gs` được biên dịch chung vào 1 Global Scope. Do đó chúng ta chia thành các file `*Service.gs` và `*ServiceHelper.gs` rõ ràng, mỗi hàm đều có JSDoc đầy đủ và chỉ làm đúng 1 nhiệm vụ (SRP).

| Tên File | Role (Service / Helper) | Chữ ký hàm chính (Method Signatures) | Mục đích (Docstring tóm tắt) |
| :--- | :--- | :--- | :--- |
| `src/Main.gs` | **Orchestrator & Security Service** | `onOpen(): void`<br>`onEdit(e: GoogleAppsScript.Events.SheetsOnEdit): void`<br>`doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput`<br>`validatePasscode(input: string): boolean`<br>`setPasscode(newPasscode: string): boolean` | Khởi tạo menu, quản lý xác thực Passcode và điểm vào Webhook `doPost(e)`. |
| `src/SpreadsheetService.gs` | **Service** | `buildMonthlySheetLayout(sheetName?: string): void`<br>`insertTransaction(date: string, type: string, account: string, amount: number, description: string): number`<br>`copyRowFormatting(sheet: Sheet, sourceRow: number, targetRow: number): void`<br>`getMonthlyMetrics(sheetName?: string): MonthlyMetrics` | Quản lý bố cục Hàng 1–85, chèn giao dịch tại Hàng 86 kế thừa định dạng, và tính tổng KPI. |
| `src/SpreadsheetServiceHelper.gs` | **Helper** | `matchTransactionToCategory(description: string, categories: CategoryConfigPair[]): string`<br>`calculateLedgerMetricsFromRows(rows: any[][]): MonthlyMetrics`<br>`buildSummaryRowFormulas(): { budgetSumFormula: string; actualSumFormula: string; diffFormula: string }` | Các hàm tính toán công thức, tổng hợp số liệu từ mảng 2 chiều và khớp danh mục không phụ thuộc DOM/UI. |
| `src/GmailBankService.gs` | **Service** | `processGmailTransactions(): { processed: number; inserted: number; skippedDuplicate: number }`<br>`handleBankWebhookPayload(rawPayload: string): { status: string; inserted: boolean }`<br>`readBankRoutingRules(): BankRoutingRule[]` | Quét Gmail theo nhãn `Finance-Alerts` hoặc nhận payload từ `doPost(e)`, lọc trùng và ghi giao dịch vào Hàng 86. |
| `src/GmailBankServiceHelper.gs` | **Helper** | `matchSenderAndKeywordRule(senderEmail: string, emailBody: string, rules: BankRoutingRule[]): BankRoutingRule \| null`<br>`extractBankTransactionFields(senderEmail: string, subject: string, body: string, receivedDate?: Date): { date: string; amount: number; merchant: string }`<br>`normalizeEmailAddress(rawFromHeader: string): string` | Phân tích cú pháp email của Chase (`no.reply.alerts@chase.com`), BoA, Venmo bằng Regex linh hoạt và khớp quy tắc `Config`. |
| `src/UIService.gs` | **Service** | `showSecurityModal(): void`<br>`showSidebar(): void`<br>`renderDashboard(): void`<br>`showAddTransactionDialog(): void`<br>`renderCategoryUI(): void` | Kết xuất toàn bộ giao diện HTML5 Modal và Sidebar "MENU NHANH". |

### 2.4 Ma Trận 5 Trạng Thái UX (5-State UX Matrix)

| Màn hình / Luồng | 1. Ideal State (Hoạt động chuẩn) | 2. Loading State (Đang xử lý) | 3. Empty State (Chưa có dữ liệu) | 4. Error State (Lỗi kết nối / Nghiệp vụ) | 5. Partial / Overflow State (Quá tải / Một phần) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hộp thoại Bảo mật Passcode (`showSecurityModal`)** | Nhập đúng Passcode -> Đóng modal, mở khóa các sheet và hiển thị Toast `"✅ Xác thực thành công!"`. | Nút `Xác Nhận` đổi thành `"Đang kiểm tra..."` và vô hiệu hóa ô input khi gọi `google.script.run`. | Ô nhập rỗng: Báo nhắc `"Vui lòng nhập mã bảo mật (tối thiểu 4 ký tự)."` | Nhập sai Passcode: Hiển thị thông báo đỏ `"❌ Mã bảo mật không đúng, vui lòng thử lại"` và xóa trắng ô input. | Nhập sai quá 5 lần liên tiếp trong cùng phiên: Tạm khóa nút `Xác Nhận` 30 giây kèm đồng hồ đếm ngược. |
| **Dashboard & Sidebar "MENU NHANH"** | Hiển thị 3 thẻ KPI rõ nét: `Tổng Thu` (Xanh lá), `Tổng Chi` (Đỏ), `Số Dư` (Cam) định dạng `"1,234,000 đ"` và thanh tiến độ Ngân sách vs Thực tế. | Hiển thị hiệu ứng loading spinner trên Sidebar khi đang đọc dữ liệu từ Sheet. | Khi Hàng `86+` chưa có giao dịch nào: Hiển thị `"0 đ"` trên cả 3 thẻ KPI kèm nút **[➕ Thêm Giao Dịch Đầu Tiên]**. | Khi tab `Chi Tiêu Tháng` hoặc `Config` bị xóa/thiếu: Hiển thị cảnh báo kèm nút **[🔄 Khởi Tạo Lại Cấu Trúc Sheet]**. | Khi bảng danh mục có `> 75` dòng con (tiệm cận giới hạn Hàng 79): Hiển thị cảnh báo vàng `"Đã dùng 75/78 dòng ngân sách tối đa (Hàng 2–79)"`. |
| **Đồng bộ Email Ngân hàng (`processGmailTransactions`)** | Quét email từ `Finance-Alerts`, phân loại đúng `Income`/`Expense` theo tab `Config`, chèn vào Hàng 86 với định dạng `"0 đ"` và hiện Toast tổng kết. | Hiển thị Toast góc dưới phải của Google Sheets: `"⏳ Đang quét email ngân hàng từ Gmail..."`. | Không có email mới hoặc không có email nào khớp quy tắc trong `Config`: Hiện Toast `"Không có giao dịch ngân hàng mới."` | Khi tab `Config` chưa cấu hình cột `[Sender Email]` / `[Keyword]` hoặc Regex không đọc được số tiền: Ghi vào `Logger` qua `logError()` và thông báo số email bị bỏ qua. | Khi có 50 email mới trong hộp thư: Chỉ xử lý tối đa `maxThreadsPerRun = 25` mỗi lượt để không chạm ngưỡng giới hạn 6 phút của Google Apps Script. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

| # | Lỗ hổng / Rủi ro thực tế (Vulnerability / Edge Risk) | Tác động nếu không chặn | Quy tắc Khóa Chặn Cụ Thể Trong Code (Technical Guardrail) |
| :--- | :--- | :--- | :--- |
| **1** | **Ghi đè Header Hàng 85 hoặc làm hỏng công thức tổng Hàng 80 khi chèn giao dịch** (`Row Shift Corruption`) | Nếu dùng `insertRowBefore(85)` hoặc ghi trực tiếp vào hàng 85 sẽ xóa mất tiêu đề Sổ cái; hoặc chèn dòng nhưng không kế thừa định dạng làm mất định dạng tiền tệ `"0 đ"`. | Trong `SpreadsheetService.insertTransaction()`:<br>1. Kiểm tra giá trị ô `A85` có đúng là Header không; nếu bố cục chưa khởi tạo thì gọi `buildMonthlySheetLayout()` trước.<br>2. Bắt buộc gọi `sheet.insertRowAfter(GAS_LEDGER_CONSTANTS.LEDGER_HEADER_ROW)` (chèn tại Hàng 86).<br>3. Gọi `copyRowFormatting(sheet, 86, 87)` (hoặc áp dụng chuẩn format tiền tệ `#,##0 "đ"`, font, alignment) ngay sau khi chèn. |
| **2** | **Tràn số lượng dòng Danh mục vượt quá Hàng 79 làm đẩy lệch Hàng 80 và Hàng 85** (`Fixed Boundary Overflow`) | Bố cục cố định đặt dòng Tổng kết ở Hàng `80` và Header Sổ cái ở Hàng `85`. Nếu người dùng thêm `> 78` dòng danh mục Cha + Con vào `Config`, hàm `buildMonthlySheetLayout()` sẽ ghi đè lên Hàng 80–85. | Trong `buildMonthlySheetLayout()`: Kiểm tra cứng `totalCategoryRows <= (GAS_LEDGER_CONSTANTS.BUDGET_MAX_ROW - GAS_LEDGER_CONSTANTS.BUDGET_START_ROW + 1)` (`78` dòng). Nếu vượt quá, ném lỗi rõ ràng `MAX_BUDGET_ROWS_EXCEEDED` và không ghi đè Hàng 80. |
| **3** | **Nhân đôi giao dịch khi Trigger Gmail chạy lặp hoặc Pub/Sub Webhook gửi lại (`Retry`) cùng 1 email** (`Idempotency Failure`) | Google Pub/Sub có cơ chế at-least-once delivery (gửi lại nếu webhook phản hồi chậm), và `GmailApp.search()` sẽ quét lại email cũ nếu không đánh dấu. | Trong `GmailBankService.gs`:<br>1. Bọc hàm xử lý trong `LockService.getScriptLock().tryLock(10000)` để chặn 2 trigger chạy song song.<br>2. Lưu danh sách `messageId` đã xử lý vào `PropertiesService.getScriptProperties()` (giữ tối đa 500 ID gần nhất kiểu FIFO) và kiểm tra `isMessageAlreadyProcessed(messageId)` trước khi gọi `insertTransaction()`. |
| **4** | **Khớp nhầm quy tắc ngân hàng khi Sender Email có tên hiển thị hoặc Keyword trùng một phần** (`Ambiguous Rule Matching`) | Header `From` của Gmail thường có dạng `"Chase Alerts <no.reply.alerts@chase.com>"`, nếu so sánh `===` trực tiếp với `"no.reply.alerts@chase.com"` sẽ trượt. Ngoài ra từ khóa `"deposit"` có thể khớp nhầm trước `"direct deposit"`. | Trong `GmailBankServiceHelper.gs`:<br>1. Dùng `normalizeEmailAddress(fromHeader)` trích xuất phần email trong dấu `<...>` và chuyển về `toLowerCase().trim()`.<br>2. Sắp xếp các quy tắc khớp cùng `senderEmail` theo độ dài `keyword.length` giảm dần trước khi kiểm tra `body.toLowerCase().includes(rule.keyword.toLowerCase())`. |
| **5** | **Lỗi `ReferenceError: require is not defined` khi chạy trên Google Apps Script** (`Platform Incompatibility`) | Dev quen tay viết `import` / `module.exports` kiểu Node.js khiến toàn bộ script chết ngay khi deploy bằng `npx clasp push`. | Thiết lập bài kiểm tra tĩnh trong Test Suite quét toàn bộ các file `src/*.gs` đảm bảo không xuất hiện từ khóa `import `, `export `, `require(` ở đầu dòng code thực thi. |

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1 Kịch Bản Kiểm Thử 3 Tầng (`Given / When / Then`)

#### Tầng 1: P0 Happy Paths (Người dùng hay xài nhất)
- **TC-P0-01 (Khớp quy tắc Ngân hàng Chase — Giao dịch Chi tiêu `Expense`):**
  - *Given:* Tab `Config` có dòng quy tắc: `["no.reply.alerts@chase.com", "charged", "Expense", "Chase Credit"]`.
  - *When:* Nhận email từ `"Chase <no.reply.alerts@chase.com>"` với nội dung `"Your card was charged $45.50 at STARBUCKS on 06/15/2026"`.
  - *Then:* `GmailBankServiceHelper` phân loại `transactionType = "Expense"`, `accountName = "Chase Credit"`, `amount = 45.50`, `merchant = "STARBUCKS"`.
- **TC-P0-02 (Khớp quy tắc Ngân hàng Chase — Giao dịch Thu nhập `Income`):**
  - *Given:* Tab `Config` có dòng quy tắc: `["no-reply@alert.chase.com", "direct deposit", "Income", "Chase Debit"]`.
  - *When:* Nhận email từ `"no-reply@alert.chase.com"` với nội dung `"You have a direct deposit of $2,500.00 from ACME CORP"`.
  - *Then:* Phân loại `transactionType = "Income"`, `accountName = "Chase Debit"`, `amount = 2500.00`, `merchant = "ACME CORP"`.
- **TC-P0-03 (Chèn giao dịch mới tại Hàng 86 & Kế thừa định dạng):**
  - *Given:* Sheet tháng đã có Header Sổ cái tại Hàng `85`.
  - *When:* Gọi `insertTransaction("15/06/2026", "Expense", "Chase Credit", 455000, "STARBUCKS")`.
  - *Then:* Hệ thống gọi `insertRowAfter(85)`, ghi dữ liệu vào đúng Hàng `86` với đủ 5 thông tin (`Date`, `Type`, `Account/Bank`, `Amount`, `Merchant/Description` + Category) và sao chép định dạng tiền tệ `"0 đ"`.

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-NEG-01 (Email từ người gửi lạ không nằm trong `Config` hoặc không khớp `Keyword`):**
  - *Given:* Tab `Config` chỉ cấu hình cho `no.reply.alerts@chase.com`.
  - *When:* Quét gặp email quảng cáo từ `newsletter@shopping.com` hoặc email thông báo đổi mật khẩu từ Chase không chứa từ khóa giao dịch.
  - *Then:* `matchSenderAndKeywordRule()` trả về `null`, hệ thống bỏ qua an toàn và không chèn dòng rác vào Hàng 86.
- **TC-NEG-02 (Nhập sai Passcode hoặc đặt Passcode mới ngắn hơn 4 ký tự):**
  - *Given:* Passcode hiện tại trong cấu hình là `"2468"`.
  - *When:* Người dùng nhập `"9999"` vào `validatePasscode()` hoặc gọi `setPasscode("12")`.
  - *Then:* Cả 2 trường hợp đều trả về `false` và giữ nguyên trạng thái khóa bảo mật.
- **TC-NEG-03 (Webhook `doPost(e)` nhận payload rỗng hoặc JSON lỗi):**
  - *Given:* Endpoint Web App nhận request `doPost(null)` hoặc `e.postData.contents = "{bad json"`.
  - *When:* Hàm `doPost(e)` thực thi.
  - *Then:* Hệ thống bắt lỗi qua `logError('doPost', error)`, không làm crash script và trả về JSON `{ status: "error", message: "Invalid webhook payload" }`.

#### Tầng 3: Boundary & Rare Edge Cases (0, -1, MAX, Empty, Duplicate, Concurrent)
- **TC-BND-01 (Chống xử lý trùng cùng 1 `messageId` giữa Polling và Webhook):**
  - *Given:* Email có `messageId = "msg_chase_001"` vừa được xử lý qua `doPost(e)`.
  - *When:* Ngay sau đó `processGmailTransactions()` quét trúng lại `"msg_chase_001"`.
  - *Then:* Hệ thống phát hiện `"msg_chase_001"` đã nằm trong danh sách đã xử lý, tăng `skippedDuplicate + 1` và không gọi `insertTransaction()` lần 2.
- **TC-BND-02 (Biên số dòng ngân sách Hàng 2–79: đúng `78` dòng vs `79` dòng):**
  - *Given:* Khoảng dòng ngân sách cho phép từ Hàng `2` đến Hàng `79` (tối đa `78` dòng).
  - *When:* Cấu hình có `78` dòng danh mục so với `79` dòng danh mục.
  - *Then:* Với `78` dòng hệ thống dựng layout thành công và giữ nguyên Hàng 80; với `79` dòng hệ thống chặn ngay với lỗi `MAX_BUDGET_ROWS_EXCEEDED` để bảo vệ Hàng 80 và Hàng 85.
- **TC-BND-03 (Số tiền giao dịch bằng `0`, âm `-100`, hoặc có dấu phẩy hàng nghìn `"$12,345.67"`):**
  - *Given:* Nội dung email có chuỗi `"$12,345.67"` hoặc truyền `amount = -100` vào `insertTransaction`.
  - *When:* Trích xuất và kiểm tra dữ liệu.
  - *Then:* `"$12,345.67"` được parse chính xác thành số `12345.67`; giá trị âm `-100` hoặc `NaN` bị từ chối bởi `isValidNumber()` trước khi chèn vào sheet.

### 4.2 Quy Trình 5 Bước Kiểm Chứng Bề Mặt Thật Cho QA Reviewer

1. **Step 1 — Launch (Kiểm tra Cấu trúc File & Cú pháp GAS):**
   - Kiểm tra thư mục `d:\Workspace\personal-tools\idea\expense-management-tool\src` đảm bảo các file `.gs` và `config/settings.json` tồn tại đầy đủ.
2. **Step 2 — Doctor (Quét Tuân thủ Luật GAS Global Scope & 7 Nguyên tắc `agent-rules.md`):**
   - Chạy script kiểm tra tĩnh xác nhận: (a) Không có `require()`, `import`, `export` trong `.gs`, (b) Mọi hàm đều có block comment `@param` / `@return`, (c) Không có hardcoded passcode trong `.gs`.
3. **Step 3 — Drive (Thực thi Bộ Test Tự Động 3 Tầng với Mock GAS Runtime):**
   - Chạy bộ test tự động nạp các file `.gs` vào môi trường VM giả lập `SpreadsheetApp`, `GmailApp`, `PropertiesService`, `LockService` để kiểm chứng `insertTransaction` (Hàng 86), `copyRowFormatting`, `processGmailTransactions`, `doPost(e)` và `matchSenderAndKeywordRule`.
4. **Step 4 — Evidence (Thu thập Bằng chứng Nghiệm thu):**
   - Ghi lại kết quả test pass 100%, log kiểm tra vị trí chèn dòng `86`, công thức dòng `80` (`=SUM(B2:B79)`, `=SUM(D86:D500)`, `=B80-C80`) và kết quả parse email mẫu của `no.reply.alerts@chase.com`.
5. **Step 5 — Cleanup (Dọn dẹp trạng thái):**
   - Xóa các biến tạm trong bộ nhớ test, đảm bảo không sửa đổi ngoài phạm vi và sẵn sàng cho `npx clasp push`.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role phụ trách | File mục tiêu | Mô tả chi tiết hàm cần viết | Phụ thuộc | Lệnh Verify & Tiêu chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `idea/expense-management-tool/src/config/settings.json` | Cập nhật `settings.json` bổ sung đầy đủ cấu hình `gmailConfig` (nhãn `Finance-Alerts`, sender `no.reply.alerts@chase.com`), `sheetConfig` (Hàng 80, 85, 86) và `currencyConfig` theo đúng Schema Phần 2.2. | *None* | File JSON hợp lệ 100%, parse bằng `JSON.parse` không lỗi. |
| `TASK-002` | **Developer** | `idea/expense-management-tool/src/GmailBankServiceHelper.gs` | Viết các hàm thuần: `normalizeEmailAddress()`, `matchSenderAndKeywordRule()` (ưu tiên keyword dài nhất), và `extractBankTransactionFields()` (Regex linh hoạt bóc tách `Date`, `Amount`, `Merchant` cho Chase, BoA, Venmo). | **Hard:** `TASK-001` | Mọi hàm có JSDoc `@param`/`@return`, không dùng `import`/`export`. |
| `TASK-003` | **Test Engineer** | `idea/expense-management-tool/tests/gmail-bank-helper.test.js` | Viết Unit Test 3 tầng cho `GmailBankServiceHelper.gs`: khớp sender `no.reply.alerts@chase.com` (`Expense` vs `Income`), ưu tiên `"direct deposit"` trước `"deposit"`, parse `"$12,345.67"` và bỏ qua sender lạ. | **Hard:** `TASK-002` | Chạy `node --test tests/gmail-bank-helper.test.js` (hoặc Vitest) xanh 100%. |
| `TASK-004` | **Developer** | `idea/expense-management-tool/src/GmailBankService.gs` | Viết `readBankRoutingRules()`, `isMessageAlreadyProcessed()`, `markMessageProcessed()`, `processGmailTransactions()` (quét Gmail + LockService + gọi `insertTransaction`), và `handleBankWebhookPayload()`. | **Hard:** `TASK-002` | Tuân thủ GAS Global Scope, chống trùng lặp `messageId` tuyệt đối. |
| `TASK-005` | **Developer** | `idea/expense-management-tool/src/SpreadsheetServiceHelper.gs` | Tách các hàm helper tính toán thuần từ `SpreadsheetService.gs`: `validateBudgetRowCount()` (chặn vượt quá 78 dòng Hàng 2–79), `buildSummaryRowFormulas()` (Hàng 80), `calculateLedgerMetricsFromRows()`. | **Hard:** `TASK-001` | Đầy đủ block comment, không chứa magic numbers. |
| `TASK-006` | **Developer** | `idea/expense-management-tool/src/SpreadsheetService.gs` | Chuẩn hóa `insertTransaction(date, type, account, amount, description)` ghi đầy đủ 5 cột yêu cầu trong `expense-management.md` tại Hàng `86` (`insertRowAfter(85)`) + `copyRowFormatting()` và tích hợp đọc bảng quy tắc ngân hàng từ `Config`. | **Hard:** `TASK-004`, `TASK-005` | Đảm bảo không bao giờ ghi đè Hàng 85 và giữ nguyên format `"0 đ"`. |
| `TASK-007` | **Developer** | `idea/expense-management-tool/src/Main.gs` | Bổ sung hàm `doPost(e)` cho Option 2 (Pub/Sub Webhook) và mục menu `"🔄 Đồng Bộ Email Ngân Hàng"` kích hoạt `processGmailTransactions()` trong `onOpen()`. | **Hard:** `TASK-004`, `TASK-006` | Có kiểm tra xác thực, bắt lỗi `logError()` và trả về `ContentService.createTextOutput`. |
| `TASK-008` | **Test Engineer** | `idea/expense-management-tool/tests/spreadsheet-and-webhook.test.js` | Viết Integration Test với Mock GAS Runtime kiểm thử: `insertTransaction` tại Hàng 86, chặn tràn Hàng 79, luồng `processGmailTransactions()` và `doPost(e)` chống trùng lặp. | **Hard:** `TASK-006`, `TASK-007` | Toàn bộ test suite chạy xanh 100% và kiểm tra tĩnh không có `require/import` trong `src/*.gs`. |
