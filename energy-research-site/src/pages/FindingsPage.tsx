import { BenchmarkDashboard } from '../components/charts/BenchmarkDashboard'
import { EfficiencyComparisonChart } from '../components/charts/EfficiencyComparisonChart'
import { useDataLoader } from '../hooks/useDataLoader'

export function FindingsPage() {
  const { aggregatedData, loading, error } = useDataLoader()

  if (loading) {
    return (
      <div className="section-padding">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading benchmark data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="section-padding">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600">Error loading data: {error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="heading-xl mb-4">Key Findings</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive analysis of energy efficiency across programming languages: C++
              demonstrates 6.3x superior efficiency compared to Python NumPy for matrix
              multiplication operations.
            </p>
          </header>

          {/* Key Finding Highlight */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-12 border border-blue-200">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">6.3x</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                Better Energy Efficiency
              </div>
              <div className="text-gray-600">
                C++ demonstrates superior energy efficiency compared to Python
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Measured in Joules per Floating Point Operation (J/FLOP)
              </div>
            </div>
          </div>

          {/* Interactive Visualizations */}
          <div className="space-y-12">
            <section>
              <h2 className="heading-lg mb-6">Energy Efficiency Comparison</h2>
              <div className="card">
                {aggregatedData.length > 0 ? (
                  <EfficiencyComparisonChart data={aggregatedData} />
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No aggregated data available for efficiency comparison
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="heading-lg mb-6">Comprehensive Benchmark Results</h2>
              <BenchmarkDashboard />
            </section>

            {/* Key Insights */}
            <section>
              <h2 className="heading-lg mb-6">Key Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="heading-sm mb-3">Language Performance Hierarchy</h3>
                  <p className="text-body mb-4">
                    Our benchmarks reveal a clear hierarchy in energy efficiency:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-body">
                    <li>C++ (most efficient)</li>
                    <li>Rust</li>
                    <li>Go</li>
                    <li>Java</li>
                    <li>Python NumPy (least efficient)</li>
                  </ol>
                </div>

                <div className="card">
                  <h3 className="heading-sm mb-3">Practical Implications</h3>
                  <p className="text-body mb-4">
                    These findings have significant implications for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-body">
                    <li>Data center energy consumption</li>
                    <li>Mobile application battery life</li>
                    <li>Sustainable software development</li>
                    <li>Cloud computing costs</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
