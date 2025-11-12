# ColorLang Troubleshooting and Debugging Guide

## Overview
This comprehensive guide provides solutions to common issues, debugging techniques, and performance optimization strategies for ColorLang development. Whether you're experiencing installation problems, execution errors, or performance issues, this guide offers systematic approaches to diagnosis and resolution.

---

## Installation and Setup Issues

### 1. Python Environment Problems

#### Issue: ImportError when importing ColorLang modules
```
ImportError: No module named 'colorlang'
```

**Diagnosis Steps:**
1. Check Python version: `python --version` (requires Python 3.8+)
2. Verify PYTHONPATH includes ColorLang directory
3. Check if `__init__.py` files exist in ColorLang directories

**Solutions:**
```python
# Solution 1: Add ColorLang to Python path
import sys
import os
sys.path.insert(0, os.path.join(os.getcwd(), 'colorlang'))

# Solution 2: Set environment variable (Windows)
# setx PYTHONPATH "%PYTHONPATH%;C:\\path\\to\\colorlang"

# Solution 3: Set environment variable (Linux/Mac)
# export PYTHONPATH="${PYTHONPATH}:/path/to/colorlang"

# Solution 4: Use absolute imports
from colorlang.color_parser import ColorParser
from colorlang.virtual_machine import ColorVM
```

#### Issue: PIL/Pillow installation errors
```
ModuleNotFoundError: No module named 'PIL'
```

**Solutions:**
```bash
# Install Pillow
pip install Pillow

# If installation fails on Windows:
pip install --upgrade pip setuptools wheel
pip install Pillow

# Alternative: Use conda
conda install pillow

# For development version:
pip install Pillow --pre --upgrade
```

#### Issue: NumPy compatibility problems
```
ValueError: numpy.ndarray size changed
```

**Solutions:**
```bash
# Reinstall NumPy
pip uninstall numpy
pip install numpy

# Install specific compatible version
pip install numpy==1.21.0

# Force reinstallation of all dependencies
pip install --force-reinstall -r requirements.txt
```

### 2. File Path and Directory Issues

#### Issue: ColorLang program files not found
```
FileNotFoundError: [Errno 2] No such file or directory: 'example.png'
```

**Diagnosis:**
```python
import os

def diagnose_file_paths():
    """Diagnose common file path issues."""
    
    print(f"Current working directory: {os.getcwd()}")
    print(f"Python path: {sys.path}")
    
    # Check if examples directory exists
    if os.path.exists('examples'):
        print("Examples directory found")
        for file in os.listdir('examples'):
            if file.endswith('.png'):
                print(f"  Found: {file}")
    else:
        print("Examples directory not found")
    
    # Check ColorLang module availability
    try:
        import colorlang
        print(f"ColorLang module path: {colorlang.__file__}")
    except ImportError as e:
        print(f"ColorLang import error: {e}")

diagnose_file_paths()
```

**Solutions:**
```python
# Solution 1: Use absolute paths
import os
project_root = os.path.dirname(os.path.abspath(__file__))
example_file = os.path.join(project_root, 'examples', 'hello_world.png')

# Solution 2: Change working directory
os.chdir('path/to/colorlang/project')

# Solution 3: Create file finder utility
def find_colorlang_file(filename):
    """Find ColorLang file in common locations."""
    
    search_paths = [
        filename,                           # Current directory
        os.path.join('examples', filename), # Examples subdirectory
        os.path.join('..', 'examples', filename), # Parent examples
        os.path.join(os.getcwd(), 'examples', filename) # Absolute examples
    ]
    
    for path in search_paths:
        if os.path.exists(path):
            return path
    
    raise FileNotFoundError(f"ColorLang file not found: {filename}")
```

---

## Parsing and Execution Errors

### 3. Image Parsing Issues

#### Issue: Invalid image format errors
```
PIL.UnidentifiedImageError: cannot identify image file
```

**Diagnosis:**
```python
def diagnose_image_file(filename):
    """Diagnose image file issues."""
    
    import os
    from PIL import Image
    
    if not os.path.exists(filename):
        print(f"File does not exist: {filename}")
        return
    
    try:
        # Check file size
        file_size = os.path.getsize(filename)
        print(f"File size: {file_size} bytes")
        
        # Try to open with PIL
        with Image.open(filename) as img:
            print(f"Image format: {img.format}")
            print(f"Image mode: {img.mode}")
            print(f"Image size: {img.size}")
            
            # Check pixel data
            pixels = list(img.getdata())
            print(f"Total pixels: {len(pixels)}")
            print(f"First pixel: {pixels[0] if pixels else 'No pixels'}")
            
    except Exception as e:
        print(f"Image error: {e}")
        
        # Check file header
        with open(filename, 'rb') as f:
            header = f.read(16)
            print(f"File header: {header.hex()}")
```

