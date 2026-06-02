1. Tất cả credentials điều phải để trong file settings.json của tool đó
2. Mỗi hàm điều phải có comment ghi rõ nó làm việc gì bao gồm các tham số.
3. Kiểu line of code điều phải hiển thị dưới dạng linear để dễ đọc
4. Tạo các service files để xử lý cho từng chức năng riêng biệt.
   Ví dụ: AmazonService.js, CraigslistService.js, FacebookService.js, InstagramService.js, ....

Các function lớn gồm nhiều các function nhỏ lặp đi lặp lại thì tạo ra các helper để hổ trợ service file.
AmazonSearchingServiceHelper.js, CraigslistFindingJobServiceHelper.js

5. Không được dùng magic code. Mỗi biến, function đặt ra điều có nghĩa của nó.

6. Mỗi function chỉ đc làm 1 nhiệm vụ

7. Tái sử dụng code đã có sẵn, nếu không có thì mới tạo biến, hàm, class mới.
