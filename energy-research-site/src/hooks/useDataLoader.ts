import { useState, useEffect, useCallback } from 'react'
import { CSVDataLoader } from '../utils/csvDataLoader'
import type { ProcessedBenchmarkData, AggregatedBenchmarkData } from '../types'

interface UseDataLoaderResult {
  data: ProcessedBenchmarkData[]
  aggregatedData: AggregatedBenchmarkData[]
  loading: boolean
  error: string | null
  availableLanguages: string[]
  availableBenchmarks: string[]
  reload: () => Promise<void>
  filterData: (filters: DataFilters) => ProcessedBenchmarkData[]
}

interface DataFilters {
  languages?: string[]
  benchmarks?: string[]
  energyRange?: { min: number; max: number }
  sortBy?: keyof ProcessedBenchmarkData
  sortAscending?: boolean
}

/**
 * Data processing utilities for filtering and sorting benchmark data
 */
class DataProcessingUtils {
  static getUniqueValues<T>(data: T[], key: keyof T): string[] {
    const values = data.map(item => String(item[key]))
    return Array.from(new Set(values)).sort()
  }

  static filterByLanguage(
    data: ProcessedBenchmarkData[],
    languages: string[]
  ): ProcessedBenchmarkData[] {
    return data.filter(item => languages.includes(item.language))
  }

  static filterByBenchmark(
    data: ProcessedBenchmarkData[],
    benchmarks: string[]
  ): ProcessedBenchmarkData[] {
    return data.filter(item => benchmarks.includes(item.benchmark))
  }

  static filterByEnergyRange(
    data: ProcessedBenchmarkData[],
    min: number,
    max: number
  ): ProcessedBenchmarkData[] {
    return data.filter(item => item.totalEnergyJ >= min && item.totalEnergyJ <= max)
  }

  static sortBy<T>(data: T[], key: keyof T, ascending: boolean = true): T[] {
    return [...data].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]

      if (aVal < bVal) return ascending ? -1 : 1
      if (aVal > bVal) return ascending ? 1 : -1
      return 0
    })
  }
}

/**
 * Custom hook for loading and managing benchmark data
 * Provides data loading, filtering, and error handling
 */
export const useDataLoader = (): UseDataLoaderResult => {
  const [data, setData] = useState<ProcessedBenchmarkData[]>([])
  const [aggregatedData, setAggregatedData] = useState<AggregatedBenchmarkData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])
  const [availableBenchmarks, setAvailableBenchmarks] = useState<string[]>([])

  const loadData = useCallback(async (_forceReload = false) => {
    try {
      setLoading(true)
      setError(null)

      // Load data from CSV file
      let processedData: ProcessedBenchmarkData[]
      try {
        // Load the CSV data from the public folder
        const rawData = await CSVDataLoader.loadCSV('/sample_benchmark_data.csv')
        processedData = CSVDataLoader.processData(rawData)
      } catch (dataError) {
        console.warn('Failed to load CSV data:', dataError)
        // Fallback to empty array if CSV loading fails
        processedData = []
      }

      setData(processedData)

      // Load aggregated data
      const aggregated = CSVDataLoader.aggregateData(processedData)
      setAggregatedData(aggregated)

      // Extract available options
      const languages = DataProcessingUtils.getUniqueValues(processedData, 'language')
      const benchmarks = DataProcessingUtils.getUniqueValues(processedData, 'benchmark')

      setAvailableLanguages(languages)
      setAvailableBenchmarks(benchmarks)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
      console.error('Data loading error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const reload = useCallback(async () => {
    await loadData(true)
  }, [loadData])

  const filterData = useCallback(
    (filters: DataFilters): ProcessedBenchmarkData[] => {
      let filteredData = [...data]

      // Apply language filter
      if (filters.languages && filters.languages.length > 0) {
        filteredData = DataProcessingUtils.filterByLanguage(filteredData, filters.languages)
      }

      // Apply benchmark filter
      if (filters.benchmarks && filters.benchmarks.length > 0) {
        filteredData = DataProcessingUtils.filterByBenchmark(filteredData, filters.benchmarks)
      }

      // Apply energy range filter
      if (filters.energyRange) {
        filteredData = DataProcessingUtils.filterByEnergyRange(
          filteredData,
          filters.energyRange.min,
          filters.energyRange.max
        )
      }

      // Apply sorting
      if (filters.sortBy) {
        filteredData = DataProcessingUtils.sortBy(
          filteredData,
          filters.sortBy,
          filters.sortAscending ?? true
        )
      }

      return filteredData
    },
    [data]
  )

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    aggregatedData,
    loading,
    error,
    availableLanguages,
    availableBenchmarks,
    reload,
    filterData,
  }
}

/**
 * Hook for getting efficiency comparison data (key research finding)
 */
export const useEfficiencyComparison = () => {
  const [comparisonData, setComparisonData] = useState<
    Array<{
      language: string
      avgEnergyJ: number
      avgRuntimeMs: number
      efficiency: number
    }>
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadComparison = async () => {
      try {
        setLoading(true)

        // Load CSV data and calculate efficiency comparison
        const rawData = await CSVDataLoader.loadCSV('/sample_benchmark_data.csv')
        const processedData = CSVDataLoader.processData(rawData)

        // Group by language and calculate averages
        const languageGroups = processedData.reduce(
          (groups, item) => {
            if (!groups[item.language]) {
              groups[item.language] = []
            }
            groups[item.language].push(item)
            return groups
          },
          {} as Record<string, ProcessedBenchmarkData[]>
        )

        // Calculate efficiency metrics for each language
        const comparison = Object.entries(languageGroups)
          .map(([language, items]) => {
            const avgEnergyJ =
              items.reduce((sum, item) => sum + item.totalEnergyJ, 0) / items.length
            const avgRuntimeMs = items.reduce((sum, item) => sum + item.runtimeMs, 0) / items.length
            const efficiency = avgEnergyJ / (avgRuntimeMs / 1000) // Energy per second

            return {
              language,
              avgEnergyJ,
              avgRuntimeMs,
              efficiency,
            }
          })
          .sort((a, b) => a.efficiency - b.efficiency) // Sort by efficiency (lower is better)

        setComparisonData(comparison)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comparison data')
        console.error('Efficiency comparison loading error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadComparison()
  }, [])

  return { comparisonData, loading, error }
}
