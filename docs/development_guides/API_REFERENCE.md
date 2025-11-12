# ColorLang API Reference Manual

## Overview
This comprehensive API reference documents all public classes, methods, and functions in the ColorLang programming language. Use this as your complete guide to ColorLang's programming interface.

## Core Module (`colorlang`)

### Module Information
- **Version**: 1.0.0
- **Author**: Adam
- **Date**: November 7, 2025

### Quick Start Functions

#### `load_program(image_path: str) -> List[Dict[str, Any]]`
Load a ColorLang program from an image file.

**Parameters:**
- `image_path` (str): Path to the PNG image containing the ColorLang program

**Returns:**
- List of parsed instructions as dictionaries

**Example:**
```python
import colorlang
program = colorlang.load_program("examples/hello_world.png")
```

**Raises:**
- `FileNotFoundError`: If image file doesn't exist
- `ColorParseError`: If image cannot be parsed as ColorLang

#### `execute(program: List[Dict[str, Any]], debug: bool = False) -> Dict[str, Any]`
Execute a ColorLang program.

**Parameters:**
- `program`: List of parsed instructions from `load_program()`
- `debug` (bool, optional): Enable debug mode with step-through execution

**Returns:**
- Dictionary containing execution results:
  - `output`: List of printed values
  - `cycles`: Number of execution cycles
  - `final_state`: VM final state

**Example:**
```python
result = colorlang.execute(program, debug=True)
print("Output:", result.get('output', []))
print("Cycles:", result.get('cycles', 0))
```

#### `create_sample_program() -> PIL.Image.Image`
Create a simple sample ColorLang program for testing.

**Returns:**
- PIL Image object containing a basic "Hello World" program

**Example:**
```python
sample = colorlang.create_sample_program()
sample.save("my_first_program.png")
```

## Color Parser (`colorlang.ColorParser`)

### Class Overview
Parses color images into ColorLang instruction sequences using HSV color space analysis.

### Constructor

#### `ColorParser()`
Initialize a new color parser with caching enabled.

**Example:**
```python
from colorlang import ColorParser
parser = ColorParser()
```

### Core Methods

#### `parse_image(image_path: str) -> List[Dict[str, Any]]`
Parse a PNG image into ColorLang instructions.

**Parameters:**
- `image_path` (str): Path to PNG image file

**Returns:**
- List of instruction dictionaries with keys:
  - `operation`: Instruction name (e.g., "ADD", "PRINT", "HALT")
  - `operands`: List of operand values
  - `position`: (x, y) pixel position in image
  - `hue`: HSV hue value (0-360)
  - `saturation`: HSV saturation value (0-100)
  - `value`: HSV value/brightness (0-100)

**Example:**
```python
parser = ColorParser()
instructions = parser.parse_image("program.png")
for inst in instructions:
    print(f"{inst['operation']} at {inst['position']}")
```

#### `rgb_to_hsv(r: int, g: int, b: int) -> Tuple[float, float, float]`
Convert RGB values to HSV with caching and error handling.

**Parameters:**
- `r` (int): Red value (0-255)
- `g` (int): Green value (0-255)  
- `b` (int): Blue value (0-255)

**Returns:**
- Tuple of (hue, saturation, value) where:
  - hue: 0-360 degrees
  - saturation: 0-100 percent
  - value: 0-100 percent

**Example:**
```python
h, s, v = parser.rgb_to_hsv(255, 128, 64)
print(f"HSV: {h:.1f}°, {s:.1f}%, {v:.1f}%")
```

#### `parse_pixel(r: int, g: int, b: int, position: Tuple[int, int]) -> Dict[str, Any]`
Parse a single RGB pixel into a ColorLang instruction.

**Parameters:**
- `r`, `g`, `b` (int): RGB color values (0-255)
- `position` (Tuple[int, int]): (x, y) position in image

**Returns:**
- Instruction dictionary (same format as `parse_image()`)

**Example:**
```python
instruction = parser.parse_pixel(120, 200, 100, (5, 3))
print(f"Instruction: {instruction['operation']}")
```

#### `create_program_image(program: List[Tuple[int, int, int]], width: int = 10) -> PIL.Image.Image`
Create a PNG image from HSV instruction tuples.

**Parameters:**
- `program`: List of (hue, saturation, value) tuples
- `width` (int): Image width in pixels (height calculated automatically)

