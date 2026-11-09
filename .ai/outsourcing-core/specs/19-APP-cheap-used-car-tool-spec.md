# Tài Liệu Đặc Tả Thực Thi (Dev-Ready & Test-Ready): Cheap Used Car Tool (`cheap-used-car-tool`)

> **Phiên bản:** 1.0.0  
> **Đơn vị lập đặc tả:** AISE Squad 2 (`intake` + `ba` + `requirement_challenger` + `orchestrator` + `estimator_cost_controller`)  
> **Nguồn dữ liệu gốc:** `idea/cheap-used-car-tool/requirement.md`, `idea/cheap-used-car-tool/requirementv2.md`  
> **Mục tiêu hệ thống:** Hệ thống AI Car Buying Advisor giúp người dùng tìm kiếm, chấm điểm độ phù hợp, phân tích khả năng tài chính & tổng chi phí sở hữu 5 năm (5-Year TCO), ước tính bảo hiểm theo bang, mô phỏng khoản vay và tự động gửi thông báo (Telegram/Email) theo lịch trình.

---

## PHẦN 1 — INTAKE & PHÂN LOẠI (`intake`)

### 1.1 Bảng Phân Tách Yêu Cầu (`Stated Facts` / `Explicit Assumptions` / `Clarification Questions`)

