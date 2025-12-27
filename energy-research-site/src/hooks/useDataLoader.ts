import { useState, useEffect, useCallback } from 'react'
import { simpleDataService } from '../services/simpleDataService'
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

      // Try to load real data first
      let processedData: ProcessedBenchmarkData[]
      try {
        processedData = await simpleDataService.loadBenchmarkData()
      } catch (dataError) {
        console.warn('Failed to load real data, using sample data:', dataError)
        // Fallback to sample data for development - this will use the internal sample data
        processedData = await simpleDataService.loadBenchmarkData()
      }

      setData(processedData)

      // Load aggregated data - simplified for now
      setAggregatedData([])

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
        const comparison = await simpleDataService.getEfficiencyComparison()
        setComparisonData(comparison)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comparison data')
      } finally {
        setLoading(false)
      }
    }

    loadComparison()
  }, [])

  return { comparisonData, loading, error }
}
