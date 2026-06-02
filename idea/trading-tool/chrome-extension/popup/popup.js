/**
 * Popup Script
 * Handles popup UI interactions and real-time updates
 */

console.log("📱 Popup script loaded");

let isMonitoring = true;

// DOM Elements
const signalDisplay = document.getElementById("signalDisplay");
const lastUpdated = document.getElementById("lastUpdated");
const pauseBtn = document.getElementById("pauseBtn");
const refreshBtn = document.getElementById("refreshBtn");
const historyList = document.getElementById("historyList");
const monitoringStatus = document.getElementById("monitoringStatus");
const longCount = document.getElementById("longCount");
const shortCount = document.getElementById("shortCount");
const neutralCount = document.getElementById("neutralCount");

/**
 * Initialize popup on load
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎯 Popup initialized");
  
  updateDisplay();
  setupEventListeners();
  
  // Refresh display every 2 seconds
  setInterval(updateDisplay, 2000);
});

/**
 * Setup button event listeners
 */
function setupEventListeners() {
  pauseBtn.addEventListener("click", toggleMonitoring);
  refreshBtn.addEventListener("click", refreshSignal);
}

/**
 * Update display with current data
 */
async function updateDisplay() {
  try {
    // Get current signal from storage
    const data = await chrome.storage.local.get([
      "currentSignal",
      "lastCheckedAt",
      "signalHistory"
    ]);
    
    const currentSignal = data.currentSignal;
    const lastChecked = data.lastCheckedAt;
    const history = data.signalHistory || [];
    
    // Update signal display
    if (currentSignal) {
      updateSignalStatus(currentSignal);
    } else {
      updateSignalStatus("detecting");
    }
    
    // Update timestamp
    if (lastChecked) {
      const time = new Date(lastChecked);
      const timeStr = time.toLocaleTimeString();
      lastUpdated.textContent = `Last updated: ${timeStr}`;
    }
    
    // Update history
    updateHistoryDisplay(history);
    
    // Update stats
    updateStats(history);
    
    // Update monitoring status
    monitoringStatus.textContent = isMonitoring ? "🟢 Active" : "🔴 Paused";
    
  } catch (error) {
    console.error("Error updating display:", error);
  }
}

/**
 * Update signal status display
 */
function updateSignalStatus(signal) {
  const statusEl = signalDisplay.querySelector(".signal-status");
  
  if (signal === "LONG") {
    statusEl.className = "signal-status long";
    statusEl.innerHTML = '<span class="signal-text">📈 LONG</span>';
  } else if (signal === "SHORT") {
    statusEl.className = "signal-status short";
    statusEl.innerHTML = '<span class="signal-text">📉 SHORT</span>';
  } else if (signal === "NEUTRAL") {
    statusEl.className = "signal-status neutral";
    statusEl.innerHTML = '<span class="signal-text">⚖️ NEUTRAL</span>';
  } else if (signal === "detecting") {
    statusEl.className = "signal-status unknown detecting";
    statusEl.innerHTML = '<span class="signal-text">⏳ Detecting...</span>';
  }
}

/**
 * Update history display
 */
function updateHistoryDisplay(history) {
  if (!history || history.length === 0) {
    historyList.innerHTML = '<p class="empty">No history yet...</p>';
    return;
  }
  
  // Show last 10 items in reverse order (newest first)
  const recentHistory = [...history].reverse().slice(0, 10);
  
  historyList.innerHTML = recentHistory.map((entry, index) => {
    const time = new Date(entry.timestamp);
    const timeStr = time.toLocaleTimeString();
    const signalClass = entry.signal.toLowerCase();
    
    return `
      <div class="history-item">
        <span class="history-signal ${signalClass}">${entry.signal}</span>
        <span class="history-time">${timeStr}</span>
      </div>
    `;
  }).join("");
}

/**
 * Update statistics
 */
function updateStats(history) {
  if (!history) {
    longCount.textContent = "0";
    shortCount.textContent = "0";
    neutralCount.textContent = "0";
    return;
  }
  
  const stats = {
    LONG: 0,
    SHORT: 0,
    NEUTRAL: 0
  };
  
  history.forEach(entry => {
    if (entry.signal in stats) {
      stats[entry.signal]++;
    }
  });
  
  longCount.textContent = stats.LONG;
  shortCount.textContent = stats.SHORT;
  neutralCount.textContent = stats.NEUTRAL;
}

/**
 * Toggle monitoring on/off
 */
function toggleMonitoring() {
  isMonitoring = !isMonitoring;
  
  // Send message to content script
  chrome.tabs.query(
    { url: "*://signals.turtletrading.vn/chart/*" },
    (tabs) => {
      tabs.forEach(tab => {
        const messageType = isMonitoring ? "RESUME_MONITORING" : "PAUSE_MONITORING";
        chrome.tabs.sendMessage(tab.id, { type: messageType }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError);
          } else {
            console.log("Monitoring", isMonitoring ? "resumed" : "paused");
          }
        });
      });
    }
  );
  
  // Update button
  pauseBtn.textContent = isMonitoring ? "⏸ Pause" : "▶ Resume";
  monitoringStatus.textContent = isMonitoring ? "🟢 Active" : "🔴 Paused";
}

/**
 * Manually refresh signal
 */
function refreshSignal() {
  refreshBtn.disabled = true;
  refreshBtn.textContent = "🔄 Refreshing...";
  
  // Send refresh request to content script
  chrome.tabs.query(
    { url: "*://signals.turtletrading.vn/chart/*" },
    (tabs) => {
      if (tabs.length === 0) {
        alert("Please open https://signals.turtletrading.vn/chart/btc first");
        refreshBtn.disabled = false;
        refreshBtn.textContent = "🔄 Refresh";
        return;
      }
      
      chrome.tabs.sendMessage(tabs[0].id, { type: "GET_CURRENT_SIGNAL" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error:", chrome.runtime.lastError);
          alert("Error: Content script not responding. Please refresh the page.");
        } else {
          console.log("Signal response:", response);
          if (response && response.signal) {
            // Update storage with new signal
            chrome.storage.local.set({ lastCheckedAt: new Date().toISOString() });
          }
        }
        
        refreshBtn.disabled = false;
        refreshBtn.textContent = "🔄 Refresh";
        
        // Update display after a short delay
        setTimeout(updateDisplay, 300);
      });
    }
  );
}

console.log("✅ Popup ready");
