import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X, Star, Lightbulb, Trophy } from 'lucide-react'
import { ToastContext, type Toast } from '../../contexts/ToastContext'

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }

    setToasts(prev => {
      // Sort by priority: high -> normal -> low
      const priorityOrder = { high: 3, normal: 2, low: 1 }

      const updatedToasts = [...prev, newToast]
      return updatedToasts.sort((a, b) => {
        const aPriority = priorityOrder[a.priority || 'normal']
        const bPriority = priorityOrder[b.priority || 'normal']
        return bPriority - aPriority
      })
    })

    // Auto-hide after duration (default varies by type)
    const defaultDurations = {
      success: 4000,
      error: 8000,
      info: 5000,
      warning: 6000,
      discovery: 6000,
      achievement: 8000,
      guidance: 7000,
    }

    const duration = toast.duration || defaultDurations[toast.type] || 5000

    setTimeout(() => {
      hideToast(id)
    }, duration)
  }

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500 dark:text-green-400" size={20} />
      case 'error':
        return <AlertCircle className="text-red-500 dark:text-red-400" size={20} />
      case 'info':
        return <Info className="text-blue-500 dark:text-blue-400" size={20} />
      case 'warning':
        return <AlertCircle className="text-yellow-500 dark:text-yellow-400" size={20} />
      case 'discovery':
        return <Star className="text-purple-500 dark:text-purple-400" size={20} />
      case 'achievement':
        return <Trophy className="text-yellow-500 dark:text-yellow-400" size={20} />
      case 'guidance':
        return <Lightbulb className="text-indigo-500 dark:text-indigo-400" size={20} />
    }
  }

  const getStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/40 shadow-green-100 dark:shadow-green-900/20'
      case 'error':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/40 shadow-red-100 dark:shadow-red-900/20'
      case 'info':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/40 shadow-blue-100 dark:shadow-blue-900/20'
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/40 shadow-yellow-100 dark:shadow-yellow-900/20'
      case 'discovery':
        return 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/40 shadow-purple-100 dark:shadow-purple-900/20'
      case 'achievement':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/40 shadow-yellow-100 dark:shadow-yellow-900/20'
      case 'guidance':
        return 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/40 shadow-indigo-100 dark:shadow-indigo-900/20'
    }
  }

  const getAnimationProps = (type: Toast['type']) => {
    const isSpecial = type === 'achievement' || type === 'discovery'
    return {
      initial: {
        opacity: 0,
        x: 300,
        scale: isSpecial ? 0.8 : 0.3,
        rotate: isSpecial ? 5 : 0,
      },
      animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        rotate: 0,
      },
      exit: {
        opacity: 0,
        x: 300,
        scale: 0.5,
        rotate: isSpecial ? -5 : 0,
      },
      transition: {
        duration: isSpecial ? 0.5 : 0.3,
        type: isSpecial ? 'spring' : 'tween',
        stiffness: isSpecial ? 200 : undefined,
      },
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              {...getAnimationProps(toast.type)}
              className={`w-full border rounded-lg shadow-lg p-4 ${getStyles(toast.type)}`}
              role="alert"
              aria-live={toast.priority === 'high' ? 'assertive' : 'polite'}
            >
              <div className="flex items-start space-x-3">
                {getIcon(toast.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {toast.title}
                  </h4>
                  {toast.message && (
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{toast.message}</p>
                  )}
                  {toast.action && (
                    <button
                      onClick={toast.action.onClick}
                      className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => hideToast(toast.id)}
                  className="flex-shrink-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Close notification"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
