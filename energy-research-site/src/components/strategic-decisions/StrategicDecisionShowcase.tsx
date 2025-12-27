import React from 'react'
import { HyperscalerPivotCase } from './HyperscalerPivotCase'
import { SystematicDebugging } from './SystematicDebugging'
import { SelfAssessment } from './SelfAssessment'
import { Compass, Bug, TrendingUp, Lightbulb } from 'lucide-react'

interface ShowcaseSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  component: React.ComponentType
}

const showcaseSections: ShowcaseSection[] = [
  {
    id: 'hyperscaler-pivot',
    title: 'Hyperscaler Pivot Decision',
    description: 'Evidence-based strategic pivot with comprehensive risk analysis',
    icon: <Compass className="w-6 h-6" />,
    component: HyperscalerPivotCase,
  },
  {
    id: 'systematic-debugging',
    title: 'Systematic Debugging',
    description: 'Methodical problem-solving with pragmatic engineering decisions',
    icon: <Bug className="w-6 h-6" />,
    component: SystematicDebugging,
  },
  {
    id: 'self-assessment',
    title: 'Professional Self-Assessment',
    description: 'Honest evaluation with concrete improvement plans',
    icon: <TrendingUp className="w-6 h-6" />,
    component: SelfAssessment,
  },
]

export function StrategicDecisionShowcase() {
  return (
    <div className="space-y-16">
      {/* Introduction */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl">
            <Lightbulb className="w-12 h-12 text-purple-600" />
          </div>
        </div>
        <h1 className="heading-xl mb-6">
          Strategic Decision-Making & Project Lifecycle Management
        </h1>
        <p className="text-body-lg max-w-4xl mx-auto mb-8">
          Effective technical leadership requires more than coding skills—it demands strategic
          thinking, systematic problem-solving, and honest self-reflection. This showcase
          demonstrates evidence-based decision making, methodical debugging approaches, and
          professional growth through concrete examples from our energy efficiency and visual
          programming research projects.
        </p>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">2 Weeks</div>
            <p className="text-sm text-purple-800">
              Research time that prevented months of high-risk development
            </p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">99.9%</div>
            <p className="text-sm text-blue-800">
              Measurement reliability through systematic debugging
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">4 Areas</div>
            <p className="text-sm text-green-800">
              Concrete improvement plans with measurable outcomes
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
      <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <div className="text-center">
          <h2 className="heading-lg mb-4">Strategic Leadership Principles</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Evidence-Based Decision Making</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Compass className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  Comprehensive research before major strategic decisions
                </li>
                <li className="flex items-start gap-2">
                  <Compass className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  Multi-persona analysis to surface blind spots and risks
                </li>
                <li className="flex items-start gap-2">
                  <Compass className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  Value preservation even when pivoting approaches
                </li>
                <li className="flex items-start gap-2">
                  <Compass className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  Documentation of decision rationale for future reference
                </li>
              </ul>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Continuous Professional Growth</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Systematic problem-solving with methodical debugging
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Honest self-assessment with concrete improvement plans
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Pragmatic engineering balancing sophistication with practicality
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Measurable outcomes and accountability for growth areas
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-white rounded-lg border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-2">
              Professional Development Philosophy
            </h3>
            <p className="text-gray-700 text-sm">
              Technical excellence requires more than individual coding skills—it demands strategic
              thinking, systematic approaches to complex problems, and honest self-reflection for
              continuous improvement. These case studies demonstrate a commitment to evidence-based
              decision making, methodical problem-solving, and professional growth that enables
              effective technical leadership and successful project outcomes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
