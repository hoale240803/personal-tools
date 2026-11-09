# Tài Liệu Đặc Tả Thực Thi (Dev-Ready & Test-Ready): Best Buy Supplies Tool (`best-buy-supplies-tool`)

> **Phiên bản:** 1.0.0  
> **Đơn vị lập đặc tả:** AISE Squad 2 (`intake` + `ba` + `requirement_challenger` + `orchestrator` + `estimator_cost_controller`)  
> **Nguồn dữ liệu gốc:** `idea/best-buy-supplies-tool/requirement.md`, `manifest.json`, `background.js`, `content.js`, `popup.js`  
> **Mục tiêu hệ thống:** Hệ thống kép gồm 2 phân hệ tích hợp chặt chẽ:
> 1. **Phân hệ 1 (Smart Grocery & Weekly Meal Optimizer):** Lên thực đơn tuần (7 ngày × 3 bữa/ngày × tối thiểu 3 món/bữa cho `X` người ăn + gia vị), bóc tách danh sách nguyên liệu kèm link mua (Costco, Kroger, Meijer, Target, Weee!...) và giải bài toán tối ưu chọn ra **tối đa 3 cửa hàng có tổng chi phí rẻ nhất**.
> 2. **Phân hệ 2 (Manifest V3 Price Scraper Chrome Extension):** Extension chạy ngầm quản lý hàng đợi URL (Amazon, Temu...), mở tab ẩn (`active: false`), cào Tên & Giá hiện tại so với Giá mua gần nhất, tự động đóng tab chống tràn RAM và đồng bộ JSON về Admin API.

---

## PHẦN 1 — INTAKE & PHÂN LOẠI (`intake`)

### 1.1 Bảng Phân Tách Yêu Cầu (`Stated Facts` / `Explicit Assumptions` / `Clarification Questions`)

