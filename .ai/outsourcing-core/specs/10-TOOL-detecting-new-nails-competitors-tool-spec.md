# ĐẶC TẢ KỸ THUẬT & NGHIỆP VỤ: DETECTING NEW NAILS COMPETITORS TOOL (`detecting-new-nails-competitors-tool`)

> **Phiên bản:** 1.0.0 (Dev-Ready & Test-Ready)
> **Đội ngũ phụ trách:** AISE Squad 3 — BA Team (`intake`, `ba`, `requirement_challenger`) & PM Team (`orchestrator`, `estimator_cost_controller`)
> **Nguồn yêu cầu gốc:** `idea/detecting-new-nails-competitors-tool/AGENT_STATE.md`

---

## PHẦN 1 — INTAKE & PHÂN LOẠI (`intake`)

### 1.1. Bảng Phân Tách Dữ Kiện (`Stated Facts`, `Explicit Assumptions`, `Clarification Questions`)

| Phân loại | Mã định danh | Nội dung chi tiết | Nguồn / Lý do kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-001` | Hệ thống phải xác định **có bao nhiêu tiệm X (tiệm Nails / đối thủ cùng ngành) gần đây giống như Google Maps**. | Trích nguyên văn dòng 1 file `AGENT_STATE.md` ("1. Có bao nhiều tiệm x gần đây giống như GG map.") |
| **Stated Fact** | `SF-002` | Phạm vi quét và kiểm tra các trang mạng xã hội của đối thủ là **từ `100 miles` (`~160.93 km`) đổ xuống** tính từ vị trí tâm của người dùng. | Trích nguyên văn dòng 2 file `AGENT_STATE.md` ("2. Kiểm tra các social media page của những đôi thủ theo phạm vi 100mile đổ xuống") |
| **Stated Fact** | `SF-003` | Trên **Facebook**: Xem **bài đăng mới nhất** của đối thủ và lấy các chỉ số: **lượt thích (`likes`), bình luận (`comments`), chia sẻ (`shares`)**. | Trích nguyên văn dòng 4–5 file `AGENT_STATE.md` |
| **Stated Fact** | `SF-004` | Trên **Instagram**: Xem **bài đăng mới nhất hoặc danh sách các bài gần đây (scroll xuống)** của đối thủ để lấy tổng **lượt thích (`likes`), bình luận (`comments`), chia sẻ (`shares`)**. | Trích nguyên văn dòng 6–7 file `AGENT_STATE.md` |
| **Stated Fact** | `SF-005` | Trên **Google Maps**: Thu thập **Tổng số review (`totalReviews`)**, **Nội dung & thời gian Review mới nhất (`latestReview`)**, và **Điểm đánh giá hiện tại (`currentRating`)**. | Trích nguyên văn dòng 8–9 file `AGENT_STATE.md` |
| **Explicit Assumption** | `EA-001` | **Phân chia Lưới Không Gian (`Spatial Grid Tiling / Hexagonal Sub-Queries`) cho bán kính `100 miles`:** API của Google Places (`Nearby Search` / `Text Search`) giới hạn bán kính tối đa mỗi lần gọi là `50,000 mét` (`~31.06 miles`) và chỉ trả về tối đa `60 kết quả`/vùng. Do đó, để quét đủ phạm vi `100 miles` (`160,934 mét`) và lọc chính xác bằng công thức khoảng cách mặt cầu **Haversine**, hệ thống chia vùng bán kính `<= 100 miles` thành các tâm lưới con (Sub-grid centers) và khử trùng lặp theo `placeId`. | Giải quyết giới hạn kỹ thuật cứng của Google Maps API để Dev thực thi được bán kính `100 miles`. |
| **Explicit Assumption** | `EA-002` | **Thu thập Dữ liệu Mạng Xã Hội qua Official API / Authorized Provider Adapter (Không dùng Raw Scraping vi phạm ToS):** Để lấy chỉ số bài đăng Facebook & Instagram hợp pháp, ổn định và không bị chặn bởi tường lửa đăng nhập hay CAPTCHA, hệ thống sử dụng tầng tích hợp `SocialFeedProviderAdapter` kết nối với Meta Graph API (`business_discovery` / Public Page Metadata) hoặc dịch vụ dữ liệu đối tác được cấp quyền cấu hình trong `settings.json`. Với các bài Instagram không công khai số lượt `share` qua API công cộng, trường `sharesCount` sẽ trả về `null` (hiển thị `"N/A (Ẩn bởi nền tảng)"`) thay vì bịa số `0`. | Tuân thủ nghiêm ngặt quy tắc an toàn hệ thống và trung thực dữ liệu. |
| **Explicit Assumption** | `EA-003` | **Phát hiện "Đối thủ Mới" (`New Competitor Detection Diffing`):** Đúng với tên dự án `detecting-new-nails-competitors-tool`, hệ thống lưu lại bản chụp (`Snapshot`) danh sách `placeId` của các lần quét trước để đánh dấu cờ `isNewlyDetected = true` cho các tiệm nail mới mở hoặc mới xuất hiện trên bản đồ kể từ lần quét gần nhất. | Bám sát tên gọi và mục tiêu cốt lõi của công cụ. |

### 1.2. Danh sách Câu hỏi Làm rõ (`Clarification Questions`)

1. **CQ-001: Số lượng bài đăng Instagram gần nhất cần cuộn lấy (`scroll xuống`) mặc định là bao nhiêu bài cho mỗi đối thủ?**
   - **Option A (Khuyến nghị):** Mặc định lấy **bài mới nhất (`1` bài)** kèm tổng hợp của **`5` đến `10` bài gần nhất** (cấu hình được trong `settings.json` qua `instagramRecentPostsLimit = 5`) để chủ tiệm vừa xem được bài vừa đăng hôm nay vừa biết mức độ tương tác trung bình gần đây của đối thủ.
   - **Option B:** Cuộn lấy toàn bộ hàng nghìn bài từ lúc mở tiệm (tốn quota API và chậm).
   - *Quyết định mặc định cho bản Spec này:* Chọn **Option A**.

2. **CQ-002: Làm thế nào để liên kết một địa điểm trên Google Maps (`Google Place`) với đúng trang Facebook và Instagram của tiệm Nail đó?**
   - **Option A (Khuyến nghị):** Trích xuất đường dẫn mạng xã hội từ `websiteUri` của Google Places + đối chiếu tương đồng Tên tiệm + Số điện thoại + Địa chỉ (`Name & Phone Entity Resolution`) với ngưỡng tin cậy `>= 0.80`, đồng thời cho phép người dùng ghim/sửa link FB/IG thủ công nếu tiệm đặt tên khác trên mạng xã hội.
   - **Option B:** Chỉ tìm theo tên tiệm đơn thuần (dễ nhầm các tiệm trùng tên như *"Luxury Nails"* ở bang khác).
   - *Quyết định mặc định cho bản Spec này:* Chọn **Option A**.

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1. Bảng Yêu Cầu Nghiệp Vụ (`REQ-001` .. `REQ-010`)

| Mã REQ | Tên Yêu Cầu | Mô tả nghiệp vụ chi tiết | Truy vết nguồn | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | Tìm kiếm & Đếm Số lượng Tiệm Đối thủ quanh Tâm (`Nearby Competitor Radar`) | Nhập tọa độ tâm `(latitude, longitude)` hoặc địa chỉ/ZIP Code, từ khóa ngành nghề (mặc định `"Nail Salon"`) và bán kính `radiusMiles` (`0 < radiusMiles <= 100`); trả về tổng số tiệm tìm thấy và khoảng cách chính xác theo `miles` của từng tiệm. | `SF-001`, `SF-002` | **P0 Must-Have** |
| `REQ-002` | Ràng buộc Bán kính Tối đa `100 Miles` & Lọc Khoảng cách Haversine | Kiểm tra nghiêm ngặt `radiusMiles <= 100`; sử dụng công thức Haversine tính khoảng cách đường chim bay từ tâm tới từng đối thủ và loại bỏ mọi kết quả nằm ngoài bán kính đã chọn. | `SF-002`, `EA-001` | **P0 Must-Have** |
| `REQ-003` | Phân mảnh Truy vấn Không gian khi Bán kính `> 30 Miles` (`Spatial Grid Partitioning`) | Khi người dùng chọn bán kính lớn (từ `31` đến `100 miles`), hệ thống tự động sinh lưới các điểm tâm phụ để vượt giới hạn `50km` của Google Places API và hợp nhất kết quả không trùng lặp theo `placeId`. | `SF-001`, `SF-002`, `EA-001` | **P0 Must-Have** |
| `REQ-004` | Thu thập Chỉ số Google Maps (`Rating, Total Reviews, Latest Review`) | Lấy đầy đủ thông tin Google Maps cho từng tiệm đối thủ: Điểm đánh giá hiện tại (`rating`: `1.0` – `5.0`), Tổng số lượng đánh giá (`totalReviewsCount`), và chi tiết Đánh giá mới nhất (`latestReview`: tên người viết, số sao, nội dung, thời gian đăng). | `SF-005` | **P0 Must-Have** |
| `REQ-005` | Kiểm tra Bài đăng Mới nhất trên Facebook của Đối thủ (`Facebook Latest Post Metrics`) | Truy xuất bài đăng mới nhất trên trang Facebook của đối thủ, hiển thị nội dung tóm tắt, thời gian đăng, link bài viết và 3 chỉ số: **Lượt thích (`likesCount`)**, **Bình luận (`commentsCount`)**, **Chia sẻ (`sharesCount`)**. | `SF-002`, `SF-003` | **P0 Must-Have** |
| `REQ-006` | Kiểm tra Bài mới nhất & Tổng hợp các Bài gần đây trên Instagram (`Instagram Recent Feed Metrics`) | Truy xuất bài đăng mới nhất và danh sách `N` bài gần đây (tương đương thao tác scroll xuống) trên Instagram của đối thủ; tính tổng **Lượt thích (`totalLikes`)**, **Bình luận (`totalComments`)**, **Chia sẻ (`totalShares`)** của các bài này. | `SF-002`, `SF-004` | **P0 Must-Have** |
| `REQ-007` | Nhận diện Tiệm Nail Mới Xuất Hiện (`New Competitor Diff Engine`) | So sánh danh sách `placeId` của lần quét hiện tại với bản lưu lần quét trước đó trong khu vực để gắn nhãn **`NEW COMPETITOR`** cho các tiệm mới khai trương hoặc mới lên Google Maps. | `SF-001`, `EA-003` | **P1 Should-Have** |
| `REQ-008` | Đối sánh Thực thể Tiệm Nail ↔ Trang Mạng Xã Hội (`Entity Resolution`) | Tính điểm khớp (`matchConfidence`) giữa thông tin tiệm trên Google Maps (Tên, SĐT, Thành phố/Bang) với trang Facebook/Instagram để tránh gắn nhầm fanpage của tiệm trùng tên ở tiểu bang khác. | `SF-002`, `CQ-002` | **P1 Should-Have** |
| `REQ-009` | Bảng Xếp hạng Sức nóng Đối thủ (`Competitor Heat Score & Sorting`) | Cho phép sắp xếp danh sách đối thủ theo: Khoảng cách gần nhất, Điểm Google Rating cao nhất, Tốc độ tăng Review, hoặc Tổng tương tác Facebook/Instagram cao nhất. | `SF-001`, `SF-003`, `SF-004`, `SF-005` | **P1 Should-Have** |
| `REQ-010` | Xuất Báo cáo Tình báo Đối thủ (`Competitor Intelligence CSV/JSON Export`) | Xuất toàn bộ danh sách đối thủ trong bán kính `<= 100 miles` kèm chỉ số Google Maps, Facebook, Instagram ra file CSV/JSON để chủ tiệm phân tích chiến lược giá và marketing. | `SF-001`..`SF-005` | **P2 Nice-to-Have** |

### 2.2. Data Structures, Constants & `settings.json` Schema

#### Bảng `CONSTANTS` & `ENUMS` (Tuân thủ nghiêm ngặt luật No Magic Numbers/Strings)

```typescript
export enum CompetitorChannel {
  GOOGLE_MAPS = 'GOOGLE_MAPS',
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
}

