/**
 * Security utilities for protecting the site from various threats
 */

import {
  getSecurityConfig,
  SecurityEventType,
  SecurityRiskLevel,
  type SecurityEvent,
} from '../config/security'

// Rate limiting and anti-scraping
interface RateLimitEntry {
  count: number
  firstRequest: number
  lastRequest: number
  blocked: boolean
  blockExpiry?: number
}

class SecurityManager {
  private rateLimitMap = new Map<string, RateLimitEntry>()
  private suspiciousIPs = new Set<string>()
  private honeypotTriggers = new Set<string>()
  private securityEvents: SecurityEvent[] = []
  private config = getSecurityConfig()

  /**
   * Log security event
   */
  private logSecurityEvent(
    type: SecurityEventType,
    level: SecurityRiskLevel,
    fingerprint: string,
    details: Record<string, unknown>
  ): void {
    const event: SecurityEvent = {
      type,
      level,
      timestamp: Date.now(),
      fingerprint,
      details,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    }

    this.securityEvents.push(event)

    // Keep only recent events (last 24 hours)
    const cutoff = Date.now() - this.config.MONITORING.LOG_RETENTION_HOURS * 60 * 60 * 1000
    this.securityEvents = this.securityEvents.filter(e => e.timestamp > cutoff)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Security Event [${level.toUpperCase()}]: ${type}`, details)
    }
  }

  /**
   * Get client fingerprint for tracking
   */
  private getClientFingerprint(): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Security fingerprint', 2, 2)
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 0,
      (navigator as unknown as { deviceMemory?: number }).deviceMemory || 0,
    ].join('|')

    return btoa(fingerprint).slice(0, 32)
  }

  /**
   * Check if request should be rate limited
   */
  checkRateLimit(): boolean {
    const fingerprint = this.getClientFingerprint()
    const now = Date.now()
    const entry = this.rateLimitMap.get(fingerprint)

    if (!entry) {
      this.rateLimitMap.set(fingerprint, {
        count: 1,
        firstRequest: now,
        lastRequest: now,
        blocked: false,
      })
      return true
    }

    // Check if block has expired
    if (entry.blocked && entry.blockExpiry && now > entry.blockExpiry) {
      entry.blocked = false
      entry.blockExpiry = undefined
      entry.count = 1
      entry.firstRequest = now
    }

    if (entry.blocked) {
      return false
    }

    // Check rate limits
    const timeSinceFirst = now - entry.firstRequest
    const timeSinceLast = now - entry.lastRequest

    // Too many requests in short time
    if (
      timeSinceFirst < 60000 &&
      entry.count >= this.config.RATE_LIMITING.MAX_REQUESTS_PER_MINUTE
    ) {
      this.blockClient(fingerprint, 'Rate limit exceeded')
      return false
    }

    // Suspicious rapid requests
    if (timeSinceLast < this.config.RATE_LIMITING.MIN_TIME_BETWEEN_REQUESTS) {
      entry.count += 5 // Penalty for rapid requests
      if (entry.count >= this.config.RATE_LIMITING.MAX_CONSECUTIVE_REQUESTS) {
        this.blockClient(fingerprint, 'Suspicious rapid requests')
        return false
      }
    }

    // Update entry
    entry.count++
    entry.lastRequest = now

    // Reset counter after an hour
    if (timeSinceFirst > 3600000) {
      entry.count = 1
      entry.firstRequest = now
    }

    return true
  }

  /**
   * Block a client
   */
  private blockClient(fingerprint: string, reason: string): void {
    const entry = this.rateLimitMap.get(fingerprint)
    if (entry) {
      entry.blocked = true
      entry.blockExpiry = Date.now() + this.config.RATE_LIMITING.BLOCK_DURATION_MS
      this.suspiciousIPs.add(fingerprint)

      // Log security event
      this.logSecurityEvent(
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        SecurityRiskLevel.MEDIUM,
        fingerprint,
        { reason, blockExpiry: entry.blockExpiry }
      )

      // Report to analytics if available
      if (typeof (window as unknown as { gtag?: unknown }).gtag !== 'undefined') {
        // eslint-disable-next-line no-extra-semi
        ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
          'event',
          'security_block',
          {
            event_category: 'security',
            event_label: reason,
            custom_map: { fingerprint: fingerprint.slice(0, 8) },
          }
        )
      }
    }
  }

  /**
   * Detect bot behavior patterns
   */
  detectBotBehavior(): boolean {
    // Check for headless browser indicators
    if (
      !(window as unknown as { chrome?: unknown }).chrome ||
      (navigator as unknown as { webdriver?: boolean }).webdriver === true ||
      window.outerHeight === 0 ||
      window.outerWidth === 0
    ) {
      return true
    }

    // Check for automation tools
    const userAgent = navigator.userAgent.toLowerCase()
    return this.config.BOT_DETECTION.USER_AGENT_PATTERNS.some(pattern =>
      userAgent.includes(pattern)
    )
  }

  /**
   * Create honeypot fields to catch bots
   */
  createHoneypot(): HTMLElement {
    const honeypot = document.createElement('div')
    honeypot.style.cssText = `
      position: absolute !important;
      left: -9999px !important;
      top: -9999px !important;
      width: 1px !important;
      height: 1px !important;
      opacity: 0 !important;
      pointer-events: none !important;
    `

    this.config.BOT_DETECTION.HONEYPOT_FIELDS.forEach(fieldName => {
      const input = document.createElement('input')
      input.type = 'text'
      input.name = fieldName
      input.tabIndex = -1
      input.autocomplete = 'off'
      input.setAttribute('aria-hidden', 'true')

      input.addEventListener('input', () => {
        const fingerprint = this.getClientFingerprint()
        this.honeypotTriggers.add(fingerprint)
        this.logSecurityEvent(
          SecurityEventType.HONEYPOT_TRIGGERED,
          SecurityRiskLevel.HIGH,
          fingerprint,
          { fieldName, value: input.value }
        )
        this.blockClient(fingerprint, 'Honeypot triggered')
      })

      honeypot.appendChild(input)
    })

    return honeypot
  }

  /**
   * Protect content from copying
   */
  enableContentProtection(): void {
    if (!this.config.FEATURES.ENABLE_CONTENT_PROTECTION) return

    let copyCount = 0

    // Disable right-click context menu
    if (this.config.FEATURES.ENABLE_RIGHT_CLICK_DISABLE) {
      document.addEventListener('contextmenu', e => {
        if (this.isProtectedContent(e.target as Element)) {
          e.preventDefault()
          this.showSecurityWarning(this.config.MESSAGES.CONTENT_PROTECTED)
          this.logSecurityEvent(
            SecurityEventType.CONTENT_PROTECTION,
            SecurityRiskLevel.LOW,
            this.getClientFingerprint(),
            { action: 'right_click_blocked', element: (e.target as Element).tagName }
          )
        }
      })
    }

    // Detect text selection and copying
    if (this.config.FEATURES.ENABLE_COPY_PROTECTION) {
      document.addEventListener('selectstart', e => {
        const selection = window.getSelection()
        if (
          selection &&
          selection.toString().length > this.config.CONTENT_PROTECTION.MAX_COPY_LENGTH
        ) {
          e.preventDefault()
          this.showSecurityWarning(this.config.MESSAGES.LARGE_SELECTION)
        }
      })

      // Monitor copy events
      document.addEventListener('copy', e => {
        copyCount++
        if (copyCount > this.config.CONTENT_PROTECTION.COPY_WARNING_THRESHOLD) {
          this.showSecurityWarning(this.config.MESSAGES.EXCESSIVE_COPYING)
          this.logSecurityEvent(
            SecurityEventType.EXCESSIVE_COPYING,
            SecurityRiskLevel.MEDIUM,
            this.getClientFingerprint(),
            { copyCount, threshold: this.config.CONTENT_PROTECTION.COPY_WARNING_THRESHOLD }
          )
          // Optionally block further copying
          e.preventDefault()
        }
      })
    }

    // Disable common keyboard shortcuts for scraping
    if (this.config.FEATURES.ENABLE_DEVELOPER_TOOLS_BLOCK) {
      document.addEventListener('keydown', e => {
        // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C')
        ) {
          e.preventDefault()
          this.showSecurityWarning(this.config.MESSAGES.DEVELOPER_TOOLS)
          this.logSecurityEvent(
            SecurityEventType.DEVELOPER_TOOLS_BLOCKED,
            SecurityRiskLevel.MEDIUM,
            this.getClientFingerprint(),
            { key: e.key, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey }
          )
        }
      })
    }
  }

  /**
   * Check if element contains protected content
   */
  private isProtectedContent(element: Element): boolean {
    if (!element) return false

    return this.config.CONTENT_PROTECTION.PROTECTED_SELECTORS.some(
      selector => element.matches(selector) || element.closest(selector)
    )
  }

  /**
   * Show security warning to user
   */
  private showSecurityWarning(message: string): void {
    // Create a temporary warning overlay
    const warning = document.createElement('div')
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
    `

    warning.textContent = `⚠️ ${message}`
    document.body.appendChild(warning)

    // Remove after 3 seconds
    setTimeout(() => {
      if (document.body.contains(warning)) {
        document.body.removeChild(warning)
      }
    }, 3000)
  }

