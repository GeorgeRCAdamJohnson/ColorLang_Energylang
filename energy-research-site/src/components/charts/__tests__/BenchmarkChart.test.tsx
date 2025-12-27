import { render, screen, fireEvent } from '@testing-library/react'
import { BenchmarkChart } from '../BenchmarkChart'
import type { ProcessedBenchmarkData, AggregatedBenchmarkData } from '../../../types'

// Mock the BaseChart component
jest.mock('../BaseChart', () => ({
  BaseChart: jest.fn(({ onDataPointClick, onDataPointHover, data }) => (
    <div data-testid="base-chart">
      <button
        onClick={() => onDataPointClick?.(data[0])}
        onMouseEnter={() => onDataPointHover?.(data[0])}
        onMouseLeave={() => onDataPointHover?.(null)}
      >
        Mock Chart
      </button>
    </div>
  )),
}))

describe('BenchmarkChart', () => {
  const mockProcessedData: ProcessedBenchmarkData[] = [
    {
      id: '1',
      language: 'C++',
      benchmark: 'matrix_multiply',
      iteration: 1,
      totalIterations: 10,
      avgCpuPowerW: 10,
      totalCpuEnergyJ: 20,
      avgGpuPowerW: 2,
      runtimeMs: 2000,
      totalEnergyJ: 20,
      jPerFlop: 0.01,
      timestamp: new Date(),
      runId: 'run-1',
    },
    {
      id: '2',
      language: 'Python',
      benchmark: 'matrix_multiply',
      iteration: 1,
      totalIterations: 10,
      avgCpuPowerW: 15,
      totalCpuEnergyJ: 60,
      avgGpuPowerW: 3,
      runtimeMs: 4000,
      totalEnergyJ: 60,
      jPerFlop: 0.06,
      timestamp: new Date(),
      runId: 'run-2',
    },
  ]

  const mockAggregatedData: AggregatedBenchmarkData[] = [
    {
      language: 'C++',
      benchmark: 'matrix_multiply',
      count: 10,
      meanRuntimeMs: 2000,
      meanEnergyJ: 20,
      meanPowerW: 12,
      jPerFlop: 0.01,
      standardDeviation: {
        runtime: 100,
        energy: 2,
        power: 1,
      },
      rawMeasurements: [],
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders chart with filters', () => {
    render(<BenchmarkChart data={mockProcessedData} />)

    expect(screen.getByTestId('base-chart')).toBeInTheDocument()
    expect(screen.getByLabelText('Select chart type')).toBeInTheDocument()
    expect(screen.getByLabelText('Select metric to display')).toBeInTheDocument()
  })

  it('handles chart type changes', () => {
    render(<BenchmarkChart data={mockProcessedData} />)

    const chartTypeSelect = screen.getByLabelText('Select chart type')
    fireEvent.change(chartTypeSelect, { target: { value: 'line' } })

    expect(chartTypeSelect).toHaveValue('line')
  })

  it('handles metric changes', () => {
    render(<BenchmarkChart data={mockProcessedData} />)

    const metricSelect = screen.getByLabelText('Select metric to display')
    fireEvent.change(metricSelect, { target: { value: 'runtime' } })

    expect(metricSelect).toHaveValue('runtime')
  })

  it('displays language filter checkboxes', () => {
    render(<BenchmarkChart data={mockProcessedData} />)

    expect(screen.getByText('Languages:')).toBeInTheDocument()
    expect(screen.getByText('C++')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  it('handles language filter changes', () => {
    render(<BenchmarkChart data={mockProcessedData} />)

    const cppCheckbox = screen.getByRole('checkbox', { name: /C\+\+/ })
    fireEvent.click(cppCheckbox)

    expect(cppCheckbox).toBeChecked()
  })

  it('displays benchmark filter checkboxes', () => {
    render(<BenchmarkChart data={mockProcessedData} />)

    expect(screen.getByText('Benchmarks:')).toBeInTheDocument()
    expect(screen.getByText('matrix_multiply')).toBeInTheDocument()
  })

  it('handles data point hover and shows details', () => {
    render(<BenchmarkChart data={mockProcessedData} />)

    const chartButton = screen.getByText('Mock Chart')
    fireEvent.mouseEnter(chartButton)

    // Should show hover details
    expect(screen.getByText('Data Point Details')).toBeInTheDocument()
    expect(screen.getAllByText('C++')[0]).toBeInTheDocument() // Use getAllByText to handle multiple instances
    expect(screen.getByText('20.00J')).toBeInTheDocument()
  })

  it('handles data point click', () => {
    const mockOnClick = jest.fn()
    render(<BenchmarkChart data={mockProcessedData} onDataPointClick={mockOnClick} />)

    const chartButton = screen.getByText('Mock Chart')
    fireEvent.click(chartButton)

    expect(mockOnClick).toHaveBeenCalledWith(mockProcessedData[0])
  })

  it('handles filter change callback', () => {
    const mockOnFilterChange = jest.fn()
    render(<BenchmarkChart data={mockProcessedData} onFilterChange={mockOnFilterChange} />)

    const metricSelect = screen.getByLabelText('Select metric to display')
    fireEvent.change(metricSelect, { target: { value: 'runtime' } })

    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({ metric: 'runtime' }))
  })

  it('works with aggregated data', () => {
    render(<BenchmarkChart data={mockAggregatedData} />)

    expect(screen.getByTestId('base-chart')).toBeInTheDocument()
    expect(screen.getByText('C++')).toBeInTheDocument()
  })

  it('hides filters when showFilters is false', () => {
    render(<BenchmarkChart data={mockProcessedData} showFilters={false} />)

    expect(screen.queryByLabelText('Select chart type')).not.toBeInTheDocument()
    expect(screen.queryByText('Languages:')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<BenchmarkChart data={mockProcessedData} className="custom-class" />)

    const container = screen.getByTestId('base-chart').closest('.custom-class')
    expect(container).toBeInTheDocument()
  })

  it('uses custom title when provided', () => {
    render(<BenchmarkChart data={mockProcessedData} title="Custom Chart Title" />)

    expect(screen.getByTestId('base-chart')).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    render(<BenchmarkChart data={[]} />)

    expect(screen.getByTestId('base-chart')).toBeInTheDocument()
    expect(screen.getByText('Languages:')).toBeInTheDocument()
    expect(screen.getByText('Benchmarks:')).toBeInTheDocument()
  })
})