**Solutions:**
```python
def fix_image_format(input_file, output_file):
    """Convert image to proper format for ColorLang."""
    
    from PIL import Image
    
    try:
        # Open and convert image
        with Image.open(input_file) as img:
            # Convert to RGB mode if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Save as PNG
            img.save(output_file, 'PNG')
            print(f"Converted {input_file} to {output_file}")
            
    except Exception as e:
        print(f"Conversion failed: {e}")
        
        # Try alternative approach
        try:
            # Force RGB conversion
            img = Image.open(input_file)
            rgb_img = Image.new('RGB', img.size)
            rgb_img.paste(img)
            rgb_img.save(output_file, 'PNG')
            print(f"Force-converted {input_file} to {output_file}")
        except Exception as e2:
            print(f"Alternative conversion failed: {e2}")
```

#### Issue: HSV color space conversion errors
```
ValueError: HSV values out of range
```

**Diagnosis and Solution:**
```python
def validate_hsv_pixels(image_file):
    """Validate HSV color values in ColorLang image."""
    
    from PIL import Image
    import colorsys
    
    with Image.open(image_file) as img:
        pixels = list(img.getdata())
        
        invalid_pixels = []
        
        for i, pixel in enumerate(pixels):
            try:
                if len(pixel) >= 3:
                    r, g, b = pixel[:3]
                    
                    # Convert to 0-1 range
                    r_norm = r / 255.0
                    g_norm = g / 255.0
                    b_norm = b / 255.0
                    
                    # Convert to HSV
                    h, s, v = colorsys.rgb_to_hsv(r_norm, g_norm, b_norm)
                    
                    # Convert to ColorLang ranges
                    h_cl = h * 360
                    s_cl = s * 100
                    v_cl = v * 100
                    
                    # Validate ranges
                    if not (0 <= h_cl <= 360):
                        invalid_pixels.append((i, 'hue', h_cl))
                    if not (0 <= s_cl <= 100):
                        invalid_pixels.append((i, 'saturation', s_cl))
                    if not (0 <= v_cl <= 100):
                        invalid_pixels.append((i, 'value', v_cl))
                        
            except Exception as e:
                invalid_pixels.append((i, 'conversion_error', str(e)))
        
        if invalid_pixels:
            print(f"Found {len(invalid_pixels)} invalid pixels:")
            for pixel_info in invalid_pixels[:10]:  # Show first 10
                print(f"  Pixel {pixel_info[0]}: {pixel_info[1]} = {pixel_info[2]}")
        else:
            print("All pixels have valid HSV values")
        
        return len(invalid_pixels) == 0

def fix_hsv_values(input_file, output_file):
    """Fix invalid HSV values in ColorLang image."""
    
    from PIL import Image
    import colorsys
    
    with Image.open(input_file) as img:
        pixels = list(img.getdata())
        fixed_pixels = []
        
        for pixel in pixels:
            if len(pixel) >= 3:
                r, g, b = pixel[:3]
                
                # Convert to HSV and back to ensure valid values
                r_norm = max(0, min(1, r / 255.0))
                g_norm = max(0, min(1, g / 255.0))  
                b_norm = max(0, min(1, b / 255.0))
                
                h, s, v = colorsys.rgb_to_hsv(r_norm, g_norm, b_norm)
                r_fixed, g_fixed, b_fixed = colorsys.hsv_to_rgb(h, s, v)
                
                fixed_pixel = (
                    int(r_fixed * 255),
                    int(g_fixed * 255),
                    int(b_fixed * 255)
                )
                fixed_pixels.append(fixed_pixel)
            else:
                fixed_pixels.append(pixel)
        
        # Create new image with fixed pixels
        fixed_img = Image.new('RGB', img.size)
        fixed_img.putdata(fixed_pixels)
        fixed_img.save(output_file)
        
        print(f"Fixed HSV values and saved to {output_file}")
```

### 4. Virtual Machine Execution Errors

