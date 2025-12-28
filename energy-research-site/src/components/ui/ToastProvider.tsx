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
        return <CheckCircle className="text-green-500" size={20} />
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />
      case 'info':
        return <Info className="text-blue-500" size={20} />
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={20} />
      case 'discovery':
        return <Star className="text-purple-500" size={20} />
      case 'achievement':
        return <Trophy className="text-yellow-500" size={20} />
      case 'guidance':
        return <Lightbulb className="text-indigo-500" size={20} />
    }
  }

  const getStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 shadow-green-100'
      case 'error':
        return 'border-red-200 bg-red-50 shadow-red-100'
      case 'info':
        return 'border-blue-200 bg-blue-50 shadow-blue-100'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 shadow-yellow-100'
      case 'discovery':
        return 'border-purple-200 bg-purple-50 shadow-purple-100'
      case 'achievement':
        return 'border-yellow-200 bg-yellow-50 shadow-yellow-100'
      case 'guidance':
        return 'border-indigo-200 bg-indigo-50 shadow-indigo-100'
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
