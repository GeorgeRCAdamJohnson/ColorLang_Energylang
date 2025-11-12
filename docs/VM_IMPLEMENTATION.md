# ColorLang Virtual Machine Implementation Guide

## Overview
This comprehensive guide provides detailed implementation specifications for the ColorLang Virtual Machine (ColorVM). It covers architecture, execution model, instruction handling, and integration patterns discovered through practical development.

## Virtual Machine Architecture

### Core Components

#### VM State Structure
```python
class ColorVM:
    def __init__(self, shared_memory=None):
        # Core execution state
        self.registers = [0] * 16           # General-purpose registers R0-R15
        self.memory = [0] * 1024           # Addressable memory locations
        self.pc = 0                        # Program counter (instruction index)
        self.output = []                   # Accumulated program output
        self.cycles = 0                    # Execution cycle counter
        
        # Program execution
        self.program = []                  # Loaded instruction sequence
        self.running = False               # Execution state flag
        
        # Host integration
        self.shared_memory = shared_memory # Optional host communication
        
        # Debug support
        self.debug_mode = False            # Enable debug output
        self.instruction_trace = []        # Execution history
```

#### Register Architecture
```python
Register Layout:
  R0-R3:   General computation registers (frequently used)
  R4-R7:   Address calculation registers  
  R8-R11:  Temporary storage registers
  R12-R15: System/reserved registers
  
Register Access Patterns:
  - R0: Default accumulator for arithmetic operations
  - R1: Secondary operand register
  - R2: Memory address register for LOAD/STORE
  - R3: Loop counter register
  - R15: Reserved for system use (return addresses, flags)
```

#### Memory Model
```python
Memory Organization:
  Addresses 0-255:    Program data area (constants, variables)
  Addresses 256-511:  Stack area (function calls, local variables)  
  Addresses 512-767:  Heap area (dynamic allocation)
  Addresses 768-1023: System area (I/O buffers, temporary storage)

Memory Access Validation:
  - All memory accesses bounds-checked (0 ≤ address < 1024)
  - Invalid access raises MemoryAccessError
  - Automatic initialization to zero
```

## Instruction Execution Cycle

### Fetch-Decode-Execute Pipeline

#### 1. Instruction Fetch
```python
def fetch_instruction(self) -> Dict[str, Any]:
    """Fetch next instruction from program memory."""
    if self.pc >= len(self.program):
        return {"operation": "HALT", "operands": []}
    
    instruction = self.program[self.pc]
    if self.debug_mode:
        print(f"FETCH: PC={self.pc}, Instruction={instruction}")
    
    return instruction
```

#### 2. Instruction Decode
```python
def decode_instruction(self, instruction: Dict[str, Any]) -> Tuple[str, List[int]]:
    """Decode instruction into operation and operands."""
    operation = instruction.get("operation", "NOP")
    operands = instruction.get("operands", [])
    
    # Validate instruction format
    if not self._validate_instruction(operation, operands):
        raise InvalidInstructionError(f"Invalid instruction: {operation}")
    
    return operation, operands
```

#### 3. Instruction Execute
```python
def execute_instruction(self, operation: str, operands: List[int]) -> bool:
    """Execute decoded instruction. Returns True to continue, False to halt."""
    
    # Increment cycle counter
    self.cycles += 1
    
    if self.debug_mode:
        print(f"EXECUTE: {operation} {operands} (Cycle {self.cycles})")
    
    # Dispatch to specific execution method
    method_name = f"_execute_{operation.lower()}"
    if hasattr(self, method_name):
        return getattr(self, method_name)(*operands)
    else:
        raise InvalidInstructionError(f"Unknown operation: {operation}")
```

### Instruction Implementation Patterns

#### Arithmetic Instructions
```python
def _execute_add(self, reg1: int, reg2: int, dest_reg: int) -> bool:
    """ADD: dest_reg = R[reg1] + R[reg2]"""
    self.registers[dest_reg] = self.registers[reg1] + self.registers[reg2]
    self.pc += 1
    return True

def _execute_sub(self, reg1: int, reg2: int, dest_reg: int) -> bool:
    """SUB: dest_reg = R[reg1] - R[reg2]"""  
    self.registers[dest_reg] = self.registers[reg1] - self.registers[reg2]
    self.pc += 1
    return True

def _execute_mul(self, reg1: int, reg2: int, dest_reg: int) -> bool:
    """MUL: dest_reg = R[reg1] * R[reg2]"""
    self.registers[dest_reg] = self.registers[reg1] * self.registers[reg2]
    self.pc += 1
    return True

def _execute_div(self, reg1: int, reg2: int, dest_reg: int) -> bool:
    """DIV: dest_reg = R[reg1] / R[reg2]"""
    if self.registers[reg2] == 0:
        raise VMExecutionError("Division by zero")
    self.registers[dest_reg] = self.registers[reg1] // self.registers[reg2]
    self.pc += 1
    return True
```

