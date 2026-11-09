# ĐẶC TẢ KỸ THUẬT & NGHIỆP VỤ: PAPERAPP — TRỢ LÝ LỘ TRÌNH GIẤY TỜ (`paper-work-tool`)

> **Phiên bản:** 1.0.0 (Dev-Ready & Test-Ready)
> **Đội ngũ phụ trách:** AISE Squad 3 — BA Team (`intake`, `ba`, `requirement_challenger`) & PM Team (`orchestrator`, `estimator_cost_controller`)
> **Nguồn yêu cầu gốc:** `idea/paper-work-tool/requirement.md`, `idea/paper-work-tool/package.json`, `idea/paper-work-tool/index.html`

---

## PHẦN 1 — INTAKE & PHÂN LOẠI (`intake`)

### 1.1. Bảng Phân Tách Dữ Kiện (`Stated Facts`, `Explicit Assumptions`, `Clarification Questions`)

| Phân loại | Mã định danh | Nội dung chi tiết | Nguồn / Lý do kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-001` | Trải nghiệm ứng dụng được thiết kế trực quan **giống như một app đặt xe Uber** (nhập Điểm đi = Hiện trạng thực tế -> Điểm đến = Kết quả giấy tờ mong muốn -> Hiển thị tuyến đường & trạm dừng). | Trích nguyên văn dòng 1–3 file `requirement.md` ("1. Giống như một app đặt lái xe uber vậy...") |
| **Stated Fact** | `SF-002` | Người dùng chỉ cần nhập 2 trường cốt lõi: **`Prompt Input` (Thực tế vấn đề hiện tại là gì)** và **`Prompt Output` (Mong muốn sau cùng của họ là gì)**. Ví dụ thực tế: Input = *"Tôi muốn làm lại thẻ xanh đã mất"*, Output = *"Tôi có thẻ xanh mới"*. | Trích nguyên văn dòng 2, 3, 5 file `requirement.md` |
| **Stated Fact** | `SF-003` | Hệ thống sinh ra **Roadmap (Lộ trình)** gồm 4 thành phần bắt buộc: (1) Các bước cần phải làm, (2) **Các Milestone cần phải đợi** (thời gian chờ xử lý), (3) **Các giấy tờ, thông tin cần phải chuẩn bị**, (4) **Địa điểm cần phải tới** (hoặc cổng nộp trực tuyến). | Trích nguyên văn dòng 3 file `requirement.md` |
| **Stated Fact** | `SF-004` | Nếu người dùng cung cấp `Prompt Input` và `Prompt Output` **còn mơ hồ (ambiguous)**, ứng dụng phải **chủ động hỏi thêm (Clarifying Questions)** để thu thập đủ dữ kiện trước khi đưa ra Roadmap chính xác. | Trích nguyên văn dòng 6 file `requirement.md` |
| **Stated Fact** | `SF-005` | Công nghệ nền tảng đã khởi tạo sẵn trong dự án: **Vite + React + Lucide-React**, ngôn ngữ hiển thị mặc định tiếng Việt (`<html lang="vi">`), tên ứng dụng: **`PaperApp — Trợ lý giấy tờ`**. | Trích từ `package.json` và `index.html` |
| **Explicit Assumption** | `EA-001` | **Bắt buộc Tuyên bố Miễn trừ Trách nhiệm Pháp lý (`Legal Disclaimer`) & Trích dẫn Nguồn Chính phủ (`.gov` / `.gov.vn`):** Vì thủ tục di trú/hành chính (như làm lại Thẻ Xanh Mỹ mẫu `Form I-90` tại `uscis.gov`, đổi bằng lái DMV, làm hộ chiếu) ảnh hưởng trực tiếp tới tình trạng pháp lý và lệ phí của người dùng, mọi Roadmap bắt buộc phải đính kèm link biểu mẫu chính thống (`.gov` / `.gov.vn`), ngày cập nhật quy định và thông báo *"PaperApp cung cấp thông tin hướng dẫn thủ tục hành chính, không thay thế luật sư di trú/pháp lý"*. | Giả định an toàn pháp lý & chống AI Hallucination bắt buộc cho bài toán giấy tờ. |
| **Explicit Assumption** | `EA-002` | **Ngưỡng Đánh giá Độ Mơ Hồ (`Ambiguity Detection Threshold`):** Một cặp `(promptInput, promptOutput)` được coi là đầy đủ chỉ khi xác định được: (1) *Quốc gia/Bang/Tỉnh áp dụng (`jurisdiction`)*, (2) *Loại giấy tờ cụ thể (`documentCategory`)*, và (3) *Lý do/Trạng thái hiện tại* (VD: Thẻ xanh 2 năm hay 10 năm? Bị mất cắp, hỏng hay hết hạn? Đang ở trong nước Mỹ hay ngoài nước Mỹ?). Nếu thiếu 1 trong 3 yếu tố này, hệ thống chuyển sang trạng thái `CLARIFICATION_REQUIRED` và sinh tối đa `3` câu hỏi trắc nghiệm ngắn. | Cụ thể hóa yêu cầu dòng 6 ("còn mơ hồ thì app chủ động hỏi thêm") thành thuật toán kiểm định rõ ràng. |
| **Explicit Assumption** | `EA-003` | **Bảo mật Thông tin Cá nhân Nhạy cảm (`PII Redaction Guard`):** Người dùng đi làm giấy tờ thường có thói quen gõ thẳng số An sinh Xã hội (`SSN`), số Thẻ xanh (`A-Number`), số CCCD hoặc số Hộ chiếu vào ô prompt. Hệ thống tự động phát hiện và che (mask) các chuỗi số định danh này trước khi gửi tới LLM bên thứ ba. | Bảo vệ dữ liệu nhạy cảm của người dùng theo chuẩn bảo mật. |

### 1.2. Danh sách Câu hỏi Làm rõ (`Clarification Questions`)

1. **CQ-001: Nhóm thủ tục hành chính trọng tâm cần nạp sẵn cơ sở tri thức chuẩn (`Verified Official Templates`) trong bản MVP là gì?**
   - **Option A (Khuyến nghị):** Tập trung trước vào **Thủ tục Di trú & Cư trú cho người Việt tại Mỹ và Việt Nam** (Thẻ xanh USCIS `Form I-90`/`I-751`, Quốc tịch `N-400`, Bằng lái `Real ID / DMV`, Hộ chiếu Lãnh sự quán, Khai sinh/Kết hôn/Tư pháp) kết hợp AI tổng hợp có kiểm chứng nguồn `.gov`.
   - **Option B:** Chỉ dùng LLM tự do cho mọi thủ tục trên toàn thế giới mà không có bộ dữ liệu chuẩn đối chiếu.
   - *Quyết định mặc định cho bản Spec này:* Chọn **Option A** (Hybrid: Khớp mẫu chuẩn `.gov` đã xác thực trước + LLM bổ sung cho trường hợp ngách).

2. **CQ-002: Người dùng theo dõi tiến độ hồ sơ sau khi có Roadmap bằng cách nào?**
   - **Option A (Khuyến nghị):** Lưu tiến độ từng trạm (Milestone) trên thiết bị (`LocalStorage`), cho phép đánh dấu các giấy tờ đã gom đủ và ngày nộp đơn để tự động tính ngày dự kiến nhận kết quả (ETA giống Uber).
   - **Option B:** Chỉ hiển thị để đọc một lần rồi mất khi đóng tab.
   - *Quyết định mặc định cho bản Spec này:* Chọn **Option A**.

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1. Bảng Yêu Cầu Nghiệp Vụ (`REQ-001` .. `REQ-010`)

| Mã REQ | Tên Yêu Cầu | Mô tả nghiệp vụ chi tiết | Truy vết nguồn | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | Giao diện Nhập liệu Kiểu "Đặt Xe Uber" (`Origin -> Destination Intake`) | Thiết kế cụm nhập liệu gồm 2 ô nối với nhau bằng đường kẻ lộ trình: **Điểm xuất phát (`Prompt Input` - Vấn đề hiện tại)** và **Điểm đích (`Prompt Output` - Kết quả mong muốn)**, kèm các nút chọn nhanh tình huống phổ biến (VD: *Mất thẻ xanh -> Có thẻ xanh mới*). | `SF-001`, `SF-002` | **P0 Must-Have** |
| `REQ-002` | Bộ Lọc Bảo Mật PII (`PII Sanitization`) | Tự động quét và che các thông tin nhạy cảm (`SSN`, `USCIS A-Number`, `CCCD`, `Passport Number`, `Phone/Email`) trong `Prompt Input` và `Prompt Output` trước khi xử lý hoặc lưu log, đồng thời nhắc người dùng không nhập mã số định danh thật. | `EA-003` | **P0 Must-Have** |
| `REQ-003` | Đánh giá Độ Mơ Hồ & Hỏi Thêm Chủ Động (`Proactive Clarification Engine`) | Phân tích cặp `(Prompt Input, Prompt Output)`; nếu điểm rõ ràng `clarityScore < 0.75` hoặc thiếu thông tin cốt lõi (Khu vực pháp lý, Phân loại thẻ/hồ sơ, Tình trạng lưu trú), hệ thống trả về danh sách câu hỏi làm rõ (`ClarificationQuestion[]`) có sẵn các lựa chọn bấm nhanh trước khi vẽ Roadmap. | `SF-004`, `EA-002` | **P0 Must-Have** |
| `REQ-004` | Sinh Lộ trình Giấy tờ Đa Chiều (`Uber-Style Paperwork Roadmap`) | Tạo lộ trình tuần tự từ bước đầu đến bước nhận kết quả cuối cùng, hiển thị tổng thời gian dự kiến (`Estimated Total Wait Time`) và tổng lệ phí chính phủ (`Estimated Official Fees`). | `SF-001`, `SF-003` | **P0 Must-Have** |
| `REQ-005` | Chi tiết Giấy tờ Cần Chuẩn bị, Milestone Chờ & Địa điểm (`Checklist, Wait Milestones & Locations`) | Tại mỗi trạm của Roadmap, hiển thị rõ 3 khối thông tin: (1) **Danh sách giấy tờ/biểu mẫu cần chuẩn bị** (VD: `Form I-90`, bản sao hộ chiếu, biên lai phí `$415–$465`), (2) **Milestone thời gian chờ** (VD: *Chờ 2–4 tuần nhận thư hẹn lăn tay Biometrics*), (3) **Địa điểm cần tới** (VD: *Trung tâm hỗ trợ hồ sơ USCIS ASC gần nhất theo ZIP Code* hoặc cổng `my.uscis.gov`). | `SF-003` | **P0 Must-Have** |
| `REQ-006` | Đối chiếu Nguồn Chính Thống `.gov` & Pháp lý (`Official Source & Disclaimer Guard`) | Mọi bước thủ tục phải gắn kèm đường dẫn trang web cơ quan nhà nước chính thức (`.gov`, `.gov.vn`, `.state.us`) và hiển thị hộp cảnh báo Miễn trừ Trách nhiệm Pháp lý + Cảnh báo chống trang web lừa đảo giả mạo. | `EA-001` | **P0 Must-Have** |
| `REQ-007` | Theo dõi Tiến độ Hồ sơ & Đánh dấu Checklist (`Interactive Progress Tracker`) | Cho phép người dùng tick chọn từng loại giấy tờ đã chuẩn bị xong, đánh dấu hoàn thành từng Milestone và lưu trạng thái vào `LocalStorage` để mở lại bất cứ lúc nào. | `SF-001`, `CQ-002` | **P1 Should-Have** |
| `REQ-008` | Tính toán Thời gian Chờ Động (`Dynamic Milestone ETA Calculator`) | Khi người dùng nhập ngày nộp hồ sơ thực tế (`filingDate`), hệ thống tự động cộng số ngày chờ tối thiểu/tối đa của từng Milestone để hiển thị khoảng ngày dự kiến hoàn tất tiếp theo. | `SF-003`, `CQ-002` | **P1 Should-Have** |
| `REQ-009` | Xuất Bản In / Cẩm nang Cầm tay (`Printable Checklist Export`) | Xuất toàn bộ Roadmap và Checklist giấy tờ ra bản tóm tắt gọn gàng để người dùng in ra kẹp vào bìa hồ sơ khi đi làm thủ tục. | `SF-003` | **P1 Should-Have** |
| `REQ-010` | Hỗ trợ Song ngữ Thuật ngữ Hành chính (`Vietnamese Explanation + Official English Form Terms`) | Giải thích quy trình bằng tiếng Việt dễ hiểu nhưng giữ nguyên tên biểu mẫu tiếng Anh chuẩn (VD: *Đơn xin cấp lại Thẻ Thường Trú Nhân — `Form I-90, Application to Replace Permanent Resident Card`*) để người dùng không bị bỡ ngỡ khi tới cơ quan công quyền. | `SF-005`, `EA-001` | **P2 Nice-to-Have** |

### 2.2. Data Structures, Constants & `settings.json` Schema

#### Bảng `CONSTANTS` & `ENUMS` (Tuân thủ nghiêm ngặt luật No Magic Numbers/Strings)

```typescript
export enum IntakeResolutionStatus {
  READY_FOR_ROADMAP = 'READY_FOR_ROADMAP',
  CLARIFICATION_REQUIRED = 'CLARIFICATION_REQUIRED',
  INVALID_OR_UNSUPPORTED = 'INVALID_OR_UNSUPPORTED',
}

