"""
EnergyLang Multi-Source Benchmark Scraper
- Runs all individual scrapers in sequence for bulk data ingestion
"""

import subprocess
import sys
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.getcwd(), 'energy_lang', 'knowledge_base', '.env'))

SCRAPERS = [
    'energy_lang/knowledge_base/scrape_benchmarks.py',
    'energy_lang/knowledge_base/scrape_techempower.py',
    'energy_lang/knowledge_base/scrape_github_gitlab.py',
    'energy_lang/knowledge_base/scrape_openbenchmarking.py',
    'energy_lang/knowledge_base/scrape_mlperf.py',
    'energy_lang/knowledge_base/scrape_hanabi1224.py',
]

def main():
    for script in SCRAPERS:
        print(f"\n========== Starting {script} ==========")
        try:
            # Pass current environment (with .env loaded) to subprocess
            result = subprocess.run(
                [sys.executable, script],
                capture_output=True,
                text=True,
                env=os.environ.copy()
            )
            print(f"[stdout for {script}]:\n{result.stdout}")
            if result.stderr:
                print(f"[stderr for {script}]:\n{result.stderr}")
        except Exception as e:
            print(f"[Exception in {script}]: {e}")
        print(f"========== Finished {script} ==========")

if __name__ == '__main__':
    main()
