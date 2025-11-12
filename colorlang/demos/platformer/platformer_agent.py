from __future__ import annotations
from dataclasses import dataclass
from typing import List, Tuple

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
        self.jump_v = -7.0

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
        goal = (w - 3, 3)
        # Lookahead for obstacle at foot level
        dir_hint = 1 if (nearest_b and nearest_b[0] > sx) else -1
        ahead_x = max(0, min(w - 1, sx + dir_hint))
        obstacle_ahead = self.grid[sy][ahead_x] == GROUND
        return {
            "nearest_banana": nearest_b,
            "goal": goal,
            "obstacle_ahead": obstacle_ahead,
            "dir_hint": dir_hint,
        }

    def decide_action(self, sensors: dict) -> str:
        # Simple reactive policy
        if sensors["obstacle_ahead"] and self.state.grounded:
            return "JUMP"
        nb = sensors["nearest_banana"]
        if nb:
            if nb[0] > int(self.state.x):
                return "RIGHT"
            elif nb[0] < int(self.state.x):
                return "LEFT"
        # Default toward goal
        gx, _ = sensors["goal"]
        if gx > int(self.state.x):
            return "RIGHT"
        elif gx < int(self.state.x):
            return "LEFT"
        return "IDLE"

    def step(self, action: str):
        s = self.state
        # Horizontal
        if action == "RIGHT":
            s.vx = min(self.max_vx, s.vx + 0.4)
        elif action == "LEFT":
            s.vx = max(-self.max_vx, s.vx - 0.4)
        else:
            s.vx *= 0.8

        # Vertical
        if action == "JUMP" and s.grounded:
            s.vy = self.jump_v
            s.grounded = False

        s.vy += self.g
        s.x += s.vx
        s.y += s.vy

        # Collisions: ground/simple platforms
        h = len(self.grid)
        w = len(self.grid[0])
        # Clamp to bounds
        if s.x < 0: s.x, s.vx = 0, 0
        if s.x > w - 1: s.x, s.vx = w - 1, 0
        if s.y < 0: s.y, s.vy = 0, 0
        if s.y > h - 1: s.y, s.vy = h - 1, 0

        tile_below = self.grid[min(h - 1, int(s.y) + 1)][int(s.x)]
        if tile_below == GROUND:
            s.grounded = True
            s.vy = 0
            s.y = int(s.y)
        else:
            s.grounded = False

        # Collect banana
        if self.grid[int(s.y)][int(s.x)] == BANANA:
            self.grid[int(s.y)][int(s.x)] = EMPTY
            s.bananas_collected += 1

        s.steps += 1
