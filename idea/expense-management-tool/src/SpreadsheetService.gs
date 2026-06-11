/**
 * SPREADSHEETSERVICE.GS - Spreadsheet Operations & Data Manipulation
 *
 * Implements the pixel-perfect financial layout per ui-promt2.md:
 * - Rows 1-79: Dynamic budgeting table (Parent/Child from Config)
 * - Row 80: Summary boundary (TỔNG DỰ TÍNH with formulas)
 * - Row 83: Section title "Theo dõi chi phí"
 * - Row 85: Ledger header (dark bg, white bold)
 * - Row 86+: Auto-injected transactions
 *
 * All functions are in global scope. Calls helpers from Main.gs.
 */

// ============================================================================
// LAYOUT CONSTANTS
// ============================================================================

/** First row of the budgeting section */
var BUDGET_START_ROW = 1;
/** Last row of the budgeting section */
var BUDGET_END_ROW = 79;
/** Row containing the summary boundary totals */
var SUMMARY_ROW = 80;
/** Row containing the ledger section title */
var LEDGER_TITLE_ROW = 83;
/** Row containing the ledger column headers */
var LEDGER_HEADER_ROW = 85;
/** First row of actual transaction data */
var LEDGER_DATA_START_ROW = 86;
/** Column index for budget amounts (Tổng Dự Tính) */
var COL_BUDGET = 2;
/** Column index for actual amounts (Tổng Thực Tế) */
var COL_ACTUAL = 3;
/** Column index for difference (Chênh Lệch) */
var COL_DIFF = 4;

// Color constants matching the layout spec
var COLOR_NAVY_BG = "#1e2a4a";
var COLOR_WHITE_TEXT = "#ffffff";
var COLOR_GREEN_BG = "#d4edda";
var COLOR_GREEN_TEXT = "#155724";
var COLOR_RED_BG = "#f8d7da";
var COLOR_RED_TEXT = "#721c24";
var COLOR_ORANGE_BG = "#fff3cd";
var COLOR_ORANGE_TEXT = "#856404";
var COLOR_LEDGER_BG = "#2c3e50";
var COLOR_PARENT_BG = "#e8ecf0";
var COLOR_PARENT_TEXT = "#1e2a4a";
var COLOR_CHILD_BG = "#ffffff";
var COLOR_CHILD_TEXT = "#333333";
var COLOR_SECTION_TITLE_TEXT = "#1e2a4a";

// ============================================================================
// SHEET MANAGEMENT
// ============================================================================

/**
 * Get a specific sheet by name from the active spreadsheet.
 * @param {string} sheetName - Name of the sheet to retrieve
 * @return {Sheet}
 */
function getSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      logError("getSheet", `Sheet "${sheetName}" not found`);
      return null;
    }
    return sheet;
  } catch (error) {
    logError("getSheet", error);
    return null;
  }
}

/**
 * Get all sheet names from the active spreadsheet.
 * @return {Array<string>}
 */
function getSheetNames() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    return sheets.map((sheet) => sheet.getName());
  } catch (error) {
    logError("getSheetNames", error);
    return [];
  }
}

/**
 * Create a new sheet with optional column headers.
 * @param {string} sheetName - Name for the new sheet
 * @param {Array<string>} headers - Optional column headers
 * @return {Sheet}
 */
function createSheet(sheetName, headers = []) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss.getSheetByName(sheetName)) {
      logMessage(`Sheet "${sheetName}" already exists`);
      return ss.getSheetByName(sheetName);
    }
    const sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }
    logMessage(`Sheet "${sheetName}" created`);
    return sheet;
  } catch (error) {
    logError("createSheet", error);
    return null;
  }
}

/**
 * Delete a sheet from the spreadsheet.
 * @param {string} sheetName - Name of sheet to delete
 * @return {boolean}
 */
function deleteSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      logError("deleteSheet", `Sheet "${sheetName}" not found`);
      return false;
    }
    if (ss.getSheets().length === 1) {
      logError("deleteSheet", "Cannot delete the last sheet");
      return false;
    }
    ss.deleteSheet(sheet);
    logMessage(`Sheet "${sheetName}" deleted`);
    return true;
  } catch (error) {
    logError("deleteSheet", error);
    return false;
  }
}

// ============================================================================
// CATEGORY DATA OPERATIONS
// ============================================================================

/**
 * Helper function to retrieve the sheet tab used for category settings.
 * First checks for "Category Settings" tab, then falls back to "Config".
 *
 * @return {Sheet|null}
 */
function getCategorySettingsSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return ss.getSheetByName("Config");
  } catch (error) {
    logError("getCategorySettingsSheet", error);
    return null;
  }
}

