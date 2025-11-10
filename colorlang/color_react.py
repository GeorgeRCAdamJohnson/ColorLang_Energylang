"""
ColorReact: Component-based UI Framework for ColorLang
Implements React-style component architecture using color-based programming.
"""

import json
from typing import Dict, List, Tuple, Any, Optional, Callable
from dataclasses import dataclass, field
from collections import defaultdict
import colorsys

@dataclass
class ComponentState:
    """State management for ColorReact components."""
    data: Dict[str, Any] = field(default_factory=dict)
    listeners: List[Callable] = field(default_factory=list)
    
    def set(self, key: str, value: Any):
        """Set state value and notify listeners."""
        old_value = self.data.get(key)
        self.data[key] = value
        
        if old_value != value:
            for listener in self.listeners:
                listener(key, old_value, value)
    
    def get(self, key: str, default=None):
        """Get state value."""
        return self.data.get(key, default)
    
    def subscribe(self, listener: Callable):
        """Subscribe to state changes."""
        self.listeners.append(listener)

@dataclass
class ComponentProps:
    """Properties passed to ColorReact components."""
    data: Dict[str, Any] = field(default_factory=dict)
    
    def get(self, key: str, default=None):
        return self.data.get(key, default)

class ColorComponent:
    """Base class for ColorReact components."""
    
    def __init__(self, props: ComponentProps = None):
        self.props = props or ComponentProps()
        self.state = ComponentState()
        self.children: List['ColorComponent'] = []
        self.parent: Optional['ColorComponent'] = None
        self.component_id = id(self)
        self.render_cache = None
        self.dirty = True
        
        # Color-based component metadata
        self.base_hue = 0  # Base color for this component type
        self.size = (10, 10)  # Default component size in pixels
        
    def add_child(self, child: 'ColorComponent'):
        """Add child component."""
        child.parent = self
        self.children.append(child)
        self.mark_dirty()
    
    def remove_child(self, child: 'ColorComponent'):
        """Remove child component."""
        if child in self.children:
            child.parent = None
            self.children.remove(child)
            self.mark_dirty()
    
    def mark_dirty(self):
        """Mark component as needing re-render."""
        self.dirty = True
        if self.parent:
            self.parent.mark_dirty()
    
    def set_state(self, **kwargs):
        """Update component state."""
        for key, value in kwargs.items():
            self.state.set(key, value)
        self.mark_dirty()
    
    def render(self) -> List[List[Tuple[float, float, float]]]:
        """Render component to color grid. Override in subclasses."""
        if not self.dirty and self.render_cache:
            return self.render_cache
        
        # Default rendering: empty grid
        grid = [[(0, 0, 0) for _ in range(self.size[0])] for _ in range(self.size[1])]
        
        # Render children
        for child in self.children:
            child_grid = child.render()
            # Simple overlay (in real implementation, would handle positioning)
            for y in range(min(len(child_grid), len(grid))):
                for x in range(min(len(child_grid[y]), len(grid[y]))):
                    if child_grid[y][x] != (0, 0, 0):  # Don't overlay black pixels
                        grid[y][x] = child_grid[y][x]
        
        self.render_cache = grid
        self.dirty = False
        return grid
    
    def handle_event(self, event_type: str, data: Any = None):
        """Handle events. Override in subclasses."""
        pass

class Button(ColorComponent):
    """Button component with click handling."""
    
    def __init__(self, props: ComponentProps = None):
        super().__init__(props)
        self.base_hue = 210  # Blue base for buttons
        self.size = (6, 2)
        self.pressed = False
        
        # Button-specific state
        self.state.set('text', props.get('text', 'Button') if props else 'Button')
        self.state.set('color', props.get('color', 'blue') if props else 'blue')
        self.state.set('disabled', props.get('disabled', False) if props else False)
    
    def render(self) -> List[List[Tuple[float, float, float]]]:
        """Render button with text and styling."""
        if not self.dirty and self.render_cache:
            return self.render_cache
        
        disabled = self.state.get('disabled', False)
        color = self.state.get('color', 'blue')
        
        # Color mapping
        color_map = {
            'blue': 210,
            'red': 0,
            'green': 120,
            'yellow': 60,
            'purple': 270
        }
        
        base_hue = color_map.get(color, 210)
        
        # Button styling based on state
        if disabled:
            saturation = 20
            value = 40
        elif self.pressed:
            saturation = 80
            value = 60
        else:
            saturation = 70
            value = 80
        
        # Create button grid
        grid = []
        for y in range(self.size[1]):
            row = []
            for x in range(self.size[0]):
                # Border pixels
                if x == 0 or x == self.size[0] - 1 or y == 0 or y == self.size[1] - 1:
                    row.append((base_hue, saturation + 10, value - 10))
                else:
                    row.append((base_hue, saturation, value))
            grid.append(row)
        
        self.render_cache = grid
        self.dirty = False
        return grid
    
    def handle_event(self, event_type: str, data: Any = None):
        """Handle button events."""
        if event_type == 'click' and not self.state.get('disabled', False):
            self.pressed = True
            self.mark_dirty()
            
            # Execute onClick callback if provided
            on_click = self.props.get('onClick')
            if on_click:
                on_click(self)
            
            # Reset pressed state after brief delay (simulated)
            self.pressed = False
            self.mark_dirty()

