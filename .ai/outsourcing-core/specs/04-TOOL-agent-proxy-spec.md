# Tài Liệu Đặc Tả Thực Thi: Trạm Trung Chuyển & Xoay Vòng API Key Tự Động (`agent-proxy`)

- **Mã Dự Án**: `AGENT-PROXY-004`
- **Phân Nhóm**: Nhóm 4 — Trading, Market Intelligence & Utility Extensions
- **Đội Ngũ Phụ Trách**: Squad 4 — BA Team (`intake`, `ba`, `requirement_challenger`) & PM Team (`orchestrator`, `estimator_cost_controller`) + QA/Test (`test_engineer`, `qa_reviewer`)
- **Trạng Thái Tài Liệu**: `READY FOR EXECUTION` (Đã qua cổng kiểm duyệt độc lập)
- **Nguồn Đối Chiếu Thực Tế**:
  - [requirement.md](file:///d:/Workspace/personal-tools/idea/agent-proxy/requirement.md)
  - [quick-start.md](file:///d:/Workspace/personal-tools/idea/agent-proxy/quick-start.md)
  - [package.json](file:///d:/Workspace/personal-tools/idea/agent-proxy/package.json)
  - [server.js](file:///d:/Workspace/personal-tools/idea/agent-proxy/server.js)
  - [server1.js](file:///d:/Workspace/personal-tools/idea/agent-proxy/server1.js)

---

## PHẦN 1 — INTAKE & PHÂN LOẠI (`intake`)

### 1.1. Bảng Phân Tách Thông Tin (Stated Facts vs. Explicit Assumptions)

| Mã | Phân Loại | Nội Dung Chi Tiết | Nguồn Trích Dẫn (File / Dòng) |
| :--- | :--- | :--- | :--- |
| `FACT-01` | **Stated Fact** | File `requirement.md` hiện đang trống (0 byte), nhưng toàn bộ ý đồ nghiệp vụ đã được hiện thực hóa trực tiếp trong `server.js`, `server1.js`, `package.json` và `quick-start.md`. | [requirement.md](file:///d:/Workspace/personal-tools/idea/agent-proxy/requirement.md), [server.js](file:///d:/Workspace/personal-tools/idea/agent-proxy/server.js) |
| `FACT-02` | **Stated Fact** | Ứng dụng sử dụng Node.js (`commonjs`), `express: ^5.2.1` và `axios: ^1.17.0`, khởi chạy cổng HTTP `3000` (`http://localhost:3000`) và mở endpoint `POST /v1/chat/completions` tương thích chuẩn OpenAI cho các IDE/Extension (như VS Code AI / Continue / Cline). | [package.json](file:///d:/Workspace/personal-tools/idea/agent-proxy/package.json#L13-L17), [server1.js](file:///d:/Workspace/personal-tools/idea/agent-proxy/server1.js#L11-L16) |
| `FACT-03` | **Stated Fact** | Proxy nhận request từ client, lọc sạch payload (`sanitizedBody` chỉ giữ `model`, `messages`, `temperature`, `max_tokens`, `stream`, `top_p`) và chuyển tiếp tới `https://generativelanguage.googleapis.com/v1/chat/completions` (hoặc `/v1beta/openai/chat/completions`) của Google AI Studio. | [server.js](file:///d:/Workspace/personal-tools/idea/agent-proxy/server.js#L16-L36) |
| `FACT-04` | **Stated Fact** | Trong `server1.js`, header gửi lên Google bao gồm song song cả `Authorization: Bearer ${currentKey}` và `"api-key": currentKey` để đảm bảo vượt qua gateway của Google. | [server1.js](file:///d:/Workspace/personal-tools/idea/agent-proxy/server1.js#L37-L41) |
| `FACT-05` | **Stated Fact** | Khi gặp mã lỗi `429` (Rate Limit) hoặc `500`, `502`, `503` hoặc lỗi mạng cục bộ, proxy tự động xoay sang API key kế tiếp trong mảng `API_KEYS` theo vòng tròn (`currentIndex = (currentIndex + 1) % API_KEYS.length`) cho tới khi thử hết `API_KEYS.length` lần thì trả về `HTTP 503 UNAVAILABLE`. | [server.js](file:///d:/Workspace/personal-tools/idea/agent-proxy/server.js#L27-L86) |
| `FACT-06` | **Stated Fact** | Hiện tại `const API_KEYS = []` đang bị hardcode rỗng trong cả `server.js` và `server1.js`, giới hạn body đang đặt `express.json({ limit: "50mb" })` và khi `stream: true` được truyền vào, `axios.post()` mặc định chờ toàn bộ chuỗi rồi gọi `res.json(response.data)` (làm hỏng chuẩn Server-Sent Events `text/event-stream`). | [server.js](file:///d:/Workspace/personal-tools/idea/agent-proxy/server.js#L5-L8), [server.js](file:///d:/Workspace/personal-tools/idea/agent-proxy/server.js#L24-L49) |
| `ASSUMP-01` | **Explicit Assumption** | Hai file `server.js` và `server1.js` là 2 bản nháp thử nghiệm cùng một mục đích; cần hợp nhất thành một kiến trúc chuẩn duy nhất theo mô hình `*Service` và `*ServiceHelper`, loại bỏ file dư thừa `server1.js` và đưa toàn bộ danh sách `API_KEYS` cùng cấu hình bảo mật vào `settings.json`. | Suy luận từ việc so sánh diff giữa `server.js` và `server1.js` |
| `ASSUMP-02` | **Explicit Assumption** | Các IDE AI (VS Code Continue, Cursor, Cline, Roo Code) gửi kèm `tools`, `tool_choice`, `response_format` và thường xuyên bật `stream: true` + gọi `GET /v1/models`. Proxy cần hỗ trợ passthrough an toàn cho SSE Streaming và các trường OpenAI Tool Calling hợp lệ của Gemini. | Suy luận từ comment dòng 16 [server1.js](file:///d:/Workspace/personal-tools/idea/agent-proxy/server1.js#L16) (`từ VS Code truyền sang`) |

### 1.2. Câu Hỏi Làm Rõ (Clarification Questions)

| Mã Câu Hỏi | Vấn Đề Cần Làm Rõ | Các Phương Án Lựa Chọn (Options) | Khuyến Nghị Của BA Team |
| :--- | :--- | :--- | :--- |
| `CLAR-01` | **Xử lý chế độ Streaming (`stream: true`) từ VS Code Extensions**: Hiện tại `axios.post` rồi `res.json` sẽ làm gãy kết nối khi client yêu cầu SSE stream. Chọn hướng xử lý nào? | - **Option A (Full SSE Pipe - Khuyến nghị)**: Khi `req.body.stream === true`, cấu hình Axios `responseType: "stream"`, giữ nguyên cơ chế xoay key nếu status ban đầu là `429/5xx`, và khi đạt `200 OK` thì pipe trực tiếp `text/event-stream` về client.<br>- **Option B**: Ép `sanitizedBody.stream = false` cho mọi request.<br>- **Option C**: Trả lỗi 400 nếu client bật `stream: true`. | **Khuyến nghị: Option A** — Hầu hết các Agent trên VS Code (Cline, Continue) bắt buộc dùng `stream: true`; hỗ trợ SSE pipe giúp proxy dùng mượt với mọi công cụ. |
| `CLAR-02` | **Cơ chế cách ly tạm thời (Cooldown Quarantine) cho Key bị `429`**: Hiện tại nếu Key #1 vừa bị `429`, request tiếp theo sau khi đi giáp vòng vẫn thử lại Key #1 ngay lập tức gây chậm trễ. Chọn cơ chế nào? | - **Option A**: Đánh dấu thời gian phạt (`cooldownUntil`) cho key bị `429` (ví dụ khóa tạm 60 giây), tự động nhảy qua key đang bị phạt; nếu tất cả key đều đang bị phạt thì chọn key sắp hết hạn phạt sớm nhất.<br>- **Option B**: Giữ vòng lặp tuần tự đơn giản không lưu trạng thái phạt.<br>- **Option C**: Xóa vĩnh viễn key bị `429` khỏi bộ nhớ cho đến khi khởi động lại server. | **Khuyến nghị: Option A** — Tăng tốc độ phản hồi lên gấp 3-5 lần khi một nửa số key trong bể đang chạm giới hạn RPM (Requests Per Minute) của Gemini Free Tier. |
| `CLAR-03` | **Bảo mật cổng Proxy Local (`CORS` & `Local Auth Token`)**: | - **Option A**: Chỉ bind vào `127.0.0.1` (chặn truy cập từ mạng LAN bên ngoài), kiểm tra `Authorization: Bearer <local_proxy_token>` từ `settings.json`, và giới hạn CORS cho localhost.<br>- **Option B**: Mở `0.0.0.0` không cần mật khẩu.<br>- **Option C**: Dùng Basic Auth. | **Khuyến nghị: Option A** — Tuân thủ chuẩn OpenAI SDK (`apiKey: "sk-local-proxy-..."`) để VS Code kết nối tự nhiên và ngăn chặn các trang web độc hại trên trình duyệt gọi lén vào `localhost:3000`. |

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1. Bảng Yêu Cầu Nghiệp Vụ & Truy Vết (Requirements Traceability Matrix)

| Mã Yêu Cầu | Mô Tả Yêu Cầu Nghiệp Vụ | Nguồn Gốc | Ưu Tiên (MoSCoW) |
| :--- | :--- | :--- | :--- |
| `REQ-001` | **Quản lý bể khóa (`Key Pool`) & Cấu hình từ `settings.json`**: Đọc danh sách Gemini API keys, `local_auth_token`, `upstream_url`, `port`, `bind_host` từ `settings.json`; từ chối khởi động hoặc báo trạng thái `EMPTY_KEY_POOL` rõ ràng nếu mảng key rỗng. | `FACT-05`, `FACT-06`, Rule 4 | `P0 (Must)` |
| `REQ-002` | **Xác thực Client Nội bộ & Chốt chặn CORS (`Auth & CORS Guard`)**: Kiểm tra header `Authorization: Bearer <local_auth_token>` (nếu `require_local_auth = true`) và chặn các preflight/origin lạ từ trình duyệt không nằm trong `allowed_origins`. | Phần 3 (`RISK-01`) | `P0 (Must)` |
| `REQ-003` | **Làm sạch & Chuẩn hóa Payload (`Payload Sanitizer`)**: Lọc và kiểm tra kiểu dữ liệu của `model`, `messages` (bắt buộc là mảng không rỗng), `temperature`, `max_tokens`, `stream`, `top_p`, `tools`, `tool_choice`, `response_format`; loại bỏ các thuộc tính lạ gây lỗi `HTTP 400` trên Google AI Studio. | `FACT-03`, [server.js](file:///d:/Workspace/personal-tools/idea/agent-proxy/server.js#L16-L25) | `P0 (Must)` |
| `REQ-004` | **Xoay vòng Key Thông minh có Cách ly Tạm thời (`Smart Key Rotation & Quarantine`)**: Khi upstream trả về `429`, `500`, `502`, `503` hoặc lỗi mạng, tự động chuyển sang key khỏe mạnh tiếp theo và đặt trạng thái `cooldownUntil` cho key vừa lỗi (`60s` cho `429`, `15s` cho `5xx`); đánh dấu `DEAD_KEY` nếu gặp `401/403` (key bị thu hồi). | `FACT-05`, `CLAR-02` | `P0 (Must)` |
| `REQ-005` | **Hỗ trợ cả JSON Đồng bộ và SSE Streaming (`stream: true/false`)**: Phản hồi chuẩn JSON khi `stream: false` và pipe luồng `text/event-stream` thời gian thực khi `stream: true` mà vẫn xoay được key nếu bước kết nối ban đầu gặp lỗi `429/5xx`. | `FACT-06`, `CLAR-01` | `P0 (Must)` |
| `REQ-006` | **Phân tách Lỗi Logic Client (`400/404/422`) không gây xoay Key vô ích**: Nếu Google trả về `400 Bad Request` hoặc `404 Model Not Found` (lỗi do payload của client chứ không phải do key), trả về ngay mã lỗi đó cho client mà không xoay qua toàn bộ các key còn lại. | `FACT-05`, [server1.js](file:///d:/Workspace/personal-tools/idea/agent-proxy/server1.js#L69-L72) | `P0 (Must)` |
| `REQ-007` | **Che dấu thông tin nhạy cảm trên Log (`Key Masking`)**: Mọi dòng log ra console hoặc trả về qua API chẩn đoán chỉ được hiển thị mã định danh key đã che (ví dụ `Key #1 [AIza...9xQp]`), tuyệt đối không in toàn bộ chuỗi API key. | Security Guidelines | `P1 (Should)` |
| `REQ-008` | **Endpoint Kiểm tra Sức khỏe & Danh sách Model (`GET /health` & `GET /v1/models`)**: Cung cấp `GET /health` trả về số lượng key `healthy / cooldown / dead` và `GET /v1/models` để VS Code kiểm tra kết nối thành công. | `ASSUMP-02` | `P1 (Should)` |
| `REQ-009` | **An toàn Đồng thời (`Concurrency-Safe Key Lease`)**: Đảm bảo khi VS Code bắn nhiều request song song (ví dụ Autocomplete + Chat cùng lúc), các request được phân bổ đều (Round-Robin Lease) chứ không dồn vào cùng 1 `currentIndex`. | Phần 3 (`RISK-03`) | `P1 (Should)` |
| `REQ-010` | **Giới hạn kích thước Body & Timeout Upstream**: Hạ giới hạn body mặc định từ `50mb` xuống mức hợp lý có thể cấu hình (`10mb`) và áp dụng `upstream_timeout_ms` (`60,000ms`) cho mỗi lần gọi Axios để tránh treo socket vô hạn. | `FACT-06`, Phần 3 (`RISK-04`) | `P2 (Could)` |

---

### 2.2. Data Structures, Constants & `settings.json` Schema

#### A. Định Nghĩa Types / Interfaces

```typescript
export enum KeyHealthStatus {
  HEALTHY = "HEALTHY",
  COOLDOWN = "COOLDOWN",
  DEAD = "DEAD",
}

export interface ApiKeyEntryConfig {
  label: string;
  key: string;
}

export interface ApiKeyRuntimeState {
  index: number;
  label: string;
  maskedKey: string;
  rawKey: string;
  status: KeyHealthStatus;
  cooldownUntilMs: number;
  totalRequests: number;
  successCount: number;
  rateLimitCount: number;
  lastErrorStatus: number | null;
}

export interface ProxyServerSettings {
  port: number;
  bind_host: string;
  body_limit: string;
  require_local_auth: boolean;
  local_auth_token: string;
  allowed_origins: string[];
}

export interface UpstreamSettings {
  chat_completions_url: string;
  models_url: string;
  timeout_ms: number;
  send_dual_auth_headers: boolean;
  rate_limit_cooldown_ms: number;
  server_error_cooldown_ms: number;
}

export interface AgentProxySettings {
  server: ProxyServerSettings;
  upstream: UpstreamSettings;
  api_keys: ApiKeyEntryConfig[];
}

export interface SanitizedChatCompletionPayload {
  model: string;
  messages: Array<{ role: string; content: unknown }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  top_p?: number;
  tools?: unknown[];
  tool_choice?: unknown;
  response_format?: unknown;
}
```

#### B. Bảng `CONSTANTS` & `ENUMS` (No Magic Numbers / No Hardcoded Strings)

| Tên Hằng Số (`CONSTANT_NAME`) | Giá Trị Mặc Định | Kiểu Dữ Liệu | Ý Nghĩa & Nơi Sử Dụng |
| :--- | :--- | :--- | :--- |
| `DEFAULT_PORT` | `3000` | `number` | Cổng lắng nghe mặc định của Proxy. |
| `DEFAULT_BIND_HOST` | `"127.0.0.1"` | `string` | Chỉ lắng nghe trên loopback để tránh lộ proxy ra mạng LAN/Wi-Fi công cộng. |
| `DEFAULT_BODY_LIMIT` | `"10mb"` | `string` | Giới hạn dung lượng JSON request body. |
| `DEFAULT_UPSTREAM_URL` | `"https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"` | `string` | Endpoint chuẩn OpenAI-compatibility của Google Gemini API (hỗ trợ cấu hình lại sang `/v1/chat/completions`). |
| `ROTATABLE_HTTP_STATUS_CODES` | `[429, 500, 502, 503, 504]` | `number[]` | Danh sách mã lỗi HTTP cho phép xoay sang key tiếp theo. |
| `FATAL_KEY_HTTP_STATUS_CODES` | `[401, 403]` | `number[]` | Mã lỗi báo hiệu chính API key đó không hợp lệ / bị khóa (xoay key và đánh dấu `DEAD`). |
| `DEFAULT_RATE_LIMIT_COOLDOWN_MS` | `60000` | `number` | Thời gian cách ly tạm thời (60 giây) cho key vừa dính lỗi `429`. |
| `DEFAULT_SERVER_ERROR_COOLDOWN_MS` | `15000` | `number` | Thời gian cách ly tạm thời (15 giây) cho key gặp lỗi `5xx` hoặc lỗi mạng. |
| `DEFAULT_UPSTREAM_TIMEOUT_MS` | `60000` | `number` | Timeout cho mỗi request gửi tới Google AI Studio (60 giây). |

#### C. Schema Chuẩn Của `settings.json`

```json
{
  "server": {
    "port": 3000,
    "bind_host": "127.0.0.1",
    "body_limit": "10mb",
    "require_local_auth": true,
    "local_auth_token": "sk-local-agent-proxy-secret-token",
    "allowed_origins": [
      "http://localhost",
      "http://127.0.0.1",
      "vscode-webview://"
    ]
  },
  "upstream": {
    "chat_completions_url": "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    "models_url": "https://generativelanguage.googleapis.com/v1beta/openai/models",
    "timeout_ms": 60000,
    "send_dual_auth_headers": true,
    "rate_limit_cooldown_ms": 60000,
    "server_error_cooldown_ms": 15000
  },
  "api_keys": [
    {
      "label": "free-tier-account-01",
      "key": "REPLACE_WITH_GEMINI_API_KEY_1"
    },
    {
      "label": "free-tier-account-02",
      "key": "REPLACE_WITH_GEMINI_API_KEY_2"
    }
  ]
}
```

---

### 2.3. Kiến Trúc Service & Helper (Rule 4 & Single Responsibility Principle)

| Tên File Module | Phân Loại | Hàm Thành Phần & Chữ Ký (Signature) | Docstring Mục Đích (1 Việc Duy Nhất - SRP) |
| :--- | :--- | :--- | :--- |
| `src/helpers/settingsServiceHelper.js` | `*ServiceHelper` | `loadProxySettings(settingsPath) -> AgentProxySettings` | Đọc và kiểm tra tính hợp lệ của `settings.json`, gán các giá trị mặc định từ `constants.js`. |
| `src/helpers/settingsServiceHelper.js` | `*ServiceHelper` | `maskApiKey(rawKey) -> string` | Che chuỗi API key chỉ hiển thị 4 ký tự đầu và 4 ký tự cuối (`AIza...9xQp`) để ghi log an toàn. |
| `src/helpers/payloadSanitizerServiceHelper.js` | `*ServiceHelper` | `validateAndSanitizeChatBody(rawBody) -> { isValid: boolean, error?: string, sanitizedBody?: SanitizedChatCompletionPayload }` | Kiểm tra `model` và `messages` hợp lệ, lọc giữ lại đúng các trường chuẩn OpenAI được Gemini hỗ trợ. |
| `src/helpers/securityGuardServiceHelper.js` | `*ServiceHelper` | `verifyClientAuthorization(authHeader, serverSettings) -> boolean` | Kiểm tra Bearer token từ client có khớp với `local_auth_token` hay không (dùng so sánh hằng thời gian `crypto.timingSafeEqual`). |
| `src/helpers/securityGuardServiceHelper.js` | `*ServiceHelper` | `isOriginAllowed(originHeader, allowedOrigins) -> boolean` | Kiểm tra header `Origin` chống tấn công CSRF/SSRF từ các trang web mở trên trình duyệt. |
| `src/services/keyPoolService.js` | `*Service` | `acquireNextAvailableKey() -> ApiKeyRuntimeState \| null` | Cấp phát key khỏe mạnh tiếp theo theo thuật toán Round-Robin có bỏ qua các key đang trong thời gian `COOLDOWN` hoặc `DEAD`. |
| `src/services/keyPoolService.js` | `*Service` | `reportKeyOutcome(keyIndex, statusCode, retryAfterHeader) -> void` | Cập nhật thống kê thành công hoặc đặt trạng thái `COOLDOWN` / `DEAD` dựa trên mã phản hồi từ Google. |
| `src/services/keyPoolService.js` | `*Service` | `getPoolHealthSnapshot() -> object` | Trả về báo cáo sức khỏe của toàn bộ các key (đã mask) phục vụ endpoint `GET /health`. |
| `src/services/upstreamForwarderService.js` | `*Service` | `forwardChatCompletionWithFailover(sanitizedBody, res) -> Promise<void>` | Thực hiện vòng lặp gọi Google AI Studio, tự động xoay key khi gặp `429/5xx` và hỗ trợ cả trả về JSON lẫn pipe luồng `SSE stream`. |

---

### 2.4. Ma Trận 5 Trạng Thái UX (IDE Client Response / Health Endpoint / Console Log)

| Trạng Thái UX | Hành Vi Tại IDE Client (OpenAI Format) | Hành Vi Tại `GET /health` & Console Log |
| :--- | :--- | :--- |
| **1. Ideal (Key đầu tiên phản hồi 200 OK)** | Nhận phản hồi JSON hoặc luồng SSE mượt mà đúng chuẩn OpenAI `/v1/chat/completions` với độ trễ tăng thêm `< 5ms`. | Console in: `✅ [Key #1 - free-tier-account-01 (AIza...1a2b)] 200 OK (model: gemini-2.5-flash, stream: true)`. `/health` báo `status: "HEALTHY"`, `healthyKeys: 2/2`. |
| **2. Loading / Failover In-Progress (Đang xoay Key)** | Kết nối của client được giữ nguyên trong khi proxy âm thầm chuyển từ Key #1 (bị 429) sang Key #2 (200 OK) trong vòng `< 300ms`. | Console in: `⚠️ [Key #1] HTTP 429 Rate Limit -> Quarantined for 60s. 🔄 Rotating to [Key #2]... -> ✅ [Key #2] 200 OK`. |
| **3. Empty (Chưa cấu hình API Key trong `settings.json`)** | Trả về ngay `HTTP 503` với JSON chuẩn OpenAI: `{"error": {"message": "Key pool is empty. Please add Gemini API keys to settings.json", "type": "configuration_error", "code": "EMPTY_KEY_POOL"}}`. | Console in cảnh báo nổi bật lúc khởi động: `🚨 [EMPTY_KEY_POOL] Không tìm thấy API key hợp lệ trong settings.json`. `/health` báo `status: "EMPTY_POOL"`, `totalKeys: 0`. |
| **4. Error (Tất cả Key đều hết hạn mức 429 hoặc Payload lỗi 400)** | - Nếu tất cả key đều lỗi: trả về `HTTP 503` kèm `Retry-After` (số giây ngắn nhất để 1 key trong bể hết cooldown).<br>- Nếu lỗi payload (`400`): trả về ngay `HTTP 400` kèm chi tiết lỗi từ Google mà không xoay key. | Console phân biệt rõ: `❌ [ALL_KEYS_EXHAUSTED] Đã thử hết 3/3 keys. Key sớm nhất hồi phục sau 18s` hoặc `⛔ [CLIENT_ERROR 400] Payload không hợp lệ - Dừng xoay key`. |
| **5. Partial / Overflow (Một số Key bị khóa / Request song song lớn)** | Hệ thống vẫn hoạt động bình thường trên các key còn sống (`Degraded Mode`); nếu body vượt quá `10mb` thì trả về `HTTP 413 Payload Too Large`. | `/health` báo `status: "DEGRADED"`, liệt kê rõ `healthy: 1, cooldown: 1, dead: 1` để người dùng biết key nào cần thay thế. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

| Mã Rủi Ro | Mô Tả Lỗ Hổng / Rủi Ro Thực Tế | Tác Động Nếu Không Chặn | Quy Tắc Khóa Chặn Kỹ Thuật (Mandatory Guardrail) |
| :--- | :--- | :--- | :--- |
| `RISK-01` | **Lỗ hổng Bảo mật CORS & Thiếu Xác thực Local (`Unauthenticated Localhost Proxy Abuse`)**: Trong `server.js` hiện tại, cổng `3000` bind trên toàn bộ giao diện mạng (`0.0.0.0`) và không yêu cầu bất kỳ token nào. Bất kỳ trang web độc hại nào người dùng mở trên trình duyệt hoặc bất kỳ máy nào cùng mạng Wi-Fi đều có thể bắn request vào `http://localhost:3000/v1/chat/completions` để xài chùa và đốt sạch quota Gemini API keys. | Toàn bộ bể key miễn phí bị vắt kiệt trong vài phút hoặc bị Google khóa tài khoản vì lạm dụng. | **Chốt chặn trong `securityGuardServiceHelper.js`**:<br>1. Mặc định bind cứng vào `127.0.0.1` (`DEFAULT_BIND_HOST`).<br>2. Bắt buộc kiểm tra `Authorization: Bearer <local_auth_token>` đối chiếu với `settings.json`.<br>3. Chặn mọi request có header `Origin` từ các trang web bên ngoài không nằm trong `allowed_origins`. |
| `RISK-02` | **Đứt gãy Streaming (`stream: true`) và Lỗi `ERR_HTTP_HEADERS_SENT`**: Khi IDE gửi `stream: true`, `server.js` hiện tại vẫn chờ toàn bộ chuỗi SSE trả về trong `response.data` rồi gọi `res.json()`, khiến IDE báo lỗi parse JSON. Ngược lại, nếu pipe stream mà stream bị đứt giữa chừng sau khi đã gửi header `200 OK`, vòng lặp `while` xoay key tiếp theo sẽ gọi `res.status()` lần 2 làm crash toàn bộ tiến trình Node.js (`ERR_HTTP_HEADERS_SENT`). | Proxy không dùng được với chế độ chat streaming của VS Code và dễ bị sập server. | **Chốt chặn Streaming trong `upstreamForwarderService.js`**:<br>1. Chỉ xoay key khi lỗi xảy ra **trước khi** `res.headersSent === true` (tức là bước handshake HTTP ban đầu trả về `429/5xx`).<br>2. Khi upstream trả về `200 OK` với `stream: true`, thiết lập header `Content-Type: text/event-stream` và pipe stream trực tiếp; nếu đứt luồng giữa chừng thì kết thúc chunk `res.end()` an toàn, tuyệt đối không xoay key lại khi header đã gửi. |
| `RISK-03` | **Hiệu ứng Dây chuyền Rate Limit (Thundering Herd) & Xoay Key Vô ích trên Lỗi `401/403`**: Nếu 1 key bị thu hồi (`401/403`) hoặc vừa bị `429` mà không được đánh dấu cách ly, mọi request tiếp theo khi quay vòng qua đều tiếp tục đập vào key chết đó, làm tăng gấp đôi độ trễ và khiến Google gia hạn thời gian phạt `429`. | Độ trễ mỗi lần gọi AI tăng lên 5-10 giây và gây khóa chéo toàn bộ bể key. | **Chốt chặn trong `keyPoolService.js`**:<br>1. Khi gặp `429`, đọc header `Retry-After` (hoặc mặc định `60,000ms`) để khóa tạm key đó (`status = COOLDOWN`).<br>2. Khi gặp `401` hoặc `403`, đánh dấu `status = DEAD` để loại khỏi vòng xoay cho tới khi người dùng cập nhật key mới. |
| `RISK-04` | **Tấn công Tràn bộ nhớ (`50mb` JSON Body) & Treo Socket Vô hạn (No Axios Timeout)**: `server.js` đang đặt `express.json({ limit: "50mb" })` và gọi `axios.post()` không có `timeout`. Nếu mạng tới Google bị treo nửa vời (half-open socket), vòng lặp sẽ bị treo vĩnh viễn không bao giờ xoay sang key thứ 2. | Tiến trình Node.js bị treo cứng hoặc tràn RAM khi gửi file đính kèm quá lớn. | **Chốt chặn Tài nguyên**:<br>1. Giới hạn body mặc định ở `10mb` trong `settings.json`.<br>2. Mọi lệnh gọi `axios.post` bắt buộc truyền `timeout: upstreamSettings.timeout_ms` (mặc định `60,000ms`) và `AbortSignal` gắn với sự kiện `req.on("close")` khi client hủy request. |

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1. Kịch Bản Kiểm Thử 3 Tầng (`Given / When / Then`)

#### Tầng 1: Happy Paths (Luồng Nghiệp Vụ Chuẩn)
- **`TEST-T1-001` (Chuyển tiếp thành công ở Key đầu tiên - Non-Streaming)**:
  - **Given**: Bể key có 3 keys khỏe mạnh (`Key #1`, `Key #2`, `Key #3`), client gửi `POST /v1/chat/completions` kèm `local_auth_token` hợp lệ và `stream: false`.
  - **When**: Mock Upstream Google phản hồi `200 OK` cho `Key #1`.
  - **Then**: Proxy trả về đúng JSON chuẩn OpenAI với status `200`, `successCount` của `Key #1` tăng lên `1` và con trỏ Round-Robin chuyển sang `Key #2` cho lượt kế tiếp.
- **`TEST-T1-002` (Tự động xoay Key khi gặp `429` và thành công ở Key tiếp theo)**:
  - **Given**: `Key #1` bị mock upstream trả về `HTTP 429 Too Many Requests`, `Key #2` trả về `200 OK`.
  - **When**: Client gửi 1 request `POST /v1/chat/completions`.
  - **Then**: Proxy tự động đặt `Key #1` vào trạng thái `COOLDOWN` (60s), thử ngay `Key #2` và trả về `200 OK` cho client trong cùng 1 request mà client không hề thấy lỗi.
- **`TEST-T1-003` (Hỗ trợ SSE Streaming `stream: true` sau khi xoay Key)**:
  - **Given**: Client gửi `stream: true`, `Key #1` trả về `503 Service Unavailable`, `Key #2` trả về `200 OK` với luồng SSE chunks `data: {"choices":[...]}\n\ndata: [DONE]\n\n`.
  - **When**: Proxy xử lý request.
  - **Then**: Proxy bỏ qua `Key #1`, kết nối thành công với `Key #2` và pipe nguyên vẹn từng chunk SSE với header `Content-Type: text/event-stream` về client.

#### Tầng 2: Negative / Network / Auth (Luồng Lỗi & Bảo Mật)
- **`TEST-T2-001` (Từ chối truy cập khi thiếu hoặc sai `local_auth_token` / sai `Origin`)**:
  - **Given**: `require_local_auth = true` trong `settings.json`.
  - **When**: Client gửi request không có header `Authorization` hoặc có header `Origin: https://malicious-site.com`.
  - **Then**: Proxy chặn ngay tại tầng middleware với `HTTP 401 Unauthorized` (hoặc `403 Forbidden`), tuyệt đối không gọi tới bất kỳ Gemini API key nào.
- **`TEST-T2-002` (Không xoay Key khi gặp lỗi Payload `400 Bad Request`)**:
  - **Given**: Bể có 3 keys, client gửi tên model sai hoặc payload không hợp lệ khiến Google trả về `HTTP 400`.
  - **When**: Proxy gọi `Key #1` và nhận `HTTP 400`.
  - **Then**: Proxy lập tức trả về `HTTP 400` kèm thông báo lỗi của Google cho client; `Key #1` vẫn giữ trạng thái `HEALTHY` và `Key #2`, `Key #3` không bị gọi thừa.
- **`TEST-T2-003` (Tất cả các Key trong bể đều thất bại `429/503`)**:
  - **Given**: Cả 3 keys đều trả về `429`.
  - **When**: Client gửi request.
  - **Then**: Sau khi thử đủ 3 keys, Proxy trả về `HTTP 503` kèm JSON lỗi chuẩn OpenAI và header `Retry-After` cho biết số giây còn lại tới khi key đầu tiên hết hạn cooldown.

#### Tầng 3: Boundary / Edge / Concurrency (Biên Độ & Tải Đồng Thời)
- **`TEST-T3-001` (Cách ly vĩnh viễn Key chết `401/403` khỏi vòng xoay)**:
  - **Given**: `Key #1` bị thu hồi và trả về `HTTP 403 Forbidden`, `Key #2` hoạt động bình thường.
  - **When**: Gửi 5 requests liên tiếp.
  - **Then**: Ở request đầu tiên, `Key #1` bị đánh dấu `DEAD`; cả 4 requests tiếp theo đều đi thẳng vào `Key #2` mà không bao giờ thử lại `Key #1`.
- **`TEST-T3-002` (An toàn đồng thời khi 10 requests bắn song song)**:
  - **Given**: Bể có 5 keys khỏe mạnh, client bắn đồng thời 10 requests (`Promise.all`).
  - **When**: Proxy phân phối tải.
  - **Then**: Mỗi key trong 5 keys nhận đúng 2 requests (phân bổ đều Round-Robin), không có hiện tượng cả 10 requests cùng lấy `index = 0`.
- **`TEST-T3-003` (Khởi động với mảng `api_keys` rỗng hoặc key chứa giá trị placeholder)**:
  - **Given**: `settings.json` có `api_keys: []` hoặc `"REPLACE_WITH_GEMINI_API_KEY_1"`.
  - **When**: Gọi `GET /health` và `POST /v1/chat/completions`.
  - **Then**: Các key placeholder bị lọc bỏ, `/health` trả về `status: "EMPTY_POOL"` và `/v1/chat/completions` trả về `503 EMPTY_KEY_POOL` ngay lập tức mà không rơi vào vòng lặp vô hạn hay chia lấy dư cho `0` (`% 0 = NaN`).

---

### 4.2. Quy Trình Kiểm Chứng 5 Bước (`Launch -> Doctor -> Drive -> Evidence -> Cleanup`)

1. **Bước 1 — `Launch`**: Khởi chạy Mock Gemini Upstream Server (giả lập đủ các mã `200 JSON`, `200 SSE Stream`, `400`, `403`, `429`, `503`) và khởi động `agent-proxy` trên cổng test cô lập.
2. **Bước 2 — `Doctor`**: Kiểm tra cú pháp `node --check`, xác thực `settings.json`, gọi `GET /health` xác nhận bể key sẵn sàng và kiểm tra không còn file rác `server1.js` gây nhầm lẫn.
3. **Bước 3 — `Drive`**: Thực thi bộ test tự động 3 tầng (`TEST-T1-001` đến `TEST-T3-003`), kiểm chứng xoay vòng key, cách ly cooldown, streaming SSE và chặn truy cập trái phép.
4. **Bước 4 — `Evidence`**: Thu thập log kết quả test pass 100%, snapshot JSON của `GET /health` trước và sau khi xoay key (chứng minh key đã được mask `AIza...` và bộ đếm `rateLimitCount` hoạt động chính xác).
5. **Bước 5 — `Cleanup`**: Đóng cả Proxy Server lẫn Mock Upstream Server, xóa file `settings.test.json`, trả lại trạng thái sạch cho workspace.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role Phụ Trách | File Mục Tiêu (1 File / Module) | Hàm / Thành Phần Cần Viết | Phụ Thuộc | Lệnh Verify & Definition of Done (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | `developer` | `idea/agent-proxy/src/constants.js` | Định nghĩa `KeyHealthStatus`, `ROTATABLE_HTTP_STATUS_CODES`, `FATAL_KEY_HTTP_STATUS_CODES` và toàn bộ hằng số mặc định (`DEFAULT_PORT`, `DEFAULT_BIND_HOST`, `DEFAULT_RATE_LIMIT_COOLDOWN_MS`...). | Không | **Verify**: `node -e "const c = require('./src/constants'); console.assert(c.DEFAULT_PORT === 3000)"`<br>**DoD**: Không còn bất kỳ magic number/string nào ngoài file này. |
| `TASK-002` | `developer` | `idea/agent-proxy/settings.json` & `src/helpers/settingsServiceHelper.js` | Tạo `settings.json` chuẩn (kèm `.gitignore` và `settings.example.json`); viết `loadProxySettings()` và `maskApiKey()` (lọc bỏ các key rỗng hoặc chứa `"REPLACE_WITH_"`). | `TASK-001` | **Verify**: `node --test tests/settingsServiceHelper.test.js`<br>**DoD**: Đọc cấu hình chuẩn, che key thành dạng `AIza...xxxx`, xử lý an toàn khi mảng key rỗng. |
| `TASK-003` | `developer` | `idea/agent-proxy/src/helpers/securityGuardServiceHelper.js` | Viết `verifyClientAuthorization()` (dùng `crypto.timingSafeEqual`) và `isOriginAllowed()` kèm Express middleware bảo vệ endpoint. | `TASK-001` | **Verify**: `node --test tests/securityGuardServiceHelper.test.js`<br>**DoD**: Chặn 100% request thiếu/sai Bearer token hoặc sai Origin với mã `401/403`. |
| `TASK-004` | `developer` | `idea/agent-proxy/src/helpers/payloadSanitizerServiceHelper.js` | Viết `validateAndSanitizeChatBody()` kiểm tra `model`, `messages` và lọc giữ lại các tham số chuẩn OpenAI (`temperature`, `max_tokens`, `stream`, `top_p`, `tools`, `tool_choice`, `response_format`). | `TASK-001` | **Verify**: `node --test tests/payloadSanitizerServiceHelper.test.js`<br>**DoD**: Loại bỏ các trường rác từ IDE, trả lỗi `400` rõ ràng nếu thiếu `model` hoặc `messages` rỗng. |
| `TASK-005` | `developer` | `idea/agent-proxy/src/services/keyPoolService.js` | Viết class/factory `KeyPoolService` với `acquireNextAvailableKey()`, `reportKeyOutcome()`, `getSoonestCooldownRemainingSec()` và `getPoolHealthSnapshot()`. | `TASK-001`, `TASK-002` | **Verify**: `node --test tests/keyPoolService.test.js`<br>**DoD**: Không bao giờ chia lấy dư cho `0`, cách ly đúng key bị `429` (cooldown) và `401/403` (dead), phân tải đều khi gọi song song. |
| `TASK-006` | `developer` | `idea/agent-proxy/src/services/upstreamForwarderService.js` | Viết `forwardChatCompletionWithFailover()` hỗ trợ gửi song song `Authorization` + `api-key`, tự động xoay key trên lỗi `429/5xx`, hỗ trợ cả JSON lẫn SSE `stream: true` và gắn `AbortController` khi client đóng kết nối. | `TASK-004`, `TASK-005` | **Verify**: `node --test tests/upstreamForwarderService.test.js`<br>**DoD**: Xoay key mượt mà cho cả JSON và SSE Stream, không bao giờ gây lỗi `ERR_HTTP_HEADERS_SENT`. |
| `TASK-007` | `developer` | `idea/agent-proxy/server.js` (và dọn bỏ bản nháp trùng `server1.js`) | Hợp nhất logic từ `server.js` và `server1.js` vào `server.js` (gọi các Services/Helpers mới), bổ sung `GET /health` và `GET /v1/models`, bind mặc định vào `127.0.0.1`. | `TASK-003`, `TASK-006` | **Verify**: `node --check server.js`<br>**DoD**: `server.js` gọn sạch dưới 80 dòng, chỉ làm nhiệm vụ khởi tạo Express routes và gọi Services. |
| `TASK-008` | `test_engineer` | `idea/agent-proxy/tests/e2eProxyFailover.test.js` | Viết bộ kiểm thử tự động 3 tầng (`TEST-T1-001`..`TEST-T3-003`) dùng `node:test` tích hợp sẵn của Node.js và cập nhật script `"test": "node --test"` trong `package.json`. | `TASK-007` | **Verify**: `npm test`<br>**DoD**: Pass 100% cả 9 kịch bản kiểm thử 3 tầng, hoàn tất quy trình 5 bước `Launch -> Doctor -> Drive -> Evidence -> Cleanup`. |
