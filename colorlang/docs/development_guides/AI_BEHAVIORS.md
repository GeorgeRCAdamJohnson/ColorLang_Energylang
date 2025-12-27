# ColorLang AI/Agent Behavior Guide

## Overview
ColorLang's AI behavior system enables sophisticated agent cognition through color-encoded decision-making processes. This guide documents the complete AI architecture, from basic pathfinding to complex cognitive modeling, based on the successful monkey platformer implementation.

## AI Architecture Overview

### Cognitive Framework
```python
ColorLang AI System Architecture:
  
  Cognition Strip (5-pixel wide, top of frame)
  ├── Emotion State (pixel 0)
  ├── Action Intent (pixel 1)  
  ├── Memory Recall (pixel 2)
  ├── Social Cue Processing (pixel 3)
  └── Goal Evaluation (pixel 4)
  
  Behavioral Engine
  ├── Pathfinding System (PATHFIND instruction)
  ├── Movement Control (MOVE instruction)
  ├── Decision Trees (IF/WHILE loops)
  └── Learning Mechanisms (memory updates)
  
  Environment Interface
  ├── Tilemap Perception (shared memory)
  ├── Object Detection (banana/goal recognition)
  ├── Hazard Avoidance (collision detection)
  └── Spatial Reasoning (coordinate navigation)
```

### Agent State Model
```python
Agent State Structure (Shared Memory):
  agent: {
    x: Float (0.0-49.0),          # World X coordinate
    y: Float (0.0-19.0),          # World Y coordinate  
    direction: Integer (0=right, 1=left),
    health: Integer (0-100),       # Agent health/energy
    score: Integer,                # Bananas collected
    velocity_x: Float,             # Movement velocity
    velocity_y: Float,             # Jump/fall velocity
    grounded: Boolean,             # On solid surface
    last_action: Integer,          # Previous action taken
    exploration_bias: Float        # Exploration vs exploitation
  }
  
  cognition: {
    emotion: Float (0.0-1.0),      # Emotional state
    action_intent: Float (0.0-1.0), # Action confidence
    memory_recall: Float (0.0-1.0), # Memory activation
    social_cue: Float (0.0-1.0),   # Social awareness
    goal_evaluation: Float (0.0-1.0) # Goal progress assessment
  }
```

## Cognition Strip Implementation

### Cognitive State Encoding
The cognition strip uses HSV color encoding to represent internal mental states:

```python
def encode_cognition_strip(agent_state, cognition_state):
    """Encode cognitive state into 5-pixel strip."""
    
    strip = []
    
    # Pixel 0: Emotion (Hue represents emotion type, Saturation intensity)
    emotion_hue = int(cognition_state.emotion * 240)  # 0°-240° range
    emotion_sat = min(100, int(abs(cognition_state.emotion - 0.5) * 200))
    emotion_val = 80 + int(cognition_state.emotion * 20)  # 80-100% brightness
    strip.append((emotion_hue, emotion_sat, emotion_val))
    
    # Pixel 1: Action Intent (Green spectrum for positive intent)
    intent_hue = 120  # Green base
    intent_sat = int(cognition_state.action_intent * 100)
    intent_val = 50 + int(cognition_state.action_intent * 50)
    strip.append((intent_hue, intent_sat, intent_val))
    
    # Pixel 2: Memory Recall (Blue spectrum, intensity shows activation)
    memory_hue = 240  # Blue base
    memory_sat = int(cognition_state.memory_recall * 100)
    memory_val = 30 + int(cognition_state.memory_recall * 70)
    strip.append((memory_hue, memory_sat, memory_val))
    
    # Pixel 3: Social Cue (Purple spectrum for social awareness)
    social_hue = 280  # Purple base
    social_sat = int(cognition_state.social_cue * 100)  
    social_val = 40 + int(cognition_state.social_cue * 60)
    strip.append((social_hue, social_sat, social_val))
    
    # Pixel 4: Goal Evaluation (Red-Orange spectrum for goal progress)
    goal_hue = int(20 + cognition_state.goal_evaluation * 40)  # 20°-60° range
    goal_sat = 90
    goal_val = 60 + int(cognition_state.goal_evaluation * 40)
    strip.append((goal_hue, goal_sat, goal_val))
    
    return strip

def decode_cognition_strip(strip_pixels):
    """Decode cognition strip back to cognitive state."""
    
    if len(strip_pixels) < 5:
        return default_cognition_state()
    
    cognition = SimpleNamespace()
    
    # Decode emotion from pixel 0
    emotion_pixel = strip_pixels[0]
    cognition.emotion = emotion_pixel[0] / 240.0  # Normalize hue to 0-1
    
    # Decode action intent from pixel 1  
    intent_pixel = strip_pixels[1]
    cognition.action_intent = intent_pixel[1] / 100.0  # Use saturation
    
    # Decode memory recall from pixel 2
    memory_pixel = strip_pixels[2]
    cognition.memory_recall = (memory_pixel[2] - 30) / 70.0  # Use brightness
    
    # Decode social cue from pixel 3
    social_pixel = strip_pixels[3]
    cognition.social_cue = social_pixel[1] / 100.0
    
    # Decode goal evaluation from pixel 4
    goal_pixel = strip_pixels[4]
    cognition.goal_evaluation = (goal_pixel[0] - 20) / 40.0
    
    return cognition
```