class TextDisplay(ColorComponent):
    """Text display component."""
    
    def __init__(self, props: ComponentProps = None):
        super().__init__(props)
        self.base_hue = 0  # Red base for text
        self.size = (20, 2)
        
        # Text-specific state
        self.state.set('text', props.get('text', '') if props else '')
        self.state.set('color', props.get('color', 'black') if props else 'black')
    
    def render(self) -> List[List[Tuple[float, float, float]]]:
        """Render text as color patterns."""
        if not self.dirty and self.render_cache:
            return self.render_cache
        
        text = self.state.get('text', '')
        
        # Convert text to color representation
        grid = []
        for y in range(self.size[1]):
            row = []
            for x in range(self.size[0]):
                if x < len(text) and y == 0:
                    # Encode character as hue (ASCII value mapped to hue)
                    char_code = ord(text[x])
                    hue = (char_code / 128) * 360  # Map ASCII to hue range
                    row.append((hue, 100, 100))
                else:
                    row.append((0, 0, 0))  # Black background
            grid.append(row)
        
        self.render_cache = grid
        self.dirty = False
        return grid

class Container(ColorComponent):
    """Container component for layout."""
    
    def __init__(self, props: ComponentProps = None):
        super().__init__(props)
        self.base_hue = 0
        self.size = (50, 30)  # Large container
        
        # Layout properties
        self.layout = props.get('layout', 'vertical') if props else 'vertical'
        self.padding = props.get('padding', 1) if props else 1
    
    def render(self) -> List[List[Tuple[float, float, float]]]:
        """Render container with children layout."""
        if not self.dirty and self.render_cache:
            return self.render_cache
        
        # Create background
        grid = [[(0, 0, 20) for _ in range(self.size[0])] for _ in range(self.size[1])]
        
        # Layout children
        if self.layout == 'vertical':
            current_y = self.padding
            for child in self.children:
                child_grid = child.render()
                # Place child in container
                for y in range(len(child_grid)):
                    if current_y + y >= len(grid):
                        break
                    for x in range(len(child_grid[y])):
                        if self.padding + x >= len(grid[0]):
                            break
                        if child_grid[y][x] != (0, 0, 0):
                            grid[current_y + y][self.padding + x] = child_grid[y][x]
                
                current_y += len(child_grid) + 1  # Add spacing
        
        elif self.layout == 'horizontal':
            current_x = self.padding
            for child in self.children:
                child_grid = child.render()
                # Place child in container
                for y in range(len(child_grid)):
                    if self.padding + y >= len(grid):
                        break
                    for x in range(len(child_grid[y])):
                        if current_x + x >= len(grid[0]):
                            break
                        if child_grid[y][x] != (0, 0, 0):
                            grid[self.padding + y][current_x + x] = child_grid[y][x]
                
                if child_grid:
                    current_x += len(child_grid[0]) + 1  # Add spacing
        
        self.render_cache = grid
        self.dirty = False
        return grid