#### Memory Instructions
```python
def _execute_load(self, address: int, dest_reg: int) -> bool:
    """LOAD: dest_reg = Memory[address]"""
    if not (0 <= address < 1024):
        raise VMExecutionError(f"Invalid memory address: {address}")
    self.registers[dest_reg] = self.memory[address]
    self.pc += 1
    return True

def _execute_store(self, src_reg: int, address: int) -> bool:
    """STORE: Memory[address] = R[src_reg]"""
    if not (0 <= address < 1024):
        raise VMExecutionError(f"Invalid memory address: {address}")
    self.memory[address] = self.registers[src_reg]
    self.pc += 1
    return True

def _execute_copy(self, src_reg: int, dest_reg: int) -> bool:
    """COPY: dest_reg = R[src_reg]"""
    self.registers[dest_reg] = self.registers[src_reg]
    self.pc += 1
    return True
```

#### Control Flow Instructions
```python
def _execute_jmp(self, target_address: int) -> bool:
    """JMP: Unconditional jump to target_address"""
    if not (0 <= target_address < len(self.program)):
        raise VMExecutionError(f"Invalid jump address: {target_address}")
    self.pc = target_address
    return True

def _execute_jz(self, test_reg: int, target_address: int) -> bool:
    """JZ: Jump to target_address if R[test_reg] == 0"""
    if self.registers[test_reg] == 0:
        self.pc = target_address
    else:
        self.pc += 1
    return True

def _execute_jnz(self, test_reg: int, target_address: int) -> bool:
    """JNZ: Jump to target_address if R[test_reg] != 0"""
    if self.registers[test_reg] != 0:
        self.pc = target_address
    else:
        self.pc += 1
    return True
```

#### I/O Instructions
```python
def _execute_print(self, src_reg: int) -> bool:
    """PRINT: Output R[src_reg] value"""
    value = self.registers[src_reg]
    self.output.append(str(value))
    if self.debug_mode:
        print(f"OUTPUT: {value}")
    self.pc += 1
    return True

def _execute_halt(self) -> bool:
    """HALT: Stop program execution"""
    if self.debug_mode:
        print("HALT: Program terminated")
    return False  # Signal to stop execution
```

#### Data Type Instructions
```python
def _execute_integer(self, value: int, dest_reg: int) -> bool:
    """INTEGER: Load immediate integer value into register"""
    self.registers[dest_reg] = value
    self.pc += 1
    return True

def _execute_float(self, value: float, dest_reg: int) -> bool:
    """FLOAT: Load immediate float value into register (converted to int)"""
    self.registers[dest_reg] = int(value)  # Current VM uses integer registers
    self.pc += 1
    return True
```

## System Call Interface

### Syscall Architecture
The ColorLang VM integrates with host applications through a syscall interface that enables communication with external systems like rendering engines, AI frameworks, and I/O devices.

#### Syscall Implementation
```python
def _execute_render_frame(self) -> bool:
    """RENDER_FRAME: Trigger host rendering system"""
    if self.shared_memory:
        # Update shared memory with current state
        if hasattr(self.shared_memory, 'agent'):
            # Update agent position from registers (example)
            self.shared_memory.agent.x = self.registers[0] % 50  # Agent X position
            self.shared_memory.agent.y = self.registers[1] % 20  # Agent Y position
        
        # Call host rendering
        if hasattr(self.shared_memory, 'handle_render'):
            self.shared_memory.handle_render()
    
    self.pc += 1
    return True

def _execute_get_time(self, dest_reg: int) -> bool:
    """GET_TIME: Get current time in milliseconds"""
    import time
    current_time = int(time.time() * 1000) % 65536  # Fit in register
    self.registers[dest_reg] = current_time
    self.pc += 1
    return True

def _execute_pathfind(self, target_x: int, target_y: int) -> bool:
    """PATHFIND: AI pathfinding operation"""
    if self.shared_memory and hasattr(self.shared_memory, 'tilemap'):
        # Simple pathfinding: move towards target
        current_x = self.registers[0]
        current_y = self.registers[1]
        
        # Calculate direction to target
        dx = target_x - current_x
        dy = target_y - current_y
        
        # Move one step towards target
        if abs(dx) > abs(dy):
            self.registers[0] += 1 if dx > 0 else -1
        elif dy != 0:
            self.registers[1] += 1 if dy > 0 else -1
        
        # Update shared memory
        if hasattr(self.shared_memory, 'agent'):
            self.shared_memory.agent.x = self.registers[0]
            self.shared_memory.agent.y = self.registers[1]
    
    self.pc += 1
    return True

def _execute_move(self, direction: int) -> bool:
    """MOVE: Move agent in specified direction"""
    # Direction: 0=right, 1=left, 2=up, 3=down
    if direction == 0:  # Right
        self.registers[0] = (self.registers[0] + 1) % 50
    elif direction == 1:  # Left  
        self.registers[0] = (self.registers[0] - 1) % 50
    elif direction == 2:  # Up
        self.registers[1] = max(0, self.registers[1] - 1)
    elif direction == 3:  # Down
        self.registers[1] = min(19, self.registers[1] + 1)
    
    # Update shared memory if available
    if self.shared_memory and hasattr(self.shared_memory, 'agent'):
        self.shared_memory.agent.x = self.registers[0]
        self.shared_memory.agent.y = self.registers[1]
    
    self.pc += 1
    return True
```

