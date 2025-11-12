# AI and Pathfinding Tutorial

**Difficulty:** 🔴 Advanced  
**Duration:** 45 minutes  

## Objectives
Learn to create intelligent ColorLang agents:
- Implement pathfinding algorithms
- Use AI decision-making instructions
- Create responsive agent behaviors
- Build a simple AI game character

## Prerequisites
- Completed [Basic Instructions](basic-instructions.md)
- Understanding of [Control Flow](control-flow.md)
- Familiarity with game programming concepts

## AI Instruction Set

ColorLang provides specialized AI instructions:

| Instruction | Hue | Purpose |
|-------------|-----|---------|
| PATHFIND | 305° | Find path to target |
| MOVE | 315° | Move agent in direction |
| SENSE | 325° | Detect environment |
| DECIDE | 335° | Make AI decision |
| LEARN | 345° | Update AI knowledge |

## Basic AI Agent

Let's create a simple AI agent that moves around:

```python
# simple_agent.py
from PIL import Image
import colorsys

def create_simple_agent():
    """Create a basic AI agent program."""
    
    program = [
        # Initialize agent position
        (15, 80, 70),   # LOAD 25 into R0 (X position)
        (18, 80, 70),   # LOAD 10 into R1 (Y position)  
        (21, 80, 70),   # LOAD 0 into R2 (direction: 0=right)
        
        # Main AI loop (repeat 10 times)
        (24, 80, 70),   # LOAD 0 into R3 (counter)
        
        # Loop start (instruction 4)
        (325, 90, 80),  # SENSE environment (radius 2)
        (315, 90, 85),  # MOVE in current direction
        
        # Update position based on direction
        (27, 80, 70),   # LOAD 1 into R4 (step size)
        (25, 90, 80),   # ADD R0 = R0 + R4 (move right)
        
        # Increment counter
        (25, 90, 80),   # ADD R3 = R3 + 1
        
        # Check if counter < 10
        (30, 80, 70),   # LOAD 10 into R5
        (85, 90, 80),   # CMP R3, R5
        (125, 90, 80),  # JMP_IF_LT to instruction 4
        
        (0, 0, 0)       # HALT
    ]
    
    # Convert to image
    rgb_pixels = []
    for h, s, v in program:
        r, g, b = colorsys.hsv_to_rgb(h/360.0, s/100.0, v/100.0)
        rgb_pixels.append((int(r*255), int(g*255), int(b*255)))
    
    # Create 4x4 image
    width, height = 4, 4
    while len(rgb_pixels) < width * height:
        rgb_pixels.append((0, 0, 0))
    
    image = Image.new('RGB', (width, height))
    image.putdata(rgb_pixels)
    image.save('simple_agent.png')
    print("Created simple_agent.png")

if __name__ == "__main__":
    create_simple_agent()
```

## Pathfinding Agent

Create an agent that finds paths to targets:

```python
def create_pathfinding_agent():
    """Create an agent with pathfinding capabilities."""
    
    program = [
        # Initialize agent
        (15, 80, 70),   # LOAD 5 into R0 (start X)
        (18, 80, 70),   # LOAD 5 into R1 (start Y)
        
        # Set target location  
        (21, 80, 70),   # LOAD 40 into R2 (target X)
        (24, 80, 70),   # LOAD 15 into R3 (target Y)
        
        # Main pathfinding loop
        # Pathfind to target
        (305, 90, 85),  # PATHFIND R2, R3 (to target)
        
        # Check if we reached target
        (85, 90, 80),   # CMP R0, R2 (compare X positions)
        (128, 90, 80),  # JMP_IF_EQ to next check
        
        # If not at target, continue pathfinding
        (125, 90, 80),  # JMP back to pathfind loop
        
        # Check Y position
        (85, 90, 80),   # CMP R1, R3 (compare Y positions)  
        (131, 90, 80),  # JMP_IF_EQ to success
        
        # Continue if Y doesn't match
        (125, 90, 80),  # JMP back to pathfind loop
        
        # Success - reached target
        (195, 90, 85),  # PRINT "Target reached!"
        (0, 0, 0)       # HALT
    ]
    
    return program
```

## Smart Agent with Environment Sensing

