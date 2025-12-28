import React, { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { TrendingUp, BarChart3, Trophy } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

/**
 * Direct Efficiency Chart - bypasses BaseChart to ensure rendering
 */
export const DirectEfficiencyChart: React.FC = () => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')

  // Direct Chart.js data structure
  const chartData = {
    labels: ['C++', 'Rust', 'Go', 'Java', 'EnergyLang', 'Python'],
    datasets: [
      {
        label: 'Energy Efficiency (J/FLOP)',
        data: [2.42e-8, 2.85e-8, 4.57e-8, 5.21e-8, 8.92e-8, 15.16e-8],
        backgroundColor: [
          '#10B981', // C++ - Green
          '#059669', // Rust - Dark green
          '#3B82F6', // Go - Blue
          '#F59E0B', // Java - Orange
          '#8B5CF6', // EnergyLang - Purple
          '#EF4444'  // Python - Red
        ],
        borderColor: [
          '#10B981',
          '#059669',
          '#3B82F6',
          '#F59E0B',
          '#8B5CF6',
          '#EF4444'
        ],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend to save space
      },
      title: {
        display: true,
        text: 'Energy Efficiency by Programming Language',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y
            const language = context.label
            return `${language}: ${value.toExponential(3)} J/FLOP`
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Programming Language',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Energy per FLOP (J/FLOP)',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value.toExponential(1)
          }
        }
      },
    },
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
              2.42e-8
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">C++ J/FLOP (Most Efficient)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              15.16e-8
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Python J/FLOP (Least Efficient)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              6.3x
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Efficiency Advantage</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>🏆 C++ is 6.3x more energy efficient than Python</strong> for matrix multiplication operations
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
              onChange={e => setChartType(e.target.value as 'bar' | 'line')}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6" style={{ height: '400px' }}>
        {chartType === 'bar' ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>

      {/* Efficiency Rankings */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          Energy Efficiency Rankings (Lower is Better)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: 'C++', value: '2.42e-8', rank: 1, color: 'green' },
            { name: 'Rust', value: '2.85e-8', rank: 2, color: 'green' },
            { name: 'Go', value: '4.57e-8', rank: 3, color: 'blue' },
            { name: 'Java', value: '5.21e-8', rank: 4, color: 'orange' },
            { name: 'EnergyLang', value: '8.92e-8', rank: 5, color: 'purple' },
            { name: 'Python', value: '15.16e-8', rank: 6, color: 'red' },
          ].map((lang) => (
            <div
              key={lang.name}
              className={`p-3 rounded-lg border ${
                lang.rank === 1
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : lang.rank === 6
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      lang.rank === 1
                        ? 'bg-green-500 text-white'
                        : lang.rank === 6
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-500 text-white'
                    }`}
                  >
                    {lang.rank}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{lang.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-gray-100">
                    {lang.value}
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
        <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Methodology</h5>
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