## Shared Memory Integration

### Shared Memory Architecture
ColorLang programs communicate with host applications through a structured shared memory interface that enables real-time data exchange.

#### Shared Memory Structure
```python
class SharedMemory:
    """Shared memory interface for VM-host communication."""
    
    def __init__(self):
        # Environment state
        self.header = SimpleNamespace()
        self.header.seed = 42
        self.header.width = 50
        self.header.height = 20
        self.header.frame_count = 0
        
        # Game world state  
        self.tilemap = np.zeros((50, 20), dtype=int)
        
        # Agent state
        self.agent = SimpleNamespace()
        self.agent.x = 25.0
        self.agent.y = 10.0
        self.agent.direction = 0
        self.agent.health = 100
        self.agent.score = 0
        
        # AI cognition state
        self.cognition = SimpleNamespace()
        self.cognition.emotion = 0.5
        self.cognition.action_intent = 0.0
        self.cognition.memory_recall = 0.0
        self.cognition.social_cue = 0.0
        self.cognition.goal_evaluation = 0.0
        
        # Communication
        self.mailbox = {}
        self.framebuffer = None
```

#### VM-Host Communication Protocol
```python
def update_shared_memory(self):
    """Update shared memory with current VM state."""
    if not self.shared_memory:
        return
    
    # Update frame count
    self.shared_memory.header.frame_count = self.cycles
    
    # Update agent state from registers
    self.shared_memory.agent.x = float(self.registers[0])
    self.shared_memory.agent.y = float(self.registers[1])
    self.shared_memory.agent.score = self.registers[2]
    
    # Update cognition from memory locations
    if len(self.memory) > 100:
        self.shared_memory.cognition.emotion = self.memory[100] / 100.0
        self.shared_memory.cognition.action_intent = self.memory[101] / 100.0
        self.shared_memory.cognition.memory_recall = self.memory[102] / 100.0
        self.shared_memory.cognition.social_cue = self.memory[103] / 100.0
        self.shared_memory.cognition.goal_evaluation = self.memory[104] / 100.0

def handle_host_message(self, message_type: str, data: Any):
    """Handle messages from host application."""
    if message_type == "UPDATE_TILEMAP":
        # Host updated the environment
        if hasattr(data, 'tilemap') and self.shared_memory:
            self.shared_memory.tilemap = data.tilemap
    
    elif message_type == "AGENT_INPUT":
        # Host providing input (e.g., user controls)
        if 'direction' in data:
            self.registers[15] = data['direction']  # Store in system register
```

## Performance Optimization

### Execution Optimization Strategies

#### Instruction Caching
```python
class InstructionCache:
    """Cache for frequently executed instructions."""
    
    def __init__(self, max_size: int = 256):
        self.cache = {}
        self.max_size = max_size
        self.hit_count = 0
        self.miss_count = 0
    
    def get_instruction(self, pc: int, program: List[Dict]) -> Dict[str, Any]:
        """Get instruction with caching."""
        if pc in self.cache:
            self.hit_count += 1
            return self.cache[pc]
        
        if pc < len(program):
            instruction = program[pc]
            if len(self.cache) < self.max_size:
                self.cache[pc] = instruction
            self.miss_count += 1
            return instruction
        
        return {"operation": "HALT", "operands": []}
```