```python
def create_smart_agent():
    """Create an intelligent agent that reacts to environment."""
    
    program = [
        # Initialize smart agent
        (15, 80, 70),   # LOAD 25 into R0 (X position)
        (18, 80, 70),   # LOAD 10 into R1 (Y position)
        (21, 80, 70),   # LOAD 100 into R2 (health)
        (24, 80, 70),   # LOAD 0 into R3 (score)
        
        # Main AI decision loop
        # Sense environment
        (325, 90, 80),  # SENSE radius 3
        
        # Make AI decision based on sensed data
        (335, 85, 75),  # DECIDE with context 1
        
        # Check for bananas nearby (hypothetical)
        (27, 80, 70),   # LOAD 2 into R4 (banana tile type)
        (85, 90, 80),   # CMP sensed tile with banana
        (135, 90, 80),  # JMP_IF_EQ to banana collection
        
        # Check for hazards
        (30, 80, 70),   # LOAD 3 into R5 (hazard tile type)  
        (85, 90, 80),   # CMP sensed tile with hazard
        (140, 90, 80),  # JMP_IF_EQ to hazard avoidance
        
        # Default: explore
        (315, 90, 85),  # MOVE in current direction
        (125, 90, 80),  # JMP back to main loop
        
        # Banana collection (instruction ~13)
        (305, 90, 85),  # PATHFIND to banana location
        (25, 90, 80),   # ADD R3 = R3 + 1 (increment score)
        (125, 90, 80),  # JMP back to main loop
        
        # Hazard avoidance (instruction ~16)
        (45, 90, 80),   # SUB R2 = R2 - 10 (lose health)
        (315, 90, 85),  # MOVE away from hazard
        (125, 90, 80),  # JMP back to main loop
        
        (0, 0, 0)       # HALT
    ]
    
    return program
```

## Learning Agent

Create an agent that improves over time:

```python
def create_learning_agent():
    """Create an agent that learns from experience."""
    
    program = [
        # Initialize learning agent
        (15, 80, 70),   # LOAD 25 into R0 (X)
        (18, 80, 70),   # LOAD 10 into R1 (Y)
        (21, 80, 70),   # LOAD 0 into R2 (experience points)
        
        # Learning loop
        # Try an action
        (315, 90, 85),  # MOVE randomly
        
        # Evaluate result
        (24, 80, 70),   # LOAD reward into R3
        (335, 85, 75),  # DECIDE based on reward
        
        # Learn from experience
        (345, 85, 75),  # LEARN from result
        
        # Update experience
        (25, 90, 80),   # ADD R2 = R2 + reward
        
        # Check if learned enough
        (27, 80, 70),   # LOAD 100 into R4 (learning threshold)
        (85, 90, 80),   # CMP R2, R4
        (125, 90, 80),  # JMP_IF_LT back to learning loop
        
        # Graduation - agent is now smart
        (195, 90, 85),  # PRINT "Learning complete!"
        (0, 0, 0)       # HALT
    ]
    
    return program
```

## Complete Game Agent

Let's build a complete game character:

```python
def create_game_character():
    """Create a complete AI game character."""
    
    program = [
        # === INITIALIZATION ===
        (15, 80, 70),   # R0: X position = 25
        (18, 80, 70),   # R1: Y position = 10  
        (21, 80, 70),   # R2: Health = 100
        (24, 80, 70),   # R3: Score = 0
        (27, 80, 70),   # R4: Direction = 0 (right)
        (30, 80, 70),   # R5: State = 0 (exploring)
        
        # === MAIN GAME LOOP ===
        # Sense environment (instruction 6)
        (325, 90, 80),  # SENSE radius 2
        
        # Make decision based on current state
        (335, 85, 75),  # DECIDE with current state
        
        # State machine: check current state
        # State 0: Exploring
        (85, 90, 80),   # CMP R5, 0
        (145, 90, 80),  # JMP_IF_EQ to exploring behavior
        
        # State 1: Collecting
        (33, 80, 70),   # LOAD 1 into R6
        (85, 90, 80),   # CMP R5, R6  
        (150, 90, 80),  # JMP_IF_EQ to collecting behavior
        
        # State 2: Avoiding danger
        (36, 80, 70),   # LOAD 2 into R7
        (85, 90, 80),   # CMP R5, R7
        (155, 90, 80),  # JMP_IF_EQ to danger avoidance
        
        # === BEHAVIOR IMPLEMENTATIONS ===
        
        # Exploring behavior (instruction ~17)
        (315, 90, 85),  # MOVE in current direction
        
        # Check boundaries and change direction
        (39, 80, 70),   # LOAD 45 into R8 (boundary)
        (85, 90, 80),   # CMP R0, R8
        (160, 90, 80),  # JMP_IF_GT to turn around
        
        (125, 90, 80),  # JMP back to main loop
        
        # Collecting behavior (instruction ~22)  
        (305, 90, 85),  # PATHFIND to collectible
        (25, 90, 80),   # ADD R3 = R3 + 10 (add score)
        
        # Switch back to exploring
        (42, 80, 70),   # LOAD 0 into R9
        (15, 80, 70),   # STORE R9 to R5 (change state)
        (125, 90, 80),  # JMP back to main loop
        
        # Danger avoidance (instruction ~28)
        (45, 90, 80),   # SUB R2 = R2 - 5 (lose health)
        
        # Move away from danger
        (48, 80, 70),   # LOAD 1 into R10 (opposite direction)
        (25, 90, 80),   # ADD R4 = R4 + R10 (turn around)
        (315, 90, 85),  # MOVE in new direction
        
        # Switch back to exploring
        (51, 80, 70),   # LOAD 0 into R11
        (15, 80, 70),   # STORE R11 to R5 (change state)
        (125, 90, 80),  # JMP back to main loop
        
        # Turn around routine (instruction ~36)
        (54, 80, 70),   # LOAD 1 into R12
        (25, 90, 80),   # ADD R4 = R4 + R12 (turn)
        (125, 90, 80),  # JMP back to main loop
        
        # === LEARNING UPDATE ===
        (345, 85, 75),  # LEARN from current experience
        
        (0, 0, 0)       # HALT
    ]
    
    # Create larger image for complex program
    rgb_pixels = []
    for h, s, v in program:
        r, g, b = colorsys.hsv_to_rgb(h/360.0, s/100.0, v/100.0)
        rgb_pixels.append((int(r*255), int(g*255), int(b*255)))
    
    # 8x6 image to fit all instructions
    width, height = 8, 6
    while len(rgb_pixels) < width * height:
        rgb_pixels.append((0, 0, 0))
    
    image = Image.new('RGB', (width, height))
    image.putdata(rgb_pixels)
    image.save('game_character.png')
    print(f"Created game_character.png ({width}x{height})")

if __name__ == "__main__":
    create_game_character()
```