/**
 * Read the Category configuration from the Config sheet.
 * Reads Column A (Parent) and Column B (Child) starting from Row 2.
 * @return {Array<object>} Array of {parent, child} objects
 */
function readCategoryConfig() {
  try {
    const configSheet = getCategorySettingsSheet();
    if (!configSheet) {
      logMessage("Category settings sheet not found");
      return [];
    }
    const lastRow = configSheet.getLastRow();
    if (lastRow < 2) {
      return [];
    }
    const data = configSheet.getRange(2, 1, lastRow - 1, 2).getValues();
    const categories = [];
    data.forEach((row) => {
      if (row[0] || row[1]) {
        categories.push({
          parent: trimString(row[0]),
          child: trimString(row[1]),
        });
      }
    });
    logMessage(`Read ${categories.length} categories from Config`);
    return categories;
  } catch (error) {
    logError("readCategoryConfig", error);
    return [];
  }
}

/**
 * Write category data to the Config sheet.
 * @param {Array<object>} categoryData - Array of {parent, child} objects
 * @return {boolean}
 */
function writeCategoryData(categoryData) {
  try {
    const configSheet = getCategorySettingsSheet();
    if (!configSheet) {
      logError("writeCategoryData", "Category settings sheet not found");
      return false;
    }
    const lastRow = configSheet.getLastRow();
    if (lastRow > 1) {
      configSheet.deleteRows(2, lastRow - 1);
    }
    if (categoryData && categoryData.length > 0) {
      const values = categoryData.map((cat) => [cat.parent, cat.child]);
      configSheet.getRange(2, 1, values.length, 2).setValues(values);
    }
    logMessage(`Wrote ${categoryData.length} categories to Config`);
    return true;
  } catch (error) {
    logError("writeCategoryData", error);
    return false;
  }
}

/**
 * Add a single category entry to the Config sheet.
 * @param {string} parentName - Parent category name
 * @param {string} childName - Child category name
 * @return {boolean}
 */
function addCategoryToConfig(parentName, childName) {
  try {
    const configSheet = getCategorySettingsSheet();
    if (!configSheet) {
      logError("addCategoryToConfig", "Category settings sheet not found");
      return null;
    }
    const lastRow = configSheet.getLastRow();
    const nextRow = lastRow < 1 ? 1 : lastRow + 1;
    configSheet.getRange(nextRow, 1, 1, 2).setValues([[parentName, childName]]);
    logMessage(`Category added: ${parentName} > ${childName}`);
    return readCategoryConfig();
  } catch (error) {
    logError("addCategoryToConfig", error);
    return null;
  }
}

/**
 * Delete a category from Config sheet by 0-based index.
 * @param {number} index - 0-based index of the category row to delete
 * @return {boolean}
 */
function deleteCategoryFromConfig(index) {
  try {
    const configSheet = getCategorySettingsSheet();
    if (!configSheet) {
      logError("deleteCategoryFromConfig", "Category settings sheet not found");
      return null;
    }
    // Row 1 is header, data starts at row 2, so index 0 = row 2
    const rowToDelete = index + 2;
    configSheet.deleteRow(rowToDelete);
    logMessage(`Category at index ${index} deleted`);
    return readCategoryConfig();
  } catch (error) {
    logError("deleteCategoryFromConfig", error);
    return null;
  }
}

// ============================================================================
// MONTHLY SHEET LAYOUT BUILDER
// ============================================================================

/**
 * Build the full pixel-perfect financial layout on the monthly sheet.
 *
 * Layout structure (per ui-promt2.md):
 *   Rows 1-79:   Dynamic budgeting table (Parent rows + Child rows from Config)
 *   Row 80:      Summary boundary (TỔNG DỰ TÍNH, formulas)
 *   Rows 81-82:  Spacer rows (empty)
 *   Row 83:      Section title "Theo dõi chi phí"
 *   Row 84:      Spacer row (empty)
 *   Row 85:      Ledger header (Ngày | Món hàng | Danh mục | Chi phí)
 *   Row 86+:     Transaction data (auto-injected)
 *
 * @return {boolean} True if layout was built successfully
 */
function buildMonthlySheetLayout() {
  try {
    const monthlySheet = getSheet("Tháng");
    if (!monthlySheet) {
      logError("buildMonthlySheetLayout", 'Monthly sheet "Tháng" not found');
      return false;
    }

    const categories = readCategoryConfig();
    if (!categories || categories.length === 0) {
      logMessage(
        "No categories found in Config - skipping budgeting table build",
      );
      setupLedgerBoundaryAndHeader(monthlySheet);
      return true;
    }

    // Clear existing content in rows 1-84 only (preserve ledger data below row 85)
    clearBudgetSection(monthlySheet);

    // Set column widths for readability
    setupColumnWidths(monthlySheet);

    // Build the dynamic budgeting rows from Config categories
    const lastBudgetRow = buildBudgetingTable(monthlySheet, categories);

    // Setup summary boundary at row 80
    setupSummaryBoundaryRow(monthlySheet);

    // Setup ledger section title at row 83 and header at row 85
    setupLedgerBoundaryAndHeader(monthlySheet);

    // Apply row groupings so child rows collapse under parents
    applyGroupingToMonthlySheet();

    logMessage("Monthly sheet layout built successfully");
    return true;
  } catch (error) {
    logError("buildMonthlySheetLayout", error);
    return false;
  }
}

