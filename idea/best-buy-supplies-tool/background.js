// =======================================================================
// background.js - Service Worker chạy ngầm (Background Script)
// =======================================================================
// File này là "não" của extension. Nó nhận lệnh, quản lý hàng đợi các URL
// cần quét, mở/đóng tab ẩn tuần tự và gửi kết quả về API.
// =======================================================================

// --- CẤU HÌNH ---
// Thay thế URL này bằng endpoint API thực tế của bạn sau khi tích hợp
const API_ENDPOINT = "YOUR_API_HERE";

// Timeout tối đa cho mỗi tab (15 giây). Nếu quá thời gian, tab sẽ bị đóng.
const TAB_TIMEOUT_MS = 15000;

// Số lượng tab mở song song tối đa (để tránh bị block quá nhanh)
const CONCURRENT_TABS = 1;

// Danh sách URL mẫu để test nhanh (dùng trong popup)
const SAMPLE_URLS = [
  "https://www.amazon.com/dp/B08N5WRWNW",
  "https://www.temu.com/goods.html?goods_id=601099512704798"
];

// =======================================================================
// STATE - Trạng thái toàn cục của service worker
// =======================================================================
let urlQueue = [];           // Hàng đợi các URL chưa xử lý
let scrapedResults = [];     // Mảng chứa kết quả cào được
let isRunning = false;       // Cờ kiểm tra xem đang quét hay không
let activeTabMap = new Map(); // Map tabId -> { resolve, reject, timer } để xử lý promise

// =======================================================================
// LISTENER - Lắng nghe message từ popup hoặc Admin Web
// =======================================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "START_SCRAPING") {
    // Nhận danh sách URL từ popup hoặc Admin Web và bắt đầu quét
    console.log("[Background] Nhận lệnh START_SCRAPING với", message.urls?.length, "URLs");

    if (isRunning) {
      sendResponse({ success: false, error: "Đang có tiến trình quét khác chạy. Vui lòng đợi." });
      return;
    }

    const urls = message.urls || SAMPLE_URLS;
    startScraping(urls)
      .then((results) => {
        sendResponse({ success: true, results });
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message });
      });

    // Trả về true để giữ kết nối message async
    return true;
  }

  if (message.action === "GET_STATUS") {
    sendResponse({
      isRunning,
      remaining: urlQueue.length,
      done: scrapedResults.length
    });
    return;
  }
});

// =======================================================================
// LISTENER - Lắng nghe sự kiện tab load xong để kích hoạt content script
// =======================================================================
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Chỉ xử lý khi tab đã load xong (status = "complete") và tab đang trong activeTabMap
  if (changeInfo.status === "complete" && activeTabMap.has(tabId)) {
    console.log(`[Background] Tab ${tabId} đã load xong: ${tab.url}`);
    handleTabLoaded(tabId, tab.url);
  }
});

