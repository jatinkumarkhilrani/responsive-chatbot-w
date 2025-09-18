import { useState, useEffect, useCallback, memo } from 'react'
import { ChatCircle, Gear, ShieldCheck, Robot, Users, Plus, TestTube, Brain, MapPin } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useKV } from '../hooks/useKV'
import { toast } from 'sonner'
import { ChatInterface } from './chat/ChatInterface'
import { PrivacySettings } from './privacy/PrivacySettings'
import { AICompanion } from './ai/AICompanion'
import { GroupManagement } from './groups/GroupManagement'
import { DebugPanel } from './Debug/DebugPanel'
import { SettingsPanel } from './settings/SettingsPanel'
import { handleKVError } from '../utils/errorHandling'

export const MessagingApp = memo(function MessagingApp() {
  const [activeTab, setActiveTab] = useState('chats')
  const [activeChatId, setActiveChatId] = useKV<string | null>('active-chat-id', null)
  const [userConsents, setUserConsents] = useKV<Record<string, boolean>>('user-consents', {})

  const hasPrivacySetup = userConsents && Object.keys(userConsents).length > 0

  // Handle consent completion
  const handleConsentComplete = useCallback((consents: Record<string, boolean>) => {
    setUserConsents(consents)
    toast.success('Privacy settings saved successfully!')
  }, [setUserConsents])

  // Handle back navigation from chat
  const handleBackFromChat = useCallback(() => {
    setActiveChatId(null)
  }, [setActiveChatId])

  if (!hasPrivacySetup) {
    return <PrivacySettings onComplete={handleConsentComplete} />
  }

  return (
    <div className="messaging-app-container w-full h-screen flex bg-background overflow-hidden">
      {/* Sidebar - Fixed width with proper responsive behavior */}
      <div className={`sidebar-container w-full sm:w-80 lg:w-96 border-r border-border flex flex-col ${
        activeChatId ? 'hidden sm:flex' : 'flex'
      }`} role="navigation" aria-label="Chat navigation">
        {/* Header */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-b border-border">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-sm sm:text-base md:text-lg truncate">Sahaay</h1>
              <p className="text-xs text-muted-foreground truncate">Privacy-first messaging</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="flex-shrink-0 p-2 sm:p-4">
            <TabsList className="grid w-full grid-cols-5 h-auto p-1">
              <TabsTrigger value="chats" className="flex flex-col items-center gap-1 text-xs py-2 px-1">
                <ChatCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline text-xs">Chats</span>
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex flex-col items-center gap-1 text-xs py-2 px-1">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline text-xs">Groups</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex flex-col items-center gap-1 text-xs py-2 px-1">
                <Robot className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline text-xs">AI</span>
              </TabsTrigger>
              <TabsTrigger value="debug" className="flex flex-col items-center gap-1 text-xs py-2 px-1">
                <TestTube className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline text-xs">Debug</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex flex-col items-center gap-1 text-xs py-2 px-1">
                <Gear className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline text-xs">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden min-h-0">
            <TabsContent value="chats" className="h-full m-0">
              <ChatList 
                activeChatId={activeChatId || null} 
                onChatSelect={setActiveChatId}
                userConsents={userConsents || {}}
              />
            </TabsContent>
            <TabsContent value="groups" className="h-full m-0 overflow-auto">
              <GroupManagement userConsents={userConsents || {}} />
            </TabsContent>
            <TabsContent value="ai" className="h-full m-0 overflow-auto">
              <AICompanion userConsents={userConsents || {}} />
            </TabsContent>
            <TabsContent value="debug" className="h-full m-0 overflow-auto">
              <DebugPanel />
            </TabsContent>
            <TabsContent value="settings" className="h-full m-0 overflow-auto">
              <SettingsPanel 
                userConsents={userConsents || {}}
                onConsentUpdate={setUserConsents}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Main Content Area - Takes remaining space */}
      <div className={`main-content-area flex-1 min-w-0 bg-background ${
        activeChatId ? 'flex' : 'hidden sm:flex'
      }`}>
        {activeChatId ? (
          <div className="chat-interface-wrapper w-full h-full flex flex-col">
            <ChatInterface 
              chatId={activeChatId} 
              userConsents={userConsents || {}}
              onBack={handleBackFromChat}
            />
          </div>
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  )
})

// Separate welcome screen component to optimize rendering
const WelcomeScreen = memo(function WelcomeScreen() {
  return (
    <div className="h-full w-full flex items-center justify-center p-4 sm:p-8">
      <div className="text-center max-w-md mx-auto">
        <Robot className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2">Welcome to Sahaay</h2>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6">
          Your privacy-first AI messaging companion. Select a chat to start or create a new conversation.
        </p>
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
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
  )
})

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

const ChatList = memo(function ChatList({ activeChatId, onChatSelect, userConsents }: ChatListProps) {
  const [chats, setChats] = useKV<Chat[]>('user-chats', [])

  const createNewChat = useCallback(async () => {
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
        
        // Limit to maximum 20 chats to prevent memory issues
        const newChats = [newChat, ...currentChats]
        return newChats.slice(0, 20)
      })
      
      onChatSelect(chatId)
      toast.success('New chat created!')
    } catch (error) {
      const appError = handleKVError(error, 'create new chat')
      console.error('Error creating new chat:', appError)
      toast.error('Failed to create new chat. Please try again.')
    }
  }, [setChats, onChatSelect])

  const chatList = chats || []

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 sm:p-4 border-b border-border">
        <Button onClick={createNewChat} className="w-full text-sm">
          <Plus className="w-4 h-4 mr-2" />
          New Chat with Sahaay
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chatList.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Robot className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No chats yet. Start a conversation with Sahaay!</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {chatList.map((chat) => (
              <ChatListItem 
                key={chat.id}
                chat={chat}
                isActive={activeChatId === chat.id}
                onSelect={onChatSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

// Separate chat list item component for better performance
const ChatListItem = memo(function ChatListItem({ 
  chat, 
  isActive, 
  onSelect 
}: { 
  chat: Chat
  isActive: boolean
  onSelect: (chatId: string) => void 
}) {
  const handleClick = useCallback(() => {
    onSelect(chat.id)
  }, [chat.id, onSelect])

  return (
    <Card 
      className={`p-2 sm:p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
        isActive ? 'bg-primary/10 border-primary' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          {chat.isAI ? (
            <Robot className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-accent" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm truncate">{chat.name}</h3>
            {chat.isAI && (
              <Badge variant="secondary" className="text-xs shrink-0">
                AI
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {chat.lastMessage}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(chat.timestamp).toLocaleTimeString()}
          </p>
        </div>
        {chat.unread > 0 && (
          <Badge className="bg-accent text-accent-foreground text-xs shrink-0">
            {chat.unread}
          </Badge>
        )}
      </div>
    </Card>
  )
})