#### Branch Prediction
```python
class BranchPredictor:
    """Simple branch prediction for control flow optimization."""
    
    def __init__(self):
        self.branch_history = {}
        self.prediction_accuracy = 0
        self.total_predictions = 0
    
    def predict_branch(self, pc: int, condition: bool) -> bool:
        """Predict whether branch will be taken."""
        history = self.branch_history.get(pc, [])
        
        if len(history) < 2:
            prediction = condition  # No history, use actual condition
        else:
            # Simple predictor: majority of recent outcomes
            prediction = sum(history[-4:]) > len(history[-4:]) / 2
        
        # Update history
        history.append(condition)
        if len(history) > 8:  # Keep last 8 outcomes
            history.pop(0)
        self.branch_history[pc] = history
        
        # Track accuracy
        self.total_predictions += 1
        if prediction == condition:
            self.prediction_accuracy += 1
        
        return prediction
```

#### Register Allocation Optimization
```python
def optimize_register_usage(self, program: List[Dict]) -> List[Dict]:
    """Optimize register allocation for better cache locality."""
    
    # Analyze register usage patterns
    register_usage = {}
    for i, instruction in enumerate(program):
        op = instruction.get("operation", "")
        operands = instruction.get("operands", [])
        
        # Track register reads and writes
        if op in ["ADD", "SUB", "MUL", "DIV"]:
            # Arithmetic: reads reg1, reg2; writes dest_reg
            if len(operands) >= 3:
                register_usage[operands[0]] = register_usage.get(operands[0], 0) + 1  # read
                register_usage[operands[1]] = register_usage.get(operands[1], 0) + 1  # read
                register_usage[operands[2]] = register_usage.get(operands[2], 0) + 2  # write (higher weight)
    
    # Suggest register reassignment based on usage frequency
    sorted_registers = sorted(register_usage.items(), key=lambda x: x[1], reverse=True)
    
    # Map frequently used logical registers to R0-R3 (fastest access)
    register_map = {}
    for i, (logical_reg, usage_count) in enumerate(sorted_registers[:4]):
        register_map[logical_reg] = i
    
    return register_map
```

## Error Handling and Recovery

### Exception Hierarchy
```python
class VMExecutionError(Exception):
    """Base class for VM execution errors."""
    
    def __init__(self, message: str, pc: int = -1, instruction: str = ""):
        super().__init__(message)
        self.pc = pc
        self.instruction = instruction
        self.vm_state = None

class MemoryAccessError(VMExecutionError):
    """Invalid memory access error."""
    pass

class RegisterAccessError(VMExecutionError):
    """Invalid register access error."""
    pass

class InvalidInstructionError(VMExecutionError):
    """Unknown or malformed instruction error."""
    pass

class StackOverflowError(VMExecutionError):
    """Call stack overflow error."""
    pass
```

### Error Recovery Mechanisms
```python
def execute_with_recovery(self, program: List[Dict]) -> Dict[str, Any]:
    """Execute program with error recovery mechanisms."""
    
    try:
        return self.run_program(program)
    
    except MemoryAccessError as e:
        # Attempt to recover from memory errors
        if self.debug_mode:
            print(f"Memory access error at PC {e.pc}: {e}")
        
        # Reset to safe state and continue
        self.pc = min(self.pc + 1, len(program) - 1)
        return self.run_program_safe_mode(program)
    
    except InvalidInstructionError as e:
        # Skip invalid instructions
        if self.debug_mode:
            print(f"Invalid instruction at PC {e.pc}: {e}")
        
        self.pc += 1
        if self.pc < len(program):
            return self.execute_with_recovery(program)
        else:
            return self.get_execution_result()
    
    except Exception as e:
        # Unexpected error - safe shutdown
        print(f"Unexpected VM error: {e}")
        return {
            "output": self.output,
            "cycles": self.cycles,
            "error": str(e),
            "final_state": "ERROR"
        }

def get_vm_diagnostic_info(self) -> Dict[str, Any]:
    """Get comprehensive VM state for debugging."""
    return {
        "pc": self.pc,
        "registers": self.registers.copy(),
        "memory_sample": self.memory[:32],  # First 32 memory locations
        "output": self.output.copy(),
        "cycles": self.cycles,
        "program_length": len(self.program),
        "shared_memory_status": self.shared_memory is not None,
        "instruction_trace": self.instruction_trace[-10:]  # Last 10 instructions
    }
```

## Testing and Validation

