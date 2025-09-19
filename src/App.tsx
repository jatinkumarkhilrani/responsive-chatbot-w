import { memo, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MessagingApp } from './components/MessagingApp'

// Create a stable query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

const ErrorFallback = memo(({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
    <div className="text-center max-w-md">
      <div className="text-red-600 text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-red-800 mb-2">App Error</h1>
      <p className="text-red-600 mb-4 text-sm">
        {error.message || 'Something went wrong'}
      </p>
      <div className="space-y-2">
        <button 
          onClick={() => window.location.reload()} 
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors block w-full"
        >
          Reload Page
        </button>
        <button 
          onClick={resetErrorBoundary} 
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors block w-full"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
))

const LoadingFallback = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading Sahaay...</p>
    </div>
  </div>
))

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary 
        FallbackComponent={ErrorFallback}
        onError={(error) => console.error('React Error Boundary:', error)}
      >
        <Suspense fallback={<LoadingFallback />}>
          <MessagingApp />
          <Toaster position="top-right" richColors closeButton />
        </Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App