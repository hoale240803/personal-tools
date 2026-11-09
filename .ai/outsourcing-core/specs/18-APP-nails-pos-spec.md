# ĐẶC TẢ KỸ THUẬT & THỰC THI: NAILS-POS (HỆ THỐNG QUẢN LÝ TIỆM NAILS TẠI MỸ)

> **Dự án:** `nails-pos`  
> **Phân nhóm:** Core SaaS / POS / Finance (Nhóm 1)  
> **Đơn vị lập đặc tả:** AISE Squad 1 — BA Team (`intake`, `ba`, `requirement_challenger`) & PM Team (`orchestrator`, `estimator_cost_controller`)  
> **Nguồn tham chiếu:** `idea/nails-pos/requirement.md`, `idea/nails-pos/Giai-doan-0.md`, `.aise/inbox/nails-pos-analysis.md`  
> **Trạng thái:** Dev-Ready & Test-Ready  

---

## PHẦN 1 — INTAKE & PHÂN LOẠI HỢP ĐỒNG (`intake`)

### 1.1 Nhãn Bảo Mật & Rủi Ro (Security & Risk Tags)
- `payment`: Tích hợp thiết bị quẹt thẻ vật lý PAX A920 (Credit/Debit tất cả ngân hàng Mỹ), xử lý tiền Tip thẻ, phí cà thẻ (1%~2%), và phát hành/trừ tiền QR Gift Card.
- `auth`: Phân quyền thao tác nhạy cảm (Chủ tiệm / Quản lý Manual Override đổi lượt thợ, hủy giao dịch cưỡng chế, xem Z-Report & Payroll).
- `pii`: Lưu trữ dữ liệu khách hàng (Số điện thoại, tên, lịch sử dịch vụ, điểm Loyalty) và dữ liệu nhân sự (Technicians, tỷ lệ ăn chia hoa hồng, thu nhập tiền mặt/thẻ).
- `external_api`: Giao tiếp mạng nội bộ LAN/WiFi với PAX A920 Terminal (qua router Linksys E2500), máy in nhiệt ESC/POS (80mm/58mm), và cổng SMS Gateway (Twilio / Mock SMS).

### 1.2 Bảng Phân Tách: Stated Facts, Explicit Assumptions & Clarification Questions

