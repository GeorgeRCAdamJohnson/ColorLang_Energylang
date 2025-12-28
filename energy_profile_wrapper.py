"""
energy_profile_wrapper.py

Wraps a benchmark script with CPU (AMD uProf) and GPU (NVIDIA-smi) energy/power logging.
After the run, parses and prints average/max power for both CPU and GPU.
"""
import subprocess
import time
import os
import pandas as pd
import shlex
import sys
import glob


# --- CONFIG ---
BENCHMARK_SCRIPTS = [
    os.path.join("benchmarks", "matrix_multiply.cpp"),
    # Python scripts intentionally excluded for this sweep
    "energylang_matrix_multiply_db.py",
    os.path.join("benchmarks", "matrix_multiply.go"),
    os.path.join("benchmarks", "matrix_multiply.rs"),
    os.path.join("benchmarks", "MatrixMultiply.java"),
]
UPROF_PATH = r"C:\Program Files\AMD\AMDuProf\bin\AMDuProfCLI.exe"  # Update if different
UPROF_OUT = "uprofile_energy.txt"
NVIDIA_LOG = "nvidia_power_log.csv"
MASTER_LOG = "benchmark_runs.log"
DIAG_DIR = "diagnostics"




for BENCHMARK_SCRIPT in BENCHMARK_SCRIPTS:
    # Compile or prepare the run command once per benchmark to avoid repeated compilation
    ext = os.path.splitext(BENCHMARK_SCRIPT)[1].lower()
    run_cmd = None
    cleanup_files = []
    try:
        if ext == ".py":
            # Quote the Python executable path and the script path separately
            run_cmd = f'"{sys.executable}" "{os.path.abspath(BENCHMARK_SCRIPT)}" --mode serialize'
        elif ext == ".go":
            exe_name = os.path.abspath(f"{os.path.splitext(os.path.basename(BENCHMARK_SCRIPT))[0]}_go.exe")
            subprocess.run(["go", "build", "-o", exe_name, BENCHMARK_SCRIPT], check=True)
            run_cmd = exe_name
            cleanup_files.append(exe_name)
        elif ext == ".rs":
            exe_name = os.path.abspath(f"{os.path.splitext(os.path.basename(BENCHMARK_SCRIPT))[0]}_rs.exe")
            subprocess.run(["rustc", BENCHMARK_SCRIPT, "-o", exe_name], check=True)
            run_cmd = exe_name
            cleanup_files.append(exe_name)
        elif ext == ".cpp":
            exe_name = os.path.abspath(f"{os.path.splitext(os.path.basename(BENCHMARK_SCRIPT))[0]}_cpp.exe")
            subprocess.run(["g++", BENCHMARK_SCRIPT, "-o", exe_name], check=True)
            run_cmd = exe_name
            cleanup_files.append(exe_name)
        elif ext == ".java":
            java_file = os.path.abspath(BENCHMARK_SCRIPT)
            class_dir = os.path.dirname(java_file)
            subprocess.run(["javac", java_file], check=True)
            class_name = os.path.splitext(os.path.basename(java_file))[0]
            run_cmd = f'java -cp "{class_dir}" {class_name}'
            cleanup_files.append(os.path.join(class_dir, class_name + ".class"))
        else:
            print(f"Unknown file extension for {BENCHMARK_SCRIPT}, skipping.")
            continue
    except Exception as e:
        print(f"Failed to prepare benchmark {BENCHMARK_SCRIPT}: {e}")
        continue

    # Verify the prepared run command (executable) exists for compiled targets
    if ext in ('.go', '.rs', '.cpp'):
        if not os.path.exists(run_cmd):
            print(f"Prepared executable not found for {BENCHMARK_SCRIPT}: {run_cmd}. Skipping this benchmark.")
            # Clean any partial compiled files
            for fpath in cleanup_files:
                try:
                    if os.path.exists(fpath):
                        os.remove(fpath)
                except Exception:
                    pass
            continue

    for iteration in range(1000):
        print(f"\n=== Profiling {BENCHMARK_SCRIPT} (Iteration {iteration+1}/1000) ===")
        # --- Start NVIDIA-smi (GPU power logging) per-iteration ---
        nvidia_log_file = f"nvidia_power_log_{os.path.splitext(os.path.basename(BENCHMARK_SCRIPT))[0]}_{iteration+1}.csv"
        nvidia_log = open(nvidia_log_file, "w")
        nvidia_proc = subprocess.Popen([
            "nvidia-smi", "--query-gpu=timestamp,power.draw", "--format=csv", "-lms", "1000"
        ], stdout=nvidia_log)

        time.sleep(1)  # Small delay to ensure logging starts

        # --- Create a batch file to run the benchmark script ---
        batch_path = os.path.join(os.getcwd(), "run_benchmark.bat")
        # Ensure batch calls the command with proper quoting.
        cmd_to_run = str(run_cmd)
        if '"' in cmd_to_run:
            batch_line = cmd_to_run
        else:
            batch_line = f'"{cmd_to_run}"' if ' ' in cmd_to_run else cmd_to_run
        with open(batch_path, "w") as f:
            f.write(f'@echo off\n{batch_line}\n')

        # --- Run AMD uProf on the batch file ---
        uprofcmd = [
            UPROF_PATH,
            "timechart",
            "--event", "power",
            "--interval", "1000",
            "-o", "uprofile_output",
            "--format", "csv",
            batch_path
        ]
        uprofcmd_proc = subprocess.run(uprofcmd, capture_output=True, text=True)
        # Keep the nvidia log file handle available until we parse it

        # --- Stop per-iteration NVIDIA logging ---
        try:
            nvidia_proc.terminate()
        except Exception:
            pass
        nvidia_log.close()

        # --- Capture result IDs from this iteration's benchmark output ---
        result_ids = []
        for line in uprofcmd_proc.stdout.splitlines():
            if line.startswith("RESULT_IDS:"):
                import ast
                try:
                    result_ids = ast.literal_eval(line.split("RESULT_IDS:")[1].strip())
                except Exception:
                    result_ids = []
                print(f"Captured {len(result_ids)} result IDs for {BENCHMARK_SCRIPT}")
                break

        # --- Parse NVIDIA-smi log for this iteration ---
        try:
            df_gpu = pd.read_csv(nvidia_log_file, skiprows=1, engine='python', on_bad_lines='skip')
            def extract_power(val):
                import re
                numbers = re.findall(r"[0-9]+\.[0-9]+", str(val))
                return [float(n) for n in numbers]
            power_lists = df_gpu.iloc[:,1].apply(extract_power)
            all_powers = [item for sublist in power_lists for item in sublist]
            if all_powers:
                avg_gpu_power = sum(all_powers) / len(all_powers)
                max_gpu_power = max(all_powers)
                print(f"Average GPU power: {avg_gpu_power:.2f} W, Max GPU power: {max_gpu_power:.2f} W")
            else:
                avg_gpu_power = None
                max_gpu_power = None
                print("No valid GPU power data found in NVIDIA log.")
        except Exception as e:
            avg_gpu_power = None
            max_gpu_power = None
            print(f"Failed to parse NVIDIA log: {e}")

        # --- Parse AMD uProf output for this iteration ---
        uprofile_dirs = glob.glob(os.path.join("uprofile_output", "AMDuProf*-Timechart_*"))
        timechart_path = None
        if uprofile_dirs:
            latest_dir = max(uprofile_dirs, key=os.path.getmtime)
            timechart_path = os.path.join(latest_dir, "timechart.csv")
        if timechart_path and os.path.exists(timechart_path):
            try:
                with open(timechart_path, 'r') as f:
                    lines = f.readlines()
                header_idx = None
                for idx, line in enumerate(lines):
                    if line.strip().startswith('RecordId,'):
                        header_idx = idx
                        break
                if header_idx is None:
                    uprof_msg = f'Could not find RecordId header in uProf CSV ({timechart_path})'
                    print(uprof_msg)
                    avg_power = None
                    total_energy = None
                else:
                    import io
                    csv_data = ''.join(lines[header_idx:])
                    df = pd.read_csv(io.StringIO(csv_data))
                    if df.shape[0] == 0:
                        warn_msg = f"[WARN] uProf CSV {timechart_path} has columns but no data rows under PROFILE RECORDS. Columns: {list(df.columns)}"
                        print(warn_msg)
                        avg_power = None
                        total_energy = None
                        # Save diagnostics for this iteration
                        os.makedirs(DIAG_DIR, exist_ok=True)
                        diag_path = os.path.join(DIAG_DIR, f"{os.path.splitext(os.path.basename(BENCHMARK_SCRIPT))[0]}_{iteration+1}")
                        os.makedirs(diag_path, exist_ok=True)
                        # save run output and uProf stdout/stderr
                        with open(os.path.join(diag_path, "uprofcmd_stdout.txt"), 'w') as dfout:
                            dfout.write(uprofcmd_proc.stdout or '')
                        with open(os.path.join(diag_path, "uprofcmd_stderr.txt"), 'w') as dferr:
                            dferr.write(uprofcmd_proc.stderr or '')
                        # copy nvidia tail
                        try:
                            with open(nvidia_log_file, 'r') as ng:
                                tail = ng.readlines()[-50:]
                            with open(os.path.join(diag_path, "nvidia_tail.csv"), 'w') as nt:
                                nt.writelines(tail)
                        except Exception:
                            pass
                    else:
                        print(f"[DEBUG] Columns in timechart.csv: {list(df.columns)}")
                        power_col = None
                        for col in df.columns:
                            if 'socket0-package-power' in col.lower():
                                power_col = col
                                break
                        if not power_col:
                            for col in df.columns:
                                if 'power' in col.lower():
                                    power_col = col
                                    break
                        if power_col:
                            avg_power = df[power_col].mean()
                            interval_s = 0.1
                            total_energy = (df[power_col] * interval_s).sum()
                            print(f"[INFO] Using power column: {power_col}")
                            print(f"Average CPU Power: {avg_power:.2f} W, Total CPU Energy: {total_energy:.2f} J")
                            # Update DB for captured result IDs
                            try:
                                import psycopg2
                                from dotenv import load_dotenv, find_dotenv
                                load_dotenv(find_dotenv("energy_lang/knowledge_base/.env"), override=True)
                                DB_URL = os.getenv("DATABASE_URL")
                                conn = psycopg2.connect(DB_URL)
                                cur = conn.cursor()
                                if result_ids:
                                    cur.executemany("""
                                        UPDATE results SET power_watts = %s, energy_joules_per_op = %s WHERE id = %s
                                    """, [(float(avg_power), float(total_energy), rid) for rid in result_ids])
                                    conn.commit()
                                    print(f"[INFO] Updated {len(result_ids)} DB result ids with power and energy.")
                                else:
                                    print("[WARN] No result IDs captured for this benchmark run.")
                                cur.close()
                                conn.close()
                            except Exception as e:
                                print(f"DB update failed: {e}")
                        else:
                            print("[ERROR] No power column found in timechart.csv. Columns were:", list(df.columns))
            except Exception as e:
                print(f"Error parsing AMD uProf timechart.csv: {e}")
        else:
            print("No timechart.csv found in latest uProf output directory.")

        # --- Append iteration summary to master log ---
        try:
            with open(MASTER_LOG, 'a') as mlog:
                mlog.write('\n' + '='*80 + '\n')
                mlog.write(f"Benchmark: {BENCHMARK_SCRIPT} Iteration: {iteration+1}/500\n")
                mlog.write("--- uProf command stdout ---\n")
                mlog.write(uprofcmd_proc.stdout or '')
                mlog.write("--- uProf command stderr ---\n")
                mlog.write(uprofcmd_proc.stderr or '')
                mlog.write("--- GPU summary ---\n")
                mlog.write(f"avg_gpu_power: {avg_gpu_power}\n")
                mlog.write(f"max_gpu_power: {max_gpu_power}\n")
                mlog.write("--- CPU summary ---\n")
                mlog.write(f"avg_cpu_power: {avg_power if 'avg_power' in locals() else None}\n")
                mlog.write(f"total_cpu_energy: {total_energy if 'total_energy' in locals() else None}\n")
                mlog.write(f"result_ids: {result_ids}\n")
        except Exception as e:
            print(f"Failed to write master log: {e}")

    # --- Cleanup compiled files after all iterations for this benchmark ---
    for fpath in cleanup_files:
        try:
            if os.path.exists(fpath):
                os.remove(fpath)
        except Exception as e:
            print(f"Warning: failed to remove compiled file {fpath}: {e}")