export enum MilestoneType {
  DOCUMENT_PREPARATION = 'DOCUMENT_PREPARATION',
  ONLINE_OR_MAIL_SUBMISSION = 'ONLINE_OR_MAIL_SUBMISSION',
  WAITING_FOR_AGENCY_NOTICE = 'WAITING_FOR_AGENCY_NOTICE',
  IN_PERSON_APPOINTMENT = 'IN_PERSON_APPOINTMENT',
  FINAL_DELIVERY = 'FINAL_DELIVERY',
}

export enum LocationChannelType {
  ONLINE_GOV_PORTAL = 'ONLINE_GOV_PORTAL',
  PHYSICAL_GOV_OFFICE = 'PHYSICAL_GOV_OFFICE',
  BIOMETRICS_CENTER = 'BIOMETRICS_CENTER',
  POSTAL_LOCKBOX = 'POSTAL_LOCKBOX',
}

export const PAPERWORK_CONSTANTS = {
  MIN_PROMPT_LENGTH: 5,
  MAX_PROMPT_LENGTH: 1000,
  CLARITY_SCORE_THRESHOLD: 0.75,
  MAX_CLARIFICATION_QUESTIONS: 3,
  MIN_ROADMAP_STEPS: 2,
  MAX_ROADMAP_STEPS: 12,
  MANDATORY_LEGAL_DISCLAIMER_VI:
    'LƯU Ý PHÁP LÝ: PaperApp là công cụ hướng dẫn lộ trình hành chính dựa trên quy định công khai, KHÔNG phải là văn phòng luật sư và không thay thế tư vấn pháp lý chính thức. Vui lòng luôn đối chiếu biểu mẫu và lệ phí mới nhất trên cổng thông tin chính phủ (.gov / .gov.vn).',
} as const;