#### Issue: Unknown instruction errors
```
ColorLangExecutionError: Unknown instruction: INVALID_INSTR
```

**Diagnosis:**
```python
def diagnose_instruction_errors(program_file):
    """Diagnose instruction-related errors."""
    
    from colorlang.color_parser import ColorParser
    from colorlang.instruction_set import INSTRUCTION_SET
    
    parser = ColorParser()
    
    try:
        instructions = parser.parse_image(program_file)
        
        print(f"Parsed {len(instructions)} instructions")
        
        unknown_instructions = []
        for i, instruction in enumerate(instructions):
            instr_name = instruction.get('instruction', 'UNKNOWN')
            
            if instr_name not in INSTRUCTION_SET:
                unknown_instructions.append((i, instr_name, instruction))
        
        if unknown_instructions:
            print(f"Found {len(unknown_instructions)} unknown instructions:")
            for pos, name, instr in unknown_instructions:
                print(f"  Position {pos}: {name} - {instr}")
                
                # Suggest similar instructions
                suggestions = find_similar_instructions(name)
                if suggestions:
                    print(f"    Did you mean: {', '.join(suggestions)}")
        else:
            print("All instructions are valid")
            
    except Exception as e:
        print(f"Parse error: {e}")

def find_similar_instructions(instruction_name):
    """Find similar instruction names for suggestions."""
    
    from colorlang.instruction_set import INSTRUCTION_SET
    import difflib
    
    # Find close matches
    close_matches = difflib.get_close_matches(
        instruction_name, 
        INSTRUCTION_SET.keys(),
        n=3,
        cutoff=0.6
    )
    
    return close_matches
```

**Solutions:**
```python
def fix_instruction_errors(program_file, output_file):
    """Attempt to fix common instruction errors."""
    
    from colorlang.color_parser import ColorParser
    from colorlang.instruction_set import INSTRUCTION_SET
    
    parser = ColorParser()
    
    try:
        instructions = parser.parse_image(program_file)
        fixed_instructions = []
        
        instruction_fixes = {
            'PRINT_INT': 'PRINT',
            'JUMP': 'JMP', 
            'BRANCH': 'JMP_IF',
            'LOAD': 'LOAD_INT',
            'STORE_REG': 'STORE',
            'PATHFINDING': 'PATHFIND',
            'RENDER': 'RENDER_FRAME'
        }
        
        fixes_applied = 0
        
        for instruction in instructions:
            instr_name = instruction.get('instruction', '')
            
            # Apply known fixes
            if instr_name in instruction_fixes:
                instruction['instruction'] = instruction_fixes[instr_name]
                fixes_applied += 1
                print(f"Fixed: {instr_name} -> {instruction['instruction']}")
            
            # Check if instruction exists
            elif instr_name not in INSTRUCTION_SET:
                # Try to find close match
                suggestions = find_similar_instructions(instr_name)
                if suggestions:
                    instruction['instruction'] = suggestions[0]
                    fixes_applied += 1
                    print(f"Auto-fixed: {instr_name} -> {suggestions[0]}")
            
            fixed_instructions.append(instruction)
        
        if fixes_applied > 0:
            # Save fixed program (would need image generation)
            print(f"Applied {fixes_applied} instruction fixes")
        else:
            print("No instruction fixes needed")
            
        return fixed_instructions
        
    except Exception as e:
        print(f"Fix attempt failed: {e}")
        return None
```

#### Issue: Register access errors
```
IndexError: Register index out of range
```

