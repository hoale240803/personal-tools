"""
Telegram notification service for sending trading alerts

Functions:
    send_direction_change_alert(previous_direction, current_direction, current_price): Send alert when direction changes
"""

import requests
from datetime import datetime
from settings_loader import get_telegram_credentials, get_signal_config


def validate_telegram_credentials():
    """
    Validate that Telegram credentials are configured
    
    Returns:
        bool: True if both bot_token and chat_id are set, False otherwise
    """
    bot_token, chat_id = get_telegram_credentials()
    
    if not bot_token or not chat_id:
        print("⚠️  Telegram credentials not configured in settings.json")
        print("   Set 'telegram.bot_token' and 'telegram.chat_id'")
        return False
    
    return True


def send_telegram_message(message_text):
    """
    Send a message to Telegram
    
    Args:
        message_text (str): Message content to send (supports HTML formatting)
    
    Returns:
        bool: True if message sent successfully, False otherwise
    """
    
    # Get credentials
    bot_token, chat_id = get_telegram_credentials()
    
    if not validate_telegram_credentials():
        return False
    
    # Prepare API request
    telegram_api_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message_text,
        "parse_mode": "HTML"
    }
    
    try:
        response = requests.post(telegram_api_url, json=payload, timeout=10)
        response.raise_for_status()
        
        print("✅ Alert sent to Telegram")
        return True
        
    except requests.exceptions.Timeout:
        print("❌ Telegram API timeout")
        return False
        
    except requests.exceptions.HTTPError as e:
        print(f"❌ Telegram API error: {e.response.status_code}")
        if e.response.status_code == 400:
            print("   Check: bot_token and chat_id in settings.json")
        return False
        
    except Exception as e:
        print(f"❌ Error sending Telegram alert: {e}")
        return False


def format_direction_change_message(previous_direction, current_direction, current_price):
    """
    Format a message for direction change alert
    
    Args:
        previous_direction (str): Previous direction (LONG/SHORT/NEUTRAL)
        current_direction (str): Current direction (LONG/SHORT/NEUTRAL)
        current_price (float): Current BTC price
    
    Returns:
        str: Formatted message with HTML markup ready for Telegram
    """
    
    # Select emoji based on direction
    emoji_map = {
        "LONG": "📈",
        "SHORT": "📉",
        "NEUTRAL": "⚖️"
    }
    
    previous_emoji = emoji_map.get(previous_direction, "❓")
    current_emoji = emoji_map.get(current_direction, "❓")
    
    # Format timestamp
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Build message
    message = (
        f"{current_emoji} <b>BTC SIGNAL CHANGED</b> {current_emoji}\n\n"
        f"<b>Direction Change:</b>\n"
        f"{previous_emoji} {previous_direction} → {current_emoji} {current_direction}\n\n"
        f"<b>Current Price:</b> ${current_price:,.2f}\n"
        f"<b>Time:</b> {current_time}\n\n"
        f"<a href='https://signals.turtletrading.vn/chart/btc'>View Chart on TurtleTrading</a>"
    )
    
    return message


def send_direction_change_alert(previous_direction, current_direction, current_price):
    """
    Send an alert when market direction changes
    
    This function is called when a direction change is detected (e.g., LONG → SHORT)
    and sends a formatted notification to Telegram with the change details.
    
    Args:
        previous_direction (str): Previous market direction (LONG/SHORT/NEUTRAL)
        current_direction (str): Current market direction (LONG/SHORT/NEUTRAL)
        current_price (float): Current BTC price at time of detection
    
    Returns:
        bool: True if alert sent successfully, False otherwise
    """
    
    # Check if alerts are enabled in settings
    signal_config = get_signal_config()
    alert_enabled = signal_config.get("alert_enabled", True)
    
    if not alert_enabled:
        print("ℹ️  Alerts disabled in settings.json")
        return True
    
    # Format message
    message = format_direction_change_message(previous_direction, current_direction, current_price)
    
    # Send message
    print(f"🚨 Sending alert: {previous_direction} → {current_direction}")
    return send_telegram_message(message)
