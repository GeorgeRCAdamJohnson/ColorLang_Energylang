"""
reparse_uprof_and_update_db.py

- Scans all uprofile_output/AMDuProf*-Timechart_*/timechart.csv files
- Parses power/energy data
- Updates the corresponding DB results row for each benchmark run
"""
import os
import glob
import csv
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

DB_HOST = os.getenv('ENERGYLANG_DB_HOST', 'localhost')
DB_PORT = os.getenv('ENERGYLANG_DB_PORT', '5432')
DB_NAME = os.getenv('ENERGYLANG_DB_NAME', 'energy_lang')
DB_USER = os.getenv('ENERGYLANG_DB_USER', 'postgres')
DB_PASS = os.getenv('ENERGYLANG_DB_PASS', 'password')

UPROF_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../uprofile_output'))


def get_conn():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )

def parse_timechart_csv(csv_path):
    with open(csv_path, 'r') as f:
        lines = f.readlines()
    header_idx = None
    for idx, line in enumerate(lines):
        if line.strip().startswith('RecordId,'):
            header_idx = idx
            break
    if header_idx is None:
        return None, None
    import io
    csv_data = ''.join(lines[header_idx:])
    df = list(csv.DictReader(io.StringIO(csv_data)))
    power_col = None
    if df and df[0]:
        for k in df[0].keys():
            k_stripped = k.strip().lower()
            if 'package-power' in k_stripped or 'power' in k_stripped:
                power_col = k
                break
    if not power_col:
        return None, None
    powers = [float(row[power_col]) for row in df if row[power_col]]
    if not powers:
        return None, None
    avg_power = sum(powers) / len(powers)
    interval_s = 0.1
    total_energy = sum([float(row[power_col]) * interval_s for row in df if row[power_col]])
    return avg_power, total_energy

def update_db_with_power(csv_path, avg_power, total_energy):
    # Use the directory timestamp as a proxy for matching the DB row
    # (Assumes 1:1 mapping between run and DB result by timestamp)
    dir_name = os.path.basename(os.path.dirname(csv_path))
    # Extract timestamp from dir_name, e.g. AMDuProf-run_benchmark-Timechart_Nov-13-2025_13-59-16
    import re
    m = re.search(r'_(Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct)-(\d{2})-(\d{4})_(\d{2})-(\d{2})-(\d{2})', dir_name)
    if not m:
        print(f"[WARN] Could not extract timestamp from {dir_name}")
        return
    # Build ISO timestamp string (approximate)
    month_map = {'Jan':'01','Feb':'02','Mar':'03','Apr':'04','May':'05','Jun':'06','Jul':'07','Aug':'08','Sep':'09','Oct':'10','Nov':'11','Dec':'12'}
    month = month_map[m.group(1)]
    day = m.group(2)
    year = m.group(3)
    hour = m.group(4)
    minute = m.group(5)
    second = m.group(6)
    iso_ts = f"{year}-{month}-{day}T{hour}:{minute}:{second}"
    # Update the most recent results row with a matching or close timestamp
    conn = get_conn()
    with conn.cursor() as cur:
        # Find the closest results.id within a 2-minute window
        cur.execute("""
            SELECT id FROM results
            WHERE date_recorded >= %s::timestamp - interval '2 minutes'
              AND date_recorded <= %s::timestamp + interval '2 minutes'
            ORDER BY ABS(EXTRACT(EPOCH FROM (date_recorded - %s::timestamp))) ASC
            LIMIT 1
        """, (iso_ts, iso_ts, iso_ts))
        row = cur.fetchone()
        if row:
            result_id = row[0]
            cur.execute("""
                UPDATE results
                SET power_watts = %s, energy_joules_per_op = %s
                WHERE id = %s
            """, (avg_power, total_energy, result_id))
            conn.commit()
            print(f"[INFO] Updated DB for {csv_path} (result_id={result_id}) with power={avg_power:.2f}W, energy={total_energy:.2f}J")
        else:
            print(f"[WARN] No matching results row found for {csv_path} (timestamp {iso_ts})")
    conn.close()

def main():
    csv_files = glob.glob(os.path.join(UPROF_DIR, 'AMDuProf*-Timechart_*', 'timechart.csv'))
    print(f"Found {len(csv_files)} uProf CSVs.")
    for csv_path in csv_files:
        avg_power, total_energy = parse_timechart_csv(csv_path)
        if avg_power is not None and total_energy is not None:
            update_db_with_power(csv_path, avg_power, total_energy)
        else:
            print(f"[WARN] Skipped {csv_path} (no power data)")

if __name__ == "__main__":
    main()
