import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { navigationItems } from '../../data/navigation'

interface BreadcrumbItem {
  label: string
  path: string
  isActive: boolean
}

export function Breadcrumbs() {
  const location = useLocation()

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Home',
        path: '/',
        isActive: location.pathname === '/',
      },
    ]

    // Find current page in navigation
    const currentPage = navigationItems.find(item => item.path === location.pathname)

    if (currentPage && location.pathname !== '/') {
      breadcrumbs.push({
        label: currentPage.label,
        path: currentPage.path,
        isActive: true,
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  if (breadcrumbs.length <= 1) {
    return null // Don't show breadcrumbs on home page
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6"
    >
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center">
          {index > 0 && (
            <ChevronRight size={16} className="mx-2 text-gray-400 dark:text-gray-500" />
          )}

          {breadcrumb.isActive ? (
            <span className="text-gray-900 dark:text-gray-100 font-medium flex items-center">
              {index === 0 && <Home size={16} className="mr-1" />}
              {breadcrumb.label}
            </span>
          ) : (
            <Link
              to={breadcrumb.path}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center"
            >
              {index === 0 && <Home size={16} className="mr-1" />}
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
