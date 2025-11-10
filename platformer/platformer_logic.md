# Platformer Game Logic Design

## Objective
Design a platformer game using ColorLang where a monkey collects bananas. The game will include basic AI commands for the monkey to navigate the environment.

---

## Game Components

### 1. **Tilemap**
- Represents the game world as a grid.
- Each tile has a type (e.g., ground, platform, banana, empty).
- Encoded in HSV values for ColorLang.

### 2. **Monkey (Player)**
- Controlled by AI commands.
- Can move left, right, jump, and collect bananas.
- Tracks position and state (e.g., jumping, idle).

### 3. **Bananas**
- Collectible items placed on specific tiles.
- Increment score when collected.

---

## Game Logic

### 1. **Initialization**
- Load the tilemap into shared memory.
- Place the monkey at the starting position.
- Place bananas at predefined locations.

### 2. **Movement**
- Monkey can move left, right, and jump.
- Movement is constrained by the tilemap (e.g., cannot move through walls).

### 3. **Collision Detection**
- Check for collisions with bananas to collect them.
- Check for collisions with the ground to stop falling.

### 4. **AI Commands**
- `MOVE_LEFT`: Move the monkey one tile to the left.
- `MOVE_RIGHT`: Move the monkey one tile to the right.
- `JUMP`: Make the monkey jump.
- `COLLECT`: Collect a banana if on the same tile.

### 5. **Win Condition**
- The game ends when all bananas are collected.

---

## ColorLang Implementation

### 1. **Tile Encoding**
- Ground: Hue 120° (green), Saturation 100%, Value 50%.
- Platform: Hue 60° (yellow), Saturation 100%, Value 50%.
- Banana: Hue 30° (orange), Saturation 100%, Value 100%.
- Empty: Hue 0° (red), Saturation 0%, Value 0%.

### 2. **Monkey Encoding**
- Position stored in shared memory.
- State encoded as HSV values.

### 3. **AI Command Encoding**
- `MOVE_LEFT`: Hue 210° (blue), Saturation 100%, Value 50%.
- `MOVE_RIGHT`: Hue 240° (indigo), Saturation 100%, Value 50%.
- `JUMP`: Hue 270° (violet), Saturation 100%, Value 50%.
- `COLLECT`: Hue 300° (magenta), Saturation 100%, Value 50%.

---

## Development Plan

1. **Design Tilemap**
   - Create a sample tilemap with ground, platforms, and bananas.

2. **Implement Monkey Logic**
   - Add movement and collision detection.

3. **Add AI Commands**
   - Implement basic commands for the monkey to navigate and collect bananas.

4. **Test and Debug**
   - Ensure the game logic works as expected.

5. **Optimize**
   - Refine the ColorLang implementation for efficiency.

---

## Next Steps
- Implement the tilemap and monkey logic in ColorLang.
- Add AI commands for the monkey.
- Test the platformer game.