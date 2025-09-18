import { useState, useEffect } from 'react'
import { ChatCircle, Gear, ShieldCheck, Robot, Users, Plus, TestTube, Brain, MapPin } from '@phosphor-icons/react'
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
import { handleKVError } from '../utils/errorHandling'

export function MessagingApp() {
  const [activeTab, setActiveTab] = useState('chats')
  const [activeChatId, setActiveChatId] = useKV<string | null>('active-chat-id', null)
  const [userConsents, setUserConsents] = useKV<Record<string, boolean>>('user-consents', {})

  const hasPrivacySetup = Object.keys(userConsents || {}).length > 0

  // Handle consent completion
  const handleConsentComplete = (consents: Record<string, boolean>) => {
    setUserConsents(consents)
    toast.success('Privacy settings saved successfully!')
  }

  if (!hasPrivacySetup) {
    return <PrivacySettings onComplete={handleConsentComplete} />
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-border bg-card flex flex-col md:flex-none ${
        activeChatId ? 'hidden md:flex' : 'flex'
      }`} role="navigation" aria-label="Chat navigation">
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
                onChatUpdate={(chatId, lastMessage) => {
                  // This will be handled inside ChatList component
                }}
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
            onChatUpdate={(chatId, lastMessage) => {
              // Find and update the chat in the list
              // This is a bit hacky but works for the current architecture
              const event = new CustomEvent('updateChatLastMessage', { 
                detail: { chatId, lastMessage } 
              })
              window.dispatchEvent(event)
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <Robot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Welcome to Sahaay</h2>
              <p className="text-muted-foreground mb-6">
                Your privacy-first AI messaging companion. Select a chat to start or create a new conversation.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 justify-center">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Privacy-first design</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Brain className="w-4 h-4 text-primary" />
                  <span>AI-powered assistance</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Hyperlocal intelligence</span>
                </div>
              </div>
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
  onChatUpdate?: (chatId: string, lastMessage: string) => void
  userConsents: Record<string, boolean>
}

function ChatList({ activeChatId, onChatSelect, onChatUpdate, userConsents }: ChatListProps) {
  const [chats, setChats] = useKV<Chat[]>('user-chats', [])

  const updateChatLastMessage = (chatId: string, lastMessage: string) => {
    setChats(prev => {
      const currentChats = prev || []
      return currentChats.map(chat => 
        chat.id === chatId 
          ? { ...chat, lastMessage: lastMessage.substring(0, 100), timestamp: new Date().toISOString() }
          : chat
      )
    })
  }

  // Listen for chat updates
  useEffect(() => {
    const handleChatUpdate = (event: CustomEvent) => {
      const { chatId, lastMessage } = event.detail
      updateChatLastMessage(chatId, lastMessage)
    }

    window.addEventListener('updateChatLastMessage', handleChatUpdate as EventListener)
    
    return () => {
      window.removeEventListener('updateChatLastMessage', handleChatUpdate as EventListener)
    }
  }, [])

  // Cleanup duplicates on component mount
  useEffect(() => {
    cleanupDuplicateChats()
  }, [])

  const createNewChat = async () => {
    try {
      const chatId = `chat-${Date.now()}`
      const newChat: Chat = {
        id: chatId,
        name: 'Sahaay Assistant',
        type: 'ai',
        lastMessage: 'I can help with routes, bills, group summaries and more.',
        timestamp: new Date().toISOString(),
        unread: 0,
        isAI: true
      }
      
      setChats(prev => {
        const currentChats = prev || []
        // Check if there's already an active chat with Sahaay Assistant that has no messages
        const existingEmptyChat = currentChats.find(chat => 
          chat.isAI && 
          chat.name === 'Sahaay Assistant' && 
          (chat.lastMessage === 'Ready to help with your queries' || 
           chat.lastMessage === 'I can help with routes, bills, group summaries and more.')
        )
        
        // If there's an empty chat, don't create a new one, just select it
        if (existingEmptyChat) {
          onChatSelect(existingEmptyChat.id)
          return currentChats
        }
        
        // Limit to maximum 50 chats to prevent memory issues
        const newChats = [newChat, ...currentChats]
        return newChats.slice(0, 50)
      })
      
      onChatSelect(chatId)
      toast.success('New chat created!')
    } catch (error) {
      const appError = handleKVError(error, 'create new chat')
      console.error('Error creating new chat:', appError)
      toast.error('Failed to create new chat. Please try again.')
    }
  }

  const cleanupDuplicateChats = () => {
    setChats(prev => {
      const currentChats = prev || []
      // Remove duplicate chats based on name and empty lastMessage
      const seen = new Set()
      return currentChats.filter(chat => {
        if (chat.isAI && chat.name === 'Sahaay Assistant' && 
            (chat.lastMessage === 'Ready to help with your queries' || 
             chat.lastMessage === 'I can help with routes, bills, group summaries and more.')) {
          if (seen.has('empty-sahaay')) {
            return false // Remove duplicate
          }
          seen.add('empty-sahaay')
        }
        return true
      })
    })
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

