# ColorLang Tools and Utilities Documentation

## Overview
ColorLang includes a comprehensive suite of development tools and utilities designed to streamline the creation, testing, and debugging of ColorLang programs. This guide documents all available tools, their usage patterns, and integration workflows.

---

## Core Development Tools

### 1. Micro-Assembler (`colorlang/micro_assembler.py`)

#### Purpose
The Micro-Assembler provides a text-based interface for creating ColorLang programs without manually editing HSV pixels. It translates human-readable assembly code into ColorLang instruction sequences.

#### Basic Usage
```python
from colorlang.micro_assembler import MicroAssembler

# Create assembler instance
assembler = MicroAssembler()

# Define assembly program
assembly_code = """
    ; Basic movement program
    LOAD_INT R0, 25        ; Agent X position
    LOAD_INT R1, 10        ; Agent Y position
    LOAD_INT R2, 0         ; Direction (right)
    
    LOOP_START:
        MOVE R2            ; Move in current direction
        ADD R0, R0, 1      ; Increment X position
        CMP R0, 45         ; Check boundary
        JMP_IF_LT LOOP_START
    
    HALT
"""

# Assemble to ColorLang program
program = assembler.assemble(assembly_code)

# Generate image file
assembler.save_program_image(program, "movement_program.png")
```

#### Advanced Assembly Features
```python
class AdvancedMicroAssembler(MicroAssembler):
    """Extended micro-assembler with advanced features."""
    
    def __init__(self):
        super().__init__()
        self.macros = {}
        self.constants = {}
        self.labels = {}
        
    def define_macro(self, name, instructions):
        """Define reusable instruction macros."""
        self.macros[name] = instructions
    
    def define_constant(self, name, value):
        """Define named constants."""
        self.constants[name] = value
    
    def assemble_with_macros(self, assembly_code):
        """Assemble code with macro expansion."""
        
        # Example macro definition
        self.define_macro("MOVE_RIGHT", [
            "LOAD_INT R2, 0",   # Direction = right
            "MOVE R2",          # Execute movement
            "ADD R0, R0, 1"     # Update position
        ])
        
        self.define_macro("COLLECT_BANANA", [
            "SENSE 2",          # Sense environment  
            "PATHFIND R0, R1",  # Find path to banana
            "ADD R4, R4, 1"     # Increment score
        ])
        
        # Define constants
        self.define_constant("SCREEN_WIDTH", 50)
        self.define_constant("SCREEN_HEIGHT", 20)
        self.define_constant("MAX_HEALTH", 100)
        
        # Process assembly code
        expanded_code = self.expand_macros(assembly_code)
        return self.assemble(expanded_code)
    
    def expand_macros(self, code):
        """Expand macro calls in assembly code."""
        
        lines = code.split('\n')
        expanded_lines = []
        
        for line in lines:
            line = line.strip()
            
            # Skip comments and empty lines
            if not line or line.startswith(';'):
                expanded_lines.append(line)
                continue
            
            # Check for macro calls
            if line in self.macros:
                expanded_lines.extend(self.macros[line])
            else:
                # Replace constants
                for const_name, const_value in self.constants.items():
                    line = line.replace(const_name, str(const_value))
                expanded_lines.append(line)
        
        return '\n'.join(expanded_lines)

# Example usage with macros
advanced_assembler = AdvancedMicroAssembler()

assembly_with_macros = """
    ; Initialize agent
    LOAD_INT R0, 25
    LOAD_INT R1, 10  
    LOAD_INT R3, MAX_HEALTH
    LOAD_INT R4, 0   ; Score
    
    GAME_LOOP:
        COLLECT_BANANA   ; Use macro
        MOVE_RIGHT      ; Use macro
        
        CMP R0, SCREEN_WIDTH
        JMP_IF_LT GAME_LOOP
    
    HALT
"""

program = advanced_assembler.assemble_with_macros(assembly_with_macros)
```

#### Assembly Language Reference
```python
MICRO_ASSEMBLY_INSTRUCTIONS = {
    # Data Operations
    'LOAD_INT': 'Load integer value into register',
    'LOAD_FLOAT': 'Load floating point value into register',
    'STORE': 'Store register value to memory address',
    'MOVE_REG': 'Copy value from one register to another',
    
    # Arithmetic Operations
    'ADD': 'Add two registers, store result in third',
    'SUB': 'Subtract second register from first',
    'MUL': 'Multiply two registers',
    'DIV': 'Divide first register by second',
    'MOD': 'Modulo operation on two registers',
    
    # Logic Operations
    'AND': 'Bitwise AND of two registers',
    'OR': 'Bitwise OR of two registers', 
    'XOR': 'Bitwise XOR of two registers',
    'NOT': 'Bitwise NOT of register',
    
    # Comparison Operations
    'CMP': 'Compare two registers',
    'CMP_EQ': 'Compare if registers are equal',
    'CMP_LT': 'Compare if first register less than second',
    'CMP_GT': 'Compare if first register greater than second',
    
    # Control Flow
    'JMP': 'Unconditional jump to label',
    'JMP_IF': 'Conditional jump based on comparison result',
    'JMP_IF_EQ': 'Jump if last comparison was equal',
    'JMP_IF_LT': 'Jump if last comparison was less than',
    'JMP_IF_GT': 'Jump if last comparison was greater than',
    'CALL': 'Call subroutine at label',
    'RET': 'Return from subroutine',
    
    # AI Operations
    'PATHFIND': 'Execute pathfinding to target coordinates',
    'MOVE': 'Move agent in specified direction',
    'SENSE': 'Sense environment around agent',
    'DECIDE': 'Make AI decision based on current state',
    'LEARN': 'Update AI learning system',
    
    # I/O Operations
    'PRINT': 'Print register value to output',
    'GET_INPUT': 'Read input from user',
    'RENDER_FRAME': 'Render current frame to display',
    'GET_TIME': 'Get current timestamp',
    
    # System Operations
    'HALT': 'Stop program execution',
    'NOP': 'No operation (placeholder)',
    'DEBUG': 'Output debug information',
    'SYSCALL': 'Make system call'
}
```

