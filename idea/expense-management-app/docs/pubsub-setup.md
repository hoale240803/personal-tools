# Hướng dẫn Setup Google Cloud Pub/Sub cho Gmail Push Notifications

> Tài liệu này hướng dẫn từng bước cấu hình Google Cloud Pub/Sub để app nhận thông báo realtime từ Gmail khi có email mua hàng mới.

---

## Tổng quan kiến trúc

```
Gmail (có email mới)
  └─► Google Pub/Sub Topic  (push notification)
        └─► Pub/Sub Subscription (push → HTTPS)
              └─► POST /api/gmail/webhook  (app của bạn)
                    └─► Xử lý email → lưu vào Google Sheets
```

Mỗi khi Gmail nhận email mới, nó gửi thông báo tới Pub/Sub topic. Pub/Sub sẽ push thông báo đó tới webhook URL của app bạn (Vercel). App dùng `historyId` để tra cứu Gmail History API và lấy nội dung email.

---

## Yêu cầu

- Tài khoản Google Cloud Platform (GCP)
- `gcloud` CLI đã cài và đã `auth login` (tuỳ chọn, có thể dùng GCP Console)
- App đã deploy trên Vercel (cần URL public cho webhook)

---

## Bước 1 — Tạo hoặc chọn GCP Project

