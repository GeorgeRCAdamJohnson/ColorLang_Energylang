# Full Application in ColorLang — Platformer Plan

Date: November 7, 2025

Goal: Express the platformer’s logic, agent policy, and UI entirely as ColorLang artifacts (HSV grids), executed by the VM with a minimal host shim for I/O and timing. This demonstrates end‑to‑end viability of a non‑textual, machine‑native application.

## Guiding Principles
- Single source of truth: The program is a ColorLang image (or a small set of them), not Python text.
- Narrow, explicit host interface: Only environment I/O (render, time, random seed, input events) lives outside; everything else is image‑program.
- Determinism first: Fixed seeds; pure functions unless calling explicit syscalls.

## Architectural Layers
1. ColorLang Program(s)
   - Platformer Kernel: main loop, time‑step, dispatch to subsystems.
   - Level Module: tilemap generation from a seed (palette + procedural rules).
   - Agent Module: sensing, decision policy, and state update.
   - Renderer Module: maps the world state to HSV grid (or calls host `RENDER_FRAME`).

2. Host Runtime (Shim)
   - Loads program image(s) and exposes syscalls to the VM.
   - Manages a memory map shared with the VM (tilemap, agent state, cognition strip, config).
   - Provides timers, RNG, and pixel blit to window/PNG.

3. Build Pipeline
   - (Phase A) Hand‑authored image programs using a micro‑assembler tool.
   - (Phase B) A tiny DSL that compiles to images (optional).

## Data & Memory Model (Shared)
- Header (fixed addresses): version, sizes, RNG seed, timestep, frame counter.
- Tilemap region: W×H encoded as bytes or palette indices.
- Agent state: x, y, vx, vy, grounded, bananas, flags.
- Cognition strip: 5 HSV triples written each frame.
- Command mailbox: host<->VM signals (e.g., request render, quit).

## Control Flow
- Main loop (ColorLang):
  1. Read time delta (syscall GET_TIME or shared memory).
  2. Agent SENSE: scan tilemap; write features to registers.
  3. Agent DECIDE: choose action; write to action register.
  4. Physics UPDATE: integrate velocities; collide with tilemap.
  5. Banana/goal checks; update counters.
  6. Write cognition strip values.
  7. Request render (syscall) or write directly to FrameBuffer region.
  8. Increment frame; branch if < MAX_STEPS.

## Rendering Options
- Direct: VM writes HSV pixels into a FrameBuffer region the host samples to produce PNG/window.
- Indirect: VM issues a RENDER_FRAME syscall with a pointer to tilemap/agent; host renders.

## Compression Strategy
- Store module images with palette/hybrid compression.
- Per‑frame framebuffer compression is optional; for live runs, the host just displays; for recording, use hybrid.

## Milestones
- M0: Define ABI (syscalls + memory map). Produce kernel stub image that HALTs after init.
- M1: Kernel with loop + frame counter; cognition strip writes; host renders a blank scene.
- M2: Agent SENSE+DECIDE+UPDATE in ColorLang; host only renders.
- M3: Level generation in ColorLang (seeded procedural rules).
- M4: Full loop stable at 30–60 FPS equivalent; record frames.

## Risks
- Instruction density: Image footprint for the kernel may be large; hybrid compression mitigates.
- Tooling: Assembler/encoder must be solid; we start with a micro‑assembler for a tiny kernel.
- Performance: Start with correctness; optimize with tile dictionaries later.

## Deliverables
- `platformer_kernel.climg` (ColorLang image) and `platformer_host.py`.
- `COLORLANG_APP_ABI.md` (syscalls, memory map).
- Example run: recorded frames + summary produced with the ColorLang program.
