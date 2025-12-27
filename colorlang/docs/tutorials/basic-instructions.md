# Basic Instructions Tutorial

**Difficulty:** 🟢 Beginner  
**Duration:** 30 minutes  

## Objectives
Learn the fundamental ColorLang instruction set:
- Data manipulation instructions
- Arithmetic operations  
- Control flow basics
- I/O operations

## Prerequisites
- Completed [Hello World Tutorial](hello-world.md)
- Understanding of basic programming concepts

## ColorLang Instruction Overview

ColorLang instructions are categorized by their hue ranges:

| Hue Range | Category | Examples |
|-----------|----------|----------|
| 0-30° | System | HALT, NOP, DEBUG |
| 15-45° | Data | LOAD_INT, STORE |  
| 25-85° | Arithmetic | ADD, SUB, MUL, DIV |
| 65-125° | Logic | AND, OR, XOR, CMP |
| 125-185° | Control | JMP, JMP_IF, CALL |
| 185-245° | I/O | PRINT, GET_INPUT |
| 305-355° | AI | PATHFIND, MOVE, SENSE |

## Data Instructions

### LOAD_INT - Loading Integer Values

```python
# load_example.py
from PIL import Image
import colorsys

def create_load_example():
    """Demonstrate LOAD_INT instruction."""
    
    program = [
        # LOAD_INT: Put value 42 in register 0
        (15, 80, 70),   # Hue=15° for LOAD_INT
        # LOAD_INT: Put value 100 in register 1  
        (20, 85, 75),   # Similar hue, different sat/val
        # PRINT register 0
        (195, 90, 85),
        # PRINT register 1
        (200, 90, 85),
        # HALT
        (0, 0, 0)
    ]
    
    rgb_pixels = []
    for h, s, v in program:
        r, g, b = colorsys.hsv_to_rgb(h/360.0, s/100.0, v/100.0)
        rgb_pixels.append((int(r*255), int(g*255), int(b*255)))
    
    image = Image.new('RGB', (5, 1))
    image.putdata(rgb_pixels)
    image.save('load_example.png')
    print("Created load_example.png")

if __name__ == "__main__":
    create_load_example()
```

### STORE - Saving Values to Memory

```python
def create_store_example():
    """Demonstrate STORE instruction."""
    
    program = [
        # Load value 777 into register 0
        (15, 80, 70),
        # Store register 0 to memory address 5
        (55, 85, 80),   # STORE instruction
        # Load from memory address 5 to register 1
        (15, 80, 70),   # LOAD from memory
        # Print the retrieved value
        (195, 90, 85),
        (0, 0, 0)       # HALT
    ]
    
    # Convert and save (same process as above)
    # ... implementation similar to load_example
```

## Arithmetic Instructions

### Basic Math Operations

```python
def create_math_example():
    """Demonstrate arithmetic instructions."""
    
    program = [
        # Load operands
        (15, 80, 70),   # LOAD_INT: 10 into R0
        (18, 80, 70),   # LOAD_INT: 5 into R1
        
        # ADD: R2 = R0 + R1 (10 + 5 = 15)
        (25, 90, 80),   # ADD instruction
        
        # SUB: R3 = R0 - R1 (10 - 5 = 5)  
        (35, 90, 80),   # SUB instruction
        
        # MUL: R4 = R0 * R1 (10 * 5 = 50)
        (45, 90, 80),   # MUL instruction
        
        # Print results
        (195, 90, 85),  # Print R2 (15)
        (200, 90, 85),  # Print R3 (5)
        (205, 90, 85),  # Print R4 (50)
        
        (0, 0, 0)       # HALT
    ]
    
    return program
```

### Advanced Arithmetic

```python
def create_advanced_math():
    """Demonstrate advanced arithmetic."""
    
    program = [
        # Load test values
        (15, 80, 70),   # LOAD 20 into R0
        (18, 80, 70),   # LOAD 3 into R1
        
        # DIV: R2 = R0 / R1 (20 / 3 = 6)
        (55, 90, 80),   # DIV instruction
        
        # MOD: R3 = R0 % R1 (20 % 3 = 2)  
        (65, 90, 80),   # MOD instruction
        
        # Print division result and remainder
        (195, 90, 85),  # Print quotient
        (200, 90, 85),  # Print remainder
        
        (0, 0, 0)       # HALT
    ]
    
    return program
```

## Comparison Instructions

### CMP - Compare Values

```python
def create_comparison_example():
    """Demonstrate comparison instructions."""
    
    program = [
        # Load values to compare
        (15, 80, 70),   # LOAD 10 into R0
        (18, 80, 70),   # LOAD 15 into R1
        
        # CMP: Compare R0 and R1 
        (85, 90, 80),   # CMP instruction sets flags
        
        # The result affects subsequent conditional jumps
        # For now, just print the values
        (195, 90, 85),  # Print R0
        (200, 90, 85),  # Print R1
        
        (0, 0, 0)       # HALT
    ]
    
    return program
```

## Control Flow Instructions

### Basic Jumps

```python
def create_jump_example():
    """Demonstrate jump instructions."""
    
    program = [
        # Instruction 0: Load counter
        (15, 80, 70),   # LOAD 0 into R0 (counter)
        
        # Instruction 1: LOOP START  
        (18, 80, 70),   # LOAD 1 into R1 (increment)
        
        # Instruction 2: Add to counter
        (25, 90, 80),   # ADD R0 = R0 + R1
        
        # Instruction 3: Print current count
        (195, 90, 85),  # PRINT R0
        
        # Instruction 4: Check if counter < 5
        (20, 80, 70),   # LOAD 5 into R2 (limit)
        (85, 90, 80),   # CMP R0, R2
        
        # Instruction 6: Jump back if less than
        (125, 90, 80),  # JMP_IF_LT to instruction 1
        
        # Instruction 7: Done
        (0, 0, 0)       # HALT
    ]
    
    return program
```

