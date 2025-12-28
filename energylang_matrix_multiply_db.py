"""
energylang_matrix_multiply_db.py

Runs the EnergyLang matrix multiply benchmark, inserts results into the database, and prints RESULT_IDS for energy profiling integration.
"""
import os

import os
import psycopg2
from dotenv import load_dotenv, find_dotenv
from datetime import datetime
from energy_lang.interpreter.energylang_vm import run_matrix_multiply_benchmark

# Robustly load .env and use DATABASE_URL
load_dotenv(find_dotenv("energy_lang/knowledge_base/.env"), override=True)
DB_URL = os.getenv("DATABASE_URL")
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()
# Run the EnergyLang matrix multiply benchmark (returns timing, etc.)
result = run_matrix_multiply_benchmark()
# Example result: {'throughput_ops_per_sec': ..., 'latency_ms': ..., 'notes': ...}

# Insert into benchmarks table (get or create)
cur.execute("""
SELECT id FROM benchmarks WHERE test_name=%s AND language=%s AND toolchain=%s AND version=%s AND workload=%s
""", ('matrix_multiply', 'EnergyLang', 'Python-VM', '1.0', '1000x1000'))
row = cur.fetchone()
if row:
    benchmark_id = row[0]
else:
    cur.execute("""
    INSERT INTO benchmarks (source_id, hardware_id, test_name, language, toolchain, version, workload)
    VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
    """, (1, 2, 'matrix_multiply', 'EnergyLang', 'Python-VM', '1.0', '1000x1000'))
    benchmark_id = cur.fetchone()[0]

# Insert result
cur.execute("""
INSERT INTO results (benchmark_id, throughput_ops_per_sec, latency_ms, energy_joules_per_op, power_watts, notes, date_recorded)
VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
""", (
    benchmark_id,
    result.get('throughput_ops_per_sec'),
    result.get('latency_ms'),
    None,  # energy_joules_per_op (to be filled by wrapper)
    None,  # power_watts (to be filled by wrapper)
    result.get('notes', ''),
    datetime.now()
))
result_id = cur.fetchone()[0]
conn.commit()
print(f"RESULT_IDS: [{result_id}]")
cur.close()
conn.close()
