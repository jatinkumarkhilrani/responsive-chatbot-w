import { useState, useEffect, Suspense } from 'react'
import { ChatCircle, Robot, ShieldCheck, Gear } from '@phosphor-icons/react'

// Simple fallback component for testing
export function SimpleApp() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      try {
        setIsLoading(false)
      } catch (err) {
        setError('Failed to initialize app')
        setIsLoading(false)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Error Loading App</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Loading Sahaay</h2>
          <p className="text-blue-600">Privacy-first AI messaging companion</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sahaay</h1>
            <p className="text-sm text-gray-600">Privacy-first AI messaging</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Welcome Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="text-center">
              <Robot className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Welcome to Sahaay</h2>
              <p className="text-gray-600 text-sm mb-4">
                Your privacy-first AI messaging companion for India
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Start Chatting
              </button>
            </div>
          </div>

          {/* Features Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Gear className="w-5 h-5" />
              Key Features
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Privacy-first design</span>
              </div>
              <div className="flex items-center gap-2">
                <Robot className="w-4 h-4 text-blue-600" />
                <span>AI-powered assistance</span>
              </div>
              <div className="flex items-center gap-2">
                <ChatCircle className="w-4 h-4 text-purple-600" />
                <span>Hyperlocal intelligence</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold mb-4">System Status</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-green-600 text-lg font-semibold">✓</div>
              <div className="text-sm text-green-800">App Loaded</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-600 text-lg font-semibold">🔧</div>
              <div className="text-sm text-blue-800">Configurable</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-purple-600 text-lg font-semibold">🚀</div>
              <div className="text-sm text-purple-800">Ready to Use</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Sahaay - Privacy-first AI messaging for India</p>
          <p className="mt-1">
            This is a demo version. Configure your AI provider in settings for full functionality.
          </p>
        </footer>
      </main>
    </div>
  )
}