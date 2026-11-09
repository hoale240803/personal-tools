# ĐẶC TẢ KỸ THUẬT & NGHIỆP VỤ: NAILS STEP FROM IMAGE (`nails-step-from-image`)

> **Phiên bản:** 1.0.0 (Dev-Ready & Test-Ready)
> **Đội ngũ phụ trách:** AISE Squad 3 — BA Team (`intake`, `ba`, `requirement_challenger`) & PM Team (`orchestrator`, `estimator_cost_controller`)
> **Nguồn yêu cầu gốc:** `idea/nails-step-from-image/requirement.md`

---

## PHẦN 1 — INTAKE & PHÂN LOẠI (`intake`)

### 1.1. Bảng Phân Tách Dữ Kiện (`Stated Facts`, `Explicit Assumptions`, `Clarification Questions`)

| Phân loại | Mã định danh | Nội dung chi tiết | Nguồn / Lý do kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-001` | Người dùng mục tiêu là **Nail Technician (Thợ làm móng chuyên nghiệp)** có một bức hình mẫu móng đẹp trên mạng (`Nail Inspo Image`). | Trích nguyên văn dòng 1 file `requirement.md` ("Giả sử tôi có một hình nails inspo trên mạng rất đẹp. Tôi là một nail technician.") |
| **Stated Fact** | `SF-002` | Người dùng cần biết quy trình kỹ thuật làm ra bộ móng đó như thế nào (`Làm như thế nào?`). | Trích nguyên văn dòng 1 file `requirement.md` |
| **Stated Fact** | `SF-003` | Hệ thống phải liệt kê đầy đủ **những công cụ (Tools/Equipment)** và **nguyên vật liệu (Materials/Products)** cần thiết để thực hiện bộ móng đó. | Trích nguyên văn dòng 1 file `requirement.md` ("dùng những công cụ và nguyên liệu gì để làm bộ nail đó") |
| **Stated Fact** | `SF-004` | Đầu ra (`Output`) của hệ thống là **một tài liệu hướng dẫn từng bước (`Step-by-Step Guide Document`)** hoặc **một dạng Video / Storyboard hướng dẫn**. | Trích nguyên văn dòng 1 file `requirement.md` ("Output là một video hoặc một dạng tài liệu step by step.") |
| **Explicit Assumption** | `EA-001` | **Phân rã cấu trúc giải phẫu móng theo lớp (`Multi-Layer Nail Anatomy Breakdown`):** Để một Nail Tech thực hành được, quy trình bắt buộc phải chia theo đúng thứ tự chuẩn salon: (1) *Prep & Extension (Xử lý móng & nối form/tip)* -> (2) *Base & Foundation (Lớp nền)* -> (3) *Color & Effect Layers (Màu sơn, mắt mèo, tráng gương, ombre)* -> (4) *Nail Art / 3D / Charms (Vẽ nét, đính đá, nổi 3D)* -> (5) *Top Coat & Curing (Phủ bóng/lì & hơ đèn UV/LED)*. | Giả định nghiệp vụ chuẩn ngành Nail để tài liệu đầu ra có giá trị thực tế cho thợ, tránh AI trả về văn bản chung chung. |
| **Explicit Assumption** | `EA-002` | **Thông số kỹ thuật hơ đèn (`UV/LED Curing Time`) & Mã màu HEX gần đúng:** Mỗi bước sử dụng gel (Base, Builder Gel, Gel Polish, Rhinestone Glue, Top Coat) phải đi kèm thời gian hơ đèn chuẩn (VD: `30s` hoặc `60s` dưới đèn `48W UV/LED`) và bảng màu trích xuất từ ảnh (HEX + tên tông màu chuyên ngành như *Milky White*, *Jelly Nude*, *Chrome Silver*). | Giúp Nail Tech chọn đúng chai sơn trong tiệm và không làm bong tróc móng của khách. |
| **Explicit Assumption** | `EA-003` | **Phân tách theo từng ngón (`Per-Finger Design Mapping`) nếu bộ móng bất đối xứng:** Nhiều mẫu Nail Inspo thiết kế mỗi ngón một kiểu (VD: ngón áp út đính charm 3D, ngón trỏ vẽ French tip, ngón giữa loang marble). Hệ thống cần gom nhóm kỹ thuật theo ngón (`Thumb`, `Index`, `Middle`, `Ring`, `Pinky`). | Đảm bảo độ chi tiết thực thi cho các mẫu móng phức tạp. |
| **Explicit Assumption** | `EA-004` | **Đầu ra Video ở dạng Slideshow/Storyboard có thuyết minh hoặc Timeline từng bước (`Step-by-Step Visual Storyboard & Video Script`):** Do việc tạo video quay tay thật 100% bằng AI dễ làm biến dạng ngón tay và sai thao tác cọ, hệ thống xuất **Tài liệu Step-by-Step chuẩn Salon** kết hợp **Visual Storyboard / Video Slideshow tự động (Canvas/WebM)** phóng to từng vùng kỹ thuật trên ảnh mẫu. | Giải pháp kỹ thuật khả thi, nhanh và chính xác cho Nail Tech ngay tại bàn làm việc. |

### 1.2. Danh sách Câu hỏi Làm rõ (`Clarification Questions`)

1. **CQ-001: Định dạng ưu tiên của đầu ra "Video hoặc Tài liệu Step-by-Step" trong phiên bản MVP là gì?**
   - **Option A (Khuyến nghị):** Kết hợp cả hai trên một giao diện: **Interactive Step-by-Step Recipe Card** (có checklist công cụ, nguyên liệu, thời gian hơ đèn, PDF/Markdown export) kèm **Interactive Guided Slideshow Player** (tự động crop/zoom vào từng chi tiết ngón tay trên ảnh gốc theo từng bước kèm hướng dẫn giọng đọc TTS để thợ vừa làm vừa nghe).
   - **Option B:** Chỉ xuất file văn bản PDF/HTML tĩnh.
   - **Option C:** Gọi dịch vụ Text-to-Video AI bên ngoài (Sora/Runway/Veo) để render video mô phỏng (chi phí cao, chờ 2–5 phút/video và dễ sai kỹ thuật cầm cọ).
   - *Quyết định mặc định cho bản Spec này:* Chọn **Option A** để vừa đáp ứng đúng yêu cầu tài liệu Step-by-Step + trải nghiệm Video/Player rảnh tay cho Nail Tech khi đang sơn móng cho khách, vừa đảm bảo độ chính xác kỹ thuật 100%.

2. **CQ-002: Hệ thống có cần cho phép Nail Tech tùy chỉnh nguyên liệu sẵn có tại tiệm (Substitution / Inventory Match) không?**
   - **Option A (Khuyến nghị):** Có — Khi AI đề xuất một nguyên liệu (VD: *Hard Builder Gel*), hệ thống gợi ý luôn phương án thay thế tương đương (*Acrylic Powder* hoặc *Soft Gel Tip / Gel-X*) tùy theo thói quen của thợ.
   - **Option B:** Không — Chỉ liệt kê duy nhất 1 bộ nguyên liệu cố định.
   - *Quyết định mặc định cho bản Spec này:* Chọn **Option A**.

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1. Bảng Yêu Cầu Nghiệp Vụ (`REQ-001` .. `REQ-010`)

| Mã REQ | Tên Yêu Cầu | Mô tả nghiệp vụ chi tiết | Truy vết nguồn | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | Tiếp nhận & Kiểm định Ảnh Mẫu Nail (`Nail Inspo Intake`) | Cho phép tải ảnh từ máy, dán ảnh từ Clipboard hoặc nhập URL hình ảnh mẫu móng; kiểm tra ảnh có chứa bàn tay/móng tay rõ nét hay không trước khi phân tích. | `SF-001` | **P0 Must-Have** |
| `REQ-002` | Nhận diện Dáng móng, Độ dài & Kỹ thuật Chủ đạo (`Nail Profile Analysis`) | Phân tích và xác định: Dáng móng (`Almond`, `Coffin`, `Stiletto`, `Square`, `Oval`), Độ dài (`Short`, `Medium`, `Long`, `XL`), Độ khó (`Beginner`, `Intermediate`, `Master`) và thời gian thực hiện dự kiến (phút). | `SF-001`, `SF-002` | **P0 Must-Have** |
| `REQ-003` | Trích xuất Danh sách Công cụ & Thiết bị (`Tools & Equipment Checklist`) | Liệt kê đầy đủ dụng cụ cần chuẩn bị: các loại cọ (`Liner Brush 7mm/11mm`, `Ombre Brush`, `Flat Gel Brush`), đèn (`UV/LED Lamp 48W`, `Mini Flash Cure Lamp`), đầu mài (`E-file Bits`), thanh nam châm mắt mèo (`Cat-Eye Magnet`), mút dặm (`Sponge`), kìm nhặt đá. | `SF-003` | **P0 Must-Have** |
| `REQ-004` | Trích xuất Danh sách Nguyên vật liệu & Bảng màu (`Materials & Color Palette`) | Liệt kê nguyên liệu tiêu hao: Base coat, màu sơn gel (kèm mã HEX trích xuất từ ảnh & độ trong suốt `Sheer/Jelly/Opaque`), bột tráng gương (`Chrome Powder`), đá/charm 3D, keo đính đá (`Rhinestone Gel`), Top coat (`Glossy/Matte/Non-wipe`) và gợi ý nguyên liệu thay thế. | `SF-003`, `EA-002` | **P0 Must-Have** |
| `REQ-005` | Sinh Quy trình Thực hiện Từng bước Chuẩn Salon (`Step-by-Step Salon Workflow`) | Tạo quy trình tuần tự theo 5 giai đoạn (`PREP_EXTENSION` -> `BASE_FOUNDATION` -> `COLOR_EFFECT` -> `ART_3D_DETAIL` -> `ENCAPSULATION_TOP`), mỗi bước nêu rõ thao tác cọ, số lớp sơn (`coats`), thời gian hơ đèn (`cureTimeSeconds`) và lưu ý tránh lỗi (`Pro Tip`). | `SF-002`, `SF-004`, `EA-001` | **P0 Must-Have** |
| `REQ-006` | Phân tách Kỹ thuật theo Từng ngón (`Finger-by-Finger Mapping`) | Chỉ rõ bước kỹ thuật nào áp dụng cho tất cả các ngón (`ALL_FINGERS`) và bước nào chỉ áp dụng cho ngón điểm nhấn (`Accent Nails` như `RING_FINGER`, `MIDDLE_FINGER`). | `SF-002`, `EA-003` | **P1 Should-Have** |
| `REQ-007` | Chế độ Trình chiếu Video / Storyboard Rảnh tay (`Guided Video Storyboard Mode`) | Chuyển đổi tài liệu Step-by-Step thành trình phát Slideshow/Video tự động cắt cúp vùng ảnh tương ứng với từng bước, hiển thị đồng hồ đếm ngược thời gian hơ đèn (`30s/60s Timer`) và phát âm thanh hướng dẫn để thợ không cần chạm tay dính gel vào màn hình. | `SF-004`, `EA-004` | **P1 Should-Have** |
| `REQ-008` | Cảnh báo Tương thích Hóa chất (`Chemical Compatibility Guard`) | Tự động kiểm tra và cảnh báo các lỗi xung khắc kỹ thuật phổ biến (VD: Đánh tráng gương Chrome bắt buộc phải dùng `Non-Wipe Top Coat` hơ vừa tới `15-30s`; đính charm lớn phải dùng `Hard Gel / Rhinestone Glue` chứ không dùng Base Coat thường). | `SF-002`, `SF-003` | **P1 Should-Have** |
| `REQ-009` | Xuất Tài liệu Công thức Nail (`Export Recipe PDF / Markdown`) | Xuất toàn bộ bảng công cụ, nguyên liệu và các bước thực hiện ra file Markdown/PDF gọn gàng để in hoặc lưu vào sổ tay công thức của Salon. | `SF-004` | **P1 Should-Have** |
| `REQ-010` | Lưu Bộ sưu tập Công thức (`Salon Recipe Library`) | Lưu các mẫu đã phân tích vào bộ nhớ cục bộ, cho phép tìm kiếm theo kỹ thuật (`Ombre`, `Cat-Eye`, `French`, `3D Gel`, `Chrome`). | `SF-001`, `SF-004` | **P2 Nice-to-Have** |

### 2.2. Data Structures, Constants & `settings.json` Schema

#### Bảng `CONSTANTS` & `ENUMS` (Tuân thủ nghiêm ngặt luật No Magic Numbers/Strings)

```typescript
export enum NailShape {
  SQUARE = 'SQUARE',
  SQUOVAL = 'SQUOVAL',
  OVAL = 'OVAL',
  ALMOND = 'ALMOND',
  COFFIN_BALLERINA = 'COFFIN_BALLERINA',
  STILETTO = 'STILETTO',
  LIPSTICK = 'LIPSTICK',
  DUCK_FLARE = 'DUCK_FLARE',
}

