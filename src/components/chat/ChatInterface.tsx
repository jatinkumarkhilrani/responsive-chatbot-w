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
    if (!message.trim()) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content: message.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    setMessages(prev => [...(prev || []), userMessage])
    setMessage('')
    setIsTyping(true)

    try {
      // Use the enhanced AI service for generating responses
      const [moodAnalysis, locationContext] = await Promise.all([
        aiService.detectMood(userMessage.content),
        userConsents.locationServices ? aiService.getHyperlocalContext('Bangalore', userMessage.content) : Promise.resolve({ area: '', suggestions: [] })
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
        userMessage.content,
        {
          mood: moodAnalysis,
          location: locationContext,
          messageHistory: aiServiceMessages as any,
          isGroupMention: userMessage.content.toLowerCase().includes('@sahaay'),
          specificRequest: userMessage.content
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

      setTimeout(() => {
        setMessages(prev => [...(prev || []), aiMessage])
        setIsTyping(false)
      }, 1000)
    } catch (error) {
      setIsTyping(false)
      toast.error('Failed to get AI response. Check your AI configuration in settings.')
      console.error('AI response error:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
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
    const imageMessage: Message = {
      id: `msg-${Date.now()}`,
      content: `📷 Image uploaded: ${file.name}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'image'
    }

    setMessages(prev => [...(prev || []), imageMessage])
    setIsTyping(true)

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
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Privacy-First AI Assistant</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              I'm here to help with routes, bills, group summaries, and more. All interactions are consent-based and privacy-protected.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 max-w-lg mx-auto text-xs">
              <div className="p-2 bg-muted rounded">
                <strong>📍 Route Help:</strong> "Need to reach Silk Board from Hoodi"
              </div>
              <div className="p-2 bg-muted rounded">
                <strong>💰 Bill Processing:</strong> Upload bill photos for payment links
              </div>
              <div className="p-2 bg-muted rounded">
                <strong>👥 Group Summary:</strong> "@Sahaay summary of last 2 days"
              </div>
              <div className="p-2 bg-muted rounded">
                <strong>🛡️ Safety Alerts:</strong> Location-based safety monitoring
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
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleFileUpload}
            className="flex-shrink-0"
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
            />
          </div>
          <Button onClick={sendMessage} disabled={!message.trim()}>
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

async function generateAIResponse(userMessage: string, userConsents: Record<string, boolean>) {
  // Enhanced AI response logic based on user message patterns
  const message = userMessage.toLowerCase()

  // Route/Navigation queries
  if (message.includes('route') || message.includes('reach') || message.includes('traffic') || 
      message.includes('hoodi') || message.includes('silk board') || message.includes('stuck')) {
    return {
      content: `🗺️ **Route Analysis** (${userConsents.locationServices ? 'Location-aware' : 'General'})\n\n` +
               `**Fastest Route:** Car via ORR → 55-70 minutes\n` +
               `**Suggested Alternative:** Purple Line + Bus from KR Puram → 38-45 minutes\n\n` +
               `💡 *Based on current traffic patterns*\n\n` +
               `Would you like step-by-step directions or live traffic updates?`,
      metadata: {
        confidence: 0.85,
        actionItems: ['Get Directions', 'Live Traffic', 'Alternative Routes'],
        disclaimer: 'Route times are estimates. Check live traffic before traveling.'
      }
    }
  }

  // Group summary requests
  if (message.includes('@sahaay') && message.includes('summary')) {
    return {
      content: `📋 **RWA Group Summary** (Last 2 days)\n\n` +
               `1. **Lift Repair** - Scheduled for Monday morning\n` +
               `2. **Maintenance Fee** - Increased by ₹100 from October\n` +
               `3. **Diwali Volunteers** - Anita and Raj confirmed\n` +
               `4. **Security Update** - New guard timings 6 PM - 6 AM\n\n` +
               `*Summarized 47 messages with consent*\n\n` +
               `Would you like detailed minutes exported?`,
      metadata: {
        confidence: 0.92,
        actionItems: ['Export Minutes', 'View Full Chat', 'Set Reminders'],
        disclaimer: 'Summary generated from opt-in group analysis. Individual messages remain private.'
      }
    }
  }

  // Safety/monitoring queries  
  if (message.includes('safety') || message.includes('watch') || message.includes('monitor')) {
    return {
      content: `🛡️ **Safety Monitoring**\n\n` +
               `Current monitoring requires explicit consent for:\n` +
               `• Location tracking for designated routes\n` +
               `• Deviation alerts (700m+ from usual path)\n` +
               `• Emergency contact notifications\n\n` +
               `${userConsents.locationServices ? '✅ Location services enabled' : '❌ Location services disabled'}\n\n` +
               `Would you like to set up safety monitoring for specific routes?`,
      metadata: {
        confidence: 0.88,
        actionItems: ['Setup Route Monitoring', 'Emergency Contacts', 'Privacy Settings'],
        disclaimer: 'Safety features require location consent and work with guardian approval only.'
      }
    }
  }

  // Context pack management
  if (message.includes('set') || message.includes('prefer') || message.includes('avoid')) {
    return {
      content: `⚙️ **Context Pack Updated**\n\n` +
               `I've noted your preferences:\n` +
               `• Avoid toll roads\n` +
               `• Minimize walking distance\n` +
               `• Prefer public transport\n\n` +
               `These will apply to all future route suggestions.\n\n` +
               `Your preferences are stored locally and never shared.`,
      metadata: {
        confidence: 0.95,
        actionItems: ['View All Preferences', 'Edit Settings', 'Reset to Default'],
        disclaimer: 'Preferences are device-local and privacy-protected.'
      }
    }
  }

  // Default helpful response
  return {
    content: `I'm here to help with:\n\n` +
             `🗺️ **Routes & Navigation** - Real-time traffic and alternatives\n` +
             `💰 **Bill Processing** - Upload photos for quick payment links\n` +
             `👥 **Group Summaries** - Consent-based chat analysis\n` +
             `🛡️ **Safety Monitoring** - Location-aware alerts\n` +
             `⚙️ **Smart Preferences** - Learning your context packs\n\n` +
             `What would you like help with today?`,
    metadata: {
      confidence: 0.90,
      disclaimer: 'All features require explicit consent and respect your privacy choices.'
    }
  }
}