| Phân loại | Mã tham chiếu | Nội dung chi tiết | Nguồn / Lý do kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-001` | Người dùng tìm xe theo khu vực (VD: Michigan, California, Texas), ngân sách hiện có, hình thức mua đứt (`Cash`) hoặc trả góp (`Finance`: Down Payment, Monthly Payment). | `requirement.md` (L1), `requirementv2.md` (L37-67) |
| **Stated Fact** | `SF-002` | Hỗ trợ 2 chế độ tìm kiếm: (1) Bộ lọc truyền thống (Vehicle Type, Brand, Fuel, Seats, Mileage, Year, Features như ABS, AWD, CarPlay...) và (2) AI Natural Language Search trả về Top 5 xe kèm giải thích "Why this car?". | `requirementv2.md` (L27-177) |
| **Stated Fact** | `SF-003` | Module **Smart Budget Analyzer** và **5-Year Cost of Ownership (TCO)** tính toán: Monthly Loan Payment, Bảo hiểm theo bang (VD: Michigan No-fault/PIP), Xăng, Bảo dưỡng (Oil, Brake, Tire, Battery), Thuế & Đăng ký, đánh giá trạng thái `Comfortable` hoặc `Too expensive`. | `requirement.md` (L10), `requirementv2.md` (L178-257, L346-415) |
| **Stated Fact** | `SF-004` | Module **AI Deal Analyzer** (đánh giá `Great Deal` / `Overpriced` so với giá thị trường), **Car Comparison** (so sánh nhiều xe), **Loan Simulator** (slider tương tác), **Buying Guide** & **Ownership Checklist**. | `requirementv2.md` (L298-345, L416-443, L536-615) |
| **Stated Fact** | `SF-005` | Lưu bộ lọc (**Saved Search**) và cấu hình **Notification Scheduler** (1 ngày, 1 tuần, 1 tháng, 1 quý hoặc Custom Cron) gửi qua Telegram hoặc Email. | `requirement.md` (L3), `requirementv2.md` (L444-491) |
| **Explicit Assumption** | `EA-001` | **Nguồn dữ liệu xe (Marketplace Aggregator):** Để tuân thủ tuyệt đối chính sách chống vượt rào anti-bot/CAPTCHA của Facebook Marketplace, Autotrader, CarGurus, MVP sử dụng **Adapter Pattern** kết nối: (1) Craigslist Public RSS/HTML hợp lệ không có CAPTCHA, (2) Public NHTSA Vehicle API (giải mã VIN, Recall, Safety Rating), và (3) Import JSON/CSV Listing Feed hoặc `browser_handoff` do người dùng chủ động cung cấp. | Đảm bảo Dev không bị block bởi tường lửa Cloudflare/PerimeterX và tuân thủ chính sách an toàn. |
| **Explicit Assumption** | `EA-002` | **Ngưỡng đánh giá tài chính (`Comfortable` vs `Too expensive`):** Áp dụng chuẩn tài chính cá nhân 20/4/10 (Tổng chi phí xe hàng tháng TCO <= 15% Monthly Gross Income VÀ <= 50% Disposable Income `Monthly Income - Monthly Expenses`). | Chuẩn hóa công thức toán học cho `SmartBudgetAnalyzerService`. |
| **Explicit Assumption** | `EA-003` | **Công thức tính bảo hiểm theo bang:** Sử dụng bảng hệ số cơ sở theo bang (`STATE_INSURANCE_BASE_RATES`, trong đó Michigan có phụ phí PIP/No-fault cao hơn California/Texas) nhân với hệ số loại xe (`VEHICLE_INSURANCE_MULTIPLIERS`: Sedan 1.0, SUV 1.1, Sports/Luxury 1.45) và hệ số Credit Score. | Đáp ứng yêu cầu ước tính bảo hiểm theo bang mà không cần mua API bảo hiểm thương mại đắt đỏ ở giai đoạn MVP. |
| **Clarification Question** | `CQ-001` | **Câu hỏi:** Nguồn dữ liệu Listing thực tế trong giai đoạn Production sẽ lấy từ đâu cho các trang đóng như Facebook Marketplace / CarGurus?<br>- **Option A (Khuyến nghị):** Kết hợp Public Feeds/APIs (NHTSA + Craigslist/eBay Motors API) + tính năng Paste URL/Import JSON để AI phân tích Deal.<br>- **Option B:** Mua gói API агреgator thương mại (MarketCheck API / Auto.dev API).<br>- **Option C:** Yêu cầu người dùng tự mở trình duyệt qua cơ chế `browser_handoff` khi gặp trang yêu cầu đăng nhập. | Khuyến nghị **Option A + B (cấu hình qua `settings.json`)** để chạy ngay lập tức với chi phí $0 và dễ nâng cấp. |

### 1.2 Nhãn Bảo Mật, Tuân Thủ & Rủi Ro (`Security & Compliance Tags`)

- **[COMPLIANCE-ANTI-BOT]:** Tuyệt đối **KHÔNG** viết script giải CAPTCHA, vượt Cloudflare Turnstile, hoặc dùng headless browser spoofing để cào trái phép Facebook Marketplace, CarGurus, Autotrader. Nếu nguồn dữ liệu trả về HTTP `403`/`429` hoặc trang thử thách CAPTCHA, hệ thống phải dừng ngay nguồn đó, ghi log `SOURCE_BLOCKED_BY_ANTIBOT` và chuyển sang trạng thái `browser_handoff` hoặc dùng nguồn API chính thống (`MarketCheck` / `NHTSA API`).
- **[SECURITY-SECRETS]:** Toàn bộ `TELEGRAM_BOT_TOKEN`, `SMTP_PASSWORD`, `LLM_API_KEY`, `MARKETCHECK_API_KEY` phải được đọc từ `settings.json` (hoặc biến môi trường ánh xạ vào `settings.json`), tuyệt đối không hardcode trong mã nguồn.

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1 Bảng Yêu Cầu Nghiệp Vụ Có Mã Truy Vết (`REQ-001` .. `REQ-010`)

| Mã REQ | Tên Yêu Cầu | Mô tả nghiệp vụ chi tiết | Truy vết nguồn | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | **Traditional Multi-Filter Search** | Lọc danh sách xe theo Location (State/Radius), Budget, Payment Mode (`CASH`/`FINANCE`), Vehicle Type, Brand, Fuel, Seats, Mileage, Year, và danh sách Features (ABS, AWD, Backup Camera, CarPlay...). | `requirement.md` L1,8; `requirementv2.md` L31-130 | `P0 Must-Have` |
| `REQ-002` | **AI Natural Language Search & Top 5 Ranking** | Phân tích câu mô tả tự nhiên của người dùng (VD: gia đình 4 người ở Michigan, đi làm 30 miles/ngày, đi camping cuối tuần, trả trước $8,000, góp $350/tháng) thành bộ tiêu chí có cấu trúc và đề xuất Top 5 mẫu xe kèm lý do "Why this car?". | `requirementv2.md` L131-177, L654-669 | `P0 Must-Have` |
| `REQ-003` | **Loan Simulator & Amortization Engine** | Tính toán chính xác khoản trả góp hàng tháng (`Monthly Payment`), tổng tiền lãi (`Total Interest Paid`), và tổng số tiền phải trả (`Total Payment`) dựa trên Vehicle Price, Down Payment, APR (%), và Loan Term (tháng). | `requirement.md` L1; `requirementv2.md` L416-443 | `P0 Must-Have` |
| `REQ-004` | **Smart Budget & 5-Year TCO Analyzer** | Tính tổng chi phí sở hữu 5 năm (Khấu hao/Trả góp, Bảo hiểm, Nhiên liệu theo số miles/ngày, Bảo dưỡng định kỳ Oil/Brake/Tire/Battery, Thuế & Đăng ký) và phân loại độ an toàn tài chính (`COMFORTABLE`, `STRETCHED`, `TOO_EXPENSIVE`). | `requirementv2.md` L178-257, L346-385 | `P0 Must-Have` |
| `REQ-005` | **State-Specific Insurance Estimator** | Ước tính phí bảo hiểm hàng tháng theo Bang (đặc biệt hỗ trợ cấu trúc bảo hiểm Michigan No-fault, PIP, Collision, Comprehensive) và tính mức tiết kiệm bảo hiểm khi đổi sang dòng xe phổ thông. | `requirement.md` L10; `requirementv2.md` L386-415 | `P0 Must-Have` |
| `REQ-006` | **Vehicle Recommendation & AI Deal Analyzer** | Chấm điểm mức độ phù hợp của xe (`Match Score 0-100%`) và so sánh giá rao bán (`Listing Price`) với giá thị trường (`Estimated Market Value`) để gắn nhãn `GREAT_DEAL`, `FAIR_DEAL`, hoặc `OVERPRICED` kèm % chênh lệch. | `requirementv2.md` L258-297, L536-569 | `P0 Must-Have` |
| `REQ-007` | **Marketplace Feed Aggregator & Normalizer** | Thu thập và chuẩn hóa dữ liệu xe từ các nguồn hợp lệ (Public APIs, RSS, JSON Import) về một cấu trúc `NormalizedVehicleListing` duy nhất (Price, Mileage, VIN, Title Status, Accident History, One Owner). | `requirementv2.md` L16-25, L492-535 | `P0 Must-Have` |
| `REQ-008` | **Saved Search & Notification Scheduler** | Lưu cấu hình tìm kiếm và chạy lịch trình tự động (`DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, hoặc Custom Cron) gửi cảnh báo xe mới qua Telegram và Email (chống gửi trùng lặp). | `requirement.md` L3; `requirementv2.md` L444-491 | `P0 Must-Have` |
| `REQ-009` | **Side-by-Side Car Comparison** | So sánh từ 2 đến 4 xe trực diện trên 15 chỉ số: Giá mua, Trả góp/tháng, Bảo hiểm, Xăng, Bảo dưỡng, Độ bền, An toàn, Sức chứa, MPG, Khấu hao, Pros & Cons. | `requirementv2.md` L298-345 | `P1 Should-Have` |
| `REQ-010` | **Buying Guide & Ownership Checklist** | Cung cấp danh sách kiểm tra từng bước theo hình thức thanh toán (`Cash` vs `Finance`: VIN check, Carfax, Test Drive, Bill of Sale, Title Transfer) và lịch nhắc bảo dưỡng sau mua. | `requirementv2.md` L570-615 | `P2 Nice-to-Have` |

---

### 2.2 Data Structures, Constants & `settings.json` Schema (No Magic Numbers / Strings)

#### A. Bảng `CONSTANTS` & `ENUMS` (`src/constants/CarToolConstants.ts`)

