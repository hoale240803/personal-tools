# ĐẶC TẢ KỸ THUẬT & NGHIỆP VỤ: 3D ESTIMATE FOR CONSTRUCTION (`3d-estimate-for-construction`)

> **Phiên bản:** 1.0.0 (Dev-Ready & Test-Ready)
> **Đội ngũ phụ trách:** AISE Squad 3 — BA Team (`intake`, `ba`, `requirement_challenger`) & PM Team (`orchestrator`, `estimator_cost_controller`)
> **Nguồn yêu cầu gốc:** `idea/3d-estimate-for-construction/requirement.md`

---

## PHẦN 1 — INTAKE & PHÂN LOẠI (`intake`)

### 1.1. Bảng Phân Tách Dữ Kiện (`Stated Facts`, `Explicit Assumptions`, `Clarification Questions`)

| Phân loại | Mã định danh | Nội dung chi tiết | Nguồn / Lý do kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-001` | Người dùng (Contractor / Thợ thầu xây dựng) gặp khó khăn khi ước lượng vật liệu lúc đi mua và rất khó ước tính chính xác bằng mắt thường. | Trích nguyên văn dòng 1 file `requirement.md` |
| **Stated Fact** | `SF-002` | Phần mềm cần có khả năng đọc **bản vẽ kỹ thuật (2D Blueprint/CAD image)** và **hình ảnh thực tế (Site Photo)**. | Trích nguyên văn dòng 1 file `requirement.md` ("đọc bản vẽ, hình ảnh thực tế") |
| **Stated Fact** | `SF-003` | Hệ thống phải tính toán và ước lượng diện tích/kích thước vật liệu chính xác tới đơn vị **`mm²`** (Hệ Mét) và **`inches` / `sq.in`** (Hệ Imperial). | Trích nguyên văn dòng 1 file `requirement.md` ("ước tính chính xác tới từng mm2/ inches") |
| **Stated Fact** | `SF-004` | Mục tiêu cốt lõi là tiết kiệm thời gian ước tính và loại bỏ sai số cảm tính của Contractor khi mua vật tư. | Trích nguyên văn dòng 1 file `requirement.md` |
| **Explicit Assumption** | `EA-001` | **Bắt buộc có Vật chuẩn tham chiếu (Reference Object / Scale Bar):** Vì ảnh chụp 2D thông thường không chứa thông tin chiều sâu (depth) hoặc tỷ lệ tuyệt đối (`px-to-mm`), hệ thống giả định người dùng phải: (a) Kẻ 1 đoạn thẳng trên thanh tỷ lệ (Scale Bar) của bản vẽ và nhập độ dài thật, hoặc (b) Đặt một vật chuẩn kích thước cố định (Thẻ chuẩn ISO/ID-1 `85.60 × 53.98 mm`, tờ tiền USD, thước dây, hoặc маркеr ArUco) trên cùng mặt phẳng với khu vực cần đo trong ảnh thực tế. | Giả định kỹ thuật bắt buộc để giải bài toán Homography & Pixel-to-Metric Calibration, giúp Dev không bị block. |
| **Explicit Assumption** | `EA-002` | **Hiệu chỉnh phối cảnh mặt phẳng (Planar Homography Rectification):** Đối với ảnh chụp nghiêng thực tế, người dùng hoặc AI sẽ xác định 4 góc của mặt phẳng tham chiếu (tường, sàn nhà, mặt bàn) để biến đổi phối cảnh (Perspective Warp) về mặt phẳng trực diện trước khi tính diện tích đa giác (Shoelace Formula). | Giả định toán học hình học phẳng (OpenCV/Canvas 2D Matrix) để hạn chế sai số góc chụp. |
| **Explicit Assumption** | `EA-003` | **Hệ số hao hụt vật tư (Material Wastage Factor):** Khi quy đổi từ diện tích hình học (`mm²` / `sq.in`) sang số lượng vật tư cần mua (gạch ốp lát, gỗ sàn, sơn, thạch cao), hệ thống áp dụng hệ số hao hụt mặc định cấu hình được trong `settings.json` (ví dụ: `10%` cho cắt gạch thẳng, `15%` cho lát xương cá). | Chuẩn nghiệp vụ xây dựng để Contractor đi mua không bị thiếu hụt vật tư. |
| **Explicit Assumption** | `EA-004` | **Định dạng đầu vào:** Hỗ trợ ảnh tĩnh `.png`, `.jpg`, `.jpeg`, `.webp` và trang bản vẽ xuất từ `.pdf` (render qua PDF.js ở DPI tối thiểu `300 DPI`), dung lượng tối đa `25 MB`/file. | Chuẩn hóa giới hạn I/O cho ứng dụng Web/Desktop. |

### 1.2. Danh sách Câu hỏi Làm rõ (`Clarification Questions`)

1. **CQ-001: Phương thức thu nhận chiều sâu 3D trên thiết bị của Contractor là gì?**
   - **Option A (Khuyến nghị cho MVP):** Ứng dụng Web/Mobile 2D-to-3D Planar sử dụng ảnh chụp tiêu chuẩn kết hợp vật chuẩn tham chiếu (`Reference Object` / `Scale Bar`) + hiệu chỉnh phối cảnh 4 điểm (Homography) + AI Vision nhận diện vùng vật liệu. Chạy được trên mọi điện thoại và máy tính.
   - **Option B:** Ứng dụng iOS Native bắt buộc sử dụng cảm biến LiDAR (ARKit RoomPlan) trên iPhone Pro / iPad Pro để quét đám mây điểm (Point Cloud `.obj`/`.usdz`).
   - **Option C:** Tải lên trực tiếp file mô hình 3D BIM/CAD (`.ifc`, `.dwg`, `.rvt`) để bóc tách khối lượng (Quantity Takeoff).
   - *Quyết định mặc định cho bản Spec này:* Chọn **Option A** để triển khai ngay trên nền tảng Web/Cross-platform, đồng thời thiết kế kiến trúc mở rộng cho phép import thông số chiều cao (`extrusionHeightMm`) để dựng khối 3D trực quan.

2. **CQ-002: Danh mục vật liệu ưu tiên cần quy đổi ra đơn vị mua hàng (SKU/Thùng/Viên) trong giai đoạn 1?**
   - **Option A (Khuyến nghị):** Gạch ốp lát (Tiles), Sàn gỗ/nhựa (Flooring planks), Sơn nước (Paint gallons/liters), Tấm thạch cao/Gỗ ván ép (Drywall/Plywood sheets).
   - **Option B:** Cốt thép, bê tông tươi, gạch xây thô (đòi hỏi kết cấu ẩn bên trong tường).
   - **Option C:** Chỉ xuất diện tích bề mặt thuần túy (`mm²`, `m²`, `sq.in`, `sq.ft`) mà không quy đổi sang số lượng đóng gói.
   - *Quyết định mặc định cho bản Spec này:* Hỗ trợ đầy đủ xuất diện tích chuẩn xác (`mm²`, `inches`) kèm bộ quy đổi cho 4 nhóm vật tư bề mặt ở **Option A**.

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1. Bảng Yêu Cầu Nghiệp Vụ (`REQ-001` .. `REQ-010`)

| Mã REQ | Tên Yêu Cầu | Mô tả nghiệp vụ chi tiết | Truy vết nguồn | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | Tải lên & Tiền xử lý Bản vẽ / Ảnh thực tế | Cho phép người dùng tải lên ảnh bản vẽ 2D hoặc ảnh chụp công trường (`.jpg`, `.png`, `.webp`, `.pdf`), kiểm tra độ phân giải tối thiểu và hiển thị trên vùng làm việc tương tác (Interactive Canvas). | `SF-002`, `EA-004` | **P0 Must-Have** |
| `REQ-002` | Hiệu chuẩn tỷ lệ (`Scale Calibration`) | Cung cấp công cụ kẻ đoạn thẳng chuẩn (2 điểm) hoặc khung chữ nhật chuẩn (4 điểm cho vật chuẩn như thẻ ISO/thước) để tính hệ số tỷ lệ `pixelsPerMillimeter` và ma trận biến đổi phối cảnh `HomographyMatrix`. | `SF-003`, `EA-001`, `EA-002` | **P0 Must-Have** |
| `REQ-003` | Khoanh vùng Đa giác & Bóc tách AI (`Polygon & AI Segmentation`) | Cho phép vẽ đa giác (Polygon) thủ công hoặc gọi AI Vision API tự động nhận diện đường bao bề mặt (tường, sàn, cửa sổ cần trừ hao) và trả về danh sách tọa độ đỉnh `[x, y]`. | `SF-002`, `SF-004` | **P0 Must-Have** |
| `REQ-004` | Tính toán Diện tích & Chu vi Đa đơn vị (`mm²` / `inches`) | Áp dụng công thức Shoelace trên tọa độ đã khử méo phối cảnh để tính chính xác diện tích thực tế theo `mm²`, `cm²`, `m²` và quy đổi chuẩn xác sang `sq.in` (`in²`), `sq.ft` (`ft²`) cùng chiều dài cạnh theo `mm` và `inches`. | `SF-003` | **P0 Must-Have** |
| `REQ-005` | Trừ lỗ mở (`Cutout / Void Deduction`) | Cho phép đánh dấu các vùng rỗng bên trong bề mặt (cửa sổ, cửa đi, ổ điện, cột trụ) để trừ diện tích khỏi tổng diện tích bề mặt cần mua vật liệu. | `SF-001`, `SF-004` | **P0 Must-Have** |
| `REQ-006` | Quy đổi Khối lượng Vật tư & Hao hụt (`Material Takeoff`) | Dựa trên diện tích thực (`netAreaMm2`), kích thước đơn vị vật tư (VD: viên gạch `600x600mm`) và hệ số hao hụt (`wastagePercent`), tính ra tổng số viên/tấm/thùng cần mua (làm tròn lên `Math.ceil`). | `SF-001`, `SF-004`, `EA-003` | **P0 Must-Have** |
| `REQ-007` | Cảnh báo Độ lệch Phối cảnh & Độ tin cậy (`Confidence & Tilt Guard`) | Tự động tính góc nghiêng mặt phẳng so với camera; nếu góc nghiêng vượt ngưỡng an toàn (VD: `> 45°`) hoặc ảnh quá mờ, hiển thị cảnh báo sai số ước tính (`±%`) và yêu cầu chụp lại hoặc dùng hiệu chỉnh 4 điểm. | `SF-003`, `EA-002` | **P1 Should-Have** |
| `REQ-008` | Dựng mô hình Khối 3D Trực quan (`3D Extrusion Preview`) | Dựng cảnh 3D (Three.js/WebGL) từ mặt bằng 2D đã đo kết hợp thông số chiều cao trần/độ dày lớp vật liệu (`thicknessMm`), giúp Contractor quan sát trực quan khối tích (`mm³` / `cubic inches`). | `SF-002`, `CQ-001` | **P1 Should-Have** |
| `REQ-009` | Xuất Báo cáo Mua hàng (`Purchase Order / BOM Export`) | Xuất bảng dự toán vật tư (Bill of Materials) ra định dạng JSON/CSV/PDF gồm ảnh chụp đã đánh dấu kích thước, diện tích `mm²`/`sq.in`, số lượng vật tư cần mua và dự kiến chi phí. | `SF-001`, `SF-004` | **P1 Should-Have** |
| `REQ-010` | Lưu trữ Lịch sử Dự án & Cấu hình Vật tư Mẫu | Lưu danh sách các phép đo theo từng công trình vào LocalStorage/IndexedDB để Contractor tra cứu lại ngay tại cửa hàng vật liệu xây dựng. | `SF-001`, `SF-004` | **P2 Nice-to-Have** |

### 2.2. Data Structures, Constants & `settings.json` Schema

#### Bảng `CONSTANTS` & `ENUMS` (Tuân thủ nghiêm ngặt luật No Magic Numbers/Strings)

```typescript
export enum MeasurementUnit {
  MILLIMETER = 'mm',
  CENTIMETER = 'cm',
  METER = 'm',
  INCH = 'in',
  FOOT = 'ft',
}