export enum NailLength {
  SHORT = 'SHORT',
  MEDIUM = 'MEDIUM',
  LONG = 'LONG',
  EXTRA_LONG = 'EXTRA_LONG',
}

export enum SalonPhase {
  PREP_AND_EXTENSION = 'PREP_AND_EXTENSION',
  BASE_AND_BUILDER = 'BASE_AND_BUILDER',
  COLOR_AND_EFFECTS = 'COLOR_AND_EFFECTS',
  NAIL_ART_AND_3D = 'NAIL_ART_AND_3D',
  TOP_COAT_AND_FINISH = 'TOP_COAT_AND_FINISH',
}

export enum NailTechniqueTag {
  SOLID_POLISH = 'SOLID_POLISH',
  FRENCH_TIP = 'FRENCH_TIP',
  OMBRE_AIRBRUSH = 'OMBRE_AIRBRUSH',
  CHROME_POWDER = 'CHROME_POWDER',
  MAGNETIC_CAT_EYE = 'MAGNETIC_CAT_EYE',
  BLOOMING_MARBLE = 'BLOOMING_MARBLE',
  SCULPTED_3D_GEL = 'SCULPTED_3D_GEL',
  RHINESTONE_CHARM = 'RHINESTONE_CHARM',
  HAND_PAINTED_LINE_ART = 'HAND_PAINTED_LINE_ART',
  ENCAPSULATED_GLITTER = 'ENCAPSULATED_GLITTER',
}

