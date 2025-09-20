import { memo, useCallback, useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  PaperPlaneTilt,
  List,
  Gear,
  Plus,
  ChatCircle 
} from '@phosphor-icons/react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { toast } from 'sonner'

interface Message {
  id: string
  text: string
  timestamp: number
  isUser: boolean
  type?: 'ai' | 'system'
}

interface Chat {
  id: string
  title: string
  lastMessage?: string
  timestamp: number
}

interface AISettings {
  provider: string
  apiKey: string
  endpoint: string
  model: string
}

const defaultSettings: AISettings = {
  provider: 'openai',
  apiKey: '',
  endpoint: 'https://api.openai.com/v1',
  model: 'gpt-4'
}

export const MessagingApp = memo(() => {
  // Core state using useKV for persistence
  const [chats, setChats] = useKV<Chat[]>('sahaay-chats', [])
  const [messages, setMessages] = useKV<Record<string, Message[]>>('sahaay-messages', {})
  const [currentChatId, setCurrentChatId] = useKV<string | null>('sahaay-current-chat', null)
  const [aiSettings, setAiSettings] = useKV<AISettings>('sahaay-ai-settings', defaultSettings)
  
  // UI state (doesn't need persistence)
  const [messageInput, setMessageInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Computed values
  const currentChat = useMemo(() => 
    (chats || []).find(chat => chat.id === currentChatId) || null,
    [chats, currentChatId]
  )

  const currentMessages = useMemo(() => 
    currentChatId ? (messages || {})[currentChatId] || [] : [],
    [messages, currentChatId]
  )

  // Chat management
  const handleCreateChat = useCallback(() => {
    const chatId = `chat-${Date.now()}`
    const newChat: Chat = {
      id: chatId,
      title: `Chat ${(chats || []).length + 1}`,
      timestamp: Date.now()
    }
    
    setChats(prevChats => [newChat, ...(prevChats || [])])
    setCurrentChatId(chatId)
    setSidebarOpen(false)
    toast.success('New chat created')
  }, [chats, setChats, setCurrentChatId])

  const handleSelectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId)
    setSidebarOpen(false)
  }, [setCurrentChatId])

  // Message handling
  const addMessage = useCallback((chatId: string, message: Message) => {
    setMessages(prevMessages => ({
      ...(prevMessages || {}),
      [chatId]: [...((prevMessages || {})[chatId] || []), message]
    }))
    
    // Update chat's last message
    setChats(prevChats => 
      (prevChats || []).map(chat => 
        chat.id === chatId 
          ? { ...chat, lastMessage: message.text, timestamp: message.timestamp }
          : chat
      )
    )
  }, [setMessages, setChats])

  const generateAIResponse = useCallback(async (userMessage: string) => {
    const settings = aiSettings || defaultSettings
    if (!settings.apiKey) {
      toast.error('Please configure AI settings first')
      setSettingsOpen(true)
      return
    }

    try {
      setIsGenerating(true)
      
      // Use Spark's LLM API
      const sparkAPI = (window as any).spark
      if (!sparkAPI?.llmPrompt || !sparkAPI?.llm) {
        throw new Error('Spark API not available')
      }
      
      const prompt = sparkAPI.llmPrompt`You are Sahaay, a helpful AI assistant for messaging. 
      Respond to this message in a friendly, helpful way: ${userMessage}`
      
      const response = await sparkAPI.llm(prompt, 'gpt-4o-mini')
      
      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        text: response,
        timestamp: Date.now(),
        isUser: false,
        type: 'ai'
      }
      
      if (currentChatId) {
        addMessage(currentChatId, aiMessage)
      }
      
    } catch (error) {
      console.error('AI response error:', error)
      toast.error('Failed to generate AI response')
    } finally {
      setIsGenerating(false)
    }
  }, [aiSettings, currentChatId, addMessage])

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim()) return
    
    let chatId = currentChatId
    
    if (!chatId) {
      // Create new chat
      chatId = `chat-${Date.now()}`
      const newChat: Chat = {
        id: chatId,
        title: `Chat ${(chats || []).length + 1}`,
        timestamp: Date.now()
      }
      
      setChats(prevChats => [newChat, ...(prevChats || [])])
      setCurrentChatId(chatId)
    }
    
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      text: messageInput.trim(),
      timestamp: Date.now(),
      isUser: true
    }
    
    addMessage(chatId, userMessage)
    setMessageInput('')
    
    // Generate AI response
    await generateAIResponse(userMessage.text)
  }, [messageInput, currentChatId, chats, setChats, setCurrentChatId, addMessage, generateAIResponse])

  return (
    <div className="messaging-app-container flex bg-background">
      {/* Sidebar */}
      <div className={`sidebar-container bg-card border-r border-border ${
        sidebarOpen ? 'block' : 'hidden'
      } sm:block w-80 max-w-sm`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-xl font-semibold text-foreground">Sahaay</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Gear size={20} />
          </Button>
        </div>
        
        <div className="p-4">
          <Button 
            onClick={handleCreateChat}
            className="w-full"
          >
            <Plus size={16} className="mr-2" />
            New Chat
          </Button>
        </div>
        
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            {(chats || []).map(chat => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  currentChatId === chat.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <div className="font-medium truncate">{chat.title}</div>
                {chat.lastMessage && (
                  <div className="text-sm opacity-70 truncate mt-1">
                    {chat.lastMessage}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="main-content-area flex flex-col">
        {/* Header */}
        <div className="chat-header flex items-center p-4 border-b border-border bg-card">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sm:hidden mr-3"
          >
            <List size={20} />
          </Button>
          <div className="flex items-center space-x-3">
            <ChatCircle size={24} className="text-primary" />
            <div>
              <h2 className="font-semibold">
                {currentChat?.title || 'Select a chat or start a new one'}
              </h2>
              <p className="text-sm text-muted-foreground">
                AI-powered messaging assistant
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="chat-messages-area flex-1 p-4">
          {currentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <ChatCircle size={64} className="text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">Welcome to Sahaay</h3>
                <p className="text-muted-foreground">
                  Start a conversation with your AI assistant
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentMessages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse">●</div>
                      <div className="animate-pulse animation-delay-200">●</div>
                      <div className="animate-pulse animation-delay-400">●</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="chat-input-area p-4 border-t border-border bg-card">
          <div className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="flex-1"
              disabled={isGenerating}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isGenerating}
            >
              <PaperPlaneTilt size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="ai-config" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai-config">AI Configuration</TabsTrigger>
              <TabsTrigger value="privacy">Privacy & Features</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ai-config" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Provider</label>
                  <Input
                    value={(aiSettings || defaultSettings).provider}
                    onChange={(e) => setAiSettings(prev => ({ 
                      ...(prev || defaultSettings), 
                      provider: e.target.value 
                    }))}
                    placeholder="openai"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Model</label>
                  <Input
                    value={(aiSettings || defaultSettings).model}
                    onChange={(e) => setAiSettings(prev => ({ 
                      ...(prev || defaultSettings), 
                      model: e.target.value 
                    }))}
                    placeholder="gpt-4"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">API Endpoint</label>
                  <Input
                    value={(aiSettings || defaultSettings).endpoint}
                    onChange={(e) => setAiSettings(prev => ({ 
                      ...(prev || defaultSettings), 
                      endpoint: e.target.value 
                    }))}
                    placeholder="https://api.openai.com/v1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">API Key</label>
                  <Input
                    type="password"
                    value={(aiSettings || defaultSettings).apiKey}
                    onChange={(e) => setAiSettings(prev => ({ 
                      ...(prev || defaultSettings), 
                      apiKey: e.target.value 
                    }))}
                    placeholder="Enter your API key"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Privacy-First Design</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    All your conversations are stored locally in your browser. 
                    No data is sent to external servers except for AI responses.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">AI Features</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Configure AI settings above to enable intelligent responses 
                    and conversation assistance.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
})