export enum AreaUnit {
  SQUARE_MILLIMETER = 'mm2',
  SQUARE_METER = 'm2',
  SQUARE_INCH = 'sq_in',
  SQUARE_FOOT = 'sq_ft',
}

export enum SourceImageType {
  BLUEPRINT_2D = 'BLUEPRINT_2D',
  SITE_PHOTO_3D = 'SITE_PHOTO_3D',
}

export enum ReferenceObjectType {
  CUSTOM_SCALE_BAR = 'CUSTOM_SCALE_BAR',
  ISO_ID1_CARD = 'ISO_ID1_CARD',       // 85.60 mm x 53.98 mm
  US_LETTER_PAPER = 'US_LETTER_PAPER', // 215.90 mm x 279.40 mm
  A4_PAPER = 'A4_PAPER',               // 210.00 mm x 297.00 mm
  ARUCO_MARKER_100MM = 'ARUCO_MARKER_100MM', // 100.00 mm x 100.00 mm
}

export enum PolygonRole {
  TARGET_SURFACE = 'TARGET_SURFACE',
  VOID_CUTOUT = 'VOID_CUTOUT',
}

export const UNIT_CONVERSION_CONSTANTS = {
  MM_PER_INCH: 25.4,
  MM2_PER_SQ_INCH: 645.16, // 25.4 * 25.4
  MM_PER_METER: 1000,
  MM2_PER_SQ_METER: 1_000_000,
  INCHES_PER_FOOT: 12,
  SQ_INCHES_PER_SQ_FOOT: 144,
} as const;

