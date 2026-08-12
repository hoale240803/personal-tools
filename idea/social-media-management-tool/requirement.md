# Requirements — AI Social Content Management Tool

---

## 👤 User Personas

### Hoa — Chủ nhiều business nhỏ (Primary User)
- Sở hữu: Nhà Đẹp BDS, H&H Nails, Coffee ABC
- Không rành kỹ thuật, cần UI đơn giản, thao tác nhanh
- Thường xuyên đăng bài lên Instagram, Facebook, TikTok
- Muốn tiết kiệm thời gian viết caption bằng AI
- Cần xem preview bài đăng trước khi publish

### Admin — Người quản lý hệ thống (Secondary User)
- Quản lý users, workspace, AI credits
- Theo dõi hệ thống, xem audit log

---

## 🎯 User Stories

### Module 1 — Authentication
- **US-01:** Là Hoa, tôi muốn đăng nhập bằng email/password để truy cập tool.
- **US-02:** Là Hoa, tôi muốn đăng ký tài khoản mới để bắt đầu dùng.
- **US-03:** Là Hoa, tôi muốn reset mật khẩu qua email khi quên.
- **US-04:** Là Hoa, tôi muốn cập nhật thông tin profile (tên, avatar, ngôn ngữ).

### Module 2 — Workspace
- **US-05:** Là Hoa, tôi muốn tạo workspace cho từng business (Nails, BDS, Coffee) để quản lý nội dung riêng biệt.
- **US-06:** Là Hoa, tôi muốn mời thành viên vào workspace với role (Editor, Viewer) để cộng tác.
- **US-07:** Là Hoa, tôi muốn chuyển workspace bằng 1 click để không cần logout/login lại.

### Module 3 — Content Management
- **US-08:** Là Hoa, tôi muốn upload nhiều hình ảnh cùng lúc (tối đa 10 hình/bài) để tiết kiệm thời gian.
- **US-09:** Là Hoa, tôi muốn sắp xếp lại thứ tự hình ảnh bằng drag-and-drop để chọn hình đẹp nhất lên đầu.
- **US-10:** Là Hoa, tôi muốn nhập mô tả thô về sản phẩm/căn nhà/nails để AI tự viết caption hoàn chỉnh.
- **US-11:** Là Hoa, tôi muốn lưu draft để không mất công nhập liệu khi chưa ready đăng.
- **US-12:** Là Hoa, tôi muốn chọn nền tảng cần đăng (Instagram, Facebook...) trước khi generate AI.

### Module 4 — AI Generator
- **US-13:** Là Hoa, tôi muốn nhấn "Tạo bài đăng" để AI tự viết caption phù hợp từng platform.
- **US-14:** Là Hoa, tôi muốn chỉnh tone caption (Formal/Friendly/Short/Long) nếu chưa ưng.
- **US-15:** Là Hoa, tôi muốn AI gợi ý hashtag phù hợp để tăng reach.
- **US-16:** Là Hoa, tôi muốn xem lịch sử các caption AI đã tạo để chọn lại version trước.

### Module 5 — Platform Integration
- **US-17:** Là Hoa, tôi muốn kết nối Instagram/Facebook account bằng OAuth để tool đăng thay tôi.
- **US-18:** Là Hoa, tôi muốn biết khi nào token hết hạn và cần reconnect.

### Module 6 — Publish Engine
- **US-19:** Là Hoa, tôi muốn preview bài đăng theo layout của từng platform trước khi đăng.
- **US-20:** Là Hoa, tôi muốn đăng ngay hoặc đặt lịch đăng (ngày/giờ cụ thể).
- **US-21:** Là Hoa, tôi muốn biết trạng thái bài đăng (Đang chờ / Đã đăng / Lỗi).

### Module 8 — Analytics
- **US-22:** Là Hoa, tôi muốn xem lượt like, comment, share của từng bài đăng trên dashboard.
- **US-23:** Là Hoa, tôi muốn export báo cáo tương tác theo khoảng thời gian để báo cáo hiệu quả marketing.

---

## ✅ Acceptance Criteria

### Feature 1: Upload Image (US-08)
- ✅ Cho phép upload tối đa **10 hình/bài**, mỗi hình tối đa **10MB**
- ✅ Hỗ trợ format: JPG, PNG, WEBP
- ✅ Hiển thị progress bar khi upload
- ✅ Báo lỗi rõ ràng nếu file quá lớn hoặc sai format
- ✅ Hình được lưu lên Cloudinary, trả về secure URL
- ✅ Cho phép drag-and-drop reorder sau khi upload

