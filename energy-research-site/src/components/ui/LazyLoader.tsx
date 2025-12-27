import { Suspense, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface LazyLoaderProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

function DefaultFallback() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center p-8"
    >
      <div className="flex flex-col items-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-600">Loading component...</p>
      </div>
    </motion.div>
  )
}

export function LazyLoader({ children, fallback, className = '' }: LazyLoaderProps) {
  return (
    <div className={className}>
      <Suspense fallback={fallback || <DefaultFallback />}>{children}</Suspense>
    </div>
  )
}
