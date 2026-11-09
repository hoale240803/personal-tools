# ĐẶC TẢ KỸ THUẬT & THỰC THI: EXPENSE MANAGEMENT APP (REACT + VERCEL + GMAIL + GEMINI + SHEETS)

> **Dự án:** `expense-management-app`  
> **Phân nhóm:** Core SaaS / POS / Finance (Nhóm 1)  
> **Đơn vị lập đặc tả:** AISE Squad 1 — BA Team (`intake`, `ba`, `requirement_challenger`) & PM Team (`orchestrator`, `estimator_cost_controller`)  
> **Nguồn tham chiếu:** `idea/expense-management-app/ROADMAP.md`, `idea/expense-management-app/AGENT_STATE.md`  
> **Lưu ý bảo toàn:** TUYỆT ĐỐI KHÔNG chỉnh sửa bất kỳ file nào trong `idea/expense-management-app` khi lập đặc tả này.  
> **Trạng thái:** Dev-Ready & Test-Ready  

---

## PHẦN 1 — INTAKE & PHÂN LOẠI HỢP ĐỒNG (`intake`)

### 1.1 Nhãn Bảo Mật & Rủi Ro (Security & Risk Tags)
- `auth`: Xác thực người dùng bắt buộc qua **Google OAuth 2.0** (`/api/auth/login`, `/api/auth/callback`, `/api/auth/me`, `/api/auth/logout`), quản lý phiên đăng nhập bằng JWT cookie (`SESSION_SECRET`).
- `pii`: Truy cập hộp thư cá nhân của người dùng qua **Gmail API** (`gmail.readonly`) để đọc nội dung email đơn hàng, hóa đơn, số tiền và mã vận đơn/đơn hàng.
- `payment`: Trích xuất và tổng hợp dữ liệu giao dịch tài chính/chi tiêu mua sắm cá nhân theo đơn vị `VND` (Shopee, Lazada, Tiki, Grab, ngân hàng...).
- `external_api`: Kết nối đồng thời 3 dịch vụ đám mây bên ngoài: **Gmail API**, **Google Sheets API** (lưu trữ database chính), và **Google Gemini API** (`@google/generative-ai`) để bóc tách dữ liệu có cấu trúc từ email.

### 1.2 Bảng Phân Tách: Stated Facts, Explicit Assumptions & Clarification Questions

