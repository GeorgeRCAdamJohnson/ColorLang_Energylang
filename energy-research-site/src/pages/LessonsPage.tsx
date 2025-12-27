import { useState } from 'react'
import { AICollaborationShowcase } from '../components/ai-collaboration/AICollaborationShowcase'
import { StrategicDecisionShowcase } from '../components/strategic-decisions/StrategicDecisionShowcase'
import { Brain, Compass } from 'lucide-react'

export function LessonsPage() {
  const [activeSection, setActiveSection] = useState<'ai-collaboration' | 'strategic-decisions'>(
    'ai-collaboration'
  )

  return (
    <div className="section-padding">
      <div className="container-custom">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="heading-xl mb-6">Strategic Lessons & AI Collaboration</h1>
          <p className="text-body-lg max-w-4xl mx-auto mb-8">
            Our research projects demonstrate sophisticated approaches to both AI-assisted
            development and strategic decision-making. These lessons showcase methodologies that can
            be applied to complex technical projects across different domains.
          </p>

          {/* Section Navigation */}
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveSection('ai-collaboration')}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                  activeSection === 'ai-collaboration'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Brain className="w-5 h-5" />
                AI Collaboration Methodology
              </button>
              <button
                onClick={() => setActiveSection('strategic-decisions')}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                  activeSection === 'strategic-decisions'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Compass className="w-5 h-5" />
                Strategic Decision-Making
              </button>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-6xl mx-auto">
          {activeSection === 'ai-collaboration' && <AICollaborationShowcase />}
          {activeSection === 'strategic-decisions' && <StrategicDecisionShowcase />}
        </div>
      </div>
    </div>
  )
}
