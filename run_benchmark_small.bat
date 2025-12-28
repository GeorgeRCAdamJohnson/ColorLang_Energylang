@echo off
powershell -Command "Start-Sleep -Milliseconds 350"
set WAIT_FOR_PROFILER_HANDSHAKE=1
set WAIT_FOR_PROFILER_TIMEOUT_MS=8000
set WAIT_FOR_PROFILER_SENTINEL=C:\new language\diagnostics_small\start_run_matrix_multiply_10.sentinel
set WAIT_FOR_PROFILER_BENCH_START=C:\new language\diagnostics_small\bench_start_matrix_multiply_10.txt
set WAIT_FOR_PROFILER_BENCH_START_DELAY_MS=150
"C:\new language\matrix_multiply_cpp_tuned_small.exe"
