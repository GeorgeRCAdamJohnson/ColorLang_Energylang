"""
ColorLang Core Module
A visual programming language using color as computational primitives.

Author: Adam
Version: 1.0
Date: November 7, 2025
"""

__version__ = "1.0.0"
__author__ = "Adam"

from .color_parser import ColorParser
from .virtual_machine import ColorVM
from .instruction_set import InstructionSet
from .debugger import ColorDebugger
from .compression import ColorCompressor
from .color_react import ColorReactApp, ColorComponent, Button, TextDisplay, Container
from .exceptions import *

def load_program(image_path):
    """Load a ColorLang program from an image file."""
    parser = ColorParser()
    return parser.parse_image(image_path)

def execute(program, debug=False):
    """Execute a ColorLang program."""
    vm = ColorVM()
    if debug:
        debugger = ColorDebugger(vm)
        return debugger.run_with_debugging(program)
    else:
        return vm.run_program(program)

def create_sample_program():
    """Create a simple sample program for testing."""
    # This will create a simple "Hello World" equivalent
    from PIL import Image
    import colorsys
    
    # Simple program: PRINT "Hello" then HALT
    instructions = [
        (300, 80, 90),  # PRINT operation
        (15, 50, 75),   # String reference "Hello"
        (345, 0, 0),    # HALT
    ]
    
    # Convert HSV to RGB
    pixels = []
    for h, s, v in instructions:
        r, g, b = colorsys.hsv_to_rgb(h / 360, s / 100, v / 100)
        pixels.append((int(r * 255), int(g * 255), int(b * 255)))
    
    # Create image
    img = Image.new('RGB', (len(pixels), 1))
    img.putdata(pixels)
    return img