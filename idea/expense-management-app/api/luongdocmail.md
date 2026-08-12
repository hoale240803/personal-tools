┌─────────────────────────────────────────────────────────────────┐
│  1. WATCH — Đăng ký "tai nghe" với Gmail                        │
│  POST /api/gmail/watch                                           │
│  Cron: mỗi 6 ngày (0 0 */6 * *)                                 │
│                                                                  │
│  Gmail → "Khi có mail mới, hãy notify vào Pub/Sub topic này"    │
│  Lưu historyId vào SyncState sheet                              │
│  ⚠️ Hết hạn sau 7 ngày nên phải gia hạn mỗi 6 ngày             │
└─────────────────────┬───────────────────────────────────────────┘
                      │ khi có mail mới
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. WEBHOOK — Nhận thông báo từ Pub/Sub                         │
│  POST /api/gmail/webhook                                         │
│  Trigger: realtime khi Gmail gửi notify                          │
│                                                                  │
│  Nhận historyId → gọi Gmail History API → lấy messageId mới    │
│  → check subject (keyword filter) → enqueue vào PendingQueue    │
│  → nếu pending >= 5 thì batch process ngay                      │
│  → nếu < 5 thì để đó, chờ flush                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  3. FLUSH — Dọn dẹp cuối ngày                                   │
│  GET /api/gmail/flush                                            │
│  Cron: 23:59 VN mỗi ngày (59 16 * * *)                          │
│                                                                  │
│  Đọc PendingQueue → process toàn bộ còn pending                 │
│  Đảm bảo không có mail nào bị "kẹt" trong queue qua đêm        │
└─────────────────────────────────────────────────────────────────┘
