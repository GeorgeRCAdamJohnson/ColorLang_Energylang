# Ticket: Benchmark Data Not Uploaded Correctly

## Problem

When running batch EnergyLang benchmarks, the database was only populated with zero values and 'Not implemented' notes. This was due to `collect_benchmarks.py` using a stub function that did not read the actual benchmark results from the JSON file produced by `benchmark_runner.py`.

## Solution

- Patch `collect_benchmarks.py` to read real benchmark results from `temp_bench_result.json` (or the appropriate output file) and insert those values into the database.
- The patch reads the JSON, maps the fields to the DB columns, and falls back to zero/defaults if the file is missing.
- This ensures that real performance and energy data are uploaded to the database for each benchmark run.

## Recovery

- If the batch run produced valid JSON or CSV files (e.g., `temp_bench_result.json`, `results.csv`), you can write a script to parse these files and re-insert the real data into the database.
- If those files are missing or were overwritten, the data cannot be recovered from the database, as only placeholder values were stored.

## Steps to Fix
1. Apply the patch to `collect_benchmarks.py` (see commit).
2. Re-run the batch with the patched script to ensure real data is uploaded.
3. (Optional) Write a recovery/import script if you have the original result files.

---

**Ticket created automatically by GitHub Copilot on 2025-11-13.**
