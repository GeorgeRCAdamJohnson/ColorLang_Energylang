// Navigation types
export interface NavigationItem {
  id: string
  label: string
  path: string
  description: string
  hasInteractive?: boolean
  completed?: boolean
}

// Benchmark data types (legacy - kept for compatibility)
export interface BenchmarkResult {
  id: string
  language: string
  benchmark: string
  executionTime: number
  energyConsumption: number
  memoryUsage: number
  timestamp: string
  runId: number
}

export interface EnergyMeasurement {
  timestamp: string
  powerWatts: number
  durationSeconds: number
  energyJoules: number
}

export interface BenchmarkSummary {
  language: string
  averageEnergy: number
  averageTime: number
  efficiency: number // J/FLOP
  sampleCount: number
}

// New CSV-based benchmark data types
export interface RawBenchmarkData {
  benchmark: string
  iteration: number
  total_iterations: number
  avg_cpu_power_W: number
  total_cpu_energy_J: number
  avg_gpu_power_W: number
  runtime_ms: number
  bench_start_ts: number
  bench_start_path: string
  generated_path: string
  live_profile_file: string
  result_ids: string
}

export interface ProcessedBenchmarkData {
  id: string
  language: string
  benchmark: string
  iteration: number
  totalIterations: number
  avgCpuPowerW: number
  totalCpuEnergyJ: number
  avgGpuPowerW: number
  runtimeMs: number
  totalEnergyJ: number
  jPerFlop?: number
  timestamp: Date
  runId: string
}

export interface AggregatedBenchmarkData {
  language: string
  benchmark: string
  count: number
  meanRuntimeMs: number
  meanEnergyJ: number
  meanPowerW: number
  jPerFlop: number
  standardDeviation: {
    runtime: number
    energy: number
    power: number
  }
  rawMeasurements: ProcessedBenchmarkData[]
}

// ColorLang types
export interface ColorProgram {
  id: string
  name: string
  description: string
  colorField: ColorPixel[][]
  width: number
  height: number
}

export interface ColorPixel {
  hue: number // 0-360
  saturation: number // 0-100
  value: number // 0-100
  instruction?: string
  data?: number
}

export interface ColorLangExecution {
  program: ColorProgram
  steps: ExecutionStep[]
  result: unknown
}

export interface ExecutionStep {
  position: { x: number; y: number }
  instruction: string
  data: number
  output?: string
}

// Chart types
export interface ChartDataPoint {
  x: number | string
  y: number
  label?: string
  color?: string
  metadata?: ProcessedBenchmarkData | AggregatedBenchmarkData
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'scatter' | 'box'
  title: string
  xLabel: string
  yLabel: string
  data: ChartDataPoint[]
  colors?: string[]
}

// Toast notification types
export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning' | 'discovery' | 'achievement' | 'guidance'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  priority?: 'low' | 'normal' | 'high'
}

// User progress tracking
export interface UserProgress {
  sectionsVisited: string[]
  interactionsCompleted: string[]
  achievementsUnlocked: string[]
  lastVisit: string
}

// API response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

// Filter and search types
export interface FilterOptions {
  languages: string[]
  benchmarks: string[]
  dateRange: {
    start: string
    end: string
  }
  energyRange: {
    min: number
    max: number
  }
}

export interface SearchResult {
  id: string
  title: string
  description: string
  url: string
  relevance: number
}
