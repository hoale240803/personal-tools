#!/usr/bin/env python3
"""
Simple icon generator for Chrome Extension
Generates placeholder PNG icons with Bitcoin symbol

Requirements:
    pip install pillow

Usage:
    python create_icons.py
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    """
    Create a simple Bitcoin icon with the given size
    
    Args:
        size: Icon size (16, 48, or 128)
        output_path: Where to save the PNG file
    """
    
    # Create image with dark background
    img = Image.new('RGB', (size, size), color='#1e1e1e')
    draw = ImageDraw.Draw(img)
    
    # Define colors
    gold_color = '#FFB900'
    text_color = '#FFFFFF'
    
    # Draw border
    border_width = max(1, size // 32)
    draw.rectangle(
        [(border_width, border_width), (size - border_width, size - border_width)],
        outline=gold_color,
        width=border_width
    )
    
    # Draw Bitcoin symbol (₿)
    try:
        # Try to use a larger font for better appearance
        if size >= 128:
            font_size = 80
        elif size >= 48:
            font_size = 32
        else:
            font_size = 10
            
        # Use default font (PIL default)
        font = ImageFont.load_default()
        
        # Bitcoin symbol
        symbol = "₿"  # Unicode Bitcoin symbol
        
        # Calculate position to center the symbol
        bbox = draw.textbbox((0, 0), symbol, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (size - text_width) // 2
        y = (size - text_height) // 2
        
        draw.text((x, y), symbol, fill=text_color, font=font)
        
    except Exception as e:
        print(f"Note: Could not draw Bitcoin symbol: {e}")
        # Fallback: draw 'B' as placeholder
        draw.text(
            ((size // 2) - 4, (size // 2) - 4),
            "B",
            fill=gold_color
        )
    
    # Save the image
    img.save(output_path, 'PNG')
    print(f"✅ Created {output_path} ({size}x{size})")

def main():
    """Create all required icon sizes"""
    
    # Ensure icons directory exists
    os.makedirs('.', exist_ok=True)
    
    print("🎨 Generating Chrome Extension Icons...")
    print("=" * 50)
    
    sizes = [16, 48, 128]
    
    for size in sizes:
        output_path = f"icon{size}.png"
        create_icon(size, output_path)
    
    print("=" * 50)
    print("✅ All icons created successfully!")
    print("\nIcon files:")
    for size in sizes:
        path = f"icon{size}.png"
        if os.path.exists(path):
            file_size = os.path.getsize(path)
            print(f"  ✓ {path} ({file_size} bytes)")
    
    print("\n📝 Next steps:")
    print("1. Go to chrome://extensions/")
    print("2. Load unpacked extension")
    print("3. Select the chrome-extension folder")

if __name__ == "__main__":
    try:
        main()
    except ImportError:
        print("❌ Error: Pillow library not installed")
        print("\nInstall with:")
        print("  pip install pillow")
    except Exception as e:
        print(f"❌ Error: {e}")