| Phân loại | Mã tham chiếu | Nội dung chi tiết | Nguồn / Cơ sở |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-01` | Ứng dụng web cá nhân tự động theo dõi chi tiêu từ email mua hàng Gmail với 3 màn hình chính: `Login` (Google OAuth bắt buộc), `Theo dõi chi phí` (lọc theo tháng, phân trang 20 dòng/trang, KPI, tìm kiếm), và `Cài đặt` (Danh mục cha/con). | `ROADMAP.md` (Mục tiêu sản phẩm & Phase 0) |
| **Stated Fact** | `SF-02` | Kiến trúc Monorepo gồm Frontend (`web/` dùng React + TypeScript + Vite + Tailwind) và Backend (`api/` dùng Vercel Serverless Functions + Express local dev server `api/dev-server.ts` chạy ở cổng 3000). | `ROADMAP.md`, `AGENT_STATE.md` |
| **Stated Fact** | `SF-03` | Database sử dụng Google Spreadsheet với 3 sheet: `Expenses` (12 cột A->L: `id`, `purchaseDate`, `name`, `parentCategory`, `category`, `amount`, `platform`, `status`, `orderId`, `imageUrl`, `gmailMessageId`, `createdAt`), `Categories` (4 cột A->D), và `SyncState` (3 cột A->C). | `ROADMAP.md` (Mục 1.2) |
| **Stated Fact** | `SF-04` | Luồng đồng bộ Gmail (`POST /api/gmail/sync`): Tìm email mua hàng (`category:purchases OR subject:(order OR đơn hàng) newer_than:7d`), kiểm tra chống trùng qua `gmailMessageId`, gửi nội dung + danh mục của user vào Gemini để nhận JSON và ghi vào Sheet `Expenses`. | `ROADMAP.md` (Phase 5) |
| **Stated Fact** | `SF-05` | Nếu Gemini trả về danh mục không khớp với danh mục đã cài đặt trong Settings, hệ thống dùng danh mục dự phòng (fallback): `"Mua sắm > Khác"`. | `ROADMAP.md` (Phase 5 Flow) |
| **Stated Fact** | `SF-06` | Chuẩn phản hồi API thống nhất toàn hệ thống là `{ "data": {}, "error": null }` hoặc `{ "data": null, "error": { "message": "..." } }`. Phân trang trả về `{ items, total, page, limit, totalPages }`. | `ROADMAP.md` (Quy ước code) |
| **Explicit Assumption** | `EA-01` | Khi Gemini trả về `isPurchaseEmail: false` (ví dụ email quảng cáo khuyến mãi không phải xác nhận đơn hàng/biên lai thanh toán), hệ thống không thêm dòng vào `Expenses` nhưng vẫn ghi nhận `gmailMessageId` hoặc cập nhật `SyncState` để không phải gọi Gemini phân tích lại ở lần sync sau. | Tối ưu chi phí & Rate-limit Gemini API |
| **Explicit Assumption** | `EA-02` | Mỗi lần gọi `POST /api/gmail/sync` sẽ xử lý tối đa một lô (`BATCH_SIZE = 20` emails) trong giới hạn timeout của Vercel Serverless Function (10s–60s) để tránh lỗi `504 Function Invocation Timeout`. | Giới hạn hạ tầng Vercel Serverless |

### 1.3 Câu Hỏi Làm Rõ (Clarification Questions)

| Mã | Câu hỏi | Các lựa chọn (Options) | Khuyến nghị (Recommendation) |
| :--- | :--- | :--- | :--- |
| `CQ-01` | Khi cùng 1 đơn hàng (`orderId`) có nhiều email cập nhật trạng thái (VD: Email 1 "Đã đặt hàng", Email 2 "Đã giao hàng"), hệ thống nên xử lý như thế nào? | **Option A:** Chỉ dedup theo `gmailMessageId` (tạo 2 dòng riêng biệt).<br>**Option B:** Dedup kết hợp: Nếu trùng `gmailMessageId` thì bỏ qua; nếu khác `gmailMessageId` nhưng trùng `orderId` + `platform` (khác rỗng) thì cập nhật cột `status` của dòng hiện có thay vì cộng dồn `amount` 2 lần.<br>**Option C:** Chỉ lấy email có trạng thái "Đã giao". | **Khuyến nghị Option B:** Chống nhân đôi tổng chi tiêu tháng khi 1 đơn hàng nhận nhiều email thông báo trạng thái từ Shopee/Lazada. |
| `CQ-02` | Xác thực quyền truy cập Google Sheets dùng tài khoản nào khi triển khai thực tế? | **Option A:** Dùng Google Service Account (`GOOGLE_SERVICE_ACCOUNT_EMAIL` + Private Key) cho Sheet cố định của chủ app.<br>**Option B:** Dùng trực tiếp OAuth `access_token` của người dùng đang đăng nhập. | **Khuyến nghị Option A (hoặc hỗ trợ fallback sang Option B):** Dùng Service Account như đã khai báo trong `.env` của `ROADMAP.md` để cron job tự động sync chạy nền được mà không phụ thuộc phiên trình duyệt. |

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1 Bảng Yêu Cầu Nghiệp Vụ (Traceability Matrix)

| Mã REQ | Tên yêu cầu | Mô tả nghiệp vụ chi tiết | Nguồn gốc | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | Xác thực Google OAuth & Quản lý Session (`AuthService`) | Cung cấp `/api/auth/login`, `/api/auth/callback`, `/api/auth/me`, `/api/auth/logout`; lưu JWT vào HTTP-only Cookie an toàn. | `ROADMAP.md` Phase 3 | **P0 Must-Have** |
| `REQ-002` | Đọc & Phân trang Chi tiêu theo Tháng (`ExpenseQueryService`) | API `GET /api/expenses?month=YYYY-MM&page=1&limit=20&search=` lọc cột `purchaseDate` theo tiền tố `YYYY-MM`, tìm kiếm theo `name`, `platform`, `orderId` và tính tổng KPI tháng. | `ROADMAP.md` Phase 0 & 4 | **P0 Must-Have** |
| `REQ-003` | Quản lý Danh mục Cha / Con (`CategoryService`) | API `GET /api/categories` và `PUT /api/categories` đọc/ghi toàn bộ cấu trúc danh mục Cha - Con vào sheet `Categories`. | `ROADMAP.md` Phase 4 | **P0 Must-Have** |
| `REQ-004` | Quét Email Mua hàng từ Gmail (`GmailCollectorService`) | Tìm kiếm email bằng truy vấn Gmail API, trích xuất nội dung text/HTML được làm sạch, ngày nhận email (`YYYY-MM-DD`), và ảnh đính kèm/inline đầu tiên (`imageUrl`). | `ROADMAP.md` Phase 5 | **P0 Must-Have** |
| `REQ-005` | Bóc tách Hóa đơn bằng Gemini AI (`GeminiParserService`) | Gửi nội dung email kèm danh sách danh mục của người dùng lên Gemini API; ép kiểu phản hồi về đúng schema JSON (`name`, `amount`, `platform`, `status`, `orderId`, `parentCategory`, `childCategory`, `isPurchaseEmail`). | `ROADMAP.md` Phase 5 | **P0 Must-Have** |
| `REQ-006` | Chống trùng lặp & Ghi nhận Giao dịch (`ExpenseSyncCoordinator`) | Kiểm tra `gmailMessageId` đã tồn tại trong Sheet `Expenses` trước khi chèn; đối chiếu danh mục hợp lệ hoặc gán `"Mua sắm > Khác"`; cập nhật `SyncState`. | `ROADMAP.md` Phase 4 & 5 | **P0 Must-Have** |
| `REQ-007` | Giao diện Theo dõi Chi phí & KPI (`ExpensesPage`) | Hiển thị thẻ KPI tháng, bộ lọc `input type="month"`, ô tìm kiếm, bảng giao dịch (Desktop) / danh sách thẻ (Mobile), phân trang 20 bản ghi/trang và nút "Đồng bộ Gmail". | `ROADMAP.md` Phase 0 & 6 | **P1 Should-Have** |
| `REQ-008` | Giao diện Quản lý Danh mục (`SettingsPage`) | Cho phép thêm, sửa, xóa danh mục Cha và danh mục Con, đồng bộ lên Google Sheets qua `PUT /api/categories`. | `ROADMAP.md` Phase 0 & 4 | **P1 Should-Have** |
| `REQ-009` | Xử lý Hết hạn Token & Rate Limit (`ResilienceMiddleware`) | Khi token OAuth hết hạn trả mã `401` để Frontend tự điều hướng về `/login`; điều tiết tốc độ gọi Gemini/Gmail API tránh lỗi `429`. | `ROADMAP.md` Phase 6 | **P1 Should-Have** |
| `REQ-010` | Tự động Đồng bộ định kỳ (`CronSyncJob`) | Hỗ trợ gọi `/api/gmail/sync` qua Vercel Cron Job định kỳ 15–30 phút và truy vấn thời điểm đồng bộ gần nhất qua `GET /api/gmail/status`. | `ROADMAP.md` Phase 5 | **P2 Nice-to-Have** |

### 2.2 Data Structures, Constants & `settings.json` Schema

#### A. Bảng `CONSTANTS` & `ENUMS` (Tuân thủ nghiêm ngặt No Magic Numbers/Strings)

```typescript
export enum OrderStatus {
  DELIVERED = 'Đã giao',
  SHIPPING = 'Đang giao',
  CANCELLED = 'Đã hủy',
  PENDING = 'Chờ xử lý',
}