export enum CompetitorSortField {
  DISTANCE_ASC = 'DISTANCE_ASC',
  GOOGLE_RATING_DESC = 'GOOGLE_RATING_DESC',
  TOTAL_REVIEWS_DESC = 'TOTAL_REVIEWS_DESC',
  SOCIAL_ENGAGEMENT_DESC = 'SOCIAL_ENGAGEMENT_DESC',
}

export const COMPETITOR_RADAR_CONSTANTS = {
  MIN_SEARCH_RADIUS_MILES: 0.5,
  MAX_SEARCH_RADIUS_MILES: 100.0,         // Chốt chặn cứng từ AGENT_STATE.md: "100mile đổ xuống"
  DEFAULT_SEARCH_RADIUS_MILES: 15.0,
  EARTH_RADIUS_MILES: 3958.7613,          // Bán kính Trái Đất tính theo dặm để tính Haversine
  MILES_TO_METERS_FACTOR: 1609.344,
  GOOGLE_PLACES_MAX_RADIUS_METERS: 50_000, // ~31.068 miles
  GOOGLE_PLACES_MAX_RADIUS_MILES: 31.0,
  DEFAULT_INSTAGRAM_SCROLL_POST_LIMIT: 5,
  MAX_INSTAGRAM_SCROLL_POST_LIMIT: 20,
  MIN_GOOGLE_RATING: 1.0,
  MAX_GOOGLE_RATING: 5.0,
  ENTITY_MATCH_CONFIDENCE_THRESHOLD: 0.75,
} as const;
```

#### TypeScript Interfaces

```typescript
export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface RadarSearchQuery {
  center: GeoCoordinates;
  radiusMiles: number;       // Bắt buộc: 0 < radiusMiles <= 100
  keyword: string;           // Mặc định: "Nail Salon"
  instagramPostScrollLimit?: number;
}

