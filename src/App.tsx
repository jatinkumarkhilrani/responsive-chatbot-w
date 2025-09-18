import { MessagingApp } from './components/MessagingApp'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
    return (
        <ErrorBoundary>
            <MessagingApp />
        </ErrorBoundary>
    )
}

export default App