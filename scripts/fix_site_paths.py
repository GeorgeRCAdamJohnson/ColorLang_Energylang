#!/usr/bin/env python3
"""
Fix leading "/site/" prefixes in files under the site/ directory.

This script replaces occurrences of "/site/" with "/" and also
fixes data-include references to header/footer fragments.
"""
import io
import os
import sys

ROOT = os.path.join(os.path.dirname(__file__), '..', 'site')

if not os.path.isdir(ROOT):
    print('site/ directory not found at', ROOT)
    sys.exit(1)

count = 0
files = 0
for dirpath, dirnames, filenames in os.walk(ROOT):
    for fn in filenames:
        path = os.path.join(dirpath, fn)
        if not fn.lower().endswith(('.html', '.htm', '.css', '.js', '.txt')):
            continue
        files += 1
        with io.open(path, 'r', encoding='utf-8', errors='replace') as f:
            s = f.read()

        new = s.replace('/site/_header.html', '/_header.html')
        new = new.replace('/site/_footer.html', '/_footer.html')
        new = new.replace("'/site/", "'/")
        new = new.replace('"/site/', '"/')
        # generic replacement for remaining occurrences
        new = new.replace('/site/', '/')

        if new != s:
            with io.open(path, 'w', encoding='utf-8') as f:
                f.write(new)
            count += 1

print(f'Processed {files} files under site/; updated {count} files.')
