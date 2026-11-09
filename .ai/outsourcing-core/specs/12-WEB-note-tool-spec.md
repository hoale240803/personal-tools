# ĐẶC TẢ KỸ THUẬT & NGHIỆP VỤ: 3D GAMIFIED KNOWLEDGE NOTE TOOL (`note-tool`)

> **Phiên bản:** 1.0.0 (Dev-Ready & Test-Ready)
> **Đội ngũ phụ trách:** AISE Squad 3 — BA Team (`intake`, `ba`, `requirement_challenger`) & PM Team (`orchestrator`, `estimator_cost_controller`)
> **Nguồn yêu cầu gốc:** `idea/note-tool/requirement.md`

---

## PHẦN 1 — INTAKE & PHÂN LOẠI (`intake`)

### 1.1. Bảng Phân Tách Dữ Kiện (`Stated Facts`, `Explicit Assumptions`, `Clarification Questions`)

| Phân loại | Mã định danh | Nội dung chi tiết | Nguồn / Lý do kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Stated Fact** | `SF-001` | Xây dựng **Sổ tay 3D** chỉ bằng **HTML, CSS, JavaScript và Three.js** để lưu trữ và chạy trực tiếp trên **GitHub (GitHub Pages / Git Repository)**. | Trích nguyên văn dòng 1 file `requirement.md` ("làm sổ tay 3d chỉ bằng html, css, javascript threejs để lưu trữ trên github") |
| **Stated Fact** | `SF-002` | Lưu trữ các kiến thức về bất kỳ vấn đề xã hội nào mà người dùng quan tâm, giúp **truy xuất nhanh chóng và có trật tự**. | Trích nguyên văn dòng 2 & dòng 4 file `requirement.md` |
| **Stated Fact** | `SF-003` | Cấu trúc dữ liệu phải có **hệ thống rõ ràng dạng cây (Tree Structure)**, bắt đầu từ **Nguyên lý cốt lõi (`First Principle` / Root Node)**. | Trích nguyên văn dòng 5 file `requirement.md` ("1. Phải có hệ thống rõ ràng như cấu trúc dạng cây. Bắt đầu từ nguyên lý cốt lõi ( First Principle)") |
| **Stated Fact** | `SF-004` | Mỗi đơn vị kiến thức (Node) có thể lưu trữ đa phương tiện: **văn bản cô đọng, hình ảnh, đường dẫn (link), âm thanh (audio), hoặc video**. | Trích nguyên văn dòng 6 & dòng 8 file `requirement.md` ("2. Có thể lưu dạng hình hhh hoặc link, hoặc âm thanh, video") |
| **Stated Fact** | `SF-005` | Khi **hover chuột vào một kiến thức**, hệ thống phải **làm nổi bật (highlight) sự liên kết** đến các kiến thức liên quan khác (cả liên kết cha-con dạng cây lẫn liên kết chéo). | Trích nguyên văn dòng 7 file `requirement.md` ("3. Thể hiện sự liên kết liên qua khi hover vào một kiến thức đến các kiến thức khác.") |
| **Stated Fact** | `SF-006` | Tương tự như **Obsidian Canvas** (`https://obsidian.md/canvas`) nhưng **nội dung cô đọng hơn và chiếm ít diện tích hiển thị hơn**. | Trích nguyên văn dòng 8–9 file `requirement.md` |
| **Stated Fact** | `SF-007` | Trải nghiệm giống như **một bản đồ game xây dựng thế giới (World-Building Map)**: mỗi ngày người dùng khai hoang một vùng đất mới, trồng thêm một cái cây, nuôi thêm một con vật... trong thời gian **chỉ 10–20 phút/ngày**, nên thao tác phải **cực kỳ đơn giản và thuận tiện**. | Trích nguyên văn dòng 4, 11, 12 file `requirement.md` |
| **Explicit Assumption** | `EA-001` | **Cơ chế Lưu trữ Kép cho GitHub Pages (`IndexedDB + GitHub REST API / JSON Sync`):** Vì GitHub Pages là máy chủ tĩnh (Static Hosting) không có lệnh `fs.writeFile` phía server, khi người dùng thêm node mới trên trình duyệt, dữ liệu sẽ được lưu tức thời vào `LocalStorage`/`IndexedDB` và đồng bộ lên kho chứa GitHub thông qua: (a) Gọi GitHub Contents REST API (`PUT /repos/{owner}/{repo}/contents/data/knowledge-world.json`) bằng Personal Access Token trong `settings.json`, hoặc (b) Xuất/Nhập 1 chạm file `knowledge-world.json` để commit. | Giải quyết bài toán mất dữ liệu trên Static GitHub Pages để Dev không bị block. |
| **Explicit Assumption** | `EA-002` | **Quy ước Gamification ("Vùng đất / Cây / Con vật") ánh xạ vào cấp độ Node trong Cây Tri Thức:** Để hiện thực hóa ẩn dụ game xây dựng: (1) **Đảo / Vùng đất (`BIOME_TERRITORY`)** = Chủ đề lớn / First Principle (Level 0), (2) **Cây cổ thụ (`ANCIENT_TREE`)** = Nhánh kiến thức chính (Level 1), (3) **Nhánh cây / Hoa quả (`BRANCH_FLORA`)** = Ý niệm chi tiết (Level 2+), (4) **Sinh vật / Thú nuôi (`CREATURE_LINK_AGENT`)** = Thực thể đại diện cho mối liên kết chéo (Cross-link) hoặc ví dụ thực tiễn sống động giữa các vùng đất. | Biến ý tưởng trừu tượng ở dòng 11 thành quy tắc hiển thị 3D rõ ràng và nhất quán. |
| **Explicit Assumption** | `EA-003` | **Giới hạn Độ dài Tóm tắt Cô đọng (`Compact Micro-Card`):** Để thỏa mãn yêu cầu "cô đọng hơn và chiếm ít diện tích hơn Obsidian Canvas", mỗi node trên không gian 3D chỉ hiển thị nhãn tiêu đề ngắn (`<= 40 ký tự`) và biểu tượng 3D; nội dung chi tiết (`summary <= 280 ký tự` + media link) chỉ bung ra trong Popover gọn nhẹ khi hover/click. | Giữ cho bản đồ 3D luôn thoáng đãng, không bị rối mắt bởi các khung văn bản khổng lồ. |

