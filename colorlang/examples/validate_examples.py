"""
Validation Script for ColorLang Examples

This script automates the execution of all example programs in the `examples` directory.
It compares the output of each program against expected results to validate the correctness
of the ColorLang implementation.
"""
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from colorlang.color_parser import ColorParser
from colorlang.virtual_machine import ColorVM

EXAMPLES_DIR = os.path.dirname(__file__)
EXAMPLES = {
    "hello_world.png": ["Hello, World!"],
    "arithmetic_demo.png": ["5", "10"],
    "loop_example.png": ["0", "1", "2", "3", "4"],
    "monkey_cognition_demo.png": ["Decision: Collect Banana"],
    "parallel_demo.png": ["Thread 1", "Thread 2"],
    "color_manipulation.png": ["Color Transformed"],
    "fibonacci_sequence.png": ["0", "1", "1", "2", "3", "5", "8"],
}

def validate_example(example_file, expected_output):
    """Run a single example and validate its output."""
    parser = ColorParser()
    vm = ColorVM()

    # Load the program
    example_path = os.path.join(EXAMPLES_DIR, example_file)
    program = parser.parse_image(example_path)

    # Execute the program
    result = vm.run_program(program)
    output = result.get("output", [])

    # Compare output
    success = output == expected_output
    return success, output

def main():
    """Validate all examples."""
    all_passed = True

    for example, expected_output in EXAMPLES.items():
        print(f"Validating {example}...")
        success, output = validate_example(example, expected_output)

        if success:
            print(f"[PASS] {example}")
        else:
            print(f"[FAIL] {example}")
            print(f"  Expected: {expected_output}")
            print(f"  Got: {output}")
            all_passed = False

    if all_passed:
        print("\nAll examples passed validation!")
    else:
        print("\nSome examples failed validation. See details above.")

if __name__ == "__main__":
    main()