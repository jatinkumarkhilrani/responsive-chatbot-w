import { useKV } from '@github/spark/hooks'
import { useEffect } from 'react'

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

  public async callExternalAI(messages: { system: string; user: string }, expectJSON: boolean = false): Promise<any> {
    if (!this.config.endpoint || !this.config.apiKey) {
      throw new Error('AI provider not configured. Please set endpoint and API key in settings.')
    }

    try {
      let apiUrl = this.config.endpoint
      let headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      let requestBody: any

      // Configure request based on provider
      switch (this.config.provider) {
        case 'azure':
          // Azure OpenAI format
          apiUrl = `${this.config.endpoint}/openai/deployments/${this.config.model}/chat/completions?api-version=2024-08-01-preview`
          headers['api-key'] = this.config.apiKey
          requestBody = {
            messages: [
              { role: 'system', content: messages.system },
              { role: 'user', content: messages.user }
            ],
            temperature: this.config.temperature,
            max_tokens: 1000
          }
          if (expectJSON) {
            requestBody.response_format = { type: 'json_object' }
          }
          break

        case 'openai':
          // OpenAI API format
          apiUrl = `${this.config.endpoint}/v1/chat/completions`
          headers['Authorization'] = `Bearer ${this.config.apiKey}`
          requestBody = {
            model: this.config.model,
            messages: [
              { role: 'system', content: messages.system },
              { role: 'user', content: messages.user }
            ],
            temperature: this.config.temperature,
            max_tokens: 1000
          }
          if (expectJSON) {
            requestBody.response_format = { type: 'json_object' }
          }
          break

        case 'ai-foundry':
          // Microsoft AI Foundry format
          apiUrl = `${this.config.endpoint}/chat/completions`
          headers['Authorization'] = `Bearer ${this.config.apiKey}`
          requestBody = {
            model: this.config.model,
            messages: [
              { role: 'system', content: messages.system },
              { role: 'user', content: messages.user }
            ],
            temperature: this.config.temperature,
            max_tokens: 1000
          }
          break

        case 'custom':
          // Custom endpoint - assume OpenAI-compatible format
          apiUrl = this.config.endpoint
          headers['Authorization'] = `Bearer ${this.config.apiKey}`
          requestBody = {
            model: this.config.model,
            messages: [
              { role: 'system', content: messages.system },
              { role: 'user', content: messages.user }
            ],
            temperature: this.config.temperature,
            max_tokens: 1000
          }
          break

        default:
          throw new Error(`Unsupported AI provider: ${this.config.provider}`)
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from AI provider')
      }

      const content = data.choices[0].message.content

      if (expectJSON) {
        try {
          return JSON.parse(content)
        } catch (e) {
          throw new Error('AI provider returned invalid JSON')
        }
      }

      return content
    } catch (error) {
      console.error('External AI API call failed:', error)
      throw error
    }
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
      // If using custom AI provider, use external API
      if (this.config.provider !== 'ai-foundry' && this.config.endpoint && this.config.apiKey) {
        return await this.callExternalAI({
          system: 'You are a mood detection system. Analyze the mood and return JSON with mood (happy/sad/angry/stressed/neutral/excited/worried), confidence (0-1), and suggestions array.',
          user: `Analyze mood: "${message}"`
        }, true) as MoodAnalysis
      }

      // Use Spark's built-in AI
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
      const systemPrompt = 'You are a hyperlocal assistant for India. Return JSON with area, suggestions array, trafficInfo, and localServices array.'
      const userPrompt = `Provide hyperlocal context for ${location} in India regarding: ${query || 'general assistance'}

Consider:
- Indian traffic patterns and peak hours
- Public transport options (metro, bus, auto)
- Local services and amenities
- Cultural aspects and regional preferences

Focus on Indian context: metros, local transport, services, cultural aspects.`

      let response
      if (this.config.provider !== 'ai-foundry' && this.config.endpoint && this.config.apiKey) {
        response = await this.callExternalAI({
          system: systemPrompt,
          user: userPrompt
        }, true)
      } else {
        const prompt = (window as any).spark.llmPrompt`${systemPrompt}

${userPrompt}`
        const apiResponse = await (window as any).spark.llm(prompt, this.config.model, true)
        response = JSON.parse(apiResponse)
      }
      
      return {
        area: response.area || location,
        suggestions: response.suggestions || [],
        trafficInfo: response.trafficInfo,
        localServices: response.localServices || []
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

      const systemPrompt = 'You are Sahaay, a privacy-first AI assistant analyzing group conversations. Be helpful, concise, and respect privacy. Provide actionable responses with appropriate disclaimers.'
      const userMessage = `Analyze this group conversation to respond to: "${request}"

Recent messages:
${messageContext}

Provide a helpful response that:
1. Addresses the specific request
2. References relevant conversation context
3. Maintains privacy and respect
4. Follows Indian communication norms
5. Includes appropriate disclaimers if needed

Be concise and actionable.`

      let response
      if (this.config.provider !== 'ai-foundry' && this.config.endpoint && this.config.apiKey) {
        response = await this.callExternalAI({
          system: systemPrompt,
          user: userMessage
        })
      } else {
        const prompt = (window as any).spark.llmPrompt`${systemPrompt}

${userMessage}`
        response = await (window as any).spark.llm(prompt, this.config.model)
      }

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

      const userMessage = `User message: "${message}"\n\nRespond as Sahaay, being helpful while respecting privacy and Indian cultural context.`

      let response
      if (this.config.provider !== 'ai-foundry' && this.config.endpoint && this.config.apiKey) {
        response = await this.callExternalAI({
          system: contextualPrompt,
          user: userMessage
        })
      } else {
        const prompt = (window as any).spark.llmPrompt`${contextualPrompt}

${userMessage}`
        response = await (window as any).spark.llm(prompt, this.config.model)
      }

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
  
  // Update service config when KV changes (use useEffect to avoid infinite re-renders)
  useEffect(() => {
    if (config) {
      aiService.updateConfig(config)
    }
  }, [config])

  return aiService
}