export enum FingerPosition {
  ALL_FINGERS = 'ALL_FINGERS',
  THUMB = 'THUMB',
  INDEX = 'INDEX',
  MIDDLE = 'MIDDLE',
  RING = 'RING',
  PINKY = 'PINKY',
}

export const NAIL_WORKFLOW_CONSTANTS = {
  MIN_IMAGE_DIMENSION_PX: 400,
  MAX_IMAGE_FILE_SIZE_BYTES: 15_728_640, // 15 MB
  MIN_STEPS_COUNT: 4,
  MAX_STEPS_COUNT: 25,
  FLASH_CURE_SECONDS: 15,
  CHROME_BASE_CURE_SECONDS: 25,
  STANDARD_GEL_CURE_SECONDS: 60,
  HEAVY_BUILDER_CURE_SECONDS: 90,
  DEFAULT_LAMP_WATTAGE: 48,
  MIN_DETECTION_CONFIDENCE: 0.65,
} as const;
```

#### TypeScript Interfaces

```typescript
export interface NailColorSwatch {
  name: string;
  hexCode: string;
  opacityType: 'OPAQUE' | 'JELLY_TRANSLUCENT' | 'MILKY_SHEER' | 'METALLIC_GLITTER';
  usageRole: string; // VD: "Nền chủ đạo", "Vẽ viền French", "Nhũ điểm xuyết"
}

