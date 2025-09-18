import { useState } from 'react'
import { Users, Plus, Shield, Eye, Clock, Warning, Bell } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface Group {
  id: string
  name: string
  type: 'family' | 'work' | 'community' | 'friends'
  memberCount: number
  aiEnabled: boolean
  summaryEnabled: boolean
  lastActivity: string
  permissions: {
    locationSharing: boolean
    moodAnalysis: boolean
    autoSummary: boolean
    safetyAlerts: boolean
  }
}

interface GroupManagementProps {
  userConsents: Record<string, boolean>
}

export function GroupManagement({ userConsents }: GroupManagementProps) {
  const [groups, setGroups] = useKV<Group[]>('user-groups', [])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  const createSampleGroups = () => {
    const sampleGroups: Group[] = [
      {
        id: 'family-group',
        name: 'Family Circle',
        type: 'family',
        memberCount: 4,
        aiEnabled: true,
        summaryEnabled: true,
        lastActivity: new Date().toISOString(),
        permissions: {
          locationSharing: true,
          moodAnalysis: false,
          autoSummary: true,
          safetyAlerts: true
        }
      },
      {
        id: 'rwa-group',
        name: 'RWA Community',
        type: 'community',
        memberCount: 47,
        aiEnabled: true,
        summaryEnabled: true,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        permissions: {
          locationSharing: false,
          moodAnalysis: false,
          autoSummary: true,
          safetyAlerts: false
        }
      },
      {
        id: 'work-team',
        name: 'Project Alpha Team',
        type: 'work',
        memberCount: 8,
        aiEnabled: true,
        summaryEnabled: true,
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        permissions: {
          locationSharing: false,
          moodAnalysis: true,
          autoSummary: true,
          safetyAlerts: false
        }
      }
    ]
    
    setGroups(sampleGroups)
    toast.success('Sample groups created')
  }

  const toggleGroupAI = (groupId: string) => {
    setGroups(prev => 
      (prev || []).map(group => 
        group.id === groupId 
          ? { ...group, aiEnabled: !group.aiEnabled }
          : group
      )
    )
  }

  const updateGroupPermission = (groupId: string, permission: keyof Group['permissions'], value: boolean) => {
    setGroups(prev => 
      (prev || []).map(group => 
        group.id === groupId 
          ? { 
              ...group, 
              permissions: { ...group.permissions, [permission]: value }
            }
          : group
      )
    )
  }

  const getGroupIcon = (type: Group['type']) => {
    switch (type) {
      case 'family': return '👨‍👩‍👧‍👦'
      case 'work': return '💼'
      case 'community': return '🏘️'
      case 'friends': return '👥'
      default: return '👥'
    }
  }

  const selectedGroupData = groups?.find(g => g.id === selectedGroup)

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Group Management</h1>
              <p className="text-muted-foreground">
                Configure AI features and privacy settings for your groups
              </p>
            </div>
          </div>
          {(groups || []).length === 0 && (
            <Button onClick={createSampleGroups}>
              <Plus className="w-4 h-4 mr-2" />
              Add Sample Groups
            </Button>
          )}
        </div>

        {!userConsents.groupSummary && (
          <Alert>
            <Warning className="h-4 w-4" />
            <AlertDescription>
              Group analysis features are disabled. Enable "Group Analysis" in privacy settings to use AI features for groups.
            </AlertDescription>
          </Alert>
        )}

        {(groups || []).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Groups Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create or join groups to enable AI-powered features like summaries, 
                mood analysis, and safety monitoring with full privacy protection.
              </p>
              <div className="space-y-4">
                <Button onClick={createSampleGroups}>
                  Create Sample Groups
                </Button>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto text-sm">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">👨‍👩‍👧‍👦 Family</div>
                    <div className="text-xs text-muted-foreground">Safety & coordination</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">💼 Work</div>
                    <div className="text-xs text-muted-foreground">Project collaboration</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">🏘️ Community</div>
                    <div className="text-xs text-muted-foreground">Neighborhood updates</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">👥 Friends</div>
                    <div className="text-xs text-muted-foreground">Social activities</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Groups List */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="font-semibold">Your Groups</h3>
              <div className="space-y-2">
                {(groups || []).map((group) => (
                  <Card 
                    key={group.id}
                    className={`cursor-pointer transition-colors ${
                      selectedGroup === group.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedGroup(group.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getGroupIcon(group.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{group.name}</h4>
                            {group.aiEnabled && (
                              <Badge variant="secondary" className="text-xs">AI</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {group.memberCount} members • {group.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Active {new Date(group.lastActivity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Group Details */}
            <div className="lg:col-span-2">
              {selectedGroupData ? (
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="ai-features">AI Features</TabsTrigger>
                    <TabsTrigger value="privacy">Privacy</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-2xl">{getGroupIcon(selectedGroupData.type)}</span>
                          {selectedGroupData.name}
                        </CardTitle>
                        <CardDescription>
                          {selectedGroupData.type} group • {selectedGroupData.memberCount} members
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {selectedGroupData.memberCount}
                            </div>
                            <div className="text-sm text-muted-foreground">Members</div>
                          </div>
                          <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {selectedGroupData.aiEnabled ? 'ON' : 'OFF'}
                            </div>
                            <div className="text-sm text-muted-foreground">AI Features</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Shield className="w-5 h-5 text-primary" />
                              <div>
                                <div className="font-medium">AI Assistant</div>
                                <div className="text-sm text-muted-foreground">
                                  Enable AI features for this group
                                </div>
                              </div>
                            </div>
                            <Switch
                              checked={selectedGroupData.aiEnabled}
                              onCheckedChange={() => toggleGroupAI(selectedGroupData.id)}
                              disabled={!userConsents.groupSummary}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-primary" />
                              <div>
                                <div className="font-medium">Auto Summaries</div>
                                <div className="text-sm text-muted-foreground">
                                  Automatically generate conversation summaries
                                </div>
                              </div>
                            </div>
                            <Switch
                              checked={selectedGroupData.summaryEnabled}
                              onCheckedChange={() => {}}
                              disabled={!selectedGroupData.aiEnabled || !userConsents.groupSummary}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="ai-features" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Features Configuration</CardTitle>
                        <CardDescription>
                          Configure which AI features are enabled for this group
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {Object.entries(selectedGroupData.permissions).map(([key, enabled]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 text-primary">
                                {key === 'locationSharing' && <Shield />}
                                {key === 'moodAnalysis' && <Eye />}
                                {key === 'autoSummary' && <Clock />}
                                {key === 'safetyAlerts' && <Bell />}
                              </div>
                              <div>
                                <div className="font-medium capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {key === 'locationSharing' && 'Share location data within group'}
                                  {key === 'moodAnalysis' && 'Analyze group mood and sentiment'}
                                  {key === 'autoSummary' && 'Generate automatic summaries'}
                                  {key === 'safetyAlerts' && 'Send safety and emergency alerts'}
                                </div>
                              </div>
                            </div>
                            <Switch
                              checked={enabled}
                              onCheckedChange={(value) => 
                                updateGroupPermission(selectedGroupData.id, key as keyof Group['permissions'], value)
                              }
                              disabled={!selectedGroupData.aiEnabled || !userConsents.groupSummary}
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="privacy" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          Privacy & Data Protection
                        </CardTitle>
                        <CardDescription>
                          How your group data is processed and protected
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Alert>
                          <Shield className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Group Privacy Guarantee:</strong> Individual messages remain private. 
                            Only aggregate patterns and summaries are analyzed with explicit consent.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-3">
                          <div className="p-3 bg-muted rounded-lg">
                            <h4 className="font-medium mb-2">What's Analyzed:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Message patterns and topics (not content)</li>
                              <li>• Group activity levels and participation</li>
                              <li>• Commonly discussed subjects</li>
                              <li>• Action items and decisions</li>
                            </ul>
                          </div>

                          <div className="p-3 bg-muted rounded-lg">
                            <h4 className="font-medium mb-2">What's Protected:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Individual message content</li>
                              <li>• Personal information and details</li>
                              <li>• Private conversations</li>
                              <li>• Individual behavior patterns</li>
                            </ul>
                          </div>

                          <div className="p-3 bg-muted rounded-lg">
                            <h4 className="font-medium mb-2">Data Retention:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Summaries stored for 30 days</li>
                              <li>• No raw message content stored</li>
                              <li>• Patterns deleted after analysis</li>
                              <li>• Full deletion available anytime</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Select a Group</h3>
                    <p className="text-muted-foreground">
                      Choose a group from the list to configure its AI features and privacy settings.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}