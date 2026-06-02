#!/usr/bin/env python3
"""
Trading Signal Alert Tool - Main Entry Point

This is the main orchestrator that:
1. Fetches current BTC signal data from TurtleTrading API
2. Analyzes the direction (LONG/SHORT/NEUTRAL)
3. Compares with previous direction
4. Sends Telegram alert if direction changes
5. Saves the new state

Usage:
    python main.py

Environment:
    Credentials should be set in settings.json:
    - telegram.bot_token
    - telegram.chat_id
"""

from datetime import datetime
from api_client import fetch_btc_signal_data
from signal_analyzer import analyze_current_direction
from state_manager import load_previous_direction, save_current_direction
from telegram_notifier import send_direction_change_alert


def run_signal_check():
    """
    Execute a complete signal check cycle
    
    This is the main workflow that:
    1. Fetches latest signal data
    2. Analyzes current direction
    3. Loads previous state
    4. Detects direction changes
    5. Sends alerts if needed
    6. Updates state file
    
    Returns:
        bool: True if check completed successfully, False if an error occurred
    """
    
    # Print timestamp
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"\n🔍 Signal Check Started at {current_time}")
    print("=" * 50)
    
    # Step 1: Fetch signal data
    print("\n📡 Fetching signal data...")
    signal_data = fetch_btc_signal_data()
    
    if not signal_data:
        print("❌ Check failed: Unable to fetch data")
        return False
    
    # Step 2: Analyze current direction
    print("\n🔬 Analyzing direction...")
    current_direction = analyze_current_direction(signal_data)
    
    if not current_direction:
        print("❌ Check failed: Unable to determine direction")
        return False
    
    # Step 3: Load previous state
    print("\n📂 Loading previous state...")
    previous_direction = load_previous_direction()
    
    # Step 4: Check for direction change
    print("\n🔄 Checking for direction change...")
    if previous_direction is None:
        print("ℹ️  First run - no previous state to compare")
        print("ℹ️  No alert sent on first run")
    
    elif previous_direction == current_direction:
        print(f"✓ No change detected (still {current_direction})")
    
    else:
        print(f"🚨 Direction change detected: {previous_direction} → {current_direction}")
        
        current_price = signal_data.get('current_price', 0)
        alert_sent = send_direction_change_alert(previous_direction, current_direction, current_price)
        
        if not alert_sent:
            print("⚠️  Alert failed to send")
    
    # Step 5: Save current state
    print("\n💾 Saving current state...")
    current_price = signal_data.get('current_price', 0)
    save_current_direction(current_direction, current_price)
    
    print("\n" + "=" * 50)
    print("✅ Signal check completed successfully\n")
    return True


if __name__ == "__main__":
    try:
        run_signal_check()
    except KeyboardInterrupt:
        print("\n\n⏹️  Signal check interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
