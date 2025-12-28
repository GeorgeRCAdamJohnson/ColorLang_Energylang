"""
python_matrix_multiply_automated.py

Runs the matrix multiplication benchmark 1000 times and saves results to CSV.
Prints summary statistics at the end.
"""
import numpy as np
import time
import csv

N = 1000
RUNS = 1000
results = []

# Generate two random NxN matrices once for fair comparison
A = np.random.rand(N, N)
B = np.random.rand(N, N)

# Warm-up
np.dot(A, B)

for i in range(RUNS):
    start = time.perf_counter()
    C = np.dot(A, B)
    end = time.perf_counter()
    elapsed = end - start
    results.append(elapsed)
    if (i+1) % 100 == 0:
        print(f"Completed {i+1}/{RUNS} runs...")

# Save results to CSV
with open('matrix_multiply_benchmark_results.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['run', 'elapsed_seconds'])
    for idx, elapsed in enumerate(results, 1):
        writer.writerow([idx, elapsed])

# Print summary statistics
import statistics
mean = statistics.mean(results)
median = statistics.median(results)
min_time = min(results)
max_time = max(results)
stdev = statistics.stdev(results)

print(f"\nMatrix multiply ({N}x{N}) benchmarked {RUNS} times.")
print(f"Mean:    {mean:.6f} s")
print(f"Median:  {median:.6f} s")
print(f"Min:     {min_time:.6f} s")
print(f"Max:     {max_time:.6f} s")
print(f"Stddev:  {stdev:.6f} s")
print("Results saved to matrix_multiply_benchmark_results.csv")
