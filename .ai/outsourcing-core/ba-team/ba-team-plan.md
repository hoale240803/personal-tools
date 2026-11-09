# Kế Hoạch Xây Dựng Team Phân Tích Yêu Cầu Khách Hàng (`ba-team`)

> **Mục tiêu tối thượng:** Xây dựng một dây chuyền Phân tích Yêu cầu Khách hàng tự động, chặt chẽ gồm 3 mảnh ghép: **`intake`** (Tiếp nhận & Làm sạch) $\rightarrow$ **`ba`** (Đặc tả & Truy vết) $\rightarrow$ **`requirement_challenger`** (Phản biện Độc lập).
>
> **Nguyên tắc Chia nhỏ (Atomic Micro-Tasks):**
> - Mỗi **Mục nhỏ** bên dưới được thiết kế để thực hiện trong **1–2 phút** (chỉ định nghĩa 1 khối YAML/JSON, viết 1 phần của template, hoặc 1 hàm kiểm tra ngắn).
> - Các mục được gom sẵn thành **7 Ca làm việc (1–2 tiếng/ngày)** để sẵn sàng đồng bộ lên Lịch (Calendar) ngay sau khi duyệt.

---

## Tổng Quan Kiến Trúc Của `ba-team` Cần Xây Dựng

```text
d:\Workspace\personal-tools\.ai\outsourcing-core\ba-team\
├── ba-team-plan.md                 # File kế hoạch tổng thể này
├── config/
│   ├── ba-team-workflow.yml        # Luồng phối hợp Intake -> BA -> Challenger -> Gate
│   └── engagement-rules.yml        # Luật riêng cho Fixed-Price, ODC, T&M, SLA
├── prompts/
│   ├── intake-agent.md             # System prompt & rules cho Intake Analyst (Tier 1)
│   ├── ba-agent.md                 # System prompt & rules cho Business Analyst (Tier 2/3)
│   └── challenger-agent.md         # System prompt & rules cho Requirement Challenger (Tier 3, Fresh Context)
├── templates/
│   ├── intake-ticket.schema.json   # Cấu trúc chuẩn hóa yêu cầu đầu vào (Fact / Assumption / Unknown)
│   ├── prd-spec-template.md        # Mẫu đặc tả yêu cầu gắn mã truy vết (REQ-ID -> Source)
│   ├── bdd-acceptance-template.md  # Mẫu Given/When/Then (Happy, Negative, Boundary)
│   ├── challenge-report.md         # Mẫu báo cáo phản biện độc lập & chấm điểm DoR
│   └── change-request-cr.md        # Mẫu phiếu Yêu cầu Thay đổi (Change Request cho Fixed-Price)
└── scripts/
    ├── validate-intake.py          # Script kiểm tra phiếu Intake đủ trường bắt buộc
    ├── check-traceability.py       # Script kiểm tra mọi REQ-ID đều có Source và Given/When/Then
    └── check-dor-gate.py           # Script chốt chặn Definition of Ready trước khi giao cho Dev/Tester
```

---

## Lộ Trình Chi Tiết (Mục Lớn & Mục Nhỏ 1–2 Phút)

### MỤC LỚN 1: Xây dựng Bộ khung Tiếp nhận & Phân loại Yêu cầu (`intake`)
*Mục tiêu: Biến tin nhắn/email/tài liệu lộn xộn của khách hàng thành phiếu công việc chuẩn hóa, tách bạch Sự thật (Fact) và Giả định (Assumption).*
*(Thời lượng dự kiến: ~30 phút — Thuộc Ngày 1)*

