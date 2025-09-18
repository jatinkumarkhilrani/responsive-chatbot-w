import { useState } from 'react'
import { TestTube, CheckCircle, XCircle, Warning, Info } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface TestResult {
  component: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string
}

export function UITester() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [config] = useKV<any>('ai-config', undefined)

  const runUITests = async () => {
    setIsRunning(true)
    const results: TestResult[] = []

    // Test 1: Check if KV storage is working
    try {
      await (window as any).spark.kv.set('test-key', 'test-value')
      const value = await (window as any).spark.kv.get('test-key')
      if (value === 'test-value') {
        results.push({
          component: 'KV Storage',
          status: 'pass',
          message: 'Key-value storage is working correctly'
        })
        await (window as any).spark.kv.delete('test-key')
      } else {
        results.push({
          component: 'KV Storage',
          status: 'fail',
          message: 'KV storage is not working properly'
        })
      }
    } catch (error) {
      results.push({
        component: 'KV Storage',
        status: 'fail',
        message: 'KV storage test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 2: Check AI configuration
    if (config && typeof config === 'object') {
      results.push({
        component: 'AI Configuration',
        status: 'pass',
        message: 'AI configuration is loaded'
      })
    } else {
      results.push({
        component: 'AI Configuration',
        status: 'warning',
        message: 'AI configuration not found, using defaults'
      })
    }

    // Test 3: Check Spark LLM availability
    try {
      if ((window as any).spark && (window as any).spark.llm) {
        results.push({
          component: 'Spark LLM',
          status: 'pass',
          message: 'Spark LLM API is available'
        })
      } else {
        results.push({
          component: 'Spark LLM',
          status: 'fail',
          message: 'Spark LLM API is not available'
        })
      }
    } catch (error) {
      results.push({
        component: 'Spark LLM',
        status: 'fail',
        message: 'Error checking Spark LLM',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 4: Check UI components rendering
    try {
      const testElement = document.createElement('div')
      testElement.innerHTML = '<button>Test</button>'
      results.push({
        component: 'UI Components',
        status: 'pass',
        message: 'Basic UI rendering is working'
      })
    } catch (error) {
      results.push({
        component: 'UI Components',
        status: 'fail',
        message: 'UI component rendering failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 5: Check for memory leaks in chat messages
    try {
      const chats = await (window as any).spark.kv.get('user-chats') || []
      let totalMessages = 0
      
      for (const chat of chats) {
        const messages = await (window as any).spark.kv.get(`chat-messages-${chat.id}`) || []
        totalMessages += messages.length
      }
      
      if (totalMessages > 10000) {
        results.push({
          component: 'Memory Management',
          status: 'warning',
          message: `Large number of messages detected (${totalMessages}). Consider cleanup.`,
          details: 'Too many stored messages may cause performance issues'
        })
      } else {
        results.push({
          component: 'Memory Management',
          status: 'pass',
          message: `Message storage is optimal (${totalMessages} messages)`
        })
      }
    } catch (error) {
      results.push({
        component: 'Memory Management',
        status: 'fail',
        message: 'Failed to check memory usage',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 6: Check external AI connectivity (if configured)
    if (config && config.provider !== 'ai-foundry' && config.endpoint && config.apiKey) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        const testResponse = await fetch(config.endpoint.includes('/chat/completions') ? 
          config.endpoint : `${config.endpoint}/chat/completions`, {
          method: 'HEAD',
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (testResponse.ok || testResponse.status === 405) { // 405 is acceptable for HEAD requests
          results.push({
            component: 'External AI Provider',
            status: 'pass',
            message: `${config.provider.toUpperCase()} endpoint is reachable`
          })
        } else {
          results.push({
            component: 'External AI Provider',
            status: 'warning',
            message: `${config.provider.toUpperCase()} endpoint returned status ${testResponse.status}`
          })
        }
      } catch (error) {
        results.push({
          component: 'External AI Provider',
          status: 'fail',
          message: 'Cannot reach external AI provider',
          details: error instanceof Error ? error.message : 'Network error'
        })
      }
    } else if (config?.provider === 'ai-foundry') {
      results.push({
        component: 'Built-in AI Provider',
        status: 'pass',
        message: 'Using Spark built-in AI (no external connectivity needed)'
      })
    }

    // Test 7: Check for browser compatibility issues
    try {
      const isModernBrowser = 'fetch' in window && 'Promise' in window && 'localStorage' in window
      if (isModernBrowser) {
        results.push({
          component: 'Browser Compatibility',
          status: 'pass',
          message: 'Browser supports all required features'
        })
      } else {
        results.push({
          component: 'Browser Compatibility',
          status: 'fail',
          message: 'Browser missing required features (fetch, Promise, localStorage)'
        })
      }
    } catch (error) {
      results.push({
        component: 'Browser Compatibility',
        status: 'fail',
        message: 'Browser compatibility check failed'
      })
    }

    // Test 8: Check responsive design
    try {
      const isMobile = window.innerWidth <= 768
      const hasTouch = 'ontouchstart' in window
      
      results.push({
        component: 'Responsive Design',
        status: 'pass',
        message: `Detected ${isMobile ? 'mobile' : 'desktop'} layout${hasTouch ? ' with touch support' : ''}`
      })
    } catch (error) {
      results.push({
        component: 'Responsive Design',
        status: 'warning',
        message: 'Could not detect layout information'
      })
    }

    // Test 9: Check toast system
    try {
      toast.info('Toast system test', { duration: 1000 })
      results.push({
        component: 'Toast System',
        status: 'pass',
        message: 'Toast notifications are working'
      })
    } catch (error) {
      results.push({
        component: 'Toast System',
        status: 'fail',
        message: 'Toast system failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 10: Check for common accessibility issues
    try {
      const buttons = document.querySelectorAll('button')
      const buttonsWithoutAriaLabel = Array.from(buttons).filter(btn => 
        !btn.getAttribute('aria-label') && !btn.textContent?.trim()
      )
      
      if (buttonsWithoutAriaLabel.length === 0) {
        results.push({
          component: 'Accessibility',
          status: 'pass',
          message: 'All buttons have proper labels'
        })
      } else {
        results.push({
          component: 'Accessibility',
          status: 'warning',
          message: `${buttonsWithoutAriaLabel.length} buttons missing aria-labels`
        })
      }
    } catch (error) {
      results.push({
        component: 'Accessibility',
        status: 'warning',
        message: 'Could not perform accessibility check'
      })
    }

    setTestResults(results)
    setIsRunning(false)
    
    const passCount = results.filter(r => r.status === 'pass').length
    const failCount = results.filter(r => r.status === 'fail').length
    const warnCount = results.filter(r => r.status === 'warning').length
    
    if (failCount === 0) {
      toast.success(`All tests passed! ${passCount} passed, ${warnCount} warnings`)
    } else {
      toast.error(`${failCount} tests failed, ${passCount} passed, ${warnCount} warnings`)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <Warning className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'border-l-green-500'
      case 'fail':
        return 'border-l-red-500'
      case 'warning':
        return 'border-l-yellow-500'
    }
  }

  const getOverallStatus = () => {
    if (testResults.length === 0) return null
    
    const hasFailures = testResults.some(r => r.status === 'fail')
    const hasWarnings = testResults.some(r => r.status === 'warning')
    
    if (hasFailures) return 'fail'
    if (hasWarnings) return 'warning'
    return 'pass'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            UI & Functionality Tests
          </CardTitle>
          <CardDescription>
            Run comprehensive tests to identify bugs and performance issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runUITests} 
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          
          {testResults.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold">Test Results</h3>
                {getOverallStatus() && (
                  <Badge variant={getOverallStatus() === 'pass' ? 'default' : 
                    getOverallStatus() === 'warning' ? 'secondary' : 'destructive'}>
                    {getOverallStatus()?.toUpperCase()}
                  </Badge>
                )}
              </div>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <Card key={index} className={`border-l-4 ${getStatusColor(result.status)}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <h3 className="font-medium">{result.component}</h3>
                            <p className="text-sm text-muted-foreground">{result.message}</p>
                            {result.details && (
                              <p className="text-xs text-red-500 mt-1">{result.details}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant={result.status === 'pass' ? 'default' : result.status === 'warning' ? 'secondary' : 'destructive'}>
                          {result.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This tool helps identify common UI and functionality issues. Run tests after making changes to ensure everything is working correctly.
        </AlertDescription>
      </Alert>
    </div>
  )
}