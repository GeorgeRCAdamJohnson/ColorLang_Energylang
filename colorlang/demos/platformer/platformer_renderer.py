from typing import List, Tuple
from PIL import Image
import colorsys

from platformer_level import EMPTY, GROUND, BANANA, HAZARD, GOAL


def hsv_to_rgb8(h: float, s: float, v: float) -> Tuple[int, int, int]:
    r, g, b = colorsys.hsv_to_rgb(h, s, v)
    return int(r * 255), int(g * 255), int(b * 255)


def render_frame(grid: List[List[str]], agent_xy: Tuple[int, int], thoughts_hsv: List[Tuple[float, float, float]],
                 cell_size: int = 12) -> Image.Image:
    h = len(grid)
    w = len(grid[0])
    # One extra row for cognition strip
    img = Image.new("RGB", (w * cell_size, (h + 1) * cell_size), (0, 0, 0))
    px = img.load()

    # Cognition strip at top row (row 0)
    # Fill full width with background and place 5 pixels at left
    for x in range(w * cell_size):
        px[x, 0] = (20, 20, 20)
    # Draw 5 big blocks representing thoughts
    for i, (hh, ss, vv) in enumerate(thoughts_hsv[:5]):
        color = hsv_to_rgb8(hh, ss, vv)
        for dx in range(cell_size):
            for dy in range(cell_size):
                xx = i * cell_size + dx
                yy = dy
                if xx < w * cell_size:
                    px[xx, yy] = color

    # Tiles (start at row offset 1)
    for gy in range(h):
        for gx in range(w):
            tile = grid[gy][gx]
            if tile == EMPTY:
                col = hsv_to_rgb8(0.6, 0.1, 0.08)  # dark background
            elif tile == GROUND:
                col = hsv_to_rgb8(0.08, 0.7, 0.5)  # earthy
            elif tile == BANANA:
                col = hsv_to_rgb8(0.15, 0.9, 0.95)  # yellow
            elif tile == HAZARD:
                col = hsv_to_rgb8(0.0, 0.9, 0.9)  # red
            elif tile == GOAL:
                col = hsv_to_rgb8(0.75, 0.8, 0.9)  # violet
            else:
                col = (0, 0, 0)
            # draw cell
            for dx in range(cell_size):
                for dy in range(cell_size):
                    px[gx * cell_size + dx, (gy + 1) * cell_size + dy] = col

    # Agent (simple colored square overlay)
    ax, ay = agent_xy
    col = hsv_to_rgb8(0.55, 0.9, 1.0)  # cyan-ish monkey
    for dx in range(cell_size):
        for dy in range(cell_size):
            px[ax * cell_size + dx, (ay + 1) * cell_size + dy] = col

    return img
