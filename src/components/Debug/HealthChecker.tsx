import { useState } from 'react'
import { Wrench, CheckCircle, Warning, Info } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface HealthIssue {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  canAutoFix: boolean
  fixAction?: () => Promise<void>
}

export function HealthChecker() {
  const [issues, setIssues] = useState<HealthIssue[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [isFixing, setIsFixing] = useState<string | null>(null)
  
  const [chats] = useKV<any[]>('user-chats', [])
  const [aiConfig] = useKV<any>('ai-config', null)

  const scanForIssues = async () => {
    setIsScanning(true)
    const detectedIssues: HealthIssue[] = []

    try {
      // Check 1: Duplicate chats
      const chatIds = (chats || []).map((chat: any) => chat.id)
      const duplicateIds = chatIds.filter((id: string, index: number) => chatIds.indexOf(id) !== index)
      
      if (duplicateIds.length > 0) {
        detectedIssues.push({
          id: 'duplicate-chats',
          title: 'Duplicate Chat IDs Found',
          description: `Found ${duplicateIds.length} duplicate chat entries that could cause issues`,
          severity: 'medium',
          canAutoFix: true,
          fixAction: async () => {
            const uniqueChats = (chats || []).filter((chat: any, index: number) => 
              chatIds.indexOf(chat.id) === index
            )
            await (window as any).spark.kv.set('user-chats', uniqueChats)
            toast.success('Duplicate chats removed')
          }
        })
      }

      // Check 2: Large message history
      const messageKeys = await (window as any).spark.kv.keys()
      const messageKeyCount = messageKeys.filter((key: string) => key.startsWith('chat-messages-')).length
      
      if (messageKeyCount > 20) {
        detectedIssues.push({
          id: 'large-message-history',
          title: 'Large Message History',
          description: `${messageKeyCount} chat message histories stored. This may slow down the app`,
          severity: 'low',
          canAutoFix: true,
          fixAction: async () => {
            const oldMessageKeys = messageKeys
              .filter((key: string) => key.startsWith('chat-messages-'))
              .slice(10) // Keep only latest 10 chats
            
            for (const key of oldMessageKeys) {
              await (window as any).spark.kv.delete(key)
            }
            toast.success(`Cleaned up ${oldMessageKeys.length} old message histories`)
          }
        })
      }

      // Check 3: AI Configuration issues
      if (!aiConfig || (!aiConfig.endpoint && aiConfig.provider !== 'ai-foundry')) {
        detectedIssues.push({
          id: 'incomplete-ai-config',
          title: 'Incomplete AI Configuration',
          description: 'AI provider is not fully configured, which may cause response failures',
          severity: 'high',
          canAutoFix: false
        })
      }

      // Check 4: Missing required permissions
      const userConsents = await (window as any).spark.kv.get('user-consents') || {}
      if (!userConsents.dataProcessing) {
        detectedIssues.push({
          id: 'missing-permissions',
          title: 'Missing Core Permissions',
          description: 'Core data processing permission not granted',
          severity: 'high',
          canAutoFix: false
        })
      }

      // Check 5: Storage quota issues
      try {
        const storageEstimate = await navigator.storage?.estimate?.()
        if (storageEstimate && storageEstimate.usage && storageEstimate.quota) {
          const usagePercent = (storageEstimate.usage / storageEstimate.quota) * 100
          if (usagePercent > 80) {
            detectedIssues.push({
              id: 'storage-quota',
              title: 'Storage Almost Full',
              description: `Using ${Math.round(usagePercent)}% of available storage`,
              severity: 'medium',
              canAutoFix: true,
              fixAction: async () => {
                // Clear old temporary data
                const allKeys = await (window as any).spark.kv.keys()
                const tempKeys = allKeys.filter((key: string) => 
                  key.startsWith('temp-') || key.startsWith('cache-')
                )
                
                for (const key of tempKeys) {
                  await (window as any).spark.kv.delete(key)
                }
                toast.success('Temporary storage cleared')
              }
            })
          }
        }
      } catch (error) {
        // Storage API not available, skip this check
      }

      // Check 6: Orphaned data
      const contextPacks = await (window as any).spark.kv.get('context-packs') || []
      const chatMessageKeys = messageKeys.filter((key: string) => key.startsWith('chat-messages-'))
      const activeChats = (chats || []).map((chat: any) => `chat-messages-${chat.id}`)
      const orphanedMessageKeys = chatMessageKeys.filter((key: string) => !activeChats.includes(key))
      
      if (orphanedMessageKeys.length > 0) {
        detectedIssues.push({
          id: 'orphaned-messages',
          title: 'Orphaned Message Data',
          description: `Found ${orphanedMessageKeys.length} message histories for deleted chats`,
          severity: 'low',
          canAutoFix: true,
          fixAction: async () => {
            for (const key of orphanedMessageKeys) {
              await (window as any).spark.kv.delete(key)
            }
            toast.success(`Cleaned up ${orphanedMessageKeys.length} orphaned message histories`)
          }
        })
      }

      setIssues(detectedIssues)

      if (detectedIssues.length === 0) {
        toast.success('No issues found! Your app is running smoothly.')
      } else {
        toast.info(`Found ${detectedIssues.length} issue(s) that could be addressed`)
      }

    } catch (error) {
      toast.error('Error scanning for issues')
      console.error('Health check error:', error)
    } finally {
      setIsScanning(false)
    }
  }

  const fixIssue = async (issue: HealthIssue) => {
    if (!issue.fixAction) return

    setIsFixing(issue.id)
    try {
      await issue.fixAction()
      setIssues(prev => prev.filter(i => i.id !== issue.id))
    } catch (error) {
      toast.error(`Failed to fix: ${issue.title}`)
      console.error('Fix error:', error)
    } finally {
      setIsFixing(null)
    }
  }

  const fixAllIssues = async () => {
    const fixableIssues = issues.filter(issue => issue.canAutoFix)
    
    for (const issue of fixableIssues) {
      await fixIssue(issue)
    }
    
    toast.success(`Fixed ${fixableIssues.length} issues`)
  }

  const getSeverityColor = (severity: HealthIssue['severity']) => {
    switch (severity) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getSeverityIcon = (severity: HealthIssue['severity']) => {
    switch (severity) {
      case 'high': return <Warning className="w-4 h-4 text-red-500" />
      case 'medium': return <Warning className="w-4 h-4 text-yellow-500" />
      case 'low': return <Info className="w-4 h-4 text-blue-500" />
      default: return <Info className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-6 h-6" />
            Health Checker
          </h1>
          <p className="text-muted-foreground">
            Scan and fix common issues in your Sahaay app
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={scanForIssues} disabled={isScanning}>
            {isScanning ? 'Scanning...' : 'Scan for Issues'}
          </Button>
          {issues.length > 0 && issues.some(i => i.canAutoFix) && (
            <Button onClick={fixAllIssues} variant="outline">
              Fix All
            </Button>
          )}
        </div>
      </div>

      {issues.length === 0 && !isScanning && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">All Good!</h3>
            <p className="text-muted-foreground">
              Run a scan to check for any issues with your app
            </p>
          </CardContent>
        </Card>
      )}

      {issues.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {issues.filter(i => i.severity === 'high').length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {issues.filter(i => i.severity === 'medium').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Medium Priority</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {issues.filter(i => i.severity === 'low').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Low Priority</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            {issues.map((issue) => (
              <Card key={issue.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(issue.severity)}
                      <div>
                        <h3 className="font-medium">{issue.title}</h3>
                        <p className="text-sm text-muted-foreground">{issue.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(issue.severity) as any}>
                        {issue.severity.toUpperCase()}
                      </Badge>
                      {issue.canAutoFix && (
                        <Button
                          onClick={() => fixIssue(issue)}
                          disabled={isFixing === issue.id}
                          size="sm"
                        >
                          {isFixing === issue.id ? 'Fixing...' : 'Fix'}
                        </Button>
                      )}
                    </div>
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
          This tool automatically detects and can fix common issues like duplicate data, 
          storage problems, and configuration errors. Run regular scans to keep your app optimized.
        </AlertDescription>
      </Alert>
    </div>
  )
}