### 2. Program Generators

#### Minimal Program Generator (`demos/platformer_colorlang/minimal_program_generator.py`)
```python
class MinimalProgramGenerator:
    """Generate minimal ColorLang programs for testing."""
    
    def __init__(self):
        self.instruction_templates = {
            'movement': self.generate_movement_program,
            'ai_basic': self.generate_basic_ai_program,
            'loop': self.generate_loop_program,
            'rendering': self.generate_rendering_program
        }
    
    def generate_movement_program(self, agent_x=25, agent_y=10, steps=10):
        """Generate simple movement program."""
        
        program = []
        
        # Initialize agent position
        program.extend([
            (15, 80, 70, "INTEGER", [agent_x]),    # Agent X
            (15, 80, 70, "INTEGER", [agent_y]),    # Agent Y
            (15, 80, 70, "INTEGER", [0]),          # Direction
        ])
        
        # Movement loop
        for step in range(steps):
            program.extend([
                (315, 90, 85, "MOVE", [0]),        # Move right
                (25, 90, 80, "ADD", [0, 0, 1]),    # Increment X
                (285, 90, 85, "RENDER_FRAME", []), # Render
            ])
        
        # Halt
        program.append((0, 0, 0, "HALT", []))
        
        return program
    
    def generate_basic_ai_program(self, duration=60):
        """Generate basic AI behavior program."""
        
        program = []
        
        # Initialize AI state
        program.extend([
            (15, 80, 70, "INTEGER", [25]),         # Agent X
            (15, 80, 70, "INTEGER", [10]),         # Agent Y  
            (15, 80, 70, "INTEGER", [100]),        # Health
            (15, 80, 70, "INTEGER", [0]),          # Score
        ])
        
        # AI behavior loop
        for frame in range(duration):
            program.extend([
                (325, 90, 80, "SENSE", [3]),       # Sense environment
                (305, 90, 85, "PATHFIND", [40, 15]), # Find path to goal
                (335, 85, 75, "DECIDE", [1]),      # Make decision
                (285, 90, 85, "RENDER_FRAME", []), # Render frame
            ])
        
        program.append((0, 0, 0, "HALT", []))
        return program
    
    def generate_stress_test_program(self, complexity_level=5):
        """Generate program for stress testing VM performance."""
        
        program = []
        operations_per_frame = complexity_level * 10
        
        # Initialize multiple variables
        for i in range(complexity_level):
            program.append((15, 80, 70, "INTEGER", [i]))
        
        # Complex computation loop
        for frame in range(100):
            for op in range(operations_per_frame):
                # Arithmetic operations
                program.extend([
                    (25, 90, 80, "ADD", [0, 1, 2]),
                    (35, 90, 80, "MUL", [2, 3, 4]),
                    (45, 90, 80, "SUB", [4, 0, 1]),
                ])
            
            # Render every 10th frame
            if frame % 10 == 0:
                program.append((285, 90, 85, "RENDER_FRAME", []))
        
        program.append((0, 0, 0, "HALT", []))
        return program
    
    def save_generated_program(self, program_type, filename, **kwargs):
        """Generate and save program to file."""
        
        if program_type not in self.instruction_templates:
            raise ValueError(f"Unknown program type: {program_type}")
        
        # Generate program
        generator = self.instruction_templates[program_type]
        program = generator(**kwargs)
        
        # Convert to image
        image = self.program_to_image(program)
        image.save(filename)
        
        return program
    
    def program_to_image(self, program):
        """Convert program instructions to PNG image."""
        
        from PIL import Image
        import colorsys
        
        # Calculate image dimensions
        width = min(50, len(program))
        height = (len(program) + width - 1) // width
        
        # Convert instructions to RGB pixels
        rgb_pixels = []
        for instruction in program:
            h, s, v = instruction[:3]
            r, g, b = colorsys.hsv_to_rgb(h/360.0, s/100.0, v/100.0)
            rgb_pixels.append((int(r*255), int(g*255), int(b*255)))
        
        # Pad to fill rectangle
        while len(rgb_pixels) < width * height:
            rgb_pixels.append((0, 0, 0))
        
        # Create and return image
        image = Image.new('RGB', (width, height))
        image.putdata(rgb_pixels)
        
        return image

# Usage examples
generator = MinimalProgramGenerator()

# Generate different program types
movement_prog = generator.save_generated_program(
    'movement', 'test_movement.png', agent_x=10, agent_y=5, steps=20
)

ai_prog = generator.save_generated_program(
    'ai_basic', 'test_ai.png', duration=120
)

stress_prog = generator.save_generated_program(
    'stress_test', 'stress_test.png', complexity_level=8
)
```

