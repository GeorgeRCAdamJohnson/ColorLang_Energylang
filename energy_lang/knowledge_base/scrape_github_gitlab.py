print("DEBUG: Top of UPDATED scrape_github_gitlab.py loaded")
"""
scrape_github_gitlab.py

Scrapes benchmark results from GitHub and GitLab repositories.
- Searches for repositories with benchmark data in README, workflows, or badges.
- Extracts benchmark tables, badges, and workflow logs.
- Inserts results into the energy_lang knowledge base.

Requirements:
- requests
- beautifulsoup4
- PyGithub (for GitHub API)
- python-gitlab (for GitLab API)
- psycopg2 (for DB)
- python-dotenv (for .env)

Usage:
    python scrape_github_gitlab.py
"""
import os
import re
import requests
import psycopg2
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from github import Github
import gitlab

# Load environment variables
load_dotenv()
DB_URL = os.getenv("DATABASE_URL")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITLAB_TOKEN = os.getenv("GITLAB_TOKEN")

# Connect to DB
def get_db_conn():
    print("DEBUG: DATABASE_URL =", os.getenv("DATABASE_URL"))
    return psycopg2.connect(DB_URL)

def insert_benchmark(source, repo, test_name, language, toolchain, version, workload, throughput, latency, notes):
    conn = get_db_conn()
    cur = conn.cursor()
    # Insert source if not exists
    print("DEBUG: About to insert into sources with ON CONFLICT (name) DO NOTHING")
    cur.execute("INSERT INTO sources (name) VALUES (%s) ON CONFLICT (name) DO NOTHING;", (source,))
    cur.execute("SELECT id FROM sources WHERE name=%s;", (source,))
    source_id = cur.fetchone()[0]
    print("DEBUG: About to insert into benchmarks with ON CONFLICT (source_id, test_name, language, toolchain, version, workload) DO NOTHING")
    cur.execute("""
        INSERT INTO benchmarks (source_id, test_name, language, toolchain, version, workload)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (source_id, test_name, language, toolchain, version, workload) DO NOTHING
        RETURNING id;
    """, (source_id, test_name, language, toolchain, version, workload))
    row = cur.fetchone()
    if row:
        benchmark_id = row[0]
    else:
        cur.execute("SELECT id FROM benchmarks WHERE source_id=%s AND test_name=%s;", (source_id, test_name))
        benchmark_id = cur.fetchone()[0]
    # Insert result
    cur.execute("""
        INSERT INTO results (benchmark_id, throughput_ops_per_sec, latency_ms, notes)
        VALUES (%s, %s, %s, %s)
    """, (benchmark_id, throughput, latency, notes))
    conn.commit()
    cur.close()
    conn.close()

def extract_benchmarks_from_readme(readme_text):
    # Extract markdown tables
    lines = readme_text.splitlines()
    tables = []
    current_table = []
    for line in lines:
        if line.strip().startswith('|') and line.strip().endswith('|'):
            current_table.append(line.strip())
        elif current_table:
            if len(current_table) > 1:
                tables.append(current_table)
            current_table = []
    if current_table and len(current_table) > 1:
        tables.append(current_table)

    benchmarks = []
    for table in tables:
        # Assume first row is header, second is separator, rest are data
        if len(table) < 3:
            continue
        headers = [h.strip().lower() for h in table[0].strip('|').split('|')]
        for row in table[2:]:
            cells = [c.strip() for c in row.strip('|').split('|')]
            if len(cells) != len(headers):
                continue
            row_dict = dict(zip(headers, cells))
            # Try to extract common benchmark fields
            test_name = row_dict.get('test', row_dict.get('name', 'unknown'))
            language = row_dict.get('language', '')
            toolchain = row_dict.get('toolchain', '')
            version = row_dict.get('version', '')
            workload = row_dict.get('workload', '')
            throughput = row_dict.get('throughput', row_dict.get('ops/sec', ''))
            latency = row_dict.get('latency', '')
            notes = row_dict.get('notes', '')
            # Convert throughput and latency to float if possible
            try:
                throughput = float(throughput.replace(',', '')) if throughput else None
            except Exception:
                throughput = None
            try:
                latency = float(latency.replace(',', '')) if latency else None
            except Exception:
                latency = None
            benchmarks.append((test_name, language, toolchain, version, workload, throughput, latency, notes))

    # Extract badge URLs (e.g., ![badge](url))
    badge_matches = re.findall(r'!\[[^\]]*\]\(([^)]+)\)', readme_text)
    for badge_url in badge_matches:
        benchmarks.append(('badge', '', '', '', '', None, None, badge_url))

    return benchmarks

