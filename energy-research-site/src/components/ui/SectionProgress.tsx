import { useProgressTracking } from '../../hooks/useProgressTracking'
import { navigationItems } from '../../data/navigation'
import { CheckCircle, Circle, Play } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

interface SectionProgressProps {
  compact?: boolean
  showLabels?: boolean
  className?: string
}

export function SectionProgress({
  compact = false,
  showLabels = true,
  className = '',
}: SectionProgressProps) {
  const { progress } = useProgressTracking()
  const location = useLocation()

  const getSectionStatus = (sectionId: string, path: string) => {
    const isVisited = progress.sectionsVisited.includes(sectionId)
    const isCurrent = location.pathname === path
    const hasInteractive =
      navigationItems.find(item => item.id === sectionId)?.hasInteractive || false

    return {
      isVisited,
      isCurrent,
      hasInteractive,
      isCompleted: isVisited && !isCurrent, // Consider visited sections as completed
    }
  }

  if (compact) {
    const visitedCount = progress.sectionsVisited.length
    const totalSections = navigationItems.length
    const progressPercentage = (visitedCount / totalSections) * 100

    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-sm text-gray-600">
            {visitedCount}/{totalSections}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabels && <h3 className="text-sm font-medium text-gray-900 mb-3">Section Progress</h3>}

      <div className="space-y-1">
        {navigationItems.map((item, index) => {
          const status = getSectionStatus(item.id, item.path)

          return (
            <motion.div
              key={item.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex-shrink-0">
                {status.isCurrent ? (
                  <Play className="text-blue-500" size={16} fill="currentColor" />
                ) : status.isCompleted ? (
                  <CheckCircle className="text-green-500" size={16} />
                ) : (
                  <Circle className="text-gray-400" size={16} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {status.isCurrent ? (
                  <span className="text-sm font-medium text-blue-700">{item.label}</span>
                ) : (
                  <Link
                    to={item.path}
                    className={`text-sm transition-colors ${
                      status.isCompleted
                        ? 'text-green-700 hover:text-green-800'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                )}

                {status.hasInteractive && (
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-1" />
                    <span className="text-xs text-purple-600">Interactive</span>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
