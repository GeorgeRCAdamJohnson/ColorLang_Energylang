"""
Run the micro-assembled kernel via ColorVM
- Generates a tiny kernel image in-memory
- Parses it using ColorParser
- Executes in ColorVM and prints the output buffer and final DR0
"""
import os
import sys

# Ensure project root on path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from colorlang.micro_assembler import build_linear_kernel, write_kernel_image
from colorlang.color_parser import ColorParser
from colorlang.virtual_machine import ColorVM

from PIL import Image

def pixels_to_image(pixels, width=None):
    if width is None:
        width = len(pixels)
    height = (len(pixels) + width - 1) // width
    img = Image.new('RGB', (width, height), (0, 0, 0))
    x = y = 0
    for p in pixels:
        img.putpixel((x, y), p)
        x += 1
        if x >= width:
            x = 0
            y += 1
    return img

def main():
    # Build kernel
    pixels = build_linear_kernel(counter_start=0, steps=8)

    # Optionally persist for inspection
    out_dir = os.path.join(PROJECT_ROOT, 'demos', 'kernel', 'out')
    os.makedirs(out_dir, exist_ok=True)
    image_path = os.path.join(out_dir, 'micro_kernel.png')
    write_kernel_image(pixels, image_path)

    # Parse and run
    parser = ColorParser()
    program = parser.parse_image(image_path)
    # Quick introspection: print decoded operation names for first row
    ops = [parser.get_operation_name(instr) for instr in program['instructions'][0]]
    print('Decoded ops:', ops)
    vm = ColorVM()
    vm.debug_mode = True
    result = vm.run_program(program)

    print('Exit code:', result.get('exit_code'))
    print('Output buffer:', result.get('output'))
    print('Final DR0:', result.get('final_registers', {}).get('data', {}).get('DR0'))
    print('Instructions executed:', result.get('execution_stats', {}).get('instructions_executed'))

if __name__ == '__main__':
    main()
