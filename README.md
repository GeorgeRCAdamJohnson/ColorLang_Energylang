# ColorLang - Machine-Native Programming Language

ColorLang is a machine-native, AI-optimized programming language where programs are encoded as HSV pixel grids. This innovative approach allows for visual programming that is both human-readable and machine-optimized.

## Quick Start

### Running Example Programs

```bash
# Validate all example programs
python examples/validate_examples.py

# Run a specific example
python -c "
from colorlang.color_parser import ColorParser
from colorlang.virtual_machine import ColorVM

parser = ColorParser()
vm = ColorVM()
program = parser.parse_image('examples/hello_world.png')
result = vm.run_program(program)
print('Output:', result.get('output', []))
"
```

### Current Status

- ✅ **hello_world.png**: PASS - outputs `["Hello, World!"]`
- ⚠️ **Other examples**: Under development

## Project Structure

```
colorlang/              # Core language implementation
├── virtual_machine.py  # VM execution engine
├── color_parser.py     # HSV pixel grid parser
├── instruction_set.py  # Operation definitions
└── exceptions.py       # Custom exceptions

examples/               # Sample ColorLang programs
├── hello_world.png     # Basic string output
├── fibonacci_sequence.png
├── arithmetic_demo.png
└── validate_examples.py

docs/                   # Comprehensive documentation
demos/                  # Interactive demonstrations
```

## Recent Fixes (November 10, 2025)

### Root Cause Resolution
Fixed critical output collection system that was preventing all programs from producing output:

1. **Operation Dispatch Fix**: Added `PRINT_STRING` and `PRINT_NUM` to IO operation routing
2. **String Index Encoding**: Corrected HSV saturation → string table index mapping
3. **Systematic Debugging**: Created targeted debugging tools for future development

### Validation Results
- **Before**: All 7 programs failed with empty output `[]`
- **After**: hello_world.png passes, others produce actual output ready for encoding fixes

## Architecture

ColorLang uses HSV color values to encode instructions:
- **Hue** (0-360°): Operation type (arithmetic, memory, I/O, etc.)
- **Saturation** (0-100%): Operand values and parameters
- **Value/Brightness** (0-100%): Additional operand data

## Contributing

1. Follow the systematic debugging approach established in `CHANGELOG_SESSION.md`
2. Create targeted test cases before making changes
3. Fix root causes rather than symptoms
4. Validate against `examples/validate_examples.py`

## Links

- [Complete Documentation](docs/INDEX.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)
- [ColorLang Thesis](docs/thesis/ColorLang_Thesis.md)