| Phân loại | Mã tham chiếu | Nội dung chi tiết | Nguồn / Cơ sở |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-01` | Hỗ trợ thanh toán thẻ Credit/Debit tất cả ngân hàng tại Mỹ với mức phí cà thẻ thấp (1~2%), tiệm chịu hoàn toàn phí quẹt thẻ, không thu phụ phí (surcharge) từ khách. | `requirement.md`, `nails-pos-analysis.md` |
| **Stated Fact** | `SF-02` | Thiết bị tại quầy gồm máy POS 2 màn hình (Dual Screen: màn hình lễ tân + Customer Display), máy cà thẻ PAX A920 (hoặc AT990/A920), router Linksys E2500, máy in hóa đơn nhiệt 80mm/58mm. | `Giai-doan-0.md`, `nails-pos-analysis.md` |
| **Stated Fact** | `SF-03` | Lỗi thực tế tại tiệm (Field Bug): Máy cà thẻ hay bị đơ ở màn hình khách chọn Tip sau khi lễ tân bấm PAY. Cần cơ chế Cancel cưỡng chế từ POS, Timeout và Heartbeat. | `Giai-doan-0.md`, `nails-pos-analysis.md` |
| **Stated Fact** | `SF-04` | Thuật toán chia turn 3 mức ưu tiên: (1) Thứ tự thợ vào tiệm (Clock-in), (2) Thợ có ít turn hơn, (3) Khi tất cả đều bận, chọn thợ có kỹ năng làm dịch vụ đó ra sớm nhất. | `Giai-doan-0.md`, `nails-pos-analysis.md` |
| **Stated Fact** | `SF-05` | Dịch vụ giá dưới ngưỡng 1 turn (`< $35`) không tính là 1 turn, không cộng dồn, và ưu tiên rải từ dưới lên (thợ rảnh cuối danh sách). | `Giai-doan-0.md`, `nails-pos-analysis.md` |
| **Stated Fact** | `SF-06` | Khách chỉ định (Request) không tính là 1 turn thông thường và không đẩy thợ xuống cuối danh sách rảnh. Khách hủy dịch vụ trong 5 phút đầu đưa thợ về lại đầu danh sách rảnh. | `nails-pos-analysis.md` |
| **Stated Fact** | `SF-07` | Tỷ lệ ăn chia mặc định 60/40 (thợ 60%, tiệm 40%), trừ Supply Fee (nếu có) trước khi chia. Tiền mặt trả tiền mặt; tiền thẻ trả bằng Check/Direct Deposit. Tip thẻ trừ phí thẻ rồi trả thợ. | `nails-pos-analysis.md` |
| **Stated Fact** | `SF-08` | Đặt lịch hẹn (Booking) tại quầy hoặc online không cần cọc, có SMS nhắc hẹn trước `X` giờ. Tích điểm Loyalty theo ngưỡng chi tiêu (VD: đủ `$300` giảm `$10`) và QR Gift Card. | `requirement.md`, `nails-pos-analysis.md` |
| **Explicit Assumption** | `EA-01` | Hệ thống lưu trữ tiền tệ dưới dạng số nguyên `cents` (ví dụ: `$35.00` = `3500` cents) hoặc số thực làm tròn 2 chữ số thập phân chuẩn `USD` để tránh sai số dấu phẩy động IEEE 754 khi chia 60/40. | Chuẩn kỹ thuật POS/Finance |
| **Explicit Assumption** | `EA-02` | Thời gian Timeout mặc định cho màn hình chọn Tip trên máy PAX A920 là `60000ms` (60 giây), và chu kỳ Heartbeat kiểm tra kết nối LAN với máy PAX là `5000ms` (5 giây). | Giả định kỹ thuật chống treo |
| **Explicit Assumption** | `EA-03` | Khi thợ vào trễ/bận việc đột xuất mới Clock-in (`Giai-doan-0.md` mục 3), hệ thống gán `initialTurnFloor = min(activeTechTurns)` hoặc xếp ở cuối hàng đợi thợ rảnh tại thời điểm Clock-in để không nhảy cóc lên trước các thợ đang rảnh khác. | `Giai-doan-0.md` (Ví dụ thợ C) |

### 1.3 Câu Hỏi Làm Rõ (Clarification Questions)

| Mã | Câu hỏi | Các lựa chọn (Options) | Khuyến nghị (Recommendation) |
| :--- | :--- | :--- | :--- |
| `CQ-01` | Khi khách làm **Combo 2 dịch vụ** do 2 thợ khác nhau phụ trách (1 thợ làm Tay `$25 < $35`, 1 thợ làm Chân `$45 >= $35`) và khách trả 1 lần Tip qua thẻ, tiền Tip thẻ sẽ được chia cho 2 thợ theo tiêu chí nào? | **Option A:** Chia theo tỷ lệ giá trị dịch vụ của từng thợ trên tổng bill.<br>**Option B:** Chia đều 50/50 cho 2 thợ.<br>**Option C:** Cho phép lễ tân nhập số tiền Tip tách riêng cho từng thợ lúc kết đơn (mặc định chia theo tỷ lệ giá dịch vụ). | **Khuyến nghị Option C:** Tự động chia theo tỷ lệ giá trị dịch vụ làm mặc định, nhưng cho phép lễ tân chỉnh tay nếu khách dặn riêng. |
| `CQ-02` | Khấu trừ phí thẻ trên tiền Tip thẻ của thợ được tính theo mức cố định cấu hình trong `settings.json` (VD: `2.0%`) hay lấy phí thực tế từ phản hồi của cổng PAX? | **Option A:** Cố định theo cấu hình tiệm (`cardTipFeePercent`, mặc định `2%`).<br>**OptionB:** Lấy phí thực tế từng loại thẻ từ PAX response. | **Khuyến nghị Option A:** Cấu hình cố định trong `settings.json` (mặc định `2%`) để thợ dễ nhẩm tính và minh bạch khi đối soát lương cuối ngày. |

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1 Bảng Yêu Cầu Nghiệp Vụ (Traceability Matrix)

| Mã REQ | Tên yêu cầu | Mô tả nghiệp vụ chi tiết | Nguồn gốc | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | Quản lý Clock-in & Hàng đợi thợ (`QueueManager`) | Ghi nhận thứ tự thợ vào làm trong ngày, quản lý trạng thái `AVAILABLE` / `BUSY` / `ON_BREAK`, bảo toàn thứ tự ưu tiên cho thợ vào trước. | `Giai-doan-0.md` #3 | **P0 Must-Have** |
| `REQ-002` | Thuật toán Chia Turn (`TurnEngine`) | Chia lượt theo 3 tầng ưu tiên (Giờ vào -> Ít turn -> Ra sớm nhất theo Skill). Xử lý dịch vụ `< $35` rải từ dưới lên, khách Request bảo lưu lượt, hủy `< 5 phút` trả về đầu hàng đợi, và Manual Override. | `Giai-doan-0.md` #3, `nails-pos-analysis.md` | **P0 Must-Have** |
| `REQ-003` | Quản lý Menu Dịch vụ & Add-ons (`ServiceCatalog`) | CRUD danh mục dịch vụ (Full-set, Pedicure, Manicure, Gel...), cấu hình giá, thời lượng dự kiến (`estimatedMinutes`), kỹ năng yêu cầu và `supplyFee` tùy chọn. | `requirement.md`, `nails-pos-analysis.md` | **P0 Must-Have** |
| `REQ-004` | Tạo Ticket & Tính tiền (`TicketService`) | Tạo hóa đơn, gán 1 hoặc nhiều thợ (Combo), áp dụng Loyalty / Gift Card / Discount, tính Subtotal, Tax, Tip và Total. | `nails-pos-analysis.md` Stage 2 | **P0 Must-Have** |
| `REQ-005` | Điều phối Thanh toán PAX & Chống đơ (`PaymentCoordinator`) | Giao tiếp PAX A920 qua LAN, theo dõi trạng thái màn hình chọn Tip, tự động hoặc cho phép bấm nút Force Cancel khi máy cà thẻ đơ quá Timeout, chống trừ tiền 2 lần (Idempotency). | `Giai-doan-0.md` #1, #4 | **P0 Must-Have** |
| `REQ-006` | Đồng bộ Màn hình phụ (`CustomerDisplaySync`) | Phát sự kiện thời gian thực qua `BroadcastChannel` / Event Bus sang màn hình thứ 2 cho khách xem chi tiết dịch vụ, tổng tiền và trạng thái thanh toán. | `Giai-doan-0.md` #4, `nails-pos-analysis.md` | **P1 Should-Have** |
| `REQ-007` | In Hóa đơn Nhiệt (`ReceiptPrinterAdapter`) | Xuất bản in khổ 80mm/58mm qua LAN/USB (hoặc Mock) gồm chi tiết dịch vụ, tên thợ, tiền Tip, tổng tiền và dòng chữ ký. | `nails-pos-analysis.md` Stage 1 | **P1 Should-Have** |
| `REQ-008` | Kết toán Ngày & Tính Lương Thợ (`CloseDay` & `Payroll`) | Xuất báo cáo Z-Report cuối ngày; tính lương thợ theo tỷ lệ (60/40) sau khi trừ Supply Fee; tách phần trả Tiền mặt vs Check/Direct Deposit; khấu trừ phí thẻ trên tiền Tip thẻ. | `Giai-doan-0.md` #5, `nails-pos-analysis.md` Stage 3 | **P0 Must-Have** |
| `REQ-009` | CRM Khách hàng & Tích điểm Loyalty (`CrmService`) | Lưu hồ sơ khách theo SĐT, cộng dồn chi tiêu và tự động cấp/áp dụng phần thưởng khi đạt mốc (VD: chi đủ `$300` giảm `$10`). | `nails-pos-analysis.md` Stage 4 | **P1 Should-Have** |
| `REQ-010` | Đặt lịch hẹn, Nhắc SMS & QR Gift Card (`Booking` & `GiftCard`) | Đặt lịch hẹn không cần cọc, kiểm tra trùng lịch thợ, gửi SMS nhắc trước `X` giờ; phát hành và quét trừ số dư thẻ quà tặng QR Code. | `requirement.md`, `nails-pos-analysis.md` Stage 4 | **P2 Nice-to-Have** |

### 2.2 Data Structures, Constants & `settings.json` Schema

#### A. Bảng `CONSTANTS` & `ENUMS` (Tuân thủ nghiêm ngặt No Magic Numbers/Strings)

```typescript
export enum TechnicianStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  ON_BREAK = 'ON_BREAK',
  CLOCKED_OUT = 'CLOCKED_OUT',
}

