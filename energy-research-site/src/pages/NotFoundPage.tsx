import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="section-padding min-h-screen flex items-center justify-center">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="heading-lg mb-4">Page Not Found</h2>
            <p className="text-body mb-8">
              The page you're looking for doesn't exist. It might have been moved, deleted, or you
              entered the wrong URL.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-primary inline-flex items-center space-x-2">
              <Home size={20} />
              <span>Go Home</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-outline inline-flex items-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
