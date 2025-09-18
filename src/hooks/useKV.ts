import { useState, useEffect, useCallback, useRef } from 'react'
import { EnhancedKV } from '../utils/kvStorage'

/**
 * React hook for using KV storage with automatic state management
 * Works with both Spark KV and localStorage fallback
 * Optimized to prevent infinite loops and performance issues
 */
export function useKV<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((current: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(defaultValue)
  const [isLoaded, setIsLoaded] = useState(false)
  const defaultValueRef = useRef(defaultValue)
  const keyRef = useRef(key)
  
  // Update refs if dependencies change
  useEffect(() => {
    defaultValueRef.current = defaultValue
  }, [defaultValue])
  
  useEffect(() => {
    keyRef.current = key
  }, [key])

  // Load initial value from storage - only run when key changes
  useEffect(() => {
    let mounted = true
    setIsLoaded(false)
    
    const loadValue = async () => {
      try {
        const storedValue = await EnhancedKV.get<T>(keyRef.current, defaultValueRef.current)
        if (mounted) {
          setValue(storedValue)
          setIsLoaded(true)
        }
      } catch (error) {
        console.warn(`Failed to load KV key "${keyRef.current}":`, error)
        if (mounted) {
          setValue(defaultValueRef.current)
          setIsLoaded(true)
        }
      }
    }

    loadValue()

    return () => {
      mounted = false
    }
  }, [key]) // Only depend on key, not defaultValue to prevent loops

  // Update storage when value changes
  const updateValue = useCallback((newValue: T | ((current: T) => T)) => {
    setValue((currentValue) => {
      const nextValue = typeof newValue === 'function' 
        ? (newValue as (current: T) => T)(currentValue)
        : newValue

      // Save to storage (async, fire-and-forget)
      // Use setTimeout to prevent blocking the UI
      setTimeout(() => {
        EnhancedKV.set(keyRef.current, nextValue).catch((error) => {
          console.warn(`Failed to save KV key "${keyRef.current}":`, error)
        })
      }, 0)

      return nextValue
    })
  }, [])

  // Delete value from storage
  const deleteValue = useCallback(() => {
    setValue(defaultValueRef.current)
    // Use setTimeout to prevent blocking the UI
    setTimeout(() => {
      EnhancedKV.delete(keyRef.current).catch((error) => {
        console.warn(`Failed to delete KV key "${keyRef.current}":`, error)
      })
    }, 0)
  }, [])

  return [value, updateValue, deleteValue]
}