| Phân loại | Mã tham chiếu | Nội dung chi tiết | Nguồn / Lý do kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-001` | Quản lý danh sách đồ cần mua gồm: Tên sản phẩm, Nguồn (Website URL, Google Maps URL), Giá hiện tại (`currentPrice`), Giá mua gần nhất (`lastPurchasedPrice`). | `requirement.md` (L1-5) |
| **Stated Fact** | `SF-002` | Tính năng đi chợ: Lên thực đơn nấu ăn cho 1 tuần (7 ngày), mỗi ngày 3 bữa (Sáng, Trưa, Tối), mỗi bữa có **ít nhất 3 món** (Món chính, Món canh/rau, Món phụ/tráng miệng), định lượng vừa đủ cho `X` người ăn tùy gia đình, kèm danh sách Gia vị (`Spices/Condiments`). | `requirement.md` (L8-11) |
| **Stated Fact** | `SF-003` | Tự động tổng hợp danh sách nguyên liệu cần mua từ thực đơn tuần kèm link mua tại các hệ thống: Costco, Kroger, Meijer, Target, Chợ Weee!... và tính toán lọc ra **3 nơi cần mua với mức giá rẻ nhất**. | `requirement.md` (L13-16) |
| **Stated Fact** | `SF-004` | Chrome Extension (Manifest V3) có `permissions: ["tabs", "storage", "scripting"]`, `host_permissions` cho Amazon & Temu; `background.js` nhận mảng URL, mở tab ẩn tuần tự (`active: false`), cào dữ liệu qua `chrome.scripting.executeScript` / `content.js`, đóng tab ngay (`chrome.tabs.remove`) với timeout `15,000ms` và gửi POST JSON về `API_ENDPOINT`. | `requirement.md` (L22-53), `manifest.json`, `background.js`, `content.js`, `popup.js` |
| **Explicit Assumption** | `EA-001` | **Thuật toán tối ưu 3 cửa hàng rẻ nhất (`Top-3 Store Basket Optimizer`):** Một giỏ hàng tuần có thể gồm 30–50 nguyên liệu nằm rải rác ở 6–8 siêu thị. Việc đi đủ 6 siêu thị tốn xăng và thời gian. Hệ thống sẽ tìm **tổ hợp tối đa 3 cửa hàng** ($S_1, S_2, S_3$) sao cho: (1) Độ phủ nguyên liệu đạt tối đa (100% nguyên liệu có hàng), và (2) Tổng chi phí mua các nguyên liệu tại 3 cửa hàng đó là nhỏ nhất. | Hiện thực hóa chính xác câu *"cân đo đong đếm xem với cái list cần mua như vậy thì lọc ra 3 nơi cần mua với mức giá rẻ nhất"*. |
| **Explicit Assumption** | `EA-002` | **Chuẩn hóa đơn vị định lượng (`Unit Normalization`):** Công thức nấu ăn tính theo `gram / ml / quả`, còn siêu thị bán theo `lb / oz / pack` (đặc biệt Costco bán sỉ đóng gói lớn). Hệ thống quy đổi về đơn vị chuẩn (`standardUnit: "g" | "ml" | "unit"`) và tính cả **Cost Per Unit** lẫn **Out-of-Pocket Package Price**. | Tránh lỗi so sánh khập khiễng giữa bịch thịt 5 lbs ở Costco và khay 1 lb ở Kroger. |
| **Explicit Assumption** | `EA-003` | **Khắc phục lỗi kiến trúc hiện có trong `background.js` và `content.js` gốc:** Hiện tại code mẫu đang bị **nhân đôi logic cào** ở cả `background.js` (`scrapePageData` dòng 201) lẫn `content.js` (`runScraper` dòng 130) và dùng biến toàn cục `let urlQueue = []` trong Service Worker (sẽ bị mất sạch khi Chrome MV3 hủy Service Worker sau 30s idle). Bản đặc tả này yêu cầu hợp nhất bộ parser và lưu trạng thái hàng đợi vào `chrome.storage.local` + cấu hình qua `settings.json`. | Chốt chặn lỗi mất dữ liệu và vi phạm DRY trong code gốc. |
| **Clarification Question** | `CQ-001` | **Câu hỏi:** Khi so sánh tổng chi phí giữa tổ hợp 3 siêu thị (VD: Costco + Kroger + Weee!), hệ thống tối ưu theo **Tổng số tiền thanh toán thực tế tại quầy (Out-of-Pocket Bill)** hay **Đơn giá trên mỗi gram sử dụng (Unit Cost)**?<br>- **Option A (Khuyến nghị):** Hỗ trợ cả 2 chế độ, mặc định là `OUT_OF_POCKET_TOTAL` (số tiền thực trả cho giỏ hàng tuần) kèm hiển thị `Unit Savings` (phần nguyên liệu dư dùng cho tuần sau).<br>- **Option B:** Chỉ tính theo đơn giá `$/100g`. | Khuyến nghị **Option A** để sát thực tế tài chính gia đình nhất. |

### 1.2 Nhãn Bảo Mật, Tuân Thủ & Rủi Ro (`Security & Compliance Tags`)

- **[COMPLIANCE-ANTI-BOT]:** Khi Chrome Extension mở tab Amazon/Temu, nếu trang trả về màn hình CAPTCHA (`"Enter the characters you see below"`, `"Robot Check"`, hoặc challenge của Temu), script **tuyệt đối không** tự động giải CAPTCHA. Thay vào đó, hệ thống trả về trạng thái `CAPTCHA_DETECTED_HANDOFF_REQUIRED`, giữ nguyên hoặc thông báo cho người dùng xác thực thủ công (`browser_handoff`) và thêm độ trễ ngẫu nhiên (`JITTER_DELAY_MS: 2000-5000ms`) giữa các tab để không bị khóa IP.
- **[SECURITY-SECRETS]:** Thay thế biến hardcode `const API_ENDPOINT = "YOUR_API_HERE"` trong `background.js` bằng cơ chế đọc từ `settings.json` / `chrome.storage.local` có xác thực `apiSecretToken`.

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1 Bảng Yêu Cầu Nghiệp Vụ Có Mã Truy Vết (`REQ-001` .. `REQ-010`)

| Mã REQ | Tên Yêu Cầu | Mô tả nghiệp vụ chi tiết | Truy vết nguồn | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | **Supply Watchlist & Price History Tracker** | Quản lý danh sách mặt hàng cần mua với: Tên sản phẩm, Nguồn (`Website URL`, `Google Maps URL`), `currentPrice`, `lastPurchasedPrice`, tính chênh lệch giá (`priceDeltaUsd`, `priceDeltaPct`) và cảnh báo khi giá tăng/giảm. | `requirement.md` L1-5 | `P0 Must-Have` |
| `REQ-002` | **Weekly Meal Planner (7×3×3 Engine)** | Sinh và quản lý thực đơn 7 ngày trong tuần; mỗi ngày đủ 3 bữa (`BREAKFAST`, `LUNCH`, `DINNER`); mỗi bữa bắt buộc có **ít nhất 3 món**; tự động nhân hệ số khẩu phần theo số người ăn `familySize (X)`. | `requirement.md` L8-10 | `P0 Must-Have` |
| `REQ-003` | **Ingredient & Spice Aggregation Engine** | Tự động bóc tách toàn bộ nguyên liệu tươi sống và Gia vị (`Spices/Condiments`) từ 21 bữa ăn trong tuần, gộp các nguyên liệu trùng nhau (VD: hành lá, thịt bò, nước mắm dùng ở nhiều bữa) thành một `AggregatedShoppingList` kèm link mua. | `requirement.md` L11-14 | `P0 Must-Have` |
| `REQ-004` | **Top-3 Cheapest Stores Combinatorial Optimizer** | Duyệt báo giá của các siêu thị (Costco, Kroger, Meijer, Target, Weee!, Amazon, Temu) và tìm ra **tổ hợp tối đa 3 nơi mua** có tổng chi phí giỏ hàng rẻ nhất, phân bổ rõ món nào mua ở cửa hàng nào. | `requirement.md` L14-16 | `P0 Must-Have` |
| `REQ-005` | **MV3 Sequential Background Tab Queue** | Service Worker (`background.js`) nhận danh sách URL từ Admin Web hoặc Popup, đưa vào hàng đợi bền vững (`chrome.storage.local`), mở từng tab ẩn (`active: false`), chờ tải xong và thu thập dữ liệu. | `requirement.md` L34-38; `background.js` L82-167 | `P0 Must-Have` |
| `REQ-006` | **Guaranteed Tab Cleanup & 15s Timeout Guard** | Mỗi tab ẩn mở ra phải có bộ đếm timeout cấu hình được (mặc định `15,000ms`). Ngay khi cào xong hoặc khi hết timeout/lỗi, phải gọi `chrome.tabs.remove(tabId)` để giải phóng RAM tuyệt đối. | `requirement.md` L24, 38, 53; `background.js` L128-136, L335-344 | `P0 Must-Have` |
| `REQ-007` | **Unified Multi-Store DOM Scraper (`Amazon` & `Temu`)** | Trích xuất chính xác `title`, `rawPriceText`, `parsedPriceUsd`, `currency`, và phát hiện trạng thái `isOutOfStock` hoặc `isCaptchaBlocked` trên Amazon và Temu bằng bộ selector phân tầng + fallback an toàn. | `requirement.md` L41-46; `content.js` L42-124 | `P0 Must-Have` |
| `REQ-008` | **Admin API Webhook Sync & Retry** | Gom toàn bộ kết quả cào được sau khi hoàn tất hàng đợi và gửi HTTP `POST` JSON tới `apiEndpoint` cấu hình trong `settings.json`, kèm cơ chế lưu dự phòng nếu API đích tạm thời offline. | `requirement.md` L39; `background.js` L349-377 | `P1 Should-Have` |
| `REQ-009` | **Extension Popup Test Console** | Giao diện `popup.html` & `popup.js` cho phép nhập danh sách URL, bấm "Bắt đầu quét", xem thanh tiến trình (`Progress Bar`), thống kê `Total / Success / Error`, và copy JSON kết quả. | `requirement.md` L48-50; `popup.js` L1-237 | `P1 Should-Have` |
| `REQ-010` | **Pantry Deduction & Google Maps Store Route Link** | Cho phép đánh dấu các gia vị/nguyên liệu đã có sẵn trong tủ bếp (`inPantry: true`) để trừ khỏi giỏ hàng cần mua và xuất link Google Maps chỉ đường qua 3 siêu thị đã chọn. | `requirement.md` L3, L11-16 | `P2 Nice-to-Have` |

---

### 2.2 Data Structures, Constants & `settings.json` Schema (No Magic Numbers / Strings)

#### A. Bảng `CONSTANTS` & `ENUMS` (`src/constants/SuppliesToolConstants.js`)

```javascript
export const MEAL_PLAN_CONSTANTS = Object.freeze({
  DAYS_PER_WEEK: 7,
  MEALS_PER_DAY: 3,
  MIN_DISHES_PER_MEAL: 3,
  MIN_FAMILY_SIZE: 1,
  MAX_FAMILY_SIZE: 20,
  MAX_SELECTED_STORES: 3, // Lọc ra tối đa 3 nơi mua rẻ nhất theo requirement
});