#### Platformer Kernel Generator (`demos/platformer_colorlang/platformer_kernel_generator.py`)
```python
class PlatformerKernelGenerator:
    """Generate ColorLang kernels for platformer game logic."""
    
    def __init__(self):
        self.kernel_types = {
            'movement_kernel': self.generate_movement_kernel,
            'physics_kernel': self.generate_physics_kernel,
            'collision_kernel': self.generate_collision_kernel,
            'ai_kernel': self.generate_ai_kernel,
            'rendering_kernel': self.generate_rendering_kernel
        }
    
    def generate_movement_kernel(self):
        """Generate movement processing kernel."""
        
        kernel = []
        
        # Input handling
        kernel.extend([
            (65, 90, 80, "GET_INPUT", []),          # Read player input
            (75, 85, 75, "CMP", [5, 0]),            # Compare input to directions
        ])
        
        # Direction processing
        direction_map = [
            (315, 90, 85, "MOVE", [0]),  # Right
            (315, 90, 85, "MOVE", [1]),  # Left  
            (315, 90, 85, "MOVE", [2]),  # Up
            (315, 90, 85, "MOVE", [3])   # Down
        ]
        
        kernel.extend(direction_map)
        
        # Boundary checking
        kernel.extend([
            (85, 90, 80, "CMP", [0, 49]),           # Check X boundary
            (125, 90, 80, "JMP_IF_GT", [0]),        # Jump if out of bounds
            (85, 90, 80, "CMP", [1, 19]),           # Check Y boundary
            (125, 90, 80, "JMP_IF_GT", [0]),        # Jump if out of bounds
        ])
        
        return kernel
    
    def generate_physics_kernel(self):
        """Generate physics simulation kernel."""
        
        kernel = []
        
        # Gravity simulation
        kernel.extend([
            (45, 85, 75, "SUB", [6, 6, 0.5]),       # Apply gravity to velocity_y
            (25, 90, 80, "ADD", [1, 1, 6]),         # Update Y position
        ])
        
        # Velocity damping
        kernel.extend([
            (35, 90, 80, "MUL", [5, 5, 0.9]),       # Dampen velocity_x
            (35, 90, 80, "MUL", [6, 6, 0.95]),      # Dampen velocity_y
        ])
        
        # Ground collision
        kernel.extend([
            (85, 90, 80, "CMP", [1, 18]),           # Check if at ground level
            (125, 90, 80, "JMP_IF_GT", [10]),       # Jump to ground handling
            (15, 80, 70, "INTEGER", [0]),           # Set velocity_y to 0
            (15, 80, 70, "INTEGER", [1]),           # Set grounded flag
        ])
        
        return kernel
    
    def generate_collision_kernel(self):
        """Generate collision detection kernel."""
        
        kernel = []
        
        # Tilemap collision detection
        kernel.extend([
            (195, 90, 85, "GET_TILEMAP", [0, 1]),   # Get tile at agent position
            (85, 90, 80, "CMP", [7, 1]),            # Compare with GROUND tile
        ])
        
        # Collision response
        kernel.extend([
            (125, 90, 80, "JMP_IF_EQ", [20]),       # Jump to collision handler
            (195, 90, 85, "GET_TILEMAP", [0, 1]),   # Check for bananas
            (85, 90, 80, "CMP", [7, 2]),            # Compare with BANANA tile
            (125, 90, 80, "JMP_IF_EQ", [30]),       # Jump to collection handler
        ])
        
        # Banana collection
        kernel.extend([
            (25, 90, 80, "ADD", [4, 4, 1]),         # Increment score
            (205, 90, 85, "SET_TILEMAP", [0, 1, 0]), # Remove banana from tilemap
        ])
        
        return kernel
    
    def generate_complete_platformer_kernel(self):
        """Generate complete platformer game kernel."""
        
        complete_kernel = []
        
        # Initialization
        complete_kernel.extend([
            (15, 80, 70, "INTEGER", [25]),          # Agent X = 25
            (15, 80, 70, "INTEGER", [10]),          # Agent Y = 10
            (15, 80, 70, "INTEGER", [0]),           # Direction = right
            (15, 80, 70, "INTEGER", [100]),         # Health = 100
            (15, 80, 70, "INTEGER", [0]),           # Score = 0
            (15, 80, 70, "INTEGER", [0]),           # Velocity X = 0
            (15, 80, 70, "INTEGER", [0]),           # Velocity Y = 0
            (15, 80, 70, "INTEGER", [0]),           # Grounded = false
        ])
        
        # Main game loop
        for frame in range(120):
            # Movement kernel
            complete_kernel.extend(self.generate_movement_kernel())
            
            # Physics kernel
            complete_kernel.extend(self.generate_physics_kernel())
            
            # Collision kernel
            complete_kernel.extend(self.generate_collision_kernel())
            
            # AI decision making (if AI mode)
            complete_kernel.extend([
                (325, 90, 80, "SENSE", [2]),        # Sense environment
                (305, 90, 85, "PATHFIND", [40, 15]), # Find path to goal
                (335, 85, 75, "DECIDE", [1]),       # Make AI decision
            ])
            
            # Rendering
            complete_kernel.extend([
                (285, 90, 85, "RENDER_FRAME", []),  # Render current frame
                (295, 90, 85, "GET_TIME", []),      # Get timestamp
            ])
        
        # Halt
        complete_kernel.append((0, 0, 0, "HALT", []))
        
        return complete_kernel
    
    def optimize_kernel(self, kernel):
        """Optimize kernel by removing redundant instructions."""
        
        optimized = []
        instruction_cache = {}
        
        for instruction in kernel:
            # Create instruction signature
            signature = (instruction[3], tuple(instruction[4]))
            
            # Skip redundant instructions (except side-effect instructions)
            if signature not in instruction_cache or instruction[3] in ['RENDER_FRAME', 'GET_TIME', 'MOVE']:
                optimized.append(instruction)
                instruction_cache[signature] = instruction
        
        return optimized
    
    def save_kernel(self, kernel_type, filename, optimize=True):
        """Generate and save kernel to file."""
        
        if kernel_type not in self.kernel_types:
            available = ', '.join(self.kernel_types.keys())
            raise ValueError(f"Unknown kernel type: {kernel_type}. Available: {available}")
        
        # Generate kernel
        generator = self.kernel_types[kernel_type]
        kernel = generator()
        
        # Optimize if requested
        if optimize:
            kernel = self.optimize_kernel(kernel)
        
        # Convert to image
        image = self.kernel_to_image(kernel)
        image.save(filename)
        
        return kernel
    
    def kernel_to_image(self, kernel):
        """Convert kernel to ColorLang image format."""
        
        from PIL import Image
        import colorsys
        
        # Calculate optimal dimensions
        width = min(50, len(kernel))
        height = max(1, (len(kernel) + width - 1) // width)
        
        # Convert to RGB pixels
        rgb_pixels = []
        for instruction in kernel:
            h, s, v = instruction[:3]
            r, g, b = colorsys.hsv_to_rgb(h/360.0, s/100.0, v/100.0)
            rgb_pixels.append((int(r*255), int(g*255), int(b*255)))
        
        # Pad to full size
        while len(rgb_pixels) < width * height:
            rgb_pixels.append((0, 0, 0))
        
        # Create image
        image = Image.new('RGB', (width, height))
        image.putdata(rgb_pixels)
        
        return image
```