export enum TurnAssignmentType {
  FULL_TURN = 'FULL_TURN',         // Dịch vụ >= $35
  BONUS_UNDER_THRESHOLD = 'BONUS', // Dịch vụ < $35 (rải từ dưới lên, không cộng turn)
  CLIENT_REQUEST = 'REQUEST',      // Khách chỉ định (không cộng turn xoay vòng, giữ vị trí rảnh)
  MANUAL_OVERRIDE = 'OVERRIDE',    // Chủ tiệm kéo thả chỉ định
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_SERVICE = 'IN_SERVICE',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  CANCELLED_EARLY = 'CANCELLED_EARLY', // Hủy trong 5 phút đầu
  VOIDED = 'VOIDED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD_PAX = 'CARD_PAX',
  GIFT_CARD_QR = 'GIFT_CARD_QR',
  SPLIT = 'SPLIT',
}

export enum PaxTerminalStatus {
  IDLE = 'IDLE',
  WAITING_FOR_CARD = 'WAITING_FOR_CARD',
  WAITING_FOR_TIP = 'WAITING_FOR_TIP',
  PROCESSING = 'PROCESSING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  FROZEN_TIMEOUT = 'FROZEN_TIMEOUT',
  CANCELLED_BY_POS = 'CANCELLED_BY_POS',
}

export const POS_CONSTANTS = {
  DEFAULT_TURN_THRESHOLD_USD: 35.0,
  EARLY_CANCEL_WINDOW_MINUTES: 5,
  DEFAULT_TECH_COMMISSION_RATE: 0.60,
  DEFAULT_SALON_COMMISSION_RATE: 0.40,
  DEFAULT_CARD_TIP_FEE_RATE: 0.02,
  PAX_TIP_SCREEN_TIMEOUT_MS: 45000,
  PAX_HEARTBEAT_INTERVAL_MS: 5000,
  PAX_MAX_RETRY_ATTEMPTS: 2,
  DEFAULT_LOYALTY_SPEND_MILESTONE_USD: 300.0,
  DEFAULT_LOYALTY_REWARD_USD: 10.0,
  DEFAULT_SMS_REMINDER_HOURS_BEFORE: 2,
  RECEIPT_WIDTH_80MM_CHARS: 48,
  RECEIPT_WIDTH_58MM_CHARS: 32,
  BROADCAST_CHANNEL_NAME: 'NAILS_POS_CUSTOMER_DISPLAY_V1',
} as const;
```

#### B. Core TypeScript Interfaces (`src/modules/core/types.ts`)

```typescript
export interface Technician {
  id: string;
  name: string;
  phone: string;
  skills: string[]; // ['FULL_SET', 'PEDICURE', 'MANICURE', 'NAIL_ART']
  commissionRate: number; // e.g., 0.60
  status: TechnicianStatus;
  clockInTime: string | null; // ISO-8601
  clockInOrder: number; // Thứ tự vào làm trong ngày (1, 2, 3...)
  fullTurnCount: number; // Số turn >= $35 trong ngày
  bonusTurnCount: number; // Số lượt < $35 trong ngày
  requestCount: number; // Số lượt khách chỉ định
  estimatedAvailableAt: string | null; // ISO-8601
}

export interface ServiceItem {
  id: string;
  name: string;
  categoryId: string;
  priceUsd: number;
  supplyFeeUsd: number; // Khấu trừ trước khi chia 60/40
  estimatedMinutes: number;
  requiredSkill: string;
}

export interface TicketLineItem {
  lineId: string;
  serviceId: string;
  serviceName: string;
  priceUsd: number;
  supplyFeeUsd: number;
  assignedTechId: string;
  assignmentType: TurnAssignmentType;
  startedAt: string;
}

export interface Ticket {
  id: string;
  customerId: string | null;
  status: TicketStatus;
  lines: TicketLineItem[];
  subtotalUsd: number;
  discountUsd: number;
  taxUsd: number;
  tipUsd: number;
  totalUsd: number;
  paymentMethod: PaymentMethod | null;
  idempotencyKey: string;
  createdAt: string;
  paidAt: string | null;
}