/**
 * Clear the budget section (rows 1-84) without touching ledger data.
 * @param {Sheet} sheet - The monthly sheet
 * @return {void}
 */
function clearBudgetSection(sheet) {
  try {
    const lastCol = Math.max(sheet.getLastColumn(), 4);
    sheet.getRange(1, 1, 84, lastCol).clearContent();
    sheet.getRange(1, 1, 84, lastCol).clearFormat();
    logMessage("Budget section rows 1-84 cleared");
  } catch (error) {
    logError("clearBudgetSection", error);
  }
}

/**
 * Set optimal column widths for the monthly sheet layout.
 * @param {Sheet} sheet - The monthly sheet
 * @return {void}
 */
function setupColumnWidths(sheet) {
  try {
    sheet.setColumnWidth(1, 280); // Col A: Category name
    sheet.setColumnWidth(2, 160); // Col B: Tổng Dự Tính
    sheet.setColumnWidth(3, 160); // Col C: Tổng Thực Tế
    sheet.setColumnWidth(4, 140); // Col D: Chênh Lệch
    logMessage("Column widths configured");
  } catch (error) {
    logError("setupColumnWidths", error);
  }
}

/**
 * Build the dynamic budgeting table by writing Parent and Child rows.
 * Inserts a column header row at Row 1 then fills rows 2-79 with categories.
 *
 * @param {Sheet} sheet - The monthly sheet
 * @param {Array<object>} categories - Array of {parent, child} pairs from Config
 * @return {number} The last row number used by the budgeting table
 */
function buildBudgetingTable(sheet, categories) {
  try {
    // Row 1: Column header row
    const headerRange = sheet.getRange(1, 1, 1, 4);
    headerRange.setValues([
      [
        "DANH MỤC CHI PHÍ",
        "TỔNG DỰ TÍNH (đ)",
        "TỔNG THỰC TẾ (đ)",
        "CHÊNH LỆCH (đ)",
      ],
    ]);
    headerRange.setFontWeight("bold");
    headerRange.setBackground(COLOR_NAVY_BG);
    headerRange.setFontColor(COLOR_WHITE_TEXT);
    headerRange.setFontSize(11);
    headerRange.setVerticalAlignment("middle");
    headerRange.setHorizontalAlignment("center");
    sheet.setRowHeight(1, 36);

    // Group categories by parent
    const parentMap = buildParentMap(categories);
    const parentNames = Object.keys(parentMap);

    let currentRow = 2;
    let parentIndex = 1;

    parentNames.forEach((parentName) => {
      const children = parentMap[parentName];

      // --- Parent row ---
      writeParentRow(sheet, currentRow, parentIndex, parentName);
      const parentRow = currentRow;
      currentRow++;
      parentIndex++;

      // --- Child rows ---
      children.forEach((childName, childIdx) => {
        writeChildRow(sheet, currentRow, childName, parentRow, childIdx);
        currentRow++;
      });
    });

    logMessage(`Budgeting table built: rows 2 to ${currentRow - 1}`);
    return currentRow - 1;
  } catch (error) {
    logError("buildBudgetingTable", error);
    return 2;
  }
}

/**
 * Group a flat array of {parent, child} objects into a map keyed by parent name.
 * Preserves insertion order of parents.
 * @param {Array<object>} categories - Array of {parent, child} pairs
 * @return {object} Map of parentName -> [childName, ...]
 */
function buildParentMap(categories) {
  const parentMap = {};
  categories.forEach((cat) => {
    if (!parentMap[cat.parent]) {
      parentMap[cat.parent] = [];
    }
    if (cat.child) {
      parentMap[cat.parent].push(cat.child);
    }
  });
  return parentMap;
}

/**
 * Write a Parent category row with bold navy styling.
 * @param {Sheet} sheet - The monthly sheet
 * @param {number} row - Row number to write to (1-based)
 * @param {number} parentIndex - Sequential index for numbering (e.g. "1.")
 * @param {string} parentName - Parent category label
 * @return {void}
 */