export interface GoogleMapsReviewItem {
  reviewId: string;
  authorName: string;
  rating: number;            // 1 -> 5
  text: string;
  publishedAtIso: string;
}

export interface GoogleMapsPlaceMetrics {
  placeId: string;
  currentRating: number | null;
  totalReviewsCount: number;
  latestReview: GoogleMapsReviewItem | null;
  googleMapsUrl: string;
}

export interface SocialPostMetricItem {
  postId: string;
  permalinkUrl: string;
  captionPreview: string;
  publishedAtIso: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number | null; // null nếu nền tảng ẩn số lượt share công khai
}

export interface FacebookPageCompetitorMetrics {
  pageId: string;
  pageName: string;
  pageUrl: string;
  matchConfidence: number;
  latestPost: SocialPostMetricItem | null;
}

export interface InstagramCompetitorMetrics {
  handle: string;
  profileUrl: string;
  matchConfidence: number;
  latestPost: SocialPostMetricItem | null;
  recentScrolledPosts: SocialPostMetricItem[];
  aggregatedTotals: {
    postsEvaluatedCount: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
  };
}

export interface NailCompetitorProfile {
  competitorId: string;      // Khóa chuẩn theo Google placeId
  name: string;
  address: string;
  phone: string | null;
  coordinates: GeoCoordinates;
  distanceMiles: number;     // Khoảng cách chính xác từ tâm tìm kiếm
  isNewlyDetected: boolean;  // true nếu chưa từng xuất hiện trong lần quét trước
  googleMaps: GoogleMapsPlaceMetrics;
  facebook: FacebookPageCompetitorMetrics | null;
  instagram: InstagramCompetitorMetrics | null;
  lastScannedAtIso: string;
}

