"""
python_fileio_db.py

Runs a file I/O benchmark (write and read) 1000 times and inserts results into the PostgreSQL database.
Prints summary statistics at the end.
"""
import os
import time
import statistics
from dotenv import load_dotenv, find_dotenv
import psycopg2
import numpy as np

# Load environment variables from the correct .env file
load_dotenv(find_dotenv("energy_lang/knowledge_base/.env"), override=True)
DB_URL = os.getenv("DATABASE_URL")

N = 10**6  # 1 million floats
RUNS = 1000
results_write = []
results_read = []
filename = "fileio_benchmark_temp.bin"
data = np.random.rand(N).astype('float64')

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
    """, (source_id, test_name, "Python", "numpy", np.__version__, f"{N} floats"))
    row = cur.fetchone()
    if row:
        benchmark_id = row[0]
    else:
        cur.execute("SELECT id FROM benchmarks WHERE source_id=%s AND test_name=%s AND language=%s AND toolchain=%s AND version=%s AND workload=%s;", (source_id, test_name, "Python", "numpy", np.__version__, f"{N} floats"))
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


# File write benchmark
result_ids_write = []
for i in range(RUNS):
    start = time.perf_counter()
    with open(filename, 'wb') as f:
        f.write(data.tobytes())
    end = time.perf_counter()
    elapsed = end - start
    results_write.append(elapsed)
    rid = insert_benchmark_and_result("file_write", elapsed)
    result_ids_write.append(rid)
    if (i+1) % 100 == 0:
        print(f"Completed {i+1}/{RUNS} file write runs...")
print(f"RESULT_IDS_WRITE: {result_ids_write}")

# File read benchmark
result_ids_read = []
for i in range(RUNS):
    start = time.perf_counter()
    with open(filename, 'rb') as f:
        _ = f.read()
    end = time.perf_counter()
    elapsed = end - start
    results_read.append(elapsed)
    rid = insert_benchmark_and_result("file_read", elapsed)
    result_ids_read.append(rid)
    if (i+1) % 100 == 0:
        print(f"Completed {i+1}/{RUNS} file read runs...")
print(f"RESULT_IDS_READ: {result_ids_read}")

os.remove(filename)

mean_w = statistics.mean(results_write)
median_w = statistics.median(results_write)
min_w = min(results_write)
max_w = max(results_write)
stdev_w = statistics.stdev(results_write)

mean_r = statistics.mean(results_read)
median_r = statistics.median(results_read)
min_r = min(results_read)
max_r = max(results_read)
stdev_r = statistics.stdev(results_read)

print(f"\nFile write ({N} floats) benchmarked {RUNS} times and inserted into DB.")
print(f"Mean:    {mean_w:.6f} s")
print(f"Median:  {median_w:.6f} s")
print(f"Min:     {min_w:.6f} s")
print(f"Max:     {max_w:.6f} s")
print(f"Stddev:  {stdev_w:.6f} s")

print(f"\nFile read ({N} floats) benchmarked {RUNS} times and inserted into DB.")
print(f"Mean:    {mean_r:.6f} s")
print(f"Median:  {median_r:.6f} s")
print(f"Min:     {min_r:.6f} s")
print(f"Max:     {max_r:.6f} s")
print(f"Stddev:  {stdev_r:.6f} s")
print("All file I/O results inserted into the database.")
