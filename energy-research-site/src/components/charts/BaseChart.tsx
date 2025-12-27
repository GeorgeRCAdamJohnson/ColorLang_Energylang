import React, { useRef, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  ChartOptions,
  ChartData,
  InteractionItem,
} from 'chart.js'
import { Bar, Line, Scatter } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// Chart types for better type safety
type ChartRef = {
  getElementsAtEventForMode?: (
    event: Event,
    mode: string,
    options: Record<string, unknown>,
    useFinalPosition: boolean
  ) => Array<{ index: number }>
  [key: string]: unknown
}

export interface ChartDataPoint {
  x: string | number
  y: number
  label?: string
  metadata?: unknown // Made completely flexible to handle any metadata types
}

export interface BaseChartProps {
  type: 'bar' | 'line' | 'scatter'
  data: ChartDataPoint[]
  title: string
  xLabel: string
  yLabel: string
  colors?: string[]
  height?: number
  onDataPointClick?: (dataPoint: ChartDataPoint, metadata?: unknown) => void
  onDataPointHover?: (dataPoint: ChartDataPoint | null, metadata?: unknown) => void
  className?: string
  ariaLabel?: string
  ariaDescription?: string
}

/**
 * Base Chart Component with accessibility and interaction support
 * Provides foundation for all chart visualizations in the application
 */
export const BaseChart: React.FC<BaseChartProps> = ({
  type,
  data,
  title,
  xLabel,
  yLabel,
  colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'],
  height = 400,
  onDataPointClick,
  onDataPointHover,
  className = '',
  ariaLabel,
  ariaDescription,
}) => {
  const chartRef = useRef<ChartRef>(null)
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null)

  // Prepare chart data
  const chartData: ChartData<typeof type> = {
    labels: data.map(point => String(point.x)),
    datasets: [
      {
        label: yLabel,
        data: data.map(point => point.y),
        backgroundColor: colors[0] + '80', // Add transparency
        borderColor: colors[0],
        borderWidth: 2,
        pointBackgroundColor: colors[0],
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: type === 'scatter' ? 6 : 4,
        pointHoverRadius: type === 'scatter' ? 8 : 6,
        tension: type === 'line' ? 0.4 : undefined,
      },
    ],
  }

  // Chart options with accessibility and interaction
  const options: ChartOptions<typeof type> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
          family: 'Inter, system-ui, sans-serif',
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: colors[0],
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          title: (tooltipItems: TooltipItem<typeof type>[]) => {
            const item = tooltipItems[0]
            const dataPoint = data[item.dataIndex]
            return dataPoint.label || String(dataPoint.x)
          },
          label: (tooltipItem: TooltipItem<typeof type>) => {
            const value =
              typeof tooltipItem.parsed.y === 'number'
                ? tooltipItem.parsed.y.toFixed(2)
                : tooltipItem.parsed.y

            return `${yLabel}: ${value}`
          },
          afterBody: (tooltipItems: TooltipItem<typeof type>[]) => {
            const item = tooltipItems[0]
            const dataPoint = data[item.dataIndex]

            if (dataPoint.metadata && typeof dataPoint.metadata === 'object') {
              const metadata = dataPoint.metadata as Record<string, unknown>
              if ('language' in metadata && 'runtimeMs' in metadata && 'totalEnergyJ' in metadata) {
                return [
                  `Language: ${metadata.language}`,
                  `Runtime: ${Number(metadata.runtimeMs).toFixed(0)}ms`,
                  `Energy: ${Number(metadata.totalEnergyJ).toFixed(2)}J`,
                ]
              }
            }
            return []
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: xLabel,
          font: {
            size: 14,
            weight: 'bold',
            family: 'Inter, system-ui, sans-serif',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: yLabel,
          font: {
            size: 14,
            weight: 'bold',
            family: 'Inter, system-ui, sans-serif',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    onHover: (_event, activeElements: InteractionItem[]) => {
      if (activeElements.length > 0) {
        const elementIndex = activeElements[0].index
        const dataPoint = data[elementIndex]
        setHoveredPoint(dataPoint)
        onDataPointHover?.(dataPoint, dataPoint.metadata)
      } else {
        setHoveredPoint(null)
        onDataPointHover?.(null)
      }
    },
  }

  // Handle chart clicks
  const handleChartClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current) return

    // Use Chart.js native API through the chart instance
    const chart = chartRef.current

    // Get elements at the click position
    if (chart.getElementsAtEventForMode) {
      const elements = chart.getElementsAtEventForMode(
        event.nativeEvent,
        'nearest',
        { intersect: true },
        true
      )

      if (elements.length > 0) {
        const elementIndex = elements[0].index
        const dataPoint = data[elementIndex]
        onDataPointClick?.(dataPoint, dataPoint.metadata)
      }
    }
  }

  // Keyboard navigation support
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      if (hoveredPoint) {
        onDataPointClick?.(hoveredPoint, hoveredPoint.metadata)
      }
    }
  }

  return (
    <div
      className={`relative ${className}`}
      role="img"
      aria-label={ariaLabel || `${title} chart`}
      aria-description={ariaDescription || `A ${type} chart showing ${yLabel} data`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div style={{ height: `${height}px` }}>
        {type === 'bar' && (
          <Bar
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={chartRef as any}
            data={chartData as ChartData<'bar'>}
            options={options as ChartOptions<'bar'>}
            onClick={handleChartClick}
          />
        )}
        {type === 'line' && (
          <Line
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={chartRef as any}
            data={chartData as ChartData<'line'>}
            options={options as ChartOptions<'line'>}
            onClick={handleChartClick}
          />
        )}
        {type === 'scatter' && (
          <Scatter
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={chartRef as any}
            data={chartData as ChartData<'scatter'>}
            options={options as ChartOptions<'scatter'>}
            onClick={handleChartClick}
          />
        )}
      </div>

      {/* Screen reader accessible data table */}
      <table className="sr-only" aria-label={`Data table for ${title}`}>
        <thead>
          <tr>
            <th>{xLabel}</th>
            <th>{yLabel}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point, index) => (
            <tr key={index}>
              <td>{point.label || point.x}</td>
              <td>{point.y}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