### Cognitive Update Mechanisms
```python
def update_cognitive_state(agent, environment, previous_cognition):
    """Update agent cognitive state based on environment and internal state."""
    
    new_cognition = SimpleNamespace()
    
    # Update emotion based on recent events
    new_cognition.emotion = calculate_emotional_response(agent, environment)
    
    # Update action intent based on goal proximity and obstacles
    new_cognition.action_intent = calculate_action_confidence(agent, environment)
    
    # Update memory recall based on pattern recognition
    new_cognition.memory_recall = activate_relevant_memories(agent, environment)
    
    # Update social cues (future: multi-agent interactions)  
    new_cognition.social_cue = process_social_environment(environment)
    
    # Update goal evaluation based on progress
    new_cognition.goal_evaluation = evaluate_goal_progress(agent, environment)
    
    # Apply temporal smoothing to prevent cognitive oscillation
    smoothed_cognition = apply_cognitive_smoothing(new_cognition, previous_cognition)
    
    return smoothed_cognition

def calculate_emotional_response(agent, environment):
    """Calculate emotional state based on agent's situation."""
    
    base_emotion = 0.5  # Neutral baseline
    
    # Positive emotional factors
    if agent.score > 0:
        base_emotion += 0.1 * min(agent.score, 5)  # Joy from collecting bananas
    
    if agent.health > 80:
        base_emotion += 0.1  # Confidence from good health
    
    # Negative emotional factors
    if agent.health < 30:
        base_emotion -= 0.2  # Fear/stress from low health
    
    # Check for nearby hazards
    hazard_nearby = detect_nearby_hazards(agent, environment)
    if hazard_nearby:
        base_emotion -= 0.15  # Anxiety from danger
    
    # Check for goal proximity
    goal_distance = calculate_goal_distance(agent, environment)
    if goal_distance < 5.0:
        base_emotion += 0.15  # Excitement near goal
    
    return max(0.0, min(1.0, base_emotion))  # Clamp to valid range
```

## Pathfinding System

