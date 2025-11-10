"""Run a procedural platformer simulation producing frame images.

Demonstrates:
- Procedural level generation
- Monkey agent cognition strip (emotion, action intent, memory recall, social cue, goal evaluation)
- Frame rendering to color grid using HSV-coded tiles

Outputs PNG frames in demos/platformer/output/ and a summary JSON.
"""
import json
import sys
from pathlib import Path

# Allow running as a script by adding this folder to sys.path
CURRENT_DIR = Path(__file__).parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from platformer_level import generate_level, find_start
from platformer_agent import Agent
from platformer_renderer import render_frame

OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

MAX_STEPS = 120


def cognition_strip(agent: Agent, sensors: dict):
    s = agent.state
    # Each tuple is (h, s, v) with h in [0,1]
    # Emotion: hue 0.02 (excitement grows with bananas)
    emotion = (0.02, min(1.0, 0.3 + 0.1 * s.bananas_collected), 0.9)
    # Action intent: moving direction RIGHT=0.55 LEFT=0.12 IDLE=0.6
    dir_h = 0.55 if sensors["dir_hint"] > 0 else 0.12
    action_intent = (dir_h, 0.9, 0.8 if s.grounded else 0.5)
    # Memory recall: nearest banana distance mapping
    nb = sensors["nearest_banana"]
    if nb:
        dist = abs(nb[0] - int(s.x)) + abs(nb[1] - int(s.y))
        mem_sat = max(0.2, min(1.0, 1.0 - dist / 25.0))
    else:
        mem_sat = 0.1
    memory = (0.33, mem_sat, 0.7)
    # Social cue: unused -> low vividness
    social = (0.5, 0.05, 0.2)
    # Goal evaluation: progress toward goal (increase value)
    goal_x, goal_y = sensors["goal"]
    progress = min(1.0, abs(int(s.x) - goal_x) / goal_x)
    goal_eval = (0.82, 0.9, 1.0 - progress * 0.8)
    return [emotion, action_intent, memory, social, goal_eval]


def main():
    grid = generate_level()
    start = find_start(grid)
    agent = Agent(grid, start)

    frames = []
    for step in range(MAX_STEPS):
        sensors = agent.sense()
        action = agent.decide_action(sensors)
        agent.step(action)
        thoughts = cognition_strip(agent, sensors)
        frame = render_frame(grid, (int(agent.state.x), int(agent.state.y)), thoughts)
        frame_path = OUTPUT_DIR / f"frame_{step:03d}.png"
        frame.save(frame_path)
        frames.append({
            "step": step,
            "x": agent.state.x,
            "y": agent.state.y,
            "bananas": agent.state.bananas_collected,
            "action": action,
        })
        # Early exit if goal reached
        gx, gy = sensors["goal"]
        if int(agent.state.x) == gx and int(agent.state.y) == gy:
            break

    summary = {
        "total_steps": len(frames),
        "bananas_collected": agent.state.bananas_collected,
        "goal_reached": int(agent.state.x) == gx and int(agent.state.y) == gy,
    }
    (OUTPUT_DIR / "summary.json").write_text(json.dumps(summary, indent=2))
    print("Platformer demo complete", summary)


if __name__ == "__main__":
    main()
