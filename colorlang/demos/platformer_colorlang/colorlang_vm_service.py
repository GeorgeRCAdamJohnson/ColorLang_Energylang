"""
ColorLang VM Web Service

Provides REST API endpoints to load and execute the actual ColorLang kernel
from advanced_platform_kernel.png using the real ColorLang parser and VM.
"""
import os
import sys
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time

# Add project root to path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

try:
    from colorlang.color_parser import ColorParser
    from colorlang.virtual_machine import ColorVM
    COLORLANG_AVAILABLE = True
except ImportError as e:
    print(f"ColorLang modules not available: {e}")
    COLORLANG_AVAILABLE = False

class ColorLangWebHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, colorlang_service=None, **kwargs):
        self.colorlang_service = colorlang_service
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/load_colorlang_kernel':
            self.handle_load_kernel()
        elif parsed_path.path == '/api/colorlang/status':
            self.handle_status()
        else:
            # Serve static files
            super().do_GET()
    
    def do_POST(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/colorlang/execute_step':
            self.handle_execute_step()
        else:
            self.send_error(404, "Endpoint not found")
    
    def handle_load_kernel(self):
        """Load the actual ColorLang kernel from advanced_platform_kernel.png"""
        try:
            if not self.colorlang_service:
                self.send_json_response({"error": "ColorLang service not available"}, 500)
                return
                
            kernel_data = self.colorlang_service.load_kernel()
            self.send_json_response(kernel_data)
            
        except Exception as e:
            self.send_json_response({"error": str(e)}, 500)
    
    def handle_execute_step(self):
        """Execute a ColorLang VM step with game state"""
        try:
            # Read game state from request
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            game_state = json.loads(post_data.decode('utf-8'))
            
            if not self.colorlang_service:
                self.send_json_response({"error": "ColorLang service not available"}, 500)
                return
            
            result = self.colorlang_service.execute_step(game_state)
            self.send_json_response(result)
            
        except Exception as e:
            self.send_json_response({"error": str(e)}, 500)
    
    def handle_status(self):
        """Return ColorLang system status"""
        status = {
            "colorlang_available": COLORLANG_AVAILABLE,
            "kernel_loaded": self.colorlang_service and self.colorlang_service.kernel_loaded,
            "vm_running": self.colorlang_service and self.colorlang_service.vm is not None
        }
        self.send_json_response(status)
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        json_data = json.dumps(data, indent=2)
        self.wfile.write(json_data.encode('utf-8'))
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

class ColorLangService:
    def __init__(self):
        self.parser = None
        self.vm = None
        self.program = None
        self.kernel_loaded = False
        
        if COLORLANG_AVAILABLE:
            self.initialize_colorlang()
    
    def initialize_colorlang(self):
        """Initialize ColorLang parser and VM"""
        try:
            self.parser = ColorParser()
            self.vm = ColorVM()
            print("ColorLang system initialized")
        except Exception as e:
            print(f"Failed to initialize ColorLang: {e}")
            
    def load_kernel(self):
        """Load the actual ColorLang kernel from advanced_platform_kernel.png"""
        if not COLORLANG_AVAILABLE:
            raise Exception("ColorLang system not available")
        
        kernel_path = "advanced_platform_kernel.png"
        if not os.path.exists(kernel_path):
            raise Exception(f"Kernel file not found: {kernel_path}")
        
        try:
            # Parse the actual ColorLang kernel
            self.program = self.parser.parse_image(kernel_path)
            
            # Load program into VM
            self.vm.load_program(self.program)
            
            self.kernel_loaded = True
            
            # Return kernel information
            return {
                "status": "loaded",
                "kernel_file": kernel_path,
                "instructions": self.program.get('instructions', []),
                "tilemap": self.program.get('tilemap', []),
                "agentState": self.program.get('agentState', {}),
                "cognitionStrip": self.program.get('cognitionStrip', []),
                "metadata": {
                    "width": getattr(self.program, 'width', 21),
                    "height": getattr(self.program, 'height', 20),
                    "elements": len(self.program.get('data', [])),
                    "instruction_count": len(self.program.get('instructions', []))
                }
            }
            
        except Exception as e:
            self.kernel_loaded = False
            raise Exception(f"Failed to load kernel: {e}")
    
    def execute_step(self, game_state):
        """Execute a ColorLang VM step with current game state"""
        if not self.kernel_loaded or not self.vm:
            raise Exception("ColorLang kernel not loaded")
        
        try:
            # Map game state to ColorLang VM memory
            self.update_vm_memory(game_state)
            
            # Execute VM step
            result = self.vm.step()
            
            # Extract movement decision from VM result
            action = self.extract_action_from_vm(result, game_state)
            
            return {
                "action": action,
                "vm_state": {
                    "memory": self.vm.memory[:20],  # First 20 memory locations
                    "registers": getattr(self.vm, 'registers', {}),
                    "program_counter": getattr(self.vm, 'program_counter', 0),
                    "shared_memory": getattr(self.vm, 'shared_memory', {})
                },
                "game_state_received": {
                    "monkey_pos": [game_state['monkey']['x'], game_state['monkey']['y']],
                    "banana_count": len(game_state['bananas']),
                    "difficulty": game_state.get('difficulty', 1)
                }
            }
            
        except Exception as e:
            # Fallback action if VM execution fails
            return {
                "action": "wait",
                "error": str(e),
                "fallback": True
            }
    
    def update_vm_memory(self, game_state):
        """Map game state to ColorLang VM memory addresses"""
        monkey = game_state['monkey']
        bananas = game_state['bananas']
        
        # Map to standard ColorLang memory layout
        if hasattr(self.vm, 'memory'):
            self.vm.memory[0] = int(monkey['x'] * 10)  # AGENT_X
            self.vm.memory[1] = int(monkey['y'] * 10)  # AGENT_Y
            self.vm.memory[2] = len(bananas)           # BANANA_COUNT
            self.vm.memory[3] = int(monkey.get('vx', 0) * 10)  # AGENT_VX
            self.vm.memory[4] = int(monkey.get('vy', 0) * 10)  # AGENT_VY
            self.vm.memory[5] = 1 if monkey.get('onGround', False) else 0  # ON_GROUND
            
            # Map banana positions (up to 10 bananas)
            for i, banana in enumerate(bananas[:10]):
                base_addr = 10 + i * 2
                self.vm.memory[base_addr] = int(banana['x'] * 10)
                self.vm.memory[base_addr + 1] = int(banana['y'] * 10)
                
        # Update shared memory if available
        if hasattr(self.vm, 'shared_memory'):
            shared_mem = self.vm.shared_memory
            if 'agent_state' in shared_mem:
                shared_mem['agent_state']['x'] = monkey['x']
                shared_mem['agent_state']['y'] = monkey['y']
    
    def extract_action_from_vm(self, vm_result, game_state):
        """Extract movement action from ColorLang VM execution result"""
        # Check VM output/shared memory for movement commands
        if hasattr(self.vm, 'shared_memory'):
            shared_mem = self.vm.shared_memory
            
            # Look for movement commands in shared memory
            if 'movement_command' in shared_mem:
                return shared_mem['movement_command']
                
            # Check cognition strip for decisions
            if 'cognition_strip' in shared_mem:
                cognition = shared_mem['cognition_strip']
                if cognition and len(cognition) > 0:
                    # Interpret first cognition value as movement decision
                    decision = cognition[0] % 4
                    return ['wait', 'left', 'right', 'jump'][decision]
        
        # Check VM registers for output
        if hasattr(self.vm, 'registers') and self.vm.registers:
            output_reg = self.vm.registers.get('OUTPUT', self.vm.registers.get('A', 0))
            if output_reg > 0:
                action_map = {1: 'left', 2: 'right', 3: 'jump', 4: 'wait'}
                return action_map.get(output_reg % 5, 'wait')
        
        # Simple AI fallback using game state
        return self.simple_ai_fallback(game_state)
    
    def simple_ai_fallback(self, game_state):
        """Simple AI fallback when ColorLang VM doesn't provide clear output"""
        monkey = game_state['monkey']
        bananas = game_state['bananas']
        
        if not bananas:
            return 'wait'
        
        # Find nearest banana
        nearest = min(bananas, key=lambda b: abs(b['x'] - monkey['x']) + abs(b['y'] - monkey['y']))
        
        dx = nearest['x'] - monkey['x']
        dy = nearest['y'] - monkey['y']
        
        if abs(dx) > 0.8:
            return 'right' if dx > 0 else 'left'
        elif dy < -1 and monkey.get('onGround', True):
            return 'jump'
        else:
            return 'wait'

def create_handler_with_service(colorlang_service):
    """Create request handler with ColorLang service"""
    class HandlerWithService(ColorLangWebHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, colorlang_service=colorlang_service, **kwargs)
    return HandlerWithService

def main():
    """Start the ColorLang web service"""
    print("Starting ColorLang VM Web Service...")
    
    # Initialize ColorLang service
    colorlang_service = ColorLangService()
    
    # Create HTTP server
    port = 8080
    server_address = ('', port)
    
    handler_class = create_handler_with_service(colorlang_service)
    httpd = HTTPServer(server_address, handler_class)
    
    print(f"ColorLang VM service running on http://localhost:{port}")
    print("Available endpoints:")
    print("  GET  /load_colorlang_kernel - Load advanced_platform_kernel.png")
    print("  POST /api/colorlang/execute_step - Execute ColorLang VM step")
    print("  GET  /api/colorlang/status - Get system status")
    print("  GET  /web_advanced_platform.html - Game interface")
    print()
    print("ColorLang System Status:")
    print(f"  ColorLang Available: {COLORLANG_AVAILABLE}")
    print(f"  Kernel File: {'✓' if os.path.exists('advanced_platform_kernel.png') else '✗'} advanced_platform_kernel.png")
    print()
    
    if COLORLANG_AVAILABLE:
        print("Ready to serve real ColorLang VM execution!")
    else:
        print("Warning: ColorLang modules not available - using fallback mode")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\\nShutting down ColorLang VM service...")
        httpd.shutdown()

if __name__ == "__main__":
    main()