import { useState } from 'react'
import { TrendingUp, AlertCircle, Target, CheckCircle, ArrowRight, Calendar } from 'lucide-react'

interface StrengthArea {
  title: string
  description: string
  evidence: string[]
  impact: string
}

interface ImprovementArea {
  title: string
  description: string
  specificExamples: string[]
  improvementPlan: {
    action: string
    timeline: string
    measurableOutcome: string
  }[]
  nextSteps: string[]
}

const strengths: StrengthArea[] = [
  {
    title: 'Systematic Debugging & Problem-Solving',
    description:
      'Methodical approach to complex technical challenges with evidence-based solutions',
    evidence: [
      'Resolved profiler race conditions through systematic isolation and file-sentinel protocol design',
      'Unified energy measurement across heterogeneous tools using physics-based canonicalization',
      'Designed robust ColorLang interpreter with comprehensive edge case handling',
    ],
    impact: 'Achieved 99.9% measurement reliability and robust cross-language energy comparisons',
  },
  {
    title: 'Pragmatic Engineering Decisions',
    description: 'Balanced technical sophistication with practical implementation constraints',
    evidence: [
      'Chose file-based IPC over complex shared memory for profiler synchronization',
      'Preserved raw measurement artifacts for auditing rather than pursuing perfect precision',
      'Implemented comprehensive logging for debugging instead of eliminating all edge cases',
    ],
    impact: 'Delivered production-ready solutions with excellent maintainability and debuggability',
  },
  {
    title: 'Cross-Domain Technical Expertise',
    description:
      'Successfully navigated multiple technical domains with sophisticated implementations',
    evidence: [
      'Systems programming: Energy measurement harnesses across C++, Python, Rust, Go, Java',
      'Visual language design: HSV-based instruction mapping and spatial execution models',
      'Database design: PostgreSQL schema with physics-based constraints and audit trails',
    ],
    impact:
      'Demonstrated technical breadth enabling innovative solutions across diverse problem spaces',
  },
  {
    title: 'Strategic Decision-Making with AI Collaboration',
    description: 'Evidence-based strategic pivots using systematic multi-persona analysis',
    evidence: [
      'Comprehensive hyperscaler research preventing months of high-risk development',
      'Multi-persona AI reviews surfacing critical blind spots in security, legal, and operational domains',
      'Preserved research value while avoiding operational and compliance risks',
    ],
    impact:
      'Avoided significant technical debt and legal exposure while maintaining research momentum',
  },
]

const improvementAreas: ImprovementArea[] = [
  {
    title: 'Early Stakeholder Mapping & Engagement',
    description:
      'Need to identify and engage key stakeholders earlier in the project lifecycle to surface constraints and requirements',
    specificExamples: [
      'Hyperscaler approach developed without early legal/compliance consultation',
      'Energy measurement tools designed before understanding enterprise security requirements',
      'ColorLang interpreter built without early user experience validation',
    ],
    improvementPlan: [
      {
        action: 'Create stakeholder mapping template for project initiation',
        timeline: 'Next 2 weeks',
        measurableOutcome: 'Documented stakeholder analysis for all future projects',
      },
      {
        action: 'Establish regular stakeholder check-ins during development phases',
        timeline: 'Ongoing',
        measurableOutcome: 'Weekly stakeholder updates with feedback incorporation',
      },
      {
        action: 'Develop domain-specific stakeholder checklists (legal, security, UX, ops)',
        timeline: 'Next month',
        measurableOutcome: 'Comprehensive stakeholder engagement framework',
      },
    ],
    nextSteps: [
      'Interview project stakeholders to understand optimal engagement timing',
      'Research industry best practices for technical project stakeholder management',
      'Create templates and checklists for systematic stakeholder identification',
    ],
  },
  {
    title: 'Change Isolation & Incremental Validation',
    description:
      'Improve ability to isolate changes and validate incrementally to reduce debugging complexity',
    specificExamples: [
      'Energy measurement pipeline changes sometimes affected multiple components simultaneously',
      'ColorLang interpreter modifications occasionally introduced regressions in unrelated features',
      'Website component updates sometimes had cascading effects on other sections',
    ],
    improvementPlan: [
      {
        action: 'Implement feature flags for all significant changes',
        timeline: 'Next project',
        measurableOutcome: 'All new features deployable independently with rollback capability',
      },
      {
        action: 'Establish comprehensive regression test suites before making changes',
        timeline: 'Ongoing',
        measurableOutcome: '95%+ test coverage for all critical functionality',
      },
      {
        action: 'Adopt smaller, more frequent commits with isolated functionality',
        timeline: 'Immediate',
        measurableOutcome: 'Average commit size <100 lines with single-purpose changes',
      },
    ],
    nextSteps: [
      'Research feature flag implementation patterns for different project types',
      'Establish automated testing pipelines with comprehensive coverage reporting',
      'Create commit message templates emphasizing change isolation',
    ],
  },
  {
    title: 'Documentation Practices & Knowledge Transfer',
    description:
      'Enhance documentation practices to improve maintainability and enable effective knowledge transfer',
    specificExamples: [
      'Energy measurement harness setup required significant tribal knowledge',
      'ColorLang interpreter architecture not fully documented for future contributors',
      'Strategic decision rationale sometimes implicit rather than explicitly documented',
    ],
    improvementPlan: [
      {
        action: 'Establish documentation-first development practices',
        timeline: 'Next project',
        measurableOutcome: 'All architectural decisions documented before implementation',
      },
      {
        action: 'Create comprehensive setup and contribution guides',
        timeline: 'Next 6 weeks',
        measurableOutcome: 'New contributors can set up development environment in <30 minutes',
      },
      {
        action: 'Implement automated documentation generation and validation',
        timeline: 'Next 2 months',
        measurableOutcome: 'Documentation automatically updated with code changes',
      },
    ],
    nextSteps: [
      'Research documentation-as-code tools and best practices',
      'Interview team members about documentation pain points and preferences',
      'Establish documentation review processes as part of code review',
    ],
  },
  {
    title: 'Balancing Technical Depth with Higher-Level Progress',
    description:
      'Better balance deep technical investigation with broader project progress and strategic objectives',
    specificExamples: [
      'Spent extensive time perfecting energy measurement precision when approximate values sufficient for comparison',
      "Over-engineered ColorLang interpreter features that weren't critical for core demonstration",
      'Deep-dived into profiler internals when simpler workarounds might have been adequate',
    ],
    improvementPlan: [
      {
        action: 'Establish explicit "good enough" criteria for each project phase',
        timeline: 'Next project',
        measurableOutcome: 'Clear quality gates with defined acceptance criteria',
      },
      {
        action: 'Implement time-boxed investigation periods with decision points',
        timeline: 'Immediate',
        measurableOutcome: 'Maximum 2-day investigation periods before reassessment',
      },
      {
        action: 'Regular progress reviews against strategic objectives',
        timeline: 'Weekly',
        measurableOutcome: 'Weekly alignment check between technical work and project goals',
      },
    ],
    nextSteps: [
      'Develop project phase templates with explicit quality criteria',
      'Research time-boxing techniques for technical investigation',
      'Create strategic objective tracking and review processes',
    ],
  },
]