export enum SheetTabName {
  EXPENSES = 'Expenses',
  CATEGORIES = 'Categories',
  SYNC_STATE = 'SyncState',
}

export const APP_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  FALLBACK_PARENT_CATEGORY: 'Mua sắm',
  FALLBACK_CHILD_CATEGORY: 'Khác',
  FALLBACK_FULL_CATEGORY: 'Mua sắm > Khác',
  GMAIL_DEFAULT_SEARCH_QUERY: 'category:purchases OR subject:(order OR "đơn hàng" OR "hóa đơn" OR receipt) newer_than:7d',
  MAX_EMAILS_PER_SYNC_BATCH: 20,
  GEMINI_MODEL_NAME: 'gemini-1.5-flash',
  GEMINI_MAX_EMAIL_BODY_CHARS: 12000,
  SESSION_COOKIE_NAME: 'ema_session_token',
  SESSION_TTL_SECONDS: 604800, // 7 days
} as const;
```

#### B. Core TypeScript Interfaces (`web/src/types/index.ts` & `api/types.ts`)

```typescript
export interface ExpenseRecord {
  id: string;              // Col A: UUID
  purchaseDate: string;    // Col B: YYYY-MM-DD
  name: string;            // Col C: Tên sản phẩm/dịch vụ
  parentCategory: string;  // Col D: Danh mục cha
  category: string;        // Col E: "Parent > Child"
  amount: number;          // Col F: Số tiền VND (>= 0)
  platform: string;        // Col G: Shopee, Lazada, Grab...
  status: OrderStatus;     // Col H: Trạng thái đơn
  orderId: string;         // Col I: Mã đơn hàng
  imageUrl: string;        // Col J: URL ảnh sản phẩm/hóa đơn
  gmailMessageId: string;  // Col K: ID gốc từ Gmail để chống trùng
  createdAt: string;       // Col L: ISO-8601 timestamp
}

export interface CategoryChild {
  id: string;
  name: string;
}

export interface CategoryParent {
  id: string;
  name: string;
  children: CategoryChild[];
}

export interface GeminiParsedEmail {
  name: string;
  amount: number;
  platform: string;
  status: OrderStatus;
  orderId: string;
  parentCategory: string;
  childCategory: string;
  isPurchaseEmail: boolean;
}

export interface PaginatedExpensesResponse {
  items: ExpenseRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  monthlyTotalVnd: number;
}

export interface ApiEnvelope<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
}
```

#### C. `settings.json` & `.env` Schema (Quản lý cấu hình & biến môi trường an toàn)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ExpenseManagementAppSettings",
  "type": "object",
  "required": ["envKeys", "pagination", "gmailSync", "sheetsConfig"],
  "properties": {
    "envKeys": {
      "type": "object",
      "properties": {
        "googleClientIdKey": { "type": "string", "default": "GOOGLE_CLIENT_ID" },
        "googleClientSecretKey": { "type": "string", "default": "GOOGLE_CLIENT_SECRET" },
        "googleRedirectUriKey": { "type": "string", "default": "GOOGLE_REDIRECT_URI" },
        "geminiApiKey": { "type": "string", "default": "GEMINI_API_KEY" },
        "spreadsheetIdKey": { "type": "string", "default": "SPREADSHEET_ID" },
        "serviceAccountEmailKey": { "type": "string", "default": "GOOGLE_SERVICE_ACCOUNT_EMAIL" },
        "serviceAccountPrivateKey": { "type": "string", "default": "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY" },
        "sessionSecretKey": { "type": "string", "default": "SESSION_SECRET" }
      }
    },
    "pagination": {
      "type": "object",
      "properties": {
        "defaultPageSize": { "type": "number", "default": 20 },
        "maxPageSize": { "type": "number", "default": 100 }
      }
    },
    "gmailSync": {
      "type": "object",
      "properties": {
        "searchQuery": {
          "type": "string",
          "default": "category:purchases OR subject:(order OR đơn hàng) newer_than:7d"
        },
        "batchSize": { "type": "number", "default": 20 },
        "fallbackParentCategory": { "type": "string", "default": "Mua sắm" },
        "fallbackChildCategory": { "type": "string", "default": "Khác" }
      }
    },
    "sheetsConfig": {
      "type": "object",
      "properties": {
        "expensesSheetRange": { "type": "string", "default": "Expenses!A:L" },
        "categoriesSheetRange": { "type": "string", "default": "Categories!A:D" },
        "syncStateSheetRange": { "type": "string", "default": "SyncState!A:C" }
      }
    }
  }
}
```

