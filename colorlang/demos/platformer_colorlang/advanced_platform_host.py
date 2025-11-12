"""
Advanced Platform Host Application

Enhanced ColorLang platformer host with:
- 4x visual scaling for better visibility  
- 2-minute timed gameplay
- Real-time banana spawning
- Progressive difficulty scaling
- Enhanced collision detection
"""
import pygame
import sys
import os
import threading
import time
import random
import math

# Add project root to path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from colorlang.color_parser import ColorParser
from colorlang.virtual_machine import ColorVM

class AdvancedPlatformHost:
    def __init__(self):
        pygame.init()
        
        # Enhanced display settings for better visibility
        self.WORLD_WIDTH = 24
        self.WORLD_HEIGHT = 14  
        self.TILE_SIZE = 24  # Increased from 16 to 24 for better visibility
        self.SCALE_FACTOR = 4  # 4x scaling for much better visibility
        
        self.screen_width = self.WORLD_WIDTH * self.TILE_SIZE * self.SCALE_FACTOR
        self.screen_height = self.WORLD_HEIGHT * self.TILE_SIZE * self.SCALE_FACTOR
        
        self.screen = pygame.display.set_mode((self.screen_width, self.screen_height))
        pygame.display.set_caption("ColorLang Advanced Platform - 2 Minute Challenge")
        
        # Enhanced color scheme
        self.colors = {
            'background': (135, 206, 235),  # Sky blue
            'ground': (139, 69, 19),        # Saddle brown
            'platform': (105, 105, 105),    # Dim gray
            'agent': (255, 20, 147),        # Deep pink (monkey)
            'banana': (255, 215, 0),        # Gold
            'obstacle': (220, 20, 60),      # Crimson
            'goal': (50, 205, 50),          # Lime green
            'ui_text': (255, 255, 255),     # White
            'ui_bg': (0, 0, 0, 128)         # Semi-transparent black
        }
        
        self.font = pygame.font.Font(None, 36)
        self.small_font = pygame.font.Font(None, 24)
        
        # Game state
        self.vm = ColorVM()
        self.running = True
        self.game_active = True
        self.start_time = time.time()
        self.game_duration = 120  # 2 minutes
        
        # Enhanced banana system
        self.bananas = []
        self.max_bananas = 8
        self.next_spawn_time = 0
        self.spawn_interval = 5.0  # Start with 5 second intervals
        
        # Difficulty scaling
        self.difficulty_level = 1
        self.last_difficulty_update = 0
        
        # Load ColorLang kernel
        self.load_kernel()
        
    def load_kernel(self):
        """Load the advanced platform ColorLang kernel."""
        try:
            parser = ColorParser()
            program = parser.parse_image("advanced_platform_kernel.png")
            self.vm.load_program(program)
            print("Advanced Platform kernel loaded successfully!")
            print(f"Instructions loaded: {len(program.get('instructions', []))}")
        except Exception as e:
            print(f"Error loading kernel: {e}")
            self.running = False
    
    def update_difficulty(self):
        """Update game difficulty based on elapsed time."""
        elapsed = time.time() - self.start_time
        new_level = int(elapsed // 30) + 1  # Difficulty increases every 30 seconds
        
        if new_level != self.difficulty_level:
            self.difficulty_level = new_level
            
            # Increase banana spawn rate
            self.spawn_interval = max(2.0, 5.0 - (new_level * 0.5))
            
            # Add more bananas at higher difficulties
            if new_level > 2:
                self.max_bananas = min(12, 8 + (new_level - 2))
            
            print(f"Difficulty increased to level {self.difficulty_level}!")
            print(f"Spawn interval: {self.spawn_interval:.1f}s, Max bananas: {self.max_bananas}")
    
    def spawn_banana(self):
        """Spawn a new banana at a random valid location."""
        if len(self.bananas) >= self.max_bananas:
            return
            
        # Enhanced spawn points with better distribution
        spawn_points = [
            (2, 3), (4, 3), (19, 4), (21, 4),      # Upper platforms
            (6, 6), (9, 6), (12, 6), (15, 6),      # Mid platforms  
            (3, 9), (7, 9), (14, 9), (18, 9),      # Lower platforms
            (1, 12), (5, 12), (11, 12), (17, 12),  # Ground level
            (20, 12), (23, 12)                     # Far ground level
        ]
        
        # Filter out occupied spawn points
        available_points = []
        for point in spawn_points:
            occupied = False
            for banana in self.bananas:
                if abs(banana['x'] - point[0]) < 2 and abs(banana['y'] - point[1]) < 2:
                    occupied = True
                    break
            if not occupied:
                available_points.append(point)
        
        if available_points:
            spawn_point = random.choice(available_points)
            banana = {
                'x': spawn_point[0],
                'y': spawn_point[1],
                'collected': False,
                'spawn_time': time.time(),
                'bounce_offset': random.uniform(0, math.pi * 2)  # For animation
            }
            self.bananas.append(banana)
    
    def update_bananas(self):
        """Update banana spawning and collection."""
        current_time = time.time()
        
        # Spawn new bananas based on interval
        if current_time >= self.next_spawn_time:
            self.spawn_banana()
            self.next_spawn_time = current_time + self.spawn_interval
        
        # Remove collected bananas after a delay
        self.bananas = [b for b in self.bananas if not b['collected'] or 
                       (current_time - b.get('collect_time', 0)) < 0.5]
    
    def get_agent_state(self):
        """Get current agent state from VM shared memory."""
        try:
            shared_memory = self.vm.get_shared_memory()
            
            # Extract agent position (indices 343-344 in our kernel)
            agent_x = shared_memory.get(343, 48) // (self.TILE_SIZE * self.SCALE_FACTOR // 24)
            agent_y = shared_memory.get(344, 240) // (self.TILE_SIZE * self.SCALE_FACTOR // 24)
            
            # Clamp to world bounds
            agent_x = max(0, min(self.WORLD_WIDTH - 1, agent_x))
            agent_y = max(0, min(self.WORLD_HEIGHT - 1, agent_y))
            
            return {
                'x': agent_x,
                'y': agent_y,
                'velocity_x': shared_memory.get(345, 0),
                'velocity_y': shared_memory.get(346, 0),
                'on_ground': shared_memory.get(347, 1)
            }
        except:
            return {'x': 2, 'y': 10, 'velocity_x': 0, 'velocity_y': 0, 'on_ground': 1}
    
    def check_banana_collection(self, agent_state):
        """Check if agent collected any bananas."""
        collected_count = 0
        
        for banana in self.bananas:
            if not banana['collected']:
                # Check collision with some tolerance
                distance = math.sqrt((agent_state['x'] - banana['x'])**2 + 
                                   (agent_state['y'] - banana['y'])**2)
                if distance < 1.5:  # Collection radius
                    banana['collected'] = True
                    banana['collect_time'] = time.time()
                    collected_count += 1
        
        return collected_count
    
    def render_world(self, agent_state):
        """Render the enhanced game world."""
        self.screen.fill(self.colors['background'])
        
        # Enhanced world rendering with 4x scaling
        try:
            shared_memory = self.vm.get_shared_memory()
            
            # Render tilemap (indices 7-342 for 24x14 world)
            for y in range(self.WORLD_HEIGHT):
                for x in range(self.WORLD_WIDTH):
                    tile_index = 7 + (y * self.WORLD_WIDTH) + x
                    tile_type = shared_memory.get(tile_index, 0)
                    
                    screen_x = x * self.TILE_SIZE * self.SCALE_FACTOR
                    screen_y = y * self.TILE_SIZE * self.SCALE_FACTOR
                    tile_rect = pygame.Rect(screen_x, screen_y, 
                                          self.TILE_SIZE * self.SCALE_FACTOR, 
                                          self.TILE_SIZE * self.SCALE_FACTOR)
                    
                    if tile_type == 1:  # Ground/Platform
                        pygame.draw.rect(self.screen, self.colors['ground'], tile_rect)
                        pygame.draw.rect(self.screen, (101, 67, 33), tile_rect, 2)
                    elif tile_type == 2:  # Obstacle
                        pygame.draw.rect(self.screen, self.colors['obstacle'], tile_rect)
                    elif tile_type == 3:  # Moving platform
                        pygame.draw.rect(self.screen, self.colors['platform'], tile_rect)
                        
        except Exception as e:
            print(f"Render error: {e}")
        
        # Render bananas with bounce animation
        current_time = time.time()
        for banana in self.bananas:
            if not banana['collected']:
                bounce = math.sin((current_time - banana['spawn_time']) * 4 + banana['bounce_offset']) * 3
                screen_x = int(banana['x'] * self.TILE_SIZE * self.SCALE_FACTOR + bounce)
                screen_y = int(banana['y'] * self.TILE_SIZE * self.SCALE_FACTOR + bounce)
                
                # Draw banana with glow effect
                glow_radius = self.TILE_SIZE * self.SCALE_FACTOR // 3 + int(abs(bounce))
                banana_radius = self.TILE_SIZE * self.SCALE_FACTOR // 4
                
                pygame.draw.circle(self.screen, (255, 255, 150), 
                                 (screen_x, screen_y), glow_radius + 4)
                pygame.draw.circle(self.screen, self.colors['banana'], 
                                 (screen_x, screen_y), banana_radius)
                pygame.draw.circle(self.screen, (255, 255, 255), 
                                 (screen_x - 2, screen_y - 2), banana_radius // 3)
        
        # Render agent (monkey) with enhanced graphics
        agent_screen_x = int(agent_state['x'] * self.TILE_SIZE * self.SCALE_FACTOR)
        agent_screen_y = int(agent_state['y'] * self.TILE_SIZE * self.SCALE_FACTOR)
        agent_size = self.TILE_SIZE * self.SCALE_FACTOR // 2
        
        # Draw monkey with simple animation
        bounce = math.sin(current_time * 6) * 2 if agent_state['velocity_x'] != 0 else 0
        
        # Body
        pygame.draw.ellipse(self.screen, self.colors['agent'], 
                          (agent_screen_x - agent_size//2, agent_screen_y - agent_size//2 + bounce,
                           agent_size, agent_size))
        
        # Eyes
        eye_size = agent_size // 6
        pygame.draw.circle(self.screen, (255, 255, 255), 
                         (agent_screen_x - agent_size//4, agent_screen_y - agent_size//4 + bounce), 
                         eye_size)
        pygame.draw.circle(self.screen, (255, 255, 255), 
                         (agent_screen_x + agent_size//4, agent_screen_y - agent_size//4 + bounce), 
                         eye_size)
        pygame.draw.circle(self.screen, (0, 0, 0), 
                         (agent_screen_x - agent_size//4, agent_screen_y - agent_size//4 + bounce), 
                         eye_size//2)
        pygame.draw.circle(self.screen, (0, 0, 0), 
                         (agent_screen_x + agent_size//4, agent_screen_y - agent_size//4 + bounce), 
                         eye_size//2)
    
    def render_ui(self, agent_state):
        """Render enhanced game UI."""
        elapsed = time.time() - self.start_time
        remaining = max(0, self.game_duration - elapsed)
        
        collected_bananas = sum(1 for b in self.bananas if b['collected'])
        
        # Create semi-transparent UI background
        ui_surface = pygame.Surface((self.screen_width, 100))
        ui_surface.set_alpha(180)
        ui_surface.fill((0, 0, 0))
        self.screen.blit(ui_surface, (0, 0))
        
        # Time remaining
        time_text = self.font.render(f"Time: {remaining:.1f}s", True, self.colors['ui_text'])
        self.screen.blit(time_text, (20, 20))
        
        # Bananas collected
        banana_text = self.font.render(f"Bananas: {collected_bananas}", True, self.colors['ui_text'])
        self.screen.blit(banana_text, (200, 20))
        
        # Difficulty level
        diff_text = self.font.render(f"Level: {self.difficulty_level}", True, self.colors['ui_text'])
        self.screen.blit(diff_text, (400, 20))
        
        # Active bananas
        active_text = self.font.render(f"Available: {len([b for b in self.bananas if not b['collected']])}", 
                                     True, self.colors['ui_text'])
        self.screen.blit(active_text, (550, 20))
        
        # Agent info
        agent_info = self.small_font.render(
            f"Monkey: ({agent_state['x']}, {agent_state['y']}) Speed: {self.spawn_interval:.1f}s", 
            True, self.colors['ui_text'])
        self.screen.blit(agent_info, (20, 60))
        
        # Game over screen
        if remaining <= 0:
            game_over_surface = pygame.Surface((self.screen_width, self.screen_height))
            game_over_surface.set_alpha(200)
            game_over_surface.fill((0, 0, 0))
            self.screen.blit(game_over_surface, (0, 0))
            
            final_score = collected_bananas
            game_over_text = self.font.render("TIME'S UP!", True, (255, 255, 255))
            score_text = self.font.render(f"Final Score: {final_score} bananas", True, (255, 215, 0))
            level_text = self.font.render(f"Reached Level: {self.difficulty_level}", True, (150, 255, 150))
            
            game_over_rect = game_over_text.get_rect(center=(self.screen_width//2, self.screen_height//2 - 60))
            score_rect = score_text.get_rect(center=(self.screen_width//2, self.screen_height//2))
            level_rect = level_text.get_rect(center=(self.screen_width//2, self.screen_height//2 + 60))
            
            self.screen.blit(game_over_text, game_over_rect)
            self.screen.blit(score_text, score_rect)
            self.screen.blit(level_text, level_rect)
    
    def handle_input(self):
        """Handle player input for agent control."""
        keys = pygame.key.get_pressed()
        
        # Basic movement commands (this would typically interface with ColorLang VM)
        if keys[pygame.K_LEFT]:
            # Send movement command to VM
            pass
        if keys[pygame.K_RIGHT]:
            # Send movement command to VM  
            pass
        if keys[pygame.K_SPACE] or keys[pygame.K_UP]:
            # Send jump command to VM
            pass
    
    def run(self):
        """Main game loop for 2-minute challenge."""
        clock = pygame.time.Clock()
        
        print("Starting Advanced Platform Challenge!")
        print("Collect bananas for 2 minutes - difficulty increases over time!")
        
        while self.running:
            dt = clock.tick(60) / 1000.0  # 60 FPS
            
            # Handle events
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        self.running = False
            
            # Check if game time is up
            elapsed = time.time() - self.start_time
            if elapsed >= self.game_duration:
                if self.game_active:
                    self.game_active = False
                    print(f"Game Over! Final score: {sum(1 for b in self.bananas if b['collected'])} bananas")
                    
                    # Keep showing results for a few more seconds
                    if elapsed >= self.game_duration + 5:
                        self.running = False
            
            if self.game_active:
                # Update game systems
                self.update_difficulty()
                self.update_bananas()
                self.handle_input()
                
                # Execute VM step
                try:
                    self.vm.step()
                except Exception as e:
                    print(f"VM execution error: {e}")
            
            # Get current game state
            agent_state = self.get_agent_state()
            
            # Check banana collection
            if self.game_active:
                collected = self.check_banana_collection(agent_state)
                if collected > 0:
                    print(f"Collected {collected} banana(s)! Total: {sum(1 for b in self.bananas if b['collected'])}")
            
            # Render everything
            self.render_world(agent_state)
            self.render_ui(agent_state)
            
            pygame.display.flip()
        
        pygame.quit()

def main():
    """Run the advanced platform challenge."""
    try:
        host = AdvancedPlatformHost()
        host.run()
    except Exception as e:
        print(f"Error running advanced platform: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