export interface NailToolItem {
  id: string;
  name: string;
  category: 'BRUSH' | 'LAMP' | 'E_FILE_BIT' | 'MAGNET_SPONGE' | 'PREP_TOOL';
  specification: string; // VD: "Liner Brush 9mm", "UV/LED 48W"
  isEssential: boolean;
}

export interface NailMaterialItem {
  id: string;
  name: string;
  category: 'BASE_TOP' | 'GEL_POLISH' | 'EXTENSION_SYSTEM' | 'POWDER_EFFECT' | 'CHARM_RHINESTONE' | 'LIQUID_PREP';
  quantityOrCoatHint: string; // VD: "2 lớp mỏng", "1 hạt đậu"
  substituteOptions: string[]; // VD: ["Soft Gel Tip (Gel-X)", "Hard Builder Gel trên giấy form"]
}

export interface NailExecutionStep {
  stepNumber: number;
  phase: SalonPhase;
  title: string;
  targetFingers: FingerPosition[];
  instructionDetail: string;
  toolsUsedIds: string[];
  materialsUsedIds: string[];
  cureTimeSeconds: number; // 0 nếu không cần hơ đèn
  lampMode: 'NONE' | 'FLASH_CURE_15S' | 'FULL_CURE_60S' | 'LOW_HEAT_90S';
  proTipWarning: string;
  focusRegionNormalized?: { x: number; y: number; width: number; height: number }; // 0.0 -> 1.0 trên ảnh gốc để zoom trong Video Storyboard
}

export interface NailRecipeOutput {
  recipeId: string;
  title: string;
  createdAtIso: string;
  detectedShape: NailShape;
  detectedLength: NailLength;
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'MASTER';
  estimatedDurationMinutes: number;
  detectedTechniques: NailTechniqueTag[];
  colorPalette: NailColorSwatch[];
  toolsRequired: NailToolItem[];
  materialsRequired: NailMaterialItem[];
  steps: NailExecutionStep[];
  chemicalSafetyWarnings: string[];
}
```

#### Cấu trúc `settings.json` Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "NailsStepFromImageSettings",
  "type": "object",
  "required": ["visionAi", "salonPreferences", "storyboardPlayer"],
  "properties": {
    "visionAi": {
      "type": "object",
      "required": ["provider", "apiKey", "model", "endpointUrl", "timeoutMs"],
      "properties": {
        "provider": { "type": "string", "enum": ["gemini", "openai", "anthropic"] },
        "apiKey": { "type": "string", "description": "API Key cho Vision LLM, lưu trong settings.json, tuyệt đối không hardcode" },
        "model": { "type": "string", "default": "gemini-2.5-flash" },
        "endpointUrl": { "type": "string", "format": "uri" },
        "timeoutMs": { "type": "integer", "default": 20000 }
      }
    },
    "salonPreferences": {
      "type": "object",
      "required": ["preferredExtensionSystem", "lampWattage", "language"],
      "properties": {
        "preferredExtensionSystem": { "type": "string", "enum": ["GEL_X_SOFT_TIP", "ACRYLIC_POWDER", "HARD_BUILDER_GEL", "NATURAL_OVERLAY"], "default": "GEL_X_SOFT_TIP" },
        "lampWattage": { "type": "integer", "enum": [36, 48, 72], "default": 48 },
        "language": { "type": "string", "enum": ["vi", "en", "bilingual_vi_en"], "default": "bilingual_vi_en" }
      }
    },
    "storyboardPlayer": {
      "type": "object",
      "required": ["defaultSlideDurationSeconds", "enableVoiceReadout"],
      "properties": {
        "defaultSlideDurationSeconds": { "type": "integer", "minimum": 5, "maximum": 120, "default": 15 },
        "enableVoiceReadout": { "type": "boolean", "default": true }
      }
    }
  }
}
```

### 2.3. Kiến Trúc Service & Helper (Tuân thủ Rule 4 & SRP)

