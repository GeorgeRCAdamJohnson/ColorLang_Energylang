"""
remove_duplicate_sources.py

Removes duplicate names from the sources table, keeping only the row with the lowest id for each name.
"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv("DATABASE_URL")

def main():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    # Find all duplicate names
    cur.execute("""
        SELECT name FROM sources GROUP BY name HAVING COUNT(*) > 1;
    """)
    duplicates = [row[0] for row in cur.fetchall()]
    total_deleted = 0
    for name in duplicates:
        # Get all ids for this name, ordered by id
        cur.execute("SELECT id FROM sources WHERE name = %s ORDER BY id ASC;", (name,))
        ids = [row[0] for row in cur.fetchall()]
        if len(ids) > 1:
            id_to_keep = ids[0]
            ids_to_delete = ids[1:]
            # For each benchmark referencing a duplicate source id, check if a conflicting row exists
            for sid in ids_to_delete:
                cur.execute("""
                    SELECT id, test_name, language, toolchain, version, workload FROM benchmarks WHERE source_id = %s;
                """, (sid,))
                rows = cur.fetchall()
                for row in rows:
                    _, test_name, language, toolchain, version, workload = row
                    # Check if a benchmark with id_to_keep and same fields exists
                    cur.execute("""
                        SELECT id FROM benchmarks WHERE source_id = %s AND test_name = %s AND language = %s AND toolchain = %s AND version = %s AND workload = %s;
                    """, (id_to_keep, test_name, language, toolchain, version, workload))
                    exists = cur.fetchone()
                    if exists:
                        # Delete results referencing this benchmark first
                        cur.execute("""
                            DELETE FROM results WHERE benchmark_id = %s;
                        """, (row[0],))
                        # Now delete the duplicate benchmark row
                        cur.execute("""
                            DELETE FROM benchmarks WHERE id = %s;
                        """, (row[0],))
            # Now safe to update remaining benchmarks
            cur.execute(
                "UPDATE benchmarks SET source_id = %s WHERE source_id = ANY(%s);",
                (id_to_keep, ids_to_delete)
            )
            # Now delete the duplicate sources
            cur.execute(
                "DELETE FROM sources WHERE id = ANY(%s);",
                (ids_to_delete,)
            )
            print(f"Reassigned benchmarks and deleted {len(ids_to_delete)} duplicates for name: {name}")
            total_deleted += len(ids_to_delete)
    conn.commit()
    print(f"Total duplicates deleted: {total_deleted}")
    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
