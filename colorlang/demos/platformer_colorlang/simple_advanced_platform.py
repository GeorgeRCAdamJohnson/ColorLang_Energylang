"""
Simple Advanced Platform Demo

A console-based version of the enhanced ColorLang platformer that runs for 2 minutes
and shows the monkey collecting randomly spawning bananas with increasing difficulty.
"""
import time
import random
import os
import sys

# Add project root to path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from colorlang.color_parser import ColorParser
from colorlang.virtual_machine import ColorVM

class SimpleAdvancedPlatform:
    def __init__(self):
        self.vm = ColorVM()
        self.start_time = time.time()
        self.game_duration = 120  # 2 minutes
        self.running = True
        
        # Enhanced game world (24x14)
        self.world_width = 24
        self.world_height = 14
        
        # Game state
        self.agent_x = 2
        self.agent_y = 10
        self.bananas_collected = 0
        self.difficulty_level = 1
        self.active_bananas = []
        self.max_bananas = 5
        self.next_spawn_time = 0
        self.spawn_interval = 5.0
        
        # Load ColorLang kernel
        self.load_kernel()
        
    def load_kernel(self):
        """Load the advanced platform ColorLang kernel."""
        try:
            parser = ColorParser()
            program = parser.parse_image("advanced_platform_kernel.png")
            self.vm.load_program(program)
            print("Advanced Platform kernel loaded!")
            print(f"Kernel size: 21x20 pixels with {len(program.get('instructions', []))} instructions")
        except Exception as e:
            print(f"Note: Could not load ColorLang kernel ({e})")
            print("Running in simulation mode...")
    
    def create_world_display(self):
        """Create a visual representation of the game world."""
        # Create world grid
        world = [['.' for _ in range(self.world_width)] for _ in range(self.world_height)]
        
        # Add ground
        for x in range(self.world_width):
            world[13][x] = '='
        
        # Add platforms
        for x in range(3, 10):
            world[10][x] = '-'
        for x in range(14, 21):
            world[10][x] = '-'
            
        for x in range(6, 18):
            world[7][x] = '-'
            
        for x in range(2, 8):
            world[4][x] = '-'
        for x in range(16, 22):
            world[5][x] = '-'
        
        # Add obstacles
        world[12][5] = '#'
        world[12][18] = '#'
        world[9][12] = 'O'
        
        # Add bananas
        for banana in self.active_bananas:
            if 0 <= banana['x'] < self.world_width and 0 <= banana['y'] < self.world_height:
                world[banana['y']][banana['x']] = '$'
        
        # Add monkey
        if 0 <= self.agent_x < self.world_width and 0 <= self.agent_y < self.world_height:
            world[self.agent_y][self.agent_x] = '@'
        
        return world
    
    def update_difficulty(self):
        """Update game difficulty based on elapsed time."""
        elapsed = time.time() - self.start_time
        new_level = int(elapsed // 30) + 1  # Every 30 seconds
        
        if new_level != self.difficulty_level:
            self.difficulty_level = new_level
            self.spawn_interval = max(2.0, 5.0 - (new_level * 0.5))
            self.max_bananas = min(8, 5 + new_level - 1)
            print(f"\\n*** DIFFICULTY INCREASED TO LEVEL {self.difficulty_level} ***")
            print(f"Bananas spawn every {self.spawn_interval:.1f}s, Max: {self.max_bananas}")
    
    def spawn_banana(self):
        """Spawn a new banana at a random location."""
        if len(self.active_bananas) >= self.max_bananas:
            return
            
        # Good spawn locations (platforms and elevated areas)
        spawn_points = [
            (4, 3), (19, 4), (7, 6), (10, 6), (13, 6),
            (5, 9), (8, 9), (16, 9), (3, 12), (11, 12), (20, 12)
        ]
        
        # Filter out occupied spots
        available = []
        for point in spawn_points:
            occupied = False
            for banana in self.active_bananas:
                if abs(banana['x'] - point[0]) < 2 and abs(banana['y'] - point[1]) < 2:
                    occupied = True
                    break
            if not occupied:
                available.append(point)
        
        if available:
            spawn_point = random.choice(available)
            self.active_bananas.append({
                'x': spawn_point[0],
                'y': spawn_point[1],
                'spawn_time': time.time()
            })
    
    def update_bananas(self):
        """Update banana spawning."""
        current_time = time.time()
        
        # Spawn new bananas
        if current_time >= self.next_spawn_time:
            self.spawn_banana()
            self.next_spawn_time = current_time + self.spawn_interval
    
    def check_banana_collection(self):
        """Check if monkey collected any bananas."""
        collected = 0
        remaining_bananas = []
        
        for banana in self.active_bananas:
            distance = abs(self.agent_x - banana['x']) + abs(self.agent_y - banana['y'])
            if distance <= 1:  # Adjacent or same position
                collected += 1
                print(f"BANANA COLLECTED! (+{collected})")
            else:
                remaining_bananas.append(banana)
        
        self.active_bananas = remaining_bananas
        self.bananas_collected += collected
        return collected
    
    def simple_ai_movement(self):
        """Simple AI to move monkey toward nearest banana."""
        if not self.active_bananas:
            return
            
        # Find nearest banana
        nearest_banana = min(self.active_bananas, 
                           key=lambda b: abs(self.agent_x - b['x']) + abs(self.agent_y - b['y']))
        
        # Move toward it (simple pathfinding)
        if self.agent_x < nearest_banana['x'] and self.agent_x < self.world_width - 1:
            self.agent_x += 1
        elif self.agent_x > nearest_banana['x'] and self.agent_x > 0:
            self.agent_x -= 1
        elif self.agent_y < nearest_banana['y'] and self.agent_y < self.world_height - 2:
            self.agent_y += 1  
        elif self.agent_y > nearest_banana['y'] and self.agent_y > 0:
            self.agent_y -= 1
    
    def display_game(self):
        """Display current game state."""
        # Clear screen (works on most terminals)
        os.system('cls' if os.name == 'nt' else 'clear')
        
        elapsed = time.time() - self.start_time
        remaining = max(0, self.game_duration - elapsed)
        
        print("=" * 60)
        print("🍌 ColorLang Advanced Platform - 2 Minute Challenge 🍌")
        print("=" * 60)
        print(f"Time: {remaining:.1f}s | Bananas: {self.bananas_collected} | Level: {self.difficulty_level}")
        print(f"Active Bananas: {len(self.active_bananas)} | Monkey: ({self.agent_x},{self.agent_y})")
        print()
        
        # Display world
        world = self.create_world_display()
        for row in world:
            print(' '.join(row))
        
        print()
        print("Legend: @ = Monkey, $ = Banana, - = Platform, = = Ground, # = Obstacle")
        print("The monkey automatically moves toward bananas!")
        
        if remaining <= 0:
            print("\\n" + "=" * 60)
            print("🎉 GAME OVER! 🎉")
            print(f"Final Score: {self.bananas_collected} bananas collected!")
            print(f"Reached Difficulty Level: {self.difficulty_level}")
            print(f"Performance Rating: {'EXCELLENT' if self.bananas_collected >= 15 else 'GOOD' if self.bananas_collected >= 10 else 'KEEP TRYING'}")
            print("=" * 60)
    
    def run(self):
        """Main game loop."""
        print("Starting Advanced Platform Challenge!")
        print("The monkey will automatically collect bananas for 2 minutes...")
        time.sleep(2)
        
        while self.running:
            elapsed = time.time() - self.start_time
            
            # Check if game time is up
            if elapsed >= self.game_duration:
                self.display_game()
                time.sleep(3)  # Show final results
                break
            
            # Update game systems
            self.update_difficulty()
            self.update_bananas()
            
            # Execute VM step (if kernel loaded)
            try:
                self.vm.step()
            except:
                pass  # Continue in simulation mode
            
            # Simple AI movement
            self.simple_ai_movement()
            
            # Check collections
            self.check_banana_collection()
            
            # Display game state
            self.display_game()
            
            # Game tick rate
            time.sleep(0.5)
        
        print("\\nThank you for playing ColorLang Advanced Platform!")

def main():
    """Run the simple advanced platform demo."""
    print("ColorLang Advanced Platform - Console Demo")
    print("This demo shows the enhanced 2-minute challenge!")
    print()
    
    try:
        game = SimpleAdvancedPlatform()
        game.run()
    except KeyboardInterrupt:
        print("\\nGame interrupted by user.")
    except Exception as e:
        print(f"\\nError: {e}")

if __name__ == "__main__":
    main()