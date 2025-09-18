import { useState } from 'react'
import { Robot, MapPin, Clock, Users, Brain, ShieldCheck, Lightbulb, Warning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface AICompanionProps {
  userConsents: Record<string, boolean>
}

interface ContextPack {
  id: string
  name: string
  description: string
  settings: Record<string, any>
  lastUpdated: string
}

interface LocalGraphData {
  places: Array<{ name: string; category: string; confidence: number }>
  routes: Array<{ from: string; to: string; preference: string; frequency: number }>
  preferences: Record<string, any>
}

interface AIStats {
  totalInteractions: number
  accurateResponses: number
  contextHits: number
  privacyScore: number
}

export function AICompanion({ userConsents }: AICompanionProps) {
  const [contextPacks, setContextPacks] = useKV<ContextPack[]>('context-packs', [])
  const [localGraph, setLocalGraph] = useKV<LocalGraphData>('local-graph', {
    places: [],
    routes: [],
    preferences: {}
  })
  const [aiStats, setAiStats] = useKV<AIStats>('ai-stats', {
    totalInteractions: 0,
    accurateResponses: 0,
    contextHits: 0,
    privacyScore: 100
  })

  const createContextPack = (type: string) => {
    const newPack: ContextPack = {
      id: `pack-${Date.now()}`,
      name: type === 'commute' ? 'Daily Commute' : type === 'family' ? 'Family Safety' : 'Work Schedule',
      description: type === 'commute' 
        ? 'Optimized routes and traffic preferences' 
        : type === 'family' 
        ? 'Family member safety and location monitoring'
        : 'Work meetings and schedule management',
      settings: type === 'commute' 
        ? { avoidTolls: true, preferPublicTransport: false, maxWalkingDistance: 500 }
        : type === 'family'
        ? { safetyAlerts: true, locationSharing: true, emergencyContacts: [] }
        : { workHours: '9-6', meetingReminders: true, calendarSync: false },
      lastUpdated: new Date().toISOString()
    }
    
    setContextPacks(prev => [...(prev || []), newPack])
    toast.success(`${newPack.name} context pack created`)
  }

  const stats = aiStats || { totalInteractions: 0, accurateResponses: 0, contextHits: 0, privacyScore: 100 }
  
  const accuracyPercentage = stats.totalInteractions > 0 
    ? Math.round((stats.accurateResponses / stats.totalInteractions) * 100)
    : 95

  const contextUtilization = stats.totalInteractions > 0
    ? Math.round((stats.contextHits / stats.totalInteractions) * 100)
    : 0

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <Robot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Companion</h1>
            <p className="text-muted-foreground">
              Manage your privacy-first AI assistant and learning preferences
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="context">Context Packs</TabsTrigger>
            <TabsTrigger value="learning">Local Learning</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Privacy Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-success" />
                  Privacy Status
                </CardTitle>
                <CardDescription>
                  Your AI companion's privacy and consent configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{stats.privacyScore}%</div>
                    <div className="text-sm text-muted-foreground">Privacy Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Object.values(userConsents).filter(Boolean).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Permissions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">Local</div>
                    <div className="text-sm text-muted-foreground">Data Storage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">0</div>
                    <div className="text-sm text-muted-foreground">External Shares</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Features */}
            <Card>
              <CardHeader>
                <CardTitle>Active AI Features</CardTitle>
                <CardDescription>
                  Features enabled based on your consent preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {userConsents.moodDetection && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Brain className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">Mood Detection</div>
                          <div className="text-sm text-muted-foreground">
                            Analyzing tone for contextual responses
                          </div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    )}
                    
                    {userConsents.locationServices && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">Hyperlocal Intelligence</div>
                          <div className="text-sm text-muted-foreground">
                            Location-aware suggestions and routes
                          </div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    )}

                    {userConsents.groupSummary && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">Group Intelligence</div>
                          <div className="text-sm text-muted-foreground">
                            Consent-based group analysis
                          </div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {!userConsents.moodDetection && (
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <Brain className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-muted-foreground">Mood Detection</div>
                          <div className="text-sm text-muted-foreground">
                            Disabled - Basic responses only
                          </div>
                        </div>
                        <Badge variant="outline">Disabled</Badge>
                      </div>
                    )}
                    
                    {!userConsents.locationServices && (
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-muted-foreground">Location Services</div>
                          <div className="text-sm text-muted-foreground">
                            Disabled - General suggestions only
                          </div>
                        </div>
                        <Badge variant="outline">Disabled</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Setup</CardTitle>
                <CardDescription>
                  Create context packs for common scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => createContextPack('commute')}
                  >
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Daily Commute</div>
                      <div className="text-sm text-muted-foreground">
                        Set route preferences and traffic patterns
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => createContextPack('family')}
                  >
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Family Safety</div>
                      <div className="text-sm text-muted-foreground">
                        Configure safety monitoring and alerts
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => createContextPack('work')}
                  >
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Work Schedule</div>
                      <div className="text-sm text-muted-foreground">
                        Manage meetings and work routines
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="context" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Context Packs</h3>
                <p className="text-muted-foreground">
                  Personal context settings that improve AI responses
                </p>
              </div>
              <Badge>{(contextPacks || []).length} Active</Badge>
            </div>

            {(contextPacks || []).length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Context Packs Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create context packs to help Sahaay understand your preferences and provide more relevant suggestions.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => createContextPack('commute')}>
                      Create Commute Pack
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(contextPacks || []).map((pack) => (
                  <Card key={pack.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{pack.name}</CardTitle>
                      <CardDescription>{pack.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <strong>Settings:</strong>
                        </div>
                        <div className="space-y-1">
                          {Object.entries(pack.settings).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                              </span>
                              <span>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Updated: {new Date(pack.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="learning" className="space-y-4">
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription>
                All learning happens locally on your device. No data is sent to external servers or shared with others.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Local Knowledge Graph</CardTitle>
                <CardDescription>
                  Places, routes, and preferences learned from your interactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {localGraph?.places?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Places Known</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {localGraph?.routes?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Routes Learned</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {Object.keys(localGraph?.preferences || {}).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Preferences Set</div>
                  </div>
                </div>

                {localGraph?.places && localGraph.places.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Frequent Places</h4>
                    <div className="space-y-2">
                      {localGraph.places.slice(0, 5).map((place, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{place.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{place.category}</Badge>
                            <div className="text-xs text-muted-foreground">
                              {Math.round(place.confidence * 100)}% confidence
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Metrics</CardTitle>
                <CardDescription>
                  How well your AI companion is performing and learning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Response Accuracy</span>
                      <span className="text-sm text-muted-foreground">{accuracyPercentage}%</span>
                    </div>
                    <Progress value={accuracyPercentage} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Context Utilization</span>
                      <span className="text-sm text-muted-foreground">{contextUtilization}%</span>
                    </div>
                    <Progress value={contextUtilization} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Privacy Score</span>
                      <span className="text-sm text-muted-foreground">{stats.privacyScore}%</span>
                    </div>
                    <Progress value={stats.privacyScore} className="h-2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold">{stats.totalInteractions}</div>
                    <div className="text-sm text-muted-foreground">Total Interactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{stats.accurateResponses}</div>
                    <div className="text-sm text-muted-foreground">Accurate Responses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{stats.contextHits}</div>
                    <div className="text-sm text-muted-foreground">Context Hits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Privacy Violations</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Warning className="h-4 w-4" />
              <AlertDescription>
                <strong>Performance Note:</strong> AI accuracy improves with usage while maintaining strict privacy. 
                All metrics are calculated locally and never shared.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}