### Advanced Pathfinding Algorithm
```python
class ColorLangPathfinder:
    """Advanced pathfinding system for ColorLang agents."""
    
    def __init__(self, tilemap_width=50, tilemap_height=20):
        self.width = tilemap_width
        self.height = tilemap_height
        self.path_cache = {}
        self.exploration_map = np.zeros((tilemap_width, tilemap_height))
        
    def find_path_to_target(self, agent_pos, target_pos, tilemap, target_type='BANANA'):
        """Find optimal path from agent to target using A* algorithm."""
        
        start = (int(agent_pos.x), int(agent_pos.y))
        goal = (int(target_pos[0]), int(target_pos[1]))
        
        # Check cache first
        cache_key = (start, goal, target_type)
        if cache_key in self.path_cache:
            return self.path_cache[cache_key]
        
        # A* pathfinding implementation
        path = self._astar_pathfind(start, goal, tilemap, target_type)
        
        # Cache result for future use
        self.path_cache[cache_key] = path
        
        return path
    
    def _astar_pathfind(self, start, goal, tilemap, target_type):
        """A* pathfinding algorithm adapted for ColorLang environments."""
        
        from heapq import heappush, heappop
        
        # Priority queue: (f_score, g_score, position, path)
        open_set = [(0, 0, start, [start])]
        closed_set = set()
        
        # Cost map for different tile types
        tile_costs = {
            0: 1.0,   # EMPTY - normal cost
            1: 10.0,  # GROUND - can't walk through
            2: 0.5,   # BANANA - attractive (low cost)
            3: 100.0, # HAZARD - dangerous (high cost)  
            4: 0.8    # GOAL - slightly attractive
        }
        
        while open_set:
            f_score, g_score, current, path = heappop(open_set)
            
            if current in closed_set:
                continue
            
            closed_set.add(current)
            
            # Check if we reached the goal
            if current == goal:
                return path
            
            # Explore neighbors
            for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0), (1, 1), (1, -1), (-1, 1), (-1, -1)]:
                neighbor = (current[0] + dx, current[1] + dy)
                
                # Check bounds
                if not (0 <= neighbor[0] < self.width and 0 <= neighbor[1] < self.height):
                    continue
                
                if neighbor in closed_set:
                    continue
                
                # Calculate movement cost
                tile_type = tilemap[neighbor[0]][neighbor[1]]
                move_cost = tile_costs.get(tile_type, 1.0)
                
                # Add diagonal movement penalty
                if abs(dx) + abs(dy) == 2:
                    move_cost *= 1.414  # sqrt(2) for diagonal
                
                # Add exploration bonus (encourage exploring new areas)
                exploration_bonus = 1.0 / (1.0 + self.exploration_map[neighbor[0]][neighbor[1]])
                move_cost *= exploration_bonus
                
                new_g_score = g_score + move_cost
                
                # Heuristic: Manhattan distance to goal with tile type consideration
                h_score = abs(neighbor[0] - goal[0]) + abs(neighbor[1] - goal[1])
                
                # Bonus heuristic for target type
                if target_type == 'BANANA':
                    # Prefer paths that go through or near other bananas
                    banana_bonus = self._calculate_banana_proximity_bonus(neighbor, tilemap)
                    h_score -= banana_bonus
                
                f_score = new_g_score + h_score
                
                new_path = path + [neighbor]
                heappush(open_set, (f_score, new_g_score, neighbor, new_path))
        
        # No path found - return direct movement towards goal
        return self._generate_direct_path(start, goal)
    
    def _calculate_banana_proximity_bonus(self, position, tilemap):
        """Calculate bonus for positions near bananas."""
        
        bonus = 0.0
        search_radius = 3
        
        for dx in range(-search_radius, search_radius + 1):
            for dy in range(-search_radius, search_radius + 1):
                check_x = position[0] + dx
                check_y = position[1] + dy
                
                if (0 <= check_x < self.width and 0 <= check_y < self.height):
                    if tilemap[check_x][check_y] == 2:  # BANANA
                        distance = abs(dx) + abs(dy)
                        bonus += 2.0 / (1.0 + distance)
        
        return bonus
    
    def update_exploration_map(self, agent_position):
        """Update exploration map with agent's current position."""
        
        x, y = int(agent_position.x), int(agent_position.y)
        if 0 <= x < self.width and 0 <= y < self.height:
            self.exploration_map[x][y] += 1
    
    def get_next_move_direction(self, agent_pos, path):
        """Convert path to next movement direction."""
        
        if len(path) < 2:
            return None
        
        current = (int(agent_pos.x), int(agent_pos.y))
        next_pos = path[1] if path[0] == current else path[0]
        
        dx = next_pos[0] - current[0]  
        dy = next_pos[1] - current[1]
        
        # Convert to direction code
        if dx > 0:
            return 0  # Right
        elif dx < 0:
            return 1  # Left  
        elif dy > 0:
            return 3  # Down
        elif dy < 0:
            return 2  # Up
        else:
            return None  # No movement needed
```

