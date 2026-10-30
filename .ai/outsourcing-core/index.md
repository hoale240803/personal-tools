
1. Chỉ là **tiếng Anh hoặc Markdown**[2]. Chúng là sự đúc kết của các quy trình làm việc (workflows)

2. Môi trường

* **Hệ thống ràng buộc (Constraints):** Trong dự án của mình, Lauren xây dựng cả một framework nội bộ (tên là *Dune*), áp đặt các rule linting cực kỳ khắt khe, phân chia cấu trúc thư mục rõ ràng đến mức agent *rất khó để viết code bậy*. Agent chỉ có một con đường duy nhất để thêm code mới.

* **Vòng lặp kiểm chứng (Verification Loops):** `pstack` cung cấp kỹ năng verification, nhưng để nó tự chạy được, Lauren phải viết các custom CLI tích hợp với Playwright, Chrome DevTools Protocol, heap snapshot để agent tự mở app lên "fuzzing", tự click và tự bắt lỗi trước khi merge. Dự án của bạn nếu chưa có bộ test suite vững chắc hoặc chưa có công cụ để agent tự chạy và tự nhìn thấy kết quả (visual/CLI feedback), agent sẽ rơi vào cảnh "mù lòa" và buộc bạn phải nhảy vào làm "cầu nối chạy cơm" (meat proxy)


3. Bạn cần một chu kỳ quan sát lỗi thực tế (Climbing the Trust Ladder)
**Soi lại lịch sử chat (Mining transcripts):** Cách làm thực tế nhất là quan sát xem agent thường xuyên vấp ngã ở đâu trong dự án của bạn[1]. Mỗi khi thấy agent đi đường tắt (take shortcuts) hoặc lặp lại một lỗi quen thuộc, bạn hãy biến nó thành một lint rule, một script kiểm tra, hoặc bổ sung vào skill

4. VÒNG LẶP KIỂM chứng (Verification):

5. Inner loop và outer loop
Quy mô 2.500 PRs của Lauren còn dựa vào việc kết nối giữa "vòng lặp bên ngoài" (Grok Bot lắng nghe issue từ Slack, X, Linear) và "vòng lặp bên trong" (Cursor Coordinator Agents)[16]. Đây là cả một hệ sinh thái phối hợp chứ không chỉ là một tiện ích đơn lẻ.

6. Khai thác lịch sử chat cũ (transcripts) để tối ưu agent? (Mining transcripts)
Cách làm thực tế nhất là quan sát xem agent thường xuyên vấp ngã ở đâu trong dự án của bạn[1]. Mỗi khi thấy agent đi đường tắt (take shortcuts) hoặc lặp lại một lỗi quen thuộc, bạn hãy biến nó thành một lint rule, một script kiểm tra, hoặc bổ sung vào skill


I. Nhận thông tin

II. Làm rõ yêu cầu

III. Chia nhỏ đầu công việc đến mức nhỏ nhất 
- Công việc đó chỉ làm trong nháy mắt là xong.
- Ví dụ: 
HOẶC về thời gian 1 phút là xong.
HOẶC về hành động chỉ 1 CLICK là xong.
HOẶC viết một đoạn CODE là xong.

IV. Test
- Test đơn vị công việc (Unit Test)

- Checklist: 
    Dựa vào yều cầu để viết test, như nào gọi là xong?
    Kết quả này thông báo hay giao đến cho ai?
    AI thường chọn lối đi ngắn nhất. Mục tiêu là làm đúng nhất.
    Test trải nghiệm thực trước khi thông báo xong.
    Nói xong thì phải có bằng chứng.

- VÒNG LẶP KIỂM chứng (Verification):
- Inner loop và outer loop


V. Thu dọn rác - Cô lao công


VI. Bác bảo vệ


Tôi từ lâu đã có một idea tạo ra một AISE (AI Software Engineer) bắt chước cách làm việc của team thật ngoài đời. Giờ cộng thêm nguồn cảm hứng của Lauren Tan. Tôi muốn tạo riêng cho mình team đó.