export interface CompetitorRadarScanResult {
  scanId: string;
  query: RadarSearchQuery;
  totalCompetitorsFound: number;
  newlyDetectedCount: number;
  subGridQueriesCount: number;
  competitors: NailCompetitorProfile[];
  executedAtIso: string;
}
```

#### Cấu trúc `settings.json` Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "DetectingNewNailsCompetitorsSettings",
  "type": "object",
  "required": ["googleMapsPlatform", "socialIntelligenceProvider", "radarDefaults"],
  "properties": {
    "googleMapsPlatform": {
      "type": "object",
      "required": ["placesApiKey", "placesEndpointUrl", "timeoutMs"],
      "properties": {
        "placesApiKey": { "type": "string", "description": "Google Places API Key lưu trong settings.json, không hardcode" },
        "placesEndpointUrl": { "type": "string", "format": "uri", "default": "https://places.googleapis.com/v1/places:searchNearby" },
        "timeoutMs": { "type": "integer", "default": 10000 }
      }
    },
    "socialIntelligenceProvider": {
      "type": "object",
      "required": ["metaGraphAccessToken", "instagramScrollPostsLimit", "maxConcurrentRequests"],
      "properties": {
        "metaGraphAccessToken": { "type": "string", "description": "Token truy xuất dữ liệu Public Page / Business Discovery hợp lệ" },
        "instagramScrollPostsLimit": { "type": "integer", "minimum": 1, "maximum": 20, "default": 5 },
        "maxConcurrentRequests": { "type": "integer", "minimum": 1, "maximum": 10, "default": 3 }
      }
    },
    "radarDefaults": {
      "type": "object",
      "required": ["defaultKeyword", "defaultRadiusMiles", "snapshotStorageKey"],
      "properties": {
        "defaultKeyword": { "type": "string", "default": "Nail Salon" },
        "defaultRadiusMiles": { "type": "number", "maximum": 100, "default": 15 },
        "snapshotStorageKey": { "type": "string", "default": "aise_nails_competitor_snapshots_v1" }
      }
    }
  }
}
```

### 2.3. Kiến Trúc Service & Helper (Tuân thủ Rule 4 & SRP)

| Tên File | Loại | Hàm & Chữ ký (Method Signatures) | Mục đích (Docstring) |
| :--- | :--- | :--- | :--- |
| `src/services/GeoCompetitorRadarService.ts` | `*Service` | `scanNearbyCompetitors(query: RadarSearchQuery, rawPlaces: NailCompetitorProfile[], previousPlaceIds?: string[]): CompetitorRadarScanResult`<br>`buildSpatialSubQueries(query: RadarSearchQuery): Array<{ center: GeoCoordinates; radiusMeters: number }>` | Điều phối quét đối thủ trong bán kính `<= 100 miles`, chia lưới truy vấn khi bán kính `> 31 miles`, lọc khoảng cách thực tế bằng Haversine, khử trùng lặp `placeId` và gắn cờ `isNewlyDetected`. |
| `src/services/helpers/GeoCompetitorRadarServiceHelper.ts` | `*ServiceHelper` | `validateRadarQuery(query: RadarSearchQuery): { valid: boolean; errorCode?: string }`<br>`calculateHaversineDistanceMiles(p1: GeoCoordinates, p2: GeoCoordinates): number`<br>`deduplicatePlacesById(places: NailCompetitorProfile[]): NailCompetitorProfile[]` | Kiểm tra tọa độ vĩ độ/kinh độ hợp lệ, kiểm tra trần `100 miles`, tính khoảng cách mặt cầu Haversine theo đơn vị `miles` và khử trùng lặp địa điểm. |
| `src/services/CompetitorSocialMetricsService.ts` | `*Service` | `summarizeFacebookLatestPost(pageMeta: { pageId: string; pageName: string; pageUrl: string; matchConfidence: number }, posts: SocialPostMetricItem[]): FacebookPageCompetitorMetrics`<br>`summarizeInstagramFeedMetrics(profileMeta: { handle: string; profileUrl: string; matchConfidence: number }, posts: SocialPostMetricItem[], scrollLimit?: number): InstagramCompetitorMetrics`<br>`summarizeGoogleMapsMetrics(placeId: string, rating: number \| null, totalReviews: number, reviews: GoogleMapsReviewItem[]): GoogleMapsPlaceMetrics` | Xử lý dữ liệu bài đăng mới nhất trên Facebook, tổng hợp lượt thích/comment/share khi scroll trên Instagram và trích xuất review mới nhất trên Google Maps. |
| `src/services/helpers/CompetitorSocialMetricsServiceHelper.ts` | `*ServiceHelper` | `selectLatestByTimestamp<T extends { publishedAtIso: string }>(items: T[]): T \| null`<br>`computeEntityMatchConfidence(place: { name: string; phone: string \| null }, socialPage: { name: string; phone: string \| null }): number`<br>`sanitizeMetricNumber(val: number \| null \| undefined): number` | Sắp xếp chọn bài đăng / review mới nhất theo thời gian ISO, chấm điểm khớp tên/SĐT giữa tiệm trên Google Maps và fanpage mạng xã hội, chuẩn hóa số liệu không âm. |

