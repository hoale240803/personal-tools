Please read "agent-rules.md" strictly. Stop all other implementations and align 100% with the ultimate financial layout provided in "image_e60307.png". You must implement the frontend structure inside `UIService.gs` and data layer inside `SpreadsheetService.gs` using this exact pixel-perfect specification.

1. TOP METRICS DESIGN (KPI OVERVIEW):
   - Create 3 dynamic visual cards at the top of the sheet/dashboard with custom formatting:
     * TỔNG THU: Base value cell. Color code: Soft green background, bold dark green text.
     * TỔNG CHI: Base value cell. Color code: Soft red background, bold dark red text.
     * SỐ DƯ CÒN LẠI: Formula cell `= [Tổng Thu] - [Tổng Chi]`. Color code: Soft orange background, bold dark orange text.

2. UPPER SECTION: DYNAMIC BUDGETING TABLE (Rows 1 to 82)
   - Read Parent-Child configurations directly from the "Category Settings" tab (Column A: Parent, Column B: Child) to dynamically construct rows 1-79.
   - Layout Structure:
     * Column A: DANH MỤC CHI PHÍ (Ex: 1. CHĂM SÓC CÁ NHÂN, 1.1 Làm móng, 1.2 Cắt tóc...)
     * Column B: TỔNG DỰ TÍNH (đ) - User input for budgets.
     * Column C: TỔNG THỰC TẾ (đ) - Formula summing up the categorized transactions from the ledger below.
     * Column D: CHÊNH LỆCH (đ) - Formula: `=B-C`.
   - COLLAPSE & EXPAND INTERACTION:
     * Programmatically apply `shiftRowGroupDepth(1)` to all Child rows under their respective Parent row.
     * Execute `collapseAllRowGroups()` on script load (`onOpen`) so the user only sees a clean overview of Parent categories by default.

3. BOUNDARY & LEDGER REGION (Row 80 to 85)
   - Row 80 (The Summary Boundary):
     * Cell A80: "TỔNG DỰ TÍNH" (Bold, Dark Navy Background, White Text).
     * Cell B80: `=SUM(B2:B79)`
     * Cell C80: `=SUM(C86:C500)` -> Crucial! Automatically accumulates all transactional entries injected below.
     * Cell D80: `=B80-C80`
   - Row 83: Section Title -> "Theo dõi chi phí".
   - Row 85 (Ledger Table Header - STRICT BARRIER):
     * [Ngày] (Col A) | [Món hàng / Diễn giải] (Col B) | [Danh mục] (Col C) | [Chi phí (đ)] (Col D).
     * Styled with dark theme background, white bold text.

4. LOWER SECTION: AUTOMATED TRANSACTION INJECTION (Row 86+)
   - When a bank email is parsed via Gmail, `SpreadsheetService.gs` MUST programmatically trigger `insertRowAfter(85)` to push data straight into Row 86.
   - This safely shifts older entries down (Row 86 becomes 87...) without breaking Row 80's SUM range.
   - Match transaction descriptions with Child Categories to auto-fill Column C (Danh mục) using the format: `Parent Category > Child Category` (e.g., "Ăn uống > Đồ uống").
   - Column D (Chi phí) must strictly inherit currency formatting ("0 đ").

5. SECURITY LAYER & SIDEBAR:
   - Implement `showSecurityModal()` inside `UIService.gs` to throw an HTML Passcode Prompt on open. Keep core data masked/protected until verified.
   - Prepare an HTML Sidebar menu ("SIDEBAR / MENU NHANH") linking to [Tổng quan], [Thêm giao dịch], [Báo cáo], [Quản lý danh mục], [Cài đặt] as visually mapped.

Refactor code cleanly into `Main.gs`, `UIService.gs`, and `SpreadsheetService.gs` using plain GAS global scope. Update AGENT_STATE.md when the layout is successfully bound.