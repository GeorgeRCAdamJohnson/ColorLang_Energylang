# ColorLang Architecture

## Overview
ColorLang is a machine-native programming language designed to encode programs as HSV pixel grids. The system architecture consists of several key components that work together to parse, execute, and communicate ColorLang programs.

---

## High-Level Components

### 1. **Color Parser**
- **File**: `colorlang/color_parser.py`
- **Purpose**: Converts HSV pixel grids into executable instructions.
- **Key Responsibilities**:
  - Load and validate image files.
  - Decode pixels into instructions and data elements.
  - Handle errors during parsing (e.g., invalid colors).

### 2. **Virtual Machine (VM)**
- **File**: `colorlang/virtual_machine.py`
- **Purpose**: Executes parsed ColorLang programs.
- **Key Responsibilities**:
  - Interpret and execute instructions.
  - Manage program state, including registers and memory.
  - Update shared memory for communication with host applications.

### 3. **Shared Memory**
- **Purpose**: Facilitates communication between the VM and host runtime.
- **Key Responsibilities**:
  - Store tilemaps for rendering.
  - Maintain agent state for AI-driven behavior.
  - Provide cognition strips for decision-making.

### 4. **Host Applications**
- **Examples**: Platformer game, AI demos.
- **Purpose**: Integrate with the VM to showcase ColorLang's capabilities.
- **Key Responsibilities**:
  - Provide input to the VM.
  - Render outputs (e.g., game visuals, logs).
  - Manage user interactions.

---

## Data Flow
1. **Input**:
   - The user provides a ColorLang program as an image file.
2. **Parsing**:
   - The Color Parser decodes the image into instructions.
3. **Execution**:
   - The VM executes the instructions, updating registers and shared memory.
4. **Output**:
   - The host application renders the results or communicates them to other systems.

---

## Diagram
*(Placeholder for a system architecture diagram)*

---

## Next Steps
- Add a detailed diagram to visualize the architecture.
- Expand on the interaction between shared memory and host applications.
- Document specific use cases, such as the Monkey Platformer demo.