# Energy Orchestrator — Design Document (Archived)

This document captures the high-level architecture, components, dataflows, and security/governance considerations for the AI Datacenter Scanner & Orchestrator project as of 2025-11-22.

1. Goal
- Provide an automated system to observe runtime workloads and recommend or orchestrate energy-efficient actions (placement, instance-type selection, batching, and optionally code-path optimization) to reduce energy use and cost across datacenters.

2. High-Level Components
- Scanner Agents: low-overhead agents (Go/Rust) that collect inventory (process/container/pod metadata), sampled stack traces, and hardware telemetry (CPU/GPU counters, PDU, BMC).
- Ingest & Store: streaming event bus (Kafka/NATS), time-series store (Prometheus/ClickHouse), and relational metadata DB (Postgres) for canonical results and audits.
- Analyzer: rule engine + ML pipeline for workload fingerprinting, energy estimation (J/op), suggestion ranking, and risk scoring.
- Orchestrator: policy layer, canary orchestration, and execution engine (Kubernetes operator / cluster controller / hypervisor integrations).
- Developer Tools: CI/CD plugins that produce suggested PRs, optimized images, and reproducible build artifacts.

3. Key Dataflows
- Telemetry flow: Scanner → Kafka → TSDB (prometheus/ClickHouse) and enrichment → Postgres for per-run metadata.
- Analysis flow: Periodic batch or streaming models compute energy estimates and generate ranked suggestions stored in `recommendations` table.
- Execution flow: Operator or human approves a recommendation → orchestrator runs canary → smoke tests → full rollout or rollback.

4. Telemetry & Schema (minimal)
- inventory(basics): host, node_type, pod_id, container_id, image, checksum, language
- telemetry_sample: timestamp, host, container_id, cpu_pct, mem_bytes, node_power_watts, gpu_power_watts, temp_c, hotspot_functions
- recommendation: id, created_at, target, suggestion_type, expected_savings_j, confidence, risk_score, status

5. ML & Algorithms
- Fingerprinting: aggregated sampled stacks + resource-time histograms → embedding → cluster to find reusable optimization candidates.
- Energy estimator: tabular model (LightGBM/XGBoost) mapping node profile + fingerprint → predicted J/op, trained on logged runs with PDU-level ground truth.
- Suggestion generator: rules + retrieval of previously-optimized implementations; for code transforms use PR-generation via restricted LLM prompts and automated testing.

6. Orchestration Policies
- Modes: advisory-only, human-in-the-loop (PR/approve), fully-automated for non-prod/batch workloads.
- Safety gates: SLO regression thresholds, smoke tests, automatic rollback window, and operator kill-switch.

7. Security & Governance
- Multi-tenant controls: tenant opt-in, per-tenant agent scopes, RBAC, and telemetry encryption.
- Supply chain: reproducible builds, signed artifacts, HSM-backed signing for any produced binaries.
- Auditability: immutable logs for all recommendations and actions, signed change records.

8. Pilot Plan (brief)
- Phase 0: Instrument non-customer internal batch workloads with PDU metering and calibrate energy estimator.
- Phase 1: Advisory pilot on managed service (inference/batch) — recommend placement & images, measure J/op savings.
- Phase 2: Developer-in-the-loop CI plugin producing PRs with suggested optimized code paths or flags; measure acceptance & savings.

9. Retained Artifacts and Repro Steps
- `tools/orchestrator_power_scheduler.py` — recommendation & execution prototype
- `tools/import_benchmark_runs_log_to_db.py` — importer for harness logs
- `docs/PROJECT_CONCLUSION_MEMO.md` — decision memo and preserved run notes

10. Why this design (brief)
- Scales by starting at the scheduler/placement layer (lowest trust cost) and moves toward developer-facing code transforms only when opt-in and auditable. This balances measurable impact with acceptable trust/legal constraints at hyperscaler scale.

11. Next steps if resurrected
- Build CI/CD plugin + example PR generator.
- Run small enterprise on-prem pilots where tenants accept code transformation inside their boundary.
- Open partnership with Green Software Foundation projects to leverage standard carbon signals.
