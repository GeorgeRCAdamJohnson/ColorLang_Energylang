"""
Insert a default source row into the EnergyLang knowledge base PostgreSQL database.
Run this script once before running collect_benchmarks.py to ensure source_id=1 exists.
"""
import psycopg2
import os
from dotenv import load_dotenv

# Load DB credentials from .env
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

DB_HOST = os.getenv('ENERGYLANG_DB_HOST', 'localhost')
DB_PORT = os.getenv('ENERGYLANG_DB_PORT', '5432')
DB_NAME = os.getenv('ENERGYLANG_DB_NAME', 'energy_lang')
DB_USER = os.getenv('ENERGYLANG_DB_USER', 'postgres')
DB_PASS = os.getenv('ENERGYLANG_DB_PASS', 'password')

def main():
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO sources (name, url, description)
            VALUES (%s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (
            'EnergyLang Demo',
            'https://github.com/GeorgeRCAdamJohnson/new-language',
            'Default source for EnergyLang demo benchmarks.'
        ))
    conn.commit()
    conn.close()
    print("Inserted default source row (if not already present).")

if __name__ == "__main__":
    main()
