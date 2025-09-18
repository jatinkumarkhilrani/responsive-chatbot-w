import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, PaperPlaneTilt, Paperclip, Microphone, Camera, MapPin, Warning, ShieldCheck } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { useAIService } from '../ai/EnhancedAIService'

// Helper function for fallback suggestions
function getFallbackSuggestion(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('route') || lowerMessage.includes('traffic') || lowerMessage.includes('direction')) {
    return '\n\n🗺️ **For route planning:** Try "I need to go from [location] to [destination]" or check Google Maps/Ola Maps for live navigation.'
  }
  
  if (lowerMessage.includes('bill') || lowerMessage.includes('payment') || lowerMessage.includes('electricity') || lowerMessage.includes('water')) {
    return '\n\n💰 **For bill processing:** Upload a clear photo of your bill, or try describing the bill details (amount, due date, provider).'
  }
  
  if (lowerMessage.includes('summary') || lowerMessage.includes('group') || lowerMessage.includes('@sahaay')) {
    return '\n\n👥 **For group features:** Try "@Sahaay summary of last 3 days" or "summarize recent messages" for conversation insights.'
  }
  
  if (lowerMessage.includes('weather') || lowerMessage.includes('temperature')) {
    return '\n\n🌤️ **For weather:** Check weather apps or try "What\'s the weather like in [city]?"'
  }
  
  if (lowerMessage.includes('translate') || lowerMessage.includes('meaning')) {
    return '\n\n🌍 **For translation:** Try Google Translate or specify the languages: "Translate [text] from [language] to [language]"'
  }
  
  return '\n\n💡 **Try asking about:** Routes, bills, weather, translations, or group summaries. Be specific for better results!'
}

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: string
  type: 'text' | 'image' | 'location' | 'bill'
  metadata?: {
    confidence?: number
    needsPermission?: string
    actionItems?: string[]
    disclaimer?: string
  }
}

interface ChatInterfaceProps {
  chatId: string
  userConsents: Record<string, boolean>
  onBack: () => void
}