| Tên File | Loại | Hàm & Chữ ký (Method Signatures) | Mục đích (Docstring) |
| :--- | :--- | :--- | :--- |
| `src/services/NailImageAnalysisService.ts` | `*Service` | `analyzeNailInspoImage(imageInput: Blob \| string): Promise<NailRecipeOutput>` | Điều phối việc kiểm tra ảnh, gửi prompt chuyên ngành Nail tới Vision AI, hậu kiểm quy tắc hóa chất và trả về `NailRecipeOutput` hoàn chỉnh. |
| `src/services/helpers/NailImageAnalysisServiceHelper.ts` | `*ServiceHelper` | `validateNailImageInput(meta: { sizeBytes: number; widthPx: number; heightPx: number; mimeType: string }): { valid: boolean; errorCode?: string }`<br>`extractDominantHexSwatches(rgbSamples: Array<{ r: number; g: number; b: number }>): string[]`<br>`parseAndValidateAiRecipe(rawResponse: unknown): NailRecipeOutput` | Kiểm tra định dạng ảnh, chuẩn hóa mã HEX màu sơn và xác thực schema JSON trả về từ AI. |
| `src/services/NailWorkflowBuilderService.ts` | `*Service` | `enrichAndValidateWorkflow(rawRecipe: NailRecipeOutput): NailRecipeOutput`<br>`exportRecipeToMarkdown(recipe: NailRecipeOutput): string` | Bổ sung các bước bắt buộc nếu thiếu (Prep, Base, Top), chèn cảnh báo tương thích hóa chất (`chemicalSafetyWarnings`) và xuất tài liệu Markdown/PDF. |
| `src/services/helpers/NailWorkflowBuilderServiceHelper.ts` | `*ServiceHelper` | `verifySalonPhaseOrder(steps: NailExecutionStep[]): boolean`<br>`injectChemicalCompatibilityRules(techniques: NailTechniqueTag[], steps: NailExecutionStep[]): { updatedSteps: NailExecutionStep[]; warnings: string[] }`<br>`calculateTotalEstimatedMinutes(steps: NailExecutionStep[], difficulty: string): number` | Hàm thuần túy kiểm tra thứ tự 5 bước chuẩn salon và tự động gắn quy tắc kỹ thuật (VD: Chrome phải có `Non-Wipe Top Coat`, Charm nặng phải có `Rhinestone Glue`). |
| `src/services/StoryboardVideoService.ts` | `*Service` | `generateStoryboardTimeline(recipe: NailRecipeOutput): StoryboardTimeline`<br>`startHandsFreeTimer(step: NailExecutionStep, onTick: (remainingSec: number) => void): () => void` | Tạo kịch bản trình chiếu Video/Slideshow từng bước kèm tọa độ zoom vào ngón tay và bộ đếm thời gian hơ đèn rảnh tay cho Nail Tech. |

### 2.4. Ma Trận 5 Trạng Thái UX (`Ideal`, `Loading`, `Empty`, `Error`, `Partial/Overflow`)

| Trạng thái UX | Điều kiện kích hoạt | Hiển thị Giao diện (Visual Feedback) | Hành động khôi phục / Tương tác (CTA) |
| :--- | :--- | :--- | :--- |
| **1. Empty State** | Chưa tải ảnh Nail Inspo lên hệ thống. | Giao diện bàn làm việc Nail Studio với khu vực thả ảnh/dán ảnh (`Ctrl+V`) và 3 bộ móng mẫu thịnh hành (*Cat-Eye French Chrome*, *3D Korea Jelly Blush*, *Tortoiseshell Autumn*) để bấm xem thử ngay. | Nút `Tải ảnh mẫu của khách`, `Dán ảnh từ Clipboard`, hoặc chọn 1 trong 3 mẫu Demo. |
| **2. Loading State** | Đang phân tích cấu trúc lớp sơn, hiệu ứng bột và tách bước kỹ thuật. | Hiển thị tiến trình theo đúng ngôn ngữ ngành Nail: `"Đang nhận diện dáng móng & độ dài..."` -> `"Đang bóc tách lớp nền, hiệu ứng mắt mèo/tráng gương..."` -> `"Đang lập danh sách cọ & thời gian hơ đèn..."`. | Nút `Hủy phân tích`. |
| **3. Ideal State** | Nhận diện thành công đầy đủ Dáng móng, Công cụ, Nguyên liệu và các bước thực hiện. | Bố cục 2 cột: Cột trái là Ảnh gốc có đánh dấu vùng ngón tay + Bảng màu HEX + Checklist Công cụ & Nguyên liệu (có nút tick đã chuẩn bị xong). Cột phải là Timeline 5 giai đoạn chuẩn Salon kèm nút bật **Chế độ Video Storyboard & Đồng hồ hơ đèn 60s**. | Nút `Bật chế độ Rảnh tay (Video Storyboard)`, `Đổi hệ nối móng (Gel-X / Đắp bột / Builder Gel)`, `Xuất PDF/Markdown`. |
| **4. Error State** | Ảnh tải lên không phải là móng tay (VD: ảnh phong cảnh, ảnh hóa đơn), ảnh quá mờ/tối, hoặc lỗi kết nối AI. | Thông báo rõ ràng: *"Không nhận diện được bộ móng rõ nét trong ảnh (Độ tin cậy < 65%). Vui lòng chọn ảnh chụp rõ bàn tay hoặc móng mẫu."* | Nút `Chọn ảnh khác` hoặc `Cắt (Crop) sát vào vùng bàn tay rồi thử lại`. |
| **5. Partial / Overflow State** | Ảnh bị фильтр màu (filter Instagram/TikTok) quá nặng làm lệch tông màu thật, hoặc bộ móng có quá nhiều charm che khuất lớp nền bên dưới. | Hiển thị công thức kèm Banner cảnh báo màu vàng: *"Ảnh gốc có hiệu ứng ánh sáng/filter mạnh — Mã màu nền đề xuất có thể lệch ±1 tông. Hãy đối chiếu que sơn mẫu (Swatch Stick) dưới ánh đèn bàn."* | Cho phép Nail Tech bấm chọn lại tông màu nền hoặc bật/tắt bớt kỹ thuật phụ. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

