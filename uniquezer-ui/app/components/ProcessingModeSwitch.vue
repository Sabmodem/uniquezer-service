<template>
  <v-card class="mb-6">
    <v-card-text class="pa-4">
        <div>
          <v-row>
            <v-col>
              <div>
                <h4 class="text-h6 mb-2">Processing Mode</h4>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Choose between single image processing or batch processing with variations
                </p>
              </div>
            </v-col>
            <v-col>
              <v-btn-toggle
                v-model="selectedMode"
                color="primary"
                mandatory
                rounded="lg"
                @update:model-value="onModeChange"
              >
              <div>
                <v-btn value="single" prepend-icon="mdi-image" class="px-6 h-100">
                  Single
                </v-btn>
              </div>
              <div class="w-50">
                <v-btn value="batch" prepend-icon="mdi-content-duplicate" class="px-6 h-100">
                  Batch
                </v-btn>
              </div>
              </v-btn-toggle>
            </v-col>
          </v-row>
        </div>

      <!-- Mode Descriptions -->
      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <v-card 
            :variant="selectedMode === 'single' ? 'elevated' : 'outlined'"
            :color="selectedMode === 'single' ? 'primary' : undefined"
            class="pa-4 mode-card"
          >
            <div class="d-flex align-center mb-2">
              <v-icon class="mr-2" :color="selectedMode === 'single' ? 'white' : 'primary'">
                mdi-image
              </v-icon>
              <strong :class="{ 'text-white': selectedMode === 'single' }">
                Single Processing
              </strong>
            </div>
            <p :class="{ 'text-white': selectedMode === 'single' }" class="text-body-2 mb-0">
              Process one image with your configured operations. Perfect for testing settings 
              or when you need just one specific result.
            </p>
            
            <div class="mt-3">
              <v-chip 
                size="small" 
                :color="selectedMode === 'single' ? 'white' : 'primary'"
                :variant="selectedMode === 'single' ? 'elevated' : 'outlined'"
              >
                1 Result
              </v-chip>
              <v-chip 
                size="small" 
                :color="selectedMode === 'single' ? 'white' : 'success'"
                :variant="selectedMode === 'single' ? 'elevated' : 'outlined'"
                class="ml-2"
              >
                Fast
              </v-chip>
            </div>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-card 
            :variant="selectedMode === 'batch' ? 'elevated' : 'outlined'"
            :color="selectedMode === 'batch' ? 'secondary' : undefined"
            class="pa-4 mode-card"
          >
            <div class="d-flex align-center mb-2">
              <v-icon class="mr-2" :color="selectedMode === 'batch' ? 'white' : 'secondary'">
                mdi-content-duplicate
              </v-icon>
              <strong :class="{ 'text-white': selectedMode === 'batch' }">
                Batch Processing
              </strong>
            </div>
            <p :class="{ 'text-white': selectedMode === 'batch' }" class="text-body-2 mb-0">
              Create multiple unique variations by defining parameter ranges. Generate many 
              similar images with small differences - perfect for content creation.
            </p>
            
            <div class="mt-3">
              <v-chip 
                size="small" 
                :color="selectedMode === 'batch' ? 'white' : 'secondary'"
                :variant="selectedMode === 'batch' ? 'elevated' : 'outlined'"
              >
                Multiple Results
              </v-chip>
              <v-chip 
                size="small" 
                :color="selectedMode === 'batch' ? 'white' : 'warning'"
                :variant="selectedMode === 'batch' ? 'elevated' : 'outlined'"
                class="ml-2"
              >
                Advanced
              </v-chip>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Batch Status (when in batch mode and has combinations) -->
      <div v-if="selectedMode === 'batch' && batchStatusSummary.total > 0 && canProcess" class="mt-4">
        <v-alert type="info" variant="tonal">
          <div class="d-flex align-center justify-space-between">
            <div>
              <strong>Batch Status:</strong> 
              {{ batchStatusSummary.completed }}/{{ batchStatusSummary.total }} completed
              <span v-if="batchStatusSummary.failed > 0" class="text-error ml-2">
                ({{ batchStatusSummary.failed }} failed)
              </span>
            </div>
            <div class="d-flex ga-2">
              <v-btn 
                v-if="batchStatusSummary.completed > 0"
                size="small"
                color="primary"
                prepend-icon="mdi-download"
                @click="downloadBatchResults"
              >
                Download Results
              </v-btn>
              <v-btn 
                size="small"
                variant="outlined"
                prepend-icon="mdi-delete"
                @click="clearBatch"
              >
                Clear Batch
              </v-btn>
            </div>
          </div>
          
          <v-progress-linear
            :value="batchStatusSummary.progress"
            height="4"
            rounded
            class="mt-2"
          ></v-progress-linear>
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Batch processing integration
const { 
  isBatchMode, 
  setBatchMode, 
  getBatchStatusSummary, 
  clearBatch,
  downloadBatchResults
} = useBatchProcessing()

const { canProcess } = useImageProcessing();

// Local state
const selectedMode = ref<'single' | 'batch'>(isBatchMode.value ? 'batch' : 'single')

// Computed
const batchStatusSummary = computed(() => getBatchStatusSummary())

// Methods
const onModeChange = (mode: 'single' | 'batch') => {
  setBatchMode(mode === 'batch')
  
  const { success } = useNotifications()
  if (mode === 'batch') {
    success('Switched to Batch Processing mode')
  } else {
    success('Switched to Single Processing mode')
  }
}

// Emit mode change for parent components
interface Emits {
  'mode-changed': [mode: 'single' | 'batch']
}

const emit = defineEmits<Emits>()

// Watch for mode changes and emit
watch(selectedMode, (newMode) => {
  emit('mode-changed', newMode)
})
</script>

<style scoped>
.mode-card {
  transition: all 0.3s ease;
  min-height: 140px;
}

.v-btn-toggle {
  border: 2px solid rgb(var(--v-theme-primary));
}
</style>
