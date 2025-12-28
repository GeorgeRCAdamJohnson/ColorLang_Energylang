"""
Import entries from `benchmark_runs.log` into the EnergyLang knowledge-base Postgres DB.

This script is defensive and attempts to parse Python-dict-like records embedded in the
log (the harness prints per-iteration dicts). For each record it will:
 - get or create a `sources` row (name = 'benchmark_runs.log import')
 - get or create a `benchmarks` row (test_name, language, toolchain, workload)
 - insert a `results` row with latency_ms, energy_joules_per_op (stored as total J/run), power_watts, notes

Run from workspace root: python tools/import_benchmark_runs_log_to_db.py
"""
import os
import re
import ast
import psycopg2
from dotenv import load_dotenv


LOG_PATH = os.path.join(os.getcwd(), 'benchmark_runs.log')
ENV_PATH = os.path.join(os.getcwd(), 'energy_lang', 'knowledge_base', '.env')

load_dotenv(ENV_PATH)
DB_URL = os.environ.get('DATABASE_URL')
if not DB_URL:
    raise SystemExit('DATABASE_URL not found in .env')


def detect_language_and_toolchain(path_or_name: str):
    p = path_or_name.lower()
    if p.endswith('.py') or 'python' in p:
        tool = 'Python'
        # try to detect numpy usage
        if 'numpy' in p or 'np.dot' in p:
            return 'Python', 'numpy'
        return 'Python', 'CPython'
    if p.endswith('.cpp') or 'benchmarks' in p or 'matrix_multiply.cpp' in p:
        return 'C++', 'tuned'
    if 'energylang' in p or p.endswith('.clc') or p.endswith('.energylang'):
        return 'EnergyLang', 'Python-VM'
    return 'Unknown', None


def parse_log(path):
    records = []
    text = open(path, 'r', encoding='utf-8', errors='ignore').read()
    # split into blocks separated by long ===== lines
    blocks = re.split(r"\n={5,}.*?\n", text)
    for blk in blocks:
        if 'Benchmark:' not in blk:
            continue
        rec = {}
        # Benchmark and iteration
        m = re.search(r"Benchmark:\s*(.+?)\s+Iteration:\s*(\d+)/(\d+)", blk)
        if m:
            rec['benchmark'] = m.group(1).strip()
            rec['iteration'] = int(m.group(2))
            rec['iterations_total'] = int(m.group(3))

        # Generated path
        m = re.search(r"Generated data files path:\s*(.+)", blk)
        if m:
            rec['generated_path'] = m.group(1).strip()

        # Live profile file
        m = re.search(r"Live Profile Output file\s*:\s*(.+)", blk)
        if m:
            rec['live_profile_file'] = m.group(1).strip()

        # GPU summary
        m = re.search(r"avg_gpu_power:\s*([^\n\r]+)", blk)
        if m:
            v = m.group(1).strip()
            rec['avg_gpu_power'] = None if v.lower() in ('none', 'n', '') else float(v)
        m = re.search(r"max_gpu_power:\s*([^\n\r]+)", blk)
        if m:
            v = m.group(1).strip()
            rec['max_gpu_power'] = None if v.lower() in ('none', 'n', '') else float(v)

        # CPU summary
        m = re.search(r"avg_cpu_power:\s*([^\n\r]+)", blk)
        if m:
            v = m.group(1).strip()
            rec['avg_cpu_power'] = None if v.lower() in ('none', 'n', '') else float(v)
        m = re.search(r"total_cpu_energy:\s*([^\n\r]+)", blk)
        if m:
            v = m.group(1).strip()
            rec['total_cpu_energy'] = None if v.lower() in ('none', 'n', '') else float(v)

        # result ids (could be printed as RESULT_IDS: or result_ids:)
        m = re.search(r"RESULT_IDS:\s*(\[.*?\])", blk)
        if not m:
            m = re.search(r"result_ids:\s*(\[.*?\])", blk)
        if m:
            try:
                rec['result_ids'] = ast.literal_eval(m.group(1))
            except Exception:
                rec['result_ids'] = None

        # runtime: sometimes harness prints a summary or bench prints BENCH_START timestamps elsewhere
        m = re.search(r"Profile Elapse Time in ms:\s*(\d+)", blk)
        if m:
            # the last occurrence is total elapsed; take the largest number found
            all_ms = [int(x) for x in re.findall(r"Profile Elapse Time in ms:\s*(\d+)", blk)]
            if all_ms:
                rec['runtime_ms'] = max(all_ms)

        # if we've found at least a benchmark name, keep the record
        if 'benchmark' in rec:
            records.append(rec)

    return records


