"""
Basic AI Commands for Monkey
This module defines the AI commands for the monkey to navigate the platformer and collect bananas.
"""

import subprocess
import json

class MonkeyAI:
    def __init__(self, shared_memory):
        self.shared_memory = shared_memory  # Reference to shared memory for tilemap and monkey state

    def move_left(self):
        """Move the monkey one tile to the left."""
        monkey_pos = self.shared_memory['monkey_position']
        new_x = max(0, monkey_pos['x'] - 1)  # Prevent moving out of bounds
        if self.shared_memory['tilemap'][monkey_pos['y']][new_x] != 'wall':
            monkey_pos['x'] = new_x

    def move_right(self):
        """Move the monkey one tile to the right."""
        monkey_pos = self.shared_memory['monkey_position']
        new_x = min(len(self.shared_memory['tilemap'][0]) - 1, monkey_pos['x'] + 1)
        if self.shared_memory['tilemap'][monkey_pos['y']][new_x] != 'wall':
            monkey_pos['x'] = new_x
            print(f"Monkey moved right to: {monkey_pos}")

    def jump(self):
        """Make the monkey jump."""
        monkey_pos = self.shared_memory['monkey_position']
        if monkey_pos['y'] > 0 and self.shared_memory['tilemap'][monkey_pos['y'] - 1][monkey_pos['x']] == 'empty':
            monkey_pos['y'] -= 1

    def collect(self):
        """Collect a banana if on the same tile."""
        monkey_pos = self.shared_memory['monkey_position']
        if self.shared_memory['tilemap'][monkey_pos['y']][monkey_pos['x']] == 'banana':
            self.shared_memory['tilemap'][monkey_pos['y']][monkey_pos['x']] = 'empty'
            self.shared_memory['score'] += 1

    def query_kernel_for_movement(self):
        """Query the ColorLang kernel for the next movement decision."""
        try:
            result = subprocess.run([
                'python', 'c:\\new language\\colorlang\\virtual_machine.py',
                'c:\\new language\\platformer_kernel.png'
            ], capture_output=True, text=True)

            if result.stdout:
                print("[DEBUG] Kernel Output:", result.stdout)  # Log the kernel output
                return json.loads(result.stdout).get('next_move')
            else:
                print("[DEBUG] Kernel produced no output")  # Log if no output is produced
        except Exception as e:
            print(f"[ERROR] Failed to query kernel: {e}")  # Log any exceptions
        return None

# Example usage
if __name__ == "__main__":
    # Mock shared memory
    shared_memory = {
        'tilemap': [
            ['empty', 'empty', 'banana'],
            ['ground', 'ground', 'ground']
        ],
        'monkey_position': {'x': 0, 'y': 1},
        'score': 0
    }

    ai = MonkeyAI(shared_memory)
    ai.move_right()
    ai.collect()
    print(shared_memory)  # Should show updated position and score