export function SelfAssessment() {
  const [selectedTab, setSelectedTab] = useState<'strengths' | 'improvements'>('strengths')
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="heading-lg mb-4">Honest Self-Assessment</h2>
        <p className="text-body max-w-3xl mx-auto">
          Professional growth requires honest evaluation of both strengths and areas for
          improvement. This assessment provides concrete examples, evidence-based analysis, and
          specific improvement plans with measurable outcomes.
        </p>
      </div>

      {/* Tab Selection */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setSelectedTab('strengths')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              selectedTab === 'strengths'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Demonstrated Strengths
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('improvements')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              selectedTab === 'improvements'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Improvement Areas
            </div>
          </button>
        </div>
      </div>

      {/* Strengths Section */}
      {selectedTab === 'strengths' && (
        <div className="space-y-6">
          {strengths.map((strength, index) => (
            <div key={index} className="card border-green-200 bg-green-50">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-2">{strength.title}</h3>
                  <p className="text-green-800 mb-4">{strength.description}</p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-green-900 mb-2">Supporting Evidence</h4>
                      <ul className="space-y-2">
                        {strength.evidence.map((evidence, evidenceIndex) => (
                          <li
                            key={evidenceIndex}
                            className="text-sm text-green-700 flex items-start gap-2"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {evidence}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900 mb-2">Measurable Impact</h4>
                      <p className="text-sm text-green-700 bg-green-100 p-3 rounded-lg">
                        {strength.impact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Improvement Areas Section */}
      {selectedTab === 'improvements' && (
        <div className="space-y-6">
          {improvementAreas.map((area, index) => (
            <div key={index} className="card">
              <button
                onClick={() => setExpandedItem(expandedItem === area.title ? null : area.title)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{area.title}</h3>
                      <ArrowRight
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedItem === area.title ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                    <p className="text-gray-700 mt-2">{area.description}</p>
                  </div>
                </div>
              </button>

              {expandedItem === area.title && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  {/* Specific Examples */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      Specific Examples
                    </h4>
                    <ul className="space-y-2">
                      {area.specificExamples.map((example, exampleIndex) => (
                        <li
                          key={exampleIndex}
                          className="text-sm text-gray-600 flex items-start gap-2"
                        >
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvement Plan */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Concrete Improvement Plan
                    </h4>
                    <div className="space-y-4">
                      {area.improvementPlan.map((plan, planIndex) => (
                        <div key={planIndex} className="bg-blue-50 p-4 rounded-lg">
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-blue-900">Action:</span>
                              <p className="text-blue-800 mt-1">{plan.action}</p>
                            </div>
                            <div>
                              <span className="font-medium text-blue-900">Timeline:</span>
                              <p className="text-blue-800 mt-1">{plan.timeline}</p>
                            </div>
                            <div>
                              <span className="font-medium text-blue-900">Measurable Outcome:</span>
                              <p className="text-blue-800 mt-1">{plan.measurableOutcome}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <ArrowRight className="w-5 h-5 text-green-600" />
                      Immediate Next Steps
                    </h4>
                    <ul className="space-y-2">
                      {area.nextSteps.map((step, stepIndex) => (
                        <li
                          key={stepIndex}
                          className="text-sm text-gray-600 flex items-start gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <div className="text-center">
          <h3 className="heading-md mb-4">Professional Development Commitment</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-3">Strengths to Leverage</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Systematic problem-solving approach with evidence-based solutions
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Pragmatic engineering decisions balancing sophistication with practicality
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Cross-domain technical expertise enabling innovative solutions
                </li>
              </ul>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-3">Growth Focus Areas</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Earlier stakeholder engagement with systematic mapping
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Better change isolation and incremental validation practices
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Enhanced documentation and knowledge transfer processes
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
