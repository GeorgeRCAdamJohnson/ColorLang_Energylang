# Hello World Tutorial

**Difficulty:** 🟢 Beginner  
**Duration:** 15 minutes  

## Objectives
By the end of this tutorial, you will:
- Create your first ColorLang program
- Understand how ColorLang uses colors to encode instructions
- Run a program using the ColorLang virtual machine
- See output from a ColorLang program

## Prerequisites
- ColorLang installed on your system
- Basic understanding of programming concepts

## Step 1: Understanding ColorLang Basics

ColorLang programs are stored as images where each pixel represents an instruction. The HSV (Hue, Saturation, Value) color values encode:
- **Hue (0-360°):** Determines the instruction type
- **Saturation (0-100%):** Modifies instruction behavior  
- **Value (0-100%):** Provides additional parameters

## Step 2: Create Your First Program

Let's create a simple "Hello World" program using Python:

```python
# hello_world_creator.py
from PIL import Image
import colorsys

def create_hello_world():
    """Create a ColorLang Hello World program."""
    
    # Define our program as HSV values
    program = [
        # Print "Hello World" 
        (195, 90, 85),  # PRINT instruction
        # Halt the program
        (0, 0, 0)       # HALT instruction
    ]
    
    # Convert HSV to RGB pixels
    rgb_pixels = []
    for h, s, v in program:
        # Convert to RGB (PIL expects 0-1 range)
        r, g, b = colorsys.hsv_to_rgb(h/360.0, s/100.0, v/100.0)
        rgb_pixels.append((int(r*255), int(g*255), int(b*255)))
    
    # Create 2x1 image (2 pixels wide, 1 pixel tall)
    image = Image.new('RGB', (2, 1))
    image.putdata(rgb_pixels)
    
    # Save the program
    image.save('hello_world.png')
    print("Created hello_world.png")

if __name__ == "__main__":
    create_hello_world()
```

Run this script to create your ColorLang program:
```bash
python hello_world_creator.py
```

## Step 3: Run Your Program

Now let's run the ColorLang program:

```python
# run_hello_world.py
import sys
import os

# Add ColorLang to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from colorlang.color_parser import ColorParser
from colorlang.virtual_machine import ColorVM

def run_hello_world():
    """Run the Hello World ColorLang program."""
    
    # Create parser and VM
    parser = ColorParser()
    vm = ColorVM()
    
    try:
        # Parse the program image
        program = parser.parse_image('hello_world.png')
        print(f"Parsed {len(program)} instructions")
        
        # Run the program
        result = vm.run_program(program)
        
        # Display results
        print("Program completed successfully!")
        print(f"Output: {result.get('output', [])}")
        
    except Exception as e:
        print(f"Error running program: {e}")

if __name__ == "__main__":
    run_hello_world()
```

Run the program:
```bash
python run_hello_world.py
```

## Step 4: Understanding the Output

Your program should display:
```
Parsed 2 instructions
Program completed successfully!
Output: ['Hello World']
```

Let's examine what happened:
1. The **PRINT** instruction (HSV: 195, 90, 85) displayed "Hello World"
2. The **HALT** instruction (HSV: 0, 0, 0) stopped execution

## Step 5: Examining the Image

Open `hello_world.png` in an image viewer. You'll see:
- **First pixel:** Light blue color (the PRINT instruction)
- **Second pixel:** Black color (the HALT instruction)

Each pixel is an instruction in your program!

## Step 6: Add More Instructions

Let's create a more complex program:

```python
# enhanced_hello_world.py
from PIL import Image
import colorsys

def create_enhanced_hello():
    """Create an enhanced Hello World program."""
    
    program = [
        (15, 80, 70),   # LOAD_INT: Load value 42 into register 0
        (25, 90, 80),   # ADD: Add 8 to register 0 (42 + 8 = 50)
        (195, 90, 85),  # PRINT: Print the result
        (195, 90, 85),  # PRINT: Print "Hello Again"
        (0, 0, 0)       # HALT: Stop program
    ]
    
    # Convert to RGB and save
    rgb_pixels = []
    for h, s, v in program:
        r, g, b = colorsys.hsv_to_rgb(h/360.0, s/100.0, v/100.0)
        rgb_pixels.append((int(r*255), int(g*255), int(b*255)))
    
    # Create 5x1 image
    image = Image.new('RGB', (5, 1))
    image.putdata(rgb_pixels)
    image.save('enhanced_hello.png')
    print("Created enhanced_hello.png")

if __name__ == "__main__":
    create_enhanced_hello()
```

## Exercises

### Exercise 1: Count to 5
Create a ColorLang program that prints numbers 1 through 5.

**Hint:** Use multiple PRINT instructions with different values.

### Exercise 2: Simple Math
Create a program that:
1. Loads the number 10 into a register
2. Adds 5 to it
3. Prints the result (should be 15)

### Exercise 3: Colorful Program
Create a program with at least 6 different instructions, each with a different color.

## Troubleshooting

**Problem:** "No module named 'colorlang'"
**Solution:** Make sure you're running from the correct directory and ColorLang is in your Python path.

**Problem:** "Cannot identify image file"  
**Solution:** Ensure PIL/Pillow is installed: `pip install Pillow`

**Problem:** Program doesn't produce expected output
**Solution:** Check that HSV values match the instruction set in the [ColorLang Specification](../ColorLang_Specification.md).

## Next Steps

Now that you've created your first ColorLang program, try these tutorials:
- [Basic Instructions](basic-instructions.md) - Learn the core instruction set
- [Variables and Registers](variables-registers.md) - Manage data effectively
- [Working with Images](working-with-images.md) - Advanced image manipulation

## Summary

You've successfully:
✅ Created a ColorLang program using HSV color values  
✅ Converted colors to a program image  
✅ Executed the program with the ColorLang VM  
✅ Understood how instructions map to colors  

ColorLang's visual nature makes it unique - your programs are literally pictures that can be executed as code!