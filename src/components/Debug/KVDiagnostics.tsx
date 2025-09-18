import { useState, useEffect } from 'react'
import { Database, CheckCircle, X, Warning, TestTube } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { sanitizeKVKey, isValidChatId } from '../../utils/errorHandling'

interface KVDiagnostic {
  key: string
  status: 'exists' | 'missing' | 'error'
  value?: any
  error?: string
}

export function KVDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<KVDiagnostic[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [allKeys, setAllKeys] = useState<string[]>([])

  const runDiagnostics = async () => {
    setIsRunning(true)
    setDiagnostics([])
    
    try {
      // Get all KV keys first
      const keys = await (window as any).spark.kv.keys()
      setAllKeys(keys)
      
      // Test specific important keys
      const importantKeys = [
        'user-consents',
        'ai-config',
        'user-chats',
        'user-groups',
        'context-packs',
        'active-chat-id'
      ]
      
      const results: KVDiagnostic[] = []
      
      for (const key of importantKeys) {
        try {
          const value = await (window as any).spark.kv.get(key)
          results.push({
            key,
            status: value !== undefined ? 'exists' : 'missing',
            value
          })
        } catch (error) {
          results.push({
            key,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      // Check for chat message keys
      const chatMessageKeys = keys.filter(key => key.startsWith('chat-messages-'))
      
      for (const key of chatMessageKeys.slice(0, 5)) { // Only check first 5 to avoid overwhelming
        try {
          const value = await (window as any).spark.kv.get(key)
          results.push({
            key,
            status: Array.isArray(value) ? 'exists' : 'error',
            value: Array.isArray(value) ? `${value.length} messages` : 'Invalid format',
            error: Array.isArray(value) ? undefined : 'Expected array of messages'
          })
        } catch (error) {
          results.push({
            key,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      setDiagnostics(results)
      toast.success('KV diagnostics completed')
    } catch (error) {
      console.error('Diagnostics failed:', error)
      toast.error('Failed to run diagnostics')
    } finally {
      setIsRunning(false)
    }
  }

  const testKVOperations = async () => {
    try {
      const testChatId = 'chat-' + Date.now()
      const sanitizedId = sanitizeKVKey(testChatId)
      const kvKey = `chat-messages-${sanitizedId}`
      
      console.log('Testing KV operations:', {
        originalChatId: testChatId,
        sanitizedId,
        kvKey,
        isValidId: isValidChatId(testChatId)
      })
      
      // Test message creation
      const testMessages = [
        {
          id: 'msg-test',
          content: 'Test message',
          sender: 'user',
          timestamp: new Date().toISOString(),
          type: 'text'
        }
      ]
      
      await (window as any).spark.kv.set(kvKey, testMessages)
      console.log('Successfully saved test messages')
      
      const retrieved = await (window as any).spark.kv.get(kvKey)
      console.log('Retrieved messages:', retrieved)
      
      await (window as any).spark.kv.delete(kvKey)
      console.log('Successfully cleaned up test data')
      
      toast.success('KV operations test passed!')
    } catch (error) {
      console.error('KV operations test failed:', error)
      toast.error('KV operations test failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const getStatusIcon = (status: KVDiagnostic['status']) => {
    switch (status) {
      case 'exists': return <CheckCircle className="w-4 h-4 text-success" />
      case 'missing': return <Warning className="w-4 h-4 text-yellow-500" />
      case 'error': return <X className="w-4 h-4 text-destructive" />
    }
  }

  const getStatusColor = (status: KVDiagnostic['status']) => {
    switch (status) {
      case 'exists': return 'default'
      case 'missing': return 'secondary'
      case 'error': return 'destructive'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            KV Storage Diagnostics
          </CardTitle>
          <CardDescription>
            Detailed analysis of key-value storage operations and data integrity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runDiagnostics} disabled={isRunning} className="gap-2">
              <TestTube className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run Diagnostics'}
            </Button>
            <Button onClick={testKVOperations} variant="outline" className="gap-2">
              <Database className="w-4 h-4" />
              Test KV Operations
            </Button>
          </div>

          {allKeys.length > 0 && (
            <Alert>
              <Database className="w-4 h-4" />
              <AlertDescription>
                Found {allKeys.length} keys in KV storage. 
                {allKeys.length > 20 && ' Showing analysis for important keys only.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {diagnostics.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Storage Analysis Results</h3>
          
          {diagnostics.map((diagnostic, index) => (
            <Card key={index} className={`border-l-4 ${
              diagnostic.status === 'exists' ? 'border-l-success' :
              diagnostic.status === 'missing' ? 'border-l-yellow-500' :
              'border-l-destructive'
            }`}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnostic.status)}
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {diagnostic.key}
                    </code>
                  </div>
                  <Badge variant={getStatusColor(diagnostic.status) as any}>
                    {diagnostic.status}
                  </Badge>
                </div>
                
                {diagnostic.value && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Value:</strong> {
                      typeof diagnostic.value === 'string' 
                        ? diagnostic.value 
                        : JSON.stringify(diagnostic.value, null, 2).substring(0, 200)
                    }
                  </div>
                )}
                
                {diagnostic.error && (
                  <div className="text-sm text-destructive mt-1">
                    <strong>Error:</strong> {diagnostic.error}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {allKeys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Storage Keys</CardTitle>
            <CardDescription>
              Complete list of keys currently stored in KV storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-1 gap-1">
                {allKeys.map((key, index) => (
                  <code key={index} className="text-xs bg-muted px-2 py-1 rounded">
                    {key}
                  </code>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}