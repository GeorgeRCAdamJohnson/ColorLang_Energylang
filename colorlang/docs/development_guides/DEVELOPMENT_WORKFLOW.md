# ColorLang Development Workflow Guide

## Overview
This guide provides a comprehensive development workflow for ColorLang, covering everything from initial setup through testing, debugging, and deployment. Follow these procedures to maintain code quality and ensure consistent development practices.

## Quick Start Workflow

### Daily Development Cycle
```bash
# 1. Update environment and dependencies
$env:PYTHONPATH = "$(Get-Location)"  # Windows
export PYTHONPATH="$(pwd)"           # macOS/Linux

# 2. Pull latest changes (if working with team)
git pull origin main

# 3. Run validation tests before starting work
python examples/validate_examples.py

# 4. Make your changes
# ... development work ...

# 5. Test your changes
python examples/validate_examples.py
python demos/platformer/run_platformer_demo.py

# 6. Generate documentation if needed
python tools/build_pdfs.py docs/ColorLang_Specification.md

# 7. Commit and push
git add .
git commit -m "Description of changes"
git push origin feature-branch
```

## Project Structure and Navigation

### Core Directories
```
ColorLang/
├── colorlang/              # Core language implementation
│   ├── __init__.py        # Main module interface
│   ├── color_parser.py    # HSV to instruction parsing
│   ├── virtual_machine.py # Program execution engine
│   ├── instruction_set.py # Instruction definitions
│   ├── micro_assembler.py # Assembly language tools
│   ├── compression.py     # Compression algorithms
│   └── debugger.py       # Debugging utilities
├── docs/                  # Documentation
├── examples/              # Example programs and validation
├── demos/                 # Demonstration applications
├── tools/                 # Development and build tools
└── tests/                # Automated test suites
```

### File Naming Conventions
- **Source files**: `snake_case.py`
- **Documentation**: `UPPERCASE.md` for main docs, `lowercase.md` for guides
- **Example programs**: `descriptive_name.png`
- **Test files**: `test_component.py`

## Development Environment Setup

### Environment Variables
```bash
# Essential environment variables
export PYTHONPATH="$(pwd)"                    # Project root for imports
export COLORLANG_DEBUG=1                      # Enable debug mode
export COLORLANG_OPTIMIZE=0                   # Disable optimization for debugging
export PDF_WATERMARK="DRAFT - CONFIDENTIAL"   # PDF generation watermark
```

### VS Code Configuration
Create `.vscode/settings.json`:
```json
{
    "python.analysis.extraPaths": ["./"],
    "python.analysis.autoSearchPaths": true,
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "python.formatting.provider": "black",
    "python.testing.pytestEnabled": true,
    "python.testing.pytestArgs": ["tests/"],
    "files.associations": {
        "*.clc": "json",
        "*.climg": "png"
    }
}
```

### Git Configuration
```bash
# Set up Git hooks for automated testing
cp tools/pre-commit-hook .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Configure Git for ColorLang development
git config user.name "Your Name"
git config user.email "your.email@example.com"
git config core.autocrlf true  # Windows
git config core.autocrlf input # macOS/Linux
```

## Development Workflows

### 1. Adding New Instructions

#### Step 1: Define Instruction in Instruction Set
```python
# Edit colorlang/instruction_set.py
class InstructionType(Enum):
    # ... existing instructions ...
    NEW_INSTRUCTION = "NEW_INSTRUCTION"

# Add to get_instruction_info()
def get_instruction_info():
    return {
        # ... existing instructions ...
        "NEW_INSTRUCTION": {
            "hue_range": (300, 310),  # HSV hue range
            "description": "Description of what this does",
            "operands": 2,  # Number of operands
            "category": "CONTROL"  # Instruction category
        }
    }
```

#### Step 2: Implement in Virtual Machine
```python
# Edit colorlang/virtual_machine.py
def _execute_new_instruction(self, operand1, operand2):
    """Execute NEW_INSTRUCTION with given operands."""
    # Implementation here
    self.pc += 1  # Advance program counter
    return True   # Continue execution
```

#### Step 3: Add to Micro-Assembler
```python
# Edit colorlang/micro_assembler.py
HUES = {
    # ... existing instructions ...
    'NEW_INSTRUCTION': 305,  # Hue value within range
}
```

#### Step 4: Create Test
```python
# Create tests/test_new_instruction.py
import unittest
from colorlang import ColorVM, ColorParser

class TestNewInstruction(unittest.TestCase):
    def test_new_instruction_execution(self):
        # Test implementation
        pass
```

#### Step 5: Validate
```bash
# Run tests
python -m pytest tests/test_new_instruction.py

# Update examples if needed
python examples/create_examples.py

# Validate all examples still work
python examples/validate_examples.py
```

### 2. Creating New Example Programs

