/**
 * Enhanced KV storage utilities with better error handling and retries
 */

export class KVStorageError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'KVStorageError'
  }
}

export interface KVOptions {
  retries?: number
  timeout?: number
  fallbackValue?: any
}

export class EnhancedKV {
  private static async retryOperation<T>(
    operation: () => Promise<T>,
    options: KVOptions = {}
  ): Promise<T> {
    const { retries = 3, timeout = 5000 } = options
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Operation timeout')), timeout)
        })
        
        return await Promise.race([operation(), timeoutPromise])
      } catch (error) {
        console.warn(`KV operation attempt ${attempt + 1} failed:`, error)
        
        if (attempt === retries) {
          throw new KVStorageError(
            `KV operation failed after ${retries + 1} attempts`,
            error instanceof Error ? error : new Error(String(error))
          )
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100))
      }
    }
    
    throw new KVStorageError('Unexpected error in retry logic')
  }

  static async get<T>(key: string, defaultValue?: T, options?: KVOptions): Promise<T> {
    try {
      return await this.retryOperation(async () => {
        const value = await (window as any).spark.kv.get(key)
        return value !== undefined ? value : (defaultValue as T)
      }, options)
    } catch (error) {
      console.error(`Failed to get KV key "${key}":`, error)
      if (options?.fallbackValue !== undefined) {
        return options.fallbackValue
      }
      if (defaultValue !== undefined) {
        return defaultValue
      }
      throw error
    }
  }

  static async set<T>(key: string, value: T, options?: KVOptions): Promise<void> {
    try {
      await this.retryOperation(async () => {
        await (window as any).spark.kv.set(key, value)
      }, options)
    } catch (error) {
      console.error(`Failed to set KV key "${key}":`, error)
      throw error
    }
  }

  static async delete(key: string, options?: KVOptions): Promise<void> {
    try {
      await this.retryOperation(async () => {
        await (window as any).spark.kv.delete(key)
      }, options)
    } catch (error) {
      console.error(`Failed to delete KV key "${key}":`, error)
      throw error
    }
  }

  static async keys(options?: KVOptions): Promise<string[]> {
    try {
      return await this.retryOperation(async () => {
        return await (window as any).spark.kv.keys()
      }, options)
    } catch (error) {
      console.error('Failed to get KV keys:', error)
      return []
    }
  }

  static validateKey(key: string): boolean {
    if (!key || typeof key !== 'string') {
      return false
    }
    
    // Check for reasonable length
    if (key.length > 250) {
      return false
    }
    
    // Allow alphanumeric, hyphens, underscores, and dots
    return /^[a-zA-Z0-9._-]+$/.test(key)
  }

  static sanitizeKey(key: string): string {
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string')
    }
    
    return key
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .substring(0, 250) // Limit key length
  }
}

// Export convenience functions for backward compatibility
export const kvGet = EnhancedKV.get.bind(EnhancedKV)
export const kvSet = EnhancedKV.set.bind(EnhancedKV)
export const kvDelete = EnhancedKV.delete.bind(EnhancedKV)
export const kvKeys = EnhancedKV.keys.bind(EnhancedKV)
export const validateKVKey = EnhancedKV.validateKey.bind(EnhancedKV)
export const sanitizeKVKey = EnhancedKV.sanitizeKey.bind(EnhancedKV)