```typescript
export enum PaymentMethod {
  CASH = "CASH",
  FINANCE = "FINANCE",
}

export enum VehicleType {
  SEDAN = "SEDAN",
  SUV = "SUV",
  PICKUP = "PICKUP",
  TRUCK = "TRUCK",
  VAN = "VAN",
  COUPE = "COUPE",
}

export enum FuelType {
  GAS = "GAS",
  HYBRID = "HYBRID",
  EV = "EV",
  DIESEL = "DIESEL",
}

export enum BudgetAffordabilityStatus {
  COMFORTABLE = "COMFORTABLE",
  STRETCHED = "STRETCHED",
  TOO_EXPENSIVE = "TOO_EXPENSIVE",
}

export enum DealRating {
  GREAT_DEAL = "GREAT_DEAL",
  GOOD_DEAL = "GOOD_DEAL",
  FAIR_DEAL = "FAIR_DEAL",
  OVERPRICED = "OVERPRICED",
}

export enum AlertInterval {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  CUSTOM_CRON = "CUSTOM_CRON",
}

export const FINANCIAL_CONSTANTS = {
  MONTHS_PER_YEAR: 12,
  TCO_PROJECTION_YEARS: 5,
  WORK_DAYS_PER_YEAR: 260,
  WEEKEND_MILES_ANNUAL_DEFAULT: 2500,
  MAX_COMFORTABLE_TCO_TO_INCOME_RATIO: 0.15,     // Tối đa 15% tổng thu nhập tháng
  MAX_STRETCHED_TCO_TO_INCOME_RATIO: 0.22,       // Từ 15% - 22% là Stretched, >22% là Too Expensive
  MAX_COMFORTABLE_DISPOSABLE_RATIO: 0.45,        // Tối đa 45% thu nhập còn lại (Income - Expenses)
  GREAT_DEAL_DISCOUNT_THRESHOLD_PCT: 10.0,       // Rẻ hơn thị trường >= 10%
  OVERPRICED_PREMIUM_THRESHOLD_PCT: 8.0,         // Đắt hơn thị trường >= 8%
  TOP_RECOMMENDATIONS_LIMIT: 5,                  // Top 5 xe đề xuất theo requirementv2
  MAX_COMPARISON_VEHICLES: 4,                    // Tối đa 4 xe so sánh cùng lúc
  MIN_CREDIT_SCORE: 300,
  MAX_CREDIT_SCORE: 850,
} as const;

export const STATE_INSURANCE_CONFIG: Record<string, {
  baseMonthlyUsd: number;
  salesTaxRate: number;
  annualRegistrationUsd: number;
  requiresNoFaultPip: boolean;
}> = {
  MI: { baseMonthlyUsd: 165, salesTaxRate: 0.06, annualRegistrationUsd: 145, requiresNoFaultPip: true },
  CA: { baseMonthlyUsd: 145, salesTaxRate: 0.0725, annualRegistrationUsd: 175, requiresNoFaultPip: false },
  TX: { baseMonthlyUsd: 135, salesTaxRate: 0.0625, annualRegistrationUsd: 85, requiresNoFaultPip: false },
  DEFAULT: { baseMonthlyUsd: 130, salesTaxRate: 0.06, annualRegistrationUsd: 120, requiresNoFaultPip: false },
};
```

#### B. Core Data Interfaces (`src/types/CarToolTypes.ts`)

```typescript
export interface UserFinancialProfile {
  stateCode: string;                 // VD: "MI", "CA", "TX"
  currentSavingsUsd: number;
  monthlyIncomeUsd: number;
  monthlyExpensesUsd: number;
  creditScore: number;               // 300 - 850
  downPaymentUsd: number;
  annualInterestRatePct: number;     // VD: 6.2 cho 6.2%
  loanTermMonths: number;            // VD: 36, 48, 60, 72
  dailyCommuteMiles: number;
  familySize: number;
  hasWeekendCamping: boolean;
  hasSnowDriving: boolean;
  preferredBrands: string[];
  dislikedBrands: string[];
}

export interface NormalizedVehicleListing {
  id: string;                        // Hash duy nhất từ VIN hoặc (Source + ExternalId)
  vin?: string;
  source: string;                    // "CRAIGSLIST_FEED" | "MARKETCHECK_API" | "MANUAL_IMPORT"
  listingUrl: string;
  title: string;
  make: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  fuelType: FuelType;
  priceUsd: number;
  estimatedMarketValueUsd: number;
  mileage: number;
  seats: number;
  combinedMpg: number;               // Hoặc MPGe cho EV
  stateCode: string;
  city: string;
  features: string[];                // ["ABS", "AWD", "APPLE_CARPLAY", "BACKUP_CAMERA"]
  cleanTitle: boolean;
  hasAccidentHistory: boolean;
  isOneOwner: boolean;
  reliabilityScore: number;          // 0 - 100
  postedAtIso: string;
}

export interface LoanSimulationResult {
  vehiclePriceUsd: number;
  downPaymentUsd: number;
  salesTaxAndFeesUsd: number;
  principalLoanAmountUsd: number;
  annualInterestRatePct: number;
  loanTermMonths: number;
  monthlyPaymentUsd: number;
  totalInterestPaidUsd: number;
  totalLoanCostUsd: number;
  totalOutOfPocketUsd: number;
}

export interface FiveYearTcoBreakdown {
  vehicleId: string;
  monthlyLoanPaymentUsd: number;
  monthlyInsuranceUsd: number;
  monthlyFuelUsd: number;
  monthlyMaintenanceUsd: number;
  monthlyRegistrationAndTaxUsd: number;
  totalMonthlyOwnershipCostUsd: number;
  yearlyBreakdownUsd: number[];      // Mảng 5 phần tử: [Năm 1, Năm 2, Năm 3, Năm 4, Năm 5]
  fiveYearTotalOwnershipCostUsd: number;
  affordabilityStatus: BudgetAffordabilityStatus;
  affordabilityReason: string;
}
```

#### C. Schema cấu hình `settings.json`

