"""
Orchestrator that selects the best language/implementation for a benchmark
based on historical metrics (avg power, runtime, or energy).

Usage examples:
  python tools/orchestrator_power_scheduler.py --benchmark matrix_multiply \
      --objective min_power --dry-run

  python tools/orchestrator_power_scheduler.py --benchmark matrix_multiply \
      --objective min_energy --config tools/orchestrator_config_example.json --execute

This script attempts the following in order:
  1. Read aggregated metrics from the local Postgres DB (if `energy_lang/knowledge_base/.env` exists
     and `psycopg2` is available).
  2. Fall back to scanning for common aggregate CSV files in the repo (e.g. files containing
     "matrix_multiply" or "benchmark_aggregated").

The script prints a recommended implementation (language/source) and, if provided a config
mapping (JSON), will show or execute the mapped shell command.
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import shlex
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Tuple


REPO_ROOT = Path(__file__).resolve().parents[1]


def find_aggregate_csvs() -> List[Path]:
    candidates = []
    patterns = ["**/*matrix*multiply*.csv", "**/*benchmark*aggregated*.csv", "**/*benchmark*summary*.csv"]
    for p in patterns:
        candidates.extend(list(REPO_ROOT.glob(p)))
    # remove duplicates and sort
    return sorted(set(candidates))


def read_first_usable_csv(path: Path) -> Tuple[List[Dict[str, str]], List[str]]:
    with path.open("r", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        rows = [r for r in reader]
        return rows, reader.fieldnames or []


def choose_best(rows: List[Dict[str, str]], objective: str, benchmark_filter: Optional[str]) -> Optional[Dict[str, str]]:
    # Normalize candidate rows by trying to map common column names
    def get_field(r, names):
        for n in names:
            if n in r and r[n] not in (None, "", "NA", "N", "None"):
                return r[n]
        return None

    candidates = []
    for r in rows:
        bname = get_field(r, ["benchmark", "name", "benchmark_name"])
        source = get_field(r, ["source", "language", "impl", "implementation"])
        if benchmark_filter and bname and benchmark_filter.lower() not in bname.lower():
            continue
        # numeric fields
        try:
            avg_power = float(get_field(r, ["avg_power", "mean_power_w", "power_watts", "avg_gpu_power"]) or 0)
        except Exception:
            avg_power = None
        try:
            latency_ms = float(get_field(r, ["avg_latency_ms", "mean_runtime_ms", "latency_ms", "runtime_ms"]) or 0)
        except Exception:
            latency_ms = None
        try:
            avg_energy = float(get_field(r, ["avg_energy_j", "mean_energy_j", "energy_joules", "energy_joule", "energy_joules_per_op"]) or 0)
        except Exception:
            avg_energy = None

        candidates.append({
            "benchmark": bname or "",
            "source": source or "",
            "avg_power": avg_power,
            "latency_ms": latency_ms,
            "avg_energy": avg_energy,
            "raw": r,
        })

    if not candidates:
        return None

    key = None
    if objective == "min_power":
        key = lambda c: (c["avg_power"] if c["avg_power"] is not None else float("inf"))
    elif objective == "min_energy":
        key = lambda c: (c["avg_energy"] if c["avg_energy"] is not None else float("inf"))
    elif objective == "min_runtime":
        key = lambda c: (c["latency_ms"] if c["latency_ms"] is not None else float("inf"))
    else:
        raise ValueError("unknown objective")

    best = min(candidates, key=key)
    return best


def load_config(path: Optional[Path]) -> Dict:
    if not path:
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def try_db_query(benchmark_filter: Optional[str]) -> Optional[List[Dict[str, str]]]:
    # Attempt to load DATABASE_URL from energy_lang/knowledge_base/.env
    env_path = REPO_ROOT / "energy_lang" / "knowledge_base" / ".env"
    if not env_path.exists():
        return None
    try:
        from dotenv import dotenv_values
        import psycopg2
        from psycopg2.extras import RealDictCursor
    except Exception:
        return None

    cfg = dotenv_values(env_path)
    db_url = cfg.get("DATABASE_URL")
    if not db_url:
        return None

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # A conservative query that selects benchmark name, source name, and averages
        q = """
        SELECT b.name as benchmark, s.name as source,
          avg(r.power_watts) as avg_power,
          avg(r.latency_ms) as avg_latency_ms,
          avg(r.energy_joules_per_op) as avg_energy
        FROM results r
        JOIN benchmarks b ON r.benchmark_id = b.id
        JOIN sources s ON b.source_id = s.id
        GROUP BY b.name, s.name
        """
        cur.execute(q)
        rows = [dict(r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return rows
    except Exception:
        return None


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--benchmark", required=True, help="Benchmark name or substring to filter")
    p.add_argument("--objective", choices=["min_power", "min_energy", "min_runtime"], default="min_power")
    p.add_argument("--config", help="JSON config mapping benchmark->implementation->command")
    p.add_argument("--dry-run", action="store_true", help="Don't execute; just print recommendation")
    p.add_argument("--execute", action="store_true", help="Run the mapped command for the chosen impl (if config maps it)")
    args = p.parse_args()

    # 1) Try DB
    rows = try_db_query(args.benchmark)

    # 2) Fallback to CSV
    if rows is None:
        csvs = find_aggregate_csvs()
        if not csvs:
            print("No DB available and no aggregate CSVs found in repo (falling back to manual config).")
            rows = []
        else:
            for c in csvs:
                try:
                    parsed_rows, fields = read_first_usable_csv(c)
                    if parsed_rows:
                        print(f"Using aggregate CSV: {c}")
                        # Normalize header names to dicts with string values
                        rows = parsed_rows
                        break
                except Exception:
                    continue

    if not rows:
        print("No historical metrics found. Please provide a `--config` mapping and run with `--execute`.")
        cfg = load_config(Path(args.config) if args.config else None)
        print("Loaded config keys:", ", ".join(cfg.keys()) if cfg else "(none)")
        return

    best = choose_best(rows, args.objective, args.benchmark)
    if best is None:
        print("No candidate rows matched the benchmark filter.")
        return

    print("Recommendation:")
    print(f"  Benchmark: {best['benchmark']}")
    print(f"  Implementation (source): {best['source']}")
    print(f"  Avg power (W): {best['avg_power']}")
    print(f"  Avg runtime (ms): {best['latency_ms']}")
    print(f"  Avg energy (J): {best['avg_energy']}")

    cfg = load_config(Path(args.config) if args.config else None)
    impl = best["source"]
    # find mapping: try benchmark->impl then impl key directly
    cmd = None
    if cfg:
        bcfg = cfg.get(best.get("benchmark")) or cfg.get(args.benchmark) or cfg
        if isinstance(bcfg, dict):
            # keys might be implementation names, try to fuzzy match
            for k, v in bcfg.items():
                if k.lower() == impl.lower() or k.lower() in impl.lower() or impl.lower() in k.lower():
                    if isinstance(v, dict):
                        cmd = v.get("cmd")
                    elif isinstance(v, str):
                        cmd = v
                    break

    if cmd:
        print(f"Mapped command for chosen impl: {cmd}")
        if args.execute:
            if args.dry_run:
                print("Dry-run: not executing.")
            else:
                print("Executing command...")
                # On Windows powershell, pass the command to shell
                try:
                    completed = subprocess.run(cmd, shell=True)
                    print("Process exited with", completed.returncode)
                except Exception as e:
                    print("Failed to execute command:", e)
    else:
        print("No command mapping found in config. Provide a mapping like:")
        example = {
            args.benchmark: {
                impl: {
                    "cmd": "C:/full/path/to/impl --size 1000 --other-args"
                }
            }
        }
        print(json.dumps(example, indent=2))


if __name__ == "__main__":
    main()
