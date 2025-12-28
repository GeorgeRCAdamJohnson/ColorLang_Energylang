-- common_data_validation.sql
-- Useful SQL queries for validating data integrity and counts in the EnergyLang knowledge base

-- 1. Count rows in key tables
SELECT 'sources' AS table, COUNT(*) FROM sources;
SELECT 'benchmarks' AS table, COUNT(*) FROM benchmarks;
SELECT 'results' AS table, COUNT(*) FROM results;

-- 2. Check for duplicate names in sources (should be zero)
SELECT name, COUNT(*) FROM sources GROUP BY name HAVING COUNT(*) > 1;

-- 3. Check for duplicate unique keys in benchmarks (should be zero)
SELECT source_id, test_name, language, toolchain, version, workload, COUNT(*)
FROM benchmarks
GROUP BY source_id, test_name, language, toolchain, version, workload
HAVING COUNT(*) > 1;

-- 4. Check for orphaned benchmarks (benchmarks with missing source)
SELECT b.* FROM benchmarks b
LEFT JOIN sources s ON b.source_id = s.id
WHERE s.id IS NULL;

-- 5. Check for orphaned results (results with missing benchmark)
SELECT r.* FROM results r
LEFT JOIN benchmarks b ON r.benchmark_id = b.id
WHERE b.id IS NULL;

-- 6. Count distinct test_names, languages, toolchains, versions, workloads
SELECT COUNT(DISTINCT test_name) FROM benchmarks;
SELECT COUNT(DISTINCT language) FROM benchmarks;
SELECT COUNT(DISTINCT toolchain) FROM benchmarks;
SELECT COUNT(DISTINCT version) FROM benchmarks;
SELECT COUNT(DISTINCT workload) FROM benchmarks;

-- 7. List all sources
SELECT * FROM sources ORDER BY id;

-- 8. List all benchmarks for a given source (replace 1 with source_id)
SELECT * FROM benchmarks WHERE source_id = 1;

-- 9. List all results for a given benchmark (replace 1 with benchmark_id)
SELECT * FROM results WHERE benchmark_id = 1;
