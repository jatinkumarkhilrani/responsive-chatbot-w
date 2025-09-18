import { useState } from 'react'
import { Robot, Gear, TestTube, Warning, CheckCircle, Shield } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { validateAIConfig, handleAIError } from '../../utils/errorHandling'

interface AIConfig {
  provider: 'azure' | 'openai' | 'ai-foundry' | 'custom'
  endpoint: string
  apiKey: string
  model: string
  temperature: number
  systemPrompt: string
  moodDetectionEnabled: boolean
  hyperlocalEnabled: boolean
  groupIntelligenceEnabled: boolean
}

const defaultConfig: AIConfig = {
  provider: 'ai-foundry',
  endpoint: '',
  apiKey: '',
  model: 'gpt-4o',
  temperature: 0.7,
  systemPrompt: `You are Sahaay, a privacy-first AI assistant for India. Be helpful, respectful, and culturally aware. Always:
1. Respect user privacy and ask for consent
2. Provide hyperlocal Indian context when relevant
3. Use appropriate disclaimers for medical/financial advice
4. Be concise and actionable
5. Detect mood and adapt communication style accordingly`,
  moodDetectionEnabled: true,
  hyperlocalEnabled: true,
  groupIntelligenceEnabled: true
}

export function AIConfigDialog() {
  const [config, setConfig] = useKV<AIConfig>('ai-config', defaultConfig)
  const [isOpen, setIsOpen] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Ensure config is never undefined by using defaultConfig as fallback
  const currentConfig = config || defaultConfig

  const updateConfig = (updates: Partial<AIConfig>) => {
    setConfig((current) => ({ ...(current || defaultConfig), ...updates }))
    // Reset connection status when provider changes
    if (updates.provider) {
      setConnectionStatus('idle')
    }
  }

  const testConnection = async () => {
    // For ai-foundry without custom endpoint, always allow testing
    if (currentConfig.provider === 'ai-foundry' && !currentConfig.endpoint) {
      // Test using built-in Spark AI
      setIsTestingConnection(true)
      setConnectionStatus('idle')
      
      try {
        const testPrompt = (window as any).spark.llmPrompt`Test connection - respond with "Connected successfully"`
        const response = await (window as any).spark.llm(testPrompt, currentConfig.model || 'gpt-4o')
        
        if (response && response.trim()) {
          setConnectionStatus('success')
          toast.success('Built-in AI connected successfully!')
        } else {
          throw new Error('Empty response received')
        }
      } catch (error) {
        setConnectionStatus('error')
        const errorMessage = error instanceof Error ? error.message : 'Unknown connection error'
        toast.error(`Built-in AI connection failed: ${errorMessage}`)
        console.error('Built-in AI connection test failed:', error)
      } finally {
        setIsTestingConnection(false)
      }
      return
    }

    // For external providers or AI Foundry with custom endpoint
    if (!currentConfig.endpoint || !currentConfig.apiKey) {
      toast.error('Please provide endpoint and API key first')
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus('idle')

    try {
      if (currentConfig.provider === 'ai-foundry' && !currentConfig.endpoint) {
        // This case is already handled above
        return
      } else {
        // Test external AI provider by making a simple API call
        let apiUrl = currentConfig.endpoint
        let headers: Record<string, string> = {
          'Content-Type': 'application/json'
        }
        
        let requestBody: any

        // Configure request based on provider
        switch (currentConfig.provider) {
          case 'azure':
            apiUrl = `${currentConfig.endpoint}/openai/deployments/${currentConfig.model}/chat/completions?api-version=2024-08-01-preview`
            headers['api-key'] = currentConfig.apiKey
            requestBody = {
              messages: [{ role: 'user', content: 'Test connection' }],
              max_tokens: 10
            }
            break

          case 'openai':
            apiUrl = `${currentConfig.endpoint}/v1/chat/completions`
            headers['Authorization'] = `Bearer ${currentConfig.apiKey}`
            requestBody = {
              model: currentConfig.model,
              messages: [{ role: 'user', content: 'Test connection' }],
              max_tokens: 10
            }
            break

          case 'custom':
            apiUrl = currentConfig.endpoint
            headers['Authorization'] = `Bearer ${currentConfig.apiKey}`
            requestBody = {
              model: currentConfig.model,
              messages: [{ role: 'user', content: 'Test connection' }],
              max_tokens: 10
            }
            break

          default:
            // For ai-foundry with custom endpoint
            if (currentConfig.endpoint && currentConfig.apiKey) {
              apiUrl = `${currentConfig.endpoint}/chat/completions`
              headers['Authorization'] = `Bearer ${currentConfig.apiKey}`
              requestBody = {
                model: currentConfig.model,
                messages: [{ role: 'user', content: 'Test connection' }],
                max_tokens: 10
              }
            } else {
              throw new Error(`Unsupported AI provider: ${currentConfig.provider}`)
            }
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
          toast.success('External AI provider connected successfully!')
        } else {
          throw new Error('Invalid response format from AI provider')
        }
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

  const getProviderDescription = (provider: string) => {
    switch (provider) {
      case 'azure':
        return 'Azure OpenAI Service with enterprise security'
      case 'openai':
        return 'OpenAI API with latest models'
      case 'ai-foundry':
        return 'Microsoft AI Foundry for custom models'
      case 'custom':
        return 'Custom AI endpoint (self-hosted or third-party)'
      default:
        return ''
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Gear className="w-4 h-4" />
          AI Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto mx-auto">
        <DialogHeader className="space-y-3 pb-6">
          <DialogTitle className="flex items-center gap-3 text-lg md:text-xl leading-tight">
            <Robot className="w-6 h-6 text-primary shrink-0" />
            AI Configuration
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Configure your AI provider and customize Sahaay's behavior while maintaining privacy and security.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Provider Selection */}
          <Card>
            <CardHeader className="pb-6">
              <CardTitle className="text-base md:text-lg">AI Provider</CardTitle>
              <CardDescription className="text-sm">
                Choose your AI provider for enhanced security and customization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="provider" className="text-sm font-medium">Provider</Label>
                <Select 
                  value={currentConfig.provider} 
                  onValueChange={(value: AIConfig['provider']) => updateConfig({ provider: value })}
                >
                  <SelectTrigger className="text-sm h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai-foundry" className="text-sm">Microsoft AI Foundry</SelectItem>
                    <SelectItem value="azure" className="text-sm">Azure OpenAI</SelectItem>
                    <SelectItem value="openai" className="text-sm">OpenAI API</SelectItem>
                    <SelectItem value="custom" className="text-sm">Custom Endpoint</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {getProviderDescription(currentConfig.provider)}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="endpoint" className="text-sm font-medium">API Endpoint</Label>
                  <Input
                    id="endpoint"
                    type="url"
                    className="text-sm font-mono h-12"
                    placeholder={
                      currentConfig.provider === 'azure' 
                        ? 'https://your-resource.openai.azure.com'
                        : currentConfig.provider === 'openai'
                        ? 'https://api.openai.com'
                        : currentConfig.provider === 'ai-foundry'
                        ? 'https://your-foundry.cognitiveservices.azure.com'
                        : 'https://your-api-endpoint.com'
                    }
                    value={currentConfig.endpoint || ''}
                    onChange={(e) => updateConfig({ endpoint: e.target.value })}
                    autoComplete="url"
                  />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentConfig.provider === 'ai-foundry' ? 
                      'Leave empty to use built-in Spark AI, or enter custom endpoint' : 
                      'Full API endpoint URL including https://'}
                  </p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="model" className="text-sm font-medium">Model</Label>
                  <Input
                    id="model"
                    className="text-sm h-12"
                    placeholder={
                      currentConfig.provider === 'azure' ? 'your-deployment-name' :
                      currentConfig.provider === 'openai' ? 'gpt-4o' :
                      'gpt-4o'
                    }
                    value={currentConfig.model || ''}
                    onChange={(e) => updateConfig({ model: e.target.value })}
                    autoComplete="off"
                  />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentConfig.provider === 'azure' ? 'Azure deployment name' : 'Model identifier'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="api-key" className="text-sm font-medium">API Key</Label>
                <div className="space-y-4">
                  <Input
                    id="api-key"
                    type="password"
                    className="text-sm font-mono h-12"
                    placeholder={
                      currentConfig.provider === 'azure' ? 'Azure API key' :
                      currentConfig.provider === 'openai' ? 'sk-...' :
                      currentConfig.provider === 'ai-foundry' ? (currentConfig.endpoint ? 'API key for custom endpoint' : 'Not required for built-in AI') :
                      'API key'
                    }
                    value={currentConfig.apiKey || ''}
                    onChange={(e) => updateConfig({ apiKey: e.target.value })}
                    autoComplete="new-password"
                  />
                  <Button 
                    onClick={testConnection} 
                    disabled={isTestingConnection}
                    variant="outline"
                    size="lg"
                    className="w-full gap-2"
                  >
                    <TestTube className="w-4 h-4 shrink-0" />
                    {isTestingConnection ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentConfig.provider === 'ai-foundry' && !currentConfig.endpoint ? 
                    'Built-in AI requires no API key - leave empty unless using custom endpoint' : 
                    'Your API key is stored locally and never shared'}
                </p>
                {connectionStatus === 'success' && (
                  <Alert className="border-success text-success">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">Connection successful!</AlertDescription>
                  </Alert>
                )}
                {connectionStatus === 'error' && (
                  <Alert variant="destructive">
                    <Warning className="h-4 w-4" />
                    <AlertDescription className="text-sm">Failed to connect. Check your credentials.</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Model Configuration */}
          <Card>
            <CardHeader className="pb-6">
              <CardTitle className="text-base md:text-lg">Model Behavior</CardTitle>
              <CardDescription className="text-sm">
                Customize how Sahaay responds and behaves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="temperature" className="text-sm font-medium">Temperature: {currentConfig.temperature ?? 0.7}</Label>
                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={currentConfig.temperature ?? 0.7}
                  onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Focused</span>
                  <span>Creative</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="system-prompt" className="text-sm font-medium">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  rows={6}
                  className="text-sm"
                  placeholder="Define how Sahaay should behave..."
                  value={currentConfig.systemPrompt || ''}
                  onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  This prompt defines Sahaay's personality and behavior guidelines
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card>
            <CardHeader className="pb-6">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy-First Features
              </CardTitle>
              <CardDescription className="text-sm">
                Enable AI capabilities with granular privacy controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <Label className="text-sm font-medium">Mood Detection</Label>
                      <p className="text-sm text-muted-foreground">
                        Analyze message tone to provide empathetic responses
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Switch
                        checked={currentConfig.moodDetectionEnabled}
                        onCheckedChange={(checked) => updateConfig({ moodDetectionEnabled: checked })}
                      />
                      <Badge variant={currentConfig.moodDetectionEnabled ? "default" : "secondary"} className="text-sm">
                        {currentConfig.moodDetectionEnabled ? 'On' : 'Off'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <Label className="text-sm font-medium">Hyperlocal Intelligence</Label>
                      <p className="text-sm text-muted-foreground">
                        Provide location-aware suggestions and local context
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Switch
                        checked={currentConfig.hyperlocalEnabled}
                        onCheckedChange={(checked) => updateConfig({ hyperlocalEnabled: checked })}
                      />
                      <Badge variant={currentConfig.hyperlocalEnabled ? "default" : "secondary"} className="text-sm">
                        {currentConfig.hyperlocalEnabled ? 'On' : 'Off'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <Label className="text-sm font-medium">Group Intelligence</Label>
                      <p className="text-sm text-muted-foreground">
                        Summarize conversations and track group dynamics
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Switch
                        checked={currentConfig.groupIntelligenceEnabled}
                        onCheckedChange={(checked) => updateConfig({ groupIntelligenceEnabled: checked })}
                      />
                      <Badge variant={currentConfig.groupIntelligenceEnabled ? "default" : "secondary"} className="text-sm">
                        {currentConfig.groupIntelligenceEnabled ? 'On' : 'Off'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={() => {
              const validation = validateAIConfig(currentConfig)
              
              if (!validation.isValid) {
                toast.error(`Configuration invalid: ${validation.errors.join(', ')}`)
                return
              }

              try {
                setConfig(currentConfig)
                toast.success('AI configuration saved successfully!')
                setIsOpen(false)
              } catch (error) {
                const appError = handleAIError(error, 'save configuration')
                toast.error(appError.message)
              }
            }} className="flex-1">
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}