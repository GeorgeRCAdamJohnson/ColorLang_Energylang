import { ReactNode, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { UnifiedFAB } from '../ui/UnifiedFAB'
import { SEOHead } from '../seo/SEOHead'
import { getSEOConfig } from '../../data/seoConfig'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()

  // Get SEO configuration for current route
  const seoConfig = getSEOConfig(location.pathname)

  // Update page title and announce route changes to screen readers
  useEffect(() => {
    const routeTitles: Record<string, string> = {
      '/': 'Home - Energy Research Showcase',
      '/research': 'Research - Energy Research Showcase',
      '/findings': 'Findings - Energy Research Showcase',
      '/colorlang': 'ColorLang - Energy Research Showcase',
      '/methods': 'Methods - Energy Research Showcase',
      '/lessons': 'Lessons - Energy Research Showcase',
      '/impact': 'Impact - Energy Research Showcase',
    }

    const title = routeTitles[location.pathname] || 'Energy Research Showcase'

    // Announce page change to screen readers
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = `Navigated to ${title}`
    document.body.appendChild(announcement)

    // Clean up announcement after screen reader has time to read it
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)

    // Focus management - move focus to main content on route change
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.focus()
    }
  }, [location.pathname])

  return (
    <>
      {/* SEO Head with dynamic content */}
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        image={seoConfig.image}
        url={location.pathname}
        type={seoConfig.type}
        section={seoConfig.section}
        structuredData={seoConfig.structuredData}
      />

      <div className="min-h-screen flex flex-col">
        {/* Skip to main content link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          Skip to main content
        </a>

        <Header />

        <main
          id="main-content"
          className="flex-1"
          tabIndex={-1}
          role="main"
          aria-label="Main content"
        >
          {children}
        </main>

        <Footer />
        <UnifiedFAB isAdmin={process.env.NODE_ENV === 'development'} />
      </div>
    </>
  )
}
