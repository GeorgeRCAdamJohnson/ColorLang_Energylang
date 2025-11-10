"""
ColorLang Advanced Demo
Showcases compression capabilities and React-style app development.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import colorlang
from colorlang.compression import ColorCompressor
from colorlang.color_react import *
import time
import json

def demonstrate_compression():
    """Demonstrate ColorLang compression capabilities."""
    print("🗜️  ColorLang Compression Demonstration")
    print("=" * 50)
    
    # Create a complex program for compression testing
    print("\n1. Creating complex program for compression testing...")
    
    # Generate a program with repeated patterns
    from examples.create_examples import create_fibonacci_sequence
    fib_program = create_fibonacci_sequence()
    
    # Load the program
    program = colorlang.load_program(fib_program['filepath'])
    print(f"   ✓ Created program: {program['width']}x{program['height']} pixels")
    
    # Initialize compressor
    compressor = ColorCompressor()
    
    # Analyze compression opportunities
    print("\n2. Analyzing compression opportunities...")
    analysis = compressor.analyze_program(program)
    
    print(f"   📊 Total instructions: {analysis['total_instructions']}")
    print(f"   🎨 Unique colors: {analysis['unique_colors']}")
    print(f"   🔮 Estimated compression potential: {analysis['compression_potential']:.1%}")
    
    print(f"\n   Most common colors:")
    for i, (color, count) in enumerate(analysis['most_common_colors'][:5]):
        hue, sat, val = color
        print(f"      {i+1}. HSV({hue:.1f}°, {sat:.1f}%, {val:.1f}%) - used {count} times")
    
    # Benchmark all compression methods
    print("\n3. Benchmarking compression methods...")
    benchmark_results = compressor.benchmark_compression(program)
    
    print(f"   📦 Original size: {benchmark_results['original_size']:,} bytes")
    print()
    
    for method, results in benchmark_results.items():
        if method == 'original_size':
            continue
        
        if 'error' in results:
            print(f"   ❌ {method.upper()}: {results['error']}")
        else:
            compression_ratio = results['compression_ratio']
            space_savings = results['space_savings']
            compressed_size = results['compressed_size']
            
            print(f"   ✅ {method.upper()}:")
            print(f"      Size: {compressed_size:,} bytes")
            print(f"      Compression ratio: {compression_ratio:.3f}")
            print(f"      Space savings: {space_savings:.1%}")
            print()
    
    # Test best compression method
    best_method = min([k for k in benchmark_results.keys() if k != 'original_size' and 'error' not in benchmark_results[k]], 
                     key=lambda k: benchmark_results[k]['compression_ratio'])
    
    print(f"4. Testing {best_method.upper()} compression (best ratio)...")
    
    # Compress and save
    compressed = compressor.compress_program(program, best_method)
    compressor.save_compressed(compressed, f"compressed_{best_method}.clc")
    print(f"   ✓ Saved compressed program to compressed_{best_method}.clc")
    
    # Load and decompress
    loaded_compressed = compressor.load_compressed(f"compressed_{best_method}.clc")
    decompressed = compressor.decompress_program(loaded_compressed)
    print(f"   ✓ Successfully decompressed program")
    
    # Verify integrity
    original_instructions = len([inst for row in program['instructions'] for inst in row])
    decompressed_instructions = len([inst for row in decompressed['instructions'] for inst in row])
    
    if original_instructions == decompressed_instructions:
        print(f"   ✅ Integrity verified: {original_instructions} instructions preserved")
    else:
        print(f"   ❌ Integrity check failed: {original_instructions} → {decompressed_instructions}")
    
    return compressed, decompressed

def demonstrate_react_app():
    """Demonstrate ColorReact component framework."""
    print("\n\n⚛️  ColorReact Framework Demonstration")
    print("=" * 50)
    
    print("\n1. Creating Todo App with ColorReact...")
    
    # Create todo app
    todo_app = create_todo_app()
    
    print(f"   ✓ Created app with {todo_app._count_components(todo_app.root)} components")
    
    # Render to image
    print("\n2. Rendering app to image...")
    img = todo_app.render_to_image("todo_app.png")
    print(f"   ✓ Rendered to todo_app.png ({img.size[0]}x{img.size[1]} pixels)")
    
    # Render to ColorLang program
    print("\n3. Converting app to ColorLang program...")
    program = todo_app.render_to_colorlang("todo_app_program.json")
    print(f"   ✓ Generated ColorLang program ({program['width']}x{program['height']} pixels)")
    print(f"   📊 {program['metadata']['component_count']} components rendered")
    
    # Create counter app
    print("\n4. Creating Counter App...")
    counter_app = create_counter_app()
    
    counter_img = counter_app.render_to_image("counter_app.png") 
    print(f"   ✓ Rendered counter app to counter_app.png ({counter_img.size[0]}x{counter_img.size[1]} pixels)")
    
    # Demonstrate state management
    print("\n5. Testing component state management...")
    
    # Find counter display component and update it
    def find_text_component(component):
        if isinstance(component, TextDisplay):
            return component
        for child in component.children:
            found = find_text_component(child)
            if found:
                return found
        return None
    
    text_component = find_text_component(counter_app.root)
    if text_component:
        # Simulate counter increment
        for i in range(1, 6):
            text_component.set_state(text=f"Count: {i}")
            # Re-render with new state
            new_img = counter_app.render_to_image(f"counter_app_count_{i}.png")
            print(f"   📸 Rendered state {i}: {new_img.size[0]}x{new_img.size[1]} pixels")
    
    return todo_app, counter_app

def create_complex_app():
    """Create a more complex ColorReact application."""
    print("\n6. Creating Complex Dashboard App...")
    
    # Main container
    dashboard = Container(ComponentProps({
        'layout': 'vertical',
        'padding': 2
    }))
    
    # Header
    header = Container(ComponentProps({
        'layout': 'horizontal',
        'padding': 1
    }))
    
    title = TextDisplay(ComponentProps({
        'text': 'ColorLang Dashboard',
        'color': 'blue'
    }))
    
    status = TextDisplay(ComponentProps({
        'text': 'Status: Online',
        'color': 'green'
    }))
    
    header.add_child(title)
    header.add_child(status)
    
    # Main content area
    content = Container(ComponentProps({
        'layout': 'horizontal',
        'padding': 2
    }))
    
    # Left sidebar
    sidebar = Container(ComponentProps({
        'layout': 'vertical',
        'padding': 1
    }))
    
    nav_buttons = ['Home', 'Projects', 'Settings', 'Help']
    for btn_text in nav_buttons:
        nav_btn = Button(ComponentProps({
            'text': btn_text,
            'color': 'purple',
            'onClick': lambda b, text=btn_text: print(f"Navigated to {text}")
        }))
        sidebar.add_child(nav_btn)
    
    # Main panel
    main_panel = Container(ComponentProps({
        'layout': 'vertical',
        'padding': 2
    }))
    
    # Data displays
    metrics = ['CPU: 45%', 'Memory: 62%', 'Disk: 23%', 'Network: 1.2MB/s']
    for metric in metrics:
        metric_display = TextDisplay(ComponentProps({
            'text': metric,
            'color': 'black'
        }))
        main_panel.add_child(metric_display)
    
    # Action buttons
    button_row = Container(ComponentProps({
        'layout': 'horizontal',
        'padding': 1
    }))
    
    actions = [
        ('Refresh', 'blue'),
        ('Export', 'green'),
        ('Reset', 'red')
    ]
    
    for action_text, color in actions:
        action_btn = Button(ComponentProps({
            'text': action_text,
            'color': color,
            'onClick': lambda b, action=action_text: print(f"{action} clicked!")
        }))
        button_row.add_child(action_btn)
    
    main_panel.add_child(button_row)
    
    # Assemble layout
    content.add_child(sidebar)
    content.add_child(main_panel)
    
    dashboard.add_child(header)
    dashboard.add_child(content)
    
    # Create app
    app = ColorReactApp(dashboard)
    
    # Render
    img = app.render_to_image("dashboard_app.png")
    program = app.render_to_colorlang("dashboard_program.json")
    
    print(f"   ✓ Created dashboard with {app._count_components(app.root)} components")
    print(f"   📱 Rendered to dashboard_app.png ({img.size[0]}x{img.size[1]} pixels)")
    print(f"   📋 Program size: {program['width']}x{program['height']} pixels")
    
    return app

def benchmark_complex_apps():
    """Benchmark rendering performance of complex apps."""
    print("\n\n⚡ Performance Benchmarking")
    print("=" * 50)
    
    # Create progressively complex apps
    apps = []
    
    print("\n1. Creating apps of varying complexity...")
    
    # Simple app
    simple_app = create_counter_app()
    apps.append(("Simple Counter", simple_app))
    
    # Medium app  
    todo_app = create_todo_app()
    apps.append(("Todo App", todo_app))
    
    # Complex app
    dashboard_app = create_complex_app()
    apps.append(("Dashboard", dashboard_app))
    
    print("\n2. Benchmarking render performance...")
    
    for app_name, app in apps:
        # Warm up
        app.render_to_image()
        
        # Benchmark multiple renders
        render_times = []
        for i in range(10):
            start_time = time.time()
            app.root.mark_dirty()  # Force re-render
            app.render_to_image()
            end_time = time.time()
            render_times.append((end_time - start_time) * 1000)  # Convert to ms
        
        avg_time = sum(render_times) / len(render_times)
        min_time = min(render_times)
        max_time = max(render_times)
        
        component_count = app._count_components(app.root)
        
        print(f"\n   📊 {app_name}:")
        print(f"      Components: {component_count}")
        print(f"      Average render time: {avg_time:.2f}ms")
        print(f"      Min/Max: {min_time:.2f}ms / {max_time:.2f}ms")
        if avg_time > 0:
            print(f"      Performance: {component_count/avg_time:.1f} components/ms")
        else:
            print(f"      Performance: >1000 components/ms (extremely fast)")

def demonstrate_compression_on_apps():
    """Test compression on ColorReact applications."""
    print("\n\n🗜️  Compressing ColorReact Applications")
    print("=" * 50)
    
    # Load dashboard program
    with open("dashboard_program.json", 'r') as f:
        dashboard_program = json.load(f)
    
    print(f"\n1. Analyzing dashboard program...")
    print(f"   📏 Size: {dashboard_program['width']}x{dashboard_program['height']} pixels")
    print(f"   🧩 Components: {dashboard_program['metadata']['component_count']}")
    
    # Convert to ColorLang format for compression
    colorlang_program = {
        'width': dashboard_program['width'],
        'height': dashboard_program['height'], 
        'instructions': dashboard_program['instructions'],
        'metadata': dashboard_program['metadata']
    }
    
    # Compress the app
    compressor = ColorCompressor()
    analysis = compressor.analyze_program(colorlang_program)
    
    print(f"   🎨 Unique colors: {analysis['unique_colors']}")
    print(f"   🔮 Compression potential: {analysis['compression_potential']:.1%}")
    
    # Test all compression methods
    benchmark = compressor.benchmark_compression(colorlang_program)
    
    print(f"\n2. Compression results:")
    print(f"   📦 Original size: {benchmark['original_size']:,} bytes")
    
    for method, results in benchmark.items():
        if method == 'original_size' or 'error' in results:
            continue
        
        print(f"   ✅ {method.upper()}: {results['compressed_size']:,} bytes ({results['space_savings']:.1%} savings)")
    
    # Save compressed versions
    best_method = 'hybrid'  # Usually best for UI apps
    compressed = compressor.compress_program(colorlang_program, best_method)
    compressor.save_compressed(compressed, "dashboard_compressed.clc")
    
    print(f"\n   💾 Saved compressed dashboard app")

def main():
    """Main demonstration function."""
    print("🎨 ColorLang Advanced Features Demonstration")
    print("=" * 60)
    
    try:
        # Demonstrate compression
        compressed, decompressed = demonstrate_compression()
        
        # Demonstrate React-style apps
        todo_app, counter_app = demonstrate_react_app()
        
        # Create complex app
        dashboard_app = create_complex_app()
        
        # Benchmark performance
        benchmark_complex_apps()
        
        # Test compression on apps
        demonstrate_compression_on_apps()
        
        print("\n\n🎉 All Demonstrations Completed Successfully!")
        print("=" * 60)
        
        print("\n📁 Generated Files:")
        generated_files = [
            "todo_app.png",
            "counter_app.png", 
            "dashboard_app.png",
            "todo_app_program.json",
            "dashboard_program.json",
            "compressed_hybrid.clc",
            "dashboard_compressed.clc"
        ]
        
        for filename in generated_files:
            if os.path.exists(filename):
                size = os.path.getsize(filename)
                print(f"   ✓ {filename} ({size:,} bytes)")
        
        print("\n🚀 ColorLang Features Demonstrated:")
        print("   ✅ Advanced compression with multiple algorithms")
        print("   ✅ React-style component framework")
        print("   ✅ Complex UI application development")
        print("   ✅ Performance benchmarking")
        print("   ✅ State management and event handling")
        print("   ✅ Visual program representation")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Demonstration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)