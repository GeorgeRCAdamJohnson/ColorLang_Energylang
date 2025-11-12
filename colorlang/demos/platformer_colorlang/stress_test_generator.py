"""
Stress Test Generator for ColorLang

Generates a complex ColorLang kernel image to test the language's limits.
"""

from colorlang.micro_assembler import encode_op, encode_integer, write_kernel_image
from typing import List, Tuple

# Define constants
FRAME_COUNTER_START = 0
IMAGE_PATH = "stress_test_kernel.png"
GRID_WIDTH = 50
GRID_HEIGHT = 20


def build_stress_test_kernel() -> List[Tuple[int, int, int]]:
    """Builds a kernel to stress test the language with a large tilemap and complex logic."""
    pixels = []

    # Initialize frame counter
    pixels.append(encode_integer(FRAME_COUNTER_START))

    # Generate a large tilemap with alternating patterns
    for y in range(GRID_HEIGHT):
        for x in range(GRID_WIDTH):
            if (x + y) % 2 == 0:
                pixels.append(encode_op("GROUND", x, y))
            else:
                pixels.append(encode_op("BANANA", x, y))

    # Add agent movement logic
    for frame in range(10):  # Simulate 10 frames
        pixels.append(encode_op("MOVE", frame % GRID_WIDTH, frame % GRID_HEIGHT))
        pixels.append(encode_op("RENDER_FRAME", 0, 0))

    # Halt the program
    pixels.append(encode_op("HALT", 0, 0))

    return pixels


def main():
    """Generate and save the stress test kernel image."""
    kernel_pixels = build_stress_test_kernel()
    write_kernel_image(kernel_pixels, IMAGE_PATH, width=GRID_WIDTH)
    print(f"Generated {IMAGE_PATH}")


if __name__ == "__main__":
    main()