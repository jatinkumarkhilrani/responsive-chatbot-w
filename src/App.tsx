import { MessagingApp } from './components/MessagingApp'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toaster } from 'sonner'
import { initializeSparkMock } from './utils/sparkMock'
import { useEffect } from 'react'

function App() {
    useEffect(() => {
        // Initialize Spark mock for standalone deployment
        initializeSparkMock()
    }, [])

    return (
        <ErrorBoundary>
            <MessagingApp />
            <Toaster position="top-right" richColors />
        </ErrorBoundary>
    )
}

export default App