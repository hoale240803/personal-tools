# Tài Liệu Đặc Tả Thực Thi (Dev-Ready & Test-Ready): Cheap Flight Tool (`cheap-flight-tool`)

> **Phiên bản:** 1.0.0  
> **Đơn vị lập đặc tả:** AISE Squad 2 (`intake` + `ba` + `requirement_challenger` + `orchestrator` + `estimator_cost_controller`)  
> **Nguồn dữ liệu gốc:** `idea/cheap-flight-tool/requirement.md`  
> **Mục tiêu hệ thống:** Công cụ theo dõi và cập nhật giá vé máy bay khứ hồi mới nhất tuyến **Mỹ – Việt Nam (US ↔ VN)** của các hãng hàng không yêu thích, chuẩn hóa đầy đủ thông tin chuyến bay (**Ngày bay đi – Ngày bay về khứ hồi, Hãng bay, Số ký hành lý tối đa được mang lên gồm Xách tay & Ký gửi**) và tự động gửi cảnh báo qua **Telegram** ngay khi tổng giá thực tế giảm xuống dưới mức kỳ vọng của người dùng.

---

## PHẦN 1 — INTAKE & PHÂN LOẠI (`intake`)

### 1.1 Bảng Phân Tách Yêu Cầu (`Stated Facts` / `Explicit Assumptions` / `Clarification Questions`)

