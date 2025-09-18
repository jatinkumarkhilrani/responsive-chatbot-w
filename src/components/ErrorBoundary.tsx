import { Component, ErrorInfo, ReactNode } from 'react'
import { Warning, ArrowCounterClockwise, House } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Warning className="w-5 h-5" />
                Something went wrong
              </CardTitle>
              <CardDescription>
                An unexpected error occurred in the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <Alert variant="destructive">
                  <AlertDescription className="font-mono text-sm">
                    {this.state.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  This error has been logged. You can try the following actions:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Reset the current component</li>
                  <li>Reload the entire application</li>
                  <li>Check your internet connection</li>
                  <li>Clear browser cache if the issue persists</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={this.handleReset} className="gap-2">
                  <ArrowCounterClockwise className="w-4 h-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleReload} className="gap-2">
                  <House className="w-4 h-4" />
                  Reload App
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Developer Information
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                    {this.state.error?.stack}
                    {'\n\n'}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}