| Mã Rủi Ro | Mô tả Lỗ hổng / Rủi ro Thực tế | Mức độ nghiêm trọng | Chốt chặn Kỹ thuật Bắt buộc (Technical Guardrail) |
| :--- | :--- | :--- | :--- |
| `RISK-001` | **Đảo lộn thứ tự lớp hóa học làm hỏng bộ móng (`Wrong Layering / Encapsulation Order`):** Nếu AI hướng dẫn đánh bột tráng gương (Chrome) trực tiếp lên lớp sơn màu còn dính (tacky layer) mà không qua lớp `Non-Wipe Top Coat`, bột sẽ bị bết thành cục thay vì bóng gương; hoặc vẽ gel nổi 3D xong lại phủ Top Coat tràn lên làm mất khối 3D. | **CRITICAL (Blocker)** | **Rule Engine Hậu kiểm tại `NailWorkflowBuilderServiceHelper.injectChemicalCompatibilityRules()`:** Bắt buộc kiểm tra: (1) Nếu có `CHROME_POWDER` -> phải có bước sơn `Non-Wipe Gel / Chrome Base` hơ `15-30s` trước khi chà bột, và phải dũa nhẹ đầu móng + khóa viền (`Cap Free Edge`) trước khi phủ Top. (2) Nếu có `MAGNETIC_CAT_EYE` -> bắt buộc thao tác hơ nam châm **TRƯỚC** khi đưa tay vào đèn UV/LED (vì hơ đèn xong hạt từ tính đã đông cứng). |
| `RISK-002` | **Sai lệch màu sắc do ánh sáng Studio hoặc Filter mạng xã hội (`Color Cast Illusion`):** Hình Nail Inspo trên Pinterest/Instagram thường chỉnh màu ấm hoặc chụp dưới đèn vàng, khiến màu *Nude Hồng Lạnh* nhìn thành *Cam Đào*, làm thợ lấy nhầm chai sơn. | **HIGH** | **Gợi ý Dải màu Kép & Độ trong suốt (`OpacityType`):** Không chỉ xuất 1 mã HEX cứng nhắc mà bắt buộc phân loại độ trong (`JELLY_TRANSLUCENT`, `MILKY_SHEER`, `OPAQUE`) và nhắc bước *"Thử 1 lớp lên que Swatch dưới đèn trắng trước khi sơn lên tay khách"*. |
| `RISK-003` | **Nguy cơ Dị ứng Tiếp xúc (`HEMA / Uncured Gel Allergy`) & Bong tróc do thiếu thời gian hơ đèn:** Nếu tài liệu hướng dẫn thiếu thời gian hơ đèn hoặc hướng dẫn đắp gel dày trong 1 lần hơ, gel bên trong sẽ sống (uncured), gây nóng rát móng và viêm da tiếp xúc cho khách. | **HIGH** | **Chốt chặn Thời gian Hơ đèn (`cureTimeSeconds`) & Độ dày lớp sơn:** Mọi bước thuộc pha `BASE_AND_BUILDER`, `COLOR_AND_EFFECTS`, `TOP_COAT_AND_FINISH` có dùng gel đều bắt buộc có `cureTimeSeconds >= 15` (Flash cure) hoặc `60` (Full cure). Với tông màu đậm (Đen, Đỏ đậm, Trắng đục), tự động chèn cảnh báo *"Sơn 2 lớp thật mỏng thay vì 1 lớp dày để tia UV xuyên qua hết"*. |
| `RISK-004` | **Tay thợ dính bụi mài và sơn gel không thể vuốt màn hình điện thoại liên tục:** Khi đang làm móng cho khách, tay Nail Tech đeo găng dính đầy cồn, bụi phao và gel. Nếu bắt thợ phải cuộn đọc văn bản dài chữ nhỏ thì công cụ sẽ bị bỏ xó tại salon. | **MEDIUM** | **Thiết kế Chế độ `StoryboardVideoService` (Hands-Free Guided Mode):** Giao diện chữ lớn, chia từng thẻ bước rõ ràng, tích hợp bộ đếm thời gian tự động chuyển bước hoặc điều khiển bằng phím Space / nút bấm lớn để thợ chạm bằng khớp ngón tay hoặc cùi chỏ. |

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1. Kịch bản Kiểm thử 3 Tầng (`Given / When / Then`)

#### Tầng 1: P0 Happy Paths (Người dùng hay xài nhất)
- **TC-T1-001: Phân tích mẫu móng phức tạp (*Almond Cat-Eye + Silver Chrome French + 3D Gel*) ra đầy đủ Công cụ, Nguyên liệu và Step-by-Step**
  - **Given:** Hình ảnh mẫu móng dáng `ALMOND`, có hiệu ứng mắt mèo (`MAGNETIC_CAT_EYE`) và vẽ viền tráng gương bạc (`CHROME_POWDER`).
  - **When:** Gọi `analyzeNailInspoImage()` và `enrichAndValidateWorkflow()`.
  - **Then:** Kết quả trả về danh sách `toolsRequired` có `Cat-Eye Magnet`, `Liner Brush`, `Silicon Rubbing Tool`; `materialsRequired` có `Magnetic Cat-Eye Gel`, `Non-Wipe Top Coat`, `Silver Chrome Powder`; và mảng `steps` đi qua đủ 5 giai đoạn `SalonPhase` theo đúng thứ tự.
