# ColorLang Installation Guide

## Overview
This comprehensive installation guide will get you up and running with ColorLang in under 30 minutes. ColorLang is a machine-native, color-encoded programming language with unique Python environment requirements.

## Prerequisites

### System Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux Ubuntu 18.04+
- **Python**: Version 3.8 or higher (3.12 recommended)
- **Memory**: Minimum 4GB RAM (8GB recommended for large programs)
- **Storage**: 2GB free space for installation and examples

### Required Dependencies
- `Pillow` (PIL) - Image processing
- `numpy` - Numerical computations
- `reportlab` - PDF generation
- `markdown` - Documentation processing

## Installation Methods

### Method 1: Quick Install (Recommended)

#### Windows Installation

1. **Install Python 3.12**
   ```powershell
   # Using Windows Package Manager (if available)
   winget install Python.Python.3.12
   
   # Or download from https://python.org and install manually
   ```

2. **Configure Python PATH**
   ```powershell
   # Add Python to PATH (replace username)
   $pythonPath = "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python312"
   $scriptsPath = "$pythonPath\Scripts"
   
   # Add to User PATH permanently
   $currentPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
   if ($currentPath -notlike "*$pythonPath*") {
       [System.Environment]::SetEnvironmentVariable("PATH", "$currentPath;$pythonPath;$scriptsPath", "User")
   }
   
   # Refresh current session
   $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","User") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","Machine")
   ```

3. **Clone ColorLang Repository**
   ```powershell
   git clone https://github.com/GeorgeRCAdamJohnson/ColorLang.git
   cd ColorLang
   ```

4. **Install Dependencies**
   ```powershell
   python -m pip install --upgrade pip wheel
   python -m pip install pillow numpy reportlab markdown
   ```

5. **Verify Installation**
   ```powershell
   # Set PYTHONPATH for ColorLang
   $env:PYTHONPATH = "$(Get-Location)"
   
   # Test ColorLang import
   python -c "import colorlang; print('ColorLang installed successfully!')"
   
   # Run validation tests
   python examples/validate_examples.py
   ```

#### macOS Installation

1. **Install Python 3.12**
   ```bash
   # Using Homebrew
   brew install python@3.12
   
   # Or download from https://python.org
   ```

2. **Install Dependencies**
   ```bash
   python3.12 -m pip install --upgrade pip wheel
   python3.12 -m pip install pillow numpy reportlab markdown
   ```

3. **Clone and Setup**
   ```bash
   git clone https://github.com/GeorgeRCAdamJohnson/ColorLang.git
   cd ColorLang
   export PYTHONPATH="$(pwd)"
   python3.12 -c "import colorlang; print('ColorLang installed successfully!')"
   ```

#### Linux Installation

1. **Install Python 3.12**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install python3.12 python3.12-pip python3.12-venv
   
   # CentOS/RHEL/Fedora
   sudo dnf install python3.12 python3.12-pip
   ```

2. **Install Dependencies**
   ```bash
   python3.12 -m pip install --user --upgrade pip wheel
   python3.12 -m pip install --user pillow numpy reportlab markdown
   ```

3. **Clone and Setup**
   ```bash
   git clone https://github.com/GeorgeRCAdamJohnson/ColorLang.git
   cd ColorLang
   export PYTHONPATH="$(pwd)"
   python3.12 -c "import colorlang; print('ColorLang installed successfully!')"
   ```

### Method 2: Virtual Environment Install (Isolated)

#### Windows Virtual Environment
```powershell
# Create virtual environment
python -m venv colorlang-env

# Activate environment
.\colorlang-env\Scripts\Activate.ps1

# Install dependencies
python -m pip install --upgrade pip wheel
python -m pip install pillow numpy reportlab markdown

# Clone and setup
git clone https://github.com/GeorgeRCAdamJohnson/ColorLang.git
cd ColorLang
$env:PYTHONPATH = "$(Get-Location)"
```

#### macOS/Linux Virtual Environment
```bash
# Create and activate virtual environment
python3.12 -m venv colorlang-env
source colorlang-env/bin/activate

# Install dependencies
python -m pip install --upgrade pip wheel
python -m pip install pillow numpy reportlab markdown

# Clone and setup
git clone https://github.com/GeorgeRCAdamJohnson/ColorLang.git
cd ColorLang
export PYTHONPATH="$(pwd)"
```

## Verification and Testing

### Quick Verification
```bash
# Test core module import
python -c "import colorlang; print('✓ ColorLang core module loaded')"

# Test parser functionality
python -c "from colorlang import ColorParser; parser = ColorParser(); print('✓ Color parser initialized')"

# Test VM functionality
python -c "from colorlang import ColorVM; vm = ColorVM(); print('✓ Virtual machine initialized')"

# Test example programs
python examples/validate_examples.py
```

### Generate Test Programs
```bash
# Create example programs
python examples/create_examples.py

# Verify examples directory
ls examples/examples/  # Should show .png files
```

### Run Demo Programs
```bash
# Run platformer demo
python demos/platformer/run_platformer_demo.py

