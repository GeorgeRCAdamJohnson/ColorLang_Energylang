import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BaseChart, ChartDataPoint } from '../BaseChart'

// Mock Chart.js and react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Bar: React.forwardRef<any, any>((props, ref) => {
    // Set up the ref to simulate a chart instance
    React.useImperativeHandle(ref, () => ({
      mockChart: true,
      getElementsAtEventForMode: jest.fn().mockReturnValue([{ index: 0 }]),
    }))

    return (
      <div
        data-testid="mock-chart"
        onClick={props.onClick as React.MouseEventHandler<HTMLDivElement>}
        {...props}
      >
        Mock Chart
      </div>
    )
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Line: React.forwardRef<any, any>((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      mockChart: true,
      getElementsAtEventForMode: jest.fn().mockReturnValue([{ index: 0 }]),
    }))
    return (
      <div
        data-testid="mock-chart"
        onClick={props.onClick as React.MouseEventHandler<HTMLDivElement>}
        {...props}
      >
        Mock Chart
      </div>
    )
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Scatter: React.forwardRef<any, any>((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      mockChart: true,
      getElementsAtEventForMode: jest.fn().mockReturnValue([{ index: 0 }]),
    }))
    return (
      <div
        data-testid="mock-chart"
        onClick={props.onClick as React.MouseEventHandler<HTMLDivElement>}
        {...props}
      >
        Mock Chart
      </div>
    )
  }),
  getElementAtEvent: jest.fn(),
}))

jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}))

describe('BaseChart', () => {
  const mockData: ChartDataPoint[] = [
    { x: 'C++', y: 10.5, label: 'C++ - Test' },
    { x: 'Python', y: 25.3, label: 'Python - Test' },
    { x: 'Rust', y: 12.8, label: 'Rust - Test' },
  ]

  const defaultProps = {
    type: 'bar' as const,
    data: mockData,
    title: 'Test Chart',
    xLabel: 'Language',
    yLabel: 'Energy (J)',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders chart with correct props', () => {
    render(<BaseChart {...defaultProps} />)

    expect(screen.getByTestId('mock-chart')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Test Chart chart')
  })

  it('renders accessible data table for screen readers', () => {
    render(<BaseChart {...defaultProps} />)

    const table = screen.getByLabelText('Data table for Test Chart')
    expect(table).toBeInTheDocument()
    expect(table).toHaveClass('sr-only')

    // Check table headers
    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getByText('Energy (J)')).toBeInTheDocument()

    // Check data rows - use more specific queries
    expect(screen.getByText('C++ - Test')).toBeInTheDocument()
    expect(screen.getByText('10.5')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const mockOnClick = jest.fn()

    render(<BaseChart {...defaultProps} onDataPointClick={mockOnClick} />)

    const chart = screen.getByTestId('mock-chart')

    // Simulate a click event
    fireEvent.click(chart)

    // The click handler should be called with the first data point
    expect(mockOnClick).toHaveBeenCalledWith(mockData[0], undefined)
  })

  it('handles keyboard navigation', () => {
    const mockOnClick = jest.fn()
    render(<BaseChart {...defaultProps} onDataPointClick={mockOnClick} />)

    const chartContainer = screen.getByRole('img')

    // Simulate hover to set hoveredPoint
    fireEvent.mouseEnter(chartContainer)

    // Test Enter key
    fireEvent.keyDown(chartContainer, { key: 'Enter' })

    // Test Space key
    fireEvent.keyDown(chartContainer, { key: ' ' })
  })

  it('applies custom className and ARIA attributes', () => {
    render(
      <BaseChart
        {...defaultProps}
        className="custom-class"
        ariaLabel="Custom chart label"
        ariaDescription="Custom chart description"
      />
    )

    const container = screen.getByRole('img')
    expect(container).toHaveClass('custom-class')
    expect(container).toHaveAttribute('aria-label', 'Custom chart label')
    expect(container).toHaveAttribute('aria-description', 'Custom chart description')
  })

  it('handles different chart types', () => {
    const { rerender } = render(<BaseChart {...defaultProps} type="line" />)
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument()

    rerender(<BaseChart {...defaultProps} type="scatter" />)
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    render(<BaseChart {...defaultProps} data={[]} />)

    expect(screen.getByTestId('mock-chart')).toBeInTheDocument()
    const table = screen.getByLabelText('Data table for Test Chart')
    expect(table.querySelector('tbody')).toBeEmptyDOMElement()
  })

  it('uses custom colors when provided', () => {
    const customColors = ['#FF0000', '#00FF00', '#0000FF']
    render(<BaseChart {...defaultProps} colors={customColors} />)

    expect(screen.getByTestId('mock-chart')).toBeInTheDocument()
  })

  it('sets custom height', () => {
    render(<BaseChart {...defaultProps} height={600} />)

    const chartContainer = screen.getByTestId('mock-chart').parentElement
    expect(chartContainer).toHaveStyle('height: 600px')
  })
})
