import { useKV } from '../../hooks/useKV'
import { useEffect } from 'react'
import { handleAIError, handleNetworkError, validateAIConfig } from '../../utils/errorHandling'

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
  public config: AIConfig

  constructor() {
    // This will be initialized from KV storage
    this.config = defaultConfig
  }

  public async callExternalAI(messages: { system: string; user: string }, expectJSON: boolean = false): Promise<any> {
    try {
      // If no endpoint or API key, and provider is ai-foundry, use built-in AI
      if (this.config.provider === 'ai-foundry' && (!this.config.endpoint || !this.config.apiKey)) {
        try {
          const prompt = (window as any).spark.llmPrompt`${messages.system}

${messages.user}`
          const response = await (window as any).spark.llm(prompt, this.config.model || 'gpt-4o', expectJSON)
          
          if (expectJSON) {
            try {
              return JSON.parse(response)
            } catch (e) {
              console.warn('Built-in AI returned invalid JSON, falling back to text response')
              return { response }
            }
          }
          
          return response
        } catch (builtInError) {
          console.error('Built-in AI failed:', builtInError)
          throw new Error('Built-in AI service is currently unavailable. Please try again later or configure an external AI provider in Settings.')
        }
      }

      if (!this.config.endpoint || !this.config.apiKey) {
        throw new Error('AI provider not configured. Please set endpoint and API key in Settings → AI Configuration.')
      }

      let apiUrl = this.config.endpoint
      let headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      let requestBody: any

      // Configure request based on provider
      switch (this.config.provider) {
        case 'azure':
          // Azure OpenAI format
          if (!apiUrl.includes('/openai/deployments/')) {
            apiUrl = `${this.config.endpoint}/openai/deployments/${this.config.model}/chat/completions?api-version=2024-08-01-preview`
          }
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
          if (!apiUrl.includes('/chat/completions')) {
            apiUrl = `${this.config.endpoint}/v1/chat/completions`
          }
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
        case 'custom':
          // AI Foundry/Custom endpoint format
          if (!apiUrl.includes('/chat/completions')) {
            apiUrl = `${this.config.endpoint}/chat/completions`
          }
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
        let errorMessage = `API request failed (${response.status})`
        
        if (response.status === 401) {
          errorMessage = 'Invalid API key. Please check your credentials in Settings.'
        } else if (response.status === 404) {
          errorMessage = 'AI endpoint not found. Please verify your endpoint URL in Settings.'
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again later.'
        } else if (response.status >= 500) {
          errorMessage = 'AI provider server error. Please try again later.'
        }
        
        throw handleNetworkError(
          new Error(`${errorMessage}: ${errorText}`),
          apiUrl
        )
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
          console.warn('AI provider returned invalid JSON, falling back to text response')
          return { response: content }
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
        this.config = { ...defaultConfig, ...storedConfig }
      } else {
        this.config = defaultConfig
      }
    } catch (error) {
      console.warn('Failed to load AI config, using defaults:', error)
      this.config = defaultConfig
    }
  }

  async detectMood(message: string): Promise<MoodAnalysis> {
    if (!this.config.moodDetectionEnabled) {
      return { mood: 'neutral', confidence: 0, suggestions: [] }
    }

    try {
      // Use the unified AI calling method
      const response = await this.callExternalAI({
        system: 'You are a mood detection system. Analyze the mood and return JSON with mood (happy/sad/angry/stressed/neutral/excited/worried), confidence (0-1), and suggestions array.',
        user: `Analyze mood: "${message}"`
      }, true)
      
      return {
        mood: response.mood || 'neutral',
        confidence: response.confidence || 0.5,
        suggestions: response.suggestions || []
      }
    } catch (error) {
      console.error('Mood detection failed:', error)
      
      // Simple keyword-based fallback mood detection
      const lowercaseMessage = message.toLowerCase()
      
      if (lowercaseMessage.includes('urgent') || lowercaseMessage.includes('help') || lowercaseMessage.includes('stuck')) {
        return { mood: 'stressed', confidence: 0.6, suggestions: ['be helpful', 'provide quick solutions'] }
      }
      
      if (lowercaseMessage.includes('thanks') || lowercaseMessage.includes('great') || lowercaseMessage.includes('awesome')) {
        return { mood: 'happy', confidence: 0.7, suggestions: ['be friendly', 'maintain positive tone'] }
      }
      
      if (lowercaseMessage.includes('problem') || lowercaseMessage.includes('issue') || lowercaseMessage.includes('not working')) {
        return { mood: 'worried', confidence: 0.5, suggestions: ['be supportive', 'offer clear solutions'] }
      }
      
      return { mood: 'neutral', confidence: 0.3, suggestions: ['be helpful', 'stay professional'] }
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

      const response = await this.callExternalAI({
        system: systemPrompt,
        user: userPrompt
      }, true)
      
      return {
        area: response.area || location,
        suggestions: response.suggestions || [],
        trafficInfo: response.trafficInfo,
        localServices: response.localServices || []
      }
    } catch (error) {
      console.error('Hyperlocal context failed:', error)
      
      // Provide basic fallback context for major Indian cities
      const fallbackContext: LocationContext = {
        area: location,
        suggestions: [],
        trafficInfo: '',
        localServices: []
      }
      
      const locationLower = location.toLowerCase()
      
      if (locationLower.includes('bangalore') || locationLower.includes('bengaluru')) {
        fallbackContext.suggestions = ['Use Namma Metro for efficient travel', 'Consider Purple/Green lines for major routes']
        fallbackContext.trafficInfo = 'Peak hours: 8-10 AM, 6-8 PM. Avoid major tech corridors during these times.'
        fallbackContext.localServices = ['BMTC buses', 'Ola/Uber', 'Rapido bikes']
      } else if (locationLower.includes('mumbai') || locationLower.includes('bombay')) {
        fallbackContext.suggestions = ['Local trains are fastest', 'Consider Western/Central/Harbour lines']
        fallbackContext.trafficInfo = 'Peak hours: 8-11 AM, 6-9 PM. Local trains run every 3-4 minutes.'
        fallbackContext.localServices = ['Mumbai Metro', 'BEST buses', 'Local trains']
      } else if (locationLower.includes('delhi')) {
        fallbackContext.suggestions = ['Delhi Metro covers most areas', 'Use DTC buses for last mile']
        fallbackContext.trafficInfo = 'Peak hours: 8-10 AM, 6-8 PM. Metro frequency every 3-5 minutes.'
        fallbackContext.localServices = ['Delhi Metro', 'DTC buses', 'Auto rickshaws']
      }
      
      return fallbackContext
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

      const response = await this.callExternalAI({
        system: systemPrompt,
        user: userMessage
      })

      return response
    } catch (error) {
      console.error('Group intelligence failed:', error)
      
      // Provide fallback based on request type
      if (request.toLowerCase().includes('summary')) {
        return 'I can see you\'re asking for a summary. Group intelligence requires AI configuration. From what I can observe, there are recent messages in this conversation. Please configure your AI provider in Settings for detailed summaries.'
      }
      
      return 'Sorry, I encountered an error analyzing the group conversation. Please check your AI configuration in Settings and try again.'
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

      // Use the unified AI calling method which handles provider routing
      const response = await this.callExternalAI({
        system: contextualPrompt,
        user: userMessage
      })

      return response
    } catch (error) {
      console.error('AI response generation failed:', error)
      
      // Provide contextual fallback based on the message content
      const lowercaseMessage = message.toLowerCase()
      
      if (lowercaseMessage.includes('route') || lowercaseMessage.includes('traffic') || lowercaseMessage.includes('travel')) {
        return 'I can help with route planning! For accurate traffic and route information, please ensure your AI provider is configured in Settings. I can suggest using Google Maps or Ola Maps for real-time navigation.'
      }
      
      if (lowercaseMessage.includes('bill') || lowercaseMessage.includes('payment') || lowercaseMessage.includes('upi')) {
        return 'I can help process bills! For automatic bill processing, please ensure your AI provider is configured in Settings. You can manually check bill details and use UPI apps for payments.'
      }
      
      if (lowercaseMessage.includes('summary') || lowercaseMessage.includes('@sahaay')) {
        return 'I can provide conversation summaries! For advanced group intelligence features, please configure your AI provider in Settings. Would you like help setting this up?'
      }
      
      return 'I apologize, but I encountered an error processing your request. Please check your AI configuration in Settings and try again. Here are some things to verify:\n\n• AI provider is selected\n• API endpoint is correct\n• API key is valid\n• Internet connection is stable\n\nYou can test your configuration using the "Test Connection" button in Settings.'
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
    const updatedConfig = { ...this.config, ...newConfig }
    const validation = validateAIConfig(updatedConfig)
    
    if (!validation.isValid) {
      const error = new Error(`Invalid AI configuration: ${validation.errors.join(', ')}`)
      throw handleAIError(error, 'config validation')
    }
    
    this.config = updatedConfig
    
    try {
      await (window as any).spark.kv.set('ai-config', this.config)
    } catch (error) {
      throw handleAIError(error, 'save config')
    }
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
      // Update config directly without triggering the validation/save cycle
      aiService.config = { ...defaultConfig, ...config }
    }
  }, [config])

  return aiService
}