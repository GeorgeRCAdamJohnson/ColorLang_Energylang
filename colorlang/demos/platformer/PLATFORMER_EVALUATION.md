# Platformer Demo — Evaluation & Metrics

Date: November 7, 2025

Purpose: Define what this demo tests, how we measure it, and what success looks like for Phase 1 with a path to Phase 2.

## What This Demonstrates
- Visual artifact as canonical state: each frame is a color grid with a cognition strip, aligning with ColorLang’s image-native philosophy.
- Procedural reproducibility: same seed → same world and agent run (deterministic loop).
- Agent transparency: cognition strip externalizes intent/memory/goal-progress each step.
- Compression friendliness: large uniform regions amenable to palette/RLE (ties into our compression framework).

## Metrics
- Steps run: total frames produced (<= MAX_STEPS).
- Reward proxy: bananas_collected; optionally add goal_reached boolean.
- Progress proxy: 1 − (|x − goal_x| / goal_x) averaged over time.
- Render cost: ms/frame to render (optional timing hook).
- Artifact size: total bytes for PNG sequence; hybrid compressed size if run through ColorCompressor (future hook).

## Output Artifacts
- `output/frame_###.png` — visual evidence; cognition strip captured.
- `output/summary.json` — { total_steps, bananas_collected, goal_reached }.
- Optional (future): `metrics.json` with per-step actions and progress.

## Success Criteria (Phase 1)
- Deterministic run produces frames and a valid summary.
- Cognition strip varies sensibly with actions and environment cues.
- Compression check (manual): frames should compress well with palette/RLE.

## Phase 2 Extensions
- Policy improvements: edge detection and targeted jumps to collect ≥1 banana within 120 steps.
- Metrics pipeline: emit `metrics.json` per step (action, position, distances, cognition values).
- Compression experiment: pipe frames through ColorCompressor; report ratio and savings.
- ColorLang integration: export tile grid as a ColorLang program image for a small scripted behavior.

## Repro Instructions (Windows example)
```powershell
& 'C:\Users\biges\AppData\Local\Programs\Python\Python312\python.exe' demos/platformer/run_platformer_demo.py
```

## Notes
- This demo is illustrative; it is not a game engine. Stability and clarity of outputs are prioritized over physics fidelity.