### Feature 2: AI Caption Generator (US-13, US-14)
- ✅ User nhập raw description → nhấn "Tạo bài đăng" → AI trả về caption trong **< 10 giây**
- ✅ Caption được tối ưu theo platform (Instagram: ngắn + hashtag; Facebook: dài hơn, kể chuyện)
- ✅ Có nút: Generate, Regenerate, Shorter, Longer, Formal, Friendly
- ✅ Mỗi lần generate lưu vào AI History (tối đa 10 versions/post)
- ✅ Nếu AI timeout (> 15s) → hiển thị lỗi và cho phép retry
- ✅ Không hardcode provider — dùng interface `AIProvider` để dễ swap

### Feature 3: Publish Post (US-19, US-20, US-21)
- ✅ Preview đúng layout của từng platform trước khi publish
- ✅ Validate rules trước khi cho phép publish:
  - Instagram: caption ≤ 2200 ký tự, hashtag ≤ 30, ảnh 1-10, ratio 1:1 / 4:5 / 1.91:1
  - Facebook: caption ≤ 63,206 ký tự, ảnh ≤ 30
- ✅ Publish ngay: trạng thái → Published hoặc Failed (kèm lý do lỗi)
- ✅ Schedule: lưu vào queue, tự động publish đúng giờ
- ✅ Nếu publish failed → retry tối đa 3 lần với exponential backoff
- ✅ Gửi notification khi publish thành công hoặc thất bại

---

## ⚙️ Non-Functional Requirements (NFR)

### Performance
- API response time: < 500ms cho 95% requests (không tính AI calls)
- AI call timeout: 15 giây, retry 1 lần
- Upload image: hỗ trợ 10 concurrent uploads
- Dashboard analytics load: < 2 giây

### Security
- Passwords hashed bằng bcrypt (cost factor ≥ 12)
- Platform OAuth tokens **phải được encrypt** (AES-256) trước khi lưu DB
- JWT access token expire: 15 phút; refresh token: 7 ngày
- Rate limiting: 100 requests/minute/user cho API; 10 AI calls/minute/workspace
- CORS: chỉ allow origin của Next.js app

### Scalability
- Database: PostgreSQL với connection pooling (pg-pool, max 20 connections)
- Queue: BullMQ + Redis để handle scheduled posts
- Media: Cloudinary (không lưu ảnh trực tiếp trên server)

### Reliability
- Uptime target: 99% (có thể downtime max 7.2h/tháng)
- Scheduled posts: phải publish đúng ±5 phút so với scheduled time
- Data backup: PostgreSQL snapshot hàng ngày

### Data Retention
- Draft posts: giữ vĩnh viễn (user tự xóa)
- Published post history: giữ 2 năm
- AI generation history: giữ 90 ngày
- Audit logs (Admin): giữ 1 năm

---

## ❌ Error Handling Scenarios

| Scenario | Hành vi hệ thống |
|----------|-----------------|
| Upload image fail (network) | Retry auto 1 lần → báo lỗi + giữ lại form |
| AI provider timeout (> 15s) | Hiển thị "AI đang bận, thử lại sau" + nút Retry |
| AI provider error (quota hết) | Hiển thị "AI credits đã dùng hết, liên hệ Admin" |
| OAuth token expired | Hiển thị banner "Tài khoản [platform] cần kết nối lại" + link reconnect |
| OAuth token revoked bởi user trên platform | Đánh dấu account là DISCONNECTED, gửi notification |
| Publish failed (API platform lỗi) | Retry 3 lần → nếu vẫn lỗi → status = FAILED, lưu error message |
| Database connection lost | Return 503, log error, alert admin |
| Schedule post miss (server down) | Khi server khởi động lại → detect missed jobs → retry hoặc mark FAILED |

---

## 🚀 MVP Scope (Phase 1)

### ✅ Included in MVP
- Auth (Login, Register, Forgot Password)
- Workspace (CRUD, Switch)
- Content Management (Draft, Upload Image, Description)
- AI Caption Generator (Gemini, 1 provider)
- Platform Integration (Instagram OAuth, Facebook OAuth)
- Publish Engine (Publish Now + Basic Schedule)
- History Management (List, View Detail)
- Basic Notification (Publish Success/Failed)

### 🔜 Post-MVP (Phase 2+)
- TikTok, Google Business, Website CMS integration
- AI Hashtag/Emoji/CTA Generator
- Analytics Dashboard
- Multi AI Provider (OpenAI, Claude)
- Team collaboration (role-based)
- Weekly Report Notification
- Admin panel
