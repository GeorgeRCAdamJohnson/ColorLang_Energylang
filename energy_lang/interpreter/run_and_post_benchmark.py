"""
EnergyLang Benchmark Automation Script
- Runs an EnergyLang program using the interpreter
- Measures power/energy usage via benchmark_runner.py
- Posts results to the database using collect_benchmarks.py
"""
import os
import sys
import subprocess
import json
from pathlib import Path

# Paths (adjust if needed)
PYTHON = sys.executable
INTERPRETER = "run_energylang.py"
BENCHMARK_RUNNER = str(Path("../../benchmark_runner.py").resolve())
COLLECT_BENCHMARKS = str(Path("../knowledge_base/collect_benchmarks.py").resolve())


def run_benchmark_and_post(program_path):
    # Quote all paths and arguments for Windows
    quoted_python = f'"{PYTHON}"' if ' ' in PYTHON else PYTHON
    quoted_interpreter = f'"{INTERPRETER}"' if ' ' in INTERPRETER else INTERPRETER
    quoted_program = f'"{program_path}"' if ' ' in program_path else program_path
    quoted_benchmark_runner = f'"{BENCHMARK_RUNNER}"' if ' ' in BENCHMARK_RUNNER else BENCHMARK_RUNNER
    quoted_collect_benchmarks = f'"{COLLECT_BENCHMARKS}"' if ' ' in COLLECT_BENCHMARKS else COLLECT_BENCHMARKS

    # The full command for --cmd must be quoted as a single string
    full_cmd = f'{quoted_python} {quoted_interpreter} {quoted_program}'
    bench_cmd = f'{quoted_python} {quoted_benchmark_runner} --cmd "{full_cmd}" --energy --json temp_bench_result.json'
    print(f"[Auto] Running benchmark: {bench_cmd}")
    subprocess.run(bench_cmd, shell=True, check=True)
    # Read benchmark result
    with open('temp_bench_result.json', 'r') as f:
        result = json.load(f)
    # Post to DB (calls main in collect_benchmarks.py, which can be extended to accept result as input)
    print("[Auto] Posting result to DB via collect_benchmarks.py (extend as needed)")
    # Pass the program filename to collect_benchmarks.py for unique test_name
    subprocess.run(f'{quoted_python} {quoted_collect_benchmarks} {quoted_program}', shell=True, check=True)
    print("[Auto] Done.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python run_and_post_benchmark.py <program.energylang>")
        sys.exit(1)
    run_benchmark_and_post(sys.argv[1])
