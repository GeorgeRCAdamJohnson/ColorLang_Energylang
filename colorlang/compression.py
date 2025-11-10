"""
ColorLang Compression System
Advanced compression techniques for ColorLang programs to reduce file sizes
and improve loading/execution performance.
"""

import numpy as np
from PIL import Image
import colorsys
import json
import zlib
import base64
from typing import Dict, List, Tuple, Any, Optional
from collections import Counter

class ColorCompressor:
    """Advanced compression system for ColorLang programs."""
    
    def __init__(self):
        self.color_palette = {}  # Common colors mapped to indices
        self.pattern_dictionary = {}  # Common instruction patterns
        self.compression_stats = {}
        
    def analyze_program(self, program: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze program structure for compression opportunities."""
        instructions = program['instructions']
        flat_instructions = [inst for row in instructions for inst in row]
        
        # Color frequency analysis
        colors = [(inst['hue'], inst['saturation'], inst['value']) 
                 for inst in flat_instructions]
        color_freq = Counter(colors)
        
        # Pattern analysis (sequences of 2-4 instructions)
        patterns_2 = []
        patterns_3 = []
        patterns_4 = []
        
        for row in instructions:
            for i in range(len(row) - 1):
                patterns_2.append(tuple((inst['hue'], inst['saturation'], inst['value']) 
                                      for inst in row[i:i+2]))
            for i in range(len(row) - 2):
                patterns_3.append(tuple((inst['hue'], inst['saturation'], inst['value']) 
                                      for inst in row[i:i+3]))
            for i in range(len(row) - 3):
                patterns_4.append(tuple((inst['hue'], inst['saturation'], inst['value']) 
                                      for inst in row[i:i+4]))
        
        pattern_freq_2 = Counter(patterns_2)
        pattern_freq_3 = Counter(patterns_3)
        pattern_freq_4 = Counter(patterns_4)
        
        return {
            'total_instructions': len(flat_instructions),
            'unique_colors': len(color_freq),
            'most_common_colors': color_freq.most_common(10),
            'pattern_freq_2': pattern_freq_2.most_common(5),
            'pattern_freq_3': pattern_freq_3.most_common(5),
            'pattern_freq_4': pattern_freq_4.most_common(5),
            'compression_potential': self._estimate_compression_ratio(color_freq, pattern_freq_3)
        }
    
    def _estimate_compression_ratio(self, color_freq: Counter, pattern_freq: Counter) -> float:
        """Estimate potential compression ratio."""
        total_pixels = sum(color_freq.values())
        unique_colors = len(color_freq)
        
        # Simple estimation based on color palette reduction
        if unique_colors <= 16:
            palette_saving = 0.75  # 4 bits per pixel instead of 24
        elif unique_colors <= 256:
            palette_saving = 0.66  # 8 bits per pixel
        else:
            palette_saving = 0.5   # Some savings from patterns
        
        # Additional savings from pattern compression
        pattern_savings = min(0.3, len(pattern_freq) * 0.01)
        
        return palette_saving + pattern_savings
    
    def compress_program(self, program: Dict[str, Any], method: str = "palette") -> Dict[str, Any]:
        """Compress a ColorLang program using specified method."""
        if method == "palette":
            return self._compress_with_palette(program)
        elif method == "patterns":
            return self._compress_with_patterns(program)
        elif method == "hybrid":
            return self._compress_hybrid(program)
        elif method == "rle":
            return self._compress_run_length(program)
        elif method == "neural_patterns":
            return self._compress_with_neural_patterns(program)
        else:
            raise ValueError(f"Unknown compression method: {method}")
    
    def _compress_with_palette(self, program: Dict[str, Any]) -> Dict[str, Any]:
        """Compress using color palette reduction."""
        instructions = program['instructions']
        flat_instructions = [inst for row in instructions for inst in row]
        
        # Build color palette
        colors = [(inst['hue'], inst['saturation'], inst['value']) 
                 for inst in flat_instructions]
        unique_colors = list(set(colors))
        
        # Create palette mapping
        palette = {color: idx for idx, color in enumerate(unique_colors)}
        
        # Compress instructions to palette indices
        compressed_data = []
        for row in instructions:
            row_data = []
            for inst in row:
                color = (inst['hue'], inst['saturation'], inst['value'])
                row_data.append(palette[color])
            compressed_data.append(row_data)
        
        # Calculate compression ratio
        original_size = len(flat_instructions) * 3 * 4  # 3 floats, 4 bytes each
        compressed_size = len(flat_instructions) * 1 + len(unique_colors) * 3 * 4  # 1 byte index + palette
        compression_ratio = compressed_size / original_size
        
        return {
            'method': 'palette',
            'original_size': original_size,
            'compressed_size': compressed_size,
            'compression_ratio': compression_ratio,
            'palette': unique_colors,
            'data': compressed_data,
            'width': program['width'],
            'height': program['height'],
            'metadata': program.get('metadata', {})
        }
    
    def _compress_with_patterns(self, program: Dict[str, Any]) -> Dict[str, Any]:
        """Compress using common pattern recognition."""
        instructions = program['instructions']
        
        # Find common patterns (3-instruction sequences)
        patterns = {}
        pattern_id = 0
        
        for row in instructions:
            i = 0
            while i < len(row) - 2:
                pattern = tuple((inst['hue'], inst['saturation'], inst['value']) 
                              for inst in row[i:i+3])
                if pattern not in patterns:
                    patterns[pattern] = pattern_id
                    pattern_id += 1
                i += 3
        
        # Compress using pattern dictionary
        compressed_data = []
        for row in instructions:
            row_data = []
            i = 0
            while i < len(row):
                if i < len(row) - 2:
                    pattern = tuple((inst['hue'], inst['saturation'], inst['value']) 
                                  for inst in row[i:i+3])
                    if pattern in patterns:
                        row_data.append(('pattern', patterns[pattern]))
                        i += 3
                        continue
                
                # Single instruction
                inst = row[i]
                row_data.append(('single', (inst['hue'], inst['saturation'], inst['value'])))
                i += 1
            
            compressed_data.append(row_data)
        
        return {
            'method': 'patterns',
            'patterns': patterns,
            'data': compressed_data,
            'width': program['width'],
            'height': program['height'],
            'metadata': program.get('metadata', {})
        }
    
    def _compress_run_length(self, program: Dict[str, Any]) -> Dict[str, Any]:
        """Compress using run-length encoding for repeated colors."""
        instructions = program['instructions']
        compressed_data = []
        
        for row in instructions:
            row_data = []
            if not row:
                compressed_data.append(row_data)
                continue
            
            current_color = (row[0]['hue'], row[0]['saturation'], row[0]['value'])
            count = 1
            
            for i in range(1, len(row)):
                color = (row[i]['hue'], row[i]['saturation'], row[i]['value'])
                if color == current_color:
                    count += 1
                else:
                    row_data.append((current_color, count))
                    current_color = color
                    count = 1
            
            # Add the last run
            row_data.append((current_color, count))
            compressed_data.append(row_data)
        
        return {
            'method': 'rle',
            'data': compressed_data,
            'width': program['width'],
            'height': program['height'],
            'metadata': program.get('metadata', {})
        }
    
    def _compress_hybrid(self, program: Dict[str, Any]) -> Dict[str, Any]:
        """Compress using combination of techniques."""
        # First apply palette compression
        palette_compressed = self._compress_with_palette(program)
        
        # Then apply RLE to the palette indices
        compressed_data = []
        for row in palette_compressed['data']:
            row_data = []
            if not row:
                compressed_data.append(row_data)
                continue
            
            current_index = row[0]
            count = 1
            
            for i in range(1, len(row)):
                if row[i] == current_index:
                    count += 1
                else:
                    row_data.append((current_index, count))
                    current_index = row[i]
                    count = 1
            
            row_data.append((current_index, count))
            compressed_data.append(row_data)
        
        return {
            'method': 'hybrid',
            'palette': palette_compressed['palette'],
            'data': compressed_data,
            'width': program['width'],
            'height': program['height'],
            'metadata': program.get('metadata', {})
        }
    
    def _compress_with_neural_patterns(self, program: Dict[str, Any]) -> Dict[str, Any]:
        """Compress using neural network-inspired patterns."""
        instructions = program['instructions']

        # Identify common patterns (e.g., forward, backward, update sequences)
        nn_patterns = {
            'forward': [(16, 50, 50), (16, 60, 60), (16, 70, 70)],
            'backward': [(21, 50, 50), (21, 60, 60), (21, 70, 70)],
            'update': [(26, 50, 50), (26, 60, 60), (26, 70, 70)]
        }

        compressed_data = []
        for row in instructions:
            row_data = []
            i = 0
            while i < len(row):
                match_found = False
                for pattern_name, pattern in nn_patterns.items():
                    if i + len(pattern) <= len(row):
                        segment = [(inst['hue'], inst['saturation'], inst['value']) for inst in row[i:i+len(pattern)]]
                        if segment == pattern:
                            row_data.append(('nn_pattern', pattern_name))
                            i += len(pattern)
                            match_found = True
                            break
                if not match_found:
                    inst = row[i]
                    row_data.append(('single', (inst['hue'], inst['saturation'], inst['value'])))
                    i += 1
            compressed_data.append(row_data)

        return {
            'method': 'neural_patterns',
            'data': compressed_data,
            'width': program['width'],
            'height': program['height'],
            'metadata': program.get('metadata', {})
        }
    
    def decompress_program(self, compressed_program: Dict[str, Any]) -> Dict[str, Any]:
        """Decompress a compressed ColorLang program."""
        method = compressed_program['method']
        
        if method == "palette":
            return self._decompress_palette(compressed_program)
        elif method == "patterns":
            return self._decompress_patterns(compressed_program)
        elif method == "hybrid":
            return self._decompress_hybrid(compressed_program)
        elif method == "rle":
            return self._decompress_rle(compressed_program)
        elif method == "neural_patterns":
            return self._decompress_neural_patterns(compressed_program)
        else:
            raise ValueError(f"Unknown compression method: {method}")
    
    def _decompress_palette(self, compressed_program: Dict[str, Any]) -> Dict[str, Any]:
        """Decompress palette-compressed program."""
        palette = compressed_program['palette']
        compressed_data = compressed_program['data']
        
        instructions = []
        for row_data in compressed_data:
            row = []
            for palette_index in row_data:
                hue, saturation, value = palette[palette_index]
                instruction = {
                    'hue': hue,
                    'saturation': saturation,
                    'value': value,
                    'position': (len(row), len(instructions)),
                    'type': self._get_instruction_type(hue)
                }
                row.append(instruction)
            instructions.append(row)
        
        return {
            'width': compressed_program['width'],
            'height': compressed_program['height'],
            'instructions': instructions,
            'metadata': compressed_program.get('metadata', {})
        }
    
    def _decompress_rle(self, compressed_program: Dict[str, Any]) -> Dict[str, Any]:
        """Decompress run-length encoded program."""
        compressed_data = compressed_program['data']
        
        instructions = []
        for row_data in compressed_data:
            row = []
            for (hue, saturation, value), count in row_data:
                for _ in range(count):
                    instruction = {
                        'hue': hue,
                        'saturation': saturation,
                        'value': value,
                        'position': (len(row), len(instructions)),
                        'type': self._get_instruction_type(hue)
                    }
                    row.append(instruction)
            instructions.append(row)
        
        return {
            'width': compressed_program['width'],
            'height': compressed_program['height'],
            'instructions': instructions,
            'metadata': compressed_program.get('metadata', {})
        }
    
    def _decompress_hybrid(self, compressed_program: Dict[str, Any]) -> Dict[str, Any]:
        """Decompress hybrid-compressed program."""
        palette = compressed_program['palette']
        compressed_data = compressed_program['data']
        
        instructions = []
        for row_data in compressed_data:
            row = []
            for palette_index, count in row_data:
                hue, saturation, value = palette[palette_index]
                for _ in range(count):
                    instruction = {
                        'hue': hue,
                        'saturation': saturation,
                        'value': value,
                        'position': (len(row), len(instructions)),
                        'type': self._get_instruction_type(hue)
                    }
                    row.append(instruction)
            instructions.append(row)
        
        return {
            'width': compressed_program['width'],
            'height': compressed_program['height'],
            'instructions': instructions,
            'metadata': compressed_program.get('metadata', {})
        }
    
    def _decompress_neural_patterns(self, compressed_program: Dict[str, Any]) -> Dict[str, Any]:
        """Decompress neural network-inspired compressed program."""
        compressed_data = compressed_program['data']
        
        instructions = []
        for row_data in compressed_data:
            row = []
            for data_type, value in row_data:
                if data_type == 'nn_pattern':
                    # Expand neural network pattern
                    if value == 'forward':
                        pattern = [(16, 50, 50), (16, 60, 60), (16, 70, 70)]
                    elif value == 'backward':
                        pattern = [(21, 50, 50), (21, 60, 60), (21, 70, 70)]
                    elif value == 'update':
                        pattern = [(26, 50, 50), (26, 60, 60), (26, 70, 70)]
                    else:
                        pattern = []
                    
                    for hue, saturation, value in pattern:
                        instruction = {
                            'hue': hue,
                            'saturation': saturation,
                            'value': value,
                            'position': (len(row), len(instructions)),
                            'type': self._get_instruction_type(hue)
                        }
                        row.append(instruction)
                elif data_type == 'single':
                    hue, saturation, value = value
                    instruction = {
                        'hue': hue,
                        'saturation': saturation,
                        'value': value,
                        'position': (len(row), len(instructions)),
                        'type': self._get_instruction_type(hue)
                    }
                    row.append(instruction)
            
            instructions.append(row)
        
        return {
            'width': compressed_program['width'],
            'height': compressed_program['height'],
            'instructions': instructions,
            'metadata': compressed_program.get('metadata', {})
        }
    
    def _get_instruction_type(self, hue: float) -> str:
        """Determine instruction type from hue value."""
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
            return 'UNKNOWN'
    
    def save_compressed(self, compressed_program: Dict[str, Any], filename: str):
        """Save compressed program to file."""
        # Convert to JSON and compress with zlib
        json_data = json.dumps(compressed_program, separators=(',', ':'))
        compressed_bytes = zlib.compress(json_data.encode('utf-8'))
        encoded_data = base64.b64encode(compressed_bytes).decode('ascii')
        
        with open(filename, 'w') as f:
            f.write(encoded_data)
    
    def load_compressed(self, filename: str) -> Dict[str, Any]:
        """Load compressed program from file."""
        with open(filename, 'r') as f:
            encoded_data = f.read()
        
        compressed_bytes = base64.b64decode(encoded_data.encode('ascii'))
        json_data = zlib.decompress(compressed_bytes).decode('utf-8')
        return json.loads(json_data)
    
    def benchmark_compression(self, program: Dict[str, Any]) -> Dict[str, Any]:
        """Benchmark all compression methods on a program."""
        methods = ['palette', 'patterns', 'rle', 'hybrid']
        results = {}
        
        original_size = self._calculate_program_size(program)
        
        for method in methods:
            try:
                compressed = self.compress_program(program, method)
                compressed_size = self._calculate_compressed_size(compressed)
                
                # Test decompression
                decompressed = self.decompress_program(compressed)
                
                results[method] = {
                    'compressed_size': compressed_size,
                    'compression_ratio': compressed_size / original_size,
                    'space_savings': 1 - (compressed_size / original_size),
                    'decompression_successful': True
                }
            except Exception as e:
                results[method] = {
                    'error': str(e),
                    'decompression_successful': False
                }
        
        results['original_size'] = original_size
        return results
    
    def _calculate_program_size(self, program: Dict[str, Any]) -> int:
        """Calculate size of uncompressed program in bytes."""
        instructions = program['instructions']
        flat_instructions = [inst for row in instructions for inst in row]
        
        # Each instruction: 3 floats (hue, sat, val) * 4 bytes + metadata
        return len(flat_instructions) * (3 * 4 + 100)  # 100 bytes estimated metadata per instruction
    
    def _calculate_compressed_size(self, compressed: Dict[str, Any]) -> int:
        """Estimate compressed data size in bytes."""
        json_data = json.dumps(compressed, separators=(',', ':'))
        return len(json_data.encode('utf-8'))