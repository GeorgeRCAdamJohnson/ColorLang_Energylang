"""
python_ml_inference_db.py

Runs a logistic regression inference benchmark 1000 times and inserts results into the PostgreSQL database.
Prints summary statistics at the end.
"""
import numpy as np
import time
import os
import statistics
from dotenv import load_dotenv, find_dotenv
import psycopg2
from sklearn.linear_model import LogisticRegression

# Load environment variables from the correct .env file
load_dotenv(find_dotenv("energy_lang/knowledge_base/.env"), override=True)
DB_URL = os.getenv("DATABASE_URL")

N = 10000  # Number of samples
D = 100    # Number of features
RUNS = 1000
results = []

# Generate random data for inference
X = np.random.rand(N, D)
y = np.random.randint(0, 2, size=N)

# Train a logistic regression model
model = LogisticRegression(solver='liblinear')
model.fit(X, y)

# Warm-up
model.predict(X)

def get_db_conn():
    return psycopg2.connect(DB_URL)

def insert_benchmark_and_result(elapsed):
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
    """, (source_id, "logreg_inference", "Python", "scikit-learn", model.__module__.split('.')[0], f"{N}x{D}"))
    row = cur.fetchone()
    if row:
        benchmark_id = row[0]
    else:
        cur.execute("SELECT id FROM benchmarks WHERE source_id=%s AND test_name=%s AND language=%s AND toolchain=%s AND version=%s AND workload=%s;", (source_id, "logreg_inference", "Python", "scikit-learn", model.__module__.split('.')[0], f"{N}x{D}"))
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


result_ids = []
for i in range(RUNS):
    start = time.perf_counter()
    model.predict(X)
    end = time.perf_counter()
    elapsed = end - start
    results.append(elapsed)
    rid = insert_benchmark_and_result(elapsed)
    result_ids.append(rid)
    if (i+1) % 100 == 0:
        print(f"Completed {i+1}/{RUNS} runs...")
print(f"RESULT_IDS: {result_ids}")

mean = statistics.mean(results)
median = statistics.median(results)
min_time = min(results)
max_time = max(results)
stdev = statistics.stdev(results)

print(f"\nLogistic regression inference ({N} samples, {D} features) benchmarked {RUNS} times and inserted into DB.")
print(f"Mean:    {mean:.6f} s")
print(f"Median:  {median:.6f} s")
print(f"Min:     {min_time:.6f} s")
print(f"Max:     {max_time:.6f} s")
print(f"Stddev:  {stdev:.6f} s")
print("All ML inference results inserted into the database.")
