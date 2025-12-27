import { useProgressTracking } from '../../hooks/useProgressTracking'
import { CheckCircle, Circle, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface Milestone {
  id: string
  title: string
  description: string
  requirement: {
    type: 'sections' | 'interactions' | 'achievements'
    count: number
  }
}

const milestones: Milestone[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Visit your first section',
    requirement: { type: 'sections', count: 1 },
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Visit 3 different sections',
    requirement: { type: 'sections', count: 3 },
  },
  {
    id: 'interactive',
    title: 'Interactive Explorer',
    description: 'Engage with 5 interactive elements',
    requirement: { type: 'interactions', count: 5 },
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Explore all sections',
    requirement: { type: 'sections', count: 7 },
  },
  {
    id: 'power-user',
    title: 'Power User',
    description: 'Master all interactive features',
    requirement: { type: 'interactions', count: 10 },
  },
]

interface MilestoneTrackerProps {
  compact?: boolean
  className?: string
}

export function MilestoneTracker({ compact = false, className = '' }: MilestoneTrackerProps) {
  const { progress } = useProgressTracking()

  const getMilestoneProgress = (milestone: Milestone) => {
    const { type, count } = milestone.requirement
    let current = 0

    switch (type) {
      case 'sections':
        current = progress.sectionsVisited.length
        break
      case 'interactions':
        current = progress.interactionsCompleted.length
        break
      case 'achievements':
        current = progress.achievementsUnlocked.length
        break
    }

    const isCompleted = current >= count
    const progressPercentage = Math.min((current / count) * 100, 100)

    return { current, isCompleted, progressPercentage }
  }

  if (compact) {
    const completedMilestones = milestones.filter(
      milestone => getMilestoneProgress(milestone).isCompleted
    ).length

    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Star className="text-yellow-500" size={16} />
        <span className="text-sm text-gray-600">
          {completedMilestones}/{milestones.length} milestones
        </span>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Exploration Progress</h3>
      {milestones.map(milestone => {
        const { current, isCompleted, progressPercentage } = getMilestoneProgress(milestone)

        return (
          <motion.div
            key={milestone.id}
            className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex-shrink-0">
              {isCompleted ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <Circle className="text-gray-400" size={20} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4
                  className={`text-sm font-medium ${
                    isCompleted ? 'text-green-700' : 'text-gray-900'
                  }`}
                >
                  {milestone.title}
                </h4>
                <span className="text-xs text-gray-500">
                  {current}/{milestone.requirement.count}
                </span>
              </div>

              <p className="text-xs text-gray-600 mb-2">{milestone.description}</p>

              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <motion.div
                  className={`h-1.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
