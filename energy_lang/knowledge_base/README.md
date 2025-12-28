# Energyland Knowledge Base

This folder contains the schema, scripts, and templates for collecting, storing, and analyzing benchmark and energy profiling data.

## Contents
- `schema.sql` — PostgreSQL schema for sources, hardware, benchmarks, results, and user submissions
- `collect_benchmarks.py` — Script template for running and inserting benchmarks

## Usage
1. Set up a PostgreSQL database using `schema.sql`.
2. Configure environment variables for DB connection in `collect_benchmarks.py`.
3. Extend the script to run real benchmarks and collect energy/performance data.
4. Use the script to insert results from scraping, local runs, or user submissions.

## Next Steps
- Add scraping modules for public benchmarks
- Implement real benchmark runners for Python, Go, Rust, C/C++, ONNX, TVM, etc.
- Integrate energy profiling tools (Intel VTune, ARM Streamline, NVIDIA Nsight, OS APIs)
- Build dashboards and analytics for visualization

---

*This knowledge base will power transparent, up-to-date validation and improvement of Energyland.*
