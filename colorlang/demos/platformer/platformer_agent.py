from __future__ import annotations
from dataclasses import dataclass
from typing import List, Tuple, Optional

from platformer_level import EMPTY, GROUND, BANANA, HAZARD, GOAL


@dataclass
class AgentState:
    x: float
    y: float
    vx: float = 0.0
    vy: float = 0.0
    grounded: bool = False
    bananas_collected: int = 0
    steps: int = 0


class Agent:
    def __init__(self, grid: List[List[str]], start: Tuple[int, int]):
        self.grid = grid
        sx, sy = start
        self.state = AgentState(x=float(sx), y=float(sy))
        self.g = 0.45
        self.max_vx = 0.8
        # reduced jump velocity to avoid overshooting top-of-screen
        self.jump_v = -5.0
        self.last_dir = 1  # remember last chosen horizontal dir to avoid flip-flop
        self.next_jump_v: Optional[float] = None

    def _find_goal(self) -> Optional[Tuple[int, int]]:
        h = len(self.grid)
        w = len(self.grid[0])
        for y in range(h):
            for x in range(w):
                if self.grid[y][x] == GOAL:
                    return (x, y)
        return None

    def sense(self) -> dict:
        # Find nearest banana and goal
        h = len(self.grid)
        w = len(self.grid[0])
        sx, sy = int(self.state.x), int(self.state.y)
        nearest_b = None
        best_d = 1e9
        for y in range(h):
            for x in range(w):
                if self.grid[y][x] == BANANA:
                    d = abs(x - sx) + abs(y - sy)
                    if d < best_d:
                        best_d = d
                        nearest_b = (x, y)
        goal = self._find_goal() or (w - 3, 3)

        # Prefer target: banana if present, otherwise goal
        target_x = nearest_b[0] if nearest_b else goal[0]
        dir_hint = 1 if target_x > sx else -1 if target_x < sx else self.last_dir

        # Lookahead for obstacle at foot level and a bit farther to detect walls
        ahead_x1 = max(0, min(w - 1, sx + dir_hint))
        ahead_x2 = max(0, min(w - 1, sx + 2 * dir_hint))
        # obstacle if ground or hazard at agent's foot level ahead
        obstacle_ahead = self.grid[sy][ahead_x1] == GROUND or self.grid[sy][ahead_x1] == HAZARD
        wall_ahead = self.grid[sy][ahead_x2] == GROUND
        return {
            "nearest_banana": nearest_b,
            "goal": goal,
            "obstacle_ahead": obstacle_ahead,
            "wall_ahead": wall_ahead,
            "dir_hint": dir_hint,
        }

    def decide_action(self, sensors: dict) -> str:
        # If obstacle directly in front and grounded, try jump
        if sensors["obstacle_ahead"] and self.state.grounded:
            return "JUMP"

        # If there's a wall two tiles ahead, try to change route by jumping if possible
        if sensors["wall_ahead"] and self.state.grounded:
            return "JUMP"

        nb = sensors["nearest_banana"]
        dir_hint = sensors["dir_hint"]

        # If a banana is nearby horizontally, prefer to stop and jump if it's above
        if nb:
            dx = nb[0] - self.state.x
            if abs(dx) < 0.6:
                # banana is above and close horizontally -> jump to collect
                if nb[1] < int(self.state.y) and self.state.grounded:
                    # compute modest jump proportional to vertical gap
                    dy = int(self.state.y) - nb[1]
                    desired = - (1.0 + dy * 0.8)
                    # use the smaller magnitude jump if it suffices
                    self.next_jump_v = desired if desired > self.jump_v else self.jump_v
                    return "JUMP"
                # otherwise hold still to avoid overshooting
                return "IDLE"

        # Move toward banana if present
        if nb:
            if nb[0] > int(self.state.x):
                return "RIGHT"
            elif nb[0] < int(self.state.x):
                return "LEFT"

        # Otherwise move toward goal
        gx, _ = sensors["goal"]
        if gx > int(self.state.x):
            return "RIGHT"
        elif gx < int(self.state.x):
            return "LEFT"

        # Default: maintain last_dir to avoid jitter
        return "RIGHT" if self.last_dir >= 0 else "LEFT"

    def step(self, action: str):
        s = self.state
        # Horizontal
        if action == "RIGHT":
            s.vx = min(self.max_vx, s.vx + 0.4)
            self.last_dir = 1
        elif action == "LEFT":
            s.vx = max(-self.max_vx, s.vx - 0.4)
            self.last_dir = -1
        else:
            # stronger damping when idling
            s.vx *= 0.6

        # Vertical
        if action == "JUMP" and s.grounded:
            if self.next_jump_v is not None:
                s.vy = self.next_jump_v
                self.next_jump_v = None
            else:
                s.vy = self.jump_v
            s.grounded = False

        s.vy += self.g
        s.x += s.vx
        s.y += s.vy

        # Collisions: ground/simple platforms
        h = len(self.grid)
        w = len(self.grid[0])
        # Clamp to bounds
        if s.x < 0:
            s.x, s.vx = 0, 0
        if s.x > w - 1:
            s.x, s.vx = w - 1, 0
        if s.y < 0:
            s.y, s.vy = 0, 0
        if s.y > h - 1:
            s.y, s.vy = h - 1, 0

        tile_below = self.grid[min(h - 1, int(s.y) + 1)][int(s.x)]
        if tile_below == GROUND:
            s.grounded = True
            s.vy = 0
            s.y = int(s.y)
        else:
            s.grounded = False

        # Collect banana: check current tile and nearby vertical tiles (in case we pass through)
        cx = int(s.x)
        collected = False
        for dy in (-1, 0, 1):
            yi = int(s.y) + dy
            if 0 <= yi < h and 0 <= cx < w and self.grid[yi][cx] == BANANA:
                self.grid[yi][cx] = EMPTY
                s.bananas_collected += 1
                # snap to banana tile for visual consistency
                s.y = yi
                collected = True
                break

        s.steps += 1
