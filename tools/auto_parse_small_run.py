from pathlib import Path
import re
import json

ROOT = Path(r"c:\new language")
ML = ROOT / 'benchmark_runs_small.log'
OUT = ROOT / 'small_run_1000_report.txt'

def parse_master_log(path):
    text = path.read_text(errors='ignore')
    blocks = text.split('\n' + '='*80 + '\n')
    records = []
    for b in blocks:
        if 'matrix_multiply' in b.lower():
            it_m = re.search(r'Iteration:\s*(\d+)/(\d+)', b)
            if it_m:
                it = int(it_m.group(1)); total = int(it_m.group(2))
            else:
                it = None; total = None
            gen = (re.search(r'Generated data files path\s*:\s*(.*)', b) or re.search(r'Live Profile Output file\s*:\s*(.*)', b))
            genp = gen.group(1).strip() if gen else None
            bench = (re.search(r'bench_start_path\s*:\s*(.*)', b))
            benchp = bench.group(1).strip() if bench else None
            sent_ts = None
            m = re.search(r'sentinel_created_ts\s*:\s*(\d+\.?\d*)', b)
            if m: sent_ts = float(m.group(1))
            uprof_ts = None
            m = re.search(r'uprofcmd_start_ts\s*:\s*(\d+\.?\d*)', b)
            if m: uprof_ts = float(m.group(1))
            records.append({'it':it,'total':total,'gen':genp,'bench':benchp,'sentinel_created_ts':sent_ts,'uprofcmd_start_ts':uprof_ts})
    return records

def analyze(records):
    meta_count = 0
    bench_count = 0
    empty_tc = 0
    missing_samples = 0
    checked = 0
    # analyze all records
    for r in records:
        checked += 1
        if r['gen']:
            tc = Path(r['gen']) / 'timechart.csv'
            meta = Path(r['gen']) / 'timechart.meta'
            if meta.exists():
                meta_count += 1
            if tc.exists():
                try:
                    if tc.stat().st_size == 0:
                        empty_tc += 1
                        missing_samples += 1
                    else:
                        txt = tc.read_text(errors='ignore')
                        if 'core0-power' not in txt and 'core0_power' not in txt:
                            missing_samples += 1
                except Exception:
                    missing_samples += 1
        if r['bench'] and Path(r['bench']).exists():
            bench_count += 1
    return {
        'total_records': len(records),
        'checked': checked,
        'timechart_meta_present': meta_count,
        'bench_start_present': bench_count,
        'empty_timecharts': empty_tc,
        'missing_samples': missing_samples,
    }

def main():
    if not ML.exists():
        print('Master log not found:', ML)
        return
    records = parse_master_log(ML)
    stats = analyze(records)
    out = {
        'summary': stats,
    }
    OUT.write_text(json.dumps(out, indent=2))
    print('Wrote report to', OUT)
    print(json.dumps(out, indent=2))

if __name__ == '__main__':
    main()
