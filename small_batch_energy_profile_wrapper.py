"""
small_batch_energy_profile_wrapper.py

A lightweight clone of `energy_profile_wrapper.py` for quick profiler smoke-tests.
- Runs a small number of iterations (controlled by env `SMALL_RUN_ITERATIONS`, default 3)
- By default runs a short subset of benchmarks for quick comparison
- If env `ENERGY_PROFILE_DB_MODE=disabled` it will not attempt DB updates (safe dry-run)
- Writes per-iteration diagnostics and a small master log `benchmark_runs_small.log`

This version includes two reliability improvements:
- a short pre-launch sleep in the generated batch so the profiler can attach
- a retry loop (config `SMALL_RUN_MAX_ATTEMPTS`) when uProf produces an empty timechart
"""

import subprocess
import time
import os
import re
import pandas as pd
import sys
import glob
import threading
import types
from datetime import datetime
import json
import glob as _glob

# optional NVML fallback
try:
    import pynvml
    PYNVML_AVAILABLE = True
except Exception:
    PYNVML_AVAILABLE = False


# --- CONFIG (small-run defaults) ---
SMALL_RUN_ITERATIONS = int(os.getenv('SMALL_RUN_ITERATIONS', '3'))
# default small-run benchmark list
BENCHMARK_SCRIPTS = [
    "energylang_matrix_multiply_db.py",
    os.path.join("benchmarks", "matrix_multiply.cpp"),
]
# allow overriding the benchmark scripts via env `SMALL_RUN_SCRIPT` (comma-separated)
if os.getenv('SMALL_RUN_SCRIPT'):
    override = os.getenv('SMALL_RUN_SCRIPT')
    BENCHMARK_SCRIPTS = [s.strip() for s in override.split(',') if s.strip()]
# single-script convenience env (preferred): if set, use this single script only
if os.getenv('SMALL_RUN_SCRIPT_SINGLE'):
    single = os.getenv('SMALL_RUN_SCRIPT_SINGLE')
    BENCHMARK_SCRIPTS = [single]
# helper: force a single benchmark via SMALL_RUN_FORCE_PYTHON=1 for scripted runs
if os.getenv('SMALL_RUN_FORCE_PYTHON', '').lower() == '1':
    BENCHMARK_SCRIPTS = ['python_matrix_multiply_benchmark.py']
# allow running only the compiled benchmark via env var SMALL_RUN_ONLY=cpp
if os.getenv('SMALL_RUN_ONLY', '').lower() == 'cpp':
    BENCHMARK_SCRIPTS = [os.path.join("benchmarks", "matrix_multiply.cpp")]
UPROF_PATH = r"C:\Program Files\AMD\AMDuProf\bin\AMDuProfCLI.exe"
MASTER_LOG = "benchmark_runs_small.log"
DIAG_DIR = "diagnostics_small"
UPROF_INTERVAL_MS = os.getenv('UPROF_INTERVAL_MS', '100')


print(f"Small-batch profiler: iterations={SMALL_RUN_ITERATIONS}, db_mode={os.getenv('ENERGY_PROFILE_DB_MODE','batch')}")