**Returns:**
- PIL Image object containing the program

**Example:**
```python
program = [(120, 100, 100), (240, 80, 90), (0, 0, 0)]  # Instructions + HALT
image = parser.create_program_image(program, width=3)
image.save("generated_program.png")
```

### Error Handling Methods

#### `refine_hsv_decoding(h: float, s: float, v: float) -> Tuple[float, float, float]`
Refine HSV values to improve precision and handle edge cases.

**Parameters:**
- `h` (float): Hue value (0-360)
- `s` (float): Saturation value (0-100)
- `v` (float): Value/brightness (0-100)

**Returns:**
- Refined (hue, saturation, value) tuple

**Raises:**
- `InvalidColorError`: If values are outside valid ranges

## Virtual Machine (`colorlang.ColorVM`)

### Class Overview
Executes ColorLang programs with register-based architecture and shared memory support.

### Constructor

#### `ColorVM(shared_memory: Optional[object] = None)`
Initialize the ColorLang virtual machine.

**Parameters:**
- `shared_memory` (optional): Shared memory object for host communication

**Example:**
```python
from colorlang import ColorVM
vm = ColorVM()

# With shared memory
from demos.platformer_colorlang.platformer_host import SharedMemory
shm = SharedMemory()
vm = ColorVM(shared_memory=shm)
```

### Execution Methods

#### `run_program(program: List[Dict[str, Any]]) -> Dict[str, Any]`
Execute a complete ColorLang program.

**Parameters:**
- `program`: List of instruction dictionaries from parser

**Returns:**
- Execution result dictionary:
  - `output`: List of printed values
  - `cycles`: Number of execution cycles
  - `registers`: Final register state
  - `memory`: Final memory state

**Example:**
```python
vm = ColorVM()
result = vm.run_program(instructions)
print("Program output:", result['output'])
print("Execution cycles:", result['cycles'])
```

#### `execute_cycle() -> bool`
Execute a single instruction cycle.

**Returns:**
- `True` if execution should continue, `False` if halted

**Example:**
```python
vm = ColorVM()
vm.load_program(instructions)
while vm.execute_cycle():
    print(f"PC: {vm.pc}, Registers: {vm.registers}")
```

#### `load_program(program: List[Dict[str, Any]]) -> None`
Load program into VM memory without executing.

**Parameters:**
- `program`: List of instruction dictionaries

### State Access Methods

#### `get_register(register_id: int) -> int`
Get the value of a specific register.

**Parameters:**
- `register_id` (int): Register number (0-15)

**Returns:**
- Register value as integer

#### `set_register(register_id: int, value: int) -> None`
Set the value of a specific register.

**Parameters:**
- `register_id` (int): Register number (0-15)
- `value` (int): Value to set

#### `get_memory(address: int) -> int`
Read value from memory address.

**Parameters:**
- `address` (int): Memory address (0-1023)

**Returns:**
- Memory value as integer

#### `set_memory(address: int, value: int) -> None`
Write value to memory address.

**Parameters:**
- `address` (int): Memory address (0-1023)
- `value` (int): Value to write

### VM Properties

#### `pc` (int)
Program counter - current instruction address.

#### `registers` (List[int])
Array of 16 general-purpose registers.

#### `memory` (List[int])
Array of 1024 memory locations.

#### `output` (List[str])
Accumulated output from PRINT instructions.

#### `cycles` (int)
Number of instruction cycles executed.

## Instruction Set (`colorlang.InstructionSet`)

### Class Overview
Defines the complete ColorLang instruction set with HSV color mappings.

### Constructor

#### `InstructionSet()`
Initialize instruction set with all supported operations.

### Information Methods

#### `get_instruction_info() -> Dict[str, Dict[str, Any]]`
Get complete information about all instructions.

**Returns:**
- Dictionary mapping instruction names to properties:
  - `hue_range`: (min_hue, max_hue) tuple
  - `description`: Human-readable description
  - `operands`: Number of operands required
  - `category`: Instruction category

**Example:**
```python
from colorlang import InstructionSet
inst_set = InstructionSet()
info = inst_set.get_instruction_info()
print(f"ADD instruction: {info['ADD']}")
```

#### `get_instruction_by_hue(hue: float) -> Optional[str]`
Get instruction name by HSV hue value.

