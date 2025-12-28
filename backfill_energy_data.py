import os
import pandas as pd
import psycopg2
from dotenv import load_dotenv, find_dotenv

# Load DB credentials
env_path = find_dotenv("energy_lang/knowledge_base/.env")
load_dotenv(env_path, override=True)
DB_URL = os.getenv("DATABASE_URL")

# Map each benchmark to its result ID range and batch size
BENCHMARKS = {
    '2d_convolution':    (3279, 74736, 1000),
    'array_sort':       (2279, 73736, 1000),
    'fft':              (4279, 75736, 1000),
    'json_serialize':   (7279, 78736, 1000),
    'logreg_inference': (9279, 79736, 1000),
    'matrix_addition':  (1279, 72736, 1000),
    'matrix_multiply':  (1,    71736, 1000),
    # Add more as needed
}

UPROFILE_DIR = "uprofile_output"
PROFILE_PREFIX = "AMDuProf-run_benchmark-Timechart_"

# Helper to get all batch folders sorted by time
folders = [f for f in os.listdir(UPROFILE_DIR) if f.startswith(PROFILE_PREFIX)]
folders.sort()

conn = psycopg2.connect(DB_URL)
cursor = conn.cursor()

for bench, (min_id, max_id, batch_size) in BENCHMARKS.items():
    print(f"Processing benchmark: {bench}")
    num_batches = (max_id - min_id + 1) // batch_size
    for batch_idx in range(num_batches):
        batch_start = min_id + batch_idx * batch_size
        batch_end = batch_start + batch_size - 1
        # Find the corresponding profiling folder (assume order matches)
        if batch_idx >= len(folders):
            print(f"No profiling folder for batch {batch_idx} of {bench}")
            continue
        folder = folders[batch_idx]
        csv_path = os.path.join(UPROFILE_DIR, folder, "timechart.csv")
        if not os.path.exists(csv_path):
            print(f"Missing profiling data: {csv_path}")
            continue
        # Find the header line for the data table
        with open(csv_path, 'r') as f:
            lines = f.readlines()
        header_idx = None
        for i, line in enumerate(lines):
            if line.strip().startswith('RecordId,Timestamp'):
                header_idx = i
                break
        if header_idx is None:
            print(f"No data header found in {csv_path}")
            continue
        df = pd.read_csv(csv_path, skiprows=header_idx)
        # Use mean power per record, and estimate energy per op (power * sample interval)
        sample_interval = 0.1  # 100 ms
        for j, rid in enumerate(range(batch_start, batch_end + 1)):
            if j < len(df):
                power = float(df.iloc[j]['socket0-package-power'])
                energy = power * sample_interval
                cursor.execute(
                    """
                    UPDATE results SET power_watts = %s, energy_joules_per_op = %s WHERE id = %s
                    """, (power, energy, rid)
                )
        print(f"Updated result IDs {batch_start}-{batch_end} for {bench}")
    conn.commit()

cursor.close()
conn.close()
print("Backfill complete.")