export const CALIBRATION_LIMITS = {
  MIN_IMAGE_WIDTH_PX: 640,
  MIN_IMAGE_HEIGHT_PX: 480,
  MAX_FILE_SIZE_BYTES: 26_214_400, // 25 MB
  MIN_REFERENCE_LENGTH_PX: 20,     // Đoạn chuẩn phải dài ít nhất 20px để tránh sai số chia 0
  MIN_REFERENCE_REAL_MM: 1.0,
  MAX_REFERENCE_REAL_MM: 100_000.0, // Tối đa 100m
  MAX_SAFE_CAMERA_TILT_DEGREES: 45.0,
  MIN_POLYGON_VERTICES: 3,
  MAX_POLYGON_VERTICES: 500,
  DEFAULT_WASTAGE_PERCENT: 10.0,
  MAX_WASTAGE_PERCENT: 50.0,
} as const;

export const REFERENCE_OBJECT_DIMENSIONS_MM: Record<
  Exclude<ReferenceObjectType, ReferenceObjectType.CUSTOM_SCALE_BAR>,
  { widthMm: number; heightMm: number }
> = {
  [ReferenceObjectType.ISO_ID1_CARD]: { widthMm: 85.6, heightMm: 53.98 },
  [ReferenceObjectType.US_LETTER_PAPER]: { widthMm: 215.9, heightMm: 279.4 },
  [ReferenceObjectType.A4_PAPER]: { widthMm: 210.0, heightMm: 297.0 },
  [ReferenceObjectType.ARUCO_MARKER_100MM]: { widthMm: 100.0, heightMm: 100.0 },
} as const;
```

#### TypeScript Interfaces

```typescript
export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D extends Point2D {
  z: number;
}

export interface HomographyMatrix3x3 {
  values: [
    number, number, number,
    number, number, number,
    number, number, number
  ];
}

export interface ScaleCalibrationData {
  referenceType: ReferenceObjectType;
  pixelPoints: Point2D[]; // 2 điểm cho Scale Bar hoặc 4 điểm cho Planar Reference
  realWidthMm: number;
  realHeightMm?: number;
  pixelsPerMm: number;
  homographyMatrix: HomographyMatrix3x3 | null;
  estimatedTiltDegrees: number;
  confidenceScore: number; // 0.0 -> 1.0
}

export interface SurfacePolygon {
  id: string;
  label: string;
  role: PolygonRole;
  verticesPx: Point2D[];
  rectifiedVerticesMm: Point2D[];
  extrusionDepthMm: number;
}

export interface AreaMeasurementResult {
  grossAreaMm2: number;
  cutoutAreaMm2: number;
  netAreaMm2: number;
  netAreaSqInches: number;
  netAreaM2: number;
  netAreaSqFeet: number;
  perimeterMm: number;
  perimeterInches: number;
  volumeMm3: number;
  volumeCubicInches: number;
  estimatedMarginOfErrorPercent: number;
}

