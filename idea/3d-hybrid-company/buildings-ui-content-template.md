# Bản Thiết Kế Nội Dung & UI Template Cho Toàn Bộ Các Tòa Nhà (`DreamTech Virtual Company`)

> **Mục tiêu dành cho CEO:** Thiết kế này đảm bảo mỗi tòa nhà trên đảo **DreamTech** không chỉ đẹp như game mô phỏng 2.5D, mà là **Bảng Điều Khiển Tác Chiến Thời Gian Thực (Real-time Operational Cockpit)**.  
> Chỉ cần nhìn vào 1 tòa nhà trong **3 giây**, CEO nắm được ngay: *Ai đang làm gì? Ai đang bị kẹt? Đã ra kết quả gì? Có tốn tiền không? Và CEO cần bấm nút nào để xử lý ngay?*

---

## PHẦN 1: BỐ CỤC KHUNG GIAO DIỆN CHUẨN (5 KHU VỰC UI TRÊN MỌI MÀN HÌNH)

Mọi hình ảnh tòa nhà khi thiết kế hoặc render sẽ tuân thủ đúng **5 khu vực hiển thị** dưới đây để đồng bộ 100% trải nghiệm:

```text
+---------------------------------------------------------------------------------------------------+
| [1. TOP HUD BAR] Logo DreamTech | Nhân sự: 24/30 | 🟢 Online | Burn Rate: $0.12/h | 🔔 2 Cần Duyệt |
+----------------+--------------------------------------------------------------+-------------------+
| [2. LEFT NAV]  |                                                              | [4. RIGHT PANEL]  |
| 🏠 Company Map |              [3. CENTER ISOMETRIC VIEW]                      | 📊 Dept Health    |
| 🏢 Departments |     (Toàn cảnh Đảo HOẶC Mặt cắt 2.5D Nội thất Tòa nhà)       | 🟢 Working: 18    |
| 📁 Projects    |                                                              | 🟡 Waiting: 3     |
| ⚡ CEO Gates   |    + Thẻ nổi (Tooltip) trên đầu các nhân vật:                | 🔴 Blocked: 1     |
| 📈 FinOps/Cost |      [Prev: ...]                                             | ----------------- |
| 📜 Evidence    |      [Now:  ... (75%)]                                       | ⚡ CẦN CEO XỬ LÝ: |
| ⚙️ Settings    |      [Next: ...]                                             | [Nút Duyệt/Gỡ Kẹt]|
|                +-----------------------+--------------------------------------+-------------------+
|                | [5A. QUICK STATS]     | [5B. DEPARTMENT & EMPLOYEE DETAIL MODAL]                 |
|                | Tổng quan nhanh +     | - Trái: Mặt cắt thu nhỏ của phòng + KPI đặc thù          |
|                | Cảnh báo Bottleneck   | - Phải: Danh sách 4 Agent (Avatar, Role, Status,         |
|                |                       |   Prev/Now/Next Task, Progress %, Nút Can thiệp nhanh)   |
|                |                       | - Đáy: Tabs [Team] [Tasks] [Activity] [Evidence] [Cost]  |
+----------------+-----------------------+----------------------------------------------------------+
```

### Ý nghĩa Quản trị của Từng Thành phần UI đối với CEO:

1. **Hệ thống Màu sắc Trạng thái (Status Badges chuẩn hóa):**
   - 🟢 **`Working` (Xanh lá):** Đang thực thi bình thường, có tiến độ tăng đều.
   - 🔵 **`Reviewing` (Xanh dương):** Đang kiểm tra chéo (QA/Challenger/Security đang soi kết quả).
   - 🟡 **`Waiting` (Vàng cam):** Đang tạm dừng chờ cổng phê duyệt của CEO hoặc chờ khách hàng trả lời *(Đã giải phóng slot LLM, tốn $0)*.
   - 🔴 **`Blocked` (Đỏ chớp):** Gặp lỗi kỹ thuật, hết quota API `429`, dính CAPTCHA, hoặc fail quá 2 lần $\rightarrow$ **CEO cần chú ý ngay!**
   - ⚪ **`Idle` (Xám):** Đang nghỉ ngơi chờ việc mới *(Tốn $0 token)*.