export interface PayrollSummary {
  technicianId: string;
  technicianName: string;
  date: string;
  grossServiceSalesUsd: number;
  totalSupplyFeeDeductedUsd: number;
  netCommissionableUsd: number;
  techCommissionEarnedUsd: number;
  cardTipsGrossUsd: number;
  cardTipFeeDeductedUsd: number;
  cardTipsNetUsd: number;
  payoutCashUsd: number; // Tiền mặt trả trực tiếp
  payoutCheckOrDirectDepositUsd: number; // Tiền thẻ + Tip thẻ ròng trả qua Check/DD
}
```

#### C. `settings.json` Schema (Lưu cấu hình & tham chiếu biến môi trường, tuyệt đối không hardcode secret)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "NailsPosSettings",
  "type": "object",
  "required": [
    "salonProfile",
    "turnRules",
    "financialRules",
    "hardwareAdapters",
    "loyaltyRules"
  ],
  "properties": {
    "salonProfile": {
      "type": "object",
      "properties": {
        "salonName": { "type": "string", "default": "ABC Nails & Spa" },
        "timezone": { "type": "string", "default": "America/New_York" },
        "SalesTaxRate": { "type": "number", "default": 0.0 }
      }
    },
    "turnRules": {
      "type": "object",
      "properties": {
        "turnPriceThresholdUsd": { "type": "number", "default": 35.0 },
        "earlyCancelWindowMinutes": { "type": "number", "default": 5 },
        "requestCountsAsRegularTurn": { "type": "boolean", "default": false }
      }
    },
    "financialRules": {
      "type": "object",
      "properties": {
        "defaultTechCommissionRate": { "type": "number", "default": 0.60 },
        "cardProcessingFeeRate": { "type": "number", "default": 0.02 },
        "deductFeeFromCardTip": { "type": "boolean", "default": true },
        "passCardSurchargeToCustomer": { "type": "boolean", "default": false }
      }
    },
    "hardwareAdapters": {
      "type": "object",
      "properties": {
        "useMockTerminal": { "type": "boolean", "default": true },
        "paxTerminalIpEnvKey": { "type": "string", "default": "PAX_TERMINAL_IP" },
        "paxTerminalPortEnvKey": { "type": "string", "default": "PAX_TERMINAL_PORT" },
        "paxTipTimeoutMs": { "type": "number", "default": 45000 },
        "useMockPrinter": { "type": "boolean", "default": true },
        "printerPaperWidthMm": { "type": "number", "enum": [58, 80], "default": 80 },
        "useMockSms": { "type": "boolean", "default": true },
        "twilioSidEnvKey": { "type": "string", "default": "TWILIO_ACCOUNT_SID" },
        "twilioAuthTokenEnvKey": { "type": "string", "default": "TWILIO_AUTH_TOKEN" }
      }
    },
    "loyaltyRules": {
      "type": "object",
      "properties": {
        "spendMilestoneUsd": { "type": "number", "default": 300.0 },
        "rewardDiscountUsd": { "type": "number", "default": 10.0 },
        "smsReminderHoursBefore": { "type": "number", "default": 2 }
      }
    }
  }
}
```

### 2.3 Kiến Trúc Service & Helper (Tuân thủ Rule 4 & Single Responsibility Principle)

| Tên File | Role (Service / Helper) | Chữ ký hàm chính (Method Signatures) | Mục đích (Docstring tóm tắt) |
| :--- | :--- | :--- | :--- |
| `src/modules/turns/TurnService.ts` | **Service** | `assignNextTechnician(service: ServiceItem, techs: Technician[], requestedTechId?: string): { tech: Technician; assignmentType: TurnAssignmentType }`<br>`handleEarlyCancel(ticketLine: TicketLineItem, cancelledAt: Date): Technician`<br>`applyManualOverride(techList: Technician[], fromIndex: number, toIndex: number, managerPin: string): Technician[]` | Điều phối nghiệp vụ chia turn chính theo 8 quy tắc tiệm nails. |
| `src/modules/turns/TurnServiceHelper.ts` | **Helper** | `sortAvailableForFullTurn(techs: Technician[]): Technician[]`<br>`pickBottomUpForUnderThreshold(techs: Technician[], requiredSkill: string): Technician \| null`<br>`pickEarliestFinishingTechWithSkill(busyTechs: Technician[], requiredSkill: string): Technician \| null`<br>`isWithinEarlyCancelWindow(startedAt: string, cancelledAt: string, windowMinutes: number): boolean` | Các hàm thuần (pure functions) lọc, sắp xếp mảng thợ không chứa side-effect. |
| `src/modules/checkout/PaymentService.ts` | **Service** | `initiateCardPayment(ticket: Ticket, idempotencyKey: string): Promise<PaymentResult>`<br>`forceCancelFrozenTerminal(ticketId: string, reason: string): Promise<CancelResult>` | Điều phối giao dịch PAX A920, quản lý lock Idempotency, xử lý chống đơ màn hình Tip. |
| `src/modules/checkout/PaymentServiceHelper.ts` | **Helper** | `buildPaxPayload(ticket: Ticket): PaxRequestPayload`<br>`validateIdempotencyState(existingRecord: PaymentAttempt \| undefined): void`<br>`createTimeoutPromise(timeoutMs: number, ticketId: string): Promise<never>` | Chuẩn bị payload PAX, kiểm tra khóa trùng lặp và tạo bộ đếm thời gian chống treo. |
| `src/modules/money/PayrollService.ts` | **Service** | `calculateDailyPayroll(date: string, tickets: Ticket[], techs: Technician[]): PayrollSummary[]`<br>`generateZReport(date: string, tickets: Ticket[]): ZReportData` | Tính bảng lương thợ cuối ngày và báo cáo kết toán Z-Report. |
| `src/modules/money/PayrollServiceHelper.ts` | **Helper** | `computeLineCommission(priceUsd: number, supplyFeeUsd: number, rate: number): { techShareUsd: number; salonShareUsd: number }`<br>`computeNetCardTip(grossTipUsd: number, cardFeeRate: number): { netTipUsd: number; feeDeductedUsd: number }` | Tính toán số học chính xác tới từng xu (cent-level rounding) cho hoa hồng và tip thẻ. |

### 2.4 Ma Trận 5 Trạng Thái UX (5-State UX Matrix)

