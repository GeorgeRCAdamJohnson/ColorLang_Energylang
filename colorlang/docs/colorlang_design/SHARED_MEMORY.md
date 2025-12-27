# Shared Memory Design

## Overview
Shared memory in ColorLang facilitates communication between the Virtual Machine (VM) and host applications. It is a critical component for enabling real-time interactions, such as AI-driven behavior and rendering updates.

---

## Key Components

### 1. **Tilemap**
- **Purpose**: Represents the game or application environment.
- **Structure**:
  - A 2D grid where each cell encodes a specific tile type (e.g., ground, obstacle, banana).
  - Example:
    ```
    [["GROUND", "GROUND", "BANANA"],
     ["GROUND", "OBSTACLE", "GROUND"]]
    ```
- **Usage**:
  - The VM updates the tilemap to reflect changes in the environment.
  - The host application renders the tilemap visually.

### 2. **Agent State**
- **Purpose**: Tracks the state of AI agents (e.g., the monkey in the platformer).
- **Structure**:
  - Position: `{x: int, y: int}`
  - Emotional State: `{frustration: float, happiness: float}`
  - Performance Metrics: `{runs_completed: int, improvement_rate: float}`
- **Usage**:
  - The VM updates the agent's state based on its actions and environment.
  - The host application uses this data to display the agent's progress.

### 3. **Cognition Strip**
- **Purpose**: Represents the decision-making process of the AI agent.
- **Structure**:
  - A sequence of decisions or thoughts, e.g., `["MOVE_RIGHT", "JUMP", "WAIT"]`.
- **Usage**:
  - The VM populates the cognition strip as the agent makes decisions.
  - The host application can visualize the agent's thought process.

---

## Data Flow
1. **VM to Host**:
   - The VM updates shared memory during program execution.
   - Changes are reflected in the tilemap, agent state, and cognition strip.
2. **Host to VM**:
   - The host application can modify shared memory to provide input (e.g., user commands, environmental changes).

---

## Next Steps
- Define specific data formats for shared memory components.
- Document synchronization mechanisms to ensure consistency between the VM and host.
- Provide examples of shared memory usage in the Monkey Platformer demo.