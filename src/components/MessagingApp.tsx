import { useState } from 'react'
import { ChatCircle, Gear, ShieldCheck, Robot, Users, Plus, TestTube } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { ChatInterface } from './chat/ChatInterface'
import { PrivacySettings } from './privacy/PrivacySettings'
import { AICompanion } from './ai/AICompanion'
import { GroupManagement } from './groups/GroupManagement'
import { DebugPanel } from './Debug/DebugPanel'
import { SettingsPanel } from './settings/SettingsPanel'

export function MessagingApp() {
  const [activeTab, setActiveTab] = useState('chats')
  const [activeChatId, setActiveChatId] = useKV<string | null>('active-chat-id', null)
  const [userConsents, setUserConsents] = useKV<Record<string, boolean>>('user-consents', {})

  const hasPrivacySetup = Object.keys(userConsents || {}).length > 0

  if (!hasPrivacySetup) {
    return <PrivacySettings onComplete={(consents) => setUserConsents(consents)} />
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-border bg-card flex flex-col md:flex-none ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Sahaay</h1>
              <p className="text-xs text-muted-foreground">Privacy-first messaging</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-5 mx-4 mt-4">
            <TabsTrigger value="chats" className="flex items-center gap-1">
              <ChatCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chats</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Groups</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-1">
              <Robot className="w-4 h-4" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center gap-1">
              <TestTube className="w-4 h-4" />
              <span className="hidden sm:inline">Debug</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Gear className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="chats" className="h-full m-0">
              <ChatList 
                activeChatId={activeChatId || null} 
                onChatSelect={setActiveChatId}
                userConsents={userConsents || {}}
              />
            </TabsContent>
            <TabsContent value="groups" className="h-full m-0">
              <GroupManagement userConsents={userConsents || {}} />
            </TabsContent>
            <TabsContent value="ai" className="h-full m-0">
              <AICompanion userConsents={userConsents || {}} />
            </TabsContent>
            <TabsContent value="debug" className="h-full m-0">
              <DebugPanel />
            </TabsContent>
            <TabsContent value="settings" className="h-full m-0">
              <SettingsPanel 
                userConsents={userConsents || {}}
                onConsentUpdate={setUserConsents}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 ${activeChatId ? 'flex' : 'hidden md:flex'}`}>
        {activeChatId ? (
          <ChatInterface 
            chatId={activeChatId} 
            userConsents={userConsents || {}}
            onBack={() => setActiveChatId(null)}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Robot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Welcome to Sahaay</h2>
              <p className="text-muted-foreground max-w-md">
                Your privacy-first AI messaging companion. Select a chat to start or create a new conversation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface Chat {
  id: string
  name: string
  type: string
  lastMessage: string
  timestamp: string
  unread: number
  isAI: boolean
}

interface ChatListProps {
  activeChatId: string | null
  onChatSelect: (chatId: string) => void
  userConsents: Record<string, boolean>
}

function ChatList({ activeChatId, onChatSelect, userConsents }: ChatListProps) {
  const [chats, setChats] = useKV<Chat[]>('user-chats', [])

  const createNewChat = async () => {
    try {
      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        name: 'Sahaay Assistant',
        type: 'ai',
        lastMessage: 'Ready to help with your queries',
        timestamp: new Date().toISOString(),
        unread: 0,
        isAI: true
      }
      
      setChats(prev => {
        const currentChats = prev || []
        // Limit to maximum 50 chats to prevent memory issues
        const newChats = [newChat, ...currentChats]
        return newChats.slice(0, 50)
      })
      
      onChatSelect(newChat.id)
    } catch (error) {
      console.error('Error creating new chat:', error)
      toast.error('Failed to create new chat. Please try again.')
    }
  }

  const chatList = chats || []

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Button onClick={createNewChat} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          New Chat with Sahaay
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chatList.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Robot className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No chats yet. Start a conversation with Sahaay!</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {chatList.map((chat) => (
              <Card 
                key={chat.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                  activeChatId === chat.id ? 'bg-primary/10 border-primary' : ''
                }`}
                onClick={() => onChatSelect(chat.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {chat.isAI ? (
                      <Robot className="w-5 h-5 text-primary" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{chat.name}</h3>
                      {chat.isAI && (
                        <Badge variant="secondary" className="text-xs">
                          AI
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(chat.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  {chat.unread > 0 && (
                    <Badge className="bg-accent text-accent-foreground">
                      {chat.unread}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

