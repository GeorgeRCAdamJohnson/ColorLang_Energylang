import re
import os
from pathlib import Path
LOG = Path('benchmark_runs_small.log')
if not LOG.exists():
    print('No master log found at', LOG)
    raise SystemExit(1)
text = LOG.read_text()
chunks = text.split('\n' + '='*80 + '\n')
# target benchmark key
bench_key = r'Benchmark: benchmarks\\matrix_multiply.cpp'
entries = [c for c in chunks if re.search(r'Benchmark:\s+benchmarks\\matrix_multiply.cpp', c)]
# find iterations
iter_re = re.compile(r'Iteration:\s*(\d+)/(\d+)')
missing_cpu = []
bench_start_missing = []
bench_start_present = []
for e in entries:
    m = iter_re.search(e)
    if not m:
        continue
    it = int(m.group(1))
    # detect avg_cpu_power: None
    if 'avg_cpu_power: None' in e:
        missing_cpu.append(it)
    # parse bench_start_path
    bp = None
    for line in e.splitlines():
        if line.startswith('bench_start_path:'):
            bp = line.split(':',1)[1].strip()
            break
    if bp:
        if Path(bp).exists():
            bench_start_present.append((it,bp))
        else:
            bench_start_missing.append((it,bp))

print('Total matrix_multiply.cpp entries:', len(entries))
print('Missing CPU samples count:', len(missing_cpu))
if missing_cpu:
    print('Missing iterations:', sorted(missing_cpu))
print('Bench-start files present:', len(bench_start_present))
print('Bench-start files missing:', len(bench_start_missing))
if bench_start_missing:
    print('Missing bench-start entries (iter, path):')
    for it,p in bench_start_missing:
        print(it,p)
else:
    print('All bench-start files present for parsed entries.')
