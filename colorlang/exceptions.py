"""
ColorLang Exceptions
Custom exceptions for ColorLang interpreter and virtual machine.
"""

class ColorLangError(Exception):
    """Base exception for all ColorLang errors."""
    pass

class SyntaxError(ColorLangError):
    """Raised when the color syntax is invalid."""
    pass

class InvalidColorError(SyntaxError):
    """Raised when pixel color is outside valid ranges."""
    def __init__(self, hue, saturation, value, position=(0, 0)):
        self.hue = hue
        self.saturation = saturation
        self.value = value
        self.position = position
        super().__init__(f"Invalid color HSV({hue}, {saturation}, {value}) at position {position}")

class MissingOperandError(SyntaxError):
    """Raised when instruction is missing required operands."""
    def __init__(self, instruction, position=(0, 0)):
        self.instruction = instruction
        self.position = position
        super().__init__(f"Missing operand for instruction {instruction} at position {position}")

class InvalidInstructionError(SyntaxError):
    """Raised when hue range doesn't correspond to valid instruction."""
    def __init__(self, hue, position=(0, 0)):
        self.hue = hue
        self.position = position
        super().__init__(f"Unrecognized instruction with hue {hue} at position {position}")

class RuntimeError(ColorLangError):
    """Base class for runtime errors."""
    pass

class MemoryAccessError(RuntimeError):
    """Raised when accessing invalid memory location."""
    def __init__(self, address, operation="access"):
        self.address = address
        self.operation = operation
        super().__init__(f"Invalid memory {operation} at address {address}")

class StackOverflowError(RuntimeError):
    """Raised when call stack exceeds maximum depth."""
    def __init__(self, max_depth=1000):
        self.max_depth = max_depth
        super().__init__(f"Stack overflow: exceeded maximum depth of {max_depth}")

class DivisionByZeroError(RuntimeError):
    """Raised when dividing by zero."""
    def __init__(self, position=(0, 0)):
        self.position = position
        super().__init__(f"Division by zero at position {position}")

class TypeMismatchError(RuntimeError):
    """Raised when operation is performed on incompatible types."""
    def __init__(self, expected_type, actual_type, operation="operation"):
        self.expected_type = expected_type
        self.actual_type = actual_type
        self.operation = operation
        super().__init__(f"Type mismatch in {operation}: expected {expected_type}, got {actual_type}")

class SystemError(ColorLangError):
    """Base class for system-level errors."""
    pass

class ImageLoadError(SystemError):
    """Raised when program image cannot be loaded or parsed."""
    def __init__(self, image_path, reason="Unknown error"):
        self.image_path = image_path
        self.reason = reason
        super().__init__(f"Cannot load image {image_path}: {reason}")

class ResourceExhaustionError(SystemError):
    """Raised when system resources are exhausted."""
    def __init__(self, resource="memory"):
        self.resource = resource
        super().__init__(f"Resource exhausted: {resource}")

class ThreadDeadlockError(SystemError):
    """Raised when parallel execution results in deadlock."""
    def __init__(self, thread_ids=None):
        self.thread_ids = thread_ids or []
        super().__init__(f"Deadlock detected involving threads: {self.thread_ids}")

class ProgramError(ColorLangError):
    """Raised for program-level errors (HALT with error code)."""
    def __init__(self, error_code=1, message="Program terminated with error"):
        self.error_code = error_code
        super().__init__(f"{message} (code: {error_code})")

class DebugBreakpoint(ColorLangError):
    """Special exception raised when debugger breakpoint is hit."""
    def __init__(self, position=(0, 0)):
        self.position = position
        super().__init__(f"Breakpoint hit at position {position}")