  /**
   * Obfuscate sensitive data in DOM
   */
  obfuscateData(): void {
    // Add CSS to hide content from automated scrapers
    const style = document.createElement('style')
    style.textContent = `
      @media print {
        .no-print { display: none !important; }
      }
      
      .obfuscated::before {
        content: attr(data-obfuscated);
        position: absolute;
        left: -9999px;
      }
      
      .anti-scrape {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }
    `
    document.head.appendChild(style)

    // Obfuscate email addresses and sensitive data
    document.querySelectorAll('[data-email]').forEach(element => {
      const email = element.getAttribute('data-email')
      if (email) {
        element.textContent = email.replace('@', ' [at] ').replace('.', ' [dot] ')
      }
    })
  }

  /**
   * Monitor for suspicious activity
   */
  monitorSuspiciousActivity(): void {
    let mouseMovements = 0
    let keystrokes = 0
    let scrollEvents = 0

    // Track human-like behavior
    document.addEventListener('mousemove', () => {
      mouseMovements++
    })

    document.addEventListener('keydown', () => {
      keystrokes++
    })

    document.addEventListener('scroll', () => {
      scrollEvents++
    })

    // Check for bot-like behavior every 30 seconds
    setInterval(() => {
      const totalActivity = mouseMovements + keystrokes + scrollEvents

      if (totalActivity === 0 && document.visibilityState === 'visible') {
        // No human activity detected
        this.blockClient(this.getClientFingerprint(), 'No human activity detected')
      }

      // Reset counters
      mouseMovements = 0
      keystrokes = 0
      scrollEvents = 0
    }, 30000)
  }

