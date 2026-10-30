# Bản tóm tắt tư vấn pháp lý: Nền tảng POS cho tiệm nail (Tiếng Việt)

**Ngày:** 27/10/2026 **Người chuẩn bị:** \[Họ tên\] | **Liên hệ:** \[Email, điện thoại\]

Lưu ý: tài liệu này do chủ dự án soạn để làm việc với luật sư. Đây không phải là tư vấn pháp lý.

## 1. Mục đích buổi tư vấn

Tôi chuẩn bị xây dựng một công ty phần mềm POS và marketing cho tiệm nail tại Mỹ. Tôi cần luật sư giúp xác định rủi ro pháp lý chính, thứ tự ưu tiên, và bộ giấy tờ tối thiểu cần có trước khi nhận khách hàng thật.

## 2. Tổng quan dự án

- **Sản phẩm:** phần mềm POS cho tiệm nail gồm check-in, hàng chờ lượt thợ, lịch hẹn, checkout, tip, gift card, điểm thưởng, SMS (nhắc hẹn, sinh nhật, khuyến mãi khách lâu không quay lại), báo cáo thu nhập thợ, theo dõi tiền mặt phải trả thợ.
- **Cách kinh doanh khác biệt:** (1) mức hoa hồng trên doanh thu khác với đối thủ; (2) phần cứng của tiệm (máy cà thẻ, máy in) có thể dùng lại khi đổi sang hệ thống của tôi; (3) hỗ trợ nhanh qua hotline hai tầng (tầng 1 hiểu nghiệp vụ nail, tầng 2 là kỹ thuật).
- **Tầm nhìn:** sau nail sẽ mở rộng sang nhà hàng và tiệm tạp hóa nhỏ bằng cùng một nền tảng.
- **Cách phát triển:** dùng AI agent và có thể thuê công ty phần mềm bên ngoài (dự kiến tại Việt Nam). Tôi đóng vai chủ sản phẩm.
- **Thanh toán:** tôi không muốn tự trở thành công ty thanh toán. Dự kiến hợp tác với một processor hoặc đối tác ISO/ISV, theo mô hình giới thiệu hoặc tích hợp.
- **Hiện trạng:** giai đoạn rất sớm, chưa có khách hàng trả tiền, chưa thành lập pháp nhân \[điền: đã/chưa\]. Ngân sách pháp lý có hạn nên tôi cần làm theo từng giai đoạn.
- **Bối cảnh bổ sung:** gia đình tôi có một tiệm nail đang dùng hệ thống của một đối thủ (MAC USA/ABC Salon System) và tôi đã dùng ảnh chụp màn hình của hệ thống đó để tham khảo tính năng.

## 3. Các câu hỏi cần luật sư tư vấn

### A. Pháp nhân và quyền sở hữu

1. Nên lập LLC hay công ty loại khác, ở Michigan hay Delaware, với kế hoạch gọi vốn hoặc có đối tác sau này?
2. Cần những văn bản gì (operating agreement, EIN, tài khoản ngân hàng riêng) để tách tài sản cá nhân khỏi công ty?
3. Mã nguồn, tên miền, thương hiệu đã tạo trước khi lập công ty thì chuyển cho công ty thế nào?

### B. Tin nhắn SMS và tiếp thị (TCPA)

1. Cần thu thập và lưu bằng chứng đồng ý của khách của tiệm ra sao để tin nhắn nhắc hẹn và khuyến mãi hợp lệ?
2. Ai chịu trách nhiệm khi tiệm gửi tin sai: nền tảng hay tiệm? Điều khoản nào cần để chuyển rủi ro về phía tiệm?
3. Quy trình STOP, khung giờ gửi, đăng ký chiến dịch với nhà mạng (A2P 10DLC), và phân biệt tin nhắc hẹn với tin quảng cáo.
4. Rủi ro vụ kiện tập thể (class action) và cách giảm thiểu.

### C. Thanh toán và phần cứng

1. Mô hình nào (giới thiệu, ISO, ISV, tích hợp) phù hợp để tránh phải xin giấy phép chuyển tiền hoặc gánh trách nhiệm PCI lớn?
2. Những điều khoản cần chú ý trong hợp đồng với đối tác thanh toán: quyền sở hữu danh sách tiệm, độc quyền, phí hủy, chia sẻ doanh thu, bồi hoàn (clawback).
3. Cam kết "dùng lại phần cứng" có thể bị coi là hứa quá mức nếu máy bị khóa bởi nhà cung cấp cũ không? Nên viết ra sao?
4. Việc tính hoa hồng trên doanh thu của tiệm có ràng buộc pháp lý hay quy định đặc biệt nào không?

