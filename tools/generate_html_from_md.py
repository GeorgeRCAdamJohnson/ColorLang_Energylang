#!/usr/bin/env python3
"""
Generate HTML pages from repository Markdown files into site/docs/.
- Converts .md files under repo root, docs/, and energy_lang/ into HTML pages.
- Preserves relative paths under `site/docs/` and links to `site/style.css`.
"""
import os
import io
import sys
from pathlib import Path

try:
    import markdown
except Exception:
    print("markdown package not found. Please install with 'pip install markdown'", file=sys.stderr)
    raise

ROOT = Path(__file__).resolve().parents[1]
OUT_ROOT = ROOT / "site" / "docs"
STYLE = ROOT / "site" / "style.css"
HEADER = ROOT / "site" / "_header.html"

# Patterns to include
INCLUDE_DIRS = [ROOT / "docs", ROOT / "energy_lang"]
INCLUDE_FILES = [ROOT / "README.md", ROOT / "energy_benchmark_analytics_README.md"]

EXTENSIONS = ["fenced_code", "tables", "toc"]

print(f"Repo root: {ROOT}")
print(f"Output root: {OUT_ROOT}")
OUT_ROOT.mkdir(parents=True, exist_ok=True)

processed = []

def files_to_process():
    seen = set()
    for d in INCLUDE_DIRS:
        if d.exists():
            for p in d.rglob("*.md"):
                seen.add(p)
    for f in INCLUDE_FILES:
        if f.exists():
            seen.add(f)
    # Also add top-level md files
    for p in ROOT.glob("*.md"):
        seen.add(p)
    return sorted(seen)

for md_path in files_to_process():
    rel = md_path.relative_to(ROOT)
    out_path = OUT_ROOT / rel.with_suffix('.html')
    out_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"Processing {md_path} -> {out_path}")
    text = md_path.read_text(encoding='utf-8')
    html = markdown.markdown(text, extensions=EXTENSIONS)
    # compute relative path from out_path.parent to STYLE
    style_rel = os.path.relpath(STYLE, start=out_path.parent)
    title = md_path.stem
    nav_back = os.path.relpath(ROOT / 'site' / 'index.html', start=out_path.parent)
    # read shared header fragment (if available)
    if HEADER.exists():
      header_html = HEADER.read_text(encoding='utf-8')
    else:
      header_html = f"<header><div style=\"max-width:1100px;margin:0 auto;padding:18px;\"> <a href=\"{nav_back}\">Site Home</a></div></header>"

    template = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{title}</title>
  <link rel="stylesheet" href="{style_rel}">
</head>
<body>
  {header_html}
  <main style="max-width:1100px;margin:28px auto;padding:0 18px 48px 18px;">
    {html}
  </main>
  <footer style="max-width:1100px;margin:0 auto 24px auto;padding:10px 18px;color:#6b7280;">
    Generated HTML from Markdown
  </footer>
</body>
</html>"""
    out_path.write_text(template, encoding='utf-8')
    processed.append(out_path)

print(f"Done. Generated {len(processed)} files under {OUT_ROOT}")
for p in processed[:20]:
    print(p)