| Màn hình / Luồng | 1. Ideal State (Hoạt động chuẩn) | 2. Loading State (Đang xử lý) | 3. Empty State (Chưa có dữ liệu) | 4. Error State (Lỗi kết nối / Nghiệp vụ) | 5. Partial / Overflow State (Quá tải / Một phần) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Bảng Chia Turn Thợ (Turn Board)** | Hiển thị rõ 2 cột: `Thợ Đang Rảnh` (xếp theo thứ tự ưu tiên 1->2) và `Thợ Đang Làm` (kèm đồng hồ đếm ngược phút dự kiến xong). | Skeleton thẻ thợ khi đồng bộ ca làm việc đầu ngày (`< 200ms`). | "Chưa có thợ nào Clock-in hôm nay. Bấm [Clock-In Thợ] để bắt đầu ngày mới." | Hiển thị banner đỏ nếu không có thợ nào trong tiệm có kỹ năng (`requiredSkill`) cho dịch vụ khách chọn. | Khi tiệm có `> 20` thợ hoặc tất cả thợ đều `BUSY`: Cột `Rảnh` hiện thông báo "Tất cả thợ đang bận — Tự động gợi ý thợ ra sớm nhất: [Tên Thợ] (còn ~X phút)". |
| **Luồng Thanh Toán PAX A920 & Màn hình Tip** | Lễ tân bấm `PAY` -> Màn hình POS hiện trạng thái live: `Đang chờ khách chọn Tip trên PAX...` -> `Approved` -> Tự in bill. | Thanh tiến trình đếm ngược 45s chờ khách bấm Tip trên máy PAX kèm nhịp Heartbeat xanh. | Nếu Ticket chưa có dịch vụ nào, nút `PAY` bị vô hiệu hóa (`disabled`) kèm chú thích "Thêm ít nhất 1 dịch vụ để thanh toán". | Khi PAX bị đơ màn hình Tip quá 45s hoặc mất mạng LAN: Hiện hộp thoại cảnh báo vàng/đỏ với nút lớn **[HỦY LỆNH PAX CƯỠNG CHẾ (FORCE CANCEL)]** và **[CHUYỂN SANG TIỀN MẶT / THỬ LẠI]**. | Khách thanh toán **Split Payment** (1 phần QR Gift Card hết số dư `$20`, phần còn lại `$35` cà thẻ PAX): Hiển thị rõ số tiền đã trừ và số dư còn thiếu. |
| **Màn hình phụ Khách Hàng (Customer Display)** | Hiển thị danh sách dịch vụ, tên thợ, giảm giá Loyalty, Subtotal và Total chữ lớn, đồng bộ tức thì. | Hiện màn hình chào mừng thương hiệu tiệm kèm spinner nhẹ khi lễ tân đang tạo hóa đơn. | Màn hình chờ (Idle Carousel): Hiển thị bảng giá nổi bật và mã QR đăng ký hội viên Loyalty. | Khi mất kết nối `BroadcastChannel`: Tự động chuyển về màn hình chào mừng tĩnh, không hiện stack trace kỹ thuật ra phía khách. | Khi hóa đơn có `> 8` dịch vụ/add-ons (nhóm khách đi đông): Tự động cuộn mượt tới dòng mới nhất và ghim cố định thanh `Tổng Cộng` ở đáy màn hình. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

| # | Lỗ hổng / Rủi ro thực tế (Vulnerability / Edge Risk) | Tác động nếu không chặn | Quy tắc Khóa Chặn Cụ Thể Trong Code (Technical Guardrail) |
| :--- | :--- | :--- | :--- |
| **1** | **Treo màn hình chọn Tip trên máy PAX A920 & Lỗi Double Charge khi lễ tân bấm PAY lại** (`Timeout` & `Idempotency`) | Lễ tân thấy máy PAX đơ liền bấm `PAY` lần 2 trên POS -> Khách bị trừ tiền thẻ 2 lần cho cùng 1 hóa đơn hoặc treo phiên kết nối TCP/IP trên router Linksys E2500. | 1. Gắn `idempotencyKey = "${ticket.id}_${attemptNumber}"` vào mỗi phiên thanh toán.<br>2. Khóa cứng trạng thái Ticket ở `PENDING_PAYMENT` (không cho gọi `initiateCardPayment` lần 2 khi phiên trước chưa chuyển sang `CANCELLED_BY_POS` hoặc `DECLINED`).<br>3. Bọc lời gọi PAX bằng `Promise.race([paxCall, createTimeoutPromise(45000)])`. Khi bấm `Force Cancel`, phải gửi gói tin `ABORT/RESET` tới PAX trước khi mở khóa UI. |
| **2** | **Gian lận / Lệch lượt khi khách hủy dịch vụ hoặc đổi ý** (`Turn Manipulation` & `Boundary Abuse`) | Thợ nhận khách `$50` (tính 1 turn, bị đẩy xuống cuối hàng đợi), nhưng 3 phút sau khách đổi ý không làm nữa -> Thợ bị mất oan 1 lượt đầu ngày. Ngược lại, nếu đã làm 30 phút mới bấm hủy để lách luật lấy lại đầu bảng. | Trong `TurnService.handleEarlyCancel()`: Kiểm tra nghiêm ngặt `elapsedMinutes = (cancelledAt - startedAt) <= POS_CONSTANTS.EARLY_CANCEL_WINDOW_MINUTES` (5 phút). Nếu `<= 5 phút`: hoàn trả `fullTurnCount - 1` và chèn thợ về vị trí index `0` của hàng đợi rảnh. Nếu `> 5 phút`: bắt buộc nhập PIN Quản lý (`Manager Override`) mới cho phép hoàn turn. |
| **3** | **Race Condition khi 2 lễ tân / 2 tab cùng gán thợ hoặc quét cùng 1 QR Gift Card** (`Concurrency` & `Data Corruption`) | Cùng 1 thợ đang rảnh đầu bảng bị gán cho 2 Ticket khác nhau cùng lúc, hoặc thẻ QR Gift Card còn `$50` bị quét thanh toán đồng thời cho 2 bàn. | Sử dụng cơ chế Mutex / Optimistic Locking (`version: number` trên mỗi bản ghi `Technician` và `GiftCard` trong `storage.ts`). Mọi thao tác ghi phải kiểm tra `currentVersion === expectedVersion`; nếu lệch, ném lỗi `CONCURRENT_MODIFICATION_ERROR` và tải lại trạng thái mới nhất. |
| **4** | **Sai số làm tròn tiền tệ khi chia hoa hồng 60/40 và khấu trừ phí thẻ trên Tip** (`Floating-Point Precision Loss`) | Trong JavaScript, `35.15 * 0.6 = 21.090000000000003`, cộng dồn cuối ngày trong Z-Report làm lệch tổng tiền mặt/check vài xu đến vài đô la. | Toàn bộ hàm trong `PayrollServiceHelper.ts` bắt buộc quy đổi sang số nguyên `cents = Math.round(amountUsd * 100)` trước khi nhân tỷ lệ, sau đó dùng `Math.round()` cho phần của thợ và `salonShareCents = netCents - techShareCents` để đảm bảo tổng `techShare + salonShare === 100%` tuyệt đối không thừa/thiếu 1 cent. |
| **5** | **Khách dùng dịch vụ `< $35` nhiều lần liên tiếp làm thợ cuối bảng bị quá tải** (`Starvation / Fairness Risk`) | Nếu liên tục có 3 khách vào sơn sửa móng lặt vặt (`$15`), và thuật toán chỉ lấy phần tử cuối cùng cố định thì 1 thợ bị bắt làm dịch vụ nhỏ liên tục. | Trong `TurnServiceHelper.pickBottomUpForUnderThreshold()`: Khi thợ cuối bảng đang `BUSY` làm dịch vụ `< $35`, con trỏ tự động dịch ngược lên thợ rảnh kế tiếp từ dưới lên (`index = availableTechs.length - 1` giảm dần về `0`). |

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1 Kịch Bản Kiểm Thử 3 Tầng (`Given / When / Then`)