- [ ] **1.1. (1 phút)** Tạo thư mục `config/`, `prompts/`, `templates/`, `scripts/` bên trong `ba-team/`.
- [ ] **1.2. (2 phút)** Tạo file `templates/intake-ticket.schema.json`: Định nghĩa các trường định danh cơ bản (`ticket_id`, `project_id`, `client_name`, `engagement_model`, `created_at`).
- [ ] **1.3. (2 phút)** Thêm khối `raw_input` và `source_links` vào `intake-ticket.schema.json` để lưu nguyên văn lời khách hàng (chống tam sao thất bổn).
- [ ] **1.4. (2 phút)** Thêm khối phân loại 3 cột: `stated_facts` (Khách nói rõ), `explicit_assumptions` (Tự suy luận tạm), và `blocking_unknowns` (Câu hỏi bắt buộc phải hỏi lại khách) vào `intake-ticket.schema.json`.
- [ ] **1.5. (2 phút)** Thêm khối phân loại độ khẩn cấp (`priority`), loại yêu cầu (`feature` | `bug_fix` | `change_request` | `incident`), và nhãn nhạy cảm (`payment`, `auth`, `pii`) vào schema.
- [ ] **1.6. (2 phút)** Tạo file `prompts/intake-agent.md`: Viết phần **Role Identity & Mission** cho `intake` (Model Tier 1 - nhanh, chi phí thấp, không tự bịa scope).
- [ ] **1.7. (2 phút)** Viết phần **Step-by-Step Instructions** (5 bước xử lý tin nhắn thô và lọc trùng lặp ticket) vào `prompts/intake-agent.md`.
- [ ] **1.8. (2 phút)** Viết phần **Question Filtering Rule** vào `prompts/intake-agent.md`: Quy tắc chỉ được hỏi khách hàng tối đa 3–5 câu hỏi thực sự làm tắc nghẽn việc phân luồng (không hỏi lan man).
- [ ] **1.9. (2 phút)** Viết phần **Guardrails (Cấm kỵ)** vào `prompts/intake-agent.md`: Cấm biến suy đoán của AI thành `stated_facts`.
- [ ] **1.10. (2 phút)** Tạo ví dụ mẫu `templates/example-intake-output.json` minh họa 1 yêu cầu khách hàng thực tế đã được bóc tách chuẩn.

---

### MỤC LỚN 2: Xây dựng Luật Phân tích theo Loại hình Khách hàng (Fixed-Price, ODC, T&M, SLA)
*Mục tiêu: Giúp `ba-team` tự động đổi cách hành xử tùy theo hợp đồng để bảo vệ lợi nhuận công ty và trải nghiệm khách hàng.*
*(Thời lượng dự kiến: ~30 phút — Thuộc Ngày 1)*

- [ ] **2.1. (2 phút)** Tạo file `config/engagement-rules.yml`: Khởi tạo khung cấu hình cho 4 mô hình hợp đồng.
- [ ] **2.2. (2 phút)** Viết luật cho **`fixed_price`** vào `config/engagement-rules.yml`: Bắt buộc khóa Baseline Scope; mọi tính năng phát sinh sau khi chốt MVP tự động chuyển sang luồng `change_request`.
- [ ] **2.3. (2 phút)** Viết luật cho **`odc`** vào `config/engagement-rules.yml`: Bắt buộc bước đọc codebase hiện tại (`codebase_search`) để đồng bộ thuật ngữ (Domain Glossary) và luồng nghiệp vụ sẵn có của khách.
- [ ] **2.4. (2 phút)** Viết luật cho **`time_and_materials`** vào `config/engagement-rules.yml`: Bắt buộc gắn ước lượng độ phức tạp sơ bộ và giá trị kinh doanh (Business Value) cho từng hạng mục để khách hàng chọn thứ tự ưu tiên.
- [ ] **2.5. (2 phút)** Viết luật cho **`managed_service_sla`** vào `config/engagement-rules.yml`: Bắt buộc trích xuất các bước tái hiện lỗi (Reproduction Steps), môi trường bị lỗi và mức độ ảnh hưởng người dùng.
- [ ] **2.6. (2 phút)** Tạo file `templates/change-request-cr.md`: Viết phần Header (Mã CR, Yêu cầu gốc, Lý do phát sinh ngoài phạm vi).
- [ ] **2.7. (2 phút)** Thêm bảng **Đánh giá Tác động (Impact Analysis)** vào `templates/change-request-cr.md`: Tác động lên DB, API, UI, các tính năng đã code xong, và chi phí/thời gian tăng thêm.
- [ ] **2.8. (2 phút)** Thêm mục **3 Lựa chọn cho Khách hàng** vào `templates/change-request-cr.md`: (1) Duyệt thêm ngân sách/thời gian, (2) Đổi ngang (Swap) lấy một tính năng tương đương trong backlog ra, (3) Dời sang Phase 2.