class ColorReactApp:
    """Main application class for ColorReact apps."""
    
    def __init__(self, root_component: ColorComponent):
        self.root = root_component
        self.event_queue = []
        self.state_manager = ComponentState()
        self.render_count = 0
        
    def render_to_image(self, filename: str = None):
        """Render entire app to image."""
        grid = self.root.render()
        self.render_count += 1
        
        # Convert HSV grid to RGB image
        height = len(grid)
        width = len(grid[0]) if grid else 0
        
        if width == 0 or height == 0:
            return None
        
        from PIL import Image
        img = Image.new('RGB', (width, height))
        pixels = []
        
        for row in grid:
            for h, s, v in row:
                r, g, b = colorsys.hsv_to_rgb(h / 360, s / 100, v / 100)
                pixels.append((int(r * 255), int(g * 255), int(b * 255)))
        
        img.putdata(pixels)
        
        if filename:
            img.save(filename)
        
        return img
    
    def render_to_colorlang(self, filename: str = None):
        """Render app to ColorLang program format."""
        grid = self.root.render()
        
        # Convert to ColorLang instruction format
        instructions = []
        for y, row in enumerate(grid):
            instruction_row = []
            for x, (h, s, v) in enumerate(row):
                instruction = {
                    'hue': h,
                    'saturation': s,
                    'value': v,
                    'position': (x, y),
                    'type': self._get_instruction_type(h)
                }
                instruction_row.append(instruction)
            instructions.append(instruction_row)
        
        program = {
            'width': len(grid[0]) if grid else 0,
            'height': len(grid),
            'instructions': instructions,
            'metadata': {
                'app_type': 'ColorReact',
                'render_count': self.render_count,
                'component_count': self._count_components(self.root)
            }
        }
        
        if filename:
            import json
            with open(filename, 'w') as f:
                json.dump(program, f, indent=2)
        
        return program
    
    def dispatch_event(self, component_id: int, event_type: str, data: Any = None):
        """Dispatch event to specific component."""
        self.event_queue.append((component_id, event_type, data))
    
    def process_events(self):
        """Process all queued events."""
        while self.event_queue:
            component_id, event_type, data = self.event_queue.pop(0)
            component = self._find_component_by_id(self.root, component_id)
            if component:
                component.handle_event(event_type, data)
    
    def _find_component_by_id(self, component: ColorComponent, target_id: int) -> Optional[ColorComponent]:
        """Find component by ID in component tree."""
        if component.component_id == target_id:
            return component
        
        for child in component.children:
            found = self._find_component_by_id(child, target_id)
            if found:
                return found
        
        return None
    
    def _count_components(self, component: ColorComponent) -> int:
        """Count total components in tree."""
        count = 1
        for child in component.children:
            count += self._count_components(child)
        return count
    
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
            return 'UI_COMPONENT'

def create_todo_app() -> ColorReactApp:
    """Create a sample Todo app using ColorReact."""
    
    # Create components
    app_container = Container(ComponentProps({
        'layout': 'vertical',
        'padding': 2
    }))
    
    title = TextDisplay(ComponentProps({
        'text': 'ColorReact Todo App',
        'color': 'blue'
    }))
    
    add_button = Button(ComponentProps({
        'text': 'Add Todo',
        'color': 'green',
        'onClick': lambda btn: print("Add todo clicked!")
    }))
    
    todo_list = Container(ComponentProps({
        'layout': 'vertical',
        'padding': 1
    }))
    
    # Add sample todos
    for i in range(3):
        todo_item = Container(ComponentProps({
            'layout': 'horizontal',
            'padding': 1
        }))
        
        todo_text = TextDisplay(ComponentProps({
            'text': f'Todo item {i+1}',
            'color': 'black'
        }))
        
        complete_button = Button(ComponentProps({
            'text': 'Done',
            'color': 'blue',
            'onClick': lambda btn, item=i: print(f"Todo {item+1} completed!")
        }))
        
        todo_item.add_child(todo_text)
        todo_item.add_child(complete_button)
        todo_list.add_child(todo_item)
    
    # Build component tree
    app_container.add_child(title)
    app_container.add_child(add_button)
    app_container.add_child(todo_list)
    
    return ColorReactApp(app_container)

def create_counter_app() -> ColorReactApp:
    """Create a simple counter app."""
    
    container = Container(ComponentProps({
        'layout': 'vertical',
        'padding': 3
    }))
    
    # Counter display
    counter_display = TextDisplay(ComponentProps({
        'text': 'Count: 0',
        'color': 'black'
    }))
    
    # Button container
    button_container = Container(ComponentProps({
        'layout': 'horizontal',
        'padding': 1
    }))
    
    # Increment button
    increment_btn = Button(ComponentProps({
        'text': '+',
        'color': 'green'
    }))
    
    # Decrement button
    decrement_btn = Button(ComponentProps({
        'text': '-',
        'color': 'red'
    }))
    
    # Build component tree
    button_container.add_child(decrement_btn)
    button_container.add_child(increment_btn)
    
    container.add_child(counter_display)
    container.add_child(button_container)
    
    return ColorReactApp(container)