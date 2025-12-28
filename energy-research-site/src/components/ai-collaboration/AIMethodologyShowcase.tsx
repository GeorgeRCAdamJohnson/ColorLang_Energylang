import React, { useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Users,
  Target,
  Shield,
  Zap,
} from 'lucide-react'

interface MethodologyPrinciple {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  examples: string[]
  benefits: string[]
}

interface PersonaExample {
  persona: string
  focus: string
  questions: string[]
  realExample: {
    context: string
    analysis: string
    outcome: string
  }
}

const methodologyPrinciples: MethodologyPrinciple[] = [
  {
    id: 'end-in-mind',
    title: 'Begin with the End in Mind',
    description: 'Define success criteria and user outcomes before starting any AI collaboration',
    icon: <Target className="w-6 h-6" />,
    examples: [
      'Defined "C++ 6x more efficient" as measurable success metric before benchmarking',
      'Established ColorLang interpreter success criteria: execute 6 example programs correctly',
      'Set performance targets: <2s page load, 95+ Lighthouse score before building website',
    ],
    benefits: [
      'Prevents scope creep and endless iteration',
      'Enables objective evaluation of AI suggestions',
      'Maintains focus on user value throughout development',
    ],
  },
  {
    id: 'avoid-sprawl',
    title: 'Avoid Sprawl',
    description: 'Single feature focus with clear scope boundaries and iterative refinement',
    icon: <Zap className="w-6 h-6" />,
    examples: [
      'Implemented energy measurement harness one component at a time',
      'Built ColorLang interpreter instruction by instruction with tests',
      'Added website features incrementally: navigation → charts → interactivity',
    ],
    benefits: [
      'Reduces complexity and debugging difficulty',
      'Enables faster feedback loops and validation',
      'Maintains code quality through focused attention',
    ],
  },
  {
    id: 'apply-rigor',
    title: 'Apply Rigor',
    description: 'Three-layer verification: automated testing, code review, user validation',
    icon: <CheckCircle className="w-6 h-6" />,
    examples: [
      'Every AI-generated benchmark had unit tests + integration tests + manual verification',
      'ColorLang interpreter: property-based tests + example validation + visual confirmation',
      'Website components: Jest tests + accessibility audits + user journey testing',
    ],
    benefits: [
      'Catches AI hallucinations and edge cases early',
      'Builds confidence in AI-assisted code quality',
      'Creates reproducible quality standards',
    ],
  },
  {
    id: 'challenge-self',
    title: 'Challenge Self',
    description: "Multi-persona reviews and devil's advocate questioning before decisions",
    icon: <AlertCircle className="w-6 h-6" />,
    examples: [
      'Used security persona to identify hyperscaler privacy risks',
      'Applied ops persona to surface deployment complexity concerns',
      'Employed business persona to evaluate adoption barriers',
    ],
    benefits: [
      'Surfaces blind spots and hidden assumptions',
      'Generates alternative approaches and solutions',
      'Improves decision quality through diverse perspectives',
    ],
  },
]

const personaExamples: PersonaExample[] = [
  {
    persona: 'Security Engineer',
    focus: 'Privacy and data protection implications',
    questions: [
      'What data would we be collecting from user systems?',
      'How would we handle sensitive performance metrics?',
      'What are the legal implications of system monitoring?',
    ],
    realExample: {
      context: 'Evaluating hyperscaler energy monitoring approach',
      analysis:
        'Identified significant privacy concerns with collecting detailed system telemetry, potential GDPR violations, and user trust issues',
      outcome: 'Pivoted to developer-focused tools with explicit opt-in and local processing',
    },
  },
  {
    persona: 'Operations Engineer',
    focus: 'Deployment complexity and maintenance overhead',
    questions: [
      'How would this scale across different cloud providers?',
      'What are the operational dependencies and failure modes?',
      'How would we handle version compatibility and updates?',
    ],
    realExample: {
      context: 'Assessing cloud-native energy monitoring deployment',
      analysis:
        'Revealed complex multi-cloud orchestration requirements, significant operational overhead, and vendor lock-in risks',
      outcome: 'Focused on simpler, self-contained tools with minimal dependencies',
    },
  },
  {
    persona: 'Product Manager',
    focus: 'Market fit and user adoption barriers',
    questions: [
      'Who would actually use this and why?',
      'What are the switching costs and integration friction?',
      'How does this compare to existing developer workflows?',
    ],
    realExample: {
      context: 'Evaluating EnergyLang adoption strategy',
      analysis:
        'Discovered that developers prioritize immediate productivity over long-term efficiency, need seamless integration with existing tools',
      outcome: 'Designed CI/CD integration approach with zero-friction PR suggestions',
    },
  },
]

export function AIMethodologyShowcase() {
  const [expandedPrinciple, setExpandedPrinciple] = useState<string | null>(null)
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="heading-lg mb-4">AI Development Methodology</h2>
        <p className="text-body max-w-3xl mx-auto">
          Our research projects followed a rigorous AI collaboration framework that combines
          systematic verification with multi-perspective analysis. This methodology enabled
          sophisticated technical development while maintaining quality and strategic focus.
        </p>
      </div>

      {/* Core Principles */}
      <div className="card">
        <h3 className="heading-md mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Core AI Collaboration Principles
        </h3>
        <div className="space-y-4">
          {methodologyPrinciples.map(principle => (
            <div key={principle.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() =>
                  setExpandedPrinciple(expandedPrinciple === principle.id ? null : principle.id)
                }
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-primary">{principle.icon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{principle.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{principle.description}</p>
                  </div>
                </div>
                {expandedPrinciple === principle.id ? (
                  <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                )}
              </button>

              {expandedPrinciple === principle.id && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Concrete Examples</h5>
                      <ul className="space-y-2">
                        {principle.examples.map((example, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Key Benefits</h5>
                      <ul className="space-y-2">
                        {principle.benefits.map((benefit, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <Zap className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            {benefit}
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

      {/* Multi-Persona Review Process */}
      <div className="card">
        <h3 className="heading-md mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Multi-Persona Review Process
        </h3>
        <p className="text-body mb-6">
          Each major decision was evaluated through multiple AI personas to surface blind spots and
          ensure comprehensive analysis. Here are real examples from our hyperscaler pivot decision:
        </p>

        <div className="space-y-4">
          {personaExamples.map((persona, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() =>
                  setExpandedPersona(expandedPersona === persona.persona ? null : persona.persona)
                }
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{persona.persona}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{persona.focus}</p>
                </div>
                {expandedPersona === persona.persona ? (
                  <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                )}
              </button>

              {expandedPersona === persona.persona && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="mt-4 space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Key Questions Asked</h5>
                      <ul className="space-y-1">
                        {persona.questions.map((question, qIndex) => (
                          <li key={qIndex} className="text-sm text-gray-600 dark:text-gray-400">
                            • {question}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Real Project Example</h5>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Context:</span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">{persona.realExample.context}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Analysis:</span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">{persona.realExample.analysis}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Outcome:</span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">{persona.realExample.outcome}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