### 1.2. Danh sách Câu hỏi Làm rõ (`Clarification Questions`)

1. **CQ-001: Phương thức lưu file đa phương tiện (Hình ảnh, Audio, Video) lên GitHub để không vượt giới hạn dung lượng Repo (`1GB`) là gì?**
   - **Option A (Khuyến nghị):** Lưu trữ dạng URL/Embed nhẹ (YouTube/Vimeo/SoundCloud/Imgur/GitHub Release Assets hoặc đường dẫn tương đối `assets/media/...` trong repo với giới hạn `< 5MB`/file cho ảnh/audio ngắn).
   - **Option B:** Mã hóa toàn bộ video/audio thành chuỗi Base64 nhét thẳng vào file JSON (sẽ làm file JSON phình lên hàng trăm MB và treo trình duyệt).
   - *Quyết định mặc định cho bản Spec này:* Chọn **Option A** và đặt chốt chặn cấm nhúng Base64 media nặng vào file JSON.

2. **CQ-002: Phong cách đồ họa 3D trong Three.js nên thiết kế như thế nào để vừa đẹp như bản đồ game vừa không cần tải file 3D `.gltf` nặng hàng chục MB?**
   - **Option A (Khuyến nghị):** Sử dụng **Procedural Low-Poly & InstancedMesh Geometry** ngay trong Three.js (tạo đảo lục giác Hex Tile, cây Low-Poly, sinh vật hình khối phát sáng bằng code thuần + Shader nhẹ). Tải tức thì trong `< 0.5 giây`, chạy mượt 60 FPS trên mọi máy.
   - **Option B:** Tải hàng chục file mô hình `.glb` bên ngoài.
   - *Quyết định mặc định cho bản Spec này:* Chọn **Option A** (hỗ trợ tùy chọn gắn link `.glb` ngoài nếu cần).

---

## PHẦN 2 — ĐẶC TẢ NGHIỆP VỤ, CẤU TRÚC DỮ LIỆU & UX 5 TRẠNG THÁI (`ba`)

### 2.1. Bảng Yêu Cầu Nghiệp Vụ (`REQ-001` .. `REQ-010`)

