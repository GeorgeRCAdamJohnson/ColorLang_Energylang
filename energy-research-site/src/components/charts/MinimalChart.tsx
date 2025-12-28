import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

/**
 * Absolutely minimal chart - guaranteed to work if Chart.js is functioning
 */
export const MinimalChart: React.FC = () => {
  console.log('MinimalChart: Rendering...')

  const data = {
    labels: ['C++', 'Python'],
    datasets: [
      {
        label: 'Energy Efficiency (J/FLOP)',
        data: [0.0000000242, 0.0000001516], // Using regular numbers instead of scientific notation
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#10B981', '#EF4444'],
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Minimal Efficiency Chart',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'J/FLOP',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Language',
        },
      },
    },
  }

  console.log('MinimalChart: Data:', data)
  console.log('MinimalChart: Options:', options)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Minimal Chart Test
      </h3>
      <div style={{ height: '300px', width: '100%' }}>
        <Bar data={data} options={options} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        If you see bars above, Chart.js is working. If not, there's a Chart.js issue.
      </p>
    </div>
  )
}