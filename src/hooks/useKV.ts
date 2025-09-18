import { useState, useEffect, useCallback } from 'react'
import { EnhancedKV } from '../utils/kvStorage'

/**
 * React hook for using KV storage with automatic state management
 * Works with both Spark KV and localStorage fallback
 */
export function useKV<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((current: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(defaultValue)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load initial value from storage
  useEffect(() => {
    let mounted = true
    
    EnhancedKV.get<T>(key, defaultValue)
      .then((storedValue) => {
        if (mounted) {
          setValue(storedValue)
          setIsLoaded(true)
        }
      })
      .catch((error) => {
        console.warn(`Failed to load KV key "${key}":`, error)
        if (mounted) {
          setValue(defaultValue)
          setIsLoaded(true)
        }
      })

    return () => {
      mounted = false
    }
  }, [key, defaultValue])

  // Update storage when value changes
  const updateValue = useCallback((newValue: T | ((current: T) => T)) => {
    setValue((currentValue) => {
      const nextValue = typeof newValue === 'function' 
        ? (newValue as (current: T) => T)(currentValue)
        : newValue

      // Save to storage (async, fire-and-forget)
      EnhancedKV.set(key, nextValue).catch((error) => {
        console.warn(`Failed to save KV key "${key}":`, error)
      })

      return nextValue
    })
  }, [key])

  // Delete value from storage
  const deleteValue = useCallback(() => {
    setValue(defaultValue)
    EnhancedKV.delete(key).catch((error) => {
      console.warn(`Failed to delete KV key "${key}":`, error)
    })
  }, [key, defaultValue])

  return [value, updateValue, deleteValue]
}