// =======================================================================
// HÀM CHÍNH: startScraping - Khởi động tiến trình quét toàn bộ hàng đợi
// =======================================================================
async function startScraping(urls) {
  isRunning = true;
  urlQueue = [...urls];       // Clone mảng vào hàng đợi
  scrapedResults = [];        // Reset kết quả cũ

  console.log(`[Background] Bắt đầu quét ${urlQueue.length} URL...`);

  // Xử lý lần lượt từng URL trong hàng đợi (tuần tự)
  while (urlQueue.length > 0) {
    const url = urlQueue.shift(); // Lấy URL đầu tiên trong hàng đợi
    console.log(`[Background] Đang xử lý: ${url}`);

    try {
      const result = await openTabAndScrape(url);
      scrapedResults.push(result);
      console.log(`[Background] ✅ Cào thành công: ${url}`, result);
    } catch (error) {
      // Nếu lỗi, vẫn ghi nhận để không bỏ sót
      console.warn(`[Background] ❌ Lỗi khi cào: ${url}`, error.message);
      scrapedResults.push({
        url,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  console.log(`[Background] Hoàn tất! Tổng: ${scrapedResults.length} sản phẩm.`);
  isRunning = false;

  // Gửi toàn bộ kết quả về API nếu endpoint đã được cấu hình
  if (API_ENDPOINT !== "YOUR_API_HERE") {
    await sendResultsToAPI(scrapedResults);
  }

  return scrapedResults;
}

// =======================================================================
// HÀM: openTabAndScrape - Mở 1 tab ẩn, cào dữ liệu, rồi đóng tab
// =======================================================================
function openTabAndScrape(url) {
  return new Promise(async (resolve, reject) => {
    let tabId = null;
    let timer = null;

    // --- Tạo timer timeout ---
    // Nếu sau TAB_TIMEOUT_MS giây tab vẫn chưa trả về data, tự động đóng và bỏ qua
    const startTimeout = (id) => {
      timer = setTimeout(() => {
        console.warn(`[Background] ⏰ Timeout tab ${id}: ${url}`);
        cleanupTab(id);
        reject(new Error(`Timeout sau ${TAB_TIMEOUT_MS / 1000}s cho URL: ${url}`));
      }, TAB_TIMEOUT_MS);
    };

    try {
      // Mở tab ẩn (active: false = không hiển thị cho người dùng)
      const tab = await chrome.tabs.create({ url, active: false });
      tabId = tab.id;

      console.log(`[Background] Đã mở tab ẩn ID=${tabId} cho: ${url}`);

      // Lưu vào Map để onUpdated listener có thể tìm và xử lý
      activeTabMap.set(tabId, {
        resolve: (data) => {
          clearTimeout(timer);
          cleanupTab(tabId);
          resolve(data);
        },
        reject: (err) => {
          clearTimeout(timer);
          cleanupTab(tabId);
          reject(err);
        },
        url
      });

      // Bắt đầu đếm timeout
      startTimeout(tabId);

    } catch (err) {
      reject(new Error(`Không thể mở tab: ${err.message}`));
    }
  });
}

// =======================================================================
// HÀM: handleTabLoaded - Kích hoạt content script sau khi tab load xong
// =======================================================================
async function handleTabLoaded(tabId, tabUrl) {
  const entry = activeTabMap.get(tabId);
  if (!entry) return;

  try {
    // Dùng scripting API để inject và chạy hàm scrape trong context của trang
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: scrapePageData,  // Hàm này sẽ được inject vào trang
      args: [tabUrl]
    });

    const data = results?.[0]?.result;

    if (data && !data.error) {
      entry.resolve(data);
    } else {
      entry.reject(new Error(data?.error || "Không tìm thấy dữ liệu trên trang"));
    }
  } catch (err) {
    entry.reject(new Error(`Lỗi executeScript: ${err.message}`));
  }
}

// =======================================================================
// HÀM: scrapePageData - Hàm được INJECT vào trang để cào dữ liệu
// LƯU Ý: Hàm này chạy trong context của trang web, không phải service worker
// Nên nó có quyền truy cập document, window, nhưng KHÔNG có chrome.* APIs
// =======================================================================
function scrapePageData(pageUrl) {
  /**
   * Hàm helper: Thử nhiều selector khác nhau và trả về text đầu tiên tìm được
   */
  function trySelectors(selectors) {
    for (const selector of selectors) {
      try {
        const el = document.querySelector(selector);
        if (el) {
          const text = el.innerText || el.textContent || el.value;
          if (text && text.trim()) return text.trim();
        }
      } catch (e) {
        // Bỏ qua selector lỗi
      }
    }
    return null;
  }

  const url = pageUrl || window.location.href;
  let title = null;
  let price = null;
  let source = "unknown";

  try {
    // =============================================
    // AMAZON SELECTORS
    // =============================================
    if (url.includes("amazon.com")) {
      source = "amazon";

      // Tên sản phẩm Amazon
      title = trySelectors([
        "#productTitle",
        "#title",
        "h1.a-size-large",
        "h1[id*='title']",
        "span[id*='productTitle']"
      ]);

      // Giá Amazon - thử nhiều selector vì Amazon thay đổi DOM thường xuyên
      price = trySelectors([
        ".a-price .a-offscreen",          // Giá phổ biến nhất
        "#priceblock_ourprice",           // Giá cũ
        "#priceblock_dealprice",          // Giá deal
        ".apexPriceToPay .a-offscreen",   // Giá Prime
        "#corePrice_feature_div .a-offscreen",
        "[data-feature-name='corePriceDisplay'] .a-offscreen",
        "#price_inside_buybox",
        "#tp_price_block_total_price_ww .a-offscreen"
      ]);

      // Fallback: tìm tất cả element có class a-price và lấy cái đầu tiên có giá
      if (!price) {
        const priceElements = document.querySelectorAll(".a-price");
        for (const el of priceElements) {
          const offscreen = el.querySelector(".a-offscreen");
          if (offscreen && offscreen.textContent.includes("$")) {
            price = offscreen.textContent.trim();
            break;
          }
        }
      }
    }

    // =============================================
    // TEMU SELECTORS
    // =============================================
    else if (url.includes("temu.com")) {
      source = "temu";

      // Tên sản phẩm Temu
      title = trySelectors([
        "[data-testid='goods-title']",
        "[class*='title'][class*='goods']",
        "h1[class*='goods']",
        "h1[class*='title']",
        ".goods-title",
        "[class*='product-title']",
        "[class*='item-title']",
        "h1"
      ]);

      // Giá Temu
      price = trySelectors([
        "[data-testid='goods-price']",
        "[class*='price'][class*='current']",
        "[class*='sale-price']",
        "[class*='goods-price']",
        ".sale-price",
        "[class*='price__main']",
        "[class*='current-price']",
        "[class*='price-item']"
      ]);

      // Fallback Temu: tìm element chứa "$" trong text
      if (!price) {
        const allElements = document.querySelectorAll("*");
        for (const el of allElements) {
          if (el.children.length === 0) { // Chỉ lấy leaf nodes
            const text = el.textContent.trim();
            if (text.match(/^\$[\d.,]+$/) || text.match(/^\$[\d]+\.\d{2}$/)) {
              price = text;
              break;
            }
          }
        }
      }
    }

    // Trả về kết quả
    return {
      url,
      source,
      title: title || "Không tìm thấy tên sản phẩm",
      price: price || "Không tìm thấy giá",
      timestamp: new Date().toISOString(),
      success: !!(title || price)
    };

  } catch (err) {
    return {
      url,
      source,
      error: `Lỗi cào dữ liệu: ${err.message}`,
      timestamp: new Date().toISOString(),
      success: false
    };
  }
}

// =======================================================================
// HÀM: cleanupTab - Đóng tab và xóa khỏi Map
// =======================================================================
async function cleanupTab(tabId) {
  activeTabMap.delete(tabId);
  try {
    await chrome.tabs.remove(tabId);
    console.log(`[Background] Đã đóng tab ${tabId}`);
  } catch (err) {
    // Tab có thể đã bị đóng bởi người dùng - bỏ qua lỗi này
    console.warn(`[Background] Tab ${tabId} đã được đóng trước đó`);
  }
}

// =======================================================================
// HÀM: sendResultsToAPI - Gửi kết quả về API đích bằng POST request
// =======================================================================
async function sendResultsToAPI(results) {
  console.log("[Background] Đang gửi dữ liệu đến API:", API_ENDPOINT);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        scrapedAt: new Date().toISOString(),
        totalItems: results.length,
        data: results
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("[Background] ✅ Gửi API thành công:", responseData);
    return responseData;

  } catch (err) {
    console.error("[Background] ❌ Gửi API thất bại:", err.message);
    throw err;
  }
}

console.log("[Background] Service Worker đã khởi động.");
