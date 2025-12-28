"""
Backfill EnergyLang Benchmark Results from CSV
- Reads results.csv and inserts real data into the database
- Maps each row to the correct benchmark (creating or reusing as needed)
"""
import csv
import os
import sys
import psycopg2
from dotenv import load_dotenv
from datetime import datetime

# Load DB credentials
load_dotenv(os.path.join(os.path.dirname(__file__), '../knowledge_base/.env'))
DB_HOST = os.getenv('ENERGYLANG_DB_HOST', 'localhost')
DB_PORT = os.getenv('ENERGYLANG_DB_PORT', '5432')
DB_NAME = os.getenv('ENERGYLANG_DB_NAME', 'energy_lang')
DB_USER = os.getenv('ENERGYLANG_DB_USER', 'postgres')
DB_PASS = os.getenv('ENERGYLANG_DB_PASS', 'password')

# Connect to DB
conn = psycopg2.connect(
    host=DB_HOST,
    port=DB_PORT,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASS
)

# Helper: get or create benchmark
GET_BENCHMARK = '''
SELECT id FROM benchmarks WHERE test_name=%s AND language=%s AND toolchain=%s AND version=%s AND workload=%s
'''
INSERT_BENCHMARK = '''
INSERT INTO benchmarks (source_id, hardware_id, test_name, language, toolchain, version, workload)
VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
'''

# Helper: get or create hardware profile (simplified, always 1 for now)
GET_HARDWARE = 'SELECT id FROM hardware_profiles LIMIT 1'

# Insert result
INSERT_RESULT = '''
INSERT INTO results (benchmark_id, throughput_ops_per_sec, latency_ms, energy_joules_per_op, power_watts, notes, date_recorded)
VALUES (%s, %s, %s, %s, %s, %s, %s)
'''

with conn, conn.cursor() as cur:
    # Get hardware_id (assume 1 for now)
    cur.execute(GET_HARDWARE)
    hardware_id = cur.fetchone()[0]
    source_id = 1
    toolchain = 'Python-VM'
    version = sys.version.split()[0]
    workload = 'demo'
    language = 'EnergyLang'

    with open('results.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Parse program name from cmd
            cmd = row['cmd']
            if 'run_energylang.py' in cmd:
                parts = cmd.split()
                program_file = parts[-1]
            else:
                continue
            test_name = os.path.basename(program_file)
            # Get or create benchmark
            cur.execute(GET_BENCHMARK, (test_name, language, toolchain, version, workload))
            bench = cur.fetchone()
            if bench:
                benchmark_id = bench[0]
            else:
                cur.execute(INSERT_BENCHMARK, (source_id, hardware_id, test_name, language, toolchain, version, workload))
                benchmark_id = cur.fetchone()[0]
            # Insert result
            cur.execute(INSERT_RESULT, (
                benchmark_id,
                None,  # throughput_ops_per_sec (not measured)
                float(row.get('wall_time_sec', 0)) * 1000,  # latency_ms
                None,  # energy_joules_per_op (not measured)
                None,  # power_watts (not measured)
                f"Imported from CSV on {datetime.now().isoformat()}",
                row.get('timestamp', datetime.now().isoformat())
            ))
    print("[Backfill] All CSV results inserted.")
conn.close()
