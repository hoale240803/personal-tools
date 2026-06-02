/**
 * Background Service Worker
 *
 * Responsibility:
 * - Receive signal changes from content-script
 * - Compare with previous state
 * - Send desktop notifications
 * - Maintain signal history
 * - Handle user interactions
 */

console.log("🔧 Background Service Worker initialized");

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 Background received:", request.type);

  if (request.type === "SIGNAL_CHANGED") {
    handleSignalChange(request, sender);
    sendResponse({ status: "processed" });
  }

  return true; // Keep channel open for async response
});

/**
 * Handle signal change event
 */
async function handleSignalChange(data, sender) {
  const { previousSignal, currentSignal, timestamp } = data;

  console.log(`🚨 Signal change: ${previousSignal} → ${currentSignal}`);

  // Store in Chrome storage
  await savePreviousSignal(currentSignal);
  await addToHistory(currentSignal);

  // Send desktop notification
  if (currentSignal && previousSignal !== null) {
    // Don't notify on first detection
    await sendNotification(previousSignal, currentSignal);
  }

  // Update popup badge
  updateBadge(currentSignal);
}

/**
 * Send desktop notification
 */
/**
 * Send desktop notification
 */
async function sendNotification(fromSignal, toSignal) {
  const title = "🚨 Bitcoin Signal Alert";
  const message = `Signal changed: ${fromSignal} → ${toSignal}`;

  const options = {
    type: "basic",
    title: title,
    message: message,
    // THÊM ĐƯỜNG DẪN ĐẾN ICON CỦA BẠN Ở ĐÂY (BẮT BUỘC)
    // Hãy chắc chắn rằng file icon này tồn tại trong thư mục extension của bạn (ví dụ: nằm trong thư mục icons)
    iconUrl: "icons/icon128.png",
    requireInteraction: true,
  };

  try {
    const notificationId = await chrome.notifications.create(
      `signal-${Date.now()}`,
      options,
    );
    console.log("✅ Notification sent:", notificationId);
  } catch (error) {
    console.error("❌ Notification error:", error);
  }
}

/**
 * Update extension badge with current signal
 */
async function updateBadge(signal) {
  if (!signal) return;

  const badgeColor =
    signal === "LONG" ? "#4CAF50" : signal === "SHORT" ? "#F44336" : "#9C27B0";
  const badgeText = signal.charAt(0); // L, S, or N

  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: badgeColor });
}

/**
 * Save current signal to storage
 */
async function savePreviousSignal(signal) {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      {
        currentSignal: signal,
        lastCheckedAt: new Date().toISOString(),
      },
      resolve,
    );
  });
}

/**
 * Add to signal history
 */
async function addToHistory(signal) {
  const history = await new Promise((resolve) => {
    chrome.storage.local.get("signalHistory", (data) => {
      resolve(data.signalHistory || []);
    });
  });

  history.push({
    signal: signal,
    timestamp: new Date().toISOString(),
  });

  // Keep only last 100 entries
  if (history.length > 100) {
    history.shift();
  }

  return new Promise((resolve) => {
    chrome.storage.local.set({ signalHistory: history }, resolve);
  });
}

// Initialize on install/update
chrome.runtime.onInstalled.addListener(() => {
  console.log("📦 Extension installed/updated");

  // Initialize storage
  chrome.storage.local.set({
    currentSignal: null,
    signalHistory: [],
    installDate: new Date().toISOString(),
  });
});

console.log("✅ Background service worker ready");