| Mã REQ | Tên Yêu Cầu | Mô tả nghiệp vụ chi tiết | Truy vết nguồn | Ưu tiên (MoSCoW) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | Khởi tạo Thế giới 3D từ Nguyên lý Cốt lõi (`First Principle Root`) | Cho phép tạo các vùng đất gốc (`First Principle` - Level 0) trên bản đồ lưới lục giác (Hexagonal World Grid) trong Three.js; mọi node con bắt buộc phải gắn vào một `parentId` để duy trì cấu trúc cây chặt chẽ. | `SF-001`, `SF-003`, `SF-007` | **P0 Must-Have** |
| `REQ-002` | Thao tác "Khai hoang 10 Phút" Cực nhanh (`Quick Daily Harvest Flow`) | Cung cấp phím tắt nhanh (`Space` hoặc `N` hoặc Double-click vào vùng đất/cây) để thêm một node mới chỉ trong `< 15 giây` gồm: Tiêu đề ngắn, Tóm tắt cô đọng, Loại thực thể 3D (`TERRITORY`, `TREE`, `FLORA`, `CREATURE`) và Link Media. | `SF-007` | **P0 Must-Have** |
| `REQ-003` | Đính kèm Đa phương tiện (`Image, Link, Audio, Video`) | Mỗi node cho phép lưu danh sách `mediaAttachments` thuộc 4 loại: `IMAGE`, `WEB_LINK`, `AUDIO`, `VIDEO` và hiển thị trình phát thu nhỏ (Mini-Player / Lightbox) ngay trong thẻ Compact Card. | `SF-004`, `SF-006` | **P0 Must-Have** |
| `REQ-004` | Hiệu ứng Phát sáng Liên kết khi Hover (`Hover Raycast & Connection Highlight`) | Khi người dùng di chuột (Hover) vào một thực thể 3D trên bản đồ, hệ thống dùng `THREE.Raycaster` làm sáng rực: (a) Đường dẫn truyền về `First Principle` gốc (Ancestors), (b) Các nhánh con trực tiếp (Children), và (c) Các đường tia liên kết chéo (`Cross-Links`) tới các vùng đất khác, đồng thời làm mờ nhẹ (`opacity: 0.25`) các node không liên quan. | `SF-005` | **P0 Must-Have** |
| `REQ-005` | Chế độ Hiển thị Cô đọng Kiểu Obsidian Canvas (`Compact Micro-Card HUD`) | Thay vì hiển thị các bảng chữ lớn che khuất không gian như Obsidian Canvas truyền thống, chỉ hiển thị nhãn pill nhỏ gọn (`<= 40 ký tự`) lơ lửng trên vật thể 3D; khi hover mới mở thẻ tóm tắt cô đọng (`<= 280 ký tự`). | `SF-006`, `EA-003` | **P0 Must-Have** |
| `REQ-006` | Tìm kiếm Tức thời & Bay Camera (`Instant Search & Camera Fly-To`) | Thanh tìm kiếm nhanh (`Ctrl+K` / `/`) lọc theo tiêu đề, từ khóa, thẻ (`tags`) hoặc nguyên lý gốc; khi chọn kết quả, camera 3D tự động bay mượt (Smooth Lerp/Slerp) tới đúng tọa độ `(x, y, z)` của kiến thức đó. | `SF-002` | **P0 Must-Have** |
| `REQ-007` | Lưu trữ Tự động & Đồng bộ GitHub (`Local + GitHub Sync`) | Tự động lưu mọi thay đổi vào `IndexedDB`/`LocalStorage` ngay khi gõ; hỗ trợ đẩy trực tiếp file `data/knowledge-world.json` lên GitHub Repo qua REST API hoặc tải xuống/nạp lên file JSON 1 chạm. | `SF-001`, `EA-001` | **P0 Must-Have** |
| `REQ-008` | Tự động Bố cục Không gian Cây 3D Không chồng lấn (`3D Radial Tree Layout`) | Khi thêm cây hoặc con vật mới vào một vùng đất, thuật toán tự động tính toán tọa độ `(x, y, z)` theo vòng tròn đồng tâm (Fibonacci Spiral / Radial Tree) quanh node cha để các vật thể 3D không bao giờ đè lên nhau. | `SF-003`, `SF-007` | **P1 Should-Have** |
| `REQ-009` | Chống tạo Chu trình trong Cây (`Cycle Detection Guard`) | Kiểm tra đồ thị khi gán hoặc di chuyển `parentId` để đảm bảo cây phân cấp từ `First Principle` luôn là cây có hướng không chu trình (DAG / Tree), tách biệt rõ `parentId` (quan hệ cây) và `relatedNodeIds` (liên kết ngang). | `SF-003`, `SF-005` | **P1 Should-Have** |
| `REQ-010` | Thống kê Chuỗi ngày Khai hoang (`Daily Exploration Streak`) | Hiển thị góc HUD nhỏ ghi nhận số vùng đất đã mở, số cây đã trồng và chuỗi ngày liên tiếp (`Streak`) ghi chép 10–20 phút mỗi ngày để tạo động lực duy trì. | `SF-007` | **P2 Nice-to-Have** |

### 2.2. Data Structures, Constants & `settings.json` Schema

#### Bảng `CONSTANTS` & `ENUMS` (Tuân thủ nghiêm ngặt luật No Magic Numbers/Strings)

```typescript
export enum NodeEntityType {
  FIRST_PRINCIPLE_TERRITORY = 'FIRST_PRINCIPLE_TERRITORY', // Vùng đất gốc (Level 0)
  KNOWLEDGE_TREE = 'KNOWLEDGE_TREE',                       // Cây kiến thức chính (Level 1)
  CONCEPT_FLORA = 'CONCEPT_FLORA',                         // Hoa/Nhánh chi tiết (Level 2+)
  INSIGHT_CREATURE = 'INSIGHT_CREATURE',                   // Con vật / Ví dụ thực tiễn kết nối
}

export enum MediaType {
  IMAGE = 'IMAGE',
  WEB_LINK = 'WEB_LINK',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
}

export enum RelationType {
  TREE_HIERARCHY = 'TREE_HIERARCHY',     // Cha - Con bắt buộc từ First Principle
  CROSS_REFERENCE = 'CROSS_REFERENCE',   // Liên kết ngang giữa các kiến thức
  CAUSE_AND_EFFECT = 'CAUSE_AND_EFFECT', // Quan hệ Nhân - Quả xã hội
}

export const WORLD_3D_CONSTANTS = {
  MAX_TITLE_LENGTH: 40,
  MAX_COMPACT_SUMMARY_LENGTH: 280,
  MAX_DETAILED_NOTE_LENGTH: 2000,
  MAX_TREE_DEPTH: 8,
  TERRITORY_HEX_RADIUS_UNITS: 18,
  TREE_ORBIT_BASE_RADIUS_UNITS: 5,
  GOLDEN_ANGLE_RADIANS: 2.399963229728653, // 137.50776 độ dùng cho Fibonacci Spiral layout
  MAX_NODES_BEFORE_LOD_SIMPLIFICATION: 500,
  MAX_TOTAL_NODES_LIMIT: 5000,
  HIGHLIGHT_OPACITY_ACTIVE: 1.0,
  HIGHLIGHT_OPACITY_DIMMED: 0.22,
  CAMERA_FLY_DURATION_MS: 650,
  MAX_INLINE_DATA_URI_BYTES: 0, // Cấm tuyệt đối nhúng Base64 media vào JSON
} as const;
```

