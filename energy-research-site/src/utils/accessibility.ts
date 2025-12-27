/**
 * Accessibility utilities for enhanced user experience
 */

// Focus management utilities
export const focusManagement = {
  /**
   * Trap focus within a container element
   */
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    return () => container.removeEventListener('keydown', handleTabKey)
  },

  /**
   * Move focus to element and announce to screen readers
   */
  moveFocusTo: (element: HTMLElement, announcement?: string) => {
    element.focus()
    if (announcement) {
      announceToScreenReader(announcement)
    }
  },

  /**
   * Restore focus to previously focused element
   */
  restoreFocus: (previousElement: HTMLElement | null) => {
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus()
    }
  },
}

// Screen reader announcements
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Clean up after screen reader has time to read it
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement)
    }
  }, 1000)
}

// Keyboard navigation helpers
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation for lists
   */
  handleArrowKeys: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (newIndex: number) => void
  ) => {
    let newIndex = currentIndex

    switch (event.key) {
      case 'ArrowDown':
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
        break
      case 'ArrowUp':
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        break
      case 'Home':
        newIndex = 0
        break
      case 'End':
        newIndex = items.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    onIndexChange(newIndex)
    items[newIndex]?.focus()
  },

  /**
   * Handle escape key to close modals/dropdowns
   */
  handleEscape: (event: KeyboardEvent, onEscape: () => void) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onEscape()
    }
  },
}

// Color contrast utilities
export const colorContrast = {
  /**
   * Calculate color contrast ratio
   */
  getContrastRatio: (color1: string, color2: string): number => {
    const getLuminance = (color: string): number => {
      // Simplified luminance calculation
      const rgb = color.match(/\d+/g)
      if (!rgb) return 0

      const [r, g, b] = rgb.map(c => {
        const val = parseInt(c) / 255
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      })

      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)

    return (brightest + 0.05) / (darkest + 0.05)
  },

  /**
   * Check if color combination meets WCAG AA standards
   */
  meetsWCAGAA: (color1: string, color2: string, isLargeText = false): boolean => {
    const ratio = colorContrast.getContrastRatio(color1, color2)
    return isLargeText ? ratio >= 3 : ratio >= 4.5
  },
}

// Reduced motion utilities
export const reducedMotion = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  /**
   * Get animation duration based on user preference
   */
  getAnimationDuration: (normalDuration: number): number => {
    return reducedMotion.prefersReducedMotion() ? 0 : normalDuration
  },
}

// ARIA utilities
export const aria = {
  /**
   * Generate unique IDs for ARIA relationships
   */
  generateId: (prefix = 'aria'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * Set up ARIA describedby relationship
   */
  setupDescribedBy: (element: HTMLElement, descriptionId: string) => {
    const existingIds = element.getAttribute('aria-describedby') || ''
    const ids = existingIds.split(' ').filter(id => id.length > 0)

    if (!ids.includes(descriptionId)) {
      ids.push(descriptionId)
      element.setAttribute('aria-describedby', ids.join(' '))
    }
  },

  /**
   * Remove ARIA describedby relationship
   */
  removeDescribedBy: (element: HTMLElement, descriptionId: string) => {
    const existingIds = element.getAttribute('aria-describedby') || ''
    const ids = existingIds.split(' ').filter(id => id !== descriptionId)

    if (ids.length > 0) {
      element.setAttribute('aria-describedby', ids.join(' '))
    } else {
      element.removeAttribute('aria-describedby')
    }
  },
}
