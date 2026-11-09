# 00A — LỘ TRÌNH ƯU TIÊN THỰC THI TOÀN DANH MỤC (TỪ PROJECT ĐẾN TASK NHỎ NHẤT)

> **Quy tắc Sắp xếp Bất di Bất dịch (Ưu tiên từ dễ & nhanh nhất đến phức tạp nhất):**
> 1. **TIME (Thời gian ngắn nhất trước):** Ưu tiên dự án đã có sẵn 70–80% code nền tảng hoặc chỉ cần vài file là chạy.
> 2. **EFFORT (Công sức thấp nhất trước):**
>    - **2a. Mức độ cần AI:** `Không cần AI (0% AI - Thuần Code/Regex/Toán)` $\rightarrow$ `AI Text nhẹ (Free Tier)` $\rightarrow$ `AI Chụp hình (Vision) / Suy luận đa chiều chuyên sâu`.
>    - **2b. Loại hình sản phẩm:** `(1) Chrome Extension` $\rightarrow$ `(2) Small Tool / Bot / Script` $\rightarrow$ `(3) Web` $\rightarrow$ `(4) Full App`.
> 3. **COST (Chi phí vận hành hàng tháng):** Ưu tiên làm nhóm **`$0 (Free 100%)` $\rightarrow$ `<= $10/tháng`** trước. Các dự án **`4. App` lớn/tốn kém (#18 $\rightarrow$ #22)** đẩy về cuối để Agent BA & PM lúc nào rảnh thì tự động đọc và làm mịn yêu cầu dần.

---

## PHẦN I: BẢNG XẾP HẠNG 22 FILE DỰ ÁN THEO THỨ TỰ TĂNG DẦN (`01` $\rightarrow$ `22`)

### ĐỢT 1 (`01` $\rightarrow$ `07`): LÀM NGAY (QUICK WINS) — Không cần AI (0% AI) | Chi phí $0/tháng | Extension & Small Tool
*Đặc điểm: Không tốn 1 đồng tiền AI nào khi chạy, không phụ thuộc hạ tầng đắt tiền, nhiều dự án đã có sẵn code nền tảng chỉ cần hoàn thiện và viết test.*

| Thứ tự & File Spec | Dự án (`idea/*`) | Loại SP (1–4) | Cần dùng AI không? | Cost / Tháng | Thời gian dự kiến | Hiện trạng Code |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **[01-EXT-bank-qr-extension-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/01-EXT-bank-qr-extension-spec.md)** | [`bank-qr-extension`](file:///d:/Workspace/personal-tools/idea/bank-qr-extension) | **1. Extension** | **KHÔNG (0% AI)** *(Thuần Regex + VietQR)* | **$0 (Free)** | **~45 phút** | Đã có 4 file (`manifest.json`, `content.js`...). Chỉ cần vá lỗi XSS, chống bắt nhầm khung chat P2P & viết test. |
| **[02-EXT-best-buy-supplies-tool-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/02-EXT-best-buy-supplies-tool-spec.md)** *(Phase 1: Extension)* | [`best-buy-supplies-tool`](file:///d:/Workspace/personal-tools/idea/best-buy-supplies-tool) | **1. Extension** *(+ 2. Tool)* | **KHÔNG (0% AI)** *(Thuần DOM Queue)* | **$0 (Free)** | **~60 phút** *(Phase 1)* | Đã có sẵn `manifest.json`, `background.js`, `content.js`, `popup.js`. Chỉ cần sửa lỗi mở đúp tab & timeout 15s. |
| **[03-TOOL-trading-tool-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/03-TOOL-trading-tool-spec.md)** | [`trading-tool`](file:///d:/Workspace/personal-tools/idea/trading-tool) | **2. Small Tool** *(+ 1. Ext)* | **KHÔNG (0% AI)** *(Toán học ngưỡng `1.2x`)* | **$0 (Free)** *(GitHub Action + Tele)* | **~60 phút** | Đã code 80% bằng Python (`main.py`, `signal_analyzer.py`...). Chỉ cần thêm chống nhiễu râu nến (Hysteresis) & test. |
| **[04-TOOL-agent-proxy-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/04-TOOL-agent-proxy-spec.md)** | [`agent-proxy`](file:///d:/Workspace/personal-tools/idea/agent-proxy) | **2. Small Tool** | **KHÔNG (0% AI)** *(Chỉ xoay vòng API key)* | **$0 (Free)** *(Chạy Local)* | **~60 phút** | Đã có `server.js` & `server1.js`. Chỉ cần gộp thành 1, thêm khóa bảo mật Bearer Token `127.0.0.1` & giữ SSE Stream. |
| **[05-TOOL-expense-management-tool-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/05-TOOL-expense-management-tool-spec.md)** | [`expense-management-tool`](file:///d:/Workspace/personal-tools/idea/expense-management-tool) | **2. Small Tool** *(Apps Script)* | **KHÔNG (0% AI)** *(Đọc tab `Config` + Regex)* | **$0 (Free)** *(Google Sheets)* | **~1.5 giờ** | Chạy miễn phí hoàn toàn trên Google Apps Script, phân loại đa ngân hàng (Chase, BoA, Venmo) không cần gọi LLM. |
| **[06-TOOL-find-job-tool-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/06-TOOL-find-job-tool-spec.md)** | [`find-job-tool`](file:///d:/Workspace/personal-tools/idea/find-job-tool) | **2. Small Tool** | **KHÔNG (0% AI)** *(Từ khóa 8 ngành nghề)* | **$0 (Free)** *(Tele + Gmail)* | **~2 giờ** | Tạo mới các file `*Service.js` gọn nhẹ: Quét Craigslist (`jjj`/`ggg`), lọc từ khóa, chống báo trùng & gửi Telegram/Email. |
| **[07-TOOL-dm-jobs-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/07-TOOL-dm-jobs-spec.md)** | [`dm-jobs`](file:///d:/Workspace/personal-tools/idea/dm-jobs) | **2. Small Tool** | **KHÔNG (0% AI)** *(Kịch bản Q&A mẫu)* | **$0 (Free)** *(Cam kết $0)* | **~2.5 giờ** | Import CSV/Google Maps, chuẩn hóa SĐT, gửi lời chào theo ngành, tự động khóa khi HR nhắn `STOP`, báo mail khi cần người thật trả lời. |

---

### ĐỢT 2 (`08` $\rightarrow$ `12`): SMALL TOOLS & STATIC WEB — Không cần AI (hoặc AI Text rất nhẹ) | Chi phí $0 – $2/tháng

| Thứ tự & File Spec | Dự án (`idea/*`) | Loại SP (1–4) | Cần dùng AI không? | Cost / Tháng | Thời gian dự kiến | Điểm nhấn thực thi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **[08-TOOL-cheap-flight-tool-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/08-TOOL-cheap-flight-tool-spec.md)** | [`cheap-flight-tool`](file:///d:/Workspace/personal-tools/idea/cheap-flight-tool) | **2. Small Tool** | **KHÔNG (0% AI)** *(Quy đổi `lbs -> kg` + Giá)* | **$0 (Free Tier)** | **~2 giờ** | Tái sử dụng 70% code thông báo Telegram & Dedup từ dự án `06-find-job-tool`. |
| **[09-TOOL-university-schoolership-tool-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/09-TOOL-university-schoolership-tool-spec.md)** | [`university-schoolership-tool`](file:///d:/Workspace/personal-tools/idea/university-schoolership-tool) | **2. Small Tool** | **KHÔNG (0% AI)** *(Quy đổi GPA 10 $\rightarrow$ 4.0)* | **$0 (Free)** | **~2 giờ** | Tái sử dụng bộ gửi Gmail + Telegram từ dự án `06-find-job-tool`. |
| **[10-TOOL-detecting-new-nails-competitors-tool-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/10-TOOL-detecting-new-nails-competitors-tool-spec.md)** | [`detecting-new-nails-competitors-tool`](file:///d:/Workspace/personal-tools/idea/detecting-new-nails-competitors-tool) | **2. Small Tool** | **KHÔNG (0% AI)** *(Toán tọa độ Haversine)* | **$0 (Free Credit)** | **~2.5 giờ** | Quét bán kính $\le 100\text{ miles}$ lấy tổng Review/Rating Google Maps & tương tác bài mới nhất FB/IG. |
| **[11-TOOL-facebook-auto-poster-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/11-TOOL-facebook-auto-poster-spec.md)** | [`facebook-auto-poster`](file:///d:/Workspace/personal-tools/idea/facebook-auto-poster) | **2. Small Tool** | **ÍT (AI Text nhẹ)** *(Chỉ viết vài dòng caption)* | **$0 – $2/tháng** | **~3 giờ** | Đã có `fb_gui.py` chạy được. Xử lý ảnh (Pillow) & video 9:16 (FFmpeg) bằng code 100%, chỉ gọi Gemini viết caption theo Brand Kit. |
| **[12-WEB-note-tool-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/12-WEB-note-tool-spec.md)** | [`note-tool`](file:///d:/Workspace/personal-tools/idea/note-tool) | **3. Web** *(Static 3D)* | **KHÔNG (0% AI)** *(Thuần HTML/JS/Three.js)* | **$0 (Free)** *(GitHub Pages)* | **~3 giờ** | Không cần Backend hay AI; chạy trực tiếp trên trình duyệt và lưu trữ miễn phí trên GitHub. |

---

### ĐỢT 3 (`13` $\rightarrow$ `17`): WEB TOOLS CÓ DÙNG AI (Đọc Email / Chụp hình Vision / Suy luận) | Chi phí $0 – $10/tháng

| Thứ tự & File Spec | Dự án (`idea/*`) | Loại SP (1–4) | Mức độ cần AI (Vision / Suy luận) | Cost / Tháng | Thời gian dự kiến | Điểm nhấn thực thi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **[13-WEB-expense-management-app-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/13-WEB-expense-management-app-spec.md)** | [`expense-management-app`](file:///d:/Workspace/personal-tools/idea/expense-management-app) | **3. Web** | **TRUNG BÌNH (AI Text)** *(Gemini đọc email hóa đơn)* | **$0 – $3/tháng** *(Vercel + Sheets Free)* | **~2.5 giờ** | Đã code xong 85% UI & API; chỉ cần hoàn tất đồng bộ Gmail và bảo vệ 3 file WIP. |
| **[14-WEB-paper-work-tool-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/14-WEB-paper-work-tool-spec.md)** | [`paper-work-tool`](file:///d:/Workspace/personal-tools/idea/paper-work-tool) | **3. Web** | **CAO (AI Suy luận quy trình)** *(Hỏi làm rõ & lập Roadmap)* | **$0 – $5/tháng** | **~3 giờ** | Đã có sẵn khung giao diện `index.html`; cần nối logic đánh giá độ mơ hồ và xuất lộ trình giấy tờ (`.gov`). |
| **[15-WEB-nails-step-from-image-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/15-WEB-nails-step-from-image-spec.md)** | [`nails-step-from-image`](file:///d:/Workspace/personal-tools/idea/nails-step-from-image) | **3. Web** | **CAO (AI Chụp hình / Vision)** *(Phân tích ảnh mẫu Nail)* | **$0 – $5/tháng** | **~3.5 giờ** | Dùng Multimodal Vision AI nhìn ảnh móng tay $\rightarrow$ xuất bảng màu HEX, dụng cụ, nguyên liệu & hướng dẫn 5 bước. |
| **[16-WEB-real-estate-local-detective-tool-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/16-WEB-real-estate-local-detective-tool-spec.md)** | [`real-estate-local-detective-tool`](file:///d:/Workspace/personal-tools/idea/real-estate-local-detective-tool) | **3. Web (PWA)** | **TRUNG BÌNH (AI Text)** *(Biên tập ghi chú thực địa)* | **$0 – $5/tháng** | **~4 giờ** | Lưu nháp Offline-first khi đi khảo sát $\rightarrow$ về nhà hoàn thiện $\rightarrow$ đẩy lên FB/IG & theo dõi tương tác. |
| **[17-WEB-3d-estimate-for-construction-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/17-WEB-3d-estimate-for-construction-spec.md)** | [`3d-estimate-for-construction`](file:///d:/Workspace/personal-tools/idea/3d-estimate-for-construction) | **3. Web** | **RẤT CAO (AI Chụp hình + Hình học phẳng)** | **$2 – $10/tháng** | **~5 giờ** | Đọc bản vẽ & ảnh chụp thực tế có thước chuẩn (Homography 4 điểm) để tính diện tích chính xác tới $\text{mm}^2$ / inches. |

---

### ĐỢT 4 (`18` $\rightarrow$ `22`): CÁC DỰ ÁN APP LỚN / PHỨC TẠP — Giao cho Agent BA & PM làm mịn khi rảnh rỗi (Chưa code vội)

| Thứ tự & File Spec | Dự án (`idea/*`) | Loại SP (1–4) | Tại sao để lại làm sau? (Effort / AI / Cost) | Nhiệm vụ của BA & PM khi rảnh (`proactive_work`) |
| :--- | :--- | :--- | :--- | :--- |
| **[18-APP-nails-pos-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/18-APP-nails-pos-spec.md)** | [`nails-pos`](file:///d:/Workspace/personal-tools/idea/nails-pos) | **4. App (POS)** | Không cần AI nhưng là **Hệ thống POS 18 modules** + tích hợp phần cứng máy cà thẻ PAX A920, máy in nhiệt, Dual Screen. | BA & Test Engineer chuẩn bị sẵn bộ 20 kịch bản dữ liệu test chia turn và giả lập gói tin mạng LAN của máy PAX A920. |
| **[19-APP-cheap-used-car-tool-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/19-APP-cheap-used-car-tool-spec.md)** | [`cheap-used-car-tool`](file:///d:/Workspace/personal-tools/idea/cheap-used-car-tool) | **4. App** | Quy mô **15 phân hệ lớn** + cần AI suy luận đa chiều + tổng hợp dữ liệu từ 7 sàn xe cũ. | BA tách nhỏ 15 phân hệ thành 3 giai đoạn độc lập; cập nhật bảng phí bảo hiểm & thuế đăng ký xe theo từng tiểu bang Mỹ. |
| **[20-APP-social-media-management-tool-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/20-APP-social-media-management-tool-spec.md)** | [`social-media-management-tool`](file:///d:/Workspace/personal-tools/idea/social-media-management-tool) | **4. App (SaaS)** | Kiến trúc nặng (Next.js + Express + PostgreSQL + Redis BullMQ + Cloudinary), chi phí server vượt ngưỡng free nếu chạy 24/7. | Architect nghiên cứu phương án rút gọn hạ tầng về SQLite + In-process Queue để đưa chi phí về $0/tháng. |
| **[21-APP-company-prospect-spec.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/21-APP-company-prospect-spec.md)** | [`company-prospect`](file:///d:/Workspace/personal-tools/idea/company-prospect) | **4. App (FinTech)** | Cần **AI suy luận tài chính/M&A chuyên sâu đa chiều** + nguồn dữ liệu BCTC Mỹ/Việt Nam phức tạp. | BA chuẩn hóa bảng ánh xạ chỉ tiêu kế toán GAAP (Mỹ) và VAS (Việt Nam). |
| **[22-HOLD-uninitialized-ideas-intake-triage.md](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/22-HOLD-uninitialized-ideas-intake-triage.md)** | 5 thư mục trống | **Chờ Brief** | `best-insurance-tool`, `best-saler`, `memory-app`, `pipe-line-sale-agent`, `the-chosen-one-tool` chưa có nội dung yêu cầu. | Đã soạn sẵn Option A/B/C trong file `22-HOLD`, chờ Chủ dự án chọn khi cần. |

---

## PHẦN II: LỘ TRÌNH TỪNG TASK NHỎ NHẤT CỦA ĐỢT 1 (`01` $\rightarrow$ `07`) ĐỂ BẮT ĐẦU NGAY

Để bạn không bị rối mắt, đây là **danh sách các task nguyên tử theo đúng thứ tự một chiều từ dễ nhất (`01.1`) trở đi**. Mỗi task chỉ sửa 1 file, chạy trong vài phút, tốn **$0** và **không cần AI**:

### Bước Khởi Động #01: Hoàn thiện `bank-qr-extension` (1. Extension | 0% AI | $0 | ~45 phút)
*Chi tiết tại: [`01-EXT-bank-qr-extension-spec.md`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/01-EXT-bank-qr-extension-spec.md)*
- [ ] **`TASK-01.1` (5 phút):** Tạo `idea/bank-qr-extension/settings.json` chứa bảng mã ngân hàng VietQR, danh sách vùng cấm quét (`[class*="chat"]`, `iframe` để chống lừa đảo P2P) và từ khóa ngoại tệ bị chặn (`USD`, `USDT`, `$`).
- [ ] **`TASK-01.2` (10 phút):** Tách file `idea/bank-qr-extension/BankDetectorServiceHelper.js` — sửa lỗi nhận diện nhầm tên ngân hàng (`mb` vs `cimb`/`eximbank`) bằng Regex word-boundary và chặn tạo QR VND khi số tiền là ngoại tệ.
- [ ] **`TASK-01.3` (10 phút):** Tách file `idea/bank-qr-extension/DomExtractorService.js` — bỏ qua các phần tử ẩn và khung chat P2P, tô viền xanh trực tiếp lên số tài khoản gốc trên màn hình để người dùng kiểm tra bằng mắt.
- [ ] **`TASK-01.4` (10 phút):** Sửa `idea/bank-qr-extension/content.js` — xóa hoàn toàn `innerHTML` (vá lỗi XSS), thay bằng `createElement`/`textContent` và khóa tạo trùng popup khi bấm `Ctrl+Shift+Q` nhiều lần.
- [ ] **`TASK-01.5` (10 phút):** Chạy kiểm thử tự động trên trang mẫu `idea/bank-qr-extension/index.html` và chụp ảnh màn hình nghiệm thu.

### Bước Tiếp Theo #02: Hoàn thiện `best-buy-supplies-tool` Phase 1 — Extension Cào Giá (1. Extension | 0% AI | $0 | ~60 phút)
*Chi tiết tại: [`02-EXT-best-buy-supplies-tool-spec.md`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/02-EXT-best-buy-supplies-tool-spec.md)*
- [ ] **`TASK-02.1` (5 phút):** Tạo `idea/best-buy-supplies-tool/settings.json` cấu hình timeout `15000ms`, delay chống chặn IP, và selectors cho Amazon/Temu.
- [ ] **`TASK-02.2` (15 phút):** Chuẩn hóa `idea/best-buy-supplies-tool/content.js` — tách hàm bóc tách giá/tên sản phẩm an toàn, phát hiện trang CAPTCHA để báo `BLOCKED_BY_ANTI_BOT` thay vì treo.
- [ ] **`TASK-02.3` (20 phút):** Sửa `idea/best-buy-supplies-tool/background.js` — thêm cờ `isProcessingLoaded` chống lỗi mở/gọi đúp của `chrome.tabs.onUpdated`, tự động đóng tab ẩn sau 15 giây (`chrome.tabs.remove`) để không ngốn RAM.
- [ ] **`TASK-02.4` (10 phút):** Cập nhật `idea/best-buy-supplies-tool/popup.js` hiển thị tiến độ hàng đợi trực quan và nút xuất JSON kết quả.
- [ ] **`TASK-02.5` (10 phút):** Chạy test hàng đợi 5 URL liên tiếp, xác nhận RAM giải phóng 100% tab ẩn và lưu bằng chứng.

### Bước Tiếp Theo #03: Hoàn thiện `trading-tool` (2. Small Tool | 0% AI | $0 | ~60 phút)
*Chi tiết tại: [`03-TOOL-trading-tool-spec.md`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/03-TOOL-trading-tool-spec.md)*
- [ ] **`TASK-03.1` (10 phút):** Cập nhật `idea/trading-tool/settings_loader.py` & `settings.json` — thêm cấu hình chống nhiễu `hysteresis_buffer: 0.05`, `confirmation_cycles: 2`, `cooldown_seconds: 300`.
- [ ] **`TASK-03.2` (15 phút):** Nâng cấp `idea/trading-tool/signal_analyzer.py` — áp dụng biên trễ Hysteresis để khi giá BTC giật râu nến quanh mốc `1.2x` không bị báo giả liên tục.
- [ ] **`TASK-03.3` (15 phút):** Nâng cấp `idea/trading-tool/state_manager.py` — ghi file trạng thái nguyên tử (`.tmp` $\rightarrow$ `os.replace`) và chỉ cập nhật trạng thái sau khi gửi Telegram thành công.
- [ ] **`TASK-03.4` (10 phút):** Tối ưu `idea/trading-tool/api_client.py` — đọc nén `gzip` và giải phóng ngay bộ nhớ ma trận heatmap `8.9MB`.
- [ ] **`TASK-03.5` (10 phút):** Chạy bộ unit test kiểm chứng 3 tầng (Happy / Network Error / Râu nến giật liên tục) xanh 100%.

### Bước Tiếp Theo #04: Hoàn thiện `agent-proxy` (2. Small Tool | 0% AI | $0 | ~60 phút)
*Chi tiết tại: [`04-TOOL-agent-proxy-spec.md`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/04-TOOL-agent-proxy-spec.md)*
- [ ] **`TASK-04.1` (10 phút):** Tạo `idea/agent-proxy/settings.json` và `KeyPoolService.js` quản lý xoay vòng API key kèm cách ly 60 giây khi gặp lỗi `429`.
- [ ] **`TASK-04.2` (20 phút):** Hợp nhất `server.js` và `server1.js` thành `ProxyForwarderService.js` — hỗ trợ cả JSON thường và SSE Streaming (`stream: true`), khóa chặt ở `127.0.0.1` + Bearer Token.
- [ ] **`TASK-04.3` (15 phút):** Viết và chạy bộ test tự động kiểm tra xoay key khi hết quota và chống crash `ERR_HTTP_HEADERS_SENT`.
