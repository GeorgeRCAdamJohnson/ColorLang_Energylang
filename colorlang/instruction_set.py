"""
ColorLang Instruction Set
Defines the complete instruction set and operation mappings for ColorLang.
"""

from typing import Dict, List, Tuple, Any, Optional
from .exceptions import *

class InstructionSet:
    """Defines and manages the ColorLang instruction set."""
    
    def __init__(self):
        self.operations = self._initialize_operations()
        self.data_types = self._initialize_data_types()
        
    def _initialize_operations(self) -> Dict[str, Dict[str, Any]]:
        """Initialize the complete operation set with metadata."""
        return {
            # Arithmetic Operations (Hue: 31-90°)
            'ADD': {
                'hue_range': (31, 40),
                'operands': 3,  # [operand1][ADD][operand2] -> result
                'description': 'Addition operation',
                'execution_cycles': 1,
                'side_effects': False
            },
            'SUB': {
                'hue_range': (41, 50),
                'operands': 3,
                'description': 'Subtraction operation',
                'execution_cycles': 1,
                'side_effects': False
            },
            'MUL': {
                'hue_range': (51, 60),
                'operands': 3,
                'description': 'Multiplication operation',
                'execution_cycles': 2,
                'side_effects': False
            },
            'DIV': {
                'hue_range': (61, 70),
                'operands': 3,
                'description': 'Division operation',
                'execution_cycles': 3,
                'side_effects': False,
                'exceptions': ['DivisionByZeroError']
            },
            'MOD': {
                'hue_range': (71, 80),
                'operands': 3,
                'description': 'Modulo operation',
                'execution_cycles': 3,
                'side_effects': False,
                'exceptions': ['DivisionByZeroError']
            },
            'POW': {
                'hue_range': (81, 90),
                'operands': 3,
                'description': 'Power/exponentiation operation',
                'execution_cycles': 5,
                'side_effects': False
            },
            
            # Memory Operations (Hue: 91-150°)
            'LOAD': {
                'hue_range': (91, 100),
                'operands': 2,  # [address][LOAD] -> register
                'description': 'Load value from memory to register',
                'execution_cycles': 2,
                'side_effects': False,
                'exceptions': ['MemoryAccessError']
            },
            'STORE': {
                'hue_range': (101, 110),
                'operands': 2,  # [register][STORE] -> address
                'description': 'Store register value to memory',
                'execution_cycles': 2,
                'side_effects': True,
                'exceptions': ['MemoryAccessError']
            },
            'MOVE': {
                'hue_range': (111, 120),
                'operands': 2,  # [source][MOVE] -> destination
                'description': 'Move value between registers',
                'execution_cycles': 1,
                'side_effects': True
            },
            'COPY': {
                'hue_range': (121, 130),
                'operands': 2,  # [source][COPY] -> destination
                'description': 'Copy value between registers',
                'execution_cycles': 1,
                'side_effects': False
            },
            'ALLOC': {
                'hue_range': (131, 140),
                'operands': 2,  # [size][ALLOC] -> pointer
                'description': 'Allocate memory block',
                'execution_cycles': 10,
                'side_effects': True,
                'exceptions': ['ResourceExhaustionError']
            },
            'FREE': {
                'hue_range': (141, 150),
                'operands': 1,  # [pointer][FREE]
                'description': 'Free allocated memory block',
                'execution_cycles': 5,
                'side_effects': True,
                'exceptions': ['MemoryAccessError']
            },
            
            # Advanced Data Structure Operations (Hue: 141-151°)
            'ARRAY_CREATE': {
                'hue_range': (141, 143),
                'operands': 2,  # [size][ARRAY_CREATE] -> array_pointer
                'description': 'Create a new array with specified size',
                'execution_cycles': 5,
                'side_effects': True
            },
            'ARRAY_SET': {
                'hue_range': (143, 145),
                'operands': 3,  # [array_pointer][index][value]
                'description': 'Set value at specific index in array',
                'execution_cycles': 3,
                'side_effects': True
            },
            'ARRAY_GET': {
                'hue_range': (145, 147),
                'operands': 3,  # [array_pointer][index][ARRAY_GET] -> value
                'description': 'Get value from specific index in array',
                'execution_cycles': 3,
                'side_effects': False
            },
            'DICT_CREATE': {
                'hue_range': (147, 149),
                'operands': 1,  # [DICT_CREATE] -> dict_pointer
                'description': 'Create a new dictionary',
                'execution_cycles': 5,
                'side_effects': True
            },
            'DICT_SET': {
                'hue_range': (149, 150),
                'operands': 3,  # [dict_pointer][key][value]
                'description': 'Set key-value pair in dictionary',
                'execution_cycles': 4,
                'side_effects': True
            },
            'DICT_GET': {
                'hue_range': (150, 151),
                'operands': 3,  # [dict_pointer][key][DICT_GET] -> value
                'description': 'Get value for key in dictionary',
                'execution_cycles': 4,
                'side_effects': False
            },
            
            # Control Flow Operations (Hue: 151-210°)
            'IF': {
                'hue_range': (151, 160),
                'operands': 2,  # [condition][IF] -> jump_address
                'description': 'Conditional jump if true',
                'execution_cycles': 1,
                'side_effects': False,
                'control_flow': True
            },
            'ELSE': {
                'hue_range': (161, 170),
                'operands': 1,  # [ELSE] -> jump_address
                'description': 'Alternative branch for IF',
                'execution_cycles': 1,
                'side_effects': False,
                'control_flow': True
            },
            'WHILE': {
                'hue_range': (171, 180),
                'operands': 2,  # [condition][WHILE] -> loop_start
                'description': 'Loop while condition is true',
                'execution_cycles': 1,
                'side_effects': False,
                'control_flow': True
            },
            'FOR': {
                'hue_range': (181, 190),
                'operands': 4,  # [counter][FOR][limit][increment]
                'description': 'For loop with counter',
                'execution_cycles': 2,
                'side_effects': True,
                'control_flow': True
            },
            'BREAK': {
                'hue_range': (191, 200),
                'operands': 0,  # [BREAK]
                'description': 'Break out of loop',
                'execution_cycles': 1,
                'side_effects': False,
                'control_flow': True
            },
            'CONTINUE': {
                'hue_range': (201, 210),
                'operands': 0,  # [CONTINUE]
                'description': 'Continue to next loop iteration',
                'execution_cycles': 1,
                'side_effects': False,
                'control_flow': True
            },
            
            # Function Operations (Hue: 211-270°)
            'CALL': {
                'hue_range': (211, 220),
                'operands': 2,  # [function_address][CALL][arg_count]
                'description': 'Call function',
                'execution_cycles': 3,
                'side_effects': True,
                'control_flow': True,
                'exceptions': ['StackOverflowError']
            },
            'RETURN': {
                'hue_range': (221, 230),
                'operands': 1,  # [RETURN][return_value]
                'description': 'Return from function',
                'execution_cycles': 2,
                'side_effects': True,
                'control_flow': True
            },
            'FUNC_DEF': {
                'hue_range': (231, 240),
                'operands': 3,  # [FUNC_DEF][name][param_count]
                'description': 'Define function',
                'execution_cycles': 1,
                'side_effects': True
            },
            'PARAM': {
                'hue_range': (241, 250),
                'operands': 2,  # [PARAM][name][type]
                'description': 'Function parameter definition',
                'execution_cycles': 1,
                'side_effects': True
            },
            'LOCAL': {
                'hue_range': (251, 260),
                'operands': 2,  # [LOCAL][name][initial_value]
                'description': 'Local variable declaration',
                'execution_cycles': 1,
                'side_effects': True
            },
            'CLOSURE': {
                'hue_range': (261, 270),
                'operands': 2,  # [CLOSURE][var_name][capture_type]
                'description': 'Capture variable in closure',
                'execution_cycles': 2,
                'side_effects': True
            },
            
            # I/O Operations (Hue: 271-330°)
            'PRINT': {
                'hue_range': (271, 280),
                'operands': 1,  # [PRINT][value]
                'description': 'Print value to output',
                'execution_cycles': 10,
                'side_effects': True
            },
            'INPUT': {
                'hue_range': (281, 290),
                'operands': 1,  # [INPUT] -> register
                'description': 'Read input to register',
                'execution_cycles': 50,  # Blocking operation
                'side_effects': True
            },
            'READ_FILE': {
                'hue_range': (291, 300),
                'operands': 2,  # [filename][READ_FILE] -> content
                'description': 'Read file contents',
                'execution_cycles': 100,
                'side_effects': True,
                'exceptions': ['SystemError']
            },
            'WRITE_FILE': {
                'hue_range': (301, 310),
                'operands': 2,  # [filename][WRITE_FILE][content]
                'description': 'Write content to file',
                'execution_cycles': 100,
                'side_effects': True,
                'exceptions': ['SystemError']
            },
            'NETWORK_SEND': {
                'hue_range': (311, 320),
                'operands': 3,  # [address][port][NETWORK_SEND][data]
                'description': 'Send data over network',
                'execution_cycles': 200,
                'side_effects': True,
                'exceptions': ['SystemError']
            },
            'NETWORK_RECV': {
                'hue_range': (321, 330),
                'operands': 2,  # [port][NETWORK_RECV] -> data
                'description': 'Receive data from network',
                'execution_cycles': 200,
                'side_effects': True,
                'exceptions': ['SystemError']
            },
            
            # System Operations (Hue: 331-360°, 0-30°)
            'HALT': {
                'hue_range': (331, 340),
                'operands': 1,  # [HALT][exit_code]
                'description': 'Halt program execution',
                'execution_cycles': 1,
                'side_effects': True,
                'control_flow': True
            },
            'DEBUG': {
                'hue_range': (341, 350),
                'operands': 1,  # [DEBUG][debug_info]
                'description': 'Debug breakpoint',
                'execution_cycles': 1,
                'side_effects': False,
                'exceptions': ['DebugBreakpoint']
            },
            'THREAD_SPAWN': {
                'hue_range': (351, 360),
                'operands': 2,  # [function][THREAD_SPAWN] -> thread_id
                'description': 'Spawn new execution thread',
                'execution_cycles': 20,
                'side_effects': True,
                'exceptions': ['ResourceExhaustionError']
            },
            'THREAD_JOIN': {
                'hue_range': (0, 10),
                'operands': 1,  # [thread_id][THREAD_JOIN]
                'description': 'Wait for thread completion',
                'execution_cycles': 1,
                'side_effects': False,
                'exceptions': ['ThreadDeadlockError']
            },
            'MUTEX_LOCK': {
                'hue_range': (11, 20),
                'operands': 1,  # [mutex_id][MUTEX_LOCK]
                'description': 'Acquire mutex lock',
                'execution_cycles': 1,
                'side_effects': True,
                'exceptions': ['ThreadDeadlockError']
            },
            'MUTEX_UNLOCK': {
                'hue_range': (21, 30),
                'operands': 1,  # [mutex_id][MUTEX_UNLOCK]
                'description': 'Release mutex lock',
                'execution_cycles': 1,
                'side_effects': True
            },
            
            # Neural Network Operations (Hue: 16-30°)
            'NN_FORWARD': {
                'hue_range': (16, 20),
                'operands': 3,  # [input][weights][NN_FORWARD] -> output
                'description': 'Perform forward pass in a neural network layer',
                'execution_cycles': 10,
                'side_effects': False
            },
            'NN_BACKWARD': {
                'hue_range': (21, 25),
                'operands': 4,  # [output_grad][weights][input][NN_BACKWARD] -> weight_grad
                'description': 'Perform backward pass for gradient computation',
                'execution_cycles': 15,
                'side_effects': True
            },
            'NN_UPDATE': {
                'hue_range': (26, 30),
                'operands': 3,  # [weights][weight_grad][NN_UPDATE]
                'description': 'Update weights using gradients',
                'execution_cycles': 5,
                'side_effects': True
            }
        }
    
    def _initialize_data_types(self) -> Dict[str, Dict[str, Any]]:
        """Initialize data type definitions."""
        return {
            'INTEGER': {
                'hue_range': (0, 15),
                'encoding': 'saturation=magnitude, value=sign',
                'range': (-1000, 1000),
                'size_bytes': 4
            },
            'FLOAT': {
                'hue_range': (16, 30),
                'encoding': 'saturation=whole, value=fractional',
                'range': (-10.0, 10.0),
                'precision': 2,
                'size_bytes': 4
            },
            'BOOLEAN': {
                'hue_range': (0, 0),  # Special case: hue=0
                'encoding': 'saturation=0, value=truth_value',
                'values': ['true', 'false'],
                'size_bytes': 1
            },
            'COLOR': {
                'hue_range': (0, 360),
                'encoding': 'native HSV representation',
                'components': ['hue', 'saturation', 'value'],
                'size_bytes': 12
            },
            'STRING': {
                'hue_range': (0, 360),  # Character encoding
                'encoding': 'hue=ASCII_value/128*360',
                'max_length': 'image_width',
                'terminator': 'black_pixel',
                'size_bytes': 'variable'
            }
        }
    
    def get_operation_by_hue(self, hue: float) -> Optional[str]:
        """Get operation name by hue value."""
        for op_name, op_info in self.operations.items():
            hue_min, hue_max = op_info['hue_range']
            if hue_min <= hue < hue_max:
                return op_name
        return None
    
    def get_operation_info(self, operation_name: str) -> Optional[Dict[str, Any]]:
        """Get complete operation information."""
        return self.operations.get(operation_name)
    
    def validate_operands(self, operation_name: str, operand_count: int) -> bool:
        """Validate operand count for operation."""
        op_info = self.get_operation_info(operation_name)
        if op_info is None:
            return False
        return op_info['operands'] == operand_count
    
    def get_execution_cycles(self, operation_name: str) -> int:
        """Get execution cycle count for operation."""
        op_info = self.get_operation_info(operation_name)
        return op_info['execution_cycles'] if op_info else 1
    
    def has_side_effects(self, operation_name: str) -> bool:
        """Check if operation has side effects."""
        op_info = self.get_operation_info(operation_name)
        return op_info.get('side_effects', False) if op_info else False
    
    def is_control_flow(self, operation_name: str) -> bool:
        """Check if operation affects control flow."""
        op_info = self.get_operation_info(operation_name)
        return op_info.get('control_flow', False) if op_info else False
    
    def get_possible_exceptions(self, operation_name: str) -> List[str]:
        """Get list of possible exceptions for operation."""
        op_info = self.get_operation_info(operation_name)
        return op_info.get('exceptions', []) if op_info else []
    
    def decode_data_value(self, hue: float, saturation: float, value: float) -> Any:
        """Decode pixel values into data based on type."""
        # Determine data type from hue
        if 0 <= hue < 16:
            # Integer
            magnitude = int(saturation * 10)  # 0-1000
            sign = 1 if value > 50 else -1
            return sign * magnitude
        
        elif 16 <= hue < 31:
            # Float
            whole_part = int(saturation / 10)  # 0-10
            fractional_part = int(value) / 100  # 0.00-0.99
            return whole_part + fractional_part
        
        elif hue == 0 and saturation == 0:
            # Boolean
            return value > 50
        
        else:
            # Color (native HSV)
            return {'hue': hue, 'saturation': saturation, 'value': value}
    
    def encode_data_value(self, data_value: Any, target_type: str = None) -> Tuple[float, float, float]:
        """Encode data value into HSV pixel values."""
        if isinstance(data_value, int):
            # Integer encoding
            if target_type != 'INTEGER':
                target_type = 'INTEGER'
            
            magnitude = min(abs(data_value), 1000)
            hue = 7.5  # Middle of integer range
            saturation = (magnitude / 1000) * 100
            value = 75 if data_value >= 0 else 25
            return (hue, saturation, value)
        
        elif isinstance(data_value, float):
            # Float encoding
            if target_type != 'FLOAT':
                target_type = 'FLOAT'
            
            whole_part = min(int(abs(data_value)), 10)
            fractional_part = abs(data_value) - whole_part
            
            hue = 23  # Middle of float range
            saturation = (whole_part / 10) * 100
            value = fractional_part * 100
            return (hue, saturation, value)
        
        elif isinstance(data_value, bool):
            # Boolean encoding
            hue = 0
            saturation = 0
            value = 75 if data_value else 25
            return (hue, saturation, value)
        
        elif isinstance(data_value, dict) and 'hue' in data_value:
            # Color encoding (passthrough)
            return (data_value['hue'], data_value['saturation'], data_value['value'])
        
        else:
            # Default to integer encoding for unknown types
            return self.encode_data_value(int(str(data_value)), 'INTEGER')
    
    def get_all_operations(self) -> List[str]:
        """Get list of all operation names."""
        return list(self.operations.keys())
    
    def get_operations_by_category(self) -> Dict[str, List[str]]:
        """Get operations grouped by category."""
        categories = {
            'ARITHMETIC': [],
            'MEMORY': [],
            'CONTROL': [],
            'FUNCTION': [],
            'IO': [],
            'SYSTEM': []
        }
        
        for op_name, op_info in self.operations.items():
            hue_min, hue_max = op_info['hue_range']
            
            if 31 <= hue_min < 91:
                categories['ARITHMETIC'].append(op_name)
            elif 91 <= hue_min < 151:
                categories['MEMORY'].append(op_name)
            elif 151 <= hue_min < 211:
                categories['CONTROL'].append(op_name)
            elif 211 <= hue_min < 271:
                categories['FUNCTION'].append(op_name)
            elif 271 <= hue_min < 331:
                categories['IO'].append(op_name)
            else:
                categories['SYSTEM'].append(op_name)
        
        return categories
    
    def generate_instruction_reference(self) -> str:
        """Generate human-readable instruction reference."""
        reference = "ColorLang Instruction Set Reference\n"
        reference += "=" * 40 + "\n\n"
        
        categories = self.get_operations_by_category()
        
        for category, operations in categories.items():
            reference += f"{category} OPERATIONS\n"
            reference += "-" * 20 + "\n"
            
            for op_name in operations:
                op_info = self.operations[op_name]
                hue_min, hue_max = op_info['hue_range']
                reference += f"{op_name:12} | Hue: {hue_min:3.0f}-{hue_max:3.0f}° | "
                reference += f"Operands: {op_info['operands']} | "
                reference += f"Cycles: {op_info['execution_cycles']}\n"
                reference += f"             {op_info['description']}\n"
                
                if op_info.get('exceptions'):
                    reference += f"             Exceptions: {', '.join(op_info['exceptions'])}\n"
                
                reference += "\n"
            
            reference += "\n"
        
        return reference