import * as Papa from 'papaparse'

// Raw CSV data structure based on the actual benchmark files
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

// Processed benchmark data for visualization
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
  totalEnergyJ: number // Canonicalized: power × time
  jPerFlop?: number // Energy efficiency metric
  timestamp: Date
  runId: string
}

// Aggregated data for charts
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

// Data validation error
export class DataValidationError extends Error {
  constructor(
    message: string,
    public row?: number,
    public field?: string
  ) {
    super(message)
    this.name = 'DataValidationError'
  }
}

/**
 * CSV Data Loader with Papa Parse integration
 * Handles loading, parsing, and validation of benchmark CSV files
 */
export class CSVDataLoader {
  private static readonly REQUIRED_FIELDS = [
    'benchmark',
    'iteration',
    'total_iterations',
    'avg_cpu_power_W',
    'total_cpu_energy_J',
    'runtime_ms',
  ]

  /**
   * Load and parse CSV data from a file or URL
   */
  static async loadCSV(source: File | string): Promise<RawBenchmarkData[]> {
    return new Promise((resolve, reject) => {
      const config = {
        header: true,
        skipEmptyLines: true,
        download: typeof source === 'string', // Enable download for URL strings
        transformHeader: (header: string) => header.trim(),
        transform: (value: string, field: string) => {
          // Clean up numeric fields
          if (field && this.isNumericField(field)) {
            const cleaned = value.trim()
            return cleaned === '' ? '0' : cleaned
          }
          return value.trim()
        },
        complete: (results: Papa.ParseResult<Record<string, unknown>>) => {
          try {
            const validatedData = this.validateAndCleanData(
              results.data as Record<string, unknown>[]
            )
            resolve(validatedData)
          } catch (error) {
            console.error('CSV validation error:', error)
            reject(error)
          }
        },
        error: (error: Papa.ParseError) => {
          console.error('CSV parsing error:', error)
          reject(new Error(`CSV parsing failed: ${error.message}`))
        },
      }

      // Use Papa.parse with type assertion to handle complex overload resolution
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(Papa.parse as any)(source, config)
    })
  }