## I/O Instructions

### PRINT - Output Values

```python
def create_print_variations():
    """Demonstrate different PRINT options."""
    
    program = [
        # Print literal text (Hello)
        (195, 90, 85),  # PRINT instruction
        
        # Load and print number
        (15, 80, 70),   # LOAD 42 into R0
        (200, 90, 85),  # PRINT R0
        
        # Load and print another number
        (18, 80, 70),   # LOAD 123 into R1  
        (205, 90, 85),  # PRINT R1
        
        (0, 0, 0)       # HALT
    ]
    
    return program
```

### GET_INPUT - Reading Input

```python
def create_input_example():
    """Demonstrate input handling."""
    
    program = [
        # Get user input into R0
        (245, 90, 85),  # GET_INPUT instruction
        
        # Print what user entered
        (195, 90, 85),  # PRINT R0
        
        # Add 10 to user input
        (18, 80, 70),   # LOAD 10 into R1
        (25, 90, 80),   # ADD R2 = R0 + R1
        
        # Print the result
        (200, 90, 85),  # PRINT R2
        
        (0, 0, 0)       # HALT
    ]
    
    return program
```

## Complete Example Program

Let's combine multiple instructions into a useful program:

```python
# calculator.py
def create_simple_calculator():
    """Create a ColorLang calculator program."""
    
    program = [
        # Get first number
        (245, 90, 85),  # GET_INPUT -> R0
        
        # Get second number  
        (248, 90, 85),  # GET_INPUT -> R1
        
        # Calculate sum
        (25, 90, 80),   # ADD R2 = R0 + R1
        
        # Calculate difference
        (35, 90, 80),   # SUB R3 = R0 - R1
        
        # Calculate product
        (45, 90, 80),   # MUL R4 = R0 * R1
        
        # Print results
        (195, 90, 85),  # Print "Sum:"
        (200, 90, 85),  # Print R2
        
        (195, 90, 85),  # Print "Difference:"
        (205, 90, 85),  # Print R3
        
        (195, 90, 85),  # Print "Product:"
        (210, 90, 85),  # Print R4
        
        (0, 0, 0)       # HALT
    ]
    
    # Convert to image
    rgb_pixels = []
    for h, s, v in program:
        r, g, b = colorsys.hsv_to_rgb(h/360.0, s/100.0, v/100.0)
        rgb_pixels.append((int(r*255), int(g*255), int(b*255)))
    
    # Calculate image dimensions
    width = min(10, len(program))  # Max 10 pixels wide
    height = (len(program) + width - 1) // width
    
    # Pad pixels to fill rectangle
    while len(rgb_pixels) < width * height:
        rgb_pixels.append((0, 0, 0))
    
    image = Image.new('RGB', (width, height))
    image.putdata(rgb_pixels)
    image.save('calculator.png')
    print(f"Created calculator.png ({width}x{height})")

if __name__ == "__main__":
    create_simple_calculator()
```

## Running the Examples

Create a runner script to test all examples:

```python
# run_examples.py
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from colorlang.color_parser import ColorParser
from colorlang.virtual_machine import ColorVM

def run_colorlang_program(filename):
    """Run a ColorLang program and display results."""
    
    parser = ColorParser()
    vm = ColorVM()
    
    try:
        print(f"\\n--- Running {filename} ---")
        program = parser.parse_image(filename)
        result = vm.run_program(program)
        
        print(f"Instructions executed: {len(program)}")
        if 'output' in result:
            print(f"Output: {result['output']}")
        print("Program completed successfully!")
        
    except Exception as e:
        print(f"Error running {filename}: {e}")

def main():
    """Run all example programs."""
    
    examples = [
        'load_example.png',
        'calculator.png'
    ]
    
    for example in examples:
        if os.path.exists(example):
            run_colorlang_program(example)
        else:
            print(f"Example not found: {example}")

if __name__ == "__main__":
    main()
```

## Exercises

### Exercise 1: Temperature Converter
Create a program that:
1. Gets a Celsius temperature from user
2. Converts to Fahrenheit (F = C * 9/5 + 32)
3. Prints the result

### Exercise 2: Number Sequence
Create a program that prints the first 10 even numbers (2, 4, 6, 8, ...).

### Exercise 3: Simple Validator
Create a program that:
1. Gets a number from user
2. Checks if it's between 1 and 100
3. Prints "Valid" or "Invalid"

## Common Mistakes

1. **Wrong hue values** - Double-check instruction hue ranges
2. **Missing HALT** - Always end programs with HALT (0, 0, 0)
3. **Register confusion** - Remember register numbers in operands
4. **Image dimensions** - Ensure enough pixels for all instructions

## Next Steps

Continue with these tutorials:
- [Control Flow](control-flow.md) - Advanced loops and conditions
- [Variables and Registers](variables-registers.md) - Data management
- [Working with Images](working-with-images.md) - Image manipulation

## Summary

You've learned the core ColorLang instructions:
✅ Data instructions (LOAD_INT, STORE)  
✅ Arithmetic operations (ADD, SUB, MUL, DIV)  
✅ Comparison instructions (CMP)  
✅ I/O operations (PRINT, GET_INPUT)  
✅ Basic control flow (JMP)  

These instructions form the foundation for all ColorLang programs!