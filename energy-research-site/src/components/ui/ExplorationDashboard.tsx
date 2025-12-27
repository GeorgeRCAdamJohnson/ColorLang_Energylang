import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Map, TrendingUp, Compass } from 'lucide-react'
import { SectionProgress } from './SectionProgress'
import { ContentSuggestions } from './ContentSuggestions'
import { MilestoneTracker } from './MilestoneTracker'
import { useProgressTracking } from '../../hooks/useProgressTracking'
import {
  focusManagement,
  keyboardNavigation,
  announceToScreenReader,
} from '../../utils/accessibility'

interface ExplorationDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export function ExplorationDashboard({ isOpen, onClose }: ExplorationDashboardProps) {
  const [activeTab, setActiveTab] = useState<'progress' | 'suggestions' | 'milestones'>('progress')
  const { progress } = useProgressTracking()
  const dashboardRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_focusedTabIndex, _setFocusedTabIndex] = useState(0)

  const tabs = useMemo(
    () => [
      {
        id: 'progress' as const,
        label: 'Progress',
        icon: <Map size={16} />,
        count: progress.sectionsVisited.length,
        description: `${progress.sectionsVisited.length} sections visited`,
      },
      {
        id: 'suggestions' as const,
        label: 'Suggestions',
        icon: <Compass size={16} />,
        count: null,
        description: 'Personalized content recommendations',
      },
      {
        id: 'milestones' as const,
        label: 'Milestones',
        icon: <TrendingUp size={16} />,
        count: progress.achievementsUnlocked.length,
        description: `${progress.achievementsUnlocked.length} achievements unlocked`,
      },
    ],
    [progress.sectionsVisited.length, progress.achievementsUnlocked.length]
  )

  // Focus management and keyboard navigation
  useEffect(() => {
    if (isOpen && dashboardRef.current) {
      // Focus the first tab when dashboard opens
      const firstTab = tabRefs.current[0]
      if (firstTab) {
        firstTab.focus()
        announceToScreenReader(`Exploration dashboard opened. ${tabs[0].description}`)
      }

      // Set up focus trap
      const cleanup = focusManagement.trapFocus(dashboardRef.current)
      return cleanup
    }
  }, [isOpen, tabs])

  // Handle keyboard navigation for tabs
  const handleTabKeyDown = (event: KeyboardEvent, index: number) => {
    const tabElements = tabRefs.current.filter(Boolean) as HTMLButtonElement[]

    keyboardNavigation.handleArrowKeys(event, tabElements, index, newIndex => {
      _setFocusedTabIndex(newIndex)
      const newTab = tabs[newIndex]
      setActiveTab(newTab.id)
      announceToScreenReader(`${newTab.label} tab selected. ${newTab.description}`)
    })

    // Handle Enter and Space to activate tab
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const tab = tabs[index]
      setActiveTab(tab.id)
      announceToScreenReader(`${tab.label} tab activated. ${tab.description}`)
    }
  }

  const handleTabClick = (tab: (typeof tabs)[0], index: number) => {
    setActiveTab(tab.id)
    _setFocusedTabIndex(index)
    announceToScreenReader(`${tab.label} tab selected. ${tab.description}`)
  }

  const handleClose = () => {
    announceToScreenReader('Exploration dashboard closed')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Dashboard Panel */}
          <motion.div
            ref={dashboardRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-title"
            aria-describedby="dashboard-description"
            id="exploration-dashboard"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 id="dashboard-title" className="text-xl font-semibold text-gray-900">
                  Exploration Dashboard
                </h2>
                <p id="dashboard-description" className="text-sm text-gray-600 mt-1">
                  Track your progress and discover new content
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-1"
                aria-label="Close exploration dashboard"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div
              className="flex border-b border-gray-200"
              role="tablist"
              aria-label="Dashboard sections"
            >
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  ref={el => (tabRefs.current[index] = el)}
                  onClick={() => handleTabClick(tab, index)}
                  onKeyDown={e => handleTabKeyDown(e.nativeEvent, index)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  aria-describedby={`tab-desc-${tab.id}`}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      aria-label={`${tab.count} items`}
                    >
                      {tab.count}
                    </span>
                  )}
                  <span id={`tab-desc-${tab.id}`} className="sr-only">
                    {tab.description}
                  </span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'progress' && (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    role="tabpanel"
                    id="panel-progress"
                    aria-labelledby="tab-progress"
                    className="p-6"
                  >
                    <SectionProgress showLabels={true} />
                  </motion.div>
                )}

                {activeTab === 'suggestions' && (
                  <motion.div
                    key="suggestions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    role="tabpanel"
                    id="panel-suggestions"
                    aria-labelledby="tab-suggestions"
                    className="p-6"
                  >
                    <ContentSuggestions maxSuggestions={4} />
                  </motion.div>
                )}

                {activeTab === 'milestones' && (
                  <motion.div
                    key="milestones"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    role="tabpanel"
                    id="panel-milestones"
                    aria-labelledby="tab-milestones"
                    className="p-6"
                  >
                    <MilestoneTracker />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-center">
                <p className="text-xs text-gray-600">
                  Keep exploring to unlock more content and achievements!
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
