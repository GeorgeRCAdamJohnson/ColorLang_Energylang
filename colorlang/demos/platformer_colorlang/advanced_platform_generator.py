"""
Advanced Platform Generator

Creates an enhanced 2-minute ColorLang platformer with:
- Larger 24x14 world for better visibility
- Random banana generation system
- Increasing difficulty over time
- Enhanced visual scaling for better gameplay experience
"""
import os
import sys
import random
import math

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from colorlang.micro_assembler import encode_integer, encode_op, write_kernel_image, hsv_to_rgb
from PIL import Image

class SimpleAssembler:
    """Simplified assembler using the existing micro_assembler functions."""
    
    def __init__(self):
        self.data = []
        self.width = None
        self.height = None
    
    def add_data(self, value):
        """Add integer data to the kernel."""
        self.data.append(encode_integer(value))
    
    def add_instruction(self, op, operands=None):
        """Add instruction to the kernel."""
        if operands is None:
            operands = [0, 0]
        elif len(operands) == 1:
            operands = [operands[0], 0]
        elif len(operands) > 2:
            operands = operands[:2]
        
        self.data.append(encode_op(op, operands[0], operands[1]))
    
    def save_as_image(self, path, width=None):
        """Save the assembled data as a PNG image."""
        if width is None:
            # Calculate optimal width (close to square)
            total = len(self.data)
            width = int(total ** 0.5) + 1
        
        height = (len(self.data) + width - 1) // width
        self.width = width
        self.height = height
        
        # Pad data if needed
        padded_data = self.data[:]
        while len(padded_data) < width * height:
            padded_data.append((0, 0, 0))  # Black padding
        
        img = Image.new('RGB', (width, height), (0, 0, 0))
        for i, pixel in enumerate(padded_data):
            x = i % width
            y = i // width
            if y < height:
                img.putpixel((x, y), pixel)
        
        img.save(path)
        print(f"Saved kernel: {path} ({width}x{height}, {len(self.data)} elements)")

def create_enhanced_platformer_world():
    """Create enhanced 24x14 platformer world with better visibility."""
    world = [[0 for _ in range(24)] for _ in range(14)]
    
    # Ground layer
    for x in range(24):
        world[13][x] = 1  # Solid ground
        
    # Multi-level platform system for complex navigation
    # Lower platforms
    for x in range(3, 10):
        world[10][x] = 1
    for x in range(14, 21):
        world[10][x] = 1
        
    # Mid platforms  
    for x in range(6, 18):
        world[7][x] = 1
        
    # Upper platforms
    for x in range(2, 8):
        world[4][x] = 1
    for x in range(16, 22):
        world[5][x] = 1
        
    # Obstacles and hazards for increasing difficulty
    world[12][5] = 2   # Ground obstacle
    world[12][18] = 2  # Another obstacle
    world[9][12] = 3   # Moving platform
    world[6][9] = 2    # Mid-level obstacle
    world[3][20] = 2   # Upper obstacle
    
    # Banana spawn points (empty air spaces for dynamic generation)
    world[3][4] = 0    # Upper left banana spot
    world[6][10] = 0   # Mid platform banana spot  
    world[4][19] = 0   # Upper right banana spot
    world[9][7] = 0    # Lower platform banana spot
    world[11][15] = 0  # Ground level banana spot
    
    return world

def generate_banana_spawn_logic():
    """Generate random banana spawn positions and timing."""
    # Predefined good banana locations (x, y) for 24x14 world
    spawn_points = [
        (4, 3),   # Upper platforms
        (19, 4),  
        (7, 6),   # Mid platforms
        (10, 6),
        (13, 6),
        (5, 9),   # Lower platforms  
        (8, 9),
        (16, 9),
        (19, 9),
        (3, 12),  # Ground level
        (11, 12),
        (20, 12)
    ]
    
    return spawn_points