### Pathfinding Integration with ColorLang VM

```python
def _execute_pathfind(self, target_x: int, target_y: int) -> bool:
    """PATHFIND: AI pathfinding operation integrated with VM."""
    
    if not self.shared_memory:
        # Fallback: simple movement towards target
        current_x = self.registers[0]
        current_y = self.registers[1]
        
        if target_x > current_x:
            self.registers[0] += 1
        elif target_x < current_x:
            self.registers[0] -= 1
        elif target_y > current_y:
            self.registers[1] += 1
        elif target_y < current_y:
            self.registers[1] -= 1
        
        self.pc += 1
        return True
    
    # Advanced pathfinding with environment awareness
    agent_pos = SimpleNamespace()
    agent_pos.x = float(self.registers[0])
    agent_pos.y = float(self.registers[1])
    
    # Get pathfinder instance (create if not exists)
    if not hasattr(self, 'pathfinder'):
        self.pathfinder = ColorLangPathfinder()
    
    # Find path to target
    path = self.pathfinder.find_path_to_target(
        agent_pos, 
        (target_x, target_y), 
        self.shared_memory.tilemap,
        target_type='BANANA' if self._is_banana_at(target_x, target_y) else 'GOAL'
    )
    
    # Execute next move from path
    direction = self.pathfinder.get_next_move_direction(agent_pos, path)
    
    if direction is not None:
        # Update agent position based on pathfinding decision
        if direction == 0:  # Right
            self.registers[0] = min(49, self.registers[0] + 1)
        elif direction == 1:  # Left
            self.registers[0] = max(0, self.registers[0] - 1)
        elif direction == 2:  # Up  
            self.registers[1] = max(0, self.registers[1] - 1)
        elif direction == 3:  # Down
            self.registers[1] = min(19, self.registers[1] + 1)
        
        # Update shared memory
        self.shared_memory.agent.x = float(self.registers[0])
        self.shared_memory.agent.y = float(self.registers[1])
        self.shared_memory.agent.direction = direction
        
        # Update exploration map
        self.pathfinder.update_exploration_map(self.shared_memory.agent)
        
        # Update cognitive state based on pathfinding decision
        self._update_cognition_from_pathfinding(direction, path)
    
    self.pc += 1
    return True

def _is_banana_at(self, x: int, y: int) -> bool:
    """Check if there's a banana at the specified coordinates."""
    
    if not self.shared_memory or not hasattr(self.shared_memory, 'tilemap'):
        return False
    
    if 0 <= x < 50 and 0 <= y < 20:
        return self.shared_memory.tilemap[x][y] == 2  # BANANA tile type
    
    return False

def _update_cognition_from_pathfinding(self, direction: int, path: List[Tuple[int, int]]):
    """Update cognitive state based on pathfinding decisions."""
    
    if not hasattr(self.shared_memory, 'cognition'):
        return
    
    # Action intent increases with clear path
    path_clarity = min(1.0, len(path) / 10.0)
    self.shared_memory.cognition.action_intent = path_clarity
    
    # Memory recall increases when following complex paths
    path_complexity = len(path) / 20.0
    self.shared_memory.cognition.memory_recall = min(1.0, path_complexity)
    
    # Goal evaluation based on path efficiency
    if len(path) > 0:
        direct_distance = abs(path[-1][0] - path[0][0]) + abs(path[-1][1] - path[0][1])
        path_efficiency = direct_distance / max(1, len(path))
        self.shared_memory.cognition.goal_evaluation = path_efficiency
```

## Behavioral Decision Trees

