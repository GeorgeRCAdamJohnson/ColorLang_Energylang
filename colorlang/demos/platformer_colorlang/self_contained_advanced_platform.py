"""
ColorLang Advanced Platform - Self-Contained Version

A complete 2-minute challenge platformer that works without any external dependencies.
Uses text-based graphics with enhanced visual presentation.
"""
import time
import random
import os
import sys

class SelfContainedAdvancedPlatform:
    def __init__(self):
        # Game timing
        self.start_time = None
        self.game_duration = 120  # 2 minutes
        self.running = True
        self.game_over = False
        
        # Enhanced world (24x14)
        self.world_width = 24
        self.world_height = 14
        
        # Game state
        self.monkey = {'x': 2, 'y': 10, 'vx': 0, 'vy': 0, 'on_ground': False}
        self.bananas = []
        self.bananas_collected = 0
        self.difficulty_level = 1
        self.next_spawn_time = 0
        self.spawn_interval = 5.0
        self.max_bananas = 5
        
        # Enhanced visuals
        self.frame_count = 0
        self.last_collection_time = 0
        self.show_collection_effect = False
        
        # World creation
        self.world = self.create_enhanced_world()
        
    def create_enhanced_world(self):
        """Create the enhanced 24x14 world with platforms and obstacles."""
        world = [['.' for _ in range(self.world_width)] for _ in range(self.world_height)]
        
        # Ground (bottom row)
        for x in range(self.world_width):
            world[13][x] = '='
            
        # Main platforms (enhanced layout)
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
            
        # Additional small platforms for complexity
        for x in range(10, 14):
            world[2][x] = '-'
            
        # Obstacles and interactive elements
        world[12][5] = '#'   # Block
        world[12][18] = '#'  # Block
        world[9][12] = 'O'   # Bounce pad
        world[6][9] = '^'    # Jump boost
        world[3][19] = '^'   # Jump boost
        
        return world
        
    def clear_screen(self):
        """Clear the terminal screen."""
        os.system('cls' if os.name == 'nt' else 'clear')
        
    def display_title_card(self):
        """Display an enhanced title card."""
        self.clear_screen()
        print("█" * 80)
        print("█" + " " * 78 + "█")
        print("█" + "🍌 ColorLang Advanced Platform Challenge 🍌".center(78) + "█")
        print("█" + " " * 78 + "█")
        print("█" + "2-Minute Challenge • Enhanced 24x14 World • Scaling Difficulty".center(78) + "█")
        print("█" + " " * 78 + "█")
        print("█" * 80)
        print()
        
    def display_game_ui(self):
        """Display enhanced game UI with better formatting."""
        elapsed = time.time() - self.start_time if self.start_time else 0
        remaining = max(0, self.game_duration - elapsed)
        
        # Title and stats
        self.clear_screen()
        self.display_title_card()
        
        # Enhanced stats bar
        stats = f"⏱️  Time: {remaining:05.1f}s │ 🍌 Bananas: {self.bananas_collected:02d} │ 📊 Level: {self.difficulty_level} │ 🎯 Active: {len(self.bananas)}"
        print("┌" + "─" * (len(stats) + 2) + "┐")
        print("│ " + stats + " │")
        print("└" + "─" * (len(stats) + 2) + "┘")
        print()
        
        # Create enhanced world display
        world_display = [row[:] for row in self.world]
        
        # Add bananas with animation
        for banana in self.bananas:
            if 0 <= banana['x'] < self.world_width and 0 <= banana['y'] < self.world_height:
                # Animated banana symbol
                banana_symbol = '🍌' if (self.frame_count // 10) % 2 == 0 else '💛'
                world_display[banana['y']][banana['x']] = banana_symbol
                
        # Add monkey with animation
        if 0 <= self.monkey['x'] < self.world_width and 0 <= self.monkey['y'] < self.world_height:
            monkey_x, monkey_y = int(self.monkey['x']), int(self.monkey['y'])
            # Animated monkey
            if self.monkey['vy'] < -0.1:  # Jumping up
                world_display[monkey_y][monkey_x] = '🐵'  # Different face when jumping
            elif not self.monkey['on_ground']:  # Falling
                world_display[monkey_y][monkey_x] = '😮'  # Surprised face when falling
            else:  # On ground
                world_display[monkey_y][monkey_x] = '🐒'  # Normal monkey
                
        # Display world with enhanced borders
        print("┌" + "─" * (self.world_width * 2 + 1) + "┐")
        for row in world_display:
            print("│ " + " ".join(row) + " │")
        print("└" + "─" * (self.world_width * 2 + 1) + "┘")
        print()
        
        # Enhanced legend
        print("🎮 Legend: 🐒=Monkey │ 🍌=Banana │ -=Platform │ ==Ground │ #=Block │ O=Bounce │ ^=Jump Boost")
        print()
        
        # Game status and effects
        if self.show_collection_effect:
            if time.time() - self.last_collection_time < 1.0:
                print("✨ " + "★" * 20 + " BANANA COLLECTED! " + "★" * 20 + " ✨")
            else:
                self.show_collection_effect = False
                
        if remaining <= 10:
            print("🚨 " + "FINAL COUNTDOWN! HURRY!" + " 🚨")
        elif self.difficulty_level > 1:
            print(f"💪 Difficulty Level {self.difficulty_level}: Spawn every {self.spawn_interval:.1f}s, Max {self.max_bananas} bananas")
            
        # Show game over results
        if remaining <= 0:
            self.show_final_results()
            
    def show_final_results(self):
        """Display enhanced final results."""
        print()
        print("🎉" * 30)
        print("🎉" + " " * 86 + "🎉")
        print("🎉" + "CHALLENGE COMPLETE!".center(86) + "🎉")
        print("🎉" + " " * 86 + "🎉")
        
        # Performance rating
        if self.bananas_collected >= 25:
            rating = "🏆 LEGENDARY PERFORMANCE! 🏆"
            stars = "★" * 10
        elif self.bananas_collected >= 20:
            rating = "🥇 EXCELLENT! 🥇"
            stars = "★" * 8
        elif self.bananas_collected >= 15:
            rating = "🥈 GREAT JOB! 🥈"
            stars = "★" * 6
        elif self.bananas_collected >= 10:
            rating = "🥉 GOOD EFFORT! 🥉"
            stars = "★" * 4
        else:
            rating = "💪 KEEP PRACTICING! 💪"
            stars = "★" * 2
            
        print("🎉" + rating.center(86) + "🎉")
        print("🎉" + stars.center(86) + "🎉")
        print("🎉" + " " * 86 + "🎉")
        print("🎉" + f"Final Score: {self.bananas_collected} bananas collected".center(86) + "🎉")
        print("🎉" + f"Maximum Difficulty Level: {self.difficulty_level}".center(86) + "🎉")
        print("🎉" + " " * 86 + "🎉")
        print("🎉" * 30)
        print()
        
    def update_difficulty(self):
        """Update difficulty with enhanced progression."""
        elapsed = time.time() - self.start_time
        new_level = int(elapsed // 30) + 1  # Every 30 seconds
        
        if new_level != self.difficulty_level:
            self.difficulty_level = new_level
            # More aggressive difficulty scaling
            self.spawn_interval = max(1.5, 5.0 - (new_level * 0.75))
            self.max_bananas = min(10, 5 + new_level - 1)
            
    def spawn_banana(self):
        """Spawn bananas with enhanced logic."""
        if len(self.bananas) >= self.max_bananas:
            return
            
        # Enhanced spawn points including new platforms
        spawn_points = [
            # Main platforms
            (4, 3), (19, 4), (7, 6), (10, 6), (13, 6),
            (5, 9), (8, 9), (16, 9), (3, 12), (11, 12), (20, 12),
            # New elevated positions
            (11, 1), (12, 1), (6, 3), (17, 4), (9, 5),
            # Ground level strategic positions
            (1, 12), (7, 12), (15, 12), (22, 12)
        ]
        
        # Filter out occupied positions
        available = []
        for point in spawn_points:
            if 0 <= point[0] < self.world_width and 0 <= point[1] < self.world_height:
                occupied = False
                for banana in self.bananas:
                    if abs(banana['x'] - point[0]) < 2 and abs(banana['y'] - point[1]) < 2:
                        occupied = True
                        break
                if not occupied:
                    available.append(point)
                    
        if available:
            spawn_point = random.choice(available)
            self.bananas.append({
                'x': spawn_point[0],
                'y': spawn_point[1],
                'spawn_time': time.time()
            })
            
    def update_bananas(self):
        """Update banana spawning with enhanced timing."""
        current_time = time.time()
        
        if current_time >= self.next_spawn_time:
            self.spawn_banana()
            self.next_spawn_time = current_time + self.spawn_interval
            
    def simple_enhanced_ai(self):
        """Enhanced AI with better pathfinding."""
        if not self.bananas:
            return
            
        # Find nearest banana
        nearest_banana = min(self.bananas, 
                           key=lambda b: abs(self.monkey['x'] - b['x']) + abs(self.monkey['y'] - b['y']))
        
        # Enhanced movement logic
        dx = nearest_banana['x'] - self.monkey['x']
        dy = nearest_banana['y'] - self.monkey['y']
        
        # Horizontal movement with momentum
        if abs(dx) > 0.5:
            if dx > 0 and self.monkey['x'] < self.world_width - 1:
                self.monkey['vx'] = min(self.monkey['vx'] + 0.3, 0.6)
            elif dx < 0 and self.monkey['x'] > 0:
                self.monkey['vx'] = max(self.monkey['vx'] - 0.3, -0.6)
        else:
            self.monkey['vx'] *= 0.8  # Slow down when close
            
        # Smart jumping for vertical movement
        if dy < -1 and self.monkey['on_ground'] and abs(dx) < 3:
            self.monkey['vy'] = -0.8
            self.monkey['on_ground'] = False
            
    def update_physics(self):
        """Enhanced physics simulation."""
        # Apply gravity
        if not self.monkey['on_ground']:
            self.monkey['vy'] += 0.05
            
        # Apply air resistance
        self.monkey['vx'] *= 0.92
        
        # Update position
        self.monkey['x'] += self.monkey['vx']
        self.monkey['y'] += self.monkey['vy']
        
        # Boundary checking
        self.monkey['x'] = max(0, min(self.world_width - 1, self.monkey['x']))
        
        # Enhanced collision detection
        self.monkey['on_ground'] = False
        
        mx = int(self.monkey['x'])
        my = int(self.monkey['y'])
        
        # Platform collision
        if my >= 0 and my < self.world_height - 1:
            if my + 1 < len(self.world) and mx < len(self.world[my + 1]):
                below_tile = self.world[my + 1][mx]
                if below_tile in ['-', '='] and self.monkey['vy'] >= 0:
                    self.monkey['y'] = my
                    self.monkey['vy'] = 0
                    self.monkey['on_ground'] = True
                    
                # Special tile effects
                if below_tile == 'O':  # Bounce pad
                    self.monkey['vy'] = -1.2
                    self.monkey['on_ground'] = False
                elif below_tile == '^':  # Jump boost
                    self.monkey['vy'] = -0.9
                    
        # Ground collision
        if self.monkey['y'] >= self.world_height - 1:
            self.monkey['y'] = self.world_height - 1
            self.monkey['vy'] = 0
            self.monkey['on_ground'] = True
            
    def check_banana_collection(self):
        """Enhanced collection detection with effects."""
        collected_count = 0
        remaining_bananas = []
        
        for banana in self.bananas:
            distance = abs(self.monkey['x'] - banana['x']) + abs(self.monkey['y'] - banana['y'])
            if distance <= 1.2:
                collected_count += 1
                self.bananas_collected += 1
                self.last_collection_time = time.time()
                self.show_collection_effect = True
            else:
                remaining_bananas.append(banana)
                
        self.bananas = remaining_bananas
        return collected_count
        
    def run_enhanced_challenge(self):
        """Run the enhanced 2-minute challenge."""
        print("🍌 ColorLang Advanced Platform - Enhanced Edition 🍌")
        print("=" * 60)
        print()
        print("🎯 Challenge: Collect as many bananas as possible in 2 minutes!")
        print("📈 Difficulty increases every 30 seconds")
        print("🌟 Enhanced 24x14 world with special platforms")
        print("🤖 Advanced AI pathfinding")
        print()
        input("Press ENTER to start the enhanced challenge... ")
        
        # Start the challenge
        self.start_time = time.time()
        
        while self.running:
            current_time = time.time()
            elapsed = current_time - self.start_time
            
            # Check game end
            if elapsed >= self.game_duration:
                self.running = False
                break
                
            # Update all systems
            self.update_difficulty()
            self.update_bananas()
            self.simple_enhanced_ai()
            self.update_physics()
            self.check_banana_collection()
            
            # Display game
            self.display_game_ui()
            
            # Increment frame counter for animations
            self.frame_count += 1
            
            # Enhanced tick rate
            time.sleep(0.3)
            
        # Final display
        self.display_game_ui()
        time.sleep(5)  # Show results longer

def main():
    """Run the self-contained advanced platform challenge."""
    try:
        game = SelfContainedAdvancedPlatform()
        game.run_enhanced_challenge()
    except KeyboardInterrupt:
        print("\\nChallenge interrupted. Thanks for playing!")
    except Exception as e:
        print(f"\\nError: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()