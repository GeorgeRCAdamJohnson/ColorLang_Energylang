"""
benchmark_runner.py

Universal benchmark runner for any language/program.
- Measures wall time, CPU time, and (optionally) memory and energy usage.
- Logs results in CSV and JSON formats.
- Energy measurement hooks for Intel RAPL (Linux), pyJoules, and Windows Performance Counters.

Usage:
    python benchmark_runner.py --cmd "python myscript.py" --output results.csv

Dependencies:
- psutil (for memory/CPU)
- Optional: pyJoules (Linux), Intel Power Gadget (Windows), or custom hooks
"""
import argparse
import subprocess
import time
import json
import csv
import os
import sys
import psutil
from datetime import datetime

# Optional: pyJoules for Linux energy measurement
try:
    from pyJoules.device.rapl_device import RaplPackageDomain
    from pyJoules.energy_meter import measure_energy
    HAVE_PYJOULES = True
except ImportError:
    HAVE_PYJOULES = False

def run_benchmark(cmd, energy=False):
    print(f"[Runner] Running: {cmd}")
    start_wall = time.time()
    start_cpu = time.process_time()
    process = psutil.Popen(cmd, shell=True)
    peak_mem = 0
    try:
        while process.is_running():
            try:
                mem = process.memory_info().rss
                if mem > peak_mem:
                    peak_mem = mem
            except Exception:
                pass
            time.sleep(0.05)
    except KeyboardInterrupt:
        process.terminate()
        raise
    end_wall = time.time()
    end_cpu = time.process_time()
    retcode = process.wait()
    return {
        'cmd': cmd,
        'returncode': retcode,
        'wall_time_sec': end_wall - start_wall,
        'cpu_time_sec': end_cpu - start_cpu,
        'peak_memory_bytes': peak_mem
    }

def run_benchmark_with_energy(cmd):
    import platform
    if HAVE_PYJOULES:
        @measure_energy(domains=[RaplPackageDomain(0)])
        def _run():
            return run_benchmark(cmd, energy=False)
        result, energy = _run()
        energy_joules = sum([e.energy for e in energy])
        result['energy_joules'] = energy_joules
        return result
    elif platform.system() == 'Windows':
        # Use AMD uProf if available
        UPROF_PATH = r"C:\Program Files\AMD\AMDuProf\bin\AMDuProfCLI.exe"
        import tempfile, glob, os, csv as pycsv
        import time
        # Prepare batch file to run the benchmark
        batch_path = os.path.abspath("run_benchmark.bat")
        with open(batch_path, "w") as f:
            f.write(f'@echo off\n{cmd}\n')
        # Run uProf
        uprofcmd = [
            UPROF_PATH,
            "timechart",
            "--event", "power",
            "--interval", "100",
            "-o", "uprofile_output",
            "--format", "csv",
            batch_path
        ]
        print(f"[Runner] Running AMD uProf: {' '.join(uprofcmd)}")
        subprocess.run(uprofcmd, capture_output=True, text=True)
        # Find latest timechart.csv
        uprofile_dirs = glob.glob(os.path.join("uprofile_output", "AMDuProf*-Timechart_*"))
        avg_power = None
        total_energy = None
        if uprofile_dirs:
            latest_dir = max(uprofile_dirs, key=os.path.getmtime)
            timechart_path = os.path.join(latest_dir, "timechart.csv")
            if os.path.exists(timechart_path):
                with open(timechart_path, 'r') as f:
                    lines = f.readlines()
                header_idx = None
                for idx, line in enumerate(lines):
                    if line.strip().startswith('RecordId,'):
                        header_idx = idx
                        break
                if header_idx is not None:
                    import io
                    csv_data = ''.join(lines[header_idx:])
                    df = list(pycsv.DictReader(io.StringIO(csv_data)))
                    # Find power columns
                    power_col = None
                    if df and df[0]:
                        for k in df[0].keys():
                            k_stripped = k.strip().lower()
                            if 'package-power' in k_stripped or 'power' in k_stripped:
                                power_col = k
                                break
                    if power_col:
                        powers = [float(row[power_col]) for row in df if row[power_col]]
                        if powers:
                            avg_power = sum(powers) / len(powers)
                            interval_s = 0.1
                            total_energy = sum([float(row[power_col]) * interval_s for row in df if row[power_col]])
                            print(f"[DEBUG] Parsed avg_power: {avg_power}, total_energy: {total_energy} (col: {power_col})")
                        else:
                            print(f"[WARN] Power column '{power_col}' found but no values parsed.")
                    else:
                        print("[WARN] No power column found in uProf CSV header.")
                else:
                    print("[WARN] No RecordId header found in uProf CSV.")
            else:
                print(f"[WARN] uProf timechart.csv not found at {timechart_path}")
        else:
            print("[WARN] No uprofile_output directories found.")
        # Run the actual benchmark for timing/memory
        result = run_benchmark(cmd, energy=False)
        result['power_watts'] = avg_power if avg_power is not None else 0.0
        result['energy_joules_per_op'] = total_energy if total_energy is not None else 0.0
        return result
    else:
        print("[Runner] pyJoules not available. Energy measurement skipped.")
        return run_benchmark(cmd, energy=False)

def main():
    parser = argparse.ArgumentParser(description="Universal Benchmark Runner")
    parser.add_argument('--cmd', required=True, help='Command to run (quoted)')
    parser.add_argument('--output', default='results.csv', help='CSV output file')
    parser.add_argument('--json', default=None, help='Optional JSON output file')
    parser.add_argument('--energy', action='store_true', help='Enable energy measurement (Linux/pyJoules)')
    args = parser.parse_args()

    timestamp = datetime.now().isoformat()
    if args.energy:
        result = run_benchmark_with_energy(args.cmd)
    else:
        result = run_benchmark(args.cmd)
    result['timestamp'] = timestamp

    # Write CSV
    write_header = not os.path.exists(args.output)
    with open(args.output, 'a', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=result.keys())
        if write_header:
            writer.writeheader()
        writer.writerow(result)
    print(f"[Runner] Results written to {args.output}")

    # Write JSON if requested
    if args.json:
        with open(args.json, 'w') as jf:
            json.dump(result, jf, indent=2)
        print(f"[Runner] Results written to {args.json}")

if __name__ == "__main__":
    main()
