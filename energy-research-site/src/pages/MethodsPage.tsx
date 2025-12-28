import { Code, Database, Cpu, Zap, Settings, BarChart3 } from 'lucide-react'

export function MethodsPage() {
  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="heading-xl mb-4">Technical Methods</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Deep dive into our technical implementation: energy measurement tools, benchmarking
              harnesses, cross-language implementations, and database design for energy semantics.
            </p>
          </header>

          <div className="space-y-12">
            {/* Energy Measurement Tools */}
            <section>
              <h2 className="heading-lg mb-8">Energy Measurement Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card">
                  <div className="flex items-center mb-4">
                    <Cpu className="text-blue-600 mr-3" size={24} />
                    <h3 className="heading-sm">AMD uProf</h3>
                  </div>
                  <p className="text-body mb-4">
                    Hardware-level CPU energy profiling with precise power measurements and
                    instruction-level analysis.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Real-time power monitoring</li>
                    <li>• Per-core energy breakdown</li>
                    <li>• Instruction-level profiling</li>
                  </ul>
                </div>

                <div className="card">
                  <div className="flex items-center mb-4">
                    <Zap className="text-green-600 mr-3" size={24} />
                    <h3 className="heading-sm">NVIDIA-smi</h3>
                  </div>
                  <p className="text-body mb-4">
                    GPU power monitoring for comprehensive system-wide energy analysis during
                    compute-intensive operations.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• GPU power consumption</li>
                    <li>• Memory usage tracking</li>
                    <li>• Temperature monitoring</li>
                  </ul>
                </div>

                <div className="card">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="text-purple-600 mr-3" size={24} />
                    <h3 className="heading-sm">pyJoules</h3>
                  </div>
                  <p className="text-body mb-4">
                    Python-based energy measurement framework for cross-platform energy profiling
                    and analysis.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Cross-platform support</li>
                    <li>• Python integration</li>
                    <li>• Statistical analysis</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Benchmarking Harness */}
            <section>
              <h2 className="heading-lg mb-8">Benchmarking Harness</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card">
                  <h3 className="heading-sm mb-4">File-Sentinel Handshake Protocol</h3>
                  <p className="text-body mb-4">
                    Solved profiler race conditions through a sophisticated handshake mechanism that
                    ensures accurate timing and energy measurements.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      1. Create sentinel file
                      <br />
                      2. Start profiler
                      <br />
                      3. Execute benchmark
                      <br />
                      4. Remove sentinel file
                      <br />
                      5. Stop profiler
                      <br />
                      6. Collect measurements
                    </code>
                  </div>
                </div>

                <div className="card">
                  <h3 className="heading-sm mb-4">Energy Canonicalization</h3>
                  <p className="text-body mb-4">
                    Physics-based approach to energy measurement using the fundamental relationship:
                    Energy = Power × Time.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                        E = P × t
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        Energy (Joules) = Power (Watts) × Time (Seconds)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Cross-Language Implementation */}
            <section>
              <h2 className="heading-lg mb-8">Cross-Language Implementation</h2>
              <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  {[
                    {
                      name: 'C++',
                      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
                    },
                    {
                      name: 'Python',
                      color:
                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
                    },
                    {
                      name: 'Rust',
                      color:
                        'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
                    },
                    {
                      name: 'Go',
                      color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300',
                    },
                    {
                      name: 'Java',
                      color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
                    },
                  ].map(lang => (
                    <div
                      key={lang.name}
                      className={`${lang.color} px-3 py-2 rounded-lg text-center font-medium`}
                    >
                      {lang.name}
                    </div>
                  ))}
                </div>
                <p className="text-body">
                  Identical matrix multiplication algorithms implemented across five programming
                  languages to ensure fair comparison. Each implementation uses language-specific
                  optimizations while maintaining algorithmic equivalence.
                </p>
              </div>
            </section>

            {/* Database Design */}
            <section>
              <h2 className="heading-lg mb-8">Database Design</h2>
              <div className="card">
                <div className="flex items-center mb-4">
                  <Database className="text-indigo-600 mr-3" size={24} />
                  <h3 className="heading-sm">PostgreSQL Schema</h3>
                </div>
                <p className="text-body mb-6">
                  Sophisticated database schema designed for energy semantics auditing and
                  comprehensive benchmark data management.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Core Tables</h4>
                    <ul className="space-y-2 text-body">
                      <li>
                        •{' '}
                        <code className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                          benchmarks
                        </code>{' '}
                        - Test execution records
                      </li>
                      <li>
                        •{' '}
                        <code className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                          energy_measurements
                        </code>{' '}
                        - Power consumption data
                      </li>
                      <li>
                        •{' '}
                        <code className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                          languages
                        </code>{' '}
                        - Implementation metadata
                      </li>
                      <li>
                        •{' '}
                        <code className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                          system_info
                        </code>{' '}
                        - Hardware specifications
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                    <ul className="space-y-2 text-body">
                      <li>• Energy semantics validation</li>
                      <li>• Temporal data integrity</li>
                      <li>• Statistical aggregation views</li>
                      <li>• Audit trail maintenance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* ColorLang Architecture */}
            <section>
              <h2 className="heading-lg mb-8">ColorLang Architecture</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card">
                  <div className="flex items-center mb-4">
                    <Settings className="text-pink-600 mr-3" size={24} />
                    <h3 className="heading-sm">Interpreter Design</h3>
                  </div>
                  <p className="text-body mb-4">
                    Stack-based virtual machine with HSV color space instruction encoding and
                    spatial program execution model.
                  </p>
                  <ul className="space-y-2 text-body">
                    <li>• HSV-to-instruction mapping</li>
                    <li>• 2D spatial execution model</li>
                    <li>• Register-based architecture</li>
                    <li>• Visual debugging interface</li>
                  </ul>
                </div>

                <div className="card">
                  <div className="flex items-center mb-4">
                    <Code className="text-emerald-600 mr-3" size={24} />
                    <h3 className="heading-sm">Compression Framework</h3>
                  </div>
                  <p className="text-body mb-4">
                    Spatial sampling and compression system for efficient storage and transmission
                    of color-encoded programs.
                  </p>
                  <ul className="space-y-2 text-body">
                    <li>• Lossless color compression</li>
                    <li>• Spatial optimization</li>
                    <li>• Pattern recognition</li>
                    <li>• Efficient serialization</li>
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
