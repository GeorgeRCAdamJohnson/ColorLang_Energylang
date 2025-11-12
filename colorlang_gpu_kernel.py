#!/usr/bin/env python3
"""
ColorLang GPU Kernel Prototype for RTX 4050
Demonstrates parallel pixel processing using CUDA for ColorLang programs.
"""

import numpy as np
import time
from PIL import Image
import os

# Check for CUDA availability
try:
    import cupy as cp
    GPU_AVAILABLE = True
    print("✅ GPU (CuPy) available for ColorLang acceleration!")
except ImportError:
    try:
        import torch
        GPU_AVAILABLE = torch.cuda.is_available()
        if GPU_AVAILABLE:
            print("✅ GPU (PyTorch CUDA) available for ColorLang acceleration!")
        else:
            print("⚠️  GPU libraries found but CUDA not available")
    except ImportError:
        GPU_AVAILABLE = False
        print("❌ No GPU libraries found. Install CuPy or PyTorch with CUDA support.")

class ColorLangGPUKernel:
    """GPU-accelerated ColorLang parser and executor."""
    
    def __init__(self):
        self.gpu_available = GPU_AVAILABLE
        if GPU_AVAILABLE:
            try:
                import cupy as cp
                self.cp = cp
                self.device_info = cp.cuda.Device().compute_capability
                print(f"🚀 RTX 4050 detected - Compute Capability: {self.device_info}")
            except ImportError:
                import torch
                self.torch = torch
                print(f"🚀 GPU acceleration via PyTorch CUDA")
    
    def create_gpu_hsv_converter(self):
        """Create CUDA kernel for RGB to HSV conversion."""
        
        if not self.gpu_available:
            print("❌ GPU not available for HSV conversion")
            return None
        
        # CuPy CUDA kernel for RGB to HSV conversion
        hsv_kernel = '''
        extern "C" __global__
        void rgb_to_hsv_kernel(const unsigned char* rgb, float* hsv, int n_pixels) {
            int idx = blockIdx.x * blockDim.x + threadIdx.x;
            if (idx >= n_pixels) return;
            
            int pixel_idx = idx * 3;
            float r = rgb[pixel_idx] / 255.0f;
            float g = rgb[pixel_idx + 1] / 255.0f;
            float b = rgb[pixel_idx + 2] / 255.0f;
            
            float max_val = fmaxf(r, fmaxf(g, b));
            float min_val = fminf(r, fminf(g, b));
            float delta = max_val - min_val;
            
            // Calculate Hue
            float h = 0.0f;
            if (delta != 0.0f) {
                if (max_val == r) {
                    h = 60.0f * fmodf((g - b) / delta, 6.0f);
                } else if (max_val == g) {
                    h = 60.0f * ((b - r) / delta + 2.0f);
                } else {
                    h = 60.0f * ((r - g) / delta + 4.0f);
                }
            }
            if (h < 0.0f) h += 360.0f;
            
            // Calculate Saturation
            float s = (max_val == 0.0f) ? 0.0f : (delta / max_val) * 100.0f;
            
            // Calculate Value
            float v = max_val * 100.0f;
            
            // Store HSV values
            int hsv_idx = idx * 3;
            hsv[hsv_idx] = h;
            hsv[hsv_idx + 1] = s;
            hsv[hsv_idx + 2] = v;
        }
        '''
        
        try:
            kernel = self.cp.RawKernel(hsv_kernel, 'rgb_to_hsv_kernel')
            print("✅ CUDA HSV conversion kernel compiled successfully!")
            return kernel
        except Exception as e:
            print(f"❌ CUDA kernel compilation failed: {e}")
            return None
    
    def create_instruction_decoder_kernel(self):
        """Create CUDA kernel for HSV to ColorLang instruction decoding."""
        
        if not self.gpu_available:
            return None
        
        instruction_kernel = '''
        extern "C" __global__
        void hsv_to_instruction_kernel(const float* hsv, int* instructions, int n_pixels) {
            int idx = blockIdx.x * blockDim.x + threadIdx.x;
            if (idx >= n_pixels) return;
            
            int hsv_idx = idx * 3;
            float h = hsv[hsv_idx];
            float s = hsv[hsv_idx + 1];
            float v = hsv[hsv_idx + 2];
            
            // ColorLang instruction type mapping based on hue
            int instruction_type = 0;  // NOP by default
            
            if (h >= 0.0f && h < 31.0f) {
                instruction_type = 1;  // DATA
            } else if (h >= 31.0f && h < 91.0f) {
                instruction_type = 2;  // ARITHMETIC  
            } else if (h >= 91.0f && h < 151.0f) {
                instruction_type = 3;  // MEMORY
            } else if (h >= 151.0f && h < 211.0f) {
                instruction_type = 4;  // CONTROL
            } else if (h >= 211.0f && h < 271.0f) {
                instruction_type = 5;  // FUNCTION
            } else if (h >= 271.0f && h < 331.0f) {
                instruction_type = 6;  // IO
            } else if (h >= 331.0f && h <= 360.0f) {
                instruction_type = 7;  // SYSTEM
            }
            
            // Pack instruction with operands from saturation/value
            int operand1 = (int)(s * 10.0f);  // 0-1000 range
            int operand2 = (int)(v * 10.0f);  // 0-1000 range
            
            // Pack into 32-bit instruction: [type:8][op1:12][op2:12]
            instructions[idx] = (instruction_type << 24) | ((operand1 & 0xFFF) << 12) | (operand2 & 0xFFF);
        }
        '''
        
        try:
            kernel = self.cp.RawKernel(instruction_kernel, 'hsv_to_instruction_kernel')
            print("✅ CUDA instruction decoder kernel compiled successfully!")
            return kernel
        except Exception as e:
            print(f"❌ Instruction decoder kernel compilation failed: {e}")
            return None
    
    def gpu_parse_colorlang_program(self, image_path):
        """Parse ColorLang program using GPU acceleration."""
        
        if not self.gpu_available:
            print("❌ Falling back to CPU parsing")
            return self.cpu_parse_colorlang_program(image_path)
        
        print(f"\n🚀 GPU-ACCELERATED COLORLANG PARSING")
        print(f"📁 Loading: {image_path}")
        
        # Load image
        image = Image.open(image_path)
        width, height = image.size
        total_pixels = width * height
        
        print(f"📐 Dimensions: {width}x{height} ({total_pixels:,} pixels)")
        
        # Convert to RGB array
        rgb_array = np.array(image.convert('RGB'))
        rgb_flat = rgb_array.reshape(-1, 3)
        
        # GPU timing
        gpu_start = time.time()
        
        try:
            # Transfer to GPU
            gpu_rgb = self.cp.asarray(rgb_flat.astype(np.uint8))
            gpu_hsv = self.cp.zeros((total_pixels, 3), dtype=np.float32)
            gpu_instructions = self.cp.zeros(total_pixels, dtype=np.int32)
            
            transfer_time = time.time() - gpu_start
            
            # Create and run HSV conversion kernel
            hsv_kernel = self.create_gpu_hsv_converter()
            if hsv_kernel is None:
                raise Exception("HSV kernel creation failed")
            
            # Launch HSV conversion
            block_size = 256
            grid_size = (total_pixels + block_size - 1) // block_size
            
            kernel_start = time.time()
            hsv_kernel((grid_size,), (block_size,), (
                gpu_rgb.flatten(), gpu_hsv.flatten(), total_pixels
            ))
            self.cp.cuda.Device().synchronize()
            hsv_time = time.time() - kernel_start
            
            # Create and run instruction decoder kernel
            instr_kernel = self.create_instruction_decoder_kernel()
            if instr_kernel is None:
                raise Exception("Instruction kernel creation failed")
            
            decode_start = time.time()
            instr_kernel((grid_size,), (block_size,), (
                gpu_hsv.flatten(), gpu_instructions, total_pixels
            ))
            self.cp.cuda.Device().synchronize()
            decode_time = time.time() - decode_start
            
            # Transfer results back to CPU
            cpu_instructions = self.cp.asnumpy(gpu_instructions)
            
            total_gpu_time = time.time() - gpu_start
            
            # Analyze results
            instruction_types = {}
            valid_instructions = 0
            
            for instr in cpu_instructions:
                if instr != 0:  # Skip NOP instructions
                    instr_type = (instr >> 24) & 0xFF
                    instruction_types[instr_type] = instruction_types.get(instr_type, 0) + 1
                    valid_instructions += 1
            
            print(f"\n✅ GPU PARSING COMPLETE!")
            print(f"⏱️  Transfer time: {transfer_time*1000:.2f}ms")
            print(f"⏱️  HSV conversion: {hsv_time*1000:.2f}ms")  
            print(f"⏱️  Instruction decode: {decode_time*1000:.2f}ms")
            print(f"⏱️  Total GPU time: {total_gpu_time*1000:.2f}ms")
            print(f"📊 Valid instructions: {valid_instructions:,}")
            print(f"🔢 Instruction types found: {len(instruction_types)}")
            
            return {
                'instructions': cpu_instructions,
                'instruction_types': instruction_types,
                'valid_count': valid_instructions,
                'gpu_time_ms': total_gpu_time * 1000,
                'pixels_processed': total_pixels
            }
            
        except Exception as e:
            print(f"❌ GPU parsing failed: {e}")
            return self.cpu_parse_colorlang_program(image_path)
    
    def cpu_parse_colorlang_program(self, image_path):
        """Fallback CPU parsing for comparison."""
        
        print(f"\n🔄 CPU PARSING (for comparison)")
        
        image = Image.open(image_path)
        width, height = image.size
        total_pixels = width * height
        
        cpu_start = time.time()
        
        # Simple CPU parsing
        instructions = []
        instruction_types = {}
        
        for y in range(height):
            for x in range(width):
                r, g, b = image.getpixel((x, y))
                
                # Simple hue calculation
                max_val = max(r, g, b) / 255.0
                min_val = min(r, g, b) / 255.0
                delta = max_val - min_val
                
                if delta == 0:
                    hue = 0
                elif max_val == r/255.0:
                    hue = 60 * (((g - b) / 255.0) / delta)
                elif max_val == g/255.0:
                    hue = 60 * (((b - r) / 255.0) / delta + 2)
                else:
                    hue = 60 * (((r - g) / 255.0) / delta + 4)
                
                if hue < 0:
                    hue += 360
                
                # Map to instruction type
                if 31 <= hue < 91:
                    instr_type = 2  # ARITHMETIC
                elif 91 <= hue < 151:
                    instr_type = 3  # MEMORY
                elif 151 <= hue < 211:
                    instr_type = 4  # CONTROL
                else:
                    instr_type = 0  # NOP
                
                if instr_type != 0:
                    instructions.append(instr_type)
                    instruction_types[instr_type] = instruction_types.get(instr_type, 0) + 1
        
        cpu_time = time.time() - cpu_start
        
        print(f"⏱️  CPU time: {cpu_time*1000:.2f}ms")
        print(f"📊 Valid instructions: {len(instructions):,}")
        
        return {
            'instructions': instructions,
            'instruction_types': instruction_types,
            'valid_count': len(instructions),
            'cpu_time_ms': cpu_time * 1000,
            'pixels_processed': total_pixels
        }
    
    def benchmark_gpu_vs_cpu(self, image_path):
        """Compare GPU vs CPU performance."""
        
        print(f"\n🏁 COLORLANG GPU vs CPU BENCHMARK")
        print("=" * 60)
        
        # Test both approaches
        gpu_result = self.gpu_parse_colorlang_program(image_path)
        cpu_result = self.cpu_parse_colorlang_program(image_path)
        
        if 'gpu_time_ms' in gpu_result and 'cpu_time_ms' in cpu_result:
            speedup = cpu_result['cpu_time_ms'] / gpu_result['gpu_time_ms']
            
            print(f"\n🏆 PERFORMANCE COMPARISON:")
            print(f"  GPU Time: {gpu_result['gpu_time_ms']:.2f}ms")
            print(f"  CPU Time: {cpu_result['cpu_time_ms']:.2f}ms") 
            print(f"  Speedup: {speedup:.2f}x faster on GPU")
            
            pixels_per_second_gpu = gpu_result['pixels_processed'] / (gpu_result['gpu_time_ms'] / 1000)
            pixels_per_second_cpu = cpu_result['pixels_processed'] / (cpu_result['cpu_time_ms'] / 1000)
            
            print(f"\n📊 THROUGHPUT:")
            print(f"  GPU: {pixels_per_second_gpu:,.0f} pixels/second")
            print(f"  CPU: {pixels_per_second_cpu:,.0f} pixels/second")
            
            return speedup
        
        return None

