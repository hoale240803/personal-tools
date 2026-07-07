// =======================================================================
// content.js - Content Script chích vào trang Amazon/Temu
// =======================================================================
// File này được khai báo trong manifest.json và tự động inject vào trang.
// Tuy nhiên với Manifest V3, cách inject chính là qua chrome.scripting.executeScript
// trong background.js. File này giữ vai trò fallback và định nghĩa logic cào.
// =======================================================================

(function () {
  "use strict";

  // Ngăn chạy nhiều lần trên cùng một trang
  if (window.__bestBuyScraperInjected) return;
  window.__bestBuyScraperInjected = true;

  console.log("[Content] Best Buy Supplies scraper đã được inject vào:", window.location.href);

  /**
   * Hàm helper: Thử nhiều selector và trả về text đầu tiên tìm được
   * @param {string[]} selectors - Mảng CSS selector cần thử
   * @returns {string|null}
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
        // Bỏ qua selector lỗi và thử selector tiếp theo
      }
    }
    return null;
  }

  /**
   * Hàm cào dữ liệu Amazon
   * @returns {{ title: string, price: string }}
   */
  function scrapeAmazon() {
    // === TÊN SẢN PHẨM ===
    const title = trySelectors([
      "#productTitle",
      "#title",
      "h1.a-size-large",
      "h1[id*='title']",
      "span[id*='productTitle']"
    ]);

    // === GIÁ SẢN PHẨM ===
    // Amazon thường xuyên thay đổi cấu trúc DOM nên cần nhiều selector
    let price = trySelectors([
      ".a-price .a-offscreen",
      "#priceblock_ourprice",
      "#priceblock_dealprice",
      ".apexPriceToPay .a-offscreen",
      "#corePrice_feature_div .a-offscreen",
      "[data-feature-name='corePriceDisplay'] .a-offscreen",
      "#price_inside_buybox",
      "#tp_price_block_total_price_ww .a-offscreen"
    ]);

    // Fallback: duyệt tất cả .a-price và lấy cái đầu tiên có dấu $
    if (!price) {
      const priceEls = document.querySelectorAll(".a-price");
      for (const el of priceEls) {
        const offscreen = el.querySelector(".a-offscreen");
        if (offscreen && offscreen.textContent.includes("$")) {
          price = offscreen.textContent.trim();
          break;
        }
      }
    }

    return { title, price };
  }

  /**
   * Hàm cào dữ liệu Temu
   * @returns {{ title: string, price: string }}
   */
  function scrapeTemu() {
    // === TÊN SẢN PHẨM ===
    const title = trySelectors([
      "[data-testid='goods-title']",
      "[class*='title'][class*='goods']",
      "h1[class*='goods']",
      "h1[class*='title']",
      ".goods-title",
      "[class*='product-title']",
      "[class*='item-title']",
      "h1"
    ]);

    // === GIÁ SẢN PHẨM ===
    let price = trySelectors([
      "[data-testid='goods-price']",
      "[class*='price'][class*='current']",
      "[class*='sale-price']",
      "[class*='goods-price']",
      ".sale-price",
      "[class*='price__main']",
      "[class*='current-price']",
      "[class*='price-item']"
    ]);

    // Fallback: tìm leaf element chứa dạng "$XX.XX"
    if (!price) {
      const allEls = document.querySelectorAll("*");
      for (const el of allEls) {
        if (el.children.length === 0) {
          const text = el.textContent.trim();
          if (text.match(/^\$[\d.,]+$/) || text.match(/^\$[\d]+\.\d{2}$/)) {
            price = text;
            break;
          }
        }
      }
    }

    return { title, price };
  }

  /**
   * Hàm chính: Xác định nguồn và chạy scraper phù hợp
   * @returns {object} Dữ liệu đã cào
   */
  function runScraper() {
    const url = window.location.href;
    let scraped = { title: null, price: null };
    let source = "unknown";

    if (url.includes("amazon.com")) {
      source = "amazon";
      scraped = scrapeAmazon();
    } else if (url.includes("temu.com")) {
      source = "temu";
      scraped = scrapeTemu();
    }

    return {
      url,
      source,
      title: scraped.title || "Không tìm thấy tên sản phẩm",
      price: scraped.price || "Không tìm thấy giá",
      timestamp: new Date().toISOString(),
      success: !!(scraped.title || scraped.price)
    };
  }

  // =======================================================================
  // Gửi dữ liệu về background.js qua chrome.runtime.sendMessage
  // Chờ DOM ổn định trước khi cào (dùng requestIdleCallback nếu có)
  // =======================================================================
  function sendData() {
    const data = runScraper();
    console.log("[Content] Dữ liệu cào được:", data);

    chrome.runtime.sendMessage(
      { action: "SCRAPE_RESULT", data },
      (response) => {
        if (chrome.runtime.lastError) {
          // Background có thể đã dùng scripting API thay vì message - không cần xử lý
          console.log("[Content] Message đã gửi (background có thể dùng scripting API)");
        }
      }
    );
  }

  // Đợi DOM ổn định rồi mới cào
  if (document.readyState === "complete") {
    setTimeout(sendData, 1000); // Đợi thêm 1s cho các element render bằng JS
  } else {
    window.addEventListener("load", () => setTimeout(sendData, 1000));
  }
})();
