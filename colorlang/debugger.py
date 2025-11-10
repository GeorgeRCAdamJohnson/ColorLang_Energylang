"""
ColorLang Debugger
Visual debugging and development tools for ColorLang programs.
"""

import time
from typing import Dict, List, Tuple, Any, Optional, Callable
from PIL import Image, ImageDraw, ImageFont
import colorsys

from .virtual_machine import ColorVM
from .color_parser import ColorParser
from .exceptions import *

class ColorDebugger:
    """Interactive debugger for ColorLang programs with visual feedback."""
    
    def __init__(self, vm: ColorVM):
        self.vm = vm
        self.parser = ColorParser()
        
        # Debugging state
        self.breakpoints = set()  # Set of (x, y) positions
        self.step_mode = False
        self.execution_trace = []
        self.watch_registers = set()
        self.watch_memory = set()
        
        # Visualization settings
        self.visualization_enabled = True
        self.debug_image_scale = 20  # Scale factor for debug visualization
        self.trace_length = 100  # Number of steps to keep in trace
        
        # Callbacks
        self.on_breakpoint = None
        self.on_step = None
        self.on_register_change = None
    
    def add_breakpoint(self, x: int, y: int):
        """Add a breakpoint at the specified position."""
        self.breakpoints.add((x, y))
    
    def remove_breakpoint(self, x: int, y: int):
        """Remove a breakpoint at the specified position."""
        self.breakpoints.discard((x, y))
    
    def clear_breakpoints(self):
        """Clear all breakpoints."""
        self.breakpoints.clear()
    
    def add_register_watch(self, register_name: str):
        """Watch a register for changes."""
        self.watch_registers.add(register_name)
    
    def add_memory_watch(self, address: Tuple[int, int]):
        """Watch a memory location for changes."""
        self.watch_memory.add(address)
    
    def run_with_debugging(self, program: Dict[str, Any]) -> Dict[str, Any]:
        """Run program with debugging support."""
        self.vm.load_program(program)
        self.vm.debug_mode = True
        self.execution_trace = []
        
        try:
            while self.vm.running and not self.vm.halted:
                # Check for breakpoint
                if self.vm.pc in self.breakpoints:
                    self._handle_breakpoint()
                
                # Store state before execution
                prev_state = self.vm.get_state()
                
                # Execute one cycle
                self.vm.execute_cycle()
                
                # Store execution trace
                current_state = self.vm.get_state()
                self._record_trace_step(prev_state, current_state)
                
                # Check for watched changes
                self._check_watches(prev_state, current_state)
                
                # Handle step mode
                if self.step_mode:
                    self._handle_step()
            
            # Generate final result with debug info
            result = self.vm.run_program(program)
            result['debug_info'] = {
                'execution_trace': self.execution_trace,
                'breakpoints_hit': len([t for t in self.execution_trace if t.get('breakpoint_hit')]),
                'total_steps': len(self.execution_trace)
            }
            
            return result
        
        except DebugBreakpoint as e:
            self._handle_debug_instruction(e)
            return self.run_with_debugging(program)  # Continue execution
        
        except ColorLangError as e:
            return {
                'exit_code': -1,
                'error': str(e),
                'error_type': type(e).__name__,
                'position': getattr(e, 'position', self.vm.pc),
                'debug_info': {
                    'execution_trace': self.execution_trace,
                    'vm_state': self.vm.get_state()
                }
            }
    
    def step_into(self):
        """Execute one instruction and pause."""
        if not self.vm.running or self.vm.halted:
            return
        
        prev_state = self.vm.get_state()
        self.vm.execute_cycle()
        current_state = self.vm.get_state()
        
        self._record_trace_step(prev_state, current_state)
        self._check_watches(prev_state, current_state)
        
        if self.on_step:
            self.on_step(prev_state, current_state)
    
    def step_over(self):
        """Execute until next instruction at same level or return."""
        if not self.vm.running or self.vm.halted:
            return
        
        current_call_depth = len(self.vm.call_stack)
        
        while (self.vm.running and not self.vm.halted and 
               len(self.vm.call_stack) >= current_call_depth):
            self.step_into()
    
    def continue_execution(self):
        """Continue execution until next breakpoint or end."""
        self.step_mode = False
        
        while self.vm.running and not self.vm.halted:
            if self.vm.pc in self.breakpoints:
                self._handle_breakpoint()
                break
            
            self.step_into()
    
    def visualize_program(self, program: Dict[str, Any], output_path: str = None) -> Image.Image:
        """Create a visual representation of the program."""
        instructions = program['instructions']
        width = program['width']
        height = program['height']
        
        # Create scaled image for visibility
        scale = self.debug_image_scale
        vis_width = width * scale
        vis_height = height * scale
        
        img = Image.new('RGB', (vis_width, vis_height), 'black')
        draw = ImageDraw.Draw(img)
        
        # Draw each instruction pixel
        for y in range(height):
            for x in range(width):
                if y < len(instructions) and x < len(instructions[y]):
                    instruction = instructions[y][x]
                    
                    # Get RGB color from instruction
                    r, g, b = instruction.get('raw_rgb', (0, 0, 0))
                    
                    # Draw scaled pixel
                    x1, y1 = x * scale, y * scale
                    x2, y2 = x1 + scale, y1 + scale
                    draw.rectangle([x1, y1, x2, y2], fill=(r, g, b))
                    
                    # Draw border for current PC
                    if (x, y) == self.vm.pc:
                        draw.rectangle([x1, y1, x2, y2], outline='white', width=2)
                    
                    # Draw border for breakpoints
                    if (x, y) in self.breakpoints:
                        draw.rectangle([x1, y1, x2, y2], outline='red', width=1)
        
        if output_path:
            img.save(output_path)
        
        return img
    
    def generate_execution_report(self) -> str:
        """Generate a detailed execution report."""
        report = "ColorLang Execution Report\n"
        report += "=" * 30 + "\n\n"
        
        # VM state summary
        state = self.vm.get_state()
        report += f"Program Counter: {state['pc']}\n"
        report += f"Execution Status: {'Halted' if state['halted'] else 'Running'}\n"
        report += f"Total Cycles: {state['cycle_count']}\n"
        report += f"Stack Depth: {state['stack_depth']}\n"
        report += f"Heap Size: {state['heap_size']}\n\n"
        
        # Register contents
        report += "Register Contents:\n"
        report += "-" * 20 + "\n"
        
        for reg_name, value in state['registers']['data'].items():
            if value != 0:  # Only show non-zero registers
                report += f"{reg_name}: {value}\n"
        
        report += "\n"
        
        # Execution statistics
        stats = state['stats']
        report += "Execution Statistics:\n"
        report += "-" * 20 + "\n"
        report += f"Instructions Executed: {stats['instructions_executed']}\n"
        report += f"Cycles Elapsed: {stats['cycles_elapsed']}\n"
        report += f"Function Calls: {stats['function_calls']}\n"
        report += f"Memory Allocated: {stats['memory_allocated']} bytes\n\n"
        
        # Execution trace (last 10 steps)
        if self.execution_trace:
            report += "Recent Execution Trace:\n"
            report += "-" * 20 + "\n"
            
            for trace_step in self.execution_trace[-10:]:
                pc = trace_step['pc']
                instruction = trace_step.get('instruction_name', 'UNKNOWN')
                report += f"  {pc}: {instruction}\n"
            
            report += "\n"
        
        # Breakpoint information
        if self.breakpoints:
            report += "Active Breakpoints:\n"
            report += "-" * 20 + "\n"
            for bp in sorted(self.breakpoints):
                report += f"  {bp}\n"
            report += "\n"
        
        return report
    
    def visualize_execution_trace(self, output_path: str = None) -> Image.Image:
        """Create a visual representation of the execution trace."""
        if not self.execution_trace:
            # Create empty image
            img = Image.new('RGB', (100, 50), 'black')
            return img
        
        # Calculate image dimensions
        max_x = max(step['pc'][0] for step in self.execution_trace) + 1
        max_y = max(step['pc'][1] for step in self.execution_trace) + 1
        
        scale = self.debug_image_scale
        img = Image.new('RGB', (max_x * scale, max_y * scale), 'black')
        draw = ImageDraw.Draw(img)
        
        # Draw execution path
        for i, step in enumerate(self.execution_trace):
            x, y = step['pc']
            
            # Color intensity based on recency
            intensity = min(255, int(255 * (i + 1) / len(self.execution_trace)))
            color = (intensity, intensity // 2, 0)  # Orange gradient
            
            # Draw execution point
            x1, y1 = x * scale, y * scale
            x2, y2 = x1 + scale, y1 + scale
            draw.rectangle([x1, y1, x2, y2], fill=color)
            
            # Draw connection to next step
            if i < len(self.execution_trace) - 1:
                next_x, next_y = self.execution_trace[i + 1]['pc']
                draw.line([
                    (x * scale + scale // 2, y * scale + scale // 2),
                    (next_x * scale + scale // 2, next_y * scale + scale // 2)
                ], fill='yellow', width=1)
        
        if output_path:
            img.save(output_path)
        
        return img
    
    def _handle_breakpoint(self):
        """Handle breakpoint hit."""
        print(f"Breakpoint hit at {self.vm.pc}")
        
        if self.on_breakpoint:
            self.on_breakpoint(self.vm.get_state())
        
        # Mark breakpoint in trace
        if self.execution_trace:
            self.execution_trace[-1]['breakpoint_hit'] = True
        
        # Enter step mode
        self.step_mode = True
    
    def _handle_step(self):
        """Handle single step execution."""
        if self.on_step:
            self.on_step(self.vm.get_state())
        
        # Wait for user input or automatic continue
        # In a GUI, this would wait for user action
        pass
    
    def _handle_debug_instruction(self, debug_exception: DebugBreakpoint):
        """Handle DEBUG instruction breakpoint."""
        print(f"Debug instruction at {debug_exception.position}")
        
        # Show current state
        state = self.vm.get_state()
        print(f"Registers: {state['registers']['data']}")
        print(f"PC: {state['pc']}, Cycles: {state['cycle_count']}")
    
    def _record_trace_step(self, prev_state: Dict, current_state: Dict):
        """Record a step in the execution trace."""
        # Get instruction info
        instruction = self.vm.fetch_instruction()
        instruction_name = 'UNKNOWN'
        
        if instruction:
            instruction_name = self.parser.get_operation_name(instruction)
        
        trace_step = {
            'pc': prev_state['pc'],
            'instruction_name': instruction_name,
            'cycle_count': current_state['cycle_count'],
            'registers_changed': self._get_register_changes(prev_state, current_state),
            'timestamp': time.time()
        }
        
        self.execution_trace.append(trace_step)
        
        # Limit trace length
        if len(self.execution_trace) > self.trace_length:
            self.execution_trace.pop(0)
    
    def _check_watches(self, prev_state: Dict, current_state: Dict):
        """Check for watched register/memory changes."""
        # Check register watches
        for reg_name in self.watch_registers:
            prev_val = prev_state['registers']['data'].get(reg_name, 0)
            curr_val = current_state['registers']['data'].get(reg_name, 0)
            
            if prev_val != curr_val:
                print(f"Watch: {reg_name} changed from {prev_val} to {curr_val}")
                
                if self.on_register_change:
                    self.on_register_change(reg_name, prev_val, curr_val)
    
    def _get_register_changes(self, prev_state: Dict, current_state: Dict) -> List[str]:
        """Get list of registers that changed between states."""
        changes = []
        
        prev_regs = prev_state['registers']['data']
        curr_regs = current_state['registers']['data']
        
        all_regs = set(prev_regs.keys()) | set(curr_regs.keys())
        
        for reg in all_regs:
            prev_val = prev_regs.get(reg, 0)
            curr_val = curr_regs.get(reg, 0)
            
            if prev_val != curr_val:
                changes.append(f"{reg}: {prev_val} -> {curr_val}")
        
        return changes
    
    def save_debug_session(self, filename: str):
        """Save current debug session to file."""
        debug_data = {
            'vm_state': self.vm.get_state(),
            'execution_trace': self.execution_trace,
            'breakpoints': list(self.breakpoints),
            'watch_registers': list(self.watch_registers),
            'watch_memory': list(self.watch_memory)
        }
        
        import json
        with open(filename, 'w') as f:
            json.dump(debug_data, f, indent=2, default=str)
    
    def load_debug_session(self, filename: str):
        """Load debug session from file."""
        import json
        with open(filename, 'r') as f:
            debug_data = json.load(f)
        
        # Restore breakpoints and watches
        self.breakpoints = set(tuple(bp) for bp in debug_data.get('breakpoints', []))
        self.watch_registers = set(debug_data.get('watch_registers', []))
        self.watch_memory = set(tuple(addr) for addr in debug_data.get('watch_memory', []))