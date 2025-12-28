"""
python_json_db.py

Runs a JSON serialization/deserialization benchmark 1000 times and inserts results into the PostgreSQL database.
Prints summary statistics at the end.
"""
import json
import time
import os
import statistics
from dotenv import load_dotenv, find_dotenv
import psycopg2
import numpy as np

# Load environment variables from the correct .env file
load_dotenv(find_dotenv("energy_lang/knowledge_base/.env"), override=True)
DB_URL = os.getenv("DATABASE_URL")

N = 100000  # 100,000 records
RUNS = 1000
results_serialize = []
results_deserialize = []

# Generate a list of dicts
records = [
    {"id": i, "value": float(np.random.rand()), "name": f"item_{i}"}
    for i in range(N)
]

# Warm-up
json_str = json.dumps(records)
json.loads(json_str)

def get_db_conn():
    return psycopg2.connect(DB_URL)


def insert_benchmark_and_result(test_name, elapsed):
    conn = get_db_conn()
    cur = conn.cursor()
    # Insert source if not exists
    cur.execute("INSERT INTO sources (name) VALUES (%s) ON CONFLICT (name) DO NOTHING;", ("Local Python Benchmark",))
    cur.execute("SELECT id FROM sources WHERE name=%s;", ("Local Python Benchmark",))
    source_id = cur.fetchone()[0]
    # Insert benchmark if not exists
    cur.execute("""
        INSERT INTO benchmarks (source_id, test_name, language, toolchain, version, workload)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (source_id, test_name, language, toolchain, version, workload) DO NOTHING
        RETURNING id;
    """, (source_id, test_name, "Python", "stdlib+numpy", np.__version__, f"{N} records"))
    row = cur.fetchone()
    if row:
        benchmark_id = row[0]
    else:
        cur.execute("SELECT id FROM benchmarks WHERE source_id=%s AND test_name=%s AND language=%s AND toolchain=%s AND version=%s AND workload=%s;", (source_id, test_name, "Python", "stdlib+numpy", np.__version__, f"{N} records"))
        benchmark_id = cur.fetchone()[0]
    # Insert result and return its ID
    cur.execute("""
        INSERT INTO results (benchmark_id, latency_ms, notes)
        VALUES (%s, %s, %s)
        RETURNING id;
    """, (benchmark_id, elapsed * 1000, "Automated local run"))
    result_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return result_id


import argparse

def main():
    parser = argparse.ArgumentParser(description="Run a single JSON benchmark (serialize or deserialize)")
    parser.add_argument('--mode', choices=['serialize', 'deserialize'], required=True, help='Benchmark mode')
    args = parser.parse_args()


    if args.mode == 'serialize':
        result_ids = []
        for i in range(RUNS):
            start = time.perf_counter()
            json_str = json.dumps(records)
            end = time.perf_counter()
            elapsed = end - start
            rid = insert_benchmark_and_result("json_serialize", elapsed)
            result_ids.append(rid)
            if (i+1) % 100 == 0:
                print(f"Completed {i+1}/{RUNS} JSON serialization runs...")
        print(f"RESULT_IDS: {result_ids}")
    elif args.mode == 'deserialize':
        json_str = json.dumps(records)
        result_ids = []
        for i in range(RUNS):
            start = time.perf_counter()
            _ = json.loads(json_str)
            end = time.perf_counter()
            elapsed = end - start
            rid = insert_benchmark_and_result("json_deserialize", elapsed)
            result_ids.append(rid)
            if (i+1) % 100 == 0:
                print(f"Completed {i+1}/{RUNS} JSON deserialization runs...")
        print(f"RESULT_IDS: {result_ids}")

if __name__ == "__main__":
    main()
