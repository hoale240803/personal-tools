/**
 * Content Script
 * Runs on https://signals.turtletrading.vn/chart/*
 *
 * Responsibility:
 * - Continuously monitor DOM for signal changes
 * - Send signal updates to background worker
 * - Handle real-time detection
 */

console.log(
  "🚀 Bitcoin Signal Tracker Content Script loaded on:",
  window.location.href,
);

let lastDetectedSignal = null;
let monitoringActive = true;

/**
 * Monitor signal changes every 5 seconds
 */
function startMonitoring() {
  console.log("📡 Starting signal monitoring...");

  // Check immediately
  checkAndReportSignal();

  // Then check every 5 seconds
  setInterval(() => {
    if (monitoringActive) {
      checkAndReportSignal();
    }
  }, 5000);
}

/**
 * Check current signal and report if changed
 */
function checkAndReportSignal() {
  try {
    const currentSignal = detectSignalFromDOM();

    if (!currentSignal) {
      console.log("⚠️  Could not detect signal at this moment");
      return;
    }

    // If signal changed, notify background worker
    if (currentSignal !== lastDetectedSignal) {
      console.log(
        `🔄 Signal change detected: ${lastDetectedSignal} → ${currentSignal}`,
      );

      // Send message to background worker
      chrome.runtime.sendMessage(
        {
          type: "SIGNAL_CHANGED",
          previousSignal: lastDetectedSignal,
          currentSignal: currentSignal,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError);
          } else if (response) {
            console.log("✅ Background received signal change:", response);
          }
        },
      );

      lastDetectedSignal = currentSignal;
    }
  } catch (error) {
    console.error("Error checking signal:", error);
  }
}

/**
 * Handle messages from background worker
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 Message received in content-script:", request.type);

  if (request.type === "GET_CURRENT_SIGNAL") {
    const signal = detectSignalFromDOM();
    sendResponse({
      signal: signal,
      timestamp: new Date().toISOString(),
    });
  } else if (request.type === "PAUSE_MONITORING") {
    monitoringActive = false;
    console.log("⏸️  Monitoring paused");
    sendResponse({ status: "paused" });
  } else if (request.type === "RESUME_MONITORING") {
    monitoringActive = true;
    console.log("▶️  Monitoring resumed");
    sendResponse({ status: "resumed" });
  }
});

// Start monitoring when script loads
document.addEventListener("DOMContentLoaded", startMonitoring);

// Also start immediately if DOM is already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startMonitoring);
} else {
  startMonitoring();
}

console.log("✅ Content script ready - monitoring started");