export const TRUSTED_GOVERNMENT_DOMAINS = [
  '.gov',
  '.gov.vn',
  '.mil',
  '.state.us',
  'uscis.gov',
  'travel.state.gov',
  'ssa.gov',
  'dichvucong.gov.vn',
] as const;

export const PII_REGEX_PATTERNS = {
  US_SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
  USCIS_A_NUMBER: /\bA-?\d{8,9}\b/gi,
  VN_CCCD_12_DIGITS: /\b\d{12}\b/g,
} as const;
```

#### TypeScript Interfaces

```typescript
export interface PaperworkUserPrompt {
  promptInput: string;   // Thực tế vấn đề hiện tại (Origin)
  promptOutput: string;  // Mong muốn sau cùng (Destination)
  jurisdictionHint?: string; // VD: "US-CA", "US-Federal", "VN"
  clarificationAnswers?: Record<string, string>;
}

export interface ClarificationPromptItem {
  questionId: string;
  questionText: string;
  reasonWhyNeeded: string;
  options: Array<{
    optionKey: string;
    label: string;
  }>;
}

export interface AmbiguityEvaluationResult {
  status: IntakeResolutionStatus;
  sanitizedInput: string;
  sanitizedOutput: string;
  piiRedactedCount: number;
  clarityScore: number; // 0.0 -> 1.0
  missingSlots: Array<'JURISDICTION' | 'DOCUMENT_SUBTYPE' | 'CASE_CONDITION'>;
  followUpQuestions: ClarificationPromptItem[];
}