#### TypeScript Interfaces

```typescript
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface MediaAttachment {
  id: string;
  type: MediaType;
  url: string;
  caption: string;
}

export interface KnowledgeNode {
  id: string;
  title: string;                 // Tối đa 40 ký tự để hiển thị Compact Pill
  compactSummary: string;        // Tối đa 280 ký tự (cô đọng hơn Obsidian Canvas)
  detailedMarkdown?: string;     // Nội dung mở rộng nếu cần đọc sâu
  entityType: NodeEntityType;
  parentId: string | null;       // null CHỈ khi entityType === FIRST_PRINCIPLE_TERRITORY
  depthLevel: number;            // 0 cho First Principle, parent.depthLevel + 1 cho các cấp sau
  relatedNodeIds: string[];      // Danh sách ID liên kết chéo (hiển thị khi hover)
  mediaAttachments: MediaAttachment[];
  tags: string[];
  position3D: Vector3D;
  colorHex: string;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface KnowledgeLinkEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: RelationType;
}

export interface HoverHighlightState {
  hoveredNodeId: string;
  ancestorNodeIds: string[];     // Đường dẫn ngược về First Principle
  descendantNodeIds: string[];   // Các nhánh con trực tiếp
  crossLinkedNodeIds: string[];  // Các node liên kết ngang (2 chiều)
  activeEdgeIds: string[];       // Các đường nối cần phát sáng
  dimmedNodeIds: string[];       // Các node còn lại cần làm mờ
}

export interface KnowledgeWorldGraph {
  version: string;
  worldName: string;
  lastSavedAtIso: string;
  streakDays: number;
  nodes: KnowledgeNode[];
  edges: KnowledgeLinkEdge[];
}
```

