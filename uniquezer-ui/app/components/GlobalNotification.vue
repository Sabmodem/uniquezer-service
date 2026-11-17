<template>
  <v-snackbar
    v-model="notification.show"
    :color="notification.color"
    :timeout="notification.timeout"
    location="top right"
    variant="elevated"
    class="global-notification"
  >
    <div class="d-flex align-center">
      <v-icon :icon="notification.icon" class="mr-3"></v-icon>
      <span>{{ notification.message }}</span>
    </div>
    
    <template #actions>
      <v-btn
        icon="mdi-close"
        variant="text"
        @click="close"
        size="small"
      ></v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
// Use the new global notification state
const { notification, close } = useNotifications()
</script>

<style scoped>
.global-notification {
  z-index: 9999;
}
</style>
