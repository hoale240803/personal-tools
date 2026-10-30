Mình đọc file bạn gửi. Nó gán nhiều ý cho Lauren Tan (Michelin Kitchen, "meat proxy", leo thang lên model mạnh hơn sau 3 vòng) mà mình không thể kiểm chứng, và có vài chỗ lệch với source pstack mình đã đọc:

- **Task nguyên tử mỗi hàm một agent:** pstack nói ngược lại. Việc dính liền nhau (một feature, một migration) giao cho **một owner**, chỉ chia song song khi các phần độc lập và ghi vào file khác nhau.
- **"Hill-climbing" trong pstack** là tối ưu một chỉ số qua nhiều giả thuyết, không phải vòng tự sửa lỗi.
- **Auto-merge** chỉ có ở playbook Autopilot-full, khi bạn chủ động bật. Mặc định người merge.
- **Giới hạn "tối đa 3 vòng"** không có trong source. Pstack dừng theo điều kiện thoát và "ngõ cụt thật".

Dùng file đó như ý tưởng tham khảo, đừng coi là mô tả pstack.

## 1. Rules và lint để agent không viết bậy

Nguyên tắc từ pstack (*Encode Lessons in Structure*): lần thứ hai bạn viết cùng một lời dặn thì đừng viết nữa, hãy biến nó thành lint, kiểm tra runtime hoặc script. Lời dặn là triệu chứng. Chỉ phần cần phán đoán mới nằm trong file rules.

**Các lớp chặn, từ cứng đến mềm:**

| Lớp | Chặn cái gì |
|---|---|
| Một lệnh `verify` duy nhất (format + lint + type + test) | Agent không có cớ "không biết chạy gì" |
| Type nghiêm ngặt (TS `strict`, Python `mypy --strict`), parse dữ liệu ngoài ở biên (zod/pydantic) | Trạng thái sai không biểu diễn được |
| Lint cấm lối thoát: `any`, `@ts-ignore`, `eslint-disable`, `.only/.skip` trong test | Agent "qua cửa" bằng cách tắt cảnh báo |
| Lint kiến trúc (import boundaries, độ phức tạp, giới hạn dòng/file) | Lệch cấu trúc, hàm phình to |
| Bảo vệ file cấu hình (CODEOWNERS, hook pre-commit, CI so diff `eslint.config`, `tsconfig`, ngưỡng coverage) | Agent sửa luật thay vì sửa code |
| Hook pre-commit + CI chạy `verify` | Chốt chặn cuối |
| File rules ngắn (`CLAUDE.md` / `.clinerules`) | Phần cần phán đoán |

Mẹo hay: viết **thông báo lỗi lint như lời hướng dẫn cho agent** ("Dùng `parseOrder()` ở biên, đừng cast"), vì agent đọc output lint ngay sau khi vi phạm.

**File rules mẫu (ngắn, mỗi luật gắn với cách kiểm tra):**

```
# Quy tắc
- Xong = `pnpm verify` xanh VÀ đã chạy thật tính năng (xem skill verify-<app>).
- Không tắt lint, không @ts-ignore, không skip test, không sửa file config. (lint + hook chặn)
- Viết tên cấu trúc dữ liệu trước khi viết logic.
- Thay đổi nhỏ nhất giải quyết được vấn đề. Xóa trước khi thêm. Không thêm abstraction một chỗ gọi.
- Comment chỉ để giải thích *vì sao* mà code không tự nói. (phán đoán, reviewer kiểm)
- Lỗi lặp lại lần 2: đề xuất lint rule hoặc test, không thêm câu vào file này.
```

Vòng cải tiến: mỗi lỗi agent lặp lại → thêm một lint rule hoặc test → ghi một dòng vào log.

## 2. Verification loop để agent tự kiểm chứng

**Nền tảng:** "xong" phải là một điều kiện kiểm tra được, viết trước khi bắt đầu (bước 1 của Autonomous run).

**Ba tầng:**
1. **Nhanh (giây):** type, lint, unit.
2. **Hành vi:** chạy lệnh/API thật, đọc giá trị thật, không tin "nó biên dịch".
3. **Bề mặt thật:** skill `verify-<app>` lái ứng dụng như người dùng.

**Vòng cho bug:**
```
reproduce trên bề mặt thật → commit test/repro lỗi trước
→ fix nhỏ nhất → chạy lại ĐÚNG repro đó trên ĐÚNG bề mặt
→ pass? commit : loại bỏ thay đổi, thử giả thuyết khác
→ hai fix cùng tiền đề đều hỏng? viết tiền đề ra, kiểm tra thẳng nó
→ ngõ cụt thật: dừng, báo cáo, không quay vòng
```