---

### MỤC LỚN 3: Xây dựng Hệ thống Khuôn mẫu Đặc tả Nghiệp vụ & Truy vết (`ba` Templates)
*Mục tiêu: Chuẩn hóa đầu ra của BA để Architect, UI/UX, Senior Dev và Senior Tester đọc vào là làm được ngay, không phải đoán mò.*
*(Thời lượng dự kiến: ~45 phút — Thuộc Ngày 2)*

- [ ] **3.1. (2 phút)** Tạo file `templates/prd-spec-template.md`: Viết mục **1. Tổng quan & Mục tiêu Kinh doanh (Business Outcome)**.
- [ ] **3.2. (2 phút)** Viết mục **2. Từ điển Thuật ngữ Dự án (Domain Glossary)** vào `prd-spec-template.md` để thống nhất tên gọi từ tài liệu vào đến tên biến trong code.
- [ ] **3.3. (2 phút)** Viết mục **3. Danh sách Tác nhân & Ma trận Phân quyền (Actors & RBAC Matrix)** vào `prd-spec-template.md` (Ai được Xem / Tạo / Sửa / Xóa / Duyệt).
- [ ] **3.4. (2 phút)** Viết mục **4. Bảng Yêu cầu Nghiệp vụ & Truy vết Nguồn (Traceable Requirements Table)** vào `prd-spec-template.md` với các cột: `REQ-ID`, `Mô tả`, `Nguồn trích dẫn (Source Link/Quote)`, `Mức độ tự tin (Confirmed / Assumed)`, `Ưu tiên (MoSCoW)`.
- [ ] **3.5. (2 phút)** Viết mục **5. Ma trận 5 Trạng thái Giao diện & Trải nghiệm (5-State UX Matrix)** vào `prd-spec-template.md`: *Ideal (Đủ dữ liệu)*, *Loading (Đang tải)*, *Empty (Rỗng)*, *Error (Lỗi)*, *Partial/Overflow (Dữ liệu tràn/dài)*.
- [ ] **3.6. (2 phút)** Viết mục **6. Ràng buộc Phi chức năng (NFRs: Bảo mật & Hiệu năng trên Hạ tầng tối thiểu)** vào `prd-spec-template.md` (Thời gian phản hồi, giới hạn phân trang, rate-limit, dữ liệu nhạy cảm cần che).
- [ ] **3.7. (2 phút)** Viết mục **7. Phạm vi Loại trừ (Out-of-Scope / Exclusions) & Câu hỏi mở (Open Questions)** vào `prd-spec-template.md`.
- [ ] **3.8. (2 phút)** Tạo file `templates/bdd-acceptance-template.md`: Định nghĩa cấu trúc chuẩn nối `REQ-ID` sang các kịch bản kiểm thử `SCENARIO-ID`.
- [ ] **3.9. (2 phút)** Thêm khuôn mẫu **Tầng 1 – Kịch bản Người dùng Phổ biến (P0 Happy Paths - 80% lưu lượng)** theo chuẩn `Given / When / Then` vào `bdd-acceptance-template.md`.
- [ ] **3.10. (2 phút)** Thêm khuôn mẫu **Tầng 2 – Kịch bản Ngoại lệ & Từ chối (Negative, Validation, Auth & Network Failures)** vào `bdd-acceptance-template.md`.
- [ ] **3.11. (2 phút)** Thêm khuôn mẫu **Tầng 3 – Kịch bản Biên & Hiếm gặp (Boundary Values: 0, -1, MAX, Empty, Unicode, Double-Click/Race Condition)** vào `bdd-acceptance-template.md`.

---

### MỤC LỚN 4: Xây dựng Bộ não & Quy trình cho Business Analyst Agent (`ba`)
*Mục tiêu: Lập trình hành vi cho `ba` biết cách đọc tài liệu, tra cứu code hiện tại, viết đặc tả chuẩn và không bao giờ tự bịa yêu cầu.*
*(Thời lượng dự kiến: ~35 phút — Thuộc Ngày 2)*

