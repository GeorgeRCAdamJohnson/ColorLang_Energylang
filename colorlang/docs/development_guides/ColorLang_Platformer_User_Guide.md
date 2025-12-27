# ColorLang Platformer User Guide

## Overview

The ColorLang Platformer is a complete demonstration of machine-native programming, where a 2D platformer game is encoded as HSV color values in a PNG image and executed in real-time by the ColorLang virtual machine.

## Quick Start

### Prerequisites
- Python 3.7+
- Pillow (PIL) for image processing
- Pygame (optional, for interactive GUI mode)

### Installation
```bash
# Navigate to ColorLang directory
cd "C:\new language"

# Install required dependencies
pip install pillow pygame

# Run the interactive demo
python interactive_platformer_demo.py
```

## System Components

### 1. ColorLang Kernel Image
**File**: `advanced_platformer_kernel_fixed.png`
- **Size**: 17x19 pixels (323 total pixels)
- **Content**: Complete platformer game logic encoded in HSV colors
- **Data**: World tiles, agent state, game loop, physics calculations

### 2. Host Application
**File**: `demos/platformer_colorlang/platformer_host.py`
- **Purpose**: Executes ColorLang kernel and provides game interface
- **Modes**: 
  - GUI mode (pygame) - Full interactive experience
  - Console mode - Text-based demonstration

### 3. Interactive Demo
**File**: `interactive_platformer_demo.py`
- **Purpose**: Easy-to-run demonstration of the complete system
- **Features**: Auto-detection of pygame, fallback modes, user guidance

## How It Works

### Color Encoding System
ColorLang uses HSV (Hue, Saturation, Value) color space to encode instructions:

```
Instruction Types by Hue Range:
- DATA (0-30°):     World tiles, counters, variables
- ARITHMETIC (31-90°): Math operations, calculations  
- MEMORY (91-150°): Memory access, storage operations
- CONTROL (151-210°): Loops, conditionals, jumps
- IO (271-330°):    Input/output, rendering operations  
- SYSTEM (331-360°): System calls, halt operations
```

### Game Data Structure
The platformer kernel contains:
1. **Frame Counter**: Tracks game time/animation
2. **World Tilemap**: 20x12 grid of tile types (0=empty, 1=solid, etc.)
3. **Agent State**: Player position, velocity, status
4. **Game Logic**: Physics, collision detection, rendering

### Execution Model
1. **Parsing**: ColorParser converts PNG pixels to instructions
2. **Loading**: VM loads instruction set into memory
3. **Execution**: Threaded VM processes instructions continuously
4. **Rendering**: Host application displays current game state
5. **Input**: User input influences agent state in real-time

## Usage Examples

### Basic Demo Run
```python
from demos.platformer_colorlang.platformer_host import PlatformerHost

# Create and run the platformer
host = PlatformerHost()
if host.load_kernel():
    host.run()  # Interactive mode if pygame available
```

### Console Mode Only
```python
import threading
import time

host = PlatformerHost()
if host.load_kernel():
    stop_event = threading.Event()
    
    # Run in background thread
    thread = threading.Thread(target=host.run, args=(stop_event,))
    thread.start()
    
    # Let it run for 5 seconds
    time.sleep(5)
    stop_event.set()
```

### Custom Kernel Loading
```python
from colorlang.color_parser import ColorParser

# Parse your own ColorLang image
parser = ColorParser()
program = parser.parse_image("my_custom_kernel.png")
print(f"Loaded {len(program['instructions'])} instructions")
```

## Controls (Interactive Mode)

When running with pygame GUI mode:
- **Arrow Keys**: Move agent left/right, up/down
- **ESC**: Exit the game
- **Close Window**: Quit application
- **Space**: Jump (if implemented in kernel logic)

## Troubleshooting

### Common Issues

**"Pygame not available"**
```bash
pip install pygame
```