### D. Hợp đồng và điều khoản với khách hàng (chủ tiệm)

1. Bộ giấy tờ tối thiểu: hợp đồng dịch vụ (subscription/MSA), điều khoản sử dụng, chính sách quyền riêng tư, chính sách sử dụng chấp nhận được, SLA.
2. Giới hạn trách nhiệm, bồi hoàn, tự gia hạn, phí hủy sớm, quy định về giải quyết tranh chấp (luật bang nào, trọng tài hay tòa án).
3. Quyền sở hữu và xuất dữ liệu khi khách hàng chấm dứt hợp đồng.

### E. Dữ liệu và quyền riêng tư

1. Nghĩa vụ của tôi với dữ liệu của khách của tiệm (số điện thoại, ngày sinh, điểm thưởng).
2. Thông báo khi lộ dữ liệu theo luật Michigan và các bang khác nơi có khách.
3. Chính sách lưu và xóa dữ liệu, yêu cầu xóa từ người dùng cuối.

### F. Cạnh tranh và sở hữu trí tuệ

1. Hợp đồng của tiệm với MAC USA có điều khoản cấm kỹ thuật đảo ngược, chia sẻ ảnh chụp, hoặc cạnh tranh không? Tôi nên làm gì để không vi phạm?
2. Quy trình "clean room" hay cách nào an toàn để lấy chức năng mà không sao chép mã nguồn, giao diện, thương hiệu?
3. Rủi ro về nhãn hiệu, trade dress, bản quyền; nên đăng ký những gì trước tiên?
4. Điều khoản không lôi kéo khách hàng và nhân sự (non-solicit), bảo mật và bí mật kinh doanh.
5. Rà soát giấy phép mã nguồn mở (MIT, Apache, GPL, AGPL) trước khi dùng.

### G. Công ty outsourcing và AI agent

1. Hợp đồng khung (MSA) và phụ lục công việc (SOW), nghiệm thu, thanh toán.
2. Chuyển nhượng quyền sở hữu trí tuệ bằng văn bản cho công ty Mỹ, có đủ hiệu lực với đối tác ở Việt Nam không?
3. NDA hai chiều, giới hạn truy cập dữ liệu thật, bảo mật, thầu phụ.
4. Điều khoản dùng công cụ AI và thư viện bên thứ ba (quyền sở hữu mã do AI tạo ra).
5. Thuế và chứng từ khi trả tiền cho đối tác nước ngoài (ví dụ W-8BEN), chuyển dữ liệu qua biên giới.

### H. Tiền mặt và thợ (tính năng sản phẩm)

1. Phần mềm có tính hoa hồng, tip, và tiền mặt phải trả thợ. Cần tuyên bố miễn trừ nào để không bị coi là cung cấp tư vấn thuế hoặc tính lương?
2. Rủi ro khi ghi nhận tiền mặt và tip (phân loại thợ, ghi chép).

### I. Vận hành và bảo hiểm

1. Quy trình tiếp nhận khiếu nại, ứng phó sự cố, hoàn tiền, tranh chấp thanh toán.
2. Điều khoản cho hotline thuê ngoài (bảo mật, quyền truy cập dữ liệu).
3. Bảo hiểm nên mua trước khi có khách: Tech E&O, cyber liability, general liability.

## 4. Giấy tờ tôi muốn nhận

1. Mẫu hợp đồng dịch vụ và điều khoản sử dụng cho khách hàng.
2. Chính sách quyền riêng tư và chính sách chấp nhận được (cấm spam).
3. Mẫu thu thập sự đồng ý nhận SMS và quy trình STOP.
4. Hợp đồng khung và phụ lục công việc cho công ty outsourcing, kèm NDA và chuyển nhượng quyền sở hữu trí tuệ.
5. Danh sách việc cần làm về lập công ty, nhãn hiệu, bảo hiểm.
6. Nhận định về rủi ro với hợp đồng MAC USA của tiệm gia đình.

## 5. Cách làm việc tôi đề nghị

- Làm theo giai đoạn và báo giá trọn gói cho từng phần, ưu tiên: (1) pháp nhân, (2) SMS và dữ liệu, (3) hợp đồng với khách hàng, (4) hợp đồng outsourcing, (5) bảo hiểm.
- Có thể dùng mẫu của luật sư để tôi tự điều chỉnh về sau, luật sư chỉ rà soát lại.

## 6. Thông tin tôi sẽ mang theo

- Hợp đồng của tiệm với MAC USA (nếu được phép chia sẻ).
- Danh sách tính năng dự kiến và bản mô tả quy trình SMS.
- Danh sách đối tác thanh toán và công ty outsourcing đang cân nhắc.
- Câu hỏi bổ sung: \[điền thêm\].