2. **Cấu trúc Thẻ Nhân viên / Agent (`Employee Row & Tooltip`):**
   Mỗi nhân sự trong bảng chi tiết luôn hiển thị đủ **3 mốc thời gian** + **Bằng chứng**:
   - **`Prev` (Vừa xong):** Tên việc vừa hoàn thành + dấu tích `✓ Verified` (click vào xem được ảnh/log).
   - **`Now` (Đang làm):** Tên task hiện tại + Tên dự án (`[01-bank-qr]`) + Thanh `%` + Công cụ đang dùng (`VS Code`, `Playwright`, `Git`).
   - **`Next` (Sắp làm):** Task kế tiếp trong hàng đợi để CEO biết nhân sự này có bị đứt việc hay không.

3. **Khối `⚡ CEO Quick Action` (Nút bấm Can thiệp Kịp thời):**
   Thay vì chỉ nhìn thụ động, mỗi khi có trạng thái 🟡 `Waiting` hoặc 🔴 `Blocked`, giao diện hiện nút bấm trực tiếp cho CEO:
   - `[✓ Duyệt Option A]` (Mở khóa cho BA/PM chạy tiếp)
   - `[🚀 Duyệt Deploy Prod]` (Mở cổng cho DevOps)
   - `[🔄 Đổi sang Local Model / Tăng Budget]` (Khi bị kẹt hết hạn mức API)
   - `[👁️ Xem Ảnh & Log Bằng Chứng]` (Kiểm tra kết quả của QA)

---

## PHẦN 2: CHI TIẾT NỘI DUNG TỪNG TÒA NHÀ TRÊN ĐẢO DREAMTECH (8 TÒA NHÀ)

Dưới đây là nội dung chi tiết bên trong từng tòa nhà, được sắp xếp theo đúng **luồng vận hành thực tế của công ty** để bạn duyệt xem muốn hiển thị/chỉnh sửa tòa nhà nào trước:

---

### 🏛️ TÒA NHÀ 1: COMPANY HQ — Trung Tâm Chỉ Huy Tối Cao (`Management, FinOps & Legal`)
* **Biểu tượng Tòa nhà:** Tòa tháp trung tâm cao nhất đảo có biểu tượng Đám mây phát sáng & Vương miện điều hành.
* **Mục đích giúp CEO nắm bắt:** Nắm toàn bộ "mạch máu" của công ty: Dự án nào đang chạy, tiền đang tiêu bao nhiêu (`$0` hay chạm trần `$10`), có hợp đồng hay cổng phê duyệt nào đang đợi CEO ký không.
* **Thiết kế Nội thất 2.5D (Cutaway):**
  - Bàn tròn Hội đồng Chiến lược ở giữa có bản đồ Hologram hiển thị 22 dự án (`01` $\rightarrow$ `22`).
  - Màn hình lớn trên tường hiển thị **Ngân sách Token & Chi phí Tháng (`$0.45 / $10.00 Limit`)** và trạng thái các nhà cung cấp AI (`Gemini API: 🟢 OK`, `Local Ollama: 🟢 Ready`).
* **Danh sách Nhân sự / Agent hiển thị trong Popup:**
  1. **Alex Hoàng (Human CEO / Product Owner)** — *Chief Executive Officer*
     - Badge: 🟢 `Online` | **Now:** `Reviewing 2 Approval Gates (01-bank-qr & 02-best-buy)` — `100%`
  2. **Diana Vũ (`estimator_cost_controller`)** — *FinOps & Cost Controller*
     - Badge: 🟢 `Working` | **Prev:** `Ranked 22 Projects by Cost ($0 First)` | **Now:** `Monitoring Token Burn Rate ($0.00 AI Spend on Wave 1)` — `95%` | **Next:** `Alert if Slice > 70% Budget`
  3. **Victor Đặng (`legal_compliance`)** — *Legal & Policy Guardian*
     - Badge: 🔵 `Reviewing` | **Prev:** `Checked STOP Opt-out Rule for 07-dm-jobs` | **Now:** `Auditing Meta API & Privacy Compliance` — `85%` | **Next:** `USCIS .gov Disclaimer Check`
