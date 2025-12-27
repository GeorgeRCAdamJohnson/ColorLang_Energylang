import type { ProcessedBenchmarkData } from '../types'

// Simple data service with embedded sample data
export class SimpleDataService {
  private static instance: SimpleDataService

  static getInstance(): SimpleDataService {
    if (!SimpleDataService.instance) {
      SimpleDataService.instance = new SimpleDataService()
    }
    return SimpleDataService.instance
  }

  async loadBenchmarkData(): Promise<ProcessedBenchmarkData[]> {
    // Return sample data that demonstrates C++ is ~6x more efficient than Python
    return [
      {
        id: 'cpp-1',
        language: 'C++',
        benchmark: 'matrix_multiply',
        iteration: 1,
        totalIterations: 5,
        avgCpuPowerW: 50,
        totalCpuEnergyJ: 10,
        avgGpuPowerW: 0,
        runtimeMs: 100,
        totalEnergyJ: 10,
        jPerFlop: 0.00001,
        timestamp: new Date(),
        runId: 'run-cpp-1',
      },
      {
        id: 'python-1',
        language: 'Python',
        benchmark: 'matrix_multiply',
        iteration: 1,
        totalIterations: 5,
        avgCpuPowerW: 150,
        totalCpuEnergyJ: 60,
        avgGpuPowerW: 0,
        runtimeMs: 400,
        totalEnergyJ: 60,
        jPerFlop: 0.00006,
        timestamp: new Date(),
        runId: 'run-python-1',
      },
    ]
  }

  async getEfficiencyComparison() {
    const data = await this.loadBenchmarkData()
    return data.map(item => ({
      language: item.language,
      avgEnergyJ: item.totalEnergyJ,
      avgRuntimeMs: item.runtimeMs,
      efficiency: item.totalEnergyJ / (item.runtimeMs / 1000),
    }))
  }
}

export const simpleDataService = SimpleDataService.getInstance()
