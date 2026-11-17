<template>
  <v-card v-if="hasResults">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-3">mdi-image-multiple</v-icon>
      Processing Results
      <v-spacer></v-spacer>
      <v-chip size="small" color="primary">
        {{ resultsCount }} result{{ resultsCount === 1 ? '' : 's' }}
      </v-chip>
    </v-card-title>

    <v-divider></v-divider>

    <!-- Results Toolbar -->
    <v-card-text class="pa-4">
      <!-- <div class="d-flex align-center justify-space-between mb-4"> -->
      <v-row>
        <v-col cols="12" sm="6" md="4" lg="3">
          <div class="d-flex align-center ga-3">
            <v-checkbox :model-value="allSelected" :indeterminate="hasSelection && !allSelected"
              @update:model-value="selectAll" color="primary" hide-details>
              <template #label>
                <span class="text-body-2">
                  {{ allSelected ? 'Unselect All' : 'Select All' }}
                  {{ hasSelection ? `(${selectedCount} selected)` : '' }}
                </span>
              </template>
            </v-checkbox>
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="4" lg="3">
          <div class="d-flex ga-2">
            <v-btn color="primary" prepend-icon="mdi-download-multiple" :disabled="!hasSelection"
              @click="downloadSelected">
              Download Selected
              <span v-if="hasSelection">({{ selectedCount }})</span>
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="4" lg="3">
          <div>
            <v-btn color="error" variant="outlined" prepend-icon="mdi-delete-sweep" @click="confirmClearAll">
              Clear All
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Results Grid -->
      <v-row>
        <v-col v-for="result in allResults" :key="result.id" cols="12" sm="6" md="4" lg="3">
          <v-card :variant="selectedResults.has(result.id) ? 'elevated' : 'outlined'" class="result-card" height="100%">
            <!-- Selection Checkbox -->
            <div class="pa-2 d-flex justify-space-between">
              <v-checkbox :model-value="selectedResults.has(result.id)"
                @update:model-value="(selected) => selectResult(result.id, selected)" color="primary" hide-details
                density="compact"></v-checkbox>
              <v-chip size="small" :color="result.processing_mode === 'single' ? 'success' : 'info'">
                {{ result.processing_mode }}
              </v-chip>
            </div>

            <!-- Result Preview (Placeholder) -->
            <NuxtLink :to="result.url" target="_blank">
              <div class="result-preview"
                :style="{ 'background-image': 'url(' + result.url + ')', 'background-size': 'cover', 'background-position': 'center center' }">
                <v-icon size="64" color="grey-lighten-1">
                  mdi-image-outline
                </v-icon>
              </div>
            </NuxtLink>

            <!-- Result Info -->
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between mb-2">
                <v-chip size="x-small" color="primary" variant="outlined">
                  {{ result.operations_count }} op{{ result.operations_count === 1 ? '' : 's' }}
                </v-chip>
                <span class="text-caption text-medium-emphasis">
                  {{ formatDate(result.created_at) }}
                </span>
              </div>

              <div class="text-caption text-medium-emphasis mb-2">
                ID: {{ result.id.split('-').slice(-1)[0] }}
              </div>

              <!-- Individual Download Button -->
              <v-btn color="primary" variant="outlined" size="small" block prepend-icon="mdi-download"
                @click="downloadIndividual(result.id)">
                Download
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Results Summary -->
      <div v-if="resultsSummary.single > 0 || resultsSummary.batch > 0" class="mt-4">
        <v-divider class="mb-3"></v-divider>
        <div class="d-flex justify-center ga-6">
          <div v-if="resultsSummary.single > 0" class="text-center">
            <div class="text-h6 text-success">{{ resultsSummary.single }}</div>
            <div class="text-caption text-medium-emphasis">Single</div>
          </div>
          <div v-if="resultsSummary.batch > 0" class="text-center">
            <div class="text-h6 text-info">{{ resultsSummary.batch }}</div>
            <div class="text-caption text-medium-emphasis">Batch</div>
          </div>
        </div>
      </div>
    </v-card-text>

    <!-- Clear Confirmation Dialog -->
    <v-dialog v-model="clearDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Clear All Results
        </v-card-title>
        <v-card-text>
          Are you sure you want to clear all {{ resultsCount }} results?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="clearDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="executeClearAll">Clear All</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>

  <!-- Empty State -->
  <v-card v-else variant="outlined" class="text-center pa-8">
    <v-icon size="64" color="grey-lighten-1" class="mb-4">
      mdi-image-multiple-outline
    </v-icon>
    <h3 class="text-h6 mb-2 text-medium-emphasis">No Results Yet</h3>
    <p class="text-body-2 text-medium-emphasis">
      Processed images will appear here. Start by uploading an image and configuring operations.
    </p>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Use the unified results store
const {
  // State
  allResults,
  selectedResults,

  // Computed
  resultsCount,
  selectedCount,
  hasResults,
  hasSelection,
  allSelected,

  // Actions
  selectResult,
  selectAll,
  downloadIndividual,
  downloadSelected,
  clearResults,
  getResultsSummary
} = useProcessingResults()

// Notifications
const { success, warning } = useNotifications()

// Local state
const clearDialog = ref(false)

// Computed
const resultsSummary = computed(() => getResultsSummary())

// Methods
const confirmClearAll = () => {
  if (resultsCount.value > 0) {
    clearDialog.value = true
  }
}

const executeClearAll = () => {
  clearResults()
  clearDialog.value = false
  warning(`Cleared all results`)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`

  return date.toLocaleDateString()
}
</script>

<style scoped>
.result-card {
  transition: all 0.3s ease;
  position: relative;
}

.result-card:hover {
  transform: translateY(-2px);
}

.result-preview {
  height: 120px;
  /* background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%); */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 4px;
  margin: 0 12px;
}

.preview-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
}

.v-card--variant-elevated {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3) !important;
}

@media (max-width: 600px) {
  .result-preview {
    height: 100px;
  }
}
</style>
