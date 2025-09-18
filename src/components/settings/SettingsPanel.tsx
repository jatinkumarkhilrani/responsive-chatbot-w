import { useState } from 'react'
import { Gear, Robot, Shield, Trash, Download, Upload, TestTube, CheckCircle, Warning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { AIConfigDialog } from '../ai/AIConfigDialog'
import { PrivacySettings } from '../privacy/PrivacySettings'

interface SettingsPanelProps {
  userConsents: Record<string, boolean>
  onConsentUpdate: (consents: Record<string, boolean>) => void
}

export function SettingsPanel({ userConsents, onConsentUpdate }: SettingsPanelProps) {
  const [chats] = useKV<any[]>('user-chats', [])
  const [groups] = useKV<any[]>('user-groups', [])
  const [contextPacks] = useKV<any[]>('context-packs', [])
  const [aiConfig] = useKV<any>('ai-config', null)
  const [isExporting, setIsExporting] = useState(false)

  const exportUserData = async () => {
    setIsExporting(true)
    try {
      const userData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        userConsents,
        chats: chats || [],
        groups: groups || [],
        contextPacks: contextPacks || [],
        aiConfig: aiConfig || null
      }

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sahaay-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Data exported successfully!')
    } catch (error) {
      toast.error('Failed to export data')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const clearAllData = async () => {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return
    }

    try {
      // Clear all KV storage
      const keys = await (window as any).spark.kv.keys()
      const keysToDelete = keys.filter((key: string) => 
        key.startsWith('user-') || 
        key.startsWith('chat-') || 
        key.startsWith('ai-') || 
        key.startsWith('context-') ||
        key.startsWith('active-')
      )
      
      for (const key of keysToDelete) {
        try {
          await (window as any).spark.kv.delete(key)
        } catch (error) {
          console.warn(`Failed to delete key ${key}:`, error)
        }
      }

      toast.success('All data cleared successfully!')
      
      // Reload the page to reset the app state
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      toast.error('Failed to clear data')
      console.error('Clear data error:', error)
    }
  }

  const getAIProviderStatus = () => {
    if (!aiConfig) {
      return { status: 'Not configured', color: 'secondary' }
    }

    // For ai-foundry, check if it's using built-in or custom endpoint
    if (aiConfig.provider === 'ai-foundry') {
      if (!aiConfig.endpoint && !aiConfig.apiKey) {
        return { status: 'Spark AI (Built-in)', color: 'default' }
      } else if (aiConfig.endpoint && aiConfig.apiKey) {
        return { status: 'AI Foundry (Custom)', color: 'default' }
      } else {
        return { status: 'AI Foundry (Incomplete)', color: 'secondary' }
      }
    }

    // For external providers, both endpoint and API key are required
    if (aiConfig.endpoint && aiConfig.apiKey && aiConfig.model) {
      return { status: `${aiConfig.provider.toUpperCase()} - Ready`, color: 'default' }
    }

    if (aiConfig.endpoint || aiConfig.apiKey) {
      return { status: `${aiConfig.provider.toUpperCase()} - Incomplete`, color: 'secondary' }
    }

    return { status: `${aiConfig.provider.toUpperCase()} - Not configured`, color: 'secondary' }
  }

  const providerStatus = getAIProviderStatus()

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Gear className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your privacy, AI configuration, and app preferences
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="ai" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ai">AI Configuration</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Consent</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Robot className="w-5 h-5" />
                  AI Provider Configuration
                </CardTitle>
                <CardDescription>
                  Configure your AI provider for enhanced functionality and customization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      providerStatus.color === 'default' ? 'bg-success' : 'bg-secondary'
                    }`} />
                    <div>
                      <h3 className="font-medium">Current Provider</h3>
                      <p className="text-sm text-muted-foreground">
                        {aiConfig?.provider?.toUpperCase() || 'AI-FOUNDRY'} - {aiConfig?.model || 'gpt-4o'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={providerStatus.color as any}>
                    {providerStatus.status}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <AIConfigDialog />
                  <TestConfigButton aiConfig={aiConfig} />
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Privacy Note:</strong> When using external AI providers, your API key is stored locally 
                    and never shared. All communication happens directly between your device and the AI provider.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Features Status</CardTitle>
                <CardDescription>
                  Current status of AI-powered features based on your configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-bold">
                      {userConsents.moodDetection ? 'Enabled' : 'Disabled'}
                    </div>
                    <div className="text-sm text-muted-foreground">Mood Detection</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-bold">
                      {userConsents.locationServices ? 'Enabled' : 'Disabled'}
                    </div>
                    <div className="text-sm text-muted-foreground">Hyperlocal AI</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-bold">
                      {userConsents.groupSummary ? 'Enabled' : 'Disabled'}
                    </div>
                    <div className="text-sm text-muted-foreground">Group Intelligence</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <PrivacySettings 
              initialConsents={userConsents}
              onComplete={onConsentUpdate}
              isUpdate={true}
            />
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Overview</CardTitle>
                <CardDescription>
                  Current data stored in your Sahaay app
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{(chats || []).length}</div>
                    <div className="text-sm text-muted-foreground">Conversations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{(groups || []).length}</div>
                    <div className="text-sm text-muted-foreground">Groups</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{(contextPacks || []).length}</div>
                    <div className="text-sm text-muted-foreground">Context Packs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Object.keys(userConsents || {}).length}</div>
                    <div className="text-sm text-muted-foreground">Privacy Settings</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Export or clear your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={exportUserData} disabled={isExporting} className="gap-2">
                    <Download className="w-4 h-4" />
                    {isExporting ? 'Exporting...' : 'Export All Data'}
                  </Button>
                  <Button variant="outline" className="gap-2" disabled>
                    <Upload className="w-4 h-4" />
                    Import Data (Coming Soon)
                  </Button>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your data is stored locally on your device and never shared with external services 
                    without your explicit consent. Exports include all your conversations, settings, and preferences.
                  </AlertDescription>
                </Alert>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-destructive mb-2">Danger Zone</h4>
                  <Button variant="destructive" onClick={clearAllData} className="gap-2">
                    <Trash className="w-4 h-4" />
                    Clear All Data
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will permanently delete all your conversations, groups, and settings. This action cannot be undone.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About Sahaay</CardTitle>
                <CardDescription>
                  Privacy-first AI messaging companion for India
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Version</h4>
                    <p className="text-sm text-muted-foreground">1.0.0 Beta</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Build</h4>
                    <p className="text-sm text-muted-foreground">{new Date().toISOString().split('T')[0]}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Key Features</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Privacy-first design with local data storage</li>
                    <li>Configurable AI providers (Azure, OpenAI, AI Foundry)</li>
                    <li>Hyperlocal intelligence for Indian context</li>
                    <li>Mood detection and contextual responses</li>
                    <li>Group intelligence and conversation summaries</li>
                    <li>Bill processing and payment assistance</li>
                    <li>Route optimization and traffic insights</li>
                  </ul>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Sahaay is designed with privacy as the foundation. All data processing happens on your device, 
                    and you have complete control over what information is shared and processed.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function TestConfigButton({ aiConfig }: { aiConfig: any }) {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const testConnection = async () => {
    if (!aiConfig) {
      toast.error('AI configuration not found')
      return
    }

    // For ai-foundry with no custom endpoint, use built-in AI
    if (aiConfig.provider === 'ai-foundry' && !aiConfig.endpoint && !aiConfig.apiKey) {
      setIsTestingConnection(true)
      try {
        const testPrompt = (window as any).spark.llmPrompt`Test connection - respond with "Connection successful"`
        const response = await (window as any).spark.llm(testPrompt, aiConfig.model || 'gpt-4o')
        
        if (response && response.trim()) {
          setConnectionStatus('success')
          toast.success('Built-in AI connected successfully!')
        } else {
          throw new Error('Empty response received')
        }
      } catch (error) {
        setConnectionStatus('error')
        toast.error('Connection failed: Built-in AI unavailable')
      } finally {
        setIsTestingConnection(false)
      }
      return
    }

    // For external providers, require endpoint and API key
    if (!aiConfig.endpoint || !aiConfig.apiKey) {
      toast.error('Please configure endpoint and API key first')
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus('idle')

    try {
      let apiUrl = aiConfig.endpoint
      let headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      let requestBody: any

      // Configure request based on provider
      switch (aiConfig.provider) {
        case 'azure':
          apiUrl = `${aiConfig.endpoint}/openai/deployments/${aiConfig.model || 'gpt-4o'}/chat/completions?api-version=2024-08-01-preview`
          headers['api-key'] = aiConfig.apiKey
          requestBody = {
            messages: [{ role: 'user', content: 'Test connection' }],
            max_tokens: 10
          }
          break

        case 'openai':
          apiUrl = `${aiConfig.endpoint}/v1/chat/completions`
          headers['Authorization'] = `Bearer ${aiConfig.apiKey}`
          requestBody = {
            model: aiConfig.model || 'gpt-4o',
            messages: [{ role: 'user', content: 'Test connection' }],
            max_tokens: 10
          }
          break

        case 'ai-foundry':
        case 'custom':
          apiUrl = `${aiConfig.endpoint}/chat/completions`
          headers['Authorization'] = `Bearer ${aiConfig.apiKey}`
          requestBody = {
            model: aiConfig.model || 'gpt-4o',
            messages: [{ role: 'user', content: 'Test connection' }],
            max_tokens: 10
          }
          break

        default:
          throw new Error(`Unsupported AI provider: ${aiConfig.provider}`)
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        setConnectionStatus('success')
        toast.success(`${aiConfig.provider.toUpperCase()} connected successfully!`)
      } else {
        throw new Error('Invalid response format from AI provider')
      }
    } catch (error: any) {
      setConnectionStatus('error')
      const errorMessage = error?.message || 'Unknown connection error'
      toast.error(`Connection failed: ${errorMessage}`)
      console.error('AI connection test failed:', error)
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2"
      onClick={testConnection}
      disabled={isTestingConnection}
    >
      {connectionStatus === 'success' ? (
        <CheckCircle className="w-4 h-4 text-success" />
      ) : connectionStatus === 'error' ? (
        <Warning className="w-4 h-4 text-destructive" />
      ) : (
        <TestTube className="w-4 h-4" />
      )}
      {isTestingConnection ? 'Testing...' : 'Test Connection'}
    </Button>
  )
}