export interface MaterialPreset {
  skuId: string;
  name: string;
  category: 'TILE' | 'FLOORING' | 'PAINT' | 'SHEET_PANEL';
  unitWidthMm: number;
  unitLengthMm: number;
  unitThicknessMm: number;
  coveragePerUnitMm2: number;
  unitsPerBox: number;
  defaultWastagePercent: number;
  unitPriceCurrency: number;
}

export interface MaterialTakeoffEstimate {
  material: MaterialPreset;
  measurement: AreaMeasurementResult;
  appliedWastagePercent: number;
  requiredAreaWithWastageMm2: number;
  requiredAreaWithWastageSqInches: number;
  totalUnitsNeeded: number;
  totalBoxesNeeded: number;
  estimatedTotalCost: number;
}
```

#### Cấu trúc `settings.json` Schema (Lưu toàn bộ Credentials & Cấu hình)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Construction3DEstimateSettings",
  "type": "object",
  "required": ["aiVisionProvider", "measurementDefaults", "storage"],
  "properties": {
    "aiVisionProvider": {
      "type": "object",
      "required": ["providerName", "apiKey", "endpointUrl", "modelName", "timeoutMs"],
      "properties": {
        "providerName": { "type": "string", "enum": ["gemini-vision", "openai-vision", "local-onnx"] },
        "apiKey": { "type": "string", "description": "API Key lấy từ biến môi trường hoặc vault, không hardcode trong source code" },
        "endpointUrl": { "type": "string", "format": "uri" },
        "modelName": { "type": "string", "default": "gemini-2.5-flash" },
        "timeoutMs": { "type": "integer", "minimum": 1000, "maximum": 60000, "default": 15000 }
      }
    },
    "measurementDefaults": {
      "type": "object",
      "required": ["primaryLinearUnit", "primaryAreaUnit", "defaultWastagePercent", "maxAllowedTiltDegrees"],
      "properties": {
        "primaryLinearUnit": { "type": "string", "enum": ["mm", "in"], "default": "mm" },
        "primaryAreaUnit": { "type": "string", "enum": ["mm2", "sq_in"], "default": "mm2" },
        "defaultWastagePercent": { "type": "number", "minimum": 0, "maximum": 50, "default": 10.0 },
        "maxAllowedTiltDegrees": { "type": "number", "minimum": 5, "maximum": 60, "default": 45.0 }
      }
    },
    "storage": {
      "type": "object",
      "required": ["indexedDbName", "maxSavedProjects"],
      "properties": {
        "indexedDbName": { "type": "string", "default": "aise_construction_3d_estimator_db" },
        "maxSavedProjects": { "type": "integer", "default": 100 }
      }
    }
  }
}
```

### 2.3. Kiến Trúc Service & Helper (Tuân thủ Rule 4 & Single Responsibility Principle)

| Tên File | Loại | Hàm & Chữ ký (Method Signatures) | Mục đích (Docstring) |
| :--- | :--- | :--- | :--- |
| `src/services/CalibrationService.ts` | `*Service` | `calibrateFromLine(p1: Point2D, p2: Point2D, realLengthMm: number): ScaleCalibrationData`<br>`calibrateFromPlanarQuad(quadPx: [Point2D, Point2D, Point2D, Point2D], refType: ReferenceObjectType, customSizeMm?: { widthMm: number; heightMm: number }): ScaleCalibrationData` | Điều phối luồng hiệu chuẩn tỷ lệ từ thanh tỷ lệ 2 điểm (Blueprint) hoặc mặt phẳng 4 điểm (Ảnh thực tế), kiểm tra ngưỡng an toàn và sinh dữ liệu `ScaleCalibrationData`. |
| `src/services/helpers/CalibrationServiceHelper.ts` | `*ServiceHelper` | `calculateEuclideanDistancePx(p1: Point2D, p2: Point2D): number`<br>`computeHomographyMatrix(srcQuad: [Point2D, Point2D, Point2D, Point2D], dstWidthMm: number, dstHeightMm: number): HomographyMatrix3x3`<br>`estimateCameraTiltDegrees(quadPx: [Point2D, Point2D, Point2D, Point2D], realAspectRatio: number): number`<br>`applyHomographyToPoint(point: Point2D, matrix: HomographyMatrix3x3): Point2D` | Chứa các hàm toán học thuần túy (Pure Functions) giải hệ phương trình tuyến tính 8 ẩn tìm ma trận Homography 3x3, tính khoảng cách Euclid và ước tính độ nghiêng camera. |
| `src/services/GeometryEstimationService.ts` | `*Service` | `computeSurfaceMeasurement(polygons: SurfacePolygon[], calibration: ScaleCalibrationData): AreaMeasurementResult`<br>`calculateMaterialTakeoff(measurement: AreaMeasurementResult, material: MaterialPreset, customWastagePercent?: number): MaterialTakeoffEstimate` | Tính toán diện tích thực (`netAreaMm2`, `netAreaSqInches`) sau khi trừ lỗ mở (`VOID_CUTOUT`) và quy đổi ra số lượng vật tư, số thùng cần mua. |
| `src/services/helpers/GeometryEstimationServiceHelper.ts` | `*ServiceHelper` | `computeShoelaceAreaMm2(verticesMm: Point2D[]): number`<br>`computePolygonPerimeterMm(verticesMm: Point2D[]): number`<br>`isPolygonSelfIntersecting(vertices: Point2D[]): boolean`<br>`convertAreaMm2ToSqInches(areaMm2: number): number`<br>`convertLengthMmToInches(lengthMm: number): number` | Chứa thuật toán Shoelace tính diện tích đa giác, kiểm tra đa giác tự cắt (self-intersection) và công thức chuyển đổi đơn vị chính xác giữa `mm²` và `sq.in`. |
| `src/services/VisionSegmentationService.ts` | `*Service` | `detectSurfacesAndReference(imageBlob: Blob, sourceType: SourceImageType): Promise<{ detectedReference: Point2D[] | null; suggestedPolygons: SurfacePolygon[] }>` | Gọi AI Vision API (cấu hình trong `settings.json`) để tự động gợi ý đường bao tường/sàn/cửa sổ và nhận diện vật chuẩn trong ảnh. |
| `src/services/helpers/VisionSegmentationServiceHelper.ts` | `*ServiceHelper` | `validateImageFile(file: { sizeBytes: number; widthPx: number; heightPx: number; mimeType: string }): { valid: boolean; errorCode?: string }`<br>`normalizeVisionApiResponse(rawJson: unknown): SurfacePolygon[]` | Kiểm tra dung lượng, kích thước ảnh đầu vào và chuẩn hóa dữ liệu trả về từ AI Vision thành mảng tọa độ hợp lệ. |

