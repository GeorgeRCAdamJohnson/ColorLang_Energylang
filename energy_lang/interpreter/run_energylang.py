"""
EnergyLang Interpreter Runner
Loads, parses, and executes an EnergyLang source file using the VM.
"""
from energylang_parser import parse_energylang_source
import sys
import os
# Ensure workspace root is in sys.path for absolute imports
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)
from energy_lang.interpreter.energylang_vm import EnergyLangVM

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python run_energylang.py <program.energylang>")
        sys.exit(1)
    with open(sys.argv[1], 'r') as f:
        source = f.read()
    instructions = parse_energylang_source(source)
    vm = EnergyLangVM(debug=True)
    vm.load_program(instructions)
    result = vm.run()
    print("\n--- Program Output ---")
    for line in result['output']:
        print(line)
    print("\n--- Final Registers ---")
    print(result['final_registers'])
    print("\n--- Execution Stats ---")
    print(result['execution_stats'])
