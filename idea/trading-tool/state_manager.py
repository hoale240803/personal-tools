"""
State manager for tracking previous signal direction

This module handles saving and loading the previous signal state
to enable detection of direction changes.

Functions:
    load_previous_direction(): Get the previously saved direction
    save_current_direction(direction, price): Save the current direction for future checks
"""

import json
from datetime import datetime
from pathlib import Path


STATE_FILE = "signal_state.json"


def get_state_file_path():
    """
    Get the full path to the state file
    
    Returns:
        Path: Path object pointing to signal_state.json
    """
    return Path(__file__).parent / STATE_FILE


def load_previous_direction():
    """
    Load the previously saved signal direction
    
    This function reads signal_state.json to get the direction from the last check.
    Used to detect if there's a direction change on this run.
    
    Returns:
        str: Previous direction ("LONG", "SHORT", "NEUTRAL", or None if no prior state)
    """
    state_file_path = get_state_file_path()
    
    if not state_file_path.exists():
        print("ℹ️  No previous state found (first run)")
        return None
    
    try:
        with open(state_file_path, 'r') as file:
            state = json.load(file)
        
        previous_direction = state.get('direction')
        return previous_direction
        
    except json.JSONDecodeError:
        print("⚠️  Error reading state file (corrupted)")
        return None
        
    except Exception as e:
        print(f"⚠️  Error loading state: {e}")
        return None


def save_current_direction(direction, current_price=None):
    """
    Save the current signal direction to state file
    
    This function saves the current direction along with timestamp and price
    for use in the next check cycle to detect changes.
    
    Args:
        direction (str): Current direction ("LONG", "SHORT", or "NEUTRAL")
        current_price (float, optional): Current BTC price for reference
    
    Returns:
        bool: True if saved successfully, False otherwise
    """
    
    state_file_path = get_state_file_path()
    
    state = {
        "direction": direction,
        "price": current_price,
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        with open(state_file_path, 'w') as file:
            json.dump(state, file, indent=2)
        
        print("✅ State saved")
        return True
        
    except Exception as e:
        print(f"⚠️  Error saving state: {e}")
        return False
