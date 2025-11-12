"""
Minimal Program Generator for ColorLang

Generates a simple ColorLang kernel image to test basic rendering functionality.
"""

from colorlang.micro_assembler import encode_op, encode_integer, write_kernel_image
from typing import List, Tuple

# Define constants
FRAME_COUNTER_START = 0
IMAGE_PATH = "minimal_kernel.png"


def build_minimal_kernel() -> List[Tuple[int, int, int]]:
    """Builds a minimal kernel for testing basic rendering."""
    pixels = []

    # Initialize frame counter
    pixels.append(encode_integer(FRAME_COUNTER_START))

    # Render a single frame with a static tilemap
    pixels.append(encode_op("RENDER_FRAME", 0, 0))

    # Halt the program
    pixels.append(encode_op("HALT", 0, 0))

    return pixels


def main():
    """Generate and save the minimal kernel image."""
    kernel_pixels = build_minimal_kernel()
    write_kernel_image(kernel_pixels, IMAGE_PATH)
    print(f"Generated {IMAGE_PATH}")


if __name__ == "__main__":
    main()