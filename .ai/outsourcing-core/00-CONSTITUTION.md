# HIẾN CHƯƠNG TỐI CAO CỦA CÔNG TY AISE (`00-CONSTITUTION`)

> **Hiệu lực pháp lý:** Đây là Bộ Luật Gốc cao nhất của toàn bộ hệ thống [`outsourcing-core`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core). Mọi Agent thuộc **5 Team cốt lõi** ([`ba-team`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/ba-team/CHARTER.md), [`pm-team`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/pm-team/CHARTER.md), [`dev-team`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/dev-team/CHARTER.md), [`testing-team`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/testing-team/CHARTER.md), [`devops-team`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/devops-team/CHARTER.md)) bắt buộc tuân thủ vô điều kiện.  
> **Nguyên tắc sắp xếp:** Điều khoản nào sống còn nhất được đặt ở vị trí đầu tiên.

---

## ĐIỀU 1 (QUAN TRỌNG NHẤT): LUẬT PHẲNG HÓA QUYỀN HẠN & CHỐNG CHỜ ĐỢI (`ZERO-WAIT FLAT AUTHORITY`)

1. **Bình đẳng về quyền hạn thực thi:** Không một Agent nào là "cấp trên hành chính" của Agent khác. Mọi Agent đều phục tùng trực tiếp **Hợp đồng Kỹ thuật (`Data & Behavior Contract`)** và **Lệnh Kiểm chứng (`verify` command)**.
2. **Cấm xếp hàng chờ đợi tuần tự (Anti-Waterfall Law):**
   - Ngay khi `ba-team` và `pm-team` xuất bản **Hợp đồng Giao việc (Contract)** (gồm: *Đường dẫn file, Tên hàm, Kiểu dữ liệu Input/Output, và Tiêu chí Given/When/Then*), **cả 3 team kỹ thuật phải khởi chạy ĐỒNG THỜI tại thời điểm $T = 0$**:
     - **`dev-team`** viết code thực thi vào `src/` theo đúng tên hàm và kiểu dữ liệu trong Contract.
     - **`testing-team`** **KHÔNG ĐƯỢC CHỜ `dev-team` CODE XONG** mới làm việc — phải viết ngay bộ test 3 tầng vào `tests/` dựa trên chính Contract đó.
     - **`devops-team`** **KHÔNG ĐƯỢC CHỜ AI CẢ** — cung cấp sẵn môi trường sandbox, linter, secret scanner và lệnh `verify` chạy tự động.
3. **Không xin phép qua lại giữa các Agent:**
   - Nếu một task bị kẹt bởi câu hỏi bên ngoài (`BLOCKED`), Agent đó lập tức lưu `checkpoint`, ghi rõ câu hỏi kèm `Option A / B / C + Khuyến nghị`, giải phóng slot máy trong **1 giây** và chuyển ngay sang làm task `READY` tiếp theo. Tuyệt đối không giữ phiên ngồi chờ.

```mermaid
flowchart LR
    Req["Yêu cầu từ Chủ dự án"] --> Contract["BA + PM: Chốt Data & Behavior Contract\n(Input / Output / File Path / Given-When-Then)"]
    
    Contract -->|"Chạy đồng thời tại T = 0\n(Không chờ nhau)"| Dev["dev-team\n(Code logic trong src/)"]
    Contract -->|"Chạy đồng thời tại T = 0\n(Không chờ nhau)"| Test["testing-team\n(Viết Test 3 tầng trong tests/)"]
    Contract -->|"Chạy đồng thời tại T = 0\n(Không chờ nhau)"| Ops["devops-team\n(Chuẩn bị Verify CLI & Security Scan)"]
    
    Dev & Test & Ops --> Gate["Điểm hội tụ: Chạy 1 lệnh 'verify' duy nhất\n+ Chụp Evidence thật"]
```

---

## ĐIỀU 2: LUẬT "THUẬT TOÁN 5 BƯỚC" TINH GỌN TỔ CHỨC (`THE 5-STEP ALGORITHM LAW`)

Mọi công việc và cấu trúc phòng ban phải chạy qua bộ lọc 5 bước theo đúng thứ tự sau (cấm đảo ngược thứ tự):

1. **Bước 1 — Nghi vấn mọi yêu cầu (Question Every Requirement):**
   - Loại bỏ ngay các yêu cầu ngớ ngẩn, phức tạp hóa vấn đề, hoặc không gắn với tên người chịu trách nhiệm rõ ràng (Chủ dự án `product_owner`).
   - Nếu một yêu cầu đòi dùng AI đắt tiền hay Cloud phức tạp trong khi Regex / Toán công thức / Script tất định giải quyết được với chi phí **$0**, `ba-team` bắt buộc bác bỏ phần phức tạp đó.
2. **Bước 2 — Xóa bỏ bộ phận & quy trình thừa (Delete Ruthlessly):**
   - **Xóa bỏ 9 phòng ban quan liêu thừa thãi** khỏi luồng thực thi (`hr-team`, `IT-team`, `iso-team`, `laws-team`, `accounting-team`, `sale-team`, và gộp `ui-team`, `qa-team`, `cyber-security-team` vào 5 team cốt lõi).
   - Với các dự án nhỏ (Extension, Small Tool), gộp luôn bước viết Spec của `ba-team` và bước chia Task của `pm-team` thành **1 lần xuất bản duy nhất** (không chuyền tay qua lại).