* **Chỉ số KPI Đặc thù góc phải & Nút xử lý nhanh cho CEO:**
  - `Monthly Spend: $0.45 / $10.00` | `Pending Gates: 2` | `Active Wave: Đợt 1 (0% AI - Free)`
  - Nút hành động: **`[✓ Duyệt Tất Cả Khuyến Nghị (00B)]`** | **`[🔒 Khóa Trần Chi Phí $10]`**

---

### 🤝 TÒA NHÀ 2: BUSINESS CENTER — Trung Tâm Kinh Doanh & Phân Tích Yêu Cầu (`Sales, BD & BA Team`) *(Đã có ảnh mẫu)*
* **Biểu tượng Tòa nhà:** Tòa nhà góc trên bên trái với biểu tượng **Hai bàn tay bắt nhau màu vàng kim & Biểu đồ tăng trưởng**.
* **Mục đích giúp CEO nắm bắt:** Khách hàng/Ý tưởng mới vào đang ở bước nào? Yêu cầu đã rõ chưa hay còn mơ hồ? Có bị phình phạm vi (Scope Creep) không?
* **Thiết kế Nội thất 2.5D (4 Phân khu):**
  - *Quầy 1 (Intake Desk):* Tiếp nhận yêu cầu thô, lọc trùng lặp, tách `Fact` vs `Assumption`.
  - *Quầy 2 (BA Spec Studio):* Bảng vẽ quy trình và màn hình viết kịch bản `Given / When / Then`.
  - *Quầy 3 (Challenger War-Room):* Phòng kính phản biện có bảng cảnh báo màu cam soi các lỗ hổng nghiệp vụ.
  - *Quầy 4 (Contract & Deal Lounge):* Bàn chốt mô hình hợp đồng (`Fixed-Price`, `ODC`, `T&M`, `SLA`).
* **Danh sách 4 Agent hiển thị trong Popup:**
  1. **Sarah Nguyễn (`sales_bd_lead`)** — *BD & Engagement Lead*
     - Badge: 🟢 `Working` | **Prev:** `Classified 22 Projects by Product Type` | **Now:** `Locking Fixed-Price Scope Baseline` — `80%` | **Next:** `Change Request (CR) Template`
  2. **Kevin Lê (`ba`)** — *Senior Business Analyst*
     - Badge: 🟢 `Working` | **Prev:** `Completed 21 PRD & BDD Specs` | **Now:** `Refining 5-State UX Matrix for Wave 1` — `75%` | **Next:** `Refine 18-nails-pos Edge Cases`
  3. **Elena Trần (`requirement_challenger`)** — *Requirement Challenger (Tier 3)*
     - Badge: 🔵 `Reviewing` | **Prev:** `Blocked P2P Chat Spoofing in 01-bank-qr` | **Now:** `Challenging Race Conditions & Scope Creep` — `90%` | **Next:** `DoR Gate Sign-off`
  4. **Marcus Võ (`intake`)** — *Intake Analyst*
     - Badge: 🟡 `Waiting` | **Prev:** `Triaged 26 Idea Folders` | **Now:** `Waiting for CEO Option Choice on 22-HOLD (5 Empty Ideas)` — `40%` | **Next:** `Normalize New Incoming Ticket`
* **Chỉ số KPI Đặc thù & Nút xử lý nhanh cho CEO:**
  - `Specs Ready: 21 / 26` | `Ambiguity Blocked: 5 (On Hold)` | `Scope Creep Blocked: 14 cases`
  - Nút hành động: **`[Chọn Option A cho Q1-Q4]`** | **`[Xem Bảng Phản Biện Challenger]`**