**Diagnosis and Solution:**
```python
def diagnose_register_errors(program_file):
    """Diagnose register access issues."""
    
    from colorlang.color_parser import ColorParser
    
    parser = ColorParser()
    instructions = parser.parse_image(program_file)
    
    register_accesses = []
    max_register_used = -1
    
    for i, instruction in enumerate(instructions):
        # Check for register operands
        operands = instruction.get('operands', [])
        
        for operand in operands:
            if isinstance(operand, int) and operand >= 0:
                # Assume this might be a register reference
                register_accesses.append((i, operand))
                max_register_used = max(max_register_used, operand)
    
    print(f"Maximum register used: R{max_register_used}")
    print(f"Total register accesses: {len(register_accesses)}")
    
    # Check for potentially invalid register accesses
    invalid_accesses = [r for r in register_accesses if r[1] > 15]  # Assuming 16 registers
    
    if invalid_accesses:
        print(f"Potentially invalid register accesses:")
        for instr_pos, reg_num in invalid_accesses:
            print(f"  Instruction {instr_pos}: R{reg_num}")
    
    return max_register_used, invalid_accesses

def fix_register_bounds(instructions, max_registers=16):
    """Fix register access bounds issues."""
    
    fixed_instructions = []
    fixes_applied = 0
    
    for instruction in instructions:
        operands = instruction.get('operands', [])
        fixed_operands = []
        
        for operand in operands:
            if isinstance(operand, int) and operand >= max_registers:
                # Wrap register access within bounds
                fixed_operand = operand % max_registers
                fixed_operands.append(fixed_operand)
                fixes_applied += 1
                print(f"Fixed register R{operand} -> R{fixed_operand}")
            else:
                fixed_operands.append(operand)
        
        instruction['operands'] = fixed_operands
        fixed_instructions.append(instruction)
    
    print(f"Applied {fixes_applied} register bound fixes")
    return fixed_instructions
```

---

## Performance and Memory Issues

### 5. Slow Execution Performance

#### Issue: ColorLang programs running slowly
```
Performance Issue: Program taking too long to execute
```

**Performance Profiling:**
```python
import time
import cProfile
import pstats

class ColorLangProfiler:
    """Profile ColorLang program execution."""
    
    def __init__(self):
        self.execution_times = {}
        self.instruction_counts = {}
        
    def profile_program(self, program_file):
        """Profile complete program execution."""
        
        from colorlang.color_parser import ColorParser
        from colorlang.virtual_machine import ColorVM
        
        # Set up profiling
        profiler = cProfile.Profile()
        
        parser = ColorParser()
        vm = ColorVM()
        
        # Profile parsing
        profiler.enable()
        parse_start = time.perf_counter()
        program = parser.parse_image(program_file)
        parse_time = time.perf_counter() - parse_start
        
        # Profile execution
        exec_start = time.perf_counter()
        result = vm.run_program(program)
        exec_time = time.perf_counter() - exec_start
        profiler.disable()
        
        # Generate report
        print(f"\\n=== PERFORMANCE PROFILE ===")
        print(f"Parse time: {parse_time*1000:.2f} ms")
        print(f"Execution time: {exec_time*1000:.2f} ms")
        print(f"Total instructions: {len(program)}")
        print(f"Instructions per second: {len(program)/exec_time:.0f}")
        
        # Detailed profiling stats
        stats = pstats.Stats(profiler)
        stats.sort_stats('cumulative')
        stats.print_stats(20)  # Top 20 functions
        
        return {
            'parse_time': parse_time,
            'execution_time': exec_time,
            'total_instructions': len(program),
            'instructions_per_second': len(program) / exec_time
        }
    
    def profile_instruction_types(self, program_file):
        """Profile individual instruction type performance."""
        
        from colorlang.color_parser import ColorParser
        from colorlang.virtual_machine import ColorVM
        
        parser = ColorParser()
        vm = ColorVM()
        program = parser.parse_image(program_file)
        
        # Instrument VM for per-instruction timing
        original_execute = vm.execute_single_instruction
        
        def timed_execute(instruction):
            start = time.perf_counter()
            result = original_execute(instruction)
            elapsed = time.perf_counter() - start
            
            instr_type = instruction.get('instruction', 'UNKNOWN')
            
            if instr_type not in self.execution_times:
                self.execution_times[instr_type] = []
                self.instruction_counts[instr_type] = 0
            
            self.execution_times[instr_type].append(elapsed)
            self.instruction_counts[instr_type] += 1
            
            return result
        
        vm.execute_single_instruction = timed_execute
        
        # Execute program
        result = vm.run_program(program)
        
        # Generate instruction performance report
        print(f"\\n=== INSTRUCTION PERFORMANCE ===")
        print(f"{'Instruction':<15} {'Count':<8} {'Total(ms)':<10} {'Avg(ms)':<10} {'Max(ms)':<10}")
        print("-" * 65)
        
        for instr_type in sorted(self.execution_times.keys()):
            times = self.execution_times[instr_type]
            count = self.instruction_counts[instr_type]
            
            total_ms = sum(times) * 1000
            avg_ms = (sum(times) / len(times)) * 1000
            max_ms = max(times) * 1000
            
            print(f"{instr_type:<15} {count:<8} {total_ms:<10.3f} {avg_ms:<10.3f} {max_ms:<10.3f}")
        
        return self.execution_times, self.instruction_counts

# Usage
profiler = ColorLangProfiler()
profile_data = profiler.profile_program('examples/complex_program.png')
instruction_data = profiler.profile_instruction_types('examples/complex_program.png')
```

