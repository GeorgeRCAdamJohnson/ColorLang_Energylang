import os
import pandas as pd
import psycopg2
from dotenv import load_dotenv, find_dotenv

# Load the correct .env file
load_dotenv(find_dotenv("energy_lang/knowledge_base/.env"), override=True)
DB_URL = os.getenv("DATABASE_URL")

query = '''
SELECT b.test_name, COUNT(*) as count_with_energy
FROM results r
JOIN benchmarks b ON r.benchmark_id = b.id
WHERE r.power_watts IS NOT NULL AND r.energy_joules_per_op IS NOT NULL
GROUP BY b.test_name
ORDER BY b.test_name;
'''

conn = psycopg2.connect(DB_URL)
df = pd.read_sql_query(query, conn)
conn.close()

print("\nCount of Results with Energy Data by Benchmark:")
print(df)

# Optionally, print total count for all results (with or without energy data)
query_total = '''
SELECT b.test_name, COUNT(*) as total_count
FROM results r
JOIN benchmarks b ON r.benchmark_id = b.id
GROUP BY b.test_name
ORDER BY b.test_name;
'''
conn = psycopg2.connect(DB_URL)
df_total = pd.read_sql_query(query_total, conn)
conn.close()
print("\nTotal Results by Benchmark (with or without energy data):")
print(df_total)

# Query to get min and max result_id for each benchmark
query_id_ranges = '''
SELECT b.test_name, MIN(r.id) as min_id, MAX(r.id) as max_id, COUNT(*) as total
FROM results r
JOIN benchmarks b ON r.benchmark_id = b.id
GROUP BY b.test_name
ORDER BY b.test_name;
'''
conn = psycopg2.connect(DB_URL)
df_id_ranges = pd.read_sql_query(query_id_ranges, conn)
conn.close()
print("\nResult ID ranges by benchmark:")
print(df_id_ranges)
