import React from 'react'
import { AIMethodologyShowcase } from './AIMethodologyShowcase'
import { VerificationWorkflows } from './VerificationWorkflows'
import { DomainSpecificAI } from './DomainSpecificAI'
import { Brain, Target, CheckCircle, Lightbulb } from 'lucide-react'

interface ShowcaseSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  component: React.ComponentType
}

const showcaseSections: ShowcaseSection[] = [
  {
    id: 'methodology',
    title: 'AI Development Methodology',
    description: 'Core principles and systematic approach to AI collaboration',
    icon: <Target className="w-6 h-6" />,
    component: AIMethodologyShowcase,
  },
  {
    id: 'verification',
    title: 'Rigorous Verification Workflows',
    description: 'Three-layer verification with real before/after examples',
    icon: <CheckCircle className="w-6 h-6" />,
    component: VerificationWorkflows,
  },
  {
    id: 'domain-specific',
    title: 'Domain-Specific Applications',
    description: 'Tailored AI assistance for energy measurement and visual programming',
    icon: <Brain className="w-6 h-6" />,
    component: DomainSpecificAI,
  },
]

export function AICollaborationShowcase() {
  return (
    <div className="space-y-16">
      {/* Introduction */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
            <Lightbulb className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <h1 className="heading-xl mb-6">AI Collaboration Showcase</h1>
        <p className="text-body-lg max-w-4xl mx-auto mb-8">
          Our research projects demonstrate sophisticated AI-assisted development that goes far
          beyond simple code generation. We developed and applied a rigorous methodology that
          combines systematic verification, multi-perspective analysis, and domain-specific
          expertise to achieve breakthrough results in both energy efficiency research and visual
          programming innovation.
        </p>

        {/* Key Achievements */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">5 Languages</div>
            <p className="text-sm text-blue-800">
              Cross-language benchmark implementations with AI assistance
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">99.9%</div>
            <p className="text-sm text-green-800">
              Measurement reliability through AI-designed protocols
            </p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">6 Instructions</div>
            <p className="text-sm text-purple-800">
              Visual programming language with AI-designed HSV mapping
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap justify-center gap-4">
        {showcaseSections.map(section => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all group"
          >
            <div className="text-primary group-hover:scale-110 transition-transform">
              {section.icon}
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">{section.title}</div>
              <div className="text-sm text-gray-600">{section.description}</div>
            </div>
          </a>
        ))}
      </div>

      {/* Sections */}
      {showcaseSections.map(section => (
        <section key={section.id} id={section.id} className="scroll-mt-20">
          <section.component />
        </section>
      ))}

      {/* Conclusion */}
      <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <div className="text-center">
          <h2 className="heading-lg mb-4">Key Takeaways for AI Collaboration</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-3">What Worked Exceptionally Well</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Multi-persona reviews surfaced critical blind spots early
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Three-layer verification caught AI hallucinations and edge cases
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Domain-specific AI assistance accelerated complex implementations
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  "Begin with the End in Mind" prevented scope creep and iteration loops
                </li>
              </ul>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Critical Success Factors</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Human judgment reserved for architectural and strategic decisions
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  AI used for boilerplate, humans for creative problem-solving
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Systematic documentation enabled reproducible collaboration patterns
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Evidence-based decision making with comprehensive research validation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