**Parameters:**
- `hue` (float): HSV hue value (0-360)

**Returns:**
- Instruction name or `None` if not found

**Example:**
```python
instruction = inst_set.get_instruction_by_hue(120.5)
print(f"Hue 120.5° maps to: {instruction}")
```

### Instruction Categories

#### Arithmetic Instructions
- **ADD**: Add two values
- **SUB**: Subtract two values
- **MUL**: Multiply two values
- **DIV**: Divide two values
- **MOD**: Modulo operation

#### Memory Instructions
- **LOAD**: Load value from memory
- **STORE**: Store value to memory
- **COPY**: Copy value between registers

#### Control Flow Instructions
- **JMP**: Unconditional jump
- **JZ**: Jump if zero
- **JNZ**: Jump if not zero
- **CALL**: Call subroutine
- **RET**: Return from subroutine

#### I/O Instructions
- **PRINT**: Print value to output
- **INPUT**: Read input (placeholder)
- **HALT**: Stop execution

#### Data Instructions
- **INTEGER**: Integer literal
- **FLOAT**: Floating-point literal
- **STRING**: String literal

#### System Instructions (ColorLang Extensions)
- **RENDER_FRAME**: Trigger frame rendering
- **GET_TIME**: Get system time
- **PATHFIND**: AI pathfinding operation
- **MOVE**: Move agent/object

## Debugger (`colorlang.ColorDebugger`)

### Class Overview
Visual debugging interface for ColorLang programs with step-through execution and state visualization.

### Constructor

#### `ColorDebugger(vm: ColorVM)`
Initialize debugger attached to a virtual machine.

**Parameters:**
- `vm`: ColorVM instance to debug

### Debugging Methods

#### `run_with_debugging(program: List[Dict[str, Any]]) -> Dict[str, Any]`
Execute program with full debugging interface.

**Parameters:**
- `program`: List of instruction dictionaries

**Returns:**
- Same format as `ColorVM.run_program()` with additional debug info

#### `set_breakpoint(address: int) -> None`
Set breakpoint at instruction address.

**Parameters:**
- `address` (int): Instruction address for breakpoint

#### `step_execution() -> bool`
Execute one instruction and pause.

**Returns:**
- `True` if execution can continue, `False` if halted

#### `generate_debug_report(filename: str) -> None`
Generate visual debug report as PNG image.

**Parameters:**
- `filename` (str): Output filename for debug visualization

## Compression (`colorlang.ColorCompressor`)

### Class Overview
Advanced compression algorithms for ColorLang programs achieving up to 99.4% size reduction.

### Constructor

#### `ColorCompressor()`
Initialize compressor with all algorithms available.

### Compression Methods

#### `compress_program(program_image: PIL.Image.Image, method: str = "hybrid") -> bytes`
Compress a ColorLang program image.

**Parameters:**
- `program_image`: PIL Image containing ColorLang program
- `method` (str): Compression method ("palette", "rle", "hybrid")

**Returns:**
- Compressed program as bytes

**Example:**
```python
from colorlang import ColorCompressor
compressor = ColorCompressor()

# Load and compress program
image = Image.open("large_program.png")
compressed = compressor.compress_program(image, method="hybrid")
print(f"Compression ratio: {len(compressed) / (image.width * image.height * 3) * 100:.1f}%")
```

#### `decompress_program(compressed_data: bytes) -> PIL.Image.Image`
Decompress ColorLang program back to image.

**Parameters:**
- `compressed_data`: Bytes from `compress_program()`

**Returns:**
- Decompressed PIL Image

#### `get_compression_stats() -> Dict[str, float]`
Get detailed compression statistics.

**Returns:**
- Statistics dictionary with compression ratios, speeds, etc.

### Compression Methods Available

#### Palette Compression
Reduces color palette to essential instruction colors only.
- **Best for**: Programs with many repeated instructions
- **Typical ratio**: 70-90% compression

#### Run-Length Encoding (RLE)
Compresses sequences of identical pixels.
- **Best for**: Programs with large data blocks
- **Typical ratio**: 80-95% compression

#### Hybrid Compression
Combines palette and RLE for maximum compression.
- **Best for**: All program types
- **Typical ratio**: 90-99.4% compression

## ColorReact Framework (`colorlang.color_react`)

### ColorReactApp Class

