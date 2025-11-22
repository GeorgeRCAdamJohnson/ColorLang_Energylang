# Energy Orchestrator (Archive)

This folder preserves a runnable snapshot and design artifacts for the "AI Datacenter Scanner & Orchestrator" effort.

Purpose
- Archive the project's key artifacts and provide a concise starting point for future work if interest returns.

Contents
- `DESIGN.md` — refined design document outlining architecture, dataflows, ML approach, policies, and pilot plan.
- `PILOT_SUMMARY.md` — short rationale and recommended pilot actions for proving value.
- Links to preserved artifacts elsewhere in the repo:
  - `docs/PROJECT_CONCLUSION_MEMO.md` — final project memo and decision rationale.
  - `tools/orchestrator_power_scheduler.py` — lightweight orchestrator prototype.
  - `tools/import_benchmark_runs_log_to_db.py` — log importer for harness results.
  - `benchmarks/` — microbenchmarks and instrumented binaries (if present).

How to use this archive
1. Read `DESIGN.md` to understand architecture and components.
2. For reproducibility, follow the harness instructions in `docs/PROJECT_CONCLUSION_MEMO.md` and related scripts in `tools/`.
3. To re-open the project, create a fresh branch (e.g., `reopen/energy-orchestrator`) and iterate from the artifacts here.

Contact
- Owners: George R. C. Adam Johnson and project team (see repo authors).