### 2.4. Ma Trận 5 Trạng Thái UX (`Ideal`, `Loading`, `Empty`, `Error`, `Partial/Overflow`)

| Trạng thái UX | Điều kiện kích hoạt | Hiển thị Giao diện (Visual Feedback) | Hành động khôi phục / Tương tác (CTA) |
| :--- | :--- | :--- | :--- |
| **1. Empty State** | Người dùng mới mở app, chưa tải lên bản vẽ hoặc ảnh chụp công trường. | Khung Dropzone lớn có minh họa trực quan 2 chế độ: (1) *Bản vẽ 2D có thước tỷ lệ*, (2) *Ảnh thực tế có đặt thẻ chuẩn ISO / thước dây*. Hiển thị nút dùng thử "Tải bản vẽ mẫu". | Nút `Chọn ảnh / PDF bản vẽ`, `Chụp ảnh trực tiếp từ Camera`, hoặc `Mở bản vẽ mẫu`. |
| **2. Loading State** | Đang render PDF độ phân giải cao, đang giải ma trận Homography hoặc chờ AI Vision khoanh vùng bề mặt. | Skeleton overlay trên Canvas kèm thanh tiến trình có bước cụ thể: `"Đang khử méo phối cảnh (1/2)..."` -> `"Đang bóc tách vùng vật liệu (2/2)..."`. Khóa nút Export để tránh bấm đúp. | Nút `Hủy nhận diện AI & Vẽ tay ngay` nếu chờ quá `5 giây`. |
| **3. Ideal State** | Đã hiệu chuẩn tỷ lệ (`confidenceScore >= 0.85`), đa giác khép kín hợp lệ, đã chọn loại vật tư. | Canvas hiển thị lớp phủ bán trong suốt màu xanh lá cho `TARGET_SURFACE` và màu cam gạch chéo cho `VOID_CUTOUT`. Bảng kết quả bên phải hiển thị song song **`mm²` (`m²`)** và **`sq.in` (`sq.ft`)**, số lượng viên/thùng cần mua và khung xem trước 3D Extrusion. | Cho phép kéo đỉnh đa giác tinh chỉnh từng pixel (kèm kính lúp Magnifier Loupe `4x`), đổi % hao hụt, và bấm `Xuất Phiếu Mua Vật Tư`. |
| **4. Error State** | Ảnh nhỏ hơn `640x480`, đoạn chuẩn `< 20px`, đa giác tự cắt nhau (hình số 8), hoặc AI API lỗi mạng/timeout. | Banner cảnh báo màu đỏ nêu rõ nguyên nhân kỹ thuật thân thiện (VD: *"Đa giác đang bị tự cắt tại cạnh #2 và #4. Vui lòng kéo lại đỉnh để tính đúng diện tích mm²"*). | Nút `Tự động sửa đỉnh bị chéo`, `Đặt lại điểm chuẩn`, hoặc `Chuyển sang chế độ Vẽ đa giác thủ công (Offline)`. |
| **5. Partial / Overflow State** | Góc chụp quá nghiêng (`> 45°`), thiếu chiều cao thực khi xem 3D, hoặc bản vẽ có hơn `50` đa giác nhỏ. | Badge cảnh báo màu vàng: *"Góc chụp nghiêng 52° — Sai số ước tính có thể lên tới ±8%. Khuyến nghị dùng hiệu chỉnh 4 điểm"*. Danh sách đa giác được gom nhóm có thanh cuộn ảo (Virtual Scroll). | Nút `Chuyển sang Hiệu chuẩn 4 góc mặt phẳng` hoặc `Nhập tay chiều dày vật liệu`. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