| Phân loại | Mã tham chiếu | Nội dung chi tiết | Nguồn / Lý do kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-001` | Cập nhật giá mới nhất của các hãng bay từ **US – VN** yêu thích. | `requirement.md` (L1) |
| **Stated Fact** | `SF-002` | Thông báo qua **Telegram** nếu giá giảm xuống mức kỳ vọng (`targetPriceUsd`). | `requirement.md` (L2) |
| **Stated Fact** | `SF-003` | Thông tin bắt buộc của một chuyến bay gồm: **Ngày bay khứ hồi** (Outbound Date + Return Date), **Hãng bay** (Airline), **Số ký tối đa được mang lên** (Maximum Baggage Allowance in kg). | `requirement.md` (L4-5) |
| **Explicit Assumption** | `EA-001` | **Danh sách sân bay US ↔ VN và Hãng bay yêu thích mặc định:**<br>- Sân bay Mỹ (US Origins): `SFO`, `LAX`, `SEA`, `DFW`, `IAH`, `JFK`, `ORD`, `DTW`, `ATL`.<br>- Sân bay Việt Nam (VN Destinations): `SGN` (TP.HCM), `HAN` (Hà Nội), `DAD` (Đà Nẵng).<br>- Hãng bay US–VN phổ biến: `Vietnam Airlines (VN)` (bay thẳng SFO–SGN), `EVA Air (BR)`, `China Airlines (CI)`, `STARLUX Airlines (JX)`, `Korean Air (KE)`, `Asiana Airlines (OZ)`, `ANA (NH)`, `Japan Airlines (JL)`, `Cathay Pacific (CX)`, `Singapore Airlines (SQ)`, `United Airlines (UA)`. | Cụ thể hóa yêu cầu *"các hãng bay từ US - VN yêu thích"* thành cấu hình mặc định sẵn sàng sử dụng ngay trong `settings.json`. |
| **Explicit Assumption** | `EA-002` | **Quy đổi chuẩn Hành lý Quốc tế US–VN (`Piece & Weight Normalization to KG`):** Các chặng bay xuất phát từ Mỹ áp dụng hệ thống kiện (**Piece Concept**: chuẩn Economy thường là `2 kiện × 23 kg = 46 kg` ký gửi + `7–10 kg` xách tay, trong khi vé Basic Economy có thể chỉ có `1 kiện × 23 kg` hoặc `0 kg` ký gửi). Hệ thống sẽ quy đổi mọi đơn vị (`lbs` -> `kg` theo tỷ lệ `1 lb = 0.45359237 kg`) và hiển thị rõ: **Tổng số kg ký gửi (`maxCheckedBaggageKg`), Số kiện (`checkedPieces`), và Số kg xách tay (`maxCarryOnBaggageKg`)**. | Giải quyết triệt để yêu cầu *"Số ký tối đa được mang lên"* đối với đặc thù chặng bay xuyên Thái Bình Dương US–VN. |
| **Explicit Assumption** | `EA-003` | **Nguồn dữ liệu giá vé hợp pháp (Official Travel APIs):** Sử dụng kiến trúc Provider Adapter ưu tiên **Amadeus Self-Service Flight Offers Search API (Free Tier)** / **Duffel API** / **Kiwi Tequila API**, tuyệt đối không dùng bot giải CAPTCHA trên trang web của hãng bay. | Đảm bảo lấy được dữ liệu hành lý (`includedCheckedBags`) chính xác từ chuẩn GDS hàng không quốc tế. |
| **Clarification Question** | `CQ-001` | **Câu hỏi:** Khi so sánh giá vé với mức giá kỳ vọng (`targetPriceUsd`), hệ thống nên so sánh theo **Giá vé niêm yết thấp nhất (kể cả vé không có hành lý ký gửi)** hay **Tổng giá thực tế sau khi đã cộng đủ tiêu chuẩn hành lý tối thiểu (VD: tối thiểu 1 kiện 23kg hoặc 2 kiện 46kg)**?<br>- **Option A (Khuyến nghị):** So sánh theo **Effective Baggage-Adjusted Price** (nếu vé rẻ nhất không kèm hành lý theo ngưỡng `minRequiredBaggageKg` của người dùng, hệ thống tự động cộng phí mua thêm hành lý trước khi so sánh với `targetPriceUsd`).<br>- **Option B:** Chỉ so sánh giá vé cơ sở bất kể có được mang hành lý hay không. | Khuyến nghị **Option A** vì người bay tuyến US–VN hầu như luôn cần mang quà/hành lý về Việt Nam (23kg–46kg). |

### 1.2 Nhãn Bảo Mật, Tuân Thủ & Rủi Ro (`Security & Compliance Tags`)

- **[COMPLIANCE-ANTI-BOT]:** Các hệ thống đặt vé hàng không sử dụng tường lửa bảo mật cực cao (Akamai Bot Manager, Shape Security, Cloudflare). Hệ thống chỉ truy vấn qua các API hàng không chính thống (Amadeus / Tequila / SerpApi Google Flights) hoặc feed được cấp phép; tuyệt đối không vượt CAPTCHA.
- **[SECURITY-SECRETS]:** Toàn bộ `AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` phải được lưu trong `settings.json`.

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1 Bảng Yêu Cầu Nghiệp Vụ Có Mã Truy Vết (`REQ-001` .. `REQ-010`)

| Mã REQ | Tên Yêu Cầu | Mô tả nghiệp vụ chi tiết | Truy vết nguồn | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | **US–VN Route & Favorite Airline Watchlist** | Cho phép cấu hình danh sách chặng bay khứ hồi US ↔ VN (VD: `SFO <-> SGN`, `LAX <-> HAN`, `DTW <-> SGN`), khoảng ngày bay đi – ngày bay về, và danh sách mã hãng hàng không yêu thích (`favoriteAirlines`). | `requirement.md` L1, L5 | `P0 Must-Have` |
| `REQ-002` | **Round-Trip Flight Price Fetcher & Normalizer** | Truy vấn và cập nhật giá vé khứ hồi mới nhất (bao gồm cả thuế và phụ phí bắt buộc), trích xuất chính xác Ngày giờ bay đi (`outboundDepartureIso`), Ngày giờ bay về (`inboundDepartureIso`), và Hãng khai thác (`airlineCode`, `airlineName`). | `requirement.md` L1, L4-5 | `P0 Must-Have` |
| `REQ-003` | **Baggage Allowance Extractor & Kg Converter** | Trích xuất thông tin hành lý từ dữ liệu vé GDS/API hoặc bảng quy chuẩn hãng bay (`AIRLINE_DEFAULT_BAGGAGE_RULES`), quy đổi từ `lbs` hoặc `pieces` sang **tổng số ký tối đa được mang lên (`totalAllowedBaggageKg` = `carryOnKg` + `checkedBaggageKg`)**. | `requirement.md` L5 | `P0 Must-Have` |
| `REQ-004` | **Target Price Threshold & Baggage-Adjusted Evaluator** | Kiểm tra điều kiện kích hoạt cảnh báo: (1) Hãng bay nằm trong danh sách yêu thích, (2) Tổng số ký hành lý đạt mức tối thiểu người dùng cần (hoặc cộng phí mua thêm hành lý vào giá vé), và (3) Giá vé $\le$ `targetPriceUsd`. | `requirement.md` L1-2, L5 | `P0 Must-Have` |
| `REQ-005` | **Telegram Price Drop Alert Service** | Gửi thông báo tức thời qua Telegram khi phát hiện vé thỏa mãn mức giá kỳ vọng, hiển thị rõ: Chặng bay, Ngày đi – Ngày về khứ hồi, Hãng bay, Giá hiện tại vs Giá kỳ vọng (tiết kiệm `$XX`), và Chi tiết số ký hành lý tối đa (`X kiện × 23kg + Xách tay 7kg = Tổng 53kg`). | `requirement.md` L2, L4-5 | `P0 Must-Have` |
| `REQ-006` | **Price History & Alert Cooldown Deduplicator** | Lưu lịch sử giá của từng chuyến bay và áp dụng cơ chế chống gửi lặp: chỉ gửi lại thông báo cho cùng một chuyến bay nếu giá tiếp tục giảm sâu hơn ít nhất `$25` (`ADDITIONAL_PRICE_DROP_USD = 25`) hoặc sau thời gian cooldown cấu hình. | Yêu cầu kỹ thuật cốt lõi | `P1 Should-Have` |
| `REQ-007` | **Multi-Currency to USD Normalizer** | Tự động quy đổi giá vé trả về bằng `VND`, `EUR`, `CAD`, `TWD` về một đồng tiền chuẩn duy nhất (`USD` hoặc `VND` theo cấu hình người dùng) trước khi so sánh với `targetPriceUsd`. | Yêu cầu kỹ thuật cốt lõi | `P1 Should-Have` |
| `REQ-008` | **Flexible Date Window Scanner (±3 Days)** | Hỗ trợ tìm kiếm linh hoạt quanh ngày dự kiến đi/về (`±3 ngày`) để phát hiện vé rẻ hơn đáng kể nếu lùi/tiến 1–2 ngày. | Tối ưu trải nghiệm săn vé US–VN | `P1 Should-Have` |
| `REQ-009` | **Layover & Transit Visa Warning** | Hiển thị thông tin điểm quá cảnh (VD: Taipei `TPE`, Seoul `ICN`, Tokyo `NRT`/`HND`) và cảnh báo nếu thời gian nối chuyến quá ngắn (`< 90 phút`) hoặc quá dài (`> 12 giờ`) hoặc cần đổi sân bay (VD: `Haneda <-> Narita`). | Đặc thù tuyến bay US–VN | `P2 Nice-to-Have` |
| `REQ-010` | **Scheduled Polling & Health Report** | Chạy kiểm tra định kỳ theo chu kỳ cấu hình (VD: mỗi 2 giờ) và ghi log trạng thái API, số chuyến bay đã quét, và mức giá thấp nhất hiện tại. | Hỗ trợ vận hành tự động | `P2 Nice-to-Have` |

---

### 2.2 Data Structures, Constants & `settings.json` Schema (No Magic Numbers / Strings)

#### A. Bảng `CONSTANTS` & `ENUMS` (`src/constants/FlightToolConstants.js`)

```javascript
export const FLIGHT_CONVERSION_CONSTANTS = Object.freeze({
  LBS_TO_KG_FACTOR: 0.45359237,
  STANDARD_US_PIECE_WEIGHT_KG: 23,              // Chuẩn 1 kiện quốc tế đi/đến Mỹ = 23kg (50 lbs)
  BUSINESS_US_PIECE_WEIGHT_KG: 32,              // Chuẩn hạng Thương gia = 32kg (70 lbs)
  DEFAULT_CARRY_ON_WEIGHT_KG: 7,                // Xách tay tiêu chuẩn 7kg
  EXTRA_BAG_ESTIMATED_FEE_USD: 150,             // Phí ước tính mua thêm 1 kiện 23kg chặng US-VN
  MIN_ADDITIONAL_DROP_FOR_REALERT_USD: 25,      // Giảm thêm >= $25 mới báo lại cùng chuyến bay
  MIN_SAFE_LAYOVER_MINUTES: 90,
  MAX_COMFORTABLE_LAYOVER_MINUTES: 720,
});

