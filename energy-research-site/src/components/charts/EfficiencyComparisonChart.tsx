import React, { useMemo } from 'react'
import { Trophy, Zap, Clock } from 'lucide-react'
import { BaseChart, ChartDataPoint } from './BaseChart'
import type { AggregatedBenchmarkData } from '../../types'

export interface EfficiencyComparisonChartProps {
  data: AggregatedBenchmarkData[]
  highlightLanguages?: string[]
  showKeyFinding?: boolean
  className?: string
}

/**
 * Specialized chart component for highlighting energy efficiency comparison
 * Emphasizes the key research finding: C++ vs Python efficiency
 */
export const EfficiencyComparisonChart: React.FC<EfficiencyComparisonChartProps> = ({
  data,
  highlightLanguages = ['C++', 'Python'],
  showKeyFinding = true,
  className = '',
}) => {
  // Calculate efficiency ratios and prepare chart data
  const chartData = useMemo(() => {
    // Group by language and calculate average efficiency
    const languageEfficiency = new Map<
      string,
      { totalEnergy: number; count: number; totalRuntime: number }
    >()

    data.forEach(item => {
      if (!languageEfficiency.has(item.language)) {
        languageEfficiency.set(item.language, { totalEnergy: 0, count: 0, totalRuntime: 0 })
      }

      const current = languageEfficiency.get(item.language)!
      current.totalEnergy += item.meanEnergyJ
      current.totalRuntime += item.meanRuntimeMs
      current.count += 1
    })

    // Convert to chart data points
    const chartPoints: ChartDataPoint[] = Array.from(languageEfficiency.entries())
      .map(([language, stats]) => ({
        x: language,
        y: stats.totalEnergy / stats.count, // Average energy consumption
        label: `${language} - Avg: ${(stats.totalEnergy / stats.count).toFixed(2)}J`,
        metadata: {
          language,
          avgEnergy: stats.totalEnergy / stats.count,
          avgRuntime: stats.totalRuntime / stats.count,
          sampleCount: stats.count,
        } as unknown,
      }))
      .sort((a, b) => a.y - b.y) // Sort by energy efficiency (lower is better)

    return chartPoints
  }, [data])

  // Calculate key findings
  const keyFindings = useMemo(() => {
    const cppData = chartData.find(point => point.x === 'C++')
    const pythonData = chartData.find(point => point.x === 'Python')

    if (cppData && pythonData) {
      const efficiencyRatio = pythonData.y / cppData.y
      return {
        cppEnergy: cppData.y,
        pythonEnergy: pythonData.y,
        efficiencyRatio,
        cppIsBetter: cppData.y < pythonData.y,
      }
    }

    return null
  }, [chartData])

  // Get colors with highlighting
  const getColors = () => {
    return chartData.map(point => {
      if (highlightLanguages.includes(point.x as string)) {
        return point.x === 'C++' ? '#10B981' : point.x === 'Python' ? '#EF4444' : '#3B82F6'
      }
      return '#6B7280'
    })
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Key Finding Highlight */}
      {showKeyFinding && keyFindings && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center mb-3">
            <Trophy className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Key Research Finding</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">C++ Energy</div>
                <div className="font-bold text-green-700">{keyFindings.cppEnergy.toFixed(2)}J</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-red-600" />
              <div>
                <div className="text-sm text-gray-600">Python Energy</div>
                <div className="font-bold text-red-700">{keyFindings.pythonEnergy.toFixed(2)}J</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Efficiency Ratio</div>
                <div className="font-bold text-blue-700">
                  {keyFindings.efficiencyRatio.toFixed(1)}x more efficient
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-700">
            <strong>
              C++ is approximately {keyFindings.efficiencyRatio.toFixed(1)}x more energy efficient
              than Python
            </strong>{' '}
            for matrix multiplication operations, consuming {keyFindings.cppEnergy.toFixed(2)}J
            compared to Python's {keyFindings.pythonEnergy.toFixed(2)}J on average.
          </p>
        </div>
      )}

      {/* Efficiency Chart */}
      <BaseChart
        type="bar"
        data={chartData}
        title="Energy Efficiency by Programming Language"
        xLabel="Programming Language"
        yLabel="Average Energy Consumption (J)"
        colors={getColors()}
        height={400}
        ariaLabel="Energy efficiency comparison chart showing average energy consumption by programming language"
        ariaDescription="Bar chart comparing energy efficiency across programming languages. Lower values indicate better efficiency. C++ shows the lowest energy consumption, making it the most efficient."
      />

      {/* Language Rankings */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
          Energy Efficiency Rankings
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chartData.map((point, index) => (
            <div
              key={point.x}
              className={`p-3 rounded-lg border ${
                index === 0
                  ? 'bg-green-50 border-green-200'
                  : index === chartData.length - 1
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0
                        ? 'bg-green-500 text-white'
                        : index === chartData.length - 1
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-500 text-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{point.x}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{point.y.toFixed(2)}J</div>
                  <div className="text-xs text-gray-500">
                    {index === 0
                      ? 'Most Efficient'
                      : index === chartData.length - 1
                        ? 'Least Efficient'
                        : 'Average'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology Note */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h5 className="font-medium text-blue-900 mb-2 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Methodology
        </h5>
        <p className="text-sm text-blue-800">
          Energy measurements were collected using AMD uProf and NVIDIA-smi tools across multiple
          benchmark runs. Energy consumption is calculated using physics-based canonicalization
          (power × time) to ensure accurate cross-language comparisons. Lower energy values indicate
          better efficiency.
        </p>
      </div>
    </div>
  )
}
