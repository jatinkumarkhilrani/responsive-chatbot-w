import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: number
  chatId: string
  metadata?: {
    mood?: string
    location?: string
    confidence?: number
  }
}

export interface Chat {
  id: string
  title: string
  lastMessage?: string
  lastActivity: number
  messageCount: number
  type: 'individual' | 'group'
}

export interface AIConfig {
  provider: 'openai' | 'azure' | 'custom'
  apiKey: string
  endpoint: string
  model: string
  enabled: boolean
}

export interface UserSettings {
  aiConfig: AIConfig
  privacy: {
    moodDetection: boolean
    locationServices: boolean
    groupSummaries: boolean
    dataCollection: boolean
  }
  features: {
    hyperlocal: boolean
    groupIntelligence: boolean
    smartReply: boolean
  }
}

interface AppState {
  // UI State
  isLoading: boolean
  currentChatId: string | null
  sidebarOpen: boolean
  settingsOpen: boolean
  
  // Data
  chats: Chat[]
  messages: Record<string, Message[]>
  settings: UserSettings
  
  // Actions
  setLoading: (loading: boolean) => void
  setCurrentChat: (chatId: string | null) => void
  setSidebarOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  
  // Chat actions
  createChat: (title: string, type?: 'individual' | 'group') => string
  deleteChat: (chatId: string) => void
  updateChatTitle: (chatId: string, title: string) => void
  
  // Message actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  deleteMessage: (messageId: string, chatId: string) => void
  
  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => void
  updateAIConfig: (config: Partial<AIConfig>) => void
}

const defaultSettings: UserSettings = {
  aiConfig: {
    provider: 'openai',
    apiKey: '',
    endpoint: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    enabled: false
  },
  privacy: {
    moodDetection: false,
    locationServices: false,
    groupSummaries: false,
    dataCollection: false
  },
  features: {
    hyperlocal: false,
    groupIntelligence: false,
    smartReply: true
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoading: false,
      currentChatId: null,
      sidebarOpen: true,
      settingsOpen: false,
      chats: [],
      messages: {},
      settings: defaultSettings,

      // UI actions
      setLoading: (loading) => set({ isLoading: loading }),
      setCurrentChat: (chatId) => set({ currentChatId: chatId }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSettingsOpen: (open) => set({ settingsOpen: open }),

      // Chat actions
      createChat: (title: string, type: 'individual' | 'group' = 'individual') => {
        const id = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newChat: Chat = {
          id,
          title,
          lastActivity: Date.now(),
          messageCount: 0,
          type
        }
        
        set((state) => ({
          chats: [newChat, ...state.chats],
          messages: { ...state.messages, [id]: [] }
        }))
        
        return id
      },

      deleteChat: (chatId) => {
        set((state) => {
          const newMessages = { ...state.messages }
          delete newMessages[chatId]
          
          return {
            chats: state.chats.filter(chat => chat.id !== chatId),
            messages: newMessages,
            currentChatId: state.currentChatId === chatId ? null : state.currentChatId
          }
        })
      },

      updateChatTitle: (chatId, title) => {
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, title } : chat
          )
        }))
      },

      // Message actions
      addMessage: (messageData) => {
        const message: Message = {
          ...messageData,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        }

        set((state) => {
          const chatMessages = state.messages[message.chatId] || []
          const newMessages = [...chatMessages, message]
          
          const updatedChats = state.chats.map(chat =>
            chat.id === message.chatId
              ? {
                  ...chat,
                  lastMessage: message.content.substring(0, 50),
                  lastActivity: message.timestamp,
                  messageCount: newMessages.length
                }
              : chat
          )

          return {
            messages: {
              ...state.messages,
              [message.chatId]: newMessages
            },
            chats: updatedChats.sort((a, b) => b.lastActivity - a.lastActivity)
          }
        })
      },

      deleteMessage: (messageId, chatId) => {
        set((state) => {
          const chatMessages = state.messages[chatId] || []
          const filteredMessages = chatMessages.filter(msg => msg.id !== messageId)
          
          return {
            messages: {
              ...state.messages,
              [chatId]: filteredMessages
            }
          }
        })
      },

      // Settings actions
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },

      updateAIConfig: (newConfig) => {
        set((state) => ({
          settings: {
            ...state.settings,
            aiConfig: { ...state.settings.aiConfig, ...newConfig }
          }
        }))
      }
    }),
    {
      name: 'sahaay-app-store',
      version: 1,
      // Only persist essential data, not UI state
      partialize: (state) => ({
        chats: state.chats,
        messages: state.messages,
        settings: state.settings
      })
    }
  )
)