export const FavoriteUsVnAirline = Object.freeze({
  VIETNAM_AIRLINES: "VN",
  EVA_AIR: "BR",
  CHINA_AIRLINES: "CI",
  STARLUX: "JX",
  KOREAN_AIR: "KE",
  ASIANA: "OZ",
  ANA: "NH",
  JAPAN_AIRLINES: "JL",
  CATHAY_PACIFIC: "CX",
  SINGAPORE_AIRLINES: "SQ",
  UNITED_AIRLINES: "UA",
});

// Quy chuẩn hành lý mặc định hạng Phổ thông (Economy) tuyến US <-> VN khi API chỉ trả về số kiện (pieces)
export const AIRLINE_US_VN_BAGGAGE_DEFAULTS = Object.freeze({
  VN: { airlineName: "Vietnam Airlines", defaultCheckedPieces: 2, pieceWeightKg: 23, carryOnKg: 10 },
  BR: { airlineName: "EVA Air", defaultCheckedPieces: 2, pieceWeightKg: 23, carryOnKg: 7 },
  CI: { airlineName: "China Airlines", defaultCheckedPieces: 2, pieceWeightKg: 23, carryOnKg: 7 },
  JX: { airlineName: "STARLUX Airlines", defaultCheckedPieces: 2, pieceWeightKg: 23, carryOnKg: 7 },
  KE: { airlineName: "Korean Air", defaultCheckedPieces: 2, pieceWeightKg: 23, carryOnKg: 10 },
  OZ: { airlineName: "Asiana Airlines", defaultCheckedPieces: 2, pieceWeightKg: 23, carryOnKg: 10 },
  NH: { airlineName: "All Nippon Airways (ANA)", defaultCheckedPieces: 2, pieceWeightKg: 23, carryOnKg: 10 },
  JL: { airlineName: "Japan Airlines (JAL)", defaultCheckedPieces: 2, pieceWeightKg: 23, carryOnKg: 10 },
  CX: { airlineName: "Cathay Pacific", defaultCheckedPieces: 2, pieceWeightKg: 23, carryOnKg: 7 },
  SQ: { airlineName: "Singapore Airlines", defaultCheckedPieces: 2, pieceWeightKg: 23, carryOnKg: 7 },
  UA: { airlineName: "United Airlines", defaultCheckedPieces: 1, pieceWeightKg: 23, carryOnKg: 7 },
  DEFAULT: { airlineName: "International Carrier", defaultCheckedPieces: 1, pieceWeightKg: 23, carryOnKg: 7 },
});
```

#### B. Core Data Interfaces (`src/types/FlightToolTypes.ts`)

```typescript
export interface FlightWatchRule {
  ruleId: string;
  originAirportCode: string;         // VD: "SFO", "LAX", "DTW"
  destinationAirportCode: string;    // VD: "SGN", "HAN", "DAD"
  outboundDate: string;              // YYYY-MM-DD (Ngày đi)
  returnDate: string;                // YYYY-MM-DD (Ngày về khứ hồi)
  favoriteAirlines: string[];        // VD: ["VN", "BR", "KE", "JL"]
  targetPriceUsd: number;            // Mức giá kỳ vọng (VD: 950)
  minRequiredTotalBaggageKg: number; // VD: 46 (tối thiểu 2 kiện 23kg ký gửi)
}

