"""
Tkinter Advanced Platform

A desktop GUI version of the enhanced ColorLang platformer using tkinter (built into Python).
This provides full graphics without external dependencies.
"""
import tkinter as tk
from tkinter import messagebox
import time
import math
import random
import os
import sys

# Add project root to path for ColorLang imports
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

class TkinterAdvancedPlatform:
    def __init__(self):
        # Create main window
        self.root = tk.Tk()
        self.root.title("ColorLang Advanced Platform Challenge")
        self.root.configure(bg='#2c3e50')
        self.root.resizable(False, False)
        
        # Game timing
        self.start_time = None
        self.game_duration = 120000  # 2 minutes in ms
        self.running = False
        self.game_over = False
        
        # World settings (enhanced)
        self.world_width = 24
        self.world_height = 14
        self.tile_size = 30  # Slightly smaller for tkinter
        
        # Game state
        self.monkey = {'x': 2.0, 'y': 10.0, 'vx': 0, 'vy': 0, 'on_ground': False}
        self.bananas = []
        self.bananas_collected = 0
        self.difficulty_level = 1
        self.next_spawn_time = 0
        self.spawn_interval = 5000
        self.max_bananas = 5
        
        # Input state
        self.keys_pressed = set()
        
        # Setup UI
        self.setup_ui()
        
        # World data
        self.world = self.create_world()
        
        # Load ColorLang kernel info
        self.load_kernel_info()
        
        # Start countdown
        self.start_countdown()
        
    def setup_ui(self):
        """Setup the user interface."""
        # Title frame
        title_frame = tk.Frame(self.root, bg='#2c3e50')
        title_frame.pack(pady=10)
        
        title_label = tk.Label(title_frame, text="🍌 ColorLang Advanced Platform 🍌",
                              font=('Arial', 20, 'bold'), fg='#f39c12', bg='#2c3e50')
        title_label.pack()
        
        subtitle_label = tk.Label(title_frame, text="2-Minute Challenge with Increasing Complexity",
                                 font=('Arial', 12), fg='#ecf0f1', bg='#2c3e50')
        subtitle_label.pack()
        
        # Game info frame
        info_frame = tk.Frame(self.root, bg='#34495e', relief='raised', bd=2)
        info_frame.pack(pady=5, padx=20, fill='x')
        
        # Game statistics
        stats_frame = tk.Frame(info_frame, bg='#34495e')
        stats_frame.pack(pady=5)
        
        self.time_label = tk.Label(stats_frame, text="Time: 120.0s", font=('Courier', 12, 'bold'),
                                  fg='#e74c3c', bg='#34495e')
        self.time_label.grid(row=0, column=0, padx=20)
        
        self.bananas_label = tk.Label(stats_frame, text="Bananas: 0", font=('Courier', 12, 'bold'),
                                     fg='#f39c12', bg='#34495e')
        self.bananas_label.grid(row=0, column=1, padx=20)
        
        self.level_label = tk.Label(stats_frame, text="Level: 1", font=('Courier', 12, 'bold'),
                                   fg='#9b59b6', bg='#34495e')
        self.level_label.grid(row=0, column=2, padx=20)
        
        self.active_label = tk.Label(stats_frame, text="Active: 0", font=('Courier', 12, 'bold'),
                                    fg='#27ae60', bg='#34495e')
        self.active_label.grid(row=0, column=3, padx=20)
        
        # Game canvas
        canvas_frame = tk.Frame(self.root, bg='#2c3e50')
        canvas_frame.pack(pady=5)
        
        self.canvas = tk.Canvas(canvas_frame, 
                               width=self.world_width * self.tile_size,
                               height=self.world_height * self.tile_size,
                               bg='#87ceeb', relief='sunken', bd=3)
        self.canvas.pack()
        
        # Status label
        self.status_label = tk.Label(self.root, text="Get ready! Challenge starts in 3 seconds...",
                                    font=('Arial', 12), fg='#ecf0f1', bg='#2c3e50')
        self.status_label.pack(pady=10)
        
        # Controls info
        controls_frame = tk.Frame(self.root, bg='#2c3e50')
        controls_frame.pack(pady=5)
        
        controls_label = tk.Label(controls_frame, text="Controls: Arrow Keys = Move | Space = Jump | R = Restart",
                                 font=('Arial', 10), fg='#bdc3c7', bg='#2c3e50')
        controls_label.pack()
        
        # Bind key events
        self.root.bind('<KeyPress>', self.key_press)
        self.root.bind('<KeyRelease>', self.key_release)
        self.root.focus_set()  # Ensure window can receive key events
        
    def create_world(self):
        """Create the enhanced 24x14 game world."""
        world = [[0 for _ in range(self.world_width)] for _ in range(self.world_height)]
        
        # Ground (bottom row)
        for x in range(self.world_width):
            world[13][x] = 1
            
        # Platforms
        for x in range(3, 10): world[10][x] = 2
        for x in range(14, 21): world[10][x] = 2
        for x in range(6, 18): world[7][x] = 2
        for x in range(2, 8): world[4][x] = 2
        for x in range(16, 22): world[5][x] = 2
        
        # Obstacles
        world[12][5] = 3
        world[12][18] = 3
        world[9][12] = 4
        
        return world
        
    def load_kernel_info(self):
        """Try to load ColorLang kernel information."""
        try:
            from colorlang.color_parser import ColorParser
            from colorlang.virtual_machine import ColorVM
            
            if os.path.exists("advanced_platform_kernel.png"):
                parser = ColorParser()
                program = parser.parse_image("advanced_platform_kernel.png")
                self.vm = ColorVM()
                self.vm.load_program(program)
                
                kernel_info = f"ColorLang kernel loaded! ({len(program.get('instructions', []))} instructions)"
                self.status_label.config(text=kernel_info)
                self.root.after(2000, lambda: self.status_label.config(text="Get ready! Challenge starts in 3 seconds..."))
            else:
                self.vm = None
                
        except Exception as e:
            self.vm = None
            print(f"Note: ColorLang kernel not available ({e})")
            
    def key_press(self, event):
        """Handle key press events."""
        self.keys_pressed.add(event.keysym)
        if event.keysym == 'r' and self.game_over:
            self.restart_game()
            
    def key_release(self, event):
        """Handle key release events."""
        self.keys_pressed.discard(event.keysym)
        
    def start_countdown(self):
        """Start the 3-second countdown before game begins."""
        def countdown(count):
            if count > 0:
                self.status_label.config(text=f"Get ready! Challenge starts in {count} seconds...")
                self.root.after(1000, lambda: countdown(count - 1))
            else:
                self.status_label.config(text="GO! Collect as many bananas as possible!")
                self.start_game()
                
        countdown(3)
        
    def start_game(self):
        """Start the main game."""
        self.start_time = time.time() * 1000  # Convert to ms
        self.running = True
        self.game_loop()
        
    def restart_game(self):
        """Restart the game."""
        self.start_time = None
        self.running = False
        self.game_over = False
        self.monkey = {'x': 2.0, 'y': 10.0, 'vx': 0, 'vy': 0, 'on_ground': False}
        self.bananas = []
        self.bananas_collected = 0
        self.difficulty_level = 1
        self.next_spawn_time = 0
        self.spawn_interval = 5000
        self.max_bananas = 5
        
        # Reset UI
        self.bananas_label.config(text="Bananas: 0")
        self.level_label.config(text="Level: 1")
        self.active_label.config(text="Active: 0")
        self.time_label.config(text="Time: 120.0s")
        
        self.start_countdown()
        
    def update_difficulty(self, elapsed):
        """Update difficulty based on elapsed time."""
        new_level = int(elapsed // 30000) + 1  # Every 30 seconds
        
        if new_level != self.difficulty_level:
            self.difficulty_level = new_level
            self.spawn_interval = max(2000, 5000 - (new_level * 500))
            self.max_bananas = min(8, 5 + new_level - 1)
            
            self.level_label.config(text=f"Level: {new_level}")
            self.status_label.config(text=f"LEVEL {new_level}! Faster spawns, more bananas!")
            
    def spawn_banana(self):
        """Spawn a new banana at a strategic location."""
        if len(self.bananas) >= self.max_bananas:
            return
            
        spawn_points = [
            (4, 3), (19, 4), (7, 6), (10, 6), (13, 6),
            (5, 9), (8, 9), (16, 9), (3, 12), (11, 12), (20, 12)
        ]
        
        # Filter occupied spots
        available = []
        for point in spawn_points:
            occupied = any(abs(b['x'] - point[0]) < 2 and abs(b['y'] - point[1]) < 2 
                          for b in self.bananas)
            if not occupied:
                available.append(point)
                
        if available:
            spawn = random.choice(available)
            self.bananas.append({
                'x': spawn[0], 'y': spawn[1],
                'spawn_time': time.time() * 1000,
                'bob_offset': 0
            })
            
    def handle_input(self):
        """Handle player input."""
        speed = 0.25
        jump_power = 0.7
        
        if 'Left' in self.keys_pressed:
            self.monkey['vx'] = max(self.monkey['vx'] - speed, -0.35)
        if 'Right' in self.keys_pressed:
            self.monkey['vx'] = min(self.monkey['vx'] + speed, 0.35)
        if ('space' in self.keys_pressed or 'Up' in self.keys_pressed) and self.monkey['on_ground']:
            self.monkey['vy'] = -jump_power
            self.monkey['on_ground'] = False
            
    def update_physics(self):
        """Update game physics."""
        # Apply gravity
        self.monkey['vy'] += 0.04
        
        # Apply friction
        self.monkey['vx'] *= 0.88
        
        # Update position
        self.monkey['x'] += self.monkey['vx']
        self.monkey['y'] += self.monkey['vy']
        
        # World boundaries
        self.monkey['x'] = max(0, min(self.world_width - 1, self.monkey['x']))
        
        # Simple collision detection
        self.monkey['on_ground'] = False
        
        mx = int(self.monkey['x'])
        my = int(self.monkey['y'])
        
        # Check ground collision
        if my >= 0 and my < self.world_height - 1:
            if my + 1 < len(self.world) and mx < len(self.world[my + 1]):
                below_tile = self.world[my + 1][mx]
                if below_tile > 0 and self.monkey['vy'] >= 0:
                    self.monkey['y'] = my
                    self.monkey['vy'] = 0
                    self.monkey['on_ground'] = True
                    
        # Prevent falling through bottom
        if self.monkey['y'] >= self.world_height - 1:
            self.monkey['y'] = self.world_height - 1
            self.monkey['vy'] = 0
            self.monkey['on_ground'] = True
            
        # Update banana animations
        current_time = time.time() * 1000
        for banana in self.bananas:
            banana['bob_offset'] = math.sin((current_time - banana['spawn_time']) / 300) * 3
            
    def check_banana_collection(self):
        """Check if monkey collected any bananas."""
        collected_indices = []
        
        for i, banana in enumerate(self.bananas):
            distance = abs(self.monkey['x'] - banana['x']) + abs(self.monkey['y'] - banana['y'])
            if distance <= 1.2:
                collected_indices.append(i)
                self.bananas_collected += 1
                self.bananas_label.config(text=f"Bananas: {self.bananas_collected}")
                self.status_label.config(text=f"🍌 BANANA COLLECTED! Total: {self.bananas_collected}")
                
        # Remove collected bananas (reverse order)
        for i in reversed(collected_indices):
            self.bananas.pop(i)
            
        self.active_label.config(text=f"Active: {len(self.bananas)}")
        
    def render_game(self):
        """Render the game state."""
        self.canvas.delete("all")
        
        # Render world tiles
        for y in range(self.world_height):
            for x in range(self.world_width):
                tile = self.world[y][x]
                px = x * self.tile_size
                py = y * self.tile_size
                
                colors = {
                    1: '#8b4513',  # Ground - brown
                    2: '#228b22',  # Platform - green
                    3: '#696969',  # Block - gray
                    4: '#ff69b4'   # Bounce pad - pink
                }
                
                if tile in colors:
                    self.canvas.create_rectangle(px, py, px + self.tile_size, py + self.tile_size,
                                               fill=colors[tile], outline='black', width=1)
                    
        # Render bananas
        for banana in self.bananas:
            px = banana['x'] * self.tile_size + self.tile_size // 2
            py = banana['y'] * self.tile_size + self.tile_size // 2 + banana['bob_offset']
            
            # Banana circle
            radius = self.tile_size // 4
            self.canvas.create_oval(px - radius, py - radius, px + radius, py + radius,
                                  fill='#ffd700', outline='#daa520', width=2)
            
            # Banana symbol
            self.canvas.create_text(px, py, text='🍌', font=('Arial', self.tile_size // 3))
            
        # Render monkey
        mpx = self.monkey['x'] * self.tile_size + self.tile_size // 2
        mpy = self.monkey['y'] * self.tile_size + self.tile_size // 2
        
        # Monkey body
        radius = self.tile_size // 3
        self.canvas.create_oval(mpx - radius, mpy - radius, mpx + radius, mpy + radius,
                              fill='#8b4513', outline='#654321', width=2)
        
        # Monkey face
        self.canvas.create_text(mpx, mpy, text='🐒', font=('Arial', self.tile_size // 2))
        
    def game_loop(self):
        """Main game loop."""
        if not self.running:
            return
            
        current_time = time.time() * 1000
        elapsed = current_time - self.start_time
        time_left = max(0, self.game_duration - elapsed)
        
        # Update time display
        self.time_label.config(text=f"Time: {time_left/1000:.1f}s")
        
        # Check game end
        if time_left <= 0:
            self.end_game()
            return
            
        # Update game systems
        self.update_difficulty(elapsed)
        
        # Spawn bananas
        if current_time >= self.next_spawn_time:
            self.spawn_banana()
            self.next_spawn_time = current_time + self.spawn_interval
            
        # Execute VM step (if available)
        if hasattr(self, 'vm') and self.vm:
            try:
                self.vm.step()
            except:
                pass
                
        # Update game state
        self.handle_input()
        self.update_physics()
        self.check_banana_collection()
        
        # Render
        self.render_game()
        
        # Schedule next frame
        self.root.after(16, self.game_loop)  # ~60 FPS
        
    def end_game(self):
        """End the game and show results."""
        self.running = False
        self.game_over = True
        
        # Determine rating
        if self.bananas_collected >= 20:
            rating = "EXCELLENT!"
            color = '#27ae60'
        elif self.bananas_collected >= 12:
            rating = "GOOD JOB!"
            color = '#f39c12'
        else:
            rating = "KEEP TRYING!"
            color = '#e74c3c'
            
        self.status_label.config(text=f"🎉 GAME OVER! Score: {self.bananas_collected} - {rating} (Press R to restart)",
                                fg=color)
        
        # Show final results popup
        messagebox.showinfo("Game Over", 
                           f"🎉 Challenge Complete! 🎉\\n\\n"
                           f"Final Score: {self.bananas_collected} bananas\\n"
                           f"Difficulty Level: {self.difficulty_level}\\n"
                           f"Performance: {rating}\\n\\n"
                           f"Press R to play again!")
        
    def run(self):
        """Start the tkinter application."""
        self.root.mainloop()

def main():
    """Launch the tkinter-based advanced platform game."""
    print("ColorLang Advanced Platform - Tkinter Edition")
    print("This version uses tkinter (built into Python) for full graphics!")
    print()
    
    try:
        game = TkinterAdvancedPlatform()
        game.run()
    except KeyboardInterrupt:
        print("Game interrupted by user.")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()