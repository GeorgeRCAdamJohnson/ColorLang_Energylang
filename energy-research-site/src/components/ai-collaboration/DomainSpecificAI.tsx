import { useState } from 'react'
import { Zap, Palette, Code, BarChart3, Database, Cpu, ChevronRight } from 'lucide-react'

interface AIApplication {
  domain: 'energylang' | 'colorlang'
  category: string
  title: string
  description: string
  aiRole: string
  humanRole: string
  example: {
    challenge: string
    aiContribution: string
    humanOversight: string
    result: string
  }
  technicalDetails: string[]
}

const aiApplications: AIApplication[] = [
  {
    domain: 'energylang',
    category: 'Cross-Language Implementation',
    title: 'Benchmark Code Generation',
    description: 'AI generated equivalent algorithms across C++, Python, Rust, Go, and Java',
    aiRole: 'Generate functionally equivalent implementations with proper language idioms',
    humanRole: 'Verify algorithmic correctness and performance characteristics',
    example: {
      challenge:
        'Implement matrix multiplication benchmark in 5 languages with identical algorithms',
      aiContribution:
        'Generated language-specific implementations with proper memory management, type systems, and performance optimizations',
      humanOversight:
        'Verified mathematical correctness, added consistent timing harnesses, ensured fair comparison methodology',
      result: 'Reliable cross-language benchmarks that revealed C++ 6x efficiency advantage',
    },
    technicalDetails: [
      'Consistent algorithm implementation across type systems',
      'Language-appropriate memory management patterns',
      'Equivalent compiler optimization flags and settings',
      'Standardized input/output and timing measurement',
    ],
  },
  {
    domain: 'energylang',
    category: 'Energy Measurement',
    title: 'Profiler Race Condition Solution',
    description: 'AI helped design file-sentinel handshake protocol for reliable energy profiling',
    aiRole: 'Analyze race condition patterns and propose synchronization mechanisms',
    humanRole: 'Validate solution robustness and implement safety measures',
    example: {
      challenge:
        'AMD uProf and NVIDIA-smi profilers had nondeterministic startup timing causing measurement corruption',
      aiContribution:
        'Proposed file-sentinel handshake protocol with exponential backoff and timeout handling',
      humanOversight:
        'Added comprehensive error handling, logging, and fallback mechanisms for production reliability',
      result: 'Robust measurement harness with 99.9% successful profile capture rate',
    },
    technicalDetails: [
      'File-based inter-process communication protocol',
      'Exponential backoff with jitter for retry logic',
      'Comprehensive timeout and error recovery mechanisms',
      'Detailed logging for debugging measurement failures',
    ],
  },
  {
    domain: 'energylang',
    category: 'Data Processing',
    title: 'Energy Canonicalization Framework',
    description: 'AI designed physics-based energy calculation and database schema',
    aiRole: 'Design energy semantics and database normalization approach',
    humanRole: 'Validate physics correctness and ensure data integrity',
    example: {
      challenge:
        'Normalize energy measurements across different tools (AMD uProf, NVIDIA-smi, pyJoules) with varying units and sampling rates',
      aiContribution:
        'Designed unified energy = power × time calculation with proper unit conversions and temporal alignment',
      humanOversight:
        'Verified physics accuracy, added data validation rules, implemented audit trails for measurement traceability',
      result: 'Consistent energy database enabling reliable cross-language efficiency comparisons',
    },
    technicalDetails: [
      'Physics-based energy calculation (E = P × t)',
      'Temporal alignment of power samples with execution windows',
      'Unit normalization (watts, joules, milliseconds)',
      'Data integrity constraints and audit logging',
    ],
  },
  {
    domain: 'colorlang',
    category: 'Language Design',
    title: 'HSV Color Space Mapping',
    description: 'AI designed mathematical mapping from HSV values to programming instructions',
    aiRole: 'Create intuitive color-to-instruction mapping with mathematical precision',
    humanRole: 'Ensure visual programming usability and handle edge cases',
    example: {
      challenge:
        'Map 360° hue spectrum to 6 programming instructions with intuitive color associations',
      aiContribution:
        'Designed hue-based instruction mapping (0°=LOAD, 60°=ADD, etc.) with tolerance handling and wraparound logic',
      humanOversight:
        'Added visual debugging tools, user-friendly color picker integration, and comprehensive error messages',
      result: 'Intuitive visual programming system where colors directly represent executable code',
    },
    technicalDetails: [
      'Precise hue-to-instruction mapping with tolerance zones',
      'Circular hue space wraparound handling (360°/0° boundary)',
      'Saturation and value encoding for operands and data',
      'Visual debugging and instruction recognition feedback',
    ],
  },
  {
    domain: 'colorlang',
    category: 'Interpreter Architecture',
    title: 'Spatial Execution Model',
    description: 'AI designed 2D program execution with smart ordering and state management',
    aiRole: 'Design execution model for 2D color field programs with optimal ordering',
    humanRole: 'Ensure predictable behavior and debugging capabilities',
    example: {
      challenge:
        'Execute 2D color programs with intuitive ordering (linear vs 2D) and visible state tracking',
      aiContribution:
        'Designed smart execution order detection (left-to-right for linear, top-to-bottom for 2D) with register state management',
      humanOversight:
        'Added visual program counter, step-by-step debugging, and comprehensive state inspection tools',
      result: 'Predictable 2D program execution with excellent debugging and learning experience',
    },
    technicalDetails: [
      'Automatic linear vs 2D program detection',
      'Spatial program counter with visual highlighting',
      'Register and accumulator state tracking',
      'Step-by-step execution with pause/resume capability',
    ],
  },
  {
    domain: 'colorlang',
    category: 'Compression Framework',
    title: 'Machine-Native Color Encoding',
    description: 'AI designed compression system leveraging spatial color relationships',
    aiRole: 'Design compression algorithms exploiting 2D color field properties',
    humanRole: 'Optimize for real-world performance and validate compression ratios',
    example: {
      challenge:
        'Compress color programs efficiently while preserving spatial relationships and instruction precision',
      aiContribution:
        'Designed spatial sampling with HSV delta encoding and instruction-aware compression',
      humanOversight:
        'Benchmarked compression ratios, optimized for typical program patterns, added lossless validation',
      result:
        'Efficient compression achieving 60-80% size reduction while maintaining perfect fidelity',
    },
    technicalDetails: [
      'Spatial sampling with adaptive grid resolution',
      'HSV delta encoding for similar adjacent colors',
      'Instruction-aware compression preserving semantic boundaries',
      'Lossless validation ensuring perfect reconstruction',
    ],
  },
]

