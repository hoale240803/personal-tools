# Tài Liệu Đặc Tả Thực Thi: Hệ Thống Tình Báo Tài Chính & Thẩm Định M&A Doanh Nghiệp (`company-prospect`)

- **Mã Dự Án**: `COMPANY-PROSPECT-004`
- **Phân Nhóm**: Nhóm 4 — Trading, Market Intelligence & Utility Extensions
- **Đội Ngũ Phụ Trách**: Squad 4 — BA Team (`intake`, `ba`, `requirement_challenger`) & PM Team (`orchestrator`, `estimator_cost_controller`) + QA/Test (`test_engineer`, `qa_reviewer`)
- **Trạng Thái Tài Liệu**: `READY FOR EXECUTION` (Đã qua cổng kiểm duyệt độc lập)
- **Nguồn Đối Chiếu Thực Tế**:
  - [requirement.md](file:///d:/Workspace/personal-tools/idea/company-prospect/requirement.md)

---

## PHẦN 1 — INTAKE & PHÂN LOẠI (`intake`)

### 1.1. Bảng Phân Tách Thông Tin (Stated Facts vs. Explicit Assumptions)

| Mã | Phân Loại | Nội Dung Chi Tiết | Nguồn Trích Dẫn (File / Dòng) |
| :--- | :--- | :--- | :--- |
| `FACT-01` | **Stated Fact** | Cập nhật báo cáo tài chính (BCTC), doanh thu và lợi nhuận của các công ty tại thị trường **Mỹ (US)** và **Việt Nam (VN)** theo từng tuần, tháng, quý. | [requirement.md](file:///d:/Workspace/personal-tools/idea/company-prospect/requirement.md#L1) |
| `FACT-02` | **Stated Fact** | Theo dõi các thông tin về giá cổ phiếu và "nhất cử nhất động" (sự kiện trọng yếu, giao dịch nội bộ, tin tức M&A, công bố thông tin) của công ty đó theo hằng ngày hoặc thời gian thực (real-time). | [requirement.md](file:///d:/Workspace/personal-tools/idea/company-prospect/requirement.md#L2) |
| `FACT-03` | **Stated Fact** | Mục tiêu đầu ra cuối cùng là hỗ trợ ra quyết định: **Nên mua, bán hay sáp nhập (M&A / Đầu tư cổ phần) công ty đó theo cách nào cho phù hợp**. | [requirement.md](file:///d:/Workspace/personal-tools/idea/company-prospect/requirement.md#L2) |
| `FACT-04` | **Stated Fact** | Thư mục `d:\Workspace\personal-tools\idea\company-prospect` hiện mới chỉ có duy nhất file `requirement.md` (3 dòng), chưa có source code khởi tạo. | Khảo sát thực tế thư mục workspace |
| `ASSUMP-01` | **Explicit Assumption** | Về mặt pháp lý kế toán, Báo cáo tài chính chính thức của công ty niêm yết tại Mỹ (Form 10-Q/10-K trên SEC EDGAR) và Việt Nam (BCTC Quý/Năm trên HSX/HNX/UPCOM) được công bố theo **Quý/Năm** (một số doanh nghiệp bán lẻ/công nghệ VN có báo cáo ước tính doanh thu tháng). Do đó chu kỳ "Tuần" trong yêu cầu sẽ cập nhật **Biến động giá, P/E, P/B, Vốn hóa, Dòng tiền & Sự kiện tuần**, còn "Tháng/Quý" sẽ cập nhật **Doanh thu, Lợi nhuận & BCTC mới công bố**. | Suy luận từ chuẩn mực kế toán US GAAP / VAS và `FACT-01` |
| `ASSUMP-02` | **Explicit Assumption** | Để đưa ra khuyến nghị "Mua / Bán / Sáp nhập theo cách nào", hệ thống cần một **M&A & Investment Deal Structuring Engine** chấm điểm sức khỏe tài chính (Valuation Multiples `EV/EBITDA`, `P/E`, `P/B`, `Debt/Equity`, `Free Cash Flow`, `Altman Z-Score`) để đề xuất phương thức phù hợp: (1) *Mua gom cổ phiếu trên sàn (Open Market Accumulation)*, (2) *Thâu tóm chiến lược / LBO / Mua cổ phần chi phối*, (3) *Sáp nhập ngang/dọc (Merger/Synergy)*, hoặc (4) *Bán thoái vốn / Đứng ngoài (Divest/Avoid)*. | Suy luận từ `FACT-03` |
| `ASSUMP-03` | **Explicit Assumption** | Hệ thống sử dụng các nguồn dữ liệu chính thống có API miễn phí/chi phí thấp: **SEC EDGAR API (`data.sec.gov`) + Finnhub/Yahoo Finance** cho thị trường Mỹ, và **VNDirect / SSI iBoard / Vietstock / CafeF RSS & JSON** cho thị trường Việt Nam, quy đổi chuẩn hóa đơn vị tiền tệ (`USD` vs `VND`) trước khi tính chỉ số. | Suy luận từ `FACT-01`, `FACT-02` |

### 1.2. Câu Hỏi Làm Rõ (Clarification Questions)

| Mã Câu Hỏi | Vấn Đề Cần Làm Rõ | Các Phương Án Lựa Chọn (Options) | Khuyến Nghị Của BA Team |
| :--- | :--- | :--- | :--- |
| `CLAR-01` | **Quy mô vốn và Góc độ ra quyết định ("Mua/Bán/Sáp nhập")**: Người dùng sử dụng công cụ dưới góc độ nhà đầu tư cổ phiếu cá nhân/quỹ nhỏ hay góc độ doanh nghiệp tìm kiếm thương vụ M&A thực thụ? | - **Option A (Hybrid - Khuyến nghị)**: Kết hợp cả hai — Cung cấp tín hiệu **Đầu tư cổ phiếu (Buy/Hold/Sell)** dựa trên định giá & dòng tiền hằng ngày, kèm theo **Phân tích cấu trúc thương vụ M&A (Deal Structure Recommendation)**: Mua gom trên sàn, Mua thỏa thuận lô lớn (Block Trade), Đấu giá thoái vốn nhà nước, hay Thâu tóm tài sản.<br>- **Option B**: Chỉ tập trung vào đầu tư cổ phiếu ngắn/trung hạn trên sàn chứng khoán.<br>- **Option C**: Chỉ tập trung vào thẩm định M&A doanh nghiệp vừa và nhỏ (SME). | **Khuyến nghị: Option A** — Đáp ứng trọn vẹn cả vế "giá cổ phiếu hằng ngày" lẫn vế "mua bán sáp nhập công ty theo cách nào" trong `requirement.md`. |
| `CLAR-02` | **Nguồn dữ liệu thị trường Việt Nam & Mỹ**: Chủ dự án có sẵn tài khoản trả phí (FiinPro, Vietstock Pro, Bloomberg/Polygon) hay ưu tiên nguồn miễn phí? | - **Option A (Free Official APIs)**: Mỹ dùng `SEC EDGAR API` (chính thức 100%, miễn phí) + `Yahoo Finance / Finnhub Free Tier`; Việt Nam dùng `VNDirect/SSI Public API` + `CafeF/Vietstock Filings Parser`.<br>- **Option B**: Tích hợp cổng trả phí (Polygon.io + FiinGroup API).<br>- **Option C**: Cho phép cấu hình provider qua `settings.json` với mặc định là bộ Free Official APIs (Option A). | **Khuyến nghị: Option C** — Chạy được ngay với chi phí 0đ nhưng sẵn sàng cắm API key trả phí trong `settings.json` khi mở rộng. |
| `CLAR-03` | **Giao diện trải nghiệm & Kênh nhận cảnh báo "Nhất cử nhất động"**: | - **Option A**: Web Dashboard trực quan (Watchlist US/VN + Bảng so sánh BCTC + Khuyến nghị M&A) kết hợp bắn cảnh báo sự kiện nóng (Filing 8-K/13D, giao dịch cổ đông lớn, biến động giá `> 5%`) qua Telegram.<br>- **Option B**: Chỉ xuất báo cáo Markdown/Excel bằng CLI.<br>- **Option C**: Chỉ gửi tin nhắn qua Telegram Bot. | **Khuyến nghị: Option A** — Phù hợp nhất để vừa đọc bảng số liệu BCTC nhiều kỳ (Tuần/Tháng/Quý), vừa nhận cảnh báo sự kiện tức thời. |

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1. Bảng Yêu Cầu Nghiệp Vụ & Truy Vết (Requirements Traceability Matrix)

| Mã Yêu Cầu | Mô Tả Yêu Cầu Nghiệp Vụ | Nguồn Gốc | Ưu Tiên (MoSCoW) |
| :--- | :--- | :--- | :--- |
| `REQ-001` | **Quản lý Danh mục Công ty Mục tiêu (US & VN Watchlist)**: Cho phép thêm/xóa/cấu hình danh sách mã công ty tại Mỹ (kèm `ticker`, `cik` 10 chữ số chuẩn SEC) và Việt Nam (kèm `ticker`, sàn `HSX`/`HNX`/`UPCOM`). | `FACT-01` | `P0 (Must)` |
| `REQ-002` | **Thu thập & Chuẩn hóa Báo cáo Tài chính (US GAAP & VAS Normalization)**: Tự động kéo dữ liệu Doanh thu (`Revenue`), Lợi nhuận gộp (`Gross Profit`), `EBITDA`, Lợi nhuận ròng (`Net Income`), Tiền mặt (`Cash`), Tổng nợ (`Total Debt`), Vốn chủ sở hữu (`Equity`) theo Quý/Năm và ước tính Tháng (nếu có). | `FACT-01`, `ASSUMP-01` | `P0 (Must)` |
| `REQ-003` | **Theo dõi Giá Cổ phiếu & Khối lượng Giao dịch Hằng ngày / Near Real-time**: Cập nhật giá khớp lệnh, `% thay đổi ngày/tuần/tháng`, khối lượng đột biến so với trung bình 20 phiên (`Volume Spike Ratio`) và Vốn hóa thị trường (`Market Cap`). | `FACT-02` | `P0 (Must)` |
| `REQ-004` | **Giám sát "Nhất cử nhất động" (Corporate Action & Filing Radar)**: Phát hiện và phân loại sự kiện trọng yếu: SEC Form `8-K` (sự kiện trọng yếu), `SC 13D/13G` (thâu tóm `>5%` cổ phần), `Form 4` (giao dịch nội bộ) tại Mỹ; và Nghị quyết HĐQT, Giao dịch cổ đông lớn/nội bộ, Thông báo M&A/Cổ tức tại Việt Nam. | `FACT-02` | `P0 (Must)` |
| `REQ-005` | **Tính toán Chỉ số Định giá & Sức khỏe Tài chính**: Tự động tính `Enterprise Value (EV)`, `EV/EBITDA`, `P/E`, `P/B`, `ROE`, `ROIC`, `Net Debt / EBITDA`, và tốc độ tăng trưởng `YoY` / `QoQ` trên dữ liệu đã đồng nhất đơn vị tiền tệ. | `FACT-01`, `FACT-03`, `ASSUMP-02` | `P0 (Must)` |
| `REQ-006` | **Động cơ Khuyến nghị Chiến lược Mua/Bán/Sáp nhập (M&A & Investment Advisory Engine)**: Dựa trên ma trận định giá, sức khỏe bảng cân đối và cấu trúc cổ đông, đề xuất hành động cụ thể kèm phương thức thực hiện (ví dụ: *Mua tích lũy trên sàn*, *Đề xuất mua cổ phần kiểm soát / Cash Tender Offer*, *Sáp nhập hoán đổi cổ phiếu*, *Cảnh báo bẫy giá trị - Đứng ngoài*). | `FACT-03`, `ASSUMP-02` | `P0 (Must)` |
| `REQ-007` | **Tổng hợp Báo cáo Định kỳ (Tuần / Tháng / Quý)**: Tự động sinh báo cáo tổng hợp theo chu kỳ Tuần (Biến động giá + Sự kiện + Giao dịch nội bộ), Tháng (Cập nhật doanh thu ước tính + Định giá), Quý (Phân tích chuyên sâu BCTC Quý mới công bố). | `FACT-01`, `ASSUMP-01` | `P1 (Should)` |
| `REQ-008` | **Cảnh báo Tức thời qua Telegram / Webhook**: Bắn thông báo ngay khi công ty mục tiêu có công bố thông tin M&A, giao dịch nội bộ lớn hoặc giá biến động vượt ngưỡng `price_alert_threshold_pct`. | `FACT-02`, `CLAR-03` | `P1 (Should)` |
| `REQ-009` | **Lưu trữ Lịch sử & Chống ghi đè Báo cáo Điều chỉnh (Restatement Tracking)**: Lưu trữ dữ liệu vào SQLite/JSON có gắn kèm `filing_date` và `period_end_date` để phân biệt số liệu công bố lần đầu và số liệu điều chỉnh sau kiểm toán. | Phần 3 (`RISK-01`) | `P1 (Should)` |
| `REQ-010` | **Quản lý Cấu hình & Credentials Tập trung (`settings.json`)**: Lưu `sec_edgar_user_agent` (bắt buộc theo luật SEC), API keys (`finnhub_api_key`, `telegram_bot_token`), và các ngưỡng định giá trong `settings.json`. | Rule 4 & Security Guidelines | `P0 (Must)` |

---

### 2.2. Data Structures, Constants & `settings.json` Schema

#### A. Định Nghĩa Types / Interfaces (TypeScript / Python Schema Chuẩn)

```typescript
export enum MarketRegion {
  US = "US",
  VN = "VN",
}

export enumCurrencyCode {
  USD = "USD",
  VND = "VND",
}

export enum ReportingPeriodType {
  WEEKLY_SNAPSHOT = "WEEKLY_SNAPSHOT",
  MONTHLY_ESTIMATE = "MONTHLY_ESTIMATE",
  QUARTERLY_OFFICIAL = "QUARTERLY_OFFICIAL",
  ANNUAL_AUDITED = "ANNUAL_AUDITED",
}

export enum CorporateEventCategory {
  FINANCIAL_RELEASE = "FINANCIAL_RELEASE",       // 10-Q, 10-K, BCTC Quý/Năm
  MATERIAL_EVENT = "MATERIAL_EVENT",             // Form 8-K, Công bố thông tin bất thường 24h
  INSIDER_TRANSACTION = "INSIDER_TRANSACTION",   // Form 4, Giao dịch nội bộ / Cổ đông lớn
  MA_RESTRUCTURING = "MA_RESTRUCTURING",         // SC 13D, Thâu tóm, Sáp nhập, Phát hành riêng lẻ
  DIVIDEND_CORP_ACTION = "DIVIDEND_CORP_ACTION", // Chia cổ tức, Tách cổ phiếu
}

export enum DealActionRecommendation {
  OPEN_MARKET_BUY = "OPEN_MARKET_BUY",                 // Mua gom cổ phiếu trên sàn
  BLOCK_TRADE_NEGOTIATION = "BLOCK_TRADE_NEGOTIATION", // Mua thỏa thuận lô lớn / Private Placement
  STRATEGIC_ACQUISITION_CASH = "STRATEGIC_ACQUISITION_CASH", // Mua thâu tóm bằng tiền mặt / LBO
  STOCK_FOR_STOCK_MERGER = "STOCK_FOR_STOCK_MERGER",   // Sáp nhập hoán đổi cổ phiếu
  HOLD_AND_MONITOR = "HOLD_AND_MONITOR",               // Nắm giữ & Theo dõi thêm
  DIVEST_OR_AVOID = "DIVEST_OR_AVOID",                 // Bán thoái vốn / Đứng ngoài tránh rủi ro
}

export interface TargetCompanyProfile {
  symbol: string;                // VD: "AAPL" hoặc "FPT"
  companyName: string;
  region: MarketRegion;
  exchange: "NASDAQ" | "NYSE" | "HSX" | "HNX" | "UPCOM";
  secCik?: string;               // 10-digit CIK cho công ty Mỹ, VD: "0000320193"
  sector: string;
  reportingCurrency: CurrencyCode;
}

export interface StandardizedFinancialStatement {
  symbol: string;
  region: MarketRegion;
  periodType: ReportingPeriodType;
  fiscalYear: number;
  fiscalQuarter?: 1 | 2 | 3 | 4;
  periodEndDate: string;         // ISO Date "YYYY-MM-DD"
  filingDate: string;            // Ngày công bố thực tế (chống look-ahead bias)
  isAuditedOrReviewed: boolean;
  currency: CurrencyCode;
  revenue: number;
  grossProfit: number;
  ebitda: number;
  operatingIncome: number;
  netIncome: number;
  cashAndEquivalents: number;
  totalDebt: number;
  totalEquity: number;
  operatingCashFlow: number;
  freeCashFlow: number;
}

export interface RealTimeQuoteAndActivity {
  symbol: string;
  timestampIso: string;
  currentPrice: number;
  currency: CurrencyCode;
  dailyChangePct: number;
  weeklyChangePct: number;
  monthlyChangePct: number;
  volume: number;
  avgVolume20d: number;
  volumeSpikeRatio: number;
  marketCap: number;
  enterpriseValue: number;
}

export interface CorporateEventItem {
  eventId: string;
  symbol: string;
  region: MarketRegion;
  category: CorporateEventCategory;
  title: string;
  summary: string;
  sourceUrl: string;
  publishedAtIso: string;
  impactScore: number;           // -100 (Rất tiêu cực) đến +100 (Rất tích cực)
}

export interface DealAdvisoryReport {
  symbol: string;
  generatedAtIso: string;
  valuationMetrics: {
    peRatio: number | null;
    pbRatio: number | null;
    evToEbitda: number | null;
    netDebtToEbitda: number | null;
    roePct: number;
    revenueGrowthYoYPct: number;
    netIncomeGrowthYoYPct: number;
  };
  healthScore: number;           // 0 - 100
  recommendedAction: DealActionRecommendation;
  recommendedDealStructure: string;
  rationaleBullets: string[];
  riskWarnings: string[];
}
```

#### B. Bảng `CONSTANTS` & `ENUMS` (No Magic Numbers / No Hardcoded Strings)

| Tên Hằng Số (`CONSTANT_NAME`) | Giá Trị Mặc Định | Kiểu Dữ Liệu | Ý Nghĩa & Nơi Sử Dụng |
| :--- | :--- | :--- | :--- |
| `SEC_EDGAR_MAX_RPS` | `8` | `number` | Giới hạn số request/giây tới SEC EDGAR (dưới mức trần 10 req/s của SEC để tránh bị khóa IP). |
| `DEFAULT_PRICE_ALERT_THRESHOLD_PCT` | `5.0` | `number` | Ngưỡng biến động giá trong ngày (`±5%`) kích hoạt cảnh báo nóng. |
| `DEFAULT_VOLUME_SPIKE_THRESHOLD` | `2.5` | `number` | Khối lượng giao dịch gấp `2.5` lần trung bình 20 phiên (dấu hiệu gom hàng/xả hàng). |
| `UNDERVALUED_EV_EBITDA_THRESHOLD` | `8.0` | `number` | Ngưỡng `EV/EBITDA <= 8.0` đánh dấu doanh nghiệp có định giá hấp dẫn cho M&A. |
| `MAX_SAFE_NET_DEBT_TO_EBITDA` | `3.5` | `number` | Ngưỡng an toàn nợ vay ròng trên EBITDA; vượt mức này cảnh báo rủi ro đòn bẩy. |
| `VN_PRICE_UNIT_MULTIPLIER` | `1000` | `number` | Hệ số quy đổi giá cổ phiếu niêm yết VN (thường hiển thị theo nghìn đồng `25.5` -> `25,500 VND`). |
| `DATA_STALENESS_WARNING_DAYS` | `105` | `number` | Số ngày tối đa từ kỳ BCTC gần nhất trước khi gắn nhãn cảnh báo dữ liệu quá hạn. |

#### C. Schema Chuẩn Của `settings.json`

```json
{
  "sec_edgar": {
    "user_agent": "PersonalToolsCompanyProspect/1.0 (contact@yourdomain.com)",
    "base_url": "https://data.sec.gov/api/xbrl/companyfacts",
    "rate_limit_rps": 8,
    "timeout_ms": 15000
  },
  "market_providers": {
    "us_quote_provider": "finnhub",
    "finnhub_api_key": "REPLACE_WITH_FINNHUB_API_KEY",
    "vn_quote_provider": "vndirect_public",
    "vn_data_base_url": "https://finfo-api.vndirect.com.vn/v4",
    "fx_usd_to_vnd_fallback": 25450
  },
  "advisory_thresholds": {
    "price_alert_threshold_pct": 5.0,
    "volume_spike_threshold": 2.5,
    "undervalued_ev_ebitda": 8.0,
    "max_safe_net_debt_to_ebitda": 3.5,
    "min_roe_pct_for_buy": 12.0
  },
  "notifications": {
    "telegram_bot_token": "REPLACE_WITH_TELEGRAM_BOT_TOKEN",
    "telegram_chat_id": "REPLACE_WITH_TELEGRAM_CHAT_ID",
    "alert_enabled": true
  },
  "watchlist": [
    {
      "symbol": "AAPL",
      "companyName": "Apple Inc.",
      "region": "US",
      "exchange": "NASDAQ",
      "secCik": "0000320193",
      "sector": "Technology",
      "reportingCurrency": "USD"
    },
    {
      "symbol": "FPT",
      "companyName": "CTCP FPT",
      "region": "VN",
      "exchange": "HSX",
      "sector": "Technology",
      "reportingCurrency": "VND"
    }
  ]
}
```

---

### 2.3. Kiến Trúc Service & Helper (Rule 4 & Single Responsibility Principle)

| Tên File Module | Phân Loại | Hàm Thành Phần & Chữ Ký (Signature) | Docstring Mục Đích (1 Việc Duy Nhất - SRP) |
| :--- | :--- | :--- | :--- |
| `settings_service_helper.ts` | `*ServiceHelper` | `loadAndValidateSettings(filePath: string): AppSettings` | Đọc `settings.json`, kiểm tra định dạng `sec_edgar.user_agent` hợp lệ và trả về cấu hình đã chuẩn hóa. |
| `us_edgar_service_helper.ts` | `*ServiceHelper` | `formatSecCik(rawCik: string): string` | Chuẩn hóa mã CIK thành chuỗi 10 chữ số có đệm số `0` ở đầu (`0000320193`) theo chuẩn URL của SEC EDGAR. |
| `us_edgar_service_helper.ts` | `*ServiceHelper` | `mapUsGaapFactsToStandardStatement(symbol: string, rawCompanyFacts: unknown): StandardizedFinancialStatement[]` | Ánh xạ các thẻ XBRL (`Revenues`, `NetIncomeLoss`, `Assets`, `LiabilitiesAndStockholdersEquity`) sang `StandardizedFinancialStatement`. |
| `us_market_data_service.ts` | `*Service` | `fetchUsCompanyFinancialsAndFilings(profile: TargetCompanyProfile): Promise<{ statements: StandardizedFinancialStatement[]; events: CorporateEventItem[] }>` | Gọi SEC EDGAR API có bộ điều tiết tốc độ (Token Bucket `<= 8 req/s`) để lấy BCTC 10-Q/10-K và danh sách sự kiện 8-K/13D/Form 4. |
| `vn_market_service_helper.ts` | `*ServiceHelper` | `normalizeVnPriceAndCurrencyUnit(rawPrice: number, rawFinancialValue: number): { priceVnd: number; financialVnd: number }` | Chuẩn hóa đơn vị giá cổ phiếu VN (nhân `1000` nếu nguồn trả về đơn vị nghìn đồng) và đồng nhất đơn vị tỷ đồng/đồng trên BCTC VAS. |
| `vn_market_data_service.ts` | `*Service` | `fetchVnCompanyFinancialsAndEvents(profile: TargetCompanyProfile): Promise<{ statements: StandardizedFinancialStatement[]; events: CorporateEventItem[] }>` | Thu thập BCTC Quý/Năm, ước tính doanh thu tháng và tin tức công bố thông tin của doanh nghiệp niêm yết Việt Nam. |
| `quote_monitor_service.ts` | `*Service` | `fetchRealTimeQuoteSnapshot(profile: TargetCompanyProfile): Promise<RealTimeQuoteAndActivity>` | Lấy giá hiện tại, biến động ngày/tuần/tháng, tính `volumeSpikeRatio` và `enterpriseValue`. |
| `ma_valuation_service_helper.ts` | `*ServiceHelper` | `calculateValuationMultiples(quote: RealTimeQuoteAndActivity, latestTtmStatement: StandardizedFinancialStatement): ValuationMetrics` | Tính toán thuần hàm các chỉ số `P/E`, `P/B`, `EV/EBITDA`, `Net Debt/EBITDA`, `ROE` (trả về `null` cho `P/E` khi lợi nhuận âm, không chia cho 0). |
| `ma_valuation_service_helper.ts` | `*ServiceHelper` | `determineDealStructureRecommendation(metrics: ValuationMetrics, recentEvents: CorporateEventItem[]): { action: DealActionRecommendation; structure: string; rationale: string[]; risks: string[] }` | Áp dụng cây quyết định tài chính để đề xuất phương thức Mua gom trên sàn, Mua thỏa thuận lô lớn, Thâu tóm tiền mặt, Sáp nhập hoán đổi cổ phiếu hay Thoái vốn. |
| `ma_advisory_service.ts` | `*Service` | `generateCompanyAdvisoryReport(profile: TargetCompanyProfile): Promise<DealAdvisoryReport>` | Điều phối việc lấy dữ liệu BCTC + Giá + Sự kiện, gọi `ma_valuation_service_helper` và xuất báo cáo thẩm định M&A hoàn chỉnh. |

---

### 2.4. Ma Trận 5 Trạng Thái UX (Dashboard & Báo Cáo Thẩm Định)

| Trạng Thái UX | Hành Vi Hiển Thị & Trải Nghiệm Người Dùng |
| :--- | :--- |
| **1. Ideal (Đầy đủ dữ liệu US & VN)** | Hiển thị bảng so sánh trực quan theo **Tuần / Tháng / Quý**: Đồ thị Doanh thu & Lợi nhuận ròng `QoQ/YoY`, giá cổ phiếu thời gian thực kèm nhãn `Volume Spike 3.1x`, dòng thời gian "Nhất cử nhất động" (Form 8-K, Giao dịch cổ đông lớn) và thẻ **Khuyến nghị M&A** nổi bật (VD: `ĐỀ XUẤT: MUA THỎA THUẬN LÔ LỚN (BLOCK TRADE) — EV/EBITDA = 6.4x, Tiền mặt ròng chiếm 35% vốn hóa`). |
| **2. Loading (Đang đồng bộ đa nguồn)** | Hiển thị tiến trình theo từng bước rõ ràng: `[1/3] Đang tải BCTC từ SEC EDGAR / VNDirect... -> [2/3] Đang cập nhật giá & dòng tiền phiên hôm nay... -> [3/3] Đang tính toán mô hình định giá M&A...` kèm Skeleton table. |
| **3. Empty (Chưa có công ty hoặc công ty mới IPO chưa đủ BCTC)** | Khi Watchlist trống, hiển thị màn hình hướng dẫn thêm mã nhanh (gợi ý mẫu `AAPL`, `MSFT`, `FPT`, `VNM`). Khi công ty mới lên sàn chưa có lịch sử 4 quý, hiển thị thông báo `ℹ️ Công ty chưa đủ 4 quý BCTC lịch sử để tính chỉ số TTM — Chỉ hiển thị dữ liệu theo kỳ đơn lẻ`. |
| **4. Error (Bị chặn Rate Limit SEC 403 / Lỗi nguồn VN)** | Hiển thị banner lỗi rõ nguyên nhân kèm mã lỗi: `[ERR_SEC_USER_AGENT_REJECTED] SEC EDGAR từ chối kết nối do thiếu email trong User-Agent` hoặc `[ERR_VN_PROVIDER_UNAVAILABLE] Nguồn dữ liệu VN đang bảo trì — Đang hiển thị bản chụp BCTC lưu cache gần nhất (cập nhật 14h trước)`. |
| **5. Partial / Overflow (Trễ công bố BCTC / Đơn vị tiền tệ hỗn hợp / Lợi nhuận âm)** | - Khi công ty chậm nộp BCTC quá hạn (`> 105 ngày`), hiển thị huy hiệu cảnh báo màu vàng `⚠️ STALE FINANCIALS: BCTC Quý gần nhất đã quá 105 ngày` và tự động hạ điểm sức khỏe tài chính.<br>- Khi lợi nhuận ròng hoặc EBITDA âm (`< 0`), hiển thị `P/E: N/A (Lỗ ròng)` thay vì số âm gây hiểu lầm là rẻ.<br>- Khi danh sách sự kiện vượt quá 50 tin/tuần, tự động nhóm theo `CorporateEventCategory` và ưu tiên hiển thị các tin có ` abs(impactScore) >= 60`. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

| Mã Rủi Ro | Mô Tả Lỗ Hổng / Rủi Ro Thực Tế | Tác Động Nếu Không Chặn | Quy Tắc Khóa Chặn Kỹ Thuật (Mandatory Guardrail) |
| :--- | :--- | :--- | :--- |
| `RISK-01` | **Độ trễ công bố BCTC (Reporting Lag), Điều chỉnh sau kiểm toán (Restatements) & Look-Ahead Bias trên SEC EDGAR / Vietstock**: BCTC Quý 1 (kết thúc `31/03`) thường tới tận cuối tháng 4 hoặc tháng 5 mới được công bố; hơn nữa ở VN chênh lệch lợi nhuận trước và sau kiểm toán bán niên/năm rất phổ biến. Nếu ghép giá cổ phiếu ngày `01/04` với BCTC kỳ `31/03` chưa công bố hoặc lấy nhầm số chưa kiểm toán sẽ dẫn tới quyết định M&A sai lầm nghiêm trọng. | Định giá sai lệch hàng chục phần trăm, mua nhầm doanh nghiệp "xào nấu" số liệu trước kiểm toán. | **Chốt chặn Point-in-Time & Audit Flag**:<br>1. Mọi bản ghi `StandardizedFinancialStatement` bắt buộc lưu cả `periodEndDate` lẫn `filingDate` thực tế.<br>2. Chỉ sử dụng số liệu BCTC khi `currentDate >= filingDate`.<br>3. Nếu phát hiện chênh lệch `> 5%` giữa BCTC tự lập và BCTC kiểm toán cùng kỳ, tự động gắn cờ rủi ro quản trị `[GOVERNANCE_RESTATEMENT_RISK]` vào `riskWarnings`. |
| `RISK-02` | **Sai lệch đơn vị tiền tệ và quy ước hiển thị giữa Mỹ (`USD`) và Việt Nam (`nghìn VND` vs `tỷ VND`)**: Ở Việt Nam, bảng giá cổ phiếu niêm yết hiển thị theo đơn vị **nghìn đồng** (ví dụ FPT giá `135.2` tức là `135,200 VND`), trong khi BCTC có nơi trả về theo **đồng**, có nơi trả về theo **triệu đồng** hoặc **tỷ đồng**. Tại Mỹ, SEC EDGAR trả về `USD` nguyên bản nhưng số lượng cổ phiếu có thể lệch kỳ chia tách (Stock Split). | Tính `Market Cap`, `P/E`, `EV/EBITDA` sai lệch gấp `1,000` hoặc `1,000,000,000` lần, làm hỏng toàn bộ động cơ khuyến nghị M&A. | **Chốt chặn Chuẩn hóa Đơn vị (`Unit Normalization Gate`)**:<br>1. Trong `vn_market_service_helper.ts`, bắt buộc chuẩn hóa mọi số liệu VN về đơn vị gốc **1 VND** (`price * 1000` nếu `< 1000`, kiểm tra chéo `MarketCap ≈ Price * SharesOutstanding` với sai số cho phép `< 2%`).<br>2. Cấm cộng/so sánh trực tiếp số tuyệt đối giữa công ty `USD` và `VND` nếu chưa quy đổi qua tỷ giá `fx_usd_to_vnd` hoặc chưa chuyển về tỷ số không thứ nguyên (`EV/EBITDA`, `ROE%`). |
| `RISK-03` | **Bị khóa IP vĩnh viễn bởi SEC EDGAR (`HTTP 403 Forbidden`)**: SEC EDGAR quy định bắt buộc mọi request tự động phải khai báo header `User-Agent` theo đúng mẫu `Sample Company Name AdminContact@<sample company domain>.com` và không vượt quá `10 requests/second`. Nếu dùng `axios`/`requests` mặc định sẽ bị chặn `403` ngay lập tức. | Toàn bộ nhánh dữ liệu thị trường Mỹ tê liệt hoàn toàn. | **Chốt chặn SEC Compliance trong `UsMarketDataService`**:<br>1. Kiểm tra bằng Regex tại lúc khởi động: `sec_edgar.user_agent` phải chứa tên ứng dụng và địa chỉ email hợp lệ (không chấp nhận chuỗi mặc định `"REPLACE_WITH..."`).<br>2. Áp dụng Token Bucket Rate Limiter cứng ở mức `SEC_EDGAR_MAX_RPS = 8` req/s kèm bộ nhớ đệm (local disk cache 24h cho các file `CIK.json`). |
| `RISK-04` | **Bẫy Giá Trị (Value Trap) khi P/E thấp ảo do lợi nhuận đột biến 1 lần hoặc nợ vay khổng lồ**: Một công ty sắp phá sản hoặc vừa bán tài sản 1 lần có thể có `P/E = 3.0`, nếu công thức ngây thơ chỉ nhìn `P/E < 10` sẽ khuyên "Mua mạnh / Thâu tóm", đẩy người dùng vào thương vụ gánh nợ xấu. | Đưa ra khuyến nghị M&A nguy hiểm, gây thiệt hại tài chính lớn. | **Chốt chặn Thẩm định Đa chiều trong `MaValuationServiceHelper`**:<br>1. Bắt buộc dùng `EV/EBITDA` (đã cộng `Total Debt` và trừ `Cash`) làm chỉ số chính thay vì chỉ dùng `P/E`.<br>2. Nếu `Net Debt / EBITDA > 3.5` hoặc `Operating Cash Flow < 0` trong 2 quý liên tiếp, **cấm** đưa ra khuyến nghị `OPEN_MARKET_BUY` hoặc `STRATEGIC_ACQUISITION_CASH`, bắt buộc chuyển sang `DIVEST_OR_AVOID` hoặc cảnh báo tái cấu trúc nợ. |

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1. Kịch Bản Kiểm Thử 3 Tầng (`Given / When / Then`)

#### Tầng 1: Happy Paths (Luồng Nghiệp Vụ Chuẩn)
- **`TEST-T1-001` (Đồng bộ BCTC & Định giá công ty Mỹ từ SEC EDGAR)**:
  - **Given**: Cấu hình mã `AAPL` (`secCik = "320193"`), mock SEC EDGAR trả về payload XBRL 4 quý gần nhất và giá hiện tại `$220.00`.
  - **When**: Gọi `generateCompanyAdvisoryReport(aaplProfile)`.
  - **Then**: CIK được tự động chuẩn hóa thành `"0000320193"`, doanh thu và lợi nhuận TTM được cộng đúng 4 quý gần nhất, các chỉ số `P/E`, `EV/EBITDA`, `ROE` được tính chính xác đến 2 chữ số thập phân và trả về `DealAdvisoryReport` hợp lệ.
- **`TEST-T1-002` (Đồng bộ công ty Việt Nam & Khuyến nghị cấu trúc thương vụ M&A)**:
  - **Given**: Mã `FPT` (sàn `HSX`) có `EV/EBITDA = 7.2`, `ROE = 24%`, `Net Debt / EBITDA = 0.4`, tiền mặt dồi dào và khối lượng giao dịch đột biến `Volume Spike = 2.8x`.
  - **When**: Chạy `generateCompanyAdvisoryReport(fptProfile)`.
  - **Then**: Giá cổ phiếu được chuẩn hóa đúng về đơn vị `VND`, hệ thống đề xuất `BLOCK_TRADE_NEGOTIATION` / `STRATEGIC_ACQUISITION_CASH` kèm lý giải chi tiết các điểm mạnh tài chính.
- **`TEST-T1-003` (Phát hiện sự kiện "Nhất cử nhất động" Form 8-K / Giao dịch cổ đông lớn)**:
  - **Given**: Nguồn sự kiện trả về thông báo mới phát hành trong 24h qua thuộc nhóm `MA_RESTRUCTURING` (cổ đông lớn mua thêm 7% cổ phần).
  - **When**: Chạy chu kỳ quét sự kiện hằng ngày.
  - **Then**: Sự kiện được phân loại đúng vào `CorporateEventCategory.MA_RESTRUCTURING`, chấm `impactScore > 60` và bắn thông báo tóm tắt qua Telegram.

#### Tầng 2: Negative / Network / Auth (Luồng Lỗi & Xác Thực)
- **`TEST-T2-001` (Thiếu hoặc sai định dạng `sec_edgar.user_agent`)**:
  - **Given**: `settings.json` để trống `sec_edgar.user_agent` hoặc không có email liên hệ.
  - **When**: Khởi tạo `UsMarketDataService`.
  - **Then**: Hệ thống chặn ngay trước khi gửi HTTP request, ném lỗi `[ERR_INVALID_SEC_USER_AGENT]` hướng dẫn cấu hình đúng chuẩn SEC.
- **`TEST-T2-002` (Nguồn dữ liệu VN trả về HTTP 503 hoặc mất kết nối)**:
  - **Given**: Endpoint dữ liệu VN bị lỗi `503 Service Unavailable`, nhưng trong local cache đã có BCTC quý gần nhất của `FPT`.
  - **When**: Gọi `generateCompanyAdvisoryReport(fptProfile)`.
  - **Then**: Hệ thống không bị crash, nạp dữ liệu từ bản lưu cache gần nhất, gắn cờ cảnh báo `isCachedFallback = true` trên báo cáo để người dùng biết độ tươi của dữ liệu.

#### Tầng 3: Boundary / Edge / Concurrency (Biên Độ & Chốt Chặn Định Giá)
- **`TEST-T3-001` (Công ty thua lỗ `Net Income <= 0` hoặc `EBITDA <= 0` và Nợ vay cao)**:
  - **Given**: Một công ty mục tiêu có `Net Income = -50,000,000`, `EBITDA = -10,000,000`, và `Total Debt` gấp 5 lần `Equity`.
  - **When**: Gọi `calculateValuationMultiples()` và `determineDealStructureRecommendation()`.
  - **Then**: Không xảy ra lỗi chia cho 0; `peRatio` và `evToEbitda` trả về `null`; khuyến nghị bắt buộc là `DIVEST_OR_AVOID` kèm cảnh báo rủi ro đòn bẩy.
- **`TEST-T3-002` (Kiểm tra chéo sai lệch đơn vị giá Việt Nam `135.2` vs `135,200`)**:
  - **Given**: API bảng giá trả về `currentPrice = 135.2` (nghìn đồng), số lượng cổ phiếu lưu hành là `1,460,000,000` và `marketCap` tham chiếu là `197,392,000,000,000 VND`.
  - **When**: Gọi `normalizeVnPriceAndCurrencyUnit()`.
  - **Then**: Hàm tự động nhận diện và nhân `1000` thành `135,200 VND`, khớp với `marketCap` trong biên độ sai số `< 1%`.
- **`TEST-T3-003` (Quét đồng thời 20 công ty Mỹ không vượt ngưỡng Rate Limit 8 req/s của SEC)**:
  - **Given**: Watchlist có 20 mã công ty Mỹ được yêu cầu làm mới cùng lúc (`Promise.all`).
  - **When**: Chạy đồng bộ toàn bộ Watchlist.
  - **Then**: Bộ Token Bucket điều tiết tốc độ đảm bảo không có bất kỳ cửa sổ 1 giây nào gửi quá `8` requests tới `data.sec.gov`.

---

### 4.2. Quy Trình Kiểm Chứng 5 Bước (`Launch -> Doctor -> Drive -> Evidence -> Cleanup`)

1. **Bước 1 — `Launch`**: Khởi tạo mock server giả lập API `data.sec.gov` (US) và `vndirect` (VN) tại môi trường local.
2. **Bước 2 — `Doctor`**: Kiểm tra schema `settings.json`, xác thực định dạng `sec_edgar.user_agent`, kiểm tra type-check (`tsc --noEmit` hoặc `mypy`).
3. **Bước 3 — `Drive`**: Chạy toàn bộ test suite 3 tầng, bao gồm kịch bản so sánh công ty tốt (`AAPL`, `FPT`) và công ty bẫy giá trị (nợ cao, lỗ ròng), xuất báo cáo thẩm định mẫu ra CLI/JSON.
4. **Bước 4 — `Evidence`**: Lưu kết quả test pass 100%, file mẫu `advisory-report-sample.json` chứa đầy đủ bảng chỉ số và khuyến nghị cấu trúc thương vụ M&A.
5. **Bước 5 — `Cleanup`**: Đóng mock server, xóa cache test tạm thời, đảm bảo workspace sạch sẽ.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role Phụ Trách | File Mục Tiêu (1 File / Module) | Hàm / Thành Phần Cần Viết | Phụ Thuộc | Lệnh Verify & Definition of Done (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | `developer` | `idea/company-prospect/src/constants.ts` | Định nghĩa toàn bộ Enums (`MarketRegion`, `CurrencyCode`, `ReportingPeriodType`, `CorporateEventCategory`, `DealActionRecommendation`), Interfaces và hằng số `SEC_EDGAR_MAX_RPS`, ngưỡng định giá. | Không | **Verify**: `npx tsc --noEmit`<br>**DoD**: Không có magic number/string, đầy đủ JSDoc cho từng interface. |
| `TASK-002` | `developer` | `idea/company-prospect/src/helpers/settingsServiceHelper.ts` | Viết `loadAndValidateSettings()` đọc `settings.json` và kiểm tra bắt buộc `sec_edgar.user_agent` hợp lệ. | `TASK-001` | **Verify**: `npm test -- settingsServiceHelper.test.ts`<br>**DoD**: Chặn ngay cấu hình thiếu User-Agent chuẩn SEC hoặc thiếu Watchlist. |
| `TASK-003` | `developer` | `idea/company-prospect/src/helpers/usEdgarServiceHelper.ts` | Viết `formatSecCik()`, `mapUsGaapFactsToStandardStatement()`, và `extractSecRecentFilings()` (lọc 10-Q, 10-K, 8-K, 13D, Form 4). | `TASK-001` | **Verify**: `npm test -- usEdgarServiceHelper.test.ts`<br>**DoD**: Parse chính xác JSON thực tế của SEC EDGAR, gắn đúng cả `periodEndDate` và `filingDate`. |
| `TASK-004` | `developer` | `idea/company-prospect/src/services/usMarketDataService.ts` | Viết `fetchUsCompanyFinancialsAndFilings()` tích hợp Token Bucket Rate Limiter (`<= 8 req/s`) và local cache. | `TASK-002`, `TASK-003` | **Verify**: `npm test -- usMarketDataService.test.ts`<br>**DoD**: Tôn trọng tuyệt đối rate limit của SEC, fallback về cache khi mất mạng. |
| `TASK-005` | `developer` | `idea/company-prospect/src/helpers/vnMarketServiceHelper.ts` | Viết `normalizeVnPriceAndCurrencyUnit()` và `mapVasStatementToStandardStatement()` cho doanh nghiệp Việt Nam. | `TASK-001` | **Verify**: `npm test -- vnMarketServiceHelper.test.ts`<br>**DoD**: Chuẩn hóa chính xác đơn vị nghìn đồng/tỷ đồng về `VND`, kiểm tra chéo khớp `Market Cap`. |
| `TASK-006` | `developer` | `idea/company-prospect/src/services/vnMarketDataService.ts` | Viết `fetchVnCompanyFinancialsAndEvents()` lấy BCTC Quý/Năm, doanh thu tháng và sự kiện công bố thông tin tại VN. | `TASK-002`, `TASK-005` | **Verify**: `npm test -- vnMarketDataService.test.ts`<br>**DoD**: Trả về cùng cấu trúc `StandardizedFinancialStatement` và `CorporateEventItem` như thị trường Mỹ. |
| `TASK-007` | `developer` | `idea/company-prospect/src/services/quoteMonitorService.ts` | Viết `fetchRealTimeQuoteSnapshot()` tính `% biến động Ngày/Tuần/Tháng`, `volumeSpikeRatio` và `enterpriseValue`. | `TASK-001`, `TASK-005` | **Verify**: `npm test -- quoteMonitorService.test.ts`<br>**DoD**: Tính đúng `EV = MarketCap + TotalDebt - Cash` và phát hiện đột biến khối lượng `>= 2.5x`. |
| `TASK-008` | `developer` | `idea/company-prospect/src/helpers/maValuationServiceHelper.ts` | Viết `calculateValuationMultiples()` và `determineDealStructureRecommendation()` (cây quyết định M&A & chống Value Trap). | `TASK-001` | **Verify**: `npm test -- maValuationServiceHelper.test.ts`<br>**DoD**: Không chia cho 0 khi lỗ, chặn khuyến nghị mua khi `Net Debt / EBITDA > 3.5`, xuất lý giải rõ ràng. |
| `TASK-009` | `developer` | `idea/company-prospect/src/services/maAdvisoryService.ts` | Viết `generateCompanyAdvisoryReport()` và `sendCriticalEventAlert()` điều phối toàn bộ pipeline Tuần/Tháng/Quý. | `TASK-004`, `TASK-006`, `TASK-007`, `TASK-008` | **Verify**: `npm test -- maAdvisoryService.test.ts`<br>**DoD**: Sinh báo cáo hoàn chỉnh cho cả mã Mỹ và mã VN, gửi cảnh báo Telegram khi có sự kiện trọng yếu. |
| `TASK-010` | `test_engineer` | `idea/company-prospect/tests/e2eAdvisoryPipeline.test.ts` | Viết bộ kiểm thử tích hợp 3 tầng (`TEST-T1-001`..`TEST-T3-003`) và script CLI chạy báo cáo thẩm định. | `TASK-009` | **Verify**: `npm test`<br>**DoD**: Pass 100% test cases 3 tầng, hoàn tất quy trình 5 bước `Launch -> Doctor -> Drive -> Evidence -> Cleanup`. |
