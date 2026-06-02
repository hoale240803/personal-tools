/**
 * Utility functions for signal detection and storage
 */

/**
 * Detect LONG/SHORT signal from DOM element using XPath
 * XPath: //*[@id="tp-pos-body"]/tr/td[1]/span
 *
 * Logic:
 * - Extract text from the DOM element
 * - Parse to identify LONG or SHORT position
 *
 * @returns {string|null} - "LONG" | "SHORT" | "NEUTRAL" | null
 */
function detectSignalFromDOM() {
  try {
    // XPath to find the signal element
    const xpath = "//*[@id='tp-pos-body']/tr/td[1]/span";

    // Use document.evaluate to execute XPath
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    );

    const element = result.singleNodeValue;

    if (!element) {
      console.log("❌ Signal element not found via XPath");
      return null;
    }

    const signalText = element.textContent?.trim().toUpperCase() || "";
    console.log(`📍 Found signal text: "${signalText}"`);

    // Parse signal from text
    if (signalText.includes("LONG")) {
      return "LONG";
    } else if (signalText.includes("SHORT")) {
      return "SHORT";
    } else if (signalText.includes("NEUTRAL")) {
      return "NEUTRAL";
    }

    // If text doesn't contain keywords, try to infer
    // Example: "LONG" might be represented as "📈 LONG" or just position name
    console.warn(`⚠️  Unknown signal format: "${signalText}"`);
    return null;
  } catch (error) {
    console.error("❌ Error detecting signal from DOM:", error);
    return null;
  }
}

/**
 * Extract additional info from the page (optional)
 * Can be extended to get price, timestamp, etc.
 */
function getPageInfo() {
  try {
    // Try to extract current price if available
    const priceElement = document.querySelector(
      "[data-price], .price, .current-price",
    );
    const price = priceElement?.textContent?.trim() || "N/A";

    return {
      signal: detectSignalFromDOM(),
      price: price,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };
  } catch (error) {
    console.error("Error getting page info:", error);
    return {
      signal: detectSignalFromDOM(),
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };
  }
}

/**
 * Send signal change notification
 * @param {string} previousSignal - Previous direction (LONG/SHORT/NEUTRAL)
 * @param {string} currentSignal - Current direction (LONG/SHORT/NEUTRAL)
 * @param {number} price - Current price (optional)
 */
function formatChangeMessage(previousSignal, currentSignal, price = null) {
  let message = `Signal changed: ${previousSignal} → ${currentSignal}`;
  if (price) {
    message += `\nPrice: $${price}`;
  }
  return message;
}

/**
 * Load previous signal from Chrome storage
 */
async function getPreviousSignal() {
  return new Promise((resolve) => {
    chrome.storage.local.get("previousSignal", (data) => {
      resolve(data.previousSignal || null);
    });
  });
}

/**
 * Save current signal to Chrome storage
 */
async function savePreviousSignal(signal) {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      {
        previousSignal: signal,
        lastCheckedAt: new Date().toISOString(),
      },
      resolve,
    );
  });
}

/**
 * Get all stored signal history
 */
async function getSignalHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.get("signalHistory", (data) => {
      resolve(data.signalHistory || []);
    });
  });
}

/**
 * Add to signal history with timestamp
 */
async function addToHistory(signal) {
  const history = await getSignalHistory();
  const newEntry = {
    signal: signal,
    timestamp: new Date().toISOString(),
  };

  // Keep only last 50 entries
  history.push(newEntry);
  if (history.length > 50) {
    history.shift();
  }

  return new Promise((resolve) => {
    chrome.storage.local.set({ signalHistory: history }, resolve);
  });
}