function writeParentRow(sheet, row, parentIndex, parentName) {
  try {
    const label = `${parentIndex}. ${parentName.toUpperCase()}`;
    const range = sheet.getRange(row, 1, 1, 4);
    range.setValues([[label, "", "", ""]]);
    range.setBackground(COLOR_PARENT_BG);
    range.setFontColor(COLOR_PARENT_TEXT);
    range.setFontWeight("bold");
    range.setFontSize(10);
    range.setVerticalAlignment("middle");

    // Col A: left-align category name
    sheet.getRange(row, 1).setHorizontalAlignment("left");
    // Cols B, C, D: center for amounts
    sheet.getRange(row, 2, 1, 3).setHorizontalAlignment("center");
    sheet.setRowHeight(row, 30);
  } catch (error) {
    logError("writeParentRow", error);
  }
}

/**
 * Write a Child category row with indented label and formula cells.
 * @param {Sheet} sheet - The monthly sheet
 * @param {number} row - Row number to write to (1-based)
 * @param {string} childName - Child category label
 * @param {number} parentRow - Parent row number (for SUMIF reference)
 * @param {number} childIdx - 0-based child index for sub-numbering
 * @return {void}
 */
function writeChildRow(sheet, row, childName, parentRow, childIdx) {
  try {
    const label = `   ${childIdx + 1}. ${childName}`;
    const range = sheet.getRange(row, 1, 1, 4);

    // Col D formula: =B{row}-C{row}
    const diffFormula = `=IFERROR(B${row}-C${row},0)`;

    range.setValues([[label, 0, 0, 0]]);
    sheet.getRange(row, 4).setFormula(`=IFERROR(B${row}-C${row},0)`);
    range.setBackground(COLOR_CHILD_BG);
    range.setFontColor(COLOR_CHILD_TEXT);
    range.setFontWeight("normal");
    range.setFontSize(10);
    range.setVerticalAlignment("middle");
    sheet.getRange(row, 1).setHorizontalAlignment("left");
    sheet.getRange(row, 2, 1, 3).setHorizontalAlignment("right");
    sheet.getRange(row, 4).setHorizontalAlignment("right");

    // Apply currency format to budget, actual, and diff columns
    const currencyFormat = '#,##0 "đ"';
    sheet.getRange(row, 2, 1, 3).setNumberFormat(currencyFormat);

    sheet.setRowHeight(row, 26);
  } catch (error) {
    logError("writeChildRow", error);
  }
}

/**
 * Setup the summary boundary at Row 80 per ui-promt2.md spec.
 *
 * Row 80 Layout:
 *   A80: "TỔNG DỰ TÍNH" (bold, dark navy bg, white text)
 *   B80: =SUM(B2:B79)
 *   C80: =SUM(C86:C500)   <- accumulates all ledger transactions
 *   D80: =B80-C80
 *
 * @param {Sheet} sheet - The monthly sheet
 * @return {void}
 */
function setupSummaryBoundaryRow(sheet) {
  try {
    const row = SUMMARY_ROW;
    const range = sheet.getRange(row, 1, 1, 4);
    range.setBackground(COLOR_NAVY_BG);
    range.setFontColor(COLOR_WHITE_TEXT);
    range.setFontWeight("bold");
    range.setFontSize(11);
    range.setVerticalAlignment("middle");
    sheet.setRowHeight(row, 36);

    sheet.getRange(row, 1).setValue("TỔNG DỰ TÍNH");
    sheet.getRange(row, 1).setHorizontalAlignment("left");

    sheet.getRange(row, 2).setFormula("=SUM(B2:B79)");
    sheet.getRange(row, 2).setHorizontalAlignment("right");
    sheet.getRange(row, 2).setNumberFormat('#,##0 "đ"');

    // CRITICAL: C80 sums ledger data rows (86:500) not budget rows
    sheet.getRange(row, 3).setFormula("=SUM(D86:D500)");
    sheet.getRange(row, 3).setHorizontalAlignment("right");
    sheet.getRange(row, 3).setNumberFormat('#,##0 "đ"');

    sheet.getRange(row, 4).setFormula("=B80-C80");
    sheet.getRange(row, 4).setHorizontalAlignment("right");
    sheet.getRange(row, 4).setNumberFormat('#,##0 "đ"');

    logMessage("Summary boundary row 80 configured");
  } catch (error) {
    logError("setupSummaryBoundaryRow", error);
  }
}

/**
 * Setup the ledger section title (Row 83) and ledger column header (Row 85).
 *
 * Row 83: "Theo dõi chi phí" (section title, bold navy text)
 * Row 85: [Ngày] [Món hàng / Diễn giải] [Danh mục] [Chi phí (đ)]
 *         (dark bg #2c3e50, white bold text)
 *
 * @param {Sheet} sheet - The monthly sheet
 * @return {void}
 */