### 2.3 Kiến Trúc Service & Helper (Tuân thủ Rule 4 & Single Responsibility Principle)

| Tên File | Role (Service / Helper) | Chữ ký hàm chính (Method Signatures) | Mục đích (Docstring tóm tắt) |
| :--- | :--- | :--- | :--- |
| `api/_lib/SheetsService.ts` | **Service** | `getExpenses(month: string, page: number, limit: number, search?: string): Promise<PaginatedExpensesResponse>`<br>`appendExpenseIfNotExists(record: ExpenseRecord): Promise<{ inserted: boolean; reason?: string }>`<br>`getCategories(): Promise<CategoryParent[]>`<br>`saveCategories(categories: CategoryParent[]): Promise<void>` | Thực hiện đọc/ghi dữ liệu trên 3 tab `Expenses`, `Categories`, `SyncState` của Google Sheets. |
| `api/_lib/SheetsServiceHelper.ts` | **Helper** | `mapRowToExpense(row: string[]): ExpenseRecord`<br>`mapExpenseToRow(record: ExpenseRecord): (string \| number)[]`<br>`filterAndPaginateExpenses(records: ExpenseRecord[], month: string, search: string, page: number, limit: number): PaginatedExpensesResponse`<br>`flattenCategoryTreeToRows(parents: CategoryParent[]): string[][]` | Chuyển đổi dữ liệu 2 chiều giữa mảng dòng Google Sheets và Domain Objects, lọc tháng và tính toán phân trang thuần túy. |
| `api/_lib/GeminiParserService.ts` | **Service** | `parsePurchaseEmail(emailBody: string, subject: string, categories: CategoryParent[]): Promise<GeminiParsedEmail>` | Gọi Gemini API để trích xuất thông tin đơn hàng và phân loại vào danh mục Cha/Con. |
| `api/_lib/GeminiParserServiceHelper.ts` | **Helper** | `buildExtractionPrompt(subject: string, sanitizedBody: string, categories: CategoryParent[]): string`<br>`sanitizeAndValidateGeminiJson(rawText: string, categories: CategoryParent[]): GeminiParsedEmail` | Tạo prompt chuẩn, cắt bớt HTML rác vượt quá `12000` ký tự, parse JSON an toàn và ép fallback `"Mua sắm > Khác"` nếu danh mục AI trả về không tồn tại. |
| `api/_lib/GmailSyncService.ts` | **Service** | `syncRecentPurchaseEmails(userEmail: string, oauthAccessToken?: string): Promise<{ scanned: number; inserted: number; skippedDuplicate: number; skippedNonPurchase: number }>` | Điều phối luồng đọc Gmail -> lọc trùng `gmailMessageId` -> gọi Gemini -> lưu vào Google Sheets -> cập nhật `SyncState`. |
| `api/_lib/GmailSyncServiceHelper.ts` | **Helper** | `decodeBase64UrlBody(payload: GmailMessagePayload): string`<br>`extractFirstInlineOrAttachmentImage(payload: GmailMessagePayload): string`<br>`extractReceivedDateYmd(internalDateMs: string): string` | Giải mã Base64URL của Gmail API, lọc bỏ thẻ `<script>/<style>` và lấy ngày chuẩn `YYYY-MM-DD`. |

### 2.4 Ma Trận 5 Trạng Thái UX (5-State UX Matrix)