export const MealSlot = Object.freeze({
  BREAKFAST: "BREAKFAST",
  LUNCH: "LUNCH",
  DINNER: "DINNER",
});

export const IngredientCategory = Object.freeze({
  PROTEIN: "PROTEIN",
  VEGETABLE: "VEGETABLE",
  CARB_GRAIN: "CARB_GRAIN",
  SPICE_CONDIMENT: "SPICE_CONDIMENT",
  DAIRY_EGG: "DAIRY_EGG",
  HOUSEHOLD_SUPPLY: "HOUSEHOLD_SUPPLY",
});

export const SupportedStoreId = Object.freeze({
  COSTCO: "COSTCO",
  KROGER: "KROGER",
  MEIJER: "MEIJER",
  TARGET: "TARGET",
  WEEE: "WEEE",
  AMAZON: "AMAZON",
  TEMU: "TEMU",
});

export const SCRAPER_CONSTANTS = Object.freeze({
  DEFAULT_TAB_TIMEOUT_MS: 15000,
  DOM_SETTLE_DELAY_MS: 1000,
  INTER_TAB_MIN_DELAY_MS: 1500,
  INTER_TAB_MAX_DELAY_MS: 3500,
  MAX_CONCURRENT_TABS: 1,
  MAX_QUEUE_BATCH_SIZE: 100,
  STORAGE_KEYS: {
    QUEUE_STATE: "bbs_queue_state",
    LAST_RESULTS: "lastResults",
    SETTINGS: "bbs_settings",
  },
  MESSAGE_ACTIONS: {
    START_SCRAPING: "START_SCRAPING",
    STOP_SCRAPING: "STOP_SCRAPING",
    GET_STATUS: "GET_STATUS",
    SCRAPE_RESULT: "SCRAPE_RESULT",
  },
});
```

#### B. Core Data Interfaces (`src/types/SuppliesToolTypes.ts`)

```typescript
export interface SupplyItemRecord {
  itemId: string;
  name: string;
  category: string;                  // IngredientCategory
  sourceUrl: string;                 // Website URL
  googleMapsUrl?: string;            // Link vị trí cửa hàng trên Google Maps
  storeId: string;                   // SupportedStoreId
  currentPriceUsd: number | null;
  lastPurchasedPriceUsd: number | null;
  unitSize: number;                  // VD: 1000 (gram)
  unitMeasure: "g" | "ml" | "unit";
  lastUpdatedIso: string;
}

export interface DishRecipe {
  dishId: string;
  dishName: string;
  baseServings: number;              // Định lượng gốc (VD: chuẩn cho 4 người)
  ingredients: Array<{
    ingredientId: string;
    name: string;
    category: string;                // Bao gồm SPICE_CONDIMENT (Gia vị)
    quantityForBaseServings: number;
    unitMeasure: "g" | "ml" | "unit";
  }>;
}

export interface DailyMealPlan {
  dayIndex: number;                  // 1..7 (Thứ Hai .. Chủ Nhật)
  meals: {
    BREAKFAST: DishRecipe[];         // Bắt buộc length >= 3
    LUNCH: DishRecipe[];             // Bắt buộc length >= 3
    DINNER: DishRecipe[];            // Bắt buộc length >= 3
  };
}

export interface StoreCombinationOptimizationResult {
  selectedStores: string[];          // Tối đa 3 cửa hàng, VD: ["COSTCO", "MEIJER", "WEEE"]
  totalEstimatedCostUsd: number;
  savingsVsLastPurchasedUsd: number;
  coveragePct: number;               // % số nguyên liệu mua được
  storeAllocation: Record<string, Array<{
    ingredientId: string;
    name: string;
    requiredQuantity: number;
    unitMeasure: string;
    assignedPriceUsd: number;
    productUrl: string;
    googleMapsUrl?: string;
  }>>;
  unfulfilledIngredients: string[];
}

