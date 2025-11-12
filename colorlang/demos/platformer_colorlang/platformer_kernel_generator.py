"""
Platformer Kernel Generator

Generates a minimal ColorLang kernel image (`platformer_kernel.climg`) for the Monkey 2D platformer.
This kernel includes basic operations like frame counting and cognition strip updates.
"""
import os
import sys

from colorlang.micro_assembler import encode_op, encode_integer, write_kernel_image
from typing import List, Tuple

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Explicitly add the absolute workspace root to sys.path
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

# Define kernel constants
FRAME_COUNTER_START = 0
MAX_FRAMES = 120

# Define hues for syscalls (example values; adjust as per ABI)
HUES = {
    'GET_TIME': 340.0,
    'RENDER_FRAME': 350.0,
    'HALT': 335.0,
}

# Define a mapping for tile types to numeric values
TILE_TYPE_MAP = {
    'EMPTY': 0,
    'GROUND': 1,
    'BANANA': 2,
    'GOAL': 3
}

def build_platformer_kernel() -> List[Tuple[int, int, int]]:
    """Builds the platformer kernel with procedural environment generation."""
    pixels = []

    # Initialize frame counter
    pixels.append(encode_integer(FRAME_COUNTER_START))

    # Procedural environment generation
    for y in range(20):  # Height of the grid
        for x in range(50):  # Width of the grid
            if y >= 18:  # Base ground layer
                pixels.append(encode_op('GROUND', x, y))
            elif y == 10 and 10 <= x <= 20:  # Example platform
                pixels.append(encode_op('GROUND', x, y))
            elif x == 25 and y == 15:  # Example banana
                pixels.append(encode_op('BANANA', x, y))
            elif x == 45 and y == 3:  # Goal position
                pixels.append(encode_op('GOAL', x, y))
            else:
                pixels.append(encode_op('EMPTY', x, y))

    # Update tilemap in shared memory
    for y in range(20):
        for x in range(50):
            tile_type = 'EMPTY'
            if y >= 18:  # Base ground layer
                tile_type = 'GROUND'
            elif y == 10 and 10 <= x <= 20:  # Example platform
                tile_type = 'GROUND'
            elif x == 25 and y == 15:  # Example banana
                tile_type = 'BANANA'
            elif x == 45 and y == 3:  # Goal position
                tile_type = 'GOAL'

            # Encode the tile type as a numeric value
            tile_value = TILE_TYPE_MAP[tile_type]
            pixels.append(encode_op('UPDATE_TILEMAP', x, tile_value))

    # Initialize agent state in shared memory
    pixels.append(encode_op('INIT_AGENT', 0, 18))  # Start agent at bottom-left corner

    # Main loop: increment frame counter, render frame, and check max frames
    for frame in range(MAX_FRAMES):
        # Increment frame counter
        pixels.append(encode_op('ADD', 1, 0))

        # Move agent (example: increment x position)
        pixels.append(encode_op('MOVE', frame % 50, 0))  # Cyclic movement within 50 tiles

        # Pathfinding logic: Move agent toward the nearest banana
        if frame % 2 == 0:  # Simulate decision-making every 2 frames
            # Example logic: Move agent closer to the banana at (25, 15)
            agent_x, agent_y = 0, 18  # Replace with actual agent position tracking
            banana_x, banana_y = 25, 15

            if agent_x < banana_x:
                pixels.append(encode_op('MOVE', agent_x + 1, agent_y))
            elif agent_x > banana_x:
                pixels.append(encode_op('MOVE', agent_x - 1, agent_y))

            if agent_y < banana_y:
                pixels.append(encode_op('MOVE', agent_x, agent_y + 1))
            elif agent_y > banana_y:
                pixels.append(encode_op('MOVE', agent_x, agent_y - 1))

        # Render frame syscall
        pixels.append(encode_op('RENDER_FRAME', 100, 100))

    # HALT syscall
    pixels.append(encode_op('HALT', 0, 1))

    return pixels

def main():
    """Generate and save the platformer kernel image."""
    kernel_pixels = build_platformer_kernel()
    write_kernel_image(kernel_pixels, 'platformer_kernel.png')  # Use .png extension
    print('Generated platformer_kernel.png')

if __name__ == '__main__':
    main()