for BENCHMARK_SCRIPT in BENCHMARK_SCRIPTS:
    print(f"\nPreparing benchmark: {BENCHMARK_SCRIPT}")
    ext = os.path.splitext(BENCHMARK_SCRIPT)[1].lower()
    run_cmd = None
    cleanup_files = []
    try:
        if ext == ".py":
            run_cmd = f'"{sys.executable}" "{os.path.abspath(BENCHMARK_SCRIPT)}" --mode serialize'
        elif ext == ".cpp":
            # allow an optional tuned compile via env SMALL_RUN_CPP_TUNED=1
            tuned = os.getenv('SMALL_RUN_CPP_TUNED', '0') == '1'
            base = os.path.splitext(os.path.basename(BENCHMARK_SCRIPT))[0]
            if tuned:
                exe_name = os.path.abspath(f"{base}_cpp_tuned_small.exe")
                cflags = ["-O3", "-march=native", "-funroll-loops"]
            else:
                exe_name = os.path.abspath(f"{base}_cpp_small.exe")
                cflags = ["-O2"]
            compile_cmd = ["g++", BENCHMARK_SCRIPT] + cflags + ["-o", exe_name]
            subprocess.run(compile_cmd, check=True)
            run_cmd = exe_name
            cleanup_files.append(exe_name)
        else:
            print(f"Unsupported extension for small-run: {ext}. Skipping {BENCHMARK_SCRIPT}.")
            continue
    except Exception as e:
        print(f"Failed to prepare {BENCHMARK_SCRIPT}: {e}")
        continue

    # Verify executable exists for compiled targets
    if ext in ('.cpp',) and not os.path.exists(run_cmd):
        print(f"Prepared executable not found: {run_cmd}. Skipping.")
        for fpath in cleanup_files:
            try:
                if os.path.exists(fpath):
                    os.remove(fpath)
            except Exception:
                pass
        continue

    for iteration in range(SMALL_RUN_ITERATIONS):
        print(f"\n=== Small Profiling {BENCHMARK_SCRIPT} (Iteration {iteration+1}/{SMALL_RUN_ITERATIONS}) ===")
        nvidia_log_file = f"nvidia_power_log_small_{os.path.splitext(os.path.basename(BENCHMARK_SCRIPT))[0]}_{iteration+1}.csv"
        try:
            nvidia_log = open(nvidia_log_file, "w")
        except Exception as e:
            print(f"Failed to open nvidia log file {nvidia_log_file}: {e}")
            nvidia_log = None

        nvidia_proc = None
        if nvidia_log:
            try:
                nvidia_proc = subprocess.Popen([
                    "nvidia-smi", "--query-gpu=timestamp,power.draw", "--format=csv", "-lms", "100"
                ], stdout=nvidia_log)
            except Exception as e:
                print(f"Failed to start nvidia-smi: {e}")
                try:
                    nvidia_log.close()
                except Exception:
                    pass
                nvidia_log = None

        # small initial delay to help ensure nvidia logging is active
        time.sleep(0.5)

        # create batch file to run command (includes a short Start-Sleep)
        batch_path = os.path.join(os.getcwd(), "run_benchmark_small.bat")
        cmd_to_run = str(run_cmd)
        if '"' in cmd_to_run:
            batch_line = cmd_to_run
        else:
            batch_line = f'"{cmd_to_run}"' if ' ' in cmd_to_run else cmd_to_run
        # prepare per-iteration diagnostic directory and unique sentinel/bench-start paths
        try:
            os.makedirs(DIAG_DIR, exist_ok=True)
        except Exception:
            pass
        basename = os.path.splitext(os.path.basename(BENCHMARK_SCRIPT))[0]
        sentinel_name = f"start_run_{basename}_{iteration+1}.sentinel"
        sentinel_path = os.path.join(os.getcwd(), DIAG_DIR, sentinel_name)
        bench_start_name = f"bench_start_{basename}_{iteration+1}.txt"
        bench_start_path = os.path.join(os.getcwd(), DIAG_DIR, bench_start_name)
        # remove any existing sentinel for this iteration
        try:
            if os.path.exists(sentinel_path):
                os.remove(sentinel_path)
        except Exception:
            pass

        # determine if we should enable handshake for compiled targets
        enable_handshake = True
        handshake_timeout = os.getenv('WAIT_FOR_PROFILER_TIMEOUT_MS', '5000')

        with open(batch_path, "w") as f:
            f.write(f'@echo off\n')
            f.write(f'powershell -Command "Start-Sleep -Milliseconds 350"\n')
            if enable_handshake and ext == ".cpp":
                # set env var inside the batch so the launched exe sees it
                f.write(f'set WAIT_FOR_PROFILER_HANDSHAKE=1\n')
                f.write(f'set WAIT_FOR_PROFILER_TIMEOUT_MS={handshake_timeout}\n')
                # pass per-iteration sentinel and bench-start file paths so the binary can record deterministic artifacts
                f.write(f'set WAIT_FOR_PROFILER_SENTINEL={sentinel_path}\n')
                f.write(f'set WAIT_FOR_PROFILER_BENCH_START={bench_start_path}\n')
                # inject optional post-sentinel delay for compiled binaries
                delay_env_val = os.getenv('WAIT_FOR_PROFILER_BENCH_START_DELAY_MS', '')
                if delay_env_val:
                    f.write(f'set WAIT_FOR_PROFILER_BENCH_START_DELAY_MS={delay_env_val}\n')
                else:
                    # default conservative delay to reduce attach/start races
                    f.write(f'set WAIT_FOR_PROFILER_BENCH_START_DELAY_MS=150\n')
            f.write(f"{batch_line}\n")

        # attempt the uProf run up to N times if timechart is empty
        MAX_ATTEMPTS = int(os.getenv('SMALL_RUN_MAX_ATTEMPTS', '3'))
        attempt = 0
        uprofcmd_proc = None
        avg_cpu_power = None
        total_cpu_energy = None
        avg_gpu_power = None
        max_gpu_power = None

        while attempt < MAX_ATTEMPTS:
            attempt += 1
            # add duration flag for compiled targets as a short-term mitigation
            uprofcmd = [
                UPROF_PATH,
                "timechart",
                "--event", "power",
                "--interval", UPROF_INTERVAL_MS,
                "-o", "uprofile_output",
                "--format", "csv",
            ]
            if ext == ".cpp":
                duration = os.getenv('SMALL_RUN_COMPILED_DURATION_MS', '2500')
                uprofcmd += ["-d", duration]
            uprofcmd.append(batch_path)

            print(f'Running uProf command (attempt {attempt}/{MAX_ATTEMPTS})...')

            # Start AMDuProf as a subprocess and stream stdout to detect readiness
            uprofcmd_start_ts = time.time()
            try:
                proc = subprocess.Popen(uprofcmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            except Exception as e:
                print(f'Failed to launch AMDuProf: {e}')
                proc = None

            # background NVML sampling fallback (if nvidia-smi failed to start)
            nvml_stop = threading.Event()
            nvml_thread = None
            def nvml_sampler(path, stop_event):
                try:
                    pynvml.nvmlInit()
                    handle = pynvml.nvmlDeviceGetHandleByIndex(0)
                    with open(path, 'w') as nf:
                        nf.write('timestamp,power_mW\n')
                        while not stop_event.is_set():
                            try:
                                power = pynvml.nvmlDeviceGetPowerUsage(handle)
                                nf.write(f"{time.time()},{power}\n")
                                nf.flush()
                            except Exception:
                                pass
                            time.sleep(0.1)
                except Exception:
                    return

            if nvidia_proc is None and PYNVML_AVAILABLE:
                try:
                    nvml_thread = threading.Thread(target=nvml_sampler, args=(nvidia_log_file, nvml_stop), daemon=True)
                    nvml_thread.start()
                except Exception:
                    nvml_thread = None

            uprof_stdout = []
            uprof_stderr = []
            uprofcmd_proc = None

            if proc:
                try:
                    # read stdout lines and look for readiness
                    while True:
                        line = proc.stdout.readline()
                        if line:
                            uprof_stdout.append(line)
                            # print to console for visibility
                            print(line.strip())
                            if 'Profiling started' in line or 'Profiling started...' in line:
                                # create per-iteration sentinel so benchmark can start and record timestamp
                                try:
                                    sentinel_created_ts = time.time()
                                    with open(sentinel_path, 'w') as sf:
                                        sf.write(str(sentinel_created_ts))
                                    print(f'Created sentinel at {sentinel_path} at {datetime.fromtimestamp(sentinel_created_ts).isoformat()}')
                                except Exception as e:
                                    print(f'Failed to create sentinel {sentinel_path}: {e}')
                                # start a background watcher to detect the profiler output directory
                                def _watch_and_write_meta(start_ts, basename, iteration, attempt, uprofcmd_start_ts, timeout_s=8.0):
                                    import time as _t
                                    deadline = _t.time() + timeout_s
                                    while _t.time() < deadline:
                                        try:
                                            candidates = _glob.glob(os.path.join("uprofile_output", "AMDuProf*-Timechart_*"))
                                            if candidates:
                                                # pick newest
                                                latest = max(candidates, key=os.path.getmtime)
                                                # write meta file if not exists
                                                meta_path = os.path.join(latest, "timechart.meta")
                                                meta = {
                                                    'iteration': iteration+1 if 'iteration' in locals() else None,
                                                    'benchmark': basename if 'basename' in locals() else None,
                                                    'attempt': attempt if 'attempt' in locals() else None,
                                                    'uprofcmd_start_ts': uprofcmd_start_ts if 'uprofcmd_start_ts' in locals() else None,
                                                    'sentinel_created_ts': start_ts,
                                                    'written_ts': _t.time(),
                                                }
                                                try:
                                                    if not os.path.exists(meta_path):
                                                        with open(meta_path, 'w') as mf:
                                                            json.dump(meta, mf)
                                                        # done
                                                        return
                                                except Exception:
                                                    pass
                                        except Exception:
                                            pass
                                        _t.sleep(0.2)

                                try:
                                    watch_thread = threading.Thread(target=_watch_and_write_meta, args=(sentinel_created_ts, basename, iteration, attempt, uprofcmd_start_ts), daemon=True)
                                    watch_thread.start()
                                except Exception:
                                    pass
                        else:
                            if proc.poll() is not None:
                                break
                            # no line but process still running; small sleep
                            time.sleep(0.05)
                    # read remaining stderr
                    try:
                        stderr_text = proc.stderr.read()
                        if stderr_text:
                            uprof_stderr.append(stderr_text)
                    except Exception:
                        pass
                    retcode = proc.wait()
                    uprofcmd_proc = types.SimpleNamespace(stdout=''.join(uprof_stdout), stderr=''.join(uprof_stderr), returncode=retcode)
                except Exception as e:
                    print(f'Error while streaming AMDuProf output: {e}')
                    try:
                        proc.terminate()
                    except Exception:
                        pass
            else:
                print('AMDuProf process not started; skipping this attempt')

            # stop nvml sampler if running
            if nvml_thread:
                nvml_stop.set()
                nvml_thread.join(timeout=1)

            # parse small GPU log (do this each attempt to capture GPU activity)
            if os.path.exists(nvidia_log_file):
                try:
                    df_gpu = pd.read_csv(nvidia_log_file, skiprows=1, engine='python', on_bad_lines='skip')
                    def extract_power(val):
                        import re
                        numbers = re.findall(r"[0-9]+\.[0-9]+", str(val))
                        return [float(n) for n in numbers]
                    if df_gpu.shape[1] >= 2:
                        power_lists = df_gpu.iloc[:,1].apply(extract_power)
                        all_powers = [item for sublist in power_lists for item in sublist]
                        if all_powers:
                            avg_gpu_power = sum(all_powers)/len(all_powers)
                            max_gpu_power = max(all_powers)
                except Exception as e:
                    print(f"Failed to parse {nvidia_log_file}: {e}")

            # parse latest uProf timechart.csv to detect if we have samples
            uprofile_dirs = glob.glob(os.path.join("uprofile_output", "AMDuProf*-Timechart_*"))
            timechart_path = None
            if uprofile_dirs:
                latest_dir = max(uprofile_dirs, key=os.path.getmtime)
                timechart_path = os.path.join(latest_dir, "timechart.csv")
                # write a small sidecar meta file into the profiler output dir so
                # we can correlate runs even if the timechart is empty or missing later
                try:
                    meta_path = os.path.join(latest_dir, "timechart.meta")
                    # write a JSON meta file with iteration, benchmark, attempt and uprofcmd_start_ts
                    meta = {
                        'iteration': iteration+1 if 'iteration' in locals() else None,
                        'benchmark': basename if 'basename' in locals() else None,
                        'attempt': attempt if 'attempt' in locals() else None,
                        'uprofcmd_start_ts': uprofcmd_start_ts if 'uprofcmd_start_ts' in locals() else None,
                        'written_ts': time.time(),
                    }
                    try:
                        with open(meta_path, 'w') as mf:
                            json.dump(meta, mf)
                    except Exception:
                        # fallback to simple string write
                        with open(meta_path, 'w') as mf:
                            mf.write(str(meta))
                except Exception as e:
                    print(f'Failed to write timechart.meta to {latest_dir}: {e}')

            got_samples = False
            if timechart_path and os.path.exists(timechart_path):
                # explicit non-empty verification: treat a 0-byte file as failure
                try:
                    if os.path.getsize(timechart_path) == 0:
                        print('timechart.csv exists but is 0 bytes — treating as no-samples')
                        got_samples = False
                        # skip parsing and allow retry
                        timechart_path = timechart_path
                    else:
                        pass
                except Exception:
                    pass
                try:
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
                        df = pd.read_csv(io.StringIO(csv_data))
                        if df.shape[0] > 0:
                            # find power column
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
                                avg_cpu_power = df[power_col].mean()
                                interval_s = int(UPROF_INTERVAL_MS)/1000.0
                                total_cpu_energy = (df[power_col] * interval_s).sum()
                                print(f"Parsed CPU: avg_power={avg_cpu_power:.2f} W total_energy={total_cpu_energy:.2f} J")
                                got_samples = True
                            else:
                                print('No power column found in timechart')
                        else:
                            print('timechart.csv has no data rows')
                    else:
                        print('No RecordId header in timechart.csv')
                except Exception as e:
                    print(f"Error parsing timechart.csv: {e}")

            if got_samples:
                break
            else:
                if attempt < MAX_ATTEMPTS:
                    print('No samples captured — retrying iteration after short pause')
                    time.sleep(0.4)
                else:
                    print('Max attempts reached; recording empty result for this iteration')

        # stop nvidia logging
        if nvidia_proc:
            try:
                nvidia_proc.terminate()
            except Exception:
                pass
        if nvidia_log:
            try:
                nvidia_log.close()
            except Exception:
                pass

        # extract result_ids from uprofcmd stdout if present
        result_ids = []
        if uprofcmd_proc and getattr(uprofcmd_proc, 'stdout', None):
            for line in uprofcmd_proc.stdout.splitlines():
                if line.startswith("RESULT_IDS:"):
                    import ast
                    try:
                        result_ids = ast.literal_eval(line.split("RESULT_IDS:")[1].strip())
                    except Exception:
                        result_ids = []
                    break

        # write small master log entry
        try:
            with open(MASTER_LOG, 'a') as mlog:
                mlog.write('\n' + '='*80 + '\n')
                mlog.write(f"Benchmark: {BENCHMARK_SCRIPT} Iteration: {iteration+1}/{SMALL_RUN_ITERATIONS}\n")
                # instrumentation: record AMDuProf start and sentinel creation times if available
                try:
                    if 'uprofcmd_start_ts' in locals():
                        mlog.write(f"uprofcmd_start_ts: {uprofcmd_start_ts} ({datetime.fromtimestamp(uprofcmd_start_ts).isoformat()})\n")
                except Exception:
                    pass
                try:
                    # write per-iteration sentinel/bench-start paths and timestamps
                    mlog.write(f"sentinel_path: {sentinel_path}\n")
                    mlog.write(f"bench_start_path: {bench_start_path}\n")
                    if 'sentinel_created_ts' in locals():
                        mlog.write(f"sentinel_created_ts: {sentinel_created_ts} ({datetime.fromtimestamp(sentinel_created_ts).isoformat()})\n")
                    # try to read bench-start file and record its timestamp/content for deterministic correlation
                    try:
                        bench_start_ts = None
                        bench_start_content = None
                        if bench_start_path and os.path.exists(bench_start_path):
                            with open(bench_start_path, 'r', encoding='utf-8', errors='ignore') as bf:
                                bench_start_content = bf.read().strip()
                            m = re.search(r"(\d{13,}|\d+)", bench_start_content)
                            if m:
                                try:
                                    bench_start_ts = int(m.group(1))
                                except Exception:
                                    bench_start_ts = None
                        mlog.write(f"bench_start_ts: {bench_start_ts}\n")
                        mlog.write(f"bench_start_content: {bench_start_content}\n")
                    except Exception as _e:
                        mlog.write(f"bench_start_read_error: {_e}\n")
                except Exception:
                    pass
                if uprofcmd_proc:
                    mlog.write('--- uProf stdout ---\n')
                    mlog.write(uprofcmd_proc.stdout or '')
                    mlog.write('--- uProf stderr ---\n')
                    mlog.write(uprofcmd_proc.stderr or '')
                mlog.write('--- GPU summary ---\n')
                mlog.write(f"avg_gpu_power: {avg_gpu_power}\n")
                mlog.write(f"max_gpu_power: {max_gpu_power}\n")
                mlog.write('--- CPU summary ---\n')
                mlog.write(f"avg_cpu_power: {avg_cpu_power}\n")
                mlog.write(f"total_cpu_energy: {total_cpu_energy if 'total_cpu_energy' in locals() else None}\n")
                mlog.write(f"result_ids: {result_ids}\n")
        except Exception as e:
            print(f"Failed to write master log: {e}")

    # cleanup compiled small exe
    for fpath in cleanup_files:
        try:
            if os.path.exists(fpath):
                os.remove(fpath)
        except Exception as e:
            print(f"Warning: failed to remove {fpath}: {e}")

print('\nSmall-batch profiling complete. Check', MASTER_LOG, 'and', DIAG_DIR)
