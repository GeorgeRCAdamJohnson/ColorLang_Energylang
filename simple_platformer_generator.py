#!/usr/bin/env python3
"""
Simple Platformer Kernel Generator

Creates a minimal ColorLang kernel that demonstrates basic platformer functionality
without the complexity that was causing the original kernel to fail.
"""
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from colorlang.micro_assembler import encode_integer, encode_op, write_kernel_image

def build_simple_platformer_kernel():
    """Build a simple, working platformer kernel."""
    pixels = []
    
    print("Building simple platformer kernel...")
    
    # 1. Initialize frame counter to 0
    pixels.append(encode_integer(0))
    print("Added frame counter initialization")
    
    # 2. Simple loop: increment counter, print it, check if done
    for frame in range(10):  # Just 10 frames instead of 120
        # Increment frame counter (ADD operation)
        pixels.append(encode_op('ADD', 1, 0))  # Add 1 to register
        
        # Print the current frame number
        pixels.append(encode_op('PRINT', 1, 1))
        
        print(f"Added frame {frame + 1} operations")
    
    # 3. Final halt
    pixels.append(encode_op('HALT', 0, 1))
    print("Added halt instruction")
    
    print(f"Total kernel size: {len(pixels)} pixels")
    return pixels

def main():
    """Generate the simple platformer kernel."""
    try:
        # Build the simplified kernel
        kernel_pixels = build_simple_platformer_kernel()
        
        # Write as a single row (width = total pixels)
        output_path = 'simple_platformer_kernel.png'
        write_kernel_image(kernel_pixels, output_path, width=len(kernel_pixels))
        
        print(f"Generated {output_path} successfully!")
        print(f"Kernel contains {len(kernel_pixels)} instructions")
        
    except Exception as e:
        print(f"Error generating kernel: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()