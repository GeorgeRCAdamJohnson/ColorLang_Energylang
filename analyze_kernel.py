#!/usr/bin/env python3
"""
Analyze the platformer_kernel.png file to understand why it's not working properly.
"""
import sys
import os
from PIL import Image
import numpy as np

# Add project root to path
sys.path.insert(0, os.path.abspath('.'))

from colorlang.color_parser import ColorParser
from colorlang.virtual_machine import ColorVM
from colorlang.debugger import ColorDebugger

def analyze_image_properties(image_path):
    """Analyze basic properties of the image."""
    print(f"\n=== Image Analysis: {image_path} ===")
    
    try:
        with Image.open(image_path) as img:
            print(f"Size: {img.size} (width x height)")
            print(f"Mode: {img.mode}")
            print(f"Format: {img.format}")
            
            # Convert to RGB/HSV for analysis
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Get pixel array
            pixels = np.array(img)
            print(f"Pixel array shape: {pixels.shape}")
            
            # Show some sample pixels
            print("\nFirst 5x5 pixels (RGB):")
            for y in range(min(5, pixels.shape[0])):
                for x in range(min(5, pixels.shape[1])):
                    r, g, b = pixels[y, x]
                    print(f"({r:3},{g:3},{b:3})", end=" ")
                print()
            
            return img, pixels
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return None, None

def analyze_with_parser(image_path):
    """Try to parse the image with ColorParser and see what happens."""
    print(f"\n=== Parser Analysis ===")
    
    try:
        parser = ColorParser()
        print("Parser created successfully")
        
        # Try to parse
        program = parser.parse_image(image_path)
        print(f"Parsing successful! Program type: {type(program)}")
        
        if hasattr(program, 'instructions'):
            print(f"Number of instructions: {len(program.instructions)}")
            
            # Show first 20 instructions
            print("\nFirst 20 instructions:")
            for i, instr in enumerate(program.instructions[:20]):
                print(f"  {i:3}: {instr}")
                
            # Show last 10 instructions if more than 20
            if len(program.instructions) > 20:
                print(f"\nLast 10 instructions:")
                for i, instr in enumerate(program.instructions[-10:], len(program.instructions)-10):
                    print(f"  {i:3}: {instr}")
        else:
            print(f"Program structure: {program}")
            
        return program
        
    except Exception as e:
        print(f"Parser failed: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_vm_execution(program):
    """Try to execute the program in the VM."""
    print(f"\n=== VM Execution Test ===")
    
    if not program:
        print("No program to execute")
        return
        
    try:
        vm = ColorVM()
        print("VM created successfully")
        
        # Try to run the program
        result = vm.run_program(program)
        print(f"Execution completed! Result type: {type(result)}")
        
        if isinstance(result, dict):
            print("Result keys:", list(result.keys()))
            for key, value in result.items():
                if isinstance(value, list):
                    print(f"  {key}: {len(value)} items")
                    if value:
                        print(f"    First item: {value[0]}")
                        if len(value) > 1:
                            print(f"    Last item: {value[-1]}")
                else:
                    print(f"  {key}: {value}")
        else:
            print(f"Result: {result}")
            
    except Exception as e:
        print(f"VM execution failed: {e}")
        import traceback
        traceback.print_exc()

def main():
    """Main analysis function."""
    kernel_path = "minimal_kernel.png"
    
    if not os.path.exists(kernel_path):
        print(f"Error: {kernel_path} not found!")
        available_images = [f for f in os.listdir('.') if f.endswith(('.png', '.jpg', '.jpeg'))]
        print(f"Available image files: {available_images}")
        return
    
    print(f"Analyzing {kernel_path}...")
    
    # 1. Basic image analysis
    img, pixels = analyze_image_properties(kernel_path)
    
    # 2. Parser analysis
    program = analyze_with_parser(kernel_path)
    
    # 3. VM execution test
    test_vm_execution(program)
    
    print("\n=== Analysis Complete ===")

if __name__ == '__main__':
    main()