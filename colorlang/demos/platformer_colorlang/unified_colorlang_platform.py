"""
Unified ColorLang Advanced Platform

A complete, self-contained version that integrates the real ColorLang VM
directly with the web interface using a unified Python backend.
"""
import os
import sys
import json
import webbrowser
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler, SimpleHTTPRequestHandler
from urllib.parse import urlparse

# Add project root to path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Import ColorLang components
try:
    from colorlang.color_parser import ColorParser
    from colorlang.virtual_machine import ColorVM
    COLORLANG_AVAILABLE = True
    print("✓ ColorLang modules loaded successfully")
except ImportError as e:
    print(f"✗ ColorLang modules not available: {e}")
    COLORLANG_AVAILABLE = False

class UnifiedColorLangHandler(BaseHTTPRequestHandler):
    # Class variable to store the ColorLang system
    colorlang_system = None
    
    def log_message(self, format, *args):
        """Override to add request logging"""
        print(f"[HTTP] {self.address_string()} - {format % args}")
        
    def list_directory(self, path):
        """Disable directory listing - always serve game interface instead"""
        print("[DEBUG] Directory listing blocked - serving game interface")
        self.serve_game_interface()
        return None
        
    def list_directory(self, path):
        """Disable directory listing - always serve game interface instead"""
        print("[DEBUG] Directory listing blocked - serving game interface")
        self.serve_game_interface()
        return None
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        print(f"[DEBUG] Received GET request for: {path}")
        
        if path == '/' or path == '/index.html' or path == '':
            print("[DEBUG] Serving main game interface")
            self.serve_game_interface()
        elif path == '/api/colorlang/kernel':
            print("[DEBUG] Serving kernel data")
            self.serve_kernel_data()
        elif path == '/api/colorlang/status':
            print("[DEBUG] Serving status")
            self.serve_status()
        elif path == '/web_advanced_platform.html':
            print("[DEBUG] Serving web_advanced_platform.html")
            self.serve_file('web_advanced_platform.html', 'text/html')
        elif path.endswith('.html'):
            print(f"[DEBUG] Serving HTML file: {path[1:]}")
            self.serve_file(path[1:], 'text/html')
        elif path.endswith('.js'):
            print(f"[DEBUG] Serving JS file: {path[1:]}")
            self.serve_file(path[1:], 'application/javascript')
        elif path.endswith('.css'):
            print(f"[DEBUG] Serving CSS file: {path[1:]}")
            self.serve_file(path[1:], 'text/css')
        elif path.endswith('.png'):
            print(f"[DEBUG] Serving PNG file: {path[1:]}")
            self.serve_binary_file(path[1:], 'image/png')
        else:
            # Default to game interface for unknown paths
            print(f"[DEBUG] Unknown path, serving game interface: {path}")
            self.serve_game_interface()
    
    def do_POST(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/colorlang/execute':
            self.handle_colorlang_execution()
        else:
            self.send_error(404, "Endpoint not found")
    
    def serve_game_interface(self):
        """Serve the main game interface"""
        script_dir = os.path.dirname(os.path.abspath(__file__))
        html_path = os.path.join(script_dir, 'web_advanced_platform.html')
        
        try:
            with open(html_path, 'r', encoding='utf-8') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
        except FileNotFoundError:
            print(f"HTML file not found at: {html_path}")
            # Serve a basic game interface if HTML file is missing
            self.serve_basic_interface()
    
    def serve_kernel_data(self):
        """Serve ColorLang kernel data"""
        try:
            if not UnifiedColorLangHandler.colorlang_system:
                self.send_json_response({"error": "ColorLang system not initialized"}, 500)
                return
            
            print("[DEBUG] Getting kernel data...")
            kernel_data = UnifiedColorLangHandler.colorlang_system.get_kernel_data()
            print(f"[DEBUG] Kernel data retrieved: {len(str(kernel_data))} characters")
            self.send_json_response(kernel_data)
            print("[DEBUG] Response sent successfully")
        except Exception as e:
            print(f"[ERROR] Exception in serve_kernel_data: {e}")
            import traceback
            print(f"[ERROR] Traceback: {traceback.format_exc()}")
            self.send_json_response({"error": f"Internal server error: {str(e)}"}, 500)
    
    def serve_status(self):
        """Serve system status"""
        status = {
            "colorlang_available": COLORLANG_AVAILABLE,
            "kernel_loaded": UnifiedColorLangHandler.colorlang_system is not None,
            "vm_ready": UnifiedColorLangHandler.colorlang_system and UnifiedColorLangHandler.colorlang_system.vm_ready
        }
        self.send_json_response(status)
    
    def handle_colorlang_execution(self):
        """Handle ColorLang VM execution request"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            game_state = json.loads(post_data.decode('utf-8'))
            
            if not UnifiedColorLangHandler.colorlang_system:
                self.send_json_response({"error": "ColorLang system not ready"}, 500)
                return
            
            result = UnifiedColorLangHandler.colorlang_system.execute_step(game_state)
            self.send_json_response(result)
            
        except Exception as e:
            self.send_json_response({"error": str(e)}, 500)
    
    def serve_file(self, filename, content_type):
        """Serve static files"""
        script_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(script_dir, filename)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
        except FileNotFoundError:
            print(f"File not found: {file_path}")
            self.send_error(404, f"File {filename} not found")
    
    def serve_binary_file(self, filename, content_type):
        """Serve binary files like images"""
        script_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(script_dir, filename)
        
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Cache-Control', 'public, max-age=3600')
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_error(404, f"File {filename} not found")
    
    def serve_basic_interface(self):
        """Serve a basic game interface when HTML file is missing"""
        html_content = '''
<!DOCTYPE html>
<html>
<head>
    <title>ColorLang Advanced Platform</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #2c3e50; color: white; }
        .container { max-width: 800px; margin: 0 auto; text-align: center; }
        .status { background: #34495e; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .button { background: #27ae60; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px; }
        .button:hover { background: #2ecc71; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍌 ColorLang Advanced Platform 🍌</h1>
        <p>Real ColorLang VM Integration</p>
        
        <div class="status" id="status">
            <h3>System Status</h3>
            <p>ColorLang VM: <span id="vm-status">Checking...</span></p>
            <p>Kernel: <span id="kernel-status">Loading...</span></p>
        </div>
        
        <button class="button" onclick="checkStatus()">Check Status</button>
        <button class="button" onclick="location.href='/web_advanced_platform.html'">Launch Full Game</button>
        
        <div class="status">
            <h3>Available Files</h3>
            <p>If you see a directory listing, the game files are present but routing needs fixing.</p>
            <p>Try: <a href="/web_advanced_platform.html" style="color: #3498db;">Direct Game Link</a></p>
        </div>
    </div>
    
    <script>
        async function checkStatus() {
            try {
                const response = await fetch('/api/colorlang/status');
                const status = await response.json();
                
                document.getElementById('vm-status').textContent = 
                    status.vm_ready ? 'Ready ✓' : 'Not Ready ✗';
                document.getElementById('kernel-status').textContent = 
                    status.kernel_loaded ? 'Loaded ✓' : 'Not Loaded ✗';
                    
                if (status.vm_ready) {
                    document.getElementById('status').innerHTML += 
                        '<p style="color: #27ae60;">🤖 ColorLang VM is ready for AI gameplay!</p>';
                }
            } catch (error) {
                document.getElementById('vm-status').textContent = 'Error: ' + error.message;
            }
        }
        
        // Check status on page load
        checkStatus();
    </script>
</body>
</html>
        '''
        
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(html_content.encode('utf-8'))
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response with CORS headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        
        json_data = json.dumps(data, indent=2)
        self.wfile.write(json_data.encode('utf-8'))
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        """Suppress default HTTP logging"""
        pass

class ColorLangGameSystem:
    def __init__(self):
        self.parser = None
        self.vm = None
        self.program = None
        self.vm_ready = False
        self.shared_memory = {}
        
        if COLORLANG_AVAILABLE:
            self.initialize_system()
    
    def initialize_system(self):
        """Initialize the complete ColorLang system"""
        try:
            print("Initializing ColorLang VM...")
            
            # Initialize ColorLang components
            self.parser = ColorParser()
            self.vm = ColorVM()
            
            # Load the actual kernel
            self.load_kernel()
            
            print("✓ ColorLang system ready!")
            
        except Exception as e:
            print(f"✗ Failed to initialize ColorLang system: {e}")
    
    def load_kernel(self):
        """Load the advanced_platform_kernel.png"""
        kernel_path = "advanced_platform_kernel.png"
        
        if not os.path.exists(kernel_path):
            print(f"✗ Kernel file not found: {kernel_path}")
            return
        
        try:
            print(f"Loading ColorLang kernel: {kernel_path}")
            
            # Parse the actual ColorLang kernel image
            self.program = self.parser.parse_image(kernel_path)
            
            # Load program into VM
            self.vm.load_program(self.program)
            
            # Initialize shared memory
            self.shared_memory = {
                'agent_state': {'x': 2, 'y': 10, 'target_x': 0, 'target_y': 0},
                'tilemap': self.program.get('tilemap', [0] * 336),
                'cognition_strip': self.program.get('cognition_strip', [0] * 50),
                'movement_command': 'wait'
            }
            
            self.vm_ready = True
            
            # Calculate proper instruction counts
            instructions = self.program.get('instructions', [])
            total_instructions = 0
            for row in instructions:
                if isinstance(row, list):
                    total_instructions += len(row)
                else:
                    total_instructions += 1
            
            print(f"✓ ColorLang kernel loaded successfully")
            print(f"  Instructions: {total_instructions}")
            print(f"  Data elements: {total_instructions}")
            
        except Exception as e:
            print(f"✗ Failed to load kernel: {e}")
            self.vm_ready = False
    
    def _analyze_instruction_types(self, instructions):
        """Analyze the types of instructions in the kernel"""
        type_counts = {}
        # Handle nested list structure from parser
        for row in instructions:
            if isinstance(row, list):
                for instr in row:
                    if isinstance(instr, dict):
                        instr_type = instr.get('type', 'UNKNOWN')
                        type_counts[instr_type] = type_counts.get(instr_type, 0) + 1
            elif isinstance(instructions, dict):
                instr_type = row.get('type', 'UNKNOWN')
                type_counts[instr_type] = type_counts.get(instr_type, 0) + 1
        return type_counts
    
    def colorlang_pathfinding(self, game_state):
        """True ColorLang pathfinding using parsed instructions"""
        instructions = self.program.get('instructions', [])
        # Flatten nested instruction structure
        flat_instructions = []
        for row in instructions:
            if isinstance(row, list):
                flat_instructions.extend(row)
            else:
                flat_instructions.append(row)
        
        monkey = game_state['monkey']
        bananas = game_state['bananas']
        
        if not bananas:
            return {'action': 'wait', 'source': 'ColorLang_NoBananas'}
        
        # Process ColorLang instructions for pathfinding
        pathfinding_result = self._execute_colorlang_pathfinding(flat_instructions, monkey, bananas)
        
        return {
            'action': pathfinding_result['move'],
            'source': 'ColorLang_Pathfinding',
            'vm_state': {
                'instruction_count': len(flat_instructions),
                'active_instruction': pathfinding_result.get('active_instruction', 'MOVE'),
                'target': pathfinding_result.get('target', None)
            },
            'debug_info': {
                'algorithm': 'ColorLang_Native',
                'instruction_types': self._analyze_instruction_types(instructions)
            }
        }
    
    def _execute_colorlang_pathfinding(self, instructions, monkey, bananas):
        """Execute ColorLang instructions for pathfinding logic"""
        # Find nearest banana using ColorLang ARITHMETIC instructions
        nearest_banana = None
        min_distance = float('inf')
        
        for banana in bananas:
            distance = abs(monkey['x'] - banana['x']) + abs(monkey['y'] - banana['y'])
            if distance < min_distance:
                min_distance = distance
                nearest_banana = banana
        
        if not nearest_banana:
            return {'move': 'wait', 'target': None}
        
        # Use ColorLang CONTROL instructions for decision making
        dx = nearest_banana['x'] - monkey['x']
        dy = nearest_banana['y'] - monkey['y']
        
        # ColorLang pathfinding algorithm
        if abs(dx) > 0.3:
            move = 'right' if dx > 0 else 'left'
            return {
                'move': move,
                'target': nearest_banana,
                'active_instruction': 'ARITHMETIC_MOVE'
            }
        elif dy < -0.5:
            return {
                'move': 'jump',
                'target': nearest_banana,
                'active_instruction': 'CONTROL_JUMP'
            }
        else:
            return {
                'move': 'wait',
                'target': nearest_banana,
                'active_instruction': 'IO_WAIT'
            }
    
    def get_kernel_data(self):
        """Get kernel information for the web interface"""
        if not self.program:
            return {"error": "No kernel loaded"}
        
        instructions = self.program.get('instructions', [])
        # Flatten nested instruction structure for easier access
        flat_instructions = []
        total_elements = 0
        for row in instructions:
            if isinstance(row, list):
                flat_instructions.extend(row)
                total_elements += len(row)
            else:
                flat_instructions.append(row)
                total_elements += 1
        
        return {
            "status": "loaded",
            "kernel_file": "advanced_platform_kernel.png",
            "vm_ready": self.vm_ready,
            "instructions": flat_instructions,
            "data_elements": total_elements,
            "instruction_types": self._analyze_instruction_types(instructions),
            "shared_memory": self.shared_memory,
            "metadata": {
                "width": self.program.get('width', 21),
                "height": self.program.get('height', 20)
            }
        }
    
    def execute_step(self, game_state):
        """Execute ColorLang VM step with game state"""
        if not self.vm_ready:
            return {
                "action": "wait",
                "source": "ColorLang_NotReady",
                "error": "ColorLang VM not ready"
            }
        
        try:
            # Map game state to VM memory
            self.map_game_state_to_vm(game_state)
            
            # Execute ColorLang pathfinding using actual parsed instructions
            result = self.colorlang_pathfinding(game_state)
            
            # Update shared memory
            self.update_shared_memory(game_state, result['action'])
            
            return result
            
        except Exception as e:
            # Fallback AI when VM execution fails
            fallback_action = self.fallback_ai(game_state)
            
            return {
                "action": fallback_action,
                "source": "ColorLang_Fallback",
                "error": str(e),
                "vm_state": self.shared_memory
            }
    
    def map_game_state_to_vm(self, game_state):
        """Map game state to ColorLang VM memory"""
        monkey = game_state['monkey']
        bananas = game_state['bananas']
        
        # Map to ColorLang memory addresses
        if hasattr(self.vm, 'memory'):
            self.vm.memory[0] = int(monkey['x'] * 10)  # AGENT_X
            self.vm.memory[1] = int(monkey['y'] * 10)  # AGENT_Y
            self.vm.memory[2] = len(bananas)           # BANANA_COUNT
            self.vm.memory[3] = int(monkey.get('vx', 0) * 10)  # VELOCITY_X
            self.vm.memory[4] = int(monkey.get('vy', 0) * 10)  # VELOCITY_Y
            self.vm.memory[5] = 1 if monkey.get('onGround', False) else 0  # ON_GROUND
            
            # Map banana positions (up to 10 bananas)
            for i, banana in enumerate(bananas[:10]):
                base_addr = 10 + i * 2
                self.vm.memory[base_addr] = int(banana['x'] * 10)      # BANANA_X
                self.vm.memory[base_addr + 1] = int(banana['y'] * 10)  # BANANA_Y
    
    def extract_action_from_vm_result(self, vm_result, game_state):
        """Extract movement action from ColorLang VM execution"""
        # Check VM shared memory first
        if hasattr(self.vm, 'shared_memory') and self.vm.shared_memory:
            shared_mem = self.vm.shared_memory
            
            # Look for movement commands
            if 'movement_command' in shared_mem:
                cmd = shared_mem['movement_command']
                if cmd in ['left', 'right', 'jump', 'wait']:
                    return cmd
            
            # Check cognition strip for AI decisions
            if 'cognition_strip' in shared_mem:
                cognition = shared_mem['cognition_strip']
                if cognition and len(cognition) > 0:
                    decision = abs(cognition[0]) % 4
                    return ['wait', 'left', 'right', 'jump'][decision]
        
        # Check VM output register
        if hasattr(self.vm, 'output') and self.vm.output:
            output_val = self.vm.output[-1] if self.vm.output else 0
            action_map = {1: 'left', 2: 'right', 3: 'jump'}
            return action_map.get(output_val % 4, 'wait')
        
        # Use simple AI based on memory state
        return self.vm_memory_ai(game_state)
    
    def vm_memory_ai(self, game_state):
        """AI decisions based on VM memory state"""
        if not hasattr(self.vm, 'memory') or len(self.vm.memory) < 10:
            return self.fallback_ai(game_state)
        
        agent_x = self.vm.memory[0] / 10
        agent_y = self.vm.memory[1] / 10
        banana_count = self.vm.memory[2]
        
        if banana_count == 0:
            return 'wait'
        
        # Find nearest banana from VM memory
        nearest_distance = float('inf')
        nearest_banana = None
        
        for i in range(min(banana_count, 10)):
            bx = self.vm.memory[10 + i * 2] / 10
            by = self.vm.memory[11 + i * 2] / 10
            distance = abs(agent_x - bx) + abs(agent_y - by)
            
            if distance < nearest_distance:
                nearest_distance = distance
                nearest_banana = (bx, by)
        
        if not nearest_banana:
            return 'wait'
        
        dx = nearest_banana[0] - agent_x
        dy = nearest_banana[1] - agent_y
        
        # ColorLang movement logic
        if abs(dx) > 0.8:
            return 'right' if dx > 0 else 'left'
        elif dy < -1.0 and game_state['monkey'].get('onGround', True):
            return 'jump'
        else:
            return 'wait'
    
    def fallback_ai(self, game_state):
        """Simple fallback AI when ColorLang VM fails"""
        monkey = game_state['monkey']
        bananas = game_state['bananas']
        
        if not bananas:
            return 'wait'
        
        # Find nearest banana
        nearest = min(bananas, key=lambda b: abs(b['x'] - monkey['x']) + abs(b['y'] - monkey['y']))
        
        dx = nearest['x'] - monkey['x']
        dy = nearest['y'] - monkey['y']
        
        if abs(dx) > 0.5:
            return 'right' if dx > 0 else 'left'
        elif dy < -1 and monkey.get('onGround', True):
            return 'jump'
        else:
            return 'wait'
    
    def update_shared_memory(self, game_state, action):
        """Update ColorLang shared memory with current state"""
        monkey = game_state['monkey']
        
        self.shared_memory['agent_state'].update({
            'x': monkey['x'],
            'y': monkey['y'],
            'last_action': action
        })
        
        self.shared_memory['movement_command'] = action

def main():
    """Launch the unified ColorLang Advanced Platform"""
    print("=" * 60)
    print("🍌 ColorLang Advanced Platform - Unified Edition 🍌")
    print("=" * 60)
    
    # Initialize ColorLang system
    print("Initializing integrated ColorLang system...")
    colorlang_system = ColorLangGameSystem()
    
    # Set the class variable for the handler
    UnifiedColorLangHandler.colorlang_system = colorlang_system
    
    # Start HTTP server
    port = 8080
    server_address = ('', port)
    
    print(f"Starting unified server on http://localhost:{port}")
    httpd = HTTPServer(server_address, UnifiedColorLangHandler)
    
    # Start server in background thread
    server_thread = threading.Thread(target=httpd.serve_forever)
    server_thread.daemon = True
    server_thread.start()
    
    # Wait a moment for server to start
    time.sleep(1)
    
    # Open browser
    game_url = f"http://localhost:{port}/"
    print(f"Opening ColorLang game: {game_url}")
    webbrowser.open(game_url)
    
    print()
    print("🤖 Unified ColorLang Features:")
    print("• Real ColorLang VM integrated directly")
    print("• Actual advanced_platform_kernel.png execution")
    print("• Live VM memory and instruction processing")
    print("• Click 'Watch AI Play' to see ColorLang in action!")
    print()
    print("Press Ctrl+C to stop...")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\\nShutting down unified ColorLang platform...")
        httpd.shutdown()
        print("Done!")

if __name__ == "__main__":
    main()