| Màn hình / Luồng | 1. Ideal State (Hoạt động chuẩn) | 2. Loading State (Đang xử lý) | 3. Empty State (Chưa có dữ liệu) | 4. Error State (Lỗi kết nối / Nghiệp vụ) | 5. Partial / Overflow State (Quá tải / Một phần) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Trang Theo Dõi Chi Phí (`ExpensesPage`)** | Hiển thị KPI tổng chi tiêu tháng (định dạng `1.250.000 ₫`), danh sách 20 giao dịch của tháng đang chọn, badge trạng thái đơn hàng và phân trang rõ ràng. | Hiển thị khung xương (Skeleton table rows & KPI shimmer) khi chuyển tháng hoặc chuyển trang; nút `Đồng bộ Gmail` xoay icon kèm chữ `"Đang quét Gmail..."`. | "Chưa có giao dịch nào trong tháng `YYYY-MM`. Hãy bấm **[Đồng bộ Gmail]** để quét hóa đơn mới." | Nếu API trả `401`: Tự chuyển về `/login`. Nếu lỗi mạng/Sheets `500`: Hiện banner đỏ `"Không thể tải danh sách chi phí"` kèm nút **[Thử lại]**. | Khi tên sản phẩm dài `> 80` ký tự hoặc có `> 20` bản ghi: Cắt chuỗi bằng `line-clamp-2` có tooltip, kích hoạt thanh phân trang (`Trang 1 / N`); nếu ảnh `imageUrl` lỗi thì hiển thị icon giỏ hàng mặc định. |
| **Luồng Đồng Bộ Gmail (`POST /api/gmail/sync`)** | Hiện Toast xanh: `"Đồng bộ hoàn tất: Đã thêm 3 giao dịch mới (Bỏ qua 5 email trùng)"` và làm mới bảng dữ liệu. | Khoá nút `Đồng bộ Gmail` (`disabled=true`) trong suốt quá trình request để chống bấm lặp. | Hiện Toast thông tin: `"Không tìm thấy email mua hàng mới nào trong 7 ngày qua."` | Nếu Gemini/Gmail bị Rate Limit (`429`) hoặc lỗi kết nối: Hiện Toast đỏ `"Đồng bộ gián đoạn: [Lý do]. Vui lòng thử lại sau 1 phút."` | Khi có 10 email nhưng 2 email bị lỗi parse JSON từ Gemini: Lưu thành công 8 email hợp lệ và trả về cảnh báo `"Đã thêm 8/10 email (2 email lỗi định dạng)"`. |
| **Trang Cài Đặt Danh Mục (`SettingsPage`)** | Hiển thị cây Danh mục Cha và các chip Danh mục Con; nút `Lưu thay đổi` thông báo thành công khi cập nhật vào Sheet `Categories`. | Nút `Lưu thay đổi` hiển thị trạng thái `"Đang lưu..."` và khóa các ô input. | "Chưa có danh mục nào. Bấm **[+ Thêm danh mục cha]** hoặc **[Khôi phục mặc định]**." | Báo lỗi inline đỏ ngay dưới ô input nếu người dùng nhập tên danh mục trống hoặc trùng tên danh mục đã có. | Khi 1 Danh mục Cha có `> 15` Danh mục Con: Hiển thị dạng flex-wrap cuộn gọn trong khung thẻ mà không làm vỡ bố cục mobile. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

| # | Lỗ hổng / Rủi ro thực tế (Vulnerability / Edge Risk) | Tác động nếu không chặn | Quy tắc Khóa Chặn Cụ Thể Trong Code (Technical Guardrail) |
| :--- | :--- | :--- | :--- |
| **1** | **Race Condition & Nhân đôi giao dịch khi bấm "Đồng bộ Gmail" liên tục hoặc Cron chạy trùng lúc user bấm** (`Double Submit` & `Dedup Failure`) | 2 tiến trình cùng đọc Sheet `Expenses` thấy chưa có `gmailMessageId = "msg_123"`, cùng gọi Gemini và cùng `append` vào Google Sheets -> Chi tiêu bị tính gấp đôi. | 1. Xây dựng In-Memory / Sheet Sync Lock theo `userEmail` (từ chối request sync mới với mã `409 SYNC_IN_PROGRESS` nếu lần sync trước chưa xong).<br>2. Trước khi ghi batch mới vào Sheet, đọc lại cột `K` (`Expenses!K:K`) để lọc loại trừ mọi `gmailMessageId` đã tồn tại. |
| **2** | **Gemini trả về Markdown Code Fence, sai cấu trúc JSON, số tiền âm hoặc bịa đặt Danh mục** (`AI Hallucination` & `Data Corruption`) | Gemini trả về ```` ```json ... ``` ```` hoặc `"amount": "150.000đ"` (kiểu chuỗi thay vì number) làm crash hàm `JSON.parse()` hoặc làm hỏng công thức cộng tổng trên Google Sheets. | Trong `GeminiParserServiceHelper.sanitizeAndValidateGeminiJson()`:<br>1. Bóc tách khối JSON bằng regex `/\{[\s\S]*\}/`.<br>2. Ép kiểu `amount = Number(String(raw.amount).replace(/[^\d.-]/g, ''))`; nếu `isNaN(amount) \|\| amount < 0` thì gán `0`.<br>3. Kiểm tra cặp `(parentCategory, childCategory)` có nằm trong `categories` của user không; nếu không khớp chính xác, bắt buộc gán `parentCategory = "Mua sắm"`, `childCategory = "Khác"`, `category = "Mua sắm > Khác"`. |
| **3** | **Tràn bộ nhớ & Vượt giới hạn Token/Timeout khi gặp Email HTML quá nặng** (`Payload Overflow` & `Timeout`) | Email khuyến mãi từ sàn TMĐT thường chứa `> 200KB` mã HTML/CSS inline và chuỗi tracking dài; gửi nguyên bản sang Gemini gây chậm và vượt timeout của Serverless Function. | Trong `GmailSyncServiceHelper.decodeBase64UrlBody()`: Loại bỏ toàn bộ thẻ `<style>`, `<script>`, `<head>`, thuộc tính `style="..."`, URL tracking dài, gộp khoảng trắng và cắt cứng độ dài chuỗi ở `GEMINI_MAX_EMAIL_BODY_CHARS = 12000` ký tự trước khi gọi Gemini. |
| **4** | **Formula Injection (CSV/Sheet Injection) từ tiêu đề sản phẩm trong Email** (`Security Vulnerability`) | Nếu tên sản phẩm hoặc mã đơn hàng bắt đầu bằng dấu `=`, `+`, `-`, `@` (ví dụ `=IMPORTXML(...)`), khi append vào Google Sheets bằng `USER_ENTERED` sẽ tự thực thi công thức độc hại. | Khi gọi `spreadsheets.values.append` hoặc `update`, sử dụng `valueInputOption: 'RAW'` hoặc tự động tiền tố dấu nháy đơn `'` cho mọi trường chuỗi (`name`, `platform`, `orderId`, `category`) nếu ký tự đầu tiên thuộc tập `['=', '+', '-', '@']`. |
| **5** | **Ghi đè mất dữ liệu khi cập nhật Danh mục (`PUT /api/categories`) với mảng rỗng** (`Accidental Data Wipe`) | Lỗi state ở Frontend gửi mảng `[]` lên `PUT /api/categories` sẽ xóa trắng toàn bộ bảng `Categories` trên Google Sheet. | Trong `CategoryService`: Không cho phép lưu danh sách danh mục rỗng (`categories.length === 0`); nếu vi phạm trả lỗi `400 INVALID_CATEGORIES_PAYLOAD` và giữ nguyên dữ liệu cũ trên Sheet. |

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1 Kịch Bản Kiểm Thử 3 Tầng (`Given / When / Then`)