### Decision Tree Architecture
```python
class ColorLangBehaviorTree:
    """Behavior tree system for complex AI decision making."""
    
    def __init__(self):
        self.root_node = None
        self.blackboard = {}  # Shared state between nodes
        self.execution_history = []
        
    def create_monkey_behavior_tree(self):
        """Create behavior tree for monkey agent."""
        
        # Root selector node
        root = SelectorNode("MonkeyBehavior")
        
        # High priority: Hazard avoidance
        hazard_sequence = SequenceNode("HazardAvoidance")
        hazard_sequence.add_child(ConditionNode("NearHazard", self.check_hazard_proximity))
        hazard_sequence.add_child(ActionNode("AvoidHazard", self.avoid_hazard_action))
        root.add_child(hazard_sequence)
        
        # Medium priority: Banana collection
        banana_sequence = SequenceNode("BananaCollection") 
        banana_sequence.add_child(ConditionNode("BananaVisible", self.check_banana_visibility))
        banana_sequence.add_child(ActionNode("MoveToBanana", self.move_to_banana_action))
        root.add_child(banana_sequence)
        
        # Low priority: Goal seeking
        goal_sequence = SequenceNode("GoalSeeking")
        goal_sequence.add_child(ConditionNode("GoalAccessible", self.check_goal_accessibility))  
        goal_sequence.add_child(ActionNode("MoveToGoal", self.move_to_goal_action))
        root.add_child(goal_sequence)
        
        # Fallback: Exploration
        exploration_action = ActionNode("Explore", self.exploration_action)
        root.add_child(exploration_action)
        
        self.root_node = root
        return root
    
    def execute_behavior_tree(self, agent, environment):
        """Execute behavior tree and return recommended action."""
        
        # Update blackboard with current state
        self.blackboard.update({
            'agent': agent,
            'environment': environment,
            'tilemap': environment.tilemap,
            'timestamp': time.time()
        })
        
        # Execute tree from root
        result = self.root_node.execute(self.blackboard)
        
        # Record execution history
        self.execution_history.append({
            'timestamp': time.time(),
            'result': result,
            'agent_pos': (agent.x, agent.y),
            'action_taken': self.blackboard.get('last_action', 'NONE')
        })
        
        return result
    
    def check_hazard_proximity(self, blackboard):
        """Check if agent is near a hazard."""
        
        agent = blackboard['agent']
        tilemap = blackboard['tilemap']
        
        # Check 3x3 area around agent
        for dx in range(-1, 2):
            for dy in range(-1, 2):
                check_x = int(agent.x) + dx
                check_y = int(agent.y) + dy
                
                if (0 <= check_x < 50 and 0 <= check_y < 20):
                    if tilemap[check_x][check_y] == 3:  # HAZARD
                        blackboard['hazard_pos'] = (check_x, check_y)
                        return True
        
        return False
    
    def avoid_hazard_action(self, blackboard):
        """Action to avoid nearby hazards."""
        
        agent = blackboard['agent']
        hazard_pos = blackboard.get('hazard_pos', (agent.x, agent.y))
        
        # Move away from hazard
        dx = agent.x - hazard_pos[0]
        dy = agent.y - hazard_pos[1]
        
        # Choose direction that moves away from hazard
        if abs(dx) > abs(dy):
            direction = 0 if dx > 0 else 1  # Right or Left
        else:
            direction = 2 if dy < 0 else 3  # Up or Down
        
        blackboard['last_action'] = f'AVOID_HAZARD_{direction}'
        blackboard['recommended_direction'] = direction
        
        return 'SUCCESS'
```

## Learning and Adaptation

