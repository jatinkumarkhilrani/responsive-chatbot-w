import { MessagingApp } from './components/MessagingApp'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toaster } from 'sonner'

function App() {
    return (
        <ErrorBoundary>
            <MessagingApp />
            <Toaster position="top-right" richColors />
        </ErrorBoundary>
    )
}

export default App