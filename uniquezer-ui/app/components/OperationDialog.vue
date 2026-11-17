<template>
  <v-dialog v-model="show" max-width="800" persistent scrollable>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-3">
          {{ mode === 'add' ? 'mdi-plus-circle' : 'mdi-pencil' }}
        </v-icon>
        {{ mode === 'add' ? 'Add New Operation' : 'Edit Operation' }}
        <v-spacer></v-spacer>
        <v-btn 
          icon="mdi-close" 
          variant="text" 
          @click="cancel"
        ></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-0">
        <div class="pa-6">
          <!-- Operation Type Selector (only for add mode) -->
          <div v-if="mode === 'add'" class="mb-6">
            <v-select
              v-model="selectedType"
              :items="operationTypeOptions"
              label="Operation Type"
              placeholder="Select an operation type"
              variant="outlined"
              clearable
              @update:model-value="onTypeChange"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-avatar size="32" :color="getOperationColor(item.value)">
                      <v-icon :icon="getOperationIcon(item.value)" color="white" size="16"></v-icon>
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>
              
              <template #selection="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="24" :color="getOperationColor(item.value)" class="mr-2">
                    <v-icon :icon="getOperationIcon(item.value)" color="white" size="12"></v-icon>
                  </v-avatar>
                  {{ item.title }}
                </div>
              </template>
            </v-select>
          </div>

          <!-- Current Operation Type (for edit mode) -->
          <div v-else class="mb-6">
            <v-card variant="outlined" class="pa-4">
              <div class="d-flex align-center">
                <v-avatar size="40" :color="getOperationColor(workingOperation?.type)">
                  <v-icon :icon="getOperationIcon(workingOperation?.type)" color="white"></v-icon>
                </v-avatar>
                <div class="ml-3">
                  <h4>{{ getOperationTypeLabel(workingOperation?.type || '') }}</h4>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Editing existing operation
                  </p>
                </div>
              </div>
            </v-card>
          </div>

          <!-- Operation Form -->
          <div v-if="workingOperation">
            <OperationForm
              :operation="workingOperation"
              @update:operation="onOperationUpdate"
            />
          </div>

          <!-- No Type Selected Message -->
          <div v-else-if="mode === 'add'" class="text-center py-12">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-arrow-up-circle-outline
            </v-icon>
            <h3 class="text-h6 mb-2 text-medium-emphasis">
              Select an operation type
            </h3>
            <p class="text-body-2 text-medium-emphasis">
              Choose from the dropdown above to configure its settings
            </p>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        
        <v-btn 
          variant="text" 
          @click="cancel"
          :disabled="loading"
        >
          Cancel
        </v-btn>
        
        <v-btn
          color="primary"
          :disabled="!canSave"
          :loading="loading"
          @click="save"
        >
          <v-icon class="mr-2">
            {{ mode === 'add' ? 'mdi-plus' : 'mdi-content-save' }}
          </v-icon>
          {{ mode === 'add' ? 'Add Operation' : 'Save Changes' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { AnyImageOperation } from '~/types'
import { UniqueizationType } from '~/types'
import { getOperationIcon, getOperationTypeLabel } from '~/utils/operationSummary'
import { createDefaultOperation } from '~/utils/operationDefaults'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit'
  operation: AnyImageOperation | null
}

interface Emits {
  'update:modelValue': [value: boolean]
  'save': [operation: AnyImageOperation]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local state
const selectedType = ref<UniqueizationType | null>(null)
const workingOperation = ref<AnyImageOperation | null>(null)
const loading = ref(false)

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const operationTypeOptions = computed(() => {
  return Object.values(UniqueizationType).map(type => ({
    title: getOperationTypeLabel(type),
    value: type
  }))
})

const canSave = computed(() => {
  return !!workingOperation.value && !loading.value
})

// Watchers
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    initializeDialog()
  } else {
    resetDialog()
  }
})

// Methods
const initializeDialog = () => {
  loading.value = false
  
  if (props.mode === 'edit' && props.operation) {
    // Edit mode: clone the existing operation
    workingOperation.value = JSON.parse(JSON.stringify(props.operation))
    selectedType.value = props.operation.type
  } else {
    // Add mode: reset everything
    selectedType.value = null
    workingOperation.value = null
  }
}

const resetDialog = () => {
  selectedType.value = null
  workingOperation.value = null
  loading.value = false
}

const getOperationColor = (type?: string): string => {
  if (!type) return 'grey'
  const colors = ['primary', 'secondary', 'accent', 'success', 'warning', 'info', 'error']
  const hash = type.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return colors[Math.abs(hash) % colors.length]
}

const onTypeChange = (type: UniqueizationType | null) => {
  if (type) {
    try {
      workingOperation.value = createDefaultOperation(type)
    } catch (error) {
      console.error('Failed to create default operation:', error)
      workingOperation.value = null
    }
  } else {
    workingOperation.value = null
  }
}

const onOperationUpdate = (operation: AnyImageOperation) => {
  workingOperation.value = operation
}

const save = async () => {
  if (!workingOperation.value) return
  
  try {
    loading.value = true
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 100))
    
    emit('save', workingOperation.value)
    show.value = false
  } catch (error) {
    console.error('Failed to save operation:', error)
  } finally {
    loading.value = false
  }
}

const cancel = () => {
  show.value = false
}
</script>