### Experience-Based Learning
```python
class ColorLangLearningSystem:
    """Learning system that adapts agent behavior over time."""
    
    def __init__(self):
        self.experience_buffer = []
        self.action_values = {}  # Q-learning style action values
        self.learning_rate = 0.1
        self.exploration_rate = 0.3
        self.reward_history = []
        
    def record_experience(self, state, action, reward, next_state):
        """Record an experience tuple for learning."""
        
        experience = {
            'state': self.encode_state(state),
            'action': action,
            'reward': reward,
            'next_state': self.encode_state(next_state),
            'timestamp': time.time()
        }
        
        self.experience_buffer.append(experience)
        
        # Limit buffer size
        if len(self.experience_buffer) > 10000:
            self.experience_buffer.pop(0)
        
        # Update action values
        self.update_action_values(experience)
    
    def encode_state(self, agent_state):
        """Encode agent state into learnable representation."""
        
        # Discretize position
        grid_x = int(agent_state.x / 5) * 5  # 5x5 grid cells
        grid_y = int(agent_state.y / 5) * 5
        
        # Encode nearby environment
        local_env = self.get_local_environment(agent_state, radius=2)
        
        # Create state tuple
        state_tuple = (
            grid_x, grid_y,
            agent_state.health // 20,  # Health in 20-point buckets
            agent_state.score,
            tuple(local_env.flatten())  # Flatten environment
        )
        
        return state_tuple
    
    def update_action_values(self, experience):
        """Update action values using temporal difference learning."""
        
        state = experience['state']
        action = experience['action']  
        reward = experience['reward']
        next_state = experience['next_state']
        
        # Initialize action value if not exists
        if (state, action) not in self.action_values:
            self.action_values[(state, action)] = 0.0
        
        # Find best next action value
        next_action_values = []
        for next_action in range(4):  # 4 possible directions
            if (next_state, next_action) in self.action_values:
                next_action_values.append(self.action_values[(next_state, next_action)])
        
        best_next_value = max(next_action_values) if next_action_values else 0.0
        
        # Temporal difference update
        current_value = self.action_values[(state, action)]
        target_value = reward + 0.9 * best_next_value  # 0.9 discount factor
        
        self.action_values[(state, action)] += self.learning_rate * (target_value - current_value)
    
    def choose_action(self, agent_state):
        """Choose action using learned values with exploration."""
        
        state = self.encode_state(agent_state)
        
        # Epsilon-greedy action selection
        if random.random() < self.exploration_rate:
            # Explore: choose random action
            return random.randint(0, 3)
        else:
            # Exploit: choose best known action
            best_action = 0
            best_value = float('-inf')
            
            for action in range(4):
                if (state, action) in self.action_values:
                    value = self.action_values[(state, action)]
                    if value > best_value:
                        best_value = value
                        best_action = action
            
            return best_action
    
    def calculate_reward(self, prev_state, current_state, environment):
        """Calculate reward for state transition."""
        
        reward = 0.0
        
        # Reward for collecting bananas
        if current_state.score > prev_state.score:
            reward += 10.0 * (current_state.score - prev_state.score)
        
        # Penalty for health loss
        if current_state.health < prev_state.health:
            reward -= 2.0 * (prev_state.health - current_state.health)
        
        # Small reward for movement (encourages exploration)
        if (current_state.x != prev_state.x) or (current_state.y != prev_state.y):
            reward += 0.1
        
        # Large reward for reaching goal
        if self.is_at_goal(current_state, environment):
            reward += 100.0
        
        # Penalty for hitting hazards
        if self.is_at_hazard(current_state, environment):
            reward -= 20.0
        
        return reward
```

## ColorLang AI Instructions

