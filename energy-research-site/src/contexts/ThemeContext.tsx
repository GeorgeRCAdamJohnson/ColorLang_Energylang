import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  effectiveTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>('light') // Default to light mode

  // Initialize theme after component mounts to avoid hydration mismatch
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setTheme(stored)
    } else {
      // If no stored preference, default to light mode
      setTheme('light')
    }
    setMounted(true)
  }, [])

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')

  // Initialize system theme after mount
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setSystemTheme(isDark ? 'dark' : 'light')
    }
  }, [mounted])

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [mounted])

  // Calculate effective theme
  const effectiveTheme = theme === 'system' ? systemTheme : theme

  // Apply theme to document
  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return

    const root = document.documentElement

    // Always remove dark class first
    root.classList.remove('dark')

    // Add dark class only if effective theme is dark
    if (effectiveTheme === 'dark') {
      root.classList.add('dark')
    }
  }, [effectiveTheme, mounted])

  // Save theme preference
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', theme)
    }
  }, [theme, mounted])

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div className="min-h-screen bg-white">{children}</div>
  }

  const toggleTheme = () => {
    setTheme(current => {
      if (current === 'light') return 'dark'
      if (current === 'dark') return 'system'
      return 'light'
    })
  }

  const value: ThemeContextType = {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
