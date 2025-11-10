"""Host runtime shim for a full ColorLang platformer application.

Responsibilities:
- Load ColorLang program image(s) and construct a VM instance.
- Provide syscalls for time, RNG, logging, rendering.
- Expose a shared memory map (header, agent state, tilemap, cognition strip).
- Step the VM in a loop until HALT or frame limit.

Note: This is a scaffold; it references `colorlang` modules and assumes an
available instruction set with a SYSCALL hue band. The concrete binding of
hues/operands is defined in COLORLANG_APP_ABI.md and the future assembler.
"""
from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Tuple
import time
import random
import os
from PIL import Image
import colorsys

try:
    import colorlang  # type: ignore
except Exception:
    colorlang = None


@dataclass
class SharedMemory:
    width: int = 50
    height: int = 20
    rng_seed: int = 42
    timestep_ms: int = 33
    frame_counter: int = 0
    # Simplified placeholders; a real impl would use bytearrays and struct.pack
    tilemap: Optional[list] = None
    agent: Optional[dict] = None
    cognition: Optional[list] = None


class HostSyscalls:
    def __init__(self, shm: SharedMemory):
        self.shm = shm
        self.t0 = time.perf_counter()
        self.rng = random.Random(shm.rng_seed)

        # Initialize tilemap and agent state
        self.shm.tilemap = [['EMPTY' for _ in range(self.shm.width)] for _ in range(self.shm.height)]
        self.shm.agent = {'x': 0, 'y': 18}  # Start agent at bottom-left corner

        print("[DEBUG] Initialized tilemap and agent state.")

    def get_time_ms(self) -> int:
        return int((time.perf_counter() - self.t0) * 1000)

    def rand32(self) -> int:
        return self.rng.getrandbits(32)

    def hsv_to_rgb8(self, h: float, s: float, v: float) -> Tuple[int, int, int]:
        r, g, b = colorsys.hsv_to_rgb(h, s, v)
        return int(r * 255), int(g * 255), int(b * 255)

    def render_frame(self) -> None:
        """Render the current frame to an image file."""
        output_dir = "out"
        os.makedirs(output_dir, exist_ok=True)
        frame_path = os.path.join(output_dir, f"frame_{self.shm.frame_counter:03d}.png")
        print(f"Rendering frame: {frame_path}")

        # Debug: Check if tilemap and agent are populated
        if not self.shm.tilemap:
            print("[DEBUG] Tilemap is empty or not initialized.")
        if not self.shm.agent:
            print("[DEBUG] Agent state is empty or not initialized.")

        cell_size = 12
        img = Image.new("RGB", (self.shm.width * cell_size, (self.shm.height + 1) * cell_size), (0, 0, 0))
        px = img.load()

        # Cognition strip at top row (row 0)
        if self.shm.cognition:
            for i, (h, s, v) in enumerate(self.shm.cognition[:5]):
                color = self.hsv_to_rgb8(h, s, v)
                for dx in range(cell_size):
                    for dy in range(cell_size):
                        x = i * cell_size + dx
                        if x < self.shm.width * cell_size:
                            px[x, dy] = color

        # Render the tilemap
        if self.shm.tilemap:
            for y, row in enumerate(self.shm.tilemap):
                for x, tile in enumerate(row):
                    if 0 <= x < self.shm.width and 0 <= y < self.shm.height:
                        if tile == 'GROUND':
                            color = self.hsv_to_rgb8(0.08, 0.7, 0.5)  # Earthy
                        elif tile == 'BANANA':
                            color = self.hsv_to_rgb8(0.15, 0.9, 0.95)  # Yellow
                        elif tile == 'GOAL':
                            color = self.hsv_to_rgb8(0.75, 0.8, 0.9)  # Violet
                        elif tile == 'HAZARD':
                            color = self.hsv_to_rgb8(0.0, 0.9, 0.9)  # Red
                        else:
                            color = self.hsv_to_rgb8(0.6, 0.1, 0.08)  # Dark background
                        for dx in range(cell_size):
                            for dy in range(cell_size):
                                px[x * cell_size + dx, (y + 1) * cell_size + dy] = color

        # Render the agent
        if self.shm.agent:
            agent_x = self.shm.agent.get("x", 0)
            agent_y = self.shm.agent.get("y", 0)
            if 0 <= agent_x < self.shm.width and 0 <= agent_y < self.shm.height:
                color = self.hsv_to_rgb8(0.55, 0.9, 1.0)  # Cyan-ish monkey
                for dx in range(cell_size):
                    for dy in range(cell_size):
                        px[agent_x * cell_size + dx, (agent_y + 1) * cell_size + dy] = color

        # Save the rendered frame
        img.save(frame_path)
        print(f"[DEBUG] Frame saved to {frame_path}")

    def log(self, msg: str) -> None:
        print(f"[VM] {msg}")

    def syscall_dispatch(self, syscall_name: str):
        """Dispatch syscalls based on their name."""
        if syscall_name == 'GET_TIME':
            return self.get_time_ms()
        elif syscall_name == 'RENDER_FRAME':
            self.render_frame()
        elif syscall_name == 'LOG':
            self.log("Log syscall invoked")
        else:
            raise ValueError(f"Unsupported syscall: {syscall_name}")


def run(program_image: Path, max_frames: int = 120) -> None:
    if colorlang is None:
        print("colorlang runtime not available — host scaffold only")
        return
    # Load program (image)
    prog = colorlang.load_program(str(program_image))
    vm = colorlang.ColorVM()

    # TODO: Attach syscalls via a hook on vm if supported. Otherwise,
    # simulate syscalls by watching specific memory locations after each step.

    shm = SharedMemory()
    syscalls = HostSyscalls(shm)

    frames = 0
    while frames < max_frames:
        # Step the VM some cycles; in a real impl we would run until a SYSCALL
        # boundary or frame boundary indicated via mailbox.
        vm.run_program(prog)
        frames += 1
        shm.frame_counter = frames
        # Render via syscall stub
        syscalls.render_frame()

    print("Host run complete", {"frames": frames})


if __name__ == "__main__":
    # Placeholder path; a real program image will be produced by the assembler.
    run(Path("platformer_kernel.png"))