### 2.4. Ma Trận 5 Trạng Thái UX (`Ideal`, `Loading`, `Empty`, `Error`, `Partial/Overflow`)

| Trạng thái UX | Điều kiện kích hoạt | Hiển thị Giao diện (Visual Feedback) | Hành động khôi phục / Tương tác (CTA) |
| :--- | :--- | :--- | :--- |
| **1. Empty State** | Chủ tiệm mới mở công cụ, chưa nhập vị trí tiệm của mình. | Bản đồ Radar trực quan với thanh nhập Địa chỉ / Tọa độ, thanh trượt chọn bán kính (`1 mile` -> `100 miles`) và nút lớn **"Quét Tiệm Nails Đối Thủ Quanh Đây"**. | Bấm `Lấy vị trí hiện tại của tiệm` hoặc nhập ZIP Code (VD: `92683 - Westminster, CA`) rồi bấm `Quét ngay`. |
| **2. Loading State** | Đang quét lưới Google Maps và thu thập chỉ số Facebook, Instagram của các đối thủ. | Hiển thị tiến trình từng pha: `"Đang quét bản đồ trong bán kính 25 miles (Tìm thấy 18 tiệm)..."` -> `"Đang kiểm tra Google Reviews, Facebook & Instagram..."`. | Cho phép xem ngay danh sách tiệm trên Google Maps trong lúc chờ dữ liệu MXH tải tiếp (Progressive Rendering). |
| **3. Ideal State** | Quét hoàn tất, hiển thị đầy đủ tổng số tiệm gần đây và bảng so sánh 3 kênh. | Trên cùng hiển thị: **Tổng số tiệm trong vùng (`X tiệm`)** và **Số đối thủ mới xuất hiện (`+Y tiệm mới`)**. Bên dưới là bảng/thẻ từng đối thủ gồm 3 cột: (1) **Google Maps** (*Rating ⭐, Tổng số review, Nội dung review mới nhất*), (2) **Facebook** (*Bài đăng mới nhất: Like / Comment / Share*), (3) **Instagram** (*Bài mới nhất & Tổng Like / Comment / Share của 5 bài gần nhất*). | Sắp xếp theo Khoảng cách / Điểm Rating / Tương tác MXH, hoặc bấm `Xuất báo cáo CSV`. |
| **4. Error State** | Người dùng nhập bán kính `> 100 miles` (VD: `150 miles`), bán kính `<= 0`, tọa độ không hợp lệ hoặc lỗi API Key. | Thông báo lỗi rõ ràng: *"Phạm vi kiểm tra tối đa cho phép là từ 100 miles đổ xuống. Vui lòng nhập bán kính trong khoảng 0.5 – 100 miles."* | Nút `Đặt về mức tối đa 100 miles` hoặc `Đặt về mặc định 15 miles`. |
| **5. Partial / Overflow State** | Tiệm nail đối thủ có mặt trên Google Maps nhưng không có fanpage Facebook hoặc chưa lập Instagram, hoặc khu vực trung tâm có hơn `100` tiệm nail. | Cột Google Maps vẫn hiển thị đầy đủ; cột Facebook/Instagram hiển thị trạng thái *"Tiệm chưa liên kết Fanpage công khai"* kèm nút `+ Gắn link thủ công`. Danh sách trên 50 tiệm được phân trang mượt mà. | Bấm `+ Gắn link FB/IG thủ công` hoặc lọc chỉ xem `Các tiệm có Rating >= 4.5⭐`. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

