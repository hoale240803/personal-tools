# AISE — Lộ trình tự động hóa

## Giai đoạn 1 — Bán tự động (HIỆN TẠI)

```
Antigravity (Dev) code
  → chạy test local
  → script chụp ảnh UI + ghi log vào .aise/storage/evidence/
  → [CHỦ] copy ảnh/log + TESTER-PROMPT lên Web AI (Gemini/ChatGPT/Claude)
  → [CHỦ] copy JSON trả về vào .aise/feedback.json
  → [CHỦ] nhắn Antigravity: "Đọc .aise/feedback.json và fix bug"
  → Antigravity fix → lặp lại đến khi verdict = PASS
```

- Chủ làm 3 việc: copy lên, copy về, nhắn 1 câu.
- Mục tiêu: kiểm soát từng bước, ~1–2 tiếng/ngày.
- Mục đích phụ: **thu thập mẫu** — prompt Tester nào hay, lỗi nào hay lặp lại → biến thành lint/test.

## Giai đoạn 2 — Tự động hoàn toàn

```
Agent (Dev) code
  → script tự chụp ảnh + log
  → script tự gọi API Claude/Gemini (Tester) → ghi .aise/feedback.json
  → script tự kích hoạt Dev đọc feedback và fix
  → PASS → ping Telegram cho Chủ
```

- Chủ đứng ngoài quan sát qua: Telegram, `git log`, `.aise/summary.md`.

## Điều kiện để chuyển từ Giai đoạn 1 → 2

| # | Điều kiện | Lý do |
|---|---|---|
| 1 | Schema `feedback.json` ổn định, không phải sửa tay nữa | Script đọc được mà không lỗi |
| 2 | Prompt Tester cho kết quả đúng ≥ 8/10 lần | Không cần người lọc |
| 3 | Dev agent chạy được từ CLI (Claude Code CLI / API), không cần mở IDE | Antigravity hiện chưa nhận prompt từ script bên ngoài |
| 4 | Có giới hạn vòng lặp fix (vd: 3 lần) rồi dừng và báo Chủ | Tránh đốt token vô hạn |
| 5 | Có ngân sách API theo ngày | Gọi API tốn tiền, Web AI thì không |

