import { useState } from 'react'
import { Bug, Search, Lightbulb, CheckCircle, AlertTriangle, Clock, FileText } from 'lucide-react'

interface DebuggingCase {
  id: string
  title: string
  problem: string
  context: string
  systematicApproach: {
    step: string
    description: string
    outcome: string
    evidence: string[]
  }[]
  solution: {
    description: string
    implementation: string
    validation: string
  }
  pragmaticDecisions: string[]
  lessonsLearned: string[]
}

const debuggingCases: DebuggingCase[] = [
  {
    id: 'profiler-race',
    title: 'Profiler Race Condition Resolution',
    problem:
      'AMD uProf and NVIDIA-smi profilers had nondeterministic startup timing causing measurement corruption and unreliable energy data',
    context:
      'Energy benchmarking required precise synchronization between benchmark execution and profiler data collection across multiple tools',
    systematicApproach: [
      {
        step: 'Problem Isolation',
        description:
          'Identified that profiler startup timing was nondeterministic, causing missed measurements or incorrect attribution',
        outcome: 'Confirmed race condition between benchmark start and profiler readiness',
        evidence: [
          'Profiler logs showed inconsistent startup times (50-200ms variance)',
          'Energy measurements missing for ~15% of benchmark runs',
          'Correlation analysis revealed timing dependency patterns',
        ],
      },
      {
        step: 'Root Cause Analysis',
        description:
          'Analyzed profiler initialization sequences and inter-process communication patterns',
        outcome: 'Discovered profilers require warm-up time and lack ready-state signaling',
        evidence: [
          'AMD uProf documentation revealed 100-150ms initialization period',
          'NVIDIA-smi requires GPU context establishment before accurate readings',
          'No standard IPC mechanism for profiler readiness notification',
        ],
      },
      {
        step: 'Solution Design',
        description:
          'Designed file-sentinel handshake protocol with exponential backoff and timeout handling',
        outcome: 'Robust synchronization mechanism that works across different profiler types',
        evidence: [
          'File-based IPC chosen for simplicity and cross-platform compatibility',
          'Exponential backoff prevents busy-waiting and reduces system load',
          'Timeout mechanisms ensure graceful failure handling',
        ],
      },
      {
        step: 'Implementation & Testing',
        description:
          'Implemented protocol with comprehensive error handling and logging for production reliability',
        outcome:
          'Achieved 99.9% successful profile capture rate across thousands of benchmark runs',
        evidence: [
          'Reduced measurement failures from 15% to <0.1%',
          'Consistent timing across different hardware configurations',
          'Comprehensive logging enabled rapid diagnosis of remaining edge cases',
        ],
      },
    ],
    solution: {
      description:
        'File-sentinel handshake protocol with exponential backoff and comprehensive error recovery',
      implementation:
        'Profilers write ready-state files, benchmark waits with exponential backoff (50ms, 100ms, 200ms...), timeout after 5 seconds',
      validation:
        'Unit tests for timing logic, integration tests with real profilers, stress testing with concurrent benchmarks',
    },
    pragmaticDecisions: [
      'Used file-based IPC instead of complex shared memory for simplicity and reliability',
      'Implemented comprehensive logging for debugging rather than trying to eliminate all edge cases',
      'Added safety timeouts to prevent infinite waiting in edge cases',
      'Preserved raw measurement artifacts for post-hoc analysis and auditing',
    ],
    lessonsLearned: [
      'Systematic isolation of timing issues requires careful measurement and correlation analysis',
      'Simple, robust solutions often outperform complex optimizations in production environments',
      'Comprehensive logging is essential for debugging nondeterministic issues',
      'Safety mechanisms (timeouts, retries) are crucial for production reliability',
    ],
  },
  {
    id: 'energy-canonicalization',
    title: 'Energy Measurement Canonicalization',
    problem:
      'Different profiling tools (AMD uProf, NVIDIA-smi, pyJoules) provided energy data in incompatible formats, units, and sampling rates',
    context:
      'Cross-language energy comparison required consistent energy calculation methodology across heterogeneous measurement tools',
    systematicApproach: [
      {
        step: 'Data Format Analysis',
        description:
          'Systematically analyzed output formats, units, and temporal characteristics of each profiling tool',
        outcome:
          'Identified fundamental differences in measurement approaches and data representation',
        evidence: [
          'AMD uProf: Joules per time window, variable sampling rate (10-100ms)',
          'NVIDIA-smi: Watts instantaneous, fixed 1-second intervals',
          'pyJoules: Joules cumulative, process-level attribution',
        ],
      },
      {
        step: 'Physics-Based Unification',
        description:
          'Applied fundamental physics relationship (Energy = Power × Time) to normalize all measurements',
        outcome: 'Consistent energy calculation methodology across all tools',
        evidence: [
          'Mathematical validation: ∫P(t)dt = E for all measurement types',
          'Unit conversion framework: Watts→Joules, mW→W, kJ→J',
          'Temporal alignment algorithm for different sampling rates',
        ],
      },
      {
        step: 'Database Schema Design',
        description:
          'Designed PostgreSQL schema with energy semantics and audit trails for measurement traceability',
        outcome: 'Robust data model supporting cross-tool analysis and validation',
        evidence: [
          'Normalized energy table with tool-agnostic columns',
          'Audit trail preserving raw measurements for verification',
          'Constraint validation ensuring physics-based consistency',
        ],
      },
      {
        step: 'Validation & Auditing',
        description:
          'Implemented comprehensive validation rules and audit mechanisms for data integrity',
        outcome: 'High-confidence energy comparisons with full measurement traceability',
        evidence: [
          'Cross-tool validation showing <5% variance for identical workloads',
          'Audit queries enabling rapid identification of measurement anomalies',
          'Statistical analysis confirming measurement consistency across runs',
        ],
      },
    ],
    solution: {
      description:
        'Physics-based energy canonicalization with comprehensive audit trails and validation',
      implementation:
        'Unified E=P×t calculation, temporal alignment algorithms, PostgreSQL schema with constraints',
      validation:
        'Cross-tool comparison tests, statistical consistency analysis, audit trail verification',
    },
    pragmaticDecisions: [
      'Preserved raw measurement data alongside canonicalized values for auditing',
      'Used PostgreSQL constraints to enforce physics-based validation rules',
      'Implemented statistical outlier detection rather than trying to eliminate all measurement noise',
      'Added comprehensive metadata tracking for measurement provenance and debugging',
    ],
    lessonsLearned: [
      'Physics-based approaches provide robust foundation for measurement unification',
      'Audit trails are essential for debugging complex measurement pipelines',
      'Statistical validation more reliable than attempting perfect measurement precision',
      'Database constraints can encode domain knowledge and prevent data corruption',
    ],
  },
]

