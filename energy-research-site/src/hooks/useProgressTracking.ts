import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { useToast } from './useToast'
import type { UserProgress } from '../types'

const initialProgress: UserProgress = {
  sectionsVisited: [],
  interactionsCompleted: [],
  achievementsUnlocked: [],
  lastVisit: new Date().toISOString(),
}

/**
 * Custom hook for tracking user progress and achievements
 */
export function useProgressTracking() {
  const [progress, setProgress] = useLocalStorage<UserProgress>('userProgress', initialProgress)
  const { showToast } = useToast()

  const unlockAchievement = useCallback(
    (achievementId: string, title: string, message: string) => {
      if (!progress.achievementsUnlocked.includes(achievementId)) {
        setProgress(prev => ({
          ...prev,
          achievementsUnlocked: [...prev.achievementsUnlocked, achievementId],
          lastVisit: new Date().toISOString(),
        }))

        showToast({
          type: 'achievement',
          title: `Achievement Unlocked: ${title}`,
          message,
          duration: 8000,
          priority: 'high',
        })
      }
    },
    [progress.achievementsUnlocked, setProgress, showToast]
  )

  const checkExplorationAchievements = useCallback(
    (sectionsVisited: number) => {
      if (sectionsVisited === 3 && !progress.achievementsUnlocked.includes('explorer')) {
        unlockAchievement(
          'explorer',
          'Explorer',
          "You've visited 3 different sections! Keep exploring to discover more insights."
        )
      } else if (
        sectionsVisited === 6 &&
        !progress.achievementsUnlocked.includes('completionist')
      ) {
        unlockAchievement(
          'completionist',
          'Completionist',
          "Amazing! You've explored all sections of the showcase. You now have the full picture of both research projects!"
        )
      }
    },
    [progress.achievementsUnlocked, unlockAchievement]
  )

  const checkInteractionAchievements = useCallback(
    (interactionsCompleted: number) => {
      if (interactionsCompleted === 5 && !progress.achievementsUnlocked.includes('interactive')) {
        unlockAchievement(
          'interactive',
          'Interactive Explorer',
          "You've engaged with 5 interactive elements! You're really diving deep into the research."
        )
      } else if (
        interactionsCompleted === 10 &&
        !progress.achievementsUnlocked.includes('power-user')
      ) {
        unlockAchievement(
          'power-user',
          'Power User',
          "Incredible! You've mastered all the interactive features. You're a true research explorer!"
        )
      }
    },
    [progress.achievementsUnlocked, unlockAchievement]
  )

  const visitSection = useCallback(
    (sectionId: string) => {
      if (!progress.sectionsVisited.includes(sectionId)) {
        setProgress(prev => ({
          ...prev,
          sectionsVisited: [...prev.sectionsVisited, sectionId],
          lastVisit: new Date().toISOString(),
        }))

        // Show discovery toast for new sections with contextual information
        const sectionInfo: Record<string, { name: string; message: string; guidance?: string }> = {
          home: {
            name: 'Research Overview',
            message: 'Welcome! This showcases two groundbreaking research projects.',
            guidance:
              'Navigate to other sections to explore the detailed findings and methodologies.',
          },
          research: {
            name: 'EnergyLang Research',
            message: 'Discover the methodology behind energy-efficient programming research.',
            guidance: 'Look for interactive charts and detailed methodology explanations.',
          },
          findings: {
            name: 'Key Findings',
            message: 'Explore interactive visualizations of benchmark results.',
            guidance:
              'Try filtering the charts by language and benchmark type to see detailed comparisons.',
          },
          colorlang: {
            name: 'ColorLang Framework',
            message: 'Experience the innovative visual programming paradigm.',
            guidance: 'Try the interactive ColorLang interpreter and programming tutorials.',
          },
          methods: {
            name: 'Technical Methods',
            message: 'Deep dive into the technical implementation details.',
            guidance: 'Explore the sophisticated tools and measurement techniques used.',
          },
          lessons: {
            name: 'Strategic Lessons',
            message: 'Learn about strategic decision-making and AI collaboration.',
            guidance: 'Discover how AI was used throughout the research process.',
          },
          impact: {
            name: 'Impact & Applications',
            message: 'See the practical applications and recommendations.',
            guidance: 'Find actionable insights you can apply to your own projects.',
          },
        }

        const info = sectionInfo[sectionId]
        if (info) {
          showToast({
            type: 'discovery',
            title: `Exploring ${info.name}`,
            message: info.message,
            duration: 6000,
            priority: 'normal',
          })

          // Show guidance toast after a short delay if there's guidance available
          if (info.guidance) {
            setTimeout(() => {
              showToast({
                type: 'guidance',
                title: 'Exploration Tip',
                message: info.guidance,
                duration: 7000,
                priority: 'low',
              })
            }, 2000)
          }
        }

        // Check for exploration achievements
        checkExplorationAchievements(progress.sectionsVisited.length + 1)
      }
    },
    [progress.sectionsVisited, setProgress, showToast, checkExplorationAchievements]
  )

  const completeInteraction = useCallback(
    (interactionId: string, interactionName?: string) => {
      if (!progress.interactionsCompleted.includes(interactionId)) {
        setProgress(prev => ({
          ...prev,
          interactionsCompleted: [...prev.interactionsCompleted, interactionId],
          lastVisit: new Date().toISOString(),
        }))

        // Show interaction completion feedback
        if (interactionName) {
          showToast({
            type: 'success',
            title: 'Great Discovery!',
            message: `You've successfully interacted with ${interactionName}. Keep exploring for more insights!`,
            duration: 4000,
            priority: 'normal',
          })
        }

        // Check for interaction achievements
        checkInteractionAchievements(progress.interactionsCompleted.length + 1)
      }
    },
    [progress.interactionsCompleted, setProgress, showToast, checkInteractionAchievements]
  )

  const showInteractiveGuidance = useCallback(
    (elementType: string, elementName: string, instructions: string) => {
      showToast({
        type: 'guidance',
        title: `Interactive Element: ${elementName}`,
        message: instructions,
        duration: 8000,
        priority: 'normal',
        action: {
          label: 'Got it!',
          onClick: () => {
            completeInteraction(`guidance-${elementType}-${elementName}`, `${elementName} guidance`)
          },
        },
      })
    },
    [showToast, completeInteraction]
  )

  const resetProgress = useCallback(() => {
    setProgress(initialProgress)
  }, [setProgress])

  return {
    progress,
    visitSection,
    completeInteraction,
    unlockAchievement,
    showInteractiveGuidance,
    resetProgress,
  }
}
