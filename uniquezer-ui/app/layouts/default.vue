<template>
  <v-app>
    <v-app-bar app flat elevation="1">
      <v-app-bar-title>
        <NuxtLink to="/" class="text-decoration-none">
          <label
            class="cursor-pointer font-weight-bold text-primary"
            style="user-select: none;"
          >
            Photo Uniquezer
          </label>
        </NuxtLink>
      </v-app-bar-title>    

      <v-spacer></v-spacer>
      <!-- Theme Toggle Button -->
      <v-btn 
        :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'" 
        @click="toggleTheme"
        :title="isDark ? 'Light theme' : 'Dark theme'"
      ></v-btn>
      <NuxtLink to="/docs" target="_blank" class="text-decoration-none text-medium-emphasis" title="docs">
        <v-btn icon>
          <v-icon>mdi-help-circle-outline</v-icon>
        </v-btn>
      </NuxtLink>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-4">
        <slot></slot>
      </v-container>
    </v-main>

    <AppFooter />
    
    <GlobalNotification />
  </v-app>
</template>
<script setup lang="ts">
const { toggleTheme, isDark, initTheme } = useThemeMode()

// Initialize theme and auth on mount
onMounted(async () => {
  initTheme()
});

</script>