"""
ColorLang Visualization and Debugging Tool
This tool provides real-time visualization of ColorLang program execution and debugging capabilities.
"""

import time
from typing import Dict, Any
from PIL import Image, ImageDraw

class VisualizationDebugger:
    def __init__(self, program: Dict[str, Any]):
        self.program = program
        self.execution_log = []
        self.image = None

    def initialize_visualization(self):
        """Initialize the visualization canvas."""
        width, height = self.program['width'], self.program['height']
        self.image = Image.new('RGB', (width, height), color=(255, 255, 255))

    def log_execution(self, instruction: Dict[str, Any]):
        """Log executed instruction for debugging."""
        self.execution_log.append(instruction)

    def update_visualization(self, instruction: Dict[str, Any]):
        """Update the visualization based on the executed instruction."""
        x, y = instruction['position']
        hue, saturation, value = instruction['hue'], instruction['saturation'], instruction['value']
        r, g, b = self.hsv_to_rgb(hue, saturation, value)
        draw = ImageDraw.Draw(self.image)
        draw.point((x, y), fill=(r, g, b))

    def save_visualization(self, filename: str):
        """Save the visualization to a file."""
        self.image.save(filename)

    def display_execution_log(self):
        """Display the execution log."""
        for entry in self.execution_log:
            print(entry)

    @staticmethod
    def hsv_to_rgb(h: float, s: float, v: float) -> tuple:
        """Convert HSV to RGB."""
        s /= 100
        v /= 100
        h_i = int(h / 60) % 6
        f = h / 60 - h_i
        p = v * (1 - s)
        q = v * (1 - f * s)
        t = v * (1 - (1 - f) * s)
        r, g, b = {
            0: (v, t, p),
            1: (q, v, p),
            2: (p, v, t),
            3: (p, q, v),
            4: (t, p, v),
            5: (v, p, q),
        }[h_i]
        return int(r * 255), int(g * 255), int(b * 255)

# Example usage
if __name__ == "__main__":
    # Load a sample program (mocked for demonstration)
    sample_program = {
        'width': 10,
        'height': 10,
        'instructions': [
            {'position': (0, 0), 'hue': 0, 'saturation': 100, 'value': 100},
            {'position': (1, 1), 'hue': 120, 'saturation': 100, 'value': 100},
        ]
    }

    debugger = VisualizationDebugger(sample_program)
    debugger.initialize_visualization()

    for instruction in sample_program['instructions']:
        debugger.log_execution(instruction)
        debugger.update_visualization(instruction)

    debugger.save_visualization("visualization.png")
    debugger.display_execution_log()