---

### 📋 TÒA NHÀ 3: PROJECT HALL — Trung Tâm Điều Phối Dự Án & Kiến Trúc (`PM & Solution Architecture`)
* **Biểu tượng Tòa nhà:** Tòa nhà bên trái có biểu tượng **Bảng kế hoạch (Clipboard) & Sơ đồ mạng lưới**.
* **Mục đích giúp CEO nắm bắt:** Công việc đã được băm nhỏ thành các task 5–10 phút chưa? Có task nào bị phụ thuộc cứng (`Hard Dependency`) làm nghẽn cả dây chuyền không? Các dự án có tái sử dụng code của nhau không?
* **Thiết kế Nội thất 2.5D (Cutaway):**
  - Bảng **Kanban & DAG Dependency Graph** khổng lồ trên tường hiển thị các đường nối `READY` $\rightarrow$ `RUNNING` $\rightarrow$ `VERIFY` $\rightarrow$ `DONE`.
  - Bàn thiết kế kiến trúc của `architect` với sơ đồ **7 Shared Core Services** (tái sử dụng cho 15 dự án).
* **Danh sách 4 Agent hiển thị trong Popup:**
  1. **Liam Phạm (`orchestrator`)** — *Chief Project Manager / Coordinator*
     - Badge: 🟢 `Working` | **Prev:** `Sorted Wave 1 Tasks (01.1 -> 04.3)` | **Now:** `Dispatching TASK-01.1 to Senior Dev (Worktree #1)` — `85%` | **Next:** `Parallel Dispatch Test Engineer`
  2. **Dr. Minh Trương (`architect`)** — *Principal Solution Architect*
     - Badge: 🟢 `Working` | **Prev:** `Eliminated AI Cost from 11 Projects (0% AI Rule)` | **Now:** `Designing 7 Shared Core Services (DRY)` — `90%` | **Next:** `ADR Review for Local SQLite vs Cloud`
  3. **Hana Đỗ (`scrum_scheduler`)** — *Queue & Lease Controller*
     - Badge: 🟢 `Working` | **Prev:** `Assigned Isolated Git Worktrees` | **Now:** `Monitoring 20-min Agent Leases & Work Stealing` — `100%` | **Next:** `Requeue Stale Tasks if Timeout`
* **Chỉ số KPI Đặc thù & Nút xử lý nhanh cho CEO:**
  - `Ready Atomic Tasks: 185` | `Parallel Worktrees: 4/4 Active` | `Code Reuse Ratio: 68%`
  - Nút hành động: **`[⚡ Chạy Ngay Dự Án #01 (bank-qr)]`** | **`[📊 Xem Thứ Tự Ưu Tiên 00A]`**

---

### 🎨 TÒA NHÀ 4: DESIGN STUDIO — Xưởng Thiết Kế Giao Diện & Trải Nghiệm (`UI/UX & 3D Studio`)
* **Biểu tượng Tòa nhà:** Tòa nhà màu hồng/tím pastel ở giữa đảo có biểu tượng **Bảng pha màu (Palette) & Thước kẻ**.
* **Mục đích giúp CEO nắm bắt:** Giao diện sản phẩm làm ra có thân thiện không? Đã thiết kế đủ **5 trạng thái UX** (*Ideal, Loading, Empty, Error, Overflow*) chưa hay mới chỉ vẽ màn hình lúc đẹp nhất?
* **Thiết kế Nội thất 2.5D (Cutaway):**
  - Các màn hình vẽ Wireframe, bảng màu Brand Kit (cho tiệm Nail), mô hình 3D đảo tri thức (`12-WEB-note-tool`), và bảng kiểm tra độ tương phản WCAG.
