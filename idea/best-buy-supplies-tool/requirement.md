

   Bạn là một chuyên gia lập trình Chrome Extension giàu kinh nghiệm. Hãy giúp tôi xây dựng cấu trúc mã nguồn cho một Chrome Extension (Manifest V3) đóng vai trò làm "Bot cào dữ liệu ngầm" (Web Scraper) để cập nhật giá sản phẩm từ Amazon và Temu, sau đó gửi dữ liệu về một hệ thống Admin Web cá nhân (hoặc Google Apps Script API).

Mục tiêu chính: Extension phải nhận danh sách URL từ Admin Web, tự động mở các tab ẩn (active: false), cào dữ liệu (Giá, Tên sản phẩm), gửi dữ liệu về API đích, và tự động đóng các tab đó lại để tránh tốn RAM và không bị các hệ thống chống bot (như Amazon, Temu) chặn IP.

Hãy tạo cho tôi 4 file cụ thể với cấu trúc chuẩn và code hoàn chỉnh:

1. manifest.json:
- Sử dụng Manifest V3.
- Cấu hình đầy đủ các quyền (permissions): "tabs", "storage".
- Thêm "host_permissions" cho "https://*.amazon.com/*" và "https://*.temu.com/*" để tránh lỗi CORS khi fetch/inject.
- Khai báo background service worker và content scripts.

2. background.js (Service Worker chạy ngầm):
- Lắng nghe một message từ giao diện Admin Web (hoặc khi người dùng kích hoạt lệnh quét). Message này sẽ chứa một mảng (array) các URL sản phẩm cần quét.
- Triển khai một hàm xử lý hàng đợi (Queue): Lần lượt mở từng URL dưới dạng tab ẩn bằng lệnh `chrome.tabs.create({ url: url, active: false })`.
- Chờ tab load xong, kích hoạt Content Script để cào dữ liệu, sau đó nhận dữ liệu trả về.
- Sau khi nhận được dữ liệu của tab đó, lập tức dùng `chrome.tabs.remove(tabId)` để đóng tab lại rồi mới chuyển sang URL tiếp theo trong hàng đợi.
- Khi đã quét xong toàn bộ danh sách, gom tất cả data lại và thực hiện một lệnh `fetch()` gửi phương thức POST chứa body JSON đến một URL API đích (để trống URL này dưới dạng biến cấu hình `const API_ENDPOINT = "YOUR_API_HERE"` để tôi tự điền sau).

3. content.js (Script chích vào trang Amazon/Temu để lấy data):
- Hàm này sẽ tự động chạy khi tab ẩn được mở.
- Nó cần kiểm tra xem URL hiện tại là Amazon hay Temu để dùng đúng các selector `document.querySelector` phù hợp.
- Đối với Amazon: Tìm cách lấy Tên sản phẩm (thường là #productTitle) và Giá sản phẩm (thường là .a-price .a-offscreen hoặc #priceblock_ourprice).
- Đối với Temu: Tìm cách lấy Tên sản phẩm và Giá sản phẩm dựa trên cấu trúc DOM phổ biến (hoặc viết các hàm selector tổng quát bằng thuộc tính như `[data-testid...]` nếu có).
- Sau khi lấy xong dữ liệu (bao gồm: title, price, url, timestamp), dùng `chrome.runtime.sendMessage` để gửi ngược data về cho background.js.

4. popup.html & popup.js (Giao diện phụ để test nhanh):
- Tạo một giao diện nhỏ gọn gồm 1 nút bấm "Bắt đầu quét thử" và 1 ô chứa dữ liệu JSON kết quả để tôi có thể kiểm tra trực quan xem extension hoạt động đúng luồng hay không trước khi tích hợp sâu với Admin Tool.

Yêu cầu về code:
- Viết code sạch, có comment giải thích rõ ràng bằng tiếng Việt ở các đoạn xử lý hàng đợi mở/đóng tab.
- Thêm các cơ chế xử lý lỗi (try-catch) và timeout (ví dụ: nếu tab load quá 15 giây mà không cào được thì tự động đóng tab và bỏ qua để tránh treo extension).