- [ ] **4.1. (2 phút)** Tạo file `prompts/ba-agent.md`: Viết phần **Role Identity, Inputs & Outputs** dựa trên `roles.yml`.
- [ ] **4.2. (2 phút)** Viết quy tắc **Codebase Reality Check** vào `prompts/ba-agent.md`: Trước khi viết yêu cầu cho hệ thống có sẵn, phải dùng `codebase_search` kiểm tra xem model/bảng dữ liệu/API hiện tại đang hoạt động thế nào.
- [ ] **4.3. (2 phút)** Viết quy tắc **100% Source Traceability** vào `prompts/ba-agent.md`: Mọi quy tắc nghiệp vụ không có trong lời khách hàng phải bắt buộc gắn nhãn `[ASSUMPTION - NEEDS APPROVAL]`.
- [ ] **4.4. (2 phút)** Viết quy tắc **Data Contract First** vào `prompts/ba-agent.md`: Bắt buộc mô tả rõ dữ liệu đầu vào (kiểu dữ liệu, bắt buộc/tùy chọn, giới hạn min/max) và dữ liệu đầu ra cho từng luồng.
- [ ] **4.5. (2 phút)** Viết quy tắc **Escalation Trigger (Leo thang lên Tier 3)** vào `prompts/ba-agent.md`: Khi nào `ba` tự xử lý ở Tier 2 và khi nào phải xin nâng lên Tier 3 (nghiệp vụ tài chính/thanh toán phức tạp, mâu thuẫn hợp đồng).
- [ ] **4.6. (2 phút)** Viết quy tắc **Handoff & Rework Loop** vào `prompts/ba-agent.md`: Cách `ba` nhận báo cáo lỗi từ `requirement_challenger` để sửa lại đặc tả mà không tự ái hay bỏ sót điểm phản biện.

---

### MỤC LỚN 5: Xây dựng Bộ não cho "Luật sư của Quỷ" (`requirement_challenger`)
*Mục tiêu: Tạo ra chốt chặn độc lập (Tier 3, Fresh Context) chuyên vạch lá tìm sâu, bắt lỗi mâu thuẫn và lỗ hổng nghiệp vụ trước khi Dev viết dòng code đầu tiên.*
*(Thời lượng dự kiến: ~60 phút — Thuộc Ngày 3)*

- [ ] **5.1. (2 phút)** Tạo file `templates/challenge-report.md`: Định nghĩa phần Header (`report_id`, `spec_version_reviewed`, `verdict`: `PASS` | `REVISE` | `ESCALATE_TO_HUMAN`).
- [ ] **5.2. (2 phút)** Thêm bảng **Phát hiện Lỗ hổng (Findings Table)** vào `templates/challenge-report.md` gồm: `Finding-ID`, `Mức độ nghiêm trọng (Critical/Major/Minor)`, `Loại lỗi (Ambiguity / Contradiction / Missing Edge Case / Abuse Case)`, `Trích dẫn đoạn bị lỗi`, và `Câu hỏi/Yêu cầu làm rõ`.
- [ ] **5.3. (2 phút)** Thêm bảng chấm điểm **Definition of Ready (DoR Scorecard)** vào `templates/challenge-report.md` (Đạt 10/10 tiêu chí mới được phép chuyển sang cho Architect/Developer).
- [ ] **5.4. (2 phút)** Tạo file `prompts/challenger-agent.md`: Viết phần **Fresh-Context Mandate** (Chỉ đọc bản đặc tả và tài liệu nguồn gốc, tuyệt đối không đọc lời biện hộ của BA).
- [ ] **5.5. (2 phút)** Viết **Checklist Tấn công 1 – Tìm sự Mơ hồ (Ambiguity Hunter)** vào `prompts/challenger-agent.md`: Bắt tất cả các từ chung chung vô nghĩa như *"nhanh chóng", "thân thiện", "xử lý hợp lý", "v.v.", "tương tự như cũ"* và bắt BA phải định량 hóa bằng con số cụ thể.
- [ ] **5.6. (2 phút)** Viết **Checklist Tấn công 2 – Tìm sự Mâu thuẫn (Contradiction Detector)** vào `prompts/challenger-agent.md`: Soi xem Rule ở mục A có đá nhau với Rule ở mục B hoặc đá với tính năng cũ trong codebase không.
- [ ] **5.7. (2 phút)** Viết **Checklist Tấn công 3 – Kịch bản Phá hoại & Tương tranh (Concurrency & Abuse Cases)** vào `prompts/challenger-agent.md`: Kiểm tra trường hợp bấm đúp 2 lần (Double submission), 2 người cùng sửa 1 bản ghi, hủy ngang giữa chừng, spam API, hoặc truyền số âm/0.
- [ ] **5.8. (2 phút)** Viết **Checklist Tấn công 4 – Kiểm tra Tính Khả thi Kiểm thử (Testability Audit)** vào `prompts/challenger-agent.md`: Kiểm tra xem mỗi câu `Then` trong kịch bản của BA có thể kiểm chứng bằng mắt/log/assertion tự động của `test_engineer` và `qa_reviewer` được không.
- [ ] **5.9. (2 phút)** Viết **Guardrail Bất khả xâm phạm** vào `prompts/challenger-agent.md`: Challenger chỉ được chỉ ra lỗi và trả về cho BA, **cấm tự ý viết lại đặc tả của BA** và **cấm duyệt cho qua khi còn bất kỳ lỗi Critical/Major nào**.

