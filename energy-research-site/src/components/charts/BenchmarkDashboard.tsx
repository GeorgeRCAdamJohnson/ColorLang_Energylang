import React, { useState, useMemo } from 'react'
import {
  BarChart3,
  BarChart2,
  TrendingUp,
  Zap,
  RefreshCw,
  AlertCircle,
  Target,
  Activity,
  Download,
} from 'lucide-react'
import { useDataLoader } from '../../hooks/useDataLoader'
import { BenchmarkChart } from './BenchmarkChart'
import { BoxPlotChart } from './BoxPlotChart'
import type { ProcessedBenchmarkData, AggregatedBenchmarkData, ChartDataPoint } from '../../types'

interface BenchmarkDashboardProps {
  className?: string
  showKeyFinding?: boolean
}

/**
 * Interactive Benchmark Visualization Dashboard
 * Displays C++ vs Python efficiency comparison prominently
 * Shows both raw measurements and normalized J/FLOP comparisons
 * Implements multiple chart types (bar, scatter, box plots)
 */
export const BenchmarkDashboard: React.FC<BenchmarkDashboardProps> = ({
  className = '',
  showKeyFinding = true,
}) => {
  const { data, aggregatedData, loading, error, availableLanguages, availableBenchmarks, reload } =
    useDataLoader()

  const [activeTab, setActiveTab] = useState<'efficiency' | 'raw' | 'comparison' | 'distribution'>(
    'efficiency'
  )
  const [selectedDataPoint, setSelectedDataPoint] = useState<
    ProcessedBenchmarkData | AggregatedBenchmarkData | null
  >(null)

  // Calculate key efficiency comparison (C++ vs Python)
  const efficiencyComparison = useMemo(() => {
    if (aggregatedData.length === 0) return null

    const cppData = aggregatedData.find(d => d.language === 'C++')
    const pythonData = aggregatedData.find(d => d.language === 'Python')

    if (!cppData || !pythonData) return null

    const efficiencyRatio = pythonData.meanEnergyJ / cppData.meanEnergyJ

    return {
      cpp: cppData,
      python: pythonData,
      efficiencyRatio,
      energySavings:
        ((pythonData.meanEnergyJ - cppData.meanEnergyJ) / pythonData.meanEnergyJ) * 100,
    }
  }, [aggregatedData])

  // Prepare data for different chart types (removed unused variable)
  useMemo(() => {
    const baseData = activeTab === 'raw' ? data : aggregatedData

    return {
      efficiency: baseData.map(
        item =>
          ({
            x: `${item.language}\n${item.benchmark}`,
            y: 'jPerFlop' in item ? item.jPerFlop : item.jPerFlop || 0,
            label: `${item.language} - ${item.benchmark}`,
            metadata: item,
          }) as ChartDataPoint
      ),

      energy: baseData.map(
        item =>
          ({
            x: `${item.language}\n${item.benchmark}`,
            y: 'meanEnergyJ' in item ? item.meanEnergyJ : item.totalEnergyJ,
            label: `${item.language} - ${item.benchmark}`,
            metadata: item,
          }) as ChartDataPoint
      ),

      runtime: baseData.map(
        item =>
          ({
            x: `${item.language}\n${item.benchmark}`,
            y: 'meanRuntimeMs' in item ? item.meanRuntimeMs : item.runtimeMs,
            label: `${item.language} - ${item.benchmark}`,
            metadata: item,
          }) as ChartDataPoint
      ),
    }
  }, [data, aggregatedData, activeTab])

  // Handle data point selection
  const handleDataPointClick = (data: ProcessedBenchmarkData | AggregatedBenchmarkData) => {
    setSelectedDataPoint(data)
  }

  // Handle filter changes
  const handleFilterChange = (_filters: {
    languages: string[]
    benchmarks: string[]
    chartType: 'bar' | 'line' | 'scatter'
    metric: 'energy' | 'runtime' | 'efficiency'
  }) => {
    // Filter changes are handled by the BenchmarkChart component
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-12 ${className}`}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading benchmark data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
          <h3 className="text-lg font-semibold text-red-800">Data Loading Error</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={reload}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Loading
        </button>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Key Finding Highlight */}
      {showKeyFinding && efficiencyComparison && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Target className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Key Research Finding</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {efficiencyComparison.efficiencyRatio.toFixed(1)}x
              </div>
              <p className="text-gray-700">More Energy Efficient</p>
              <p className="text-sm text-gray-500">C++ vs Python</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {efficiencyComparison.energySavings.toFixed(0)}%
              </div>
              <p className="text-gray-700">Energy Savings</p>
              <p className="text-sm text-gray-500">Using C++ instead of Python</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {(efficiencyComparison.python.jPerFlop / efficiencyComparison.cpp.jPerFlop).toFixed(
                  2
                )}
                x
              </div>
              <p className="text-gray-700">J/FLOP Difference</p>
              <p className="text-sm text-gray-500">Normalized efficiency</p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-blue-600" />
            Interactive Benchmark Dashboard
          </h3>

          <div className="flex items-center space-x-4">
            <button
              onClick={reload}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              title="Reload data"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </button>

            <button
              className="flex items-center px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
              title="Export data"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('efficiency')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'efficiency'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Zap className="w-4 h-4 mr-2" />
            Energy Efficiency (J/FLOP)
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'raw'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Raw Measurements
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'comparison'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Language Comparison
          </button>

          <button
            onClick={() => setActiveTab('distribution')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'distribution'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            Statistical Distribution
          </button>
        </div>

        {/* Chart Content */}
        <div className="space-y-6">
          {activeTab === 'efficiency' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <BenchmarkChart
                data={aggregatedData}
                chartType="bar"
                metric="efficiency"
                title="Energy Efficiency by Language"
                onDataPointClick={handleDataPointClick}
                onFilterChange={handleFilterChange}
              />

              <BenchmarkChart
                data={aggregatedData}
                chartType="scatter"
                metric="efficiency"
                title="Efficiency Distribution"
                showFilters={false}
                onDataPointClick={handleDataPointClick}
              />
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <BenchmarkChart
                data={data}
                chartType="bar"
                metric="energy"
                title="Raw Energy Measurements"
                onDataPointClick={handleDataPointClick}
                onFilterChange={handleFilterChange}
              />

              <BenchmarkChart
                data={data}
                chartType="scatter"
                metric="runtime"
                title="Runtime vs Energy"
                showFilters={false}
                onDataPointClick={handleDataPointClick}
              />
            </div>
          )}

          {activeTab === 'comparison' && efficiencyComparison && (
            <div className="space-y-6">
              {/* Direct C++ vs Python Comparison */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  C++ vs Python Direct Comparison
                </h4>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 border">
                    <h5 className="font-medium text-blue-600 mb-3">C++ Performance</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Average Energy:</span>
                        <span className="font-medium">
                          {efficiencyComparison.cpp.meanEnergyJ.toFixed(2)}J
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Runtime:</span>
                        <span className="font-medium">
                          {efficiencyComparison.cpp.meanRuntimeMs.toFixed(0)}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Efficiency (J/FLOP):</span>
                        <span className="font-medium">
                          {efficiencyComparison.cpp.jPerFlop.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border">
                    <h5 className="font-medium text-red-600 mb-3">Python Performance</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Average Energy:</span>
                        <span className="font-medium">
                          {efficiencyComparison.python.meanEnergyJ.toFixed(2)}J
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Runtime:</span>
                        <span className="font-medium">
                          {efficiencyComparison.python.meanRuntimeMs.toFixed(0)}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Efficiency (J/FLOP):</span>
                        <span className="font-medium">
                          {efficiencyComparison.python.jPerFlop.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* All Languages Comparison */}
              <BenchmarkChart
                data={aggregatedData}
                chartType="bar"
                metric="efficiency"
                title="All Languages Efficiency Comparison"
                onDataPointClick={handleDataPointClick}
                onFilterChange={handleFilterChange}
              />
            </div>
          )}

          {activeTab === 'distribution' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <BoxPlotChart
                  data={aggregatedData}
                  metric="energy"
                  title="Energy Distribution by Language"
                  onDataPointClick={_boxData => {}}
                />

                <BoxPlotChart
                  data={aggregatedData}
                  metric="efficiency"
                  title="Efficiency Distribution by Language"
                  onDataPointClick={_boxData => {}}
                />
              </div>

              <BoxPlotChart
                data={aggregatedData}
                metric="runtime"
                title="Runtime Distribution by Language"
                onDataPointClick={_boxData => {}}
              />
            </div>
          )}
        </div>
      </div>

      {/* Selected Data Point Details */}
      {selectedDataPoint && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-600" />
            Selected Data Point Details
          </h4>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Language</div>
              <div className="text-xl font-bold text-blue-900">{selectedDataPoint.language}</div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">Benchmark</div>
              <div className="text-xl font-bold text-green-900">{selectedDataPoint.benchmark}</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium">Energy</div>
              <div className="text-xl font-bold text-purple-900">
                {'meanEnergyJ' in selectedDataPoint
                  ? `${selectedDataPoint.meanEnergyJ.toFixed(2)}J`
                  : `${selectedDataPoint.totalEnergyJ.toFixed(2)}J`}
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-orange-600 font-medium">Runtime</div>
              <div className="text-xl font-bold text-orange-900">
                {'meanRuntimeMs' in selectedDataPoint
                  ? `${selectedDataPoint.meanRuntimeMs.toFixed(0)}ms`
                  : `${selectedDataPoint.runtimeMs.toFixed(0)}ms`}
              </div>
            </div>
          </div>

          {'count' in selectedDataPoint && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Aggregated from <span className="font-medium">{selectedDataPoint.count}</span>{' '}
                measurements with standard deviations: Energy ±
                {selectedDataPoint.standardDeviation.energy.toFixed(2)}J, Runtime ±
                {selectedDataPoint.standardDeviation.runtime.toFixed(0)}ms
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Dataset Summary</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Total Measurements:</span>
            <span className="ml-2 text-gray-900">{data.length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Languages:</span>
            <span className="ml-2 text-gray-900">{availableLanguages.join(', ')}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Benchmarks:</span>
            <span className="ml-2 text-gray-900">{availableBenchmarks.join(', ')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
