export function useLocalStorage<T>(key: string, defaultValue: T) {
  const state = useState<T>(key, () => {
    if (process.client) {
      const stored = localStorage.getItem(key)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error(`Failed to parse ${key}:`, e)
        }
      }
    }
    return defaultValue
  })

  if (process.client) {
    watch(state, (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    }, { deep: true })
  }

  return state
}