export interface RequiredDocumentItem {
  id: string;
  nameVi: string;
  officialFormCode: string; // VD: "Form I-90", "Tờ khai TK01"
  description: string;
  isMandatory: boolean;
  officialDownloadUrl?: string;
  isCompleted?: boolean;
}

export interface AgencyLocationInfo {
  channelType: LocationChannelType;
  agencyName: string;         // VD: "USCIS Application Support Center (ASC)"
  addressOrPortalUrl: string; // VD: "https://my.uscis.gov"
  appointmentRequired: boolean;
  notes: string;
}

export interface RoadmapMilestoneStep {
  stepOrder: number;
  title: string;
  milestoneType: MilestoneType;
  actionSummary: string;
  estimatedWaitDaysMin: number;
  estimatedWaitDaysMax: number;
  officialFeeUsdOrVnd: string;
  requiredDocuments: RequiredDocumentItem[];
  destinationLocation: AgencyLocationInfo;
  commonRejectionRisks: string[];
  isStepCompleted?: boolean;
}

export interface PaperworkRoadmap {
  roadmapId: string;
  originProblemSummary: string;
  targetOutcomeSummary: string;
  jurisdiction: string;
  totalEstimatedDaysMin: number;
  totalEstimatedDaysMax: number;
  totalEstimatedFeeSummary: string;
  officialReferenceUrls: string[];
  legalDisclaimer: string;
  steps: RoadmapMilestoneStep[];
  generatedAtIso: string;
}
```

#### Cấu trúc `settings.json` Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PaperWorkToolSettings",
  "type": "object",
  "required": ["llmProvider", "complianceGuards", "storage"],
  "properties": {
    "llmProvider": {
      "type": "object",
      "required": ["provider", "apiKey", "model", "endpointUrl", "timeoutMs"],
      "properties": {
        "provider": { "type": "string", "enum": ["gemini", "openai", "local-kb-fallback"] },
        "apiKey": { "type": "string", "description": "API Key đọc từ settings.json hoặc biến môi trường" },
        "model": { "type": "string", "default": "gemini-2.5-flash" },
        "endpointUrl": { "type": "string", "format": "uri" },
        "timeoutMs": { "type": "integer", "default": 15000 }
      }
    },
    "complianceGuards": {
      "type": "object",
      "required": ["enforceGovUrlVerification", "enablePiiRedaction", "defaultJurisdiction"],
      "properties": {
        "enforceGovUrlVerification": { "type": "boolean", "default": true },
        "enablePiiRedaction": { "type": "boolean", "default": true },
        "defaultJurisdiction": { "type": "string", "default": "US-FEDERAL" }
      }
    },
    "storage": {
      "type": "object",
      "required": ["localStorageKey"],
      "properties": {
        "localStorageKey": { "type": "string", "default": "aise_paperapp_saved_roadmaps_v1" }
      }
    }
  }
}
```

### 2.3. Kiến Trúc Service & Helper (Tuân thủ Rule 4 & SRP)

