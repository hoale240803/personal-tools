/**
 * UISERVICE.GS - User Interface & UI Rendering
 *
 * Implements all UI components per ui-promt2.md:
 * - Security modal (passcode prompt)
 * - HTML Sidebar "MENU NHANH" with 5 navigation links
 * - Dashboard with 3 KPI cards (green/red/orange)
 * - Category configuration CRUD table
 * - Grouping / collapse-expand UI
 * - Security settings (change passcode)
 *
 * All functions are in global scope. Calls helpers from Main.gs.
 */

// ============================================================================
// SECURITY MODAL DIALOG
// ============================================================================

/**
 * Display the security passcode modal dialog.
 * Blocks access to all financial data until the correct passcode is entered.
 * On success, triggers the specified next action function.
 *
 * @param {string} nextAction - Name of the GAS function to call after authentication
 * @return {void}
 */
function showSecurityModal(nextAction) {
  try {
    const safeNextAction = nextAction || "";
    const ui = SpreadsheetApp.getUi();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #1e2a4a 0%, #2c3e6b 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
          }
          .card {
            background: white;
            padding: 36px 32px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.25);
            width: 100%;
            max-width: 360px;
            text-align: center;
          }
          .icon { font-size: 40px; margin-bottom: 12px; }
          h2 {
            color: #1e2a4a;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 6px;
          }
          .subtitle {
            color: #6b7280;
            font-size: 13px;
            margin-bottom: 24px;
          }
          .form-group { margin-bottom: 20px; text-align: left; }
          label {
            display: block;
            margin-bottom: 6px;
            color: #374151;
            font-weight: 600;
            font-size: 13px;
          }
          input[type="password"] {
            width: 100%;
            padding: 12px 14px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 18px;
            letter-spacing: 6px;
            transition: border-color 0.2s;
          }
          input[type="password"]:focus {
            outline: none;
            border-color: #1e2a4a;
          }
          .error-msg {
            color: #dc2626;
            font-size: 12px;
            margin-top: 6px;
            display: none;
          }
          .btn-group { display: flex; gap: 10px; margin-top: 8px; }
          button {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          button:hover { opacity: 0.88; }
          .btn-confirm { background: #1e2a4a; color: white; }
          .btn-cancel  { background: #f3f4f6; color: #374151; }
          .loading { display: none; font-size: 12px; color: #6b7280; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🔐</div>
          <h2>Xác Thực Bảo Mật</h2>
          <p class="subtitle">Nhập mã truy cập để tiếp tục</p>

          <form id="securityForm" onsubmit="handleSubmit(event)">
            <div class="form-group">
              <label for="passcode">Mã Truy Cập</label>
              <input type="password" id="passcode" placeholder="••••" required autofocus maxlength="20" />
              <div class="error-msg" id="errorMsg">❌ Mã không chính xác, vui lòng thử lại.</div>
            </div>
            <div class="btn-group">
              <button type="submit" class="btn-confirm">✅ Xác Thực</button>
              <button type="button" class="btn-cancel" onclick="google.script.host.close()">Hủy</button>
            </div>
            <div class="loading" id="loadingMsg">⏳ Đang xác thực...</div>
          </form>
        </div>

        <script>
          const nextAction = "${safeNextAction}";

          function handleSubmit(event) {
            event.preventDefault();
            const passcode = document.getElementById('passcode').value;
            document.getElementById('errorMsg').style.display = 'none';
            document.getElementById('loadingMsg').style.display = 'block';

            google.script.run
              .withSuccessHandler(function(isValid) {
                document.getElementById('loadingMsg').style.display = 'none';
                if (isValid) {
                  if (nextAction) {
                    google.script.run[nextAction]();
                  }
                  google.script.host.close();
                } else {
                  document.getElementById('errorMsg').style.display = 'block';
                  document.getElementById('passcode').value = '';
                  document.getElementById('passcode').focus();
                }
              })
              .withFailureHandler(function(err) {
                document.getElementById('loadingMsg').style.display = 'none';
                document.getElementById('errorMsg').textContent = '❌ Lỗi hệ thống: ' + err;
                document.getElementById('errorMsg').style.display = 'block';
              })
              .validatePasscode(passcode);
          }
        </script>
      </body>
      </html>
    `;

    ui.showModalDialog(
      HtmlService.createHtmlOutput(htmlContent).setWidth(400).setHeight(340),
      "🔐 Bảo Mật Tài Chính",
    );
  } catch (error) {
    logError("showSecurityModal", error);
  }
}

// ============================================================================
// SIDEBAR - MENU NHANH
// ============================================================================

/**
 * Show the HTML Sidebar "MENU NHANH" with 5 navigation links.
 * Links: Tổng quan | Thêm giao dịch | Báo cáo | Quản lý danh mục | Cài đặt
 *
 * @return {void}
 */
function showSidebar() {
  try {
    const ui = SpreadsheetApp.getUi();
    const summary = getSummaryBoundaryValues();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #f8fafc;
            color: #1e2a4a;
          }
          .sidebar-header {
            background: linear-gradient(135deg, #1e2a4a 0%, #2c3e6b 100%);
            color: white;
            padding: 20px 16px 16px;
            text-align: center;
          }
          .sidebar-header h1 { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
          .sidebar-header p  { font-size: 11px; opacity: 0.75; }

          .kpi-strip {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 12px;
            background: white;
            border-bottom: 1px solid #e5e7eb;
          }
          .kpi-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 12px;
            border-radius: 8px;
            font-size: 12px;
          }
          .kpi-item .label { font-weight: 600; }
          .kpi-item .value { font-weight: 700; font-size: 13px; }
          .kpi-green  { background: #d4edda; color: #155724; }
          .kpi-red    { background: #f8d7da; color: #721c24; }
          .kpi-orange { background: #fff3cd; color: #856404; }

          .menu-section { padding: 12px; }
          .menu-title {
            font-size: 10px;
            font-weight: 700;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 8px;
            padding-left: 4px;
          }
          .menu-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            padding: 11px 14px;
            margin-bottom: 4px;
            background: white;
            border: 1.5px solid #e5e7eb;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            color: #1e2a4a;
            cursor: pointer;
            text-align: left;
            transition: all 0.15s;
          }
          .menu-btn:hover {
            background: #1e2a4a;
            color: white;
            border-color: #1e2a4a;
          }
          .menu-btn .icon { font-size: 16px; width: 20px; text-align: center; }

          .footer {
            padding: 10px 16px;
            font-size: 10px;
            color: #9ca3af;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="sidebar-header">
          <h1>💰 Quản Lý Chi Phí</h1>
          <p>SIDEBAR / MENU NHANH</p>
        </div>

        <div class="kpi-strip">
          <div class="kpi-item kpi-green">
            <span class="label">💰 Tổng Thu</span>
            <span class="value" id="income">-- đ</span>
          </div>
          <div class="kpi-item kpi-red">
            <span class="label">📉 Tổng Chi</span>
            <span class="value" id="expense">-- đ</span>
          </div>
          <div class="kpi-item kpi-orange">
            <span class="label">💳 Số Dư Còn Lại</span>
            <span class="value" id="balance">-- đ</span>
          </div>
        </div>

        <div class="menu-section">
          <div class="menu-title">Điều Hướng</div>

          <button class="menu-btn" onclick="runAction('renderDashboard')">
            <span class="icon">📊</span> Tổng quan
          </button>
          <button class="menu-btn" onclick="runAction('showAddTransactionDialog')">
            <span class="icon">➕</span> Thêm giao dịch
          </button>
          <button class="menu-btn" onclick="runAction('showReportDialog')">
            <span class="icon">📈</span> Báo cáo
          </button>
          <button class="menu-btn" onclick="runAction('renderCategoryUI')">
            <span class="icon">🗂️</span> Quản lý danh mục
          </button>
          <button class="menu-btn" onclick="runAction('showSecuritySettingsFromSidebar')">
            <span class="icon">⚙️</span> Cài đặt
          </button>
        </div>

        <div class="footer">Expense Management Tool v2.0</div>

        <script>
          function runAction(action) {
            google.script.run
              .withFailureHandler(function(err) {
                console.error('Action failed:', err);
              })
              [action]();
          }

          // Load live metrics on sidebar open
          google.script.run
            .withSuccessHandler(function(metrics) {
              document.getElementById('income').textContent  = formatNum(metrics.totalIncome);
              document.getElementById('expense').textContent = formatNum(metrics.totalExpense);
              document.getElementById('balance').textContent = formatNum(metrics.balance);
            })
            .getMonthlyMetrics();

          function formatNum(n) {
            if (!n && n !== 0) return '-- đ';
            return Number(n).toLocaleString('vi-VN') + ' đ';
          }
        </script>
      </body>
      </html>
    `;

    ui.showSidebar(
      HtmlService.createHtmlOutput(htmlContent)
        .setTitle("Menu Nhanh")
        .setWidth(280),
    );
  } catch (error) {
    logError("showSidebar", error);
  }
}

// ============================================================================
// DASHBOARD - KPI CARDS
// ============================================================================

/**
 * Render the main dashboard in a modeless dialog.
 * Displays 3 KPI metric cards:
 *   - Tổng Thu (soft green bg, dark green text)
 *   - Tổng Chi (soft red bg, dark red text)
 *   - Số Dư Còn Lại (soft orange bg, dark orange text)
 *
 * @return {void}
 */
function renderDashboard() {
  try {
    const ui = SpreadsheetApp.getUi();
    const metrics = getMonthlyMetrics();
    const summary = getSummaryBoundaryValues();

    const totalIncome = metrics.totalIncome || 0;
    const totalExpense = metrics.totalExpense || 0;
    const balance = totalIncome - totalExpense;
    const budgetTotal = summary.budgetTotal || 0;
    const actualTotal = summary.actualTotal || 0;

    const balanceBg = balance >= 0 ? "#d4edda" : "#f8d7da";
    const balanceText = balance >= 0 ? "#155724" : "#721c24";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #1e2a4a 0%, #2c3e6b 100%);
            min-height: 100vh;
            padding: 24px 20px;
          }
          .dashboard { max-width: 860px; margin: 0 auto; }
          .header {
            color: white;
            text-align: center;
            margin-bottom: 28px;
          }
          .header h1 { font-size: 26px; font-weight: 300; letter-spacing: -0.5px; }
          .header p  { font-size: 13px; opacity: 0.7; margin-top: 4px; }

          /* KPI cards */
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }
          .kpi-card {
            border-radius: 12px;
            padding: 24px 20px;
            text-align: center;
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          }
          .kpi-card.green  { background: #d4edda; color: #155724; }
          .kpi-card.red    { background: #f8d7da; color: #721c24; }
          .kpi-card.orange { background: #fff3cd; color: #856404; }
          .kpi-card.dynamic { background: ${balanceBg}; color: ${balanceText}; }

          .kpi-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
          .kpi-value { font-size: 24px; font-weight: 800; }
          .kpi-icon  { font-size: 28px; margin-bottom: 8px; }

          /* Budget summary strip */
          .budget-strip {
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 16px 20px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .budget-strip .item { text-align: center; color: white; }
          .budget-strip .item .label { font-size: 11px; opacity: 0.7; margin-bottom: 4px; }
          .budget-strip .item .val   { font-size: 16px; font-weight: 700; }

          /* Action buttons */
          .action-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
          }
          .btn {
            padding: 11px 22px;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            color: white;
            transition: opacity 0.2s;
          }
          .btn:hover { opacity: 0.85; }
          .btn-blue   { background: #2563eb; }
          .btn-orange { background: #d97706; }
          .btn-green  { background: #16a34a; }
          .btn-navy   { background: #1e2a4a; }
        </style>
      </head>
      <body>
        <div class="dashboard">
          <div class="header">
            <h1>📊 Dashboard Tài Chính</h1>
            <p>Tóm tắt chi tiêu tháng hiện tại</p>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card green">
              <div class="kpi-icon">💰</div>
              <div class="kpi-label">Tổng Thu Nhập</div>
              <div class="kpi-value">${formatCurrency(totalIncome)}</div>
            </div>
            <div class="kpi-card red">
              <div class="kpi-icon">📉</div>
              <div class="kpi-label">Tổng Chi Phí</div>
              <div class="kpi-value">${formatCurrency(totalExpense)}</div>
            </div>
            <div class="kpi-card dynamic">
              <div class="kpi-icon">💳</div>
              <div class="kpi-label">Số Dư Còn Lại</div>
              <div class="kpi-value">${formatCurrency(balance)}</div>
            </div>
          </div>

          <div class="budget-strip">
            <div class="item">
              <div class="label">📋 Tổng Dự Tính</div>
              <div class="val">${formatCurrency(budgetTotal)}</div>
            </div>
            <div class="item">
              <div class="label">📌 Thực Tế (Row 80)</div>
              <div class="val">${formatCurrency(actualTotal)}</div>
            </div>
            <div class="item">
              <div class="label">📐 Chênh Lệch</div>
              <div class="val">${formatCurrency(budgetTotal - actualTotal)}</div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn btn-navy"   onclick="run('showSidebar')">☰ Menu Nhanh</button>
            <button class="btn btn-blue"   onclick="run('renderCategoryUI')">⚙️ Danh Mục</button>
            <button class="btn btn-orange" onclick="run('renderGroupingUI')">📂 Nhóm Danh Mục</button>
            <button class="btn btn-green"  onclick="run('showAddTransactionDialog')">➕ Thêm Giao Dịch</button>
          </div>
        </div>

        <script>
          function run(action) {
            google.script.run
              .withFailureHandler(e => console.error(e))
              [action]();
          }
        </script>
      </body>
      </html>
    `;

    ui.showModelessDialog(
      HtmlService.createHtmlOutput(htmlContent).setWidth(860).setHeight(480),
      "📊 Dashboard",
    );
  } catch (error) {
    logError("renderDashboard", error);
    showAlert("Lỗi", "Không thể hiển thị dashboard");
  }
}

// ============================================================================
// ADD TRANSACTION DIALOG
// ============================================================================

/**
 * Show a dialog for manually adding a new transaction to the ledger.
 * Allows user to specify date, description, category, and amount.
 *
 * @return {void}
 */
function showAddTransactionDialog() {
  try {
    const ui = SpreadsheetApp.getUi();
    const categories = readCategoryConfig();

    let categoryOptions = '<option value="">-- Chưa phân loại --</option>';
    const parentMap = buildParentMap(categories);
    Object.keys(parentMap).forEach((parent) => {
      parentMap[parent].forEach((child) => {
        const label = `${parent} > ${child}`;
        categoryOptions += `<option value="${label}">${label}</option>`;
      });
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: #f8fafc; }
          h2 { color: #1e2a4a; margin-bottom: 20px; font-size: 18px; }
          .form-group { margin-bottom: 16px; }
          label { display: block; margin-bottom: 5px; font-weight: 600; font-size: 13px; color: #374151; }
          input, select {
            width: 100%;
            padding: 10px 12px;
            border: 1.5px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            color: #1e2a4a;
          }
          input:focus, select:focus { outline: none; border-color: #1e2a4a; }
          .btn-group { display: flex; gap: 10px; margin-top: 20px; }
          button {
            flex: 1;
            padding: 11px;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
          }
          .btn-save   { background: #1e2a4a; color: white; }
          .btn-cancel { background: #f3f4f6; color: #374151; }
          .success-msg { display: none; color: #155724; background: #d4edda; padding: 10px; border-radius: 6px; text-align: center; margin-top: 10px; }
        </style>
      </head>
      <body>
        <h2>➕ Thêm Giao Dịch</h2>

        <div class="form-group">
          <label>📅 Ngày</label>
          <input type="date" id="txDate" />
        </div>
        <div class="form-group">
          <label>📝 Món hàng / Diễn giải</label>
          <input type="text" id="txDesc" placeholder="Ví dụ: Phí làm móng tháng 6" />
        </div>
        <div class="form-group">
          <label>🗂️ Danh mục</label>
          <select id="txCategory">${categoryOptions}</select>
        </div>
        <div class="form-group">
          <label>💵 Chi phí (đ)</label>
          <input type="number" id="txAmount" placeholder="0" min="0" />
        </div>

        <div class="btn-group">
          <button class="btn-save" onclick="saveTransaction()">💾 Lưu</button>
          <button class="btn-cancel" onclick="google.script.host.close()">Hủy</button>
        </div>
        <div class="success-msg" id="successMsg">✅ Giao dịch đã được ghi nhận!</div>

        <script>
          // Set today as default date
          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const dd = String(today.getDate()).padStart(2, '0');
          document.getElementById('txDate').value = yyyy + '-' + mm + '-' + dd;

          function saveTransaction() {
            const dateVal = document.getElementById('txDate').value;
            const desc    = document.getElementById('txDesc').value.trim();
            const cat     = document.getElementById('txCategory').value;
            const amount  = parseFloat(document.getElementById('txAmount').value) || 0;

            if (!dateVal || !desc || amount <= 0) {
              alert('Vui lòng điền đầy đủ ngày, diễn giải và chi phí.');
              return;
            }

            // Convert YYYY-MM-DD to DD/MM/YYYY
            const parts = dateVal.split('-');
            const formattedDate = parts[2] + '/' + parts[1] + '/' + parts[0];

            google.script.run
              .withSuccessHandler(function(ok) {
                if (ok) {
                  document.getElementById('successMsg').style.display = 'block';
                  setTimeout(() => google.script.host.close(), 1200);
                } else {
                  alert('❌ Không thể lưu giao dịch. Vui lòng thử lại.');
                }
              })
              .withFailureHandler(function(err) {
                alert('Lỗi: ' + err);
              })
              .insertTransaction(formattedDate, desc, amount, cat);
          }
        </script>
      </body>
      </html>
    `;

    ui.showModalDialog(
      HtmlService.createHtmlOutput(htmlContent).setWidth(420).setHeight(460),
      "➕ Thêm Giao Dịch",
    );
  } catch (error) {
    logError("showAddTransactionDialog", error);
    showAlert("Lỗi", "Không thể mở form thêm giao dịch");
  }
}

// ============================================================================
// REPORT DIALOG
// ============================================================================

/**
 * Show a basic spending report dialog grouped by category.
 * Lists each category pair with total spending from the ledger.
 *
 * @return {void}
 */
function showReportDialog() {
  try {
    const ui = SpreadsheetApp.getUi();
    const grouped = getGroupedCategoryData();
    const metrics = getMonthlyMetrics();

    let tableRows = "";
    if (grouped.length === 0) {
      tableRows =
        '<tr><td colspan="3" style="text-align:center;color:#9ca3af;padding:20px;">Chưa có danh mục</td></tr>';
    } else {
      grouped.forEach((group) => {
        tableRows += `
          <tr style="background:#e8ecf0;font-weight:700;">
            <td colspan="3">${group.parentName}</td>
          </tr>
        `;
        group.children.forEach((child) => {
          tableRows += `
            <tr>
              <td style="padding-left:20px;">↳ ${child}</td>
              <td>${group.parentName} > ${child}</td>
              <td style="text-align:right;">-- đ</td>
            </tr>
          `;
        });
      });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: #f8fafc; }
          h2 { color: #1e2a4a; margin-bottom: 16px; font-size: 18px; }
          .summary {
            display: flex; gap: 12px; margin-bottom: 20px;
          }
          .sum-card {
            flex: 1; padding: 12px; border-radius: 8px; text-align: center;
          }
          .sum-card.g { background: #d4edda; color: #155724; }
          .sum-card.r { background: #f8d7da; color: #721c24; }
          .sum-card.o { background: #fff3cd; color: #856404; }
          .sum-card .label { font-size: 10px; font-weight: 700; text-transform: uppercase; }
          .sum-card .val   { font-size: 15px; font-weight: 800; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #1e2a4a; color: white; padding: 10px 12px; text-align: left; }
          td { padding: 9px 12px; border-bottom: 1px solid #e5e7eb; }
          tr:hover td { background: #f0f4f8; }
          .close-btn {
            margin-top: 16px; width: 100%; padding: 10px;
            background: #1e2a4a; color: white;
            border: none; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer;
          }
        </style>
      </head>
      <body>
        <h2>📈 Báo Cáo Chi Tiêu</h2>

        <div class="summary">
          <div class="sum-card g">
            <div class="label">Tổng Thu</div>
            <div class="val">${formatCurrency(metrics.totalIncome)}</div>
          </div>
          <div class="sum-card r">
            <div class="label">Tổng Chi</div>
            <div class="val">${formatCurrency(metrics.totalExpense)}</div>
          </div>
          <div class="sum-card o">
            <div class="label">Số Dư</div>
            <div class="val">${formatCurrency(metrics.totalIncome - metrics.totalExpense)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Danh mục</th>
              <th>Nhãn</th>
              <th style="text-align:right;">Thực tế</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>

        <button class="close-btn" onclick="google.script.host.close()">✕ Đóng</button>
      </body>
      </html>
    `;

    ui.showModelessDialog(
      HtmlService.createHtmlOutput(htmlContent).setWidth(600).setHeight(500),
      "📈 Báo Cáo",
    );
  } catch (error) {
    logError("showReportDialog", error);
    showAlert("Lỗi", "Không thể hiển thị báo cáo");
  }
}

// ============================================================================
// CATEGORY CONFIGURATION UI
// ============================================================================

/**
 * Render the Category Configuration CRUD interface.
 * Lists all parent-child category pairs with Add and Delete controls.
 *
 * @return {void}
 */
function renderCategoryUI() {
  try {
    const ui = SpreadsheetApp.getUi();
    const categories = readCategoryConfig();

    let categoryRows = "";
    if (categories && categories.length > 0) {
      categories.forEach((cat, index) => {
        categoryRows += `
          <tr>
            <td>${index + 1}</td>
            <td><strong>${cat.parent || ""}</strong></td>
            <td>${cat.child || ""}</td>
            <td>
              <button class="btn-del" onclick="deleteCategory(${index})">🗑️ Xóa</button>
            </td>
          </tr>
        `;
      });
    } else {
      categoryRows =
        '<tr><td colspan="4" style="text-align:center;color:#9ca3af;padding:20px;">Chưa có hạng mục</td></tr>';
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: #f8fafc; }
          h1 { color: #1e2a4a; margin-bottom: 20px; font-size: 20px; }
          .add-form {
            background: white;
            padding: 18px;
            border-radius: 10px;
            border-left: 4px solid #1e2a4a;
            margin-bottom: 24px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.06);
          }
          .add-form h3 { color: #1e2a4a; margin-bottom: 14px; font-size: 14px; }
          .form-row { display: flex; gap: 10px; margin-bottom: 12px; }
          input[type="text"] {
            flex: 1; padding: 10px 12px;
            border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px;
          }
          input:focus { outline: none; border-color: #1e2a4a; }
          .btn-add {
            padding: 10px 20px; background: #16a34a; color: white;
            border: none; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer;
          }
          .btn-add:hover { opacity: 0.88; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th {
            background: #1e2a4a; color: white;
            padding: 10px 12px; text-align: left;
          }
          td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
          tr:hover td { background: #f0f4f8; }
          .btn-del {
            padding: 5px 12px; font-size: 12px; background: #dc2626;
            color: white; border: none; border-radius: 5px; cursor: pointer;
          }
          .btn-del:hover { opacity: 0.85; }
          .rebuild-btn {
            margin-top: 16px; width: 100%; padding: 11px;
            background: #1e2a4a; color: white;
            border: none; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer;
          }
        </style>
      </head>
      <body>
        <h1>⚙️ Quản Lý Danh Mục</h1>

        <div class="add-form">
          <h3>➕ Thêm Danh Mục Mới</h3>
          <div class="form-row">
            <input type="text" id="parentCat" placeholder="Danh mục cha (vd: Ăn uống)" />
            <input type="text" id="childCat"  placeholder="Danh mục con (vd: Cà phê)"  />
          </div>
          <button class="btn-add" onclick="addCategory()">+ Thêm</button>
        </div>

        <h3 style="margin-bottom:10px;color:#1e2a4a;font-size:14px;">📋 Danh Sách Hiện Tại</h3>
        <table>
          <thead>
            <tr><th width="40">STT</th><th>Danh mục cha</th><th>Danh mục con</th><th width="80">Xóa</th></tr>
          </thead>
          <tbody id="catTable">${categoryRows}</tbody>
        </table>

        <button class="rebuild-btn" onclick="rebuildLayout()">🔄 Áp dụng & Xây dựng lại Layout</button>

        <script>
          function renderTable(categories) {
            const tbody = document.getElementById('catTable');
            if (categories && categories.length > 0) {
              let rows = '';
              for (let i = 0; i < categories.length; i++) {
                const cat = categories[i];
                rows += '<tr>' +
                  '<td>' + (i + 1) + '</td>' +
                  '<td><strong>' + (cat.parent || '') + '</strong></td>' +
                  '<td>' + (cat.child || '') + '</td>' +
                  '<td>' +
                    '<button class="btn-del" onclick="deleteCategory(' + i + ')">🗑️ Xóa</button>' +
                  '</td>' +
                '</tr>';
              }
              tbody.innerHTML = rows;
            } else {
              tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#9ca3af;padding:20px;">Chưa có hạng mục</td></tr>';
            }
          }

          function addCategory() {
            const parent = document.getElementById('parentCat').value.trim();
            const child  = document.getElementById('childCat').value.trim();
            if (!parent || !child) {
              alert('Vui lòng nhập cả danh mục cha và con');
              return;
            }
            google.script.run
              .withSuccessHandler(function(updatedCategories) {
                document.getElementById('parentCat').value = '';
                document.getElementById('childCat').value  = '';
                renderTable(updatedCategories);
              })
              .withFailureHandler(function(e) { alert('Lỗi: ' + e); })
              .addCategoryToConfig(parent, child);
          }

          function deleteCategory(index) {
            if (!confirm('Xóa danh mục này?')) return;
            google.script.run
              .withSuccessHandler(function(updatedCategories) {
                renderTable(updatedCategories);
              })
              .withFailureHandler(function(e) { alert('Lỗi: ' + e); })
              .deleteCategoryFromConfig(index);
          }

          function rebuildLayout() {
            if (!confirm('Thao tác này sẽ xây dựng lại bảng kế hoạch (Rows 1-85). Tiếp tục?')) return;
            google.script.run
              .withSuccessHandler(function(ok) {
                if (ok) alert('✅ Layout đã được xây dựng lại thành công!');
                else    alert('❌ Có lỗi xảy ra. Vui lòng kiểm tra log.');
              })
              .withFailureHandler(function(e) { alert('Lỗi: ' + e); })
              .buildMonthlySheetLayout();
          }
        </script>
      </body>
      </html>
    `;

    ui.showModelessDialog(
      HtmlService.createHtmlOutput(htmlContent).setWidth(680).setHeight(560),
      "⚙️ Quản Lý Danh Mục",
    );
  } catch (error) {
    logError("renderCategoryUI", error);
    showAlert("Lỗi", "Không thể hiển thị cấu hình");
  }
}

// ============================================================================
// GROUPING UI
// ============================================================================

/**
 * Render the Grouping interface showing the parent-child category hierarchy.
 * Provides Expand All / Collapse All controls.
 *
 * @return {void}
 */
function renderGroupingUI() {
  try {
    const ui = SpreadsheetApp.getUi();
    const groupedData = getGroupedCategoryData();

    let groupsHTML = "";
    if (groupedData && groupedData.length > 0) {
      groupedData.forEach((group) => {
        const childItems = group.children
          .map((child) => `<div class="child-item">↳ ${child}</div>`)
          .join("");
        groupsHTML += `
          <div class="group-card">
            <div class="group-header">
              <span>${group.parentName}</span>
              <span class="badge">${group.children.length} danh mục con</span>
            </div>
            <div class="group-children">${childItems || '<em style="color:#9ca3af">Không có danh mục con</em>'}</div>
          </div>
        `;
      });
    } else {
      groupsHTML =
        '<div style="text-align:center;color:#9ca3af;padding:40px;">Chưa có nhóm danh mục. Hãy thêm danh mục trong phần Quản lý danh mục.</div>';
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: #f8fafc; }
          h1 { color: #1e2a4a; margin-bottom: 16px; font-size: 20px; }
          .controls { display: flex; gap: 10px; margin-bottom: 20px; }
          .btn {
            padding: 10px 18px; border: none; border-radius: 8px;
            font-weight: 700; font-size: 13px; cursor: pointer; color: white;
          }
          .btn:hover { opacity: 0.88; }
          .btn-expand   { background: #16a34a; }
          .btn-collapse { background: #dc2626; }
          .btn-rebuild  { background: #1e2a4a; }
          .group-card {
            background: white;
            border-radius: 10px;
            margin-bottom: 14px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.06);
            overflow: hidden;
          }
          .group-header {
            background: linear-gradient(135deg, #1e2a4a, #2c3e6b);
            color: white;
            padding: 14px 16px;
            font-weight: 700;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .badge {
            background: rgba(255,255,255,0.2);
            border-radius: 12px;
            padding: 2px 10px;
            font-size: 11px;
            font-weight: 600;
          }
          .group-children { padding: 12px 16px; }
          .child-item { padding: 7px 0; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
          .child-item:last-child { border-bottom: none; }
        </style>
      </head>
      <body>
        <h1>📂 Quản Lý Nhóm Danh Mục</h1>

        <div class="controls">
          <button class="btn btn-expand"   onclick="run('expandAllGroups')">⬇️ Mở Tất Cả</button>
          <button class="btn btn-collapse" onclick="run('collapseAllGroups')">⬆️ Thu Gọn Tất Cả</button>
          <button class="btn btn-rebuild"  onclick="run('applyGroupingToMonthlySheet')">🔄 Cập Nhật Nhóm</button>
        </div>

        ${groupsHTML}

        <script>
          function run(action) {
            google.script.run
              .withSuccessHandler(() => {})
              .withFailureHandler(e => alert('Lỗi: ' + e))
              [action]();
          }
        </script>
      </body>
      </html>
    `;

    ui.showModelessDialog(
      HtmlService.createHtmlOutput(htmlContent).setWidth(580).setHeight(520),
      "📂 Quản Lý Nhóm",
    );
  } catch (error) {
    logError("renderGroupingUI", error);
    showAlert("Lỗi", "Không thể hiển thị quản lý nhóm");
  }
}

// ============================================================================
// SECURITY SETTINGS UI
// ============================================================================

/**
 * Display the security settings dialog for changing the passcode.
 * Called from the menu or sidebar Cài đặt link.
 *
 * @return {void}
 */
function showSecuritySettings() {
  try {
    const ui = SpreadsheetApp.getUi();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; background: #f8fafc; }
          h1 { color: #1e2a4a; margin-bottom: 20px; font-size: 18px; }
          .section {
            background: white; padding: 20px; border-radius: 10px;
            border-left: 4px solid #d97706;
            box-shadow: 0 2px 6px rgba(0,0,0,0.06); margin-bottom: 20px;
          }
          .section h3 { color: #1e2a4a; margin-bottom: 14px; font-size: 14px; }
          .form-group { margin-bottom: 14px; }
          label { display: block; margin-bottom: 5px; font-weight: 600; font-size: 13px; color: #374151; }
          input[type="password"] {
            width: 100%; padding: 10px 12px;
            border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px;
          }
          input:focus { outline: none; border-color: #1e2a4a; }
          .btn-group { display: flex; gap: 10px; }
          button {
            flex: 1; padding: 11px; border: none;
            border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer;
          }
          .btn-save   { background: #16a34a; color: white; }
          .btn-close  { background: #f3f4f6; color: #374151; }
        </style>
      </head>
      <body>
        <h1>⚙️ Cài Đặt Bảo Mật</h1>

        <div class="section">
          <h3>🔑 Thay Đổi Mã Truy Cập</h3>
          <div class="form-group">
            <label>Mã mới</label>
            <input type="password" id="newPasscode" placeholder="Nhập mã truy cập mới..." />
          </div>
          <div class="form-group">
            <label>Xác nhận mã mới</label>
            <input type="password" id="confirmPasscode" placeholder="Nhập lại mã..." />
          </div>
        </div>

        <div class="btn-group">
          <button class="btn-save"  onclick="savePasscode()">💾 Lưu</button>
          <button class="btn-close" onclick="google.script.host.close()">✕ Đóng</button>
        </div>

        <script>
          function savePasscode() {
            const np = document.getElementById('newPasscode').value;
            const cp = document.getElementById('confirmPasscode').value;
            if (!np || !cp)      { alert('Vui lòng nhập mã mới và xác nhận'); return; }
            if (np !== cp)       { alert('Mã xác nhận không khớp'); return; }
            if (np.length < 4)   { alert('Mã phải có ít nhất 4 ký tự'); return; }

            google.script.run
              .withSuccessHandler(function(ok) {
                if (ok) { alert('✅ Cập nhật mã thành công'); google.script.host.close(); }
                else    { alert('❌ Cập nhật thất bại'); }
              })
              .withFailureHandler(function(e) { alert('Lỗi: ' + e); })
              .setPasscode(np);
          }
        </script>
      </body>
      </html>
    `;

    ui.showModalDialog(
      HtmlService.createHtmlOutput(htmlContent).setWidth(420).setHeight(380),
      "⚙️ Cài Đặt Bảo Mật",
    );
  } catch (error) {
    logError("showSecuritySettings", error);
    showAlert("Lỗi", "Không thể mở cài đặt bảo mật");
  }
}

/**
 * Wrapper called from the sidebar Cài đặt button.
 * @return {void}
 */
function showSecuritySettingsFromSidebar() {
  showSecuritySettings();
}
