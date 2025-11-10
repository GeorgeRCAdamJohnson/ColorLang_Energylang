"""
ColorLang Color Parser
Parses images into ColorLang instructions and data structures.
"""

import colorsys
from PIL import Image
import numpy as np
from typing import List, Tuple, Dict, Any, Optional

from .exceptions import *

class ColorParser:
    """Parses color images into ColorLang instruction sequences."""
    
    def __init__(self):
        self.hsv_cache = {}
        self.instruction_cache = {}
        
    def refine_hsv_decoding(self, h: float, s: float, v: float) -> Tuple[float, float, float]:
        """Refine HSV decoding to improve precision and error tolerance."""
        # Clamp values to valid ranges
        h = max(0, min(360, h))
        s = max(0, min(100, s))
        v = max(0, min(100, v))

        # Introduce redundancy checks for hue ranges
        if h < 0 or h > 360:
            raise InvalidColorError(f"Hue out of range: {h}")
        if s < 0 or s > 100:
            raise InvalidColorError(f"Saturation out of range: {s}")
        if v < 0 or v > 100:
            raise InvalidColorError(f"Value out of range: {v}")

        # Adjust hue to avoid boundary ambiguities
        if h % 10 == 0:
            h += 0.1  # Slight adjustment to avoid boundary issues

        return h, s, v

    def rgb_to_hsv(self, r: int, g: int, b: int) -> Tuple[float, float, float]:
        """Convert RGB values to HSV with caching and refined decoding."""
        rgb_key = (r, g, b)
        if rgb_key in self.hsv_cache:
            return self.hsv_cache[rgb_key]

        # Handle special cases
        if r == g == b:
            # Grayscale - hue is undefined
            h_deg = 0.0
            s_pct = 0.0
            v_pct = (r / 255.0) * 100.0
        else:
            # Convert RGB to HSV
            maxc = max(r, g, b)
            minc = min(r, g, b)
            rangec = (maxc - minc)
            
            # Calculate value
            v_pct = (maxc / 255.0) * 100.0
            
            # Calculate saturation
            s_pct = (rangec / maxc) * 100.0 if maxc else 0.0
            
            # Calculate hue
            if maxc == minc:
                h_deg = 0.0
            else:
                rc = (maxc - r) / rangec
                gc = (maxc - g) / rangec
                bc = (maxc - b) / rangec
                
                if r == maxc:
                    h_deg = bc - gc
                elif g == maxc:
                    h_deg = 2.0 + rc - bc
                else:
                    h_deg = 4.0 + gc - rc
                    
                h_deg = (h_deg * 60.0) % 360.0

        # Ensure valid ranges
        h_deg = max(0.0, min(360.0, h_deg))
        s_pct = max(0.0, min(100.0, s_pct))
        v_pct = max(0.0, min(100.0, v_pct))

        # Debug output
        print(f"[DEBUG] RGB({r}, {g}, {b}) -> HSV({h_deg:0.1f}°, {s_pct:0.1f}%, {v_pct:0.1f}%)")

        result = (h_deg, s_pct, v_pct)
        self.hsv_cache[rgb_key] = result
        return result
    
    def parse_pixel(self, r: int, g: int, b: int, position: Tuple[int, int] = (0, 0)) -> Dict[str, Any]:
        """Parse a single pixel into an instruction or data element."""
        h, s, v = self.rgb_to_hsv(r, g, b)
        
        # Debug: Log HSV values and position
        print(f"[DEBUG] Parsing pixel at {position}: RGB=({r}, {g}, {b}), HSV=({h:.2f}, {s:.2f}, {v:.2f})")
        
        # Check for reserved colors
        if self._is_reserved_color(h, s, v):
            reserved = self._parse_reserved_color(h, s, v, position)
            print(f"[DEBUG] Reserved color parsed at {position}: {reserved}")
            return reserved
        
        # Determine instruction type based on hue
        instruction_type = self._get_instruction_type(h)
        
        if instruction_type is None:
            raise InvalidInstructionError(h, position)
        
        instruction = {
            'type': instruction_type,
            'hue': h,
            'saturation': s,
            'value': v,
            'position': position,
            'raw_rgb': (r, g, b)
        }
        
        # Debug: Log parsed instruction
        print(f"[DEBUG] Parsed instruction at {position}: {instruction}")
        
        return instruction
    
    def parse_image(self, image_path: str) -> Dict[str, Any]:
        """Parse an entire image into a ColorLang program."""
        try:
            # Load image
            img = Image.open(image_path)
            img = img.convert('RGB')  # Ensure RGB format
            
            width, height = img.size
            pixels = list(img.getdata())
            
            # Debug: Print raw pixel values
            print(f"[DEBUG] Raw image pixels: {pixels[:10]}")  # First 10 pixels
            
            # Parse pixels into instructions
            instructions = []
            for y in range(height):
                row = []
                for x in range(width):
                    pixel_index = y * width + x
                    r, g, b = pixels[pixel_index]
                    
                    try:
                        instruction = self.parse_pixel(r, g, b, (x, y))
                        row.append(instruction)
                    except ColorLangError as e:
                        # Add position context to error
                        e.position = (x, y)
                        raise e
                
                instructions.append(row)
            
            # Define common output strings
            strings = {
                0: "NOP",
                1: "Hello, World!",
                2: "Thread 1",
                3: "Thread 2", 
                4: "Decision: Collect Banana",
                5: "Color Transformed",
                6: "Hello,",
                7: "World!",
                8: "Loop Complete",
                9: "Error",
                10: "Done"
            }
            
            return {
                'width': width,
                'height': height,
                'instructions': instructions,
                'strings': strings,  # Add string table
                'metadata': {
                    'source': image_path,
                    'total_pixels': width * height,
                    'format': 'RGB'
                }
            }
        
        except Exception as e:
            if isinstance(e, ColorLangError):
                raise e
            else:
                raise ImageLoadError(image_path, str(e))
    
    def parse_instruction_sequence(self, pixels: List[Tuple[int, int, int]], 
                                  start_position: Tuple[int, int] = (0, 0)) -> List[Dict[str, Any]]:
        """Parse a sequence of pixels into instructions."""
        instructions = []
        for i, (r, g, b) in enumerate(pixels):
            position = (start_position[0] + i, start_position[1])
            instruction = self.parse_pixel(r, g, b, position)
            instructions.append(instruction)
        return instructions
    
    def _is_reserved_color(self, h: float, s: float, v: float) -> bool:
        """Check if color is in reserved range."""
        # Black (NOP)
        if h == 0 and s == 0 and v == 0:
            return True
        # White (Comment)
        if h == 0 and s == 0 and v == 100:
            return True
        # Pure Gray (Barrier)
        if h == 0 and s == 0 and 45 <= v <= 55:
            return True
        return False
    
    def _parse_reserved_color(self, h: float, s: float, v: float, 
                            position: Tuple[int, int]) -> Dict[str, Any]:
        """Parse reserved color pixels."""
        if h == 0 and s == 0 and v == 0:
            return {
                'type': 'NOP',
                'hue': h,
                'saturation': s,
                'value': v,
                'position': position,
                'description': 'No operation'
            }
        elif h == 0 and s == 0 and v == 100:
            return {
                'type': 'COMMENT',
                'hue': h,
                'saturation': s,
                'value': v,
                'position': position,
                'description': 'Comment/ignored pixel'
            }
        elif h == 0 and s == 0 and 45 <= v <= 55:
            return {
                'type': 'BARRIER',
                'hue': h,
                'saturation': s,
                'value': v,
                'position': position,
                'description': 'Synchronization barrier'
            }
    
    def _get_instruction_type(self, hue: float) -> Optional[str]:
        """Determine instruction type from hue value."""
        # Debug: Log hue value
        print(f"[DEBUG] Determining instruction type for hue={hue}")
        
        # Round hue to avoid floating point issues
        hue = round(hue, 2)
        
        # Special handling for grayscale pixels (indicating IO operations)
        if hue == 0.0:
            return 'IO'
        
        if 0 <= hue < 31:
            return 'DATA'
        elif 31 <= hue < 91:
            return 'ARITHMETIC'
        elif 91 <= hue < 151:
            return 'MEMORY'
        elif 151 <= hue < 211:
            return 'CONTROL'
        elif 211 <= hue < 271:
            return 'FUNCTION'
        elif 271 <= hue < 331:
            return 'IO'
        elif 331 <= hue <= 360:
            return 'SYSTEM'
        else:
            return None
    
    def get_operation_name(self, instruction: Dict[str, Any]) -> str:
        """Get specific operation name from instruction."""
        instruction_type = instruction['type']
        hue = instruction['hue']
        
        if instruction_type == 'ARITHMETIC':
            if 31 <= hue < 41:
                return 'ADD'
            elif 41 <= hue < 51:
                return 'SUB'
            elif 51 <= hue < 61:
                return 'MUL'
            elif 61 <= hue < 71:
                return 'DIV'
            elif 71 <= hue < 81:
                return 'MOD'
            elif 81 <= hue < 91:
                return 'POW'
        
        elif instruction_type == 'MEMORY':
            if 91 <= hue < 101:
                return 'LOAD'
            elif 101 <= hue < 111:
                return 'STORE'
            elif 111 <= hue < 121:
                return 'MOVE'
            elif 121 <= hue < 131:
                return 'COPY'
            elif 131 <= hue < 141:
                return 'ALLOC'
            elif 141 <= hue < 151:
                return 'FREE'
        
        elif instruction_type == 'CONTROL':
            if 151 <= hue < 161:
                return 'IF'
            elif 161 <= hue < 171:
                return 'ELSE'
            elif 171 <= hue < 181:
                return 'WHILE'
            elif 181 <= hue < 191:
                return 'FOR'
            elif 191 <= hue < 201:
                return 'BREAK'
            elif 201 <= hue < 211:
                return 'CONTINUE'
        
        elif instruction_type == 'FUNCTION':
            if 211 <= hue < 221:
                return 'CALL'
            elif 221 <= hue < 231:
                return 'RETURN'
            elif 231 <= hue < 241:
                return 'FUNC_DEF'
            elif 241 <= hue < 251:
                return 'PARAM'
            elif 251 <= hue < 261:
                return 'LOCAL'
            elif 261 <= hue < 271:
                return 'CLOSURE'
        
        elif instruction_type == 'IO':
            # First check colored pixels in IO range
            if 270 <= hue <= 280:  # Print string from string table
                return 'PRINT_STRING'
            elif 280 < hue < 290:  # Print numeric value from DR0
                return 'PRINT_NUM'
            elif 290 <= hue < 300:
                return 'INPUT'
            elif 300 <= hue < 310:
                return 'READ_FILE'
            elif 310 <= hue < 320:
                return 'WRITE_FILE'
            elif 320 <= hue < 330:
                return 'NETWORK_SEND'
            elif 330 <= hue < 340:
                return 'NETWORK_RECV'
            # For grayscale pixels (hue=0), determine based on saturation 
            elif hue == 0.0:
                saturation = instruction['saturation']
                if 0 <= saturation <= 20:  # Dark gray
                    return 'PRINT_NUM'
                elif 20 < saturation <= 50:  # Medium gray
                    return 'PRINT_STRING'
                elif saturation > 50:  # Light gray
                    return 'INPUT'
        
        elif instruction_type == 'SYSTEM':
            if 331 <= hue < 341:
                return 'HALT'
            elif 341 <= hue < 351:
                return 'DEBUG'
            elif 351 <= hue <= 360:
                return 'THREAD_SPAWN'
            elif 0 <= hue < 11:
                return 'THREAD_JOIN'
            elif 11 <= hue < 21:
                return 'MUTEX_LOCK'
            elif 21 <= hue < 31:
                return 'MUTEX_UNLOCK'
        
        elif instruction_type == 'DATA':
            if 0 <= hue < 16:
                return 'INTEGER'
            elif 16 <= hue < 31:
                return 'FLOAT'
        
        return f'UNKNOWN_{instruction_type}'
    
    def extract_operands(self, instruction: Dict[str, Any]) -> Dict[str, Any]:
        """Extract operands from instruction saturation and value."""
        saturation = instruction['saturation']
        value = instruction['value']
        
        return {
            'operand_a': int(saturation),  # Could be register, address, or immediate value
            'operand_b': int(value),       # Could be register, address, or immediate value
            'operand_a_type': self._get_operand_type(saturation),
            'operand_b_type': self._get_operand_type(value)
        }
    
    def _get_operand_type(self, operand_value: float) -> str:
        """Determine operand type from its value."""
        if 0 <= operand_value < 25:
            return 'REGISTER'
        elif 25 <= operand_value < 50:
            return 'IMMEDIATE'
        elif 50 <= operand_value < 75:
            return 'MEMORY_ADDR'
        else:
            return 'EXTENDED'
    
    def validate_program(self, program: Dict[str, Any]) -> List[str]:
        """Validate a parsed program and return list of warnings/errors."""
        warnings = []
        instructions = program['instructions']
        
        # Check for missing HALT instruction
        has_halt = False
        for row in instructions:
            for instruction in row:
                if self.get_operation_name(instruction) == 'HALT':
                    has_halt = True
                    break
            if has_halt:
                break
        
        if not has_halt:
            warnings.append("Program does not contain HALT instruction")
        
        # Check for unreachable code after HALT
        halt_found = False
        for y, row in enumerate(instructions):
            for x, instruction in enumerate(row):
                if halt_found and instruction['type'] != 'COMMENT':
                    warnings.append(f"Unreachable code at position ({x}, {y})")
                
                if self.get_operation_name(instruction) == 'HALT':
                    halt_found = True
        
        return warnings