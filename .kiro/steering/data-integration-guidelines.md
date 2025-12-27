---
inclusion: fileMatch
fileMatchPattern: "*.csv|*data*|*chart*|*visual*"
---

# Data Integration Guidelines

## Available Research Data

### EnergyLang Benchmark Data
- **Primary Dataset**: `matrix_multiply_jperflop_comparison.csv`
  - C++ (tuned): 1.15e-08 J/FLOP
  - EnergyLang: 1.45e-08 J/FLOP  
  - Python NumPy: 7.10e-08 J/FLOP
- **Detailed Results**: `matrix_multiply_benchmark_results_summary.csv` (152 rows)
- **Cross-Language Comparison**: Multiple implementations with runtime and energy metrics

### Key Metrics to Visualize
1. **Energy Efficiency (J/FLOP)** - Primary comparison metric
2. **Runtime Performance** - Execution time across languages
3. **Power Consumption** - Average watts during execution
4. **Iteration Consistency** - Variance across multiple runs

## Visualization Requirements

### Interactive Charts
- **Filterable by Language**: C++, Python, EnergyLang, Rust, Go, Java
- **Metric Selection**: Toggle between energy, runtime, power
- **Hover Details**: Show exact values and context
- **Responsive Design**: Work on mobile and desktop

### Chart Types Needed
1. **Bar Charts**: Language efficiency comparison
2. **Scatter Plots**: Runtime vs energy consumption
3. **Box Plots**: Distribution of measurements across iterations
4. **Line Charts**: Performance trends over iterations

## ColorLang Demonstration Data

### Visual Programming Examples
- **Color Program Files**: HSV-encoded instruction sets
- **Execution Results**: Output from color field computation
- **Interactive Demos**: Real-time color program execution
- **Architecture Diagrams**: VM and parser component relationships

## Data Processing Guidelines

### Energy Measurement Canonicalization
- **Physics-Based Formula**: Energy = Power × Runtime
- **Unit Consistency**: Joules for energy, Watts for power, seconds for time
- **Normalization**: J/FLOP for cross-language comparison
- **Raw Data Preservation**: Keep original measurements for auditing

### Benchmark Data Validation
- **Outlier Detection**: Identify and handle measurement anomalies
- **Statistical Significance**: Ensure sufficient iterations for reliability
- **Measurement Robustness**: Account for profiler race conditions solved by file-sentinel handshakes
- **Semantic Consistency**: Verify energy calculations match physics expectations

## Implementation Patterns

### CSV Data Loading
```javascript
// Example pattern for loading benchmark data
const loadBenchmarkData = async () => {
  const response = await fetch('/data/matrix_multiply_jperflop_comparison.csv');
  const csvText = await response.text();
  return parseCSV(csvText);
};
```

### Chart Configuration
- **Responsive**: Adapt to container size
- **Accessible**: Include alt text and keyboard navigation
- **Performance**: Optimize for large datasets
- **Consistent Styling**: Match overall site design

### Interactive Features
- **Filter Controls**: Dropdown menus for language/metric selection
- **Zoom/Pan**: For detailed data exploration
- **Export Options**: Allow users to download charts or data
- **Comparison Mode**: Side-by-side visualization capabilities