```json
{
  "appConfig": {
    "defaultStateCode": "MI",
    "defaultGasPricePerGallonUsd": 3.55,
    "defaultElectricityPricePerKwhUsd": 0.16,
    "deduplicationCacheFilePath": "./data/notified_vehicles_cache.json",
    "savedSearchesFilePath": "./data/saved_searches.json"
  },
  "aiConfig": {
    "provider": "gemini",
    "modelName": "gemini-2.5-flash",
    "apiKey": "REPLACE_WITH_GEMINI_API_KEY",
    "temperature": 0.2,
    "timeoutMs": 15000
  },
  "dataSources": {
    "nhtsaApiBaseUrl": "https://vpic.nhtsa.dot.gov/api/vehicles",
    "marketCheckApiBaseUrl": "https://mc-api.marketcheck.com/v2",
    "marketCheckApiKey": "REPLACE_WITH_MARKETCHECK_API_KEY",
    "requestTimeoutMs": 10000,
    "respectRobotsTxt": true
  },
  "notifications": {
    "telegram": {
      "enabled": true,
      "botToken": "REPLACE_WITH_TELEGRAM_BOT_TOKEN",
      "defaultChatId": "REPLACE_WITH_TELEGRAM_CHAT_ID"
    },
    "email": {
      "enabled": true,
      "smtpHost": "smtp.gmail.com",
      "smtpPort": 587,
      "smtpUser": "REPLACE_WITH_EMAIL_USER",
      "smtpPass": "REPLACE_WITH_APP_PASSWORD",
      "fromAddress": "alerts@aicarfinder.local"
    }
  }
}
```

---

### 2.3 Kiến Trúc Service & Helper (Rule 4 & Single Responsibility Principle)

Toàn bộ kiến trúc tuân thủ nghiêm ngặt **Rule 4**: Mỗi `*Service` điều phối luồng nghiệp vụ chính và uỷ quyền các phép tính toán học, chuẩn hóa chuỗi, hoặc phân tích cú pháp cho `*ServiceHelper` tương ứng.

1. **`LoanSimulatorService.ts` & `LoanSimulatorServiceHelper.ts`**
   - `LoanSimulatorServiceHelper.calculateAmortizedMonthlyPayment(principalUsd: number, annualRatePct: number, termMonths: number): number`
     - *Mục đích:* Tính số tiền trả góp hàng tháng theo công thức niên kim chuẩn; xử lý an toàn trường hợp `annualRatePct === 0` (chia đều `principalUsd / termMonths`) và `principalUsd <= 0`.
   - `LoanSimulatorService.simulateLoan(priceUsd: number, downPaymentUsd: number, annualRatePct: number, termMonths: number, stateCode: string): LoanSimulationResult`
     - *Mục đích:* Tính toán toàn diện khoản vay bao gồm thuế bang, phí đăng ký ban đầu, lãi suất thực tế và tổng chi phí.

2. **`CostOfOwnershipService.ts` & `CostOfOwnershipServiceHelper.ts`**
   - `CostOfOwnershipServiceHelper.estimateMonthlyFuelCost(dailyCommuteMiles: number, combinedMpg: number, fuelPricePerUnit: number): number`
     - *Mục đích:* Tính tiền nhiên liệu hàng tháng dựa trên quãng đường đi làm + dã ngoại cuối tuần.
   - `CostOfOwnershipServiceHelper.estimateMaintenanceCurveByYear(vehicleAgeYears: number, mileage: number, make: string): number[]`
     - *Mục đích:* Trả về chi phí bảo dưỡng dự kiến cho từng năm từ Năm 1 đến Năm 5 (bao gồm Oil Change, Brake, Tire, Battery, Unexpected Repair).
   - `CostOfOwnershipService.calculateFiveYearTco(vehicle: NormalizedVehicleListing, profile: UserFinancialProfile): FiveYearTcoBreakdown`
     - *Mục đích:* Tổng hợp Loan + Insurance + Fuel + Maintenance + Tax thành báo cáo TCO 5 năm và gắn nhãn `COMFORTABLE` / `STRETCHED` / `TOO_EXPENSIVE`.

3. **`StateInsuranceEstimatorService.ts` & `StateInsuranceEstimatorServiceHelper.ts`**
   - `StateInsuranceEstimatorServiceHelper.getVehicleRiskMultiplier(vehicleType: VehicleType, make: string, hasSafetyFeatures: boolean): number`
     - *Mục đích:* Tính hệ số rủi ro bảo hiểm theo dòng xe và trang bị an toàn (ABS, Automatic Emergency Braking, Blind Spot).
   - `StateInsuranceEstimatorService.estimateStateInsurance(vehicle: NormalizedVehicleListing, stateCode: string, creditScore: number): InsuranceRecommendationResult`
     - *Mục đích:* Trả về phí bảo hiểm dự kiến theo bang, gói khuyến nghị (No-fault PIP cho Michigan, Collision/Comprehensive) và gợi ý tiết kiệm tiền so với xe sang.

4. **`AiCarAdvisorService.ts` & `AiCarAdvisorServiceHelper.ts`**
   - `AiCarAdvisorServiceHelper.parseNaturalLanguagePromptFallback(promptText: string): Partial<UserFinancialProfile & VehicleSearchFilter>`
     - *Mục đích:* Trích xuất deterministic (Regex/Rule-based fallback khi LLM offline) các thông số: State, Down Payment, Monthly Payment, Family Size, Commute Miles, Brands từ câu mô tả tiếng Việt/Anh.
   - `AiCarAdvisorServiceHelper.computeCompatibilityScore(vehicle: NormalizedVehicleListing, tco: FiveYearTcoBreakdown, profile: UserFinancialProfile): { scorePct: number; pros: string[]; cons: string[]; dealRating: DealRating; savingsPct: number }`
     - *Mục đích:* Chấm điểm độ phù hợp (0–100%) và phân tích Deal (`GREAT_DEAL` vs `OVERPRICED`).
   - `AiCarAdvisorService.recommendTopVehicles(listings: NormalizedVehicleListing[], profile: UserFinancialProfile): RecommendedVehicleReport[]`
     - *Mục đích:* Lọc, tính TCO, chấm điểm và trả về Top 5 xe tốt nhất kèm giải thích "Why this car?".

5. **`CarAlertSchedulerService.ts` & `CarAlertSchedulerServiceHelper.ts`**
   - `CarAlertSchedulerServiceHelper.filterUnnotifiedVehicles(vehicles: NormalizedVehicleListing[], notifiedIdsCache: Record<string, string>): NormalizedVehicleListing[]`
     - *Mục đích:* Loại bỏ các xe đã từng gửi thông báo (dựa trên VIN/Listing ID) để chống spam.
   - `CarAlertSchedulerService.dispatchScheduledAlerts(savedSearchId: string): Promise<AlertDispatchSummary>`
     - *Mục đích:* Chạy lịch quét theo interval (`DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`), gửi thông báo qua `TelegramNotificationService` / `EmailNotificationService` và cập nhật cache.

