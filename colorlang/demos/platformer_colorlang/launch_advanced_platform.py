"""
Advanced Platform Launcher - Multiple Options

Launch the enhanced ColorLang platformer using the best available graphics system.
Tries pygame, tkinter, web browser, then console versions in order.
"""
import os
import sys
import importlib.util
import time

def check_module(module_name):
    """Check if a module is available."""
    spec = importlib.util.find_spec(module_name)
    return spec is not None

def main():
    """Launch the advanced platform challenge using the best available option."""
    print("=" * 60)
    print("🍌 ColorLang Advanced Platform Challenge 🍌")
    print("=" * 60)
    print()
    print("Game Features:")
    print("• 2-minute timed challenge")
    print("• Randomly spawning bananas")
    print("• Increasing difficulty every 30 seconds")
    print("• Enhanced visual scaling")
    print("• 24x14 world for better navigation")
    print("• Progressive difficulty scaling")
    print()
    print("Checking available graphics systems...")
    
    # Check pygame first
    if check_module("pygame"):
        print("✓ Pygame detected - launching graphical version...")
        try:
            from advanced_platform_host import AdvancedPlatformHost
            host = AdvancedPlatformHost()
            host.run()
            return
        except Exception as e:
            print(f"Pygame version failed: {e}")
    
    # Try tkinter (built into Python)
    if check_module("tkinter"):
        print("✓ Tkinter available - launching desktop GUI version...")
        try:
            from tkinter_advanced_platform import TkinterAdvancedPlatform
            game = TkinterAdvancedPlatform()
            game.run()
            return
        except Exception as e:
            print(f"Tkinter version failed: {e}")
    
    # Try web version
    print("⚠ Launching web browser version...")
    try:
        from launch_web_platform import AdvancedPlatformServer
        server = AdvancedPlatformServer()
        server.launch_game()
        return
    except Exception as e:
        print(f"Web version failed: {e}")
    
    # Fall back to console
    print("⚠ Falling back to console version...")
    try:
        from simple_advanced_platform import SimpleAdvancedPlatform
        game = SimpleAdvancedPlatform()
        game.run()
    except Exception as e:
        print(f"Console version failed: {e}")
        print("\\nNo working versions found. Please check your Python installation.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\\nGame interrupted by user.")
    except Exception as e:
        print(f"\\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