#### `ColorReactApp(width: int, height: int)`
Main application container for ColorReact components.

**Parameters:**
- `width` (int): Application width in pixels
- `height` (int): Application height in pixels

#### Core Methods

##### `add_component(component: ColorComponent) -> None`
Add a component to the application.

##### `render() -> PIL.Image.Image`
Render the complete application to an image.

##### `export_colorlang() -> bytes`
Export application as compressed ColorLang program.

### ColorComponent Class

Base class for all UI components.

#### `ColorComponent(x: int, y: int, width: int, height: int)`
Initialize component with position and size.

#### Abstract Methods (Override in Subclasses)

##### `render(image: PIL.Image.Image) -> None`
Render component onto the provided image.

##### `handle_event(event_type: str, **kwargs) -> bool`
Handle user interaction events.

### Button Class

#### `Button(x: int, y: int, width: int, height: int, text: str, onclick: callable = None)`
Interactive button component.

**Example:**
```python
def button_clicked():
    print("Button was clicked!")

button = Button(10, 10, 100, 30, "Click Me", onclick=button_clicked)
```

### TextDisplay Class

#### `TextDisplay(x: int, y: int, width: int, height: int, text: str)`
Text display component with color-coded rendering.

### Container Class

#### `Container(x: int, y: int, width: int, height: int, layout: str = "vertical")`
Layout container for organizing child components.

**Parameters:**
- `layout`: "vertical" or "horizontal" arrangement

## Micro-Assembler (`colorlang.micro_assembler`)

### Functions

#### `encode_op(operation: str) -> Tuple[int, int, int]`
Encode operation name to HSV tuple.

**Parameters:**
- `operation` (str): Operation name (e.g., "ADD", "PRINT")

**Returns:**
- (hue, saturation, value) tuple

#### `write_kernel_image(instructions: List[Tuple[int, int, int]], path: str, width: int = None) -> None`
Write instruction sequence to PNG image.

**Parameters:**
- `instructions`: List of HSV tuples
- `path` (str): Output file path
- `width` (int, optional): Image width

## Exception Classes (`colorlang.exceptions`)

### ColorParseError
Raised when image parsing fails.

### InvalidInstructionError  
Raised for unrecognized instructions.

### InvalidColorError
Raised for invalid HSV color values.

### VMExecutionError
Raised during VM execution failures.

### CompressionError
Raised during compression/decompression failures.

## Usage Examples

### Complete Program Example
```python
import colorlang
from colorlang import ColorParser, ColorVM

# Create a simple program
parser = ColorParser()
program = [
    (120, 100, 80),  # LOAD instruction
    (240, 90, 70),   # ADD instruction  
    (300, 85, 90),   # PRINT instruction
    (0, 0, 0),       # HALT
]

# Convert to image
image = parser.create_program_image(program, width=4)
image.save("my_program.png")

# Load and execute
loaded_program = colorlang.load_program("my_program.png")
result = colorlang.execute(loaded_program, debug=True)

print("Output:", result['output'])
print("Cycles:", result['cycles'])
```

### Compression Example
```python
from colorlang import ColorCompressor
from PIL import Image

# Load large program
large_program = Image.open("complex_program.png")
original_size = large_program.width * large_program.height * 3

# Compress with different methods
compressor = ColorCompressor()
compressed = compressor.compress_program(large_program, method="hybrid")

print(f"Original size: {original_size} bytes")
print(f"Compressed size: {len(compressed)} bytes")
print(f"Compression ratio: {(1 - len(compressed)/original_size) * 100:.1f}%")

# Decompress and verify
decompressed = compressor.decompress_program(compressed)
decompressed.save("decompressed_program.png")
```

### ColorReact Application Example
```python
from colorlang.color_react import ColorReactApp, Button, TextDisplay

# Create application
app = ColorReactApp(400, 300)

# Add components
title = TextDisplay(10, 10, 380, 30, "My ColorLang App")
button = Button(150, 100, 100, 40, "Click Me")

app.add_component(title)
app.add_component(button)

# Render and save
rendered = app.render()
rendered.save("my_app.png")

# Export as ColorLang program
program_data = app.export_colorlang()
with open("my_app.clc", "wb") as f:
    f.write(program_data)
```

---

This comprehensive API reference covers all public interfaces in ColorLang. For implementation details and advanced usage, see the individual module documentation and source code comments.