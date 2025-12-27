import { useEffect, useRef, useState } from 'react'
import { useProgressTracking } from '../../hooks/useProgressTracking'

interface InteractiveGuidanceProps {
  elementId: string
  elementName: string
  instructions: string
  triggerOnHover?: boolean
  triggerOnClick?: boolean
  children: React.ReactNode
}

/**
 * Wrapper component that provides interactive guidance for elements
 */
export function InteractiveGuidance({
  elementId,
  elementName,
  instructions,
  triggerOnHover = true,
  triggerOnClick = false,
  children,
}: InteractiveGuidanceProps) {
  const { showInteractiveGuidance, completeInteraction, progress } = useProgressTracking()
  const [hasShownGuidance, setHasShownGuidance] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  // Check if user has already seen guidance for this element
  const hasSeenGuidance = progress.interactionsCompleted.includes(`guidance-${elementId}`)

  useEffect(() => {
    // Don't show guidance if already seen
    if (hasSeenGuidance || hasShownGuidance) return

    const element = elementRef.current
    if (!element) return

    const handleHover = () => {
      if (triggerOnHover && !hasShownGuidance) {
        showInteractiveGuidance(elementId, elementName, instructions)
        setHasShownGuidance(true)
      }
    }

    const handleClick = () => {
      if (triggerOnClick) {
        completeInteraction(`click-${elementId}`, elementName)
      }
    }

    if (triggerOnHover) {
      element.addEventListener('mouseenter', handleHover)
    }

    if (triggerOnClick) {
      element.addEventListener('click', handleClick)
    }

    return () => {
      if (triggerOnHover) {
        element.removeEventListener('mouseenter', handleHover)
      }
      if (triggerOnClick) {
        element.removeEventListener('click', handleClick)
      }
    }
  }, [
    elementId,
    elementName,
    instructions,
    triggerOnHover,
    triggerOnClick,
    hasSeenGuidance,
    hasShownGuidance,
    showInteractiveGuidance,
    completeInteraction,
  ])

  return (
    <div ref={elementRef} className="relative" data-interactive-element={elementId}>
      {children}
    </div>
  )
}