| Mã Rủi Ro | Mô tả Lỗ hổng / Rủi ro Thực tế | Mức độ nghiêm trọng | Chốt chặn Kỹ thuật Bắt buộc (Technical Guardrail) |
| :--- | :--- | :--- | :--- |
| `RISK-001` | **Ảo tưởng "Đo chính xác tới từng mm² từ ảnh 2D không có vật chuẩn":** Một bức ảnh chụp bức tường từ khoảng cách 2m và 4m có số lượng pixel hoàn toàn khác nhau. Nếu không có vật chuẩn tham chiếu (`Reference Object`) hoặc thông tin tiêu cự + khoảng cách, việc tính ra `mm²` là bất khả thi về mặt vật lý. | **CRITICAL (Blocker)** | **Hard Gate tại `CalibrationService`:** Không cho phép gọi hàm `computeSurfaceMeasurement()` nếu `ScaleCalibrationData` chưa được khởi tạo hoặc `pixelsPerMm <= 0`. Bắt buộc bước 1 trên UI phải là chọn/vẽ `Scale Bar` hoặc `Planar Reference Object` (Thẻ chuẩn ISO `85.60x53.98mm`, giấy A4, thước dây). |
| `RISK-002` | **Sai số Phối cảnh Camera (Perspective Distortion & Foreshortening):** Khi Contractor đứng dưới đất chụp chéo lên tường hoặc chụp nghiêng mặt sàn, các viên gạch ở xa bị co nhỏ lại trên ảnh (hiệu ứng đường tàu hội tụ). Nếu chỉ nhân `areaPx` với hằng số `1 / (pixelsPerMm^2)` thì sai số thực tế có thể lên tới `30% - 60%`. | **HIGH** | **Bắt buộc biến đổi Homography 3x3 (`computeHomographyMatrix`):** Khi chế độ là `SITE_PHOTO_3D`, hệ thống yêu cầu xác định 4 điểm của mặt phẳng chuẩn để tính ma trận nghịch đảo phối cảnh, chiếu toàn bộ các đỉnh đa giác `verticesPx` về hệ tọa độ phẳng thực `rectifiedVerticesMm` trước khi áp dụng công thức Shoelace. Nếu góc nghiêng `estimatedTiltDegrees > 45°`, khóa trạng thái "Chính xác cao" và hiển thị dải sai số dự kiến. |
| `RISK-003` | **Đa giác tự cắt (Self-Intersecting Polygon) làm sai lệch công thức Shoelace:** Khi người dùng chấm điểm nhanh trên màn hình cảm ứng ngoài công trường, các cạnh đa giác dễ bị bắt chéo nhau (hình đồng hồ cát), khiến công thức tích có hướng Shoelace bị triệt tiêu âm-dương và trả về diện tích nhỏ hơn thực tế. | **HIGH** | **Chốt chặn hình học `isPolygonSelfIntersecting()`:** Trước khi tính diện tích, kiểm tra giao điểm của mọi cặp đoạn thẳng không kề nhau trong đa giác. Nếu phát hiện tự cắt, ném lỗi `ERR_SELF_INTERSECTING_POLYGON` và tô đỏ 2 cạnh giao nhau trên Canvas. |
| `RISK-004` | **Sai số làm tròn Dấu chấm động (Floating-Point Drift) khi quy đổi qua lại `mm²` ↔ `sq.in`:** Chuyển đổi liên tục giữa hệ Mét và hệ Imperial bằng số thực `Number` không kiểm soát có thể gây lệch số lượng viên gạch ở các công trình lớn (`> 100 m²` = `100,000,000 mm²`). | **MEDIUM** | **Chuẩn hóa Đơn vị Gốc (Canonical Unit = `mm` & `mm²`):** Mọi phép tính nội bộ trong `GeometryEstimationService` đều thực hiện bằng `mm` và `mm²` ở độ chính xác IEEE 754 `double`, chỉ quy đổi sang `sq.in` ở bước xuất kết quả bằng hằng số chuẩn `MM2_PER_SQ_INCH = 645.16` (`25.4²`) và làm tròn hiển thị tới 2 chữ số thập phân ở bước cuối cùng; số lượng vật tư luôn dùng `Math.ceil()`. |
| `RISK-005` | **Lỗ mở (`VOID_CUTOUT`) nằm ngoài bề mặt chính hoặc lớn hơn bề mặt chính:** Người dùng vô tình đánh dấu vùng trừ hao (cửa sổ) có diện tích lớn hơn bức tường, dẫn đến diện tích thực `netAreaMm2` bị âm. | **MEDIUM** | **Ràng buộc `Math.max(0, grossArea - cutoutArea)` & Cảnh báo:** Nếu `cutoutAreaMm2 >= grossAreaMm2`, hệ thống chặn kết quả âm, trả về lỗi `ERR_INVALID_CUTOUT_AREA` và yêu cầu kiểm tra lại thuộc tính `PolygonRole`. |

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1. Kịch bản Kiểm thử 3 Tầng (`Given / When / Then`)

#### Tầng 1: P0 Happy Paths (Người dùng hay xài nhất)
- **TC-T1-001: Hiệu chuẩn từ Thanh tỷ lệ (Scale Bar) trên bản vẽ 2D và tính diện tích `mm²` & `sq.in`**
  - **Given:** Bản vẽ mặt bằng có độ phân giải `2000x1500 px`, người dùng kẻ đoạn chuẩn từ `(100, 100)` đến `(354, 100)` (dài `254 px`) và nhập độ dài thật là `2540 mm` (`100 inches`).
  - **When:** Người dùng vẽ một mặt sàn hình chữ nhật có tọa độ pixel `[(0,0), (254,0), (254,127), (0,127)]` (`254px × 127px`).
  - **Then:** Hệ thống tính `pixelsPerMm = 0.1`, kích thước thực là `2540 mm × 1270 mm`, trả về `netAreaMm2 = 3,225,800 mm²` và `netAreaSqInches = 5,000.00 sq.in`, sai số `< 0.01%`.
- **TC-T1-002: Tính toán diện tích thực sau khi trừ lỗ mở cửa sổ (`VOID_CUTOUT`) và quy đổi số thùng gạch**
  - **Given:** Bức tường `TARGET_SURFACE` có diện tích `10,000,000 mm²` (`10 m²`), bên trong có 1 cửa sổ `VOID_CUTOUT` diện tích `1,000,000 mm²` (`1 m²`). Người dùng chọn gạch `300×300 mm` (`90,000 mm²`/viên, `10` viên/thùng) với hao hụt mặc định `10%`.
  - **When:** Gọi hàm `calculateMaterialTakeoff()`.
  - **Then:** `netAreaMm2 = 9,000,000 mm²`, diện tích tính cả hao hụt `10%` là `9,900,000 mm²`, số viên gạch cần mua là `110` viên (`11` thùng).
