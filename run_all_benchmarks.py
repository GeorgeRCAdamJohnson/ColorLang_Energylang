"""
run_all_benchmarks.py

Unified runner to execute all benchmark scripts in sequence.
Logs completion and errors for each benchmark.
"""
import subprocess
import sys

benchmarks = [
    "python_matrix_multiply_db.py",
    "python_matrix_addition_db.py",
    "python_sorting_db.py",
    "python_convolution_db.py",
    "python_fft_db.py",
    "python_fileio_db.py",
    "python_json_db.py",
    "python_ml_inference_db.py",
]

for script in benchmarks:
    print(f"\n=== Running {script} ===")
    try:
        result = subprocess.run([sys.executable, script], check=True, capture_output=True, text=True)
        print(result.stdout)
        print(f"[SUCCESS] {script} completed.")
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] {script} failed.")
        print(e.stdout)
        print(e.stderr)
print("\nAll benchmarks complete.")
