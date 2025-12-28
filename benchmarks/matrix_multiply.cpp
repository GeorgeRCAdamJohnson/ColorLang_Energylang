#include <iostream>
#include <thread>
#include <chrono>
#include <fstream>
#include <cstdlib>

int main() {
    // Optional profiler handshake: if env var WAIT_FOR_PROFILER_HANDSHAKE=1,
    // wait for the file `start_run` to appear (with timeout) before proceeding.
    const char* handshake = std::getenv("WAIT_FOR_PROFILER_HANDSHAKE");
    if (handshake && std::string(handshake) == "1") {
        const char* timeout_ms_env = std::getenv("WAIT_FOR_PROFILER_TIMEOUT_MS");
        int timeout_ms = timeout_ms_env ? std::atoi(timeout_ms_env) : 5000;
        int waited = 0;
        const int tick = 50; // ms
        bool started = false;
        // allow the wrapper to pass a specific sentinel path (per-iteration) via env
        const char* sentinel_env = std::getenv("WAIT_FOR_PROFILER_SENTINEL");
        std::string sentinel_path = sentinel_env ? std::string(sentinel_env) : std::string("start_run");
        const char* bench_start_env = std::getenv("WAIT_FOR_PROFILER_BENCH_START");
        std::string bench_start_path = bench_start_env ? std::string(bench_start_env) : std::string();
        while (waited < timeout_ms) {
            std::ifstream f(sentinel_path);
            if (f.good()) {
                // record timestamp when sentinel seen
                auto now = std::chrono::system_clock::now();
                auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count();
                std::cout << "SENTINEL_SEEN_MS: " << ms << std::endl;
                // Allow a short, configurable delay after the sentinel is seen
                // so profilers have time to begin sampling. This reduces
                // attach/start race failures for very-short runs.
                const char* delay_env = std::getenv("WAIT_FOR_PROFILER_BENCH_START_DELAY_MS");
                int delay_ms = delay_env ? std::atoi(delay_env) : 150; // default 150ms
                if (delay_ms > 0) std::this_thread::sleep_for(std::chrono::milliseconds(delay_ms));
                // record timestamp when we actually start the work (after delay)
                auto now2 = std::chrono::system_clock::now();
                auto ms2 = std::chrono::duration_cast<std::chrono::milliseconds>(now2.time_since_epoch()).count();
                // if requested, write a bench-start file for deterministic instrumentation
                if (!bench_start_path.empty()) {
                    try {
                        std::ofstream bf(bench_start_path);
                        if (bf.good()) {
                            bf << ms2 << std::endl;
                            bf.close();
                        }
                    } catch (...) {
                        // ignore write failures
                    }
                }
                // report the effective start timestamp
                std::cout << "SENTINEL_SEEN_EFFECTIVE_MS: " << ms2 << std::endl;
                started = true;
                break;
            }
            std::this_thread::sleep_for(std::chrono::milliseconds(tick));
            waited += tick;
        }
        // if handshake timed out, fall back to a short sleep to reduce race
        if (!started) {
            auto now = std::chrono::system_clock::now();
            auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count();
            std::cout << "HANDSHAKE_TIMEOUT_FALLBACK_MS: " << ms << std::endl;
            // write bench-start fallback if requested
            if (!bench_start_path.empty()) {
                try {
                    // write the fallback bench-start so instrumentation still has a timestamp
                    std::ofstream bf(bench_start_path);
                    if (bf.good()) {
                        bf << ms << std::endl;
                        bf.close();
                    }
                } catch (...) {
                }
            }
            // allow a short extra delay to reduce race if handshake timed out
            std::this_thread::sleep_for(std::chrono::milliseconds(300));
        }
    } else {
        // legacy short startup sleep so profilers have time to attach for very fast runs
        auto now = std::chrono::system_clock::now();
        auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count();
        std::cout << "LEGACY_SLEEP_AT_MS: " << ms << std::endl;
        // honor the configurable delay here as well
        const char* delay_env2 = std::getenv("WAIT_FOR_PROFILER_BENCH_START_DELAY_MS");
        int delay_ms2 = delay_env2 ? std::atoi(delay_env2) : 150;
        std::this_thread::sleep_for(std::chrono::milliseconds(delay_ms2));
    }
    // record start of work timestamp
    auto work_start = std::chrono::system_clock::now();
    auto work_start_ms = std::chrono::duration_cast<std::chrono::milliseconds>(work_start.time_since_epoch()).count();
    std::cout << "BENCH_START_MS: " << work_start_ms << std::endl;

    int a[2][2] = {{1, 2}, {3, 4}};
    int b[2][2] = {{5, 6}, {7, 8}};
    int c[2][2] = {0};
    for (int i = 0; i < 2; ++i)
        for (int j = 0; j < 2; ++j)
            for (int k = 0; k < 2; ++k)
                c[i][j] += a[i][k] * b[k][j];
    for (int i = 0; i < 2; ++i) {
        for (int j = 0; j < 2; ++j)
            std::cout << c[i][j] << " ";
        std::cout << std::endl;
    }
    return 0;
}