---

### MỤC LỚN 6: Xây dựng Các Script Kiểm tra Tất định (Deterministic Verification Scripts)
*Mục tiêu: Áp dụng đúng triết lý "Deterministic script before model" — dùng code kiểm tra tự động cấu trúc tài liệu của BA trước khi tốn token gọi AI cấp cao.*
*(Thời lượng dự kiến: ~60 phút — Thuộc Ngày 4)*

- [ ] **6.1. (2 phút)** Tạo file `scripts/validate-intake.py`: Viết hàm đọc file JSON đầu ra của `intake`.
- [ ] **6.2. (2 phút)** Thêm logic kiểm tra đủ các trường bắt buộc và tách bạch `stated_facts` vs `explicit_assumptions` vào `validate-intake.py` (trả về `exit code 1` kèm thông báo lỗi rõ ràng nếu thiếu).
- [ ] **6.3. (2 phút)** Tạo file `scripts/check-traceability.py`: Viết hàm quét danh sách toàn bộ mã `REQ-xxx` trong file đặc tả PRD.
- [ ] **6.4. (2 phút)** Thêm logic vào `check-traceability.py`: Kiểm tra mỗi mã `REQ-xxx` có cột `Source` (nguồn gốc) hợp lệ hay không.
- [ ] **6.5. (2 phút)** Thêm logic vào `check-traceability.py`: Đối chiếu sang file `bdd-acceptance-template.md` để đảm bảo 100% mã `REQ-xxx` đều có ít nhất 1 kịch bản Happy Path và 1 kịch bản Negative/Boundary tương ứng.
- [ ] **6.6. (2 phút)** Thêm bộ lọc từ khóa mơ hồ (Forbidden Vague Words Linter: *"etc.", "v.v.", "as appropriate", "fast", "tùy ý"*) vào `check-traceability.py` để cảnh báo tự động cho BA.
- [ ] **6.7. (2 phút)** Tạo file `scripts/check-dor-gate.py`: Viết script tổng hợp chạy cả `validate-intake.py`, `check-traceability.py` và kiểm tra trạng thái `PASS` trong `challenge-report.md` để làm lệnh `verify:ba` duy nhất.

---

### MỤC LỚN 7: Ghép nối Workflow Nội bộ & Chạy Thử Nghiệm Thực Chiến (Dry-Run)
*Mục tiêu: Kết nối 3 Agent (`intake`, `ba`, `requirement_challenger`) với `orchestrator` và chạy thử trên 1 bài toán khách hàng thực tế.*
*(Thời lượng dự kiến: ~60 phút — Thuộc Ngày 5)*

