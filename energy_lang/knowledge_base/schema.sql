-- EnergyLang Knowledge Base: PostgreSQL Schema

-- Table for benchmark sources (websites, papers, user submissions)
CREATE TABLE sources (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT,
    description TEXT,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for hardware profiles (CPU, GPU, NPU, system info)
CREATE TABLE hardware_profiles (
    id SERIAL PRIMARY KEY,
    cpu TEXT,
    gpu TEXT,
    npu TEXT,
    ram_gb INTEGER,
    os TEXT,
    notes TEXT,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for benchmarks (test type, language, toolchain, etc.)

CREATE TABLE benchmarks (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES sources(id),
    hardware_id INTEGER REFERENCES hardware_profiles(id),
    test_name TEXT NOT NULL,
    language TEXT NOT NULL,
    toolchain TEXT,
    version TEXT,
    workload TEXT,
    date_run TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_benchmark UNIQUE (source_id, test_name, language, toolchain, version, workload)
);

-- Table for results (performance, energy, etc.)
CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    benchmark_id INTEGER REFERENCES benchmarks(id),
    throughput_ops_per_sec FLOAT,
    latency_ms FLOAT,
    energy_joules_per_op FLOAT,
    power_watts FLOAT,
    notes TEXT,
    date_recorded TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for user submissions (for crowdsourcing)
CREATE TABLE user_submissions (
    id SERIAL PRIMARY KEY,
    user_name TEXT,
    email TEXT,
    hardware_id INTEGER REFERENCES hardware_profiles(id),
    benchmark_id INTEGER REFERENCES benchmarks(id),
    date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX idx_benchmarks_language ON benchmarks(language);
CREATE INDEX idx_results_benchmark_id ON results(benchmark_id);
CREATE INDEX idx_hardware_profiles_cpu ON hardware_profiles(cpu);
