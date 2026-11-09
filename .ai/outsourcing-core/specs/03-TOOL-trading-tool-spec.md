# Tài Liệu Đặc Tả Thực Thi: Trading Signal Alert & Chrome Tracker (`trading-tool`)

- **Mã Dự Án**: `TRADING-TOOL-004`
- **Phân Nhóm**: Nhóm 4 — Trading, Market Intelligence & Utility Extensions
- **Đội Ngũ Phụ Trách**: Squad 4 — BA Team (`intake`, `ba`, `requirement_challenger`) & PM Team (`orchestrator`, `estimator_cost_controller`) + QA/Test (`test_engineer`, `qa_reviewer`)
- **Trạng Thái Tài Liệu**: `READY FOR EXECUTION` (Đã qua cổng kiểm duyệt độc lập)
- **Nguồn Đối Chiếu Thực Tế**:
  - [requirement.md](file:///d:/Workspace/personal-tools/idea/trading-tool/requirement.md)
  - [trading-tool.md](file:///d:/Workspace/personal-tools/idea/trading-tool/trading-tool.md)
  - [AGENT_STATE.md](file:///d:/Workspace/personal-tools/idea/trading-tool/AGENT_STATE.md)
  - [REFACTORING_SUMMARY.md](file:///d:/Workspace/personal-tools/idea/trading-tool/REFACTORING_SUMMARY.md)
  - Codebase hiện có: [main.py](file:///d:/Workspace/personal-tools/idea/trading-tool/main.py), [api_client.py](file:///d:/Workspace/personal-tools/idea/trading-tool/api_client.py), [signal_analyzer.py](file:///d:/Workspace/personal-tools/idea/trading-tool/signal_analyzer.py), [telegram_notifier.py](file:///d:/Workspace/personal-tools/idea/trading-tool/telegram_notifier.py), [state_manager.py](file:///d:/Workspace/personal-tools/idea/trading-tool/state_manager.py), [settings_loader.py](file:///d:/Workspace/personal-tools/idea/trading-tool/settings_loader.py), [settings.json](file:///d:/Workspace/personal-tools/idea/trading-tool/settings.json), và thư mục `chrome-extension/`.

---

## PHẦN 1 — INTAKE & PHÂN LOẠI (`intake`)

### 1.1. Bảng Phân Tách Thông Tin (Stated Facts vs. Explicit Assumptions)

| Mã | Phân Loại | Nội Dung Chi Tiết | Nguồn Trích Dẫn (File / Dòng) |
| :--- | :--- | :--- | :--- |
| `FACT-01` | **Stated Fact** | Cần tạo công cụ cảnh báo khi trang `https://signals.turtletrading.vn/chart/btc` đổi hướng `SHORT` / `LONG` qua Telegram, hoạt động 24/7 theo interval time. | [requirement.md](file:///d:/Workspace/personal-tools/idea/trading-tool/requirement.md#L1) |
| `FACT-02` | **Stated Fact** | Option 2: Nhận thấy đổi hướng trực tiếp trên trình duyệt và phát thông báo trên máy tính (Desktop Notification qua Chrome Extension). | [requirement.md](file:///d:/Workspace/personal-tools/idea/trading-tool/requirement.md#L4), [IMPLEMENTATION_SUMMARY.md](file:///d:/Workspace/personal-tools/idea/trading-tool/chrome-extension/IMPLEMENTATION_SUMMARY.md#L25-L37) |
| `FACT-03` | **Stated Fact** | Nguồn dữ liệu Backend Python lấy từ API JSON `https://data.signals.turtletrading.vn/api/liqheatmap/btc.json` với `timeout_seconds = 10`. | [trading-tool.md](file:///d:/Workspace/personal-tools/idea/trading-tool/trading-tool.md#L53), [settings.json](file:///d:/Workspace/personal-tools/idea/trading-tool/settings.json#L6-L9) |
| `FACT-04` | **Stated Fact** | Công thức xác định hướng tại Backend Python: Đếm số mức giá (`price_bins`) lớn hơn `current_price` (`levels_above` - kháng cự) và nhỏ hơn `current_price` (`levels_below` - hỗ trợ). Nếu `levels_above > levels_below * direction_threshold_ratio` (mặc định `1.2`) là `LONG`; ngược lại `levels_below > levels_above * 1.2` là `SHORT`; còn lại là `NEUTRAL`. | [REFACTORING_SUMMARY.md](file:///d:/Workspace/personal-tools/idea/trading-tool/REFACTORING_SUMMARY.md#L180-L192), [signal_analyzer.py](file:///d:/Workspace/personal-tools/idea/trading-tool/signal_analyzer.py#L108-L134) |
| `FACT-05` | **Stated Fact** | Chrome Extension trích xuất tín hiệu trực tiếp từ DOM bằng biểu thức XPath `//*[@id="tp-pos-body"]/tr/td[1]/span` với chu kỳ quét mặc định 5 giây (`5000ms`), lưu tối đa 100 lịch sử vào `chrome.storage`. | [IMPLEMENTATION_SUMMARY.md](file:///d:/Workspace/personal-tools/idea/trading-tool/chrome-extension/IMPLEMENTATION_SUMMARY.md#L25-L36) |
| `FACT-06` | **Stated Fact** | Dự án đã được refactor bước đầu sang cấu trúc modular (`main.py`, `api_client.py`, `signal_analyzer.py`, `telegram_notifier.py`, `state_manager.py`, `settings_loader.py`) và lưu cấu hình trong `settings.json`, trạng thái trong `signal_state.json`. File `AGENT_STATE.md` hiện đang trống (0 byte). | [REFACTORING_SUMMARY.md](file:///d:/Workspace/personal-tools/idea/trading-tool/REFACTORING_SUMMARY.md#L17-L25), [AGENT_STATE.md](file:///d:/Workspace/personal-tools/idea/trading-tool/AGENT_STATE.md) |
| `FACT-07` | **Stated Fact** | Yêu cầu chi phí vận hành bằng **0 VND** (sử dụng Python, Telegram Bot API miễn phí, GitHub Actions cron hoặc Oracle Cloud Always Free VM). | [trading-tool.md](file:///d:/Workspace/personal-tools/idea/trading-tool/trading-tool.md#L7-L15) |
| `ASSUMP-01` | **Explicit Assumption** | Mặc dù codebase đã chia 6 file Python nhưng tên file và cấu trúc hiện tại chưa tuân thủ nghiêm ngặt quy ước chuẩn `*Service` / `*ServiceHelper` và chưa có bộ chống nhiễu (Anti-Flapping / Hysteresis + Cooldown) khi giá BTC giật quanh ngưỡng `threshold_ratio`. Do đó cần chuẩn hóa sang kiến trúc `*Service` và `*ServiceHelper` có đầy đủ Anti-Flapping. | Suy luận từ yêu cầu chuẩn hóa Rule 4 & SRP và hiện trạng [signal_analyzer.py](file:///d:/Workspace/personal-tools/idea/trading-tool/signal_analyzer.py) |
| `ASSUMP-02` | **Explicit Assumption** | Chuyển tiếp qua trạng thái trung gian `NEUTRAL` (ví dụ `LONG -> NEUTRAL -> LONG` khi giá dao động nhẹ) không được phép bắn cảnh báo đảo chiều giả, trừ khi người dùng bật cấu hình nhận thông báo `NEUTRAL`. | Suy luận từ nghiệp vụ giao dịch Crypto thực tế để tránh cảnh báo rác |
| `ASSUMP-03` | **Explicit Assumption** | Khi chạy trên GitHub Actions (stateless runner), file `signal_state.json` sẽ bị mất sau mỗi lần chạy nếu không commit ngược lại repo hoặc lưu vào GitHub Actions Cache / Gist / Artifact. Cần cơ chế lưu trữ trạng thái bền vững giữa các chu kỳ cron. | Suy luận từ [trading-tool.md](file:///d:/Workspace/personal-tools/idea/trading-tool/trading-tool.md#L18-L29) và [state_manager.py](file:///d:/Workspace/personal-tools/idea/trading-tool/state_manager.py#L17) |

### 1.2. Câu Hỏi Làm Rõ (Clarification Questions)

| Mã Câu Hỏi | Vấn Đề Cần Làm Rõ | Các Phương Án Lựa Chọn (Options) | Khuyến Nghị Của BA Team |
| :--- | :--- | :--- | :--- |
| `CLAR-01` | **Đồng bộ nguồn sự thật (Source of Truth) giữa Backend Python và Chrome Extension**: Hiện tại Python tính `LONG/SHORT` bằng tỷ lệ `price_bins` (`1.2x`) từ API `btc.json`, trong khi Chrome Extension đọc text trực tiếp tại XPath `//*[@id="tp-pos-body"]/tr/td[1]/span` trên giao diện web. Hai nguồn này có thể cho kết quả lệch nhau tại cùng một thời điểm. Chọn hướng nào? | - **Option A**: Giữ nguyên 2 chế độ độc lập (Python phân tích Liquidity Heatmap `btc.json`; Extension đọc XPath bảng vị thế DOM), nhưng ghi rõ nhãn nguồn (`[HEATMAP-API]` vs `[DOM-POS]`) trong thông báo.<br>- **Option B**: Đồng nhất cả Python và Extension cùng đọc API `btc.json` và dùng chung công thức `threshold_ratio`.<br>- **Option C**: Dùng headless browser (Playwright) ở Python để đọc đúng XPath DOM như Extension. | **Khuyến nghị: Option A** — Vừa bảo toàn tốc độ nhẹ 0đ của Python HTTP client, vừa tận dụng lợi thế đọc vị thế trực tiếp trên DOM của Extension mà không tốn RAM chạy Playwright. |
| `CLAR-02` | **Xử lý khi tín hiệu chuyển sang `NEUTRAL`**: Khi hướng chuyển từ `LONG -> NEUTRAL` hoặc `SHORT -> NEUTRAL`, hệ thống có gửi cảnh báo Telegram không? | - **Option A**: Chỉ gửi cảnh báo khi đảo chiều thực sự giữa `LONG <-> SHORT` (hoặc từ `NEUTRAL` sang `LONG`/`SHORT` khác với hướng xác lập gần nhất); bỏ qua thông báo khi rơi vào vùng đệm `NEUTRAL`.<br>- **Option B**: Gửi cảnh báo cho mọi sự thay đổi kể cả `NEUTRAL`.<br>- **Option C**: Cho phép cấu hình cờ `notify_on_neutral: boolean` trong `settings.json` (mặc định `false`). | **Khuyến nghị: Option C** (mặc định hành vi như Option A) — Ngăn chặn 80% tin nhắn nhiễu khi thị trường đi ngang (sideway), đồng thời linh hoạt cấu hình. |
| `CLAR-03` | **Lưu trữ `signal_state.json` khi chạy 24/7**: Chủ dự án muốn ưu tiên cơ chế chạy định kỳ nào làm mặc định? | - **Option A**: Chạy Daemon Loop / Cron trực tiếp trên máy local hoặc VPS (Oracle Free VM) dùng file `signal_state.json` cục bộ có file-lock.<br>- **Option B**: Chạy trên GitHub Actions mỗi 15 phút và tự động commit/cache `signal_state.json`.<br>- **Option C**: Hỗ trợ cả hai thông qua tham số `--mode once` (cho cron/CI) và `--mode daemon` (cho VPS/Local). | **Khuyến nghị: Option C** — Thiết kế CLI hỗ trợ cả `--mode once` và `--mode daemon` để chạy được ở mọi môi trường miễn phí. |

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1. Bảng Yêu Cầu Nghiệp Vụ & Truy Vết (Requirements Traceability Matrix)

| Mã Yêu Cầu | Mô Tả Yêu Cầu Nghiệp Vụ | Nguồn Gốc | Ưu Tiên (MoSCoW) |
| :--- | :--- | :--- | :--- |
| `REQ-001` | **Thu thập dữ liệu Liquidity Heatmap**: Gửi HTTP GET tới endpoint `btc.json` của TurtleTrading với bộ headers chuẩn và timeout cấu hình trong `settings.json`, hỗ trợ retry tối đa 3 lần với exponential backoff khi lỗi mạng tạm thời. | `FACT-03`, [api_client.py](file:///d:/Workspace/personal-tools/idea/trading-tool/api_client.py) | `P0 (Must)` |
| `REQ-002` | **Xác thực cấu trúc Payload & Giá hợp lệ**: Kiểm tra dữ liệu trả về phải có `current_price > 0` và mảng `price_bins` không rỗng, tất cả phần tử là số thực dương trước khi phân tích. | `FACT-04`, [signal_analyzer.py](file:///d:/Workspace/personal-tools/idea/trading-tool/signal_analyzer.py#L164) | `P0 (Must)` |
| `REQ-003` | **Phân tích hướng thị trường (Direction Calculation)**: Đếm số lượng `levels_above` (`bin > current_price`) và `levels_below` (`bin < current_price`), áp dụng ngưỡng `direction_threshold_ratio` để phân loại `LONG`, `SHORT`, hoặc `NEUTRAL`. | `FACT-04`, [REFACTORING_SUMMARY.md](file:///d:/Workspace/personal-tools/idea/trading-tool/REFACTORING_SUMMARY.md#L180) | `P0 (Must)` |
| `REQ-004` | **Chống nhiễu tín hiệu (Anti-Flapping & Hysteresis)**: Yêu cầu tín hiệu mới phải duy trì qua `confirmation_Required_Count` chu kỳ liên tiếp (hoặc vượt biên độ hysteresis `hysteresis_buffer_ratio`) và tôn trọng thời gian chờ `cooldown_seconds` giữa 2 lần bắn cảnh báo để chống spam khi giá BTC giật râu nến. | `ASSUMP-01`, Phần 3 (`RISK-01`) | `P0 (Must)` |
| `REQ-005` | **Quản lý trạng thái bền vững & Atomic Write**: Đọc/ghi file `signal_state.json` theo cơ chế atomic (ghi ra file `.tmp` rồi `os.replace`) để không làm hỏng JSON khi tiến trình bị ngắt đột ngột; lưu kèm `last_confirmed_direction`, `consecutive_count`, và `last_alert_timestamp`. | `FACT-06`, [state_manager.py](file:///d:/Workspace/personal-tools/idea/trading-tool/state_manager.py) | `P0 (Must)` |
| `REQ-006` | **Gửi cảnh báo Telegram an toàn**: Gửi thông báo HTML qua Telegram Bot API khi phát hiện đổi hướng hợp lệ; tự động escape dữ liệu động, kiểm tra `alert_enabled`, và xử lý HTTP 429 (`retry_after`) từ Telegram. | `FACT-01`, [telegram_notifier.py](file:///d:/Workspace/personal-tools/idea/trading-tool/telegram_notifier.py) | `P0 (Must)` |
| `REQ-007` | **Quản lý cấu hình tập trung (`settings.json`)**: Toàn bộ thông tin nhạy cảm (`bot_token`, `chat_id`) và tham số thuật toán phải đọc từ `settings.json` thông qua `SettingsLoaderServiceHelper`, tuyệt đối không hardcode trong source code. | `FACT-06`, [settings_loader.py](file:///d:/Workspace/personal-tools/idea/trading-tool/settings_loader.py) | `P0 (Must)` |
| `REQ-008` | **Điều phối chu kỳ chạy 24/7 (CLI & Daemon Mode)**: Hỗ trợ chạy đơn lẻ (`--once`) cho GitHub Actions/Cron và chạy vòng lặp liên tục (`--daemon`) với `poll_interval_seconds` cấu hình sẵn, bắt tín hiệu `SIGINT/SIGTERM` để thoát êm (graceful shutdown). | `FACT-01`, `CLAR-03`, [main.py](file:///d:/Workspace/personal-tools/idea/trading-tool/main.py) | `P1 (Should)` |
| `REQ-009` | **Giám sát DOM trên trình duyệt (Chrome Extension)**: Content script theo dõi XPath `//*[@id="tp-pos-body"]/tr/td[1]/span` (kèm fallback selector), gửi message về Background Service Worker để hiển thị Desktop Notification và cập nhật Badge (`LONG`/`SHORT`). | `FACT-02`, `FACT-05` | `P1 (Should)` |
| `REQ-010` | **Quản lý lịch sử & Thống kê trên Popup Extension**: Lưu tối đa 100 biến động tín hiệu vào `chrome.storage.local`, hiển thị 10 biến động gần nhất, bộ đếm thống kê `LONG`/`SHORT`/`NEUTRAL` và nút `Pause/Resume` trên Popup UI. | `FACT-05`, [IMPLEMENTATION_SUMMARY.md](file:///d:/Workspace/personal-tools/idea/trading-tool/chrome-extension/IMPLEMENTATION_SUMMARY.md#L225-L256) | `P2 (Could)` |

---

### 2.2. Data Structures, Constants & `settings.json` Schema

#### A. Định Nghĩa Types / Interfaces (Python `TypedDict` / TypeScript-equivalent Schema)

```python
from enum import Enum
from typing import List, Optional, TypedDict


class MarketDirection(str, Enum):
    LONG = "LONG"
    SHORT = "SHORT"
    NEUTRAL = "NEUTRAL"


class TelegramSettings(TypedDict):
    bot_token: str
    chat_id: str
    parse_mode: str
    request_timeout_seconds: int


class ApiSettings(TypedDict):
    url: str
    timeout_seconds: int
    max_retries: int
    retry_backoff_seconds: float
    max_payload_bytes: int


class SignalSettings(TypedDict):
    direction_threshold_ratio: float
    hysteresis_buffer_ratio: float
    confirmation_required_count: int
    cooldown_seconds: int
    poll_interval_seconds: int
    alert_enabled: bool
    notify_on_neutral: bool


class BrowserExtensionSettings(TypedDict):
    target_url_pattern: str
    primary_xpath: str
    fallback_css_selector: str
    dom_poll_interval_ms: int
    max_history_items: int


class AppSettings(TypedDict):
    telegram: TelegramSettings
    api: ApiSettings
    signal: SignalSettings
    browser_extension: BrowserExtensionSettings


class RawSignalPayload(TypedDict):
    symbol: str
    current_price: float
    price_bins: List[float]


class SignalAnalysisResult(TypedDict):
    symbol: str
    current_price: float
    levels_above: int
    levels_below: int
    computed_ratio: float
    raw_direction: MarketDirection
    analyzed_at_iso: str


class PersistedSignalState(TypedDict):
    direction: MarketDirection
    candidate_direction: Optional[MarketDirection]
    candidate_consecutive_count: int
    price: float
    timestamp: str
    last_alert_timestamp: Optional[str]
```

#### B. Bảng `CONSTANTS` & `ENUMS` (No Magic Numbers / No Hardcoded Strings)

| Tên Hằng Số (`CONSTANT_NAME`) | Giá Trị Mặc Định | Kiểu Dữ Liệu | Ý Nghĩa & Nơi Sử Dụng |
| :--- | :--- | :--- | :--- |
| `DEFAULT_SETTINGS_FILENAME` | `"settings.json"` | `str` | Tên file cấu hình chuẩn tại thư mục gốc dự án. |
| `DEFAULT_STATE_FILENAME` | `"signal_state.json"` | `str` | Tên file lưu trạng thái tín hiệu liền trước. |
| `TEMP_STATE_FILE_SUFFIX` | `".tmp"` | `str` | Hậu tố file tạm phục vụ ghi atomic (`signal_state.json.tmp`). |
| `DEFAULT_DIRECTION_THRESHOLD_RATIO` | `1.2` | `float` | Ngưỡng chênh lệch 20% số lượng mức cản trên/dưới để xác lập hướng. |
| `DEFAULT_HYSTERESIS_BUFFER_RATIO` | `0.05` | `float` | Biên độ trễ (5%) chống nhảy trạng thái liên tục tại ranh giới `1.2`. |
| `DEFAULT_CONFIRMATION_REQUIRED_COUNT` | `2` | `int` | Số chu kỳ liên tiếp cùng hướng mới trước khi chốt đổi hướng. |
| `DEFAULT_COOLDOWN_SECONDS` | `300` | `int` | Thời gian khóa gửi cảnh báo tối thiểu giữa 2 lần đổi hướng (5 phút). |
| `DEFAULT_API_TIMEOUT_SECONDS` | `10` | `int` | Timeout tối đa cho mỗi HTTP request tới TurtleTrading / Telegram. |
| `MAX_API_PAYLOAD_BYTES` | `15728640` | `int` | Giới hạn kích thước JSON tải về (15 MB - do `data.json` thực tế nặng ~8.9MB). |
| `CHROME_MAX_HISTORY_ITEMS` | `100` | `int` | Số bản ghi lịch sử tối đa lưu trong `chrome.storage.local`. |

#### C. Schema Chuẩn Của `settings.json`

```json
{
  "telegram": {
    "bot_token": "REPLACE_WITH_TELEGRAM_BOT_TOKEN",
    "chat_id": "REPLACE_WITH_TELEGRAM_CHAT_ID",
    "parse_mode": "HTML",
    "request_timeout_seconds": 10
  },
  "api": {
    "url": "https://data.signals.turtletrading.vn/api/liqheatmap/btc.json",
    "timeout_seconds": 10,
    "max_retries": 3,
    "retry_backoff_seconds": 2.0,
    "max_payload_bytes": 15728640
  },
  "signal": {
    "direction_threshold_ratio": 1.2,
    "hysteresis_buffer_ratio": 0.05,
    "confirmation_required_count": 2,
    "cooldown_seconds": 300,
    "poll_interval_seconds": 300,
    "alert_enabled": true,
    "notify_on_neutral": false
  },
  "browser_extension": {
    "target_url_pattern": "https://signals.turtletrading.vn/chart/btc*",
    "primary_xpath": "//*[@id='tp-pos-body']/tr/td[1]/span",
    "fallback_css_selector": "#tp-pos-body tr td:first-child span",
    "dom_poll_interval_ms": 5000,
    "max_history_items": 100
  }
}
```

---

### 2.3. Kiến Trúc Service & Helper (Rule 4 & Single Responsibility Principle)

Để tuân thủ chặt chẽ Rule 4 (tách biệt rõ `*Service` điều phối nghiệp vụ và `*ServiceHelper` xử lý thuần hàm/parsing/validation), cấu trúc module được chuẩn hóa như sau:

| Tên File Module | Phân Loại | Hàm Thành Phần & Chữ Ký (Signature) | Docstring Mục Đích (1 Việc Duy Nhất - SRP) |
| :--- | :--- | :--- | :--- |
| `settings_loader_service_helper.py` | `*ServiceHelper` | `load_raw_settings_file(file_path: Path) -> dict` | Đọc và parse JSON từ `settings.json`, ném lỗi rõ ràng nếu thiếu file hoặc sai cú pháp JSON. |
| `settings_loader_service_helper.py` | `*ServiceHelper` | `validate_settings_schema(raw_data: dict) -> AppSettings` | Kiểm tra sự tồn tại và kiểu dữ liệu của các khóa `telegram`, `api`, `signal`, gán giá trị mặc định từ `CONSTANTS`. |
| `api_client_service_helper.py` | `*ServiceHelper` | `build_turtle_request_headers() -> dict[str, str]` | Tạo bộ HTTP headers chuẩn (User-Agent, Cache-Control) chống cache dữ liệu cũ. |
| `api_client_service_helper.py` | `*ServiceHelper` | `validate_raw_signal_payload(payload: dict) -> RawSignalPayload` | Xác thực payload trả về từ API có chứa `current_price > 0` và `price_bins` hợp lệ. |
| `api_client_service.py` | `*Service` | `fetch_btc_signal_data(api_config: ApiSettings) -> Optional[RawSignalPayload]` | Thực hiện HTTP GET với retry/backoff, kiểm tra giới hạn dung lượng `max_payload_bytes` và gọi helper validate payload. |
| `signal_analyzer_service_helper.py` | `*ServiceHelper` | `count_levels_above_price(price_bins: List[float], current_price: float) -> int` | Đếm số lượng mức kháng cự (`price_level > current_price`). |
| `signal_analyzer_service_helper.py` | `*ServiceHelper` | `count_levels_below_price(price_bins: List[float], current_price: float) -> int` | Đếm số lượng mức hỗ trợ (`price_level < current_price`). |
| `signal_analyzer_service_helper.py` | `*ServiceHelper` | `determine_direction_with_hysteresis(levels_above: int, levels_below: int, threshold_ratio: float, hysteresis_buffer: float, previous_direction: Optional[MarketDirection]) -> MarketDirection` | Tính toán hướng `LONG`/`SHORT`/`NEUTRAL` có áp dụng vùng đệm trễ (hysteresis) để tránh nhảy tín hiệu liên tục. |
| `signal_analyzer_service.py` | `*Service` | `analyze_current_direction(payload: RawSignalPayload, signal_config: SignalSettings, previous_direction: Optional[MarketDirection]) -> SignalAnalysisResult` | Điều phối quá trình trích xuất giá, đếm mức cản và trả về `SignalAnalysisResult` hoàn chỉnh. |
| `state_manager_service_helper.py` | `*ServiceHelper` | `evaluate_transition_and_cooldown(prev_state: Optional[PersistedSignalState], current_result: SignalAnalysisResult, signal_config: SignalSettings) -> tuple[bool, PersistedSignalState]` | Đánh giá xem hướng mới đã đủ số lần xác nhận liên tiếp (`confirmation_required_count`) và vượt qua `cooldown_seconds` để bắn alert hay chưa. |
| `state_manager_service.py` | `*Service` | `load_persisted_state(state_path: Path) -> Optional[PersistedSignalState]` | Đọc trạng thái từ `signal_state.json`, tự động phục hồi an toàn nếu file chưa tồn tại hoặc bị hỏng. |
| `state_manager_service.py` | `*Service` | `save_persisted_state_atomically(state_path: Path, state: PersistedSignalState) -> bool` | Ghi trạng thái mới vào file `.tmp` và thực hiện `os.replace` sang `signal_state.json`. |
| `telegram_notifier_service_helper.py` | `*ServiceHelper` | `format_direction_change_html(previous_direction: MarketDirection, analysis: SignalAnalysisResult) -> str` | Tạo nội dung tin nhắn HTML chuẩn kèm emoji, tỷ lệ `levels_above/levels_below`, giá hiện tại và link biểu đồ. |
| `telegram_notifier_service.py` | `*Service` | `send_direction_change_alert(telegram_config: TelegramSettings, previous_direction: MarketDirection, analysis: SignalAnalysisResult) -> bool` | Gửi POST request tới Telegram Bot API, xử lý lỗi 400/401/429 và trả về kết quả gửi. |

---

### 2.4. Ma Trận 5 Trạng Thái UX (CLI Console / Telegram / Chrome Extension Popup)

| Trạng Thái UX | Hành Vi Tại CLI / Log (`main.py`) | Hành Vi Tại Telegram Bot | Hành Vi Tại Chrome Extension Popup |
| :--- | :--- | :--- | :--- |
| **1. Ideal (Hoạt động chuẩn)** | In bảng phân tích rõ ràng: Giá BTC (`$77,088.08`), `Levels Above` vs `Levels Below`, hướng hiện tại (`LONG`/`SHORT`), trạng thái xác nhận (`Confirmed 2/2`) và lưu `signal_state.json`. | Nhận tin nhắn HTML định dạng sắc nét chỉ khi có đảo chiều đã xác nhận: tiêu đề emoji `📈 BTC SIGNAL CHANGED`, hướng cũ -> hướng mới, giá USD, tỷ lệ mức cản và link mở chart. | Badge trên icon hiển thị `LONG` (nền xanh lá `#10B981`) hoặc `SHORT` (nền đỏ `#EF4444`), Popup hiện tín hiệu hiện tại, thời gian cập nhật gần nhất, bộ đếm thống kê và 10 lịch sử gần nhất. |
| **2. Loading (Đang tải / Khởi tạo)** | In trạng thái `📡 Fetching signal data from TurtleTrading API (attempt 1/3)...` kèm timestamp. | Không gửi tin nhắn khi đang tải để tránh làm phiền người dùng. | Hiển thị trạng thái `⏳ Đang kết nối DOM biểu đồ...` (hoặc `Detecting...` trong 5 giây đầu khi trang TurtleTrading đang render bảng vị thế). |
| **3. Empty (Chưa có dữ liệu trước đó / Lần chạy đầu)** | Khi chưa có `signal_state.json`, in `ℹ️ First run initialized: Baseline direction set to LONG. No transition alert sent.` và khởi tạo file state. | Không bắn cảnh báo giả trong lần chạy khởi tạo đầu tiên (`previous_direction is None`). | Danh sách lịch sử hiển thị `Chưa có biến động tín hiệu nào được ghi nhận` và các bộ đếm `LONG: 0 | SHORT: 0 | NEUTRAL: 0`. |
| **4. Error (Lỗi mạng / API / DOM thay đổi)** | In mã lỗi cụ thể (`[ERR_API_TIMEOUT]`, `[ERR_INVALID_TELEGRAM_CREDENTIALS]`), giữ nguyên `signal_state.json` cũ (không ghi đè bằng `None`), trả về exit code khác 0 nếu ở chế độ `--once`. | Nếu lỗi từ API nguồn liên tiếp quá 5 chu kỳ, gửi 1 cảnh báo kỹ thuật duy nhất `[SYSTEM WARNING] Không lấy được dữ liệu BTC sau 5 lần thử`. | Khi không tìm thấy XPath `//*[@id="tp-pos-body"]/tr/td[1]/span` (do chưa mở đúng tab hoặc web đổi giao diện), Badge hiện `!` màu cam và Popup báo `⚠️ Không tìm thấy phần tử tín hiệu trên trang. Hãy mở hoặc tải lại trang TurtleTrading BTC`. |
| **5. Partial / Overflow (Dữ liệu quá lớn / Nhiễu liên tục)** | Khi file JSON từ API lớn (~9MB) hoặc có tín hiệu đang chờ xác nhận (`Candidate SHORT 1/2`), in `⏳ Candidate direction SHORT (1/2 confirmations) - Holding previous LONG` hoặc `🛡️ Cooldown active (180s remaining)`. | Tuyệt đối khóa gửi tin nhắn trùng lặp trong thời gian Cooldown; gộp thông tin nếu có biến động nhanh. | Khi lịch sử vượt quá `100` bản ghi, tự động cắt bỏ các bản ghi cũ nhất (`slice(0, 100)`) trong `chrome.storage.local` và chỉ render 10 dòng đầu trong Popup kèm thanh cuộn gọn. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

| Mã Rủi Ro | Mô Tả Lỗ Hổng / Rủi Ro Thực Tế | Tác Động Nếu Không Chặn | Quy Tắc Khóa Chặn Kỹ Thuật (Mandatory Guardrail) |
| :--- | :--- | :--- | :--- |
| `RISK-01` | **Flapping Signal Spam khi giá BTC giật râu nến quanh ngưỡng `1.2x`**: Khi giá BTC dao động chỉ vài chục USD qua lại một cụm `price_bins`, tỷ lệ `levels_above / levels_below` sẽ nhảy liên tục qua ngưỡng `1.20` (ví dụ `1.21 -> 1.19 -> 1.21 -> 1.18`), gây bão tin nhắn Telegram (`LONG -> NEUTRAL -> LONG` hoặc `LONG -> SHORT -> LONG`) mỗi vài phút. | Người dùng bị spam hàng chục thông báo giả, mất niềm tin vào công cụ hoặc bị Telegram khóa bot (`HTTP 429 Too Many Requests`). | **Chốt chặn 3 lớp trong `StateManagerServiceHelper`**:<br>1. **Hysteresis**: Để thoát khỏi `LONG` cần tỷ lệ tụt xuống dưới `threshold_ratio - hysteresis_buffer_ratio` (`1.15`), không phải `1.20`.<br>2. **Confirmation Window**: Hướng mới phải xuất hiện liên tiếp `confirmation_required_count = 2` lần kiểm tra.<br>3. **Cooldown Lock**: Khoảng cách tối thiểu giữa 2 lần gửi Telegram là `cooldown_seconds = 300`, và mặc định bỏ qua chuyển tiếp dừng ở `NEUTRAL` (`notify_on_neutral = false`). |
| `RISK-02` | **Payload `btc.json` khổng lồ (~8.9 MB) gây nghẽn RAM & Timeout**: Thực tế file [data.json](file:///d:/Workspace/personal-tools/idea/trading-tool/data.json) mẫu trong thư mục dự án nặng tới **8,922,354 bytes (~8.9 MB)** vì chứa toàn bộ ma trận heatmap lịch sử, trong khi công cụ chỉ cần `current_price` và `price_bins`. | Tải toàn bộ JSON không kiểm soát kích thước dễ gây timeout 10s hoặc tràn bộ nhớ trên VPS cấu hình thấp (Oracle Free 1GB RAM). | **Chốt chặn trong `ApiClientService`**:<br>1. Bật header `Accept-Encoding: gzip, deflate` để nén đường truyền xuống còn ~500KB.<br>2. Kiểm tra kích thước stream phản hồi không vượt quá `MAX_API_PAYLOAD_BYTES` (15 MB).<br>3. Giải phóng ngay các trường ma trận nặng (`data`, `heatmap_matrix`) ngay sau khi trích xuất `current_price` và `price_bins`. |
| `RISK-03` | **Mất hoặc hỏng trạng thái `signal_state.json` (State Corruption / Stateless CI)**: Ghi trực tiếp `json.dump()` đè lên `signal_state.json` như code hiện tại ([state_manager.py](file:///d:/Workspace/personal-tools/idea/trading-tool/state_manager.py#L86)) sẽ tạo file 0 byte nếu tiến trình bị kill giữa chừng. Ngoài ra, nếu API lỗi tạm thời mà cập nhật state sẽ làm mất dấu hướng trước đó. | File state bị hỏng làm lần chạy kế tiếp tưởng là `First run` (`previous_direction = None`) và **nuốt mất cảnh báo đảo chiều** quan trọng. | **Chốt chặn trong `StateManagerService`**:<br>1. Chỉ cập nhật `signal_state.json` khi phân tích thành công.<br>2. Bắt buộc dùng **Atomic File Write**: ghi vào `signal_state.json.tmp`, flush đĩa, sau đó gọi `os.replace()`.<br>3. Nếu gửi Telegram thất bại do mạng khi đã xác nhận đổi hướng, không được cập nhật `direction` mới vào state để chu kỳ sau tự động gửi bù. |
| `RISK-04` | **Đứt gãy XPath DOM trên Chrome Extension & Lộ Token trong Repo**: Trang `signals.turtletrading.vn` là SPA có thể render trễ hoặc đổi cấu trúc bảng `#tp-pos-body`, khiến XPath cứng `//*[@id="tp-pos-body"]/tr/td[1]/span` trả về `null`. Đồng thời `settings.json` chứa `bot_token` rất dễ bị commit nhầm lên GitHub. | Extension im lặng không báo lỗi khi DOM đổi; Bot Token bị lộ công khai trên GitHub khiến kẻ xấu chiếm quyền điều khiển kênh tín hiệu. | **Chốt chặn Bảo mật & DOM**:<br>1. Extension phải có fallback CSS selector + bộ đếm `consecutiveDomMisses`; nếu quá 6 lần (30s) không thấy phần tử phải đổi Badge sang `!` cảnh báo.<br>2. Tạo `settings.example.json` cho Git và bắt buộc thêm `settings.json` vào `.gitignore`, đồng thời hỗ trợ đọc fallback từ biến môi trường khi chạy trên GitHub Actions Secrets. |

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1. Kịch Bản Kiểm Thử 3 Tầng (`Given / When / Then`)

#### Tầng 1: Happy Paths (Luồng Nghiệp Vụ Chuẩn)
- **`TEST-T1-001` (Khởi tạo lần đầu - First Run Baseline)**:
  - **Given**: File `signal_state.json` chưa tồn tại, API trả về `current_price = 75000` với `10` mức giá trên và `4` mức giá dưới (`10 > 4 * 1.2`).
  - **When**: Chạy `run_signal_check()`.
  - **Then**: Hệ thống xác định hướng `LONG`, khởi tạo `signal_state.json` với `direction = "LONG"`, **không** gọi Telegram API và trả về `True`.
- **`TEST-T1-002` (Phát hiện đảo chiều hợp lệ `LONG -> SHORT` sau khi đủ xác nhận)**:
  - **Given**: `signal_state.json` đang lưu `direction = "LONG"`, `candidate_direction = "SHORT"`, `candidate_consecutive_count = 1`, hết thời gian cooldown, và API trả về `3` mức trên / `9` mức dưới (`SHORT`).
  - **When**: Chạy `run_signal_check()` ở chu kỳ thứ 2 liên tiếp.
  - **Then**: Hệ thống xác nhận đủ `2/2` chu kỳ `SHORT`, gửi 1 tin nhắn HTML qua Telegram (`📈 LONG → 📉 SHORT`), cập nhật `direction = "SHORT"` và `last_alert_timestamp` vào `signal_state.json`.
- **`TEST-T1-003` (Chrome Extension phát hiện đổi hướng trên DOM)**:
  - **Given**: Trang `https://signals.turtletrading.vn/chart/btc` đang mở, phần tử XPath `//*[@id="tp-pos-body"]/tr/td[1]/span` đổi nội dung từ `"LONG"` sang `"SHORT"`.
  - **When**: Chu kỳ quét DOM (5s) của `content-script.js` kích hoạt.
  - **Then**: `background.js` tạo Desktop Notification, đổi chữ trên Badge thành `"SHORT"`, tăng bộ đếm `SHORT` thêm 1 và thêm bản ghi mới vào đầu danh sách lịch sử trong `chrome.storage.local`.

#### Tầng 2: Negative / Network / Auth (Luồng Lỗi & Xác Thực)
- **`TEST-T2-001` (API TurtleTrading bị Timeout hoặc trả về HTTP 502)**:
  - **Given**: `signal_state.json` đang ở trạng thái `LONG`, API `btc.json` bị timeout sau `10s` cả 3 lần retry.
  - **When**: Chạy `run_signal_check()`.
  - **Then**: Hàm `fetch_btc_signal_data()` trả về `None`, chương trình ghi log lỗi rõ ràng, **bảo toàn nguyên vẹn** file `signal_state.json` (`direction = "LONG"`), không gửi cảnh báo sai.
- **`TEST-T2-002` (Thiếu hoặc sai `bot_token` / `chat_id` trong `settings.json`)**:
  - **Given**: `settings.json` có `bot_token = ""` hoặc Telegram trả về `HTTP 401 Unauthorized`.
  - **When**: Hệ thống phát hiện đổi hướng hợp lệ và gọi `send_direction_change_alert()`.
  - **Then**: `TelegramNotifierService` trả về `False`, in hướng dẫn kiểm tra `settings.json`, và `StateManagerService` **không** ghi đè `direction` mới để bảo đảm lần chạy sau (khi đã sửa token) vẫn gửi được cảnh báo.
- **`TEST-T2-003` (File `signal_state.json` bị hỏng cú pháp JSON)**:
  - **Given**: File `signal_state.json` chứa chuỗi rác `"{corrupted_json"`.
  - **When**: Gọi `load_persisted_state()`.
  - **Then**: Hệ thống không bị crash (`JSONDecodeError` được bắt an toàn), đổi tên file lỗi sang `signal_state.json.bak` và xử lý như lần chạy khởi tạo mới.

#### Tầng 3: Boundary / Edge / Concurrency (Biên Độ, Chống Nhiễu & Tải Lớn)
- **`TEST-T3-001` (Biên độ chính xác tại ngưỡng `threshold_ratio = 1.2` & `current_price` trùng `price_bin`)**:
  - **Given**: `current_price = 75000`, `price_bins` có 1 phần tử bằng đúng `75000`, `6` phần tử `> 75000` và `5` phần tử `< 75000` (tỷ lệ `6 / 5 = 1.20`, không lớn hơn nghiêm ngặt `1.20`).
  - **When**: Gọi `determine_direction_with_hysteresis()`.
  - **Then**: Phần tử bằng `75000` không được tính vào cả `above` lẫn `below`; phép so sánh `6 > 5 * 1.2` (`6 > 6.0`) trả về `False`, giữ trạng thái `NEUTRAL` (hoặc giữ hướng cũ nếu đang nằm trong vùng hysteresis).
- **`TEST-T3-002` (Chống Flapping khi giá giật `LONG -> SHORT -> LONG` trong 1 chu kỳ)**:
  - **Given**: Hướng đã xác nhận là `LONG`, `confirmation_required_count = 2`. Chu kỳ 1 xuất hiện `SHORT` (`count = 1/2`), ngay chu kỳ 2 quay lại `LONG`.
  - **When**: Chạy liên tiếp 2 chu kỳ kiểm tra.
  - **Then**: Không có bất kỳ tin nhắn Telegram nào được gửi đi; ở chu kỳ 2 `candidate_direction` được reset về `None` và `candidate_consecutive_count = 0`.
- **`TEST-T3-003` (Xử lý file dữ liệu thực tế `data.json` 8.9 MB & Giới hạn 100 bản ghi Extension)**:
  - **Given**: Đọc dữ liệu từ file mẫu `idea/trading-tool/data.json` (8.9 MB) và danh sách lịch sử Extension đang có sẵn 100 phần tử.
  - **When**: Chạy phân tích dữ liệu và đẩy phần tử lịch sử thứ 101 vào Extension storage.
  - **Then**: Quá trình phân tích Python hoàn tất dưới `500ms`, tiêu thụ RAM tăng thêm `< 35MB`; mảng lịch sử trong `chrome.storage.local` giữ đúng độ dài `100` (phần tử cũ thứ 100 bị đẩy ra).

---

### 4.2. Quy Trình Kiểm Chứng 5 Bước (`Launch -> Doctor -> Drive -> Evidence -> Cleanup`)

1. **Bước 1 — `Launch` (Khởi tạo môi trường cô lập)**:
   - Tạo môi trường ảo Python và nạp cấu hình test cùng mock server trả về `data.json` (8.9 MB) tại cổng cục bộ `http://127.0.0.1:8765/btc.json`.
2. **Bước 2 — `Doctor` (Kiểm tra sức khỏe cấu hình & dependencies)**:
   - Chạy lệnh kiểm tra schema `settings.json`, quyền đọc/ghi thư mục state và cú pháp toàn bộ các file `.py` / `.js`:
     `python -m py_compile main.py *_service.py *_service_helper.py`
3. **Bước 3 — `Drive` (Thực thi kịch bản tự động 3 tầng)**:
   - Chạy bộ `pytest` kích hoạt đầy đủ 9 kịch bản (`TEST-T1-001` đến `TEST-T3-003`) bao gồm giả lập chuỗi tín hiệu flapping và giả lập lỗi mạng/Telegram 429.
4. **Bước 4 — `Evidence` (Thu thập bằng chứng QA)**:
   - Lưu log console, kết quả pass 100% của `pytest -v`, ảnh chụp/dump nội dung `signal_state.json` sau từng bước chuyển trạng thái và payload HTML đã gửi tới mock Telegram endpoint.
5. **Bước 5 — `Cleanup` (Dọn dẹp hiện trường)**:
   - Tắt mock HTTP server, xóa toàn bộ file tạm (`signal_state.json.tmp`, `signal_state.test.json`, `__pycache__`), đảm bảo `git status` sạch tuyệt đối.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role Phụ Trách | File Mục Tiêu (1 File / Module) | Hàm / Thành Phần Cần Viết | Phụ Thuộc | Lệnh Verify & Definition of Done (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | `developer` | `idea/trading-tool/constants.py` | Định nghĩa enum `MarketDirection`, các `TypedDict` (`AppSettings`, `RawSignalPayload`, `SignalAnalysisResult`, `PersistedSignalState`) và toàn bộ hằng số `DEFAULT_*`, `MAX_API_PAYLOAD_BYTES`. | Không | **Verify**: `python -c "import constants; assert constants.DEFAULT_DIRECTION_THRESHOLD_RATIO == 1.2"`<br>**DoD**: Không có bất kỳ magic number/string nào ngoài file này; pass type-check. |
| `TASK-002` | `developer` | `idea/trading-tool/settings_loader_service_helper.py` | Viết `load_raw_settings_file()`, `validate_settings_schema()`, `get_telegram_credentials()`, `get_api_config()`, `get_signal_config()`. | `TASK-001` | **Verify**: `pytest tests/test_settings_loader.py`<br>**DoD**: Đọc chuẩn `settings.json`, tự điền giá trị mặc định cho khóa mới (`hysteresis_buffer_ratio`, `cooldown_seconds`), báo lỗi rõ nếu thiếu file. |
| `TASK-003` | `developer` | `idea/trading-tool/api_client_service_helper.py` | Viết `build_turtle_request_headers()` và `validate_raw_signal_payload(payload)` (kiểm tra `current_price > 0`, lọc giữ lại duy nhất `symbol`, `current_price`, `price_bins` để giải phóng RAM khỏi ma trận 8.9MB). | `TASK-001` | **Verify**: `pytest tests/test_api_client_helper.py`<br>**DoD**: Payload 8.9MB từ `data.json` sau khi qua hàm validate chỉ giữ lại 3 trường cần thiết, từ chối mọi payload thiếu giá hoặc `price_bins` rỗng. |
| `TASK-004` | `developer` | `idea/trading-tool/api_client_service.py` | Viết `fetch_btc_signal_data(api_config)` hỗ trợ `gzip`, kiểm tra `max_payload_bytes`, và retry `max_retries` lần với exponential backoff. | `TASK-002`, `TASK-003` | **Verify**: `pytest tests/test_api_client_service.py`<br>**DoD**: Xử lý êm các lỗi `Timeout`, `ConnectionError`, `HTTPError`, tự động retry đúng số lần cấu hình. |
| `TASK-005` | `developer` | `idea/trading-tool/signal_analyzer_service_helper.py` | Viết `count_levels_above_price()`, `count_levels_below_price()`, và `determine_direction_with_hysteresis()` áp dụng cả `threshold_ratio` lẫn `hysteresis_buffer_ratio`. | `TASK-001` | **Verify**: `pytest tests/test_signal_analyzer_helper.py`<br>**DoD**: Mỗi hàm làm đúng 1 việc (SRP), có docstring chuẩn, xử lý đúng trường hợp biên `price_level == current_price` và vùng trễ hysteresis. |
| `TASK-006` | `developer` | `idea/trading-tool/signal_analyzer_service.py` | Viết `analyze_current_direction(payload, signal_config, previous_direction)` trả về `SignalAnalysisResult` đầy đủ. | `TASK-005` | **Verify**: `pytest tests/test_signal_analyzer_service.py`<br>**DoD**: Phân tích chính xác file thực tế `data.json` trong `< 500ms` và trả về đầy đủ số mức cản trên/dưới cùng tỷ lệ. |
| `TASK-007` | `developer` | `idea/trading-tool/state_manager_service_helper.py` | Viết `evaluate_transition_and_cooldown(prev_state, current_result, signal_config)` kiểm tra đủ `confirmation_required_count`, khóa `cooldown_seconds` và lọc `NEUTRAL`. | `TASK-001` | **Verify**: `pytest tests/test_state_manager_helper.py`<br>**DoD**: Chặn 100% hiện tượng flapping 1 chu kỳ (`LONG -> SHORT -> LONG`) và chặn gửi trùng trong thời gian cooldown. |
| `TASK-008` | `developer` | `idea/trading-tool/state_manager_service.py` | Viết `load_persisted_state()` (chống crash khi JSON lỗi) và `save_persisted_state_atomically()` (ghi qua `.tmp` + `os.replace`). | `TASK-007` | **Verify**: `pytest tests/test_state_manager_service.py`<br>**DoD**: Đảm bảo atomic write, tự backup file state hỏng sang `.bak` mà không làm dừng chương trình. |
| `TASK-009` | `developer` | `idea/trading-tool/telegram_notifier_service_helper.py` & `telegram_notifier_service.py` | Viết `format_direction_change_html()` (escape HTML an toàn) và `send_direction_change_alert()` (hỗ trợ xử lý HTTP 429 `retry_after`). | `TASK-002`, `TASK-006` | **Verify**: `pytest tests/test_telegram_notifier.py`<br>**DoD**: Tin nhắn HTML hiển thị đúng định dạng, không làm cập nhật state nếu việc gửi Telegram thất bại. |
| `TASK-010` | `developer` & `test_engineer` | `idea/trading-tool/main.py` & `idea/trading-tool/tests/test_e2e_signal_flow.py` | Cập nhật `main.py` hỗ trợ tham số `--mode once|daemon` và viết bộ test E2E 3 tầng kiểm chứng toàn trình. | `TASK-004`, `TASK-006`, `TASK-008`, `TASK-009` | **Verify**: `pytest -v idea/trading-tool/tests/`<br>**DoD**: Pass 100% tất cả kịch bản Tầng 1, Tầng 2, Tầng 3; hoàn tất quy trình 5 bước `Launch -> Doctor -> Drive -> Evidence -> Cleanup`. |
