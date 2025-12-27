import { useProgressTracking } from '../../hooks/useProgressTracking'
import { ArrowRight, Sparkles, Target, Zap } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

interface Suggestion {
  id: string
  title: string
  description: string
  path: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  icon: React.ReactNode
}

interface ContentSuggestionsProps {
  maxSuggestions?: number
  className?: string
}

export function ContentSuggestions({
  maxSuggestions = 3,
  className = '',
}: ContentSuggestionsProps) {
  const { progress } = useProgressTracking()
  const location = useLocation()

  const generateSuggestions = (): Suggestion[] => {
    const suggestions: Suggestion[] = []
    const visitedSections = progress.sectionsVisited
    const currentPath = location.pathname

    // Define suggestion logic based on user's journey
    const suggestionRules = [
      // If on home page, suggest starting with research
      {
        condition: () => currentPath === '/' && !visitedSections.includes('research'),
        suggestion: {
          id: 'start-research',
          title: 'Start with Research Methodology',
          description: 'Discover how the EnergyLang research was conducted',
          path: '/research',
          reason: 'Great starting point for understanding the project',
          priority: 'high' as const,
          icon: <Target className="text-blue-500" size={16} />,
        },
      },

      // If visited research, suggest findings
      {
        condition: () =>
          visitedSections.includes('research') && !visitedSections.includes('findings'),
        suggestion: {
          id: 'explore-findings',
          title: 'Explore Interactive Findings',
          description: 'See the benchmark results and energy efficiency data',
          path: '/findings',
          reason: 'Natural next step after understanding methodology',
          priority: 'high' as const,
          icon: <Sparkles className="text-green-500" size={16} />,
        },
      },

      // If visited findings, suggest ColorLang
      {
        condition: () =>
          visitedSections.includes('findings') && !visitedSections.includes('colorlang'),
        suggestion: {
          id: 'discover-colorlang',
          title: 'Discover ColorLang Framework',
          description: 'Experience the innovative visual programming paradigm',
          path: '/colorlang',
          reason: 'Explore the second major research project',
          priority: 'high' as const,
          icon: <Zap className="text-purple-500" size={16} />,
        },
      },

      // If visited both main projects, suggest methods
      {
        condition: () =>
          visitedSections.includes('research') &&
          visitedSections.includes('colorlang') &&
          !visitedSections.includes('methods'),
        suggestion: {
          id: 'technical-methods',
          title: 'Technical Implementation Details',
          description: 'Deep dive into the tools and techniques used',
          path: '/methods',
          reason: 'Perfect for understanding the technical depth',
          priority: 'medium' as const,
          icon: <Target className="text-indigo-500" size={16} />,
        },
      },

      // If visited technical content, suggest lessons
      {
        condition: () =>
          visitedSections.includes('methods') && !visitedSections.includes('lessons'),
        suggestion: {
          id: 'strategic-lessons',
          title: 'Strategic Lessons & AI Collaboration',
          description: 'Learn about decision-making and AI-assisted development',
          path: '/lessons',
          reason: 'Understand the strategic thinking behind the projects',
          priority: 'medium' as const,
          icon: <Sparkles className="text-yellow-500" size={16} />,
        },
      },

      // If almost complete, suggest impact
      {
        condition: () => visitedSections.length >= 4 && !visitedSections.includes('impact'),
        suggestion: {
          id: 'practical-impact',
          title: 'Practical Impact & Applications',
          description: 'See how these insights can be applied to your work',
          path: '/impact',
          reason: 'Complete your exploration journey',
          priority: 'high' as const,
          icon: <Target className="text-green-500" size={16} />,
        },
      },

      // Interactive content suggestions
      {
        condition: () =>
          progress.interactionsCompleted.length < 3 && visitedSections.includes('findings'),
        suggestion: {
          id: 'interactive-charts',
          title: 'Try Interactive Visualizations',
          description: 'Filter and explore the benchmark data charts',
          path: '/findings',
          reason: "You haven't fully explored the interactive features",
          priority: 'medium' as const,
          icon: <Sparkles className="text-blue-500" size={16} />,
        },
      },

      {
        condition: () =>
          progress.interactionsCompleted.length < 5 && visitedSections.includes('colorlang'),
        suggestion: {
          id: 'colorlang-interpreter',
          title: 'Try ColorLang Programming',
          description: 'Use the interactive interpreter and tutorials',
          path: '/colorlang',
          reason: 'Experience hands-on visual programming',
          priority: 'medium' as const,
          icon: <Zap className="text-purple-500" size={16} />,
        },
      },
    ]

    // Generate suggestions based on rules
    suggestionRules.forEach(rule => {
      if (rule.condition()) {
        suggestions.push(rule.suggestion)
      }
    })

    // Sort by priority and limit
    return suggestions
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      .slice(0, maxSuggestions)
  }

  const suggestions = generateSuggestions()

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="text-blue-500" size={18} />
        <h3 className="text-lg font-semibold text-gray-900">Suggested Next Steps</h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={suggestion.path}
              className="block p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg hover:border-blue-200 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">{suggestion.icon}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                      {suggestion.title}
                    </h4>
                    <ArrowRight
                      className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
                      size={16}
                    />
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {suggestion.reason}
                    </span>
                    {suggestion.priority === 'high' && (
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