| Tên File | Loại | Hàm & Chữ ký (Method Signatures) | Mục đích (Docstring) |
| :--- | :--- | :--- | :--- |
| `src/services/PaperworkIntakeService.ts` | `*Service` | `evaluateUserPrompts(prompt: PaperworkUserPrompt): AmbiguityEvaluationResult` | Tiếp nhận `promptInput` và `promptOutput`, thực hiện lọc PII, chấm điểm độ rõ ràng và sinh bộ câu hỏi làm rõ (`followUpQuestions`) nếu yêu cầu còn mơ hồ. |
| `src/services/helpers/PaperworkIntakeServiceHelper.ts` | `*ServiceHelper` | `redactSensitivePii(rawText: string): { sanitizedText: string; redactedCount: number }`<br>`detectMissingInformationSlots(input: string, output: string, answers?: Record<string, string>): Array<'JURISDICTION' \| 'DOCUMENT_SUBTYPE' \| 'CASE_CONDITION'>`<br>`buildClarificationQuestions(missingSlots: string[], input: string): ClarificationPromptItem[]` | Chứa các hàm xử lý chuỗi thuần túy: che mã số SSN/A-Number/CCCD, phát hiện thông tin còn thiếu và tạo câu hỏi trắc nghiệm chủ động. |
| `src/services/RoadmapGeneratorService.ts` | `*Service` | `generatePaperworkRoadmap(prompt: PaperworkUserPrompt): Promise<PaperworkRoadmap>`<br>`calculateMilestoneEtaDates(roadmap: PaperworkRoadmap, startDateIso: string): Array<{ stepOrder: number; earliestDateIso: string; latestDateIso: string }>` | Tạo lộ trình giấy tờ đầy đủ (Giấy tờ cần chuẩn bị, Milestone chờ đợi, Địa điểm cần tới), hậu kiểm nguồn `.gov` và tính ngày hoàn thành dự kiến. |
| `src/services/helpers/RoadmapGeneratorServiceHelper.ts` | `*ServiceHelper` | `isTrustedGovernmentUrl(url: string): boolean`<br>`enforceComplianceAndDisclaimer(rawRoadmap: PaperworkRoadmap): PaperworkRoadmap`<br>`matchVerifiedTemplate(input: string, output: string, answers?: Record<string, string>): PaperworkRoadmap \| null` | Xác thực tên miền chính phủ (`.gov`/`.gov.vn`), gắn bắt buộc `MANDATORY_LEGAL_DISCLAIMER_VI` và khớp các mẫu thủ tục chuẩn (như cấp lại Thẻ Xanh `Form I-90`, đổi bằng lái, làm hộ chiếu). |

### 2.4. Ma Trận 5 Trạng Thái UX (`Ideal`, `Loading`, `Empty`, `Error`, `Partial/Overflow`)

| Trạng thái UX | Điều kiện kích hoạt | Hiển thị Giao diện (Visual Feedback) | Hành động khôi phục / Tương tác (CTA) |
| :--- | :--- | :--- | :--- |
| **1. Empty State** | Người dùng mới mở `PaperApp — Trợ lý giấy tờ`. | Giao diện thẻ đặt lộ trình kiểu Uber với 2 ô rõ ràng: **Điểm đi (Vấn đề hiện tại của bạn)** và **Điểm đến (Kết quả giấy tờ mong muốn)**. Bên dưới có 3 gợi ý 1 chạm: *(1) Mất thẻ xanh -> Có thẻ xanh mới*, *(2) Đổi bằng lái hết hạn -> Có Real ID*, *(3) Hộ chiếu sắp hết hạn -> Gia hạn hộ chiếu mới*. | Bấm chọn 1 gợi ý mẫu hoặc gõ trực tiếp vào 2 ô rồi nhấn `Xem Lộ Trình Giấy Tờ`. |
| **2. Loading State** | Hệ thống đang phân tích hồ sơ và tra cứu biểu mẫu hành chính. | Hiệu ứng xe/biểu tượng hồ sơ di chuyển dọc theo các trạm: `"Đang kiểm tra điều kiện hồ sơ..."` -> `"Đang tổng hợp biểu mẫu & địa điểm nộp..."`. | Nút `Hủy yêu cầu`. |
| **3. Ideal State** | Đủ thông tin đầu vào (`READY_FOR_ROADMAP`) và sinh xong lộ trình. | Hiển thị bản đồ tuyến đường dọc kiểu Uber: Trên cùng là **Tổng thời gian chờ dự kiến** + **Tổng lệ phí** + **Banner Pháp lý & Nguồn `.gov`**. Bên dưới là chuỗi các Trạm (Milestone) hiển thị rõ: *Giấy tờ cần chuẩn bị (có checkbox)*, *Thời gian phải đợi*, *Địa điểm cần tới (kèm link chính thức)*. | Cho phép tick hoàn thành từng giấy tờ, chọn ngày nộp hồ sơ để tính ngày nhận thẻ, hoặc bấm `In / Lưu Cẩm Nang Hồ Sơ`. |
| **4. Error State** | Người dùng để trống ô nhập, nhập nội dung quá ngắn (`< 5 ký tự`), hoặc yêu cầu hành vi vi phạm pháp luật (làm giấy tờ giả). | Hộp thông báo màu đỏ: *"Vui lòng mô tả rõ cả Tình trạng hiện tại (Input) và Mong muốn cuối cùng (Output). PaperApp chỉ hỗ trợ hướng dẫn thủ tục hành chính hợp pháp."* | Nút `Điền theo mẫu gợi ý` hoặc `Sửa lại nội dung`. |
| **5. Partial / Overflow State (Clarification Step)** | Người dùng nhập câu quá ngắn/mơ hồ (VD: Input = *"Mất giấy tờ"*, Output = *"Làm lại mới"* hoặc chưa rõ Thẻ xanh 2 năm hay 10 năm). | Hiển thị hộp thoại tương tác **"Trợ lý cần hỏi thêm 2 thông tin nhỏ để vẽ đúng lộ trình cho bạn"** với các nút bấm chọn nhanh (Option Pills) không cần gõ phím. | Người dùng chọn đáp án và bấm `Cập nhật Lộ Trình Chính Xác`. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

