# ColorLang Language Specification
## Formal Definition and Grammar

### Version: 1.0
### Author: Adam
### Date: November 7, 2025

---

## Table of Contents
1. [Lexical Structure](#lexical-structure)
2. [Formal Grammar](#formal-grammar)
3. [Type System](#type-system)
4. [Execution Semantics](#execution-semantics)
5. [Built-in Operations](#built-in-operations)
6. [Memory Model](#memory-model)
7. [Error Handling](#error-handling)

---

## Lexical Structure

### Token Definition
A **token** in ColorLang is a single pixel with HSV color values.

```
Token ::= Pixel(hue: 0-360°, saturation: 0-100%, value: 0-100%)
```

### Tokenization Rules
1. Each pixel represents exactly one token
2. Transparent pixels (alpha < 50%) are ignored
3. Pixel coordinates determine execution order
4. Color values must be within valid HSV ranges

### Reserved Color Ranges
```
System Colors (Reserved):
  Black (0°, 0%, 0%)     - NOP (No Operation)
  White (0°, 0%, 100%)   - COMMENT (Ignored)
  Pure Gray (0°, 0%, 50%) - BARRIER (Synchronization)
```

---

## Formal Grammar

### Program Structure (EBNF)
```ebnf
Program         ::= ImageHeader InstructionGrid
ImageHeader     ::= Width Height ColorDepth
InstructionGrid ::= Row+
Row             ::= Instruction+
Instruction     ::= Pixel | InstructionSequence
InstructionSequence ::= Instruction Instruction Instruction?

(* Basic Instructions *)
Instruction ::= Arithmetic | Memory | Control | IO | System

(* Operation Types *)
Arithmetic  ::= ADD | SUB | MUL | DIV | MOD | POW
Memory      ::= LOAD | STORE | MOVE | COPY | ALLOC | FREE
Control     ::= IF | ELSE | WHILE | FOR | BREAK | CONTINUE | CALL | RETURN
IO          ::= INPUT | OUTPUT | PRINT | READ
System      ::= HALT | NOP | DEBUG | THREAD_SPAWN
```

### Pixel Grammar
```ebnf
Pixel ::= HSV(Hue, Saturation, Value)
Hue ::= 0..360
Saturation ::= 0..100
Value ::= 0..100

(* Operation Encoding *)
Operation ::= 
    | ArithmeticOp  (hue: 31-90)
    | MemoryOp      (hue: 91-150)
    | ControlOp     (hue: 151-210)
    | FunctionOp    (hue: 211-270)
    | IOOp          (hue: 271-330)
    | SystemOp      (hue: 331-360, 0-30)
```

---

## Type System

### Primitive Types

#### Numeric Types
```
Integer: Hue 0-15°, Saturation = magnitude, Value = sign
  - Positive: Value > 50%
  - Negative: Value ≤ 50%
  - Range: -1000 to +1000 (based on saturation mapping)

Float: Hue 16-30°, Saturation = whole part, Value = fractional part
  - Precision: 2 decimal places
  - Range: -10.00 to +10.00

Boolean: Hue 0°, Saturation 0%, Value = truth value
  - True: Value > 50%
  - False: Value ≤ 50%
```

#### Color Types
```
Color: Native HSV representation
  - Direct pixel encoding
  - No conversion needed
  - First-class data type
```

#### String Types
```
Character: Hue maps to ASCII value
  - Hue = (ASCII_value / 128) * 360°
  - Saturation = 100% (full character)
  - Value = 100% (visible)

String: Horizontal sequence of character pixels
  - Null terminator: Black pixel (0°, 0%, 0%)
  - Max length: Image width
```

### Composite Types

#### Arrays
```
Array Definition:
  - Horizontal pixel sequence
  - Homogeneous element types
  - Length encoded in first pixel's saturation
  - Elements follow sequentially

Array<Type> ::= [Length_Pixel][Element1][Element2]...[ElementN]
```

#### Structures/Objects
```
Struct Definition:
  - 2D rectangular pixel region
  - Border pixels define structure type
  - Internal pixels define fields
  - Inheritance through color gradients

Struct ::= BorderPixel FieldGrid BorderPixel
FieldGrid ::= Row+ where each Row contains field pixels
```

#### Functions
```
Function Definition:
  - Vertical pixel column
  - Header pixel defines signature
  - Body pixels define implementation
  - Footer pixel marks end

Function ::= HeaderPixel BodyPixels FooterPixel
```

---

## Execution Semantics

### Execution Model
ColorLang follows a **spatial execution model** where pixel position determines execution order and program flow.

#### Default Execution Order
1. **Sequential**: Left-to-right, top-to-bottom
2. **Jump-based**: Control flow can alter position
3. **Parallel**: Multiple execution threads possible

#### Program Counter
```
PC ::= (x: Integer, y: Integer, thread_id: Integer)
```

### Instruction Execution Cycle
1. **Fetch**: Read pixel at current PC position
2. **Decode**: Convert HSV to instruction and operands
3. **Execute**: Perform operation
4. **Update**: Advance PC or jump to new position

### Control Flow Semantics

#### Conditional Execution
```
IF condition_pixel target_pixel:
  if condition evaluates to true:
    PC = target_pixel coordinates
  else:
    PC = next sequential position
```

#### Loops
```
WHILE condition_pixel body_start:
  repeat:
    if condition evaluates to false: break
    execute body starting at body_start
    return to condition_pixel
```

#### Function Calls
```
CALL function_pixel:
  push current PC to call stack
  PC = function_pixel coordinates
  execute function body
  RETURN: pop PC from call stack
```

---

## Built-in Operations

### Arithmetic Operations

#### Addition (ADD)
```
Hue Range: 31-40°
Encoding: [operand1][ADD_op][operand2][result]
Semantics: result = operand1 + operand2
```

#### Subtraction (SUB)
```
Hue Range: 41-50°
Encoding: [operand1][SUB_op][operand2][result]
Semantics: result = operand1 - operand2
```

#### Multiplication (MUL)
```
Hue Range: 51-60°
Encoding: [operand1][MUL_op][operand2][result]
Semantics: result = operand1 * operand2
```

#### Division (DIV)
```
Hue Range: 61-70°
Encoding: [operand1][DIV_op][operand2][result]
Semantics: result = operand1 / operand2
Error: Division by zero raises ColorLang.DivisionByZeroError
```

### Memory Operations

#### Load (LOAD)
```
Hue Range: 91-100°
Encoding: [address][LOAD_op][register]
Semantics: register = memory[address]
```

#### Store (STORE)
```
Hue Range: 101-110°
Encoding: [register][STORE_op][address]
Semantics: memory[address] = register
```

### Control Operations

#### If (IF)
```
Hue Range: 151-160°
Encoding: [condition][IF_op][jump_address]
Semantics: if condition != 0: PC = jump_address
```

#### While Loop (WHILE)
```
Hue Range: 171-180°
Encoding: [condition][WHILE_op][loop_start]
Semantics: while condition != 0: execute from loop_start
```

### I/O Operations

#### Print (PRINT)
```
Hue Range: 271-280°
Encoding: [value][PRINT_op]
Semantics: output value to console/display
```

#### Input (INPUT)
```
Hue Range: 281-290°
Encoding: [INPUT_op][register]
Semantics: register = read_input()
```

---

## Memory Model

### Memory Organization
```
Memory Space:
├── Program Memory (Read-only)
│   └── Image pixel data
├── Stack Memory (LIFO)
│   ├── Function call frames
│   └── Local variables
├── Heap Memory (Dynamic)
│   ├── Objects and arrays
│   └── Dynamic allocations
└── Register Memory (Fast access)
    ├── Color registers (CR0-CR7)
    ├── Data registers (DR0-DR15)
    └── Address registers (AR0-AR3)
```

### Memory Addressing
```
Address Format: (x, y, layer)
  - x: Horizontal coordinate
  - y: Vertical coordinate
  - layer: Memory layer (stack, heap, registers)

Address Encoding in Pixels:
  - Saturation: x-coordinate (0-100% maps to image width)
  - Value: y-coordinate (0-100% maps to image height)
  - Hue: layer identifier
```

### Garbage Collection
```
Algorithm: Mark-and-sweep with color-based marking
  1. Mark phase: Set marked pixels to specific hue
  2. Sweep phase: Free unmarked memory regions
  3. Compact phase: Consolidate free space
```

---

## Error Handling

### Error Types

#### Syntax Errors
```
InvalidColorError: Pixel color outside valid ranges
MissingOperandError: Instruction missing required operands
InvalidInstructionError: Unrecognized hue range
```

#### Runtime Errors
```
MemoryAccessError: Access to invalid memory location
StackOverflowError: Call stack exceeds maximum depth
DivisionByZeroError: Division or modulo by zero
TypeMismatchError: Operation on incompatible types
```

#### System Errors
```
ImageLoadError: Cannot load or parse program image
ResourceExhaustionError: Out of memory or registers
ThreadDeadlockError: Parallel execution deadlock
```

### Error Representation
Errors are represented as special pixel patterns:
```
Error Pixel: Hue 0°, Saturation 100%, Value varies by error type
  - Value 10-19%: Syntax errors
  - Value 20-29%: Runtime errors
  - Value 30-39%: System errors
  - Value 40-49%: User-defined errors
```

### Error Handling Mechanisms
```
TRY-CATCH blocks:
  - TRY: Border of protective pixels around code region
  - CATCH: Error handler code in adjacent region
  - FINALLY: Cleanup code in designated region
```

---

## Standard Library

### Mathematical Functions
```
Color Patterns for Common Operations:
  - SQRT: Predefined pixel pattern
  - SIN/COS: Trigonometric lookup patterns
  - LOG/EXP: Logarithmic function patterns
```

### Data Structure Patterns
```
Linked List: Chain of connected pixel regions
Binary Tree: Hierarchical pixel organization
Hash Table: Grid with hash-based pixel addressing
```

### I/O Patterns
```
File Operations: Standardized pixel sequences
Network I/O: Protocol-specific color encodings
Graphics Output: Direct pixel manipulation patterns
```

---

## Optimization Guidelines

### Performance Optimization
1. **Spatial Locality**: Group related operations in adjacent pixels
2. **Color Caching**: Reuse common color values
3. **Parallel Execution**: Design for multi-threaded execution
4. **Memory Layout**: Optimize pixel arrangements for cache efficiency

### Code Size Optimization
1. **Pattern Reuse**: Create reusable pixel patterns
2. **Compression**: Use color gradients for repeated operations
3. **Subroutines**: Factor common code into functions

---

## Compatibility and Versioning

### Version Compatibility
```
Language Version: Encoded in program header pixel
  - Hue: Major version
  - Saturation: Minor version
  - Value: Patch version
```

### Backward Compatibility
- Version 1.x maintains compatibility with core instruction set
- New features added through extended hue ranges
- Deprecated features marked with special color patterns

---

## Appendices

### A. Complete Hue Range Mapping
[Detailed table of all hue ranges and their meanings]

### B. Standard Color Palette
[Predefined color constants for common operations]

### C. Example Grammar Productions
[Complete EBNF grammar for complex constructs]

### D. Implementation Notes
[Specific guidance for interpreter/compiler developers]

---

*This specification defines the complete formal structure of ColorLang and serves as the authoritative reference for implementation and tooling development.*