function setupLedgerBoundaryAndHeader(sheet) {
  try {
    // Row 83: Section title "Theo dõi chi phí"
    const titleRange = sheet.getRange(LEDGER_TITLE_ROW, 1, 1, 4);
    titleRange.merge();
    titleRange.setValue("📋 Theo dõi chi phí");
    titleRange.setFontWeight("bold");
    titleRange.setFontSize(13);
    titleRange.setFontColor(COLOR_SECTION_TITLE_TEXT);
    titleRange.setBackground("#f0f4f8");
    titleRange.setHorizontalAlignment("left");
    titleRange.setVerticalAlignment("middle");
    sheet.setRowHeight(LEDGER_TITLE_ROW, 38);

    // Row 85: Ledger column headers with dark theme
    const headerRange = sheet.getRange(LEDGER_HEADER_ROW, 1, 1, 4);
    headerRange.setValues([
      ["Ngày", "Món hàng / Diễn giải", "Danh mục", "Chi phí (đ)"],
    ]);
    headerRange.setBackground(COLOR_LEDGER_BG);
    headerRange.setFontColor(COLOR_WHITE_TEXT);
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(10);
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(LEDGER_HEADER_ROW, 32);

    // Freeze rows up to ledger header so header always visible
    sheet.setFrozenRows(1);

    logMessage("Ledger section title (row 83) and header (row 85) configured");
  } catch (error) {
    logError("setupLedgerBoundaryAndHeader", error);
  }
}

// ============================================================================
// ROW GROUPING (COLLAPSE/EXPAND)
// ============================================================================

/**
 * Apply Google Sheets row grouping to the monthly sheet so Child rows
 * are nested under their Parent rows (rows 1-79).
 *
 * Uses shiftRowGroupDepth(1) on child rows and then collapses all groups
 * so only Parent rows are visible on load (clean overview mode).
 *
 * @return {boolean}
 */
function applyGroupingToMonthlySheet() {
  try {
    const monthlySheet = getSheet("Tháng");
    if (!monthlySheet) {
      logError("applyGroupingToMonthlySheet", "Monthly sheet not found");
      return false;
    }

    const categories = readCategoryConfig();
    if (!categories || categories.length === 0) {
      logMessage("No categories - skipping grouping");
      return true;
    }

    // Remove all existing row groups in the budget section
    removeExistingRowGroups(monthlySheet);

    // Rebuild groups based on current category layout
    const parentMap = buildParentMap(categories);
    const parentNames = Object.keys(parentMap);

    let currentRow = 2; // Row 1 is the column header

    parentNames.forEach((parentName) => {
      const children = parentMap[parentName];
      currentRow++; // advance past the parent row

      if (children.length > 0) {
        const firstChildRow = currentRow;
        const lastChildRow = currentRow + children.length - 1;
        // Apply grouping depth 1 to all child rows under this parent
        monthlySheet
          .getRange(firstChildRow, 1, children.length, 1)
          .shiftRowGroupDepth(1);
        currentRow += children.length;
      }
    });

    // Collapse all groups so only parent rows visible on open
    monthlySheet.collapseAllRowGroups();

    logMessage("Row grouping applied and all groups collapsed");
    return true;
  } catch (error) {
    logError("applyGroupingToMonthlySheet", error);
    return false;
  }
}

/**
 * Remove all existing row groups in rows 2-79 of the monthly sheet.
 * This ensures grouping is rebuilt cleanly when categories change.
 * @param {Sheet} sheet - The monthly sheet
 * @return {void}
 */
function removeExistingRowGroups(sheet) {
  try {
    // shiftRowGroupDepth(-1) removes one level of grouping;
    // we apply it repeatedly to clear any groups in rows 2-79
    const range = sheet.getRange(2, 1, 78, 1);
    for (let i = 0; i < 5; i++) {
      try {
        range.shiftRowGroupDepth(-1);
      } catch (e) {
        // Stop when no more groups exist
        break;
      }
    }
    logMessage("Existing row groups removed");
  } catch (error) {
    logError("removeExistingRowGroups", error);
  }
}

/**
 * Expand all row groups in the monthly sheet.
 * @return {void}
 */
function expandAllGroups() {
  try {
    const monthlySheet = getSheet("Tháng");
    if (!monthlySheet) return;
    monthlySheet.expandAllRowGroups();
    logMessage("All row groups expanded");
  } catch (error) {
    logError("expandAllGroups", error);
  }
}

/**
 * Collapse all row groups in the monthly sheet.
 * @return {void}
 */
function collapseAllGroups() {
  try {
    const monthlySheet = getSheet("Tháng");
    if (!monthlySheet) return;
    monthlySheet.collapseAllRowGroups();
    logMessage("All row groups collapsed");
  } catch (error) {
    logError("collapseAllGroups", error);
  }
}

// ============================================================================
// TRANSACTION & LEDGER OPERATIONS
// ============================================================================