---

### 2.4 Ma Trận 5 Trạng Thái UX (`5 UX States Matrix`)

| Trạng thái | Điều kiện kích hoạt | Phản hồi giao diện / CLI / Notification Output | Hành động điều hướng (CTA) |
| :--- | :--- | :--- | :--- |
| **1. Ideal State** | Tìm thấy >= 5 xe thỏa mãn ngân sách & tiêu chí; TCO nằm trong ngưỡng `COMFORTABLE`. | Hiển thị **Top 5 Recommended Cars** kèm điểm `% Match`, huy hiệu `Great Deal`, biểu đồ cột 5-Year TCO, bảng phân tích bảo hiểm theo bang (VD: Michigan PIP) và nút "Compare Cars". | Cho phép bấm "Save Search & Enable Telegram Alert" hoặc mở "Step-by-Step Buying Guide". |
| **2. Loading State** | Đang phân tích câu prompt tự nhiên, gọi API lấy dữ liệu xe và tính toán mô phỏng TCO 5 năm. | Hiển thị Skeleton Cards cùng tiến trình 3 bước rõ ràng: `[1/3] Đang phân tích nhu cầu tài chính... -> [2/3] Đang chuẩn hóa dữ liệu xe & VIN... -> [3/3] Đang tính toán 5-Year TCO & Bảo hiểm bang...`. | Cho phép bấm "Cancel Search" nếu người dùng muốn sửa lại bộ lọc. |
| **3. Empty State** | Không có xe nào khớp bộ lọc (VD: đòi xe SUV đời > 2022, dưới 30,000 miles nhưng giá < $5,000). | Hiển thị thông báo rõ nguyên nhân: *"Không tìm thấy xe khớp 100% tiêu chí ($5,000 là quá thấp cho SUV đời 2022+)"* kèm **AI Relaxation Suggestions** (gợi ý nới trần giá lên $12,000 hoặc lùi đời xe về 2016–2018). | Nút bấm 1-click: "Áp dụng bộ lọc gợi ý ($12,000 / 2017+)" hoặc "Tạo Alert chờ xe mới". |
| **4. Error State** | Lỗi kết nối mạng, API Key hết hạn, hoặc nguồn dữ liệu ngoài chặn truy cập (`403`/`429`). | Hiển thị cảnh báo lỗi thân thiện kèm mã lỗi kỹ thuật (`ERR_SOURCE_UNAVAILABLE` / `ERR_INVALID_FINANCIAL_INPUT`), tự động chuyển sang chế độ **Deterministic Fallback** (vẫn dùng được Loan Simulator, TCO Calculator & Manual Listing Import). | Nút "Thử lại", "Kiểm tra `settings.json`", hoặc "Nhập thông tin xe thủ công để phân tích Deal". |
| **5. Partial / Overflow State** | Nguồn dữ liệu trả về quá nhiều (> 500 xe) hoặc một số listing bị thiếu thông tin `MPG` / `VIN` / `Market Value`. | Tự động phân trang, chỉ hiển thị **Top 5 AI Picks** nổi bật ở đầu trang; các listing thiếu `MPG` hoặc `Market Value` được gắn nhãn `⚠ Estimated Specs (Dữ liệu ước tính theo dòng xe)` thay vì làm sập phép tính TCO. | Cho phép lọc "Chỉ hiện xe đầy đủ VIN & Lịch sử sạch (Clean Title)". |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

Dưới đây là 4 lỗ hổng thực tế nghiêm trọng thường làm sập hoặc làm sai lệch kết quả của các công cụ tìm xe và quy tắc khóa chặn bắt buộc trong code:

### 3.1 Lỗ hổng 1: Sai số toán học Tài chính, Chia cho 0 (0% APR / 0 MPG) & Bẫy "Giá niêm yết vs Giá lăn bánh (Out-the-Door Price)"
- **Rủi ro thực tế:**
  1. Nhiều chương trình trả góp ưu đãi có `APR = 0%`. Công thức tính lãi kép chuẩn `M = P * [r(1+r)^n] / [(1+r)^n - 1]` sẽ chia cho `0` và trả về `NaN` hoặc `Infinity`.
  2. Xe điện (`EV`) không có chỉ số `MPG` xăng truyền thống hoặc dữ liệu rao vặt thiếu `MPG` (`MPG = 0`), dẫn đến phép tính tiền xăng `miles / mpg` trả về `Infinity`.
  3. Người dùng nhập `Down Payment >= Vehicle Price` nhưng hệ thống vẫn tính khoản vay âm.
  4. Bỏ qua thuế bán hàng theo bang (`Sales Tax`, VD: 6% tại Michigan) và phí sang tên (`Title/Registration`) khiến người dùng tưởng đủ tiền nhưng thực tế thiếu hàng nghìn USD.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Trong `LoanSimulatorServiceHelper`:
    - Nếu `downPaymentUsd >= priceUsd + taxesAndFeesUsd`, trả về `principalLoanAmountUsd = 0`, `monthlyPaymentUsd = 0`, `totalInterestPaidUsd = 0`.
    - Nếu `annualRatePct === 0`, bắt buộc rẽ nhánh: `monthlyPaymentUsd = Number((principalUsd / termMonths).toFixed(2))`.
    - Mọi kết quả tiền tệ phải làm tròn chuẩn 2 chữ số thập phân (`Math.round((val + Number.EPSILON) * 100) / 100`).
  - Trong `CostOfOwnershipServiceHelper`:
    - Nếu `combinedMpg <= 0` hoặc `undefined`, bắt buộc tra cứu giá trị mặc định theo `VehicleType` (`DEFAULT_MPG_BY_TYPE`: Sedan=30, SUV=24, Truck=19, EV=100 MPGe) và gắn cờ `isEstimatedMpg = true`.