- [ ] **7.1. (2 phút)** Tạo file `config/ba-team-workflow.yml`: Định nghĩa luồng chuyển trạng thái (`NEW_REQUEST` $\rightarrow$ `INTAKE_DONE` $\rightarrow$ `SPEC_DRAFTED` $\rightarrow$ `CHALLENGED` $\rightarrow$ `WAITING_CLIENT_CLARIFICATION` $\rightarrow$ `READY_FOR_DEV`).
- [ ] **7.2. (2 phút)** Định nghĩa luật **No-Block / Soft Dependency** trong `ba-team-workflow.yml`: Khi `ba` bị dừng ở trạng thái `WAITING_CLIENT_CLARIFICATION` cho 1 phần nhỏ, cách tách phần đã rõ ràng (`READY_FOR_DEV`) ra thành Slice độc lập để `developer` làm trước.
- [ ] **7.3. (2 phút)** Định nghĩa giới hạn vòng lặp (**Max 2 Revise Loops**) giữa `ba` và `requirement_challenger`: Nếu sau 2 lần sửa mà vẫn còn mâu thuẫn nghiệp vụ, tự động đóng gói câu hỏi đẩy lên `product_owner`.
- [ ] **7.4. (2 phút)** Tạo thư mục `examples/dry-run-01/` và bỏ vào 1 đề bài khách hàng thực tế có cố tình cài cắm thông tin mơ hồ và bẫy mở rộng scope (Scope Creep).
- [ ] **7.5. (2 phút)** Chạy thử bước 1 (`intake`) trên đề bài mẫu và kiểm tra bằng `scripts/validate-intake.py`.
- [ ] **7.6. (2 phút)** Chạy thử bước 2 (`ba`) sinh ra PRD + BDD Scenarios và kiểm tra bằng `scripts/check-traceability.py`.
- [ ] **7.7. (2 phút)** Chạy thử bước 3 (`requirement_challenger`) để bắt các bẫy mơ hồ/mâu thuẫn đã cài cắm và xuất `challenge-report.md`.
- [ ] **7.8. (2 phút)** Chạy lệnh tổng `scripts/check-dor-gate.py` xác nhận toàn bộ dây chuyền `ba-team` đạt chuẩn `PASS` và sẵn sàng bàn giao cho `architect` + `developer` + `test_engineer`.

---

## Lịch Trình Phân Bổ 1–2 Tiếng / Ngày (Sẵn Sàng Sync Lên Calendar)

Sau khi bạn review và chốt kế hoạch này, chúng ta sẽ đồng bộ 5 buổi làm việc (mỗi buổi 1–1.5 tiếng) lên lịch của bạn như sau:

| Ngày | Ca làm việc (1–1.5 tiếng/ngày) | Nội dung thực hiện | Đầu ra nghiệm thu (Deliverables) |
| :--- | :--- | :--- | :--- |
| **Ngày 1** | **Ca 1 (60 phút):** Mục Lớn 1 & Mục Lớn 2 | Xây dựng `intake` (Schema + Prompt) & Luật cho 4 loại khách hàng (Fixed-Price, ODC, T&M, SLA + Mẫu Change Request). | `intake-ticket.schema.json`, `intake-agent.md`, `engagement-rules.yml`, `change-request-cr.md` |
| **Ngày 2** | **Ca 2 (80 phút):** Mục Lớn 3 & Mục Lớn 4 | Xây dựng khuôn mẫu PRD truy vết nguồn, BDD 3 tầng (Happy/Negative/Edge), 5-State UX và bộ não của `ba`. | `prd-spec-template.md`, `bdd-acceptance-template.md`, `ba-agent.md` |
| **Ngày 3** | **Ca 3 (60 phút):** Mục Lớn 5 | Xây dựng bộ não và 4 Checklist tấn công cho `requirement_challenger` + Bảng chấm điểm DoR. | `challenge-report.md`, `challenger-agent.md` |
| **Ngày 4** | **Ca 4 (60 phút):** Mục Lớn 6 | Viết bộ 3 script kiểm tra tất định bằng Python (`validate-intake`, `check-traceability`, `check-dor-gate`). | Bộ CLI kiểm chứng tự động cho `ba-team` |
| **Ngày 5** | **Ca 5 (60 phút):** Mục Lớn 7 | Ghép nối `ba-team-workflow.yml` và chạy Dry-Run thực chiến từ đầu đến cuối trên đề bài mẫu. | Dây chuyền `ba-team` hoàn chỉnh, có bằng chứng chạy pass 100% |

