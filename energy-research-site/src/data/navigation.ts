import type { NavigationItem } from '../types'

export const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    description: 'Overview and key findings',
    hasInteractive: false,
    completed: false,
  },
  {
    id: 'research',
    label: 'Research',
    path: '/research',
    description: 'EnergyLang methodology and approach',
    hasInteractive: true,
    completed: false,
  },
  {
    id: 'findings',
    label: 'Findings',
    path: '/findings',
    description: 'Interactive benchmark results and analysis',
    hasInteractive: true,
    completed: false,
  },
  {
    id: 'colorlang',
    label: 'ColorLang',
    path: '/colorlang',
    description: 'Visual programming framework showcase',
    hasInteractive: true,
    completed: false,
  },
  {
    id: 'methods',
    label: 'Methods',
    path: '/methods',
    description: 'Technical implementation details',
    hasInteractive: false,
    completed: false,
  },
  {
    id: 'lessons',
    label: 'Lessons',
    path: '/lessons',
    description: 'Strategic decisions and AI collaboration',
    hasInteractive: false,
    completed: false,
  },
  {
    id: 'impact',
    label: 'Impact',
    path: '/impact',
    description: 'Practical applications and recommendations',
    hasInteractive: false,
    completed: false,
  },
]

export type { NavigationItem }
