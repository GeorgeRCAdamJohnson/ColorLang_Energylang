"""
ColorLang Example Programs
Demonstrates various features of the ColorLang programming language.
"""

import colorsys
from PIL import Image
import os

def create_hello_world():
    """Create a simple Hello World program."""
    # Program: PRINT "Hello" then HALT
    instructions = [
        (275, 80, 90),  # PRINT operation (hue 271-280°)
        (15, 50, 75),   # String/data reference (DATA type 0-30°)
        (335, 0, 0),    # HALT (hue 331-340°)
    ]
    
    return create_program_image(instructions, "hello_world.png")

def create_arithmetic_demo():
    """Create a program demonstrating arithmetic operations."""
    # Program: 5 + 3 = 8
    instructions = [
        (95, 50, 75),   # LOAD 5 into register (MEMORY hue 91-100°)
        (95, 30, 75),   # LOAD 3 into register (MEMORY hue 91-100°)
        (35, 0, 1),     # ADD operation (ARITHMETIC hue 31-40°)
        (275, 0, 0),    # PRINT result (I/O hue 271-280°)
        (335, 0, 0),    # HALT (SYSTEM hue 331-340°)
    ]
    
    return create_program_image(instructions, "arithmetic_demo.png")

def create_loop_example():
    """Create a program with a simple loop."""
    # Program: Count from 1 to 5
    instructions = [
        # Row 1: Initialize counter
        (95, 10, 75),    # Load 1 into register (counter)
        (95, 50, 75),    # Load 5 into register (limit)
        
        # Row 2: Loop condition and body
        (35, 0, 1),     # Compare counter with limit (ADD for simplicity)
        (275, 0, 0),    # PRINT counter
        
        # Row 3: Increment and jump
        (95, 10, 75),    # Load 1 (increment)
        (35, 0, 2),     # Add to counter
        (175, 2, 0),    # WHILE/jump back to condition
        (335, 0, 0),    # HALT
    ]
    
    # Arrange as 3x3 grid for loop structure
    return create_program_grid(instructions, 3, 3, "loop_example.png")

def create_monkey_cognition_demo():
    """Create a program simulating monkey decision-making."""
    # Program: Monkey sees banana, evaluates risk, decides to jump
    instructions = [
        # Emotion assessment
        (15, 70, 80),   # Playful emotion (hue=15°, intensity=70%, confidence=80%)
        
        # Memory recall
        (120, 40, 60),  # Remember banana location (hue=120°, clarity=40%, confidence=60%)
        
        # Risk evaluation
        (300, 30, 70),  # Low risk assessment (hue=300°, risk=30%, confidence=70%)
        
        # Decision: Jump
        (60, 80, 90),   # High action intent to jump (hue=60°, intensity=80%, confidence=90%)
        
        # Execute action
        (275, 1, 0),    # PRINT decision
        (345, 0, 0),    # HALT
    ]
    
    return create_program_image(instructions, "monkey_cognition_demo.png")

def create_parallel_demo():
    """Create a program demonstrating parallel execution concepts."""
    # Program: Spawn thread and synchronize
    instructions = [
        # Main thread
        (355, 50, 75),  # THREAD_SPAWN (SYSTEM hue 351-360°)
        (95, 20, 75),   # Thread ID storage (LOAD)
        
        # Parallel work simulation
        (275, 1, 0),    # PRINT "Main thread"
        
        # Synchronization
        (335, 20, 50),  # THREAD_JOIN (SYSTEM hue 331-340°)
        (275, 2, 0),    # PRINT "Synchronized"
        (335, 0, 0),    # HALT
    ]
    
    return create_program_image(instructions, "parallel_demo.png")

def create_color_manipulation():
    """Create a program that manipulates colors directly."""
    # Program: Create and transform colors
    instructions = [
        # Define base color (red)
        (0, 100, 100),    # Pure red color
        
        # Transform hue (shift to green)
        (120, 100, 100),  # Green color
        
        # Blend colors (average)
        (60, 100, 100),   # Yellow (between red and green)
        
        # Output color
        (275, 0, 0),      # PRINT color
        (345, 0, 0),      # HALT
    ]
    
    return create_program_image(instructions, "color_manipulation.png")