#### Tầng 1: P0 Happy Paths (Người dùng hay xài nhất)
- **TC-P0-01 (Chia turn chuẩn theo giờ vào & số turn):**
  - *Given:* Thợ A Clock-in lúc 09:00 (`0 turn`), Thợ B Clock-in lúc 09:05 (`0 turn`), ngưỡng turn là `$35`.
  - *When:* Khách 1 vào làm Full-set (`$45`), tiếp theo Khách 2 vào làm Pedicure (`$40`).
  - *Then:* Khách 1 được gán cho Thợ A (`fullTurnCount = 1`); Khách 2 được gán cho Thợ B (`fullTurnCount = 1`).
- **TC-P0-02 (Dịch vụ dưới `$35` rải từ dưới lên & không tính turn):**
  - *Given:* Danh sách thợ rảnh theo thứ tự ưu tiên là `[Thợ A (0 turn), Thợ B (0 turn), Thợ C (1 turn - cuối bảng)]`.
  - *When:* Khách vào thay nước sơn giá `$15` (`< $35`).
  - *Then:* Hệ thống gán cho **Thợ C** (cuối danh sách rảnh), trạng thái `BONUS_UNDER_THRESHOLD`, và `fullTurnCount` của Thợ C giữ nguyên là `1` (không tăng lên 2, không cộng dồn `$15`).
- **TC-P0-03 (Khách chỉ định - Request bảo lưu vị trí):**
  - *Given:* Thợ A đang đứng đầu danh sách rảnh (`0 turn`).
  - *When:* Khách quen vào yêu cầu đích danh Thợ A làm dịch vụ `$50` (`requestedTechId = A`).
  - *Then:* Thợ A phục vụ khách với loại `CLIENT_REQUEST`, `requestCount` tăng 1, nhưng `fullTurnCount` vẫn là `0` và khi làm xong Thợ A quay lại đúng vị trí đầu hàng đợi rảnh.
- **TC-P0-04 (Tính lương thợ 60/40 có Supply Fee & Tip thẻ):**
  - *Given:* Thợ A làm 1 dịch vụ giá `$50` (Supply Fee `$5`), khách trả bằng thẻ và Tip trên thẻ `$10`. Cấu hình ăn chia `60/40`, phí thẻ `2%`.
  - *When:* Chạy `PayrollService.calculateDailyPayroll()`.
  - *Then:* `netCommissionable = $45`, `techCommissionEarned = $27.00` (`45 * 0.6`), `salonShare = $18.00`; Tip thẻ ròng `cardTipsNet = $9.80` (`10 - 0.20`); tổng trả qua Check/Direct Deposit cho Thợ A là `$36.80`.

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-NEG-01 (Xử lý máy cà thẻ PAX bị đơ ở màn hình chọn Tip):**
  - *Given:* Ticket `$65` đang gửi lệnh sang `PaxMockTerminal` ở chế độ `FREEZE_ON_TIP_SCREEN`.
  - *When:* Quá thời gian chờ hoặc lễ tân kích hoạt `forceCancelFrozenTerminal(ticketId, "PAX Frozen")`.
  - *Then:* Hệ thống gửi lệnh hủy phiên PAX, chuyển trạng thái terminal về `CANCELLED_BY_POS`, giải phóng khóa Ticket về `OPEN` để lễ tân chọn thu Tiền mặt hoặc thử lại mà không tạo giao dịch trùng.
