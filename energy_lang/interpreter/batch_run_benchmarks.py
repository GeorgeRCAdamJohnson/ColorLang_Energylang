"""
EnergyLang Batch Benchmark Runner
- Runs each EnergyLang demo program 1000 times
- Uses run_and_post_benchmark.py for each run
- Gathers data for statistical analysis
"""
import subprocess
import time
from pathlib import Path

PROGRAMS = [
    "demo_matrix_multiply.energylang",
    "demo_matrix_addition.energylang",
    "demo_fft.energylang",
    "demo_fibonacci.energylang",
    "demo_ml_inference.energylang",
    "demo_chained.energylang",
    "demo_negative.energylang",
    "demo_arithmetic.energylang",
    "example.energylang"
]

RUNS_PER_PROGRAM = 1000
INTERPRETER_DIR = Path(__file__).parent

for program in PROGRAMS:
    print(f"\n[Batch] Running {program} {RUNS_PER_PROGRAM} times...")
    for i in range(RUNS_PER_PROGRAM):
        print(f"[Batch] {program} run {i+1}/{RUNS_PER_PROGRAM}")
        subprocess.run([
            "python",
            "run_and_post_benchmark.py",
            program
        ], cwd=INTERPRETER_DIR, check=True)
        # Optional: sleep to avoid DB overload
        # time.sleep(0.1)
print("\n[Batch] All batch runs complete.")
