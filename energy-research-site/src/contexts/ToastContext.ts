import { createContext } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning' | 'discovery' | 'achievement' | 'guidance'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  priority?: 'low' | 'normal' | 'high'
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
  hideToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

export type { Toast, ToastContextType }
