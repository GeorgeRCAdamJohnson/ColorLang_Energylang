# ColorLang Instruction Set

## Overview
The ColorLang instruction set defines the operations that can be encoded as HSV pixel values and executed by the Virtual Machine (VM). Each instruction corresponds to a specific hue range, with saturation and value providing additional operands or parameters.

---

## Instruction Categories

### 1. **Arithmetic Instructions**
- **Purpose**: Perform mathematical operations.
- **Instructions**:
  - `ADD`: Add two values.
  - `SUB`: Subtract one value from another.
  - `MUL`: Multiply two values.
  - `DIV`: Divide one value by another.
  - `MOD`: Compute the remainder of a division.
  - `POW`: Raise a value to the power of another.

### 2. **Memory Instructions**
- **Purpose**: Manage data in memory.
- **Instructions**:
  - `LOAD`: Load a value from memory.
  - `STORE`: Store a value in memory.
  - `MOVE`: Move data between registers.
  - `COPY`: Copy data between registers.
  - `ALLOC`: Allocate memory.
  - `FREE`: Free allocated memory.

### 3. **Control Flow Instructions**
- **Purpose**: Direct the flow of execution.
- **Instructions**:
  - `IF`: Conditional execution.
  - `WHILE`: Loop while a condition is true.
  - `FOR`: Loop for a fixed number of iterations.
  - `BREAK`: Exit a loop.
  - `CONTINUE`: Skip to the next iteration of a loop.

### 4. **Function Instructions**
- **Purpose**: Manage function calls and definitions.
- **Instructions**:
  - `CALL`: Call a function.
  - `RETURN`: Return from a function.
  - `FUNC_DEF`: Define a function.
  - `PARAM`: Define a function parameter.
  - `LOCAL`: Define a local variable.

### 5. **I/O Instructions**
- **Purpose**: Handle input and output operations.
- **Instructions**:
  - `PRINT`: Output a value.
  - `INPUT`: Read a value from the user.
  - `READ_FILE`: Read data from a file.
  - `WRITE_FILE`: Write data to a file.
  - `NETWORK_SEND`: Send data over the network.
  - `NETWORK_RECV`: Receive data over the network.

### 6. **System Instructions**
- **Purpose**: Manage system-level operations.
- **Instructions**:
  - `HALT`: Stop program execution.
  - `DEBUG`: Trigger a debug breakpoint.
  - `THREAD_SPAWN`: Spawn a new thread.
  - `THREAD_JOIN`: Join a thread.
  - `MUTEX_LOCK`: Lock a mutex.
  - `MUTEX_UNLOCK`: Unlock a mutex.

---

## Encoding Details
- **Hue**: Determines the instruction category.
- **Saturation**: Encodes the first operand.
- **Value**: Encodes the second operand.

---

## Next Steps
- Add examples of HSV encoding for each instruction.
- Document edge cases and error conditions for each instruction.