**Optimization Strategies:**
```python
def optimize_program_performance(program_file):
    """Apply performance optimizations to ColorLang program."""
    
    from colorlang.color_parser import ColorParser
    
    parser = ColorParser()
    program = parser.parse_image(program_file)
    
    optimizations_applied = []
    
    # Optimization 1: Remove redundant instructions
    optimized_program = remove_redundant_instructions(program)
    if len(optimized_program) < len(program):
        optimizations_applied.append(f"Removed {len(program) - len(optimized_program)} redundant instructions")
    
    # Optimization 2: Combine sequential operations
    optimized_program = combine_sequential_operations(optimized_program)
    
    # Optimization 3: Optimize register usage
    optimized_program = optimize_register_usage(optimized_program)
    
    # Optimization 4: Minimize memory access
    optimized_program = minimize_memory_access(optimized_program)
    
    print(f"Applied optimizations:")
    for opt in optimizations_applied:
        print(f"  - {opt}")
    
    return optimized_program

def remove_redundant_instructions(program):
    """Remove redundant or unnecessary instructions."""
    
    optimized = []
    previous_instruction = None
    
    for instruction in program:
        # Skip consecutive identical instructions (except side-effect instructions)
        if (instruction != previous_instruction or 
            instruction.get('instruction') in ['RENDER_FRAME', 'PRINT', 'GET_TIME']):
            optimized.append(instruction)
        
        previous_instruction = instruction
    
    return optimized

def combine_sequential_operations(program):
    """Combine sequential arithmetic operations where possible."""
    
    optimized = []
    i = 0
    
    while i < len(program):
        current = program[i]
        
        # Look for combinable ADD operations
        if (current.get('instruction') == 'ADD' and 
            i + 1 < len(program) and
            program[i + 1].get('instruction') == 'ADD'):
            
            # Check if operations can be combined
            curr_operands = current.get('operands', [])
            next_operands = program[i + 1].get('operands', [])
            
            if (len(curr_operands) >= 3 and len(next_operands) >= 3 and
                curr_operands[0] == next_operands[1]):  # Output of first is input of second
                
                # Combine operations (simplified example)
                combined_instruction = {
                    'instruction': 'ADD',
                    'operands': [next_operands[0], curr_operands[1], curr_operands[2] + next_operands[2]]
                }
                optimized.append(combined_instruction)
                i += 2  # Skip next instruction
                continue
        
        optimized.append(current)
        i += 1
    
    return optimized
```

### 6. Memory Usage Issues

#### Issue: High memory consumption
```
MemoryError: Unable to allocate memory for shared memory
```

**Memory Diagnostics:**
```python
import psutil
import gc

def diagnose_memory_usage():
    """Diagnose ColorLang memory usage."""
    
    process = psutil.Process()
    
    print(f"\\n=== MEMORY DIAGNOSTICS ===")
    print(f"RSS Memory: {process.memory_info().rss / 1024 / 1024:.2f} MB")
    print(f"VMS Memory: {process.memory_info().vms / 1024 / 1024:.2f} MB")
    print(f"Memory Percent: {process.memory_percent():.2f}%")
    
    # Python garbage collection stats
    print(f"\\nGarbage Collection Stats:")
    for i, stats in enumerate(gc.get_stats()):
        print(f"  Generation {i}: {stats}")
    
    # Count Python objects
    object_count = len(gc.get_objects())
    print(f"Python objects in memory: {object_count}")

def optimize_memory_usage(vm):
    """Optimize memory usage in ColorLang VM."""
    
    # Clear instruction cache if it exists
    if hasattr(vm, 'instruction_cache'):
        vm.instruction_cache.clear()
    
    # Limit shared memory history
    if hasattr(vm, 'shared_memory') and hasattr(vm.shared_memory, 'frame_history'):
        # Keep only last 10 frames
        vm.shared_memory.frame_history = vm.shared_memory.frame_history[-10:]
    
    # Force garbage collection
    gc.collect()
    
    print("Memory optimization applied")

class MemoryEfficientVM:
    """Memory-optimized version of ColorLang VM."""
    
    def __init__(self, max_memory_mb=100):
        self.max_memory_mb = max_memory_mb
        self.memory_checks_enabled = True
        
    def check_memory_usage(self):
        """Check if memory usage is within limits."""
        
        if not self.memory_checks_enabled:
            return True
            
        process = psutil.Process()
        current_mb = process.memory_info().rss / 1024 / 1024
        
        if current_mb > self.max_memory_mb:
            print(f"Memory limit exceeded: {current_mb:.2f} MB > {self.max_memory_mb} MB")
            self.cleanup_memory()
            return False
        
        return True
    
    def cleanup_memory(self):
        """Cleanup memory when limit is exceeded."""
        
        # Clear caches
        if hasattr(self, 'instruction_cache'):
            self.instruction_cache.clear()
        
        if hasattr(self, 'frame_buffer'):
            # Keep only recent frames
            self.frame_buffer = self.frame_buffer[-50:]
        
        # Force garbage collection
        gc.collect()
        
        print("Emergency memory cleanup performed")
```

