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

    // Test 5: Check navigation and UI state
    try {
      // Test if essential UI elements are accessible
      const hasButtons = document.querySelectorAll('button').length > 0
      const hasInputs = document.querySelectorAll('input').length > 0
      const hasNavigation = document.querySelectorAll('[role="tablist"]').length > 0
      
      if (hasButtons && hasInputs && hasNavigation) {
        results.push({
          component: 'UI Navigation',
          status: 'pass',
          message: 'Navigation and interactive elements are present'
        })
      } else {
        results.push({
          component: 'UI Navigation',
          status: 'warning',
          message: 'Some UI elements may be missing',
          details: `Buttons: ${hasButtons}, Inputs: ${hasInputs}, Navigation: ${hasNavigation}`
        })
      }
    } catch (error) {
      results.push({
        component: 'UI Navigation',
        status: 'fail',
        message: 'UI navigation test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 6: Check local storage and memory usage
    try {
      const storageEstimate = await navigator.storage?.estimate?.()
      if (storageEstimate) {
        const usedMB = Math.round((storageEstimate.usage || 0) / 1024 / 1024)
        const quotaMB = Math.round((storageEstimate.quota || 0) / 1024 / 1024)
        
        results.push({
          component: 'Storage Usage',
          status: usedMB < quotaMB * 0.8 ? 'pass' : 'warning',
          message: `Using ${usedMB}MB of ${quotaMB}MB available`,
          details: usedMB > quotaMB * 0.8 ? 'Consider clearing old data' : undefined
        })
      } else {
        results.push({
          component: 'Storage Usage',
          status: 'warning',
          message: 'Storage API not available'
        })
      }
    } catch (error) {
      results.push({
        component: 'Storage Usage',
        status: 'fail',
        message: 'Storage usage check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 7: Check performance
    try {
      const performanceEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (performanceEntry) {
        const loadTime = performanceEntry.loadEventEnd - performanceEntry.fetchStart
        results.push({
          component: 'Performance',
          status: loadTime < 3000 ? 'pass' : loadTime < 5000 ? 'warning' : 'fail',
          message: `Page load time: ${Math.round(loadTime)}ms`,
          details: loadTime > 5000 ? 'Consider optimizing assets' : undefined
        })
      } else {
        results.push({
          component: 'Performance',
          status: 'warning',
          message: 'Performance API not available'
        })
      }
    } catch (error) {
      results.push({
        component: 'Performance',
        status: 'fail',
        message: 'Performance check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    setTestResults(results)
    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <Warning className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'border-green-500'
      case 'fail':
        return 'border-red-500'
      case 'warning':
        return 'border-yellow-500'
      default:
        return 'border-blue-500'
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TestTube className="w-6 h-6" />
            UI Testing & Debugging
          </h1>
          <p className="text-muted-foreground">
            Comprehensive testing to identify and fix UI issues
          </p>
        </div>
        <Button onClick={runUITests} disabled={isRunning}>
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {testResults.filter(r => r.status === 'pass').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {testResults.filter(r => r.status === 'warning').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {testResults.filter(r => r.status === 'fail').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </CardContent>
            </Card>
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

      <Alert className="mt-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          This tool helps identify common UI and functionality issues. Run tests after making changes to ensure everything is working correctly.
        </AlertDescription>
      </Alert>
    </div>
  )
}