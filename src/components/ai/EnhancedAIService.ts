import { useKV } from '@github/spark/hooks'

interface AIConfig {
  provider: 'azure' | 'openai' | 'ai-foundry' | 'custom'
  endpoint: string
  apiKey: string
  model: string
  temperature: number
  systemPrompt: string
  moodDetectionEnabled: boolean
  hyperlocalEnabled: boolean
  groupIntelligenceEnabled: boolean
}

interface MoodAnalysis {
  mood: 'happy' | 'sad' | 'angry' | 'stressed' | 'neutral' | 'excited' | 'worried'
  confidence: number
  suggestions: string[]
}

interface LocationContext {
  area: string
  suggestions: string[]
  trafficInfo?: string
  localServices?: string[]
}

interface Message {
  id: string
  content: string
  sender: string
  timestamp: Date
  type: 'text' | 'image' | 'location' | 'bill'
  metadata?: any
}

const defaultConfig: AIConfig = {
  provider: 'ai-foundry',
  endpoint: '',
  apiKey: '',
  model: 'gpt-4o',
  temperature: 0.7,
  systemPrompt: `You are Sahaay, a privacy-first AI assistant for India. Be helpful, respectful, and culturally aware. Always:
1. Respect user privacy and ask for consent
2. Provide hyperlocal Indian context when relevant
3. Use appropriate disclaimers for medical/financial advice
4. Be concise and actionable
5. Detect mood and adapt communication style accordingly`,
  moodDetectionEnabled: true,
  hyperlocalEnabled: true,
  groupIntelligenceEnabled: true
}

export class EnhancedAIService {
  private config: AIConfig

  constructor() {
    // This will be initialized from KV storage
    this.config = defaultConfig
  }

  async initializeConfig() {
    try {
      const storedConfig = await (window as any).spark.kv.get('ai-config') as AIConfig | undefined
      if (storedConfig) {
        this.config = storedConfig
      }
    } catch (error) {
      console.warn('Failed to load AI config, using defaults:', error)
    }
  }

  async detectMood(message: string): Promise<MoodAnalysis> {
    if (!this.config.moodDetectionEnabled) {
      return { mood: 'neutral', confidence: 0, suggestions: [] }
    }

    try {
      const prompt = (window as any).spark.llmPrompt`Analyze the mood and emotion in this message: "${message}"

Return a JSON response with:
- mood: one of ['happy', 'sad', 'angry', 'stressed', 'neutral', 'excited', 'worried']
- confidence: a number between 0 and 1
- suggestions: array of 2-3 brief response style suggestions

Consider Indian communication patterns and cultural context.`

      const response = await (window as any).spark.llm(prompt, this.config.model, true)
      const analysis = JSON.parse(response)
      
      return {
        mood: analysis.mood || 'neutral',
        confidence: analysis.confidence || 0.5,
        suggestions: analysis.suggestions || []
      }
    } catch (error) {
      console.error('Mood detection failed:', error)
      return { mood: 'neutral', confidence: 0, suggestions: [] }
    }
  }

  async getHyperlocalContext(location?: string, query?: string): Promise<LocationContext> {
    if (!this.config.hyperlocalEnabled || !location) {
      return { area: '', suggestions: [] }
    }

    try {
      const prompt = (window as any).spark.llmPrompt`Provide hyperlocal context for ${location} in India regarding: ${query || 'general assistance'}

Return JSON with:
- area: location description
- suggestions: array of 3-4 relevant local suggestions
- trafficInfo: current traffic context (if relevant)
- localServices: array of relevant local services/places

Focus on Indian context: metros, local transport, services, cultural aspects.`

      const response = await (window as any).spark.llm(prompt, this.config.model, true)
      const context = JSON.parse(response)
      
      return {
        area: context.area || location,
        suggestions: context.suggestions || [],
        trafficInfo: context.trafficInfo,
        localServices: context.localServices || []
      }
    } catch (error) {
      console.error('Hyperlocal context failed:', error)
      return { area: location, suggestions: [] }
    }
  }