---

## Debugging Techniques and Tools

### 7. Interactive Debugging

#### Setting Up Debug Environment
```python
class InteractiveColorLangDebugger:
    """Interactive debugger for ColorLang programs."""
    
    def __init__(self, program_file):
        from colorlang.color_parser import ColorParser
        from colorlang.virtual_machine import ColorVM
        
        self.parser = ColorParser()
        self.vm = ColorVM()
        self.program = self.parser.parse_image(program_file)
        self.breakpoints = set()
        self.current_instruction = 0
        self.execution_history = []
        
    def set_breakpoint(self, instruction_number):
        """Set breakpoint at specific instruction."""
        self.breakpoints.add(instruction_number)
        print(f"Breakpoint set at instruction {instruction_number}")
    
    def run_debug_session(self):
        """Run interactive debug session."""
        
        print(f"Starting debug session for {len(self.program)} instructions")
        print("Type 'help' for available commands")
        
        while self.current_instruction < len(self.program):
            instruction = self.program[self.current_instruction]
            
            # Check for breakpoint
            if self.current_instruction in self.breakpoints:
                print(f"\\nBreakpoint hit at instruction {self.current_instruction}")
                self.show_current_state(instruction)
                
                # Interactive prompt
                if not self.handle_debug_prompt():
                    break  # User wants to exit
            else:
                # Execute instruction normally
                self.execute_instruction(instruction)
        
        print("Debug session completed")
    
    def handle_debug_prompt(self):
        """Handle interactive debug commands."""
        
        while True:
            command = input("(debug) ").strip().lower()
            
            if command in ['continue', 'c']:
                return True  # Continue execution
            
            elif command in ['step', 's']:
                instruction = self.program[self.current_instruction]
                self.execute_instruction(instruction)
                return True
            
            elif command in ['next', 'n']:
                # Step over (execute and show next instruction)
                instruction = self.program[self.current_instruction]
                self.execute_instruction(instruction)
                if self.current_instruction < len(self.program):
                    next_instr = self.program[self.current_instruction]
                    self.show_current_state(next_instr)
                return False  # Stay in debug prompt
            
            elif command in ['registers', 'r']:
                self.show_registers()
            
            elif command in ['memory', 'm']:
                self.show_memory()
            
            elif command in ['program', 'p']:
                self.show_program_context()
            
            elif command in ['history', 'h']:
                self.show_execution_history()
            
            elif command.startswith('break '):
                try:
                    instr_num = int(command.split()[1])
                    self.set_breakpoint(instr_num)
                except (IndexError, ValueError):
                    print("Usage: break <instruction_number>")
            
            elif command in ['quit', 'q', 'exit']:
                return False  # Exit debug session
            
            elif command in ['help', '?']:
                self.show_help()
            
            else:
                print(f"Unknown command: {command}")
    
    def show_current_state(self, instruction):
        """Show current execution state."""
        
        print(f"\\nInstruction {self.current_instruction}: {instruction}")
        print(f"Program Counter: {self.vm.pc if hasattr(self.vm, 'pc') else 'N/A'}")
        
        # Show nearby instructions for context
        start = max(0, self.current_instruction - 2)
        end = min(len(self.program), self.current_instruction + 3)
        
        print("\\nProgram context:")
        for i in range(start, end):
            marker = " -> " if i == self.current_instruction else "    "
            print(f"{marker}{i:3d}: {self.program[i]}")
    
    def show_help(self):
        """Show available debug commands."""
        
        help_text = """
Available debug commands:
  continue, c     - Continue execution until next breakpoint
  step, s         - Execute current instruction and pause
  next, n         - Execute instruction and show next
  registers, r    - Show register values
  memory, m       - Show memory contents  
  program, p      - Show program around current instruction
  history, h      - Show execution history
  break <num>     - Set breakpoint at instruction number
  quit, q         - Exit debug session
  help, ?         - Show this help
        """
        print(help_text)

# Usage example
debugger = InteractiveColorLangDebugger('examples/problematic_program.png')
debugger.set_breakpoint(10)
debugger.set_breakpoint(25)
debugger.run_debug_session()
```

