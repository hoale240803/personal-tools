# Nail Salon Social Poster: Làm rõ yêu cầu & đề xuất giải pháp

> Trạng thái: **bản đề xuất để bạn quyết định**, chưa code gì thêm.
> Nền tảng hiện có: `fb_gui.py` (Playwright + Tkinter) đã đăng bài thành công theo lịch.

---

## 1. Mình hiểu ý tưởng của bạn như sau

Nhiều tiệm nail cần **đăng Facebook đều đặn** nhưng không có thời gian/kỹ năng làm nội dung. Sản phẩm bạn muốn làm:

> Chủ tiệm chỉ cần **đưa nguyên liệu thô** (ảnh hoặc video phôi). Tool biến nó thành **bài đăng hoàn chỉnh theo đúng style của tiệm** (ảnh/video + caption) rồi **lên lịch và đăng**.

Hai loại bài, mỗi loại có 2 mức:

| Loại bài | Mức A: tiệm tự chuẩn bị | Mức B: tool hỗ trợ làm |
|---|---|---|
| **Ảnh + caption** | Tiệm đưa ảnh đã chỉnh sẵn | Tool chỉnh/áp style, hoặc *gen ảnh* theo style tiệm |
| **Video + caption** | Tiệm đưa video đã edit sẵn | Tool edit video phôi theo style (bạn đề xuất qua CapCut) |

### Phân tích 2 bài mẫu bạn gửi (H&H Nails and Lash)

**Bài ảnh (Halloween):**
- 3 ảnh dọc ghép thành lưới, đều là **ảnh thật** công việc của tiệm (tay khách, nền tối/sáng khác nhau)
- Caption: câu mở theo **mùa/sự kiện** + emoji, có phần "See more" (caption dài hơn phần hiển thị)

**Bài video:**
- Video dọc 9:16, **chữ overlay** ở dưới ("Find your next nail inspo ✨"), nền đen hai bên
- Caption 3 khối: câu giới thiệu + emoji → dòng **📍địa điểm** → cụm **hashtag** (địa phương + tên tiệm + ngách nail)

→ Khuôn "style" có thể tách thành những thành phần **máy làm được**: khung ảnh/lưới, overlay chữ, logo, tông màu, cấu trúc caption, bộ hashtag, dòng địa điểm. Đây là cơ sở cho "Brand Kit" ở mục 3.

---

## 2. Những điểm cần làm rõ (mình đã đánh dấu đề xuất mặc định)

Đây là phần quan trọng nhất. Mỗi câu hỏi ảnh hưởng trực tiếp đến kiến trúc.

| # | Câu hỏi | Lựa chọn | Đề xuất của mình |
|---|---|---|---|
| Q1 | **Ai dùng tool?** | (a) Bạn vận hành hộ vài tiệm (dịch vụ) · (b) Bán phần mềm cho từng tiệm tự dùng · (c) SaaS nhiều tiệm | Bắt đầu **(a)** với 1–3 tiệm thử, thiết kế dữ liệu sẵn để lên (c) |
| Q2 | **Đăng lên đâu?** | Trang cá nhân · **Facebook Page** của tiệm | **Page** (2 bài mẫu của bạn đều là Page) |
| Q3 | **Nguyên liệu từ đâu?** | Tiệm gửi ảnh/video thật mỗi tuần · Tool tự tạo ảnh | **Ảnh/video thật là chính** (xem mục 4.1 về rủi ro ảnh AI) |
| Q4 | **Mức tự động** | Tự đăng hết · **Có bước duyệt** trước khi đăng | **Có duyệt** (chủ tiệm bấm OK), tự đăng chỉ bật sau khi tin tưởng |
| Q5 | **Nền tảng** | Chỉ Facebook · Facebook + Instagram (+ TikTok) | Facebook trước; Instagram đi cùng Meta API nên dễ mở rộng |
| Q6 | **Ngôn ngữ** | Caption tiếng Anh (khách Mỹ) · UI tiếng Việt/Anh | Caption **EN**, giao diện cho chủ tiệm **VI/EN** |
| Q7 | **Chạy ở đâu** | Máy Windows của tiệm · Server/cloud | Máy bạn/máy tiệm lúc thử; **cloud** khi dùng Graph API |
| Q8 | **Video: bắt buộc CapCut?** | Phải CapCut · Chỉ cần ra đúng style | **Không bắt buộc** (xem mục 4.2: CapCut không tự động hóa trọn vẹn được) |
| Q9 | **Phạm vi "gen ảnh"** | Ảnh quảng cáo/khuyến mãi · Ảnh "mẫu nail" giả | Chỉ **đồ họa quảng cáo**, không gen mẫu nail như thể là thành phẩm của tiệm |
| Q10 | **Ai chịu trách nhiệm** sự đồng ý của khách trong ảnh/video | Tiệm · Bạn | Ghi rõ vào thỏa thuận: **tiệm** chịu, tool có checkbox xác nhận |

