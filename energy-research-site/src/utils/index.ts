// Utility functions for the Energy Research Showcase

/**
 * Format energy values with appropriate units
 */
export function formatEnergy(joules: number): string {
  if (joules < 0.001) {
    return `${(joules * 1000000).toFixed(2)} µJ`
  } else if (joules < 1) {
    return `${(joules * 1000).toFixed(2)} mJ`
  } else if (joules < 1000) {
    return `${joules.toFixed(2)} J`
  } else {
    return `${(joules / 1000).toFixed(2)} kJ`
  }
}

/**
 * Format time values with appropriate units
 */
export function formatTime(seconds: number): string {
  if (seconds < 0.001) {
    return `${(seconds * 1000000).toFixed(2)} µs`
  } else if (seconds < 1) {
    return `${(seconds * 1000).toFixed(2)} ms`
  } else if (seconds < 60) {
    return `${seconds.toFixed(2)} s`
  } else {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`
  }
}

/**
 * Format memory values with appropriate units
 */
export function formatMemory(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

/**
 * Calculate energy efficiency (J/FLOP)
 */
export function calculateEfficiency(energyJoules: number, operations: number): number {
  return operations > 0 ? energyJoules / operations : 0
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Debounce function for search and filtering
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Convert HSV to RGB
 */
export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  h = h / 360
  s = s / 100
  v = v / 100

  const c = v * s
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = v - c

  let r = 0,
    g = 0,
    b = 0

  if (0 <= h && h < 1 / 6) {
    r = c
    g = x
    b = 0
  } else if (1 / 6 <= h && h < 2 / 6) {
    r = x
    g = c
    b = 0
  } else if (2 / 6 <= h && h < 3 / 6) {
    r = 0
    g = c
    b = x
  } else if (3 / 6 <= h && h < 4 / 6) {
    r = 0
    g = x
    b = c
  } else if (4 / 6 <= h && h < 5 / 6) {
    r = x
    g = 0
    b = c
  } else if (5 / 6 <= h && h < 1) {
    r = c
    g = 0
    b = x
  }

  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  let h = 0
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6
    } else if (max === g) {
      h = (b - r) / diff + 2
    } else {
      h = (r - g) / diff + 4
    }
  }
  h = Math.round(h * 60)
  if (h < 0) h += 360

  const s = max === 0 ? 0 : Math.round((diff / max) * 100)
  const v = Math.round(max * 100)

  return [h, s, v]
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Calculate relative improvement between two values
 */
export function calculateImprovement(baseline: number, comparison: number): number {
  return ((baseline - comparison) / baseline) * 100
}

/**
 * Sort array of objects by a property
 */
export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Group array of objects by a property
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key])
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    },
    {} as Record<string, T[]>
  )
}

// Export accessibility utilities
export * from './accessibility'
