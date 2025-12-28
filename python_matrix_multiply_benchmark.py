"""
python_matrix_multiply_benchmark.py

A simple Python script to benchmark matrix multiplication using NumPy.
Measures execution time and prints the result.
"""
import numpy as np
import time

# Matrix size (can be adjusted for your benchmarking needs)
N = 1000

# Generate two random NxN matrices
A = np.random.rand(N, N)
B = np.random.rand(N, N)

# Warm-up (optional, helps with fair timing)
np.dot(A, B)

# Benchmark
start = time.perf_counter()
C = np.dot(A, B)
end = time.perf_counter()

elapsed = end - start
print(f"Matrix multiply ({N}x{N}) took {elapsed:.6f} seconds")
