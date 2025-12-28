"""
EnergyLang Virtual Machine (VM) - Minimal Scaffold
Inspired by ColorLang VM architecture, for proof-of-concept and extensibility.
"""

from typing import Any, Dict, List, Optional

class EnergyLangVM:
    def __init__(self, debug: bool = False):
        # Registers and memory
        self.registers: Dict[str, Any] = {}
        self.stack: List[Any] = []
        self.heap: Dict[int, Any] = {}
        self.program_memory: Optional[List[Dict[str, Any]]] = None
        self.pc: int = 0  # Program counter (linear for minimal subset)
        self.running: bool = False
        self.halted: bool = False
        self.debug = debug
        self.output: List[str] = []
        self.execution_stats = {
            'instructions_executed': 0,
            'cycles_elapsed': 0
        }

    def load_program(self, program: List[Dict[str, Any]]):
        """Load a parsed EnergyLang program (list of instructions)."""
        self.program_memory = program
        self.pc = 0
        self.halted = False
        self.running = True
        self.output = []
        if self.debug:
            print(f"[DEBUG] Program loaded: {len(program)} instructions")

    def run(self):
        """Main fetch-decode-execute loop."""
        if not self.program_memory:
            raise RuntimeError("No program loaded.")
        self.running = True
        while self.running and not self.halted and self.pc < len(self.program_memory):
            instr = self.program_memory[self.pc]
            if self.debug:
                print(f"[DEBUG] PC={self.pc}, Instr={instr}")
            self.execute_instruction(instr)
            self.execution_stats['instructions_executed'] += 1
            self.pc += 1
        if self.debug:
            print(f"[DEBUG] Execution finished. Output: {self.output}")
        return {
            'output': self.output,
            'final_registers': self.registers.copy(),
            'execution_stats': self.execution_stats.copy()
        }

    def execute_instruction(self, instr: Dict[str, Any]):
        """Dispatch and execute a single instruction (to be implemented)."""
        op = instr.get('op')
        if op == 'PRINT':
            expr = instr.get('expr')
            value = self.eval_expr(expr)
            self.output.append(str(value))
        elif op == 'ASSIGN':
            var = instr.get('var')
            expr = instr.get('expr')
            value = self.eval_expr(expr)
            self.registers[var] = value
        elif op == 'HALT':
            self.halted = True
        else:
            raise NotImplementedError(f"Unknown instruction: {op}")

    def eval_expr(self, expr: str):
        # Only allow variable names, integers, +, -, *, /
        allowed = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_+-*/ ().')
        if not set(expr) <= allowed:
            raise ValueError("Invalid characters in expression")
        try:
            return eval(expr, {"__builtins__": None}, self.registers)
        except Exception as e:
            raise ValueError(f"Error evaluating expression '{expr}': {e}")

# Example usage (to be replaced with real parser and program):
if __name__ == "__main__":
    # Example: [{{'op': 'PRINT', 'value': 42}}, {{'op': 'HALT'}}]
    program = [
        {'op': 'PRINT', 'expr': '42'},
        {'op': 'HALT'}
    ]
    vm = EnergyLangVM(debug=True)
    vm.load_program(program)
    result = vm.run()
    print(result)


# --- Benchmarking function for DB integration ---
import time
import os
from energy_lang.interpreter.energylang_parser import parse_energylang_source

def run_matrix_multiply_benchmark():
    """
    Loads and runs the demo_matrix_multiply.energylang program, measures execution time, and returns stats for DB.
    Returns: dict with throughput_ops_per_sec, latency_ms, notes
    """
    demo_path = os.path.join(os.path.dirname(__file__), 'demo_matrix_multiply.energylang')
    with open(demo_path, 'r') as f:
        source = f.read()
    instructions = parse_energylang_source(source)
    # Execute the demo program many times to create a measurable workload
    ITERATIONS = 1000
    vm = EnergyLangVM(debug=False)
    start = time.perf_counter()
    outputs = []
    for i in range(ITERATIONS):
        vm.load_program(instructions)
        result = vm.run()
        # Collect output from a small number of runs for diagnostics (avoid huge accumulation)
        if i < 5:
            outputs.extend(result.get('output', []))
    end = time.perf_counter()
    # Keep the process alive for a short time so external profilers (e.g. AMD uProf)
    # have a chance to capture at least one sample for very fast workloads.
    time.sleep(2.0)
    elapsed = end - start
    latency_ms = (elapsed / ITERATIONS) * 1000 if ITERATIONS > 0 else 0.0
    throughput = (ITERATIONS / elapsed) if elapsed > 0 else 0.0
    notes = f"Ran {ITERATIONS} iterations. Sample outputs: {outputs}"
    return {
        'throughput_ops_per_sec': throughput,
        'latency_ms': latency_ms,
        'notes': notes
    }
