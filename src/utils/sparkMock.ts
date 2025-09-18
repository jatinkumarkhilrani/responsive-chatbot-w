/**
 * Mock implementation of Spark runtime for standalone deployment
 */

// Mock user information
const mockUser = {
  avatarUrl: 'https://via.placeholder.com/40',
  email: 'demo@sahaay.ai',
  id: 'demo-user',
  isOwner: true,
  login: 'demo-user'
}

// Mock LLM responses based on keywords in the prompt
function generateMockLLMResponse(prompt: string, jsonMode?: boolean): string {
  const lowerPrompt = prompt.toLowerCase()
  
  if (jsonMode) {
    if (lowerPrompt.includes('summarize') || lowerPrompt.includes('summary')) {
      return JSON.stringify({
        summary: "This is a mock summary. AI responses are not available in standalone mode.",
        keyPoints: ["Point 1", "Point 2", "Point 3"],
        sentiment: "neutral"
      })
    }
    
    if (lowerPrompt.includes('mood') || lowerPrompt.includes('emotion')) {
      return JSON.stringify({
        mood: "neutral",
        confidence: 0.75,
        suggestions: ["Take a break", "Stay hydrated", "Connect with friends"]
      })
    }
    
    return JSON.stringify({
      message: "Mock response - AI features require API configuration",
      type: "mock"
    })
  }
  
  // Text responses
  if (lowerPrompt.includes('route') || lowerPrompt.includes('direction')) {
    return "🗺️ For route planning, please use Google Maps or Ola Maps. AI route suggestions are not available in standalone mode."
  }
  
  if (lowerPrompt.includes('weather')) {
    return "☀️ For weather information, please check your local weather app. AI weather updates are not available in standalone mode."
  }
  
  if (lowerPrompt.includes('bill') || lowerPrompt.includes('payment')) {
    return "💳 For bill analysis and payments, please use your banking app or payment provider. AI bill processing is not available in standalone mode."
  }
  
  if (lowerPrompt.includes('summarize') || lowerPrompt.includes('summary')) {
    return "📝 This is a mock summary. To enable AI-powered summaries, please configure your AI provider in Settings → AI Configuration."
  }
  
  return "🤖 This is a mock AI response. To enable full AI features, please configure your API provider in Settings → AI Configuration."
}

// Initialize Spark mock if not already available
export function initializeSparkMock() {
  if (typeof window === 'undefined') return
  
  if (!(window as any).spark) {
    (window as any).spark = {
      llmPrompt: (strings: string[], ...values: any[]): string => {
        // Template literal tag function - combine strings and values
        let result = strings[0]
        for (let i = 0; i < values.length; i++) {
          result += String(values[i]) + strings[i + 1]
        }
        return result
      },
      
      llm: async (prompt: string, modelName?: string, jsonMode?: boolean): Promise<string> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
        
        // Check if user has configured a real API
        const aiConfig = localStorage.getItem('sahaay-kv-ai-config')
        if (aiConfig) {
          try {
            const config = JSON.parse(aiConfig)
            if (config.apiKey && config.endpoint) {
              // If configured, throw an error suggesting they're in standalone mode
              throw new Error('API calls not available in standalone mode. This is a demo version.')
            }
          } catch (e) {
            // Continue with mock response
          }
        }
        
        return generateMockLLMResponse(prompt, jsonMode)
      },
      
      user: async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200))
        return mockUser
      },
      
      kv: {
        keys: async (): Promise<string[]> => {
          // Use localStorage with our prefix
          const keys: string[] = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('sahaay-kv-')) {
              keys.push(key.replace('sahaay-kv-', ''))
            }
          }
          return keys
        },
        get: async <T>(key: string): Promise<T | undefined> => {
          try {
            const item = localStorage.getItem(`sahaay-kv-${key}`)
            return item ? JSON.parse(item) : undefined
          } catch (error) {
            console.warn('Mock KV get error:', error)
            return undefined
          }
        },
        set: async <T>(key: string, value: T): Promise<void> => {
          try {
            localStorage.setItem(`sahaay-kv-${key}`, JSON.stringify(value))
          } catch (error) {
            console.warn('Mock KV set error:', error)
            throw error
          }
        },
        delete: async (key: string): Promise<void> => {
          try {
            localStorage.removeItem(`sahaay-kv-${key}`)
          } catch (error) {
            console.warn('Mock KV delete error:', error)
            throw error
          }
        }
      }
    }
  }
}

// Check if we're in Spark environment or standalone
export function isSparkEnvironment(): boolean {
  return typeof window !== 'undefined' && 
         (window as any).spark &&
         typeof (window as any).spark.llm === 'function' &&
         // Check if it's our mock or real Spark
         !(window as any).spark.llm.toString().includes('generateMockLLMResponse')
}

// Get Spark instance (real or mock)
export function getSpark() {
  if (typeof window === 'undefined') {
    throw new Error('Spark is only available in browser environment')
  }
  
  if (!(window as any).spark) {
    initializeSparkMock()
  }
  
  return (window as any).spark
}