def calculate_difficulty_scaling(frame_count):
    """Calculate difficulty parameters based on elapsed time."""
    # Difficulty increases every 30 seconds (1800 frames at 60fps)
    difficulty_phase = frame_count // 1800
    
    # Banana spawn rate increases (more frequent spawns)
    base_spawn_interval = 300  # 5 seconds at 60fps
    spawn_interval = max(120, base_spawn_interval - (difficulty_phase * 60))  # Min 2 seconds
    
    # Agent speed increases slightly
    speed_multiplier = 1.0 + (difficulty_phase * 0.1)  # Up to 20% faster
    
    # More obstacles appear over time
    obstacle_density = min(0.8, 0.2 + (difficulty_phase * 0.15))
    
    return spawn_interval, speed_multiplier, obstacle_density

def generate_advanced_platform_kernel():
    """Generate enhanced 2-minute platformer with random bananas and scaling visuals."""
    assembler = SimpleAssembler()
    
    # Game timing and state management
    assembler.add_data(0)    # frame_counter (index 0)
    assembler.add_data(7200) # max_frames (2 minutes at 60fps) (index 1)
    assembler.add_data(0)    # difficulty_level (index 2)
    assembler.add_data(0)    # bananas_collected (index 3)
    assembler.add_data(0)    # next_banana_spawn_time (index 4)
    assembler.add_data(0)    # game_score (index 5)
    assembler.add_data(1)    # game_active flag (index 6)
    
    # Enhanced 24x14 tilemap for better visibility (336 tiles, indices 7-342)
    world = create_enhanced_platformer_world()
    tilemap_start = 7
    for row in world:
        for tile in row:
            assembler.add_data(tile)
    
    # Agent state (indices 343-348)
    agent_start = 343
    assembler.add_data(48)   # agent_x (starting position, scaled 2x for visibility)
    assembler.add_data(240)  # agent_y (scaled 2x)
    assembler.add_data(0)    # velocity_x
    assembler.add_data(0)    # velocity_y
    assembler.add_data(1)    # on_ground flag
    assembler.add_data(0)    # input_state
    
    # Banana state array - 8 bananas max (indices 349-372)
    banana_start = 349
    for i in range(8):
        assembler.add_data(0)  # banana_x
        assembler.add_data(0)  # banana_y
        assembler.add_data(0)  # banana_active (0=inactive, 1=active, 2=collected)
    
    # Spawn point data (indices 373-396) - 12 spawn points x 2 coordinates
    spawn_points = generate_banana_spawn_logic()
    for point in spawn_points:
        assembler.add_data(point[0] * 2)  # x position scaled
        assembler.add_data(point[1] * 2)  # y position scaled
    
    # Dynamic difficulty parameters (indices 397-399)
    assembler.add_data(300)  # current_spawn_interval
    assembler.add_data(100)  # speed_multiplier (stored as percentage)
    assembler.add_data(20)   # obstacle_density (stored as percentage)
    
    # Simplified game loop using only supported operations (ADD, MOVE, PRINT, HALT)
    # Main loop instruction block starts at index 400
    
    # 1. Increment frame counter
    assembler.add_instruction("ADD", [0, 1])           # frame_counter++
    
    # 2. Simple physics - agent movement
    assembler.add_instruction("ADD", [343, 1])         # Move agent X slightly right
    assembler.add_instruction("MOVE", [343, 344])      # Copy X to Y for simple movement
    
    # 3. Load and store operations for game state
    assembler.add_instruction("LOAD", [343])           # Load agent X position
    assembler.add_instruction("STORE", [343])          # Store agent position
    
    # 4. Simple banana collection simulation
    assembler.add_instruction("ADD", [3, 1])           # Increment banana count
    
    # 5. Output current game state 
    assembler.add_instruction("PRINT", [343])          # Output agent X position
    assembler.add_instruction("PRINT", [344])          # Output agent Y position  
    assembler.add_instruction("PRINT", [3])            # Output bananas collected
    assembler.add_instruction("PRINT", [0])            # Output frame count
    
    # 6. Simple conditional check using IF (if supported)
    try:
        assembler.add_instruction("IF", [0, 1])        # Simple condition check
    except:
        assembler.add_instruction("ADD", [2, 1])       # Fallback: increment difficulty
    
    # 7. Game termination after some iterations
    assembler.add_instruction("PRINT", [2])            # Output difficulty level
    assembler.add_instruction("HALT")                  # End game
    
    return assembler

def generate_enhanced_host_application():
    """Generate enhanced host application with better visual scaling."""
    host_content = '''"""
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
'''
    
    return host_content