* **Danh sách 3 Agent hiển thị trong Popup:**
  1. **Chloe Nguyễn (`ui_ux`)** — *Lead UI/UX Designer*
     - Badge: 🟢 `Working` | **Prev:** `Designed DreamTech Business Center UI` | **Now:** `Designing 5-State Overlay for 01-bank-qr-extension` — `80%` | **Next:** `Popup UI for 02-best-buy`
  2. **Leo Vũ (`design_system_agent`)** — *Component & Brand Kit Specialist*
     - Badge: 🟢 `Working` | **Prev:** `Created Nail Salon BrandKit JSON Schema` | **Now:** `Building Reusable Dark-Navy/Purple HUD Components` — `70%` | **Next:** `3D Knowledge Tree Nodes (12-note-tool)`
  3. **Maya Lâm (`accessibility_auditor`)** — *UX & Accessibility Reviewer*
     - Badge: 🔵 `Reviewing` | **Prev:** `Checked 1-Click Ergonomics` | **Now:** `Verifying Keyboard Shortcut Ctrl+Shift+Q & Contrast` — `95%` | **Next:** `Mobile Responsive Audit`
* **Chỉ số KPI Đặc thù & Nút xử lý nhanh cho CEO:**
  - `5-State UX Coverage: 100%` | `Max Clicks per Action: <= 2 clicks` | `Accessibility: WCAG AA+`
  - Nút hành động: **`[👁️ Xem Trước Giao Diện 5 Trạng Thái]`** | **`[🎨 Tạo Ảnh Tòa Nhà Tiếp Theo]`**

---

### 💻 TÒA NHÀ 5: SOFTWARE LAB — Trung Tâm Lập Trình & Chế Tác Code (`Senior Developers`) *(Đã có trên ảnh gốc)*
* **Biểu tượng Tòa nhà:** Tòa nhà bên phải có biểu tượng **`< />` phát sáng màu tím**.
* **Mục đích giúp CEO nắm bắt:** Ai đang code file nào? Có tuân thủ SOLID, DRY, Zero Magic Code không? Có ai đang bị lỗi build/lint quá 2 lần cần nâng lên Model Tier 3 không?
* **Thiết kế Nội thất 2.5D (Cutaway):**
  - 4 cụm bàn máy tính đa màn hình (mỗi bàn là 1 **Git Worktree cô lập** để không bao giờ đụng code của nhau).
  - Màn hình tường hiển thị trạng thái xanh `VERIFY PASS: format + lint + typecheck + unit test` và khóa bảo vệ `🔒 Protected Configs: UNTOUCHED`.
* **Danh sách 4 Senior Developer Agent hiển thị trong Popup:**
  1. **David Nguyễn (`dev_extension_lead`)** — *Senior Extension & Frontend Dev*
     - Badge: 🟢 `Working` | **Prev:** `Created settings.json for 01-bank-qr` | **Now:** `TASK-01.2: Coding BankDetectorServiceHelper.js (Zero XSS)` — `65%` | **Next:** `TASK-01.3: DomExtractorService.js`
  2. **Alex Trần (`dev_automation_lead`)** — *Senior Backend & Bot Dev*
     - Badge: 🔵 `Reviewing` | **Prev:** `Built Shared TelegramNotificationService` | **Now:** `TASK-03.2: Adding Hysteresis Anti-Flapping to trading-tool` — `90%` | **Next:** `TASK-04.1: KeyPoolService (agent-proxy)`
  3. **Emma Phạm (`dev_web_lead`)** — *Senior Full-Stack Web Dev*
     - Badge: 🟢 `Working` | **Prev:** `Preserved Protected WIP in expense-app` | **Now:** `TASK-05.1: Coding GmailBankService.gs for Google Sheets` — `70%` | **Next:** `12-WEB-note-tool Three.js Scene`
  4. **Ryan Lê (`dev_core_lead`)** — *Senior Systems & Math Dev*
     - Badge: 🟡 `Waiting` | **Prev:** `Implemented FinanceAndTcoMathHelper` | **Now:** `Waiting for TASK-01.2 Completion to Integrate` — `0%` | **Next:** `TASK-02.3: Background Tab Queue`
