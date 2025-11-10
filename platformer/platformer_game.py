"""
Platformer Game Integration
This script integrates the platformer game logic with the AI commands for the monkey.
"""

from ai_commands import MonkeyAI

class PlatformerGame:
    def __init__(self):
        self.shared_memory = {
            'tilemap': [
                ['empty', 'banana', 'empty'],
                ['ground', 'ground', 'ground']
            ],
            'monkey_position': {'x': 0, 'y': 1},
            'score': 0
        }
        self.ai = MonkeyAI(self.shared_memory)

    def run(self):
        """Run the game loop with kernel-driven movement decisions."""
        max_iterations = 10  # Limit the number of iterations for testing
        iteration = 0

        while not self.is_game_over() and iteration < max_iterations:
            self.display_state()

            # Query the kernel for the next movement decision
            next_move = self.ai.query_kernel_for_movement()
            if next_move == "RIGHT":
                self.ai.move_right()
            elif next_move == "LEFT":
                self.ai.move_left()
            elif next_move == "JUMP":
                self.ai.jump()

            self.ai.collect()
            iteration += 1

        print(f"[DEBUG] Game loop completed after {iteration} iterations")

    def is_game_over(self):
        """Check if the game is over (all bananas collected)."""
        for row in self.shared_memory['tilemap']:
            if 'banana' in row:
                return False
        return True

    def display_state(self):
        """Display the current game state."""
        print("Tilemap:")
        for row in self.shared_memory['tilemap']:
            print(row)
        print(f"Monkey Position: {self.shared_memory['monkey_position']}")
        print(f"Score: {self.shared_memory['score']}")

    def update_monkey_position(self, new_x, new_y):
        """Update the monkey's position and log the movement."""
        self.shared_memory['monkey_position']['x'] = new_x
        self.shared_memory['monkey_position']['y'] = new_y
        print(f"Monkey moved to: {new_x}, {new_y}")

# Example usage
if __name__ == "__main__":
    game = PlatformerGame()
    game.run()