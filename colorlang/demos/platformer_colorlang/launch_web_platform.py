"""
Web Server for ColorLang Advanced Platform

Launches the ColorLang VM service that provides real ColorLang execution
from advanced_platform_kernel.png with web-based visualization.
"""
import subprocess
import webbrowser
import os
import sys
import time
import threading

class AdvancedPlatformServer:
    def __init__(self, port=8080):
        self.port = port
        self.colorlang_process = None
        
    def start_colorlang_service(self):
        """Start the ColorLang VM service."""
        os.chdir(os.path.dirname(__file__))
        
        # Get Python executable path
        python_exe = sys.executable
        
        # Start ColorLang VM service
        self.colorlang_process = subprocess.Popen(
            [python_exe, "colorlang_vm_service.py"],
            cwd=os.getcwd()
        )
        
        print(f"ColorLang VM service starting on http://localhost:{self.port}")
        
    def launch_game(self):
        """Launch the web-based advanced platform game."""
        print("=" * 60)
        print("🍌 ColorLang Advanced Platform - Web Edition 🍌")
        print("=" * 60)
        print()
        print("Features:")
        print("• Full HTML5 Canvas graphics (no pygame needed!)")
        print("• 2-minute timed challenge")
        print("• Random banana generation")
        print("• Increasing difficulty every 30 seconds")
        print("• Enhanced 24x14 world with 4x visual scaling")
        print("• Smooth animations and particle effects")
        print("• Responsive controls and game feedback")
        print()
        print("Starting web server...")
        
        try:
            self.start_colorlang_service()
            time.sleep(3)  # Give ColorLang service time to start
            
            game_url = f"http://localhost:{self.port}/web_advanced_platform.html"
            print(f"Opening ColorLang VM game in browser: {game_url}")
            
            webbrowser.open(game_url)
            
            print()
            print("🤖 ColorLang VM Features:")
            print("• Real ColorLang execution from advanced_platform_kernel.png")
            print("• Actual VM memory, registers, and instruction processing")
            print("• Live ColorLang AI decision making")
            print("• Click 'Watch AI Play' to see ColorLang VM in action!")
            print()
            print("🎮 Manual Controls:")
            print("• Arrow Keys: Move monkey")
            print("• Space/Up Arrow: Jump")
            print("• R: Restart game")
            print()
            print("Press Ctrl+C to stop the ColorLang VM service...")
            
            # Keep service running
            try:
                while True:
                    if self.colorlang_process.poll() is not None:
                        print("ColorLang service stopped unexpectedly")
                        break
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\\nShutting down ColorLang VM service...")
                if self.colorlang_process:
                    self.colorlang_process.terminate()
                    self.colorlang_process.wait()
                print("ColorLang VM service stopped. Thank you for playing!")
                
        except OSError as e:
            if "address already in use" in str(e).lower():
                print(f"Port {self.port} is already in use. Trying port {self.port + 1}...")
                self.port += 1
                self.launch_game()
            else:
                print(f"Error starting server: {e}")
        except Exception as e:
            print(f"Unexpected error: {e}")

def main():
    """Launch the web-based advanced platform game."""
    print("ColorLang Advanced Platform - Web Launch")
    print("This version runs in your browser with full graphics!")
    print()
    
    # Check if HTML file exists
    html_file = "web_advanced_platform.html"
    if not os.path.exists(html_file):
        print(f"Error: {html_file} not found!")
        print("Please ensure you're in the correct directory.")
        return
    
    server = AdvancedPlatformServer()
    server.launch_game()

if __name__ == "__main__":
    main()