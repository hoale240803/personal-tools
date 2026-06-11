/**
 * MAIN.GS - Google Apps Script Main Orchestrator & Global Helpers
 *
 * CRITICAL: This file runs in a SINGLE GLOBAL SCOPE with no Node.js modules.
 * All functions here are globally accessible to UIService.gs and SpreadsheetService.gs
 *
 * ARCHITECTURE:
 * - All functions are in global scope (no require/import/export)
 * - Pure Google Apps Script (GAS) syntax only
 * - Helpers, Security, Orchestration consolidated here
 * - UIService.gs and SpreadsheetService.gs call these functions directly
 */

// ============================================================================
// GLOBAL STATE
// ============================================================================

// Global variables in Google Apps Script do not persist between different executions.
// We use CacheService for short-term session state like user authentication.

// ============================================================================
// LOGGING & DEBUG UTILITIES
// ============================================================================

/**
 * Log a message with consistent formatting.
 * @param {string} message - The message to log
 * @param {string} level - Log level: 'INFO', 'WARN', 'ERROR'
 * @return {void}
 */
function logMessage(message, level = "INFO") {
  const timestamp = new Date().toLocaleString("vi-VN");
  console.log(`[${level}] [${timestamp}] ${message}`);
}

/**
 * Log an error with stack trace.
 * @param {string} functionName - The function where error occurred
 * @param {Error|string} error - The error object or message
 * @return {void}
 */
function logError(functionName, error) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  logMessage(`${functionName} ERROR: ${errorMsg}`, "ERROR");
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Check if a value is null or undefined.
 * @param {*} value - The value to check
 * @return {boolean}
 */
function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

/**
 * Check if a string is empty or whitespace only.
 * @param {string} str - The string to check
 * @return {boolean}
 */
function isEmptyString(str) {
  return !str || str.trim().length === 0;
}

/**
 * Check if a value is a valid number.
 * @param {*} value - The value to check
 * @return {boolean}
 */
function isValidNumber(value) {
  return !isNaN(value) && isFinite(value);
}

// ============================================================================
// STRING & TEXT UTILITIES
// ============================================================================

/**
 * Capitalize the first letter of a string.
 * @param {string} str - The string to capitalize
 * @return {string}
 */
