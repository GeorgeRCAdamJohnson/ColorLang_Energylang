"""
EnergyLang Demo Batch Runner with Energy Profiling
- Runs all .energylang demo programs in this directory 5 times each
- Uses run_and_post_benchmark.py (which enables AMDuProf energy capture)
- Prints progress and summary output
"""
import subprocess
from pathlib import Path

INTERPRETER_DIR = Path(__file__).parent
RUNS_PER_PROGRAM = 5

# Find all .energylang files in this directory (excluding files not meant as demos)
programs = sorted([f for f in INTERPRETER_DIR.glob("*.energylang") if f.is_file()])

if not programs:
    print("[Batch] No .energylang demo files found.")
    exit(1)

for program in programs:
    print(f"\n[Batch] Running {program.name} {RUNS_PER_PROGRAM} times...")
    for i in range(RUNS_PER_PROGRAM):
        print(f"[Batch] {program.name} run {i+1}/{RUNS_PER_PROGRAM}")
        subprocess.run([
            "python",
            "run_and_post_benchmark.py",
            str(program.name)
        ], cwd=INTERPRETER_DIR, check=True)
print("\n[Batch] All demo batch runs complete.")