### 3. Debugging and Analysis Tools

#### ColorLang Debugger (`colorlang/debugger.py`)
```python
class ColorLangDebugger:
    """Advanced debugging system for ColorLang programs."""
    
    def __init__(self, vm):
        self.vm = vm
        self.breakpoints = set()
        self.watch_variables = {}
        self.execution_trace = []
        self.memory_snapshots = []
        self.performance_metrics = {}
        
    def set_breakpoint(self, pc_address):
        """Set breakpoint at program counter address."""
        self.breakpoints.add(pc_address)
        print(f"Breakpoint set at PC: {pc_address}")
    
    def add_watch_variable(self, register_id, variable_name=None):
        """Watch register for value changes."""
        if variable_name is None:
            variable_name = f"R{register_id}"
        
        self.watch_variables[register_id] = {
            'name': variable_name,
            'previous_value': None,
            'change_count': 0
        }
    
    def debug_execute_instruction(self, instruction):
        """Execute instruction with debugging features."""
        
        # Check breakpoints
        if self.vm.pc in self.breakpoints:
            self.handle_breakpoint()
        
        # Record execution trace
        trace_entry = {
            'pc': self.vm.pc,
            'instruction': instruction,
            'registers_before': self.vm.registers.copy(),
            'timestamp': time.time()
        }
        
        # Execute instruction
        start_time = time.perf_counter()
        result = self.vm.execute_single_instruction(instruction)
        execution_time = time.perf_counter() - start_time
        
        # Record post-execution state
        trace_entry['registers_after'] = self.vm.registers.copy()
        trace_entry['execution_time'] = execution_time
        trace_entry['result'] = result
        
        self.execution_trace.append(trace_entry)
        
        # Check watched variables
        self.check_watched_variables()
        
        # Record performance metrics
        self.record_performance_metrics(instruction, execution_time)
        
        return result
    
    def handle_breakpoint(self):
        """Handle breakpoint encounter."""
        
        print(f"\\n=== BREAKPOINT HIT AT PC: {self.vm.pc} ===")
        self.print_current_state()
        
        # Interactive debugging prompt
        while True:
            command = input("Debug> ").strip().lower()
            
            if command == 'continue' or command == 'c':
                break
            elif command == 'step' or command == 's':
                return  # Execute one instruction and break again
            elif command == 'registers' or command == 'r':
                self.print_registers()
            elif command == 'memory' or command == 'm':
                self.print_memory_state()
            elif command == 'trace' or command == 't':
                self.print_execution_trace(-10)  # Last 10 instructions
            elif command == 'help' or command == 'h':
                self.print_debug_help()
            elif command.startswith('watch '):
                reg_id = int(command.split()[1])
                self.add_watch_variable(reg_id)
            elif command.startswith('break '):
                pc_addr = int(command.split()[1])
                self.set_breakpoint(pc_addr)
            else:
                print("Unknown command. Type 'help' for available commands.")
    
    def check_watched_variables(self):
        """Check for changes in watched variables."""
        
        for reg_id, watch_info in self.watch_variables.items():
            current_value = self.vm.registers.get(reg_id, 0)
            previous_value = watch_info['previous_value']
            
            if previous_value is not None and current_value != previous_value:
                watch_info['change_count'] += 1
                print(f"WATCH: {watch_info['name']} changed from {previous_value} to {current_value}")
            
            watch_info['previous_value'] = current_value
    
    def record_performance_metrics(self, instruction, execution_time):
        """Record performance metrics for analysis."""
        
        instr_type = instruction[3]  # Instruction type
        
        if instr_type not in self.performance_metrics:
            self.performance_metrics[instr_type] = {
                'total_time': 0.0,
                'call_count': 0,
                'min_time': float('inf'),
                'max_time': 0.0
            }
        
        metrics = self.performance_metrics[instr_type]
        metrics['total_time'] += execution_time
        metrics['call_count'] += 1
        metrics['min_time'] = min(metrics['min_time'], execution_time)
        metrics['max_time'] = max(metrics['max_time'], execution_time)
    
    def print_performance_report(self):
        """Print comprehensive performance analysis."""
        
        print("\\n=== PERFORMANCE REPORT ===")
        print(f"{'Instruction':<15} {'Count':<8} {'Total(ms)':<10} {'Avg(ms)':<10} {'Min(ms)':<10} {'Max(ms)':<10}")
        print("-" * 70)
        
        for instr_type, metrics in self.performance_metrics.items():
            avg_time = metrics['total_time'] / metrics['call_count'] * 1000
            total_time_ms = metrics['total_time'] * 1000
            min_time_ms = metrics['min_time'] * 1000
            max_time_ms = metrics['max_time'] * 1000
            
            print(f"{instr_type:<15} {metrics['call_count']:<8} {total_time_ms:<10.3f} "
                  f"{avg_time:<10.3f} {min_time_ms:<10.3f} {max_time_ms:<10.3f}")
        
        # Overall statistics
        total_instructions = sum(m['call_count'] for m in self.performance_metrics.values())
        total_time = sum(m['total_time'] for m in self.performance_metrics.values())
        
        print(f"\\nTotal Instructions: {total_instructions}")
        print(f"Total Execution Time: {total_time*1000:.3f} ms")
        print(f"Average Time Per Instruction: {(total_time/total_instructions)*1000:.3f} ms")
        print(f"Instructions Per Second: {total_instructions/total_time:.0f}")
    
    def print_execution_trace(self, count=-1):
        """Print execution trace (last N instructions)."""
        
        trace_subset = self.execution_trace[count:] if count > 0 else self.execution_trace
        
        print(f"\\n=== EXECUTION TRACE (last {len(trace_subset)} instructions) ===")
        for entry in trace_subset:
            print(f"PC:{entry['pc']:3d} {entry['instruction'][3]:<12} "
                  f"Time:{entry['execution_time']*1000:.3f}ms")
    
    def save_debug_report(self, filename):
        """Save comprehensive debug report to file."""
        
        with open(filename, 'w') as f:
            f.write("ColorLang Debug Report\\n")
            f.write("=" * 50 + "\\n\\n")
            
            # Execution summary
            f.write("Execution Summary:\\n")
            f.write(f"Total Instructions Executed: {len(self.execution_trace)}\\n")
            f.write(f"Breakpoints Hit: {len([t for t in self.execution_trace if t['pc'] in self.breakpoints])}\\n")
            f.write(f"Watch Variable Changes: {sum(w['change_count'] for w in self.watch_variables.values())}\\n\\n")
            
            # Performance metrics
            f.write("Performance Metrics:\\n")
            for instr_type, metrics in self.performance_metrics.items():
                avg_time = metrics['total_time'] / metrics['call_count'] * 1000
                f.write(f"{instr_type}: {metrics['call_count']} calls, {avg_time:.3f}ms avg\\n")
            
            # Full execution trace
            f.write("\\nFull Execution Trace:\\n")
            for i, entry in enumerate(self.execution_trace):
                f.write(f"{i:4d}: PC:{entry['pc']:3d} {entry['instruction'][3]:<12} "
                       f"Result:{entry['result']} Time:{entry['execution_time']*1000:.3f}ms\\n")
```