**"Failed to load kernel"**
- Ensure `advanced_platformer_kernel_fixed.png` exists
- Check file path is correct
- Verify PNG file is not corrupted

**"Console mode only"**
- This is normal if pygame is not installed
- Install pygame for full interactive experience
- Console mode still demonstrates ColorLang execution

**Performance Issues**
- Reduce window size in pygame mode
- Close other applications for more CPU resources
- Use console mode for better performance on slower systems

### Debug Information

Enable debug output for troubleshooting:
```python
# In platformer_host.py, the VM automatically shows debug info
# Look for [DEBUG] messages in console output
```

## Technical Details

### File Structure
```
C:\new language\
├── advanced_platformer_kernel_fixed.png    # ColorLang kernel image
├── interactive_platformer_demo.py          # Easy demo launcher
├── colorlang/                              # ColorLang VM and parser
│   ├── virtual_machine.py                  # VM execution engine
│   ├── color_parser.py                     # Image-to-instruction parser
│   └── micro_assembler.py                  # Kernel generation tools
└── demos/platformer_colorlang/             # Platformer implementation
    ├── platformer_host.py                  # Main host application
    └── ...
```

### Performance Characteristics
- **Parsing Time**: ~50ms for 323-pixel kernel
- **Execution Speed**: Real-time capable (30+ FPS)
- **Memory Usage**: Minimal (few MB for complete system)
- **CPU Usage**: Low (optimized threaded execution)

### Color Encoding Details
Example instruction encodings in the kernel:
```
RGB(191,141,133) -> HSV(8.3°, 30.4%, 74.9%) = DATA (tile type 0)
RGB(204,161,99)  -> HSV(35.4°, 51.5%, 80.0%) = ARITHMETIC operation
RGB(173,91,229)  -> HSV(275.7°, 60.3%, 89.8%) = IO operation  
RGB(204,99,142)  -> HSV(335.4°, 51.5%, 80.0%) = SYSTEM halt
```

## Advanced Usage

### Creating Custom Kernels
Use the micro-assembler to generate your own ColorLang programs:
```python
from colorlang.micro_assembler import MicroAssembler

assembler = MicroAssembler()
# Add your game logic
assembler.add_world_data(width=20, height=12, tiles=my_tiles)
assembler.add_agent_state(x=5, y=8, velocity=(0,0))
# Generate the kernel image
assembler.save_kernel("my_game.png")
```

### Extending the Host Application
The platformer host can be customized for different game types:
- Modify `GameState` dataclass for different data structures
- Update rendering logic in `render_console()` or pygame sections  
- Add new input handling in the main game loop
- Implement custom physics or game mechanics

## Integration Examples

### Web Integration
The ColorLang system can be integrated into web applications:
```javascript
// Call Python backend running ColorLang
fetch('/api/colorlang/step')
  .then(response => response.json())
  .then(gameState => updateGameDisplay(gameState));
```

### Real-time Applications
For real-time systems, use the threaded execution model:
```python
# Continuous execution with state monitoring
def monitor_game_state(host):
    while host.running:
        state = host.get_current_state()
        send_to_external_system(state)
        time.sleep(0.016)  # ~60 FPS monitoring
```

## Conclusion

The ColorLang Platformer demonstrates the full potential of machine-native programming languages. By encoding complete game logic as colored pixels, we achieve:

- **Ultra-compact programs**: Entire games in small PNG files
- **Visual programming**: Code visible as colorful images
- **Real-time performance**: Suitable for interactive applications  
- **Cross-platform compatibility**: Runs anywhere Python runs

This system opens new possibilities for game development, educational tools, and novel programming paradigms.

---

## Support and Resources

- **Source Code**: Available in the ColorLang repository
- **Examples**: See `examples/` directory for more ColorLang programs
- **Documentation**: Complete docs in `docs/` directory
- **Issues**: Report problems via the project issue tracker

*Happy ColorLang programming!* 🎨🎮