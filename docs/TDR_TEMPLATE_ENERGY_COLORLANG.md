# Technical Decision Record (TDR) — Energy & Visual Language Projects

Purpose
- Provide a short, repeatable TDR template tailored for Energyland / ColorLange-style projects. Keep entries small, focused, and linkable from PRs and design docs.

When to use
- Use a TDR for decisions that affect data semantics, instrumentation, APIs, storage schemas, security/sandboxing boundaries, or cross-team operational procedures.
- Create a TDR early in the decision process (before implementation) and update it if new facts appear.

How to use
- Copy this file to `docs/tdr/<YYYY>-<short-name>-<decision>.md` or create a new markdown file per decision. Reference the TDR in PRs, issues, and release notes.

Template
- **TDR ID**: `TDR-YYYYMMDD-<short-slug>`
- **Title**: Short descriptive title (1 line)
- **Status**: Proposed / Accepted / Rejected / Superseded / Deprecated
- **Date**: YYYY-MM-DD
- **Authors**: Name(s) and role(s)
- **Decision**: One-sentence statement of the decision
- **Context & Problem Statement**: Short paragraph describing the problem, constraints, and why this matters for Energyland/ColorLange projects (e.g., telemetry semantics, VM safety, image-to-instruction mapping, profiler reliability)
- **Options Considered**: Bullet list of alternatives (short), each with 1-2 pros/cons
  - Option A: ... (pros / cons)
  - Option B: ... (pros / cons)
- **Chosen Option & Rationale**: Why this option was chosen; reference data, audit results, legal/ops constraints, and stakeholder input where applicable
- **Implications / Consequences**: What changes are required (code, schema, docs), migration cost, operational impact, and risks
- **Acceptance Criteria / Tests**: Concrete criteria for considering the decision successfully implemented (unit tests, migration checks, audit parity metrics)
- **Rollback / Mitigation Plan**: Steps to undo or mitigate if the decision causes regressions
- **Follow-ups / Open Questions**: Actions to schedule, owners, and deadlines
- **References**: Links to PRs, issues, audit CSVs (e.g., `db_energy_audit.csv`), and external docs

Example (canonicalize energy metric)
- **TDR ID**: `TDR-20251122-energy-canonicalization`
- **Title**: Canonicalize energy to physics-derived `energy_physics`
- **Status**: Accepted
- **Date**: 2025-11-22
- **Authors**: George R. C. A. Johnson (Author), Ops (Reviewer)
- **Decision**: Store a canonical `energy_physics` column computed as `power_avg_watts * runtime_seconds`, retain raw telemetry in `power_*` / `energy_reported` columns.
- **Context & Problem Statement**: Audit (`db_energy_audit.csv`) revealed inconsistent semantics in `energy_joules_per_op` (some rows store telemetry-derived values, others store derived estimates). Consumers require a consistent metric for J/op / J/flop comparisions.
- **Options Considered**:
  - Use existing `energy_joules_per_op` as-is (low effort; inconsistent semantics remain).
  - Overwrite `energy_joules_per_op` with physics-derived values (clear canonical but destroys raw telemetry).
  - Add new column `energy_physics` and keep raw telemetry (chosen)
- **Chosen Option & Rationale**: Add `energy_physics` to preserve raw telemetry for audits and enable consistent downstream analytics. This minimizes irreversible data loss and makes rationale auditable.
- **Implications / Consequences**: Add DB migration to create `energy_physics` and backfill using existing `power_avg_watts` and `runtime_seconds`. Update importer to compute `energy_physics` on insert. Update downstream dashboards to use `energy_physics` by default.
- **Acceptance Criteria / Tests**:
  - Migration completes without errors on backup copy.
  - `SELECT COUNT(*) FROM results WHERE energy_physics IS NULL AND (power_avg_watts IS NOT NULL AND runtime_seconds IS NOT NULL)` returns 0 after backfill.
  - Dashboards display identical aggregate numbers to local audit scripts within tolerance for rows that had telemetry.
- **Rollback / Mitigation Plan**: If dashboards regress, revert dashboard queries and restore DB from snapshot taken before migration. Migration script should be idempotent and reversible where possible.
- **Follow-ups / Open Questions**: Identify rows without `power_avg_watts` but with `energy_reported`. Define how to handle `N`/`None` tokens in importer (owner: data eng, due: 2 weeks).
- **References**: `db_energy_audit.csv`, `tools/import_benchmark_runs_log_to_db.py`, PR #123

Best Practices Checklist (short)
- Create a TDR for decisions that will affect users, data, or operations for >1 month.
- Keep TDRs small: <300 words for summary sections; link to long-form research if necessary.
- Add at least one measurable acceptance criterion (test or query) for each TDR.
- Keep raw data where feasible; prefer additive migrations (new columns) over destructive ones.
- Reference legal/security reviews when decisions touch customer data or runtime code mutation.

Automation tips
- When possible, include a small script alongside a TDR to verify acceptance criteria (`scripts/verify-tdr-<id>.sh` / `.ps1` / `.py`).
- Link the TDR filename in PR descriptions to make it discoverable.

Ownership & Lifecycle
- Owner: person or team responsible for implementing the decision.
- Reviewers: at least one peer and one stakeholder (ops/security/legal if relevant).
- Lifecycle: Move status from Proposed → Accepted → Superseded (if replaced) or Deprecated. Do not delete TDRs; create superseding TDRs instead.

Location & Naming
- Store TDRs in `docs/tdr/` with file names: `YYYYMMDD-<short-slug>.md`.

Maintenance
- Schedule quarterly review for TDRs that govern long-lived decisions (data schemas, metrics, security posture).

---
Template created for Energyland and ColorLange projects. Copy and adapt per decision.
