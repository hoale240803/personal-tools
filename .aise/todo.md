# Todo List — Dự án Nails POS

<!-- Coordinator ghi và cập nhật file này -->
<!-- Format: - [ ] TASK-XXX: [mô tả] — file: [path] — xong khi: [tiêu chí] -->

## Giai đoạn 1: Fundamentals (Nền tảng kỹ thuật & Hardware Mocks)
- [ ] TASK-001: Khởi tạo cấu trúc dự án TypeScript + Node.js runtime tại idea/nails-pos — file: idea/nails-pos/package.json — xong khi: npm install thành công, tsconfig.json và vitest kiểm thử typecheck không lỗi.
- [ ] TASK-002: Xây dựng Manifest & Feature Flags cấu hình hệ thống — file: idea/nails-pos/src/config/features.ts — xong khi: Cung cấp config useMockTerminal, useMockPrinter, useMockSms, dualScreenEnabled, turnPriceThreshold ($35); test xanh 100%.
- [ ] TASK-003: Xây dựng Payment Port Interface & PAX A920 Mock Terminal — file: idea/nails-pos/src/adapters/payment/pax-mock-terminal.ts — xong khi: Giả lập kết nối LAN, nhận Amount, hiển thị Tip screen, kịch bản đơ Tip screen và lệnh Cancel từ POS; unit test xanh.
- [ ] TASK-004: Xây dựng Printer Port Interface & ESC/POS Mock Printer — file: idea/nails-pos/src/adapters/printer/mock-printer.ts — xong khi: Render hóa đơn in nhiệt khổ 80mm/58mm chuẩn vào memory buffer; unit test xanh.
- [ ] TASK-005: Xây dựng SMS Port Interface & Mock SMS Provider — file: idea/nails-pos/src/adapters/sms/mock-sms.ts — xong khi: Lưu log lịch sử gửi SMS (người nhận, nội dung, timestamp); unit test xanh.
- [ ] TASK-006: Xây dựng Local Data Storage Engine (JSON Persistence) — file: idea/nails-pos/src/db/storage.ts — xong khi: API CRUD đồng bộ/bất đồng bộ với snapshot file JSON cho technicians, services, tickets, customers, turns; unit test xanh.

## Giai đoạn 2: Core (Dịch vụ, Thợ, Chia Turn & Thanh toán)
- [ ] TASK-007: Xây dựng Domain Types & Data Models hoàn chỉnh — file: idea/nails-pos/src/modules/core/types.ts — xong khi: Khai báo types cho Technician, ServiceItem, AddOnService, TurnRecord, Ticket, CustomerDisplayEvent.
- [ ] TASK-008: Xây dựng Thuật toán Chia Lượt Thợ (Turn Engine) — file: idea/nails-pos/src/modules/turns/turn-engine.ts — xong khi: Xử lý 3 cấp ưu tiên, Request thợ giữ vị trí, turn < $35 rải từ dưới lên, khách hủy đưa lên đầu, manual override; unit test xanh 100%.
- [ ] TASK-009: Xây dựng Queue Manager điều phối hàng đợi thợ & trạng thái — file: idea/nails-pos/src/modules/turns/queue-manager.ts — xong khi: Clock-in/out, đổi AVAILABLE/BUSY, tính thời gian rảnh theo estimatedDuration; unit test xanh.
- [ ] TASK-010: Xây dựng Catalog Quản lý Dịch vụ & Add-ons — file: idea/nails-pos/src/modules/catalog/service-catalog.ts — xong khi: CRUD Categories, Services, Extra Add-ons, supply fee optional; unit test xanh.
- [ ] TASK-011: Xây dựng Ticket Service quản lý đơn hàng & chi phí — file: idea/nails-pos/src/modules/checkout/ticket-service.ts — xong khi: Tạo ticket, gán thợ/dịch vụ/add-on, tính Subtotal, Discount, Tax, Tip, Total; unit test xanh.
- [ ] TASK-012: Xây dựng Payment Coordinator chống đơ máy thẻ & Idempotency — file: idea/nails-pos/src/modules/checkout/payment-coordinator.ts — xong khi: Điều phối thanh toán qua Payment Port, timeout/cancel an toàn khi PAX đơ Tip screen, chống charge trùng; unit test xanh.
- [ ] TASK-013: Xây dựng Customer Display Sync Bus (Màn hình phụ) — file: idea/nails-pos/src/modules/display/customer-display-sync.ts — xong khi: Pub/Sub đồng bộ bill và tip sang màn hình phụ cho khách; unit test xanh.

## Giai đoạn 3: Money (Kết toán, Báo cáo & Lương thợ)
- [ ] TASK-014: Xây dựng Module Kết toán Ngày (Close Day & Z-Report) — file: idea/nails-pos/src/modules/money/close-day-service.ts — xong khi: Tổng hợp doanh thu ngày, tách bạch Tiền mặt vs Thẻ, tổng Tip thẻ, xuất báo cáo Z-Report; unit test xanh.
- [ ] TASK-015: Xây dựng Payroll Calculator tính thu nhập thợ — file: idea/nails-pos/src/modules/money/payroll-calculator.ts — xong khi: Chia hoa hồng (mặc định 60/40), trừ supply fee nếu có, tách tiền mặt và thẻ/check/direct deposit, tính tip thẻ sau trừ phí thẻ; unit test xanh.

## Giai đoạn 4: Clients (CRM, QR Gift Card & Đặt lịch hẹn)
- [ ] TASK-016: Xây dựng CRM Khách hàng & Loyalty Tích lũy — file: idea/nails-pos/src/modules/clients/crm-service.ts — xong khi: Quản lý khách theo SĐT, tích lũy chi tiêu (chi $300 giảm $10); unit test xanh.
- [ ] TASK-017: Xây dựng Hệ thống Thẻ quà tặng QR Gift Card — file: idea/nails-pos/src/modules/clients/giftcard-service.ts — xong khi: Phát hành mã Unique Code & chuỗi QR, kiểm tra số dư và trừ tiền khi thanh toán; unit test xanh.
- [ ] TASK-018: Xây dựng Appointment Booking Manager & Mock Reminder — file: idea/nails-pos/src/modules/clients/booking-service.ts — xong khi: Đặt lịch hẹn qua quầy/online, kiểm tra trùng lịch theo thợ/duration, kích hoạt Mock SMS nhắc hẹn; unit test xanh.
