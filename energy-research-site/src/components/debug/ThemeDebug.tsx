import { useTheme } from '../../contexts/ThemeContext'

export function ThemeDebug() {
  const { theme, effectiveTheme, setTheme } = useTheme()

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg z-50">
      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Theme Debug</h3>
      <div className="space-y-2 text-sm">
        <div className="text-gray-700 dark:text-gray-300">
          <strong>Selected:</strong> {theme}
        </div>
        <div className="text-gray-700 dark:text-gray-300">
          <strong>Effective:</strong> {effectiveTheme}
        </div>
        <div className="text-gray-700 dark:text-gray-300">
          <strong>HTML Class:</strong> {document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setTheme('light')}
            className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded text-xs"
          >
            Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs"
          >
            Dark
          </button>
          <button
            onClick={() => setTheme('system')}
            className="px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs"
          >
            System
          </button>
        </div>
      </div>
    </div>
  )
}