def create_program_image(instructions, filename):
    """Create a program image from instruction list."""
    # Convert HSV to RGB
    pixels = []
    for h, s, v in instructions:
        r, g, b = colorsys.hsv_to_rgb(h / 360, s / 100, v / 100)
        pixels.append((int(r * 255), int(g * 255), int(b * 255)))
    
    # Create image
    img = Image.new('RGB', (len(pixels), 1))
    img.putdata(pixels)
    
    # Save to examples directory
    filepath = os.path.join('examples', filename)
    img.save(filepath)
    
    return {
        'filename': filename,
        'filepath': filepath,
        'size': (len(pixels), 1),
        'instructions': instructions,
        'description': f"ColorLang program with {len(instructions)} instructions"
    }

def create_program_grid(instructions, width, height, filename):
    """Create a program image arranged in a grid."""
    # Pad instructions to fill grid
    while len(instructions) < width * height:
        instructions.append((0, 0, 0))  # Black pixels (NOP)
    
    # Create array of pixel data
    pixels = []
    print("[DEBUG] Converting instructions to pixels:")
    
    for h, s, v in instructions[:width * height]:
        # Normalize HSV values to proper ranges
        h = float(max(0, min(360, h)))  # 0-360 degrees
        s = float(max(0, min(100, s)))  # 0-100%
        v = float(max(0, min(100, v)))  # 0-100%
        
        # Special case handling
        if s == 0:  # Grayscale
            intensity = int(round((v / 100.0) * 255))
            pixels.append((intensity, intensity, intensity))
            print(f"[DEBUG] HSV({h:0.1f}°, {s:0.1f}%, {v:0.1f}%) -> RGB({intensity}, {intensity}, {intensity})")
            continue

        # Convert HSV to RGB using color wheel math
        hi = int(h / 60.0) % 6
        f = (h / 60.0) - hi
        p = int(255 * (v/100.0) * (1 - s/100.0))
        q = int(255 * (v/100.0) * (1 - f * s/100.0))
        t = int(255 * (v/100.0) * (1 - (1 - f) * s/100.0))
        v_scaled = int(255 * (v/100.0))

        if hi == 0:
            rgb = (v_scaled, t, p)
        elif hi == 1:
            rgb = (q, v_scaled, p)
        elif hi == 2:
            rgb = (p, v_scaled, t)
        elif hi == 3:
            rgb = (p, q, v_scaled)
        elif hi == 4:
            rgb = (t, p, v_scaled)
        else:
            rgb = (v_scaled, p, q)

        # Ensure valid 8-bit color
        rgb = tuple(max(0, min(255, x)) for x in rgb)
        pixels.append(rgb)
        print(f"[DEBUG] HSV({h:0.1f}°, {s:0.1f}%, {v:0.1f}%) -> RGB{rgb}")
    
    # Create image with explicit RGB mode and force 24-bit color
    img = Image.new('RGB', (width, height))
    img.putdata(pixels)
    
    # Save with maximum quality and no compression
    os.makedirs('examples', exist_ok=True)
    filepath = os.path.join('examples', filename)
    img.save(filepath, quality=100, optimize=False)
    
    return {
        'filename': filename,
        'filepath': filepath,
        'size': (width, height),
        'instructions': instructions[:width * height],
        'description': f"ColorLang program grid ({width}x{height})"
    }
    
    return {
        'filename': filename,
        'filepath': filepath,
        'size': (width, height),
        'instructions': instructions[:width * height],
        'description': f"ColorLang program grid ({width}x{height})"
    }

def create_fibonacci_sequence():
    """Create a program that generates Fibonacci sequence."""
    # Program: Generate first 7 Fibonacci numbers [0, 1, 1, 2, 3, 5, 8]
    instructions = [
        # Row 1: Initialize data registers
        (7, 0, 75),        # Load 0 into DR0 (first number)
        (7, 10, 75),       # Load 1 into DR1 (second number)
        (7, 70, 75),       # Load 7 into DR2 (counter)
        (0, 0, 0),         # NOP

        # Row 2: Print and calculate next number
        (0, 0, 10),        # PRINT_NUM DR0 (grayscale with correct saturation/value for numeric output)
        (115, 0, 20),      # MOVE registers for next number
        (35, 0, 20),       # ADD DR0 + DR1 for next Fibonacci number
        (0, 0, 0),         # NOP

        # Row 3: Loop control
        (45, 1, 75),       # SUB 1 from counter
        (175, 0, 20),      # WHILE counter > 0
        (0, 0, 10),        # PRINT_NUM final number (grayscale for numeric output)
        (335, 0, 0)        # HALT
    ]
    
    # Create image with corrected colors
    return create_program_grid(instructions, 4, 3, "fibonacci_sequence.png")