* **Chỉ số KPI Đặc thù & Nút xử lý nhanh cho CEO:**
  - `SOLID & DRY Score: 100%` | `Magic Values: 0` | `Config Tampering: 0`
  - Nút hành động: **`[🔍 Soi Git Diff Thực Tế]`** | **`[⬆️ Nâng Cấp Model Tier-3 Cho Task Khó]`**

---

### 🧪 TÒA NHÀ 6: QA CENTER — Trung Tâm Kiểm Thử, Thanh Tra Bề Mặt Thật & Bảo Mật (`Tester, QA & Security`)
* **Biểu tượng Tòa nhà:** Tòa nhà ở trung tâm phía dưới có biểu tượng **Bình thí nghiệm (Flask) & Khiên Bảo Mật (Shield)**.
* **Mục đích giúp CEO nắm bắt:** Code sửa xong đã test chưa? Test trên giả lập hay chạy thật như người dùng? Có ảnh chụp màn hình, log, video/trace làm bằng chứng chưa? Có lỗ hổng bảo mật hay lộ mật khẩu không?
* **Thiết kế Nội thất 2.5D (Cutaway):**
  - *Khu 1 (Automated Test Pyramid Lab):* Màn hình chạy 3 tầng test (Tầng 1: Luồng hay dùng $\rightarrow$ Tầng 2: Lỗi/Mạng $\rightarrow$ Tầng 3: Ca biên hiếm gặp).
  - *Khu 2 (Real-Surface QA Simulator):* Trình duyệt tự động mở app lên bấm thử và chụp Screenshot/DOM Snapshot.
  - *Khu 3 (Security Vault & Scanner):* Máy quét tia laser kiểm tra Secret, CVE, XSS, DOM Spoofing.
* **Danh sách 4 Agent hiển thị trong Popup:**
  1. **Sophia Trần (`test_engineer`)** — *Senior Test Engineer (Independent)*
     - Badge: 🟢 `Working` | **Prev:** `Prepared 3-Tier Test Fixtures for 01-bank-qr` | **Now:** `Running Edge-Case Tests (mb vs cimb, USD/USDT Block, P2P Chat)` — `80%` | **Next:** `Test 5-Tab Queue in 02-best-buy`
  2. **Nathan Hồ (`qa_reviewer`)** — *Lead QA Inspector (Fresh Context)*
     - Badge: 🔵 `Reviewing` | **Prev:** `Verified git diff (0 Config Tampering)` | **Now:** `Driving Real Browser Surface & Capturing Screenshots` — `85%` | **Next:** `Issue PASS/FAIL Verdict Package`
  3. **Zero-Trust Bot (`security` Tier 0 + 3)** — *AppSec & Vulnerability Scanner*
     - Badge: 🟢 `Working` | **Prev:** `Scanned 0 Secrets in Repo` | **Now:** `Verifying innerHTML XSS Removal & Localhost Auth Token` — `100%` | **Next:** `Dependency CVE Scan`
  4. **Claire Đặng (`evidence_archivist`)** — *Evidence & Regression Keeper*
     - Badge: 🟢 `Working` | **Prev:** `Archived Logs & Exit Codes` | **Now:** `Packaging Before/After Screenshots into .aise/evidences/` — `90%` | **Next:** `Attach Evidence to CEO Report`
* **Chỉ số KPI Đặc thù & Nút xử lý nhanh cho CEO:**
  - `Test Pyramid: Tier 1-2-3 Green` | `High/Critical CVEs: 0` | `Evidence Attached: 100%`
  - Nút hành động: **`[📸 Xem Ảnh Chụp & Log Bằng Chứng]`** | **`[🚫 Từ Chối Nếu Thiếu Evidence]`**

---

