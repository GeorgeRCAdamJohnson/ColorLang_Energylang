/**
 * Security configuration and constants
 */

export const SECURITY_CONFIG = {
  // Rate limiting configuration
  RATE_LIMITING: {
    MAX_REQUESTS_PER_MINUTE: 60,
    MAX_REQUESTS_PER_HOUR: 1000,
    BLOCK_DURATION_MS: 15 * 60 * 1000, // 15 minutes
    MIN_TIME_BETWEEN_REQUESTS: 100, // ms
    MAX_CONSECUTIVE_REQUESTS: 10,
  },

  // Content protection settings
  CONTENT_PROTECTION: {
    MAX_COPY_LENGTH: 500, // characters
    COPY_WARNING_THRESHOLD: 3,
    PROTECTED_SELECTORS: [
      '[data-protected]',
      '.benchmark-data',
      '.research-content',
      '.chart-container',
      '.energy-data',
    ],
  },

  // Bot detection patterns
  BOT_DETECTION: {
    USER_AGENT_PATTERNS: [
      'webdriver',
      'selenium',
      'phantomjs',
      'headless',
      'automation',
      'bot',
      'crawler',
      'spider',
      'scraper',
    ],
    HONEYPOT_FIELDS: [
      'email_confirm',
      'website_url',
      'company_name',
      'phone_number_backup',
      'address_secondary',
    ],
  },

  // Allowed domains for various security checks
  ALLOWED_DOMAINS: {
    REFERRERS: [
      'google.com',
      'bing.com',
      'duckduckgo.com',
      'github.com',
      'energy-research-showcase.netlify.app',
      'localhost',
      '127.0.0.1',
    ],
    REDIRECTS: ['energy-research-showcase.netlify.app', 'localhost', '127.0.0.1'],
  },

  // Security monitoring settings
  MONITORING: {
    UPDATE_INTERVAL_MS: 30000, // 30 seconds
    LOG_RETENTION_HOURS: 24,
    ALERT_THRESHOLDS: {
      RATE_LIMIT_ENTRIES: 5,
      SUSPICIOUS_IPS: 3,
      HONEYPOT_TRIGGERS: 1,
    },
  },

  // Feature flags
  FEATURES: {
    ENABLE_CONTENT_PROTECTION: true,
    ENABLE_RIGHT_CLICK_DISABLE: true,
    ENABLE_DEVELOPER_TOOLS_BLOCK: true,
    ENABLE_COPY_PROTECTION: true,
    ENABLE_HONEYPOTS: true,
    ENABLE_BOT_DETECTION: true,
    ENABLE_ACTIVITY_MONITORING: true,
  },

  // Security warnings and messages
  MESSAGES: {
    RATE_LIMITED: 'Access temporarily restricted due to rate limiting. Please try again later.',
    CONTENT_PROTECTED: 'This content is protected from copying.',
    LARGE_SELECTION: 'Large text selections are not allowed.',
    EXCESSIVE_COPYING: 'Excessive copying detected.',
    DEVELOPER_TOOLS: 'Developer tools access is restricted.',
    BOT_DETECTED: 'Automated access detected.',
    HONEYPOT_TRIGGERED: 'Automated form submission detected.',
  },
} as const

/**
 * Security event types for logging and monitoring
 */
export enum SecurityEventType {
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  BOT_DETECTED = 'bot_detected',
  HONEYPOT_TRIGGERED = 'honeypot_triggered',
  CONTENT_PROTECTION = 'content_protection',
  DEVELOPER_TOOLS_BLOCKED = 'developer_tools_blocked',
  EXCESSIVE_COPYING = 'excessive_copying',
  INVALID_REFERRER = 'invalid_referrer',
}

/**
 * Security risk levels
 */
export enum SecurityRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Security event interface for logging
 */
export interface SecurityEvent {
  type: SecurityEventType
  level: SecurityRiskLevel
  timestamp: number
  fingerprint: string
  details: Record<string, unknown>
  userAgent?: string
  ip?: string
  referrer?: string
}

/**
 * Get security configuration based on environment
 */
export function getSecurityConfig() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    ...SECURITY_CONFIG,
    // Adjust settings based on environment
    RATE_LIMITING: {
      ...SECURITY_CONFIG.RATE_LIMITING,
      // More lenient in development
      MAX_REQUESTS_PER_MINUTE: isDevelopment
        ? 120
        : SECURITY_CONFIG.RATE_LIMITING.MAX_REQUESTS_PER_MINUTE,
      BLOCK_DURATION_MS: isDevelopment
        ? 5 * 60 * 1000
        : SECURITY_CONFIG.RATE_LIMITING.BLOCK_DURATION_MS,
    },
    FEATURES: {
      ...SECURITY_CONFIG.FEATURES,
      // Disable some features in development for easier testing
      ENABLE_DEVELOPER_TOOLS_BLOCK: isProduction,
      ENABLE_RIGHT_CLICK_DISABLE: isProduction,
    },
  }
}

/**
 * Validate security configuration
 */
export function validateSecurityConfig(): boolean {
  const config = getSecurityConfig()

  // Basic validation checks
  if (config.RATE_LIMITING.MAX_REQUESTS_PER_MINUTE <= 0) {
    console.error('Invalid rate limiting configuration: MAX_REQUESTS_PER_MINUTE must be positive')
    return false
  }

  if (config.CONTENT_PROTECTION.MAX_COPY_LENGTH <= 0) {
    console.error('Invalid content protection configuration: MAX_COPY_LENGTH must be positive')
    return false
  }

  if (config.MONITORING.UPDATE_INTERVAL_MS < 1000) {
    console.error('Invalid monitoring configuration: UPDATE_INTERVAL_MS must be at least 1000ms')
    return false
  }

  return true
}
