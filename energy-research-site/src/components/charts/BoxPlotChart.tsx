import React, { useMemo } from 'react'
import { BaseChart } from './BaseChart'
import type { ProcessedBenchmarkData, AggregatedBenchmarkData } from '../../types'
import type { ChartDataPoint } from './BaseChart'

interface BoxPlotData {
  language: string
  benchmark: string
  min: number
  q1: number
  median: number
  q3: number
  max: number
  outliers: number[]
  rawData: number[]
}

interface BoxPlotChartProps {
  data: ProcessedBenchmarkData[] | AggregatedBenchmarkData[]
  metric: 'energy' | 'runtime' | 'efficiency'
  title?: string
  onDataPointClick?: (data: BoxPlotData) => void
  className?: string
}

/**
 * Box Plot Chart Component for statistical distribution visualization
 * Shows quartiles, median, and outliers for benchmark data
 */
export const BoxPlotChart: React.FC<BoxPlotChartProps> = ({
  data,
  metric,
  title,
  onDataPointClick,
  className = '',
}) => {
  // Calculate box plot statistics
  const boxPlotData = useMemo(() => {
    const groups = new Map<string, number[]>()

    // Group data by language-benchmark combination
    data.forEach(item => {
      const key = `${item.language}-${item.benchmark}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }

      let value: number
      if ('meanEnergyJ' in item) {
        // AggregatedBenchmarkData - use raw measurements
        const rawValues = item.rawMeasurements.map(raw => {
          switch (metric) {
            case 'energy':
              return raw.totalEnergyJ
            case 'runtime':
              return raw.runtimeMs
            case 'efficiency':
              return raw.jPerFlop || 0
            default:
              return raw.totalEnergyJ
          }
        })
        groups.get(key)!.push(...rawValues)
      } else {
        // ProcessedBenchmarkData
        switch (metric) {
          case 'energy':
            value = item.totalEnergyJ
            break
          case 'runtime':
            value = item.runtimeMs
            break
          case 'efficiency':
            value = item.jPerFlop || 0
            break
          default:
            value = item.totalEnergyJ
        }
        groups.get(key)!.push(value)
      }
    })

    // Calculate box plot statistics for each group
    return Array.from(groups.entries()).map(([key, values]) => {
      const [language, benchmark] = key.split('-')
      const sortedValues = [...values].sort((a, b) => a - b)

      const q1Index = Math.floor(sortedValues.length * 0.25)
      const medianIndex = Math.floor(sortedValues.length * 0.5)
      const q3Index = Math.floor(sortedValues.length * 0.75)

      const q1 = sortedValues[q1Index]
      const median = sortedValues[medianIndex]
      const q3 = sortedValues[q3Index]
      const iqr = q3 - q1

      // Calculate outliers (values beyond 1.5 * IQR from quartiles)
      const lowerFence = q1 - 1.5 * iqr
      const upperFence = q3 + 1.5 * iqr

      const outliers = sortedValues.filter(v => v < lowerFence || v > upperFence)
      const nonOutliers = sortedValues.filter(v => v >= lowerFence && v <= upperFence)

      return {
        language,
        benchmark,
        min: Math.min(...nonOutliers),
        q1,
        median,
        q3,
        max: Math.max(...nonOutliers),
        outliers,
        rawData: values,
      } as BoxPlotData
    })
  }, [data, metric])

  // Convert box plot data to chart points for visualization
  // Since Chart.js doesn't have native box plot support, we'll create a custom visualization
  const chartData = useMemo(() => {
    const points: ChartDataPoint[] = []

    boxPlotData.forEach(boxData => {
      const xLabel = `${boxData.language}\n${boxData.benchmark}`

      // Add points for quartiles and median
      points.push(
        { x: xLabel, y: boxData.min, label: `${xLabel} - Min: ${boxData.min.toFixed(2)}` },
        { x: xLabel, y: boxData.q1, label: `${xLabel} - Q1: ${boxData.q1.toFixed(2)}` },
        { x: xLabel, y: boxData.median, label: `${xLabel} - Median: ${boxData.median.toFixed(2)}` },
        { x: xLabel, y: boxData.q3, label: `${xLabel} - Q3: ${boxData.q3.toFixed(2)}` },
        { x: xLabel, y: boxData.max, label: `${xLabel} - Max: ${boxData.max.toFixed(2)}` }
      )

      // Add outliers as separate points
      boxData.outliers.forEach(outlier => {
        points.push({
          x: xLabel,
          y: outlier,
          label: `${xLabel} - Outlier: ${outlier.toFixed(2)}`,
        })
      })
    })

    return points
  }, [boxPlotData])

  const getMetricLabel = () => {
    switch (metric) {
      case 'energy':
        return 'Energy (J)'
      case 'runtime':
        return 'Runtime (ms)'
      case 'efficiency':
        return 'Efficiency (J/FLOP)'
      default:
        return 'Value'
    }
  }

  const handleDataPointClick = (dataPoint: ChartDataPoint) => {
    // Find the corresponding box plot data
    const [language, benchmark] = dataPoint.x.toString().split('\n')
    const boxData = boxPlotData.find(d => d.language === language && d.benchmark === benchmark)
    if (boxData) {
      onDataPointClick?.(boxData)
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title || `${getMetricLabel()} Distribution`}
        </h3>
        <p className="text-sm text-gray-600">
          Statistical distribution showing quartiles, median, and outliers
        </p>
      </div>

      {/* Custom Box Plot Visualization */}
      <div className="space-y-4">
        {boxPlotData.map(boxData => (
          <div
            key={`${boxData.language}-${boxData.benchmark}`}
            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onDataPointClick?.(boxData)}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">
                {boxData.language} - {boxData.benchmark}
              </h4>
              <span className="text-sm text-gray-500">{boxData.rawData.length} samples</span>
            </div>

            {/* Box Plot Visualization */}
            <div className="relative h-12 bg-gray-100 rounded">
              {/* Calculate positions as percentages */}
              {(() => {
                const range = boxData.max - boxData.min
                const getPosition = (value: number) => ((value - boxData.min) / range) * 100

                return (
                  <>
                    {/* Whiskers */}
                    <div
                      className="absolute top-1/2 h-0.5 bg-gray-400 transform -translate-y-1/2"
                      style={{
                        left: `${getPosition(boxData.min)}%`,
                        width: `${getPosition(boxData.q1) - getPosition(boxData.min)}%`,
                      }}
                    />
                    <div
                      className="absolute top-1/2 h-0.5 bg-gray-400 transform -translate-y-1/2"
                      style={{
                        left: `${getPosition(boxData.q3)}%`,
                        width: `${getPosition(boxData.max) - getPosition(boxData.q3)}%`,
                      }}
                    />

                    {/* Box (IQR) */}
                    <div
                      className="absolute top-2 bottom-2 bg-blue-200 border-2 border-blue-400 rounded"
                      style={{
                        left: `${getPosition(boxData.q1)}%`,
                        width: `${getPosition(boxData.q3) - getPosition(boxData.q1)}%`,
                      }}
                    />

                    {/* Median line */}
                    <div
                      className="absolute top-1 bottom-1 w-0.5 bg-red-600"
                      style={{
                        left: `${getPosition(boxData.median)}%`,
                      }}
                    />

                    {/* Min/Max markers */}
                    <div
                      className="absolute top-3 bottom-3 w-0.5 bg-gray-600"
                      style={{ left: `${getPosition(boxData.min)}%` }}
                    />
                    <div
                      className="absolute top-3 bottom-3 w-0.5 bg-gray-600"
                      style={{ left: `${getPosition(boxData.max)}%` }}
                    />

                    {/* Outliers */}
                    {boxData.outliers.map((outlier, outlierIndex) => (
                      <div
                        key={outlierIndex}
                        className="absolute top-1/2 w-2 h-2 bg-red-500 rounded-full transform -translate-y-1/2 -translate-x-1/2"
                        style={{ left: `${getPosition(outlier)}%` }}
                        title={`Outlier: ${outlier.toFixed(2)}`}
                      />
                    ))}
                  </>
                )
              })()}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-5 gap-2 mt-3 text-xs text-gray-600">
              <div className="text-center">
                <div className="font-medium">Min</div>
                <div>{boxData.min.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Q1</div>
                <div>{boxData.q1.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">Median</div>
                <div className="text-red-600">{boxData.median.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Q3</div>
                <div>{boxData.q3.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Max</div>
                <div>{boxData.max.toFixed(2)}</div>
              </div>
            </div>

            {boxData.outliers.length > 0 && (
              <div className="mt-2 text-xs text-red-600">
                {boxData.outliers.length} outlier{boxData.outliers.length > 1 ? 's' : ''}:{' '}
                {boxData.outliers.map(o => o.toFixed(2)).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fallback scatter plot for overview */}
      <div className="mt-6">
        <BaseChart
          type="scatter"
          data={chartData}
          title={`${getMetricLabel()} Distribution Overview`}
          xLabel="Language - Benchmark"
          yLabel={getMetricLabel()}
          height={300}
          onDataPointClick={handleDataPointClick}
          ariaLabel={`Box plot showing ${getMetricLabel()} distribution`}
          ariaDescription={`Statistical distribution of ${getMetricLabel()} across different programming languages and benchmarks`}
        />
      </div>
    </div>
  )
}
