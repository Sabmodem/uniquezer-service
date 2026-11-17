<template>
  <v-card class="w-100 h-100">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-3">mdi-cog-outline</v-icon>
      <p class="hidden-sm-and-down">Processing Operations</p>
      <v-spacer></v-spacer>
      <v-chip 
        v-if="operationsCount > 0"
        size="small" 
        color="primary"
        class="mr-3"
      >
        {{ operationsCount }} operation{{ operationsCount === 1 ? '' : 's' }}
      </v-chip>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="$emit('add-operation')"
      >
        <p class="hidden-sm-and-down">Add Operation</p>
      </v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <!-- Operations List -->
    <div v-if="operationsCount > 0">
      <v-list lines="two">
        <template v-for="(operation, index) in settings.settings" :key="`op-${index}`">
          <v-list-item>
            <template #prepend>
              <v-avatar
                :color="getOperationColor(operation.type)"
                size="40"
              >
                <v-icon :icon="getOperationIcon(operation.type)" color="white"></v-icon>
              </v-avatar>
            </template>

            <v-list-item-title>
              <div class="d-flex align-center">
                <strong class="mr-2">{{ getOperationTypeLabel(operation.type) }}</strong>
                <v-chip size="small" variant="outlined" color="primary">
                  #{{ index + 1 }}
                </v-chip>
              </div>
            </v-list-item-title>

            <v-list-item-subtitle class="mt-1">
              {{ getOperationSummary(operation) }}
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex flex-column ga-1">
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  size="small"
                  color="info"
                  @click="$emit('edit-operation', index)"
                  title="Edit operation"
                ></v-btn>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  @click="confirmDelete(index)"
                  title="Delete operation"
                ></v-btn>
              </div>
            </template>
          </v-list-item>
          
          <v-divider v-if="index < settings.settings.length - 1"></v-divider>
        </template>
      </v-list>

      <!-- Footer with actions -->
      <v-card-text class="text-center border-t">
        <div class="d-flex justify-center align-center ga-4">
          <div class="text-medium-emphasis">
            {{ operationsCount }} operation{{ operationsCount === 1 ? '' : 's' }} configured
          </div>
          
          <v-divider vertical></v-divider>
          
          <v-btn
            color="warning"
            variant="outlined"
            size="small"
            prepend-icon="mdi-delete-sweep"
            @click="confirmClearAll"
            :disabled="operationsCount === 0"
          >
            Clear All
          </v-btn>
          
          <v-btn
            color="info"
            variant="outlined"
            size="small"
            prepend-icon="mdi-export"
            @click="exportSettings"
            :disabled="operationsCount === 0"
          >
            Export
          </v-btn>
        </div>
      </v-card-text>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center pa-8">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">
        mdi-cog-outline
      </v-icon>
      <h3 class="text-h6 mb-2 text-medium-emphasis">No operations configured</h3>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Add image processing operations to transform your photo
      </p>
      <v-btn 
        color="primary" 
        size="large"
        @click="$emit('add-operation')"
      >
        <v-icon class="mr-2">mdi-plus</v-icon>
        Add First Operation
      </v-btn>
    </div>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this operation?
          <div class="mt-3 pa-3 rounded">
            <strong>{{ getOperationTypeLabel(operationToDelete?.type || '') }}</strong><br>
            <span class="text-body-2">{{ getOperationSummary(operationToDelete) }}</span>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="executeDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Clear All Confirmation Dialog -->
    <v-dialog v-model="clearDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Clear All Operations
        </v-card-title>
        <v-card-text>
          Are you sure you want to clear all {{ operationsCount }} operations? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="clearDialog = false">Cancel</v-btn>
          <v-btn color="warning" @click="executeClearAll">Clear All</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AnyImageOperation } from '~/types'
import { getOperationSummary, getOperationIcon, getOperationTypeLabel } from '~/utils/operationSummary'

// Emits
interface Emits {
  'add-operation': []
  'edit-operation': [index: number]
}

defineEmits<Emits>()

// Global state
const { 
  settings, 
  operationsCount, 
  removeOperation, 
  clearOperations,
  exportSettings: exportSettingsFromState
} = useImageProcessing()

const { success, warning } = useNotifications()

// Local state for dialogs
const deleteDialog = ref(false)
const clearDialog = ref(false)
const deleteIndex = ref(-1)
const operationToDelete = ref<AnyImageOperation | null>(null)

// Methods
const getOperationColor = (type: string): string => {
  const colors = ['primary', 'secondary', 'accent', 'success', 'warning', 'info', 'error']
  const hash = type.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return colors[Math.abs(hash) % colors.length]
}

const confirmDelete = (index: number) => {
  deleteIndex.value = index
  operationToDelete.value = settings.value.settings[index]
  deleteDialog.value = true
}

const executeDelete = () => {
  if (deleteIndex.value >= 0) {
    const operation = settings.value.settings[deleteIndex.value]
    removeOperation(deleteIndex.value)
    success(`Deleted ${getOperationTypeLabel(operation.type)} operation`)
  }
  deleteDialog.value = false
  deleteIndex.value = -1
  operationToDelete.value = null
}

const confirmClearAll = () => {
  clearDialog.value = true
}

const executeClearAll = () => {
  const count = operationsCount.value
  clearOperations()
  warning(`Cleared all ${count} operations`)
  clearDialog.value = false
}

const exportSettings = () => {
  const exported = exportSettingsFromState()
  
  // Create and download file
  const blob = new Blob([exported], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `image-processing-settings-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  success('Settings exported successfully!')
}
</script>

<style scoped>
.border-t {
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
