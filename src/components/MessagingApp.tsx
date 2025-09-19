import { memo, useCallback, useState, useMemo } from 'react'
import { 
  PaperPlaneTilt,
  List,
  Gear,
  Plus,
  ChatCircle 
} from '@phosphor-icons/react'
import { useAppStore } from '../store/appStore'
import { getAIService } from '../services/aiService'
import { Button } from '../lightweight/Button'
import { Input } from '../lightweight/Input'
import { ChatList } from './ChatList'
import { MessageList } from './MessageList'
import { SettingsDialog } from './SettingsDialog'
import { format } from 'date-fns'
import { toast } from 'sonner'

export const MessagingApp = memo(() => {
  const [messageInput, setMessageInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  const {
    currentChatId,
    sidebarOpen,
    settingsOpen,
    chats,
    messages,
    settings,
    isLoading,
    setCurrentChat,
    setSidebarOpen,
    setSettingsOpen,
    createChat,
    addMessage,
  } = useAppStore()

  const currentChat = useMemo(() => 
    chats.find(chat => chat.id === currentChatId),
    [chats, currentChatId]
  )

  const currentMessages = useMemo(() => 
    currentChatId ? messages[currentChatId] || [] : [],
    [messages, currentChatId]
  )

  const handleCreateChat = useCallback(() => {
    const title = `Chat ${chats.length + 1}`
    const newChatId = createChat(title)
    setCurrentChat(newChatId)
    setSidebarOpen(false)
  }, [chats.length, createChat, setCurrentChat, setSidebarOpen])

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !currentChatId) return

    const userMessage = messageInput.trim()
    setMessageInput('')

    // Add user message
    addMessage({
      content: userMessage,
      sender: 'user',
      chatId: currentChatId
    })

    // Generate AI response if configured
    if (settings.aiConfig.enabled && settings.aiConfig.apiKey) {
      setIsGenerating(true)
      
      try {
        const aiService = getAIService(settings.aiConfig)
        const conversationHistory = currentMessages.slice(-10).map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }))

        const response = await aiService.generateResponse(
          userMessage,
          conversationHistory,
          {
            mood: settings.privacy.moodDetection ? 'auto' : undefined,
            isGroup: currentChat?.type === 'group'
          }
        )

        addMessage({
          content: response.content,
          sender: 'ai',
          chatId: currentChatId,
          metadata: response.metadata
        })
      } catch (error) {
        console.error('AI Error:', error)
        toast.error('Failed to generate AI response')
      } finally {
        setIsGenerating(false)
      }
    }
  }, [messageInput, currentChatId, addMessage, settings, currentMessages, currentChat])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  // Auto-create first chat
  const handleStartChat = useCallback(() => {
    if (chats.length === 0) {
      handleCreateChat()
    }
  }, [chats.length, handleCreateChat])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border
        transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0 lg:w-80
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h1 className="text-xl font-semibold text-foreground">Sahaay</h1>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="h-8 w-8 p-0"
              >
                <Gear className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateChat}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-hidden">
            <ChatList />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentChatId ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <h2 className="font-medium text-foreground truncate">
                  {currentChat?.title || 'Chat'}
                </h2>
                {currentChat && (
                  <p className="text-sm text-muted-foreground">
                    {currentChat.messageCount} messages • Last active {format(new Date(currentChat.lastActivity), 'MMM d, HH:mm')}
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0">
              <MessageList 
                messages={currentMessages}
                isGenerating={isGenerating}
              />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-3">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={isGenerating}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isGenerating}
                  variant="primary"
                  size="sm"
                  className="h-10 px-4"
                >
                  <PaperPlaneTilt className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <ChatCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Welcome to Sahaay
              </h2>
              <p className="text-muted-foreground mb-6">
                Your privacy-first AI messaging companion for India. 
                Start a conversation to experience hyperlocal intelligence.
              </p>
              <Button onClick={handleStartChat} variant="primary">
                Start Your First Chat
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Settings Dialog */}
      <SettingsDialog 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
})