| Mã Rủi Ro | Mô tả Lỗ hổng / Rủi ro Thực tế | Mức độ nghiêm trọng | Chốt chặn Kỹ thuật Bắt buộc (Technical Guardrail) |
| :--- | :--- | :--- | :--- |
| `RISK-001` | **Giới hạn bán kính `50 km` (`~31 miles`) của Google Places API làm thiếu đối thủ ở vùng `31 – 100 miles`:** Yêu cầu ghi rõ *"phạm vi 100mile đổ xuống"*, nhưng nếu truyền `radius = 160934` mét vào Google Places API thì request sẽ bị từ chối ngay (`INVALID_ARGUMENT`). | **CRITICAL (Blocker)** | **Thuật toán Chia Lưới Không Gian `buildSpatialSubQueries()` & Haversine Filter:** Khi `radiusMiles > 31.0`, hệ thống tự động chia vùng tìm kiếm thành các ô lưới có bán kính `<= 50,000m`, sau đó dùng `deduplicatePlacesById()` để gộp kết quả trùng và dùng `calculateHaversineDistanceMiles()` để cắt chính xác theo đường tròn `radiusMiles <= 100`. |
| `RISK-002` | **Nguy cơ bị khóa IP / Chặn tài khoản nếu cào dữ liệu (Raw Scraping) trái phép trên Facebook & Instagram:** Facebook và Instagram chặn rất gắt các bot cào HTML trực tiếp và gài CAPTCHA/Login Wall. | **CRITICAL (Blocker)** | **Tuân thủ Tuyệt đối Chính sách Bảo mật & Official Adapter:** Chỉ thu thập qua `CompetitorSocialMetricsService` đọc dữ liệu từ Meta Graph API / nguồn dữ liệu công khai hợp lệ được cấu hình trong `settings.json` với giới hạn `maxConcurrentRequests <= 3`. Tuyệt đối không dùng kỹ thuật vượt CAPTCHA hay giả mạo phiên đăng nhập. |
| `RISK-003` | **Ghép nhầm Fanpage của tiệm trùng tên ở bang khác (`False-Positive Entity Matching`):** Ngành Nail ở Mỹ có hàng trăm tiệm cùng mang tên *"LA Nails"*, *"Happy Nails"*, *"Venetian Nail Spa"*. Nếu lấy đại kết quả đầu tiên trên Facebook sẽ lấy nhầm tương tác của một tiệm cách đó 2,000 dặm. | **HIGH** | **Chốt chặn `computeEntityMatchConfidence()`:** So khớp đồng thời Tên tiệm chuẩn hóa (loại bỏ hậu tố chung) và Số điện thoại / Khu vực; nếu `matchConfidence < 0.75`, hệ thống không tự động gắn bừa mà đánh dấu trạng thái cần xác nhận. |
| `RISK-004` | **Sai lệch số liệu khi đối thủ ghim (Pin) bài đăng cũ từ 2 năm trước lên đầu trang Facebook/Instagram:** Bài đầu tiên xuất hiện trên đầu trang thường là bài Pinned Post (bảng giá hoặc thông báo cũ từ năm ngoái), không phải là **bài đăng mới nhất** thực sự của đối thủ. | **MEDIUM** | **Hàm `selectLatestByTimestamp()` sắp xếp theo `publishedAtIso` giảm dần:** Khi lấy danh sách bài đăng gần đây của đối thủ, luôn so sánh mốc thời gian `publishedAtIso` thực tế để tìm đúng bài đăng mới nhất và review mới nhất. |

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1. Kịch bản Kiểm thử 3 Tầng (`Given / When / Then`)

#### Tầng 1: P0 Happy Paths (Người dùng hay xài nhất)
- **TC-T1-001: Quét đối thủ trong bán kính `<= 100 miles`, đếm đúng số lượng tiệm và phát hiện tiệm mới mở (`isNewlyDetected`)**
  - **Given:** Vị trí tâm tại `(33.7455, -117.9677)` (Westminster, CA), bán kính `25 miles`. Danh sách địa điểm gồm 3 tiệm cách tâm lần lượt `2.5 miles`, `18.0 miles` và `40.0 miles`. Lần quét trước đã biết `place_1`.
  - **When:** Gọi `scanNearbyCompetitors()` với `previousPlaceIds = ['place_1']`.
  - **Then:** Hệ thống lọc giữ lại đúng 2 tiệm nằm trong bán kính `25 miles` (`totalCompetitorsFound = 2`), loại bỏ tiệm ở `40 miles`, sắp xếp theo khoảng cách tăng dần và đánh dấu tiệm thứ 2 là `isNewlyDetected = true` (`newlyDetectedCount = 1`).
- **TC-T1-002: Trích xuất bài đăng mới nhất trên Facebook và tổng hợp lượt Like, Comment, Share khi scroll trên Instagram**
  - **Given:** Đối thủ có 3 bài đăng Facebook ở các ngày khác nhau (trong đó bài ghim đầu tiên cũ hơn bài thứ 2) và 6 bài đăng trên Instagram.
  - **When:** Gọi `summarizeFacebookLatestPost()` và `summarizeInstagramFeedMetrics(..., scrollLimit = 5)`.
  - **Then:** Facebook trả về đúng bài có `publishedAtIso` mới nhất cùng `likesCount`, `commentsCount`, `sharesCount`; Instagram trả về đúng bài mới nhất và cộng tổng chính xác `totalLikes`, `totalComments`, `totalShares` của 5 bài gần nhất.
