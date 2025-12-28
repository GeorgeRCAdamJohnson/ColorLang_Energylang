#!/usr/bin/env python3
"""Simple visual generator for Energylang: reads CSV benchmarks and writes SVG charts.

Creates files under `site/energylang/visuals/` so the site can reference them.
This script is intentionally dependency-free and emits simple SVG.
"""
import csv
import os
from math import ceil

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT_DIR = os.path.join(ROOT, 'site', 'energylang', 'visuals')
os.makedirs(OUT_DIR, exist_ok=True)

def read_csv(path):
    rows = []
    with open(path, newline='', encoding='utf-8') as fh:
        reader = csv.DictReader(fh)
        for r in reader:
            rows.append(r)
    return rows

def write_svg_bar(filename, labels, values, title=''):
    width = 800
    height = 360
    margin = 40
    maxv = max(values) if values else 1
    bar_w = (width - margin*2) / max(1, len(values)) * 0.7
    gap = ((width - margin*2) - bar_w*len(values)) / max(1, len(values)-1)

    def esc(s):
        return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">']
    parts.append(f'<rect width="100%" height="100%" fill="#fff"/>')
    parts.append(f'<text x="{width/2}" y="24" font-size="16" text-anchor="middle">{esc(title)}</text>')

    for i, (lab, val) in enumerate(zip(labels, values)):
        x = margin + i*(bar_w+gap)
        h = (height - margin*2) * (float(val)/maxv)
        y = height - margin - h
        parts.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{bar_w:.1f}" height="{h:.1f}" fill="#3b82f6" rx="4"/>')
        parts.append(f'<text x="{x+bar_w/2:.1f}" y="{height-margin+14}" font-size="12" text-anchor="middle">{esc(lab)}</text>')
        parts.append(f'<text x="{x+bar_w/2:.1f}" y="{y-6:.1f}" font-size="11" text-anchor="middle">{esc(round(float(val),3))}</text>')

    parts.append('</svg>')
    with open(filename, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(parts))

def generate_from_matrix_aggregated(csv_path):
    rows = read_csv(csv_path)
    # pick a few benchmarks and plot mean_energy_J
    labels = []
    vals = []
    for r in rows[:12]:
        labels.append(r.get('benchmark','')[:18])
        vals.append(float(r.get('mean_energy_J') or 0))
    out = os.path.join(OUT_DIR, 'matrix_mean_energy.svg')
    write_svg_bar(out, labels, vals, title='Mean energy (J) — sample benchmarks')
    return out

def generate_jperflop(csv_path):
    rows = read_csv(csv_path)
    labels = []
    vals = []
    for r in rows[:12]:
        labels.append(r.get('benchmark','')[:18])
        vals.append(float(r.get('J_per_flop') or r.get('joules_per_flop') or 0))
    out = os.path.join(OUT_DIR, 'j_per_flop.svg')
    write_svg_bar(out, labels, vals, title='Joules per flop (sample)')
    return out

def main():
    # sensible default CSV locations (repo root)
    agg = os.path.join(ROOT, 'matrix_multiply_benchmark_aggregated.csv')
    jpf = os.path.join(ROOT, 'matrix_multiply_jperflop_comparison.csv')
    created = []
    if os.path.exists(agg):
        created.append(generate_from_matrix_aggregated(agg))
    if os.path.exists(jpf):
        created.append(generate_jperflop(jpf))

    print('Wrote visuals:', created)

if __name__ == '__main__':
    main()