### 8. Automated Testing and Validation

#### Comprehensive Test Suite
```python
import unittest
import tempfile
import os

class ColorLangTestSuite(unittest.TestCase):
    """Comprehensive test suite for ColorLang functionality."""
    
    def setUp(self):
        """Set up test environment."""
        
        from colorlang.color_parser import ColorParser
        from colorlang.virtual_machine import ColorVM
        
        self.parser = ColorParser()
        self.vm = ColorVM()
        self.test_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        """Clean up test environment."""
        
        import shutil
        shutil.rmtree(self.test_dir, ignore_errors=True)
    
    def test_basic_program_execution(self):
        """Test basic program parsing and execution."""
        
        # Create simple test program
        test_program = [
            {'instruction': 'LOAD_INT', 'operands': [0, 42]},
            {'instruction': 'LOAD_INT', 'operands': [1, 24]},  
            {'instruction': 'ADD', 'operands': [2, 0, 1]},
            {'instruction': 'HALT', 'operands': []}
        ]
        
        # Execute program
        result = self.vm.run_program(test_program)
        
        # Verify results
        self.assertEqual(self.vm.registers[0], 42)
        self.assertEqual(self.vm.registers[1], 24)
        self.assertEqual(self.vm.registers[2], 66)
    
    def test_error_handling(self):
        """Test error handling for invalid programs."""
        
        # Test invalid instruction
        invalid_program = [
            {'instruction': 'INVALID_INSTRUCTION', 'operands': []}
        ]
        
        with self.assertRaises(Exception):
            self.vm.run_program(invalid_program)
    
    def test_edge_cases(self):
        """Test edge cases and boundary conditions."""
        
        # Test empty program
        empty_program = []
        result = self.vm.run_program(empty_program)
        
        # Test single HALT instruction
        halt_program = [{'instruction': 'HALT', 'operands': []}]
        result = self.vm.run_program(halt_program)
        
        # Test large register values
        large_value_program = [
            {'instruction': 'LOAD_INT', 'operands': [0, 999999]},
            {'instruction': 'HALT', 'operands': []}
        ]
        result = self.vm.run_program(large_value_program)
        self.assertEqual(self.vm.registers[0], 999999)
    
    def test_file_operations(self):
        """Test file parsing and image operations."""
        
        # Create test image file
        test_image_path = os.path.join(self.test_dir, 'test.png')
        self.create_test_image(test_image_path)
        
        # Test parsing
        program = self.parser.parse_image(test_image_path)
        self.assertIsInstance(program, list)
    
    def create_test_image(self, filepath):
        """Create a simple test image for parsing."""
        
        from PIL import Image
        
        # Create 2x2 test image with known values
        test_pixels = [
            (255, 0, 0),    # Red
            (0, 255, 0),    # Green  
            (0, 0, 255),    # Blue
            (255, 255, 255) # White
        ]
        
        img = Image.new('RGB', (2, 2))
        img.putdata(test_pixels)
        img.save(filepath)

def run_validation_tests():
    """Run comprehensive validation tests."""
    
    # Load and run test suite
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(ColorLangTestSuite)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Generate test report
    print(f"\\n=== TEST RESULTS ===")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.failures:
        print("\\nFailures:")
        for test, traceback in result.failures:
            print(f"  {test}: {traceback}")
    
    if result.errors:
        print("\\nErrors:")
        for test, traceback in result.errors:
            print(f"  {test}: {traceback}")
    
    return result.wasSuccessful()

# Usage
if __name__ == '__main__':
    success = run_validation_tests()
    exit(0 if success else 1)
```