/**
 * Insert a new transaction into the ledger section.
 *
 * CRITICAL BEHAVIOR:
 *   1. Calls insertRowAfter(85) so data lands at Row 86 and older entries shift down.
 *   2. Copies formatting from the header row (Row 85) to preserve currency style.
 *   3. Auto-matches description to a Config category and writes "Parent > Child" format.
 *
 * @param {string} date        - Transaction date (DD/MM/YYYY)
 * @param {string} description - Merchant / description text
 * @param {number} amount      - Transaction amount (numeric)
 * @param {string} accountName - Account or bank name (optional, for future use)
 * @return {boolean}
 */
function insertTransaction(date, description, amount, accountName) {
  try {
    const monthlySheet = getSheet("Tháng");
    if (!monthlySheet) {
      logError("insertTransaction", 'Monthly sheet "Tháng" not found');
      return false;
    }

    // Insert a new blank row at position 86, shifting existing data down
    monthlySheet.insertRowAfter(LEDGER_HEADER_ROW);

    // Determine the matched category label "Parent > Child"
    const categoryLabel = matchTransactionToCategory(description);

    // Write data into the newly created row 86
    const dataRow = LEDGER_DATA_START_ROW;
    monthlySheet.getRange(dataRow, 1).setValue(date);
    monthlySheet.getRange(dataRow, 2).setValue(description);
    monthlySheet.getRange(dataRow, 3).setValue(categoryLabel);
    monthlySheet.getRange(dataRow, 4).setValue(amount);

    // Copy formatting from ledger header row to new data row
    copyRowFormatting(monthlySheet, LEDGER_HEADER_ROW, dataRow);

    // Apply currency format specifically to the amount column
    monthlySheet.getRange(dataRow, 4).setNumberFormat('#,##0 "đ"');
    monthlySheet.getRange(dataRow, 4).setBackground(COLOR_CHILD_BG);
    monthlySheet.getRange(dataRow, 4).setFontColor(COLOR_CHILD_TEXT);
    monthlySheet.getRange(dataRow, 4).setFontWeight("normal");

    // Reset text styling for data cells (not header style)
    monthlySheet.getRange(dataRow, 1, 1, 3).setBackground(COLOR_CHILD_BG);
    monthlySheet.getRange(dataRow, 1, 1, 3).setFontColor(COLOR_CHILD_TEXT);
    monthlySheet.getRange(dataRow, 1, 1, 3).setFontWeight("normal");

    logMessage(
      `Transaction inserted at row ${dataRow}: ${description} - ${formatCurrency(amount)}`,
    );
    return true;
  } catch (error) {
    logError("insertTransaction", error);
    return false;
  }
}

/**
 * Match a transaction description to a Config category.
 * Returns a formatted label "Parent > Child" for the Danh mục column.
 * Falls back to "Chưa phân loại" if no match found.
 *
 * @param {string} description - Raw transaction description text
 * @return {string} Category label in "Parent > Child" format
 */
function matchTransactionToCategory(description) {
  try {
    const categories = readCategoryConfig();
    if (!categories || categories.length === 0) {
      return "Chưa phân loại";
    }

    const lowerDesc = String(description).toLowerCase();

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const childLower = cat.child.toLowerCase();
      const parentLower = cat.parent.toLowerCase();

      if (lowerDesc.includes(childLower) || lowerDesc.includes(parentLower)) {
        return `${cat.parent} > ${cat.child}`;
      }
    }

    return "Chưa phân loại";
  } catch (error) {
    logError("matchTransactionToCategory", error);
    return "Chưa phân loại";
  }
}

/**
 * Copy formatting from one row to another (number format, font, colors, alignment).
 * Used to ensure new ledger rows inherit the "0 đ" currency style.
 *
 * @param {Sheet}  sheet     - The sheet containing the rows
 * @param {number} sourceRow - Source row number (1-based)
 * @param {number} targetRow - Target row number (1-based)
 * @return {void}
 */
function copyRowFormatting(sheet, sourceRow, targetRow) {
  try {
    const numCols = Math.max(sheet.getLastColumn(), 4);
    const sourceRange = sheet.getRange(sourceRow, 1, 1, numCols);
    const targetRange = sheet.getRange(targetRow, 1, 1, numCols);

    targetRange.setNumberFormats(sourceRange.getNumberFormats());
    targetRange.setFontFamilies(sourceRange.getFontFamilies());
    targetRange.setFontSizes(sourceRange.getFontSizes());
    targetRange.setFontWeights(sourceRange.getFontWeights());
    targetRange.setFontColors(sourceRange.getFontColors());
    targetRange.setBackgrounds(sourceRange.getBackgrounds());
    targetRange.setHorizontalAlignments(sourceRange.getHorizontalAlignments());
    targetRange.setVerticalAlignments(sourceRange.getVerticalAlignments());

    logMessage(`Formatting copied from row ${sourceRow} to row ${targetRow}`);
  } catch (error) {
    logError("copyRowFormatting", error);
  }
}