function capitalizeFirst(str) {
  if (isEmptyString(str)) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Trim whitespace from a string.
 * @param {string} str - The string to trim
 * @return {string}
 */
function trimString(str) {
  return (str || "").trim();
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Remove duplicates from an array.
 * @param {Array} array - The array to deduplicate
 * @return {Array}
 */
function removeDuplicates(array) {
  return [...new Set(array)];
}

// ============================================================================
// CURRENCY & NUMBERS
// ============================================================================

/**
 * Format a number as Vietnamese currency.
 * @param {number} amount - The amount to format
 * @return {string}
 */
function formatCurrency(amount) {
  if (!isValidNumber(amount)) return "0 đ";
  return amount.toLocaleString("vi-VN") + " đ";
}

/**
 * Parse a currency string to number.
 * @param {string} currencyStr - Currency string (e.g., "1,000 đ")
 * @return {number}
 */
function parseCurrency(currencyStr) {
  if (isEmptyString(currencyStr)) return 0;
  const cleaned = String(currencyStr).replace(/[^0-9.-]/g, "");
  return parseFloat(cleaned) || 0;
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Get current date in Vietnamese format (DD/MM/YYYY).
 * @return {string}
 */
function getCurrentDateVN() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format date object to Vietnamese format (DD/MM/YYYY).
 * @param {Date} date - The date object
 * @return {string}
 */
function formatDateVN(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// ============================================================================
// GOOGLE SHEETS & SETTINGS
// ============================================================================

/**
 * Load settings from settings.json file in Google Drive.
 * @return {object}
 */
/**
 * Load settings from PropertiesService (or initialize with defaults).
 * @return {object}
 */
function loadSettings() {
  try {
    const props = PropertiesService.getScriptProperties();
    // Try to load full SETTINGS first, then fallback to individual properties
    const settingsJson = props.getProperty("SETTINGS");
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
    // Fallback: read individual properties
    const passcode = props.getProperty("passcode") || "1234";
    return {
      security: { passcode: passcode, enabled: true },
      sheets: { dashboard: "Dashboard", config: "Config", monthly: "Tháng" },
      currency: { format: "0 đ", symbol: "đ" },
    };
  } catch (error) {
    logError("loadSettings", error);
    return { security: { passcode: "1234" } };
  }
}

/**
 * Save settings to PropertiesService.
 * @param {object} settings - The settings object to save
 * @return {boolean}
 */
function saveSettings(settings) {
  try {
    const props = PropertiesService.getScriptProperties();
    props.setProperty("SETTINGS", JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    logError("saveSettings", error);
    return false;
  }
}

/**
 * Show a simple alert dialog.
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @return {void}
 */
function showAlert(title, message) {
  SpreadsheetApp.getUi().alert(title + "\n\n" + message);
}

/**
 * Show a toast notification.
 * @param {string} message - Toast message
 * @param {string} title - Optional toast title
 * @param {number} timeout - Timeout in seconds
 * @return {void}
 */
function showToast(message, title = "", timeout = 3) {
  SpreadsheetApp.getActiveSpreadsheet().toast(message, title, timeout);
}

// ============================================================================
// SECURITY & AUTHENTICATION
// ============================================================================

/**
 * Load the stored passcode from settings.json.
 * @return {string}
 */
function loadPasscodeFromSettings() {
  try {
    const settings = loadSettings();
    return String((settings.security && settings.security.passcode) || "");
  } catch (error) {
    logError("loadPasscodeFromSettings", error);
    return "";
  }
}

/**
 * Validate user-provided passcode.
 * @param {string} input - User input from security modal
 * @return {boolean}
 */
function validatePasscode(input) {
  try {
    if (isEmptyString(input)) {
      return false;
    }
    const storedPasscode = loadPasscodeFromSettings();
    if (isEmptyString(storedPasscode)) {
      logError("validatePasscode", "No passcode configured");
      return false;
    }
    const isValid = String(input) === String(storedPasscode);
    if (isValid) {
      try {
        const cache = CacheService.getUserCache();
        cache.put("authenticated", "true", 1800); // Cache for 30 minutes
      } catch (cacheErr) {
        logError("validatePasscode CacheError", cacheErr);
      }
      logMessage("User authenticated");
    }
    return isValid;
  } catch (error) {
    logError("validatePasscode", error);
    return false;
  }
}

/**
 * Check if user is authenticated in current session.
 * @return {boolean}
 */
function isUserAuthenticated() {
  try {
    const cache = CacheService.getUserCache();
    const authenticated = cache.get("authenticated");
    return authenticated === "true";
  } catch (error) {
    logError("isUserAuthenticated", error);
    return false;
  }
}

/**
 * Authenticate user for this session.
 * @param {string} passcode - The passcode entered by user
 * @return {boolean}
 */
function authenticateUser(passcode) {
  return validatePasscode(passcode);
}

/**
 * Update the passcode in settings.
 * @param {string} newPasscode - The new passcode
 * @return {boolean}
 */
function setPasscode(newPasscode) {
  try {
    if (isEmptyString(newPasscode)) {
      return false;
    }
    const settings = loadSettings();
    settings.security = settings.security || {};
    settings.security.passcode = newPasscode;
    return saveSettings(settings);
  } catch (error) {
    logError("setPasscode", error);
    return false;
  }
}

/**
 * Check if security is enabled.
 * @return {boolean}
 */
function isSecurityEnabled() {
  try {
    const settings = loadSettings();
    return settings.security && settings.security.enabled === true;
  } catch (error) {
    return false;
  }
}

/**
 * Perform initial security check on script load.
 * @return {void}
 */
function performInitialSecurityCheck() {
  try {
    if (!isSecurityEnabled()) {
      logMessage("Security disabled - skipping authentication");
      return;
    }
    if (isUserAuthenticated()) {
      logMessage("User already authenticated");
      return;
    }
    showSecurityModal("renderDashboard");
  } catch (error) {
    logError("performInitialSecurityCheck", error);
  }
}

// ============================================================================
// INITIALIZATION & MENU
// ============================================================================

/**
 * Trigger when spreadsheet opens - sets up custom menu.
 * @return {void}
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu("💰 Quản Lý Chi Phí")
      .addItem("☰ Menu Nhanh", "onSidebarClick")
      .addSeparator()
      .addItem("📊 Dashboard", "onDashboardClick")
      .addItem("➕ Thêm Giao Dịch", "onAddTransactionClick")
      .addItem("📈 Báo Cáo", "onReportClick")
      .addSeparator()
      .addItem("⚙️ Quản Lý Danh Mục", "onConfigClick")
      .addItem("📂 Quản Lý Nhóm", "onGroupingClick")
      .addSeparator()
      .addItem("🔄 Xây Dựng Lại Layout", "onRebuildLayoutClick")
      .addSeparator()
      .addItem("🔐 Bảo Mật", "onSecurityClick")
      .addItem("ℹ️ Thông Tin", "onInfoClick")
      .addToUi();
    logMessage("Menu created");
    performInitialSecurityCheck();
  } catch (error) {
    logError("onOpen", error);
  }
}

/**
 * Trigger when spreadsheet is edited.
 * @param {Event} e - The event object
 * @return {void}
 */
function onEdit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const range = e.range;
    const sheetName = sheet.getName();
    logMessage(`Edit on ${sheetName}: ${range.getA1Notation()}`);
  } catch (error) {
    logError("onEdit", error);
  }
}

// ============================================================================
// MENU EVENT HANDLERS
// ============================================================================

/**
 * Handle Dashboard menu click.
 * @return {void}
 */
/**
 * Handle Sidebar menu click.
 * @return {void}
 */
function onSidebarClick() {
  try {
    if (!isUserAuthenticated()) {
      showSecurityModal("showSidebar");
      return;
    }
    showSidebar();
  } catch (error) {
    logError("onSidebarClick", error);
  }
}

/**
 * Handle Dashboard menu click.
 * @return {void}
 */
function onDashboardClick() {
  try {
    if (!isUserAuthenticated()) {
      showSecurityModal("renderDashboard");
      return;
    }
    renderDashboard();
  } catch (error) {
    logError("onDashboardClick", error);
    showAlert("Lỗi", "Không thể mở dashboard");
  }
}

/**
 * Handle Add Transaction menu click.
 * @return {void}
 */
function onAddTransactionClick() {
  try {
    if (!isUserAuthenticated()) {
      showSecurityModal("showAddTransactionDialog");
      return;
    }
    showAddTransactionDialog();
  } catch (error) {
    logError("onAddTransactionClick", error);
    showAlert("Lỗi", "Không thể mở form thêm giao dịch");
  }
}

/**
 * Handle Report menu click.
 * @return {void}
 */
function onReportClick() {
  try {
    if (!isUserAuthenticated()) {
      showSecurityModal("showReportDialog");
      return;
    }
    showReportDialog();
  } catch (error) {
    logError("onReportClick", error);
    showAlert("Lỗi", "Không thể mở báo cáo");
  }
}

/**
 * Handle Rebuild Layout menu click.
 * @return {void}
 */
function onRebuildLayoutClick() {
  try {
    if (!isUserAuthenticated()) {
      showSecurityModal("buildMonthlySheetLayout");
      return;
    }
    const ok = buildMonthlySheetLayout();
    if (ok) showToast("✅ Layout xây dựng lại thành công");
    else    showAlert("Lỗi", "Không thể xây dựng lại layout");
  } catch (error) {
    logError("onRebuildLayoutClick", error);
  }
}

/**
 * Handle Category Configuration menu click.
 * @return {void}
 */
function onConfigClick() {
  try {
    if (!isUserAuthenticated()) {
      showSecurityModal("renderCategoryUI");
      return;
    }
    renderCategoryUI();
  } catch (error) {
    logError("onConfigClick", error);
    showAlert("Lỗi", "Không thể mở cấu hình");
  }
}

/**
 * Handle Grouping management menu click.
 * @return {void}
 */
function onGroupingClick() {
  try {
    if (!isUserAuthenticated()) {
      showSecurityModal("renderGroupingUI");
      return;
    }
    renderGroupingUI();
  } catch (error) {
    logError("onGroupingClick", error);
    showAlert("Lỗi", "Không thể mở quản lý nhóm");
  }
}

/**
 * Handle Security menu click.
 * @return {void}
 */
function onSecurityClick() {
  try {
    if (!isUserAuthenticated()) {
      showSecurityModal("showSecuritySettings");
      return;
    }
    showSecuritySettings();
  } catch (error) {
    logError("onSecurityClick", error);
    showAlert("Lỗi", "Không thể mở bảo mật");
  }
}

/**
 * Handle Info menu click.
 * @return {void}
 */
function onInfoClick() {
  try {
    const infoText = `
📊 Công Cụ Quản Lý Chi Phí - v1.0

🎯 Chức Năng:
• Dashboard: Xem tóm tắt tài chính
• Cấu Hình: Quản lý hạng mục (Cha-Con)
• Quản Lý Nhóm: Expand/Collapse categories
• Bảo Mật: Thay đổi mã truy cập

📝 Ghi Chú:
• Dữ liệu lưu tại row 85+ (ledger)
• Format tiền: 0 đ (VND)
• Copy formatting tự động
    `;
    SpreadsheetApp.getUi().alert(infoText);
  } catch (error) {
    logError("onInfoClick", error);
  }
}

// ============================================================================
// INITIALIZATION HELPERS
// ============================================================================

/**
 * Initialize spreadsheet with required sheets.
 * @return {void}
 */
function initializeSpreadsheet() {
  try {
    const sheetNames = getSheetNames();
    if (!sheetNames.includes("Config")) {
      createSheet("Config", ["Hạng Mục Cha", "Hạng Mục Con"]);
    }
    if (!sheetNames.includes("Dashboard")) {
      createSheet("Dashboard", ["Chỉ Số", "Giá Trị"]);
    }
    if (!sheetNames.includes("Tháng")) {
      createSheet("Tháng", ["Ngày", "Loại", "Tài Khoản", "Số Tiền", "Mô Tả"]);
    }
    showToast("✅ Khởi tạo xong");
    logMessage("Spreadsheet initialized");
  } catch (error) {
    logError("initializeSpreadsheet", error);
    showAlert("Lỗi", "Không thể khởi tạo");
  }
}

/**
 * Reset application to default state.
 * @return {void}
 */
function resetApplication() {
  try {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      "⚠️ Thao tác này sẽ xóa tất cả dữ liệu!",
      "Tiếp tục?",
      ui.ButtonSet.YES_NO,
    );
    if (response !== ui.Button.YES) {
      logMessage("Reset cancelled");
      return;
    }
    const configSheet = getSheet("Config");
    if (configSheet && configSheet.getLastRow() > 1) {
      configSheet.deleteRows(2, configSheet.getLastRow() - 1);
    }
    try {
      CacheService.getUserCache().remove("authenticated");
    } catch (cacheError) {
      logError("resetApplication CacheError", cacheError);
    }
    showToast("✅ Đặt lại xong");
  } catch (error) {
    logError("resetApplication", error);
  }
}

// ============================================================================
// CUSTOM FUNCTIONS
// ============================================================================

/**
 * Custom function: =getTotalIncome()
 * @return {number}
 */
function getTotalIncome() {
  try {
    const metrics = getMonthlyMetrics();
    return metrics.totalIncome || 0;
  } catch (error) {
    logError("getTotalIncome", error);
    return 0;
  }
}

/**
 * Custom function: =getTotalExpense()
 * @return {number}
 */
function getTotalExpense() {
  try {
    const metrics = getMonthlyMetrics();
    return metrics.totalExpense || 0;
  } catch (error) {
    logError("getTotalExpense", error);
    return 0;
  }
}

/**
 * Custom function: =getBalance()
 * @return {number}
 */
function getBalance() {
  try {
    const metrics = getMonthlyMetrics();
    return metrics.balance || 0;
  } catch (error) {
    logError("getBalance", error);
    return 0;
  }
}
