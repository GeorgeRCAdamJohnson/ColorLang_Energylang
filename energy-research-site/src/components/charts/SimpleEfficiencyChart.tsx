import React, { useState } from 'react'
import { BaseChart, ChartDataPoint } from './BaseChart'
import { TrendingUp, BarChart3, Activity, Trophy } from 'lucide-react'

/**
 * Simple Efficiency Chart with hardcoded data to demonstrate the key finding
 * Shows C++ vs Python efficiency comparison immediately
 */
export const SimpleEfficiencyChart: React.FC = () => {
  const [chartType, setChartType] = useState<'bar' | 'scatter' | 'line'>('bar')

  // Hardcoded efficiency data based on research findings
  const efficiencyData: ChartDataPoint[] = [
    {
      x: 'C++',
      y: 2.42e-8,
      label: 'C++ - 2.42e-8 J/FLOP (Most Efficient)',
      metadata: { language: 'C++', samples: 5, avgEnergy: 48.5, avgRuntime: 1826 }
    },
    {
      x: 'Rust',
      y: 2.85e-8,
      label: 'Rust - 2.85e-8 J/FLOP',
      metadata: { language: 'Rust', samples: 3, avgEnergy: 51.3, avgRuntime: 1802 }
    },
    {
      x: 'Go',
      y: 4.57e-8,
      label: 'Go - 4.57e-8 J/FLOP',
      metadata: { language: 'Go', samples: 3, avgEnergy: 90.7, avgRuntime: 2008 }
    },
    {
      x: 'Java',
      y: 5.21e-8,
      label: 'Java - 5.21e-8 J/FLOP',
      metadata: { language: 'Java', samples: 2, avgEnergy: 104.1, avgRuntime: 2175 }
    },
    {
      x: 'EnergyLang',
      y: 8.92e-8,
      label: 'EnergyLang - 8.92e-8 J/FLOP',
      metadata: { language: 'EnergyLang', samples: 3, avgEnergy: 176.9, avgRuntime: 1950 }
    },
    {
      x: 'Python',
      y: 15.16e-8,
      label: 'Python - 15.16e-8 J/FLOP (Least Efficient)',
      metadata: { language: 'Python', samples: 5, avgEnergy: 303.2, avgRuntime: 2025 }
    }
  ]

  // Calculate key findings
  const cppEfficiency = 2.42e-8
  const pythonEfficiency = 15.16e-8
  const efficiencyRatio = pythonEfficiency / cppEfficiency

  // Get colors for languages
  const getLanguageColors = (): string[] => {
    const colorMap: Record<string, string> = {
      'C++': '#10B981',      // Green - most efficient
      'Rust': '#059669',     // Dark green
      'Go': '#3B82F6',       // Blue
      'Java': '#F59E0B',     // Orange
      'EnergyLang': '#8B5CF6', // Purple
      'Python': '#EF4444'    // Red - least efficient
    }
    return efficiencyData.map(point => colorMap[point.x as string] || '#6B7280')
  }

  const handleDataPointClick = (dataPoint: ChartDataPoint) => {
    console.log('Efficiency data point clicked:', dataPoint)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
      {/* Key Finding Highlight */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center mb-3">
          <Trophy className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Key Research Finding</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {cppEfficiency.toExponential(3)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">C++ J/FLOP (Most Efficient)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {pythonEfficiency.toExponential(3)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Python J/FLOP (Least Efficient)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {efficiencyRatio.toFixed(1)}x
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Efficiency Advantage</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>🏆 C++ is {efficiencyRatio.toFixed(1)}x more energy efficient than Python</strong> for matrix multiplication operations
          </p>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
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
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <BaseChart
          type={chartType}
          data={efficiencyData}
          title="Energy Efficiency by Programming Language (J/FLOP)"
          xLabel="Programming Language"
          yLabel="Energy per FLOP (J/FLOP)"
          colors={getLanguageColors()}
          height={400}
          onDataPointClick={handleDataPointClick}
          ariaLabel="Energy efficiency comparison chart showing J/FLOP by programming language"
          ariaDescription="Bar chart displaying energy efficiency in Joules per Floating Point Operation across different programming languages. Lower values indicate better efficiency. C++ shows the lowest values, making it the most efficient."
        />
      </div>

      {/* Efficiency Rankings */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          Energy Efficiency Rankings (Lower is Better)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {efficiencyData.map((point, index) => (
            <div
              key={point.x}
              className={`p-3 rounded-lg border ${
                index === 0
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : index === efficiencyData.length - 1
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
                        : index === efficiencyData.length - 1
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

      {/* Methodology Note */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Methodology
        </h5>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Energy efficiency measured in Joules per Floating Point Operation (J/FLOP). 
          Data collected using AMD uProf and NVIDIA-smi tools with physics-based energy 
          canonicalization (power × time). Matrix multiplication benchmark with 1000×1000 matrices 
          (2 billion FLOPs). Lower values indicate better efficiency.
        </p>
      </div>
    </div>
  )
}