// ============================================================================
// DATA AGGREGATION & METRICS
// ============================================================================

/**
 * Get monthly financial metrics: Total Income, Total Expense, Balance.
 * Reads all transaction rows in the ledger section (Row 86 onwards).
 *
 * @return {object} {totalIncome, totalExpense, balance}
 */
function getMonthlyMetrics() {
  try {
    const monthlySheet = getSheet("Tháng");
    if (!monthlySheet) {
      logError("getMonthlyMetrics", "Monthly sheet not found");
      return { totalIncome: 0, totalExpense: 0, balance: 0 };
    }

    const lastRow = monthlySheet.getLastRow();
    if (lastRow < LEDGER_DATA_START_ROW) {
      return { totalIncome: 0, totalExpense: 0, balance: 0 };
    }

    const numRows = lastRow - LEDGER_DATA_START_ROW + 1;
    // Ledger columns: A=Ngày, B=Món hàng, C=Danh mục, D=Chi phí
    const ledgerData = monthlySheet
      .getRange(LEDGER_DATA_START_ROW, 1, numRows, 4)
      .getValues();

    let totalIncome = 0;
    let totalExpense = 0;

    ledgerData.forEach((row) => {
      const category = trimString(String(row[2])); // Col C: Danh mục
      const amount = parseCurrency(String(row[3])); // Col D: Chi phí

      // Determine if this is income based on category label
      if (
        category.toLowerCase().includes("thu nhập") ||
        category.toLowerCase().includes("income") ||
        category.toLowerCase().includes("lương")
      ) {
        totalIncome += amount;
      } else if (amount > 0) {
        totalExpense += amount;
      }
    });

    const balance = totalIncome - totalExpense;
    logMessage(
      `Metrics: Income=${formatCurrency(totalIncome)}, Expense=${formatCurrency(totalExpense)}, Balance=${formatCurrency(balance)}`,
    );
    return { totalIncome, totalExpense, balance };
  } catch (error) {
    logError("getMonthlyMetrics", error);
    return { totalIncome: 0, totalExpense: 0, balance: 0 };
  }
}

/**
 * Get summary figures from the Row 80 formula cells.
 * Returns the computed values of B80 (budget total) and C80 (actual total).
 *
 * @return {object} {budgetTotal, actualTotal, difference}
 */
function getSummaryBoundaryValues() {
  try {
    const monthlySheet = getSheet("Tháng");
    if (!monthlySheet) return { budgetTotal: 0, actualTotal: 0, difference: 0 };

    const budgetTotal = monthlySheet.getRange(SUMMARY_ROW, 2).getValue() || 0;
    const actualTotal = monthlySheet.getRange(SUMMARY_ROW, 3).getValue() || 0;
    const difference = monthlySheet.getRange(SUMMARY_ROW, 4).getValue() || 0;

    return { budgetTotal, actualTotal, difference };
  } catch (error) {
    logError("getSummaryBoundaryValues", error);
    return { budgetTotal: 0, actualTotal: 0, difference: 0 };
  }
}

/**
 * Sync child category actual spending totals to their parent category header rows.
 * Reads ledger data and updates Col C of parent rows with summed child amounts.
 *
 * @return {boolean}
 */
function syncChildToParentTotals() {
  try {
    const monthlySheet = getSheet("Tháng");
    if (!monthlySheet) {
      logError("syncChildToParentTotals", "Monthly sheet not found");
      return false;
    }

    const categories = readCategoryConfig();
    const ledgerData = getLedgerData(monthlySheet);
    const parentMap = buildParentMap(categories);
    const parentNames = Object.keys(parentMap);

    let currentRow = 2;
    let parentIndex = 1;

    parentNames.forEach((parentName) => {
      const children = parentMap[parentName];
      const parentRow = currentRow;
      currentRow++;

      // Sum up all child category totals for this parent
      let parentTotal = 0;
      children.forEach((childName) => {
        const childTotal = sumLedgerByCategory(
          ledgerData,
          parentName,
          childName,
        );
        monthlySheet.getRange(currentRow, 3).setValue(childTotal);
        parentTotal += childTotal;
        currentRow++;
      });

      // Write parent total to Col C of parent row
      monthlySheet.getRange(parentRow, 3).setValue(parentTotal);
      parentIndex++;
    });

    logMessage("Child-to-parent totals synced");
    return true;
  } catch (error) {
    logError("syncChildToParentTotals", error);
    return false;
  }
}