  /**
   * Initialize all security measures
   */
  initialize(): void {
    // Check if client should be blocked
    if (!this.checkRateLimit()) {
      document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
          <div style="text-align: center; padding: 2rem; border: 1px solid #e5e5e5; border-radius: 8px;">
            <h2 style="color: #ef4444; margin-bottom: 1rem;">Access Temporarily Restricted</h2>
            <p style="color: #666; margin-bottom: 1rem;">Your request has been rate limited. Please try again later.</p>
            <p style="font-size: 0.875rem; color: #999;">If you believe this is an error, please contact support.</p>
          </div>
        </div>
      `
      return
    }

    // Initialize security features
    this.enableContentProtection()
    this.obfuscateData()
    this.monitorSuspiciousActivity()

    // Add honeypot to forms
    document.addEventListener('DOMContentLoaded', () => {
      const forms = document.querySelectorAll('form')
      forms.forEach(form => {
        form.appendChild(this.createHoneypot())
      })
    })

    // Detect and handle bot behavior
    if (this.detectBotBehavior()) {
      console.warn('Security: Bot behavior detected')
      // Optionally redirect bots to a different page or show limited content
    }

    console.log('Security: Protection measures initialized')
  }

  /**
   * Get security status for debugging
   */
  getSecurityStatus(): object {
    return {
      rateLimitEntries: this.rateLimitMap.size,
      suspiciousIPs: this.suspiciousIPs.size,
      honeypotTriggers: this.honeypotTriggers.size,
      botDetected: this.detectBotBehavior(),
    }
  }
}

// Export singleton instance
export const securityManager = new SecurityManager()

// Auto-initialize security when module loads (only in production)
if (typeof window !== 'undefined' && (import.meta as { env?: { PROD?: boolean } }).env?.PROD) {
  // Add CSS animations
  const animationStyle = document.createElement('style')
  animationStyle.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `
  document.head.appendChild(animationStyle)

  // Initialize security on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => securityManager.initialize())
  } else {
    securityManager.initialize()
  }
} else if (typeof window !== 'undefined') {
  console.log('🔒 Security features disabled in development mode')
}

// Additional security utilities
export const securityUtils = {
  /**
   * Sanitize user input to prevent XSS
   */
  sanitizeInput: (input: string): string => {
    const div = document.createElement('div')
    div.textContent = input
    return div.innerHTML
  },

  /**
   * Validate URL to prevent open redirects
   */
  isValidUrl: (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      const allowedDomains = ['energy-research-showcase.netlify.app', 'localhost', '127.0.0.1']

      return allowedDomains.some(
        domain => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      )
    } catch {
      return false
    }
  },

  /**
   * Generate secure random token
   */
  generateSecureToken: (length = 32): string => {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  },

  /**
   * Check if request is from a legitimate source
   */
  validateReferrer: (): boolean => {
    const referrer = document.referrer
    if (!referrer) return true // Direct access is allowed

    try {
      const referrerUrl = new URL(referrer)
      const allowedReferrers = [
        'google.com',
        'bing.com',
        'duckduckgo.com',
        'github.com',
        'energy-research-showcase.netlify.app',
      ]

      return allowedReferrers.some(domain => referrerUrl.hostname.includes(domain))
    } catch {
      return false
    }
  },
}