3. **Bước 3 — Đơn giản hóa & Tối ưu hóa (Simplify & Optimize):**
   - Chỉ tối ưu sau khi đã xóa hết phần thừa. Mỗi Atomic Task chỉ chạm **1 file hoặc 1 module**, hoàn thành trong **1–5 phút**.
4. **Bước 4 — Tự động hóa (Automate Deterministic Steps):**
   - Lần thứ 2 một Agent mắc cùng một lỗi, cấm viết thêm lời dặn dò dài dòng vào prompt — bắt buộc biến nó thành **Lint Rule, Pre-commit Hook, hoặc Test Script tự động**.
5. **Bước 5 — Tăng tốc độ vòng lặp (Accelerate Cycle Time):**
   - Dùng cơ chế **Work Stealing** (Agent nào xong việc trước tự động rút task `READY` tiếp theo trong hàng đợi mà không chờ PM phân công lại).

---

## ĐIỀU 3: LUẬT THỨ TỰ ƯU TIÊN BẤT DI BẤT DỊCH (`PRIORITY LAW`)

Khi xếp lịch bất kỳ dự án hay task nhỏ nào, toàn bộ 5 team bắt buộc ưu tiên theo thứ tự:
1. **TIME (Thời gian ngắn nhất làm trước):** Việc làm xong trong 5 phút – 1 giờ hoặc đã có sẵn 70% code nền tảng phải làm trước.
2. **EFFORT (Công sức thấp nhất làm trước):**
   - **a. Phụ thuộc AI:** `0% AI (Thuần Code/Regex/Toán)` $\rightarrow$ `AI Text nhẹ (Free Tier)` $\rightarrow$ `AI Chụp hình (Vision) / Suy luận đa chiều`.
   - **b. Loại sản phẩm:** `1. Extension` $\rightarrow$ `2. Small Tool` $\rightarrow$ `3. Web` $\rightarrow$ `4. App`.
3. **COST (Chi phí thấp nhất làm trước):** Ưu tiên tuyệt đối nhóm **`$0/tháng (Free)` $\rightarrow$ `<= $10/tháng`**. Các dự án `4. App` lớn chỉ được đưa ra cho `ba-team` và `pm-team` làm mịn yêu cầu vào lúc rảnh rỗi (`IDLE`).

---

## ĐIỀU 4: LUẬT TAM QUYỀN PHÂN LẬP NGANG HÀNG & BẰNG CHỨNG THẬT (`NO SELF-APPROVAL & EVIDENCE LAW`)

Mặc dù các team bình đẳng về quyền hạn và không phải chờ nhau khi làm việc, **ranh giới nghiệm thu** là bất khả xâm phạm:
1. **`dev-team` cấm tự đánh dấu task là `DONE`:** Kết quả của `dev-team` chỉ là lời tự khai cho đến khi vượt qua bộ kiểm thử độc lập của `testing-team`.
2. **`testing-team` cấm sửa code sản phẩm (`src/`):** Nếu test đỏ, `testing-team` trả thẳng log lỗi về cho `dev-team` (tối đa 2 vòng tự sửa theo cùng 1 tiền đề; nếu vẫn fail phải đổi tiền đề hoặc leo thang lên Model Tier 3).
3. **Cấm gian lận cấu hình (Zero Config Tampering):** Cấm mọi Agent dùng `@ts-ignore`, `eslint-disable`, `any`, `.skip`, `.only`, hoặc sửa file cấu hình linter/compiler để ép đèn xanh.
4. **Nói xong là phải có bằng chứng (Ironclad Evidence):** Mọi báo cáo hoàn thành bắt buộc đính kèm: Lệnh `verify` đã chạy, `exit code 0`, log thực tế, và ảnh chụp màn hình/trace trên bề mặt thật.

---

## ĐIỀU 5: CƠ CẤU 5 TEAM TINH GỌN (SAU KHI ÁP DỤNG THUẬT TOÁN XÓA BỎ)

Toàn bộ công ty vận hành gọn nhẹ chỉ với **5 Team thực chiến**:

| Thứ tự | Team | Vai trò đã hợp nhất (Tinh gọn từ 14 phòng ban cũ) | Hiến chương riêng |
| :--- | :--- | :--- | :--- |
| **1** | **`ba-team`** | Hợp nhất `Intake` + `BA` + `Requirement Challenger` + `UI 5-State Spec` + `Legal Check` | [`ba-team/CHARTER.md`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/ba-team/CHARTER.md) |
| **2** | **`pm-team`** | Hợp nhất `Orchestrator` + `Solution Architect (Contract)` + `Cost/FinOps Estimator` + `Workforce Scheduler` | [`pm-team/CHARTER.md`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/pm-team/CHARTER.md) |
| **3** | **`dev-team`** | Đội ngũ `Senior Developers` (Extension, Tool, Web, App) chạy trên các Git Worktree cô lập | [`dev-team/CHARTER.md`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/dev-team/CHARTER.md) |
| **4** | **`testing-team`** | Hợp nhất `Test Engineer (3-Tier Automated Tests)` + `QA Reviewer (Real-Surface Browser/API & Evidence)` | [`testing-team/CHARTER.md`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/testing-team/CHARTER.md) |
| **5** | **`devops-team`** | Hợp nhất `DevOps CI/CD` + `Security Scanner (Secret/CVE/SAST)` + `Minimal Infra & Rollback` | [`devops-team/CHARTER.md`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/devops-team/CHARTER.md) |