def create_all_examples():
    """Create all example programs."""
    examples = [
        create_hello_world(),
        create_arithmetic_demo(),
        create_loop_example(),
        create_monkey_cognition_demo(),
        create_parallel_demo(),
        create_color_manipulation(),
        create_fibonacci_sequence()
    ]
    
    return examples

def generate_example_documentation():
    """Generate documentation for all examples."""
    doc = "# ColorLang Example Programs\n\n"
    doc += "This directory contains example programs demonstrating various features of ColorLang.\n\n"
    
    examples_info = [
        {
            'name': 'Hello World',
            'file': 'hello_world.png',
            'description': 'Simple program that prints a greeting',
            'concepts': ['Basic I/O', 'Program structure', 'HALT instruction']
        },
        {
            'name': 'Arithmetic Demo',
            'file': 'arithmetic_demo.png',
            'description': 'Demonstrates basic arithmetic operations',
            'concepts': ['Data loading', 'Addition', 'Register operations']
        },
        {
            'name': 'Loop Example',
            'file': 'loop_example.png',
            'description': 'Shows looping and conditional execution',
            'concepts': ['Control flow', 'Loops', 'Counters']
        },
        {
            'name': 'Monkey Cognition Demo',
            'file': 'monkey_cognition_demo.png',
            'description': 'Simulates monkey decision-making process',
            'concepts': ['Emotional modeling', 'Decision trees', 'AI behavior']
        },
        {
            'name': 'Parallel Demo',
            'file': 'parallel_demo.png',
            'description': 'Demonstrates thread spawning and synchronization',
            'concepts': ['Parallel processing', 'Thread management', 'Synchronization']
        },
        {
            'name': 'Color Manipulation',
            'file': 'color_manipulation.png',
            'description': 'Shows direct color processing and transformation',
            'concepts': ['Color spaces', 'Visual programming', 'Data transformation']
        },
        {
            'name': 'Fibonacci Sequence',
            'file': 'fibonacci_sequence.png',
            'description': 'Generates Fibonacci numbers using loops',
            'concepts': ['Mathematical sequences', 'Loop counters', 'Variable updates']
        }
    ]
    
    for example in examples_info:
        doc += f"## {example['name']}\n"
        doc += f"**File:** `{example['file']}`\n\n"
        doc += f"{example['description']}\n\n"
        doc += "**Concepts demonstrated:**\n"
        for concept in example['concepts']:
            doc += f"- {concept}\n"
        doc += "\n"
    
    doc += "## Running Examples\n\n"
    doc += "To run an example program:\n\n"
    doc += "```python\n"
    doc += "import colorlang\n\n"
    doc += "# Load and execute program\n"
    doc += "program = colorlang.load_program('examples/hello_world.png')\n"
    doc += "result = colorlang.execute(program)\n"
    doc += "print(result)\n"
    doc += "```\n\n"
    
    doc += "## Creating Your Own Programs\n\n"
    doc += "You can create ColorLang programs by:\n\n"
    doc += "1. **Using the example generators** in `examples.py`\n"
    doc += "2. **Drawing directly** in an image editor with precise HSV values\n"
    doc += "3. **Using the ColorLang IDE** (when available)\n"
    doc += "4. **Programmatically** using the PIL library\n\n"
    
    return doc

if __name__ == "__main__":
    # Create examples directory if it doesn't exist
    os.makedirs('examples', exist_ok=True)
    
    # Generate all examples
    examples = create_all_examples()
    
    # Generate documentation
    doc = generate_example_documentation()
    with open('examples/README.md', 'w') as f:
        f.write(doc)
    
    print("Created ColorLang example programs:")
    for example in examples:
        print(f"  - {example['filename']} ({example['size'][0]}x{example['size'][1]})")
    
    print(f"\nTotal: {len(examples)} example programs created")
    print("Documentation: examples/README.md")