#!/usr/bin/env python3
"""Simple site link checker for the local `site/` directory.
Scans HTML files for `href` and `src` attributes and reports missing local files.
Writes `site/link_check_report.json` with details.
"""
import os
import re
import json
from urllib.parse import urlparse


def is_external(url):
    if not url:
        return True
    u = urlparse(url)
    if u.scheme in ("http", "https", "mailto", "tel", "javascript"):
        return True
    if url.startswith("#"):
        return True
    return False


def normalize_link(link):
    # strip query and fragment
    p = urlparse(link)
    path = p.path
    if path.endswith("/"):
        path = path + "index.html"
    return path


def find_links_in_html(text):
    # naive but sufficient for local HTML files: capture href/src values
    pattern = re.compile(r'(?:href|src)\s*=\s*["\']([^"\']+)["\']', flags=re.IGNORECASE)
    return pattern.findall(text)


def main():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    site_dir = os.path.join(repo_root, "site")
    if not os.path.isdir(site_dir):
        print(f"Site directory not found: {site_dir}")
        return 1

    html_files = []
    for root, dirs, files in os.walk(site_dir):
        for f in files:
            if f.lower().endswith('.html'):
                html_files.append(os.path.join(root, f))

    missing = []
    checked = 0
    references = []

    for html in html_files:
        rel_html = os.path.relpath(html, repo_root)
        with open(html, 'r', encoding='utf-8', errors='ignore') as fh:
            text = fh.read()
        links = find_links_in_html(text)
        for link in links:
            checked += 1
            if is_external(link):
                continue
            norm = normalize_link(link)
            # treat leading slash as repo-root relative
            if norm.startswith(os.sep) or norm.startswith('/'):
                candidate = os.path.join(repo_root, norm.lstrip('/\\'))
            else:
                candidate = os.path.join(os.path.dirname(html), norm)

            candidate = os.path.normpath(candidate)
            exists = os.path.exists(candidate)
            references.append({
                'source': rel_html.replace('\\','/'),
                'link': link,
                'resolved': os.path.relpath(candidate, repo_root).replace('\\','/'),
                'exists': exists,
            })
            if not exists:
                missing.append(references[-1])

    report = {
        'site_dir': os.path.relpath(site_dir, repo_root).replace('\\','/'),
        'html_files_scanned': len(html_files),
        'links_checked': checked,
        'missing_count': len(missing),
        'missing': missing,
    }

    out_path = os.path.join(site_dir, 'link_check_report.json')
    with open(out_path, 'w', encoding='utf-8') as out:
        json.dump(report, out, indent=2)

    print(f"Scanned {len(html_files)} HTML files, checked {checked} links.")
    print(f"Missing links: {len(missing)}. Report written to {out_path}")
    if missing:
        print('\nSample missing links:')
        for m in missing[:10]:
            print(f" - {m['source']} -> {m['link']} (resolved {m['resolved']})")

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