export interface ScrapedProductPayload {
  url: string;
  source: "amazon" | "temu" | "unknown";
  title: string | null;
  rawPriceText: string | null;
  parsedPriceUsd: number | null;
  timestamp: string;
  success: boolean;
  errorCode?: "TIMEOUT" | "CAPTCHA_BLOCKED" | "SELECTOR_NOT_FOUND" | "TAB_CRASHED";
  errorMessage?: string;
}
```

#### C. Schema cấu hình `settings.json`

```json
{
  "adminApi": {
    "apiEndpoint": "https://script.google.com/macros/s/REPLACE_WITH_DEPLOYMENT_ID/exec",
    "apiSecretToken": "REPLACE_WITH_ADMIN_API_SECRET",
    "requestTimeoutMs": 10000,
    "enableAutoSyncAfterScrape": true
  },
  "scraperConfig": {
    "tabTimeoutMs": 15000,
    "domSettleDelayMs": 1000,
    "interTabMinDelayMs": 1500,
    "interTabMaxDelayMs": 3500,
    "maxConcurrentTabs": 1,
    "abortOnCaptcha": true
  },
  "mealOptimizerConfig": {
    "defaultFamilySize": 4,
    "maxStoresToVisit": 3,
    "minDishesPerMeal": 3,
    "includeSpicesInShoppingList": true,
    "preferredStores": ["COSTCO", "KROGER", "MEIJER", "TARGET", "WEEE"]
  }
}
```

---

### 2.3 Kiến Trúc Service & Helper (Rule 4 & Single Responsibility Principle)

1. **`WeeklyMealPlannerService.js` & `WeeklyMealPlannerServiceHelper.js`**
   - `WeeklyMealPlannerServiceHelper.validateMealPlanConstraints(weeklyPlan, familySize)`
     - *Mục đích:* Kiểm tra nghiêm ngặt thực đơn đủ 7 ngày, mỗi ngày đủ 3 bữa, mỗi bữa có `>= 3` món ăn và `familySize >= 1`.
   - `WeeklyMealPlannerServiceHelper.aggregateAndScaleIngredients(weeklyPlan, familySize, pantryItemIds)`
     - *Mục đích:* Quy đổi định lượng từng nguyên liệu và gia vị theo tỷ lệ `familySize / dish.baseServings`, gộp các nguyên liệu trùng tên và trừ đi lượng đã có sẵn trong bếp.
   - `WeeklyMealPlannerService.buildWeeklyShoppingRequirement(weeklyPlan, familySize, pantryItemIds)`
     - *Mục đích:* Điều phối việc kiểm tra thực đơn tuần và xuất ra danh sách nguyên liệu + gia vị tổng hợp cần mua.

2. **`BestStoreCombinationService.js` & `BestStoreCombinationServiceHelper.js`**
   - `BestStoreCombinationServiceHelper.generateStoreSubsets(storeIds, maxStores = 3)`
     - *Mục đích:* Sinh tất cả các tổ hợp từ 1 đến `maxStores (3)` cửa hàng từ danh sách các siêu thị khả dụng (Costco, Kroger, Meijer, Target, Weee!...).
   - `BestStoreCombinationServiceHelper.evaluateBasketCostForSubset(requiredIngredients, storeCatalogMap, storeSubset)`
     - *Mục đích:* Với một tổ hợp $\le 3$ cửa hàng cố định, chọn cửa hàng có giá rẻ nhất trong tổ hợp đó cho từng nguyên liệu, tính tổng tiền thanh toán, độ phủ (`coveragePct`) và mức chênh lệch so với `lastPurchasedPriceUsd`.
   - `BestStoreCombinationService.findTopThreeCheapestStores(requiredIngredients, storeCatalogMap, maxStores = 3)`
     - *Mục đích:* Trả về phương án phân bổ mua sắm tại tối đa 3 cửa hàng có độ phủ cao nhất và tổng chi phí thấp nhất.

3. **`TabScraperQueueService.js` & `TabScraperQueueServiceHelper.js`**
   - `TabScraperQueueServiceHelper.sanitizeAndValidateUrls(rawUrls)`
     - *Mục đích:* Lọc bỏ URL rỗng, sai định dạng giao thức hoặc trùng lặp trước khi đưa vào hàng đợi; giới hạn theo `MAX_QUEUE_BATCH_SIZE`.
   - `TabScraperQueueServiceHelper.computeJitterDelayMs(minMs, maxMs)`
     - *Mục đích:* Sinh thời gian nghỉ ngẫu nhiên giữa 2 lần mở tab để tránh bị hệ thống chống bot của Amazon/Temu phát hiện.
   - `TabScraperQueueService.processUrlQueue(urls, settings)`
     - *Mục đích:* Quản lý vòng đời mở tab ẩn (`active: false`), gắn bộ đếm timeout `15,000ms`, thu hồi tab (`cleanupTab`) trong khối `finally` và lưu tiến độ vào `chrome.storage.local`.

4. **`ProductDomParserService.js` & `ProductDomParserServiceHelper.js`**
   - `ProductDomParserServiceHelper.parsePriceStringToNumber(rawPriceText)`
     - *Mục đích:* Chuyển chuỗi giá phức tạp (`"$1,299.99"`, `"$12.49 - $18.99"`, `"US $4.98"`) thành số thực `1299.99` hoặc `12.49` (lấy mức giá mua thực tế đầu tiên).
   - `ProductDomParserServiceHelper.detectAntiBotOrCaptchaPage(documentTitle, bodyText)`
     - *Mục đích:* Phát hiện trang chặn robot của Amazon/Temu để dừng cào ngay và báo `CAPTCHA_BLOCKED`.
   - `ProductDomParserService.extractProductFromDom(doc, pageUrl)`
     - *Mục đích:* Hàm dùng chung duy nhất (loại bỏ sự trùng lặp giữa `background.js` và `content.js`) để bóc tách `title`, `rawPriceText`, `parsedPriceUsd` trên Amazon và Temu.

---

### 2.4 Ma Trận 5 Trạng Thái UX (`5 UX States Matrix`)

| Trạng thái | Điều kiện kích hoạt | Phản hồi giao diện (Meal Planner UI & Extension Popup) | Hành động điều hướng (CTA) |
| :--- | :--- | :--- | :--- |
| **1. Ideal State** | Thực đơn tuần đủ 7×3×3 món; tìm được tổ hợp 3 siêu thị phủ 100% nguyên liệu; Extension quét thành công 100% URL. | Hiển thị **Top 3 Siêu Thị Rẻ Nhất** (VD: Costco + Meijer + Weee!) kèm tổng tiền, số tiền tiết kiệm được so với `lastPurchasedPrice`, danh sách món cần mua tại từng nơi; Popup hiện badge xanh `Hoàn tất` và JSON đầy đủ. | Nút "Mở link mua hàng theo từng siêu thị", "Xuất lộ trình Google Maps", hoặc "Copy JSON / Đồng bộ Admin API". |
| **2. Loading State** | Đang tính toán tối ưu giỏ hàng hoặc Extension đang mở tab ẩn quét từng URL trong hàng đợi. | Popup hiển thị badge vàng `Đang quét...`, spinner quay, thanh `Progress Bar` cập nhật trực tiếp theo từng tab hoàn tất (`3 / 10 URLs`), khóa nút `Bắt đầu quét` để tránh bấm đúp. | Nút "Dừng quét & Đóng tab ẩn ngay (`Stop & Cleanup`)" để người dùng chủ động hủy nếu muốn. |
| **3. Empty State** | Người dùng chưa thêm món ăn vào thực đơn tuần hoặc bấm quét khi ô nhập URL trống/không có URL hợp lệ. | Meal Planner hiện gợi ý *"Chưa có thực đơn tuần — Bấm tạo thực đơn mẫu 7 ngày cho gia đình 4 người"*; Popup hiện toast đỏ `"❌ Vui lòng nhập ít nhất 1 URL hợp lệ!"`. | Nút "Điền URL mẫu (Amazon & Temu)" hoặc "Tạo Thực Đơn Tuần Mẫu". |
| **4. Error State** | Tất cả URL bị lỗi mạng, gặp CAPTCHA của Amazon/Temu, hoặc `API_ENDPOINT` trả về HTTP 500. | Popup hiển thị badge đỏ `Lỗi`, thống kê số lượng `Error`, hiển thị mã lỗi cụ thể (`TIMEOUT_15S`, `CAPTCHA_BLOCKED`) cho từng URL mà không làm treo toàn bộ extension. | Nút "Mở tab hiển thị để xác thực thủ công (`browser_handoff`)" hoặc "Thử gửi lại kết quả về API". |
| **5. Partial / Overflow State** | Giỏ hàng có 40 nguyên liệu nhưng 3 siêu thị rẻ nhất chỉ có 38 món (thiếu 2 gia vị đặc thù); hoặc 8/10 URL cào thành công, 2 URL bị timeout. | Meal Planner hiển thị rõ 38/40 món tại 3 siêu thị chính và tách riêng mục `⚠ 2 nguyên liệu chưa có báo giá / cần mua lẻ`; Popup hiển thị `Success: 8 | Error: 2` kèm kết quả từng phần. | Nút "Thay thế nguyên liệu tương đương" hoặc "Quét lại riêng các URL bị lỗi (`Retry Failed URLs`)". |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

### 3.1 Lỗ hổng 1: Rò rỉ bộ nhớ Tab (`Orphaned Background Tabs`) & Chết Service Worker trong Manifest V3
- **Rủi ro thực tế:** Trong `background.js` hiện tại:
  1. Biến `urlQueue`, `scrapedResults`, `activeTabMap` được lưu trong RAM của Service Worker. Trong Manifest V3, Chrome có thể hủy Service Worker bất cứ lúc nào nếu không có sự kiện trong 30 giây, làm mất trắng kết quả đang quét dở và để lại các tab ẩn không ai đóng (`Orphaned Tabs`).
  2. Sự kiện `chrome.tabs.onUpdated` có thể bắn `status === "complete"` nhiều lần cho cùng một tab (do iframe hoặc redirect), khiến `handleTabLoaded` bị gọi lặp 2–3 lần trên cùng 1 tab.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Thêm cờ `isProcessingLoaded: boolean` vào mỗi entry trong `activeTabMap`. Ngay lần đầu tiên nhận `changeInfo.status === "complete"`, khóa `entry.isProcessingLoaded = true` để chặn tuyệt đối việc gọi `executeScript` lần 2 trên cùng 1 tab.
  - Lưu danh sách `activeManagedTabIds` vào `chrome.storage.local`. Khi Service Worker khởi động lại (`onStartup` / khởi tạo script), chạy ngay hàm `sweepOrphanedScraperTabs()` để đóng toàn bộ các tab ẩn bị bỏ rơi từ phiên trước.

### 3.2 Lỗ hổng 2: Sai lệch Giá Cào Được trên Amazon & Temu (Lấy nhầm giá gạch bỏ / Giá phụ kiện / Chuỗi chưa chuẩn hóa)
- **Rủi ro thực tế:**
  1. Trong `content.js` (dòng 302): Fallback của Temu quét toàn bộ `document.querySelectorAll("*")` và lấy phần tử đầu tiên khớp `/^\$[\d.,]+$/`. Trên trang Temu, phần tử `$` đầu tiên trong DOM thường là banner *"Giảm $5.00 cho đơn đầu"* hoặc giá gạch bỏ (List Price), không phải giá bán thực tế!
  2. Giá trả về đang là chuỗi thô (`"$24.99"`) nên không thể đem vào công thức toán học so sánh với `lastPurchasedPrice` hoặc tối ưu giỏ hàng.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Trong `ProductDomParserServiceHelper`:
    - Loại bỏ các phần tử nằm trong thẻ `<del>`, `<s>`, hoặc có class chứa `strike`, `old-price`, `list-price`, `coupon`, `banner` trước khi lấy giá fallback.
    - Bắt buộc trả về cả `rawPriceText: "$24.99"` và `parsedPriceUsd: 24.99` (kiểu `number`). Nếu không parse được số dương hợp lệ (`parsedPriceUsd <= 0` hoặc `isNaN`), đánh dấu `success: false, errorCode: "SELECTOR_NOT_FOUND"`.

### 3.3 Lỗ hổng 3: Bùng nổ tổ hợp & Bẫy "Rẻ 1 món nhưng đi 7 nơi" trong bài toán Đi Chợ Tuần
- **Rủi ro thực tế:** Nếu tìm nơi rẻ nhất cho từng nguyên liệu độc lập, người dùng sẽ phải chạy qua 7 siêu thị khác nhau để mua 21 bữa ăn. Ngược lại, nếu một siêu thị không bán món đặc thù (VD: Costco không bán nước mắm Việt Nam hay rau thơm như Weee!), tổ hợp đó sẽ bị thiếu nguyên liệu nấu ăn.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Trong `BestStoreCombinationService`:
    - Chốt cứng ràng buộc `storeSubset.length <= MAX_SELECTED_STORES (3)`.
    - Hàm mục tiêu xếp hạng các tổ hợp $\le 3$ siêu thị theo thứ tự ưu tiên từ điển (Lexicographical Optimization):
      1. **Ưu tiên 1:** Tối đa hóa số lượng nguyên liệu mua được (`coveragePct` cao nhất).
      2. **Ưu tiên 2:** Tối thiểu hóa tổng số tiền thanh toán (`totalEstimatedCostUsd` thấp nhất).
      3. **Ưu tiên 3:** Tối thiểu hóa số lượng cửa hàng phải ghé (`selectedStores.length` nhỏ nhất nếu tổng tiền bằng nhau).

### 3.4 Lỗ hổng 4: Không đồng bộ tiến trình Real-time giữa `popup.js` và `background.js`
- **Rủi ro thực tế:** Trong `popup.js` (dòng 57–75), thanh tiến trình gọi `updateProgress(0, totalUrls)` lúc bắt đầu rồi nhảy vọt lên `updateProgress(totalUrls, totalUrls)` khi toàn bộ mảng URL đã quét xong. Nếu người dùng đóng popup giữa chừng rồi mở lại khi background đang quét, popup không biết tiến trình đang chạy và cho phép bấm quét lại gây lỗi.
- **Chốt chặn kỹ thuật trong code (`Code Guard`):**
  - Khi `popup.js` khởi tạo (`DOMContentLoaded`), bắt buộc gọi `GET_STATUS` tới `background.js`. Nếu `isRunning === true`, chuyển ngay UI sang trạng thái đang chạy và bật bộ đếm cập nhật tiến độ mỗi `1,000ms` cho tới khi hoàn tất.

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1 Kịch Bản Kiểm Thử `Given / When / Then` (3 Tầng)

#### Tầng 1: P0 Happy Paths (Người dùng sử dụng thường xuyên nhất)
- **TC-BBS-001 (Lên thực đơn tuần 7×3×3 và tổng hợp nguyên liệu + gia vị theo số người ăn):**
  - **Given:** Thực đơn 7 ngày (mỗi ngày 3 bữa Sáng/Trưa/Tối, mỗi bữa 3 món chuẩn cho 4 người) và gia đình người dùng có `familySize = 6` người.
  - **When:** Gọi `WeeklyMealPlannerService.buildWeeklyShoppingRequirement(weeklyPlan, 6, [])`.
  - **Then:** Hệ thống xác nhận thực đơn hợp lệ (đủ 21 bữa, $\ge 63$ lượt món), nhân toàn bộ định lượng nguyên liệu và gia vị với hệ số `1.5` (`6 / 4`), và gộp chính xác các nguyên liệu trùng nhau thành một danh sách duy nhất.
- **TC-BBS-002 (Tối ưu lọc ra 3 siêu thị có tổng mức giá rẻ nhất):**
  - **Given:** Danh sách 10 nguyên liệu cần mua và bảng giá từ 5 nơi (`COSTCO`, `KROGER`, `MEIJER`, `TARGET`, `WEEE`), trong đó tổ hợp `COSTCO + MEIJER + WEEE` phủ đủ 10/10 món với tổng giá `$112.50` (rẻ nhất trong mọi tổ hợp $\le 3$ nơi).
  - **When:** Gọi `BestStoreCombinationService.findTopThreeCheapestStores(ingredients, storeCatalogMap, 3)`.
  - **Then:** Trả về đúng `selectedStores = ["COSTCO", "MEIJER", "WEEE"]`, `totalEstimatedCostUsd = 112.50`, `coveragePct = 100`, kèm danh sách phân bổ món ăn và link mua cho từng siêu thị.
- **TC-BBS-003 (Chrome Extension mở tab ẩn tuần tự, cào giá Amazon/Temu và đóng tab ngay):**
  - **Given:** Danh sách 2 URL hợp lệ (1 Amazon, 1 Temu) được gửi qua message `START_SCRAPING`.
  - **When:** `TabScraperQueueService.processUrlQueue` thực thi.
  - **Then:** Mở lần lượt từng tab với `{ active: false }`, bóc tách thành công `title`, `rawPriceText`, `parsedPriceUsd > 0`, gọi `chrome.tabs.remove(tabId)` ngay sau mỗi tab (`activeTabMap.size === 0` sau khi xong) và lưu kết quả vào `chrome.storage.local`.

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-BBS-004 (Thực đơn tuần vi phạm quy tắc tối thiểu 3 món/bữa):**
  - **Given:** Thực đơn tuần có bữa Trưa ngày Thứ Tư chỉ có `2` món ăn.
  - **When:** Gọi `WeeklyMealPlannerService.buildWeeklyShoppingRequirement`.
  - **Then:** Hệ thống ném lỗi `ValidationError` với mã `ERR_INSUFFICIENT_DISHES_PER_MEAL` và chỉ rõ vị trí `dayIndex: 3, mealSlot: "LUNCH"`.
- **TC-BBS-005 (Tab ẩn bị treo quá 15 giây Timeout):**
  - **Given:** Một URL sản phẩm bị treo mạng không phản hồi sự kiện `complete` trong `15,000ms`.
  - **When:** `openTabAndScrape` chờ quá `TAB_TIMEOUT_MS`.
  - **Then:** Bộ đếm timeout kích hoạt, tự động gọi `cleanupTab(tabId)` để đóng tab ẩn, ghi nhận `{ url, success: false, errorCode: "TIMEOUT" }` vào mảng kết quả và tiếp tục chuyển sang URL tiếp theo trong hàng đợi mà không làm treo extension.
- **TC-BBS-006 (Trang Amazon/Temu hiển thị CAPTCHA hoặc chặn truy cập):**
  - **Given:** DOM của tab trả về tiêu đề `"Robot Check"` hoặc form nhập CAPTCHA của Amazon.
  - **When:** `ProductDomParserService.extractProductFromDom` chạy trên DOM đó.
  - **Then:** Phát hiện ngay trạng thái anti-bot, không lấy nhầm text ngẫu nhiên trên trang, trả về `{ success: false, errorCode: "CAPTCHA_BLOCKED" }` và dừng quét tự động tên miền đó để bảo vệ IP người dùng.

#### Tầng 3: Boundary & Rare Edge Cases (`0`, `-1`, `MAX`, `Empty`, `Duplicate`, `Concurrent`)
- **TC-BBS-007 (Chặn kích hoạt quét đồng thời `Concurrent START_SCRAPING` và chống gọi đúp `onUpdated`):**
  - **Given:** Tiến trình quét đang chạy (`isRunning === true`) và sự kiện `chrome.tabs.onUpdated` bắn `status = "complete"` 3 lần liên tiếp cho cùng 1 `tabId`.
  - **When:** Người dùng gửi thêm lệnh `START_SCRAPING` thứ 2 và tab đang mở bắn sự kiện `complete` lặp.
  - **Then:** Lệnh `START_SCRAPING` thứ 2 bị từ chối ngay với thông báo `"Đang có tiến trình quét khác chạy"`; hàm `executeScript` chỉ chạy đúng **1 lần duy nhất** cho `tabId` đó.
- **TC-BBS-008 (Biên giá sản phẩm: Chuỗi giá phức tạp, Giá gạch bỏ và `familySize` biên):**
  - **Given:** Trang sản phẩm có giá gạch bỏ `<span class="old-price">$99.99</span>` đứng trước giá bán thực `<span class="a-offscreen">$49.50</span>`; hoặc `familySize = 0` / `-1`.
  - **When:** Chạy `ProductDomParserService` và `WeeklyMealPlannerService`.
  - **Then:** Parser bỏ qua giá gạch bỏ `$99.99` và lấy đúng `parsedPriceUsd = 49.50`; `WeeklyMealPlannerService` từ chối `familySize <= 0` với lỗi `ERR_INVALID_FAMILY_SIZE`.

---

### 4.2 Quy Trình 5 Bước Kiểm Chứng Bề Mặt Thật Cho QA Reviewer (`5-Step Real-Surface Verification`)

1. **Bước 1 — `Launch`:**
   - Khởi tạo môi trường test Node.js cho bộ core services (`MealPlanner`, `StoreOptimizer`, `DomParser`) và nạp cấu trúc Chrome Extension MV3.
2. **Bước 2 — `Doctor`:**
   - Kiểm tra tính hợp lệ của `manifest.json` (Manifest V3, đủ quyền `tabs`, `storage`, `scripting`), schema `settings.json`, và kiểm tra không còn bất kỳ biến hardcode `YOUR_API_HERE` nào trong logic chính.
3. **Bước 3 — `Drive`:**
   - Chạy kịch bản lập thực đơn 7 ngày (21 bữa × 3 món) cho gia đình 4 người, chạy thuật toán lọc Top 3 siêu thị rẻ nhất từ dữ liệu 5 siêu thị, và chạy giả lập hàng đợi quét DOM Amazon/Temu (bao gồm cả case thành công, case timeout, và case gặp CAPTCHA).
4. **Bước 4 — `Evidence`:**
   - Thu thập log đóng/mở tab (`tabId` được tạo và xóa 100%), bảng kết quả JSON phân bổ 3 siêu thị rẻ nhất và kết quả test suite.
5. **Bước 5 — `Cleanup`:**
   - Xóa bộ nhớ giả lập `chrome.storage.local`, dọn dẹp các timer timeout và xác nhận `activeTabMap.size === 0`.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role Phụ Trách | File Mục Tiêu | Mô Tả Chi Tiết Hàm Cần Viết | Phụ Thuộc | Lệnh Verify & Tiêu Chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `src/constants/SuppliesToolConstants.js` & `settings.example.json` | Định nghĩa toàn bộ `MEAL_PLAN_CONSTANTS`, `MealSlot`, `IngredientCategory`, `SupportedStoreId`, `SCRAPER_CONSTANTS` và file cấu hình mẫu `settings.example.json`. | *None* | Import kiểm tra không lỗi cú pháp, đầy đủ hằng số không dùng magic numbers. |
| `TASK-002` | **Developer** | `src/services/helpers/SupplyWatchlistServiceHelper.js` & `src/services/SupplyWatchlistService.js` | Viết các hàm quản lý danh sách đồ cần mua (`name`, `sourceUrl`, `googleMapsUrl`, `currentPriceUsd`, `lastPurchasedPriceUsd`), tính toán chênh lệch giá (`calculatePriceDelta`) và cập nhật giá mới từ kết quả scraper. | `TASK-001` (Hard) | Test cập nhật giá mới so với `lastPurchasedPriceUsd` trả về đúng số tiền & % tiết kiệm/tăng giá. |
| `TASK-003` | **Developer** | `src/services/helpers/WeeklyMealPlannerServiceHelper.js` & `src/services/WeeklyMealPlannerService.js` | Viết `validateMealPlanConstraints` (7 ngày × 3 bữa × $\ge 3$ món), `aggregateAndScaleIngredients` (nhân khẩu phần cho `X` người ăn, gộp nguyên liệu & gia vị, trừ tồn kho bếp) và `buildWeeklyShoppingRequirement`. | `TASK-001` (Hard) | Chạy thực đơn 7 ngày cho 6 người ăn trả về danh sách nguyên liệu + gia vị tổng hợp chính xác. |
| `TASK-004` | **Developer** | `src/services/helpers/BestStoreCombinationServiceHelper.js` & `src/services/BestStoreCombinationService.js` | Viết `generateStoreSubsets`, `evaluateBasketCostForSubset`, và `findTopThreeCheapestStores` để tìm tổ hợp tối đa 3 siêu thị (Costco, Kroger, Meijer, Target, Weee!...) có độ phủ cao nhất và tổng giá rẻ nhất. | `TASK-003` (Hard) | Test với dữ liệu 5 siêu thị chọn ra đúng 3 nơi rẻ nhất kèm link mua từng món. |
| `TASK-005` | **Developer** | `src/services/helpers/ProductDomParserServiceHelper.js` & `src/services/ProductDomParserService.js` | Viết bộ parser dùng chung cho Amazon & Temu: `parsePriceStringToNumber`, `detectAntiBotOrCaptchaPage`, `extractAmazonProduct`, `extractTemuProduct`, và `extractProductFromDom` (loại bỏ giá gạch bỏ/coupon giả). | `TASK-001` (Hard) | Test với HTML mẫu của Amazon, Temu và trang Robot Check trả về đúng `parsedPriceUsd` hoặc `CAPTCHA_BLOCKED`. |
| `TASK-006` | **Developer** | `src/services/helpers/TabScraperQueueServiceHelper.js` & `src/services/TabScraperQueueService.js` | Viết dịch vụ quản lý hàng đợi tab ẩn MV3: `sanitizeAndValidateUrls`, `openTabAndScrapeWithTimeout`, `sweepOrphanedScraperTabs`, khóa chống gọi đúp `onUpdated` (`isProcessingLoaded`) và đồng bộ kết quả về `apiEndpoint`. | `TASK-001`, `TASK-005` (Hard) | Mọi tab mở ra đều được gọi `chrome.tabs.remove` kể cả khi thành công, lỗi hay timeout 15s. |
| `TASK-007` | **Developer** | `background.js` & `content.js` (Refactor tích hợp Service) | Cập nhật `background.js` và `content.js` để uỷ quyền logic sang `TabScraperQueueService` và `ProductDomParserService`, loại bỏ hoàn toàn đoạn code cào trùng lặp và đọc `apiEndpoint` từ storage/`settings.json`. | `TASK-005`, `TASK-006` (Hard) | Kiểm tra `background.js` và `content.js` chạy mượt, không còn hardcode `YOUR_API_HERE`. |
| `TASK-008` | **Developer** | `popup.js` | Nâng cấp `popup.js`: tự động đồng bộ trạng thái đang chạy (`GET_STATUS`) khi mở lại popup, polling thanh tiến trình theo thời gian thực và hỗ trợ nút dừng quét an toàn. | `TASK-007` (Hard) | Mở lại popup khi đang quét hiển thị đúng tiến độ `current / total`. |
| `TASK-009` | **Test Engineer** | `tests/unit/MealPlannerAndStoreOptimizer.test.js` | Viết Unit Test cho Phân hệ 1: kiểm thử quy tắc 7×3×3 món, nhân khẩu phần `X` người, bóc tách gia vị và thuật toán chọn Top 3 siêu thị rẻ nhất (`TC-BBS-001`, `002`, `004`, `008`). | `TASK-003`, `TASK-004` (Hard) | Toàn bộ unit test Phân hệ 1 pass 100%. |
| `TASK-010` | **Test Engineer** | `tests/integration/ExtensionScraperQueue.test.js` | Viết Integration Test giả lập Chrome APIs (`chrome.tabs`, `chrome.scripting`, `chrome.storage`) để kiểm thử hàng đợi tab ẩn, timeout 15s, phát hiện CAPTCHA, và chống gọi đúp `onUpdated` (`TC-BBS-003`, `005`, `006`, `007`). | `TASK-006`, `TASK-007` (Hard) | Toàn bộ test suite pass 100%, không rò rỉ bất kỳ tab hay timer nào. |
