import React, { useState, useEffect } from 'react'
import { Shield, AlertTriangle, Eye, Users, Activity, Settings } from 'lucide-react'
import { securityManager } from '../../utils/security'

interface SecurityStatus {
  rateLimitEntries: number
  suspiciousIPs: number
  honeypotTriggers: number
  botDetected: boolean
}

interface SecurityMonitorProps {
  isAdmin?: boolean
  className?: string
}

/**
 * Security monitoring component for displaying security status and controls
 * Only visible to admin users or in development mode
 */
export const SecurityMonitor: React.FC<SecurityMonitorProps> = ({
  isAdmin = false,
  className = '',
}) => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    rateLimitEntries: 0,
    suspiciousIPs: 0,
    honeypotTriggers: 0,
    botDetected: false,
  })
  const [isVisible, setIsVisible] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Update security status periodically
  useEffect(() => {
    const updateStatus = () => {
      const status = securityManager.getSecurityStatus() as SecurityStatus
      setSecurityStatus(status)
      setLastUpdate(new Date())
    }

    // Initial update
    updateStatus()

    // Update every 30 seconds
    const interval = setInterval(updateStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  // Show/hide with keyboard shortcut (Ctrl+Shift+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        event.preventDefault()
        setIsVisible(!isVisible)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible])

  // Don't render in production unless admin
  if (!isAdmin && process.env.NODE_ENV === 'production') {
    return null
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Show Security Monitor (Ctrl+Shift+S)"
        aria-label="Show security monitoring panel"
      >
        <Shield className="w-5 h-5" />
      </button>
    )
  }

  const getStatusColor = (value: number, threshold: number) => {
    if (value === 0) return 'text-green-600'
    if (value < threshold) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusBg = (value: number, threshold: number) => {
    if (value === 0) return 'bg-green-50 border-green-200'
    if (value < threshold) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div
      className={`fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm z-50 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Security Monitor</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Hide security monitor"
        >
          ×
        </button>
      </div>

      {/* Security Status Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Rate Limited IPs */}
        <div className={`p-3 rounded-lg border ${getStatusBg(securityStatus.rateLimitEntries, 5)}`}>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Rate Limited</span>
          </div>
          <div
            className={`text-lg font-bold ${getStatusColor(securityStatus.rateLimitEntries, 5)}`}
          >
            {securityStatus.rateLimitEntries}
          </div>
        </div>

        {/* Suspicious IPs */}
        <div className={`p-3 rounded-lg border ${getStatusBg(securityStatus.suspiciousIPs, 3)}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Suspicious</span>
          </div>
          <div className={`text-lg font-bold ${getStatusColor(securityStatus.suspiciousIPs, 3)}`}>
            {securityStatus.suspiciousIPs}
          </div>
        </div>

        {/* Honeypot Triggers */}
        <div className={`p-3 rounded-lg border ${getStatusBg(securityStatus.honeypotTriggers, 1)}`}>
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Honeypots</span>
          </div>
          <div
            className={`text-lg font-bold ${getStatusColor(securityStatus.honeypotTriggers, 1)}`}
          >
            {securityStatus.honeypotTriggers}
          </div>
        </div>

        {/* Bot Detection */}
        <div
          className={`p-3 rounded-lg border ${
            securityStatus.botDetected ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Bot Status</span>
          </div>
          <div
            className={`text-sm font-bold ${
              securityStatus.botDetected ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {securityStatus.botDetected ? 'Detected' : 'Clean'}
          </div>
        </div>
      </div>

      {/* Last Update */}
      <div className="text-xs text-gray-500 mb-3">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Admin Controls</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                // Clear security logs (would need implementation)
                console.log('Clearing security logs...')
              }}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
            >
              Clear Logs
            </button>
            <button
              onClick={() => {
                // Export security data (would need implementation)
                console.log('Exporting security data...')
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
            >
              Export Data
            </button>
          </div>
        </div>
      )}

      {/* Security Tips */}
      <div className="border-t border-gray-200 pt-3 mt-3">
        <div className="text-xs text-gray-600">
          <div className="font-medium mb-1">Security Features Active:</div>
          <ul className="space-y-1">
            <li>• Rate limiting and bot detection</li>
            <li>• Content protection and anti-scraping</li>
            <li>• Honeypot fields for automated detection</li>
            <li>• Suspicious activity monitoring</li>
          </ul>
        </div>
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="text-xs text-gray-400 mt-2 text-center">Press Ctrl+Shift+S to toggle</div>
    </div>
  )
}
