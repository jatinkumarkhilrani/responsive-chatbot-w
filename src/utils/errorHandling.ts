/**
 * Centralized error handling utilities for Sahaay
 */

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

export class SahaayError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'SahaayError'
  }
}

export const ErrorCodes = {
  KV_STORAGE_ERROR: 'KV_STORAGE_ERROR',
  AI_CONFIG_ERROR: 'AI_CONFIG_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
} as const

export function handleKVError(error: any, operation: string, key?: string): AppError {
  console.error(`KV Storage error during ${operation}:`, error)
  
  return {
    code: ErrorCodes.KV_STORAGE_ERROR,
    message: `Failed to ${operation}${key ? ` key: ${key}` : ''}`,
    details: error,
    timestamp: new Date()
  }
}

export function handleAIError(error: any, operation: string): AppError {
  console.error(`AI Service error during ${operation}:`, error)
  
  return {
    code: ErrorCodes.AI_CONFIG_ERROR,
    message: `AI service failed during ${operation}`,
    details: error,
    timestamp: new Date()
  }
}

export function handleNetworkError(error: any, url?: string): AppError {
  console.error(`Network error:`, error)
  
  return {
    code: ErrorCodes.NETWORK_ERROR,
    message: `Network request failed${url ? ` to ${url}` : ''}`,
    details: error,
    timestamp: new Date()
  }
}

export function isValidChatId(chatId: string): boolean {
  return /^chat-\d+$/.test(chatId)
}

export function sanitizeKVKey(key: string): string {
  // Remove special characters that might cause issues
  return key.replace(/[^a-zA-Z0-9\-_]/g, '-')
}

export function validateAIConfig(config: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!config) {
    errors.push('Configuration is required')
    return { isValid: false, errors }
  }
  
  if (!config.provider) {
    errors.push('AI provider is required')
  }
  
  if (!config.model) {
    errors.push('Model name is required')
  }
  
  if (config.provider !== 'ai-foundry' || (config.endpoint && config.apiKey)) {
    if (!config.endpoint) {
      errors.push('Endpoint URL is required for external providers')
    }
    
    if (!config.apiKey) {
      errors.push('API key is required for external providers')
    }
    
    if (config.endpoint && !isValidUrl(config.endpoint)) {
      errors.push('Invalid endpoint URL format')
    }
  }
  
  if (config.temperature && (config.temperature < 0 || config.temperature > 2)) {
    errors.push('Temperature must be between 0 and 2')
  }
  
  return { isValid: errors.length === 0, errors }
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}