### VM Test Suite
```python
def run_vm_test_suite():
    """Comprehensive test suite for VM functionality."""
    
    tests = [
        test_arithmetic_operations,
        test_memory_operations,
        test_control_flow,
        test_syscall_interface,
        test_error_handling,
        test_performance_benchmarks,
        test_shared_memory_integration
    ]
    
    results = {}
    for test in tests:
        try:
            result = test()
            results[test.__name__] = result
            print(f"✓ {test.__name__}: {result['status']}")
        except Exception as e:
            results[test.__name__] = {"status": "FAILED", "error": str(e)}
            print(f"✗ {test.__name__}: FAILED - {e}")
    
    return results

def test_arithmetic_operations():
    """Test arithmetic instruction implementations."""
    vm = ColorVM()
    
    # Test ADD instruction
    vm.registers[0] = 10
    vm.registers[1] = 20
    vm._execute_add(0, 1, 2)
    assert vm.registers[2] == 30, f"ADD failed: expected 30, got {vm.registers[2]}"
    
    # Test SUB instruction  
    vm.registers[0] = 30
    vm.registers[1] = 10
    vm._execute_sub(0, 1, 2)
    assert vm.registers[2] == 20, f"SUB failed: expected 20, got {vm.registers[2]}"
    
    # Test division by zero handling
    vm.registers[1] = 0
    try:
        vm._execute_div(0, 1, 2)
        assert False, "Division by zero should raise exception"
    except VMExecutionError:
        pass  # Expected behavior
    
    return {"status": "PASSED", "tests": 3}
```

## Integration Patterns

### Host Application Integration
```python
class ColorLangHost:
    """Example host application integrating ColorLang VM."""
    
    def __init__(self):
        self.shared_memory = SharedMemory()
        self.vm = ColorVM(shared_memory=self.shared_memory)
        self.frame_callbacks = []
    
    def load_and_run_program(self, program_path: str):
        """Load ColorLang program and execute with host integration."""
        
        # Load program from image
        parser = ColorParser()
        program = parser.parse_image(program_path)
        
        # Set up syscall handlers
        self.vm.syscall_handlers = {
            "RENDER_FRAME": self.handle_render_frame,
            "GET_TIME": self.handle_get_time,
            "USER_INPUT": self.handle_user_input
        }
        
        # Execute program
        result = self.vm.run_program(program)
        
        return result
    
    def handle_render_frame(self):
        """Handle RENDER_FRAME syscall from VM."""
        # Update display based on shared memory state
        frame_data = self.render_current_frame()
        
        # Notify registered callbacks
        for callback in self.frame_callbacks:
            callback(frame_data)
        
        return True
    
    def render_current_frame(self) -> Dict[str, Any]:
        """Render current frame based on shared memory state."""
        # Implementation would generate visual representation
        return {
            "agent_position": (self.shared_memory.agent.x, self.shared_memory.agent.y),
            "tilemap": self.shared_memory.tilemap.tolist(),
            "cognition": {
                "emotion": self.shared_memory.cognition.emotion,
                "action": self.shared_memory.cognition.action_intent
            }
        }
```

## Performance Metrics and Benchmarking

### Execution Metrics
```python
class VMPerformanceProfiler:
    """Performance profiling for ColorLang VM."""
    
    def __init__(self):
        self.instruction_counts = {}
        self.execution_times = {}
        self.memory_usage = []
        self.start_time = None
    
    def start_profiling(self):
        """Begin performance profiling."""
        import time
        self.start_time = time.perf_counter()
        self.instruction_counts.clear()
        self.execution_times.clear()
        self.memory_usage.clear()
    
    def record_instruction(self, operation: str, execution_time: float):
        """Record instruction execution metrics."""
        self.instruction_counts[operation] = self.instruction_counts.get(operation, 0) + 1
        self.execution_times[operation] = self.execution_times.get(operation, [])
        self.execution_times[operation].append(execution_time)
    
    def get_performance_report(self) -> Dict[str, Any]:
        """Generate comprehensive performance report."""
        total_time = time.perf_counter() - self.start_time if self.start_time else 0
        total_instructions = sum(self.instruction_counts.values())
        
        return {
            "total_execution_time": total_time,
            "total_instructions": total_instructions,
            "instructions_per_second": total_instructions / total_time if total_time > 0 else 0,
            "instruction_counts": self.instruction_counts,
            "average_instruction_time": {
                op: sum(times) / len(times) 
                for op, times in self.execution_times.items()
            },
            "memory_peak_usage": max(self.memory_usage) if self.memory_usage else 0
        }
```

---

This VM implementation guide provides the foundation for building robust, performant ColorLang virtual machines with proper error handling, optimization, and host integration capabilities. The architecture supports both simple programs and complex applications like the AI-driven platformer demo.