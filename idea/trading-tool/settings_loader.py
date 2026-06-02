"""
Load configuration from settings.json

Returns:
    dict: Configuration dictionary with telegram, api, and signal settings
"""

import json
from pathlib import Path


def load_settings():
    """
    Load settings from settings.json file
    
    Returns:
        dict: Settings dictionary with credentials and configuration
        
    Raises:
        FileNotFoundError: If settings.json does not exist
        json.JSONDecodeError: If settings.json is invalid JSON
    """
    settings_path = Path(__file__).parent / "settings.json"
    
    if not settings_path.exists():
        raise FileNotFoundError(f"settings.json not found at {settings_path}")
    
    with open(settings_path, 'r') as file:
        settings = json.load(file)
    
    return settings


def get_telegram_credentials():
    """
    Get Telegram bot token and chat ID from settings
    
    Returns:
        tuple: (bot_token, chat_id) from settings.json
    """
    settings = load_settings()
    telegram_config = settings.get("telegram", {})
    
    bot_token = telegram_config.get("bot_token", "")
    chat_id = telegram_config.get("chat_id", "")
    
    return bot_token, chat_id


def get_api_config():
    """
    Get API configuration from settings
    
    Returns:
        dict: API configuration containing url and timeout_seconds
    """
    settings = load_settings()
    api_config = settings.get("api", {})
    
    return api_config


def get_signal_config():
    """
    Get signal analysis configuration from settings
    
    Returns:
        dict: Signal configuration containing direction_threshold_ratio and alert_enabled
    """
    settings = load_settings()
    signal_config = settings.get("signal", {})
    
    return signal_config
