<template>
  <div>
    <!-- <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-6">
          <v-icon left size="large">mdi-image-edit-outline</v-icon>
          Process Your Images
        </h1>
      </v-col>
    </v-row> -->

    <!-- Processing Mode Switch -->
    <v-row>
      <v-col cols="12">
        <ProcessingModeSwitch @mode-changed="onModeChanged" />
      </v-col>
    </v-row>

    <v-row>
      <!-- Upload Section -->
      <v-col>
        <UploadComponent />
      </v-col>
      
      <!-- Single Mode: Settings Section -->
      <v-col v-if="currentMode === 'single'">
        <ImageSettingsEditor />
      </v-col>

      <v-col v-if="currentMode === 'batch'">
        <BatchOperationsBuilder />
      </v-col>
    </v-row>

    <!-- Single Mode: Process Button -->
    <v-row v-if="currentMode === 'single' && canProcess" class="mt-4">
      <v-col cols="12" class="text-center">
        <v-btn
          color="primary"
          size="x-large"
          prepend-icon="mdi-play-circle"
          :disabled="!canProcess || isProcessing"
          :loading="isProcessing"
          @click="startSingleProcessing"
        >
          Process Image ({{ operationsCount }} operation{{ operationsCount === 1 ? '' : 's' }})
        </v-btn>
      </v-col>
    </v-row>

    <!-- Processing Status (Both Modes) -->
    <v-row v-if="isProcessing" class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center pa-6">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
              class="mb-4"
            ></v-progress-circular>
            
            <h3 class="text-h6 mb-2">
              {{ currentMode === 'batch' ? 'Processing Batch' : 'Processing Your Image' }}
            </h3>
            
            <p class="text-body-2 text-medium-emphasis mb-4">
              <span v-if="currentMode === 'batch'">
                Processing {{ batchStatusSummary.completed + 1 }}/{{ batchStatusSummary.total }} variations...
              </span>
              <span v-else>
                Applying {{ operationsCount }} operation{{ operationsCount === 1 ? '' : 's' }}...
              </span>
            </p>
            
            <p v-if="currentJobId" class="text-body-2 text-medium-emphasis mb-4">
              Job ID: {{ currentJobId }}
            </p>
            
            <v-progress-linear
              :value="processingProgress"
              height="8"
              rounded
              class="mt-4"
              style="max-width: 400px; margin: 0 auto;"
            >
              <strong>{{ Math.round(processingProgress) }}%</strong>
            </v-progress-linear>

            <!-- Batch specific progress -->
            <div v-if="currentMode === 'batch'" class="mt-4">
              <div class="text-body-2">
                Completed: {{ batchStatusSummary.completed }} | 
                Failed: {{ batchStatusSummary.failed }} |
                Remaining: {{ batchStatusSummary.pending }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- UNIFIED RESULTS SECTION - Replaces both single and batch result displays -->
    <v-row v-if="hasResults && !isProcessing" class="mt-4">
      <v-col cols="12">
        <ProcessingResults />
      </v-col>
    </v-row>

    <!-- Error State (Both Modes) -->
    <v-row v-if="processingError" class="mt-4">
      <v-col cols="12">
        <v-alert type="error" variant="outlined" class="mb-4">
          <div class="d-flex align-center">
            <v-icon class="mr-3">mdi-alert-circle</v-icon>
            <div>
              <strong>Processing Failed</strong><br>
              {{ processingError }}
            </div>
          </div>
          
          <template #append>
            <v-btn
              color="error"
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="resetProcessingState"
            >
              Try Again
            </v-btn>
          </template>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Instructions -->
    <v-row v-if="!hasUploadedFile || (!hasOperations && currentMode === 'single')" class="mt-4">
      <v-col cols="12">
        <v-card variant="outlined">
          <v-card-text>
            <h4 class="mb-3">Getting Started:</h4>
            <div class="d-flex align-start">
              <v-icon 
                :color="hasUploadedFile ? 'success' : 'grey'" 
                class="mr-3 mt-1"
              >
                {{ hasUploadedFile ? 'mdi-check' : 'mdi-numeric-1-circle' }}
              </v-icon>
              <div>
                <strong>Upload an image</strong>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ hasUploadedFile ? '✓ File uploaded successfully' : 'Select an image file to process' }}
                </p>
              </div>
            </div>
            
            <div v-if="currentMode === 'single'" class="d-flex align-start mt-3">
              <v-icon 
                :color="hasOperations ? 'success' : 'grey'" 
                class="mr-3 mt-1"
              >
                {{ hasOperations ? 'mdi-check' : 'mdi-numeric-2-circle' }}
              </v-icon>
              <div>
                <strong>Configure operations</strong>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ hasOperations ? `✓ ${operationsCount} operation${operationsCount === 1 ? '' : 's'} configured` : 'Add at least one processing operation' }}
                </p>
              </div>
            </div>
            
            <div v-if="currentMode === 'batch'" class="d-flex align-start mt-3">
              <v-icon 
                :color="batchStatusSummary.total > 0 ? 'success' : 'grey'" 
                class="mr-3 mt-1"
              >
                {{ batchStatusSummary.total > 0 ? 'mdi-check' : 'mdi-numeric-2-circle' }}
              </v-icon>
              <div>
                <strong>Configure batch operations</strong>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ batchStatusSummary.total > 0 ? `✓ ${batchStatusSummary.total} combinations prepared` : 'Set up parameter ranges for batch processing' }}
                </p>
              </div>
            </div>
            
            <div class="d-flex align-start mt-3">
              <v-icon 
                :color="(canProcess && currentMode === 'single') || (batchStatusSummary.total > 0 && currentMode === 'batch') ? 'success' : 'grey'" 
                class="mr-3 mt-1"
              >
                {{ (canProcess && currentMode === 'single') || (batchStatusSummary.total > 0 && currentMode === 'batch') ? 'mdi-check' : 'mdi-numeric-3-circle' }}
              </v-icon>
              <div>
                <strong>Process image{{ currentMode === 'batch' ? 's' : '' }}</strong>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ (canProcess && currentMode === 'single') || (batchStatusSummary.total > 0 && currentMode === 'batch') ? 'Ready to process!' : 'Complete previous steps first' }}
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Debug Information (Collapsible) -->
    <!-- <v-row class="mt-4">
      <v-col cols="12">
        <v-expansion-panels variant="accordion">
          <v-expansion-panel title="Debug Information">
            <v-expansion-panel-text>
              <h4>State Information:</h4>
              <v-row dense>
                <v-col cols="6" sm="3">
                  <strong>Has Uploaded File:</strong><br>
                  <v-chip :color="hasUploadedFile ? 'success' : 'error'" size="small">
                    {{ hasUploadedFile }}
                  </v-chip>
                </v-col>
                <v-col cols="6" sm="3">
                  <strong>File ID:</strong><br>
                  <code class="text-caption">{{ fileId || 'None' }}</code>
                </v-col>
                <v-col cols="6" sm="3">
                  <strong>Operations Count:</strong><br>
                  <v-chip color="primary" size="small">{{ operationsCount }}</v-chip>
                </v-col>
                <v-col cols="6" sm="3">
                  <strong>Results Count:</strong><br>
                  <v-chip color="info" size="small">{{ resultsCount }}</v-chip>
                </v-col>
              </v-row>
              
              <h4 class="mt-4 mb-2">Current Settings:</h4>
              <v-card variant="outlined" class="pa-3">
                <pre class="text-caption" style="white-space: pre-wrap; max-height: 300px; overflow-y: auto;">{{ JSON.stringify(settings, null, 2) }}</pre>
              </v-card>

              <h4 class="mt-4 mb-2">Results Summary:</h4>
              <v-card variant="outlined" class="pa-3">
                <pre class="text-caption">{{ JSON.stringify(resultsSummary, null, 2) }}</pre>
              </v-card>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Set page title
useHead({
  title: 'Process Images - Photo Uniqueizer'
})

// Global state - single processing
const {
  hasUploadedFile,
  fileId,
  settings,
  operationsCount,
  hasOperations,
  canProcess,
  isProcessing,
  processingProgress,
  processingError,
  currentJobId,
  resetProcessingState,
  processImageWithState
} = useImageProcessing()

// Global state - batch processing
const {
  getBatchStatusSummary
} = useBatchProcessing()

// Global state - unified results
const {
  resultsCount,
  hasResults,
  getResultsSummary
} = useProcessingResults()

// Local state
const currentMode = ref<'single' | 'batch'>('single')

// Computed
const batchStatusSummary = computed(() => getBatchStatusSummary())
const resultsSummary = computed(() => getResultsSummary())

// Methods
const onModeChanged = (mode: 'single' | 'batch') => {
  currentMode.value = mode
}

const startSingleProcessing = async () => {
  if (!canProcess.value) {
    return
  }

  try {
    await processImageWithState()
  } catch (error) {
    console.error('Single processing failed:', error)
  }
}
</script>
