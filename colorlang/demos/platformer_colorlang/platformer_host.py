#!/usr/bin/env python3
"""
ColorLang Platformer Host Application

This host application loads and executes the advanced ColorLang platformer kernel,
providing visualization and interaction for the complete platformer game.
"""

import sys
import os
import time
import threading
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

# Add ColorLang modules to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from colorlang.color_parser import ColorParser
from colorlang.virtual_machine import ColorVM

# Try to import pygame, fall back to console mode if not available
try:
    import pygame
    PYGAME_AVAILABLE = True
except ImportError:
    PYGAME_AVAILABLE = False
    print("Warning: pygame not available, running in console mode")


@dataclass
class GameState:
    """Represents the current game state from ColorLang kernel."""
    frame_counter: int = 0
    world_tiles: List[List[int]] = None
    agent_x: float = 0.0
    agent_y: float = 0.0
    agent_vx: float = 0.0
    agent_vy: float = 0.0
    agent_grounded: bool = False
    
    def __post_init__(self):
        if self.world_tiles is None:
            # Default 20x12 world filled with empty tiles
            self.world_tiles = [[0 for _ in range(20)] for _ in range(12)]


class PlatformerHost:
    """Host application for ColorLang platformer game."""
    
    # Tile types
    TILE_EMPTY = 0
    TILE_PLATFORM = 1
    TILE_WALL = 2
    TILE_SPIKE = 3
    
    def __init__(self, kernel_path: str = "advanced_platformer_kernel_fixed.png"):
        """Initialize the platformer host."""
        self.kernel_path = kernel_path
        self.game_state = GameState()
        self.running = True
        self.vm_running = False
        self.vm_thread = None
        
        # Initialize display system
        if PYGAME_AVAILABLE:
            self._init_pygame()
        else:
            self._init_console()
        
        # ColorLang VM setup
        self.parser = ColorParser()
        self.vm = ColorVM()
        self.program = None
        
        # Input state
        self.keys_pressed = set()
        
        print(f"Platformer host initialized ({'GUI' if PYGAME_AVAILABLE else 'Console'} mode)")
        
    def _init_pygame(self):
        """Initialize pygame display system."""
        pygame.init()
        self.screen_width = 800
        self.screen_height = 600
        self.screen = pygame.display.set_mode((self.screen_width, self.screen_height))
        pygame.display.set_caption("ColorLang Platformer")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 24)
        
        # Calculate tile rendering dimensions
        self.tile_width = (self.screen_width - 200) // 20  # Leave space for UI
        self.tile_height = (self.screen_height - 100) // 12  # Leave space for UI
        self.world_offset_x = 50
        self.world_offset_y = 50
        
        # Colors for rendering
        self.colors = {
            'background': (135, 206, 250),  # Sky blue
            'empty': (135, 206, 250),       # Same as background
            'platform': (139, 69, 19),     # Brown
            'wall': (105, 105, 105),       # Gray
            'spike': (220, 20, 60),        # Red
            'agent': (255, 215, 0),        # Gold
            'ui_text': (255, 255, 255),    # White
            'ui_bg': (0, 0, 0, 128),       # Semi-transparent black
        }
        
    def _init_console(self):
        """Initialize console display system."""
        self.console_width = 80
        self.console_height = 25
        
    def load_kernel(self) -> bool:
        """Load the ColorLang platformer kernel."""
        try:
            kernel_full_path = os.path.abspath(self.kernel_path)
            print(f"Loading kernel: {kernel_full_path}")
            
            if not os.path.exists(kernel_full_path):
                print(f"Kernel file not found: {kernel_full_path}")
                return False
                
            self.program = self.parser.parse_image(kernel_full_path)
            print(f"Kernel loaded successfully! Instructions: {len(self.program.get('instructions', []))}")
            return True
            
        except Exception as e:
            print(f"Failed to load kernel: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def start_vm(self):
        """Start the ColorLang VM in a separate thread."""
        if self.program and not self.vm_running:
            self.vm_running = True
            self.vm_thread = threading.Thread(target=self._run_vm, daemon=True)
            self.vm_thread.start()
            print("ColorLang VM started")
    
    def _run_vm(self):
        """Run the ColorLang VM continuously."""
        try:
            while self.vm_running and self.running:
                # Execute a few VM cycles
                result = self.vm.run_program(self.program, max_cycles=10)
                
                # Update game state from VM shared memory
                self._update_game_state_from_vm()
                
                # Small delay to prevent overwhelming the system
                time.sleep(0.016)  # ~60 FPS
                
        except Exception as e:
            print(f"VM execution error: {e}")
            import traceback
            traceback.print_exc()
            self.vm_running = False
    
    def _update_game_state_from_vm(self):
        """Update game state from VM shared memory."""
        try:
            # In a real implementation, we'd read from VM shared memory
            # For now, simulate some basic game state updates
            self.game_state.frame_counter += 1
            
            # Simulate agent movement based on input
            if 'LEFT' in self.keys_pressed:
                self.game_state.agent_vx = max(self.game_state.agent_vx - 0.5, -5.0)
            elif 'RIGHT' in self.keys_pressed:
                self.game_state.agent_vx = min(self.game_state.agent_vx + 0.5, 5.0)
            else:
                self.game_state.agent_vx *= 0.8  # Friction
            
            if 'UP' in self.keys_pressed and self.game_state.agent_grounded:
                self.game_state.agent_vy = -10.0
                self.game_state.agent_grounded = False
            
            # Apply gravity
            if not self.game_state.agent_grounded:
                self.game_state.agent_vy += 0.5
            
            # Update position
            self.game_state.agent_x += self.game_state.agent_vx * 0.1
            self.game_state.agent_y += self.game_state.agent_vy * 0.1
            
            # Simple collision detection
            self.game_state.agent_x = max(0, min(19, self.game_state.agent_x))
            if self.game_state.agent_y >= 10:
                self.game_state.agent_y = 10
                self.game_state.agent_vy = 0
                self.game_state.agent_grounded = True
            
            # Create a sample world if not set
            if all(all(tile == 0 for tile in row) for row in self.game_state.world_tiles):
                self._create_sample_world()
                
        except Exception as e:
            print(f"Error updating game state: {e}")
    
    def _create_sample_world(self):
        """Create a sample world for demonstration."""
        # Add some platforms and obstacles
        for x in range(20):
            self.game_state.world_tiles[11][x] = self.TILE_PLATFORM  # Ground
            
        # Add some platforms
        for x in range(5, 10):
            self.game_state.world_tiles[8][x] = self.TILE_PLATFORM
        for x in range(12, 17):
            self.game_state.world_tiles[6][x] = self.TILE_PLATFORM
        
        # Add some walls
        for y in range(5, 11):
            self.game_state.world_tiles[y][3] = self.TILE_WALL
            self.game_state.world_tiles[y][18] = self.TILE_WALL
        
        # Add some spikes
        self.game_state.world_tiles[10][7] = self.TILE_SPIKE
        self.game_state.world_tiles[10][14] = self.TILE_SPIKE
    
    def handle_input_pygame(self, event):
        """Handle pygame input events."""
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_LEFT or event.key == pygame.K_a:
                self.keys_pressed.add('LEFT')
            elif event.key == pygame.K_RIGHT or event.key == pygame.K_d:
                self.keys_pressed.add('RIGHT')
            elif event.key == pygame.K_UP or event.key == pygame.K_w or event.key == pygame.K_SPACE:
                self.keys_pressed.add('UP')
            elif event.key == pygame.K_ESCAPE:
                self.running = False
        elif event.type == pygame.KEYUP:
            if event.key == pygame.K_LEFT or event.key == pygame.K_a:
                self.keys_pressed.discard('LEFT')
            elif event.key == pygame.K_RIGHT or event.key == pygame.K_d:
                self.keys_pressed.discard('RIGHT')
            elif event.key == pygame.K_UP or event.key == pygame.K_w or event.key == pygame.K_SPACE:
                self.keys_pressed.discard('UP')
    
    def render_pygame(self):
        """Render the game world and UI using pygame."""
        # Clear screen
        self.screen.fill(self.colors['background'])
        
        # Render world tiles
        for y in range(12):
            for x in range(20):
                tile_type = self.game_state.world_tiles[y][x]
                if tile_type != self.TILE_EMPTY:
                    color = self.colors.get('empty')
                    if tile_type == self.TILE_PLATFORM:
                        color = self.colors['platform']
                    elif tile_type == self.TILE_WALL:
                        color = self.colors['wall']
                    elif tile_type == self.TILE_SPIKE:
                        color = self.colors['spike']
                    
                    rect = pygame.Rect(
                        self.world_offset_x + x * self.tile_width,
                        self.world_offset_y + y * self.tile_height,
                        self.tile_width,
                        self.tile_height
                    )
                    pygame.draw.rect(self.screen, color, rect)
        
        # Render agent
        agent_screen_x = self.world_offset_x + self.game_state.agent_x * self.tile_width
        agent_screen_y = self.world_offset_y + self.game_state.agent_y * self.tile_height
        agent_rect = pygame.Rect(
            agent_screen_x,
            agent_screen_y,
            self.tile_width // 2,
            self.tile_height // 2
        )
        pygame.draw.ellipse(self.screen, self.colors['agent'], agent_rect)
        
        # Render UI
        self._render_ui_pygame()
        
        pygame.display.flip()
    
    def _render_ui_pygame(self):
        """Render the user interface using pygame."""
        # Create UI background
        ui_surface = pygame.Surface((200, self.screen_height))
        ui_surface.set_alpha(128)
        ui_surface.fill((0, 0, 0))
        self.screen.blit(ui_surface, (self.screen_width - 200, 0))
        
        # Render text info
        ui_x = self.screen_width - 190
        ui_y = 10
        
        texts = [
            f"Frame: {self.game_state.frame_counter}",
            f"Agent X: {self.game_state.agent_x:.1f}",
            f"Agent Y: {self.game_state.agent_y:.1f}",
            f"Velocity X: {self.game_state.agent_vx:.1f}",
            f"Velocity Y: {self.game_state.agent_vy:.1f}",
            f"Grounded: {self.game_state.agent_grounded}",
            "",
            "Controls:",
            "Arrow Keys / WASD",
            "Space: Jump",
            "Escape: Quit",
            "",
            f"VM Running: {self.vm_running}",
            f"Keys: {len(self.keys_pressed)}",
        ]
        
        for i, text in enumerate(texts):
            if text:  # Skip empty strings
                text_surface = self.font.render(text, True, self.colors['ui_text'])
                self.screen.blit(text_surface, (ui_x, ui_y + i * 25))
    
    def render_console(self):
        """Render the game world using console output."""
        # Clear console (simple method)
        os.system('cls' if os.name == 'nt' else 'clear')
        
        # Render world
        for y in range(12):
            line = ""
            for x in range(20):
                tile_type = self.game_state.world_tiles[y][x]
                if int(self.game_state.agent_x) == x and int(self.game_state.agent_y) == y:
                    line += "@"  # Agent
                elif tile_type == self.TILE_PLATFORM:
                    line += "#"
                elif tile_type == self.TILE_WALL:
                    line += "|"
                elif tile_type == self.TILE_SPIKE:
                    line += "^"
                else:
                    line += " "
            print(line)
        
        # Print game info
        print(f"\nFrame: {self.game_state.frame_counter}")
        print(f"Agent: ({self.game_state.agent_x:.1f}, {self.game_state.agent_y:.1f})")
        print(f"Velocity: ({self.game_state.agent_vx:.1f}, {self.game_state.agent_vy:.1f})")
        print(f"Grounded: {self.game_state.agent_grounded}")
        print(f"VM Running: {self.vm_running}")
        print("\nControls: WASD to move, Q to quit")
    
    def handle_input_console(self):
        """Handle console input (non-blocking simulation)."""
        # This is a simple simulation - in a real console app you'd use
        # platform-specific non-blocking input
        import select
        import sys
        
        if select.select([sys.stdin], [], [], 0) == ([sys.stdin], [], []):
            key = sys.stdin.read(1).lower()
            if key == 'a':
                self.keys_pressed.add('LEFT')
            elif key == 'd':
                self.keys_pressed.add('RIGHT')
            elif key == 'w':
                self.keys_pressed.add('UP')
            elif key == 'q':
                self.running = False
    
    def run(self):
        """Main game loop."""
        print("Starting platformer host application...")
        
        if not self.load_kernel():
            print("Failed to load kernel. Exiting.")
            return False
        
        self.start_vm()
        
        if PYGAME_AVAILABLE:
            return self._run_pygame()
        else:
            return self._run_console()
    
    def _run_pygame(self):
        """Run the pygame-based game loop."""
        print("Game loop started. Use arrow keys or WASD to move, Space to jump, Escape to quit.")
        
        while self.running:
            # Handle events
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                else:
                    self.handle_input_pygame(event)
            
            # Render
            self.render_pygame()
            
            # Control frame rate
            self.clock.tick(60)
        
        # Cleanup
        self._cleanup()
        pygame.quit()
        print("Platformer host application terminated.")
        return True
    
    def _run_console(self):
        """Run the console-based game loop."""
        print("Console mode started. Use WASD to move, Q to quit.")
        
        while self.running:
            # Handle input
            self.handle_input_console()
            
            # Render
            self.render_console()
            
            # Control frame rate
            time.sleep(0.1)  # 10 FPS for console mode
        
        # Cleanup
        self._cleanup()
        print("Platformer host application terminated.")
        return True
    
    def _cleanup(self):
        """Clean up resources."""
        self.vm_running = False
        if self.vm_thread and self.vm_thread.is_alive():
            self.vm_thread.join(timeout=1.0)


def main():
    """Main entry point."""
    try:
        host = PlatformerHost()
        success = host.run()
        return 0 if success else 1
    except Exception as e:
        print(f"Fatal error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
