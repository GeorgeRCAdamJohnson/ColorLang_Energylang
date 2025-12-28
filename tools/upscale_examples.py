#!/usr/bin/env python3
"""Upscale PNG examples for display-only visuals.

Writes upscaled images to `site/colorlang/hires/` and a small manifest JSON
containing original sizes. Upscaled images are labelled with `@2x`.

Run: `python tools/upscale_examples.py` from repo root.
"""
import os
from PIL import Image
import json

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC_DIR = os.path.join(ROOT, 'colorlang', 'examples')
OUT_DIR = os.path.join(ROOT, 'site', 'colorlang', 'hires')
os.makedirs(OUT_DIR, exist_ok=True)

MANIFEST = {}
FACTOR = 2  # upscale factor (2x)

def is_png(fn):
    return fn.lower().endswith('.png')

for name in sorted(os.listdir(SRC_DIR)):
    if not is_png(name):
        continue
    src = os.path.join(SRC_DIR, name)
    try:
        with Image.open(src) as im:
            w, h = im.size
            MANIFEST[name] = {'width': w, 'height': h}
            new_size = (w*FACTOR, h*FACTOR)
            im2 = im.resize(new_size, resample=Image.LANCZOS)
            base, ext = os.path.splitext(name)
            out_name = f"{base}@{FACTOR}x{ext}"
            out_path = os.path.join(OUT_DIR, out_name)
            im2.save(out_path)
            print('Wrote', out_path, 'original', w, 'x', h)
    except Exception as e:
        print('Skipped', name, 'error', e)

manifest_path = os.path.join(OUT_DIR, 'manifest.json')
with open(manifest_path, 'w', encoding='utf-8') as fh:
    json.dump(MANIFEST, fh, indent=2)

print('Manifest written to', manifest_path)
