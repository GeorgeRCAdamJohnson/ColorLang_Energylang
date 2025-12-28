import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Layout } from './components/layout/Layout'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'
import { useSectionTracking } from './hooks/useSectionTracking'

// Lazy load pages for code splitting
const HomePage = lazy(() =>
  import('./pages/HomePage').then(module => ({ default: module.HomePage }))
)
const ResearchPage = lazy(() =>
  import('./pages/ResearchPage').then(module => ({ default: module.ResearchPage }))
)
const FindingsPage = lazy(() =>
  import('./pages/FindingsPage').then(module => ({ default: module.FindingsPage }))
)
const ColorLangPage = lazy(() =>
  import('./pages/ColorLangPage').then(module => ({ default: module.ColorLangPage }))
)
const MethodsPage = lazy(() =>
  import('./pages/MethodsPage').then(module => ({ default: module.MethodsPage }))
)
const LessonsPage = lazy(() =>
  import('./pages/LessonsPage').then(module => ({ default: module.LessonsPage }))
)
const ImpactPage = lazy(() =>
  import('./pages/ImpactPage').then(module => ({ default: module.ImpactPage }))
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage }))
)

// Loading component for suspense fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

// Component that uses section tracking inside providers
function AppContent() {
  // Automatically track section visits - now inside providers
  useSectionTracking()

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/findings" element={<FindingsPage />} />
          <Route path="/colorlang" element={<ColorLangPage />} />
          <Route path="/methods" element={<MethodsPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
