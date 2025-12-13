#!/usr/bin/env python3
"""
Run commands across projects discovered under a root directory.

Features:
- Discover Node (package.json) and Python (pyproject.toml, requirements.txt, setup.py) projects.
- Print suggested commands (dry-run) or execute them when `--execute` is supplied.
- Safe defaults: no destructive actions unless `--execute`.
- Concurrency via threads.

Usage examples:
  # dry-run (default)
  python scripts/run_across_projects.py --root "C:\\new language"

  # actually run the default actions (npm install / pip install)
  python scripts/run_across_projects.py --root "C:\\new language" --execute

  # only target node projects and run a custom command
  python scripts/run_across_projects.py --root . --types node --command "npm install && npm run build" --execute

"""
import argparse
import json
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path


def find_projects(root: Path, max_depth: int = 6):
    """Yield (type, path) for discovered projects under root.
    type in {'node','python'}
    """
    root = root.resolve()
    # ignore vendor/build dirs to avoid scanning node_modules, virtualenvs, etc.
    ignore_dirs = {'node_modules', '.venv', 'venv', 'env', 'dist', 'build', '__pycache__'}
    for dirpath, dirnames, filenames in os.walk(root):
        # mutate dirnames in-place to prune ignored folders
        dirnames[:] = [d for d in dirnames if d not in ignore_dirs]
        # depth limit
        rel = Path(dirpath).relative_to(root)
        if len(rel.parts) > max_depth:
            # skip deeper
            dirnames[:] = []
            continue
        files = set(filenames)
        p = Path(dirpath)
        if 'package.json' in files:
            yield ('node', p)
        if any(x in files for x in ('pyproject.toml', 'requirements.txt', 'setup.py')):
            yield ('python', p)


def default_command_for(project_type: str, path: Path):
    if project_type == 'node':
        pkg = path / 'package.json'
        try:
            with pkg.open('r', encoding='utf-8') as f:
                data = json.load(f)
            scripts = data.get('scripts', {})
            if 'build' in scripts:
                return 'npm install && npm run build'
        except Exception:
            pass
        return 'npm install'
    elif project_type == 'python':
        # prefer requirements.txt, then pyproject/setup
        if (path / 'requirements.txt').exists():
            return 'python -m pip install -r requirements.txt'
        if (path / 'pyproject.toml').exists() or (path / 'setup.py').exists():
            return 'python -m pip install -e .'
        return ''
    return ''


def run_command_in_dir(cmd: str, cwd: Path, dry_run: bool = True):
    print(f"[{cwd}] -> {cmd}")
    if dry_run:
        return 0, 'dry-run'
    # run with shell to allow compound commands (use with care)
    proc = subprocess.run(cmd, shell=True, cwd=str(cwd))
    return proc.returncode, None


def main():
    ap = argparse.ArgumentParser(description='Run commands across discovered projects')
    ap.add_argument('--root', '-r', default='.', help='Root directory to scan')
    ap.add_argument('--types', '-t', default='node,python', help='Comma-separated project types to include (node,python)')
    ap.add_argument('--command', '-c', default=None, help='Custom command to run in each project (overrides defaults)')
    ap.add_argument('--execute', action='store_true', help='Actually execute commands (default is dry-run)')
    ap.add_argument('--concurrency', '-j', type=int, default=4, help='Parallel jobs')
    args = ap.parse_args()

    root = Path(args.root).expanduser().resolve()
    if not root.exists():
        print('Root does not exist:', root)
        raise SystemExit(2)

    wanted = set(t.strip().lower() for t in args.types.split(','))
    found = []
    for ptype, p in find_projects(root):
        if ptype in wanted:
            found.append((ptype, p))

    if not found:
        print('No projects found under', root)
        return

    print(f'Found {len(found)} projects under {root}:')
    for t, p in found:
        print(' -', t, p)

    dry_run = not args.execute
    with ThreadPoolExecutor(max_workers=max(1, args.concurrency)) as ex:
        futures = []
        for ptype, p in found:
            cmd = args.command or default_command_for(ptype, p)
            if not cmd:
                print(f'Skipping {p} ({ptype}) — no default command and no --command specified')
                continue
            futures.append(ex.submit(run_command_in_dir, cmd, p, dry_run))

        for f in as_completed(futures):
            try:
                rc, _ = f.result()
                if rc != 0:
                    print('One job exited with code', rc)
            except Exception as e:
                print('Job error:', e)


if __name__ == '__main__':
    main()