#### Cấu trúc `settings.json` Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ThreeJsNoteToolSettings",
  "type": "object",
  "required": ["githubSync", "renderPerformance", "storage"],
  "properties": {
    "githubSync": {
      "type": "object",
      "required": ["enabled", "owner", "repo", "branch", "dataFilePath", "personalAccessToken"],
      "properties": {
        "enabled": { "type": "boolean", "default": false },
        "owner": { "type": "string" },
        "repo": { "type": "string" },
        "branch": { "type": "string", "default": "main" },
        "dataFilePath": { "type": "string", "default": "data/knowledge-world.json" },
        "personalAccessToken": { "type": "string", "description": "GitHub Fine-grained PAT chỉ cấp quyền Contents Read/Write cho repo sổ tay, lưu trong settings.json cục bộ" }
      }
    },
    "renderPerformance": {
      "type": "object",
      "required": ["targetFps", "lodThresholdNodes", "enableAntialias", "cameraFlyDurationMs"],
      "properties": {
        "targetFps": { "type": "integer", "default": 60 },
        "lodThresholdNodes": { "type": "integer", "default": 500 },
        "enableAntialias": { "type": "boolean", "default": true },
        "cameraFlyDurationMs": { "type": "integer", "default": 650 }
      }
    },
    "storage": {
      "type": "object",
      "required": ["localStorageKey", "indexedDbName", "autoSaveIntervalMs"],
      "properties": {
        "localStorageKey": { "type": "string", "default": "aise_3d_knowledge_world_v1" },
        "indexedDbName": { "type": "string", "default": "aise_3d_note_tool_db" },
        "autoSaveIntervalMs": { "type": "integer", "default": 2000 }
      }
    }
  }
}
```

### 2.3. Kiến Trúc Service & Helper (Tuân thủ Rule 4 & SRP)

| Tên File | Loại | Hàm & Chữ ký (Method Signatures) | Mục đích (Docstring) |
| :--- | :--- | :--- | :--- |
| `src/services/KnowledgeTreeService.ts` | `*Service` | `createNode(world: KnowledgeWorldGraph, input: Omit<KnowledgeNode, 'id' \| 'depthLevel' \| 'position3D' \| 'createdAtIso' \| 'updatedAtIso'>): KnowledgeWorldGraph`<br>`linkRelatedNodes(world: KnowledgeWorldGraph, sourceId: string, targetId: string, relationType?: RelationType): KnowledgeWorldGraph`<br>`computeHoverHighlight(world: KnowledgeWorldGraph, hoveredNodeId: string): HoverHighlightState`<br>`searchNodes(world: KnowledgeWorldGraph, query: string): KnowledgeNode[]` | Quản lý toàn bộ vòng đời cây kiến thức bắt đầu từ `First Principle`, tạo liên kết ngang, tính toán tập hợp node phát sáng khi hover và tìm kiếm tức thời. |
| `src/services/helpers/KnowledgeTreeServiceHelper.ts` | `*ServiceHelper` | `validateNodeInput(input: Partial<KnowledgeNode>, existingNodes: KnowledgeNode[]): { valid: boolean; errorCode?: string }`<br>`wouldCreateHierarchyCycle(nodes: KnowledgeNode[], nodeId: string, candidateParentId: string): boolean`<br>`traceAncestorsToFirstPrinciple(nodes: KnowledgeNode[], startNodeId: string): string[]`<br>`validateMediaUrl(url: string, type: MediaType): boolean` | Chứa các hàm kiểm định cấu trúc cây, phát hiện chu trình (cycle detection), truy vết ngược về nút gốc `First Principle` và chặn nhúng `data:` Base64 URI. |
| `src/services/WorldSpatialLayoutService.ts` | `*Service` | `calculateNodePosition3D(existingNodes: KnowledgeNode[], parentNode: KnowledgeNode \| null, siblingIndex: number): Vector3D`<br>`rebalanceWorldLayout(world: KnowledgeWorldGraph): KnowledgeWorldGraph` | Tính toán tọa độ 3D `(x, y, z)` theo lưới lục giác (cho vùng đất `First Principle`) và xoắn ốc vàng Fibonacci (cho Cây & Con vật) để không bị chồng lấn. |
| `src/services/helpers/WorldSpatialLayoutServiceHelper.ts` | `*ServiceHelper` | `axialHexToWorld3D(q: number, r: number, hexRadius: number): Vector3D`<br>`computeFibonacciOrbitPosition(center: Vector3D, index: number, baseRadius: number, depthLevel: number): Vector3D` | Công thức hình học 3D thuần túy chuyển tọa độ lục giác Axial `(q, r)` và góc vàng `GOLDEN_ANGLE_RADIANS` sang tọa độ không gian Three.js. |
| `src/services/GitHubStorageSyncService.ts` | `*Service` | `saveWorldLocally(world: KnowledgeWorldGraph): Promise<void>`<br>`syncWorldToGitHub(world: KnowledgeWorldGraph): Promise<{ commitSha: string }>`<br>`exportWorldJson(world: KnowledgeWorldGraph): string` | Đảm bảo lưu trữ an toàn vào bộ nhớ cục bộ và đồng bộ file `knowledge-world.json` lên GitHub repo mà không làm mất dữ liệu. |

### 2.4. Ma Trận 5 Trạng Thái UX (`Ideal`, `Loading`, `Empty`, `Error`, `Partial/Overflow`)

| Trạng thái UX | Điều kiện kích hoạt | Hiển thị Giao diện (Visual Feedback) | Hành động khôi phục / Tương tác (CTA) |
| :--- | :--- | :--- | :--- |
| **1. Empty State** | Lần đầu mở sổ tay 3D, thế giới chưa có vùng đất nào. | Không gian 3D hiển thị một hòn đảo mây khởi nguyên ở tâm `(0, 0, 0)` với nút phát sáng: **"Khai hoang Vùng đất Nguyên lý Cốt lõi (First Principle) đầu tiên của bạn"**. | Bấm vào hòn đảo hoặc nhấn phím `N` để đặt tên Nguyên lý đầu tiên (VD: *Kinh tế học Vi mô*, *Tâm lý Đám đông*). |
| **2. Loading State** | Đang nạp file `knowledge-world.json` từ GitHub hoặc đang đồng bộ commit mới. | Hiệu ứng la bàn 3D xoay nhẹ ở góc phải trên cùng (`"Đang dựng bản đồ thế giới..."` / `"Đang lưu lên GitHub..."`), không khóa việc xoay camera. | Tự động ẩn sau khi hoàn tất (`< 500ms` với dữ liệu local). |
| **3. Ideal State** | Bản đồ có các vùng đất, cây và sinh vật; người dùng hover hoặc tìm kiếm. | Khi **Hover vào 1 cây/con vật**: đường dây phát sáng nối thẳng về `First Principle` gốc (màu vàng kim) và nối sang các kiến thức liên quan ở đảo khác (màu xanh cyan); thẻ **Compact Micro-Card** hiện ra gọn gàng kèm nút bật ảnh/video/audio. | Click để ghim thẻ đọc chi tiết, nhấn `N` để trồng thêm nhánh con ngay dưới node đang chọn, hoặc `L` để nối dây liên kết với node khác. |
| **4. Error State** | Người dùng cố tạo một cây/con vật mồ côi không có `First Principle` cha, nhập tiêu đề quá dài, hoặc lỗi GitHub Token khi sync. | Toast thông báo rõ ràng: *"Mọi nhánh kiến thức (Cây/Con vật) phải bắt nguồn từ một Nguyên lý Cốt lõi (First Principle). Hãy chọn vùng đất cha trước!"* Nếu lỗi GitHub Sync, dữ liệu vẫn được bảo toàn 100% trong `IndexedDB`. | Nút `Chọn Nguyên lý Gốc có sẵn`, `Tạo thành Vùng đất mới`, hoặc `Tải file JSON dự phòng về máy`. |
| **5. Partial / Overflow State** | Thế giới phát triển vượt quá `500 nodes` sau nhiều tháng ghi chép mỗi ngày, hoặc một node có hơn `20` liên kết chéo. | Tự động kích hoạt chế độ **LOD (Level of Detail)**: các đảo ở xa camera chỉ hiện khối lục giác và nhãn vùng đất lớn; khi zoom gần mới hiện chi tiết từng ngọn cây và con vật để giữ vững `60 FPS`. | Thanh lọc theo `Chủ đề / Vùng đất` hoặc nút `Thu gọn các nhánh sâu > cấp 3`. |

---

## PHẦN 3 — PHẢN BIỆN ĐỘC LẬP & CHỐT CHẶN KỸ THUẬT (`requirement_challenger`)

| Mã Rủi Ro | Mô tả Lỗ hổng / Rủi ro Thực tế | Mức độ nghiêm trọng | Chốt chặn Kỹ thuật Bắt buộc (Technical Guardrail) |
| :--- | :--- | :--- | :--- |
| `RISK-001` | **Mất trắng dữ liệu khi F5 trên GitHub Pages (`Static Hosting Ephemeral Trap`):** Người dùng yêu cầu *"chỉ bằng HTML, CSS, JS Three.js để lưu trữ trên GitHub"*. Nếu Dev chỉ lưu biến trong RAM JavaScript, người dùng dành 20 phút trồng cây xong bấm F5 sẽ mất sạch toàn bộ kiến thức. | **CRITICAL (Blocker)** | **Cơ chế Lưu trữ 3 Lớp (`GitHubStorageSyncService`):** (1) Mọi thao tác thêm/sửa/xóa tự động ghi ngay lập tức vào `LocalStorage`/`IndexedDB`. (2) Có nút `Export / Import JSON` 1 chạm vào thư mục repo. (3) Hỗ trợ đồng bộ trực tiếp qua GitHub REST API (`PUT /repos/{owner}/{repo}/contents/...`) đọc cấu hình từ `settings.json` và kiểm tra `sha` để chống ghi đè xung đột. |
| `RISK-002` | **Sụt giảm hiệu năng Three.js và rối mắt nhãn chữ khi vượt quá 500 Nodes (`Draw Call & Label Occlusion Crisis`):** Sau 1 năm mỗi ngày thêm 2–3 node (`~1,000 nodes`), nếu mỗi cái cây và mỗi nhãn HTML (`CSS2DRenderer`) đều render độc lập ở mọi khoảng cách, trình duyệt sẽ tụt xuống `< 15 FPS` và các nhãn chữ đè kín màn hình như đám mây đen. | **HIGH** | **Chốt chặn `WORLD_3D_CONSTANTS.MAX_NODES_BEFORE_LOD_SIMPLIFICATION = 500` & Compact Micro-Card:** (1) Bắt buộc giới hạn `title <= 40 ký tự` và `compactSummary <= 280 ký tự`. (2) Chỉ hiển thị nhãn của các node thuộc nhánh đang hover hoặc trong bán kính gần camera. (3) Sử dụng `THREE.InstancedMesh` cho các hình khối cây/vùng đất lặp lại. |
| `RISK-003` | **Phá vỡ cấu trúc Cây Nguyên lý Cốt lõi (`Orphan Nodes & Circular Hierarchy`):** Người dùng muốn *"hệ thống rõ ràng như cấu trúc dạng cây, bắt đầu từ First Principle"*, nhưng nếu cho phép nối tự do không kiểm soát như đồ thị vô hướng, người dùng sẽ tạo ra các node trôi nổi vô căn cứ hoặc vòng lặp `A -> B -> C -> A` làm treo thuật toán duyệt cây. | **HIGH** | **Chốt chặn Phân tách `parentId` (Tree) và `relatedNodeIds` (Cross-link):** (1) Mọi node khác `FIRST_PRINCIPLE_TERRITORY` bắt buộc phải có `parentId` tồn tại. (2) Hàm `wouldCreateHierarchyCycle()` chặn tuyệt đối việc gán một node con làm cha của tổ tiên nó. (3) Mối quan hệ liên ngành xã hội được lưu riêng vào `relatedNodeIds` để vừa giữ cây phân cấp sạch sẽ vừa hỗ trợ highlight đa chiều khi hover. |
| `RISK-004` | **Phình to Repo GitHub do nhúng file Video/Audio trực tiếp (`Repo Bloat`):** Người dùng muốn lưu cả hình ảnh, âm thanh, video. Nếu cho phép lưu chuỗi `data:video/mp4;base64,...` vào JSON thì chỉ sau 3 video, file JSON sẽ vượt giới hạn `100MB` của GitHub. | **MEDIUM** | **Chốt chặn `validateMediaUrl()`:** Từ chối mọi URL bắt đầu bằng `data:` trong `mediaAttachments`; chỉ chấp nhận đường dẫn `https://`, `http://` hoặc đường dẫn file tĩnh tương đối `assets/...` hợp lệ. |