def get_or_create_source(cur, name='benchmark_runs.log import'):
    cur.execute("SELECT id FROM sources WHERE name=%s", (name,))
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute("INSERT INTO sources (name) VALUES (%s) RETURNING id", (name,))
    return cur.fetchone()[0]


def get_or_create_benchmark(cur, source_id, test_name, language, toolchain, version=None, workload=None):
    # Try insert with ON CONFLICT DO NOTHING (unique constraint exists in schema)
    cur.execute(
        """
        INSERT INTO benchmarks (source_id, test_name, language, toolchain, version, workload)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (source_id, test_name, language, toolchain, version, workload) DO NOTHING
        RETURNING id
        """,
        (source_id, test_name, language, toolchain, version, workload),
    )
    row = cur.fetchone()
    if row:
        return row[0]
    # otherwise select existing
    cur.execute(
        "SELECT id FROM benchmarks WHERE source_id=%s AND test_name=%s AND language=%s AND toolchain=%s AND version=%s AND workload=%s",
        (source_id, test_name, language, toolchain, version, workload),
    )
    return cur.fetchone()[0]


def insert_result(cur, benchmark_id, latency_ms=None, energy_joules_per_op=None, power_watts=None, notes=None):
    cur.execute(
        """
        INSERT INTO results (benchmark_id, latency_ms, energy_joules_per_op, power_watts, notes)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """,
        (benchmark_id, latency_ms, energy_joules_per_op, power_watts, notes),
    )
    return cur.fetchone()[0]


def main():
    if not os.path.exists(LOG_PATH):
        raise SystemExit(f'Log file not found: {LOG_PATH}')

    records = parse_log(LOG_PATH)
    print(f'Found {len(records)} candidate records in log')

    conn = psycopg2.connect(DB_URL)
    inserted = 0
    with conn:
        with conn.cursor() as cur:
            source_id = get_or_create_source(cur)
            batch = 0
            for r in records:
                # normalize keys to strings
                benchmark_raw = str(r.get('benchmark') or r.get('cmd') or r.get('program') or 'unknown')
                test_name = os.path.basename(benchmark_raw)
                lang, toolchain = detect_language_and_toolchain(benchmark_raw)
                version = r.get('version')
                workload = r.get('workload') or r.get('N') or r.get('size')

                bench_id = get_or_create_benchmark(cur, source_id, test_name, lang, toolchain, version, workload)

                latency_ms = None
                if 'runtime_ms' in r:
                    try:
                        latency_ms = float(r.get('runtime_ms'))
                    except Exception:
                        latency_ms = None
                elif 'elapsed_ms' in r:
                    try:
                        latency_ms = float(r.get('elapsed_ms'))
                    except Exception:
                        latency_ms = None

                energy_j = None
                if 'total_cpu_energy_J' in r:
                    try:
                        energy_j = float(r.get('total_cpu_energy_J'))
                    except Exception:
                        energy_j = None
                elif 'total_energy_J' in r:
                    try:
                        energy_j = float(r.get('total_energy_J'))
                    except Exception:
                        energy_j = None

                power_w = None
                if 'avg_cpu_power_W' in r:
                    try:
                        power_w = float(r.get('avg_cpu_power_W'))
                    except Exception:
                        power_w = None

                notes = []
                if 'iteration' in r:
                    notes.append(f"iter={r.get('iteration')}")
                if 'generated_path' in r:
                    notes.append(f"gen={r.get('generated_path')}")
                if 'live_profile_file' in r:
                    notes.append(f"profile={r.get('live_profile_file')}")
                notes = '; '.join(notes) if notes else None

                try:
                    insert_result(cur, bench_id, latency_ms=latency_ms, energy_joules_per_op=energy_j, power_watts=power_w, notes=notes)
                    inserted += 1
                except Exception as e:
                    print('Insert failed for', test_name, '->', e)
                batch += 1
                if batch % 100 == 0:
                    conn.commit()
            conn.commit()

    print(f'Inserted {inserted} result rows')


if __name__ == '__main__':
    main()