### 4. Visualization and Analysis Tools

#### Visualization Debugger (`tools/visualization_debugger.py`)
```python
class VisualizationDebugger:
    """Visual debugging tool for ColorLang programs."""
    
    def __init__(self):
        self.frame_buffer = []
        self.cognition_history = []
        self.agent_path = []
        self.performance_data = []
        
    def record_frame(self, shared_memory, frame_number):
        """Record frame data for visualization."""
        
        frame_data = {
            'frame_number': frame_number,
            'agent': {
                'x': shared_memory.agent.x,
                'y': shared_memory.agent.y,
                'direction': shared_memory.agent.direction,
                'health': shared_memory.agent.health,
                'score': shared_memory.agent.score
            },
            'cognition': {
                'emotion': shared_memory.cognition.emotion,
                'action_intent': shared_memory.cognition.action_intent,
                'memory_recall': shared_memory.cognition.memory_recall,
                'social_cue': shared_memory.cognition.social_cue,
                'goal_evaluation': shared_memory.cognition.goal_evaluation
            },
            'tilemap': copy.deepcopy(shared_memory.tilemap),
            'timestamp': time.time()
        }
        
        self.frame_buffer.append(frame_data)
        self.cognition_history.append(frame_data['cognition'])
        self.agent_path.append((frame_data['agent']['x'], frame_data['agent']['y']))
    
    def generate_visualization_html(self, output_file):
        """Generate interactive HTML visualization."""
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>ColorLang Visualization</title>
            <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .container {{ display: flex; flex-wrap: wrap; }}
                .plot-container {{ margin: 20px; border: 1px solid #ccc; padding: 10px; }}
                .controls {{ margin: 20px 0; }}
                .frame-slider {{ width: 100%; }}
            </style>
        </head>
        <body>
            <h1>ColorLang Program Visualization</h1>
            
            <div class="controls">
                <label>Frame: <input type="range" id="frameSlider" class="frame-slider" 
                       min="0" max="{len(self.frame_buffer)-1}" value="0" 
                       oninput="updateVisualization(this.value)"></label>
                <span id="frameNumber">0</span> / {len(self.frame_buffer)-1}
                <button onclick="playAnimation()">Play Animation</button>
                <button onclick="pauseAnimation()">Pause</button>
            </div>
            
            <div class="container">
                <div class="plot-container">
                    <div id="agentPath" style="width:500px;height:400px;"></div>
                </div>
                <div class="plot-container">
                    <div id="cognitionGraph" style="width:500px;height:400px;"></div>
                </div>
                <div class="plot-container">
                    <div id="performanceGraph" style="width:500px;height:400px;"></div>
                </div>
                <div class="plot-container">
                    <div id="tilemapView" style="width:500px;height:400px;"></div>
                </div>
            </div>
            
            <script>
                const frameData = {json.dumps(self.frame_buffer)};
                let isPlaying = false;
                let animationInterval;
                
                function updateVisualization(frameIndex) {{
                    const frame = frameData[frameIndex];
                    document.getElementById('frameNumber').textContent = frameIndex;
                    
                    updateAgentPath(frameIndex);
                    updateCognitionGraph(frameIndex);
                    updateTilemapView(frame);
                }}
                
                function updateAgentPath(currentFrame) {{
                    const pathX = frameData.slice(0, currentFrame + 1).map(f => f.agent.x);
                    const pathY = frameData.slice(0, currentFrame + 1).map(f => f.agent.y);
                    
                    const trace = {{
                        x: pathX,
                        y: pathY,
                        mode: 'lines+markers',
                        type: 'scatter',
                        name: 'Agent Path',
                        marker: {{ size: 8, color: 'red' }}
                    }};
                    
                    Plotly.newPlot('agentPath', [trace], {{
                        title: 'Agent Movement Path',
                        xaxis: {{ title: 'X Position', range: [0, 50] }},
                        yaxis: {{ title: 'Y Position', range: [0, 20] }}
                    }});
                }}
                
                function updateCognitionGraph(currentFrame) {{
                    const frames = frameData.slice(0, currentFrame + 1);
                    
                    const emotions = frames.map(f => f.cognition.emotion);
                    const intents = frames.map(f => f.cognition.action_intent);
                    const memory = frames.map(f => f.cognition.memory_recall);
                    
                    const traces = [
                        {{ y: emotions, name: 'Emotion', type: 'scatter' }},
                        {{ y: intents, name: 'Action Intent', type: 'scatter' }},
                        {{ y: memory, name: 'Memory Recall', type: 'scatter' }}
                    ];
                    
                    Plotly.newPlot('cognitionGraph', traces, {{
                        title: 'Cognitive State Over Time',
                        yaxis: {{ title: 'Activation Level', range: [0, 1] }}
                    }});
                }}
                
                function playAnimation() {{
                    if (!isPlaying) {{
                        isPlaying = true;
                        const slider = document.getElementById('frameSlider');
                        
                        animationInterval = setInterval(() => {{
                            const currentFrame = parseInt(slider.value);
                            if (currentFrame < frameData.length - 1) {{
                                slider.value = currentFrame + 1;
                                updateVisualization(slider.value);
                            }} else {{
                                pauseAnimation();
                            }}
                        }}, 100);
                    }}
                }}
                
                function pauseAnimation() {{
                    isPlaying = false;
                    clearInterval(animationInterval);
                }}
                
                // Initialize visualization
                updateVisualization(0);
            </script>
        </body>
        </html>
        """
        
        with open(output_file, 'w') as f:
            f.write(html_content)
    
    def generate_performance_charts(self):
        """Generate performance analysis charts."""
        
        import matplotlib.pyplot as plt
        
        # Frame rate analysis
        plt.figure(figsize=(12, 8))
        
        plt.subplot(2, 2, 1)
        frame_times = [frame['timestamp'] for frame in self.frame_buffer]
        frame_intervals = [frame_times[i+1] - frame_times[i] for i in range(len(frame_times)-1)]
        plt.plot(frame_intervals)
        plt.title('Frame Time Intervals')
        plt.ylabel('Time (seconds)')
        
        plt.subplot(2, 2, 2)
        scores = [frame['agent']['score'] for frame in self.frame_buffer]
        plt.plot(scores)
        plt.title('Score Over Time')
        plt.ylabel('Score')
        
        plt.subplot(2, 2, 3)
        emotions = [frame['cognition']['emotion'] for frame in self.frame_buffer]
        plt.plot(emotions, label='Emotion')
        plt.plot([frame['cognition']['action_intent'] for frame in self.frame_buffer], label='Intent')
        plt.title('Cognitive State')
        plt.ylabel('Activation')
        plt.legend()
        
        plt.subplot(2, 2, 4)
        agent_x = [frame['agent']['x'] for frame in self.frame_buffer]
        agent_y = [frame['agent']['y'] for frame in self.frame_buffer]
        plt.plot(agent_x, agent_y)
        plt.title('Agent Path')
        plt.xlabel('X Position')
        plt.ylabel('Y Position')
        
        plt.tight_layout()
        plt.savefig('colorlang_performance_analysis.png', dpi=300, bbox_inches='tight')
        plt.show()
```