---

## PHẦN 4 — KẾ HOẠCH KIỂM THỬ 3 TẦNG & BẰNG CHỨNG QA (`test_engineer` & `qa_reviewer`)

### 4.1. Kịch bản Kiểm thử 3 Tầng (`Given / When / Then`)

#### Tầng 1: P0 Happy Paths (Người dùng hay xài nhất)
- **TC-T1-001: Tạo Vùng đất `First Principle` (Level 0) và trồng Cây kiến thức con (Level 1 & Level 2) kèm đa phương tiện**
  - **Given:** Thế giới `KnowledgeWorldGraph` đang rỗng.
  - **When:** Người dùng tạo node gốc `FIRST_PRINCIPLE_TERRITORY` (*"Nguyên lý Cung - Cầu"*), sau đó tạo node con `KNOWLEDGE_TREE` (*"Lạm phát Tiền tệ"*) có đính kèm 1 link video và 1 hình ảnh minh họa.
  - **Then:** Node gốc có `depthLevel = 0`, `position3D = (0, 0, 0)`; node con có `depthLevel = 1`, `parentId` trỏ đúng vào node gốc, tọa độ `position3D` nằm trên quỹ đạo quanh node gốc mà không trùng tọa độ `(0, 0, 0)`.
- **TC-T1-002: Hover vào một kiến thức làm nổi bật toàn bộ Chuỗi Nguyên lý Gốc (Ancestors), Nhánh con và Liên kết chéo (`computeHoverHighlight`)**
  - **Given:** Cây kiến thức gồm `Root A -> Tree A1 -> Flora A1_1` và một đảo khác `Root B -> Tree B1`, trong đó `Flora A1_1` có liên kết chéo (`relatedNodeIds`) với `Tree B1`. Ngoài ra có `Root C` không liên quan.
  - **When:** Người dùng hover chuột vào `Flora A1_1` (`computeHoverHighlight(world, 'Flora_A1_1')`).
  - **Then:** `ancestorNodeIds` chứa `['Tree_A1', 'Root_A']`, `crossLinkedNodeIds` chứa `['Tree_B1']`, và `dimmedNodeIds` chứa `['Root_C', 'Root_B']`.
