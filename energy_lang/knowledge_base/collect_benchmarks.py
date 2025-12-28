"""
EnergyLang Benchmark Collection Script
- Collects and inserts benchmark results into the PostgreSQL knowledge base
- Supports scraping, local benchmarking, and user submissions
"""

import psycopg2
import os
import platform
import subprocess
from datetime import datetime
# Ensure .env is loaded for DB credentials
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# --- Config ---
DB_HOST = os.getenv('ENERGYLANG_DB_HOST', 'localhost')
DB_PORT = os.getenv('ENERGYLANG_DB_PORT', '5432')
DB_NAME = os.getenv('ENERGYLANG_DB_NAME', 'energy_lang')
DB_USER = os.getenv('ENERGYLANG_DB_USER', 'postgres')
DB_PASS = os.getenv('ENERGYLANG_DB_PASS', 'password')

# --- DB Connection ---
def get_conn():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )

# --- Hardware Profile ---
def detect_hardware():
    return {
        'cpu': platform.processor(),
        'gpu': 'TODO',  # Extend with GPU detection (e.g., nvidia-smi)
        'npu': 'TODO',  # Extend with NPU detection if available
        'ram_gb': int(os.sysconf('SC_PAGE_SIZE') * os.sysconf('SC_PHYS_PAGES') / (1024.**3)) if hasattr(os, 'sysconf') else None,
        'os': platform.platform(),
        'notes': ''
    }

# --- Benchmark Runner (Template) ---
def run_benchmark(test_name, language, toolchain, version, workload):
    # Example: run a matrix multiply in Python, Go, Rust, etc.
    # Replace with actual benchmark logic or subprocess calls
    result = {
        'throughput_ops_per_sec': 0.0,
        'latency_ms': 0.0,
        'energy_joules_per_op': 0.0,
        'power_watts': 0.0,
        'notes': 'Not implemented'
    }
    return result

# --- Insert Functions (Templates) ---
def insert_hardware_profile(conn, profile):
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO hardware_profiles (cpu, gpu, npu, ram_gb, os, notes)
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
        """, (profile['cpu'], profile['gpu'], profile['npu'], profile['ram_gb'], profile['os'], profile['notes']))
        return cur.fetchone()[0]

def insert_benchmark(conn, source_id, hardware_id, test_name, language, toolchain, version, workload):
    with conn.cursor() as cur:
        try:
            cur.execute("""
                INSERT INTO benchmarks (source_id, hardware_id, test_name, language, toolchain, version, workload)
                VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
            """, (source_id, hardware_id, test_name, language, toolchain, version, workload))
            return cur.fetchone()[0]
        except Exception as e:
            # If unique constraint error, fetch the existing benchmark id
            conn.rollback()
            cur.execute("""
                SELECT id FROM benchmarks WHERE source_id=%s AND test_name=%s AND language=%s AND toolchain=%s AND version=%s AND workload=%s
            """, (source_id, test_name, language, toolchain, version, workload))
            row = cur.fetchone()
            if row:
                return row[0]
            else:
                raise e

def insert_result(conn, benchmark_id, result):
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO results (benchmark_id, throughput_ops_per_sec, latency_ms, energy_joules_per_op, power_watts, notes)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (benchmark_id, result['throughput_ops_per_sec'], result['latency_ms'], result['energy_joules_per_op'], result['power_watts'], result['notes']))

# --- Main Collection Flow (Template) ---
def main():
    import sys
    import json
    conn = get_conn()
    profile = detect_hardware()
    hardware_id = insert_hardware_profile(conn, profile)
    # Use EnergyLang program filename as test_name if provided
    program_file = sys.argv[1] if len(sys.argv) > 1 else 'unknown.energylang'
    test_name = os.path.basename(program_file)
    language = 'EnergyLang'
    toolchain = 'Python-VM'
    version = sys.version.split()[0]
    workload = 'demo'  # Or parse from program if needed
    benchmark_id = insert_benchmark(conn, source_id=1, hardware_id=hardware_id, test_name=test_name, language=language, toolchain=toolchain, version=version, workload=workload)
    # Read real benchmark results from temp_bench_result.json
    result_file = 'temp_bench_result.json'
    if os.path.exists(result_file):
        with open(result_file, 'r') as f:
            result = json.load(f)
        # Map fields to expected DB columns, fallback to 0.0 if missing
        db_result = {
            'throughput_ops_per_sec': result.get('throughput_ops_per_sec', 0.0),
            'latency_ms': result.get('latency_ms', 0.0),
            'energy_joules_per_op': result.get('energy_joules_per_op', 0.0),
            'power_watts': result.get('power_watts', 0.0),
            'notes': result.get('notes', '')
        }
    else:
        db_result = {
            'throughput_ops_per_sec': 0.0,
            'latency_ms': 0.0,
            'energy_joules_per_op': 0.0,
            'power_watts': 0.0,
            'notes': 'Result file not found'
        }
    insert_result(conn, benchmark_id, db_result)
    conn.commit()
    conn.close()

if __name__ == '__main__':
    main()