#### Step 1: Design Program Logic
```python
# Edit examples/create_examples.py
def create_new_example():
    """Create a new example demonstrating specific functionality."""
    program = [
        # Program instructions as HSV tuples
        (120, 255, 255),  # Example instruction
        (0, 0, 0),        # HALT
    ]
    
    # Save as PNG
    parser = ColorParser()
    image = parser.create_program_image(program, width=10)
    image.save("examples/examples/new_example.png")
    
    return {
        "name": "New Example",
        "description": "Demonstrates new functionality",
        "expected_output": ["Expected", "Output", "Lines"],
        "steps": 42
    }
```

#### Step 2: Test Example
```bash
# Generate the example
python examples/create_examples.py

# Test execution
python -c "
import colorlang
program = colorlang.load_program('examples/examples/new_example.png')
result = colorlang.execute(program)
print('Output:', result.get('output', []))
"
```

#### Step 3: Add to Validation
```python
# Edit examples/validate_examples.py to include new example
```

### 3. Debugging ColorLang Programs

#### Visual Debugging Workflow
```python
# Enable visual debugging
from colorlang import ColorVM, ColorParser
from colorlang.debugger import VisualDebugger

# Load and debug program
parser = ColorParser()
program = parser.parse_image("examples/examples/problem_program.png")

# Create debugger with visualization
debugger = VisualDebugger()
vm = ColorVM(debugger=debugger)

# Step through execution
result = vm.run_program(program, debug=True)

# Generate debug report
debugger.save_report("debug_output.png")
```

#### Command Line Debugging
```bash
# Run with debug output
export COLORLANG_DEBUG=1
python -c "
import colorlang
program = colorlang.load_program('examples/examples/debug_me.png')
result = colorlang.execute(program, debug=True)
"
```

#### Performance Profiling
```python
import time
import colorlang

# Profile program execution
start_time = time.time()
program = colorlang.load_program('examples/examples/large_program.png')
parse_time = time.time()

result = colorlang.execute(program)
execute_time = time.time()

print(f"Parse time: {parse_time - start_time:.3f}s")
print(f"Execute time: {execute_time - parse_time:.3f}s")
print(f"Instructions: {len(program)}")
print(f"Instructions/second: {len(program) / (execute_time - parse_time):.0f}")
```

### 4. Building and Testing Demos

#### Platformer Demo Development
```bash
# Run standard platformer (Python implementation)
python demos/platformer/run_platformer_demo.py

# Generate ColorLang platformer kernel
python demos/platformer_colorlang/platformer_kernel_generator.py

# Run ColorLang platformer
$env:PYTHONPATH = "$(Get-Location)"
python demos/platformer_colorlang/platformer_host.py

# Generate video from frames
python demos/platformer/output/merge_videos.py
```

#### Adding New Demo Features
```python
# 1. Update kernel generator with new logic
# 2. Modify host runtime for new syscalls
# 3. Update rendering pipeline
# 4. Test end-to-end functionality
# 5. Document new features
```

### 5. Documentation Generation

#### Generate PDF Documentation
```bash
# Generate all PDFs with watermark
$env:PDF_WATERMARK = "CONFIDENTIAL - DRAFT - Not for Distribution"
python tools/build_pdfs.py docs/ColorLang_Thesis.md docs/ColorLang_Specification.md

# Generate single document
python tools/build_pdfs.py docs/INSTALLATION.md
```

#### Update Documentation
```bash
# After making changes, update relevant docs
# 1. Update API reference if interfaces changed
# 2. Update user guide if workflows changed  
# 3. Update specification if language changed
# 4. Generate new PDFs
# 5. Update INDEX.md with new documents
```

## Testing Strategy

### Test Categories

#### 1. Unit Tests
```bash
# Run all unit tests
python -m pytest tests/ -v

# Run specific test file
python -m pytest tests/test_color_parser.py -v

# Run with coverage
python -m pytest tests/ --cov=colorlang --cov-report=html
```

#### 2. Integration Tests
```bash
# Run example validation (integration test)
python examples/validate_examples.py

# Run demo tests
python demos/platformer/run_platformer_demo.py
python demos/platformer_colorlang/platformer_host.py
```

#### 3. Performance Tests
```bash
# Run performance benchmarks
python tests/test_performance.py

# Compression ratio tests
python tests/test_compression.py
```

### Continuous Integration Workflow
```bash
# Pre-commit checks (run before every commit)
python examples/validate_examples.py           # Validate examples work
python -m pytest tests/ -x                    # Run unit tests (stop on first failure)
python demos/platformer/run_platformer_demo.py # Test demos
python tools/build_pdfs.py docs/README.md     # Verify PDF generation works
```

## Code Quality Standards