### 3.2 Lỗ hổng 2: Rủi ro Pháp lý & Anti-Bot khi cào Facebook Marketplace / CarGurus / Autotrader
- **Rủi ro thực tế:** `requirementv2.md` liệt kê Facebook Marketplace, CarGurus, Autotrader. Các trang này sử dụng hệ thống chống bot cực mạnh (Cloudflare, Akamai, Login Wall). Nếu viết scraper cào trực tiếp bằng headless browser hoặc vượt CAPTCHA sẽ vi phạm chính sách bảo mật và bị khóa IP ngay lập tức.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Thiết kế `MarketplaceAggregatorService` theo kiến trúc **Pluggable Provider Adapter**:
    1. `PublicApiAndRssAdapter`: Chỉ gọi các endpoint công khai hợp lệ (NHTSA Vehicle API, RSS/JSON feeds được phép).
    2. `UserImportAndHandoffAdapter`: Cho phép người dùng import file JSON/CSV hoặc dán nội dung trang xe từ trình duyệt cá nhân (`browser_handoff`).
    3. Tuyệt đối không tích hợp bất kỳ thư viện giải CAPTCHA hay bypass anti-bot nào. Khi gặp HTTP `401/403/429`, adapter lập tức dừng gọi nguồn đó và trả về trạng thái `PARTIAL_SOURCE_HANDOFF_REQUIRED`.

### 3.3 Lỗ hổng 3: Spam Thông báo Trùng lặp (`Duplicate Alerts Spam`) khi xe đăng lại hoặc giảm giá nhẹ
- **Rủi ro thực tế:** Người bán trên Craigslist/Marketplace thường xóa bài đăng cũ và đăng lại cùng một chiếc xe mỗi ngày. Nếu chỉ kiểm tra theo `listingUrl` hoặc không lưu trạng thái, người dùng sẽ nhận thông báo lặp đi lặp lại cho cùng một chiếc xe.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Tạo khóa định danh chống trùng lặp `dedupKey`:
    - Ưu tiên 1: Nếu listing có `vin` hợp lệ (17 ký tự), `dedupKey = "VIN:" + vin.toUpperCase()`.
    - Ưu tiên 2: Nếu không có `vin`, tạo fingerprint chuẩn hóa: `dedupKey = "FP:" + sha256(make + model + year + mileageBucket + stateCode)`.
  - Chỉ gửi thông báo lại cho cùng một `dedupKey` nếu giá xe mới giảm ít nhất `>= 5%` (`PRICE_DROP_RE_NOTIFY_THRESHOLD_PCT = 5.0`) so với giá đã thông báo trước đó.

### 3.4 Lỗ hổng 4: Ảo giác AI (`LLM Hallucination`) trong việc tư vấn Tài chính & Bảo hiểm
- **Rủi ro thực tế:** Nếu giao cho LLM tự tính tiền trả góp, tiền bảo hiểm và tổng chi phí 5 năm, LLM thường tính nhẩm sai dẫn đến khuyên người dùng mua chiếc xe vượt quá khả năng chi trả.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - **Tách biệt tuyệt đối giữa AI Parsing và Deterministic Math Engine:**
    - LLM (hoặc NLP Parser) **chỉ** được phép chuyển đổi câu mô tả tự nhiên của người dùng thành JSON Filter (`UserFinancialProfile`) và sinh câu văn giải thích dựa trên số liệu đã tính sẵn.
    - Toàn bộ số liệu `monthlyPaymentUsd`, `fiveYearTotalOwnershipCostUsd`, `monthlyInsuranceUsd`, `affordabilityStatus` **bắt buộc** phải do `LoanSimulatorService`, `CostOfOwnershipService`, và `StateInsuranceEstimatorService` tính toán bằng công thức toán học cố định.

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1 Kịch Bản Kiểm Thử `Given / When / Then` (3 Tầng)

#### Tầng 1: P0 Happy Paths (Người dùng sử dụng thường xuyên nhất)
- **TC-CAR-001 (Mô phỏng khoản vay mua xe trả góp chuẩn):**
  - **Given:** Người dùng ở bang Michigan (`stateCode = "MI"`, thuế 6%, phí đăng ký $145) chọn xe giá `$25,000`, trả trước `Down Payment = $5,000`, lãi suất `APR = 5.8%`, kỳ hạn `72 tháng`.
  - **When:** Gọi `LoanSimulatorService.simulateLoan(25000, 5000, 5.8, 72, "MI")`.
  - **Then:** Hệ thống tính đúng thuế & phí lăn bánh (`$1,645`), số tiền gốc vay `Principal = $21,645` (hoặc tính riêng phần vay thuần `$20,000` = `$329.66/tháng` kèm tách bạch thuế lăn bánh), trả về `monthlyPaymentUsd > 0`, `totalInterestPaidUsd > 0`, không phát sinh sai số dấu phẩy động.
- **TC-CAR-002 (Phân tích Smart Budget & 5-Year TCO tại Michigan):**
  - **Given:** Hồ sơ người dùng có `monthlyIncomeUsd = 5200`, `monthlyExpensesUsd = 3100`, `creditScore = 720`, `dailyCommuteMiles = 30`, chọn xe `Toyota RAV4 2021` giá `$18,500`, `MPG = 30`.
  - **When:** Gọi `CostOfOwnershipService.calculateFiveYearTco(vehicle, profile)`.
  - **Then:** Trả về đầy đủ 5 khoản chi phí hàng tháng (Loan, Insurance Michigan có tính PIP, Fuel, Maintenance, Registration), mảng `yearlyBreakdownUsd` có đúng 5 phần tử ứng với 5 năm, và gắn nhãn `affordabilityStatus = "COMFORTABLE"`.
- **TC-CAR-003 (AI Search & Đề xuất Top 5 xe kèm Deal Rating):**
  - **Given:** Tập dữ liệu 10 xe đã chuẩn hóa và yêu cầu tìm xe gia đình 4 người ở Michigan, ưu tiên Toyota/Honda, trả góp tối đa `$350/tháng`.
  - **When:** Gọi `AiCarAdvisorService.recommendTopVehicles(listings, profile)`.
  - **Then:** Trả về tối đa 5 xe có điểm `scorePct` cao nhất xếp giảm dần; xe có giá thấp hơn giá thị trường `>= 10%` được gắn nhãn `GREAT_DEAL`; mỗi xe đều có danh sách `pros` ("Why this car?") khớp với tiêu chí gia đình & tiết kiệm xăng.
