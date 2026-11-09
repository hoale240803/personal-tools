# 00B — SỔ QUYẾT ĐỊNH LÀM RÕ YÊU CẦU TOÀN DANH MỤC (`CLARIFY & APPROVAL GATE`)

> **Người lập:** Project Manager (`orchestrator`) + Business Analyst (`ba`) + Requirement Challenger (`requirement_challenger`)  
> **Người phê duyệt:** Chủ dự án (`product_owner`)  
> **Nguyên tắc Ưu tiên & No-Block:**
> - Toàn bộ **Đợt 1 (`01` $\rightarrow$ `07` trong [`00A-MASTER-PRIORITY-ROADMAP.md`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/00A-MASTER-PRIORITY-ROADMAP.md))** là các Extension & Small Tool **0% AI, chi phí $0/tháng** và đã có thể bắt tay vào code ngay mà không bị chặn.
> - Các câu hỏi dưới đây chỉ nhằm chốt hướng cho các tính năng mở rộng ở Đợt 2–4. Bạn chỉ cần gõ **`Đồng ý toàn bộ khuyến nghị`** (hoặc `Q1: A, Q2: A...`) bất cứ lúc nào.

---

### Q1 — Dự án #02: `idea/best-buy-supplies-tool` ([`02-EXT-best-buy-supplies-tool-spec.md`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/02-EXT-best-buy-supplies-tool-spec.md))
**1. Câu hỏi gốc:** Trong `requirement.md` của dự án này có 2 phần: (Phase 1) Chrome Extension MV3 cào giá ngầm Amazon/Temu đã có sẵn 4 file code, và (Phase 2) Tool lên thực đơn tuần 3 bữa/ngày $\times 3$ món + lọc Top 3 siêu thị rẻ nhất (Costco, Kroger, Meijer, Target, Weee).
**2. Các phương án đề xuất:**
- **Option A (Khuyến nghị):** Làm dứt điểm **Phase 1 (Chrome Extension MV3 - 0% AI, $0/tháng)** ngay trong Đợt 1 (chỉ mất ~60 phút vì đã có code sẵn); còn **Phase 2 (Tối ưu giỏ hàng đi chợ tuần)** tách sang Đợt 2/3.
- **Option B:** Tách thành 2 thư mục dự án riêng biệt.
- **Option C:** Làm cả 2 phần cùng một lúc.
**3. Khuyến nghị của PM & BA:** **Chọn Option A** để thu hoạch ngay 1 Chrome Extension chạy hoàn chỉnh trong 60 phút đúng tiêu chí *Time ngắn nhất – Effort thấp nhất – $0 Cost*.

---

### Q2 — Dự án #07: `idea/dm-jobs` ([`07-TOOL-dm-jobs-spec.md`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/07-TOOL-dm-jobs-spec.md))
**1. Câu hỏi gốc:** Kênh liên hệ HR/Tuyển dụng nào được dùng để giữ đúng cam kết **Hạ tầng miễn phí 100% ($0/tháng)** và **0% chi phí AI** ở bản MVP?
**2. Các phương án đề xuất:**
- **Option A (Khuyến nghị):** Dùng **Rule-based Q&A Flow (0% AI)** + **Gmail API miễn phí 100%** kết hợp **1-Click SMS/WhatsApp Deep-Link Queue** (chuẩn bị sẵn tin nhắn theo ngành Cleaning/Sales để người dùng bấm gửi trong 1 giây không tốn phí Twilio, tự động khóa vĩnh viễn khi đối phương nhắn `STOP`).
- **Option B:** Dùng Twilio SMS trả phí (\$0.0079/tin + phí thuê số hàng tháng).
**3. Khuyến nghị của PM & BA:** **Chọn Option A** (100% Free, không cần AI).

---

### Q3 — Dự án #11: `idea/facebook-auto-poster` ([`11-TOOL-facebook-auto-poster-spec.md`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/11-TOOL-facebook-auto-poster-spec.md))
**1. Câu hỏi gốc:** Cách xử lý ảnh/video để ít phụ thuộc AI nhất và chi phí gần như $0?
**2. Các phương án đề xuất:**
- **Option A (Khuyến nghị):** Dùng **Pillow (Python)** ghép lưới ảnh + chèn logo (0% AI, $0) và dùng **FFmpeg** cắt video dọc 9:16 + chèn chữ overlay (0% AI, $0); chỉ gọi Gemini Free Tier để sinh vài dòng caption ngắn kèm bước chủ tiệm bấm duyệt trước khi đăng.
- **Option B:** Dùng dịch vụ Cloud Video Render trả phí hoặc gen ảnh mẫu nail bằng AI.
**3. Khuyến nghị của PM & BA:** **Chọn Option A** (Nhanh, ổn định 100%, không tốn tiền AI xử lý ảnh/video).

---

### Q4 — Dự án #17: `idea/3d-estimate-for-construction` ([`17-WEB-3d-estimate-for-construction-spec.md`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/17-WEB-3d-estimate-for-construction-spec.md))
**1. Câu hỏi gốc:** Để tính diện tích chính xác tới $\text{mm}^2$/inches từ bản vẽ & ảnh chụp thực tế với ít chi phí AI nhất:
**2. Các phương án đề xuất:**
- **Option A (Khuyến nghị):** Dùng **Toán hình học phẳng (4-point Homography + Công thức diện tích đa giác Shoelace - 0% AI)** dựa trên 1 thước chuẩn/vật chuẩn (thẻ nhựa chuẩn ISO, tờ giấy A4, hoặc kích thước 1 cạnh tường biết trước); chỉ gọi Vision AI khi người dùng muốn tự động gợi ý đường viền.
- **Option B:** Phụ thuộc 100% vào AI đoán kích thước không cần vật chuẩn (sai số cao, tốn tiền API).
**3. Khuyến nghị của PM & BA:** **Chọn Option A**.

---

### Q5 — 5 Thư mục Chưa có Yêu cầu ([`22-HOLD-uninitialized-ideas-intake-triage.md`](file:///d:/Workspace/personal-tools/.ai/outsourcing-core/specs/22-HOLD-uninitialized-ideas-intake-triage.md))
- Đã xếp ở vị trí cuối cùng (`22-HOLD-...`), tạm đóng băng (`ON_HOLD`) để không làm phân tán nguồn lực. Khi nào các Agent BA/PM hoàn thành xong các dự án trên hoặc khi bạn chọn Option A/B/C trong file `22-HOLD` thì mới kích hoạt.
