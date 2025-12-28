import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, HelpCircle, Shield, X, ChevronUp } from 'lucide-react'
import { UnifiedDashboard } from './UnifiedDashboard'
import { useProgressTracking } from '../../hooks/useProgressTracking'
import { useLocation } from 'react-router-dom'

interface UnifiedFABProps {
  isAdmin?: boolean
}

export function UnifiedFAB({ isAdmin = false }: UnifiedFABProps) {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [dashboardMode, setDashboardMode] = useState<'exploration' | 'colorlang' | 'security'>(
    'exploration'
  )
  const { progress } = useProgressTracking()
  const location = useLocation()

  // Determine if we're on ColorLang page
  const isColorLangPage = location.pathname === '/colorlang'

  // Show security option for admins or in development
  const showSecurity = isAdmin || process.env.NODE_ENV === 'development'

  // Auto-collapse when dashboard opens
  useEffect(() => {
    if (isDashboardOpen) {
      setIsExpanded(false)
    }
  }, [isDashboardOpen])

  // Keyboard shortcut to toggle dashboard
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Shift+D for dashboard
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault()
        setIsDashboardOpen(!isDashboardOpen)
      }
      // Ctrl+Shift+H for ColorLang help (when on ColorLang page)
      if (event.ctrlKey && event.shiftKey && event.key === 'H' && isColorLangPage) {
        event.preventDefault()
        setDashboardMode('colorlang')
        setIsDashboardOpen(true)
      }
      // Ctrl+Shift+S for security (when available)
      if (event.ctrlKey && event.shiftKey && event.key === 'S' && showSecurity) {
        event.preventDefault()
        setDashboardMode('security')
        setIsDashboardOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDashboardOpen, isColorLangPage, showSecurity])

  const openDashboard = (mode: 'exploration' | 'colorlang' | 'security') => {
    setDashboardMode(mode)
    setIsDashboardOpen(true)
    setIsExpanded(false)
  }

  const fabButtons = [
    {
      id: 'exploration',
      icon: <Compass size={20} />,
      label: 'Exploration Dashboard',
      description: 'Track progress and discover content',
      color: 'bg-blue-600 hover:bg-blue-700',
      shortcut: 'Ctrl+Shift+D',
      show: true,
      badge: progress.sectionsVisited.length > 0 ? progress.sectionsVisited.length : null,
    },
    {
      id: 'colorlang',
      icon: <HelpCircle size={20} />,
      label: 'ColorLang Help',
      description: 'Quick reference and programming guide',
      color: 'bg-purple-600 hover:bg-purple-700',
      shortcut: 'Ctrl+Shift+H',
      show: isColorLangPage,
      badge: null,
    },
    {
      id: 'security',
      icon: <Shield size={20} />,
      label: 'Security Monitor',
      description: 'Security status and monitoring',
      color: 'bg-red-600 hover:bg-red-700',
      shortcut: 'Ctrl+Shift+S',
      show: showSecurity,
      badge: null,
    },
  ].filter(button => button.show)

  const primaryButton = fabButtons.find(b => b.id === 'exploration') || fabButtons[0]

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {/* Expanded Action Buttons */}
          {isExpanded && fabButtons.length > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-16 right-0 space-y-3"
            >
              {fabButtons
                .slice(1)
                .reverse()
                .map((button, index) => (
                  <motion.div
                    key={button.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    {/* Label */}
                    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
                      <div className="font-medium">{button.label}</div>
                      <div className="text-xs text-gray-300">{button.shortcut}</div>
                    </div>

                    {/* Button */}
                    <motion.button
                      onClick={() => openDashboard('exploration')}
                      className={`${button.color} text-white p-3 rounded-full shadow-lg transition-colors relative`}
                      title={`${button.label} (${button.shortcut})`}
                      aria-label={button.description}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {button.icon}
                      {button.badge && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                          {button.badge}
                        </span>
                      )}
                    </motion.button>
                  </motion.div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={() => {
            if (fabButtons.length === 1) {
              openDashboard('exploration')
            } else {
              setIsExpanded(!isExpanded)
            }
          }}
          className={`${primaryButton.color} text-white p-4 rounded-full shadow-lg transition-colors relative`}
          title={
            fabButtons.length === 1
              ? `${primaryButton.label} (${primaryButton.shortcut})`
              : isExpanded
                ? 'Close menu'
                : 'Open dashboard menu'
          }
          aria-label={
            fabButtons.length === 1
              ? primaryButton.description
              : isExpanded
                ? 'Close dashboard menu'
                : 'Open dashboard menu'
          }
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.div>
            ) : fabButtons.length > 1 ? (
              <motion.div
                key="menu"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <ChevronUp size={24} />
                {/* Activity indicator */}
                {progress.sectionsVisited.length > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="single"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {primaryButton.icon}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Badge for primary button */}
          {primaryButton.badge && !isExpanded && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {primaryButton.badge}
            </span>
          )}
        </motion.button>

        {/* Keyboard shortcuts hint */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-0 right-20 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg"
          >
            <div className="font-medium mb-1">Keyboard Shortcuts:</div>
            {fabButtons.map(button => (
              <div key={button.id} className="text-gray-300">
                {button.shortcut} - {button.label}
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Unified Dashboard */}
      <UnifiedDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        showColorLangHelp={dashboardMode === 'colorlang'}
        isAdmin={isAdmin}
      />
    </>
  )
}
