"""
ColorLang Test Runner and Demo
Comprehensive testing and demonstration of ColorLang features.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import colorlang
from colorlang.debugger import ColorDebugger
from examples.create_examples import create_all_examples
import time

def run_basic_tests():
    """Run basic functionality tests."""
    print("🧪 Running ColorLang Basic Tests")
    print("=" * 40)
    
    # Test 1: Parser functionality
    print("\n1. Testing Color Parser...")
    try:
        parser = colorlang.ColorParser()
        
        # Test pixel parsing
        instruction = parser.parse_pixel(255, 0, 0, (0, 0))  # Red pixel
        print(f"   ✓ Parsed red pixel: {instruction['type']} at hue {instruction['hue']:.1f}°")
        
        # Test HSV conversion
        h, s, v = parser.rgb_to_hsv(255, 128, 0)  # Orange
        print(f"   ✓ RGB to HSV conversion: ({h:.1f}°, {s:.1f}%, {v:.1f}%)")
        
    except Exception as e:
        print(f"   ❌ Parser test failed: {e}")
        return False
    
    # Test 2: Instruction Set
    print("\n2. Testing Instruction Set...")
    try:
        from colorlang.instruction_set import InstructionSet
        inst_set = InstructionSet()
        
        # Test operation lookup
        op = inst_set.get_operation_by_hue(35)  # ADD operation
        print(f"   ✓ Found operation for hue 35°: {op}")
        
        # Test data encoding
        hsv = inst_set.encode_data_value(42, 'INTEGER')
        print(f"   ✓ Encoded integer 42 as HSV: {hsv}")
        
    except Exception as e:
        print(f"   ❌ Instruction set test failed: {e}")
        return False
    
    # Test 3: Virtual Machine
    print("\n3. Testing Virtual Machine...")
    try:
        vm = colorlang.ColorVM()
        
        # Test register operations
        vm.set_register('DR0', 100)
        value = vm.get_register('DR0')
        print(f"   ✓ Register operations: set/get DR0 = {value}")
        
        # Test state management
        state = vm.get_state()
        print(f"   ✓ VM state access: PC at {state['pc']}")
        
    except Exception as e:
        print(f"   ❌ Virtual machine test failed: {e}")
        return False
    
    print("\n✅ All basic tests passed!")
    return True

def run_example_programs():
    """Run all example programs and display results."""
    print("\n🚀 Running ColorLang Example Programs")
    print("=" * 40)
    
    # Create examples if they don't exist
    print("\n📝 Creating example programs...")
    examples = create_all_examples()
    print(f"   Created {len(examples)} example programs")
    
    # Test each example
    for i, example in enumerate(examples, 1):
        print(f"\n{i}. Testing {example['filename']}...")
        
        try:
            # Load program
            program = colorlang.load_program(example['filepath'])
            print(f"   ✓ Loaded program ({program['width']}x{program['height']} pixels)")
            
            # Execute program
            result = colorlang.execute(program)
            
            if result.get('exit_code', -1) == 0:
                print(f"   ✅ Execution successful!")
                
                # Show output if any
                if 'output' in result and result['output']:
                    print(f"   📤 Output: {result['output']}")
                
                # Show statistics
                stats = result.get('execution_stats', {})
                print(f"   📊 Stats: {stats.get('instructions_executed', 0)} instructions, " +
                      f"{stats.get('cycles_elapsed', 0)} cycles")
            else:
                print(f"   ❌ Execution failed: {result.get('error', 'Unknown error')}")
        
        except Exception as e:
            print(f"   ❌ Test failed: {e}")
    
    return True

def demonstrate_debugging():
    """Demonstrate debugging capabilities."""
    print("\n🔍 Demonstrating ColorLang Debugger")
    print("=" * 40)
    
    try:
        # Create a simple program for debugging
        sample_program = colorlang.create_sample_program()
        sample_program.save("debug_sample.png")
        
        # Load and parse program
        program = colorlang.load_program("debug_sample.png")
        
        # Create VM and debugger
        vm = colorlang.ColorVM()
        debugger = ColorDebugger(vm)
        
        print("\n1. Setting up debugger...")
        # Add breakpoint at position (1, 0)
        debugger.add_breakpoint(1, 0)
        print("   ✓ Added breakpoint at (1, 0)")
        
        # Add register watch
        debugger.add_register_watch('DR0')
        print("   ✓ Watching register DR0")
        
        print("\n2. Running with debugging...")
        
        # Define callback for breakpoints
        def on_breakpoint(state):
            print(f"   🛑 Breakpoint hit! PC: {state['pc']}, Cycles: {state['cycle_count']}")
        
        debugger.on_breakpoint = on_breakpoint
        
        # Execute with debugging
        result = debugger.run_with_debugging(program)
        
        print(f"\n3. Debug execution completed:")
        print(f"   Exit code: {result.get('exit_code', 'N/A')}")
        
        if 'debug_info' in result:
            debug_info = result['debug_info']
            print(f"   Total steps: {debug_info.get('total_steps', 0)}")
            print(f"   Breakpoints hit: {debug_info.get('breakpoints_hit', 0)}")
        
        # Generate execution report
        print("\n4. Generating execution report...")
        report = debugger.generate_execution_report()
        with open("debug_report.txt", "w") as f:
            f.write(report)
        print("   ✓ Report saved to debug_report.txt")
        
        # Create visualization
        print("\n5. Creating program visualization...")
        vis_img = debugger.visualize_program(program, "program_visualization.png")
        print(f"   ✓ Visualization saved ({vis_img.size[0]}x{vis_img.size[1]} pixels)")
        
        # Cleanup
        os.remove("debug_sample.png")
        
    except Exception as e:
        print(f"   ❌ Debugging demonstration failed: {e}")
        return False
    
    print("\n✅ Debugging demonstration completed!")
    return True

def demonstrate_monkey_cognition():
    """Demonstrate monkey cognition integration."""
    print("\n🐒 Demonstrating Monkey Cognition Integration")
    print("=" * 40)
    
    try:
        # Load monkey cognition demo
        program = colorlang.load_program("examples/monkey_cognition_demo.png")
        
        print("\n1. Analyzing monkey thought pattern...")
        instructions = program['instructions'][0]  # First row
        
        parser = colorlang.ColorParser()
        
        for i, instruction in enumerate(instructions):
            if instruction['type'] != 'SYSTEM':  # Skip HALT
                op_name = parser.get_operation_name(instruction)
                hue = instruction['hue']
                sat = instruction['saturation']
                val = instruction['value']
                
                # Interpret based on monkey cognition mapping
                if 0 <= hue < 31:
                    thought_type = "Emotion"
                    intensity = sat
                    confidence = val
                elif 31 <= hue < 91:
                    thought_type = "Action Intent"
                    intensity = sat
                    confidence = val
                elif 91 <= hue < 151:
                    thought_type = "Memory Recall"
                    intensity = sat
                    confidence = val
                elif 271 <= hue < 331:
                    thought_type = "Goal Evaluation"
                    intensity = sat
                    confidence = val
                else:
                    continue
                
                print(f"   Pixel {i}: {thought_type}")
                print(f"      Hue: {hue:.1f}° | Intensity: {intensity:.1f}% | Confidence: {confidence:.1f}%")
        
        print("\n2. Simulating monkey decision process...")
        
        # Execute the cognition program
        result = colorlang.execute(program)
        
        if result.get('exit_code') == 0:
            print("   ✅ Monkey cognition simulation completed successfully!")
            
            # Interpret the result
            final_registers = result.get('final_registers', {})
            dr0_value = final_registers.get('data', {}).get('DR0', 0)
            
            if dr0_value > 50:
                decision = "JUMP - High confidence action"
            elif dr0_value > 0:
                decision = "CONSIDER - Moderate confidence"
            else:
                decision = "WAIT - Low confidence or fear"
            
            print(f"   🧠 Final decision: {decision} (confidence: {dr0_value})")
        
    except Exception as e:
        print(f"   ❌ Monkey cognition demo failed: {e}")
        return False
    
    print("\n✅ Monkey cognition demonstration completed!")
    return True

def performance_benchmark():
    """Run performance benchmarks."""
    print("\n⚡ ColorLang Performance Benchmark")
    print("=" * 40)
    
    try:
        # Create a computational program for benchmarking
        from examples.create_examples import create_fibonacci_sequence
        fib_program = create_fibonacci_sequence()
        
        # Load program
        program = colorlang.load_program(fib_program['filepath'])
        
        print(f"\n1. Benchmarking Fibonacci sequence calculation...")
        print(f"   Program size: {program['width']}x{program['height']} pixels")
        
        # Measure execution time
        start_time = time.time()
        result = colorlang.execute(program)
        end_time = time.time()
        
        execution_time = (end_time - start_time) * 1000  # Convert to milliseconds
        
        if result.get('exit_code') == 0:
            stats = result.get('execution_stats', {})
            instructions = stats.get('instructions_executed', 0)
            cycles = stats.get('cycles_elapsed', 0)
            
            print(f"   ✅ Execution completed successfully!")
            print(f"   ⏱️  Execution time: {execution_time:.2f} ms")
            print(f"   🔢 Instructions executed: {instructions}")
            print(f"   🔄 Cycles elapsed: {cycles}")
            
            if execution_time > 0:
                ips = (instructions / execution_time) * 1000  # Instructions per second
                print(f"   🚀 Performance: {ips:.0f} instructions/second")
            
        else:
            print(f"   ❌ Benchmark failed: {result.get('error')}")
    
    except Exception as e:
        print(f"   ❌ Benchmark failed: {e}")
        return False
    
    print("\n✅ Performance benchmark completed!")
    return True

def main():
    """Main test runner function."""
    print("🎨 ColorLang Comprehensive Test Suite")
    print("====================================")
    
    all_passed = True
    
    # Run test suites
    test_suites = [
        ("Basic Functionality", run_basic_tests),
        ("Example Programs", run_example_programs),
        ("Debugging Features", demonstrate_debugging),
        ("Monkey Cognition", demonstrate_monkey_cognition),
        ("Performance", performance_benchmark)
    ]
    
    for suite_name, test_func in test_suites:
        print(f"\n{'='*50}")
        print(f"Running {suite_name} Tests")
        print('='*50)
        
        try:
            success = test_func()
            if not success:
                all_passed = False
        except Exception as e:
            print(f"❌ {suite_name} test suite failed: {e}")
            all_passed = False
    
    # Final summary
    print(f"\n{'='*50}")
    print("TEST SUMMARY")
    print('='*50)
    
    if all_passed:
        print("🎉 ALL TESTS PASSED!")
        print("ColorLang is ready for use!")
    else:
        print("⚠️  Some tests failed. Please check the output above.")
    
    print(f"\n📁 Generated files:")
    print("   - examples/ (sample programs)")
    print("   - debug_report.txt (execution report)")
    print("   - program_visualization.png (visual debug)")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)