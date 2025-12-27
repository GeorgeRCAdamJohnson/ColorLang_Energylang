# ColorLang: A Machine-Native, AI-Optimized Programming Language

ColorLang is an innovative programming language designed for machine-native and AI-native applications. By encoding programs as HSV (Hue, Saturation, Value) pixel grids, ColorLang eliminates the need for traditional text-based programming, enabling direct interpretation by virtual machines and AI systems.

---

## Key Features

### 1. **Visual Programming**
- Programs are stored as images (e.g., PNG, JPEG).
- Each pixel represents an instruction or data element.
- Spatial relationships define program structure and execution order.

### 2. **Machine-Native Design**
- Optimized for computer vision and parallel processing.
- No text parsing overhead—immediate visual interpretation.
- Perfect for AI/ML applications and robotic systems.

### 3. **Rich Instruction Set**
- **Arithmetic**: ADD, SUB, MUL, DIV, MOD, POW.
- **Memory**: LOAD, STORE, MOVE, COPY, ALLOC, FREE.
- **Control Flow**: IF, WHILE, FOR, BREAK, CONTINUE.
- **Functions**: CALL, RETURN, parameters, local variables.
- **I/O**: PRINT, INPUT, file operations, network operations.
- **System**: Threading, synchronization, debugging.

### 4. **Shared Memory Model**
- Shared memory regions for tilemaps, agent state, and cognition strips.
- Enables communication between the VM and host runtime.

### 5. **AI Integration**
- Designed to integrate seamlessly with AI workflows.
- Supports procedural generation, reinforcement learning, and evolutionary programming.

---

## Getting Started

### Prerequisites
- Python 3.12 or later.
- Required libraries: `Pillow` for image processing.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/ColorLang.git
   ```
2. Navigate to the project directory:
   ```bash
   cd ColorLang
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running a Demo
1. Generate a minimal kernel:
   ```bash
   python demos/platformer_colorlang/minimal_program_generator.py
   ```
2. Generate a stress test kernel:
   ```bash
   python demos/platformer_colorlang/stress_test_generator.py
   ```
3. Run the platformer host:
   ```bash
   python demos/platformer_colorlang/platformer_host.py
   ```

---

## Documentation

### Core Concepts
- **Kernel Image**: The program encoded as an HSV image.
- **Virtual Machine (VM)**: Executes the kernel image, updating shared memory and rendering frames.
- **Shared Memory**: Stores the tilemap, agent state, and cognition strip for communication between the VM and host.

### File Structure
- `colorlang/`: Core language implementation (VM, parser, instruction set).
- `demos/`: Example applications, including the platformer demo.
- `docs/`: Documentation and design notes.

### Known Limitations
- Debugging relies on indirect methods like analyzing rendered frames.
- Limited support for complex data structures.
- No real-time input handling.

For a full list of limitations and potential solutions, see [docs/language_limitations.md](docs/language_limitations.md).

---

## Contributing
We welcome contributions from the community! To get started:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a detailed description of your changes.

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact
For questions or feedback, please reach out to the development team at `support@colorlang.ai`.