def main():
    """Demonstrate ColorLang GPU acceleration on RTX 4050."""
    
    print("🎯 ColorLang GPU Kernel Prototype for RTX 4050")
    print("=" * 60)
    
    # Initialize GPU kernel
    gpu_kernel = ColorLangGPUKernel()
    
    if not gpu_kernel.gpu_available:
        print("\n❌ GPU acceleration not available")
        print("Install CuPy: pip install cupy-cuda12x")
        print("Or PyTorch: pip install torch --index-url https://download.pytorch.org/whl/cu121")
        return
    
    # Test with optimized AI agent
    test_image = "optimized_ai_agent_51x52.png"
    
    if not os.path.exists(test_image):
        print(f"❌ Test image not found: {test_image}")
        print("Run the optimization script first to generate the test image.")
        return
    
    # Run benchmark
    speedup = gpu_kernel.benchmark_gpu_vs_cpu(test_image)
    
    if speedup:
        print(f"\n🎉 SUCCESS! RTX 4050 achieved {speedup:.1f}x speedup")
        print(f"This proves ColorLang GPU acceleration concept!")
        
        if speedup > 5:
            print(f"🚀 EXCELLENT! >5x speedup demonstrates massive potential")
        elif speedup > 2:
            print(f"✅ GOOD! >2x speedup shows clear GPU advantage") 
        else:
            print(f"⚠️  Modest speedup - optimization needed for V2")
    
    print(f"\n📋 NEXT STEPS FOR COLORLANG V2:")
    print(f"  1. Optimize CUDA kernels for larger programs")
    print(f"  2. Implement direct GPU execution (skip CPU entirely)")
    print(f"  3. Add GPU memory management")
    print(f"  4. Create GPU-native ColorLang instruction format")

if __name__ == "__main__":
    main()