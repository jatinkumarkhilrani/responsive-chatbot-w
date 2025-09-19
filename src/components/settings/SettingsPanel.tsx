import { useState } from 'react'
import { Gear, Robot, Shield, Trash, Download, Upload, TestTube, CheckCircle, Warning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useKV } from '../../hooks/useKV'
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
    } finally {
      setIsExporting(false)
    }
  }

  const clearAllData = async () => {
    const confirmMessage = 'Type "DELETE" to confirm you want to clear all data:'
    const userInput = prompt(confirmMessage)
    
    if (userInput === 'DELETE') {
      try {
        // Clear all KV data
        const keys = await (window as any).spark.kv.keys()
        for (const key of keys) {
          await (window as any).spark.kv.delete(key)
        }
        
        toast.success('All data cleared successfully!')
        setTimeout(() => window.location.reload(), 1000)
      } catch (error) {
        toast.error('Failed to clear data')
      }
    } else if (userInput !== null) {
      toast.error('Data deletion cancelled - incorrect confirmation')
    }
  }

  function getAIProviderStatus() {
    if (!aiConfig) {
      return { status: 'Built-in AI (Default)', color: 'default' }
    }

    // Handle ai-foundry provider specially
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
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 border-b border-border bg-background">
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Gear className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage privacy, AI configuration, and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-4 sm:p-6">
            <Tabs defaultValue="ai" className="space-y-6">
              {/* Tab Navigation */}
              <TabsList className="grid w-full grid-cols-4 gap-1 h-auto p-1 bg-muted">
                <TabsTrigger 
                  value="ai" 
                  className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-background flex items-center justify-center gap-2 flex-col sm:flex-row"
                >
                  <Robot className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">AI Config</span>
                  <span className="sm:hidden">AI</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="privacy" 
                  className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-background flex items-center justify-center gap-2 flex-col sm:flex-row"
                >
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Privacy</span>
                  <span className="sm:hidden">Privacy</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="data" 
                  className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-background flex items-center justify-center gap-2 flex-col sm:flex-row"
                >
                  <Download className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Data</span>
                  <span className="sm:hidden">Data</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="about" 
                  className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-background flex items-center justify-center gap-2 flex-col sm:flex-row"
                >
                  <Gear className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">About</span>
                  <span className="sm:hidden">About</span>
                </TabsTrigger>
              </TabsList>

              {/* AI Configuration Tab */}
              <TabsContent value="ai" className="space-y-6 mt-0">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Robot className="w-5 h-5" />
                      AI Provider Configuration
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure your AI provider for enhanced functionality and customization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Current Provider Status */}
                    <div className="w-full">
                      <div className="flex flex-col sm:flex-row items-start gap-3 p-4 border rounded-lg bg-card/50 w-full">
                        <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${
                          providerStatus.color === 'default' ? 'bg-success' : 'bg-secondary'
                        }`} />
                        <div className="min-w-0 flex-1 space-y-2">
                          <h3 className="font-medium text-sm sm:text-base leading-tight">Current Provider</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                            {aiConfig?.provider?.toUpperCase() || 'AI-FOUNDRY'} - {aiConfig?.model || 'gpt-4o'}
                          </p>
                        </div>
                        <div className="shrink-0 self-start">
                          <Badge variant={providerStatus.color as any} className="text-xs whitespace-nowrap">
                            {providerStatus.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Configuration Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      <AIConfigDialog />
                      <TestConfigButton aiConfig={aiConfig} />
                    </div>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Privacy Note:</strong> When using external AI providers, your API key is stored locally 
                        and never shared. All communication happens directly between your device and the AI provider.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* AI Features Status */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base sm:text-lg">AI Features Status</CardTitle>
                    <CardDescription className="text-sm">
                      Current status of AI-powered features based on your configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                      <div className="p-4 border rounded-lg bg-card/50 text-center min-h-[80px] flex flex-col justify-center">
                        <div className="text-sm sm:text-base font-bold mb-1">
                          {userConsents.moodDetection ? 'Enabled' : 'Disabled'}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Mood Detection</div>
                      </div>
                      <div className="p-4 border rounded-lg bg-card/50 text-center min-h-[80px] flex flex-col justify-center">
                        <div className="text-sm sm:text-base font-bold mb-1">
                          {userConsents.locationServices ? 'Enabled' : 'Disabled'}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Hyperlocal AI</div>
                      </div>
                      <div className="p-4 border rounded-lg bg-card/50 text-center min-h-[80px] flex flex-col justify-center">
                        <div className="text-sm sm:text-base font-bold mb-1">
                          {userConsents.groupSummary ? 'Enabled' : 'Disabled'}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Group Intelligence</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Settings Tab */}
              <TabsContent value="privacy" className="space-y-6 mt-0">
                <div className="w-full">
                  <PrivacySettings 
                    initialConsents={userConsents}
                    onComplete={onConsentUpdate}
                    isUpdate={true}
                  />
                </div>
              </TabsContent>

              {/* Data Management Tab */}
              <TabsContent value="data" className="space-y-6 mt-0">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base sm:text-lg">Data Overview</CardTitle>
                    <CardDescription className="text-sm">
                      Current data stored in your Sahaay app
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg space-y-2">
                        <div className="text-xl sm:text-2xl font-bold">{(chats || []).length}</div>
                        <div className="text-sm text-muted-foreground">Conversations</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg space-y-2">
                        <div className="text-xl sm:text-2xl font-bold">{(groups || []).length}</div>
                        <div className="text-sm text-muted-foreground">Groups</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg space-y-2">
                        <div className="text-xl sm:text-2xl font-bold">{(contextPacks || []).length}</div>
                        <div className="text-sm text-muted-foreground">Context Packs</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg space-y-2">
                        <div className="text-xl sm:text-2xl font-bold">{Object.keys(userConsents || {}).length}</div>
                        <div className="text-sm text-muted-foreground">Privacy Settings</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base sm:text-lg">Data Management</CardTitle>
                    <CardDescription className="text-sm">
                      Export or clear your data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={exportUserData} disabled={isExporting} className="gap-2 text-sm">
                        <Download className="w-4 h-4" />
                        {isExporting ? 'Exporting...' : 'Export All Data'}
                      </Button>
                      <Button variant="outline" className="gap-2 text-sm" disabled>
                        <Upload className="w-4 h-4" />
                        Import Data (Soon)
                      </Button>
                    </div>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Your data is stored locally on your device and never shared with external services 
                        without your explicit consent. Exports include all your conversations, settings, and preferences.
                      </AlertDescription>
                    </Alert>

                    <div className="pt-4 border-t space-y-3">
                      <h4 className="font-medium text-destructive text-sm sm:text-base">Danger Zone</h4>
                      <Button variant="destructive" onClick={clearAllData} className="w-full gap-2 text-sm">
                        <Trash className="w-4 h-4" />
                        Clear All Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-6 mt-0">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base sm:text-lg">About Sahaay</CardTitle>
                    <CardDescription className="text-sm">
                      Privacy-first AI messaging companion for India
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg space-y-2">
                        <h4 className="font-medium text-sm">Version</h4>
                        <p className="text-sm text-muted-foreground">1.0.0 Beta</p>
                      </div>
                      <div className="p-4 border rounded-lg space-y-2">
                        <h4 className="font-medium text-sm">Build</h4>
                        <p className="text-sm text-muted-foreground">{new Date().toISOString().split('T')[0]}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Key Features</h4>
                      <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
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
                      <AlertDescription className="text-sm">
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

    // For external providers, validate configuration first
    if (!aiConfig.endpoint || !aiConfig.apiKey || !aiConfig.model) {
      toast.error('Please configure API endpoint, key, and model first')
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus('idle')

    try {
      // Test connection based on provider
      const testPrompt = 'Test connection - respond with "Connection successful"'
      let response

      if (aiConfig.provider === 'azure') {
        response = await testAzureConnection(aiConfig, testPrompt)
      } else if (aiConfig.provider === 'openai') {
        response = await testOpenAIConnection(aiConfig, testPrompt)
      } else {
        throw new Error(`Unsupported provider: ${aiConfig.provider}`)
      }

      if (response && response.trim()) {
        setConnectionStatus('success')
        toast.success(`${aiConfig.provider.toUpperCase()} connection successful!`)
      } else {
        throw new Error('Empty response received')
      }
    } catch (error: any) {
      setConnectionStatus('error')
      toast.error(`Connection failed: ${error.message}`)
    } finally {
      setIsTestingConnection(false)
    }
  }

  const getButtonVariant = () => {
    if (connectionStatus === 'success') return 'default'
    if (connectionStatus === 'error') return 'destructive'
    return 'outline'
  }

  const getButtonText = () => {
    if (isTestingConnection) return 'Testing...'
    if (connectionStatus === 'success') return 'Connected'
    if (connectionStatus === 'error') return 'Failed'
    return 'Test Connection'
  }

  const getIcon = () => {
    if (isTestingConnection) return <TestTube className="w-4 h-4 animate-spin" />
    if (connectionStatus === 'success') return <CheckCircle className="w-4 h-4" />
    if (connectionStatus === 'error') return <Warning className="w-4 h-4" />
    return <TestTube className="w-4 h-4" />
  }

  return (
    <Button
      variant={getButtonVariant()}
      onClick={testConnection}
      disabled={isTestingConnection}
      className="gap-2 text-sm flex-1 sm:flex-none"
    >
      {getIcon()}
      {getButtonText()}
    </Button>
  )
}

// Helper functions for testing connections
async function testAzureConnection(config: any, prompt: string) {
  const response = await fetch(`${config.endpoint}/openai/deployments/${config.model}/chat/completions?api-version=2024-02-15-preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
      temperature: 0.1
    })
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

async function testOpenAIConnection(config: any, prompt: string) {
  const response = await fetch(`${config.endpoint}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
      temperature: 0.1
    })
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}