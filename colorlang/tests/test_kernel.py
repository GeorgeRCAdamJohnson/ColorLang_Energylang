"""
Test script for running the ColorLang kernel using the ColorVM.
"""

from colorlang import ColorParser, ColorVM

def main():
    # Path to the kernel image
    kernel_image_path = "platformer_kernel.png"

    # Initialize the ColorParser and ColorVM
    parser = ColorParser()
    vm = ColorVM()

    # Enable debug mode for detailed logs
    vm.debug_mode = True

    # Parse the kernel image
    print("[INFO] Parsing kernel image...")
    program = parser.parse_image(kernel_image_path)

    # Run the program
    print("[INFO] Running the kernel...")
    result = vm.run_program(program)

    # Display the results
    print("[INFO] Execution finished.")
    print("Exit Code:", result['exit_code'])
    print("Final Registers:", result['final_registers'])
    print("Execution Stats:", result['execution_stats'])
    if 'output' in result:
        print("Program Output:", result['output'])

if __name__ == "__main__":
    main()