### AI-Specific Instruction Set
```python
AI_INSTRUCTIONS = {
    'PATHFIND': {
        'hue': 305,
        'description': 'Execute pathfinding to target coordinates',
        'operands': ['target_x', 'target_y'],
        'effects': ['Updates agent position', 'Modifies cognition state']
    },
    
    'MOVE': {
        'hue': 315, 
        'description': 'Move agent in specified direction',
        'operands': ['direction'],  # 0=right, 1=left, 2=up, 3=down
        'effects': ['Updates agent coordinates', 'Updates exploration map']
    },
    
    'SENSE': {
        'hue': 325,
        'description': 'Sense environment and update cognitive state',
        'operands': ['sense_radius'],
        'effects': ['Updates cognition based on sensed environment']
    },
    
    'DECIDE': {
        'hue': 335,
        'description': 'Make behavioral decision based on current state',
        'operands': ['decision_context'],
        'effects': ['Updates action intent and goal evaluation']
    },
    
    'LEARN': {
        'hue': 345,
        'description': 'Update learning system with experience',
        'operands': ['experience_type', 'reward_value'],
        'effects': ['Modifies action values and behavior patterns']
    }
}

def _execute_sense(self, sense_radius: int) -> bool:
    """SENSE: Update cognitive state based on environment sensing."""
    
    if not self.shared_memory:
        self.pc += 1
        return True
    
    agent = self.shared_memory.agent
    tilemap = self.shared_memory.tilemap
    
    # Sense environment in radius
    sensed_objects = {
        'bananas': [],
        'hazards': [],
        'goals': [],
        'empty_spaces': 0
    }
    
    for dx in range(-sense_radius, sense_radius + 1):
        for dy in range(-sense_radius, sense_radius + 1):
            x = int(agent.x) + dx
            y = int(agent.y) + dy
            
            if 0 <= x < 50 and 0 <= y < 20:
                tile_type = tilemap[x][y]
                distance = abs(dx) + abs(dy)
                
                if tile_type == 2:  # BANANA
                    sensed_objects['bananas'].append((x, y, distance))
                elif tile_type == 3:  # HAZARD
                    sensed_objects['hazards'].append((x, y, distance))
                elif tile_type == 4:  # GOAL
                    sensed_objects['goals'].append((x, y, distance))
                elif tile_type == 0:  # EMPTY
                    sensed_objects['empty_spaces'] += 1
    
    # Update cognition based on sensed objects
    cognition = self.shared_memory.cognition
    
    # Emotion: positive if bananas nearby, negative if hazards nearby
    if sensed_objects['bananas']:
        closest_banana_distance = min(b[2] for b in sensed_objects['bananas'])
        cognition.emotion = min(1.0, cognition.emotion + 0.2 / (1 + closest_banana_distance))
    
    if sensed_objects['hazards']:
        closest_hazard_distance = min(h[2] for h in sensed_objects['hazards'])
        cognition.emotion = max(0.0, cognition.emotion - 0.3 / (1 + closest_hazard_distance))
    
    # Action intent: high if clear path to targets
    if sensed_objects['bananas'] or sensed_objects['goals']:
        cognition.action_intent = min(1.0, len(sensed_objects['bananas']) * 0.3)
    
    # Memory recall: increases with complex environments
    environment_complexity = len(sensed_objects['bananas']) + len(sensed_objects['hazards'])
    cognition.memory_recall = min(1.0, environment_complexity * 0.2)
    
    self.pc += 1
    return True
```

## Performance Metrics and Evaluation

### AI Performance Tracking
```python
class AIPerformanceTracker:
    """Track and analyze AI agent performance metrics."""
    
    def __init__(self):
        self.metrics = {
            'decisions_per_second': [],
            'goal_completion_time': [],
            'banana_collection_efficiency': [],
            'hazard_avoidance_rate': [],
            'exploration_coverage': [],
            'learning_convergence': []
        }
        
        self.session_start = time.time()
        self.total_decisions = 0
        self.successful_goals = 0
        self.total_attempts = 0
    
    def record_decision_cycle(self, decision_time, agent_state, environment):
        """Record metrics from a single decision cycle."""
        
        self.total_decisions += 1
        
        # Calculate decisions per second
        elapsed = time.time() - self.session_start
        dps = self.total_decisions / elapsed if elapsed > 0 else 0
        self.metrics['decisions_per_second'].append(dps)
        
        # Record exploration coverage
        coverage = self.calculate_exploration_coverage(agent_state, environment)
        self.metrics['exploration_coverage'].append(coverage)
        
        # Record hazard avoidance
        hazard_avoided = self.check_hazard_avoidance(agent_state, environment)
        self.metrics['hazard_avoidance_rate'].append(1.0 if hazard_avoided else 0.0)
    
    def record_goal_completion(self, completion_time, bananas_collected):
        """Record successful goal completion metrics."""
        
        self.successful_goals += 1
        self.metrics['goal_completion_time'].append(completion_time)
        
        # Calculate collection efficiency (bananas per second)
        efficiency = bananas_collected / completion_time if completion_time > 0 else 0
        self.metrics['banana_collection_efficiency'].append(efficiency)
    
    def get_performance_report(self):
        """Generate comprehensive performance report."""
        
        report = {
            'session_duration': time.time() - self.session_start,
            'total_decisions': self.total_decisions,
            'successful_goals': self.successful_goals,
            'success_rate': self.successful_goals / max(1, self.total_attempts),
            
            'average_dps': np.mean(self.metrics['decisions_per_second']) if self.metrics['decisions_per_second'] else 0,
            'average_completion_time': np.mean(self.metrics['goal_completion_time']) if self.metrics['goal_completion_time'] else 0,
            'average_efficiency': np.mean(self.metrics['banana_collection_efficiency']) if self.metrics['banana_collection_efficiency'] else 0,
            'hazard_avoidance_rate': np.mean(self.metrics['hazard_avoidance_rate']) if self.metrics['hazard_avoidance_rate'] else 0,
            'exploration_coverage': np.mean(self.metrics['exploration_coverage']) if self.metrics['exploration_coverage'] else 0,
            
            'performance_trends': self.analyze_performance_trends()
        }
        
        return report
    
    def analyze_performance_trends(self):
        """Analyze trends in performance metrics over time."""
        
        trends = {}
        
        for metric_name, values in self.metrics.items():
            if len(values) > 10:  # Need sufficient data points
                # Calculate linear trend
                x = np.arange(len(values))
                slope, intercept = np.polyfit(x, values, 1)
                
                trends[metric_name] = {
                    'slope': slope,
                    'direction': 'improving' if slope > 0 else 'declining' if slope < 0 else 'stable',
                    'recent_average': np.mean(values[-10:]),
                    'overall_average': np.mean(values)
                }
        
        return trends
```