#### Tầng 1: P0 Happy Paths (Người dùng hay xài nhất)
- **TC-P0-01 (Lọc chi tiêu theo tháng & Phân trang 20 bản ghi/trang):**
  - *Given:* Sheet `Expenses` có 25 giao dịch trong tháng `2026-07` và 5 giao dịch trong tháng `2026-06`.
  - *When:* Gọi `GET /api/expenses?month=2026-07&page=1&limit=20`.
  - *Then:* Phản hồi trả về `items.length === 20`, `total === 25`, `page === 1`, `limit === 20`, `totalPages === 2`, và toàn bộ `items` đều có `purchaseDate` bắt đầu bằng `"2026-07"`.
- **TC-P0-02 (Đồng bộ Gmail -> Gemini bóc tách -> Khớp danh mục -> Lưu Sheet):**
  - *Given:* Hộp thư Gmail có 1 email mới (`gmailMessageId = "msg_001"`) xác nhận đơn Shopee mua "Chuột không dây Logitech" giá `350000` VND; danh mục cài đặt có `"Mua sắm > Đồ công nghệ"`.
  - *When:* Gọi `POST /api/gmail/sync`.
  - *Then:* Hệ thống thêm đúng 1 dòng mới vào Sheet `Expenses` với `amount = 350000`, `category = "Mua sắm > Đồ công nghệ"`, `gmailMessageId = "msg_001"`, và trả về `{ scanned: 1, inserted: 1, skippedDuplicate: 0 }`.
- **TC-P0-03 (Đọc và cập nhật Danh mục Cha/Con trên Sheet `Categories`):**
  - *Given:* Người dùng đã đăng nhập hợp lệ.
  - *When:* Gửi `PUT /api/categories` với danh mục cha `"Ăn uống"` gồm 2 danh mục con `["Cà phê", "Nhà hàng"]`.
  - *Then:* Hệ thống lưu 2 dòng tương ứng vào Sheet `Categories` và khi gọi lại `GET /api/categories` trả về đúng cấu trúc cây vừa lưu.

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-NEG-01 (Truy cập API khi chưa đăng nhập hoặc Cookie JWT hết hạn):**
  - *Given:* Request không có cookie `ema_session_token` hoặc chữ ký JWT không hợp lệ.
  - *When:* Gọi `GET /api/expenses` hoặc `POST /api/gmail/sync`.
  - *Then:* API trả về HTTP `401 Unauthorized` với cấu trúc `{ data: null, error: { message: "Unauthorized" } }`.
- **TC-NEG-02 (Gemini trả về danh mục không tồn tại -> Tự động Fallback):**
  - *Given:* Danh mục của user chỉ có `"Ăn uống > Cà phê"`, nhưng Gemini trả về `parentCategory: "Du lịch"`, `childCategory: "Vé máy bay"`.
  - *When:* `GeminiParserServiceHelper.sanitizeAndValidateGeminiJson()` xử lý phản hồi.
  - *Then:* Bản ghi được tự động gán về danh mục mặc định `parentCategory = "Mua sắm"` và `category = "Mua sắm > Khác"`.
- **TC-NEG-03 (Chặn Formula Injection khi tên đơn hàng chứa ký tự `=`):**
  - *Given:* Email độc hại có tên sản phẩm là `=SUM(A1:A100)`.
  - *When:* Chuyển đổi bản ghi để ghi vào Google Sheets qua `mapExpenseToRow()`.
  - *Then:* Giá trị tên sản phẩm được làm sạch thành `'=SUM(A1:A100)` để Google Sheets hiểu là chuỗi văn bản thuần.