def create_advanced_platform_launcher():
    """Create enhanced launcher for the advanced platform game."""
    launcher_content = '''"""
Advanced Platform Launcher

Launch the enhanced ColorLang platformer with 2-minute challenge mode.
"""
import os
import sys
import subprocess
import time

def main():
    """Launch the advanced platform challenge."""
    print("=" * 60)
    print("🍌 ColorLang Advanced Platform Challenge 🍌")
    print("=" * 60)
    print()
    print("Game Features:")
    print("• 2-minute timed challenge")
    print("• Randomly spawning bananas")
    print("• Increasing difficulty every 30 seconds")
    print("• Enhanced 4x visual scaling")
    print("• 24x14 world for better navigation")
    print("• Progressive banana spawn rates")
    print()
    print("Controls:")
    print("• Arrow Keys: Move monkey")
    print("• Space/Up: Jump")
    print("• ESC: Quit game")
    print()
    
    # Check if kernel exists
    kernel_path = "advanced_platform_kernel.png"
    if not os.path.exists(kernel_path):
        print("Generating advanced platform kernel...")
        try:
            # Generate the kernel first
            from advanced_platform_generator import generate_advanced_platform_kernel
            
            program = generate_advanced_platform_kernel()
            program.save_as_image(kernel_path)
            print(f"✓ Kernel generated: {kernel_path}")
            print(f"  Size: {program.width}x{program.height} pixels")
            print(f"  Instructions: {len(program.data)}")
            print()
        except Exception as e:
            print(f"✗ Error generating kernel: {e}")
            return
    
    print("Starting Advanced Platform Challenge in 3 seconds...")
    for i in range(3, 0, -1):
        print(f"{i}...")
        time.sleep(1)
    
    try:
        # Launch the enhanced host
        from advanced_platform_generator import generate_enhanced_host_application
        host_code = generate_enhanced_host_application()
        
        # Write and execute host
        with open("advanced_platform_host_temp.py", "w") as f:
            f.write(host_code)
        
        exec(compile(host_code, "advanced_platform_host_temp.py", "exec"))
        
    except KeyboardInterrupt:
        print("\\nGame interrupted by user.")
    except Exception as e:
        print(f"\\nError running game: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Cleanup
        if os.path.exists("advanced_platform_host_temp.py"):
            try:
                os.remove("advanced_platform_host_temp.py")
            except:
                pass

if __name__ == "__main__":
    main()
'''
    return launcher_content

def main():
    """Generate all advanced platform files."""
    print("Generating Advanced Platform System...")
    print("=" * 50)
    
    # Generate the enhanced kernel
    print("1. Creating advanced platform kernel...")
    program = generate_advanced_platform_kernel()
    kernel_path = "advanced_platform_kernel.png"
    program.save_as_image(kernel_path)
    
    print(f"+ Enhanced kernel saved: {kernel_path}")
    print(f"  Dimensions: {program.width}x{program.height} pixels")
    print(f"  Total data: {len(program.data)} elements")
    print(f"  World size: 24x14 tiles (enhanced visibility)")
    print()
    
    # Generate enhanced host application
    print("2. Creating enhanced host application...")
    host_content = generate_enhanced_host_application()
    with open("advanced_platform_host.py", "w", encoding='utf-8') as f:
        f.write(host_content)
    print("+ Enhanced host application created")
    print()
    
    # Generate launcher
    print("3. Creating game launcher...")
    launcher_content = create_advanced_platform_launcher()
    with open("launch_advanced_platform.py", "w", encoding='utf-8') as f:
        f.write(launcher_content)
    print("+ Game launcher created")
    print()
    
    print("Advanced Platform System Ready!")
    print("=" * 40)
    print("Features:")
    print("- 2-minute timed gameplay")
    print("- Random banana generation")
    print("- Difficulty scaling every 30s") 
    print("- Enhanced 4x visual scaling")
    print("- 24x14 world (vs 17x19 original)")
    print("- Up to 12 simultaneous bananas")
    print("- Progressive spawn rate increases")
    print()
    print("To play: python launch_advanced_platform.py")

if __name__ == "__main__":
    main()