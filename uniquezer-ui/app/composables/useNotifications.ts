interface NotificationState {
  show: boolean
  message: string
  color: string
  timeout: number
  icon: string
}

export const useNotifications = () => {
  // Global notification state using Nuxt's useState
  const notification = useState<NotificationState>('globalNotification', () => ({
    show: false,
    message: '',
    color: 'info',
    timeout: 5000,
    icon: 'mdi-information'
  }))

  // Show notification helper
  const showNotification = (
    message: string, 
    color: 'success' | 'error' | 'warning' | 'info' = 'info',
    timeout: number = 5000
  ) => {
    const iconMap = {
      success: 'mdi-check-circle',
      error: 'mdi-alert-circle', 
      warning: 'mdi-alert',
      info: 'mdi-information'
    }

    notification.value = {
      show: true,
      message,
      color,
      timeout,
      icon: iconMap[color]
    }

    // Auto-hide after timeout
    setTimeout(() => {
      notification.value.show = false
    }, timeout)
  }

  // Convenience methods
  const success = (message: string, timeout?: number) => 
    showNotification(message, 'success', timeout)
  
  const error = (message: string, timeout?: number) => 
    showNotification(message, 'error', timeout)
  
  const warning = (message: string, timeout?: number) => 
    showNotification(message, 'warning', timeout)
  
  const info = (message: string, timeout?: number) => 
    showNotification(message, 'info', timeout)

  // Close notification manually
  const close = () => {
    notification.value.show = false
  }

  return {
    notification: readonly(notification),
    showNotification,
    success,
    error,
    warning,
    info,
    close
  }
}