---

## Common Issues and Solutions

### 9. Frequently Asked Questions

#### Q: Why is my ColorLang program not producing the expected output?
**A:** Check the following common issues:

1. **Instruction sequence**: Verify instructions are in correct order
2. **Register initialization**: Ensure all registers are properly initialized
3. **Operand values**: Check that operands are within valid ranges
4. **Image format**: Confirm the program image is valid PNG/RGB format

```python
def quick_program_check(program_file):
    """Quick diagnostic check for common issues."""
    
    issues_found = []
    
    # Check 1: File exists and is readable
    if not os.path.exists(program_file):
        issues_found.append("Program file does not exist")
        return issues_found
    
    # Check 2: Valid image format
    try:
        from PIL import Image
        with Image.open(program_file) as img:
            if img.mode != 'RGB':
                issues_found.append(f"Image mode is {img.mode}, should be RGB")
    except Exception as e:
        issues_found.append(f"Image format error: {e}")
    
    # Check 3: Program parsing
    try:
        from colorlang.color_parser import ColorParser
        parser = ColorParser()
        program = parser.parse_image(program_file)
        
        if len(program) == 0:
            issues_found.append("Program contains no instructions")
        
        # Check for HALT instruction
        has_halt = any(instr.get('instruction') == 'HALT' for instr in program)
        if not has_halt:
            issues_found.append("Program missing HALT instruction")
        
    except Exception as e:
        issues_found.append(f"Parse error: {e}")
    
    if not issues_found:
        issues_found.append("No obvious issues found")
    
    return issues_found
```

#### Q: How do I debug performance issues in my ColorLang program?
**A:** Use the performance profiling tools:

```python
# Quick performance check
profiler = ColorLangProfiler()
stats = profiler.profile_program('your_program.png')

if stats['instructions_per_second'] < 1000:
    print("Performance issue detected!")
    # Apply optimizations...
```

#### Q: My program crashes with a memory error. What should I do?
**A:** Implement memory monitoring:

```python
# Monitor memory during execution
vm = MemoryEfficientVM(max_memory_mb=50)
result = vm.run_program_with_monitoring(program)
```

---

## Emergency Recovery Procedures

### 10. System Recovery

#### When ColorLang Environment is Completely Broken
```bash
# Complete reinstallation procedure

# 1. Backup current work
mkdir backup_$(date +%Y%m%d)
cp -r colorlang/ backup_$(date +%Y%m%d)/
cp -r examples/ backup_$(date +%Y%m%d)/

# 2. Clean Python environment
pip uninstall -y pillow numpy
pip cache purge

# 3. Reinstall dependencies
pip install --no-cache-dir pillow numpy

# 4. Reset Python path
unset PYTHONPATH
export PYTHONPATH=""

# 5. Test basic functionality
python -c "from PIL import Image; print('PIL OK')"
python -c "import numpy; print('NumPy OK')"

# 6. Validate ColorLang installation
python examples/validate_examples.py
```

#### Corrupted Program Recovery
```python
def recover_corrupted_program(corrupted_file, output_file):
    """Attempt to recover a corrupted ColorLang program."""
    
    from PIL import Image
    import numpy as np
    
    try:
        # Try to open and analyze the corrupted file
        with Image.open(corrupted_file) as img:
            pixels = np.array(img)
            
            # Check for corruption patterns
            if pixels.shape[0] == 0 or pixels.shape[1] == 0:
                print("Image has zero dimensions")
                return False
            
            # Fix common corruption issues
            # Remove extreme outlier pixels
            mean_val = np.mean(pixels)
            std_val = np.std(pixels)
            
            # Clamp pixels to reasonable range
            pixels = np.clip(pixels, 
                           mean_val - 3*std_val, 
                           mean_val + 3*std_val)
            
            # Save recovered image
            recovered_img = Image.fromarray(pixels.astype(np.uint8))
            recovered_img.save(output_file)
            
            print(f"Recovered program saved to: {output_file}")
            return True
            
    except Exception as e:
        print(f"Recovery failed: {e}")
        return False

# Usage
success = recover_corrupted_program('corrupted.png', 'recovered.png')
```

---

This comprehensive troubleshooting guide provides systematic approaches to diagnosing and resolving the most common issues encountered in ColorLang development, from basic installation problems to complex performance optimization challenges.