### 🏰 TÒA NHÀ 7: CLOUD CASTLE — Pháo Đài Hạ Tầng, CI/CD & Tự Động Hóa (`DevOps & Minimal Infra`)
* **Biểu tượng Tòa nhà:** Tòa lâu đài công nghệ ở mũi đảo phía nam có biểu tượng **Quả cầu Mạng lưới & Đám mây Server**.
* **Mục đích giúp CEO nắm bắt:** Hạ tầng có đúng tiêu chí **"Tối thiểu chi phí ($0) – Tối đa hiệu năng"** không? Các con bot chạy 24/7 (như `trading-tool`, `find-job-tool`) có đang sống khỏe không? Nếu bản mới lỗi thì mất bao lâu để Rollback?
* **Thiết kế Nội thất 2.5D (Cutaway):**
  - Dàn máy chủ gọn nhẹ (Local Sandbox, GitHub Actions Free Cron, Google Apps Script Triggers, Vercel Free Edge) kèm đồng hồ đo RAM/CPU và cầu dao **Circuit Breaker** tự ngắt khi nguồn ngoài bị lỗi.
* **Danh sách 3 Agent hiển thị trong Popup:**
  1. **Lucas Võ (`devops`)** — *Senior DevOps & Minimal-Infra Engineer*
     - Badge: 🟢 `Working` | **Prev:** `Configured Single Verify Command` | **Now:** `Setting up Free GitHub Actions Cron for 03-trading-tool` — `75%` | **Next:** `Verify 2-Min Rollback Runbook`
  2. **Aiden Lê (`sre_monitor`)** — *24/7 Bot & Circuit-Breaker Watcher*
     - Badge: 🟢 `Working` | **Prev:** `Checked API Quota & Rate Limits` | **Now:** `Monitoring Gzip Memory Usage (< 50MB) on trading-tool` — `100%` | **Next:** `Auto-Fallback if Provider 429`
  3. **Release Gatekeeper (`deploy_controller`)** — *Staging & Production Gate*
     - Badge: 🟡 `Waiting` | **Prev:** `Staged 01-bank-qr-extension Build` | **Now:** `Waiting for Human CEO Approval to Package Release` — `90%` | **Next:** `Tag Release v1.0.0`
* **Chỉ số KPI Đặc thù & Nút xử lý nhanh cho CEO:**
  - `Infra Monthly Cost: $0.00` | `Uptime: 99.98%` | `Rollback Readiness: < 60 sec`
  - Nút hành động: **`[🚀 Phê Duyệt Phát Hành (Release)]`** | **`[⏪ Kích Hoạt Rollback Tức Thì]`**

---

### 🏠 TÒA NHÀ 8: HR HOUSE — Ngôi Nhà Nhân Sự AI, Phân Phối Slot & Kỷ Luật (`Workforce Runtime & Skill Map`)
* **Biểu tượng Tòa nhà:** Ngôi nhà mái tím ấm cúng bên sườn trái đảo có biểu tượng **Nhóm Nhân sự & Huy hiệu Kỹ năng**.
* **Mục đích giúp CEO nắm bắt:** Có Agent nào đang "ăn không ngồi rồi" đốt token vô ích không? Có Agent nào bị treo quá 20 phút (`Stale Lease`) không? Khi nhân sự gặp lỗi lặp lại lần 2, hệ thống đã tự động nâng cấp luật vào **Skill Map** chưa?
* **Thiết kế Nội thất 2.5D (Cutaway):**
  - *Khu 1 (Hibernation Pods):* Các buồng nghỉ đông **0-Token** cho những Agent đang ở trạng thái `IDLE` hoặc `WAITING` (giải phóng 100% slot máy).
  - *Khu 2 (Skill Map Training Library):* Tủ sách chứa các bộ luật `skill-map-rules.yml`, nơi cập nhật kinh nghiệm sau mỗi dự án (*Encode Lessons in Structure*).
  - *Khu 3 (ISO & Process Audit Desk):* Bàn kiểm tra tuân thủ quy trình (Tam quyền phân lập: Người code cấm tự duyệt).
