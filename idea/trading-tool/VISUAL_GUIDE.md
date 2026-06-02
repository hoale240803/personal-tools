# Trading Direction Logic - Visual Guide

## 1️⃣ SHORT Signal (📉 Bearish)

```
Price Levels Distribution (Example)

RESISTANCE (Levels ABOVE current price)
- 76000 ← Sellers zone
- 76500   |
- 77000   | Only 3 levels
              (ít kháng cự)

═══════════════════════════════════════════════════════════
         ⬇️  CURRENT PRICE: $75,000  ⬇️
═══════════════════════════════════════════════════════════

SUPPORT (Levels BELOW current price)
- 74500   | 8 levels
- 74000   | (nhiều hỗ trợ)
- 73500   |
- 73000   ← Buyers zone
- 72500
- 72000
- 71500
- 71000

Formula:
    8 > 3 × 1.2?
    8 > 3.6?
    ✅ YES → SHORT SIGNAL 📉

Interpretation:
  ❌ Buyers cannot push price up (only 3 sellers barriers above)
  ❌ But many support levels below (8 buyers barriers)
  ✅ Sellers will break through support → Price goes DOWN
```

---

## 2️⃣ LONG Signal (📈 Bullish)

```
Price Levels Distribution (Example)

RESISTANCE (Levels ABOVE current price)
- 77000   | 8 levels
- 78000   | (nhiều kháng cự)
- 79000   |
- 80000   ← Sellers zone
- 81000
- 82000
- 83000
- 84000

═══════════════════════════════════════════════════════════
         ⬆️  CURRENT PRICE: $75,000  ⬆️
═══════════════════════════════════════════════════════════

SUPPORT (Levels BELOW current price)
- 74000 ← Buyers zone
- 73000   |
- 72000   | Only 3 levels
              (ít hỗ trợ)

Formula:
    8 > 3 × 1.2?
    8 > 3.6?
    ✅ YES → LONG SIGNAL 📈

Interpretation:
  ✅ Sellers cannot push price down (only 3 buyers barriers below)
  ✅ But many resistance levels above (8 sellers barriers)
  ✅ Buyers will break through resistance → Price goes UP
```

---

## 3️⃣ NEUTRAL Signal (⚖️)

```
Price Levels Distribution (Example)

RESISTANCE (Levels ABOVE current price)
- 76000   |
- 76500   | 5 levels
- 77000   | (cân bằng)
- 77500   |
- 78000   |

═══════════════════════════════════════════════════════════
         ⚖️  CURRENT PRICE: $75,000  ⚖️
═══════════════════════════════════════════════════════════

SUPPORT (Levels BELOW current price)
- 74500   |
- 74000   | 5 levels
- 73500   | (cân bằng)
- 73000   |
- 72500   |

Formula:
    5 > 5 × 1.2? → 5 > 6? → ❌ NO (not SHORT)
    5 > 5 × 1.2? → 5 > 6? → ❌ NO (not LONG)
    → NEUTRAL SIGNAL ⚖️

Interpretation:
  ⚖️ Market is balanced
  ⚖️ No strong signal in either direction
  ⚖️ Wait for clearer bias
```

---

## 📊 Decision Flowchart

```
Start: Signal Check
│
├─ Fetch API Data
│  ├─ Get: current_price = $75,000
│  └─ Get: price_bins = [61450, 61550, ..., 81000]
│
├─ Count Levels
│  ├─ Count levels > $75,000 = levels_above
│  └─ Count levels < $75,000 = levels_below
│
├─ Load Previous Direction
│  └─ previous_direction = ?
│
├─ Analyze Current Direction
│  │
│  ├─ IF levels_above > levels_below × 1.2
│  │  └─ current_direction = "LONG" 📈
│  │
│  ├─ ELSE IF levels_below > levels_above × 1.2
│  │  └─ current_direction = "SHORT" 📉
│  │
│  └─ ELSE
│     └─ current_direction = "NEUTRAL" ⚖️
│
├─ Check for Change
│  │
│  ├─ IF previous_direction == NULL
│  │  └─ First run, no alert (just save state)
│  │
│  ├─ ELSE IF previous_direction == current_direction
│  │  └─ No change (still same direction)
│  │
│  └─ ELSE (previous_direction ≠ current_direction)
│     └─ 🚨 DIRECTION CHANGED!
│        ├─ Format alert message
│        ├─ Send to Telegram
│        └─ Notify user
│
└─ Save Current State
   ├─ Save: direction
   ├─ Save: price
   └─ Save: timestamp
```

---

## 🎛️ Sensitivity Tuning

### Current Setting: `threshold_ratio = 1.2` (20%)

```
Example: levels_above = 10, levels_below = 7

threshold = 1.05 (5% - VERY SENSITIVE)
  10 > 7 × 1.05? → 10 > 7.35? → ✅ YES (trigger LONG easily)

threshold = 1.2 (20% - BALANCED) ← Default
  10 > 7 × 1.2? → 10 > 8.4? → ✅ YES (moderate trigger)

threshold = 1.5 (50% - LESS SENSITIVE)
  10 > 7 × 1.5? → 10 > 10.5? → ❌ NO (hard to trigger)
```

**How to change:** Edit `settings.json`

```json
{
  "signal": {
    "direction_threshold_ratio": 1.2
  }
}
```

---

## 🔄 Direction Change Alert Trigger

```
Run 1: Check → LONG direction found → Save state → No alert (first run)
           ↓
           signal_state.json: {"direction": "LONG"}

Run 2: Check → LONG direction found → Compare → LONG == LONG → No change

Run 3: Check → SHORT direction found → Compare → SHORT ≠ LONG → 🚨 ALERT!
           ↓
           Send Telegram: "LONG → SHORT"
           ↓
           signal_state.json: {"direction": "SHORT"}

Run 4: Check → SHORT direction found → Compare → SHORT == SHORT → No change
```

---

## 💡 Key Concepts

### Price Bins = Support/Resistance Levels
- Calculated by TurtleTrading from historical data
- Represent key price points where lots of buyers/sellers are
- More levels on one side = stronger directional bias

### Direction Logic
- **LONG**: More resistance above = bullish (buyers winning)
- **SHORT**: More support below = bearish (sellers winning)
- **NEUTRAL**: Balanced = no clear signal

### Alert Trigger
- Only sends alert when direction **changes**
- Not on every check (reduces spam)
- First run saves baseline, no alert

### Customizable
- `threshold_ratio`: Control sensitivity (1.05 to 1.5)
- `alert_enabled`: Turn alerts on/off
- `check_interval`: Run frequency (via cron)

---

**Ready to deploy! 🚀**
