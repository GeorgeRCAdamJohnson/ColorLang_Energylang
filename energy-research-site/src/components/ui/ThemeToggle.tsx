import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, effectiveTheme, toggleTheme } = useTheme()

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={20} />
      case 'dark':
        return <Moon size={20} />
      case 'system':
        return <Monitor size={20} />
      default:
        return <Sun size={20} />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light mode'
      case 'dark':
        return 'Dark mode'
      case 'system':
        return `System (${effectiveTheme})`
      default:
        return 'Light mode'
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
      title={`Current theme: ${getLabel()}. Click to cycle through themes.`}
      aria-label={`Switch theme. Current: ${getLabel()}`}
    >
      <span className="transition-transform duration-200 hover:scale-110">{getIcon()}</span>
      <span className="text-sm font-medium hidden sm:inline">{getLabel()}</span>
    </button>
  )
}