* **Danh sách 3 Agent hiển thị trong Popup:**
  1. **Grace Phan (`workforce_scheduler`)** — *Workforce & Lease Manager*
     - Badge: 🟢 `Working` | **Prev:** `Released 6 Waiting Slots (Saved 100% Idle Tokens)` | **Now:** `Assigning Idle BA Agents to Refine Wave 4 Specs` — `90%` | **Next:** `Reclaim Stale Leases > 20m`
  2. **Master Coach (`skill_curator`)** — *Skill Map & Lint Rule Evolver*
     - Badge: 🟢 `Working` | **Prev:** `Encoded Anti-XSS & Anti-Magic-Number Rules` | **Now:** `Updating Senior Dev & Tester Checklists in skill-map-rules.yml` — `85%` | **Next:** `Convert Repeated Bugs to Lint Scripts`
  3. **Hannah Lý (`iso_compliance`)** — *Process & Independence Auditor*
     - Badge: 🔵 `Reviewing` | **Prev:** `Verified QA Independence from Dev` | **Now:** `Indexing Task Evidence into Audit Matrix` — `100%` | **Next:** `Weekly Workforce Efficiency Report`
* **Chỉ số KPI Đặc thù & Nút xử lý nhanh cho CEO:**
  - `Idle Token Waste: $0.00 (0 Loops)` | `Active Worker Slots: 8 / 8` | `Rule Violations: 0`
  - Nút hành động: **`[💤 Cho Ngủ Đông Agent Không Cần Thiết]`** | **`[📚 Xem & Sửa Luật Skill Map]`**

---

## PHẦN 3: BẢNG CHỌN THỨ TỰ HIỂN THỊ & GENERATE HÌNH ẢNH CHO BẠN DUYỆT

Hiện tại chúng ta đã có hình ảnh của:
- ✅ **Toàn đảo + Software Lab (`< /> Software Development`)** *(Ảnh gốc của bạn)*
- ✅ **Toàn đảo + Business Center (`🤝 Sales, BD & BA`) + Nội thất Business Center** *(2 ảnh vừa tạo)*

Để phục vụ việc điều hành của một CEO một cách trực quan nhất, tôi đề xuất **thứ tự ưu tiên tạo hình ảnh tiếp theo** như sau:

| Thứ tự đề xuất | Tòa nhà / Màn hình cần tạo ảnh | Lý do CEO cần nhìn thấy màn hình này sớm nhất |
| :--- | :--- | :--- |
| **Ưu tiên #1** | **🧪 QA Center (`QA, Testing & Security`)** | Đây là "chốt chặn sống còn" để CEO kiểm tra bằng chứng (log, ảnh chụp màn hình thật, kết quả quét bảo mật) trước khi nghiệm thu bất kỳ task nào của Dev. |
| **Ưu tiên #2** | **📋 Project Hall (`PM & Architecture`)** | Nơi CEO nhìn thấy bảng chia việc nguyên tử (`TASK-01.1` $\rightarrow$ `01.5`), sơ đồ không nghẽn (DAG) và cách 7 Shared Modules tiết kiệm 68% công sức code. |
| **Ưu tiên #3** | **🏛️ Company HQ (`CEO Command Center & FinOps`)** | Màn hình tổng tư lệnh: Nơi CEO duyệt các cổng `Approval Gates`, theo dõi đồng hồ chi phí `$0 -> $10/tháng` và sức khỏe toàn bộ 22 dự án. |
| **Ưu tiên #4** | **🏰 Cloud Castle (`DevOps & 24/7 Bots`)** | Nơi giám sát các con bot chạy ngầm 24/7 (`trading-tool`, `find-job-tool`), kiểm soát RAM/CPU tối thiểu và nút bấm `Rollback` khẩn cấp. |
| **Ưu tiên #5** | **🎨 Design Studio (`UI/UX`)** & **🏠 HR House (`Workforce & Skill Map`)** | Hoàn thiện trọn bộ 8 tòa nhà trên đảo **DreamTech**. |

