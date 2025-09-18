import { useState } from 'react'
import { ShieldCheck, Eye, MapPin, Users, Brain, Bell, Globe, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface PrivacySettingsProps {
  onComplete: (consents: Record<string, boolean>) => void
  initialConsents?: Record<string, boolean>
  isUpdate?: boolean
}

interface ConsentItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  required: boolean
  category: 'core' | 'ai' | 'social' | 'location'
  implications: string[]
  dataUsage: string
}

const CONSENT_ITEMS: ConsentItem[] = [
  {
    id: 'dataProcessing',
    title: 'Basic Data Processing',
    description: 'Allow Sahaay to process your messages for AI responses',
    icon: <Brain className="w-5 h-5" />,
    required: true,
    category: 'core',
    implications: ['Message analysis for responses', 'No storage of personal data', 'Local processing only'],
    dataUsage: 'Messages processed locally, no external storage'
  },
  {
    id: 'moodDetection',
    title: 'Mood & Context Detection',
    description: 'Analyze message tone to provide contextually appropriate responses',
    icon: <Eye className="w-5 h-5" />,
    required: false,
    category: 'ai',
    implications: ['Tone analysis for better responses', 'Stress detection for urgent help', 'No emotional data stored'],
    dataUsage: 'Temporary analysis, immediately discarded'
  },
  {
    id: 'locationServices',
    title: 'Location Services',
    description: 'Access location for hyperlocal suggestions and route optimization',
    icon: <MapPin className="w-5 h-5" />,
    required: false,
    category: 'location',
    implications: ['Real-time traffic updates', 'Neighborhood-specific suggestions', 'Emergency location sharing'],
    dataUsage: 'Location used for queries only, not stored or tracked'
  },
  {
    id: 'groupSummary',
    title: 'Group Analysis',
    description: 'Analyze group conversations for summaries and insights',
    icon: <Users className="w-5 h-5" />,
    required: false,
    category: 'social',
    implications: ['Group chat summarization', 'Action item tracking', 'Meeting minutes generation'],
    dataUsage: 'Group context only, individual privacy protected'
  },
  {
    id: 'safetyMonitoring',
    title: 'Safety & Emergency Features',
    description: 'Enable location-based safety alerts and emergency contact notifications',
    icon: <Bell className="w-5 h-5" />,
    required: false,
    category: 'location',
    implications: ['Route deviation alerts', 'Emergency contact notification', 'Safe arrival confirmations'],
    dataUsage: 'Safety data processed locally, shared only in emergencies'
  },
  {
    id: 'localLearning',
    title: 'Personal Context Learning',
    description: 'Learn your preferences and context packs for better suggestions',
    icon: <Globe className="w-5 h-5" />,
    required: false,
    category: 'ai',
    implications: ['Personalized route preferences', 'Context-aware suggestions', 'Learning from your choices'],
    dataUsage: 'Preferences stored locally on your device only'
  }
]

export function PrivacySettings({ onComplete, initialConsents = {}, isUpdate = false }: PrivacySettingsProps) {
  const [consents, setConsents] = useState<Record<string, boolean>>(initialConsents)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const toggleConsent = (id: string, required: boolean) => {
    if (required) {
      toast.info('This permission is required for basic functionality')
      return
    }
    
    setConsents(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleComplete = () => {
    // Ensure required consents are enabled
    const finalConsents = {
      ...consents,
      dataProcessing: true // Always required
    }
    
    onComplete(finalConsents)
    
    if (!isUpdate) {
      toast.success('Privacy settings configured successfully!')
    } else {
      toast.success('Privacy settings updated!')
    }
  }

  const clearAllData = async () => {
    if (confirm('This will delete all your data and reset the app. Continue?')) {
      // Clear all stored data using Spark KV
      try {
        const allKeys = await (window as any).spark.kv.keys()
        await Promise.all(allKeys.map(key => (window as any).spark.kv.delete(key)))
        toast.success('All data cleared successfully')
        window.location.reload()
      } catch (error) {
        toast.error('Failed to clear data')
        console.error('Error clearing data:', error)
      }
    }
  }

  const categoryGroups = CONSENT_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ConsentItem[]>)

  return (
    <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isUpdate ? 'Privacy Settings' : 'Welcome to Sahaay'}
            </h1>
            <p className="text-muted-foreground">
              {isUpdate 
                ? 'Manage your privacy preferences and data controls'
                : 'Configure your privacy preferences to get started'
              }
            </p>
          </div>
        </div>

        <Alert className="mb-6">
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>
            <strong>Privacy-First Design:</strong> Your data stays on your device. We use consent-first 
            processing with purpose limitation and full user control over data usage.
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-6">
        {Object.entries(categoryGroups).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">
                {category === 'core' && '🔧 Core Features'}
                {category === 'ai' && '🤖 AI Capabilities'}
                {category === 'social' && '👥 Social Features'}
                {category === 'location' && '📍 Location Services'}
              </CardTitle>
              <CardDescription>
                {category === 'core' && 'Essential functionality for basic app operation'}
                {category === 'ai' && 'Enhanced AI features that learn and adapt to your needs'}
                {category === 'social' && 'Group interaction and collaboration features'}
                {category === 'location' && 'Location-based services and safety features'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="space-y-3">
                  <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-primary mt-1">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{item.title}</h3>
                          {item.required && (
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedItem(
                            expandedItem === item.id ? null : item.id
                          )}
                          className="text-xs h-auto p-1"
                        >
                          {expandedItem === item.id ? 'Hide Details' : 'Show Details'}
                        </Button>
                      </div>
                    </div>
                    <Switch
                      checked={consents[item.id] || item.required}
                      onCheckedChange={() => toggleConsent(item.id, item.required)}
                      disabled={item.required}
                    />
                  </div>
                  
                  {expandedItem === item.id && (
                    <div className="ml-8 p-4 bg-muted/50 rounded-lg space-y-3 border-l-2 border-primary">
                      <div>
                        <h4 className="font-medium text-sm mb-2">What this enables:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {item.implications.map((implication, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {implication}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Data Usage:</h4>
                        <p className="text-sm text-muted-foreground">{item.dataUsage}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* GDPR/DPDPB Compliance Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🛡️ Your Rights & Data Protection</CardTitle>
            <CardDescription>
              Full compliance with DPDPB (India) and international privacy standards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Your Rights:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Access your data anytime</li>
                  <li>• Correct inaccurate information</li>
                  <li>• Delete all your data</li>
                  <li>• Withdraw consent anytime</li>
                  <li>• Data portability</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Our Commitments:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Purpose limitation</li>
                  <li>• Data minimization</li>
                  <li>• Transparent processing</li>
                  <li>• Security by design</li>
                  <li>• No unauthorized sharing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        {isUpdate && (
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <Trash className="w-5 h-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Delete all your data and reset the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={clearAllData}
                className="w-full"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete All Data & Reset App
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                This action cannot be undone. All conversations, preferences, and settings will be permanently deleted.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className="my-8" />

      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button variant="outline" onClick={() => toast.info('Privacy policy coming soon')}>
          Read Full Privacy Policy
        </Button>
        <Button onClick={handleComplete} className="min-w-32">
          {isUpdate ? 'Save Changes' : 'Continue to Sahaay'}
        </Button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()} • 
          Questions? Contact privacy@sahaay.app
        </p>
      </div>
    </div>
  )
}