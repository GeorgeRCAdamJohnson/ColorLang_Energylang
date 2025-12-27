// Application constants and configuration

export const APP_CONFIG = {
  name: 'Energy Research Showcase',
  description: 'Comprehensive showcase of EnergyLang and ColorLang research projects',
  version: '1.0.0',
  author: 'Energy Research Team',
  repository: 'https://github.com/GeorgeRCAdamJohnson/new-language',
  homepage: 'https://energy-research-showcase.netlify.app',
} as const

export const PERFORMANCE_TARGETS = {
  firstContentfulPaint: 1500, // ms
  largestContentfulPaint: 2500, // ms
  cumulativeLayoutShift: 0.1,
  firstInputDelay: 100, // ms
  bundleSize: 200 * 1024, // bytes (200KB gzipped)
} as const

export const ACCESSIBILITY_STANDARDS = {
  colorContrastRatio: 4.5,
  wcagLevel: 'AA',
  wcagVersion: '2.1',
} as const

export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
  languages: {
    'C++': '#00599C',
    Python: '#3776AB',
    Rust: '#CE422B',
    Go: '#00ADD8',
    Java: '#ED8B00',
    JavaScript: '#F7DF1E',
  },
} as const

export const BENCHMARK_TYPES = [
  'matrix_multiply',
  'sorting',
  'file_io',
  'json_processing',
  'fft',
  'convolution',
  'ml_inference',
] as const
export const ENERGY_UNITS = {
  microjoules: 'µJ',
  millijoules: 'mJ',
  joules: 'J',
  kilojoules: 'kJ',
} as const

export const TIME_UNITS = {
  microseconds: 'µs',
  milliseconds: 'ms',
  seconds: 's',
  minutes: 'm',
} as const

export const MEMORY_UNITS = {
  bytes: 'B',
  kilobytes: 'KB',
  megabytes: 'MB',
  gigabytes: 'GB',
  terabytes: 'TB',
} as const

export const COLORLANG_INSTRUCTIONS = {
  NOP: { hue: 0, description: 'No operation' },
  LOAD: { hue: 60, description: 'Load value' },
  STORE: { hue: 120, description: 'Store value' },
  ADD: { hue: 180, description: 'Addition' },
  SUB: { hue: 240, description: 'Subtraction' },
  MUL: { hue: 300, description: 'Multiplication' },
  DIV: { hue: 30, description: 'Division' },
  JUMP: { hue: 90, description: 'Jump to position' },
  BRANCH: { hue: 150, description: 'Conditional branch' },
  OUTPUT: { hue: 210, description: 'Output value' },
  INPUT: { hue: 270, description: 'Input value' },
  HALT: { hue: 330, description: 'Halt execution' },
} as const

export const TOAST_DURATIONS = {
  short: 3000,
  medium: 5000,
  long: 7000,
  persistent: 0,
} as const

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const
