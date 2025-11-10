# ColorLang Application ABI (Platformer)

Date: November 7, 2025

Purpose: Define the syscall surface and memory map shared by the ColorLang program and the host runtime.

## Syscalls (Hue Bands and Operands)
Note: Exact hues will match the project’s instruction_set. Below is a logical map we will bind to concrete hues in the assembler.

- SYSCALL 0: GET_TIME_MS → R0
  - Returns monotonic milliseconds since start.
- SYSCALL 1: RAND32 → R0
  - Returns a 32‑bit random integer.
- SYSCALL 2: RENDER_FRAME (args: tilemap_ptr, agent_ptr)
  - Host renders current state to window/PNG.
- SYSCALL 3: LOG (arg: ptr,len)
  - Host logs a message from memory.
- SYSCALL 4: SLEEP_MS (arg: ms)
  - Host sleeps; for simulation pacing.

Encoding: We reserve a hue band `H_sys` for SYSCALL; S/V encode the syscall ID and arg registers.

## Memory Map
- 0x0000–0x00FF: Header
  - 0x0000: magic ("CLPL")
  - 0x0004: version
  - 0x0008: width (W), 0x000C: height (H)
  - 0x0010: rng_seed
  - 0x0014: timestep_ms
  - 0x0018: frame_counter
  - 0x001C: flags

- 0x0100–0x04FF: Agent State
  - x, y, vx, vy (floats or fixed‑point)
  - grounded (bool), bananas (int)
  - action (enum: LEFT/RIGHT/JUMP/IDLE)

- 0x0500–0x7FFF: Tilemap (W×H bytes or palette indices)

- 0x8000–0x80FF: Cognition Strip (5 HSV triples; e.g., 5×3 floats)

- 0x9000–0xBFFF: FrameBuffer (optional direct render; host samples HSV grid)

- 0xC000–0xC0FF: Mailbox
  - cmd, arg0..argN, result

## Calling Convention
- Operands: use registers R0..R7 for args/returns; memory pointers are addresses in shared space.
- SYSCALL: set R0=call_id; R1..R3=arguments; issue SYSCALL instruction.
- Returns: R0 contains status or primary value.

## Minimal Kernel Loop (Pseudocode)
```
INIT:
  write header (W,H,seed,timestep)
  frame_counter = 0
LOOP:
  t = SYSCALL(GET_TIME_MS)
  SENSE(tilemap, agent_state)
  DECIDE(agent_state)
  UPDATE(agent_state)
  WRITE_COGNITION(agent_state)
  SYSCALL(RENDER_FRAME, &tilemap, &agent_state)
  frame_counter++
  if frame_counter < MAX_STEPS: GOTO LOOP else HALT
```

## Binding to Hues
- We will publish the exact hue ranges for SYSCALL, LOAD/STORE, BRANCH, ALU once the assembler template is locked, ensuring consistent decoding with the current VM.
