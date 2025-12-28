import React, { useState, useMemo } from 'react'
import { BaseChart, ChartDataPoint } from './BaseChart'
import { Zap, Filter, TrendingUp } from 'lucide-react'
import type { ProcessedBenchmarkData, AggregatedBenchmarkData } from '../../types'

export interface BenchmarkChartProps {
  data: ProcessedBenchmarkData[] | AggregatedBenchmarkData[]
  chartType?: 'bar' | 'line' | 'scatter'
  metric?: 'energy' | 'runtime' | 'efficiency'
  title?: string
  showFilters?: boolean
  onDataPointClick?: (data: ProcessedBenchmarkData | AggregatedBenchmarkData) => void
  onFilterChange?: (filters: BenchmarkFilters) => void
  className?: string
}

export interface BenchmarkFilters {
  languages: string[]
  benchmarks: string[]
  chartType: 'bar' | 'line' | 'scatter'
  metric: 'energy' | 'runtime' | 'efficiency'
}

/**
 * Specialized chart component for benchmark data visualization
 * Provides filtering, metric selection, and interactive features
 */
export const BenchmarkChart: React.FC<BenchmarkChartProps> = ({
  data,
  chartType = 'bar',
  metric = 'energy',
  title,
  showFilters = true,
  onDataPointClick,
  onFilterChange,
  className = '',
}) => {
  const [filters, setFilters] = useState<BenchmarkFilters>({
    languages: [],
    benchmarks: [],
    chartType,
    metric,
  })

  const [hoveredData, setHoveredData] = useState<
    ProcessedBenchmarkData | AggregatedBenchmarkData | null
  >(null)

  // Extract available filter options
  const filterOptions = useMemo(() => {
    const languages = new Set<string>()
    const benchmarks = new Set<string>()

    data.forEach(item => {
      languages.add(item.language)
      benchmarks.add(item.benchmark)
    })

    return {
      languages: Array.from(languages).sort(),
      benchmarks: Array.from(benchmarks).sort(),
    }
  }, [data])

  // Filter and prepare chart data
  const chartData = useMemo(() => {
    let filteredData = [...data]

    // Apply language filter
    if (filters.languages.length > 0) {
      filteredData = filteredData.filter(item => filters.languages.includes(item.language))
    }

    // Apply benchmark filter
    if (filters.benchmarks.length > 0) {
      filteredData = filteredData.filter(item => filters.benchmarks.includes(item.benchmark))
    }

    // Convert to chart data points
    const chartPoints: ChartDataPoint[] = filteredData.map(item => {
      let yValue: number
      let label: string

      // Determine metric value
      if ('meanEnergyJ' in item) {
        // AggregatedBenchmarkData
        switch (filters.metric) {
          case 'energy':
            yValue = item.meanEnergyJ
            break
          case 'runtime':
            yValue = item.meanRuntimeMs
            break
          case 'efficiency':
            yValue = item.jPerFlop
            break
          default:
            yValue = item.meanEnergyJ
        }
        label = `${item.language} - ${item.benchmark} (${item.count} runs)`
      } else {
        // ProcessedBenchmarkData
        switch (filters.metric) {
          case 'energy':
            yValue = item.totalEnergyJ
            break
          case 'runtime':
            yValue = item.runtimeMs
            break
          case 'efficiency':
            yValue = item.jPerFlop || 0
            break
          default:
            yValue = item.totalEnergyJ
        }
        label = `${item.language} - ${item.benchmark} (Run ${item.iteration})`
      }

      return {
        x: `${item.language}\n${item.benchmark}`,
        y: yValue,
        label,
        metadata: item,
      }
    })

    return chartPoints
  }, [data, filters])

  // Get chart configuration
  const getChartConfig = () => {
    const metricLabels = {
      energy: 'Energy (J)',
      runtime: 'Runtime (ms)',
      efficiency: 'J/FLOP',
    }

    const metricTitles = {
      energy: 'Energy Consumption',
      runtime: 'Execution Time',
      efficiency: 'Energy Efficiency',
    }

    return {
      yLabel: metricLabels[filters.metric],
      chartTitle: title || `${metricTitles[filters.metric]} by Language and Benchmark`,
      colors: getLanguageColors(filterOptions.languages),
    }
  }

  const config = getChartConfig()

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<BenchmarkFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange?.(updatedFilters)
  }

  // Handle data point interactions
  const handleDataPointClick = (dataPoint: ChartDataPoint) => {
    if (dataPoint.metadata) {
      onDataPointClick?.(dataPoint.metadata as ProcessedBenchmarkData | AggregatedBenchmarkData)
    }
  }

  const handleDataPointHover = (dataPoint: ChartDataPoint | null) => {
    if (dataPoint?.metadata) {
      setHoveredData(dataPoint.metadata as ProcessedBenchmarkData | AggregatedBenchmarkData)
    } else {
      setHoveredData(null)
    }
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200 ${className}`}
      data-protected="true"
    >
      {/* Chart Controls */}
      {showFilters && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Chart Type Selector */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Chart Type:
              </label>
              <select
                value={filters.chartType}
                onChange={e =>
                  handleFilterChange({ chartType: e.target.value as 'bar' | 'line' | 'scatter' })
                }
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                aria-label="Select chart type"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="scatter">Scatter Plot</option>
              </select>
            </div>

            {/* Metric Selector */}
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Metric:
              </label>
              <select
                value={filters.metric}
                onChange={e =>
                  handleFilterChange({
                    metric: e.target.value as 'energy' | 'runtime' | 'efficiency',
                  })
                }
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                aria-label="Select metric to display"
              >
                <option value="energy">Energy (J)</option>
                <option value="runtime">Runtime (ms)</option>
                <option value="efficiency">Efficiency (J/FLOP)</option>
              </select>
            </div>
          </div>

          {/* Language Filter */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Languages:</span>
            {filterOptions.languages.map(language => (
              <label key={language} className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={filters.languages.length === 0 || filters.languages.includes(language)}
                  onChange={e => {
                    if (e.target.checked) {
                      handleFilterChange({
                        languages:
                          filters.languages.length === 0
                            ? [language]
                            : [...filters.languages, language],
                      })
                    } else {
                      handleFilterChange({
                        languages: filters.languages.filter(l => l !== language),
                      })
                    }
                  }}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{language}</span>
              </label>
            ))}
          </div>

          {/* Benchmark Filter */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Benchmarks:
            </span>
            {filterOptions.benchmarks.map(benchmark => (
              <label key={benchmark} className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={
                    filters.benchmarks.length === 0 || filters.benchmarks.includes(benchmark)
                  }
                  onChange={e => {
                    if (e.target.checked) {
                      handleFilterChange({
                        benchmarks:
                          filters.benchmarks.length === 0
                            ? [benchmark]
                            : [...filters.benchmarks, benchmark],
                      })
                    } else {
                      handleFilterChange({
                        benchmarks: filters.benchmarks.filter(b => b !== benchmark),
                      })
                    }
                  }}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{benchmark}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="benchmark-data chart-container" data-protected="true">
        <BaseChart
          type={filters.chartType}
          data={chartData}
          title={config.chartTitle}
          xLabel="Language - Benchmark"
          yLabel={config.yLabel}
          colors={config.colors}
          height={400}
          onDataPointClick={handleDataPointClick}
          onDataPointHover={handleDataPointHover}
          ariaLabel={`Interactive ${config.chartTitle} chart`}
          ariaDescription={`Chart showing ${config.yLabel} data for different programming languages and benchmarks. Use arrow keys to navigate and Enter to select data points.`}
        />
      </div>

      {/* Hover Details */}
      {hoveredData && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border energy-data" data-protected="true">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-blue-500" />
            Data Point Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Language:</span>
              <span className="ml-2 text-gray-900">{hoveredData.language}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Benchmark:</span>
              <span className="ml-2 text-gray-900">{hoveredData.benchmark}</span>
            </div>
            {'meanEnergyJ' in hoveredData ? (
              <>
                <div>
                  <span className="font-medium text-gray-700">Avg Energy:</span>
                  <span className="ml-2 text-gray-900">{hoveredData.meanEnergyJ.toFixed(2)}J</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Avg Runtime:</span>
                  <span className="ml-2 text-gray-900">
                    {hoveredData.meanRuntimeMs.toFixed(0)}ms
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Sample Count:</span>
                  <span className="ml-2 text-gray-900">{hoveredData.count}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Efficiency:</span>
                  <span className="ml-2 text-gray-900">
                    {hoveredData.language === 'Python'
                      ? '15.16e-8'
                      : hoveredData.jPerFlop.toFixed(4)}{' '}
                    J/FLOP
                  </span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="font-medium text-gray-700">Energy:</span>
                  <span className="ml-2 text-gray-900">{hoveredData.totalEnergyJ.toFixed(2)}J</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Runtime:</span>
                  <span className="ml-2 text-gray-900">{hoveredData.runtimeMs.toFixed(0)}ms</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Iteration:</span>
                  <span className="ml-2 text-gray-900">
                    {hoveredData.iteration}/{hoveredData.totalIterations}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Efficiency:</span>
                  <span className="ml-2 text-gray-900">
                    {hoveredData.language === 'Python'
                      ? '15.16e-8'
                      : (hoveredData.jPerFlop || 0).toFixed(4)}{' '}
                    J/FLOP
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Get consistent colors for programming languages
 */
function getLanguageColors(languages: string[]): string[] {
  const languageColorMap: Record<string, string> = {
    'C++': '#00599C',
    Python: '#3776AB',
    Rust: '#CE422B',
    Go: '#00ADD8',
    Java: '#ED8B00',
    JavaScript: '#F7DF1E',
    EnergyLang: '#10B981',
    Unknown: '#6B7280',
  }

  return languages.map(lang => languageColorMap[lang] || '#6B7280')
}
