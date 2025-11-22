# Pilot Summary & Why Pursue

Even though the autonomous hyperscaler bare-metal rewrite approach was put on hold, this summary captures the core rationale for pursuing the idea and the narrow, high-probability pilots we recommend if the project is ever revisited.

Why pursue (concise):
- Data centers are a major growing source of energy demand. Small, reproducible reductions in J/op or better placement across heterogeneous hardware can yield large cost and carbon savings at scale.
- This project explored the end-to-end stack (telemetry → estimate → action) and validated that accurate per-run telemetry and canonicalization are feasible — the remaining barrier is trust/operational adoption rather than pure technical feasibility for many classes of workloads.

High-probability pilots (least friction → higher impact):
1. Managed-inference pilot: integrate optimizer into a provider-managed inference service where the provider controls the runtime and can safely introduce optimized kernels or images.
2. CI/CD PR-based optimizer: implement a plugin that generates suggested PRs (e.g., vectorize loops, add BLAS calls, or recommend compile flags) for developer approval — eliminates unilateral action risk.
3. Placement & instance switching pilot: instrument and automate placement of flexible batch workloads to Graviton/ARM or energy-efficient node pools during low-carbon windows.

Quick success metrics:
- J/op reduction (measured at PDU/rack level)
- % energy reduction across pilot nodes
- SLO/regression delta (latency/throughput)
- Developer acceptance rate for suggested PRs