### Python Code Style
```python
# Follow PEP 8 with these specific guidelines:

# 1. Line length: 88 characters (Black formatter default)
# 2. Use type hints for all function signatures
def parse_pixel(self, r: int, g: int, b: int, position: Tuple[int, int]) -> Dict[str, Any]:
    """Parse RGB pixel into ColorLang instruction."""
    pass

# 3. Docstrings for all public methods (Google style)
def execute_instruction(self, instruction: str, operands: List[int]) -> bool:
    """Execute a ColorLang instruction.
    
    Args:
        instruction: The instruction name to execute
        operands: List of operand values
        
    Returns:
        True if execution should continue, False to halt
        
    Raises:
        InvalidInstructionError: If instruction is not recognized
    """
    pass

# 4. Use meaningful variable names
instruction_hue = 120  # Not: h = 120
agent_position_x = 50  # Not: x = 50
```

### Error Handling Standards
```python
# Use specific exceptions from colorlang.exceptions
from colorlang.exceptions import InvalidInstructionError, ColorParseError

# Always provide context in error messages
if hue < 0 or hue > 359:
    raise ColorParseError(f"Invalid hue value {hue}. Must be 0-359.")

# Log errors for debugging
import logging
logging.error(f"Failed to parse pixel at position {position}: {error}")
```

### File Organization
```python
# Standard file header for all Python files
"""
ColorLang [Component Name]

[Brief description of what this module does]

Copyright (c) 2025 ColorLang Project
"""

# Standard imports order
import os                          # Standard library
import sys
from typing import Dict, List      # Typing imports

import numpy as np                 # Third-party imports  
from PIL import Image

from colorlang.exceptions import ColorParseError  # Local imports
from colorlang.instruction_set import InstructionType
```

## Release and Deployment

### Version Management
```bash
# Update version in multiple places
# 1. colorlang/__init__.py
__version__ = "0.2.0"

# 2. docs/ColorLang_Specification.md
# Update version references

# 3. Create git tag
git tag v0.2.0
git push origin v0.2.0
```

### Release Checklist
- [ ] All tests pass (`python examples/validate_examples.py`)
- [ ] Documentation updated and PDFs generated
- [ ] Version numbers updated consistently
- [ ] Changelog updated with new features/fixes
- [ ] Demo programs work correctly
- [ ] Performance benchmarks run and documented
- [ ] Security review completed (if applicable)

### Deployment Process
```bash
# 1. Create release branch
git checkout -b release/v0.2.0

# 2. Final testing
python examples/validate_examples.py
python demos/platformer/run_platformer_demo.py

# 3. Generate final documentation
python tools/build_pdfs.py docs/ColorLang_Thesis.md

# 4. Merge to main
git checkout main
git merge release/v0.2.0

# 5. Tag and push
git tag v0.2.0
git push origin main --tags
```

## Troubleshooting Development Issues

### Common Development Problems

#### 1. Import Errors
```bash
# Problem: ModuleNotFoundError: No module named 'colorlang'
# Solution: Set PYTHONPATH
export PYTHONPATH="$(pwd):$PYTHONPATH"
```

#### 2. Test Failures
```bash
# Problem: Tests fail after changes
# Solution: Update tests or fix implementation
python -m pytest tests/failing_test.py -v -s  # Verbose output
```

#### 3. Performance Issues
```bash
# Problem: Slow execution
# Solution: Profile and optimize
python -m cProfile -o profile.stats your_script.py
python -c "import pstats; pstats.Stats('profile.stats').sort_stats('cumulative').print_stats(10)"
```

#### 4. Rendering Issues
```bash
# Problem: Black frames or missing content
# Solution: Add debug prints to rendering pipeline
export COLORLANG_DEBUG=1
python your_rendering_script.py
```

## Best Practices Summary

### Development Practices
1. **Always set PYTHONPATH** before running ColorLang code
2. **Run validation tests** before and after making changes
3. **Use virtual environments** for isolated development
4. **Write tests** for new functionality
5. **Update documentation** when changing interfaces
6. **Use meaningful commit messages** with clear descriptions
7. **Profile performance** for optimization opportunities
8. **Follow the style guide** for consistent code quality

### Debugging Practices
1. **Use visual debugger** for complex program issues
2. **Add debug prints** to trace execution flow
3. **Test with simple programs** before complex ones
4. **Verify shared memory updates** in multi-component systems
5. **Check HSV color encoding** for instruction recognition issues
6. **Validate input data** before processing

### Documentation Practices
1. **Update docs with code changes**
2. **Include examples** in documentation
3. **Generate PDFs** for formal review
4. **Keep troubleshooting guide** current with common issues
5. **Document breaking changes** clearly in changelogs

---

This comprehensive workflow guide should enable efficient, consistent ColorLang development while maintaining high code quality and thorough testing. Follow these procedures to minimize debugging time and ensure reliable releases.