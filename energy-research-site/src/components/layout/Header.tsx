import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Menu, X, Zap, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { navigationItems } from '../../data/navigation'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  // Handle scroll effect for header;
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const getNavItemIcon = (item: (typeof navigationItems)[0]) => {
    if (item.completed) {
      return <CheckCircle size={16} className="text-green-500" />
    }
    // Removed the blue Play icons for interactive items
    return null
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50'
          : 'bg-white shadow-sm border-b border-gray-200'
      }`}
    >
      <nav className="container-custom" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo with enhanced visual hierarchy */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ marginRight: '7px' }}
          >
            <Link
              to="/"
              className="flex items-center space-x-3 text-xl font-bold text-gray-900 hover:text-blue-600 transition-all duration-300 group"
              aria-label="Home"
            >
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg group-hover:from-blue-600 group-hover:to-indigo-700 transition-all duration-300">
                <Zap className="text-white" size={20} />
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation with enhanced visual hierarchy */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 group flex items-center space-x-2 ${
                    location.pathname === item.path
                      ? 'text-blue-600 bg-blue-50 shadow-sm'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                  title={item.description}
                >
                  {/* Active indicator - moved before text to prevent covering */}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-50 rounded-lg border border-blue-200 -z-10"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  <span className="relative z-10">{item.label}</span>
                  <span className="relative z-10">{getNavItemIcon(item)}</span>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 rounded-lg transition-all duration-300 -z-10" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mobile Menu Button with enhanced animation */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 relative"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Enhanced Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md"
            >
              <div className="py-4 space-y-1">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-200 group ${
                        location.pathname === item.path
                          ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
                      }`}
                      aria-current={location.pathname === item.path ? 'page' : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <span>{item.label}</span>
                        {getNavItemIcon(item)}
                      </div>
                      <div className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                        {item.description}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  )
}