- **TC-NEG-02 (Chặn Double Submit khi bấm PAY liên tục):**
  - *Given:* Ticket `T-100` đang ở trạng thái `PENDING_PAYMENT` với `idempotencyKey = "T-100_1"`.
  - *When:* Gọi tiếp `initiateCardPayment(ticket, "T-100_1")` khi giao dịch đầu chưa kết thúc.
  - *Then:* Hệ thống ném lỗi `PAYMENT_ALREADY_IN_PROGRESS` và không gửi lệnh thứ 2 xuống máy PAX.
- **TC-NEG-03 (Chặn đổi thứ tự Turn thủ công nếu không có quyền Quản lý):**
  - *Given:* Nhân viên lễ tân gọi `applyManualOverride()` với mã PIN sai hoặc rỗng.
  - *When:* Thực hiện đổi vị trí Thợ C lên đầu bảng.
  - *Then:* Hệ thống từ chối thao tác với mã lỗi `UNAUTHORIZED_MANAGER_PIN` và giữ nguyên hàng đợi.

#### Tầng 3: Boundary & Rare Edge Cases (0, -1, MAX, Empty, Duplicate, Concurrent)
- **TC-BND-01 (Biên giá dịch vụ đúng bằng `$35.00` và `$34.99`):**
  - *Given:* Ngưỡng turn cấu hình là `$35.00`.
  - *When:* Dịch vụ X có giá `$34.99` và Dịch vụ Y có giá `$35.00`.
  - *Then:* Dịch vụ X (`$34.99`) được xử lý là `BONUS_UNDER_THRESHOLD` (rải từ dưới lên, `0` turn); Dịch vụ Y (`$35.00`) được xử lý là `FULL_TURN` (ưu tiên đầu bảng, `+1` turn).
- **TC-BND-02 (Biên thời gian khách hủy dịch vụ đúng phút thứ 5:00 vs 5:01):**
  - *Given:* Thợ A bắt đầu làm dịch vụ lúc `10:00:00`.
  - *When:* Trường hợp 1 hủy lúc `10:05:00` (`300 giây`); Trường hợp 2 hủy lúc `10:05:01` (`301 giây`).
  - *Then:* Trường hợp 1 tự động hoàn turn và đưa Thợ A về vị trí đầu danh sách rảnh; Trường hợp 2 từ chối hoàn turn tự động và yêu cầu Manager Override.
- **TC-BND-03 (Tất cả thợ đều bận - Ưu tiên 3 theo Skill & thời gian ra sớm nhất):**
  - *Given:* Cả 3 thợ đều `BUSY`: Thợ A (chỉ làm Tay/Chân nước, còn 5 phút xong), Thợ B (làm được `FULL_SET`, còn 12 phút xong), Thợ C (làm được `FULL_SET`, còn 25 phút xong).
  - *When:* Khách mới vào yêu cầu làm `FULL_SET`.
  - *Then:* Hệ thống bỏ qua Thợ A (không có skill `FULL_SET`) và gán cho **Thợ B** (có skill `FULL_SET` và hoàn thành sớm nhất sau 12 phút).
- **TC-BND-04 (Giá trị âm hoặc bằng 0 / Quét QR Gift Card vượt số dư):**
  - *Given:* QR Gift Card còn số dư `$20.00`, Ticket tổng cộng `$50.00`, hoặc nhập giá dịch vụ `-10`.
  - *When:* Thêm dịch vụ giá âm hoặc quét thẻ Gift Card.
  - *Then:* Dịch vụ giá âm bị chặn ngay bởi `INVALID_PRICE_AMOUNT`; thẻ Gift Card chỉ trừ tối đa `$20.00` (số dư về `$0.00`) và báo số tiền còn phải thu thêm là `$30.00`.

### 4.2 Quy Trình 5 Bước Kiểm Chứng Bề Mặt Thật Cho QA Reviewer

1. **Step 1 — Launch (Khởi chạy môi trường cô lập):**
   - Chạy lệnh khởi tạo và kiểm tra build tại thư mục dự án: `cd d:\Workspace\personal-tools\idea\nails-pos && npm install && npm run build`.
2. **Step 2 — Doctor (Kiểm tra sức khỏe cấu hình & Mock Adapters):**
   - Kiểm tra sự tồn tại và hợp lệ của `settings.json`, đảm bảo không có secret hardcoded trong `src/`, và các adapter `useMockTerminal`, `useMockPrinter`, `useMockSms` phản hồi trạng thái `READY`.
3. **Step 3 — Drive (Bơm kịch bản kiểm thử tự động & luồng E2E):**
   - Thực thi toàn bộ bộ test 3 tầng: `npx vitest run --reporter=verbose`.
   - Kích hoạt kịch bản mô phỏng 1 ngày vận hành tiệm: 4 thợ Clock-in -> 10 khách vào (đủ trường hợp `>= $35`, `< $35`, Request, Busy Skill Match, Hủy trong 5 phút, PAX đơ màn hình Tip -> Force Cancel -> Thanh toán lại -> Xuất Z-Report & Payroll).
4. **Step 4 — Evidence (Thu thập bằng chứng nghiệm thu):**
   - Xuất log kết quả test, bảng đối soát JSON của `PayrollSummary`, bản in text 80mm từ `MockPrinter`, và log sự kiện `CustomerDisplaySync` lưu vào báo cáo QA.
5. **Step 5 — Cleanup (Dọn dẹp trạng thái):**
   - Xóa các file snapshot DB tạm sinh ra trong lúc test (`test-db-*.json`), đảm bảo `git status` sạch sẽ và không còn tiến trình ngầm treo port.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

> **Nguyên tắc Atomic Task:** Mỗi task chỉ chạm đúng 1 file hoặc 1 module độc lập, hoàn thành trong vài phút, dễ dàng revert bằng `git checkout` nếu cần.