#### Tầng 3: Boundary & Rare Edge Cases (0, -1, MAX, Empty, Duplicate, Concurrent)
- **TC-BND-01 (Chống trùng lặp tuyệt đối theo `gmailMessageId`):**
  - *Given:* `gmailMessageId = "msg_dup_99"` đã tồn tại ở dòng 15 của Sheet `Expenses`.
  - *When:* Chạy `POST /api/gmail/sync` quét trúng lại `"msg_dup_99"`.
  - *Then:* Hệ thống bỏ qua không gọi Gemini (hoặc không ghi vào Sheet), trả về `inserted: 0, skippedDuplicate: 1`, tổng số dòng trong Sheet không đổi.
- **TC-BND-02 (Biên phân trang: Tháng không có dữ liệu `0` bản ghi, đúng `20` bản ghi, và `21` bản ghi):**
  - *Given:* 3 kịch bản dữ liệu lần lượt có `0`, `20`, và `21` bản ghi.
  - *When:* Gọi `filterAndPaginateExpenses()` với `limit = 20`.
  - *Then:* Với `0` bản ghi -> `totalPages = 0, items = []`; với `20` bản ghi -> `totalPages = 1`; với `21` bản ghi -> `totalPages = 2` và trang 2 có đúng `1` bản ghi.
- **TC-BND-03 (Giá trị tiền `amount` bằng `0`, âm `-50000`, hoặc chuỗi tiền tệ `"1.250.000 VNĐ"`):**
  - *Given:* Phản hồi JSON từ AI có `amount` dạng chuỗi có dấu chấm hoặc số âm.
  - *When:* Qua hàm chuẩn hóa của `GeminiParserServiceHelper`.
  - *Then:* `"1.250.000 VNĐ"` chuyển thành số `1250000`; số âm `-50000` bị chặn và đưa về `0`.
- **TC-BND-04 (Hai yêu cầu Sync Gmail gọi đồng thời - Concurrent Sync):**
  - *Given:* Yêu cầu `POST /api/gmail/sync` thứ nhất của `user@gmail.com` đang chạy.
  - *When:* Yêu cầu `POST /api/gmail/sync` thứ hai của cùng `user@gmail.com` gửi tới ngay lập tức.
  - *Then:* Yêu cầu thứ hai bị từ chối ngay với HTTP `409 Conflict` (`SYNC_IN_PROGRESS`), đảm bảo không xảy ra race condition ghi đè Sheet.

### 4.2 Quy Trình 5 Bước Kiểm Chứng Bề Mặt Thật Cho QA Reviewer

1. **Step 1 — Launch (Khởi chạy Frontend + Backend Local Server):**
   - Kiểm tra build và khởi động server local theo đúng hướng dẫn trong `AGENT_STATE.md`:
     `cd d:\Workspace\personal-tools\idea\expense-management-app && npm run build` (hoặc chạy dev server tại cổng `3000` cho API và `5173` cho Web).
2. **Step 2 — Doctor (Kiểm tra Health Check & Cấu hình Env):**
   - Gọi `GET http://localhost:3000/api/health` xác nhận phản hồi `{ "ok": true }` (hoặc `{ "data": { "ok": true }, "error": null }`).
   - Kiểm tra `.env.example` có đủ 8 biến môi trường bắt buộc và không có khóa bí mật nào bị commit cứng trong mã nguồn.
3. **Step 3 — Drive (Thực thi Test Suite 3 tầng & Luồng UI):**
   - Chạy unit/integration test cho các helper và API endpoints (`SheetsServiceHelper`, `GeminiParserServiceHelper`, `GmailSyncService`).
   - Kiểm tra bề mặt UI: Lọc tháng `YYYY-MM`, tìm kiếm từ khóa, chuyển trang 1 -> 2, thêm danh mục Cha/Con và bấm nút "Đồng bộ Gmail".
4. **Step 4 — Evidence (Thu thập bằng chứng QA):**
   - Lưu log kết quả chạy test, response JSON của `/api/expenses`, `/api/categories`, `/api/gmail/sync` và ảnh chụp màn hình 5 trạng thái UX.
5. **Step 5 — Cleanup (Dọn dẹp sau kiểm thử):**
   - Giải phóng tiến trình Node/Express trên cổng `3000` và `5173`, xóa dữ liệu mock tạm thời, đảm bảo `git status` không phát sinh file rác.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

> **Lưu ý:** Khi triển khai thực tế trên nhánh code của dự án, Dev & Tester thực hiện tuần tự các Atomic Tasks dưới đây (mỗi task chỉ chạm 1 file/module).

