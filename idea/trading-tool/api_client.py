"""
API client for fetching trading signal data from TurtleTrading API

Functions:
    fetch_btc_signal_data(): Fetch the latest BTC signal data from the API
"""

import requests
from settings_loader import get_api_config


def fetch_btc_signal_data():
    """
    Fetch the latest BTC signal data from TurtleTrading API
    
    This function retrieve`s liquidity heatmap data for BTC including:
    - Current price
    - Price levels (support/resistance bins)
    - Market tier information
    
    Returns:
        dict: Signal data containing price, price_bins, and tier information
              Returns None if the request fails
    """
    api_config = get_api_config()
    api_url = api_config.get("url")
    timeout = api_config.get("timeout_seconds", 10)
    
    headers = {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
        'cache-control': 'max-age=0',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(api_url, headers=headers, timeout=timeout)
        response.raise_for_status()
        
        print("✅ Successfully fetched signal data from API")
        return response.json()
        
    except requests.exceptions.Timeout:
        print(f"❌ Request timeout after {timeout} seconds")
        return None
        
    except requests.exceptions.ConnectionError:
        print("❌ Failed to connect to API")
        return None
        
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP error: {e.response.status_code}")
        return None
        
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        return None
