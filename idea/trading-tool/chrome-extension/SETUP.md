# 🚀 Chrome Extension Setup Guide

## Quick Start (5 minutes)

### Step 1: Create Icon Files

Bạn cần 3 icon file PNG. Tạm thời có thể dùng cách sau:

#### Option A: Dùng Online Tool (Nhanh nhất)
1. Mở: https://www.favicon-generator.org/
2. Upload hoặc design một icon Bitcoin/Chart theme
3. Download các size: 16x16, 48x48, 128x128
4. Copy vào folder `icons/`

#### Option B: Dùng Python Script (Để tạo placeholder)
```bash
cd chrome-extension/icons
python create_icons.py  # Nếu có sẵn script
```

#### Option C: Tạm thời Skip Icons
Chrome sẽ dùng default icon nếu không có files. Có thể test trước rồi add icon sau.

---

### Step 2: Load Extension vào Chrome

1. **Mở Chrome Extensions page:**
   - Nhập vào address bar: `chrome://extensions/`
   - Hoặc: Menu → More Tools → Extensions

2. **Bật Developer Mode:**
   - Tìm toggle ở **top-right corner**
   - Click để Enable

3. **Load Unpacked Extension:**
   - Click nút **"Load unpacked"**
   - Navigate đến thư mục: `c:\Workspace\personal-tools\idea\trading-tool\chrome-extension`
   - Click **"Select Folder"**

4. **Verify Installation:**
   - Bạn sẽ thấy "Bitcoin Signal Tracker" extension trong list
   - Icon sẽ xuất hiện ở toolbar (top-right corner)

---

### Step 3: Test Extension

1. **Mở TurtleTrading:**
   - Đi tới: https://signals.turtletrading.vn/chart/btc

2. **Check Console:**
   - Bấm F12 → Console tab
   - Xem các log message:
     ```
     🚀 Bitcoin Signal Tracker Content Script loaded on: https://signals.turtletrading.vn/chart/btc
     📡 Starting signal monitoring...
     ```

3. **Click Extension Icon:**
   - Popup sẽ mở
   - Status sẽ show "⏳ Detecting..."
   - Sau vài giây sẽ show current signal (LONG/SHORT/NEUTRAL)

4. **Test Monitoring:**
   - Nếu signal thay đổi, bạn sẽ nhận notification
   - Signal history sẽ update trong popup

---

## 🔍 Troubleshooting

### Problem: "Signal element not found"

**Solution 1: Verify XPath**
1. Mở TurtleTrading page
2. Bấm F12 → Console
3. Chạy command này:
```javascript
document.evaluate("//*[@id='tp-pos-body']/tr/td[1]/span", document, null, 
  XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent
```

Nếu nó show signal text (LONG/SHORT), XPath OK.
Nếu error, element path đã thay đổi.

**Solution 2: Inspect Element**
1. Right-click trên page → Inspect
2. Tìm element chứa signal (LONG/SHORT)
3. Copy XPath từ right-click → Copy XPath
4. Update trong `utils.js` hàm `detectSignalFromDOM()`

### Problem: No Notifications Appearing

**Check permissions:**
1. Mở `chrome://extensions/`
2. Click extension details
3. Scroll down → Permissions
4. Make sure "Notifications" is allowed

**If missing, enable it:**
1. Click "Manage permissions"
2. Allow notifications

### Problem: Extension Not Loading

**Solution:**
1. Go back to `chrome://extensions/`
2. Toggle extension OFF and ON again
3. If still not working:
   - Delete and re-load
   - Check console for errors (click "Inspect views" → service_worker)

### Problem: Content Script Not Running

**Check:**
1. Reload TurtleTrading page
2. Open DevTools (F12)
3. Look for message:
```
🚀 Bitcoin Signal Tracker Content Script loaded on: ...
```

If not there:
- Extension may not be injected
- Try: Reload extension from chrome://extensions/

---

## 📝 File Locations

```
chrome-extension/
├── manifest.json                  ← Extension config
├── background.js                  ← Signal detection logic
├── content-script.js              ← Runs on TurtleTrading page
├── utils.js                       ← Helper functions
├── popup/
│   ├── popup.html                ← UI
│   ├── popup.js                  ← Popup logic
│   └── popup.css                 ← Styling
├── icons/
│   ├── icon16.png                ← 16x16 pixel image
│   ├── icon48.png                ← 48x48 pixel image
│   └── icon128.png               ← 128x128 pixel image
└── README.md                      ← Full documentation
```

---

## ⚙️ Customization

### Change Polling Interval

Edit `content-script.js` line ~25:
```javascript
setInterval(() => {
  checkAndReportSignal();
}, 5000);  // Change this number (milliseconds)
         // 5000 = 5 seconds, 10000 = 10 seconds
```

### Change XPath (if needed)

Edit `utils.js` line ~14:
```javascript
const xpath = "//*[@id='tp-pos-body']/tr/td[1]/span";
// Replace with new XPath if page structure changed
```

### Disable Sound Alert

Edit `background.js` line ~65:
```javascript
// playNotificationSound();  // Uncomment to disable
```

---

## 📊 Monitor Signals

### Real-time Tracking
- Click extension icon → Popup opens
- Shows current signal: LONG 📈 / SHORT 📉
- Auto-updates every 2 seconds

### Signal History
- Popup shows last 10 signal changes
- Each with timestamp
- Stats: Count of LONG/SHORT/NEUTRAL

### Storage Location
All data saved in Chrome storage (local):
- Can view in DevTools → Application → Storage → Local Storage

---

## 🎯 Next Steps

1. ✅ Create icons (or use placeholder)
2. ✅ Load extension
3. ✅ Verify on TurtleTrading page
4. ✅ Test signal detection
5. ✅ Wait for signal change to test notification
6. 📌 (Optional) Add to other profiles if needed

---

## 💡 Tips

- **Keep TurtleTrading tab open** - Content script needs the tab active
- **Disable popup** - Keep it hidden, still works in background
- **Check console regularly** - Logs help debug issues
- **Battery saver mode?** - May reduce update frequency on some devices

---

**Questions?** Check `README.md` for more details or inspect browser console for error messages.