  async processGroupIntelligence(messages: Message[], request: string): Promise<string> {
    if (!this.config.groupIntelligenceEnabled) {
      return 'Group intelligence is disabled. Enable it in AI settings to get summaries and insights.'
    }

    try {
      const recentMessages = messages.slice(-20) // Analyze last 20 messages
      const messageContext = recentMessages.map(m => 
        `${m.sender}: ${m.content} (${m.timestamp.toLocaleTimeString()})`
      ).join('\n')

      const prompt = (window as any).spark.llmPrompt`You are Sahaay, analyzing this group conversation to respond to: "${request}"

Recent messages:
${messageContext}

Provide a helpful response that:
1. Addresses the specific request
2. References relevant conversation context
3. Maintains privacy and respect
4. Follows Indian communication norms
5. Includes appropriate disclaimers if needed

Be concise and actionable.`

      const response = await (window as any).spark.llm(prompt, this.config.model)
      return response
    } catch (error) {
      console.error('Group intelligence failed:', error)
      return 'Sorry, I encountered an error analyzing the group conversation. Please try again.'
    }
  }

  async generateResponse(
    message: string, 
    context: {
      mood?: MoodAnalysis
      location?: LocationContext
      messageHistory?: Message[]
      isGroupMention?: boolean
      specificRequest?: string
    }
  ): Promise<string> {
    try {
      let contextualPrompt = this.config.systemPrompt

      // Add mood context
      if (context.mood && context.mood.mood !== 'neutral') {
        contextualPrompt += `\n\nUser's detected mood: ${context.mood.mood} (confidence: ${context.mood.confidence}). Adapt your communication style accordingly - be ${context.mood.suggestions.join(', ')}.`
      }

      // Add location context
      if (context.location && context.location.area) {
        contextualPrompt += `\n\nUser location context: ${context.location.area}. ${context.location.suggestions.join(' ')}`
        if (context.location.trafficInfo) {
          contextualPrompt += ` Traffic info: ${context.location.trafficInfo}`
        }
      }

      // Handle group mentions specially
      if (context.isGroupMention && context.messageHistory) {
        return await this.processGroupIntelligence(context.messageHistory, context.specificRequest || message)
      }

      const prompt = (window as any).spark.llmPrompt`${contextualPrompt}

User message: "${message}"

Respond as Sahaay, being helpful while respecting privacy and Indian cultural context.`

      const response = await (window as any).spark.llm(prompt, this.config.model)
      return response
    } catch (error) {
      console.error('AI response generation failed:', error)
      return 'I apologize, but I encountered an error processing your request. Please check your AI configuration in settings and try again.'
    }
  }

  async processBillImage(imageData: string): Promise<{ amount: number; dueDate: string; billType: string; paymentLink?: string }> {
    try {
      const prompt = (window as any).spark.llmPrompt`Analyze this Indian utility bill image and extract:
- amount: bill amount in rupees
- dueDate: due date in DD/MM/YYYY format
- billType: type of bill (electricity, water, gas, etc.)

Return as JSON. Focus on Indian billing formats (BESCOM, BWSSB, etc.).`

      // Note: In a real implementation, this would process the actual image
      // For now, we'll simulate the response
      const response = await (window as any).spark.llm(prompt, this.config.model, true)
      const billData = JSON.parse(response)
      
      // Generate UPI payment link (simulation)
      if (billData.amount && billData.billType) {
        billData.paymentLink = `upi://pay?pa=bill@upi&am=${billData.amount}&tn=Bill%20Payment%20${billData.billType}`
      }
      
      return billData
    } catch (error) {
      console.error('Bill processing failed:', error)
      throw new Error('Failed to process bill image')
    }
  }

  async generateRouteAdvice(from: string, to: string, preferences: string[] = []): Promise<string> {
    try {
      const prompt = (window as any).spark.llmPrompt`Provide route advice from ${from} to ${to} in India.

User preferences: ${preferences.join(', ')}

Consider:
- Indian traffic patterns and peak hours
- Public transport options (metro, bus, auto)
- Time estimates for different modes
- Cost implications
- Current traffic situations

Be specific and actionable. Provide 2-3 route options with pros/cons.`

      const response = await (window as any).spark.llm(prompt, this.config.model)
      return response
    } catch (error) {
      console.error('Route advice failed:', error)
      return 'Sorry, I encountered an error generating route advice. Please try again.'
    }
  }

  getConfig(): AIConfig {
    return { ...this.config }
  }

  async updateConfig(newConfig: Partial<AIConfig>) {
    this.config = { ...this.config, ...newConfig }
    await (window as any).spark.kv.set('ai-config', this.config)
  }
}

// Singleton instance
export const aiService = new EnhancedAIService()

// React hook for using the AI service
export function useAIService() {
  const [config] = useKV<AIConfig>('ai-config', defaultConfig)
  
  // Update service config when KV changes
  if (config) {
    aiService.updateConfig(config)
  }

  return aiService
}