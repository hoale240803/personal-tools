# Trading Signal Alert Tool - Plan

## Yêu cầu
- Giám sát https://signals.turtletrading.vn/chart/btc để phát hiện thay đổi hướng (short/long)
- Gửi cảnh báo qua Telegram
- Chạy 24/7 với interval time nhất định
- **Đơn giản & hoàn toàn miễn phí**

## Công nghệ được chọn (Miễn phí)
1. **Python** - Ngôn ngữ lập trình (miễn phí)
2. **Telegram Bot** - Gửi thông báo (miễn phí)
3. **Hosting** - 2 lựa chọn:
   - **GitHub Actions** - Chạy scheduled tasks miễn phí (khuyên dùng)
   - **Oracle Cloud Always Free VM** - VPS miễn phí vĩnh viễn (tuỳ chọn)

## Kiến trúc

### Option 1: GitHub Actions (Khuyên dùng - Dễ nhất)
```
GitHub Repo
    ↓
Scheduled Workflow (mỗi 15-30 phút)
    ↓
Fetch dữ liệu từ API
    ↓
Phân tích thay đổi hướng
    ↓
Gửi alert qua Telegram
```

### Option 2: VPS + Python Script
```
Oracle Always Free VM
    ↓
Python Script chạy liên tục
    ↓
Timer interval (mỗi 15-30 phút)
    ↓
Fetch dữ liệu từ API
    ↓
Phân tích thay đổi hướng
    ↓
Gửi alert qua Telegram
```

## Các bước thực hiện

### Bước 1: Tạo Telegram Bot
- Chat với @BotFather trên Telegram
- Lấy Token (miễn phí)

### Bước 2: Phát triển Python Script
- Fetch dữ liệu từ `https://data.signals.turtletrading.vn/api/liqheatmap/btc.json`
- Phân tích direction (dùng logic đơn giản)
- Gửi thông báo qua Telegram Bot API (miễn phí)

### Bước 3: Deploy & Schedule
- **Cách 1 (GitHub Actions)**: Tạo `.github/workflows/alert.yml` với schedule cron
- **Cách 2 (VPS)**: Chạy script với `cron` hoặc loop infinite

## Ưu/Nhược điểm

| Phương án | Ưu điểm | Nhược điểm |
|-----------|---------|-----------|
| **GitHub Actions** | Dễ setup, không cần server, 100% miễn phí | Limit 3000 actions/month (đủ) |
| **Oracle Always Free** | Miễn phí vĩnh viễn, control tốt, monitoring chi tiết | Cần setup server |

## Dự tính Chi phí: **0 VND** ✓
- Python, GitHub, Telegram, Oracle Cloud = Tất cả miễn phí