**Verifier độc lập:** worker báo "xong" chỉ là lời khai. Pstack coi tự báo cáo là proxy (*Prove It Works*) và trước khi ship dùng verifier mới cho từng PR, chạy lại như người dùng. Verdict gắn với patch cụ thể, rebase đổi patch thì phải verify lại. Khi verify thất bại, **nghi cách quan sát trước khi nghi hệ thống**.

**Chống gian lận:** test hành vi, không test cài đặt. Cấm test vô nghĩa. Config và ngưỡng được bảo vệ ở mục 1.

**Cách dựng `verify-<app>`** (pstack có skill sinh sẵn, bạn bắt chước):
1. **Phỏng vấn repo:** người dùng chạm vào đâu, chạy thế nào, lái bằng gì, quan sát gì, có chạy song song được không.
2. **Viết skill** gồm Launch (kèm dấu hiệu sẵn sàng + teardown), Doctor (kiểm tra đáng lái không), Drive (lệnh/selector thật), Evidence (ảnh, transcript, exit code, trạng thái DB), Cleanup (chỉ dọn thứ mình tạo, giữ lại bằng chứng).
3. **Lập feature map**, 3-5 tính năng đầu.
4. **Tự chạy skill một lần** từ đầu đến cuối. Skill chưa từng chạy chỉ là bản nháp.

Áp dụng cho dự án của bạn: Chrome extension (Bot Cào Giá) nạp extension vào Playwright rồi lái trang thật. Với tool đăng bài FB, **không verify bằng cách đăng thật**. Dùng tài khoản/trang test, và kiểm "dry-run" bằng cách quan sát (mạng, file, ref), vì có dry-run vẫn chạm mạng. Pstack xếp "nhắn khách" vào nhóm luôn dừng chờ người.

Nếu muốn giới hạn vòng lặp (ví dụ 3 lần rồi báo cáo), đó là lựa chọn của bạn, không phải của pstack.

## 3. Phân vai Coordinator và Worker

**Coordinator** (phiên chạy router, tương đương chat nhận `/poteto-mode`):
- Diễn đạt lại mục tiêu, vấn đề, thay đổi nhỏ nhất dự kiến. Nếu bằng chứng phản bác thay đổi được yêu cầu, nói và dừng.
- Chọn playbook, chép bước nguyên văn vào todo list (bước bỏ qua ghi `skip: lý do`).
- Quyết định chia việc: việc dính liền → một owner. Chỉ song song khi file độc lập, ghi chung thì tách worktree hoặc xếp hàng.
- Spawn worker **mới** mỗi lần, brief gọn, **con trỏ file chứ không nhét nội dung**.
- Review diff, tự viết tóm tắt (không chép lời worker), chạy verify, ghi `decisions.tsv`, mở PR.
- Không viết code feature. Giữ vai Plan, review, verify.

**Worker:**
- Nhận brief: mục tiêu, phạm vi (đường dẫn file), cấu trúc dữ liệu, tiêu chí thành công, đường dẫn file rules, worktree riêng.
- Làm đúng phạm vi, chạy `verify`, trả về diff + bằng chứng + báo cáo ngắn.
- Không mở rộng phạm vi, không sửa config, không hành động ra ngoài (Slack, deploy, nhắn khách). Benny cấm hẳn worker có quyền ghi Slack.

**Mẫu brief:**
```
Mục tiêu người dùng: ...
Việc của bạn: ... (đường dẫn file)
Cấu trúc dữ liệu: ...
Xong khi: <lệnh kiểm tra> xanh + <hành vi quan sát được>
Luật: đọc /rules.md trước. Không sửa config.
Trả về: diff, output kiểm tra nguyên văn, điều chưa chắc.
```

Với AISE: BA, Dev, Test, Review là **loại worker**, mỗi loại một file brief riêng. Coordinator là một phiên duy nhất giữ router và todo list. Review nên là phiên mới, không thấy lời khai của Dev, và phát hiện nào cũng phải kèm lệnh chạy chứng minh.

Bạn muốn mình soạn thật `rules.md`, cấu hình lint và skeleton `verify-<app>` cho một repo cụ thể không? Cho mình biết stack của repo đó (TypeScript hay Python) là đủ để bắt đầu.