- **TC-T1-002: Tự động chèn quy tắc kỹ thuật bắt buộc cho hiệu ứng Mắt mèo (`MAGNETIC_CAT_EYE`) và Tráng gương (`CHROME_POWDER`)**
  - **Given:** Một recipe có `detectedTechniques` chứa `MAGNETIC_CAT_EYE` và `CHROME_POWDER`.
  - **When:** Chạy `injectChemicalCompatibilityRules()`.
  - **Then:** Bước mắt mèo có hướng dẫn dùng nam châm đẩy sáng **trước** khi hơ đèn; bước tráng gương có cảnh báo bắt buộc phủ `Non-Wipe Top Coat` hơ `25s` trước khi chà bột.
- **TC-T1-003: Xuất tài liệu Step-by-Step sang Markdown và tạo Timeline Video Storyboard**
  - **Given:** Một đối tượng `NailRecipeOutput` hợp lệ gồm 8 bước thực hiện.
  - **When:** Gọi `exportRecipeToMarkdown()` và `generateStoryboardTimeline()`.
  - **Then:** Chuỗi Markdown chứa đầy đủ bảng Tools, Materials, Bảng màu HEX và 8 bước kèm thời gian hơ đèn; Timeline Storyboard có đủ 8 slide tương ứng.

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-T2-001: Từ chối file ảnh không hợp lệ (sai định dạng, quá lớn `> 15MB`, hoặc độ phân giải `< 400x400px`)**
  - **Given:** File tải lên có kích thước `200x200 px` hoặc dung lượng `20 MB`.
  - **When:** Gọi `validateNailImageInput()`.
  - **Then:** Trả về `{ valid: false, errorCode: 'ERR_IMAGE_RESOLUTION_TOO_LOW' }` hoặc `'ERR_IMAGE_FILE_TOO_LARGE'`.
- **TC-T2-002: Phát hiện thứ tự bước thực hiện bị đảo ngược (`TOP_COAT` nằm trước `PREP_AND_EXTENSION`)**
  - **Given:** Dữ liệu JSON trả về từ AI bị lỗi thứ tự: bước 1 là `TOP_COAT_AND_FINISH`, bước 2 là `PREP_AND_EXTENSION`.
  - **When:** Gọi `verifySalonPhaseOrder()` và `enrichAndValidateWorkflow()`.
  - **Then:** Hệ thống phát hiện sai thứ tự (`false`) và tự động sắp xếp lại các bước theo đúng trình tự 5 giai đoạn chuẩn Salon.
- **TC-T2-003: Xử lý lỗi khi Vision AI trả về JSON thiếu trường hoặc đứt kết nối mạng**
  - **Given:** AI trả về chuỗi JSON bị cắt cụt hoặc lỗi HTTP `500`.
  - **When:** Gọi `analyzeNailInspoImage()`.
  - **Then:** Ném lỗi có cấu trúc `ERR_AI_PARSING_FAILED` kèm thông báo hướng dẫn thử lại, không gây crash ứng dụng.

#### Tầng 3: Boundary & Rare Edge Cases (`0`, `-1`, `MAX`, `Empty`, `Duplicate`, `Concurrent`)
- **TC-T3-001: Giá trị biên `0` và `-1` cho thời gian hơ đèn (`cureTimeSeconds`) trên bước sơn Gel**
  - **Given:** Một bước thuộc pha `BASE_AND_BUILDER` hoặc `TOP_COAT_AND_FINISH` có `cureTimeSeconds = 0` hoặc `-30`.
  - **When:** Chạy qua `enrichAndValidateWorkflow()`.
  - **Then:** Hệ thống tự động chuẩn hóa `cureTimeSeconds` về mức an toàn chuẩn `STANDARD_GEL_CURE_SECONDS = 60` giây.
- **TC-T3-002: Danh sách Công cụ/Nguyên liệu bị trùng lặp (`Duplicate Items`)**
  - **Given:** AI liệt kê trùng 2 lần công cụ `"UV/LED Lamp 48W"` trong mảng `toolsRequired`.
  - **When:** Chuẩn hóa qua `parseAndValidateAiRecipe()`.
  - **Then:** Danh sách `toolsRequired` được khử trùng lặp (deduplicate), chỉ giữ lại 1 bản ghi duy nhất.
- **TC-T3-003: Bộ móng tối giản nhất (`MIN_STEPS_COUNT = 4`) vs Bộ móng đính đá/vẽ 3D phức tạp cực đại (`MAX_STEPS_COUNT = 25`)**
  - **Given:** Hai mẫu móng ở hai cực độ khó (1 mẫu sơn trơn cơ bản 4 bước và 1 mẫu nghệ thuật 10 ngón khác nhau 25 bước).
  - **When:** Tính tổng thời gian `calculateTotalEstimatedMinutes()`.
  - **Then:** Thời gian dự kiến phản ánh đúng thực tế salon (từ `35 phút` cho bộ cơ bản tới `120–180 phút` cho bộ Master), không vượt ngưỡng vô lý.

### 4.2. Quy trình 5 Bước Kiểm Chứng Bề Mặt Thật cho QA Reviewer