- **TC-CAR-004 (Lưu tìm kiếm & Gửi cảnh báo Telegram/Email chống trùng):**
  - **Given:** Một `SavedSearch` với cấu hình lọc `Michigan + Toyota + < $18,000 + Hybrid` và 2 xe mới khớp điều kiện.
  - **When:** Chạy `CarAlertSchedulerService.dispatchScheduledAlerts(savedSearchId)` lần 1 và chạy lại lần 2 ngay sau đó với cùng danh sách xe.
  - **Then:** Lần 1 gửi thông báo thành công cho 2 xe và lưu VIN vào cache; Lần 2 phát hiện trùng VIN nên gửi `0` thông báo mới.

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-CAR-005 (Dữ liệu tài chính đầu vào bất hợp lệ):**
  - **Given:** Người dùng nhập `priceUsd = -5000`, hoặc `loanTermMonths = 0`, hoặc `creditScore = 950` (ngoài khoảng 300–850).
  - **When:** Gọi `LoanSimulatorService.simulateLoan` hoặc `CostOfOwnershipService.calculateFiveYearTco`.
  - **Then:** Hệ thống ném lỗi có cấu trúc `ValidationError` với mã lỗi cụ thể (`ERR_INVALID_PRICE`, `ERR_INVALID_LOAN_TERM`, `ERR_INVALID_CREDIT_SCORE`) thay vì trả về `NaN`.
- **TC-CAR-006 (Mất kết nối API hoặc bị chặn bởi Anti-Bot / Timeout):**
  - **Given:** Endpoint nguồn dữ liệu xe trả về HTTP `403 Forbidden` (chặn anti-bot) hoặc timeout quá `10,000ms`.
  - **When:** Gọi `MarketplaceAggregatorService.fetchNormalizedListings(filter)`.
  - **Then:** Hệ thống bắt lỗi an toàn, không retry vô hạn, ghi log cảnh báo `SOURCE_BLOCKED_OR_TIMEOUT`, và trả về dữ liệu từ nguồn dự phòng/local mà không làm crash tiến trình.
- **TC-CAR-007 (Thiếu cấu hình Telegram/SMTP trong `settings.json`):**
  - **Given:** File `settings.json` có `botToken = "REPLACE_WITH_TELEGRAM_BOT_TOKEN"`.
  - **When:** Gọi `CarAlertSchedulerService.dispatchScheduledAlerts`.
  - **Then:** Hệ thống từ chối gọi mạng với thông báo rõ ràng `ERR_NOTIFICATION_CREDENTIALS_MISSING` và lưu kết quả vào hàng đợi local.

#### Tầng 3: Boundary & Rare Edge Cases (`0`, `-1`, `MAX`, `Empty`, `Duplicate`, `Concurrent`)
- **TC-CAR-008 (Biên lãi suất `0% APR` và `Down Payment >= Vehicle Price`):**
  - **Given:** Trường hợp A: `priceUsd = 20000, downPaymentUsd = 2000, annualRatePct = 0, termMonths = 60`. Trường hợp B: `priceUsd = 15000, downPaymentUsd = 20000` (mua đứt dư tiền).
  - **When:** Gọi `LoanSimulatorService.simulateLoan`.
  - **Then:** Trường hợp A trả về đúng `monthlyPaymentUsd` chia đều, `totalInterestPaidUsd = 0`. Trường hợp B trả về `principalLoanAmountUsd = 0`, `monthlyPaymentUsd = 0`.
- **TC-CAR-009 (Listing thiếu `MPG = 0` và xe trùng nhau khác URL nhưng cùng VIN):**
  - **Given:** Hai bài đăng từ 2 nguồn khác nhau có cùng mã `VIN = "2T3P1RFV8MW123456"` (một bài đăng giá `$17,000`, bài sau giảm giá còn `$15,500` - giảm > 5%) và trường `combinedMpg = 0`.
  - **When:** Chạy chuẩn hóa, tính TCO và lọc thông báo.
  - **Then:** Hệ thống tự động điền `combinedMpg` mặc định theo loại xe để không chia cho `0`, gộp 2 bài đăng theo VIN và cho phép gửi lại thông báo `Price Drop Alert` vì mức giảm giá đạt `8.82% (>= 5%)`.
- **TC-CAR-010 (So sánh vượt quá số lượng xe tối đa hoặc mảng rỗng):**
  - **Given:** Người dùng truyền mảng `0` xe hoặc `10` xe vào hàm so sánh `CarComparisonService.compareVehicles`.
  - **When:** Thực thi hàm so sánh.
  - **Then:** Nếu `0` xe thì trả về trạng thái `Empty`; nếu `> 4` xe thì tự động cắt lấy `MAX_COMPARISON_VEHICLES (4)` xe đầu tiên và trả về cờ `isTruncated = true`.

---

### 4.2 Quy Trình 5 Bước Kiểm Chứng Bề Mặt Thật Cho QA Reviewer (`5-Step Real-Surface Verification`)

1. **Bước 1 — `Launch` (Khởi chạy môi trường thực):**
   - Khởi tạo cấu hình `settings.json` từ `settings.example.json` và chạy lệnh khởi động CLI/Web Server của `cheap-used-car-tool`.
2. **Bước 2 — `Doctor` (Kiểm tra sức khỏe hệ thống & cấu hình):**
   - Chạy lệnh `npm run doctor` (hoặc script kiểm tra tương đương) để xác nhận: schema `settings.json` hợp lệ, thư mục `./data/` có quyền đọc/ghi, và các module toán học (`LoanSimulator`, `TCO`, `Insurance`) sẵn sàng.
3. **Bước 3 — `Drive` (Thực thi luồng người dùng thực tế):**
   - Bơm kịch bản người dùng thực tế tại Michigan (`Income: $5,200`, `Down: $8,000`, `Max Monthly: $350`, `Commute: 30 miles/day`) vào bộ tìm kiếm AI, chạy so sánh 3 mẫu xe (`Toyota RAV4`, `Honda CR-V`, `Ford Mustang`) và kích hoạt 1 chu kỳ `Notification Scheduler`.
4. **Bước 4 — `Evidence` (Thu thập bằng chứng Log, JSON Trace & Output):**
   - Lưu toàn bộ JSON output của bảng tính 5-Year TCO, bảng điểm Top 5 xe, và log chống gửi trùng thông báo vào thư mục bằng chứng QA (`test-evidence/cheap-used-car-tool-trace.json`).