| Mã Rủi Ro | Mô tả Lỗ hổng / Rủi ro Thực tế | Mức độ nghiêm trọng | Chốt chặn Kỹ thuật Bắt buộc (Technical Guardrail) |
| :--- | :--- | :--- | :--- |
| `RISK-001` | **AI Hallucination tư vấn sai biểu mẫu pháp lý hoặc dẫn link tới trang web cò mồi lừa đảo (`Fake Immigration Scam Sites`):** Trong lĩnh vực di trú và hành chính, việc điền nhầm `Form I-90` (thẻ 10 năm) thay vì `Form I-751` (thẻ 2 năm hết hạn) khiến người dân mất trắng gần `$500–$750` lệ phí không hoàn lại và có nguy cơ bị hủy tư cách lưu trú; hoặc bấm nhầm trang `.com` giả mạo `.gov`. | **CRITICAL (Blocker)** | **Chốt chặn Kép tại `RoadmapGeneratorServiceHelper`:** (1) Bắt buộc hỏi làm rõ loại thẻ/tình trạng trong `PaperworkIntakeService` trước khi kết luận biểu mẫu. (2) Hàm `isTrustedGovernmentUrl()` lọc toàn bộ URL trong `officialReferenceUrls` và `addressOrPortalUrl`, chỉ cho phép hiển thị link thuộc `TRUSTED_GOVERNMENT_DOMAINS` (`.gov`, `.gov.vn`, `uscis.gov`...). (3) Bắt buộc gắn `MANDATORY_LEGAL_DISCLAIMER_VI` vào mọi đối tượng `PaperworkRoadmap`. |
| `RISK-002` | **Lộ lọt thông tin định danh cá nhân (`SSN`, `A-Number`, `CCCD`) khi người dùng gõ vào ô Prompt:** Người ít kinh nghiệm làm giấy tờ thường copy-paste nguyên văn thông tin cá nhân và số thẻ xanh/SSN vào ô chat. | **HIGH** | **Bộ lọc `redactSensitivePii()` chạy tại Client trước mọi lệnh gọi API:** Tự động thay thế `SSN` (`XXX-XX-XXXX`), `USCIS A-Number` (`A-XXXXXXXXX`) và `CCCD 12 số` bằng chuỗi `[REDACTED_PII]` và hiển thị cảnh báo nhắc người dùng. |
| `RISK-003` | **Đầu vào cực kỳ mơ hồ khiến Roadmap sai lệch hoàn toàn (`Garbage-In Garbage-Out`):** Người dùng chỉ gõ *"Làm lại thẻ xanh"* mà không nói rõ là thẻ bị mất, thẻ hết hạn, hay thẻ bị sai tên do lỗi in ấn của USCIS (trường hợp lỗi của USCIS thì được miễn phí lệ phí). | **HIGH** | **Chốt chặn `IntakeResolutionStatus.CLARIFICATION_REQUIRED`:** Không cho phép `generatePaperworkRoadmap()` sinh lộ trình phỏng đoán nếu `evaluateUserPrompts()` trả về `status === CLARIFICATION_REQUIRED`. Bắt buộc đi qua bước hỏi đáp ngắn để chốt đủ `missingSlots`. |
| `RISK-004` | **Lệ phí và thời gian xử lý hồ sơ thay đổi theo từng thời điểm của cơ quan nhà nước:** Thời gian chờ của USCIS hoặc cơ quan hành chính không phải là con số cố định tuyệt đối mà là một khoảng (`min` – `max`). | **MEDIUM** | **Biểu diễn Thời gian Chờ theo Khoảng (`estimatedWaitDaysMin` & `estimatedWaitDaysMax`):** Cấm trả về 1 ngày cố định cứng nhắc; luôn hiển thị khoảng thời gian dự kiến (VD: `14 - 30 ngày` cho lăn tay Biometrics, `180 - 360 ngày` nhận thẻ cứng) kèm ghi chú cách kiểm tra Case Status trực tuyến. |

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1. Kịch bản Kiểm thử 3 Tầng (`Given / When / Then`)

#### Tầng 1: P0 Happy Paths (Người dùng hay xài nhất)
- **TC-T1-001: Sinh Roadmap chuẩn xác cho tình huống mẫu trong Requirement (*"Tôi muốn làm lại thẻ xanh đã mất"* -> *"Tôi có thẻ xanh mới"*)**
  - **Given:** Người dùng nhập `promptInput = "Tôi muốn làm lại thẻ xanh 10 năm đã mất tại Mỹ"`, `promptOutput = "Tôi có thẻ xanh mới"`.
  - **When:** Gọi `evaluateUserPrompts()` và `generatePaperworkRoadmap()`.
  - **Then:** Trạng thái là `READY_FOR_ROADMAP`; Roadmap trả về đầy đủ các trạm: (1) Chuẩn bị hồ sơ & nộp đơn `Form I-90` trực tuyến tại `https://www.uscis.gov/i-90`, (2) Nhận biên nhận `Form I-797C` (kiêm gia hạn tạm / xin tem `ADIT` nếu cần đi lại gấp), (3) Đi lăn tay tại `USCIS Application Support Center (ASC)`, (4) Chờ nhận Thẻ Xanh mới qua bưu điện USPS; kèm đầy đủ `MANDATORY_LEGAL_DISCLAIMER_VI`.
