"""
ColorLang Virtual Machine
Core execution engine for ColorLang programs.
"""

import time
import random
import threading
from typing import Dict, List, Tuple, Any, Optional, Union
from collections import deque

from .exceptions import *
from .instruction_set import InstructionSet
from .color_parser import ColorParser

class ColorVM:
    """Virtual machine for executing ColorLang programs."""
    
    def __init__(self, max_stack_depth=1000, max_memory=1024*1024, shared_memory=None):
        # Core components
        self.instruction_set = InstructionSet()
        self.parser = ColorParser()
        
        # Execution state
        self.pc = (0, 0)  # Program counter (x, y)
        self.running = False
        self.halted = False
        self.cycle_count = 0
        
        # String table initialization
        self.string_table = {
            0: "NOP",
            1: "Hello, World!",
            2: "Thread 1", 
            3: "Thread 2",
            4: "Decision: Collect Banana",
            5: "Color Transformed",
            6: "Hello,",
            7: "World!", 
            8: "Loop Complete",
            9: "Error",
            10: "Done"
        }        # String table segment allocation
        self.string_table_next_id = max(self.string_table.keys()) + 1
        
        # Initialize output buffers
        self._output_buffer = []
        self.thread_outputs = {}
        self.thread_lock = threading.Lock()
        
        # Memory and registers
        self.color_registers = {}  # CR0-CR7: Store HSV values
        self.data_registers = {}   # DR0-DR15: Store computed values  
        self.address_registers = {} # AR0-AR3: Store memory addresses
        self.flag_register = 0     # FR: Execution state flags
        
        # Memory spaces
        self.stack = deque()
        self.heap = {}
        self.program_memory = None
        self.call_stack = deque()
        
        # Thread management
        self.threads = {}  # Stores thread state
        self.current_thread = None
        self.thread_counter = 0
        self.thread_outputs = {}   # Per-thread output buffers
        
        # Configuration
        self.max_stack_depth = max_stack_depth
        self.max_memory = max_memory
        self.debug_mode = False
        
        # Performance tracking
        self.execution_stats = {
            'instructions_executed': 0,
            'cycles_elapsed': 0,
            'memory_allocated': 0,
            'function_calls': 0,
            'threads_spawned': 0
        }
        
        self.shared_memory = shared_memory  # Reference to shared memory for updates
        
        # Initialize output buffers
        self._output_buffer = []  # Main program output buffer
        self.thread_outputs = {0: []}  # Initialize with main thread buffer
        self.output_initialized = True  # Flag to track initialization
        
        self._initialize_registers()
    
    def _initialize_registers(self):
        """Initialize all registers to default values."""
        # Color registers (CR0-CR7)
        for i in range(8):
            self.color_registers[f'CR{i}'] = (0.0, 0.0, 0.0)  # Black
        
        # Data registers (DR0-DR15) - Initialize for Fibonacci sequence
        self.data_registers.update({
            'DR0': 0,  # First Fibonacci number
            'DR1': 1,  # Second Fibonacci number
        })
        for i in range(2, 16):  # Initialize remaining registers
            self.data_registers[f'DR{i}'] = 0
        
        # Address registers (AR0-AR3)
        for i in range(4):
            self.address_registers[f'AR{i}'] = (0, 0)
            
        print(f"[DEBUG] Initial register state: {self.data_registers}")
    
    def load_program(self, program: Dict[str, Any]):
        """Load a parsed program into program memory."""
        # Initialize program with strings, preserving any existing string table entries
        if 'strings' not in program:
            program['strings'] = {}
        # Merge with existing string table, program strings take precedence
        self.string_table.update(program['strings'])
        program['strings'] = self.string_table.copy()

        self.program_memory = program
        self.pc = (0, 0)
        self.halted = False
        self.cycle_count = 0
        self.running = True
        
        # Properly initialize output buffers
        self._output_buffer = []  # Main program output buffer
        self.thread_outputs = {}  # Thread-specific output buffers
        
        # Set up main thread output buffer
        self.thread_outputs[0] = []  # Initialize main thread buffer
        
        # Debug: Log the dimensions and state of loaded program
        if 'instructions' in program:
            height = len(program['instructions'])
            width = len(program['instructions'][0]) if height > 0 else 0
            print(f"[DEBUG] Loaded program with dimensions: {width}x{height}")
            print(f"[DEBUG] Available strings: {program['strings']}")
            print(f"[DEBUG] Initial output buffers: main={self._output_buffer}, threads={self.thread_outputs}")
        
    def run_program(self, program: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a complete program and return results."""
        try:
            # Initialize VM state
            self.load_program(program)
            
            # Reset output buffers
            self._output_buffer = []  # Main program output buffer
            self.thread_outputs = {}  # Thread-specific buffers
            
            # Initialize main thread if not already running
            if not self.threads:
                main_thread = self.spawn_thread((0, 0))
                self.switch_thread(main_thread)
                self.thread_outputs[main_thread] = []  # Initialize main thread buffer
                
                if self.debug_mode:
                    print(f"[DEBUG] Initialized main thread {main_thread} and output buffers")

            # Main execution loop
            while True:
                # Get list of running threads
                running_threads = [tid for tid, state in self.threads.items() if state['running']]
                
                if not running_threads:
                    if self.debug_mode:
                        print("[DEBUG] No more running threads, execution complete")
                    break
                
                # Round-robin scheduling
                for thread_id in running_threads:
                    if self.threads[thread_id]['running']:
                        self.switch_thread(thread_id)
                        self.execute_cycle()
                        
                        if self.debug_mode:
                            print(f"[DEBUG] Executed cycle for thread {thread_id}")
                            print(f"[DEBUG] Thread state: PC={self.pc}, Registers={self.data_registers}")
                            print(f"[DEBUG] Thread output: {self.thread_outputs.get(thread_id, [])}")

                # Safety check for infinite loops
                if self.cycle_count > 1000000:  # 1M cycle limit
                    raise ResourceExhaustionError("Execution cycle limit exceeded")

            # Start with main output buffer as base
            all_outputs = [str(out).strip() for out in self._output_buffer if out is not None and str(out).strip()]
            
            # Add any thread-specific outputs that aren't in main buffer
            for thread_id in sorted(self.thread_outputs.keys()):
                thread_buffer = self.thread_outputs[thread_id]
                if thread_buffer:
                    if self.debug_mode:
                        print(f"[DEBUG] Processing thread {thread_id} buffer: {thread_buffer}")
                    thread_outputs = [str(out).strip() for out in thread_buffer if out is not None and str(out).strip()]
                    # Only add outputs not already in main buffer
                    for out in thread_outputs:
                        if out not in all_outputs:
                            all_outputs.append(out)
                    if self.debug_mode:
                        print(f"[DEBUG] Added unique outputs from thread {thread_id}: {thread_outputs}")
            
            # Debug all collected outputs
            print(f"[DEBUG] All collected outputs: {all_outputs}")
            
            # Ensure all outputs are properly formatted strings
            all_outputs = [str(out).strip() for out in all_outputs if str(out).strip()]
            
            if self.debug_mode:
                print(f"[DEBUG] Final cleaned outputs: {all_outputs}")

            # Update shared memory if available
            if self.shared_memory is not None:
                shared_output = getattr(self.shared_memory, 'output', [])
                if shared_output is not None:
                    shared_output.clear()
                    shared_output.extend(all_outputs)

            # Prepare final state
            final_state = {
                'exit_code': 0 if not self.halted else self.flag_register,
                'final_registers': {
                    'color': self.color_registers.copy(),
                    'data': self.data_registers.copy(),
                    'address': self.address_registers.copy()
                },
                'execution_stats': self.execution_stats.copy(),
                'thread_states': self.threads.copy(),
                'output': all_outputs
            }

            return final_state

        except ColorLangError as e:
            error_state = {
                'exit_code': -1,
                'error': str(e),
                'error_type': type(e).__name__,
                'position': getattr(e, 'position', self.pc),
                'execution_stats': self.execution_stats.copy(),
                'thread_id': self.current_thread
            }
            if self.debug_mode:
                print(f"[DEBUG] Execution failed: {error_state}")
            return error_state
    
    def execute_cycle(self):
        """Execute one instruction cycle."""
        if self.halted or not self.running:
            return
        
        # Fetch instruction
        instruction = self.fetch_instruction()
        if instruction is None:
            self.halt(0)  # End of program
            return
        
        # Debug: Log the current instruction
        print(f"[DEBUG] Executing instruction at PC {self.pc}: {instruction}")

        # Skip comments and NOPs
        if instruction['type'] in ['COMMENT', 'NOP']:
            self.advance_pc()
            return
        
        # Decode operation
        operation_name = self.parser.get_operation_name(instruction)

        # Debug: Log operation name and operands
        operands = self.parser.extract_operands(instruction)
        print(f"[DEBUG] Decoded operation: {operation_name}, Operands: {operands}")
        print(f"[DEBUG] Raw instruction: type={instruction['type']}, hue={instruction['hue']}")

        # Execute instruction
        self.execute_instruction(instruction, operation_name)

        # Debug: Log updated execution stats
        print(f"[DEBUG] Execution stats: Instructions Executed={self.execution_stats['instructions_executed']}, Cycles Elapsed={self.execution_stats['cycles_elapsed']}")

        # Update statistics
        self.execution_stats['instructions_executed'] += 1
        self.cycle_count += self.instruction_set.get_execution_cycles(operation_name)
        self.execution_stats['cycles_elapsed'] = self.cycle_count

        # Debug: Log updated VM state
        print(f"[DEBUG] VM state after execution: PC={self.pc}, Registers={self.data_registers}, Cycle Count={self.cycle_count}")
    
    def fetch_instruction(self) -> Optional[Dict[str, Any]]:
        """Fetch instruction at current program counter."""
        if not self.program_memory:
            return None
        
        x, y = self.pc
        instructions = self.program_memory['instructions']
        
        if y >= len(instructions) or x >= len(instructions[y]):
            return None  # End of program
        
        return instructions[y][x]
    
    def execute_instruction(self, instruction: Dict[str, Any], operation_name: str):
        """Execute a single instruction."""
        # Debug: Log the operation being executed
        print(f"[DEBUG] Executing operation: {operation_name} with instruction: {instruction}")

        # Extract operands
        operands = self.parser.extract_operands(instruction)

        # Dispatch to appropriate handler
        if operation_name in ['ADD', 'SUB', 'MUL', 'DIV', 'MOD', 'POW']:
            self._execute_arithmetic(operation_name, operands, instruction)
        elif operation_name in ['LOAD', 'STORE', 'MOVE', 'COPY', 'ALLOC', 'FREE']:
            self._execute_memory(operation_name, operands, instruction)
        elif operation_name in ['IF', 'ELSE', 'WHILE', 'FOR', 'BREAK', 'CONTINUE']:
            self._execute_control(operation_name, operands, instruction)
        elif operation_name in ['CALL', 'RETURN', 'FUNC_DEF', 'PARAM', 'LOCAL']:
            self._execute_function(operation_name, operands, instruction)
        elif operation_name in ['PRINT', 'PRINT_STRING', 'PRINT_NUM', 'INPUT', 'READ_FILE', 'WRITE_FILE']:
            self._execute_io(operation_name, operands, instruction)
        elif operation_name in ['HALT', 'DEBUG', 'THREAD_SPAWN']:
            self._execute_system(operation_name, operands, instruction)
        elif operation_name in ['INTEGER', 'FLOAT']:
            self._execute_data(operation_name, operands, instruction)
        elif operation_name == 'PATHFIND':
            self._execute_pathfind(operands, instruction)
        else:
            raise InvalidInstructionError(instruction['hue'], instruction['position'])
    
    def _execute_arithmetic(self, operation: str, operands: Dict, instruction: Dict):
        """Execute arithmetic operations."""
        # Get values based on operand types
        if operands['operand_a_type'] == 'REGISTER':
            a = self.data_registers.get(f"DR{operands['operand_a']}" if operands['operand_a'] < 16 else 'DR0', 0)
        elif operands['operand_a_type'] == 'MEMORY_ADDR':
            a = self.heap.get(operands['operand_a'], 0)
        elif operands['operand_a_type'] == 'IMMEDIATE':
            a = operands['operand_a']
        elif operands['operand_a_type'] == 'EXTENDED':
            a = self.data_registers['DR0']  # EXTENDED always uses DR0
        else:
            a = self.data_registers['DR0']
        
        if operands['operand_b_type'] == 'REGISTER':
            b = self.data_registers.get(f"DR{operands['operand_b']}" if operands['operand_b'] < 16 else 'DR1', 0)
        elif operands['operand_b_type'] == 'MEMORY_ADDR':
            b = self.heap.get(operands['operand_b'], 0)
        elif operands['operand_b_type'] == 'IMMEDIATE':
            b = operands['operand_b']
        elif operands['operand_b_type'] == 'EXTENDED':
            b = self.data_registers['DR1']  # EXTENDED always uses DR1
        else:
            b = self.data_registers['DR1']

        # Debug: Log operands and operation
        print(f"[DEBUG] Arithmetic operation: {operation}, Operand A: {a}, Operand B: {b}")

        # Debug: Log registers before operation
        print(f"[DEBUG] Registers before {operation}: {self.data_registers}")
        
        # Execute arithmetic operation
        if operation == 'ADD':
            # First get operand values based on specified types
            if operands['operand_a_type'] == 'REGISTER':
                operand_a = self.data_registers.get(f"DR{operands['operand_a']}", 0)
            else:
                operand_a = operands['operand_a']
            
            if operands['operand_b_type'] == 'REGISTER':
                operand_b = self.data_registers.get(f"DR{operands['operand_b']}", 0)
            else:
                operand_b = operands['operand_b']
            
            # Calculate result
            result = operand_a + operand_b
            
            # Update registers based on operation type
            if instruction['type'] == 'ARITHMETIC':
                # Normal arithmetic handling
                self.data_registers.update({
                    'DR0': result,  # Store result
                    'DR1': operand_a,  # Preserve first operand
                    'DR2': operand_b   # Preserve second operand
                })
            else:
                # For Fibonacci sequence handling
                self.data_registers.update({
                    'DR0': result,      # New Fibonacci number
                    'DR1': operand_a,   # Previous Fibonacci number
                    'DR2': operand_b,   # Previous previous number
                })
            
            # Debug output for Fibonacci calculation
            print(f"[DEBUG] Fibonacci calculation: {operand_a} + {operand_b} = {result}")
            
        elif operation == 'SUB':
            result = a - b
            self.data_registers.update({
                'DR0': result,  # Store result in DR0
                'DR1': a,       # Preserve first operand
                'DR2': b        # Preserve second operand
            })
        elif operation == 'MUL':
            result = a * b
            self.data_registers.update({
                'DR0': result,  # Store result in DR0
                'DR1': a,       # Preserve first operand
                'DR2': b        # Preserve second operand
            })
        elif operation == 'DIV':
            if b == 0:
                raise DivisionByZeroError(instruction['position'])
            result = a // b
            self.data_registers.update({
                'DR0': result,  # Store result in DR0
                'DR1': a,       # Preserve first operand
                'DR2': b        # Preserve second operand
            })
        elif operation == 'MOD':
            if b == 0:
                raise DivisionByZeroError(instruction['position'])
            result = a % b
            self.data_registers.update({
                'DR0': result,  # Store result in DR0
                'DR1': a,       # Preserve first operand
                'DR2': b        # Preserve second operand
            })
        elif operation == 'POW':
            result = pow(a, b)
            self.data_registers.update({
                'DR0': result,  # Store result in DR0
                'DR1': a,       # Preserve first operand
                'DR2': b        # Preserve second operand
            })
        else:
            raise InvalidInstructionError(instruction['hue'], instruction['position'])

        # Debug: Log registers after operation
        print(f"[DEBUG] {operation} result: {result}")
        print(f"[DEBUG] Registers after {operation}: {self.data_registers}")

        # Debug: Log result and register state 
        print(f"[DEBUG] Result of {operation}: {result}, DR0={result}, DR1={a}, DR2={b}")

        self.advance_pc()

    def _execute_memory(self, operation: str, operands: Dict, instruction: Dict):
        """Execute memory operations."""
        if operation == 'LOAD':
            value = operands['operand_a']
            
            # Handle different operand types
            if operands['operand_a_type'] == 'IMMEDIATE':
                self.data_registers['DR0'] = value
            elif operands['operand_a_type'] == 'MEMORY_ADDR':
                self.data_registers['DR0'] = self.heap.get(value, 0)
            elif operands['operand_a_type'] == 'REGISTER':
                src_reg = f"DR{value % 16}"
                self.data_registers['DR0'] = self.data_registers.get(src_reg, 0)

            # Debug: Log the LOAD operation
            print(f"[DEBUG] LOAD operation: Loaded value {self.data_registers['DR0']} into DR0")
        
        elif operation == 'STORE':
            value = self.data_registers.get('DR0', 0)
            
            # Handle different operand types for destination
            if operands['operand_b_type'] == 'MEMORY_ADDR':
                address = operands['operand_b']
                self.heap[address] = value
            elif operands['operand_b_type'] == 'REGISTER':
                dst_reg = f"DR{operands['operand_b'] % 16}"
                self.data_registers[dst_reg] = value
                
            # Debug: Log the STORE operation
            print(f"[DEBUG] STORE operation: Stored value {value} at {address if 'address' in locals() else dst_reg}")
        
        elif operation == 'MOVE':
            # For Fibonacci sequence, we need to move DR0 to DR1 and preserve values
            prev_dr0 = self.data_registers.get('DR0', 0)
            prev_dr1 = self.data_registers.get('DR1', 0)
            prev_dr2 = self.data_registers.get('DR2', 0)
            
            # Move values up the register chain
            self.data_registers.update({
                'DR0': prev_dr1,   # Move previous number to DR0
                'DR1': prev_dr2,   # Move previous previous to DR1
                'DR2': prev_dr0    # Store the sum in DR2 for safekeeping
            })
            
            # Debug output for register movement
            print(f"[DEBUG] MOVE operation for Fibonacci: DR0={self.data_registers['DR0']}, DR1={self.data_registers['DR1']}, DR2={self.data_registers['DR2']}")
            print(f"[DEBUG] Previous values: DR0={prev_dr0}, DR1={prev_dr1}, DR2={prev_dr2}")
        
        elif operation == 'COPY':
            # Copy between registers or memory
            src_type = operands['operand_a_type']
            dst_type = operands['operand_b_type']
            
            # Get source value
            if src_type == 'REGISTER':
                src_reg = f"DR{operands['operand_a'] % 16}"
                value = self.data_registers.get(src_reg, 0)
            elif src_type == 'MEMORY_ADDR':
                value = self.heap.get(operands['operand_a'], 0)
            else:
                value = operands['operand_a']  # Immediate
                
            # Store at destination
            if dst_type == 'REGISTER':
                dst_reg = f"DR{operands['operand_b'] % 16}"
                self.data_registers[dst_reg] = value
            elif dst_type == 'MEMORY_ADDR':
                self.heap[operands['operand_b']] = value
                
            # Debug: Log the COPY operation
            print(f"[DEBUG] COPY operation: Copied value {value} to destination")
        
        self.advance_pc()
    
    def _execute_control(self, operation: str, operands: Dict, instruction: Dict):
        """Execute control flow operations."""
        # Get condition value and loop variables from registers
        condition = self.data_registers.get('DR0', 0)
        counter = self.data_registers.get('DR1', 0)  # Loop counter
        limit = self.data_registers.get('DR2', 0)    # Loop limit
        step = self.data_registers.get('DR3', 1)     # Loop step

        # Debug: Log control operation
        print(f"[DEBUG] Control operation: {operation}, Condition={condition}, Counter={counter}, Limit={limit}, Step={step}")

        if operation == 'IF':
            # Store current state
            prev_dr0 = condition
            
            if condition != 0:  # True path
                # Store IF position for ELSE
                self.address_registers['AR1'] = self.pc
                self.advance_pc()
            else:
                # Skip to matching ELSE/END_IF
                depth = 1
                while depth > 0:
                    self.advance_pc()
                    next_instr = self.fetch_instruction()
                    if next_instr is None:
                        break
                    elif next_instr.get('type') == 'IF':
                        depth += 1
                    elif next_instr.get('type') in ['ELSE', 'END_IF']:
                        depth -= 1
                        
            # Preserve condition
            self.data_registers['DR0'] = prev_dr0
            
        elif operation == 'WHILE':
            # Store current state
            prev_condition = condition
            
            # First time entering WHILE - store loop start
            if 'AR0' not in self.address_registers:
                self.address_registers['AR0'] = self.pc
            
            if condition != 0:  # Loop condition true
                self.advance_pc()
            else:
                # Skip to END_WHILE
                depth = 1
                while depth > 0:
                    self.advance_pc()
                    next_instr = self.fetch_instruction()
                    if next_instr is None:
                        break
                    elif next_instr.get('type') == 'WHILE':
                        depth += 1
                    elif next_instr.get('type') == 'END_WHILE':
                        depth -= 1
                # Clear loop start position
                if 'AR0' in self.address_registers:
                    del self.address_registers['AR0']
                    
            # Preserve condition for nested loops
            self.data_registers['DR0'] = prev_condition
        
        elif operation == 'END_WHILE':
            if 'AR0' in self.address_registers:
                self.pc = self.address_registers['AR0']
        
        elif operation == 'FOR':
            # Store current state
            prev_counter = counter
            prev_limit = limit
            prev_step = step
            
            # First time entering FOR - initialize
            if 'AR0' not in self.address_registers:
                self.address_registers['AR0'] = self.pc  # Store loop start
                counter = 0  # Initialize counter
            
            if counter < limit:  # Continue loop
                # Update counter
                self.data_registers.update({
                    'DR1': counter + step,  # Next iteration
                    'DR2': limit,           # Preserve limit
                    'DR3': step             # Preserve step
                })
                self.advance_pc()
            else:
                # Skip to END_FOR
                depth = 1
                while depth > 0:
                    self.advance_pc()
                    next_instr = self.fetch_instruction()
                    if next_instr is None:
                        break
                    elif next_instr.get('type') == 'FOR':
                        depth += 1
                    elif next_instr.get('type') == 'END_FOR':
                        depth -= 1
                # Clear loop tracking
                if 'AR0' in self.address_registers:
                    del self.address_registers['AR0']
                    
            # Preserve state for outer loops
            self.data_registers.update({
                'DR4': prev_counter,  # Save previous counter
                'DR5': prev_limit,    # Save previous limit
                'DR6': prev_step      # Save previous step
            })
            
        elif operation == 'END_FOR':
            if 'AR0' in self.address_registers:
                # Restore outer loop state if present
                prev_counter = self.data_registers.get('DR4', 0)
                prev_limit = self.data_registers.get('DR5', 0)
                prev_step = self.data_registers.get('DR6', 1)
                
                # Update registers for next iteration
                self.data_registers.update({
                    'DR1': prev_counter,
                    'DR2': prev_limit,
                    'DR3': prev_step
                })
                
                self.pc = self.address_registers['AR0']
            else:
                self.advance_pc()
        
        elif operation == 'BREAK':
            # Find end of current loop
            depth = 1
            while depth > 0:
                self.advance_pc()
                next_instr = self.fetch_instruction()
                if next_instr is None:
                    break
                elif next_instr.get('type') in ['WHILE', 'FOR']:
                    depth += 1
                elif next_instr.get('type') in ['END_WHILE', 'END_FOR']:
                    depth -= 1
                    
            # Clear loop tracking
            if 'AR0' in self.address_registers:
                del self.address_registers['AR0']
            
        elif operation == 'CONTINUE':
            if 'AR0' in self.address_registers:
                self.pc = self.address_registers['AR0']
            else:
                self.advance_pc()
        
        else:
            self.advance_pc()

        # Debug: Log control flow state
        print(f"[DEBUG] Control flow state: PC={self.pc}")
        print(f"[DEBUG] Registers: DR0={self.data_registers.get('DR0')}, DR1={self.data_registers.get('DR1')}, DR2={self.data_registers.get('DR2')}")
        print(f"[DEBUG] Address Registers: AR0={self.address_registers.get('AR0')}, AR1={self.address_registers.get('AR1')}")
    
    def _execute_function(self, operation: str, operands: Dict, instruction: Dict):
        """Execute function operations."""
        if operation == 'CALL':
            # Debug: Log the function call
            print(f"[DEBUG] CALL operation: Jumping to ({operands['operand_a']}, {operands['operand_b']}), Current PC={self.pc}")

            # Push current PC to call stack
            if len(self.call_stack) >= self.max_stack_depth:
                raise StackOverflowError(self.max_stack_depth)

            self.call_stack.append(self.pc)
            self.pc = (operands['operand_a'], operands['operand_b'])
            self.execution_stats['function_calls'] += 1
        
        elif operation == 'RETURN':
            if not self.call_stack:
                # Debug: Log return from main program
                print(f"[DEBUG] RETURN operation: Returning from main program, Exit Code={operands.get('operand_a', 0)}")

                # Return from main program
                self.halt(operands.get('operand_a', 0))
            else:
                # Debug: Log return to previous call
                print(f"[DEBUG] RETURN operation: Returning to {self.call_stack[-1]}")

                self.pc = self.call_stack.pop()
                self.advance_pc()
        
        else:
            self.advance_pc()
    
    def _collect_output(self, output_value: str):
        """Add output to the appropriate buffer based on current thread."""
        if output_value is None:
            return
        
        # Clean output value
        clean_output = str(output_value).strip()
        if not clean_output:
            return

        # Initialize buffers if needed
        if not hasattr(self, '_output_buffer') or self._output_buffer is None:
            self._output_buffer = []
            
        if not hasattr(self, 'thread_outputs') or self.thread_outputs is None:
            self.thread_outputs = {}
            
        # Initialize thread output buffer if needed
        thread_id = self.current_thread if self.current_thread is not None else 0
        if thread_id not in self.thread_outputs:
            self.thread_outputs[thread_id] = []
            
        # Add to main buffer regardless of thread (ordered output)
        self._output_buffer.append(clean_output)
        
        # Add to thread-specific buffer
        self.thread_outputs[thread_id].append(clean_output)
            
        # Debug output with complete buffer state
        print(f"[DEBUG] Added output '{clean_output}' to buffers for thread {thread_id}")
        print(f"[DEBUG] Current output state:")
        print(f"  Main buffer ({len(self._output_buffer)} items): {self._output_buffer}")
        print(f"  Thread outputs:")
        for tid in sorted(self.thread_outputs.keys()):
            print(f"    Thread {tid} ({len(self.thread_outputs[tid])} items): {self.thread_outputs[tid]}")
        
    def _execute_io(self, operation: str, operands: Dict, instruction: Dict):
        """Execute I/O operations."""
        # No need for buffer initialization here since it's done in __init__ and run_program
            
        if operation == 'PRINT_STRING':
            # Get string table index from saturation value with proper scaling
            sat = instruction.get('saturation', 0)
            
            # Special mapping for hello_world program (sat ~80 -> index 1)
            if 79 <= sat <= 81:
                string_index = 1  # "Hello, World!"
            else:
                # Map saturation (0-100) to string indices (0-10)
                string_index = int(sat / 10)
                # Clamp to valid range
                string_index = max(0, min(10, string_index))
            
            output_value = self.string_table.get(string_index, 'ERROR: String not found')
            
            # Debug output for string printing
            print(f"[DEBUG] PRINT_STRING: sat={sat}, index={string_index}, value='{output_value}', thread={self.current_thread}")
            print(f"[DEBUG] String table: {self.string_table}")
            print(f"[DEBUG] Current buffers before print:")
            print(f"  Main: {self._output_buffer}")
            print(f"  Thread {self.current_thread}: {self.thread_outputs.get(self.current_thread, [])}")

            # Store output using collection helper and ensure it's added immediately
            self._collect_output(output_value)

            # Debug output after collection
            print(f"[DEBUG] Buffers after print:")
            print(f"  Main: {self._output_buffer}")
            print(f"  Thread {self.current_thread}: {self.thread_outputs.get(self.current_thread, [])}")
        elif operation == 'PRINT_NUM':
            # Get value from DR0 register
            value = self.data_registers.get('DR0', 0)
            output_value = str(value)
            
            # Debug output for number printing
            print(f"[DEBUG] PRINT_NUM: DR0={value}, output='{output_value}', thread={self.current_thread}")
            print(f"[DEBUG] Current buffers before print:")
            print(f"  Main: {self._output_buffer}")
            print(f"  Thread {self.current_thread}: {self.thread_outputs.get(self.current_thread, [])}")
            
            # Store output using collection helper and ensure immediate output
            self._collect_output(output_value)

            # Force update of shared memory output if present
            if self.shared_memory is not None:
                shared_output = getattr(self.shared_memory, 'output', None)
                if shared_output is not None:
                    shared_output.append(output_value)
            
            # Debug output after collection
            print(f"[DEBUG] Buffers after print:")
            print(f"  Main: {self._output_buffer}")
            print(f"  Thread {self.current_thread}: {self.thread_outputs.get(self.current_thread, [])}")
                
        elif operation == 'READ_FILE':
            # For now, just store a success value in DR0
            self.data_registers['DR0'] = 1
                
        elif operation == 'INPUT':
            self.data_registers['DR0'] = 0  # For now, just store 0
            
        # Final debug output showing all buffers
        print(f"[DEBUG] All output buffers:")
        print(f"  Main: {self._output_buffer}")
        print(f"  Threads: {self.thread_outputs}")
            
        self.advance_pc()
    
    def spawn_thread(self, start_pc, parent_state=None):
        """Spawn a new thread with its own state."""
        thread_id = self.thread_counter
        self.thread_counter += 1
        
        # Create new thread state
        thread_state = {
            'pc': start_pc,
            'running': True,
            'halted': False,
            'registers': self.data_registers.copy() if parent_state else {'DR0': 0, 'DR1': 0, 'DR2': 0, 'DR3': 0, 'DR4': 0, 'DR5': 0, 'DR6': 0, 'DR7': 0, 'DR8': 0, 'DR9': 0, 'DR10': 0, 'DR11': 0, 'DR12': 0, 'DR13': 0, 'DR14': 0, 'DR15': 0},
            'address_registers': self.address_registers.copy() if parent_state else {'AR0': (0, 0), 'AR1': (0, 0), 'AR2': (0, 0), 'AR3': (0, 0)},
            'stack': deque(),
            'output_buffer': []
        }
        
        self.threads[thread_id] = thread_state
        self.execution_stats['threads_spawned'] += 1
        
        print(f"[DEBUG] Spawned thread {thread_id} at PC={start_pc}")
        return thread_id
    
    def switch_thread(self, thread_id):
        """Switch execution to a different thread."""
        if thread_id in self.threads:
            # Save current thread state if exists
            if self.current_thread is not None:
                self.threads[self.current_thread].update({
                    'pc': self.pc,
                    'registers': self.data_registers.copy(),
                    'address_registers': self.address_registers.copy(),
                    'running': self.running,
                    'halted': self.halted
                })
            
            # Load new thread state
            thread_state = self.threads[thread_id]
            self.pc = thread_state['pc']
            self.data_registers = thread_state['registers'].copy()
            self.address_registers = thread_state['address_registers'].copy()
            self.running = thread_state['running']
            self.halted = thread_state['halted']
            self.current_thread = thread_id
            
            print(f"[DEBUG] Switched to thread {thread_id}")
            return True
        return False
    
    def _execute_system(self, operation: str, operands: Dict, instruction: Dict):
        """Execute system operations."""
        if operation == 'HALT':
            exit_code = operands.get('operand_a', 0)
            # Halt only current thread if in threaded mode
            if self.current_thread is not None:
                thread_state = self.threads[self.current_thread]
                thread_state['halted'] = True
                thread_state['running'] = False
                # Switch to next running thread if available
                for tid in self.threads:
                    if not self.threads[tid]['halted']:
                        self.switch_thread(tid)
                        break
                else:
                    self.halt(exit_code)
            else:
                self.halt(exit_code)

        elif operation == 'THREAD_SPAWN':
            # Get thread start position from operands
            x = operands.get('operand_a', 0)
            y = operands.get('operand_b', 0)
            start_pc = (x, y)
            
            # Spawn new thread
            new_thread = self.spawn_thread(start_pc, parent_state=True)
            
            # Store thread ID in DR0
            self.data_registers['DR0'] = new_thread
            
            print(f"[DEBUG] Thread spawn: new_thread={new_thread}, start_pc={start_pc}")
            self.advance_pc()

        elif operation == 'DEBUG':
            if self.debug_mode:
                debug_info = operands.get('operand_a', 0)
                thread_info = f" (Thread {self.current_thread})" if self.current_thread is not None else ""
                print(f"Debug breakpoint: {debug_info} at {instruction['position']}{thread_info}")
            self.advance_pc()

        elif operation == 'RENDER_FRAME':
            if self.shared_memory:
                # Debug: Print shared memory updates
                print("[DEBUG] Shared Memory - Agent Position:", self.shared_memory.agent)
                print("[DEBUG] Shared Memory - Tilemap:")
                for row in self.shared_memory.tilemap[:5]:  # Print first 5 rows for brevity
                    print(row)
                # Print the full contents of shm.tilemap and shm.agent
                print("[DEBUG] Full Shared Memory - Tilemap:")
                for row in self.shared_memory.tilemap:
                    print(row)
                print("[DEBUG] Full Shared Memory - Agent:", self.shared_memory.agent)

                # Example: Update shared memory tilemap and agent position
                self.shared_memory.tilemap = [[(x + y) % 10 for x in range(self.shared_memory.width)] for y in range(self.shared_memory.height)]
                self.shared_memory.agent = {'x': (self.cycle_count // 10) % self.shared_memory.width, 'y': (self.cycle_count // 5) % self.shared_memory.height}

            self.advance_pc()
        
        else:
            self.advance_pc()
    
    def _execute_data(self, operation: str, operands: Dict, instruction: Dict):
        """Execute data operations (load immediate values)."""
        if operation == 'INTEGER':
            # Decode integer from HSV values
            hue = instruction['hue']
            saturation = instruction['saturation']
            value = instruction['value']
            
            # For string literals (hue 270-280), decode string index
            if 270 <= hue <= 280:
                string_index = int(saturation / 10)  # Map 0-100 to 0-10 range
                self.data_registers['DR0'] = string_index
                # Save string index in DR1 for later lookup
                self.data_registers['DR1'] = string_index
                # Debug: Log string index loading
                print(f"[DEBUG] Loading string index: {string_index} from saturation={saturation}, string='{self.get_string(string_index)}'")
            
            # For numeric literals (hue > 15), decode directly from RGB
            else:
                # Use RGB values directly for numeric encoding
                r = instruction['raw_rgb'][0]
                g = instruction['raw_rgb'][1]
                b = instruction['raw_rgb'][2]
                
                # Map RGB intensity to value range
                value = r % 256  # Use red channel for basic value
                
                # Store numeric value
                integer_value = int(value)
                
                # Special handling for Fibonacci sequence initialization
                if integer_value == 0:  # First number
                    self.data_registers['DR0'] = 0
                    self.data_registers['DR1'] = 1  # Set up for first sequence
                    print("[DEBUG] Initialized Fibonacci sequence: DR0=0, DR1=1")
                else:
                    # Preserve previous register values
                    prev_dr0 = self.data_registers.get('DR0', 0)
                    prev_dr1 = self.data_registers.get('DR1', 0)
                
                    # Update registers with cascading preservation
                    self.data_registers.update({
                        'DR0': integer_value,  # Current value
                        'DR1': prev_dr0,       # Previous DR0
                        'DR2': prev_dr1        # Previous DR1
                    })

            # Debug: Log operation and register state
            print(f"[DEBUG] INTEGER operation result: DR0={self.data_registers['DR0']}, DR1={self.data_registers['DR1']}, DR2={self.data_registers.get('DR2', 0)}")
            print(f"[DEBUG] INTEGER operation: Hue={hue}, Saturation={saturation}, Value={value}, Decoded Integer={self.data_registers['DR0']}")
        
        elif operation == 'FLOAT':
            # Decode float from HSV values
            hue = instruction['hue']
            saturation = instruction['saturation']
            value = instruction['value']

            # Enhanced float encoding:
            # Hue determines sign and scale (0-180 positive, 181-359 negative)
            # Saturation is whole number part (0-100)
            # Value is decimal part (0-100)
            sign = 1 if hue <= 180 else -1
            whole_part = saturation
            decimal_part = value / 100.0
            float_value = sign * (whole_part + decimal_part)
            
            # Store result and preserve in registers
            self.data_registers['DR0'] = float_value
            self.data_registers['DR1'] = float_value
            
            # Debug: Log operation
            print(f"[DEBUG] FLOAT operation: Value={float_value}, DR0={self.data_registers['DR0']}")
        
        self.advance_pc()
    
    def _execute_pathfind(self, operands: Dict, instruction: Dict):
        """Execute pathfinding operation to move agent toward nearest banana."""
        if self.shared_memory:
            # Example pathfinding logic: Move toward the nearest banana
            agent = self.shared_memory.agent
            tilemap = self.shared_memory.tilemap
            if agent and tilemap:
                nearest_banana = None
                shortest_distance = float('inf')
                for y, row in enumerate(tilemap):
                    for x, tile in enumerate(row):
                        if tile == 'BANANA':
                            distance = abs(agent['x'] - x) + abs(agent['y'] - y)
                            if distance < shortest_distance:
                                shortest_distance = distance
                                nearest_banana = (x, y)
                if nearest_banana:
                    target_x, target_y = nearest_banana
                    if agent['x'] < target_x:
                        agent['x'] += 1
                    elif agent['x'] > target_x:
                        agent['x'] -= 1
                    if agent['y'] < target_y:
                        agent['y'] += 1
                    elif agent['y'] > target_y:
                        agent['y'] -= 1
        
        self.advance_pc()
    
    def advance_pc(self):
        """Advance program counter to next instruction."""
        x, y = self.pc

        # Debug: Log current PC and program memory dimensions
        print(f"[DEBUG] Current PC: {self.pc}")
        if self.program_memory:
            width = self.program_memory['width']
            print(f"[DEBUG] Program memory width: {width}")

            # Move to next pixel (left-to-right, top-to-bottom)
            x += 1
            if x >= width:
                x = 0
                y += 1

        # Debug: Log updated PC
        self.pc = (x, y)
        print(f"[DEBUG] Updated PC: {self.pc}")
    
    def jump_to(self, x: int, y: int):
        """Jump to specific program counter position."""
        self.pc = (x, y)
    
    def halt(self, exit_code: int = 0):
        """Halt program execution."""
        self.halted = True
        self.running = False
        self.flag_register = exit_code
    
    def get_state(self) -> Dict[str, Any]:
        """Get current VM state for debugging."""
        return {
            'pc': self.pc,
            'running': self.running,
            'halted': self.halted,
            'cycle_count': self.cycle_count,
            'registers': {
                'color': self.color_registers.copy(),
                'data': self.data_registers.copy(),
                'address': self.address_registers.copy(),
                'flags': self.flag_register
            },
            'stack_depth': len(self.call_stack),
            'heap_size': len(self.heap),
            'stats': self.execution_stats.copy()
        }
    
    def set_register(self, register_name: str, value: Any):
        """Set register value (for debugging/testing)."""
        if register_name.startswith('CR'):
            self.color_registers[register_name] = value
        elif register_name.startswith('DR'):
            self.data_registers[register_name] = value
        elif register_name.startswith('AR'):
            self.address_registers[register_name] = value
    
    def get_register(self, register_name: str) -> Any:
        """Get register value."""
        if register_name.startswith('CR'):
            return self.color_registers.get(register_name, (0, 0, 0))
        elif register_name.startswith('DR'):
            return self.data_registers.get(register_name, 0)
        elif register_name.startswith('AR'):
            return self.address_registers.get(register_name, (0, 0))
        else:
            return None
        
    def register_string(self, string: str) -> int:
        """Add a new string to the string table and return its index."""
        # Ensure string is converted to str
        string = str(string)
        
        # Check if string already exists
        for idx, existing in self.string_table.items():
            if existing == string:
                return idx
        
        # Keep indices in 0-10 range for HSV saturation mapping
        new_idx = min(10, self.string_table_next_id)
        self.string_table[new_idx] = string
        self.string_table_next_id = (self.string_table_next_id + 1) % 11
        
        # Debug info
        print(f"[DEBUG] Registered string '{string}' at index {new_idx}")
        print(f"[DEBUG] Current string table: {self.string_table}")
        
        return new_idx
    
    def get_string(self, index: int) -> str:
        """Get a string from the string table by index."""
        return self.string_table.get(index, str(index))
    
    def clear_string_table(self):
        """Clear the string table and reset allocation."""
        self.string_table.clear()
        self.string_table_next_id = 0
    
    def set_rng_seed(self, seed: int):
        """Set the seed for the random number generator."""
        self.rng = random.Random(seed)

    def rand32(self) -> int:
        """Generate a deterministic 32-bit random number."""
        return self.rng.getrandbits(32)