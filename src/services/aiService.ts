import { AIConfig } from '../store/appStore'

export interface AIResponse {
  content: string
  metadata?: {
    mood?: string
    confidence?: number
    suggestions?: string[]
  }
}

export class AIService {
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
  }

  updateConfig(config: AIConfig) {
    this.config = config
  }

  async generateResponse(
    message: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    context?: {
      mood?: string
      location?: string
      isGroup?: boolean
    }
  ): Promise<AIResponse> {
    if (!this.config.enabled || !this.config.apiKey) {
      throw new Error('AI service not configured or disabled')
    }

    try {
      const messages = [
        {
          role: 'system' as const,
          content: this.buildSystemPrompt(context)
        },
        ...conversationHistory.slice(-10), // Last 10 messages for context
        {
          role: 'user' as const,
          content: message
        }
      ]

      const response = await this.makeAPICall(messages)
      
      return {
        content: response.content,
        metadata: {
          mood: this.detectMood(message),
          confidence: 0.85,
          suggestions: this.generateSuggestions(response.content)
        }
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      throw new Error('Failed to generate AI response')
    }
  }

  private buildSystemPrompt(context?: {
    mood?: string
    location?: string
    isGroup?: boolean
  }): string {
    let prompt = `You are Sahaay, a helpful AI assistant for messaging in India. You provide:
- Helpful, contextual responses
- Local information and suggestions
- Privacy-first approach (no data collection without consent)
- Brief, WhatsApp-style messages`

    if (context?.location) {
      prompt += `\n- Current location context: ${context.location}`
    }

    if (context?.mood) {
      prompt += `\n- User mood: ${context.mood} (adjust tone accordingly)`
    }

    if (context?.isGroup) {
      prompt += `\n- This is a group conversation (be mindful of group dynamics)`
    }

    prompt += '\n\nKeep responses concise, helpful, and culturally appropriate for Indian users.'

    return prompt
  }

  private async makeAPICall(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>) {
    const endpoint = this.getEndpoint()
    
    const payload = {
      model: this.config.model,
      messages,
      max_tokens: 500,
      temperature: 0.7
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (this.config.provider === 'azure') {
      return { content: data.choices[0].message.content }
    }
    
    return { content: data.choices[0].message.content }
  }

  private getEndpoint(): string {
    if (this.config.provider === 'custom') {
      return this.config.endpoint
    }
    
    if (this.config.provider === 'azure') {
      return `${this.config.endpoint}/openai/deployments/${this.config.model}/chat/completions?api-version=2024-02-15-preview`
    }
    
    return `${this.config.endpoint}/chat/completions`
  }

  private detectMood(message: string): string {
    const moodKeywords = {
      happy: ['good', 'great', 'awesome', 'excellent', 'wonderful', '😊', '😄', '👍'],
      sad: ['bad', 'terrible', 'awful', 'sad', 'down', 'upset', '😢', '😞'],
      frustrated: ['frustrated', 'annoyed', 'stuck', 'problem', 'issue', 'help'],
      excited: ['excited', 'amazing', 'fantastic', 'love', 'brilliant', '🎉', '🚀'],
      urgent: ['urgent', 'asap', 'quickly', 'emergency', 'immediately', 'fast']
    }

    const lowerMessage = message.toLowerCase()
    
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return mood
      }
    }
    
    return 'neutral'
  }

  private generateSuggestions(response: string): string[] {
    // Simple suggestion generation based on response content
    const suggestions: string[] = []
    
    if (response.includes('location') || response.includes('direction')) {
      suggestions.push('Get directions')
    }
    
    if (response.includes('weather')) {
      suggestions.push('Check weather')
    }
    
    if (response.includes('time') || response.includes('schedule')) {
      suggestions.push('Set reminder')
    }
    
    return suggestions.slice(0, 3)
  }

  async summarizeConversation(messages: Array<{ content: string; sender: string }>): Promise<string> {
    if (!this.config.enabled || !this.config.apiKey) {
      return 'AI summarization not available'
    }

    try {
      const conversation = messages.map(m => `${m.sender}: ${m.content}`).join('\n')
      
      const prompt = [
        {
          role: 'system' as const,
          content: 'Summarize this conversation in 1-2 sentences, highlighting key points and decisions.'
        },
        {
          role: 'user' as const,
          content: conversation
        }
      ]

      const response = await this.makeAPICall(prompt)
      return response.content
    } catch (error) {
      console.error('Summarization error:', error)
      return 'Could not summarize conversation'
    }
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null

export const getAIService = (config: AIConfig): AIService => {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService(config)
  } else {
    aiServiceInstance.updateConfig(config)
  }
  return aiServiceInstance
}