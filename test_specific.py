#!/usr/bin/env python3

"""
Test individual programs to debug specific issues.
"""

import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.abspath('.'))

from colorlang.color_parser import ColorParser
from colorlang.virtual_machine import ColorVM

def test_arithmetic_demo():
    """Test arithmetic_demo to understand expected vs actual behavior."""
    print("=== Testing Arithmetic Demo ===")
    
    parser = ColorParser()
    vm = ColorVM()
    vm.debug_mode = False  # Reduce debug output
    
    program = parser.parse_image('examples/arithmetic_demo.png')
    result = vm.run_program(program)
    
    print(f'Arithmetic Demo Result: {result.get("output", [])}')
    print(f'Expected: ["5", "10"]')
    print(f'Status: {"PASS" if result.get("output", []) == ["5", "10"] else "FAIL"}')

if __name__ == "__main__":
    test_arithmetic_demo()