| Mã Task | Role phụ trách | File mục tiêu | Mô tả chi tiết hàm cần viết | Phụ thuộc | Lệnh Verify & Tiêu chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `idea/nails-pos/package.json` & `tsconfig.json` & `src/config/settings.json` | Khởi tạo cấu trúc project TypeScript + Vitest và file cấu hình `settings.json` theo đúng JSON Schema ở Phần 2.2. | *None* | `cd idea/nails-pos && npm install && npx tsc --noEmit` chạy xanh không lỗi. |
| `TASK-002` | **Developer** | `idea/nails-pos/src/modules/core/types.ts` | Định nghĩa toàn bộ `ENUMS`, `POS_CONSTANTS` và các TypeScript Interfaces (`Technician`, `ServiceItem`, `Ticket`, `PayrollSummary`, `CustomerDisplayEvent`). | **Hard:** `TASK-001` | `npx tsc --noEmit` pass 100%, không có bất kỳ kiểu `any` hay magic number nào. |
| `TASK-003` | **Developer** | `idea/nails-pos/src/db/storage.ts` | Viết `LocalJsonStorage` hỗ trợ CRUD các bảng `technicians`, `services`, `tickets`, `customers`, `giftCards` kèm kiểm tra `version` (Optimistic Locking). | **Hard:** `TASK-002` | `npx tsc --noEmit` pass; hỗ trợ đọc/ghi in-memory và persist ra file JSON. |
| `TASK-004` | **Developer** | `idea/nails-pos/src/modules/turns/TurnServiceHelper.ts` | Viết các hàm pure helper: `sortAvailableForFullTurn()`, `pickBottomUpForUnderThreshold()`, `pickEarliestFinishingTechWithSkill()`, `isWithinEarlyCancelWindow()`. | **Hard:** `TASK-002` | `npx tsc --noEmit` pass; mỗi hàm có docstring `@param`, `@returns` đầy đủ. |
| `TASK-005` | **Developer** | `idea/nails-pos/src/modules/turns/TurnService.ts` | Viết `TurnService` gồm: `clockInTechnician()`, `assignNextTechnician()`, `handleEarlyCancel()`, `applyManualOverride()`. | **Hard:** `TASK-004` | `npx tsc --noEmit` pass; tuân thủ 8 quy tắc chia turn trong đặc tả. |
| `TASK-006` | **Test Engineer** | `idea/nails-pos/tests/turn-service.test.ts` | Viết bộ Unit Test 3 tầng cho `TurnService` & `TurnServiceHelper`: đủ kịch bản ưu tiên 1-2-3, dịch vụ `< $35` rải ngược từ dưới lên, khách Request, hủy `<= 5 phút` vs `> 5 phút`, thợ vào trễ. | **Hard:** `TASK-005` | `npx vitest run tests/turn-service.test.ts` xanh 100% (tối thiểu 10 test cases). |
| `TASK-007` | **Developer** | `idea/nails-pos/src/adapters/payment/PaxMockTerminal.ts` | Viết adapter giả lập máy cà thẻ PAX A920 hỗ trợ chế độ bình thường, chế độ lỗi đơ màn hình chọn Tip (`FREEZE_ON_TIP_SCREEN`), Heartbeat và lệnh `abortCurrentTransaction()`. | **Hard:** `TASK-002` | `npx tsc --noEmit` pass; mô phỏng chuẩn trạng thái `PaxTerminalStatus`. |
| `TASK-008` | **Developer** | `idea/nails-pos/src/modules/checkout/PaymentServiceHelper.ts` & `PaymentService.ts` | Viết `PaymentService` & Helper xử lý thanh toán thẻ qua PAX, khóa `idempotencyKey` chống trừ tiền 2 lần, tự động/cưỡng chế hủy lệnh khi PAX đơ màn hình Tip (`forceCancelFrozenTerminal`). | **Hard:** `TASK-007` | `npx tsc --noEmit` pass; xử lý đầy đủ Timeout và Idempotency. |
| `TASK-009` | **Test Engineer** | `idea/nails-pos/tests/payment-service.test.ts` | Viết Unit Test kiểm thử luồng thanh toán thẻ thành công, luồng PAX đơ màn hình Tip -> Force Cancel -> Thử lại an toàn, và chặn Double Submit cùng `idempotencyKey`. | **Hard:** `TASK-008` | `npx vitest run tests/payment-service.test.ts` xanh 100%. |
| `TASK-010` | **Developer** | `idea/nails-pos/src/modules/money/PayrollServiceHelper.ts` & `PayrollService.ts` | Viết `PayrollService` & Helper tính kết toán ngày (`generateZReport`) và lương thợ (`calculateDailyPayroll`): chia 60/40 sau khi trừ Supply Fee, khấu trừ phí thẻ trên Tip thẻ, tách Tiền mặt vs Check/Direct Deposit. | **Hard:** `TASK-002` | `npx tsc --noEmit` pass; tính toán theo đơn vị `cents` không lệch 1 xu. |
| `TASK-011` | **Developer** | `idea/nails-pos/src/modules/clients/ClientLoyaltyAndBookingService.ts` | Viết dịch vụ tích điểm Loyalty (đạt `$300` giảm `$10`), phát hành/trừ tiền QR Gift Card (chống âm tiền), đặt lịch hẹn kiểm tra trùng giờ và gửi Mock SMS nhắc trước `X` giờ. | **Hard:** `TASK-003` | `npx tsc --noEmit` pass; đầy đủ hàm CRM, QR Gift Card và Booking. |
| `TASK-012` | **Test Engineer** | `idea/nails-pos/tests/payroll-and-clients.test.ts` | Viết Unit & Integration Test cho `PayrollService`, `ZReport`, `Loyalty`, `QR GiftCard` và `Booking` (bao gồm các ca biên `$0`, âm tiền, vượt số dư thẻ quà tặng). | **Hard:** `TASK-010`, `TASK-011` | `npx vitest run` chạy toàn bộ test suite dự án xanh 100%. |