## Integration with ColorLang Programs

### Complete AI-Driven ColorLang Program
```python
def generate_smart_monkey_program():
    """Generate a complete AI-driven ColorLang program."""
    
    program = []
    
    # Initialize environment and agent state
    program.extend([
        (15, 80, 70, "INTEGER", [25]),     # Agent X = 25
        (15, 80, 70, "INTEGER", [10]),     # Agent Y = 10  
        (15, 80, 70, "INTEGER", [0]),      # Direction = 0 (right)
        (15, 80, 70, "INTEGER", [100]),    # Health = 100
        (15, 80, 70, "INTEGER", [0]),      # Score = 0
    ])
    
    # Main AI loop
    for frame in range(120):  # 120 frame simulation
        program.extend([
            # Sense environment
            (325, 90, 80, "SENSE", [3]),   # SENSE with radius 3
            
            # Find nearest banana
            (305, 90, 85, "PATHFIND", [40, 15]),  # PATHFIND to likely banana location
            
            # Update cognition
            (345, 85, 75, "LEARN", [1, 0.1]),  # LEARN from experience
            
            # Render frame
            (285, 90, 85, "RENDER_FRAME", []),
            
            # Small delay for real-time visualization
            (295, 90, 85, "GET_TIME", []),
        ])
    
    # Halt program
    program.append((0, 0, 0, "HALT", []))
    
    return program

def create_ai_program_image(program, filename="smart_monkey.png"):
    """Create ColorLang program image for AI-driven agent."""
    
    # Convert program to HSV pixels
    pixels = []
    for instruction in program:
        h, s, v = instruction[:3]
        pixels.append((h, s, v))
    
    # Create image with appropriate dimensions
    width = min(50, len(pixels))  # Max 50 pixels wide
    height = (len(pixels) + width - 1) // width  # Calculate height
    
    # Convert HSV to RGB
    rgb_pixels = []
    for h, s, v in pixels:
        r, g, b = colorsys.hsv_to_rgb(h/360.0, s/100.0, v/100.0)
        rgb_pixels.append((int(r*255), int(g*255), int(b*255)))
    
    # Pad to fill rectangle
    while len(rgb_pixels) < width * height:
        rgb_pixels.append((0, 0, 0))  # Black padding
    
    # Create and save image
    image = Image.new('RGB', (width, height))
    image.putdata(rgb_pixels)
    image.save(filename)
    
    return image
```

---

This comprehensive AI/Agent behavior guide provides the complete framework for implementing sophisticated AI agents in ColorLang, from basic pathfinding to advanced learning systems. The monkey platformer demonstration showcases practical application of these concepts in a real-world scenario.