| Mã Task | Role phụ trách | File mục tiêu | Mô tả chi tiết hàm cần viết | Phụ thuộc | Lệnh Verify & Tiêu chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `idea/expense-management-app/src/config/settings.json` & `api/_lib/constants.ts` | Tập trung hóa toàn bộ hằng số (`APP_CONSTANTS`, `OrderStatus`, `SheetTabName`) và schema cấu hình `settings.json`, loại bỏ mọi magic numbers/strings. | *None* | `npx tsc --noEmit` chạy xanh, không còn hằng số rải rác. |
| `TASK-002` | **Developer** | `idea/expense-management-app/api/_lib/SheetsServiceHelper.ts` | Viết các hàm thuần: `mapRowToExpense()`, `mapExpenseToRow()` (kèm chống Formula Injection), `filterAndPaginateExpenses()`, `flattenCategoryTreeToRows()`, `buildCategoryTreeFromRows()`. | **Hard:** `TASK-001` | `npx tsc --noEmit` pass; có đầy đủ JSDoc cho từng hàm. |
| `TASK-003` | **Test Engineer** | `idea/expense-management-app/tests/sheets-helper.test.ts` | Viết Unit Test 3 tầng cho `SheetsServiceHelper`: lọc tháng, tìm kiếm, phân trang (`0`, `20`, `21` dòng), và chống Formula Injection (`=SUM(...)`). | **Hard:** `TASK-002` | `npx vitest run tests/sheets-helper.test.ts` xanh 100%. |
| `TASK-004` | **Developer** | `idea/expense-management-app/api/_lib/SheetsService.ts` | Tách biệt lớp giao tiếp Google Sheets API (`getExpenses`, `appendExpenseIfNotExists`, `getCategories`, `saveCategories`, `getSyncState`, `updateSyncState`) gọi qua `SheetsServiceHelper`. | **Hard:** `TASK-002` | `npx tsc --noEmit` pass; chặn lưu mảng categories rỗng. |
| `TASK-005` | **Developer** | `idea/expense-management-app/api/_lib/GeminiParserServiceHelper.ts` | Viết `buildExtractionPrompt()` và `sanitizeAndValidateGeminiJson()` xử lý bóc tách JSON từ markdown fence, chuẩn hóa số tiền `VND` và ép fallback `"Mua sắm > Khác"`. | **Hard:** `TASK-001` | `npx tsc --noEmit` pass; không bao giờ ném lỗi crash khi AI trả chuỗi lạ. |
| `TASK-006` | **Test Engineer** | `idea/expense-management-app/tests/gemini-parser-helper.test.ts` | Viết Unit Test kiểm thử `GeminiParserServiceHelper`: JSON chuẩn, JSON bọc trong ```` ```json ````, danh mục AI bịa đặt -> fallback `"Mua sắm > Khác"`, tiền âm -> `0`, `isPurchaseEmail: false`. | **Hard:** `TASK-005` | `npx vitest run tests/gemini-parser-helper.test.ts` xanh 100%. |
| `TASK-007` | **Developer** | `idea/expense-management-app/api/_lib/GmailSyncServiceHelper.ts` | Viết hàm giải mã Base64URL email body, lọc sạch thẻ `<script>/<style>`, cắt giới hạn `12000` ký tự, trích xuất `purchaseDate` (`YYYY-MM-DD`) và `imageUrl`. | **Hard:** `TASK-001` | `npx tsc --noEmit` pass; xử lý an toàn cả email multipart/alternative và plain text. |
| `TASK-008` | **Developer** | `idea/expense-management-app/api/_lib/GmailSyncService.ts` | Viết `syncRecentPurchaseEmails()` tích hợp Lock chống chạy trùng (`SYNC_IN_PROGRESS`), kiểm tra dedup `gmailMessageId` trước khi gọi Gemini, lưu vào Sheet và cập nhật `SyncState`. | **Hard:** `TASK-004`, `TASK-005`, `TASK-007` | `npx tsc --noEmit` pass; trả về thống kê `{ scanned, inserted, skippedDuplicate, skippedNonPurchase }`. |
| `TASK-009` | **Test Engineer** | `idea/expense-management-app/tests/gmail-sync-service.test.ts` | Viết Integration Test (với Mock Gmail/Gemini/Sheets) cho `GmailSyncService`: luồng thêm mới, luồng bỏ qua email trùng `gmailMessageId`, và luồng chặn 2 request sync đồng thời (`409`). | **Hard:** `TASK-008` | `npx vitest run tests/gmail-sync-service.test.ts` xanh 100%. |
| `TASK-010` | **Developer** | `idea/expense-management-app/api/expenses/index.ts` & `api/categories/index.ts` & `api/gmail/sync.ts` | Chuẩn hóa các API Route Handlers trả về đúng cấu trúc `{ data, error }`, kiểm tra xác thực JWT cookie và gắn mã HTTP chuẩn (`200`, `400`, `401`, `409`, `500`). | **Hard:** `TASK-004`, `TASK-008` | `npx tsc --noEmit` pass; phản hồi API đồng nhất 100%. |
| `TASK-011` | **Developer** | `idea/expense-management-app/web/src/pages/ExpensesPage.tsx` | Bổ sung đầy đủ 5 trạng thái UX (Ideal, Skeleton Loading, Empty state theo tháng, Error banner + Retry, và khoá nút khi đang đồng bộ Gmail). | **Soft:** `TASK-010` | `cd web && npm run build` thành công không có lỗi TypeScript/Vite. |
| `TASK-012` | **Test Engineer** | `idea/expense-management-app/tests/api-routes-e2e.test.ts` | Viết bài test kiểm tra toàn bộ API Routes (`/api/health`, `/api/auth/me`, `/api/expenses`, `/api/categories`, `/api/gmail/sync`) qua Express local server. | **Hard:** `TASK-010` | `npx vitest run` toàn bộ test suite đạt 100% pass. |