- **TC-T1-003: Hiệu chuẩn mặt phẳng từ vật chuẩn Thẻ ISO ID-1 (`85.60 × 53.98 mm`) trong ảnh chụp thực tế**
  - **Given:** Người dùng chọn `ReferenceObjectType.ISO_ID1_CARD` và chấm 4 góc của chiếc thẻ trên tường trong ảnh thực tế.
  - **When:** Gọi `calibrateFromPlanarQuad()`.
  - **Then:** Hệ thống tự động lấy kích thước chuẩn `85.60 × 53.98 mm`, sinh ma trận `homographyMatrix` 3x3 hợp lệ và cho phép đo các vùng khác trên cùng mặt phẳng tường đó.

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-T2-001: Từ chối tính diện tích khi chưa hiệu chuẩn tỷ lệ (`Uncalibrated State`)**
  - **Given:** Người dùng vừa tải ảnh lên và vẽ đa giác nhưng chưa thực hiện bước `Scale Calibration`.
  - **When:** Gọi `computeSurfaceMeasurement()` với `calibration.pixelsPerMm = 0`.
  - **Then:** Hệ thống ném ngoại lệ `ERR_CALIBRATION_REQUIRED` và không hiển thị con số diện tích giả mạo.
- **TC-T2-002: Phát hiện và chặn đa giác tự cắt (Self-Intersecting Polygon)**
  - **Given:** Đa giác 4 đỉnh có thứ tự bị chéo nhau `[(0,0), (100,100), (100,0), (0,100)]`.
  - **When:** Gọi `computeSurfaceMeasurement()`.
  - **Then:** Hàm `isPolygonSelfIntersecting()` trả về `true`, hệ thống ném lỗi `ERR_SELF_INTERSECTING_POLYGON`.
- **TC-T2-003: Xử lý lỗi khi AI Vision API mất kết nối hoặc sai API Key trong `settings.json`**
  - **Given:** `settings.json` chứa API Key hết hạn hoặc mạng bị ngắt (HTTP `401`/`503`/Timeout).
  - **When:** Người dùng bấm nút `AI Tự động khoanh vùng`.
  - **Then:** `VisionSegmentationService` bắt lỗi an toàn, không làm crash ứng dụng, chuyển UI sang chế độ vẽ đa giác thủ công kèm thông báo rõ ràng.

#### Tầng 3: Boundary & Rare Edge Cases (`0`, `-1`, `MAX`, `Empty`, `Duplicate`, `Concurrent`)
- **TC-T3-001: Giá trị biên `0` và `-1` trong hiệu chuẩn kích thước thực**
  - **Given:** Người dùng nhập độ dài thật của đoạn chuẩn là `0 mm` hoặc `-150 mm`, hoặc chấm 2 điểm trùng nhau trên màn hình (`distancePx = 0`).
  - **When:** Gọi `calibrateFromLine()`.
  - **Then:** Hệ thống chặn ngay lập tức với mã lỗi `ERR_INVALID_CALIBRATION_INPUT`, tuyệt đối không để xảy ra phép chia cho `0` (`Infinity` hoặc `NaN`).
- **TC-T3-002: Đa giác suy biến (Collinear Vertices / Duplicate Points / `< 3` đỉnh)**
  - **Given:** Đa giác chỉ có 2 đỉnh hoặc 3 đỉnh thẳng hàng `[(0,0), (50,50), (100,100)]`.
  - **When:** Gọi `computeSurfaceMeasurement()`.
  - **Then:** Hệ thống phát hiện diện tích bằng `0` hoặc thiếu đỉnh, trả về lỗi `ERR_DEGENERATE_POLYGON`.
- **TC-T3-003: Biên cực đại (`MAX`) và Xử lý đồng thời (`Concurrent`)**
  - **Given:** Bản vẽ mặt bằng khu công nghiệp lớn `100,000 mm × 100,000 mm` (`10,000,000,000 mm²`) và người dùng bấm liên tiếp 5 yêu cầu tính toán cùng lúc.
  - **When:** Thực thi tính toán song song.
  - **Then:** Không bị tràn số, thời gian phản hồi mỗi phép tính hình học `< 15ms`, kết quả nhất quán 100%.

### 4.2. Quy trình 5 Bước Kiểm Chứng Bề Mặt Thật cho QA Reviewer

1. **Step 1 — Launch (Khởi chạy môi trường thật):**
   - Khởi chạy ứng dụng/module thực tế từ thư mục dự án, nạp cấu hình từ `settings.json`.
2. **Step 2 — Doctor (Kiểm tra sức khỏe hệ thống & cấu hình):**
   - Chạy script kiểm tra schema `settings.json`, xác nhận các hằng số quy đổi `MM_PER_INCH = 25.4` và `MM2_PER_SQ_INCH = 645.16` tồn tại và không có magic number trong source code.
3. **Step 3 — Drive (Tương tác thực tế trên bề mặt ứng dụng):**
   - Bơm dữ liệu bản vẽ/ảnh chụp thật có kích thước đã biết (VD: mặt bàn chứa thẻ chuẩn `85.60×53.98mm`), thực hiện hiệu chuẩn tỷ lệ, khoanh vùng bề mặt chính + vùng trừ hao cửa sổ, và xuất dự toán vật tư.