### 5. Build and Deployment Tools

#### PDF Documentation Builder (`tools/build_pdfs.py`)
```python
class DocumentationBuilder:
    """Build comprehensive PDF documentation from markdown files."""
    
    def __init__(self, docs_directory):
        self.docs_directory = docs_directory
        self.output_directory = os.path.join(docs_directory, 'pdf')
        
        # Ensure output directory exists
        os.makedirs(self.output_directory, exist_ok=True)
    
    def build_all_pdfs(self):
        """Build PDF versions of all documentation files."""
        
        # Find all markdown files
        md_files = []
        for root, dirs, files in os.walk(self.docs_directory):
            for file in files:
                if file.endswith('.md') and not file.startswith('.'):
                    md_files.append(os.path.join(root, file))
        
        # Build individual PDFs
        for md_file in md_files:
            self.build_single_pdf(md_file)
        
        # Build master PDF with all documentation
        self.build_master_pdf(md_files)
    
    def build_single_pdf(self, markdown_file):
        """Convert single markdown file to PDF."""
        
        try:
            import markdown
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            
            # Read markdown content
            with open(markdown_file, 'r', encoding='utf-8') as f:
                md_content = f.read()
            
            # Convert markdown to HTML
            html_content = markdown.markdown(md_content, extensions=['codehilite', 'fenced_code'])
            
            # Generate PDF filename
            base_name = os.path.splitext(os.path.basename(markdown_file))[0]
            pdf_file = os.path.join(self.output_directory, f"{base_name}.pdf")
            
            # Create PDF document
            doc = SimpleDocTemplate(pdf_file, pagesize=letter)
            styles = getSampleStyleSheet()
            
            # Custom styles
            code_style = ParagraphStyle(
                'Code',
                parent=styles['Code'],
                fontName='Courier',
                fontSize=8,
                leftIndent=20,
                backColor='#f0f0f0'
            )
            
            # Parse HTML and create PDF elements
            elements = self.html_to_pdf_elements(html_content, styles, code_style)
            
            # Build PDF
            doc.build(elements)
            
            print(f"Generated PDF: {pdf_file}")
            
        except ImportError as e:
            print(f"Missing required packages for PDF generation: {e}")
        except Exception as e:
            print(f"Error building PDF for {markdown_file}: {e}")
    
    def build_master_pdf(self, markdown_files):
        """Build master PDF containing all documentation."""
        
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, PageBreak
            
            master_pdf = os.path.join(self.output_directory, "ColorLang_Complete_Documentation.pdf")
            doc = SimpleDocTemplate(master_pdf, pagesize=letter)
            
            all_elements = []
            
            # Add table of contents
            all_elements.extend(self.create_table_of_contents(markdown_files))
            all_elements.append(PageBreak())
            
            # Add each document
            for md_file in sorted(markdown_files):
                elements = self.markdown_file_to_pdf_elements(md_file)
                all_elements.extend(elements)
                all_elements.append(PageBreak())
            
            # Build master document
            doc.build(all_elements)
            
            print(f"Generated master PDF: {master_pdf}")
            
        except Exception as e:
            print(f"Error building master PDF: {e}")
    
    def create_deployment_package(self, version="1.0.0"):
        """Create complete deployment package."""
        
        import zipfile
        import shutil
        
        package_name = f"ColorLang_v{version}"
        package_dir = os.path.join("dist", package_name)
        
        # Create package structure
        os.makedirs(package_dir, exist_ok=True)
        os.makedirs(os.path.join(package_dir, "colorlang"), exist_ok=True)
        os.makedirs(os.path.join(package_dir, "examples"), exist_ok=True)
        os.makedirs(os.path.join(package_dir, "docs"), exist_ok=True)
        os.makedirs(os.path.join(package_dir, "tools"), exist_ok=True)
        
        # Copy core files
        shutil.copytree("colorlang", os.path.join(package_dir, "colorlang"), dirs_exist_ok=True)
        shutil.copytree("examples", os.path.join(package_dir, "examples"), dirs_exist_ok=True)
        shutil.copytree("docs", os.path.join(package_dir, "docs"), dirs_exist_ok=True)
        shutil.copytree("tools", os.path.join(package_dir, "tools"), dirs_exist_ok=True)
        
        # Copy additional files
        files_to_copy = ["README.md", "requirements.txt"]
        for file in files_to_copy:
            if os.path.exists(file):
                shutil.copy2(file, package_dir)
        
        # Create installation script
        install_script = f"""#!/bin/bash
# ColorLang Installation Script v{version}

echo "Installing ColorLang v{version}..."

# Check Python installation
python3 --version || {{ echo "Python 3 is required"; exit 1; }}

# Install dependencies
pip3 install -r requirements.txt

# Set up environment
export COLORLANG_PATH="$(pwd)"
echo 'export COLORLANG_PATH="$(pwd)"' >> ~/.bashrc

echo "ColorLang installation complete!"
echo "Run 'python3 examples/validate_examples.py' to test installation"
"""
        
        with open(os.path.join(package_dir, "install.sh"), 'w') as f:
            f.write(install_script)
        
        # Create Windows batch file
        batch_script = f"""@echo off
REM ColorLang Installation Script v{version}

echo Installing ColorLang v{version}...

REM Check Python installation
python --version >nul 2>&1 || (
    echo Python is required
    exit /b 1
)

REM Install dependencies
pip install -r requirements.txt

REM Set environment variable
setx COLORLANG_PATH "%CD%"

echo ColorLang installation complete!
echo Run 'python examples\\validate_examples.py' to test installation
pause
"""
        
        with open(os.path.join(package_dir, "install.bat"), 'w') as f:
            f.write(batch_script)
        
        # Create ZIP archive
        zip_file = f"{package_dir}.zip"
        with zipfile.ZipFile(zip_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(package_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arc_path = os.path.relpath(file_path, os.path.dirname(package_dir))
                    zipf.write(file_path, arc_path)
        
        print(f"Created deployment package: {zip_file}")
        
        return zip_file

# Usage example
builder = DocumentationBuilder("docs")
builder.build_all_pdfs()
builder.create_deployment_package("1.0.0")
```