export function SystematicDebugging() {
  const [selectedCase, setSelectedCase] = useState<string>(debuggingCases[0].id)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  const currentCase = debuggingCases.find(c => c.id === selectedCase)!

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="heading-lg mb-4">Systematic Debugging Approaches</h2>
        <p className="text-body max-w-3xl mx-auto">
          Complex technical challenges require systematic approaches to problem-solving. These case
          studies demonstrate methodical debugging processes that led to robust, production-ready
          solutions.
        </p>
      </div>

      {/* Case Selection */}
      <div className="flex flex-wrap gap-4 justify-center">
        {debuggingCases.map(debugCase => (
          <button
            key={debugCase.id}
            onClick={() => setSelectedCase(debugCase.id)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedCase === debugCase.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {debugCase.title}
          </button>
        ))}
      </div>

      {/* Selected Case */}
      <div className="card">
        <div className="mb-6">
          <h3 className="heading-md mb-4">{currentCase.title}</h3>

          {/* Problem & Context */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                <Bug className="w-5 h-5" />
                Problem Statement
              </h4>
              <p className="text-sm text-red-800">{currentCase.problem}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Context
              </h4>
              <p className="text-sm text-blue-800">{currentCase.context}</p>
            </div>
          </div>
        </div>

        {/* Systematic Approach */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Systematic Debugging Process
          </h4>

          <div className="space-y-4">
            {currentCase.systematicApproach.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{step.step}</h5>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  <Clock
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedStep === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {expandedStep === index && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="mt-4 space-y-4">
                      <div>
                        <h6 className="font-medium text-gray-900 mb-2">Outcome</h6>
                        <p className="text-sm text-gray-700">{step.outcome}</p>
                      </div>
                      <div>
                        <h6 className="font-medium text-gray-900 mb-2">Supporting Evidence</h6>
                        <ul className="space-y-1">
                          {step.evidence.map((evidence, evidenceIndex) => (
                            <li
                              key={evidenceIndex}
                              className="text-sm text-gray-600 flex items-start gap-2"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {evidence}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Solution Details */}
        <div className="bg-green-50 p-6 rounded-lg mb-6">
          <h4 className="font-medium text-green-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Final Solution
          </h4>
          <div className="space-y-3 text-sm text-green-800">
            <div>
              <span className="font-medium">Description:</span>
              <span className="ml-2">{currentCase.solution.description}</span>
            </div>
            <div>
              <span className="font-medium">Implementation:</span>
              <span className="ml-2">{currentCase.solution.implementation}</span>
            </div>
            <div>
              <span className="font-medium">Validation:</span>
              <span className="ml-2">{currentCase.solution.validation}</span>
            </div>
          </div>
        </div>

        {/* Pragmatic Decisions & Lessons */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Pragmatic Engineering Decisions</h4>
            <ul className="space-y-2">
              {currentCase.pragmaticDecisions.map((decision, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {decision}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Key Lessons Learned</h4>
            <ul className="space-y-2">
              {currentCase.lessonsLearned.map((lesson, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  {lesson}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