4. **Step 4 — Evidence (Thu thập bằng chứng Log, Screenshot, Trace):**
   - Ghi lại kết quả đầu ra thực tế (JSON/Console/UI Screenshot) chứng minh `netAreaMm2`, `netAreaSqInches` và `totalBoxesNeeded` khớp tuyệt đối với công thức toán học.
5. **Step 5 — Cleanup (Dọn dẹp trạng thái sau kiểm thử):**
   - Xóa file tạm và đóng tiến trình test để trả lại workspace sạch sẽ.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role phụ trách | File mục tiêu | Mô tả chi tiết hàm cần viết | Phụ thuộc | Lệnh Verify + Tiêu chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `src/constants/estimationConstants.ts` & `settings.json` | Khởi tạo toàn bộ `MeasurementUnit`, `AreaUnit`, `ReferenceObjectType`, `PolygonRole`, `UNIT_CONVERSION_CONSTANTS`, `CALIBRATION_LIMITS`, `REFERENCE_OBJECT_DIMENSIONS_MM` và file cấu hình `settings.json`. | Không (None) | `npx tsc --noEmit` pass 100%, không có bất kỳ magic number nào ngoài file constants. |
| `TASK-002` | **Developer** | `src/types/estimationTypes.ts` | Định nghĩa đầy đủ các TypeScript Interfaces: `Point2D`, `HomographyMatrix3x3`, `ScaleCalibrationData`, `SurfacePolygon`, `AreaMeasurementResult`, `MaterialPreset`, `MaterialTakeoffEstimate`. | **Hard:** `TASK-001` | `npx tsc --noEmit` không báo lỗi kiểu dữ liệu. |
| `TASK-003` | **Developer** | `src/services/helpers/CalibrationServiceHelper.ts` | Viết các hàm pure math: `calculateEuclideanDistancePx()`, `computeHomographyMatrix()` (giải hệ phương trình Gaussian elimination cho 4 cặp điểm 2D), `applyHomographyToPoint()`, `estimateCameraTiltDegrees()`. | **Hard:** `TASK-002` | Hàm biến đổi 4 góc hình thang nghiêng về đúng tọa độ chữ nhật thực tế theo `mm` với sai số `< 1e-6`. |
| `TASK-004` | **Developer** | `src/services/CalibrationService.ts` | Viết `calibrateFromLine()` và `calibrateFromPlanarQuad()`, kiểm tra điều kiện biên `MIN_REFERENCE_LENGTH_PX`, `MIN_REFERENCE_REAL_MM` và gán `confidenceScore`. | **Hard:** `TASK-003` | Chặn mọi input `<= 0` hoặc đoạn chuẩn quá ngắn; trả về `ScaleCalibrationData` chuẩn xác. |
| `TASK-005` | **Developer** | `src/services/helpers/GeometryEstimationServiceHelper.ts` | Viết `computeShoelaceAreaMm2()`, `computePolygonPerimeterMm()`, `isPolygonSelfIntersecting()`, `convertAreaMm2ToSqInches()`, `convertLengthMmToInches()`. | **Hard:** `TASK-002` | Tính đúng diện tích đa giác bất kỳ không tự cắt và phát hiện đúng 100% trường hợp cạnh cắt nhau. |
| `TASK-006` | **Developer** | `src/services/GeometryEstimationService.ts` | Viết `computeSurfaceMeasurement()` (hỗ trợ nhiều `TARGET_SURFACE` và trừ đi `VOID_CUTOUT`) và `calculateMaterialTakeoff()` (tính hao hụt vật tư, làm tròn số viên & số thùng bằng `Math.ceil`). | **Hard:** `TASK-004`, `TASK-005` | Trả về đầy đủ `mm²`, `sq.in`, `m²`, `sq.ft`, số viên và số thùng chính xác. |
| `TASK-007` | **Developer** | `src/services/helpers/VisionSegmentationServiceHelper.ts` & `src/services/VisionSegmentationService.ts` | Viết bộ kiểm tra file ảnh `validateImageFile()` và dịch vụ gọi AI Vision đọc từ `settings.json` kèm cơ chế fallback an toàn khi offline. | **Soft:** `TASK-002` | Không lộ API key trong code, xử lý mượt khi timeout hoặc lỗi mạng. |
| `TASK-008` | **Test Engineer** | `tests/calibration.test.ts` | Viết bộ Unit Test 3 tầng cho `CalibrationService` và `CalibrationServiceHelper` (Scale Bar 2 điểm, Planar Quad 4 điểm với thẻ ISO ID-1, chia cho 0, góc nghiêng `> 45°`). | **Hard:** `TASK-004` | `npm test -- tests/calibration.test.ts` pass 100% các kịch bản Tầng 1, 2, 3. |
| `TASK-009` | **Test Engineer** | `tests/geometryEstimation.test.ts` | Viết bộ Unit Test 3 tầng cho `GeometryEstimationService` (quy đổi `mm²` ↔ `sq.in`, trừ lỗ mở cửa sổ, tính hao hụt gạch ốp lát, chặn đa giác tự cắt và đa giác suy biến). | **Hard:** `TASK-006` | `npm test -- tests/geometryEstimation.test.ts` pass 100%, độ phủ nhánh (Branch Coverage) `>= 90%`. |
| `TASK-010` | **Test Engineer** | `tests/e2eEstimateFlow.test.ts` | Viết kịch bản End-to-End mô phỏng luồng Contractor từ lúc tải bản vẽ -> hiệu chuẩn tỷ lệ -> đo tường trừ cửa -> ra phiếu mua vật tư. | **Hard:** `TASK-008`, `TASK-009` | Toàn bộ test suite chạy xanh 100%, xuất log bằng chứng QA đầy đủ. |
