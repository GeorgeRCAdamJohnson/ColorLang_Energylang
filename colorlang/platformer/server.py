"""
Platformer Game Server
This server handles requests from the HTML interface to start, stop, and fetch the game state.
"""

from flask import Flask, jsonify, request, send_from_directory
from platformer_game import PlatformerGame
import subprocess
import json

app = Flask(__name__)

game = None

@app.route('/')
def index():
    return send_from_directory("c:\\new language\\platformer", "platformer_interface.html")

@app.route('/start-game', methods=['POST'])
def start_game():
    global game
    game = PlatformerGame()

    # Run the ColorLang VM with the kernel
    try:
        result = subprocess.run([
            'python', 'c:\\new language\\colorlang\\virtual_machine.py',
            'c:\\new language\\platformer_kernel.png'
        ], capture_output=True, text=True)

        # Debugging: Log the VM output
        print("[DEBUG] ColorLang VM Output:", result.stdout)

        # Parse the VM output and update the game state
        if result.stdout:
            try:
                vm_output = json.loads(result.stdout)
                game.shared_memory.update(vm_output)
            except json.JSONDecodeError as e:
                print("[ERROR] Failed to parse VM output:", e)

        return jsonify({"message": "Game started"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/stop-game', methods=['POST'])
def stop_game():
    global game
    game = None
    return jsonify({"message": "Game stopped"})

@app.route('/game-state', methods=['GET'])
def game_state():
    if game:
        return jsonify(game.shared_memory)
    return jsonify({"error": "Game not running"}), 400

@app.route('/run-colorlang', methods=['POST'])
def run_colorlang():
    """Run the ColorLang code and return the output."""
    try:
        result = subprocess.run(['python', 'colorlang_vm.py'], capture_output=True, text=True)
        return jsonify({"output": result.stdout})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/run-full-game', methods=['POST'])
def run_full_game():
    print("[DEBUG] /run-full-game endpoint hit")  # Log when the endpoint is accessed
    global game
    game = PlatformerGame()

    # Run the game loop
    try:
        game.run()  # Assuming the run method executes the full game loop
        print("[DEBUG] Game completed successfully")  # Log when the game completes
        return jsonify({
            "message": "Game completed",
            "final_state": game.shared_memory
        })
    except Exception as e:
        print(f"[ERROR] Exception occurred: {e}")  # Log any exceptions
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)