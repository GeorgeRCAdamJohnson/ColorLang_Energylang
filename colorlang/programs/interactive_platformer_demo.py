#!/usr/bin/env python3
"""
Interactive ColorLang Platformer Demo
=====================================

This script demonstrates the complete ColorLang platformer system with 
real-time rendering and user input handling.

Usage:
    python interactive_platformer_demo.py

Controls:
    - Arrow keys: Move agent
    - ESC: Exit
    - SPACE: Jump (if implemented in kernel)
"""

import sys
import os
sys.path.insert(0, os.path.abspath('.'))

try:
    import pygame
    PYGAME_AVAILABLE = True
except ImportError:
    PYGAME_AVAILABLE = False

from demos.platformer_colorlang.platformer_host import PlatformerHost
import threading
import time

def main():
    """Main demo function."""
    print("ColorLang Interactive Platformer Demo")
    print("====================================")
    
    if not PYGAME_AVAILABLE:
        print("⚠️  Pygame not available - running in console mode")
        print("   Install pygame for full interactive experience: pip install pygame")
    else:
        print("✅ Pygame available - full interactive mode enabled")
    
    print("\nInitializing ColorLang platformer...")
    
    # Create the platformer host
    host = PlatformerHost()
    
    # Load the ColorLang kernel
    if not host.load_kernel():
        print("❌ Failed to load ColorLang kernel")
        return 1
    
    print(f"✅ Kernel loaded successfully! ({len(host.program.get('instructions', []))} instructions)")
    
    if PYGAME_AVAILABLE and hasattr(host, 'pygame_available') and host.pygame_available:
        print("\n🎮 Starting interactive pygame mode...")
        print("Controls:")
        print("  - Arrow keys: Move agent")
        print("  - ESC: Exit")
        print("  - Close window to quit")
        
        # Run the interactive game
        try:
            host.run()  # This will use pygame mode
        except KeyboardInterrupt:
            print("\n👋 Game interrupted by user")
        except Exception as e:
            print(f"\n❌ Game error: {e}")
    else:
        print("\n📟 Starting console demo mode...")
        print("Running for 10 seconds to demonstrate ColorLang execution...")
        
        # Run in console mode for demonstration
        stop_event = threading.Event()
        
        def run_demo():
            try:
                host.run(stop_event)
            except Exception as e:
                print(f"Demo error: {e}")
        
        demo_thread = threading.Thread(target=run_demo)
        demo_thread.daemon = True
        demo_thread.start()
        
        # Show progress for 10 seconds
        for i in range(10):
            print(f"⏰ Demo running... {10-i}s remaining", end='\r')
            time.sleep(1)
        
        stop_event.set()
        print("\n✅ Console demo completed successfully!")
    
    print("\n🎯 ColorLang platformer demo finished!")
    print("   This demonstrates a complete machine-native program")
    print("   executing from HSV-encoded image pixels in real-time.")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())