---

## 3. Yêu cầu chức năng

### 3.1 Brand Kit (cấu hình style theo từng tiệm), làm một lần
- Logo (PNG trong suốt), màu chính/phụ, font
- Giọng văn caption (thân thiện / sang trọng / trẻ trung), emoji hay dùng
- Dòng địa điểm cố định (📍 tên tiệm | thành phố), số điện thoại, link đặt lịch
- Bộ hashtag: địa phương, tên tiệm, ngách (ví dụ nhóm hashtag theo mùa)
- Câu CTA mẫu ("Book now", "DM us"…) và các mẫu overlay chữ cho video
- Kiểu lưới ảnh ưa thích (1, 2, 3, 4 ảnh) và tỉ lệ (4:5, 1:1, 9:16)

### 3.2 Pipeline một bài đăng

```
[Nguyên liệu: ảnh / video phôi]
        │
        ▼
[Áp style]  ← Brand Kit
  ảnh: khung/lưới/logo/chữ      video: crop 9:16, ghép cảnh, chữ, logo, nhạc
        │
        ▼
[Sinh caption]  ← Brand Kit + dịp trong năm (Halloween, Valentine…)
        │
        ▼
[Hàng chờ duyệt]  → chủ tiệm xem trước, sửa caption, OK / từ chối
        │
        ▼
[Lên lịch] → [Đăng] → [Ghi log + link bài + trạng thái]
```

### 3.3 User stories (để chốt phạm vi MVP)
1. *Là chủ tiệm*, tôi **thả 3 ảnh** vào một thư mục và nhận về **1 bài nháp** (lưới ảnh có logo + caption đúng giọng tiệm) để duyệt.
2. *Là chủ tiệm*, tôi **thả 1 video phôi** và nhận về **1 video dọc có chữ overlay + logo** + caption + hashtag.
3. *Là chủ tiệm*, tôi **chọn ngày giờ** hoặc để tool tự rải bài (vd. 3 bài/tuần vào giờ cố định).
4. *Là chủ tiệm*, tôi **xem lại và sửa caption** trước khi đăng; tool không đăng gì tôi chưa duyệt.
5. *Là người vận hành (bạn)*, tôi **quản lý nhiều tiệm**, mỗi tiệm một Brand Kit và một lịch riêng.
6. *Là người vận hành*, tôi thấy **log**: bài nào đã đăng, lỗi ở đâu, đăng lại được không.

---

## 4. Giải pháp cho hai hướng bạn đề xuất

### 4.1 Bài chỉ có hình ảnh

| Mức | Nội dung | Công nghệ | Độ tin cậy |
|---|---|---|---|
| **0** | Tiệm đưa ảnh sẵn → tool chỉ đăng | Không cần thêm | Rất cao |
| **1** | **Áp style tự động lên ảnh thật**: crop đúng tỉ lệ, ghép lưới 2–4 ảnh, thêm logo/khung/chữ theo Brand Kit | Python + Pillow (xử lý ảnh cục bộ, miễn phí, chạy ổn định) | Cao |
| **2** | **AI hỗ trợ**: (a) chỉnh ảnh thật nhẹ (đồng bộ tông màu, dọn nền); (b) **gen đồ họa quảng cáo** (banner khuyến mãi, thiệp theo mùa, nền để đặt chữ) | Gemini image / model ảnh khác; hỗ trợ nhiều ảnh tham chiếu để giữ style | Trung bình, cần duyệt từng ảnh |

**Mình khuyên: làm Mức 1 trước, Mức 2 chỉ cho đồ họa quảng cáo.**

