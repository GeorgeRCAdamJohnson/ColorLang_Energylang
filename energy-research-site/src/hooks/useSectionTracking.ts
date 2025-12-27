import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useProgressTracking } from './useProgressTracking'

/**
 * Hook to automatically track section visits based on route changes
 */
export function useSectionTracking() {
  const location = useLocation()
  const { visitSection } = useProgressTracking()

  useEffect(() => {
    // Map routes to section IDs
    const routeToSection: Record<string, string> = {
      '/': 'home',
      '/research': 'research',
      '/findings': 'findings',
      '/colorlang': 'colorlang',
      '/methods': 'methods',
      '/lessons': 'lessons',
      '/impact': 'impact',
    }

    const sectionId = routeToSection[location.pathname]
    if (sectionId) {
      // Small delay to ensure the page has loaded before showing notifications
      const timer = setTimeout(() => {
        visitSection(sectionId)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [location.pathname, visitSection])
}
