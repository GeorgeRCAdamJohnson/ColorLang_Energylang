import type { ProcessedBenchmarkData } from '../types'

/**
 * Create sample data for development/testing
 * This demonstrates the key research finding: C++ is ~6x more energy efficient than Python
 */
export const createSampleData = (): ProcessedBenchmarkData[] => {
  const languages = ['C++', 'Python', 'Rust', 'Go', 'Java']
  const benchmarks = ['matrix_multiply', 'sorting', 'file_io']
  const sampleData: ProcessedBenchmarkData[] = []

  languages.forEach((language, langIndex) => {
    benchmarks.forEach((benchmark, benchIndex) => {
      for (let i = 1; i <= 5; i++) {
        // Key research finding: C++ is ~6x more energy efficient than Python
        const baseEnergy = langIndex === 0 ? 10 : langIndex === 1 ? 60 : 25 // C++ vs Python vs others
        const energyVariation = (Math.random() - 0.5) * 0.2 // ±10% variation
        const energy = baseEnergy * (1 + energyVariation)

        const baseRuntime = langIndex === 0 ? 100 : langIndex === 1 ? 400 : 200
        const runtimeVariation = (Math.random() - 0.5) * 0.3 // ±15% variation
        const runtime = baseRuntime * (1 + runtimeVariation)

        sampleData.push({
          id: `sample-${langIndex}-${benchIndex}-${i}`,
          language,
          benchmark,
          iteration: i,
          totalIterations: 5,
          avgCpuPowerW: energy / (runtime / 1000), // Power = Energy / Time
          totalCpuEnergyJ: energy,
          avgGpuPowerW: Math.random() * 5,
          runtimeMs: runtime,
          totalEnergyJ: energy,
          jPerFlop: energy / (1000000 * (langIndex === 1 ? 0.1 : 1)), // Python has fewer effective FLOPS
          timestamp: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
          runId: `run-${langIndex}-${benchIndex}-${i}`,
        })
      }
    })
  })

  return sampleData
}