---

## Tool Integration Workflows

### Complete Development Workflow
```python
class ColorLangDevelopmentWorkflow:
    """Complete workflow for ColorLang development."""
    
    def __init__(self, project_path):
        self.project_path = project_path
        self.assembler = MicroAssembler()
        self.generator = MinimalProgramGenerator()
        self.debugger = None
        self.visualizer = VisualizationDebugger()
        
    def create_new_program(self, program_name, program_type='basic'):
        """Create new ColorLang program with toolchain support."""
        
        print(f"Creating new program: {program_name}")
        
        # Generate base program
        if program_type == 'assembly':
            # Create from assembly template
            assembly_template = self.get_assembly_template()
            program = self.assembler.assemble(assembly_template)
        else:
            # Generate using program generator
            program = self.generator.generate_basic_ai_program()
        
        # Save program image
        output_file = os.path.join(self.project_path, f"{program_name}.png")
        image = self.generator.program_to_image(program)
        image.save(output_file)
        
        print(f"Program saved: {output_file}")
        return program, output_file
    
    def test_program(self, program_file, debug_mode=False):
        """Test program with full toolchain support."""
        
        from colorlang.color_parser import ColorParser
        from colorlang.virtual_machine import ColorVM
        
        # Parse and execute program
        parser = ColorParser()
        vm = ColorVM()
        
        # Set up debugging if requested
        if debug_mode:
            self.debugger = ColorLangDebugger(vm)
            vm.set_debugger(self.debugger)
        
        try:
            # Parse program
            program = parser.parse_image(program_file)
            
            # Execute with visualization
            result = vm.run_program(program)
            
            # Generate debug reports
            if debug_mode and self.debugger:
                self.debugger.print_performance_report()
                self.debugger.save_debug_report(f"{program_file}_debug.txt")
            
            # Generate visualization
            self.visualizer.generate_visualization_html(f"{program_file}_visualization.html")
            
            return result
            
        except Exception as e:
            print(f"Error testing program: {e}")
            return None
    
    def optimize_program(self, program_file):
        """Optimize program using available tools."""
        
        # Load and analyze program
        parser = ColorParser()
        program = parser.parse_image(program_file)
        
        # Apply optimizations
        optimized_program = self.apply_optimizations(program)
        
        # Save optimized version
        optimized_file = program_file.replace('.png', '_optimized.png')
        image = self.generator.program_to_image(optimized_program)
        image.save(optimized_file)
        
        print(f"Optimized program saved: {optimized_file}")
        return optimized_program
    
    def deploy_program(self, program_file, target='standalone'):
        """Deploy program using deployment tools."""
        
        if target == 'web':
            return self.deploy_to_web(program_file)
        elif target == 'standalone':
            return self.create_standalone_package(program_file)
        else:
            raise ValueError(f"Unknown deployment target: {target}")

# Complete workflow example
workflow = ColorLangDevelopmentWorkflow("projects/my_game")

# Create new program
program, program_file = workflow.create_new_program("smart_agent", "assembly")

# Test with debugging
result = workflow.test_program(program_file, debug_mode=True)

# Optimize and deploy
optimized = workflow.optimize_program(program_file)
package = workflow.deploy_program(program_file, target='web')
```

---

This comprehensive documentation covers all the major tools and utilities available in the ColorLang ecosystem, from low-level assemblers to high-level deployment systems. These tools provide a complete development environment for creating, testing, debugging, and deploying ColorLang programs across various platforms and use cases.