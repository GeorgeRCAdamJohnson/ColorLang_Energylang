"""
collect_baseline_summary.py

Parses `benchmark_runs_small.log` and writes a CSV summary of per-iteration
metrics for each benchmark run found in the log.

Output file: `matrix_multiply_benchmark_results_summary.csv` in repository root.
"""
import re
import csv
from pathlib import Path

ROOT = Path(r"c:\new language")
LOG = ROOT / 'benchmark_runs_small.log'
OUT = ROOT / 'matrix_multiply_benchmark_results_summary.csv'


def parse_blocks(text):
    sep = '\n' + ('=' * 80) + '\n'
    blocks = [b.strip() for b in text.split(sep) if b.strip()]
    return blocks


def extract_from_block(b):
    # Basic fields
    bench_m = re.search(r'^Benchmark:\s*(.*) Iteration:\s*(\d+)/(\d+)', b, re.M)
    if not bench_m:
        return None
    bench = bench_m.group(1).strip()
    iteration = int(bench_m.group(2))
    total = int(bench_m.group(3))

    def findf(pattern, cast=str):
        m = re.search(pattern, b)
        if not m:
            return None
        try:
            return cast(m.group(1))
        except Exception:
            return m.group(1)

    avg_cpu = findf(r'avg_cpu_power:\s*([0-9.eE+-]+)', float)
    total_cpu_energy = findf(r'total_cpu_energy:\s*([0-9.eE+-]+)', float)
    avg_gpu = findf(r'avg_gpu_power:\s*([0-9.eE+-]+)', float)
    gen_path = findf(r'Generated data files path:\s*(.*)')
    live_path = findf(r'Live Profile Output file\s*:\s*(.*)')
    bench_start_ts = findf(r'bench_start_ts:\s*(\S+)')
    bench_start_path = findf(r'bench_start_path:\s*(.*)')
    # last Profile Elapse Time in ms before 'Profile finished'
    profile_times = re.findall(r'Profile Elapse Time in ms:\s*(\d+)', b)
    runtime_ms = int(profile_times[-1]) if profile_times else None
    # result ids (if present)
    result_ids = findf(r'RESULT_IDS:\s*(\[.*?\])') or findf(r'result_ids:\s*(\[.*?\])')

    return {
        'benchmark': bench,
        'iteration': iteration,
        'total_iterations': total,
        'avg_cpu_power_W': avg_cpu,
        'total_cpu_energy_J': total_cpu_energy,
        'avg_gpu_power_W': avg_gpu,
        'generated_path': gen_path,
        'live_profile_file': live_path,
        'bench_start_ts': bench_start_ts,
        'bench_start_path': bench_start_path,
        'runtime_ms': runtime_ms,
        'result_ids': result_ids,
    }


def main():
    if not LOG.exists():
        print('Log not found:', LOG)
        return 1
    text = LOG.read_text(errors='ignore')
    blocks = parse_blocks(text)
    rows = []
    for b in blocks:
        rec = extract_from_block(b)
        if rec:
            rows.append(rec)

    # Write CSV
    if not rows:
        print('No benchmark records found in log')
        return 1

    headers = ['benchmark','iteration','total_iterations','avg_cpu_power_W','total_cpu_energy_J','avg_gpu_power_W','runtime_ms','bench_start_ts','bench_start_path','generated_path','live_profile_file','result_ids']
    with OUT.open('w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        for r in rows:
            writer.writerow({k: r.get(k) for k in headers})

    print('Wrote CSV to', OUT)
    print('Records written:', len(rows))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