- **TC-T1-003: Tìm kiếm nhanh kiến thức và trả về tọa độ 3D để bay camera**
  - **Given:** Thế giới có 50 nodes về các vấn đề xã hội khác nhau.
  - **When:** Gọi `searchNodes(world, 'Lạm phát')`.
  - **Then:** Trả về đúng danh sách node khớp tiêu đề/tóm tắt/tags trong `< 5ms` kèm đầy đủ tọa độ `position3D` để camera di chuyển tới.

#### Tầng 2: Negative, Validation, Auth & Network Failures
- **TC-T2-001: Chặn tạo Node nhánh (`KNOWLEDGE_TREE` / `CONCEPT_FLORA`) không có `parentId` (Orphan Node)**
  - **Given:** Người dùng gọi `createNode()` với `entityType = NodeEntityType.KNOWLEDGE_TREE` nhưng truyền `parentId = null` hoặc `parentId = 'non_existent_id'`.
  - **When:** Thực thi `createNode()`.
  - **Then:** Hệ thống ném lỗi `ERR_ORPHAN_NODE_NOT_ALLOWED` (vì mọi kiến thức nhánh phải bắt nguồn từ một `First Principle`).
- **TC-T2-002: Chặn tạo chu trình phân cấp (`Cycle Detection`) và chặn tự liên kết chính mình (`Self-Link`)**
  - **Given:** Cây có `Node A` là cha của `Node B`.
  - **When:** Cố gắng gán `parentId` của `Node A` thành `Node B`, hoặc gọi `linkRelatedNodes(world, 'Node_A', 'Node_A')`.
  - **Then:** `wouldCreateHierarchyCycle()` trả về `true` và ném lỗi `ERR_HIERARCHY_CYCLE_DETECTED` / `ERR_SELF_LINK_NOT_ALLOWED`.
- **TC-T2-003: Chặn tiêu đề vượt quá `40 ký tự`, tóm tắt vượt quá `280 ký tự` hoặc nhúng Base64 Media**
  - **Given:** Input tạo node có `title` dài `120 ký tự` hoặc `mediaAttachments` chứa chuỗi `data:image/png;base64,...`.
  - **When:** Gọi `validateNodeInput()`.
  - **Then:** Trả về `{ valid: false, errorCode: 'ERR_TITLE_TOO_LONG' }` hoặc `'ERR_INVALID_MEDIA_URL'`.

#### Tầng 3: Boundary & Rare Edge Cases (`0`, `-1`, `MAX`, `Empty`, `Duplicate`, `Concurrent`)
- **TC-T3-001: Thế giới rỗng (`0 nodes`), chuỗi tìm kiếm rỗng (`""`) và độ sâu cây chạm ngưỡng `MAX_TREE_DEPTH = 8`**
  - **Given:** Thế giới có chuỗi phân cấp đạt tới độ sâu cấp 8 (`depthLevel = 8`).
  - **When:** Cố gắng thêm cấp thứ 9 (`depthLevel = 9`).
  - **Then:** Hệ thống chặn với mã lỗi `ERR_MAX_TREE_DEPTH_EXCEEDED` và khuyến nghị tách thành nhánh mới hoặc liên kết ngang để giữ cây cô đọng.
- **TC-T3-002: Bố cục không gian 3D khi có `100` nhánh con cùng gắn vào 1 `First Principle` (Không trùng tọa độ)**
  - **Given:** Một vùng đất gốc có liên tiếp 100 cây con được thêm vào.
  - **When:** Tính toán `calculateNodePosition3D()` cho cả 100 cây.
  - **Then:** Không có bất kỳ 2 node nào có khoảng cách Euclid trong mặt phẳng `(x, z)` nhỏ hơn `1.0 unit` (nhờ phân bố xoắn ốc Fibonacci).
- **TC-T3-003: Liên kết chéo 2 chiều không bị trùng lặp (`Duplicate Cross-Links`)**
  - **Given:** `Node A` và `Node B` đã được liên kết bằng `linkRelatedNodes()`.
  - **When:** Gọi lại `linkRelatedNodes(world, 'Node_A', 'Node_B')` hoặc ngược chiều `('Node_B', 'Node_A')` thêm 3 lần nữa.
  - **Then:** Mảng `relatedNodeIds` và `edges` không bị nhân bản bản ghi trùng lặp.

### 4.2. Quy trình 5 Bước Kiểm Chứng Bề Mặt Thật cho QA Reviewer