### Qua Console
1. Vào [https://console.cloud.google.com](https://console.cloud.google.com)
2. Nhấn **Select a project** ở góc trên → **New Project**
3. Đặt tên (ví dụ: `expense-tracker`) → **Create**
4. Ghi lại **Project ID** (ví dụ: `expense-tracker-123456`)

### Qua gcloud CLI
```bash
gcloud projects create expense-tracker-123456 --name="Expense Tracker"
gcloud config set project expense-tracker-123456
```

---

## Bước 2 — Bật các API cần thiết

Bật **Gmail API** và **Cloud Pub/Sub API**:

### Qua Console
1. Vào **APIs & Services → Library**
2. Tìm và bật **Gmail API**
3. Tìm và bật **Cloud Pub/Sub API**

### Qua gcloud CLI
```bash
gcloud services enable gmail.googleapis.com pubsub.googleapis.com
```

---

## Bước 3 — Tạo Pub/Sub Topic

### Qua Console
1. Vào **Pub/Sub → Topics → Create Topic**
2. **Topic ID**: `gmail-push`
3. Bỏ chọn "Add a default subscription" (ta sẽ tạo subscription riêng)
4. Nhấn **Create**

### Qua gcloud CLI
```bash
gcloud pubsub topics create gmail-push
```

Ghi lại **Topic Name** đầy đủ:
```
projects/expense-tracker-123456/topics/gmail-push
```

---

## Bước 4 — Cấp quyền cho Gmail publish vào Topic

Gmail cần quyền `pubsub.topics.publish` trên topic để gửi notifications. Service account của Gmail là:

```
gmail-api-push@system.gserviceaccount.com
```

### Qua Console
1. Trong trang **Topic** → tab **Permissions**
2. Nhấn **Add Principal**
3. **Principal**: `gmail-api-push@system.gserviceaccount.com`
4. **Role**: `Pub/Sub Publisher`
5. Nhấn **Save**

### Qua gcloud CLI
```bash
gcloud pubsub topics add-iam-policy-binding gmail-push \
  --member="serviceAccount:gmail-api-push@system.gserviceaccount.com" \
  --role="roles/pubsub.publisher"
```

> ⚠️ **Bước này bắt buộc.** Nếu thiếu, Gmail sẽ báo lỗi `403 Forbidden` khi gọi `gmail.users.watch()`.

---

## Bước 5 — Tạo Pub/Sub Subscription (Push type)

Subscription sẽ forward messages từ Topic tới webhook URL của app.

### Qua Console
1. Vào **Pub/Sub → Subscriptions → Create Subscription**
2. **Subscription ID**: `gmail-push-sub`
3. **Select Cloud Pub/Sub topic**: chọn topic `gmail-push` vừa tạo
4. **Delivery type**: chọn **Push**
5. **Endpoint URL**: nhập webhook URL của app:
   ```
   https://your-app.vercel.app/api/gmail/webhook
   ```
6. **Authentication**: bật **Enable authentication**
   - Chọn **Service account** → tạo mới hoặc chọn service account đang dùng
   - **Audience**: `https://your-app.vercel.app/api/gmail/webhook`
7. **Acknowledgment deadline**: 60 seconds
8. **Message retention duration**: 7 days
9. Nhấn **Create**

### Qua gcloud CLI
```bash
gcloud pubsub subscriptions create gmail-push-sub \
  --topic=gmail-push \
  --push-endpoint=https://your-app.vercel.app/api/gmail/webhook \
  --push-auth-service-account=YOUR_SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com \
  --push-auth-token-audience=https://your-app.vercel.app/api/gmail/webhook \
  --ack-deadline=60
```

---

## Bước 6 — Cấu hình Environment Variables

Thêm các biến sau vào `.env` (local) và Vercel Dashboard (production):

```env
# Tên đầy đủ của Pub/Sub topic
PUBSUB_TOPIC_NAME=projects/expense-tracker-123456/topics/gmail-push

# Audience cho JWT verification (URL của webhook endpoint)
# Mặc định dùng VERCEL_URL nếu không set
PUBSUB_AUDIENCE=https://your-app.vercel.app/api/gmail/webhook
```

### Thêm vào Vercel
```bash
vercel env add PUBSUB_TOPIC_NAME production
vercel env add PUBSUB_AUDIENCE production
```

Hoặc vào **Vercel Dashboard → Project → Settings → Environment Variables**.

---

## Bước 7 — Đăng ký Gmail Watch từ app

Sau khi cấu hình xong env, vào **Cài đặt** trong app → nhấn **"Bật Webhook Realtime"**.

App sẽ gọi `POST /api/gmail/watch` → `gmail.users.watch()` với `topicName` từ env.

Nếu thành công, bạn sẽ thấy:
- Badge "● Đang hoạt động" màu tím indigo
- Ngày hết hạn của Watch (sau 7 ngày)
- Vercel Cron sẽ tự gia hạn Watch mỗi 6 ngày

---

## Bước 8 — Test Webhook

### Test với Pub/Sub message giả
```bash
# Encode payload thành base64
PAYLOAD=$(echo -n '{"emailAddress":"your@gmail.com","historyId":"12345"}' | base64)

# Gửi message tới topic
gcloud pubsub topics publish gmail-push \
  --message="{\"data\":\"$PAYLOAD\"}"
```

### Kiểm tra logs
```bash
# Xem logs Vercel
vercel logs your-app.vercel.app --since=1h
```

Hoặc vào **Vercel Dashboard → Deployments → Functions → /api/gmail/webhook**.

### Test với email thật
1. Gửi email mua hàng tới Gmail (subject có chứa "order", "invoice", "đơn hàng"...)
2. Kiểm tra **Lịch sử đồng bộ** trong app — phải xuất hiện record với `syncType=pipeline`

---

## Bước 9 — Theo dõi Pub/Sub

Vào **GCP Console → Pub/Sub → Subscriptions → gmail-push-sub → Metrics**:

| Metric | Ý nghĩa |
|--------|---------|
| **Undelivered message count** | Số message chưa được xử lý (nên = 0) |
| **Oldest unacked message age** | Thời gian message chờ lâu nhất |
| **Push request count** | Số lần push đã gửi tới webhook |
| **Push request latency** | Độ trễ response của webhook |

---

## Troubleshooting

### ❌ Lỗi `403 Forbidden` khi gọi `gmail.users.watch()`

**Nguyên nhân**: Gmail service account chưa có quyền publish vào topic.

**Fix**: Chạy lại Bước 4 — thêm IAM policy binding cho `gmail-api-push@system.gserviceaccount.com`.

---

### ❌ Webhook trả về `401 Unauthorized`

**Nguyên nhân**: JWT từ Pub/Sub không hợp lệ hoặc `PUBSUB_AUDIENCE` không khớp endpoint URL.

**Fix**:
1. Kiểm tra `PUBSUB_AUDIENCE` env var khớp với URL trong Subscription
2. Đảm bảo Subscription đã bật **Enable authentication**
3. Trong môi trường dev, JWT check được bỏ qua tự động

---

### ❌ Không nhận notification dù Watch đã đăng ký

**Nguyên nhân có thể**:
- Gmail Watch đã hết hạn (> 7 ngày)
- Subscription push endpoint không reachable từ internet
- Email không vào INBOX (rơi vào Spam, Promotions)

**Fix**:
1. Nhấn **"Gia hạn Watch"** trong Settings
2. Kiểm tra **Undelivered message count** trong GCP Console
3. Đảm bảo webhook URL public và trả về 200

---

### ❌ Message bị retry liên tục

**Nguyên nhân**: Webhook trả về non-200 → Pub/Sub retry vô hạn.

**Fix**: `webhook.ts` đã xử lý — luôn trả `200 OK` kể cả khi có lỗi nội bộ (để ACK message).

---

### ❌ Watch hết hạn sớm hơn 7 ngày

**Fix**: Kiểm tra GCP Console → **Billing** và **Quotas**. Vercel Cron gia hạn Watch mỗi 6 ngày qua `GET /api/gmail/watch` (cron schedule `0 0 */6 * *`).

---

## Quick Reference

| Thành phần | Giá trị ví dụ |
|-----------|--------------|
| Project ID | `expense-tracker-123456` |
| Topic Name | `projects/expense-tracker-123456/topics/gmail-push` |
| Subscription | `gmail-push-sub` |
| Webhook URL | `https://your-app.vercel.app/api/gmail/webhook` |
| Gmail Service Account | `gmail-api-push@system.gserviceaccount.com` |
| Watch TTL | 7 ngày (auto-renew mỗi 6 ngày) |
| `PUBSUB_TOPIC_NAME` | `projects/expense-tracker-123456/topics/gmail-push` |
| `PUBSUB_AUDIENCE` | `https://your-app.vercel.app/api/gmail/webhook` |