- **TC-T1-003: Trích xuất Tổng số Review, Điểm Rating hiện tại và Review mới nhất trên Google Maps**
  - **Given:** Tiệm đối thủ có `rating = 4.7`, `totalReviews = 342` và danh sách 5 review gần đây.
  - **When:** Gọi `summarizeGoogleMapsMetrics()`.
  - **Then:** Trả về đúng `currentRating = 4.7`, `totalReviewsCount = 342` và `latestReview` là review có thời gian `publishedAtIso` mới nhất.

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-T2-001: Chặn bán kính vượt quá `100 miles` (`radiusMiles > 100`) hoặc bán kính `<= 0`**
  - **Given:** Người dùng truyền `radiusMiles = 100.5` hoặc `radiusMiles = 0` hoặc `radiusMiles = -10`.
  - **When:** Gọi `validateRadarQuery()` hoặc `scanNearbyCompetitors()`.
  - **Then:** Hệ thống từ chối ngay với mã lỗi `ERR_RADIUS_OUT_OF_BOUNDS` (tuân thủ nghiêm ngặt quy định *"phạm vi 100mile đổ xuống"*).
- **TC-T2-002: Chặn tọa độ GPS không hợp lệ (`latitude > 90` hoặc `longitude < -180`)**
  - **Given:** `center = { latitude: 120, longitude: -200 }`.
  - **When:** Gọi `validateRadarQuery()`.
  - **Then:** Trả về `{ valid: false, errorCode: 'ERR_INVALID_COORDINATES' }`.
- **TC-T2-003: Xử lý an toàn khi đối thủ chưa có bài đăng nào trên Facebook/Instagram hoặc chưa có Review nào trên Google Maps**
  - **Given:** Tiệm nail mới mở có `totalReviews = 0`, `reviews = []`, và trang Facebook chưa đăng bài nào (`posts = []`).
  - **When:** Gọi `summarizeGoogleMapsMetrics()` và `summarizeFacebookLatestPost()`.
  - **Then:** Trả về `latestReview = null`, `latestPost = null` mà không gây lỗi `TypeError: Cannot read properties of undefined`.

#### Tầng 3: Boundary & Rare Edge Cases (`0`, `-1`, `MAX`, `Empty`, `Duplicate`, `Concurrent`)
- **TC-T3-001: Biên bán kính tối đa đúng bằng `100.0 miles` kích hoạt chia lưới truy vấn (`buildSpatialSubQueries`)**
  - **Given:** `radiusMiles = 100.0`.
  - **When:** Gọi `buildSpatialSubQueries()`.
  - **Then:** Hệ thống sinh ra nhiều tâm truy vấn con (`subGridQueriesCount > 1`), mỗi truy vấn con đều có `radiusMeters <= 50,000` (giới hạn cứng của Google Places).
- **TC-T3-002: Khử trùng lặp khi cùng một tiệm Nail xuất hiện ở vùng giao thoa của 2 ô lưới tìm kiếm (`Duplicate placeId`)**
  - **Given:** Mảng kết quả thô từ các ô lưới chứa 2 bản ghi có cùng `competitorId = "ChIJ_nail_salon_01"`.
  - **When:** Gọi `scanNearbyCompetitors()`.
  - **Then:** Kết quả cuối cùng chỉ tính tiệm đó 1 lần duy nhất.
- **TC-T3-003: Khoảng cách giữa 2 điểm trùng khít nhau (`0.0 miles`) và xử lý số lượt share bằng `null` trên Instagram**
  - **Given:** Tiệm nằm ngay tại tâm tìm kiếm và các bài Instagram có `sharesCount = null` hoặc số âm lỗi `-1`.
  - **When:** Tính khoảng cách và tổng hợp tương tác.
  - **Then:** `distanceMiles = 0`, `totalShares = 0` (không bị biến thành `NaN`).

### 4.2. Quy trình 5 Bước Kiểm Chứng Bề Mặt Thật cho QA Reviewer