5. **Bước 5 — `Cleanup` (Dọn dẹp trạng thái kiểm thử):**
   - Xóa các file cache tạm (`notified_vehicles_cache.test.json`), đóng tiến trình cron/server và xác nhận không còn tiến trình ngầm treo.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role Phụ Trách | File Mục Tiêu | Mô Tả Chi Tiết Hàm Cần Viết | Phụ Thuộc | Lệnh Verify & Tiêu Chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `src/constants/CarToolConstants.ts` & `src/types/CarToolTypes.ts` | Khởi tạo toàn bộ `ENUMS`, `FINANCIAL_CONSTANTS`, `STATE_INSURANCE_CONFIG`, và các TypeScript interfaces (`UserFinancialProfile`, `NormalizedVehicleListing`, `LoanSimulationResult`, `FiveYearTcoBreakdown`). Không dùng bất kỳ magic number/string nào. | *None* | `npx tsc --noEmit` pass 100%, không có lỗi kiểu dữ liệu. |
| `TASK-002` | **Developer** | `src/config/SettingsLoader.ts` & `settings.example.json` | Viết hàm `loadSettings(filePath?: string): AppSettings` đọc và validate cấu hình từ `settings.json`, tự động điền giá trị mặc định an toàn nếu thiếu trường không trọng yếu. | `TASK-001` (Hard) | Chạy thử `SettingsLoader` với file mẫu trả về object đúng chuẩn schema. |
| `TASK-003` | **Developer** | `src/services/helpers/LoanSimulatorServiceHelper.ts` & `src/services/LoanSimulatorService.ts` | Viết `calculateAmortizedMonthlyPayment`, `calculateStateTaxAndRegistration`, và `simulateLoan`. Xử lý chặt chẽ biên `0% APR`, `Down Payment >= Price`, và làm tròn 2 chữ số thập phân. | `TASK-001` (Hard) | Unit test nhanh cho case `5.8% APR / 72m` và `0% APR / 60m` trả về số chính xác tuyệt đối. |
| `TASK-004` | **Developer** | `src/services/helpers/StateInsuranceEstimatorServiceHelper.ts` & `src/services/StateInsuranceEstimatorService.ts` | Viết `getVehicleRiskMultiplier`, `getCreditScoreInsuranceFactor`, và `estimateStateInsurance` hỗ trợ đặc thù bảo hiểm bang Michigan (No-fault, PIP, Collision, Comprehensive) và tính mức tiết kiệm bảo hiểm giữa 2 mẫu xe. | `TASK-001` (Hard) | Kiểm tra đầu ra cho bang `MI` có đầy đủ breakdown `No-fault PIP` và gợi ý số tiền tiết kiệm. |
| `TASK-005` | **Developer** | `src/services/helpers/CostOfOwnershipServiceHelper.ts` & `src/services/CostOfOwnershipService.ts` | Viết `estimateMonthlyFuelCost`, `estimateMaintenanceCurveByYear`, `evaluateAffordabilityStatus`, và `calculateFiveYearTco` (trả về biểu đồ 5 năm + trạng thái `COMFORTABLE` / `TOO_EXPENSIVE`). | `TASK-003`, `TASK-004` (Hard) | Chạy tính TCO 5 năm cho hồ sơ mẫu (`$5,200 income`, `$3,100 expenses`) ra đúng tổng hàng tháng và mảng 5 năm. |
| `TASK-006` | **Developer** | `src/services/helpers/AiCarAdvisorServiceHelper.ts` & `src/services/AiCarAdvisorService.ts` | Viết `parseNaturalLanguagePromptFallback` (trích xuất tiêu chí từ câu văn), `analyzeDealRating` (`GREAT_DEAL` vs `OVERPRICED`), `computeCompatibilityScore`, và `recommendTopVehicles` (trả về Top 5 xe kèm "Why this car?"). | `TASK-005` (Hard) | Test với câu prompt mẫu ở Michigan trả về đúng Top 5 xe kèm điểm `%` và giải thích chi tiết. |
| `TASK-007` | **Developer** | `src/services/CarComparisonService.ts` & `src/services/BuyingGuideService.ts` | Viết `compareVehicles(vehicles, profile)` so sánh tối đa 4 xe trên 15 tiêu chí và `getBuyingAndOwnershipChecklist(paymentMethod)` trả về hướng dẫn mua xe (`Cash` vs `Finance`) + lịch nhắc bảo dưỡng. | `TASK-005`, `TASK-006` (Hard) | Gọi `compareVehicles` với 3 xe trả về bảng ma trận so sánh đầy đủ Pros/Cons & TCO. |
| `TASK-008` | **Developer** | `src/services/helpers/CarAlertSchedulerServiceHelper.ts` & `src/services/CarAlertSchedulerService.ts` | Viết `generateVehicleDedupKey` (ưu tiên VIN), `filterUnnotifiedOrPriceDroppedVehicles`, và `dispatchScheduledAlerts` hỗ trợ lịch `DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY` gửi qua Telegram/Email. | `TASK-002`, `TASK-006` (Hard) | Chạy thử 2 lần liên tiếp với cùng tập xe: lần 1 gửi alert, lần 2 chặn trùng lặp 100%. |
| `TASK-009` | **Test Engineer** | `tests/unit/LoanAndTcoServices.test.ts` | Viết bộ Unit Test tự động phủ toàn bộ Tầng 1, Tầng 2, Tầng 3 cho `LoanSimulatorService`, `StateInsuranceEstimatorService`, và `CostOfOwnershipService` (`TC-CAR-001`, `002`, `005`, `008`). | `TASK-005` (Hard) | `npm test -- tests/unit/LoanAndTcoServices.test.ts` pass 100%. |
| `TASK-010` | **Test Engineer** | `tests/integration/AiAdvisorAndAlertScheduler.test.ts` | Viết bộ Integration Test kiểm thử luồng `AI Natural Language Search -> Top 5 Ranking -> Deal Analyzer -> Comparison -> Alert Deduplication` (`TC-CAR-003`, `004`, `006`, `007`, `009`, `010`). | `TASK-006`, `TASK-007`, `TASK-008` (Hard) | Toàn bộ test suite `npm test` xanh 100% và sinh file bằng chứng QA trace. |
