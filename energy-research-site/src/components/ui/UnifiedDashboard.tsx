import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Map,
  TrendingUp,
  Compass,
  Shield,
  AlertTriangle,
  Eye,
  Users,
  Activity,
  Settings,
  Palette,
  Code,
  Hash,
} from 'lucide-react'
import { SectionProgress } from './SectionProgress'
import { ContentSuggestions } from './ContentSuggestions'
import { MilestoneTracker } from './MilestoneTracker'
import { useProgressTracking } from '../../hooks/useProgressTracking'
import { securityManager } from '../../utils/security'
import {
  focusManagement,
  keyboardNavigation,
  announceToScreenReader,
} from '../../utils/accessibility'

interface SecurityStatus {
  rateLimitEntries: number
  suspiciousIPs: number
  honeypotTriggers: number
  botDetected: boolean
}

interface ColorReference {
  instruction: string
  hue: number
  color: string
  description: string
  example: string
}

const colorReferences: ColorReference[] = [
  {
    instruction: 'LOAD',
    hue: 95,
    color: 'hsl(95, 80%, 70%)',
    description: 'Load value into register',
    example: 'LOAD(42)',
  },
  {
    instruction: 'ADD',
    hue: 35,
    color: 'hsl(35, 80%, 70%)',
    description: 'Add values together',
    example: 'ADD(0)',
  },
  {
    instruction: 'MUL',
    hue: 300,
    color: 'hsl(300, 80%, 70%)',
    description: 'Multiply values',
    example: 'MUL(0)',
  },
  {
    instruction: 'DIV',
    hue: 180,
    color: 'hsl(180, 80%, 70%)',
    description: 'Divide values',
    example: 'DIV(2)',
  },
  {
    instruction: 'PRINT',
    hue: 275,
    color: 'hsl(275, 80%, 70%)',
    description: 'Print to output',
    example: 'PRINT(65) → A',
  },
  {
    instruction: 'HALT',
    hue: 335,
    color: 'hsl(335, 80%, 70%)',
    description: 'Stop execution',
    example: 'HALT(0)',
  },
]

const commonAscii = [
  { char: 'A', code: 65 },
  { char: 'B', code: 66 },
  { char: 'C', code: 67 },
  { char: 'a', code: 97 },
  { char: 'b', code: 98 },
  { char: 'c', code: 99 },
  { char: 'H', code: 72 },
  { char: 'i', code: 105 },
  { char: '!', code: 33 },
  { char: 'Space', code: 32 },
  { char: '0', code: 48 },
  { char: '1', code: 49 },
]

const quickPatterns = [
  {
    name: 'Print Number',
    pattern: 'LOAD(value) → PRINT(0) → HALT(0)',
    description: 'Load a number and print it',
  },
  {
    name: 'Simple Math',
    pattern: 'LOAD(a) → LOAD(b) → ADD(0) → PRINT(0) → HALT(0)',
    description: 'Add two numbers and print result',
  },
  {
    name: 'Print Text',
    pattern: 'PRINT(ascii1) → PRINT(ascii2) → ... → HALT(0)',
    description: 'Print text using ASCII codes',
  },
]

interface UnifiedDashboardProps {
  isOpen: boolean
  onClose: () => void
  showColorLangHelp?: boolean
  isAdmin?: boolean
}

type TabType =
  | 'progress'
  | 'suggestions'
  | 'milestones'
  | 'security'
  | 'colorlang-colors'
  | 'colorlang-ascii'
  | 'colorlang-patterns'