- **TC-T1-002: Chủ động hỏi thêm khi `Prompt Input` và `Prompt Output` còn mơ hồ (`CLARIFICATION_REQUIRED`)**
  - **Given:** Người dùng chỉ nhập `promptInput = "Tôi bị mất giấy tờ"`, `promptOutput = "Tôi muốn làm lại"`.
  - **When:** Gọi `evaluateUserPrompts()`.
  - **Then:** Hệ thống trả về `status = IntakeResolutionStatus.CLARIFICATION_REQUIRED`, `clarityScore < 0.75` và danh sách `followUpQuestions` hỏi rõ loại giấy tờ và quốc gia/tình trạng cụ thể.
- **TC-T1-003: Tính toán ngày hoàn thành dự kiến (`calculateMilestoneEtaDates`) cho từng trạm chờ đợi**
  - **Given:** Một Roadmap gồm 3 bước có khoảng chờ lần lượt là `(1, 3)` ngày, `(14, 28)` ngày, và `(90, 180)` ngày; ngày bắt đầu nộp là `2026-11-01`.
  - **When:** Gọi `calculateMilestoneEtaDates(roadmap, '2026-11-01')`.
  - **Then:** Trả về chính xác ngày sớm nhất (`earliestDateIso`) và muộn nhất (`latestDateIso`) cộng dồn cho từng Milestone.

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-T2-001: Tự động phát hiện và che mã số nhạy cảm (`SSN`, `A-Number`, `CCCD`) trong câu nhập của người dùng**
  - **Given:** Người dùng nhập `promptInput = "Tôi mất thẻ xanh số A-123456789 và SSN 123-45-6789"`.
  - **When:** Gọi `evaluateUserPrompts()`.
  - **Then:** `sanitizedInput` trở thành `"Tôi mất thẻ xanh số [REDACTED_PII] và SSN [REDACTED_PII]"` và `piiRedactedCount = 2`.
- **TC-T2-002: Loại bỏ các đường dẫn không phải trang chính phủ chính thống (`Untrusted URL Filtering`)**
  - **Given:** Một đối tượng Roadmap thô có chứa link quảng cáo lừa đảo `http://fast-greencard-scam.com/pay-now` bên cạnh link thật `https://www.uscis.gov/i-90`.
  - **When:** Chạy qua `enforceComplianceAndDisclaimer()`.
  - **Then:** Link `fast-greencard-scam.com` bị loại bỏ hoàn toàn, chỉ giữ lại `https://www.uscis.gov/i-90`.
- **TC-T2-003: Chặn yêu cầu khi `promptInput` hoặc `promptOutput` bị bỏ trống hoặc quá ngắn**
  - **Given:** `promptInput = ""` hoặc `"abc"`.
  - **When:** Gọi `evaluateUserPrompts()`.
  - **Then:** Trả về `status = IntakeResolutionStatus.INVALID_OR_UNSUPPORTED` kèm thông báo lỗi rõ ràng.

#### Tầng 3: Boundary & Rare Edge Cases (`0`, `-1`, `MAX`, `Empty`, `Duplicate`, `Concurrent`)
- **TC-T3-001: Xử lý giá trị biên thời gian chờ âm hoặc bằng 0 (`estimatedWaitDaysMin < 0` hoặc `min > max`)**
  - **Given:** Dữ liệu Milestone có `estimatedWaitDaysMin = -5` hoặc `estimatedWaitDaysMin = 30, estimatedWaitDaysMax = 10`.
  - **When:** Chuẩn hóa qua `enforceComplianceAndDisclaimer()`.
  - **Then:** Các số âm được đưa về `0`, và nếu `min > max` thì tự động hoán đổi để luôn đảm bảo `0 <= min <= max`.
- **TC-T3-002: Giới hạn số lượng câu hỏi làm rõ không vượt quá `MAX_CLARIFICATION_QUESTIONS = 3`**
  - **Given:** Câu nhập thiếu tất cả các trường thông tin.
  - **When:** Gọi `buildClarificationQuestions()`.
  - **Then:** Mảng câu hỏi trả về có độ dài `1 <= length <= 3` để người dùng không bị ngợp.
- **TC-T3-003: Chuyển đổi trạng thái từ `CLARIFICATION_REQUIRED` sang `READY_FOR_ROADMAP` ngay sau khi người dùng trả lời câu hỏi phụ**
  - **Given:** Cặp prompt ban đầu bị đánh giá là mơ hồ, sau đó người dùng bổ sung `clarificationAnswers = { documentType: 'GREEN_CARD_I90', cardValidity: '10_YEAR_LOST', jurisdiction: 'US' }`.
  - **When:** Gọi lại `evaluateUserPrompts()`.
  - **Then:** `status` chuyển thành `READY_FOR_ROADMAP` và `clarityScore >= 0.75`.

### 4.2. Quy trình 5 Bước Kiểm Chứng Bề Mặt Thật cho QA Reviewer

