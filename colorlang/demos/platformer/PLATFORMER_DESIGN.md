# ColorLang Platformer Demo — Design Document

Date: November 7, 2025

Purpose: Demonstrate a minimal agent-in-environment setup rendered as a color grid with a cognition strip, showcasing how ColorLang’s visual model can support procedural worlds, simple decision policies, and visual debugging suitable for AI/agent research.

## Objectives
- Procedural environment generation (2D platformer tiles) with reproducible seeds.
- Monkey agent with a transparent, color-encoded cognition strip.
- Visual renderer that outputs PNG frames (pixels as semantic tiles + top cognition strip).
- Clear evaluation signals: steps, banana collection, goal progress.

## Scope
- Keep physics simple (discrete steps, basic gravity, simple collisions).
- Keep policy simple (reactive, heuristic). No RL training in this phase.
- Produce deterministic outputs per seed to aid benchmarking and CI.

## World Model
- Grid (W×H): default 50×20.
- Tiles: `EMPTY`, `GROUND`, `BANANA`, `HAZARD`, `GOAL`.
- Generator: base ground band, random platforms, sprinkled hazards, bananas; goal at top-right.
- Start: near left, above ground.

## Agent Model
- State: (x,y), velocities (vx,vy), grounded flag, bananas collected, step count.
- Actions: `LEFT`, `RIGHT`, `JUMP`, `IDLE`.
- Dynamics: friction for vx, gravity for vy, jump impulse when grounded.
- Collisions: simple ground/platform snap, bounds clamping.

## Cognition Strip (5 pixels)
1. Emotion (h≈0.02): intensity grows as bananas collected.
2. Action Intent (h≈0.55 right / 0.12 left): reflects current driving direction; higher value when grounded.
3. Memory Recall (h≈0.33): saturation encodes proximity to nearest banana.
4. Social Cue (h≈0.5): placeholder low vividness.
5. Goal Evaluation (h≈0.82): value inversely related to remaining distance to goal.

## Rendering
- HSV→RGB; tiles mapped to distinct hues for readability.
- Frame = cognition strip row + tile rows.
- Cell size: 12×12 pixels for visibility.

## Files
- `platformer_level.py`: Level generation and start position.
- `platformer_agent.py`: Agent state, sensing, decision, step update.
- `platformer_renderer.py`: Frame rendering and cognition strip drawing.
- `run_platformer_demo.py`: Main loop, outputs `output/frame_###.png` and `summary.json`.

## Non-Goals (Phase 1)
- RL policy training, pathfinding, or advanced physics.
- Networking or real-time input.

## Risks
- Agent may fail to collect bananas/goal with baseline heuristic; acceptable for Phase 1.
- Large outputs; advise limiting steps in CI.

## Integration Plan (ColorLang Alignment)
Phase 1 (current): Separate Python simulation producing color frames.

Phase 2 (proposed):
1. Instruction Image Export: For each frame, emit a parallel ColorLang program image representing a scripted agent cycle (LOAD senses, arithmetic for decision scoring, JUMP or MOVE opcodes, HALT).
2. Compression Benchmark: Feed frame images and program instruction images through `ColorCompressor` hybrid path; record ratio vs PNG/WebP.
3. Cognition Strip Semantics: Optionally map cognition pixel hues to DATA instructions in a ColorLang image enabling post-hoc replay by the VM.
4. Integrity / ECC Test: Introduce hue perturbations to frame images and evaluate resilience of band decoding (future ECC layer).
5. GPU Decode Prototype: Batch-decode instruction images from frames with a shader approach; compare decode throughput.

## Success Metrics (Phase 2)
- ≥1 banana collected within 120 steps after policy tuning.
- Exported ColorLang program executes deterministically matching Python agent final position.
- Hybrid compression savings ≥ 90% on instruction image corpus.
- Misdecode rate under ±2° hue perturbation < 1e-6 (after ECC introduction).