export function UnifiedDashboard({
  isOpen,
  onClose,
  showColorLangHelp = false,
  isAdmin = false,
}: UnifiedDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('progress')
  const { progress } = useProgressTracking()
  const dashboardRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    rateLimitEntries: 0,
    suspiciousIPs: 0,
    honeypotTriggers: 0,
    botDetected: false,
  })
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Update security status periodically
  useEffect(() => {
    if (!isAdmin && process.env.NODE_ENV === 'production') return

    const updateStatus = () => {
      const status = securityManager.getSecurityStatus() as SecurityStatus
      setSecurityStatus(status)
      setLastUpdate(new Date())
    }

    updateStatus()
    const interval = setInterval(updateStatus, 30000)
    return () => clearInterval(interval)
  }, [isAdmin])

  // Set initial tab based on context
  useEffect(() => {
    if (showColorLangHelp) {
      setActiveTab('colorlang-colors')
    } else {
      setActiveTab('progress')
    }
  }, [showColorLangHelp, isOpen])

  const tabs = useMemo(() => {
    const baseTabs: Array<{
      id: TabType
      label: string
      icon: React.ReactElement
      count: number | null
      description: string
      category: string
    }> = [
      {
        id: 'progress' as const,
        label: 'Progress',
        icon: <Map size={16} />,
        count: progress.sectionsVisited.length,
        description: `${progress.sectionsVisited.length} sections visited`,
        category: 'exploration',
      },
      {
        id: 'suggestions' as const,
        label: 'Suggestions',
        icon: <Compass size={16} />,
        count: null,
        description: 'Personalized content recommendations',
        category: 'exploration',
      },
      {
        id: 'milestones' as const,
        label: 'Milestones',
        icon: <TrendingUp size={16} />,
        count: progress.achievementsUnlocked.length,
        description: `${progress.achievementsUnlocked.length} achievements unlocked`,
        category: 'exploration',
      },
    ]

    // Add security tab for admins or development
    if (isAdmin || process.env.NODE_ENV === 'development') {
      baseTabs.push({
        id: 'security' as const,
        label: 'Security',
        icon: <Shield size={16} />,
        count:
          securityStatus.rateLimitEntries +
          securityStatus.suspiciousIPs +
          securityStatus.honeypotTriggers,
        description: 'Security monitoring and status',
        category: 'admin',
      })
    }

    // Add ColorLang help tabs when needed
    if (showColorLangHelp) {
      baseTabs.push(
        {
          id: 'colorlang-colors' as const,
          label: 'Colors',
          icon: <Palette size={16} />,
          count: null,
          description: 'ColorLang instruction color codes',
          category: 'colorlang',
        },
        {
          id: 'colorlang-ascii' as const,
          label: 'ASCII',
          icon: <Hash size={16} />,
          count: null,
          description: 'ASCII character codes for text output',
          category: 'colorlang',
        },
        {
          id: 'colorlang-patterns' as const,
          label: 'Patterns',
          icon: <Code size={16} />,
          count: null,
          description: 'Common programming patterns',
          category: 'colorlang',
        }
      )
    }

    return baseTabs
  }, [
    progress.sectionsVisited.length,
    progress.achievementsUnlocked.length,
    showColorLangHelp,
    isAdmin,
    securityStatus,
  ])

  // Focus management and keyboard navigation
  useEffect(() => {
    if (isOpen && dashboardRef.current) {
      const firstTab = tabRefs.current[0]
      if (firstTab) {
        firstTab.focus()
        announceToScreenReader(`Unified dashboard opened. ${tabs[0].description}`)
      }

      const cleanup = focusManagement.trapFocus(dashboardRef.current)
      return cleanup
    }
  }, [isOpen, tabs])

  const handleTabKeyDown = (event: KeyboardEvent, index: number) => {
    const tabElements = tabRefs.current.filter(Boolean) as HTMLButtonElement[]

    keyboardNavigation.handleArrowKeys(event, tabElements, index, newIndex => {
      const newTab = tabs[newIndex]
      setActiveTab(newTab.id)
      announceToScreenReader(`${newTab.label} tab selected. ${newTab.description}`)
    })

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const tab = tabs[index]
      setActiveTab(tab.id)
      announceToScreenReader(`${tab.label} tab activated. ${tab.description}`)
    }
  }

  const handleTabClick = (tab: (typeof tabs)[0]) => {
    setActiveTab(tab.id)
    announceToScreenReader(`${tab.label} tab selected. ${tab.description}`)
  }

  const handleClose = () => {
    announceToScreenReader('Dashboard closed')
    onClose()
  }

  const getStatusColor = (value: number, threshold: number) => {
    if (value === 0) return 'text-green-600 dark:text-green-400'
    if (value < threshold) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getStatusBg = (value: number, threshold: number) => {
    if (value === 0)
      return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
    if (value < threshold)
      return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700'
    return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
  }

  // Group tabs by category for better organization (currently unused)
  // const tabsByCategory = tabs.reduce((acc, tab) => {
  //   if (!acc[tab.category]) acc[tab.category] = []
  //   acc[tab.category].push(tab)
  //   return acc
  // }, {} as Record<string, typeof tabs>)

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
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-title"
            aria-describedby="dashboard-description"
            id="unified-dashboard"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2
                  id="dashboard-title"
                  className="text-xl font-semibold text-gray-900 dark:text-gray-100"
                >
                  {showColorLangHelp ? 'ColorLang Reference' : 'Exploration Dashboard'}
                </h2>
                <p
                  id="dashboard-description"
                  className="text-sm text-gray-600 dark:text-gray-400 mt-1"
                >
                  {showColorLangHelp
                    ? 'Quick reference for ColorLang programming'
                    : 'Track your progress and discover new content'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-1"
                aria-label="Close dashboard"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs - Scrollable for many tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              <div className="flex min-w-max" role="tablist" aria-label="Dashboard sections">
                {tabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    ref={el => (tabRefs.current[index] = el)}
                    onClick={() => handleTabClick(tab)}
                    onKeyDown={e => handleTabKeyDown(e.nativeEvent, index)}
                    className={`flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
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
                    {tab.count !== null && tab.count > 0 && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          activeTab === tab.id
                            ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
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
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* Exploration Tabs */}
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

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    role="tabpanel"
                    id="panel-security"
                    aria-labelledby="tab-security"
                    className="p-6"
                  >
                    {/* Security Status Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div
                        className={`p-3 rounded-lg border ${getStatusBg(securityStatus.rateLimitEntries, 5)}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Rate Limited
                          </span>
                        </div>
                        <div
                          className={`text-lg font-bold ${getStatusColor(securityStatus.rateLimitEntries, 5)}`}
                        >
                          {securityStatus.rateLimitEntries}
                        </div>
                      </div>

                      <div
                        className={`p-3 rounded-lg border ${getStatusBg(securityStatus.suspiciousIPs, 3)}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Suspicious
                          </span>
                        </div>
                        <div
                          className={`text-lg font-bold ${getStatusColor(securityStatus.suspiciousIPs, 3)}`}
                        >
                          {securityStatus.suspiciousIPs}
                        </div>
                      </div>

                      <div
                        className={`p-3 rounded-lg border ${getStatusBg(securityStatus.honeypotTriggers, 1)}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Honeypots
                          </span>
                        </div>
                        <div
                          className={`text-lg font-bold ${getStatusColor(securityStatus.honeypotTriggers, 1)}`}
                        >
                          {securityStatus.honeypotTriggers}
                        </div>
                      </div>

                      <div
                        className={`p-3 rounded-lg border ${
                          securityStatus.botDetected
                            ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
                            : 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Bot Status
                          </span>
                        </div>
                        <div
                          className={`text-sm font-bold ${
                            securityStatus.botDetected
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}
                        >
                          {securityStatus.botDetected ? 'Detected' : 'Clean'}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Last updated: {lastUpdate.toLocaleTimeString()}
                    </div>

                    {/* Admin Controls */}
                    {isAdmin && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Admin Controls
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => console.log('Clearing security logs...')}
                            className="px-3 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                          >
                            Clear Logs
                          </button>
                          <button
                            onClick={() => console.log('Exporting security data...')}
                            className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            Export Data
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Security Tips */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <div className="font-medium mb-1">Security Features Active:</div>
                        <ul className="space-y-1">
                          <li>• Rate limiting and bot detection</li>
                          <li>• Content protection and anti-scraping</li>
                          <li>• Honeypot fields for automated detection</li>
                          <li>• Suspicious activity monitoring</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ColorLang Color Codes Tab */}
                {activeTab === 'colorlang-colors' && (
                  <motion.div
                    key="colorlang-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    role="tabpanel"
                    id="panel-colorlang-colors"
                    aria-labelledby="tab-colorlang-colors"
                    className="p-6"
                  >
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Common instruction colors with standard saturation (80%) and value (70%)
                      </p>
                      {colorReferences.map((ref, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 border border-gray-200 dark:border-gray-700 rounded"
                        >
                          <div
                            className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded"
                            style={{ backgroundColor: ref.color }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-sm text-gray-900 dark:text-gray-100">
                                {ref.instruction}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({ref.hue}°)
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {ref.description}
                            </div>
                          </div>
                          <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-gray-100">
                            {ref.example}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ColorLang ASCII Tab */}
                {activeTab === 'colorlang-ascii' && (
                  <motion.div
                    key="colorlang-ascii"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    role="tabpanel"
                    id="panel-colorlang-ascii"
                    aria-labelledby="tab-colorlang-ascii"
                    className="p-6"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Common ASCII character codes for text output
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {commonAscii.map((ascii, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded"
                        >
                          <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                            {ascii.char === 'Space' ? '␣' : ascii.char}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {ascii.code}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded">
                      <div className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Tip:</strong> Use PRINT(ascii_code) to output characters. For
                        example, PRINT(72) outputs "H".
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ColorLang Patterns Tab */}
                {activeTab === 'colorlang-patterns' && (
                  <motion.div
                    key="colorlang-patterns"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    role="tabpanel"
                    id="panel-colorlang-patterns"
                    aria-labelledby="tab-colorlang-patterns"
                    className="p-6"
                  >
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Common programming patterns to get you started
                      </p>
                      {quickPatterns.map((pattern, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 dark:border-gray-700 rounded p-3"
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {pattern.name}
                          </h4>
                          <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded mb-2 text-gray-900 dark:text-gray-100">
                            {pattern.pattern}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {pattern.description}
                          </p>
                        </div>
                      ))}
                      <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded">
                        <div className="text-sm text-green-800 dark:text-green-300">
                          <strong>Remember:</strong> Always end your programs with HALT(0) to
                          prevent undefined behavior. Use data=0 in operations to work with register
                          values.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {showColorLangHelp
                    ? 'Use these references to build your ColorLang programs!'
                    : 'Keep exploring to unlock more content and achievements!'}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
