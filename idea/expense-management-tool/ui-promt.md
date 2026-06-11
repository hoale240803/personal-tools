Please read the "agent-rules.md" and follow all coding standards. Your task is to upgrade the "UIService.js" and "SpreadsheetService.js" to support a highly personalized, secure, and interactive financial planning UI.

1. SECURITY LAYER (PASSCODE ACCESS):
   - Implement a "SecurityService.js". Before any financial data is displayed or the sheet is interactive, the script must trigger a Modal Dialog or an HTML Sidebar asking for a Passcode.
   - The correct Passcode must be stored securely in "settings.json".
   - If the passcode is incorrect, the UI remains blurred or the sensitive sheets (Dashboard/Monthly) are kept hidden/protected.

2. DYNAMIC CATEGORY SETTINGS (PARENT-CHILD STRUCTURE):
   - Create a "CategorySettings" tab where users can define their own spending DNA.
   - Column A: [Parent Category] (e.g., "Chăm sóc cá nhân" or "Tự thưởng bản thân").
   - Column B: [Child Category] (e.g., "Làm móng", "Mua sách" or "Đi phượt", "Đi bar").
   - This mapping will be used to populate the monthly planning section (Rows 1-79).

3. INTERACTIVE UI: COLLAPSE & EXPAND LOGIC:
   - In the Monthly Sheet (Rows 1-79), implement a "Grouping/Outline" feature.
   - Parent Categories should act as Header Rows. All corresponding Child Categories must be nested underneath.
   - UI BEHAVIOR:
     - By default, all Parent Categories are COLLAPSED to provide a clean "Overview" of total budgeted vs. actual spending.
     - When a user clicks a "Expand" button (or a custom trigger), the script should expand the group to reveal Child Categories for detailed data adjustment.
   - Use Google Apps Script's `isCollapsed()` and `expandGroups()` methods or Row Grouping features to manage this.

4. UPDATED SUMMARY & LEDGER UI (RECAP):
   - Monthly Tabs: Maintain the "Theo dõi chi phí" ledger starting at Row 85.
   - Data Injection: Continue using `insertRowAfter(85)` for new transactions from Gmail.
   - Real-time Sync: Child category actual spending must automatically sum up to their respective Parent Category headers.
   - Top Metrics: Display "Tổng Thu", "Tổng Chi", and "Số Dư Còn Lại" based on the dynamic categories defined.

5. ARCHITECTURE & REUSE:
   - Ensure "UIService.js" handles all Grouping and Passcode UI logic.
   - Use "SpreadsheetService.js" for data manipulation and sheet protection.
   - Document the branch name (expense-management-tool-<agent-name>) and progress in AGENT_STATE.md.
