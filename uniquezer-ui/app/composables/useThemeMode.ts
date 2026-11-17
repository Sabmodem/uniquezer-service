export const useThemeMode = () => {
  const theme = useTheme()
  const colorMode = useCookie('theme-mode', { 
    default: () => 'light',
    maxAge: 60 * 60 * 24 * 365 // 1 year
  })

  // Apply saved theme on initialization
  const initTheme = () => {
    if (colorMode.value) {
      theme.change(colorMode.value);
    }
  }

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = theme.global.current.value.dark ? 'light' : 'dark'
    colorMode.value = newTheme
    theme.change(colorMode.value);
  }

  // Check if current theme is dark
  const isDark = computed(() => theme.global.current.value.dark)

  return {
    theme,
    toggleTheme,
    isDark,
    initTheme,
    currentTheme: colorMode
  }
}