/**
 * Read all ledger transaction rows from the monthly sheet.
 * @param {Sheet} sheet - The monthly sheet
 * @return {Array<Array>} 2D array of ledger row values
 */
function getLedgerData(sheet) {
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow < LEDGER_DATA_START_ROW) return [];
    const numRows = lastRow - LEDGER_DATA_START_ROW + 1;
    return sheet.getRange(LEDGER_DATA_START_ROW, 1, numRows, 4).getValues();
  } catch (error) {
    logError("getLedgerData", error);
    return [];
  }
}

/**
 * Sum all ledger amounts that match a given parent > child category label.
 * @param {Array<Array>} ledgerData - 2D array of ledger rows
 * @param {string} parentName - Parent category name
 * @param {string} childName  - Child category name
 * @return {number} Sum of matching transaction amounts
 */
function sumLedgerByCategory(ledgerData, parentName, childName) {
  try {
    const targetLabel = `${parentName} > ${childName}`.toLowerCase();
    let total = 0;
    ledgerData.forEach((row) => {
      const category = trimString(String(row[2])).toLowerCase();
      const amount = parseCurrency(String(row[3]));
      if (category === targetLabel) {
        total += amount;
      }
    });
    return total;
  } catch (error) {
    logError("sumLedgerByCategory", error);
    return 0;
  }
}

/**
 * Get grouped category data for the Grouping UI dialog.
 * @return {Array<object>} [{parentName, children: [], isCollapsed}, ...]
 */
function getGroupedCategoryData() {
  try {
    const categories = readCategoryConfig();
    const parentMap = buildParentMap(categories);
    return Object.keys(parentMap).map((parentName) => ({
      parentName: parentName,
      children: parentMap[parentName],
      isCollapsed: true,
    }));
  } catch (error) {
    logError("getGroupedCategoryData", error);
    return [];
  }
}

/**
 * Calculate total amounts grouped by parent category.
 * @param {Array<object>} categoryData - Array of {parent, child, amount}
 * @return {object} Map of parentName -> total amount
 */
function calculateCategoryTotals(categoryData) {
  try {
    const totals = {};
    categoryData.forEach((cat) => {
      if (!totals[cat.parent]) {
        totals[cat.parent] = 0;
      }
      totals[cat.parent] += cat.amount || 0;
    });
    return totals;
  } catch (error) {
    logError("calculateCategoryTotals", error);
    return {};
  }
}

// ============================================================================
// RANGE & DATA ACCESS HELPERS
// ============================================================================

/**
 * Find the first row that contains a specific value in a given column.
 * @param {Sheet}  sheet       - The sheet to search in
 * @param {number} columnIndex - Column index (1-based)
 * @param {*}      value       - Value to search for
 * @return {number} Row number (1-based), or -1 if not found
 */
function findRowByValue(sheet, columnIndex, value) {
  try {
    const lastRow = sheet.getLastRow();
    const data = sheet.getRange(1, columnIndex, lastRow).getValues();
    for (let i = 0; i < data.length; i++) {
      if (trimString(String(data[i][0])) === trimString(String(value))) {
        return i + 1;
      }
    }
    return -1;
  } catch (error) {
    logError("findRowByValue", error);
    return -1;
  }
}

/**
 * Get a safe, bounds-checked range from a named sheet.
 * @param {string} sheetName - Sheet name
 * @param {number} startRow  - First row (1-based)
 * @param {number} endRow    - Last row (1-based)
 * @param {number} startCol  - First column (1-based)
 * @param {number} endCol    - Last column (1-based)
 * @return {Range|null}
 */
function getRange(sheetName, startRow, endRow, startCol, endCol) {
  try {
    const sheet = getSheet(sheetName);
    if (!sheet) return null;
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (startRow < 1 || endRow > lastRow || startCol < 1 || endCol > lastCol) {
      logMessage("getRange: bounds out of range");
      return null;
    }
    return sheet.getRange(
      startRow,
      startCol,
      endRow - startRow + 1,
      endCol - startCol + 1,
    );
  } catch (error) {
    logError("getRange", error);
    return null;
  }
}

/**
 * Write a 2D array of values to a range with validation.
 * @param {Range}          range  - Target range
 * @param {Array<Array>}   values - 2D array to write
 * @return {boolean}
 */
function setValues(range, values) {
  try {
    if (!range || !values) {
      logError("setValues", "Range or values is null");
      return false;
    }
    range.setValues(values);
    return true;
  } catch (error) {
    logError("setValues", error);
    return false;
  }
}

/**
 * Read values from a range with error handling.
 * @param {Range} range - Source range
 * @return {Array<Array>}
 */
function getValues(range) {
  try {
    if (!range) {
      logError("getValues", "Range is null");
      return [];
    }
    return range.getValues();
  } catch (error) {
    logError("getValues", error);
    return [];
  }
}
