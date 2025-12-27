import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Zap,
  BarChart3,
  Target,
  Cog,
  CheckCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react'
import { BenchmarkDashboard } from '../components/charts/BenchmarkDashboard'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  icon?: React.ReactNode
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  icon,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-lg mb-6 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="px-6 py-6 bg-white">{children}</div>}
    </div>
  )
}

export function ResearchPage() {
  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <Breadcrumbs />

          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="heading-xl mb-4">EnergyLang Research Methodology</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive investigation into energy-efficient programming languages, evolving
              from theoretical concepts to rigorous empirical benchmarking
            </p>
          </div>

          {/* Research Journey Overview */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Research Journey</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Hypothesis</h3>
                <p className="text-sm text-gray-600">Energy-aware language design</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Cog className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Evolution</h3>
                <p className="text-sm text-gray-600">Comprehensive benchmarking</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Validation</h3>
                <p className="text-sm text-gray-600">Rigorous measurement</p>
              </div>
            </div>
          </div>

          {/* Original Hypothesis and Problem Statement */}
          <CollapsibleSection
            title="Original Hypothesis and Problem Statement"
            defaultOpen={true}
            icon={<Target className="w-5 h-5 text-blue-600" />}
          >
            <div className="space-y-6 research-content" data-protected="true">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Core Hypothesis</h4>
                <p className="text-blue-800">
                  Programming languages could be designed with energy efficiency as a first-class
                  concern, potentially achieving significant energy savings through language-level
                  optimizations and energy-aware runtime systems.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Problem Statement</h4>
                <p className="text-gray-700 mb-4">
                  Modern software development prioritizes developer productivity and runtime
                  performance, but largely ignores energy consumption. With growing environmental
                  concerns and the massive scale of global computing, even small improvements in
                  energy efficiency could have substantial environmental impact.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Key Questions</h5>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      How much do different programming languages vary in energy consumption?
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      Can language design choices significantly impact energy efficiency?
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      What measurement methodologies can reliably quantify energy consumption?
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      How can we build robust benchmarking infrastructure for energy research?
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Evolution from Concept to Benchmarking */}
          <CollapsibleSection
            title="Evolution from EnergyLang Concept to Comprehensive Benchmarking"
            icon={<Cog className="w-5 h-5 text-green-600" />}
          >
            <div className="space-y-6 research-content" data-protected="true">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Phase 1: Theoretical Foundation
                </h4>
                <p className="text-gray-700 mb-4">
                  Initial research focused on designing EnergyLang as a domain-specific language
                  with energy-aware constructs. The concept included:
                </p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">→</span>
                    Energy-aware data structures and algorithms
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">→</span>
                    Runtime energy profiling and optimization hints
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">→</span>
                    Compiler optimizations targeting energy efficiency
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Phase 2: Measurement Infrastructure
                </h4>
                <p className="text-gray-700 mb-4">
                  Realizing that energy measurement was more complex than anticipated, the focus
                  shifted to building robust measurement infrastructure:
                </p>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h5 className="font-medium text-yellow-900 mb-2">Key Challenges Discovered</h5>
                  <ul className="space-y-1 text-yellow-800 text-sm">
                    <li>• Profiler race conditions causing nondeterministic measurements</li>
                    <li>• Hardware-specific energy measurement APIs and tools</li>
                    <li>• Need for statistical significance across multiple runs</li>
                    <li>• Isolating language effects from system noise</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Phase 3: Cross-Language Benchmarking
                </h4>
                <p className="text-gray-700 mb-4">
                  The research evolved into a comprehensive cross-language energy efficiency study,
                  implementing identical algorithms across multiple programming languages to
                  establish baseline energy consumption patterns.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Languages Studied</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• C++ (optimized and standard)</li>
                      <li>• Python (NumPy and pure)</li>
                      <li>• Rust (safe and unsafe)</li>
                      <li>• Go (concurrent and sequential)</li>
                      <li>• Java (JVM optimizations)</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-2">Benchmark Algorithms</h5>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Matrix multiplication</li>
                      <li>• Sorting algorithms</li>
                      <li>• File I/O operations</li>
                      <li>• JSON processing</li>
                      <li>• FFT computations</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Phase 4: Strategic Pivot</h4>
                <p className="text-gray-700 mb-4">
                  Based on empirical findings showing significant energy differences between
                  existing languages (C++ ~6x more efficient than Python), the research pivoted from
                  creating a new language to providing actionable insights for developers using
                  existing languages.
                </p>
                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                  <p className="text-purple-800 font-medium">
                    "The data revealed that choosing the right existing language and optimization
                    techniques could achieve the energy savings we hoped to gain through language
                    design."
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Profiler Race Condition Solution */}
          <CollapsibleSection
            title="Profiler Race Condition Solution: File-Sentinel Handshakes"
            icon={<AlertTriangle className="w-5 h-5 text-orange-600" />}
          >
            <div className="space-y-6 research-content" data-protected="true">
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">The Problem</h4>
                <p className="text-red-800 mb-3">
                  Energy profiling tools (AMD uProf, NVIDIA-smi) exhibited nondeterministic behavior
                  when measuring short-duration benchmarks, leading to inconsistent and unreliable
                  results.
                </p>
                <div className="text-sm text-red-700">
                  <strong>Symptoms:</strong> Measurements varying by 2-3x between identical runs,
                  profiler startup/shutdown timing affecting results, race conditions between
                  benchmark execution and profiler data collection.
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Root Cause Analysis</h4>
                <p className="text-gray-700 mb-4">
                  Systematic debugging revealed that profilers required time to initialize and
                  stabilize before accurate measurements could begin. Traditional approaches using
                  sleep delays or process synchronization were unreliable across different hardware
                  configurations.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Investigation Process</h5>
                  <ol className="space-y-2 text-gray-700 text-sm">
                    <li className="flex gap-2">
                      <span className="font-mono bg-gray-200 px-1 rounded">1.</span>
                      Identified timing inconsistencies through statistical analysis of measurement
                      variance
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono bg-gray-200 px-1 rounded">2.</span>
                      Traced profiler initialization sequences using system call monitoring
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono bg-gray-200 px-1 rounded">3.</span>
                      Tested various synchronization mechanisms (signals, pipes, shared memory)
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono bg-gray-200 px-1 rounded">4.</span>
                      Developed file-based handshake protocol as most reliable solution
                    </li>
                  </ol>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  File-Sentinel Handshake Protocol
                </h4>
                <p className="text-gray-700 mb-4">
                  The solution implements a robust handshake mechanism using filesystem operations
                  to coordinate between benchmark execution and profiler data collection.
                </p>

                <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                  <h5 className="font-medium text-green-900 mb-2">Protocol Steps</h5>
                  <ol className="space-y-2 text-green-800 text-sm">
                    <li>
                      <strong>1. Profiler Start:</strong> Energy profiler begins monitoring and
                      creates "profiler_ready.sentinel" file
                    </li>
                    <li>
                      <strong>2. Benchmark Wait:</strong> Benchmark process polls for sentinel file
                      existence
                    </li>
                    <li>
                      <strong>3. Execution Begin:</strong> Once sentinel detected, benchmark creates
                      "benchmark_start.sentinel" and begins execution
                    </li>
                    <li>
                      <strong>4. Completion Signal:</strong> Benchmark creates
                      "benchmark_complete.sentinel" upon completion
                    </li>
                    <li>
                      <strong>5. Profiler Stop:</strong> Profiler detects completion sentinel and
                      stops monitoring
                    </li>
                    <li>
                      <strong>6. Cleanup:</strong> All sentinel files are removed for next iteration
                    </li>
                  </ol>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Implementation Benefits</h5>
                  <ul className="space-y-1 text-blue-800 text-sm">
                    <li>
                      • <strong>Reliability:</strong> Filesystem operations are atomic and
                      cross-platform
                    </li>
                    <li>
                      • <strong>Debuggability:</strong> Sentinel files provide audit trail of
                      execution timing
                    </li>
                    <li>
                      • <strong>Robustness:</strong> Handles profiler crashes and unexpected
                      termination
                    </li>
                    <li>
                      • <strong>Scalability:</strong> Works across different hardware and OS
                      configurations
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Results and Validation</h4>
                <p className="text-gray-700 mb-4">
                  The file-sentinel handshake protocol reduced measurement variance from 200-300% to
                  less than 5%, enabling statistically significant energy comparisons across
                  programming languages.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <h6 className="font-medium text-red-900 text-sm mb-1">
                      Before (Race Conditions)
                    </h6>
                    <p className="text-red-800 text-sm">Variance: 200-300%</p>
                    <p className="text-red-800 text-sm">Reliability: ~40%</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h6 className="font-medium text-green-900 text-sm mb-1">
                      After (File Sentinels)
                    </h6>
                    <p className="text-green-800 text-sm">Variance: &lt;5%</p>
                    <p className="text-green-800 text-sm">Reliability: &gt;99%</p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Measurement Tools and Methodology */}
          <CollapsibleSection
            title="Measurement Tools and Energy Canonicalization"
            icon={<FileText className="w-5 h-5 text-purple-600" />}
          >
            <div className="space-y-6 research-content" data-protected="true">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Energy Measurement Tools</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h5 className="font-medium text-red-900 mb-2">AMD uProf</h5>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• CPU energy monitoring</li>
                      <li>• Hardware performance counters</li>
                      <li>• Per-core power measurements</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-2">NVIDIA-smi</h5>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• GPU power consumption</li>
                      <li>• Memory usage tracking</li>
                      <li>• Temperature monitoring</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">pyJoules</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Python energy profiling</li>
                      <li>• RAPL interface</li>
                      <li>• Cross-platform support</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Energy Canonicalization: Power × Time
                </h4>
                <p className="text-gray-700 mb-4">
                  All energy measurements are canonicalized using the fundamental physics
                  relationship:
                  <strong className="font-mono bg-gray-100 px-2 py-1 rounded mx-1">
                    Energy = Power × Time
                  </strong>
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Canonicalization Process</h5>
                  <ol className="space-y-2 text-blue-800 text-sm">
                    <li>
                      <strong>1. Power Measurement:</strong> Continuous sampling of instantaneous
                      power consumption (Watts)
                    </li>
                    <li>
                      <strong>2. Time Tracking:</strong> Precise measurement of benchmark execution
                      duration
                    </li>
                    <li>
                      <strong>3. Energy Calculation:</strong> Integration of power over time to
                      compute total energy (Joules)
                    </li>
                    <li>
                      <strong>4. Normalization:</strong> Calculate energy per operation (J/FLOP) for
                      fair comparison
                    </li>
                  </ol>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Statistical Rigor</h4>
                <p className="text-gray-700 mb-4">
                  Each benchmark configuration was executed multiple times to ensure statistical
                  significance:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>
                      • <strong>Sample Size:</strong> Minimum 50 runs per configuration
                    </li>
                    <li>
                      • <strong>Outlier Detection:</strong> Statistical outlier removal using IQR
                      method
                    </li>
                    <li>
                      • <strong>Confidence Intervals:</strong> 95% confidence intervals for all
                      reported values
                    </li>
                    <li>
                      • <strong>Variance Analysis:</strong> Standard deviation and coefficient of
                      variation reporting
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Interactive Benchmark Dashboard */}
          <CollapsibleSection
            title="Interactive Benchmark Visualization Dashboard"
            defaultOpen={true}
            icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
          >
            <div className="space-y-4">
              <p className="text-gray-700">
                Explore the comprehensive benchmark data through interactive visualizations. This
                dashboard displays C++ vs Python efficiency comparisons prominently, shows both raw
                measurements and normalized J/FLOP comparisons, and implements multiple chart types
                including bar charts, scatter plots, and statistical distributions.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h5 className="font-medium text-yellow-900 mb-2">Dashboard Features</h5>
                <ul className="space-y-1 text-yellow-800 text-sm">
                  <li>• Interactive filtering by programming language and benchmark type</li>
                  <li>• Multiple visualization types: bar charts, scatter plots, box plots</li>
                  <li>• Real-time data exploration with hover tooltips and detailed breakdowns</li>
                  <li>• Statistical distribution analysis with quartiles and outlier detection</li>
                  <li>• Direct comparison views highlighting the 6x efficiency difference</li>
                </ul>
              </div>

              <BenchmarkDashboard showKeyFinding={true} />
            </div>
          </CollapsibleSection>

          {/* Research Impact */}
          <div className="card mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Research Impact and Findings</h2>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-yellow-500" />
                <h3 className="text-xl font-bold text-gray-900">Key Discovery</h3>
              </div>
              <p className="text-lg text-gray-800 mb-4">
                <strong>C++ is approximately 6x more energy efficient than Python NumPy</strong> for
                matrix multiplication operations, with significant implications for large-scale
                computing.
              </p>
              <p className="text-gray-700">
                This finding, enabled by the robust measurement infrastructure and file-sentinel
                handshake protocol, provides actionable guidance for developers and organizations
                seeking to reduce their computational energy footprint.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
