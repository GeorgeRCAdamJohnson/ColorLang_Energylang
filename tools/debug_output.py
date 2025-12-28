#!/usr/bin/env python3

"""
Simple test to debug the output collection issue.
"""

import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.abspath('.'))

from colorlang.color_parser import ColorParser
from colorlang.virtual_machine import ColorVM

def test_simple_output():
    """Test the simplest possible output case."""
    print("=== Testing Simple Output Collection ===")
    
    # Create VM
    vm = ColorVM()
    vm.debug_mode = True
    
    # Test basic buffer operations
    print("\n1. Testing direct buffer operations:")
    vm._output_buffer = []
    vm.thread_outputs = {0: []}
    
    print(f"Initial state: main={vm._output_buffer}, thread={vm.thread_outputs}")
    
    # Test _collect_output directly
    print("\n2. Testing _collect_output method:")
    vm._collect_output("test output")
    print(f"After collect: main={vm._output_buffer}, thread={vm.thread_outputs}")
    
    # Test simple program execution
    print("\n3. Testing hello_world program:")
    parser = ColorParser()
    try:
        program = parser.parse_image("examples/hello_world.png")
        result = vm.run_program(program)
        print(f"Program result: {result.get('output', 'NO OUTPUT KEY')}")
    except Exception as e:
        print(f"Error running program: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_simple_output()