1. **Step 1 — Launch:** Khởi chạy module xử lý phân tích mẫu nail với cấu hình từ `settings.json`.
2. **Step 2 — Doctor:** Kiểm tra schema `settings.json`, xác nhận toàn bộ enum `NailShape`, `SalonPhase`, `NailTechniqueTag` và hằng số thời gian hơ đèn hoạt động đúng.
3. **Step 3 — Drive:** Chạy luồng phân tích cho một mẫu Nail Inspo phức tạp (gồm *Gel-X Almond + Cat-Eye + Chrome French + Charm 3D*), kích hoạt bộ kiểm tra tương thích hóa chất và xuất tài liệu Markdown + Storyboard Timeline.
4. **Step 4 — Evidence:** Lưu lại log output của Recipe JSON, bản xuất Markdown Step-by-Step và kết quả kiểm thử tự động làm bằng chứng nghiệm thu.
5. **Step 5 — Cleanup:** Dọn dẹp các timer/process tạm sau khi chạy xong.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role phụ trách | File mục tiêu | Mô tả chi tiết hàm cần viết | Phụ thuộc | Lệnh Verify + Tiêu chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `src/constants/nailConstants.ts` & `settings.json` | Khai báo toàn bộ enums (`NailShape`, `NailLength`, `SalonPhase`, `NailTechniqueTag`, `FingerPosition`), `NAIL_WORKFLOW_CONSTANTS` và file `settings.json`. | Không (None) | `npx tsc --noEmit` pass 100%, không có magic number/string. |
| `TASK-002` | **Developer** | `src/types/nailRecipeTypes.ts` | Định nghĩa các interfaces: `NailColorSwatch`, `NailToolItem`, `NailMaterialItem`, `NailExecutionStep`, `NailRecipeOutput`, `StoryboardTimeline`. | **Hard:** `TASK-001` | `npx tsc --noEmit` không có lỗi kiểu dữ liệu. |
| `TASK-003` | **Developer** | `src/services/helpers/NailImageAnalysisServiceHelper.ts` | Viết `validateNailImageInput()`, `extractDominantHexSwatches()` và `parseAndValidateAiRecipe()` (bao gồm khử trùng lặp công cụ/nguyên liệu). | **Hard:** `TASK-002` | Chặn đúng ảnh lỗi/quá nhỏ và chuẩn hóa đúng mã HEX `#RRGGBB`. |
| `TASK-004` | **Developer** | `src/services/helpers/NailWorkflowBuilderServiceHelper.ts` | Viết `verifySalonPhaseOrder()`, `injectChemicalCompatibilityRules()` (chốt chặn Chrome, Cat-Eye, 3D Charm, thời gian hơ đèn) và `calculateTotalEstimatedMinutes()`. | **Hard:** `TASK-002` | Tự động phát hiện và bổ sung đúng cảnh báo hóa chất cho Chrome & Cat-Eye. |
| `TASK-005` | **Developer** | `src/services/NailWorkflowBuilderService.ts` | Viết `enrichAndValidateWorkflow()` (sắp xếp lại thứ tự pha nếu sai, chuẩn hóa `cureTimeSeconds`) và `exportRecipeToMarkdown()`. | **Hard:** `TASK-004` | Bản xuất Markdown hiển thị đầy đủ Checklist Công cụ, Nguyên liệu và các bước thực hiện. |
| `TASK-006` | **Developer** | `src/services/NailImageAnalysisService.ts` | Viết `analyzeNailInspoImage()` kết nối cấu hình Vision AI từ `settings.json` và nối vào pipeline `NailWorkflowBuilderService`. | **Hard:** `TASK-003`, `TASK-005` | Xử lý trọn vẹn luồng từ ảnh đầu vào tới `NailRecipeOutput`. |
| `TASK-007` | **Developer** | `src/services/StoryboardVideoService.ts` | Viết `generateStoryboardTimeline()` và `startHandsFreeTimer()` phục vụ chế độ trình chiếu Video/Slideshow rảnh tay tại bàn làm móng. | **Hard:** `TASK-002` | Tạo đúng danh sách slide có tọa độ vùng zoom và đồng hồ đếm ngược. |
| `TASK-008` | **Test Engineer** | `tests/nailAnalysisHelper.test.ts` | Viết Unit Test 3 tầng cho `NailImageAnalysisServiceHelper` (kiểm tra kích thước ảnh, dung lượng file, chuẩn hóa HEX, khử trùng lặp công cụ). | **Hard:** `TASK-003` | `npm test -- tests/nailAnalysisHelper.test.ts` pass 100%. |
| `TASK-009` | **Test Engineer** | `tests/nailWorkflowBuilder.test.ts` | Viết Unit Test 3 tầng cho `NailWorkflowBuilderService` & Helper (thứ tự 5 pha Salon, chốt chặn Chrome/Cat-Eye, xử lý `cureTimeSeconds <= 0`, xuất Markdown). | **Hard:** `TASK-005` | `npm test -- tests/nailWorkflowBuilder.test.ts` pass 100%, branch coverage `>= 90%`. |
| `TASK-010` | **Test Engineer** | `tests/storyboardAndE2E.test.ts` | Viết test tích hợp cho luồng phân tích mẫu Nail Inspo -> xuất tài liệu Step-by-Step -> tạo Video Storyboard Timeline. | **Hard:** `TASK-006`, `TASK-007` | Toàn bộ test suite chạy xanh 100%, lưu log bằng chứng QA. |
