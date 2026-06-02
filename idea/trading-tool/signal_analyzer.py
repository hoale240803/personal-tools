"""
Signal analyzer for determining BTC trading direction (LONG/SHORT/NEUTRAL)

This analyzer uses price level distribution to determine market direction:

LOGIC EXPLANATION:
==================
The API returns price_bins which are support/resistance levels detected by TurtleTrading.

Direction Determination:
- LONG (Bullish): More resistance levels ABOVE current price
  → Market is expected to move UP, buyers are stronger
  
- SHORT (Bearish): More support levels BELOW current price
  → Market is expected to move DOWN, sellers are stronger
  
- NEUTRAL: Balanced distribution of levels

Example:
    Current Price: $75,000
    
    LONG case:
        Levels ABOVE: [77000, 78000, 79000, 80000, 81000] (5 levels)
        Levels BELOW: [74000, 73000, 72000] (3 levels)
        → 5 > 3 * 1.2? → 5 > 3.6? → YES → LONG (bullish pressure)
    
    SHORT case:
        Levels ABOVE: [76000, 76500, 77000] (3 levels)
        Levels BELOW: [74500, 74000, 73500, 73000, 72500, 72000] (6 levels)
        → 6 > 3 * 1.2? → 6 > 3.6? → YES → SHORT (bearish pressure)

Functions:
    analyze_current_direction(signal_data): Determine LONG/SHORT/NEUTRAL based on price levels
    extract_current_price(signal_data): Get the current BTC price from signal data
    count_levels_above_price(price_bins, current_price): Count resistance levels above price
    count_levels_below_price(price_bins, current_price): Count support levels below price
"""

from settings_loader import get_signal_config


def extract_current_price(signal_data):
    """
    Extract the current BTC price from signal data
    
    Args:
        signal_data (dict): Signal data from API containing 'current_price' key
    
    Returns:
        float: Current BTC price in USD
               Returns 0 if price not found
    """
    if not signal_data:
        return 0
    
    current_price = signal_data.get('current_price', 0)
    return current_price


def extract_price_bins(signal_data):
    """
    Extract price bins (support/resistance levels) from signal data
    
    Args:
        signal_data (dict): Signal data from API containing 'price_bins' key
    
    Returns:
        list: List of price levels (int/float)
              Returns empty list if not found
    """
    if not signal_data:
        return []
    
    price_bins = signal_data.get('price_bins', [])
    return price_bins


def count_levels_above_price(price_bins, current_price):
    """
    Count resistance levels (price bins above current price)
    
    Args:
        price_bins (list): List of price levels from API
        current_price (float): Current BTC price
    
    Returns:
        int: Number of price levels above current price (resistance)
    """
    count = sum(1 for price_level in price_bins if price_level > current_price)
    return count


def count_levels_below_price(price_bins, current_price):
    """
    Count support levels (price bins below current price)
    
    Args:
        price_bins (list): List of price levels from API
        current_price (float): Current BTC price
    
    Returns:
        int: Number of price levels below current price (support)
    """
    count = sum(1 for price_level in price_bins if price_level < current_price)
    return count


def determine_direction_from_levels(levels_above, levels_below, threshold_ratio):
    """
    Determine market direction based on level distribution
    
    Args:
        levels_above (int): Count of resistance levels above current price
        levels_below (int): Count of support levels below current price
        threshold_ratio (float): Threshold ratio for direction determination (e.g., 1.2 = 20%)
    
    Returns:
        str: Direction indicator - "LONG", "SHORT", or "NEUTRAL"
        
    Logic:
        - LONG: levels_above > levels_below * threshold_ratio
        - SHORT: levels_below > levels_above * threshold_ratio
        - NEUTRAL: Neither condition met
    """
    
    if levels_above > levels_below * threshold_ratio:
        return "LONG"
    
    elif levels_below > levels_above * threshold_ratio:
        return "SHORT"
    
    else:
        return "NEUTRAL"


def analyze_current_direction(signal_data):
    """
    Analyze and determine the current market direction (LONG/SHORT/NEUTRAL)
    
    This function performs a complete analysis by:
    1. Extracting current price and price bins from signal data
    2. Counting support/resistance levels relative to current price
    3. Comparing distributions using the configured threshold
    
    Args:
        signal_data (dict): Signal data from API containing:
                           - 'current_price': Current BTC price
                           - 'price_bins': List of support/resistance levels
    
    Returns:
        str: Market direction indicator: "LONG", "SHORT", or "NEUTRAL"
             Returns None if signal_data is invalid
    """
    
    # Validate input data
    if not signal_data:
        print("⚠️  No signal data provided")
        return None
    
    # Extract data from signal
    current_price = extract_current_price(signal_data)
    price_bins = extract_price_bins(signal_data)
    
    if not price_bins or current_price == 0:
        print("⚠️  Invalid signal data: missing price or price_bins")
        return None
    
    # Count levels above and below current price
    levels_above = count_levels_above_price(price_bins, current_price)
    levels_below = count_levels_below_price(price_bins, current_price)
    
    # Get threshold from settings
    signal_config = get_signal_config()
    threshold_ratio = signal_config.get("direction_threshold_ratio", 1.2)
    
    # Determine direction
    direction = determine_direction_from_levels(levels_above, levels_below, threshold_ratio)
    
    # Log analysis details
    print(f"📊 Signal Analysis:")
    print(f"   Current Price: ${current_price:,.2f}")
    print(f"   Levels Above (Resistance): {levels_above}")
    print(f"   Levels Below (Support): {levels_below}")
    print(f"   Direction: {direction}")
    
    return direction
