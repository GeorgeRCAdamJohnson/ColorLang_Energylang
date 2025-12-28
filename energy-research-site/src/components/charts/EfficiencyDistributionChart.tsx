import React, { useMemo, useState } from 'react'
import { BaseChart, ChartDataPoint } from './BaseChart'
import { TrendingUp, BarChart3, Activity } from 'lucide-react'
import type { ProcessedBenchmarkData, AggregatedBenchmarkData } from '../../types'

export interface EfficiencyDistributionChartProps {
  data: ProcessedBenchmarkData[]
  aggregatedData: AggregatedBenchmarkData[]
  className?: string
}

/**
 * Dedicated Efficiency Distribution Chart Component
 * Shows energy efficiency (J/FLOP) distribution across languages
 * Supports multiple visualization types: bar, scatter, line
 */
export const EfficiencyDistributionChart: React.FC<EfficiencyDistributionChartProps> = ({
  data,
  aggregatedData,
  className = '',
}) => {
  const [chartType, setChartType] = useState<'bar' | 'scatter' | 'line'>('bar')
  const [dataType, setDataType] = useState<'aggregated' | 'individual'>('aggregated')

  // Prepare chart data based on selected options
  const chartData = useMemo(() => {
    console.log('EfficiencyDistributionChart - Raw data:', data.length, 'items')
    console.log('EfficiencyDistributionChart - Aggregated data:', aggregatedData.length, 'items')
    console.log('EfficiencyDistributionChart - Sample raw data:', data.slice(0, 2))
    console.log('EfficiencyDistributionChart - Sample aggregated data:', aggregatedData.slice(0, 2))

    if (dataType === 'aggregated') {
      // Use aggregated data for cleaner visualization
      const filteredAggregated = aggregatedData.filter(item => item.jPerFlop > 0)
      console.log('EfficiencyDistributionChart - Filtered aggregated data:', filteredAggregated.length, 'items')
      
      return filteredAggregated
        .map((item) => ({
          x: item.language,
          y: item.jPerFlop,
          label: `${item.language} - ${item.jPerFlop.toExponential(3)} J/FLOP (${item.count} samples)`,
          metadata: item,
        }))
        .sort((a, b) => a.y - b.y) // Sort by efficiency (lower is better)
    } else {
      // Use individual data points for distribution analysis
      const filteredIndividual = data.filter(item => item.jPerFlop && item.jPerFlop > 0)
      console.log('EfficiencyDistributionChart - Filtered individual data:', filteredIndividual.length, 'items')
      
      return filteredIndividual.map((item, index) => ({
        x: chartType === 'scatter' ? item.runtimeMs : `${item.language}-${index}`,
        y: item.jPerFlop!,
        label: `${item.language} - Run ${item.iteration} - ${item.jPerFlop!.toExponential(3)} J/FLOP`,
        metadata: item,
      }))
    }
  }, [data, aggregatedData, chartType, dataType])

  // Calculate efficiency statistics
  const efficiencyStats = useMemo(() => {
    if (aggregatedData.length === 0) return null

    const cppData = aggregatedData.find(d => d.language === 'C++')
    const pythonData = aggregatedData.find(d => d.language === 'Python')

    if (!cppData || !pythonData) return null

    const efficiencyRatio = pythonData.jPerFlop / cppData.jPerFlop

    return {
      cppEfficiency: cppData.jPerFlop,
      pythonEfficiency: pythonData.jPerFlop,
      efficiencyRatio,
      energySavings: ((pythonData.jPerFlop - cppData.jPerFlop) / pythonData.jPerFlop) * 100,
    }
  }, [aggregatedData])

  // Get colors for different languages
  const getLanguageColors = () => {
    const colorMap: Record<string, string> = {
      'C++': '#10B981', // Green for most efficient
      'Python': '#EF4444', // Red for least efficient
      'Rust': '#CE422B',
      'Go': '#00ADD8',
      'Java': '#ED8B00',
      'EnergyLang': '#8B5CF6',
    }

    if (dataType === 'aggregated') {
      return chartData.map(point => colorMap[point.x as string] || '#6B7280')
    } else {
      // For individual data, color by language
      return chartData.map(point => {
        const language = (point.metadata as ProcessedBenchmarkData).language
        return colorMap[language] || '#6B7280'
      })
    }
  }

  const handleDataPointClick = (dataPoint: ChartDataPoint) => {
    console.log('Efficiency data point clicked:', dataPoint)
  }

  const getChartTitle = () => {
    const typeLabel = dataType === 'aggregated' ? 'Average' : 'Individual'
    const chartLabel = chartType === 'bar' ? 'Comparison' : chartType === 'scatter' ? 'Distribution' : 'Trend'
    return `Energy Efficiency ${typeLabel} ${chartLabel} (J/FLOP)`
  }

  const getXLabel = () => {
    if (dataType === 'aggregated') return 'Programming Language'
    if (chartType === 'scatter') return 'Runtime (ms)'
    return 'Measurement Instance'
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200 ${className}`}>
      {/* Key Finding Highlight */}
      {efficiencyStats && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center mb-3">
            <Activity className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Efficiency Distribution Key Finding</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {efficiencyStats.cppEfficiency.toExponential(3)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">C++ J/FLOP (Most Efficient)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {efficiencyStats.pythonEfficiency.toExponential(3)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Python J/FLOP (Least Efficient)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {efficiencyStats.efficiencyRatio.toFixed(1)}x
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Efficiency Advantage</div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Chart Type Selector */}
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Chart Type:</label>
            <select
              value={chartType}
              onChange={e => setChartType(e.target.value as 'bar' | 'scatter' | 'line')}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="bar">Bar Chart</option>
              <option value="scatter">Scatter Plot</option>
              <option value="line">Line Chart</option>
            </select>
          </div>

          {/* Data Type Selector */}
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data View:</label>
            <select
              value={dataType}
              onChange={e => setDataType(e.target.value as 'aggregated' | 'individual')}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="aggregated">Aggregated (Average)</option>
              <option value="individual">Individual Measurements</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        {chartData.length > 0 ? (
          <BaseChart
            type={chartType}
            data={chartData}
            title={getChartTitle()}
            xLabel={getXLabel()}
            yLabel="Energy per FLOP (J/FLOP)"
            colors={getLanguageColors()}
            height={400}
            onDataPointClick={handleDataPointClick}
            ariaLabel={`Energy efficiency distribution chart showing ${getChartTitle()}`}
            ariaDescription={`${chartType} chart displaying energy efficiency in Joules per Floating Point Operation (J/FLOP) across different programming languages. Lower values indicate better efficiency.`}
          />
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No efficiency data available</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Efficiency data requires valid J/FLOP calculations
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Efficiency Rankings */}
      {dataType === 'aggregated' && chartData.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            Efficiency Rankings (Lower is Better)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {chartData.map((point, index) => (
              <div
                key={point.x}
                className={`p-3 rounded-lg border ${
                  index === 0
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : index === chartData.length - 1
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
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
                    <span className="font-medium text-gray-900 dark:text-gray-100">{point.x}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-gray-100">
                      {point.y.toExponential(3)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">J/FLOP</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Methodology Note */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Methodology</h5>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Energy efficiency is measured in Joules per Floating Point Operation (J/FLOP). 
          Lower values indicate better efficiency. Measurements are collected using AMD uProf 
          and NVIDIA-smi tools with physics-based energy canonicalization (power × time).
        </p>
      </div>
    </div>
  )
}