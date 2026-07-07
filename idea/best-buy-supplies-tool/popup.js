// =======================================================================
// popup.js - Logic xử lý giao diện popup
// =======================================================================

// Các URL mẫu để test nhanh
const SAMPLE_URLS = [
  "https://www.amazon.com/dp/B08N5WRWNW",
  "https://www.temu.com/goods.html?goods_id=601099512704798"
];

// Trạng thái hiện tại
let currentResults = null;
let totalUrls = 0;
let isRunning = false;

// =======================================================================
// KHỞI TẠO - Điền URL mẫu và load kết quả cũ từ storage
// =======================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Điền URL mẫu vào textarea nếu chưa có nội dung
  const urlInput = document.getElementById("urlInput");
  if (!urlInput.value.trim()) {
    urlInput.value = SAMPLE_URLS.join("\n");
  }

  // Load kết quả lần quét gần nhất từ chrome.storage
  chrome.storage.local.get(["lastResults"], (data) => {
    if (data.lastResults) {
      currentResults = data.lastResults;
      displayResults(currentResults);
      updateStats(currentResults);
    }
  });
});

// =======================================================================
// HÀM: handleStart - Bắt đầu quét khi nhấn nút
// =======================================================================
async function handleStart() {
  if (isRunning) return;

  // Lấy danh sách URL từ textarea
  const rawInput = document.getElementById("urlInput").value.trim();
  const urls = rawInput
    .split("\n")
    .map((u) => u.trim())
    .filter((u) => u.startsWith("http"));

  if (urls.length === 0) {
    showToast("❌ Vui lòng nhập ít nhất 1 URL hợp lệ!", "error");
    return;
  }

  // Cập nhật UI sang trạng thái đang chạy
  totalUrls = urls.length;
  setRunningState(true);
  updateProgress(0, totalUrls);
  setStatus("running", "Đang quét");

  try {
    // Gửi message đến background service worker để bắt đầu quét
    const response = await sendMessageToBackground({
      action: "START_SCRAPING",
      urls: urls
    });

    if (response && response.success) {
      currentResults = response.results;

      // Lưu kết quả vào storage để giữ sau khi đóng popup
      chrome.storage.local.set({ lastResults: currentResults });

      displayResults(currentResults);
      updateStats(currentResults);
      updateProgress(totalUrls, totalUrls);
      setStatus("done", "Hoàn tất");
      showToast(`✅ Quét xong ${currentResults.length} sản phẩm!`, "success");
    } else {
      throw new Error(response?.error || "Không nhận được phản hồi từ background");
    }
  } catch (err) {
    setStatus("error", "Lỗi");
    showToast(`❌ Lỗi: ${err.message}`, "error");
    displayError(err.message);
  } finally {
    setRunningState(false);
  }
}

// =======================================================================
// HÀM: handleClear - Xóa toàn bộ input và kết quả
// =======================================================================
function handleClear() {
  document.getElementById("urlInput").value = "";
  document.getElementById("resultOutput").innerHTML =
    '<span class="placeholder-text">Kết quả sẽ hiển thị ở đây sau khi quét...</span>';
  document.getElementById("statTotal").textContent = "0";
  document.getElementById("statSuccess").textContent = "0";
  document.getElementById("statError").textContent = "0";
  document.getElementById("progressSection").classList.remove("visible");
  setStatus("idle", "Idle");
  currentResults = null;
  chrome.storage.local.remove(["lastResults"]);
}

// =======================================================================
// HÀM: copyResults - Sao chép kết quả JSON ra clipboard
// =======================================================================
function copyResults() {
  if (!currentResults) {
    showToast("⚠️ Chưa có kết quả để copy!", "error");
    return;
  }

  const jsonText = JSON.stringify(currentResults, null, 2);
  navigator.clipboard.writeText(jsonText).then(() => {
    showToast("📋 Đã copy JSON vào clipboard!", "success");
  }).catch(() => {
    // Fallback cho môi trường không hỗ trợ clipboard API
    const el = document.getElementById("resultOutput");
    const range = document.createRange();
    range.selectNodeContents(el);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    showToast("📋 Đã copy!", "success");
  });
}

// =======================================================================
// HÀM: displayResults - Hiển thị kết quả JSON lên giao diện
// =======================================================================
function displayResults(results) {
  const output = document.getElementById("resultOutput");
  output.textContent = JSON.stringify(results, null, 2);
  // Syntax highlight đơn giản bằng màu sắc
  output.style.color = "#a5b4fc";
}

// =======================================================================
// HÀM: displayError - Hiển thị lỗi lên giao diện
// =======================================================================
function displayError(message) {
  const output = document.getElementById("resultOutput");
  output.textContent = `Lỗi: ${message}`;
  output.style.color = "#f87171";
}

// =======================================================================
// HÀM: updateStats - Cập nhật các ô thống kê
// =======================================================================
function updateStats(results) {
  const total = results.length;
  const success = results.filter((r) => r.success !== false && !r.error).length;
  const errors = results.filter((r) => r.error || r.success === false).length;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statSuccess").textContent = success;
  document.getElementById("statError").textContent = errors;
}

// =======================================================================
// HÀM: updateProgress - Cập nhật thanh progress
// =======================================================================
function updateProgress(current, total) {
  const section = document.getElementById("progressSection");
  const bar = document.getElementById("progressBar");
  const count = document.getElementById("progressCount");

  section.classList.add("visible");
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  bar.style.width = `${pct}%`;
  count.textContent = `${current} / ${total}`;
}

// =======================================================================
// HÀM: setRunningState - Bật/tắt UI trong khi đang quét
// =======================================================================
function setRunningState(running) {
  isRunning = running;
  const startBtn = document.getElementById("startBtn");
  const btnText = document.getElementById("btnText");
  const btnSpinner = document.getElementById("btnSpinner");
  const urlInput = document.getElementById("urlInput");

  startBtn.disabled = running;
  urlInput.disabled = running;

  if (running) {
    btnText.textContent = "Đang quét...";
    btnSpinner.classList.add("visible");
  } else {
    btnText.textContent = "🚀 Bắt đầu quét";
    btnSpinner.classList.remove("visible");
  }
}

// =======================================================================
// HÀM: setStatus - Cập nhật badge trạng thái trên header
// =======================================================================
function setStatus(type, text) {
  const badge = document.getElementById("statusBadge");
  badge.className = `status-badge ${type}`;
  badge.textContent = text;
}

// =======================================================================
// HÀM: showToast - Hiển thị thông báo tạm thời
// =======================================================================
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.background =
    type === "error"
      ? "rgba(239, 68, 68, 0.95)"
      : "rgba(16, 185, 129, 0.95)";
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// =======================================================================
// HÀM: sendMessageToBackground - Gửi message đến background.js và chờ phản hồi
// =======================================================================
function sendMessageToBackground(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}
