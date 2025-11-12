import random
from typing import List, Tuple

Tile = str

EMPTY: Tile = "EMPTY"
GROUND: Tile = "GROUND"
BANANA: Tile = "BANANA"
HAZARD: Tile = "HAZARD"
GOAL: Tile = "GOAL"


def generate_level(width: int = 50, height: int = 20, seed: int = 42) -> List[List[Tile]]:
    rng = random.Random(seed)
    grid: List[List[Tile]] = [[EMPTY for _ in range(width)] for _ in range(height)]

    # Base ground
    ground_y = height - 2
    for x in range(width):
        grid[ground_y][x] = GROUND
        grid[ground_y + 1][x] = GROUND

    # Random platforms
    for _ in range(max(5, width // 6)):
        plat_y = rng.randint(4, ground_y - 2)
        plat_len = rng.randint(5, 10)
        start_x = rng.randint(0, max(0, width - plat_len - 1))
        for x in range(start_x, min(width, start_x + plat_len)):
            grid[plat_y][x] = GROUND

    # Hazards
    for _ in range(width // 8):
        x = rng.randint(2, width - 3)
        grid[ground_y][x] = HAZARD

    # Bananas
    for _ in range(6):
        x = rng.randint(3, width - 4)
        y = rng.randint(3, ground_y - 1)
        if grid[y][x] == EMPTY:
            grid[y][x] = BANANA

    # Goal
    grid[3][width - 3] = GOAL

    return grid


def find_start(grid: List[List[Tile]]) -> Tuple[int, int]:
    # Start near left, above ground
    height = len(grid)
    ground_y = height - 3
    return (2, ground_y)
