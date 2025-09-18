import { useEffect, Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'sonner'
import { initializeSparkMock } from './utils/sparkMock'
import { SimpleApp } from './components/SimpleApp'
import { lazy } from 'react'

// Lazy load the main app to catch import errors
const MessagingApp = lazy(() => 
  import('./components/MessagingApp').then(module => ({ default: module.MessagingApp }))
)

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  console.error('App error:', error)
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <div className="text-center max-w-md">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-red-800 mb-2">App Error</h1>
        <p className="text-red-600 mb-4 text-sm">
          {error.message || 'Something went wrong loading the app'}
        </p>
        <div className="space-y-2">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors block w-full"
          >
            Reload Page
          </button>
          <button 
            onClick={() => {
              // Switch to simple app
              window.location.hash = '#simple'
              window.location.reload()
            }} 
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors block w-full"
          >
            Use Simple Mode
          </button>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Sahaay...</p>
      </div>
    </div>
  )
}

function App() {
  const [useFallback, setUseFallback] = useState(window.location.hash === '#simple')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    try {
      initializeSparkMock()
      setInitialized(true)
    } catch (error) {
      console.error('Failed to initialize Spark mock:', error)
      setUseFallback(true)
      setInitialized(true)
    }
  }, [])

  if (!initialized) {
    return <LoadingFallback />
  }

  if (useFallback) {
    return (
      <>
        <SimpleApp />
        <Toaster position="top-right" richColors />
      </>
    )
  }

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        console.error('React Error Boundary caught:', error)
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <MessagingApp />
        <Toaster position="top-right" richColors />
      </Suspense>
    </ErrorBoundary>
  )
}

export default App