> ⚠️ **Về việc gen ảnh "mẫu nail" bằng AI.** Ở 2 bài mẫu, giá trị của bài đăng nằm ở chỗ đó là **ảnh thật công việc của tiệm**. Nếu AI tạo ra mẫu nail rồi đăng như thể là thành phẩm, khách đến tiệm sẽ kỳ vọng thứ tiệm không làm được, và đó là rủi ro về quảng cáo gây hiểu lầm. Nếu muốn dùng ảnh AI, nên (1) chỉ cho nền/đồ họa/ý tưởng mẫu, (2) bật nhãn "AI label" của Facebook, (3) không trộn lẫn với ảnh thành phẩm.

Về chi phí: gọi API ảnh thường vài cent mỗi ảnh (giá thay đổi theo model và độ phân giải, cần kiểm tra lại khi triển khai).

### 4.2 Bài có video

Đây là chỗ cần cân nhắc kỹ nhất, vì **CapCut không phải công cụ tự động hóa trọn vẹn**.

**Những gì CapCut làm được qua code (theo các dự án cộng đồng như VectCutAPI/pyCapCut):**
- Tạo **file nháp (draft)**: dựng sẵn timeline với clip, chữ, hiệu ứng, nhạc
- Người dùng **mở CapCut desktop và bấm Export bằng tay**; các dự án này dừng ở file nháp, không tự xuất MP4
- Hiệu ứng/chuyển cảnh chỉ "best-effort"; định dạng draft có thể hỏng khi CapCut cập nhật
- Cần cài CapCut/Jianying desktop + FFmpeg trên máy chạy

→ Nghĩa là "thêm video phôi vào là xong" **không thể làm trọn vẹn bằng CapCut** nếu không dùng thêm tự động hóa giao diện (UI automation), vốn mong manh.

| Hướng | Cách làm | Ưu | Nhược |
|---|---|---|---|
| **V0** | Tiệm đưa video đã edit sẵn → tool chỉ đăng | Đơn giản nhất | Tiệm phải tự edit |
| **V1 (khuyên dùng)** | **Template bằng FFmpeg**: crop/scale 1080×1920, ghép nhiều cảnh, chữ overlay, logo, nhạc nền, intro/outro → **ra thẳng MP4**, chạy hoàn toàn tự động | Miễn phí, ổn định, chạy nền không cần mở app, dễ batch | Không "đẹp tự do" như CapCut; phải thiết kế vài template trước |
| **V2** | **CapCut draft**: tool dựng draft, chủ tiệm/bạn mở CapCut chỉnh thêm và Export | Chỉnh tay đẹp hơn, dùng hiệu ứng CapCut | Luôn có bước thủ công; dễ vỡ khi CapCut đổi |
| **V3** | Dịch vụ render video qua API (kiểu Creatomate/Shotstack, cần kiểm tra giá và điều khoản) | Template đẹp, render trên cloud | Tốn phí hàng tháng, phụ thuộc bên thứ ba |

**Đề xuất:** làm **V1 (FFmpeg)** cho luồng tự động. Giữ **V2** như tùy chọn "xuất draft CapCut để chỉnh thêm" cho tiệm nào muốn đẹp hơn, làm sau.

Lưu ý nhạc: nhạc thịnh hành trong CapCut/TikTok thường **không được cấp phép cho tài khoản doanh nghiệp**. Nên dùng nhạc không bản quyền, hoặc cho phép tiệm không dùng nhạc. Cần kiểm tra điều khoản nhạc của Meta cho Page.

---

## 5. Cách đăng bài: quyết định kỹ thuật quan trọng

Hiện `fb_gui.py` điều khiển trình duyệt (Playwright) như người dùng. Với sản phẩm cho nhiều tiệm, bạn nên cân nhắc kỹ:

| Phương án | Cách hoạt động | Ưu | Nhược |
|---|---|---|---|
| **A. Playwright (hiện tại)** | Đăng nhập tài khoản FB, thao tác giao diện | Làm ngay được, không cần Meta duyệt | Dễ vỡ khi Facebook đổi giao diện, dính checkpoint/2FA, rủi ro khóa tài khoản, phải lưu phiên đăng nhập của tiệm; **máy phải bật** đúng giờ; hiện đang đăng lên **trang cá nhân**, muốn đăng lên Page cần thêm bước chuyển sang Page |
| **B. Facebook Graph API (chính thống)** | Tiệm đăng nhập bằng Facebook Login và cấp quyền cho Page; tool gọi API đăng ảnh/video | Ổn định, **lên lịch phía Meta** (không cần máy bật), có ID/link bài, chính thống | Cần tạo Meta App, **App Review + Business Verification** trước khi tiệm lạ kết nối; chỉ đăng được lên **Page** (không lên trang cá nhân/Group) |
| **C. Meta Business Suite thủ công** | Tool chỉ chuẩn bị gói "ảnh + caption", người dùng tự dán vào Business Suite | Không rủi ro, không cần duyệt | Còn thủ công |
| **D. Dịch vụ lên lịch bên thứ ba** | Dùng API của công cụ như Buffer… để đăng | Không phải tự xin duyệt Meta | Trả phí, phụ thuộc bên thứ ba |

**Điểm kỹ thuật cần biết về Graph API (theo tài liệu Meta):**
- Quyền cần: `pages_manage_posts` (kèm `pages_read_engagement`, `pages_show_list`); đăng video cần thêm `publish_video`
- Lên lịch: gửi `published=false` kèm `scheduled_publish_time`; bài feed phải cách hiện tại **từ 10 phút đến 30 ngày**
- Khi app còn ở chế độ phát triển, chỉ dùng được với Page mà tài khoản có vai trò trong app; muốn tiệm khác kết nối cần qua duyệt

**Đề xuất lộ trình đăng bài:**
1. **Giai đoạn thử (1–3 tiệm bạn quen, có sự đồng ý):** dùng phương án **A** hoặc **C** để kiểm chứng sản phẩm. Phần giá trị là *tạo nội dung theo style*, không phải việc bấm nút đăng.
2. **Song song:** tạo Meta App và bắt đầu quy trình duyệt cho phương án **B**.
3. **Khi bán cho nhiều tiệm:** chuyển hẳn sang **B**. Thiết kế một lớp `Publisher` có thể thay ruột (Playwright ↔ Graph API) để không phải viết lại phần còn lại.

---

## 6. Kiến trúc đề xuất

```
┌──────────────────────────── UI ────────────────────────────┐
│  Hiện tại: Tkinter   →   Sau: web app cục bộ / cloud        │
│  Màn hình: Brand Kit · Tạo bài · Hàng chờ duyệt · Lịch · Log │
└───────────────────────────────┬────────────────────────────┘
                                │
        ┌───────────────────────┼────────────────────────┐
        ▼                       ▼                        ▼
┌───────────────┐      ┌────────────────┐       ┌────────────────┐
│ Media Engine  │      │ Content AI     │       │ Scheduler      │
│ Pillow (ảnh)  │      │ Gemini: caption│       │ hàng đợi + giờ │
│ FFmpeg (video)│      │ (+ ảnh quảng   │       │ retry / log    │
│ [CapCut draft]│      │  cáo, tùy chọn)│       └───────┬────────┘
└───────┬───────┘      └───────┬────────┘               │
        └──────────────┬───────┘                        ▼
                       ▼                       ┌────────────────┐
              ┌─────────────────┐              │ Publisher      │
              │ Storage         │◄─────────────┤  - Playwright  │
              │ SQLite/JSON     │              │  - Graph API   │
              │ ảnh/video/log   │              └────────────────┘
              └─────────────────┘
```

**Mô hình dữ liệu (rút gọn):** `Salon` → `BrandKit` → `Template` · `Asset` (ảnh/video gốc) → `Post` (loại, caption, media đã xử lý, trạng thái duyệt) → `Schedule` → `PublishLog`.

**Ví dụ Brand Kit (JSON):**
```json
{
  "salon": "Tên tiệm",
  "city": "Livonia, MI",
  "location_line": "📍Tên tiệm | Livonia",
  "voice": "friendly, short, 1-2 emoji",
  "colors": { "primary": "#1F3A5F", "accent": "#F4C2C2" },
  "logo": "assets/logo.png",
  "hashtags": {
    "local": ["#LivoniaNails"],
    "brand": ["#TenTiemNails"],
    "niche": ["#NailInspo", "#NailArt"]
  },
  "cta": ["Book your spot today", "DM us to book"],
  "video_overlay_templates": ["Find your next nail inspo ✨", "Fresh set, who dis?"]
}
```

---

## 7. Lộ trình đề xuất