## Testing AI Agents

Create a test runner for AI programs:

```python
# test_ai_agents.py
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from colorlang.color_parser import ColorParser
from colorlang.virtual_machine import ColorVM

class AITester:
    """Test AI ColorLang programs."""
    
    def __init__(self):
        self.parser = ColorParser()
    
    def test_agent(self, filename, max_instructions=100):
        """Test an AI agent program."""
        
        print(f"\\n=== Testing {filename} ===")
        
        # Create VM with shared memory for AI
        vm = ColorVM()
        
        # Set up mock environment
        vm.setup_mock_environment()
        
        try:
            program = self.parser.parse_image(filename)
            print(f"Loaded {len(program)} instructions")
            
            # Run with instruction limit to prevent infinite loops
            result = vm.run_program(program, max_instructions=max_instructions)
            
            print(f"Execution completed successfully")
            print(f"Instructions executed: {result.get('instructions_executed', 0)}")
            
            # Display AI metrics if available
            if hasattr(vm, 'shared_memory'):
                self.display_ai_metrics(vm.shared_memory)
                
        except Exception as e:
            print(f"Error testing {filename}: {e}")
    
    def display_ai_metrics(self, shared_memory):
        """Display AI performance metrics."""
        
        if hasattr(shared_memory, 'agent'):
            agent = shared_memory.agent
            print(f"Agent final position: ({agent.x}, {agent.y})")
            print(f"Agent health: {agent.health}")
            print(f"Agent score: {agent.score}")
        
        if hasattr(shared_memory, 'cognition'):
            cog = shared_memory.cognition
            print(f"Final emotion: {cog.emotion:.2f}")
            print(f"Action intent: {cog.action_intent:.2f}")

def main():
    """Test all AI agent programs."""
    
    tester = AITester()
    
    agents = [
        'simple_agent.png',
        'game_character.png'
    ]
    
    for agent in agents:
        if os.path.exists(agent):
            tester.test_agent(agent)
        else:
            print(f"Agent program not found: {agent}")

if __name__ == "__main__":
    main()
```

## Exercises

### Exercise 1: Patrol Agent
Create an agent that patrols between two points, moving back and forth continuously.

### Exercise 2: Collector Agent  
Build an agent that seeks out and collects items, keeping track of its score.

### Exercise 3: Adaptive Agent
Create an agent that changes behavior based on its health level (aggressive when healthy, cautious when injured).

## Common AI Programming Patterns

1. **State Machines** - Use registers to track agent state
2. **Sensor Fusion** - Combine multiple SENSE operations  
3. **Goal Hierarchies** - Prioritize different objectives
4. **Learning Loops** - Update behavior based on outcomes

## Performance Tips

- Use SENSE sparingly (computationally expensive)
- Cache pathfinding results when possible
- Limit AI decision frequency for better performance
- Use simple heuristics before complex AI operations

## Next Steps

- [Shared Memory Tutorial](shared-memory.md) - Advanced agent communication
- [Performance Optimization](performance-optimization.md) - Making AI faster
- [Real-time Systems](realtime-systems.md) - Responsive AI systems

## Summary

You've learned advanced AI programming in ColorLang:
✅ Basic agent movement and sensing  
✅ Pathfinding algorithms  
✅ Decision-making systems  
✅ Learning and adaptation  
✅ Complete game character implementation  

Your AI agents can now navigate, make decisions, and learn from their environment!