export interface NormalizedBaggageAllowance {
  checkedPieces: number;             // Số kiện ký gửi (VD: 2)
  weightPerPieceKg: number;          // Số kg mỗi kiện (VD: 23)
  maxCheckedBaggageKg: number;       // Tổng kg ký gửi (VD: 46)
  maxCarryOnBaggageKg: number;       // Số kg xách tay (VD: 7 hoặc 10)
  totalAllowedBaggageKg: number;     // Tổng số ký tối đa được mang lên (VD: 53 hoặc 56)
  isEstimatedFromAirlineRule: boolean;
}

export interface NormalizedRoundTripFlight {
  offerId: string;
  flightSignatureKey: string;        // Khóa định danh chuyến bay để chống gửi trùng
  originAirportCode: string;
  destinationAirportCode: string;
  outboundDepartureDate: string;     // Ngày bay đi
  returnDepartureDate: string;       // Ngày bay về (Khứ hồi)
  airlineCode: string;               // VD: "BR"
  airlineName: string;               // VD: "EVA Air"
  listedTotalPriceUsd: number;       // Giá niêm yết đã gồm thuế phí
  effectivePriceWithBaggageUsd: number; // Giá sau khi cộng phí hành lý nếu thiếu kg
  baggage: NormalizedBaggageAllowance;
  stopsCountOutbound: number;
  stopsCountReturn: number;
  layoverAirports: string[];         // VD: ["TPE"]
  hasAirportChangeWarning: boolean;  // VD: true nếu phải đổi sân bay HND <-> NRT tại Tokyo
  bookingLink?: string;
  fetchedAtIso: string;
}
```

#### C. Schema cấu hình `settings.json`

```json
{
  "watchRules": [
    {
      "ruleId": "us-vn-tet-2027",
      "originAirportCode": "SFO",
      "destinationAirportCode": "SGN",
      "outboundDate": "2027-01-20",
      "returnDate": "2027-02-18",
      "favoriteAirlines": ["VN", "BR", "CI", "JX", "KE", "NH", "JL"],
      "targetPriceUsd": 980,
      "minRequiredTotalBaggageKg": 50
    }
  ],
  "flightApiConfig": {
    "provider": "amadeus",
    "amadeusBaseUrl": "https://test.api.amadeus.com",
    "amadeusClientId": "REPLACE_WITH_AMADEUS_CLIENT_ID",
    "amadeusClientSecret": "REPLACE_WITH_AMADEUS_CLIENT_SECRET",
    "requestTimeoutMs": 12000,
    "exchangeRatesToUsd": {
      "USD": 1.0,
      "VND": 0.0000395,
      "EUR": 1.08,
      "CAD": 0.73,
      "TWD": 0.031
    }
  },
  "alertConfig": {
    "priceHistoryCachePath": "./data/flight_price_history.json",
    "minAdditionalDropForReAlertUsd": 25,
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

1. **`FlightBaggageNormalizerServiceHelper.js` & `FlightOfferNormalizerService.js`**
   - `FlightBaggageNormalizerServiceHelper.convertWeightToKg(value, unit)`
     - *Mục đích:* Quy đổi trọng lượng hành lý từ `LBS` / `POUNDS` hoặc `KG` về số nguyên/thập phân `kg` chuẩn xác (`50 lbs -> 23 kg`).
   - `FlightBaggageNormalizerServiceHelper.resolveBaggageAllowance(rawBaggageInfo, airlineCode)`
     - *Mục đích:* Tính toán đầy đủ `checkedPieces`, `maxCheckedBaggageKg`, `maxCarryOnBaggageKg`, và `totalAllowedBaggageKg` (Số ký tối đa được mang lên) dựa trên dữ liệu vé kết hợp bảng quy chuẩn hãng bay US–VN.
   - `FlightOfferNormalizerService.normalizeRoundTripOffer(rawOffer, exchangeRatesToUsd)`
     - *Mục đích:* Chuẩn hóa dữ liệu chuyến bay khứ hồi từ API về cấu trúc `NormalizedRoundTripFlight` thống nhất.

2. **`FlightPriceEvaluatorService.js` & `FlightPriceEvaluatorServiceHelper.js`**
   - `FlightPriceEvaluatorServiceHelper.validateRoundTripDates(outboundDate, returnDate)`
     - *Mục đích:* Đảm bảo ngày về (`returnDate`) lớn hơn hoặc bằng ngày đi (`outboundDate`) và cả hai đều là ngày hợp lệ.
   - `FlightPriceEvaluatorServiceHelper.calculateEffectivePriceForBaggage(listedPriceUsd, baggageAllowance, minRequiredTotalBaggageKg)`
     - *Mục đích:* Nếu chuyến bay có số ký hành lý thấp hơn mức người dùng yêu cầu, tự động tính số kiện thiếu và cộng phí hành lý ước tính (`EXTRA_BAG_ESTIMATED_FEE_USD`) để không báo nhầm vé Basic Economy giá ảo.
   - `FlightPriceEvaluatorService.findMatchingDealsForRule(offers, watchRule, priceHistoryCache)`
     - *Mục đích:* Lọc các chuyến bay thuộc hãng yêu thích có giá $\le$ `targetPriceUsd` và chưa từng được thông báo ở mức giá tương đương.

3. **`FlightTelegramAlertService.js` & `FlightTelegramAlertServiceHelper.js`**
   - `FlightTelegramAlertServiceHelper.formatFlightDealMessage(flight, watchRule)`
     - *Mục đích:* Tạo tin nhắn Telegram nổi bật hiển thị đúng 3 nhóm thông tin bắt buộc: (1) Ngày bay khứ hồi (`Outbound Date ↔ Return Date`), (2) Hãng bay (`airlineName` + `airlineCode`), (3) Số ký tối đa được mang lên (`totalAllowedBaggageKg`: chi tiết Ký gửi + Xách tay), cùng mức giá giảm so với kỳ vọng.
   - `FlightTelegramAlertService.sendFlightPriceDropAlerts(deals, watchRule, telegramConfig)`
     - *Mục đích:* Gửi cảnh báo vé rẻ qua Telegram API và trả về kết quả gửi.

---

### 2.4 Ma Trận 5 Trạng Thái UX (`5 UX States Matrix`)

| Trạng thái | Điều kiện kích hoạt | Phản hồi trên Telegram / CLI Dashboard | Hành động điều hướng (CTA) |
| :--- | :--- | :--- | :--- |
| **1. Ideal State** | Tìm thấy vé khứ hồi US–VN của hãng yêu thích (VD: EVA Air / Vietnam Airlines) có giá `$890` ($\le$ mức kỳ vọng `$980`) và được mang tối đa `53kg` hành lý. | Gửi ngay tin nhắn Telegram: `✈️ [GIÁ VÉ GIẢM SÂU] SFO ↔ SGN | Hãng: EVA Air (BR) | Khứ hồi: 2027-01-20 → 2027-02-18 | Giá: $890 (Thấp hơn kỳ vọng $90) | Hành lý tối đa: 53 kg (Ký gửi: 2 kiện × 23kg = 46kg + Xách tay: 7kg)`. | Bấm nút `"Đặt vé ngay"` hoặc `"Giữ theo dõi nếu giảm thêm $25"`. |
| **2. Loading State** | Đang truy vấn giá vé khứ hồi qua các hãng yêu thích và quy đổi hành lý. | Hiển thị tiến trình: `[1/3] Đang tra cứu giá khứ hồi SFO ↔ SGN... -> [2/3] Đang quy đổi định mức hành lý (kg)... -> [3/3] Đang đối chiếu ngưỡng giá kỳ vọng $980...`. | Cho phép hủy truy vấn hoặc xem báo cáo lần quét gần nhất. |
| **3. Empty State** | Có chuyến bay US–VN nhưng tất cả các hãng yêu thích hiện đều có giá `> $980` (VD: thấp nhất đang là `$1,150`). | Không spam Telegram; Dashboard/CLI hiển thị: *"Chưa có vé dưới mức kỳ vọng $980. Giá tốt nhất hiện tại: $1,150 (STARLUX Airlines - 53kg hành lý)"*. | Gợi ý: `"Nâng ngưỡng kỳ vọng lên $1,150"` hoặc `"Tiếp tục canh giá tự động"`. |
| **4. Error State** | Ngày về nhỏ hơn ngày đi (`returnDate < outboundDate`), mã sân bay sai, hoặc API Key hết hạn. | Báo lỗi rõ ràng: `ERR_INVALID_RETURN_DATE (Ngày bay về khứ hồi phải sau ngày bay đi)` hoặc `ERR_FLIGHT_API_UNAUTHORIZED`. | Hướng dẫn sửa lại `watchRules` trong `settings.json`. |
| **5. Partial / Overflow State** | API trả về giá vé nhưng thiếu trường `weight` hành lý chi tiết (chỉ trả về `quantity: 2` kiện), hoặc chuyến bay phải đổi sân bay tại Tokyo (`HND` sang `NRT`). | Hệ thống tự động áp dụng quy chuẩn 23kg/kiện của chặng Mỹ và gắn nhãn `(Quy chuẩn hãng: 46kg ký gửi + 7kg xách tay)`; hiển thị cảnh báo vàng `⚠ Lưu ý: Chuyến bay yêu cầu đổi sân bay HND ↔ NRT tại Tokyo`. | Cho phép lọc `"Chỉ nhận vé không phải đổi sân bay quá cảnh"`. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

### 3.1 Lỗ hổng 1: Sự hỗn loạn đơn vị Hành lý (`Pieces` vs `Lbs` vs `Kg`) trên tuyến bay Mỹ – Việt Nam
- **Rủi ro thực tế:** Các API hàng không quốc tế (như Amadeus/Sabre) khi trả về vé chặng US–VN thường trả về một trong 3 kiểu không đồng nhất:
  1. Chỉ trả về số kiện: `{ quantity: 2 }` (không ghi số kg).
  2. Trả về theo đơn vị cân Anh của Mỹ: `{ weight: 50, weightUnit: "LBS" }`.
  3. Trả về theo kg: `{ weight: 23, weightUnit: "KG" }`.
  Nếu code cộng trực tiếp con số thô sẽ ra `2 kg` (sai hoàn toàn) hoặc `50 kg/kiện` (nhầm `lbs` sang `kg`).
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Trong `FlightBaggageNormalizerServiceHelper`:
    - Nếu dữ liệu có `weightUnit === "LBS"` (hoặc `"POUNDS"`), quy đổi chuẩn: `Math.round(weight * 0.45359237)` (đặc biệt `50 lbs` quy chuẩn hàng không quốc tế được làm tròn đúng bằng `23 kg`, `70 lbs` bằng `32 kg`).
    - Nếu chỉ có `quantity (pieces)` mà không có `weight`, nhân `quantity * STANDARD_US_PIECE_WEIGHT_KG (23)` và cộng thêm `carryOnKg` theo mã hãng bay trong `AIRLINE_US_VN_BAGGAGE_DEFAULTS`.

### 3.2 Lỗ hổng 2: Bẫy "Giá vé Basic Economy không hành lý" đánh lừa bộ lọc giá rẻ
- **Rủi ro thực tế:** Một hãng bay có thể tung vé Basic Economy giá `$880` (thấp hơn mức kỳ vọng `$950`), nhưng chỉ cho mang `0 kg` hoặc `1 kiện 23kg` ký gửi, trong khi vé Economy tiêu chuẩn của EVA Air giá `$940` lại có sẵn `2 kiện × 23kg = 46kg`. Nếu chỉ so sánh số tiền `$880 < $950` mà không kiểm tra số ký hành lý, người dùng mua xong ra sân bay phải đóng thêm `$150–$200` tiền hành lý, thành ra đắt hơn!
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Trong `FlightPriceEvaluatorServiceHelper.calculateEffectivePriceForBaggage`:
    - Tính `effectivePriceWithBaggageUsd`: nếu `baggage.totalAllowedBaggageKg < watchRule.minRequiredTotalBaggageKg`, tính số kiện 23kg còn thiếu và cộng `missingPieces * EXTRA_BAG_ESTIMATED_FEE_USD ($150)` vào giá vé trước khi so sánh với `targetPriceUsd`.

### 3.3 Lỗ hổng 3: Bẫy Đổi Sân Bay Quá Cảnh (`Cross-Airport Layover Trap` tại Tokyo `HND <-> NRT` hoặc Taipei `TSA <-> TPE`)
- **Rủi ro thực tế:** Nhiều vé giá rẻ từ Mỹ về Việt Nam qua Nhật Bản hạ cánh xuống sân bay **Haneda (`HND`)** nhưng chuyến bay nối tiếp về `SGN`/`HAN` lại cất cánh từ sân bay **Narita (`NRT`)** cách đó 80km. Hành khách Việt Nam nếu không có Visa nhập cảnh Nhật Bản sẽ **không thể tự xách hành lý đi tàu giữa 2 sân bay** và bị từ chối lên máy bay ngay tại Mỹ!
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Trong `FlightOfferNormalizerService`: Kiểm tra danh sách các chặng nối chuyến (`segments`). Nếu sân bay đến của chặng $i$ (`arrivalAirport`) khác với sân bay đi của chặng $i+1$ (`departureAirport`, VD: `HND !== NRT`), bắt buộc gắn cờ `hasAirportChangeWarning = true` và in dòng cảnh báo chữ in hoa trong tin nhắn Telegram: `⚠️ CẢNH BÁO: ĐỔI SÂN BAY QUÁ CẢNH (CẦN VISA NHẬP CẢNH & TỰ CHUYỂN HÀNH LÝ)`.

### 3.4 Lỗ hổng 4: Spam cảnh báo Telegram mỗi lần cron chạy khi giá vé giữ nguyên ở mức thấp
- **Rủi ro thực tế:** Khi giá vé giảm xuống `$890` (thấp hơn kỳ vọng `$980`) và giữ nguyên mức `$890` (hoặc dao động nhẹ `$889 - $891`) suốt 3 ngày, nếu cron chạy mỗi giờ một lần thì người dùng sẽ bị dội bom 72 tin nhắn Telegram giống hệt nhau.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Trong `FlightPriceEvaluatorService`: Lưu `lastNotifiedPriceUsd` cho từng `flightSignatureKey` (`airlineCode + outboundDate + returnDate + origin + destination`). Chỉ gửi thông báo lại nếu `currentEffectivePriceUsd <= lastNotifiedPriceUsd - MIN_ADDITIONAL_DROP_FOR_REALERT_USD ($25)`.

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1 Kịch Bản Kiểm Thử `Given / When / Then` (3 Tầng)

#### Tầng 1: P0 Happy Paths (Người dùng sử dụng thường xuyên nhất)
- **TC-FLT-001 (Chuẩn hóa thông tin chuyến bay US–VN: Ngày khứ hồi, Hãng bay & Quy đổi số ký hành lý):**
  - **Given:** Chuyến bay khứ hồi của hãng `EVA Air (BR)` chặng `SFO -> SGN` ngày đi `2027-01-20`, ngày về `2027-02-18`, giá `$910`, hành lý trả về `{ checkedPieces: 2, weightPerPiece: 50, weightUnit: "LBS" }`.
  - **When:** Gọi `FlightOfferNormalizerService.normalizeRoundTripOffer(rawOffer, rates)`.
  - **Then:** Trả về đối tượng chuẩn hóa với `outboundDepartureDate = "2027-01-20"`, `returnDepartureDate = "2027-02-18"`, `airlineName = "EVA Air"`, `maxCheckedBaggageKg = 46` (2 kiện × 23kg), `maxCarryOnBaggageKg = 7`, và `totalAllowedBaggageKg = 53` kg.
- **TC-FLT-002 (Phát hiện vé giảm xuống mức kỳ vọng và gửi cảnh báo Telegram đầy đủ thông tin):**
  - **Given:** Quy tắc canh vé `watchRule` có `favoriteAirlines = ["VN", "BR", "KE"]`, `targetPriceUsd = 980`, `minRequiredTotalBaggageKg = 50`, và chuyến bay `EVA Air` ở `TC-FLT-001` có giá `$910` (thấp hơn kỳ vọng `$70`).
  - **When:** Gọi `FlightPriceEvaluatorService.findMatchingDealsForRule` và `FlightTelegramAlertService.sendFlightPriceDropAlerts`.
  - **Then:** Chuyến bay được chọn làm deal hợp lệ; tin nhắn Telegram sinh ra chứa đầy đủ: Ngày đi `2027-01-20`, Ngày về `2027-02-18`, Hãng `EVA Air (BR)`, Giá `$910`, và Số ký tối đa `53 kg (46kg ký gửi + 7kg xách tay)`.

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-FLT-003 (Từ chối cấu hình ngày bay khứ hồi bất hợp lệ `returnDate < outboundDate`):**
  - **Given:** Quy tắc canh vé có `outboundDate = "2027-02-18"` nhưng `returnDate = "2027-01-20"` (ngày về trước ngày đi).
  - **When:** Gọi `FlightPriceEvaluatorServiceHelper.validateRoundTripDates`.
  - **Then:** Ném lỗi `ValidationError` với mã `ERR_INVALID_ROUND_TRIP_DATES`.
- **TC-FLT-004 (Loại bỏ hãng bay không nằm trong danh sách yêu thích hoặc giá thực tế sau khi cộng hành lý vượt mức kỳ vọng):**
  - **Given:** `watchRule` yêu cầu `favoriteAirlines = ["VN", "BR"]`, `targetPriceUsd = 950`, `minRequiredTotalBaggageKg = 46`.
    - Vé A: Hãng lạ `"XX"` giá `$800`.
    - Vé B: Hãng `"BR"` giá niêm yết `$890` nhưng `checkedPieces = 0` (chỉ có 7kg xách tay -> thiếu 2 kiện ký gửi -> cộng thêm `2 × $150 = $300` -> `effectivePrice = $1,190 > $950`).
  - **When:** Gọi `FlightPriceEvaluatorService.findMatchingDealsForRule([offerA, offerB], watchRule, cache)`.
  - **Then:** Cả Vé A và Vé B đều bị loại bỏ (`matchedDeals.length === 0`).

#### Tầng 3: Boundary & Rare Edge Cases (`0`, `-1`, `MAX`, `Empty`, `Duplicate`, `Concurrent`)
- **TC-FLT-005 (Chống gửi thông báo trùng lặp trừ khi giá giảm thêm $\ge \$25$):**
  - **Given:** Chuyến bay `VN-SFO-SGN` đã được gửi thông báo ở mức giá `$920`.
    - Lần quét 2: Giá giảm nhẹ xuống `$905` (mới giảm thêm `$15 < $25`).
    - Lần quét 3: Giá giảm sâu xuống `$890` (giảm thêm `$30 >= $25`).
  - **When:** Chạy `FlightPriceEvaluatorService.findMatchingDealsForRule` ở Lần 2 và Lần 3.
  - **Then:** Lần 2 bỏ qua không gửi thông báo lặp; Lần 3 cho phép gửi thông báo mới và cập nhật cache thành `$890`.
- **TC-FLT-006 (Phát hiện cảnh báo đổi sân bay quá cảnh `HND <-> NRT` và quy đổi tiền tệ `VND -> USD`):**
  - **Given:** Chuyến bay nối chuyến có chặng 1 hạ cánh tại `HND` (Haneda) và chặng 2 cất cánh từ `NRT` (Narita), giá trả về bằng tiền Việt `22,500,000 VND`.
  - **When:** Chuẩn hóa chuyến bay và tạo nội dung tin nhắn Telegram.
  - **Then:** Hệ thống quy đổi chính xác giá từ `VND` sang `USD`, bật cờ `hasAirportChangeWarning = true`, và chèn dòng cảnh báo đổi sân bay vào tin nhắn Telegram.

---

### 4.2 Quy Trình 5 Bước Kiểm Chứng Bề Mặt Thật Cho QA Reviewer (`5-Step Real-Surface Verification`)

1. **Bước 1 — `Launch`:**
   - Khởi tạo cấu hình từ `settings.example.json` với tuyến bay mẫu `SFO ↔ SGN` và danh sách hãng bay yêu thích US–VN.
2. **Bước 2 — `Doctor`:**
   - Kiểm tra bảng quy chuẩn hành lý `AIRLINE_US_VN_BAGGAGE_DEFAULTS`, tỷ giá quy đổi tiền tệ và tính hợp lệ của các quy tắc canh vé (`outboundDate <= returnDate`).
3. **Bước 3 — `Drive`:**
   - Chạy luồng chuẩn hóa dữ liệu chuyến bay khứ hồi, tính toán số ký hành lý tối đa (`lbs` -> `kg`, `pieces` -> `kg`), đánh giá ngưỡng giá kỳ vọng (kể cả vé thiếu hành lý và vé đổi sân bay quá cảnh), và sinh tin nhắn Telegram.
4. **Bước 4 — `Evidence`:**
   - Lưu lại đầu ra JSON của `NormalizedRoundTripFlight`, log chống gửi trùng (`flight_price_history.json`) và nội dung tin nhắn Telegram hoàn chỉnh.
5. **Bước 5 — `Cleanup`:**
   - Dọn dẹp file cache lịch sử giá tạm thời sau khi kiểm thử xong.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role Phụ Trách | File Mục Tiêu | Mô Tả Chi Tiết Hàm Cần Viết | Phụ Thuộc | Lệnh Verify & Tiêu Chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `src/constants/FlightToolConstants.js` & `settings.example.json` | Khai báo toàn bộ `FLIGHT_CONVERSION_CONSTANTS`, `FavoriteUsVnAirline`, `AIRLINE_US_VN_BAGGAGE_DEFAULTS` và file cấu hình mẫu `settings.example.json`. | *None* | Import thành công, không dùng magic numbers/strings. |
| `TASK-002` | **Developer** | `src/services/helpers/FlightBaggageNormalizerServiceHelper.js` | Viết `convertWeightToKg(value, unit)` (quy đổi chuẩn `50 lbs -> 23 kg`, `70 lbs -> 32 kg`) và `resolveBaggageAllowance(rawBaggageInfo, airlineCode)` trả về số kiện, số kg ký gửi, số kg xách tay và tổng số kg tối đa. | `TASK-001` (Hard) | Test với các đầu vào `LBS`, `KG` và chỉ có `pieces` đều trả về đúng `totalAllowedBaggageKg`. |
| `TASK-003` | **Developer** | `src/services/FlightOfferNormalizerService.js` | Viết `detectCrossAirportLayover(segments)` (phát hiện `HND <-> NRT`) và `normalizeRoundTripOffer(rawOffer, exchangeRatesToUsd)` chuẩn hóa Ngày bay khứ hồi, Hãng bay, Giá USD và Hành lý. | `TASK-002` (Hard) | Chuẩn hóa thành công offer mẫu US–VN bằng cả `USD` và `VND`. |
| `TASK-004` | **Developer** | `src/services/helpers/FlightPriceEvaluatorServiceHelper.js` | Viết `validateRoundTripDates`, `calculateEffectivePriceForBaggage` (cộng phí nếu thiếu kg hành lý), và `shouldTriggerPriceAlert` (kiểm tra hãng yêu thích, mức giá kỳ vọng và ngưỡng giảm thêm `$25`). | `TASK-001` (Hard) | Vé Basic Economy thiếu hành lý được cộng đúng phí trước khi so sánh với `targetPriceUsd`. |
| `TASK-005` | **Developer** | `src/services/FlightPriceEvaluatorService.js` | Viết `findMatchingDealsForRule(offers, watchRule, priceHistoryCache)` và `updatePriceHistoryCache(notifiedDeals, priceHistoryCache)` để lọc vé rẻ và chống spam thông báo lặp. | `TASK-003`, `TASK-004` (Hard) | Lọc đúng các chuyến bay thỏa mãn điều kiện và chặn thông báo lặp khi giá chưa giảm thêm `$25`. |
| `TASK-006` | **Developer** | `src/services/helpers/FlightTelegramAlertServiceHelper.js` & `src/services/FlightTelegramAlertService.js` | Viết `formatFlightDealMessage` (hiển thị rõ Ngày đi – Ngày về khứ hồi, Hãng bay, Số ký hành lý tối đa mang lên, Giá giảm & Cảnh báo đổi sân bay nếu có) và `sendFlightPriceDropAlerts`. | `TASK-001`, `TASK-003` (Hard) | Tin nhắn Telegram sinh ra đầy đủ 100% trường thông tin theo yêu cầu. |
| `TASK-007` | **Developer** | `src/services/FlightProviderAdapterService.js` | Viết adapter truy vấn dữ liệu chuyến bay khứ hồi từ API hàng không (Amadeus / Mock Feed) với xử lý timeout và rate limit an toàn. | `TASK-001`, `TASK-003` (Hard) | Xử lý mượt cả khi API trả về dữ liệu hợp lệ lẫn khi lỗi mạng/timeout. |
| `TASK-008` | **Developer** | `src/services/CheapFlightOrchestratorService.js` | Viết `runFlightWatchCycle(settings)` kết nối toàn bộ luồng: `Validate Rules -> Fetch Offers -> Normalize & Convert Baggage Kg -> Evaluate Target Price -> Send Telegram Alert -> Save History`. | `TASK-005`, `TASK-006`, `TASK-007` (Hard) | Chạy trọn vẹn 1 chu kỳ canh vé khứ hồi US–VN trả về báo cáo tổng kết. |
| `TASK-009` | **Test Engineer** | `tests/unit/BaggageAndPriceEvaluator.test.js` | Viết Unit Test kiểm thử quy đổi hành lý (`lbs`/`pieces` -> `kg`), kiểm tra ngày khứ hồi, cộng phí vé thiếu hành lý và chống gửi trùng thông báo (`TC-FLT-001`, `003`, `004`, `005`). | `TASK-002`, `TASK-004`, `TASK-005` (Hard) | Toàn bộ unit test pass 100%. |
| `TASK-010` | **Test Engineer** | `tests/integration/CheapFlightPipeline.test.js` | Viết Integration Test kiểm thử toàn bộ luồng canh vé US–VN, phát hiện đổi sân bay quá cảnh `HND <-> NRT`, quy đổi tiền tệ `VND -> USD` và xuất thông báo Telegram (`TC-FLT-002`, `006`). | `TASK-008` (Hard) | Toàn bộ test suite pass 100% và sinh bằng chứng QA trace. |
