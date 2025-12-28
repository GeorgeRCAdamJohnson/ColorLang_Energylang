"""
Automated Benchmark Comparison Script
- Loads original benchmark results (CSV)
- Loads EnergyLang results from the database
- Aligns by workload/test name
- Computes summary statistics and differences
- Outputs comparison tables and plots (CSV and PNG)
"""
import os
import pandas as pd
import psycopg2
from sqlalchemy import create_engine
import matplotlib.pyplot as plt

# --- Config ---
ORIGINAL_CSV = 'matrix_multiply_benchmark_results.csv'  # Update as needed
DB_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:YOUR_PASSWORD@localhost:5432/energy_lang')

# --- Load original benchmark results ---
orig_df = pd.read_csv(ORIGINAL_CSV)
orig_df['benchmark'] = 'original'

# --- Load EnergyLang results from DB ---
engine = create_engine(DB_URL)
query = """
SELECT b.test_name, b.language, b.toolchain, b.version, b.workload, r.throughput_ops_per_sec, r.latency_ms, r.energy_joules_per_op, r.power_watts, r.date_recorded
FROM results r
JOIN benchmarks b ON r.benchmark_id = b.id
WHERE b.language = 'EnergyLang'
"""
energy_df = pd.read_sql(query, engine)
energy_df['benchmark'] = 'EnergyLang'

# --- Align and compare ---
# For this example, align on test_name or workload (adjust as needed)
# Here, we assume matrix multiply is the main workload
orig_stats = orig_df['elapsed_seconds'].describe()
energy_stats = energy_df.groupby('test_name')['latency_ms'].describe()

# --- Output summary table ---
summary = pd.DataFrame({
    'Original_Mean_s': [orig_stats['mean']],
    'Original_Std_s': [orig_stats['std']],
    'EnergyLang_Mean_ms': [energy_stats['mean'].mean()],
    'EnergyLang_Std_ms': [energy_stats['std'].mean()]
})
summary.to_csv('benchmark_comparison_summary.csv', index=False)
print('Summary table saved as benchmark_comparison_summary.csv')

# --- Plot comparison ---
plt.figure(figsize=(8,5))
plt.hist(orig_df['elapsed_seconds']*1000, bins=30, alpha=0.6, label='Original (ms)')
plt.hist(energy_df['latency_ms'], bins=30, alpha=0.6, label='EnergyLang (ms)')
plt.xlabel('Latency (ms)')
plt.ylabel('Frequency')
plt.title('Latency Distribution: Original vs EnergyLang')
plt.legend()
plt.tight_layout()
plt.savefig('benchmark_comparison_latency.png')
print('Comparison plot saved as benchmark_comparison_latency.png')
