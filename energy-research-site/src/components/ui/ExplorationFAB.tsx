import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Compass, X } from 'lucide-react'
import { ExplorationDashboard } from './ExplorationDashboard'
import { useProgressTracking } from '../../hooks/useProgressTracking'
import {
  keyboardNavigation,
  focusManagement,
  announceToScreenReader,
} from '../../utils/accessibility'

export function ExplorationFAB() {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false)
  const { progress } = useProgressTracking()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Show notification dot if there are new achievements or suggestions
  const hasNotifications =
    progress.achievementsUnlocked.length > 0 || progress.sectionsVisited.length > 0

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isDashboardOpen) {
        keyboardNavigation.handleEscape(event, () => {
          setIsDashboardOpen(false)
          // Restore focus to FAB button
          buttonRef.current?.focus()
        })
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDashboardOpen])

  // Focus management when dashboard opens/closes
  useEffect(() => {
    if (isDashboardOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement
      // Announce dashboard opening
      announceToScreenReader('Exploration dashboard opened')
    } else if (previousFocusRef.current) {
      // Restore focus when closing
      focusManagement.restoreFocus(previousFocusRef.current)
      previousFocusRef.current = null
    }
  }, [isDashboardOpen])

  const toggleDashboard = () => {
    setIsDashboardOpen(!isDashboardOpen)

    if (!isDashboardOpen) {
      announceToScreenReader('Opening exploration dashboard with your progress and suggestions')
    } else {
      announceToScreenReader('Closing exploration dashboard')
    }
  }

  return (
    <>
      <motion.button
        ref={buttonRef}
        onClick={toggleDashboard}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-200 z-30 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
          isDashboardOpen
            ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300'
            : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300'
        } text-white`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={
          isDashboardOpen
            ? 'Close exploration dashboard'
            : hasNotifications
              ? 'Open exploration dashboard - you have new achievements and suggestions'
              : 'Open exploration dashboard'
        }
        aria-expanded={isDashboardOpen}
        aria-controls="exploration-dashboard"
        aria-describedby={hasNotifications ? 'fab-notifications' : undefined}
      >
        <motion.div
          animate={{ rotate: isDashboardOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center w-full h-full"
          aria-hidden="true"
        >
          {isDashboardOpen ? <X size={24} /> : <Compass size={24} />}
        </motion.div>

        {/* Notification dot with screen reader description */}
        {hasNotifications && !isDashboardOpen && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"
              aria-hidden="true"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-full h-full bg-yellow-400 rounded-full"
              />
            </motion.div>
            <span id="fab-notifications" className="sr-only">
              You have {progress.achievementsUnlocked.length} new achievements and suggestions
              available
            </span>
          </>
        )}
      </motion.button>

      <ExplorationDashboard isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} />
    </>
  )
}