export function ChatInterface({ chatId, userConsents, onBack }: ChatInterfaceProps) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useKV<Message[]>(`chat-messages-${chatId}`, [])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const aiService = useAIService()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Initialize AI service with current config
    aiService.initializeConfig()
  }, [])

  const sendMessage = async () => {
    if (!message.trim() || isSending) return

    setIsSending(true)
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content: message.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    setMessages(prev => [...(prev || []), userMessage])
    const currentMessage = message.trim()
    setMessage('')
    setIsTyping(true)

    try {
      // Initialize AI service and ensure it's configured
      await aiService.initializeConfig()

      // Use the enhanced AI service for generating responses
      const [moodAnalysis, locationContext] = await Promise.all([
        userConsents.moodDetection ? aiService.detectMood(currentMessage) : Promise.resolve({ mood: 'neutral' as const, confidence: 0, suggestions: [] }),
        userConsents.locationServices ? aiService.getHyperlocalContext('Bangalore', currentMessage) : Promise.resolve({ area: '', suggestions: [] })
      ])

      // Convert messages to AI service format
      const aiServiceMessages = (messages || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender === 'user' ? 'user' : 'ai',
        timestamp: new Date(msg.timestamp),
        type: msg.type,
        metadata: msg.metadata
      }))

      const aiResponseContent = await aiService.generateResponse(
        currentMessage,
        {
          mood: moodAnalysis,
          location: locationContext,
          messageHistory: aiServiceMessages as any,
          isGroupMention: currentMessage.toLowerCase().includes('@sahaay'),
          specificRequest: currentMessage
        }
      )

      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        content: aiResponseContent,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: 'text',
        metadata: {
          confidence: moodAnalysis.confidence,
          disclaimer: 'AI-generated response. Verify important information independently.'
        }
      }

      setMessages(prev => [...(prev || []), aiMessage])
    } catch (error) {
      console.error('AI response error:', error)
      
      // Provide a fallback response
      const fallbackMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        content: "I'm sorry, I'm having trouble processing your request right now. This could be due to AI configuration issues.\n\n**Quick troubleshooting:**\n• Check AI configuration in Settings\n• Verify your internet connection\n• Try a simpler question\n\n**Based on your message, here are some suggestions:**" + getFallbackSuggestion(currentMessage),
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: 'text',
        metadata: {
          confidence: 0.1,
          disclaimer: 'This is a fallback response due to AI service unavailability.'
        }
      }
      
      setMessages(prev => [...(prev || []), fallbackMessage])
      toast.error('Failed to get AI response. Using fallback response.')
    } finally {
      setIsTyping(false)
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
    // Escape key to clear message
    if (e.key === 'Escape') {
      setMessage('')
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const processFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type.startsWith('image/')) {
      processImageUpload(file)
    }
  }

  const processImageUpload = async (file: File) => {
    try {
      const imageMessage: Message = {
        id: `msg-${Date.now()}`,
        content: `📷 Image uploaded: ${file.name}`,
        sender: 'user',
        timestamp: new Date().toISOString(),
        type: 'image'
      }

      setMessages(prev => [...(prev || []), imageMessage])
      setIsTyping(true)

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size too large. Please select an image under 10MB.')
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Invalid file type. Please select an image file.')
      }

      // Simulate bill processing
      setTimeout(() => {
        const billResponse: Message = {
          id: `msg-${Date.now() + 1}`,
          content: "I can see this is a BESCOM electricity bill. Here's what I found:\n\n💡 **Bill Amount**: ₹734\n📅 **Due Date**: 22 Sep 2024\n🏠 **Service Connection**: 1234567890\n\nWould you like me to create a UPI payment link or set a reminder?",
          sender: 'ai',
          timestamp: new Date().toISOString(),
          type: 'text',
          metadata: {
            confidence: 0.95,
            actionItems: ['Create UPI Payment Link', 'Set Reminder', 'View Bill Details'],
            disclaimer: 'Bill processing is automated. Please verify details before payment.'
          }
        }
        setMessages(prev => [...(prev || []), billResponse])
        setIsTyping(false)
      }, 2000)
    } catch (error) {
      setIsTyping(false)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(errorMessage)
      
      // Add error message to chat
      const errorResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        content: `❌ Error processing image: ${errorMessage}`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: 'text',
        metadata: {
          confidence: 0,
          disclaimer: 'Error occurred during file processing.'
        }
      }
      setMessages(prev => [...(prev || []), errorResponse])
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card flex items-center gap-3" role="banner">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back to chat list">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="font-semibold">Sahaay Assistant</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy-protected conversation</span>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          AI Companion
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="main" aria-live="polite" aria-label="Chat messages">
        {messages?.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Privacy-First AI Assistant</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              I'm here to help with routes, bills, group summaries, and more. All interactions are consent-based and privacy-protected.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto text-xs">
              <div className="p-3 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                   onClick={() => setMessage("I need to go from Koramangala to Whitefield by 9 AM")}>
                <strong>📍 Route Planning:</strong> "I need to go from Koramangala to Whitefield by 9 AM"
              </div>
              <div className="p-3 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                   onClick={() => fileInputRef.current?.click()}>
                <strong>💰 Bill Processing:</strong> Click to upload bill photos for payment assistance
              </div>
              <div className="p-3 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                   onClick={() => setMessage("@Sahaay summary of last 2 days")}>
                <strong>👥 Group Summary:</strong> "@Sahaay summary of last 2 days"
              </div>
              <div className="p-3 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                   onClick={() => setMessage("How's the weather in Bangalore today?")}>
                <strong>🌤️ Quick Questions:</strong> "How's the weather in Bangalore today?"
              </div>
            </div>
          </div>
        )}

        {messages?.map((msg) => (
          <MessageBubble key={msg.id} message={msg} userConsents={userConsents} />
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-muted p-3 rounded-lg max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card" role="form" aria-label="Message input">
        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleFileUpload}
            className="flex-shrink-0"
            aria-label="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message Sahaay..."
              className="resize-none"
              aria-label="Type your message"
            />
          </div>
          <Button 
            onClick={sendMessage} 
            disabled={!message.trim() || isSending} 
            aria-label="Send message"
            className={isSending ? 'animate-pulse' : ''}
          >
            <PaperPlaneTilt className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          AI responses may contain errors. Not for medical/financial/legal advice.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={processFileUpload}
        className="hidden"
      />
    </div>
  )
}

function MessageBubble({ message, userConsents }: { message: Message; userConsents: Record<string, boolean> }) {
  const isUser = message.sender === 'user'

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        {isUser ? (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent" />
        ) : (
          <ShieldCheck className="w-4 h-4 text-primary" />
        )}
      </div>
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'text-right' : ''}`}>
        <div
          className={`p-3 rounded-lg ${
            isUser
              ? 'bg-primary text-primary-foreground ml-auto'
              : 'bg-muted'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          
          {message.metadata?.actionItems && (
            <div className="mt-3 space-y-1">
              {message.metadata.actionItems.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="mr-2 mb-1"
                  onClick={() => toast.info(`Action: ${action}`)}
                >
                  {action}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        {message.metadata?.disclaimer && (
          <Alert className="mt-2 max-w-md">
            <Warning className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {message.metadata.disclaimer}
            </AlertDescription>
          </Alert>
        )}
        
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
          {message.metadata?.confidence && (
            <span className="ml-2">
              • Confidence: {Math.round(message.metadata.confidence * 100)}%
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

