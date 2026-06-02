# Bitcoin Signal Tracker - Chrome Extension

## 📌 Overview

A real-time Chrome extension that monitors Bitcoin trading signals from **TurtleTrading** and alerts you when the signal changes from LONG to SHORT or vice versa.

**Features:**
- 🔍 **Real-time Signal Detection** - Monitors DOM element using XPath
- 📲 **Desktop Notifications** - Instant alerts on signal changes
- 📊 **Signal History** - Tracks all signal changes with timestamps
- ⏸️ **Pause/Resume** - Control monitoring from popup
- 🟢 **Status Badge** - Visual indicator in extension icon

## 🔧 Technical Details

### How it Works

1. **Content Script** (`content-script.js`)
   - Runs on `https://signals.turtletrading.vn/chart/*`
   - Continuously monitors DOM element via XPath: `//*[@id="tp-pos-body"]/tr/td[1]/span`
   - Detects signal text (LONG, SHORT, NEUTRAL)
   - Sends message to background worker on changes

2. **Background Worker** (`background.js`)
   - Service worker that receives signal changes
   - Compares with previous state
   - Sends desktop notifications
   - Maintains signal history
   - Updates extension badge

3. **Popup UI** (`popup/popup.html`)
   - Real-time status display
   - Signal history (last 10 entries)
   - Statistics (LONG/SHORT/NEUTRAL counts)
   - Pause/Resume and Refresh buttons

### XPath Target

```xpath
//*[@id="tp-pos-body"]/tr/td[1]/span
```

This XPath selects the signal indicator element on the TurtleTrading chart page.

## 🚀 Installation

### Step 1: Clone/Create the Extension
The extension files are already in this directory:
- `manifest.json`
- `background.js`
- `content-script.js`
- `utils.js`
- `popup/popup.html`
- `popup/popup.css`
- `popup/popup.js`

### Step 2: Create Icon Files

You need to create or add icon images (PNG format):
- `icons/icon16.png` (16x16 pixels)
- `icons/icon48.png` (48x48 pixels)
- `icons/icon128.png` (128x128 pixels)

**Quick way to test without icons:**
- You can use placeholder images or skip this for now
- Chrome will show a generic icon if icons are missing

### Step 3: Load in Chrome

1. Open **Chrome DevTools**: `chrome://extensions/`
2. Enable **Developer Mode** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the `chrome-extension` directory

### Step 4: Start Monitoring

1. Open [https://signals.turtletrading.vn/chart/btc](https://signals.turtletrading.vn/chart/btc)
2. The extension icon in toolbar should show a badge with signal status
3. Click the extension icon to open the popup
4. You'll see:
   - Current signal status
   - Signal history
   - Statistics
   - Controls to pause/resume

## 📝 File Structure

```
chrome-extension/
├── manifest.json              # Extension configuration
├── background.js              # Service worker
├── content-script.js          # Runs on TurtleTrading page
├── utils.js                   # Helper functions
├── popup/
│   ├── popup.html            # Popup UI
│   ├── popup.js              # Popup logic
│   └── popup.css             # Popup styling
└── icons/
    ├── icon16.png            # Small icon
    ├── icon48.png            # Medium icon
    └── icon128.png           # Large icon
```

## 🔍 How Signal Detection Works

### DOM Element
The extension monitors this element:
```
ID: "tp-pos-body"
Location: First table row, first cell, span element
```

### Signal Types
- **LONG** 📈 - Bullish signal (uptrend)
- **SHORT** 📉 - Bearish signal (downtrend)
- **NEUTRAL** ⚖️ - No clear direction

### Detection Logic
```javascript
function detectSignalFromDOM() {
  const xpath = "//*[@id='tp-pos-body']/tr/td[1]/span";
  const result = document.evaluate(xpath, document, null, 
    XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  const element = result.singleNodeValue;
  const signalText = element.textContent?.trim().toUpperCase();
  
  if (signalText.includes("LONG")) return "LONG";
  if (signalText.includes("SHORT")) return "SHORT";
  if (signalText.includes("NEUTRAL")) return "NEUTRAL";
  return null;
}
```

## ⚙️ Configuration

### Polling Interval
Modify in `content-script.js`:
```javascript
setInterval(() => {
  checkAndReportSignal();
}, 5000); // Change 5000 (5 seconds) to desired interval in milliseconds
```

### Notification Sound
Currently enabled. To disable, comment out in `background.js`:
```javascript
// playNotificationSound();
```

### History Limit
Modify in `background.js`:
```javascript
if (history.length > 100) { // Change 100 to desired limit
  history.shift();
}
```

## 🐛 Debugging

### Check Console Logs
1. Open Chrome DevTools on TurtleTrading page: `F12`
2. Go to **Console** tab
3. Look for logs with 🚀, 📡, ✅ prefixes

### Background Worker Logs
1. Go to `chrome://extensions/`
2. Find "Bitcoin Signal Tracker"
3. Click "Inspect views" → "service_worker"
4. Check console for background worker logs

### Common Issues

**Issue: "Signal element not found"**
- XPath might have changed on the website
- Update XPath in `utils.js` function `detectSignalFromDOM()`

**Issue: No notifications appearing**
- Check Chrome notifications permissions
- Make sure extension has notification permission

**Issue: Content script not responding**
- Reload the extension: Go to `chrome://extensions/` and toggle off/on
- Refresh the TurtleTrading page

## 🔐 Permissions

The extension requires these permissions:

- `storage` - Save signal history and state
- `notifications` - Send desktop alerts
- `alarms` - Schedule tasks (future use)
- `tabs` - Communicate with tabs
- `https://signals.turtletrading.vn/*` - Access TurtleTrading site

## 📊 Data Storage

All data is stored locally in Chrome:
- `currentSignal` - Last detected signal
- `signalHistory` - Array of signal changes with timestamps
- `lastCheckedAt` - Last check timestamp
- `installDate` - Extension install date

**Storage limit:** Chrome allows up to 10MB per extension

## 🔄 Future Enhancements

- [ ] Add interval customization UI
- [ ] Export signal history to CSV
- [ ] Sound alert selection
- [ ] Multi-symbol support
- [ ] Historical chart of signals
- [ ] Email alerts
- [ ] Webhook integration

## 📞 Support

If something isn't working:
1. Check browser console (F12)
2. Verify XPath still matches the page
3. Reload extension from `chrome://extensions/`
4. Clear storage: `chrome.storage.local.clear()`

## ⚖️ License

Personal use for trading analysis only.

---

**Last Updated:** May 2026  
**Version:** 1.0.0
