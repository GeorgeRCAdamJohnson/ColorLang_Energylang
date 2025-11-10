"""
ColorLang Micro Assembler v0
Purpose: Provide a minimal facility to emit a tiny kernel image (list of HSV pixels) for the VM.
Scope: Only supports a constrained subset of operations needed for an INIT + LOOP + PRINT + HALT proof.
Encoding Rules (aligned to current parser/instruction_set):
- INTEGER data pixel (hue 0-15). We pick hue=7.5 midpoint. saturation=(value_magnitude/1000)*100, value=75 positive / 25 negative.
- Operations choose midpoints of hue bands to avoid boundary ambiguity:
  ADD: hue 35
  MOVE: hue 115
  PRINT: hue 275
  HALT: hue 335
  (We could add IF later: hue 155)
Operands: We rely on parser's simplistic extraction where saturation=int -> operand_a, value=int -> operand_b.
We treat saturation and value directly as immediate operands (0-100). This is a toy subset.
Output Format:
- Returns a 2D list of (R,G,B) tuples representing pixels.
- For convenience provides helper to write PNG using Pillow.
Kernel Strategy (example build_kernel()):
1. INTEGER pixel to load a constant into DR0 (e.g., loop counter start 0)
2. MOVE pixel to copy DR0 into DR1 (demonstrate register move)
3. ADD pixel to increment DR0 by 1 each cycle (operands map to immediate A+B stored in DR0)
4. PRINT pixel to emit DR0
5. HALT pixel at end (static single-pass demo)
Future Extension: Replace linear layout with a loop using IF jump once VM gain addressing semantics beyond simplification.
"""
from typing import List, Tuple
from PIL import Image

# Utility HSV->RGB conversion (simple manual to avoid dependency on parser class)
def hsv_to_rgb(h: float, s: float, v: float) -> Tuple[int, int, int]:
    h_norm = (h % 360) / 360.0
    s_norm = s / 100.0
    v_norm = v / 100.0
    import colorsys
    r, g, b = colorsys.hsv_to_rgb(h_norm, s_norm, v_norm)
    return int(r * 255), int(g * 255), int(b * 255)

# Fixed hue midpoints
HUES = {
    'INTEGER': 7.5,
    'ADD': 35.0,
    'MOVE': 115.0,
    'PRINT': 275.0,
    'HALT': 335.0,
    'RENDER_FRAME': 350.0,  # Added RENDER_FRAME to the HUES dictionary
    # Add new operations for procedural environment generation
    'EMPTY': 10.0,  # Example hue for empty tiles
    'GROUND': 20.0,  # Example hue for ground tiles
    'BANANA': 30.0,  # Example hue for bananas
    'GOAL': 40.0,  # Example hue for the goal
    'PATHFIND': 50.0,  # Example hue for pathfinding
    'UPDATE_TILEMAP': 360.0,  # Hue for updating tilemap
    'INIT_AGENT': 370.0,  # Hue for initializing agent state
}

def encode_integer(value: int) -> Tuple[int, int, int]:
    magnitude = min(abs(value), 1000)
    saturation = (magnitude / 1000) * 100
    sign_value = 75 if value >= 0 else 25
    return hsv_to_rgb(HUES['INTEGER'], saturation, sign_value)

# Adjust encoding to stabilize hues by ensuring saturation and value are non-zero for instructions.
def encode_op(op: str, operand_a: int = 0, operand_b: int = 0) -> Tuple[int, int, int]:
    if op not in HUES:
        raise ValueError(f"Unsupported op {op} in micro assembler")

    # Clamp operands to 0-100 range for saturation/value immediate usage
    a = max(1, min(100, operand_a))  # Ensure saturation is at least 1
    b = max(1, min(100, operand_b))  # Ensure value is at least 1

    return hsv_to_rgb(HUES[op], a, b)

def build_linear_kernel(counter_start: int = 0, steps: int = 5) -> List[Tuple[int, int, int]]:
    """Build a kernel that alternates INTEGER and PRINT, ending with HALT."""
    pixels: List[Tuple[int, int, int]] = []

    for i in range(counter_start, counter_start + steps):
        # Encode INTEGER value
        pixels.append(encode_integer(i))
        # Encode PRINT operation
        pixels.append(encode_op('PRINT', 100, 100))  # Use high saturation/value to stabilize hue

    # Add HALT operation
    pixels.append(encode_op('HALT', 100, 100))  # Ensure HALT is encoded distinctly

    return pixels

def write_kernel_image(pixels: List[Tuple[int, int, int]], path: str, width: int = None):
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

    # Debug: Log the path and dimensions of the image
    print(f"[DEBUG] Writing kernel image to {path} with dimensions {width}x{height}")

    img.save(path)

if __name__ == '__main__':
    kernel_pixels = build_linear_kernel(counter_start=0, steps=8)
    write_kernel_image(kernel_pixels, 'micro_kernel.png')
    print('Wrote micro_kernel.png with', len(kernel_pixels), 'pixels')