1. **Step 1 — Launch:** Khởi chạy ứng dụng/dịch vụ `PaperApp` trong môi trường Node/Vite và nạp cấu hình từ `settings.json`.
2. **Step 2 — Doctor:** Kiểm tra sự tồn tại của `PAPERWORK_CONSTANTS`, `TRUSTED_GOVERNMENT_DOMAINS`, `PII_REGEX_PATTERNS` và cấu hình `settings.json`.
3. **Step 3 — Drive:** Chạy 2 luồng thực tế: (Luồng A) Nhập câu mơ hồ -> nhận câu hỏi làm rõ -> chọn đáp án -> nhận Roadmap; (Luồng B) Nhập bài toán *"Mất thẻ xanh -> Có thẻ xanh mới"* -> kiểm tra đầy đủ Checklist giấy tờ (`Form I-90`), các Milestone chờ đợi, địa điểm `USCIS ASC` và Disclaimer pháp lý.
4. **Step 4 — Evidence:** Thu thập kết quả thực thi test, log kiểm chứng lọc PII và lọc tên miền `.gov`.
5. **Step 5 — Cleanup:** Dọn dẹp trạng thái tạm sau khi chạy xong kiểm thử.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role phụ trách | File mục tiêu | Mô tả chi tiết hàm cần viết | Phụ thuộc | Lệnh Verify + Tiêu chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `src/constants/paperworkConstants.ts` & `settings.json` | Khai báo `IntakeResolutionStatus`, `MilestoneType`, `LocationChannelType`, `PAPERWORK_CONSTANTS`, `TRUSTED_GOVERNMENT_DOMAINS`, `PII_REGEX_PATTERNS` và tạo `settings.json`. | Không (None) | `npx tsc --noEmit` pass 100%, không có magic number/string. |
| `TASK-002` | **Developer** | `src/types/paperworkTypes.ts` | Định nghĩa đầy đủ các interfaces: `PaperworkUserPrompt`, `ClarificationPromptItem`, `AmbiguityEvaluationResult`, `RequiredDocumentItem`, `AgencyLocationInfo`, `RoadmapMilestoneStep`, `PaperworkRoadmap`. | **Hard:** `TASK-001` | `npx tsc --noEmit` không có lỗi. |
| `TASK-003` | **Developer** | `src/services/helpers/PaperworkIntakeServiceHelper.ts` | Viết `redactSensitivePii()`, `detectMissingInformationSlots()`, và `buildClarificationQuestions()`. | **Hard:** `TASK-002` | Che đúng 100% SSN, A-Number, CCCD và phát hiện đúng khi thiếu thông tin loại giấy tờ/khu vực. |
| `TASK-004` | **Developer** | `src/services/PaperworkIntakeService.ts` | Viết `evaluateUserPrompts()` kết hợp kiểm tra độ dài, lọc PII, tính `clarityScore` và quyết định `READY_FOR_ROADMAP` hay `CLARIFICATION_REQUIRED`. | **Hard:** `TASK-003` | Trả về đúng trạng thái cho cả input rõ ràng, input mơ hồ và input rỗng. |
| `TASK-005` | **Developer** | `src/services/helpers/RoadmapGeneratorServiceHelper.ts` | Viết `isTrustedGovernmentUrl()`, `enforceComplianceAndDisclaimer()` và `matchVerifiedTemplate()` (chứa mẫu chuẩn xác thực cho cấp lại Thẻ Xanh `Form I-90`, đổi bằng lái DMV, làm lại Hộ chiếu/CCCD). | **Hard:** `TASK-002` | Chặn mọi URL không thuộc `.gov`/`.gov.vn` và chuẩn hóa khoảng ngày chờ `min <= max`. |
| `TASK-006` | **Developer** | `src/services/RoadmapGeneratorService.ts` | Viết `generatePaperworkRoadmap()` và `calculateMilestoneEtaDates()`. | **Hard:** `TASK-004`, `TASK-005` | Sinh lộ trình đầy đủ 4 thành phần (Steps, Wait Milestones, Documents, Locations) kèm Disclaimer pháp lý. |
| `TASK-007` | **Developer** | `src/components/UberRoadmapView.tsx` | Xây dựng giao diện React hiển thị 2 ô nhập Origin/Destination kiểu Uber, hộp thoại hỏi thêm khi mơ hồ và trục lộ trình Milestone. | **Hard:** `TASK-006` | `npm run build` trong dự án Vite chạy thành công không lỗi. |
| `TASK-008` | **Test Engineer** | `tests/paperworkIntake.test.ts` | Viết Unit Test 3 tầng cho `PaperworkIntakeService` & Helper (PII redaction, ambiguity detection, clarification questions limit, empty/short input). | **Hard:** `TASK-004` | `npm test -- tests/paperworkIntake.test.ts` pass 100%. |
| `TASK-009` | **Test Engineer** | `tests/roadmapGenerator.test.ts` | Viết Unit Test 3 tầng cho `RoadmapGeneratorService` & Helper (Green Card replacement `Form I-90` happy path, untrusted URL filtering, negative wait days boundary, ETA calculation). | **Hard:** `TASK-006` | `npm test -- tests/roadmapGenerator.test.ts` pass 100%, branch coverage `>= 90%`. |
| `TASK-010` | **Test Engineer** | `tests/paperworkE2E.test.ts` | Viết kịch bản tích hợp End-to-End từ lúc người dùng nhập câu mơ hồ -> trả lời câu hỏi làm rõ -> nhận Roadmap hoàn chỉnh -> tính ngày ETA. | **Hard:** `TASK-008`, `TASK-009` | Toàn bộ test suite chạy xanh 100%, xuất bằng chứng QA đầy đủ. |
