import { Robot, Gear, Brain, MapPin, Users, ShieldCheck, TestTube, CheckCircle } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function AICapabilitiesOverview() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Robot className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Enhanced AI Configuration</h1>
        <p className="text-lg text-muted-foreground">
          Connect your own AI infrastructure with advanced mood detection and hyperlocal intelligence
        </p>
      </div>

      <Alert className="border-success text-success">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Success!</strong> AI configuration system is now active. Connect to Azure OpenAI, AI Foundry, or custom endpoints with advanced privacy controls.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Provider Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gear className="w-5 h-5 text-primary" />
              AI Provider Configuration
            </CardTitle>
            <CardDescription>
              Connect to your enterprise AI infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Azure OpenAI</Badge>
                <span className="text-sm text-muted-foreground">Enterprise security</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">AI Foundry</Badge>
                <span className="text-sm text-muted-foreground">Custom models</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Custom Endpoint</Badge>
                <span className="text-sm text-muted-foreground">Self-hosted solutions</span>
              </div>
              <div className="pt-2">
                <TestTube className="w-4 h-4 inline text-primary mr-1" />
                <span className="text-xs text-muted-foreground">Connection testing included</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mood Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Intelligent Mood Detection
            </CardTitle>
            <CardDescription>
              Contextual responses based on user emotional state
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <strong>Detected Moods:</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>😊 Happy</div>
                <div>😟 Worried</div>
                <div>😠 Angry</div>
                <div>😰 Stressed</div>
                <div>😐 Neutral</div>
                <div>🎉 Excited</div>
              </div>
              <div className="pt-2 text-xs text-muted-foreground">
                Adapts communication style and provides empathetic responses
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hyperlocal Intelligence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Hyperlocal Intelligence
            </CardTitle>
            <CardDescription>
              Location-aware suggestions for Indian cities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="text-sm font-medium">🗺️ Route Optimization</div>
                <div className="text-xs text-muted-foreground">Traffic-aware directions with public transport integration</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">🏪 Local Services</div>
                <div className="text-xs text-muted-foreground">Nearby amenities and service recommendations</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">🛡️ Safety Monitoring</div>
                <div className="text-xs text-muted-foreground">Route deviation alerts and safety bubbles</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Group Intelligence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Group Intelligence
            </CardTitle>
            <CardDescription>
              Privacy-first conversation analysis and summaries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="text-sm font-medium">📋 Smart Summaries</div>
                <div className="text-xs text-muted-foreground">Consent-based conversation analysis</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">🎯 Action Items</div>
                <div className="text-xs text-muted-foreground">Automatic task and decision tracking</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">⏰ Meeting Minutes</div>
                <div className="text-xs text-muted-foreground">Exportable group activity summaries</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-success" />
            Privacy-First Architecture
          </CardTitle>
          <CardDescription>
            All AI capabilities with granular consent and local data processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-success">100%</div>
              <div className="text-sm text-muted-foreground">Consent-Based</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">Local</div>
              <div className="text-sm text-muted-foreground">Data Processing</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-accent">0</div>
              <div className="text-sm text-muted-foreground">External Shares</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Use Cases</CardTitle>
          <CardDescription>
            Advanced AI scenarios now possible with custom configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="font-medium">🚗 Smart Route Planning</div>
              <div className="text-sm text-muted-foreground">
                "Stuck near Hoodi, need to reach Silk Board fast" → Mood-aware, traffic-optimized suggestions
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">💰 Intelligent Bill Processing</div>
              <div className="text-sm text-muted-foreground">
                Upload BESCOM bill → OCR processing → UPI payment link generation
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">👥 Contextual Group Summaries</div>
              <div className="text-sm text-muted-foreground">
                "@Sahaay summary" → Privacy-aware analysis → Exportable minutes
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">🛡️ Proactive Safety Alerts</div>
              <div className="text-sm text-muted-foreground">
                Route monitoring → Deviation detection → Guardian notifications
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}