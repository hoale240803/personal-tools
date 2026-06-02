# GitHub Actions Setup Guide - Trading Signal Alert Tool

## 📋 Bước 1: Tạo Telegram Bot

### 1.1 Tạo Bot trên Telegram
1. Mở Telegram và tìm **@BotFather**
2. Gửi lệnh `/start`
3. Gửi lệnh `/newbot`
4. Đặt tên bot (ví dụ: `Trading Alert Bot`)
5. Đặt username bot (ví dụ: `trading_alert_bot_123`)
6. **BotFather sẽ gửi cho bạn Token** (dạng: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### 1.2 Lấy Chat ID của bạn
1. Nhắn tin cho bot của bạn (hoặc tìm @RawDataBot)
2. Gửi `/start` hoặc bất kì tin nhắn nào
3. Bot sẽ trả về Chat ID (ví dụ: `123456789`)

---

## 🚀 Bước 2: Setup GitHub Repository

### 2.1 Push code lên GitHub
```bash
# Nếu chưa có repo
git init
git add .
git commit -m "Initial commit: Trading signal alert tool"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/personal-tools.git
git push -u origin main
```

### 2.2 Thêm Secrets vào GitHub
1. Vào repo trên GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Thêm 2 secrets:

| Secret Name | Value |
|-------------|-------|
| `TELEGRAM_BOT_TOKEN` | Token từ @BotFather |
| `TELEGRAM_CHAT_ID` | Chat ID của bạn |

**Ví dụ:**
- `TELEGRAM_BOT_TOKEN`: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`
- `TELEGRAM_CHAT_ID`: `123456789`

---

## ⏱️ Bước 3: Kiểm tra Schedule

Workflow hiện tại chạy mỗi **30 phút** (`*/30 * * * *`)

Bạn có thể thay đổi trong file `.github/workflows/alert.yml`:

```yaml
on:
  schedule:
    # Các tùy chọn:
    - cron: '*/15 * * * *'   # Mỗi 15 phút
    - cron: '*/30 * * * *'   # Mỗi 30 phút (mặc định)
    - cron: '0 * * * *'      # Mỗi giờ
    - cron: '0 */2 * * *'    # Mỗi 2 giờ
```

---

## 🧪 Bước 4: Test Workflow

### 4.1 Chạy tay lần đầu
1. Vào GitHub repo
2. **Actions** tab
3. Chọn workflow **"Trading Signal Alert"**
4. Click **"Run workflow"** → **"Run workflow"**

### 4.2 Kiểm tra log
1. Chờ job hoàn thành (~30 giây)
2. Click vào job để xem output
3. Bạn sẽ thấy:
   - ✅ Data fetch thành công
   - ✅ Direction analysis (LONG/SHORT/NEUTRAL)
   - ✅ Alert sent to Telegram (nếu có thay đổi)

---

## 📊 Giải Thích: Làm sao biết SHORT hay LONG?

### Dữ liệu từ API

API `https://data.signals.turtletrading.vn/api/liqheatmap/btc.json` trả về:

```json
{
  "current_price": 77088.08,
  "price_bins": [61450, 61550, 61650, ..., 80000, 80500, 81000]
}
```

**price_bins** là danh sách các mức giá đã được phát hiện là support/resistance levels bởi TurtleTrading.

### Logic Phân Tích

#### LONG (Bullish) 📈
**Khi có nhiều resistance levels ở TRÊN giá hiện tại**

```
Giá hiện tại: $75,000

Mức ở TRÊN (Resistance):
77000, 78000, 79000, 80000, 81000 → 5 mức

Mức ở DƯỚI (Support):
74000, 73000, 72000 → 3 mức

→ 5 > 3 × 1.2? → 5 > 3.6? → YES → LONG ✓

Ý nghĩa: Có nhiều sellers tại các level cao hơn
        nhưng không đủ strong, nên giá có thể phá
        qua đi lên → Bullish signal
```

#### SHORT (Bearish) 📉
**Khi có nhiều support levels ở DƯỚI giá hiện tại**

```
Giá hiện tại: $75,000

Mức ở DƯỚI (Support):
74500, 74000, 73500, 73000, 72500, 72000 → 6 mức

Mức ở TRÊN (Resistance):
76000, 76500, 77000 → 3 mức

→ 6 > 3 × 1.2? → 6 > 3.6? → YES → SHORT ✓

Ý nghĩa: Có nhiều buyers tại các level thấp hơn
        nhưng không đủ strong, nên giá có thể giảm
        xuống → Bearish signal
```

#### NEUTRAL ⚖️
**Khi phân bố các mức cân bằng**

```
Mức ở TRÊN: 5
Mức ở DƯỚI: 5

→ Không thỏa điều kiện LONG/SHORT → NEUTRAL
```

### Công Thức Toán

```
threshold_ratio = 1.2 (20%)

LONG:    levels_above > levels_below × 1.2
SHORT:   levels_below > levels_above × 1.2
NEUTRAL: Không thỏa điều kiện trên
```

Bạn có thể thay đổi độ nhạy bằng cách edit `settings.json`:

```json
{
  "signal": {
    "direction_threshold_ratio": 1.2
  }
}
```

- `1.1` = 10% → Nhạy hơn (nhiều alert hơn)
- `1.2` = 20% → Mặc định (cân bằng)
- `1.5` = 50% → Ít nhạy hơn (ít alert hơn)

---

## 📁 Cấu Trúc File (Theo Convention)

```
idea/trading-tool/
├── main.py                          # Entry point chính
├── settings.json                    # Lưu credentials & config
├── signal_analyzer.py               # Service phân tích signal
├── api_client.py                    # Service fetch API
├── telegram_notifier.py             # Service gửi Telegram
├── state_manager.py                 # Service quản lý state
├── settings_loader.py               # Helper load settings
├── requirements.txt                 # Python dependencies
├── signal_state.json               # Trạng thái hiện tại (auto-generated)
└── SETUP.md                         # Guide này
```

### Convention được áp dụng

1. ✅ Credentials trong `settings.json` (không hardcode)
2. ✅ Mỗi function có comment rõ về tham số
3. ✅ Code linear, dễ đọc (không magic code)
4. ✅ Tách service files (`signal_analyzer`, `api_client`, etc.)
5. ✅ Một function = một nhiệm vụ
6. ✅ Tái sử dụng code qua settings_loader

---

## 🔧 Tùy Chỉnh

### Thay đổi độ nhạy detection

**File:** `settings.json`

```json
{
  "signal": {
    "direction_threshold_ratio": 1.2
  }
}
```

### Bật/Tắt alerts

```json
{
  "signal": {
    "alert_enabled": true
  }
}
```

### Thay đổi interval chạy

**File:** `.github/workflows/alert.yml`

```yaml
schedule:
  - cron: '*/15 * * * *'   # Thay 15 theo mong muốn
```

---

## 📈 Monitoring & Troubleshooting

### Xem logs
1. GitHub repo → **Actions**
2. Click workflow run gần nhất
3. Xem output

### Lỗi thường gặp

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-----------|----------|
| `ModuleNotFoundError: requests` | Thiếu dependency | Kiểm tra `requirements.txt` |
| `Telegram credentials not configured` | settings.json chưa có token | Thêm token vào `settings.json` |
| `Error fetching data` | API không phản hồi | API tạm gián đoạn, thử lại |
| `Error sending Telegram alert` | Bot token sai | Kiểm tra lại token |

---

## ⚠️ Lưu ý quan trọng

- **Miễn phí**: GitHub Actions cho phép 3000 action runs/tháng cho repo public
- **Bảo mật**: Luôn giữ token bí mật, đừng commit `settings.json` nếu có token thực
- **State file**: `signal_state.json` được auto-save sau mỗi lần check

---

## 🎯 Next Steps

1. ✅ Tạo Telegram Bot
2. ✅ Push code lên GitHub
3. ✅ Thêm Secrets
4. ✅ Test workflow
5. ✅ Enjoy 24/7 alerts!

---

Cần giúp? Kiểm tra GitHub Actions logs! 🚀