1. **Step 1 — Launch:** Khởi chạy dịch vụ Radar quét đối thủ Nails và bộ phân tích chỉ số Google Maps / Facebook / Instagram với cấu hình từ `settings.json`.
2. **Step 2 — Doctor:** Kiểm tra schema `settings.json`, xác nhận hằng số `MAX_SEARCH_RADIUS_MILES = 100.0` và `GOOGLE_PLACES_MAX_RADIUS_METERS = 50000`.
3. **Step 3 — Drive:** Chạy kịch bản quét đối thủ ở bán kính `20 miles` và `100 miles`, kiểm tra việc lọc khoảng cách Haversine, khử trùng lặp `placeId`, phát hiện đối thủ mới, và bóc tách chỉ số Google Maps (Rating, Total Reviews, Latest Review), Facebook (Latest Post Likes/Comments/Shares), Instagram (Latest + Scrolled Totals).
4. **Step 4 — Evidence:** Lưu lại log output và báo cáo kiểm thử 3 tầng làm bằng chứng QA.
5. **Step 5 — Cleanup:** Dọn dẹp snapshot tạm sau khi kiểm thử xong.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role phụ trách | File mục tiêu | Mô tả chi tiết hàm cần viết | Phụ thuộc | Lệnh Verify + Tiêu chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `src/constants/competitorConstants.ts` & `settings.json` | Khai báo `CompetitorChannel`, `CompetitorSortField`, `COMPETITOR_RADAR_CONSTANTS` (với `MAX_SEARCH_RADIUS_MILES = 100.0`) và tạo file `settings.json`. | Không (None) | `npx tsc --noEmit` pass 100%, không có magic number/string. |
| `TASK-002` | **Developer** | `src/types/competitorTypes.ts` | Định nghĩa đầy đủ các interfaces: `GeoCoordinates`, `RadarSearchQuery`, `GoogleMapsPlaceMetrics`, `SocialPostMetricItem`, `FacebookPageCompetitorMetrics`, `InstagramCompetitorMetrics`, `NailCompetitorProfile`, `CompetitorRadarScanResult`. | **Hard:** `TASK-001` | `npx tsc --noEmit` không báo lỗi. |
| `TASK-003` | **Developer** | `src/services/helpers/GeoCompetitorRadarServiceHelper.ts` | Viết `validateRadarQuery()` (chốt chặn `0 < radiusMiles <= 100`), `calculateHaversineDistanceMiles()`, và `deduplicatePlacesById()`. | **Hard:** `TASK-002` | Tính đúng khoảng cách Haversine theo `miles` với sai số `< 0.1%` và chặn mọi bán kính `> 100 miles`. |
| `TASK-004` | **Developer** | `src/services/GeoCompetitorRadarService.ts` | Viết `buildSpatialSubQueries()` (chia lưới khi `radiusMiles > 31`) và `scanNearbyCompetitors()` (lọc khoảng cách, sắp xếp, đánh dấu `isNewlyDetected`). | **Hard:** `TASK-003` | Quét và đếm đúng số lượng tiệm trong vùng, gắn cờ chính xác các tiệm mới xuất hiện. |
| `TASK-005` | **Developer** | `src/services/helpers/CompetitorSocialMetricsServiceHelper.ts` | Viết `selectLatestByTimestamp()`, `computeEntityMatchConfidence()` và `sanitizeMetricNumber()`. | **Hard:** `TASK-002` | Chọn đúng bài đăng/review mới nhất theo thời gian thực kể cả khi mảng đầu vào bị xáo trộn do bài ghim. |
| `TASK-006` | **Developer** | `src/services/CompetitorSocialMetricsService.ts` | Viết `summarizeFacebookLatestPost()`, `summarizeInstagramFeedMetrics()`, và `summarizeGoogleMapsMetrics()`. | **Hard:** `TASK-005` | Trả về đầy đủ chỉ số FB, IG (bài mới nhất + tổng scroll) và Google Maps (Rating, Tổng Review, Review mới nhất). |
| `TASK-007` | **Developer** | `src/ui/CompetitorRadarDashboard.ts` | Xây dựng bộ điều khiển hiển thị danh sách tiệm đối thủ, bộ lọc sắp xếp (`CompetitorSortField`) và xuất CSV/JSON. | **Hard:** `TASK-004`, `TASK-006` | Hỗ trợ sắp xếp theo khoảng cách, rating và tổng tương tác MXH. |
| `TASK-008` | **Test Engineer** | `tests/geoCompetitorRadar.test.ts` | Viết Unit Test 3 tầng cho `GeoCompetitorRadarService` & Helper (Haversine distance, trần `100 miles`, chia lưới `> 31 miles`, khử trùng lặp `placeId`, phát hiện tiệm mới). | **Hard:** `TASK-004` | `npm test -- tests/geoCompetitorRadar.test.ts` pass 100%. |
| `TASK-009` | **Test Engineer** | `tests/competitorSocialMetrics.test.ts` | Viết Unit Test 3 tầng cho `CompetitorSocialMetricsService` & Helper (bài mới nhất FB vượt qua bài ghim cũ, cộng dồn scroll IG, review mới nhất Google Maps, mảng rỗng & `sharesCount = null`). | **Hard:** `TASK-006` | `npm test -- tests/competitorSocialMetrics.test.ts` pass 100%, branch coverage `>= 90%`. |
| `TASK-010` | **Test Engineer** | `tests/competitorRadarE2E.test.ts` | Viết test tích hợp toàn luồng: Quét bán kính `100 miles` -> Lọc & đếm tiệm -> Thu thập chỉ số Google Maps + Facebook + Instagram -> Xuất báo cáo. | **Hard:** `TASK-008`, `TASK-009` | Toàn bộ test suite chạy xanh 100%, lưu log bằng chứng QA. |