| Giai đoạn | Nội dung | Kết quả kiểm chứng |
|---|---|---|
| **0 (xong)** | GUI lên lịch + đăng bằng Playwright | Đã đăng thành công |
| **1** | Brand Kit + sinh caption (Gemini) + **áp style ảnh bằng Pillow** + hàng chờ duyệt | 1 tiệm nhận được bài ảnh nháp "đúng chất" tiệm |
| **2** | **Template video FFmpeg** (crop 9:16, chữ, logo, nhạc tùy chọn) | Thả 1 video phôi → ra MP4 sẵn đăng |
| **3** | Publisher mới bằng **Graph API** + nhiều tiệm + đăng lên Page | Lịch chạy không cần mở máy |
| **4** | AI đồ họa quảng cáo, xuất draft CapCut (tùy chọn), thống kê tương tác | Mở rộng giá trị |

Mình khuyên **không làm 3 giai đoạn cuối trước khi giai đoạn 1 được chủ tiệm thật khen**: giá trị nằm ở chỗ bài ra đúng chất tiệm và tiết kiệm thời gian cho họ.

---

## 8. Rủi ro & lưu ý

1. **Điều khoản Meta / khóa tài khoản** khi tự động hóa bằng trình duyệt, nhất là khi đăng thay nhiều tiệm. Phương án B (Graph API) giảm rủi ro này đáng kể.
2. **Ảnh/video có người thật** (tay khách, hình xăm, có khi lộ mặt): tiệm cần có sự đồng ý của khách; tool nên có checkbox xác nhận.
3. **Nhãn AI & tính trung thực:** nội dung do AI tạo phải gắn nhãn đúng, và không dùng ảnh AI thay cho thành phẩm thật (mục 4.1).
4. **Bản quyền nhạc** trong video thương mại (mục 4.2).
5. **Bảo mật:** token Page và phiên đăng nhập là dữ liệu nhạy cảm; lưu mã hóa, không để trong file `.json` thường khi bán cho người khác.
6. **Chất lượng caption AI:** luôn qua bước duyệt, tránh claim sai (giá, khuyến mãi, giờ mở cửa); chỉ lấy thông tin từ Brand Kit.
7. **Phụ thuộc giao diện Facebook** nếu còn dùng Playwright: cần có log + ảnh chụp màn hình khi lỗi để sửa nhanh.

---

## 9. Mình cần bạn chốt

Trả lời ngắn theo số là đủ (hoặc nói "theo đề xuất của bạn"):

1. **Q1:** Bạn định làm dịch vụ cho vài tiệm hay bán phần mềm?
2. **Q2/Q5:** Đăng lên **Page** của tiệm, chỉ Facebook hay cả Instagram?
3. **Q4:** Có bước duyệt của chủ tiệm trước khi đăng không?
4. **Q8:** Chấp nhận **FFmpeg** thay CapCut cho video tự động (CapCut chỉ là tùy chọn xuất draft)?
5. **Q9:** Đồng ý giới hạn "gen ảnh" ở **đồ họa quảng cáo**, không gen mẫu nail giả?
6. **Phương án đăng:** thử bằng Playwright/thủ công trước rồi chuyển Graph API, hay làm Graph API ngay (mất thời gian chờ Meta duyệt)?
7. Bạn đã có **1–2 tiệm thử** chưa, và họ có thể gửi ảnh/video thật mỗi tuần không?

---

## Phụ lục: nguồn tham khảo

- Tài liệu Meta về đăng bài lên Page (quyền, lên lịch, ảnh/video): https://developers.facebook.com/documentation/pages-api/posts
- Hướng dẫn thực tế về Graph API, app review, token, giới hạn: https://postproxy.dev/blog/facebook-graph-api-posting-guide/
- VectCutAPI (tạo draft CapCut/Jianying bằng Python/HTTP/MCP): https://github.com/sun-guannan/VectCutAPI
- Bài phân tích giới hạn các công cụ "CapCut MCP" (chỉ tạo draft, không xuất MP4): https://aituber.app/blog/capcut-mcp-claude/
- Hướng dẫn sinh/chỉnh ảnh bằng Gemini (hỗ trợ nhiều ảnh tham chiếu): https://dev.to/hassann/how-to-use-the-nano-banana-21-api-b88

*Thông tin về API, giá và tính năng các công cụ thay đổi nhanh. Cần kiểm tra lại các mục này trước khi bắt tay vào triển khai.*
