# ColorLang Example Programs

This directory contains example programs demonstrating various features of ColorLang.

## Hello World
**File:** `hello_world.png`

Simple program that prints a greeting

**Concepts demonstrated:**
- Basic I/O
- Program structure
- HALT instruction

## Arithmetic Demo
**File:** `arithmetic_demo.png`

Demonstrates basic arithmetic operations

**Concepts demonstrated:**
- Data loading
- Addition
- Register operations

## Loop Example
**File:** `loop_example.png`

Shows looping and conditional execution

**Concepts demonstrated:**
- Control flow
- Loops
- Counters

## Monkey Cognition Demo
**File:** `monkey_cognition_demo.png`

Simulates monkey decision-making process

**Concepts demonstrated:**
- Emotional modeling
- Decision trees
- AI behavior

## Parallel Demo
**File:** `parallel_demo.png`

Demonstrates thread spawning and synchronization

**Concepts demonstrated:**
- Parallel processing
- Thread management
- Synchronization

## Color Manipulation
**File:** `color_manipulation.png`

Shows direct color processing and transformation

**Concepts demonstrated:**
- Color spaces
- Visual programming
- Data transformation

## Fibonacci Sequence
**File:** `fibonacci_sequence.png`

Generates Fibonacci numbers using loops

**Concepts demonstrated:**
- Mathematical sequences
- Loop counters
- Variable updates

## Running Examples

To run an example program:

```python
import colorlang

# Load and execute program
program = colorlang.load_program('examples/hello_world.png')
result = colorlang.execute(program)
print(result)
```

## Creating Your Own Programs

You can create ColorLang programs by:

1. **Using the example generators** in `examples.py`
2. **Drawing directly** in an image editor with precise HSV values
3. **Using the ColorLang IDE** (when available)
4. **Programmatically** using the PIL library

