# Phiếu Phân Loại & Kích Hoạt Nhanh Cho 5 Dự Án Chưa Khởi Tạo Yêu Cầu (`uninitialized-ideas-intake-triage`)

- **Mã Tài Liệu**: `INTAKE-TRIAGE-GROUP4-005`
- **Phân Nhóm**: Nhóm 4 — Các Dự Án Placeholder / Chưa Có Nội Dung Yêu Cầu (`Uninitialized Ideas`)
- **Đội Ngũ Phụ Trách**: Squad 4 — BA Team (`intake`, `ba`, `requirement_challenger`) & PM Team (`orchestrator`, `estimator_cost_controller`)
- **Trạng Thái Tổng Thể**: `⛔ INTAKE BLOCKED — AWAITING PRODUCT OWNER OPTION SELECTION (A / B / C)`

---

## 1. BẢNG KIỂM TRA HIỆN TRẠNG THỰC TẾ TRONG WORKSPACE (`intake` Ground-Truth Audit)

Qua quá trình kiểm tra trực tiếp hệ thống tệp tại `d:\Workspace\personal-tools\idea\`, Squad 4 ghi nhận trạng thái thực tế của 5 thư mục như sau:

| STT | Tên Thư Mục Dự Án | Đường Dẫn Thực Tế | Trạng Thái File Hiện Có | Kết Luận Cổng `intake` |
| :---: | :--- | :--- | :--- | :--- |
| 1 | `best-insurance-tool` | `d:\Workspace\personal-tools\idea\best-insurance-tool` | Thư mục hoàn toàn trống (`0 files`). | `⛔ INTAKE BLOCKED` (0% thông tin đầu vào) |
| 2 | `best-saler` | `d:\Workspace\personal-tools\idea\best-saler` | Có file [requirement.md](file:///d:/Workspace/personal-tools/idea/best-saler/requirement.md) dung lượng `3 bytes` (chỉ chứa đúng ký tự `"1. "`). | `⛔ INTAKE BLOCKED` (Chưa có nội dung yêu cầu) |
| 3 | `memory-app` | `d:\Workspace\personal-tools\idea\memory-app` | Có file [requirement.md](file:///d:/Workspace/personal-tools/idea/memory-app/requirement.md) dung lượng `0 bytes` (rỗng hoàn toàn). | `⛔ INTAKE BLOCKED` (Chưa có nội dung yêu cầu) |
| 4 | `pipe-line-sale-agent` | `d:\Workspace\personal-tools\idea\pipe-line-sale-agent` | Có file [requirement.md](file:///d:/Workspace/personal-tools/idea/pipe-line-sale-agent/requirement.md) dung lượng `0 bytes` (rỗng hoàn toàn). | `⛔ INTAKE BLOCKED` (Chưa có nội dung yêu cầu) |
| 5 | `the-chosen-one-tool` | `d:\Workspace\personal-tools\idea\the-chosen-one-tool` | Thư mục hoàn toàn trống (`0 files`). | `⛔ INTAKE BLOCKED` (0% thông tin đầu vào) |

> [!IMPORTANT]
> **Quy tắc Cổng Kiểm Duyệt (`No Guessing Policy`)**: Theo quy định của AISE, khi thư mục dự án chưa có bất kỳ dữ liệu nghiệp vụ nào (`0 bytes`), BA và Developer tuyệt đối **không tự ý bịa yêu cầu để viết code**. Thay vào đó, Squad 4 đã phân tích toàn bộ **Hệ sinh thái 27 dự án của Chủ dự án** (Tiệm Nails/POS tại Mỹ, Mua xe cũ `cheap-used-car-tool`, Bất động sản `real-estate-local-detective-tool`, Quản lý chi tiêu `expense-management-app`, Tuyển dụng/Săn việc `dm-jobs`, Đầu tư `trading-tool` / `company-prospect`) để thiết kế sẵn **3 Phương án Sản phẩm (Option A / B / C)** sát sườn nhất cho từng ý tưởng.
>
> **Cách kích hoạt nhanh**: Chủ dự án chỉ cần phản hồi ngắn gọn (ví dụ: `1A, 2B, 3A, 4A, 5C`), BA Team sẽ lập tức sinh bản Đặc tả Thực thi 5 phần đầy đủ trong vòng 1 lượt!

---

## 2. PHIẾU `INTAKE BLOCKED / CLARIFICATION BRIEF` CHI TIẾT CHO TỪNG Ý TƯỞNG

---

### Ý TƯỞNG #1: `best-insurance-tool`
- **Trạng thái hiện tại**: `⛔ INTAKE BLOCKED` — Thư mục `idea/best-insurance-tool` đang trống (`0 files`).
- **Ngữ cảnh Hệ sinh thái liên quan**: Chủ dự án đang có các công cụ săn vé máy bay rẻ (`cheap-flight-tool`), mua xe cũ giá hời (`cheap-used-car-tool`), bất động sản (`real-estate-local-detective-tool`) và vận hành tiệm Nails (`nails-pos`).

#### Đề Xuất 3 Hướng Sản Phẩm Tiềm Năng (Chọn A, B hoặc C):

| Phương Án | Tên Gọi & Mô Tả Sản Phẩm Đề Xuất | Tính Năng Cốt Lõi (MVP Scope) | Ước Lượng Effort |
| :--- | :--- | :--- | :--- |
| **Option A** *(Khuyến nghị)* | **Auto & Home/Business Insurance Rate Comparator & Policy Analyzer** *(Công cụ so sánh phí bảo hiểm Xe hơi / Nhà ở / Tiệm Nails & Phân tích hợp đồng bằng AI)* | 1. Nhập thông tin xe (VIN/Đời xe từ `cheap-used-car-tool`), nhà ở hoặc tiệm Nails để so sánh báo giá bảo hiểm tốt nhất (Deductible, Liability, Full Coverage).<br>2. Upload file PDF hợp đồng bảo hiểm hiện tại, AI tự động bóc tách các điều khoản loại trừ ẩn (Hidden Exclusions), phần bảo hiểm trùng lặp và đề xuất gói tiết kiệm 15-30%/năm.<br>3. Nhắc lịch tái tục (Renewal Alert) trước 30 ngày để đổi hãng giá tốt hơn. | **S - M** (3 - 5 ngày) |
| **Option B** | **Health & Life Insurance Advisor for Family / Small Business Employees** *(Trợ lý chọn gói Bảo hiểm Y tế ACA / Nhân thọ tối ưu chi phí & quyền lợi)* | 1. Nhập cấu trúc gia đình/nhân sự, thu nhập dự kiến, danh sách bác sĩ/thuốc đang dùng.<br>2. Tính toán tổng chi phí thực tế trong năm (`Total Annual Cost = Premium + Deductible + Out-of-Pocket Max`) giữa các gói Bronze/Silver/Gold/HSA.<br>3. Đề xuất gói có lợi nhất theo kịch bản ít khám bệnh vs. có biến cố y tế. | **S - M** (3 - 4 ngày) |
| **Option C** | **Insurance Agent Lead & Quote Automation Tool** *(Công cụ dành cho Đại lý Bảo hiểm tự động báo giá & chăm sóc khách hàng)* | 1. Form thu thập thông tin khách hàng nhanh.<br>2. Tự động ghép gói bảo hiểm phù hợp và xuất bảng so sánh PDF chuyên nghiệp gửi qua SMS/Zalo/Email.<br>3. Quản lý danh sách hợp đồng sắp đáo hạn của khách hàng. | **M** (4 - 6 ngày) |

- **Câu hỏi phụ nếu chọn**: Thị trường mục tiêu chính là **Mỹ (US)** hay **Việt Nam (VN)**?

---

### Ý TƯỞNG #2: `best-saler`
- **Trạng thái hiện tại**: `⛔ INTAKE BLOCKED` — File `idea/best-saler/requirement.md` chỉ có `3 bytes` (`"1. "`).
- **Ngữ cảnh Hệ sinh thái liên quan**: Liên kết chặt chẽ với `pipe-line-sale-agent`, `nails-pos`, `social-media-management-tool`, `facebook-auto-poster`.

#### Đề Xuất 3 Hướng Sản Phẩm Tiềm Năng (Chọn A, B hoặc C):

| Phương Án | Tên Gọi & Mô Tả Sản Phẩm Đề Xuất | Tính Năng Cốt Lõi (MVP Scope) | Ước Lượng Effort |
| :--- | :--- | :--- | :--- |
| **Option A** *(Khuyến nghị)* | **AI Real-Time Sales Copilot & Objection Handler** *(Trợ lý AI huấn luyện & gợi ý kịch bản chốt sale tức thời khi đang chat/gọi với khách)* | 1. Khi nhân viên sale/chủ tiệm đang tư vấn khách (qua Facebook Messenger, Zalo, SMS hoặc điện thoại), nhập hoặc dán câu từ chối của khách (VD: *"Giá cao quá"*, *"Để chị suy nghĩ thêm"*).<br>2. AI phân tích tâm lý khách hàng và đưa ra ngay 3 phương án trả lời khéo léo (Soft Close / Value Reframe / Urgency Offer) để chốt đơn.<br>3. Lưu thư viện kịch bản chốt sale thành công (`Winning Playbooks`) và chấm điểm kỹ năng của từng saler. | **S - M** (3 - 5 ngày) |
| **Option B** | **Automated Upsell / Cross-Sell Chatbot cho Tiệm Dịch Vụ & Bán Lẻ** *(Bot tự động tư vấn và chốt đơn 24/7 trên Fanpage/Web)* | 1. Tích hợp danh mục dịch vụ/sản phẩm và bảng giá từ `settings.json`.<br>2. Tự động trả lời inbox khách hàng, gợi ý gói combo/upsell (VD: làm Nails gợi ý thêm Spa/Design) để tăng giá trị đơn hàng trung bình (`AOV`).<br>3. Tự động chuyển cuộc hội thoại cho người thật khi khách sẵn sàng thanh toán. | **M** (5 - 7 ngày) |
| **Option C** | **Sales Team Leaderboard & Commission Performance Tracker** *(Hệ thống xếp hạng doanh số, tính hoa hồng & KPI cho đội ngũ bán hàng/thợ)* | 1. Theo dõi doanh số, tỷ lệ chốt đơn (`Conversion Rate`), số lượng khách quay lại của từng nhân viên theo ngày/tuần/tháng.<br>2. Tự động tính hoa hồng bậc thang (Tiered Commission) và thưởng nóng (`Best Saler of the Month`).<br>3. Phát hiện sớm nhân viên có hiệu suất sụt giảm để đào tạo lại. | **S** (2 - 4 ngày) |

---

### Ý TƯỞNG #3: `memory-app`
- **Trạng thái hiện tại**: `⛔ INTAKE BLOCKED` — File `idea/memory-app/requirement.md` rỗng (`0 bytes`).
- **Ngữ cảnh Hệ sinh thái liên quan**: Hệ sinh thái đã có `note-tool` (ghi chú) và các công cụ quản lý cá nhân (`expense-management-app`, `paper-work-tool`).

#### Đề Xuất 3 Hướng Sản Phẩm Tiềm Năng (Chọn A, B hoặc C):

| Phương Án | Tên Gọi & Mô Tả Sản Phẩm Đề Xuất | Tính Năng Cốt Lõi (MVP Scope) | Ước Lượng Effort |
| :--- | :--- | :--- | :--- |
| **Option A** *(Khuyến nghị)* | **Personal AI Second Brain & Relationship/Life Memory Vault** *(Bộ nhớ thứ hai bằng AI: Lưu giữ và truy vấn mọi thông tin cá nhân, đối tác, giấy tờ, sự kiện quan trọng)* | 1. Ghi nhanh bằng giọng nói/text mọi thứ cần nhớ (VD: *"Anh Nam đối tác thích uống cà phê đen không đường, sinh nhật 12/08"*, *"Mật khẩu két sắt hồ sơ thuế nằm ở ngăn kéo số 2"*, *"Lịch thay nhớt xe lúc 45,000 miles"*).<br>2. Tìm kiếm ngữ nghĩa tự nhiên (Semantic Search / RAG): Hỏi *"Lần trước gặp anh Nam mình đã hứa gì?"* hoặc *"Hạn gia hạn giấy phép tiệm là ngày nào?"*.<br>3. Tự động nhắc nhở thông minh trước các mốc kỷ niệm, hạn giấy tờ hoặc lịch hẹn định kỳ. | **M** (4 - 6 ngày) |
| **Option B** | **Spaced Repetition Flashcard & Skill Mastery App (Anki-style + AI)** *(Ứng dụng luyện trí nhớ ngắt quãng để học ngoại ngữ, thuật ngữ đầu tư, bài thi chứng chỉ)* | 1. Tự động tạo bộ thẻ Flashcard từ tài liệu/ghi chú bằng AI.<br>2. Thuật toán lặp lại ngắt quãng `FSRS / SM-2` tính toán đúng thời điểm sắp quên để nhắc ôn tập mỗi ngày 10 phút.<br>3. Thống kê chuỗi ngày học (`Streak`) và tỷ lệ ghi nhớ dài hạn. | **S - M** (3 - 5 ngày) |
| **Option C** | **Family & Couple Shared Photo/Timeline Memory Journal** *(Nhật ký lưu giữ khoảnh khắc, kỷ niệm gia đình theo dòng thời gian)* | 1. Lưu trữ hình ảnh, câu chuyện, cột mốc đáng nhớ theo Timeline và bản đồ.<br>2. Tính năng *"On This Day (Ngày này năm xưa)"* gửi thông báo ôn lại kỷ niệm.<br>3. Xuất thành sách ảnh PDF hoặc album chia sẻ riêng tư. | **S - M** (3 - 5 ngày) |

---

### Ý TƯỞNG #4: `pipe-line-sale-agent`
- **Trạng thái hiện tại**: `⛔ INTAKE BLOCKED` — File `idea/pipe-line-sale-agent/requirement.md` rỗng (`0 bytes`).
- **Ngữ cảnh Hệ sinh thái liên quan**: Kết nối trực tiếp với `best-saler`, `dm-jobs`, `detecting-new-nails-competitors-tool`, `real-estate-local-detective-tool`.

#### Đề Xuất 3 Hướng Sản Phẩm Tiềm Năng (Chọn A, B hoặc C):

| Phương Án | Tên Gọi & Mô Tả Sản Phẩm Đề Xuất | Tính Năng Cốt Lõi (MVP Scope) | Ước Lượng Effort |
| :--- | :--- | :--- | :--- |
| **Option A** *(Khuyến nghị)* | **Autonomous B2B/B2C Sales Pipeline & Follow-Up AI Agent** *(Agent tự động quản lý phễu khách hàng `Lead -> Qualified -> Proposal -> Follow-up -> Closed` và nhắc/gửi tin chăm sóc)* | 1. Bảng Kanban trực quan quản lý toàn bộ khách hàng tiềm năng theo từng bước trong phễu (Pipeline Stages).<br>2. **Zero-Lead-Left-Behind Engine**: Tự động phát hiện khách hàng bị "ngâm" quá `X` ngày chưa tương tác, dùng AI soạn sẵn tin nhắn Follow-up cá nhân hóa theo ngữ cảnh lần nói chuyện trước.<br>3. Dự báo doanh thu kỳ vọng (`Weighted Pipeline Value`) và bắn cảnh báo việc cần làm mỗi sáng qua Telegram. | **M** (4 - 6 ngày) |
| **Option B** | **Outbound Lead Scraping & Cold Outreach Automation Agent** *(Agent tự động quét tìm khách hàng tiềm năng từ Google Maps/LinkedIn/Web và gửi chuỗi tin nhắn tiếp cận)* | 1. Nhập ngành nghề & khu vực mục tiêu để tự động thu thập danh sách doanh nghiệp/khách hàng (SĐT, Email, Website, Điểm đánh giá).<br>2. AI phân tích điểm yếu của từng lead và tạo chuỗi kịch bản tiếp cận đa bước (`Drip Sequence`).<br>3. Tự động chuyển trạng thái sang `Hot Lead` khi khách phản hồi. | **M - L** (5 - 8 ngày) |
| **Option C** | **Customer Retention & Reactivation Pipeline cho Tiệm Nails / Dịch Vụ** *(Phễu tự động kéo khách cũ quay lại tiệm và chăm sóc sau bán hàng)* | 1. Phân nhóm khách hàng tự động: Khách mới (1 lần), Khách thân thiết (VIP), Khách có nguy cơ bỏ tiệm (> 30 ngày chưa quay lại).<br>2. Tự động kích hoạt chiến dịch gửi ưu đãi/lời hỏi thăm cá nhân hóa để kéo khách quay lại.<br>3. Đo lường tỷ lệ quay lại (`Retention Rate`) và doanh thu thu hồi được. | **S - M** (3 - 5 ngày) |

---

### Ý TƯỞNG #5: `the-chosen-one-tool`
- **Trạng thái hiện tại**: `⛔ INTAKE BLOCKED` — Thư mục `idea/the-chosen-one-tool` đang trống (`0 files`).
- **Ngữ cảnh Hệ sinh thái liên quan**: Trong danh mục của Chủ dự án có hàng loạt công cụ tìm kiếm & sàng lọc: mua xe cũ (`cheap-used-car-tool`), bất động sản (`real-estate-local-detective-tool`), học bổng (`university-schoolership-tool`), việc làm (`find-job-tool`), cổ phiếu/công ty (`company-prospect`), nhà cung cấp vật tư (`best-buy-supplies-tool`).

#### Đề Xuất 3 Hướng Sản Phẩm Tiềm Năng (Chọn A, B hoặc C):

| Phương Án | Tên Gọi & Mô Tả Sản Phẩm Đề Xuất | Tính Năng Cốt Lõi (MVP Scope) | Ước Lượng Effort |
| :--- | :--- | :--- | :--- |
| **Option A** *(Khuyến nghị)* | **Multi-Criteria Decision Matrix & Top-1 Winner Selector ("The Chosen One" Ranking Engine)** *(Công cụ chấm điểm đa tiêu chí để chọn ra duy nhất 1 lựa chọn tối ưu nhất khi mua Nhà, mua Xe, chọn Cổ phiếu, chọn Nhân sự hoặc chọn Mặt bằng)* | 1. Nhập danh sách các ứng viên đang phân vân (VD: 5 căn nhà, 4 chiếc xe cũ, 6 mặt bằng mở tiệm, hoặc 10 ứng viên tuyển dụng).<br>2. Thiết lập bộ tiêu chí & trọng số ưu tiên (`Weighted Criteria` — Giá, Vị trí, Rủi ro, ROI, Chi phí ẩn) hoặc dùng bộ mẫu có sẵn.<br>3. Động cơ thuật toán (`AHP / TOPSIS`) + AI Phản biện phân tích ưu/nhược điểm chéo, loại bỏ cảm tính và chỉ định **"The Chosen One" (#1 lựa chọn tốt nhất)** kèm biên độ an toàn. | **S - M** (3 - 4 ngày) |
| **Option B** | **Master Command Center / Unified Super-Dashboard cho Toàn Bộ 27 Personal Tools** *(Trung tâm điều khiển hợp nhất "Một công cụ thống trị tất cả" — gom cảnh báo & kết quả từ toàn bộ các tool trong workspace)* | 1. Kết nối và đọc dữ liệu đầu ra từ `trading-tool`, `company-prospect`, `cheap-flight-tool`, `cheap-used-car-tool`, `real-estate-local-detective-tool`.<br>2. Mỗi ngày chỉ lọc ra **Top 1 cơ hội tốt nhất ("The Chosen One Deal of the Day")** đáng xuống tiền nhất trên mọi lĩnh vực.<br>3. Giao diện điều khiển tập trung để bật/tắt, xem trạng thái sức khỏe của toàn bộ các Agent trong workspace. | **M** (4 - 6 ngày) |
| **Option C** | **Candidate / Talent Screening & "Best Hire" Selector** *(Công cụ sàng lọc CV/hồ sơ ứng viên tự động để chọn ra ứng viên xuất sắc nhất)* | 1. Upload hàng loạt CV/hồ sơ hoặc thông tin thợ/nhân viên ứng tuyển.<br>2. AI chấm điểm độ khớp kỹ năng, kinh nghiệm, độ ổn định gắn bó và phát hiện Red Flags.<br>3. Xếp hạng và tạo bộ câu hỏi phỏng vấn xoáy sâu cho Top 1 ứng viên. | **S - M** (3 - 5 ngày) |

---

## 3. BẢNG PHẢN HỒI KÍCH HOẠT NHANH DÀNH CHO CHỦ DỰ ÁN (QUICK ACTIVATION FORM)

Chủ dự án chỉ cần copy khối bên dưới, điền chữ cái `A`, `B`, hoặc `C` (kèm ghi chú ngắn nếu muốn tùy biến) để mở khóa cổng `intake`:

```text
[KÍCH HOẠT DỰ ÁN NHÓM 4]
1. best-insurance-tool   : Option [ A / B / C ] - Ghi chú thêm: ...
2. best-saler            : Option [ A / B / C ] - Ghi chú thêm: ...
3. memory-app            : Option [ A / B / C ] - Ghi chú thêm: ...
4. pipe-line-sale-agent  : Option [ A / B / C ] - Ghi chú thêm: ...
5. the-chosen-one-tool   : Option [ A / B / C ] - Ghi chú thêm: ...
```
