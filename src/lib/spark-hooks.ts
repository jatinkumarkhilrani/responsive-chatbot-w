/**
 * Spark hooks compatibility layer for standalone deployment
 */

export { useKV } from '../hooks/useKV'

// Mock implementation for testing
export const useMockSpark = () => ({
  llm: async (prompt: string, model?: string, jsonMode?: boolean) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return "Mock response - configure AI provider in settings"
  },
  user: async () => ({
    avatarUrl: 'https://via.placeholder.com/40',
    email: 'demo@sahaay.ai',
    id: 'demo-user',
    isOwner: true,
    login: 'demo-user'
  }),
  kv: {
    get: async (key: string) => undefined,
    set: async (key: string, value: any) => {},
    delete: async (key: string) => {},
    keys: async () => []
  }
})