# Run ColorLang platformer
$env:PYTHONPATH = "$(Get-Location)"  # Windows
export PYTHONPATH="$(pwd)"           # macOS/Linux
python demos/platformer_colorlang/platformer_host.py
```

## Environment Configuration

### Setting PYTHONPATH Permanently

#### Windows (PowerShell Profile)
```powershell
# Add to PowerShell profile for automatic setup
$profilePath = $PROFILE
if (!(Test-Path $profilePath)) {
    New-Item -Type File -Path $profilePath -Force
}

Add-Content $profilePath '$env:PYTHONPATH = "C:\path\to\ColorLang"'
```

#### macOS/Linux (Shell Profile)
```bash
# Add to ~/.bashrc or ~/.zshrc
echo 'export PYTHONPATH="/path/to/ColorLang:$PYTHONPATH"' >> ~/.bashrc
source ~/.bashrc
```

### IDE Configuration

#### VS Code Setup
1. Install Python extension
2. Open ColorLang folder in VS Code
3. Create `.vscode/settings.json`:
   ```json
   {
       "python.analysis.extraPaths": ["./"],
       "python.analysis.autoSearchPaths": true,
       "python.defaultInterpreterPath": "./colorlang-env/bin/python"
   }
   ```

#### PyCharm Setup
1. Open ColorLang project
2. Go to Settings → Project → Python Interpreter
3. Add project root to Python paths
4. Mark `colorlang` directory as Sources Root

## Troubleshooting

### Common Issues

#### 1. "Python was not found" Error
**Problem**: Python not in PATH
**Solution**: 
```powershell
# Windows: Use full path
& "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python312\python.exe" -c "print('Works!')"

# Or fix PATH as shown in installation steps
```

#### 2. "ModuleNotFoundError: No module named 'colorlang'"
**Problem**: PYTHONPATH not set
**Solution**:
```bash
# Set PYTHONPATH to ColorLang directory
export PYTHONPATH="/path/to/ColorLang:$PYTHONPATH"  # Linux/macOS
$env:PYTHONPATH = "C:\path\to\ColorLang"            # Windows
```

#### 3. "Permission denied" Installing Packages
**Problem**: System-wide installation restricted
**Solution**: Use `--user` flag
```bash
python -m pip install --user pillow numpy reportlab markdown
```

#### 4. Pillow Installation Fails
**Problem**: Missing system dependencies
**Solution**:
```bash
# Ubuntu/Debian
sudo apt-get install python3-dev python3-setuptools libjpeg-dev zlib1g-dev

# macOS
xcode-select --install

# Then retry pip install
```

#### 5. ColorLang Programs Show Black Frames
**Problem**: Rendering pipeline not configured
**Solution**: Check shared memory and rendering:
```python
# Add debug prints to verify data flow
print(f"Tilemap shape: {shm.tilemap.shape}")
print(f"Agent position: {shm.agent}")
```

### Debug Mode Installation
For development and debugging:
```bash
# Install with debug dependencies
python -m pip install pillow numpy reportlab markdown pytest coverage

# Enable debug mode
export COLORLANG_DEBUG=1  # Linux/macOS
$env:COLORLANG_DEBUG = "1"  # Windows

# Run with verbose output
python -v examples/validate_examples.py
```

### Performance Optimization
For large programs and better performance:
```bash
# Install optional performance packages
python -m pip install numba opencv-python

# Enable performance mode
export COLORLANG_OPTIMIZE=1
```

## Validation Checklist

After installation, verify these work:

- [ ] **Core Import**: `import colorlang` succeeds
- [ ] **Parser**: Can load and parse example PNG programs
- [ ] **VM**: Can execute simple programs (hello world)
- [ ] **Examples**: `validate_examples.py` passes all tests
- [ ] **Demos**: Platformer demo generates frames
- [ ] **Tools**: Micro-assembler can generate kernel images
- [ ] **Compression**: Can compress/decompress programs
- [ ] **Rendering**: Frame generation produces visible content

## Next Steps

Once installation is complete:

1. **Read the Documentation**: Start with `docs/USER_GUIDE.md`
2. **Try Examples**: Run programs in `examples/examples/`
3. **Build Your First Program**: Use the micro-assembler
4. **Explore Demos**: Check out the platformer implementations
5. **Join Development**: See `docs/CONTRIBUTING.md`

## Getting Help

- **Documentation**: Check `docs/` directory
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Troubleshooting**: See `docs/TROUBLESHOOTING.md`

## Advanced Installation Options

### Docker Installation (Coming Soon)
```dockerfile
# Dockerfile for containerized ColorLang
FROM python:3.12-slim
COPY . /colorlang
WORKDIR /colorlang
RUN pip install pillow numpy reportlab markdown
ENV PYTHONPATH=/colorlang
CMD ["python", "examples/validate_examples.py"]
```

### Package Installation (Future)
```bash
# Once published to PyPI
pip install colorlang

# With optional dependencies
pip install colorlang[dev,performance,docs]
```

---

**Installation Complete!** 🎉

You now have a fully functional ColorLang development environment. The installation should take less than 30 minutes on most systems. If you encounter any issues not covered in this guide, please refer to the troubleshooting section or create an issue on GitHub.