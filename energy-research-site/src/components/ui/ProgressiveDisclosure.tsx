import { useState, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Eye, Lock } from 'lucide-react'
import { useProgressTracking } from '../../hooks/useProgressTracking'

interface ProgressiveDisclosureProps {
  children: ReactNode
  title: string
  description?: string
  revealCondition: {
    type: 'sections' | 'interactions' | 'time' | 'manual'
    threshold?: number
    sections?: string[]
    interactions?: string[]
    timeMs?: number
  }
  className?: string
  defaultExpanded?: boolean
}

export function ProgressiveDisclosure({
  children,
  title,
  description,
  revealCondition,
  className = '',
  defaultExpanded = false,
}: ProgressiveDisclosureProps) {
  const { progress } = useProgressTracking()
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [isRevealed, setIsRevealed] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)

  // Check if content should be revealed based on condition
  useEffect(() => {
    const checkRevealCondition = () => {
      switch (revealCondition.type) {
        case 'sections':
          if (revealCondition.sections) {
            const hasRequiredSections = revealCondition.sections.every(section =>
              progress.sectionsVisited.includes(section)
            )
            setIsRevealed(hasRequiredSections)
          } else if (revealCondition.threshold) {
            setIsRevealed(progress.sectionsVisited.length >= revealCondition.threshold)
          }
          break

        case 'interactions':
          if (revealCondition.interactions) {
            const hasRequiredInteractions = revealCondition.interactions.every(interaction =>
              progress.interactionsCompleted.includes(interaction)
            )
            setIsRevealed(hasRequiredInteractions)
          } else if (revealCondition.threshold) {
            setIsRevealed(progress.interactionsCompleted.length >= revealCondition.threshold)
          }
          break

        case 'time':
          if (revealCondition.timeMs && timeElapsed >= revealCondition.timeMs) {
            setIsRevealed(true)
          }
          break

        case 'manual':
          setIsRevealed(true)
          break

        default:
          setIsRevealed(true)
      }
    }

    checkRevealCondition()
  }, [progress, revealCondition, timeElapsed])

  // Time tracking for time-based reveals
  useEffect(() => {
    if (revealCondition.type === 'time' && !isRevealed) {
      const interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1000)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [revealCondition.type, isRevealed])

  const getRevealStatus = () => {
    if (isRevealed) return 'revealed'

    switch (revealCondition.type) {
      case 'sections': {
        const sectionsNeeded = revealCondition.threshold || revealCondition.sections?.length || 0
        const sectionsHave = revealCondition.sections
          ? revealCondition.sections.filter(s => progress.sectionsVisited.includes(s)).length
          : progress.sectionsVisited.length
        return `${sectionsHave}/${sectionsNeeded} sections visited`
      }

      case 'interactions': {
        const interactionsNeeded =
          revealCondition.threshold || revealCondition.interactions?.length || 0
        const interactionsHave = revealCondition.interactions
          ? revealCondition.interactions.filter(i => progress.interactionsCompleted.includes(i))
              .length
          : progress.interactionsCompleted.length
        return `${interactionsHave}/${interactionsNeeded} interactions completed`
      }

      case 'time': {
        const timeNeeded = revealCondition.timeMs || 0
        const timeRemaining = Math.max(0, timeNeeded - timeElapsed)
        return `${Math.ceil(timeRemaining / 1000)}s remaining`
      }

      default:
        return 'locked'
    }
  }

  const handleToggle = () => {
    if (isRevealed) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={handleToggle}
        className={`w-full p-4 text-left transition-colors ${
          isRevealed ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50 cursor-not-allowed'
        }`}
        disabled={!isRevealed}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {isRevealed ? (
                <Eye className="text-green-500" size={20} />
              ) : (
                <Lock className="text-gray-400" size={20} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className={`text-sm font-medium ${isRevealed ? 'text-gray-900' : 'text-gray-500'}`}
              >
                {title}
              </h3>

              {description && (
                <p className={`text-xs mt-1 ${isRevealed ? 'text-gray-600' : 'text-gray-400'}`}>
                  {description}
                </p>
              )}

              {!isRevealed && (
                <p className="text-xs text-blue-600 mt-1">Unlock by: {getRevealStatus()}</p>
              )}
            </div>
          </div>

          {isRevealed && (
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="text-gray-400" size={20} />
              ) : (
                <ChevronRight className="text-gray-400" size={20} />
              )}
            </div>
          )}
        </div>
      </button>

      <AnimatePresence>
        {isRevealed && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-gray-200"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