1. **Step 1 — Launch:** Khởi chạy bộ máy quản lý cây tri thức 3D và bố cục không gian với cấu hình từ `settings.json`.
2. **Step 2 — Doctor:** Kiểm tra `settings.json` và xác nhận các giới hạn cô đọng (`MAX_TITLE_LENGTH = 40`, `MAX_COMPACT_SUMMARY_LENGTH = 280`, `MAX_TREE_DEPTH = 8`).
3. **Step 3 — Drive:** Tạo một thế giới tri thức mẫu gồm 2 vùng đất `First Principle`, trồng các cây kiến thức con, gắn media (`IMAGE`, `VIDEO`, `AUDIO`, `WEB_LINK`), tạo liên kết chéo giữa 2 vùng đất và kích hoạt sự kiện `computeHoverHighlight()`.
4. **Step 4 — Evidence:** Thu thập JSON xuất ra, kiểm tra tọa độ 3D không chồng lấn và danh sách node được highlight khi hover.
5. **Step 5 — Cleanup:** Xóa dữ liệu test tạm sau khi kiểm chứng hoàn tất.

---

## PHẦN 5 — DANH SÁCH ATOMIC TASKS CHO DEV & TESTER LÀM NGAY (`orchestrator`)

| Mã Task | Role phụ trách | File mục tiêu | Mô tả chi tiết hàm cần viết | Phụ thuộc | Lệnh Verify + Tiêu chí Xong (DoD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | **Developer** | `src/constants/noteWorldConstants.ts` & `settings.json` | Khai báo `NodeEntityType`, `MediaType`, `RelationType`, `WORLD_3D_CONSTANTS` và file cấu hình `settings.json`. | Không (None) | `npx tsc --noEmit` pass 100%, không có magic number/string. |
| `TASK-002` | **Developer** | `src/types/noteWorldTypes.ts` | Định nghĩa đầy đủ các interfaces: `Vector3D`, `MediaAttachment`, `KnowledgeNode`, `KnowledgeLinkEdge`, `HoverHighlightState`, `KnowledgeWorldGraph`. | **Hard:** `TASK-001` | `npx tsc --noEmit` không báo lỗi. |
| `TASK-003` | **Developer** | `src/services/helpers/WorldSpatialLayoutServiceHelper.ts` & `src/services/WorldSpatialLayoutService.ts` | Viết `axialHexToWorld3D()`, `computeFibonacciOrbitPosition()`, `calculateNodePosition3D()` và `rebalanceWorldLayout()`. | **Hard:** `TASK-002` | Các vùng đất gốc xếp theo lưới Hex, các nhánh con phân bố xoắn ốc không trùng tọa độ. |
| `TASK-004` | **Developer** | `src/services/helpers/KnowledgeTreeServiceHelper.ts` | Viết `validateNodeInput()`, `wouldCreateHierarchyCycle()`, `traceAncestorsToFirstPrinciple()` và `validateMediaUrl()`. | **Hard:** `TASK-002` | Chặn đúng node mồ côi, chu trình cây, vượt độ dài cô đọng và Base64 URI. |
| `TASK-005` | **Developer** | `src/services/KnowledgeTreeService.ts` | Viết `createNode()`, `linkRelatedNodes()`, `computeHoverHighlight()` và `searchNodes()`. | **Hard:** `TASK-003`, `TASK-004` | Thực hiện trọn vẹn luồng thêm node từ First Principle, nối liên kết ngang và tính trạng thái phát sáng khi hover. |
| `TASK-006` | **Developer** | `src/services/GitHubStorageSyncService.ts` | Viết `saveWorldLocally()`, `syncWorldToGitHub()` (đọc PAT và repo từ `settings.json`) và `exportWorldJson()`. | **Hard:** `TASK-002` | Lưu/xuất JSON toàn vẹn, không mất dữ liệu khi reload trang tĩnh. |
| `TASK-007` | **Developer** | `src/ui/ThreeWorldController.ts` | Viết bộ điều khiển cảnh 3D (Scene/Camera/Raycaster hover/Compact Micro-Card HUD) kết nối với `KnowledgeTreeService`. | **Hard:** `TASK-005` | Chuyển đổi trạng thái `HoverHighlightState` thành độ sáng/mờ (`1.0` vs `0.22`) trên đối tượng 3D. |
| `TASK-008` | **Test Engineer** | `tests/knowledgeTree.test.ts` | Viết Unit Test 3 tầng cho `KnowledgeTreeService` & Helper (First Principle root, orphan rejection, cycle detection, compact length limits, hover highlight). | **Hard:** `TASK-005` | `npm test -- tests/knowledgeTree.test.ts` pass 100%. |
| `TASK-009` | **Test Engineer** | `tests/spatialLayout.test.ts` | Viết Unit Test 3 tầng cho `WorldSpatialLayoutService` (kiểm tra 100 node con không chồng lấn tọa độ 3D, lưới Hex cho nhiều vùng đất). | **Hard:** `TASK-003` | `npm test -- tests/spatialLayout.test.ts` pass 100%, branch coverage `>= 90%`. |
| `TASK-010` | **Test Engineer** | `tests/storageAndSync.test.ts` | Viết Unit Test kiểm tra serialize/deserialize `KnowledgeWorldGraph`, chặn Base64 media và giả lập đồng bộ GitHub API. | **Hard:** `TASK-006` | Toàn bộ test suite chạy xanh 100%, xuất báo cáo QA đầy đủ. |