export function DomainSpecificAI() {
  const [selectedDomain, setSelectedDomain] = useState<'energylang' | 'colorlang'>('energylang')
  const [expandedApplication, setExpandedApplication] = useState<string | null>(null)

  const filteredApplications = aiApplications.filter(app => app.domain === selectedDomain)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="heading-lg mb-4">Domain-Specific AI Applications</h2>
        <p className="text-body max-w-3xl mx-auto">
          AI assistance was tailored to each project's unique technical challenges. EnergyLang
          required systems programming and measurement expertise, while ColorLang needed visual
          language design and spatial computation skills.
        </p>
      </div>

      {/* Domain Selection */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setSelectedDomain('energylang')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedDomain === 'energylang'
              ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
          }`}
        >
          <Zap className="w-5 h-5" />
          EnergyLang Project
        </button>
        <button
          onClick={() => setSelectedDomain('colorlang')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedDomain === 'colorlang'
              ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
          }`}
        >
          <Palette className="w-5 h-5" />
          ColorLang Project
        </button>
      </div>

      {/* Applications Grid */}
      <div className="space-y-4">
        {filteredApplications.map((application, index) => (
          <div key={index} className="card">
            <button
              onClick={() =>
                setExpandedApplication(
                  expandedApplication === `${application.domain}-${index}`
                    ? null
                    : `${application.domain}-${index}`
                )
              }
              className="w-full text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedDomain === 'energylang'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-purple-100 text-purple-600'
                    }`}
                  >
                    {application.category.includes('Implementation') && (
                      <Code className="w-5 h-5" />
                    )}
                    {application.category.includes('Measurement') && (
                      <BarChart3 className="w-5 h-5" />
                    )}
                    {application.category.includes('Data') && <Database className="w-5 h-5" />}
                    {application.category.includes('Language') && <Palette className="w-5 h-5" />}
                    {application.category.includes('Architecture') && <Cpu className="w-5 h-5" />}
                    {application.category.includes('Compression') && <Zap className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{application.title}</h3>
                    <p className="text-sm text-gray-600">{application.category}</p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedApplication === `${application.domain}-${index}` ? 'rotate-90' : ''
                  }`}
                />
              </div>

              <p className="text-body text-left">{application.description}</p>
            </button>

            {expandedApplication === `${application.domain}-${index}` && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                {/* AI vs Human Roles */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">AI Role</h4>
                    <p className="text-sm text-blue-800">{application.aiRole}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Human Role</h4>
                    <p className="text-sm text-green-800">{application.humanRole}</p>
                  </div>
                </div>

                {/* Detailed Example */}
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">Real Project Example</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Challenge</h5>
                      <p className="text-sm text-gray-600">{application.example.challenge}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">AI Contribution</h5>
                      <p className="text-sm text-gray-600">{application.example.aiContribution}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Human Oversight</h5>
                      <p className="text-sm text-gray-600">{application.example.humanOversight}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Result</h5>
                      <p className="text-sm text-gray-600 font-medium">
                        {application.example.result}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Technical Implementation Details
                  </h4>
                  <ul className="space-y-2">
                    {application.technicalDetails.map((detail, detailIndex) => (
                      <li
                        key={detailIndex}
                        className="text-sm text-gray-600 flex items-start gap-2"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            selectedDomain === 'energylang' ? 'bg-blue-500' : 'bg-purple-500'
                          }`}
                        />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
