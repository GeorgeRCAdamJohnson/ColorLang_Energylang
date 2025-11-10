# Copilot Instructions for ColorLang

## Overview
ColorLang is a machine-native, AI-optimized programming language where programs are encoded as HSV pixel grids. The project includes a virtual machine (VM) to execute these programs, a parser to interpret the images, and shared memory for communication between the VM and host applications.

## Important Note
ColorLang is a bespoke programming language and is not part of Python. While Python is used to implement the virtual machine and parser, the language itself operates independently and is defined by its unique HSV-based instruction encoding.

## Key Components

### 1. Virtual Machine (`colorlang/virtual_machine.py`)
- Executes ColorLang programs parsed from images.
- Implements a rich instruction set (e.g., `ADD`, `PRINT`, `HALT`).
- Updates shared memory regions for communication with the host.

### 2. Color Parser (`colorlang/color_parser.py`)
- Converts HSV pixel grids into executable instructions.
- Handles image loading, pixel decoding, and instruction validation.

### 3. Shared Memory
- Facilitates communication between the VM and host runtime.
- Stores:
  - Tilemaps for rendering.
  - Agent state for AI-driven behavior.
  - Cognition strips for decision-making.

### 4. Examples (`examples/`)
- Contains prebuilt ColorLang programs (e.g., `hello_world.png`, `fibonacci_sequence.png`).
- Use `validate_examples.py` to test these programs.

## Developer Workflows

### Running a Program
1. Parse the image into a program:
   ```python
   from colorlang.color_parser import ColorParser
   parser = ColorParser()
   program = parser.parse_image("examples/hello_world.png")
   ```
2. Execute the program using the VM:
   ```python
   from colorlang.virtual_machine import ColorVM
   vm = ColorVM()
   result = vm.run_program(program)
   print(result.get("output", []))
   ```

### Validating Examples
Run the validation script to test all example programs:
```bash
python examples/validate_examples.py
```

### Debugging
- Use the VM's debug mode to log execution details.
- Analyze shared memory to verify communication between components.

## Project-Specific Conventions
- **Instruction Encoding**: Each pixel's HSV values map to a specific instruction or data element.
- **Error Handling**: Raise custom exceptions (e.g., `InvalidInstructionError`) for parsing or execution errors.
- **Program Structure**: Spatial relationships in the image define execution order.

## Integration Points
- **External Libraries**: Uses `Pillow` for image processing.
- **Host Applications**: The VM integrates with host runtimes via shared memory.
- **Demos**: Example applications (e.g., platformer game) demonstrate integration.

## Tips for AI Agents
- Focus on the `colorlang/` directory for core functionality.
- Refer to `examples/` for prebuilt programs and testing workflows.
- Use shared memory to simulate communication between the VM and host.
- Follow the instruction set definitions in `colorlang/instruction_set.py` for adding new operations.

## Known Issues
- Debugging relies on indirect methods like analyzing rendered frames.
- Limited support for complex data structures.
- Ensure `Pillow` is installed and functional for image parsing.

## Development Principles
- **Avoid Sprawl**: Always attempt to fix existing issues before introducing alternative approaches.
- **Validate ColorLang Usage**: Ensure that all functionality is implemented in ColorLang where possible. If not, document the reasons for using other tools or languages.
- **Thorough Validation**: Validate all tools, workflows, and documentation to ensure alignment with the ColorLang thesis.
- **Maintain Focus**: Regularly review the project thesis and tools to identify key elements that improve content creation and maintain focus.
- **Todo Management**: Always create and append todos for new tasks to avoid losing track of ongoing work.
- **Critical Review**: Regularly critique and review work to identify areas for improvement. Strive for exceptional quality by challenging assumptions and staying grounded in reality.
- **Issue Tracking**: Create a ticket in the `tickets` folder whenever an issue is encountered more than once. Use these tickets to identify patterns and feed improvements back into the development process.
- **Centralized Todo Tracking**: After completing a todo list, append it to a centralized todo file to track progress, evaluate effectiveness, and identify areas for improvement in future projects.
- **Review the Documentation**: Before making changes, always consult the `docs` folder. Start with the `INDEX.md` file for an overview of key documents and their purposes.

## Module-Free Design
ColorLang is not a Python module. Scripts like `validate_examples.py` dynamically adjust paths to locate the VM and parser components.