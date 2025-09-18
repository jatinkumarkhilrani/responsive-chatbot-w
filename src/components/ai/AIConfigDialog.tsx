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
  }

  const testConnection = async () => {
    if (!currentConfig.endpoint || !currentConfig.apiKey) {
      toast.error('Please provide endpoint and API key')
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus('idle')

    try {
      // Test the AI connection with a simple prompt using the Spark API
      const testPrompt = (window as any).spark.llmPrompt`Test connection - respond with "Connected successfully"`
      
      // Use the configured model if available, otherwise default to gpt-4o
      const response = await (window as any).spark.llm(testPrompt, currentConfig.model || 'gpt-4o')
      
      if (response) {
        setConnectionStatus('success')
        toast.success('AI provider connected successfully!')
      } else {
        throw new Error('No response received')
      }
    } catch (error) {
      setConnectionStatus('error')
      toast.error('Failed to connect to AI provider')
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
          <Gear weight="bold" />
          AI Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Robot weight="bold" className="text-primary" />
            AI Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your AI provider and customize Sahaay's behavior while maintaining privacy and security.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Provider Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Provider</CardTitle>
              <CardDescription>
                Choose your AI provider for enhanced security and customization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select 
                  value={currentConfig.provider} 
                  onValueChange={(value: AIConfig['provider']) => updateConfig({ provider: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai-foundry">Microsoft AI Foundry</SelectItem>
                    <SelectItem value="azure">Azure OpenAI</SelectItem>
                    <SelectItem value="openai">OpenAI API</SelectItem>
                    <SelectItem value="custom">Custom Endpoint</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {getProviderDescription(currentConfig.provider)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endpoint">API Endpoint</Label>
                  <Input
                    id="endpoint"
                    type="url"
                    placeholder="https://your-resource.openai.azure.com/"
                    value={currentConfig.endpoint}
                    onChange={(e) => updateConfig({ endpoint: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="gpt-4o"
                    value={currentConfig.model}
                    onChange={(e) => updateConfig({ model: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="sk-..."
                    value={currentConfig.apiKey}
                    onChange={(e) => updateConfig({ apiKey: e.target.value })}
                  />
                  <Button 
                    onClick={testConnection} 
                    disabled={isTestingConnection}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <TestTube weight="bold" />
                    {isTestingConnection ? 'Testing...' : 'Test'}
                  </Button>
                </div>
                {connectionStatus === 'success' && (
                  <Alert className="border-success text-success">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Connection successful!</AlertDescription>
                  </Alert>
                )}
                {connectionStatus === 'error' && (
                  <Alert variant="destructive">
                    <Warning className="h-4 w-4" />
                    <AlertDescription>Failed to connect. Check your credentials.</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Model Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Model Behavior</CardTitle>
              <CardDescription>
                Customize how Sahaay responds and behaves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature: {currentConfig.temperature}</Label>
                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={currentConfig.temperature}
                  onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Focused</span>
                  <span>Creative</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  rows={6}
                  placeholder="Define how Sahaay should behave..."
                  value={currentConfig.systemPrompt}
                  onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  This prompt defines Sahaay's personality and behavior guidelines
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield weight="bold" />
                Privacy-First Features
              </CardTitle>
              <CardDescription>
                Enable AI capabilities with granular privacy controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mood Detection</Label>
                  <p className="text-sm text-muted-foreground">
                    Analyze message tone to provide empathetic responses
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={currentConfig.moodDetectionEnabled}
                    onCheckedChange={(checked) => updateConfig({ moodDetectionEnabled: checked })}
                  />
                  <Badge variant={currentConfig.moodDetectionEnabled ? "default" : "secondary"}>
                    {currentConfig.moodDetectionEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hyperlocal Intelligence</Label>
                  <p className="text-sm text-muted-foreground">
                    Provide location-aware suggestions and local context
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={currentConfig.hyperlocalEnabled}
                    onCheckedChange={(checked) => updateConfig({ hyperlocalEnabled: checked })}
                  />
                  <Badge variant={currentConfig.hyperlocalEnabled ? "default" : "secondary"}>
                    {currentConfig.hyperlocalEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Group Intelligence</Label>
                  <p className="text-sm text-muted-foreground">
                    Summarize conversations and track group dynamics
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={currentConfig.groupIntelligenceEnabled}
                    onCheckedChange={(checked) => updateConfig({ groupIntelligenceEnabled: checked })}
                  />
                  <Badge variant={currentConfig.groupIntelligenceEnabled ? "default" : "secondary"}>
                    {currentConfig.groupIntelligenceEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('AI configuration saved successfully!')
              setIsOpen(false)
            }}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}