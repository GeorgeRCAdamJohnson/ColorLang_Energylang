# ColorLang User Guide

## Overview
Welcome to ColorLang! This guide will help you get started with writing and running ColorLang programs. Whether you're creating a simple "Hello World" or a complex AI-driven application, this guide will walk you through the basics.

---

## Getting Started

### 1. **Prerequisites**
- Python 3.12 or later.
- Install the required libraries:
  ```bash
  pip install -r requirements.txt
  ```

### 2. **Writing a Program**
- ColorLang programs are encoded as HSV pixel grids.
- Use an image editor or the `examples/create_examples.py` script to create programs.
- Example: A "Hello World" program (`hello_world.png`).

### 3. **Running a Program**
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

---

## Advanced Topics

### 1. **Procedural Generation**
- Use the `examples/create_examples.py` script to generate programs procedurally.
- Example: Generate a Fibonacci sequence program.

### 2. **Shared Memory**
- Shared memory enables communication between the VM and host applications.
- Example: The Monkey Platformer demo uses shared memory to synchronize the game state.

### 3. **Networking**
- Use `NETWORK_SEND` and `NETWORK_RECV` instructions to enable communication between machines.
- Example: Distributed AI systems.

---

## Best Practices
- Validate your programs using the `validate_examples.py` script.
- Use the `docs` folder to familiarize yourself with the system architecture and instruction set.
- Start with simple programs and gradually explore advanced features.

---

## Next Steps
- Explore the `examples/` folder for prebuilt programs.
- Read the `INSTRUCTION_SET.md` to learn about available instructions.
- Try running the Monkey Platformer demo to see ColorLang in action.