def scrape_github():
    print("[GitHub] Authenticating...")
    g = Github(GITHUB_TOKEN, timeout=10)
    query = "benchmark in:readme stars:>100 language:Python"
    print(f"[GitHub] Searching repositories with query: {query}")
    import time
    from datetime import datetime
    max_attempts = 5
    attempt = 0
    print(f"[GitHub] Starting repository search at {datetime.now().isoformat()}.")
    while attempt < max_attempts:
        try:
            print(f"[GitHub] Attempt {attempt+1}: Calling search_repositories API...")
            start_time = time.time()
            repos = g.search_repositories(query=query)
            elapsed = time.time() - start_time
            print(f"[GitHub] Search API call successful (elapsed: {elapsed:.2f}s).")
            break
        except Exception as e:
            print(f"[GitHub] Search API call failed (attempt {attempt+1}): {e}")
            if 'rate limit' in str(e).lower() or '403' in str(e):
                backoff = 2 ** attempt
                print(f"[GitHub] Rate limit hit. Backing off for {backoff} seconds...")
                time.sleep(backoff)
                attempt += 1
            else:
                print(f"[GitHub] Unhandled error, aborting: {e}")
                return
    else:
        print("[GitHub] Failed to fetch repositories after retries.")
        return
    print(f"[GitHub] Beginning to process repositories at {datetime.now().isoformat()}.")
    for i, repo in enumerate(repos):
        if i >= 5:
            print(f"[GitHub] Limit reached (5 repos). Stopping early for this run at {datetime.now().isoformat()}.")
            break
        print(f"[GitHub] ({i+1}) Processing repo: {repo.full_name} (stars: {repo.stargazers_count}) at {datetime.now().isoformat()}")
        try:
            print(f"[GitHub] Fetching README for {repo.full_name}...")
            start_time = time.time()
            readme = repo.get_readme().decoded_content.decode()
            elapsed = time.time() - start_time
            print(f"[GitHub] Got README for {repo.full_name} (length: {len(readme)}) in {elapsed:.2f}s.")
            benchmarks = extract_benchmarks_from_readme(readme)
            print(f"[GitHub] Extracted {len(benchmarks)} benchmark(s) from README.")
            for b in benchmarks:
                insert_benchmark("GitHub", repo.full_name, *b)
        except Exception as e:
            print(f"[GitHub] Error in {repo.full_name} while fetching/parsing README: {e}")
        print(f"[GitHub] Pausing 10 seconds before next repo...")
        time.sleep(10)
    print(f"[GitHub] Pausing 30 seconds before next GitHub run...")
    time.sleep(30)
    print(f"[GitHub] Done processing repositories at {datetime.now().isoformat()}.")

def scrape_gitlab():
    print("[GitLab] Authenticating...")
    gl = gitlab.Gitlab('https://gitlab.com', private_token=GITLAB_TOKEN, timeout=10)
    print("[GitLab] Searching for public projects with 'benchmark' in name...")
    print("[GitLab] Listing projects with 'benchmark' in name...")
    try:
        projects = gl.projects.list(search='benchmark', visibility='public', per_page=2)
        print(f"[GitLab] Project list API call successful. {len(projects)} projects found.")
    except Exception as e:
        print(f"[GitLab] Project list API call failed: {e}")
        return
    for project in projects:
        try:
            print(f"[GitLab] Fetching full project object for {getattr(project, 'path_with_namespace', 'unknown')} (id={project.id})...")
            full_project = gl.projects.get(project.id)
            print(f"[GitLab] Attempting to fetch README.md for {full_project.path_with_namespace}...")
            try:
                readme_file = full_project.files.get(file_path='README.md', ref=full_project.default_branch)
                import base64
                readme_content = base64.b64decode(readme_file.content).decode('utf-8', errors='replace')
                print(f"[GitLab] Got README.md for {full_project.path_with_namespace} (length: {len(readme_content)})")
                benchmarks = extract_benchmarks_from_readme(readme_content)
                print(f"[GitLab] Extracted {len(benchmarks)} benchmark(s) from README.md.")
                for b in benchmarks:
                    insert_benchmark("GitLab", full_project.path_with_namespace, *b)
            except Exception as e:
                print(f"[GitLab] Could not fetch README.md for {full_project.path_with_namespace}: {e}")
        except Exception as e:
            print(f"[GitLab] Error in {getattr(project, 'path_with_namespace', 'unknown')} (id={project.id}): {e}")
    print("[GitLab] Done.")

def main():
    print("[Main] Starting GitHub scrape...")
    scrape_github()
    print("[Main] Starting GitLab scrape...")
    scrape_gitlab()
    print("[Main] All done.")

if __name__ == "__main__":
    main()