  /**
   * Process raw CSV data into visualization-ready format
   */
  static processData(rawData: RawBenchmarkData[]): ProcessedBenchmarkData[] {
    return rawData.map((row, index) => {
      try {
        return this.processRow(row, index)
      } catch (error) {
        console.warn(`Error processing row ${index}:`, error)
        throw new DataValidationError(
          `Failed to process row ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          index
        )
      }
    })
  }

  /**
   * Canonicalize energy data using physics-based calculation (power × time)
   */
  static canonicalizeEnergy(powerW: number, runtimeMs: number): number {
    if (powerW < 0 || runtimeMs < 0) {
      throw new DataValidationError('Power and runtime must be non-negative')
    }

    // Convert runtime from milliseconds to seconds, then calculate energy
    const runtimeSeconds = runtimeMs / 1000
    return powerW * runtimeSeconds
  }

  /**
   * Aggregate data by language and benchmark for visualization
   */
  static aggregateData(processedData: ProcessedBenchmarkData[]): AggregatedBenchmarkData[] {
    const groups = new Map<string, ProcessedBenchmarkData[]>()

    // Group by language and benchmark
    processedData.forEach(row => {
      const key = `${row.language}:${row.benchmark}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(row)
    })

    // Calculate aggregated statistics
    return Array.from(groups.entries()).map(([key, rows]) => {
      const [language, benchmark] = key.split(':')

      const runtimes = rows.map(r => r.runtimeMs)
      const energies = rows.map(r => r.totalEnergyJ)
      const powers = rows.map(r => r.avgCpuPowerW + r.avgGpuPowerW)

      // Filter out undefined J/FLOP values before calculating mean
      const validJPerFlopValues = rows
        .map(r => r.jPerFlop)
        .filter((jPerFlop): jPerFlop is number => jPerFlop !== undefined && jPerFlop > 0)

      return {
        language,
        benchmark,
        count: rows.length,
        meanRuntimeMs: this.calculateMean(runtimes),
        meanEnergyJ: this.calculateMean(energies),
        meanPowerW: this.calculateMean(powers),
        jPerFlop: validJPerFlopValues.length > 0 ? this.calculateMean(validJPerFlopValues) : 0,
        standardDeviation: {
          runtime: this.calculateStandardDeviation(runtimes),
          energy: this.calculateStandardDeviation(energies),
          power: this.calculateStandardDeviation(powers),
        },
        rawMeasurements: rows,
      }
    })
  }

  /**
   * Extract language from benchmark path
   */
  private static extractLanguage(benchmarkPath: string): string {
    const path = benchmarkPath.toLowerCase()

    // Check for EnergyLang first (before Python, since it uses .py extension)
    if (path.includes('energylang')) return 'EnergyLang'
    if (path.includes('.cpp') || path.includes('cpp')) return 'C++'
    if (path.includes('.py') || path.includes('python')) return 'Python'
    if (path.includes('.rs') || path.includes('rust')) return 'Rust'
    if (path.includes('.go')) return 'Go'
    if (path.includes('.java')) return 'Java'
    if (path.includes('.js') || path.includes('javascript')) return 'JavaScript'

    // Default fallback
    return 'Unknown'
  }

  /**
   * Process a single row of data
   */
  private static processRow(row: RawBenchmarkData, index: number): ProcessedBenchmarkData {
    // Extract language from benchmark path
    const language = this.extractLanguage(row.benchmark)

    // Calculate canonicalized energy (power × time)
    const totalPowerW = row.avg_cpu_power_W + (row.avg_gpu_power_W || 0)
    const canonicalizedEnergyJ = this.canonicalizeEnergy(totalPowerW, row.runtime_ms)

    // Use provided energy if available, otherwise use canonicalized
    const totalEnergyJ = row.total_cpu_energy_J > 0 ? row.total_cpu_energy_J : canonicalizedEnergyJ

    // Calculate J/FLOP if we have the data (simplified estimation)
    // For matrix multiplication, approximate FLOP count based on runtime
    const estimatedFlops = this.estimateFlops(row.benchmark, row.runtime_ms)
    const jPerFlop = estimatedFlops > 0 ? totalEnergyJ / estimatedFlops : undefined

    return {
      id: `${language}-${row.benchmark}-${row.iteration}-${index}`,
      language,
      benchmark: this.extractBenchmarkName(row.benchmark),
      iteration: row.iteration,
      totalIterations: row.total_iterations,
      avgCpuPowerW: row.avg_cpu_power_W,
      totalCpuEnergyJ: row.total_cpu_energy_J,
      avgGpuPowerW: row.avg_gpu_power_W || 0,
      runtimeMs: row.runtime_ms,
      totalEnergyJ,
      jPerFlop,
      timestamp: new Date(row.bench_start_ts || Date.now()),
      runId: `run-${index}`,
    }
  }

  /**
   * Extract benchmark name from path
   */
  private static extractBenchmarkName(benchmarkPath: string): string {
    const parts = benchmarkPath.split(/[/\\]/)
    const filename = parts[parts.length - 1]
    return filename.replace(/\.(cpp|py|rs|go|java|js)$/, '')
  }

  /**
   * Estimate FLOP count for benchmarks based on actual computational complexity
   */
  private static estimateFlops(benchmark: string, _runtimeMs: number): number {
    const benchmarkName = benchmark.toLowerCase()

    if (
      benchmarkName.includes('matrix_multiply') ||
      benchmarkName.includes('energylang_matrix_multiply')
    ) {
      // For matrix multiplication, assume standard 1000x1000 matrices
      // Matrix multiplication complexity: O(n^3) for n×n matrices
      // For 1000×1000 matrices: 2 * n^3 = 2 * 1000^3 = 2 billion FLOPs
      const matrixSize = 1000 // Standard benchmark matrix size
      const flops = 2 * Math.pow(matrixSize, 3) // 2n^3 for matrix multiplication
      return flops
    }

    if (benchmarkName.includes('fft')) {
      // FFT complexity: O(n log n)
      const n = 1048576 // 2^20, common FFT size
      return n * Math.log2(n) * 5 // Approximate FLOPs per complex multiplication
    }

    if (benchmarkName.includes('convolution')) {
      // 2D convolution with typical image sizes
      const imageSize = 512 * 512
      const kernelSize = 3 * 3
      return imageSize * kernelSize * 2 // Multiply and accumulate
    }

    if (benchmarkName.includes('sorting')) {
      // Sorting algorithms typically don't have floating point operations
      return 0
    }

    if (benchmarkName.includes('ml_inference') || benchmarkName.includes('neural')) {
      // Neural network inference - rough estimation
      const parameters = 1000000 // 1M parameters
      return parameters * 2 // Forward pass approximation
    }

    // For unknown benchmarks, return 0 to avoid misleading data
    return 0
  }

  /**
   * Validate and clean raw CSV data
   */
  private static validateAndCleanData(data: Record<string, unknown>[]): RawBenchmarkData[] {
    if (!Array.isArray(data)) {
      throw new DataValidationError('Data is not an array')
    }

    if (data.length === 0) {
      throw new DataValidationError('No data found in CSV file')
    }

    return data.map((row, index) => {
      // Check required fields
      for (const field of this.REQUIRED_FIELDS) {
        if (!(field in row) || row[field] === undefined || row[field] === '') {
          throw new DataValidationError(`Missing required field: ${field}`, index, field)
        }
      }

      // Convert numeric fields
      const cleanedRow: RawBenchmarkData = {
        benchmark: String(row.benchmark || ''),
        iteration: this.parseNumber(row.iteration, 'iteration', index),
        total_iterations: this.parseNumber(row.total_iterations, 'total_iterations', index),
        avg_cpu_power_W: this.parseNumber(row.avg_cpu_power_W, 'avg_cpu_power_W', index),
        total_cpu_energy_J: this.parseNumber(row.total_cpu_energy_J, 'total_cpu_energy_J', index),
        avg_gpu_power_W: this.parseNumber(row.avg_gpu_power_W || 0, 'avg_gpu_power_W', index),
        runtime_ms: this.parseNumber(row.runtime_ms, 'runtime_ms', index),
        bench_start_ts: this.parseNumber(row.bench_start_ts || Date.now(), 'bench_start_ts', index),
        bench_start_path: String(row.bench_start_path || ''),
        generated_path: String(row.generated_path || ''),
        live_profile_file: String(row.live_profile_file || ''),
        result_ids: String(row.result_ids || ''),
      }

      return cleanedRow
    })
  }

  /**
   * Parse and validate numeric values
   */
  private static parseNumber(value: unknown, fieldName: string, rowIndex: number): number {
    if (typeof value === 'number' && !isNaN(value)) {
      return value
    }

    if (typeof value === 'string') {
      // Handle 'None' values from Python data
      if (value.toLowerCase() === 'none' || value.trim() === '') {
        // Return sensible defaults for different fields
        if (fieldName === 'bench_start_ts') {
          return Date.now() // Use current timestamp as fallback
        }
        return 0 // Default to 0 for other numeric fields
      }

      const parsed = parseFloat(value)
      if (!isNaN(parsed)) {
        return parsed
      }
    }

    // For timestamp fields, provide a reasonable fallback
    if (fieldName === 'bench_start_ts') {
      console.warn(`Invalid timestamp for row ${rowIndex}, using current time`)
      return Date.now()
    }

    throw new DataValidationError(
      `Invalid numeric value for field ${fieldName}: ${value}`,
      rowIndex,
      fieldName
    )
  }

  /**
   * Check if a field should be treated as numeric
   */
  private static isNumericField(field: string): boolean {
    const numericFields = [
      'iteration',
      'total_iterations',
      'avg_cpu_power_W',
      'total_cpu_energy_J',
      'avg_gpu_power_W',
      'runtime_ms',
      'bench_start_ts',
    ]
    return numericFields.includes(field)
  }

  /**
   * Calculate mean of an array of numbers
   */
  private static calculateMean(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  /**
   * Calculate standard deviation of an array of numbers
   */
  private static calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0
    const mean = this.calculateMean(values)
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    return Math.sqrt(this.calculateMean(squaredDiffs))
  }
}

/**
 * Utility functions for data processing
 */
export const DataProcessingUtils = {
  /**
   * Filter data by language
   */
  filterByLanguage: (
    data: ProcessedBenchmarkData[],
    languages: string[]
  ): ProcessedBenchmarkData[] => {
    if (languages.length === 0) return data
    return data.filter(row => languages.includes(row.language))
  },

  /**
   * Filter data by benchmark type
   */
  filterByBenchmark: (
    data: ProcessedBenchmarkData[],
    benchmarks: string[]
  ): ProcessedBenchmarkData[] => {
    if (benchmarks.length === 0) return data
    return data.filter(row => benchmarks.includes(row.benchmark))
  },

  /**
   * Filter data by energy range
   */
  filterByEnergyRange: (
    data: ProcessedBenchmarkData[],
    min: number,
    max: number
  ): ProcessedBenchmarkData[] => {
    return data.filter(row => row.totalEnergyJ >= min && row.totalEnergyJ <= max)
  },

  /**
   * Sort data by specified field
   */
  sortBy: (
    data: ProcessedBenchmarkData[],
    field: keyof ProcessedBenchmarkData,
    ascending = true
  ): ProcessedBenchmarkData[] => {
    return [...data].sort((a, b) => {
      const aVal = a[field]
      const bVal = b[field]

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return ascending ? aVal - bVal : bVal - aVal
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }

      return 0
    })
  },

  /**
   * Get unique values for a field
   */
  getUniqueValues: (
    data: ProcessedBenchmarkData[],
    field: keyof ProcessedBenchmarkData
  ): string[] => {
    const values = data.map(row => String(row[field]))
    return Array.from(new Set(values)).sort()
  },
}
