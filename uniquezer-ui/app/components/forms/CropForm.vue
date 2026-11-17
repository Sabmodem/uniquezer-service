<template>
  <div>
    <v-card variant="outlined">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-avatar color="secondary" size="40">
            <v-icon color="white">mdi-crop</v-icon>
          </v-avatar>
          <div class="ml-3">
            <h4>Crop Image</h4>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Define a rectangular area to extract from the image
            </p>
          </div>
        </div>

        <v-row>
          <!-- Left Coordinate -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="localOperation.left"
              label="Left (X)"
              suffix="pixels"
              type="number"
              variant="outlined"
              min="0"
              :rules="coordinateRules"
              @update:model-value="updateOperation"
            >
              <template #prepend-inner>
                <v-icon>mdi-arrow-right</v-icon>
              </template>
            </v-text-field>
          </v-col>

          <!-- Top Coordinate -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="localOperation.top"
              label="Top (Y)"
              suffix="pixels"
              type="number"
              variant="outlined"
              min="0"
              :rules="coordinateRules"
              @update:model-value="updateOperation"
            >
              <template #prepend-inner>
                <v-icon>mdi-arrow-down</v-icon>
              </template>
            </v-text-field>
          </v-col>

          <!-- Right Coordinate -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="localOperation.right"
              label="Right (X)"
              suffix="pixels"
              type="number"
              variant="outlined"
              :min="localOperation.left + 1"
              :rules="rightRules"
              @update:model-value="updateOperation"
            >
              <template #prepend-inner>
                <v-icon>mdi-arrow-left</v-icon>
              </template>
            </v-text-field>
          </v-col>

          <!-- Bottom Coordinate -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="localOperation.bottom"
              label="Bottom (Y)"
              suffix="pixels"
              type="number"
              variant="outlined"
              :min="localOperation.top + 1"
              :rules="bottomRules"
              @update:model-value="updateOperation"
            >
              <template #prepend-inner>
                <v-icon>mdi-arrow-up</v-icon>
              </template>
            </v-text-field>
          </v-col>
        </v-row>

        <!-- Quick Presets -->
        <div class="mb-4">
          <h4 class="text-subtitle-1 mb-3">Quick Presets</h4>
          <div class="d-flex flex-wrap ga-2">
            <v-btn
              v-for="preset in cropPresets"
              :key="preset.name"
              size="small"
              variant="outlined"
              @click="applyPreset(preset)"
            >
              {{ preset.name }}
            </v-btn>
          </div>
        </div>

        <!-- Visual Helper -->
        <v-card variant="tonal" class="pa-4 mb-4">
          <h4 class="text-subtitle-1 mb-2">Crop Area Visualization</h4>
          <div class="crop-preview">
            <div class="crop-canvas">
              <div 
                class="crop-area"
                :style="cropAreaStyle"
              ></div>
            </div>
            <div class="d-flex justify-space-between align-center mt-2">
              <span class="text-caption">Width: {{ cropWidth }}px</span>
              <span class="text-caption">Height: {{ cropHeight }}px</span>
              <span class="text-caption">Aspect: {{ aspectRatio }}</span>
            </div>
          </div>
        </v-card>

        <!-- Preview Summary -->
        <v-alert 
          type="info" 
          variant="tonal" 
          class="mt-4"
          :text="getPreviewText()"
          title="Crop Preview"
        ></v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CropOperation } from '~/types'

interface Props {
  operation: CropOperation
}

interface Emits {
  'update:operation': [operation: CropOperation]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local reactive copy
const localOperation = ref<CropOperation>({ ...props.operation })

// Quick crop presets
const cropPresets = [
  { name: 'Square 100x100', left: 0, top: 0, right: 100, bottom: 100 },
  { name: 'Center 200x200', left: 50, top: 50, right: 250, bottom: 250 },
  { name: 'Wide 300x150', left: 0, top: 0, right: 300, bottom: 150 },
  { name: 'Portrait 150x300', left: 0, top: 0, right: 150, bottom: 300 },
]

// Validation rules
const coordinateRules = [
  (v: number) => v !== null && v !== undefined || 'Coordinate is required',
  (v: number) => v >= 0 || 'Coordinate must be non-negative'
]

const rightRules = [
  ...coordinateRules,
  (v: number) => v > localOperation.value.left || 'Right must be greater than left'
]

const bottomRules = [
  ...coordinateRules,
  (v: number) => v > localOperation.value.top || 'Bottom must be greater than top'
]

// Computed values
const cropWidth = computed(() => localOperation.value.right - localOperation.value.left)
const cropHeight = computed(() => localOperation.value.bottom - localOperation.value.top)

const aspectRatio = computed(() => {
  const ratio = cropWidth.value / cropHeight.value
  return ratio.toFixed(2)
})

const cropAreaStyle = computed(() => {
  const maxSize = 200
  const scaleX = maxSize / Math.max(localOperation.value.right, 400)
  const scaleY = maxSize / Math.max(localOperation.value.bottom, 400)
  
  return {
    left: (localOperation.value.left * scaleX) + 'px',
    top: (localOperation.value.top * scaleY) + 'px',
    width: (cropWidth.value * scaleX) + 'px',
    height: (cropHeight.value * scaleY) + 'px'
  }
})

// Watch for prop changes
watch(() => props.operation, (newOp) => {
  localOperation.value = { ...newOp }
}, { deep: true })

// Methods
const updateOperation = () => {
  emit('update:operation', { ...localOperation.value })
}

const applyPreset = (preset: typeof cropPresets[0]) => {
  localOperation.value.left = preset.left
  localOperation.value.top = preset.top
  localOperation.value.right = preset.right
  localOperation.value.bottom = preset.bottom
  updateOperation()
}

const getPreviewText = () => {
  return `Crop area: (${localOperation.value.left}, ${localOperation.value.top}) to (${localOperation.value.right}, ${localOperation.value.bottom}) | Size: ${cropWidth.value}×${cropHeight.value}px | Aspect ratio: ${aspectRatio.value}`
}
</script>

<style scoped>
.crop-preview {
  max-width: 300px;
  margin: 0 auto;
}

.crop-canvas {
  position: relative;
  width: 200px;
  height: 200px;
  border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  background: repeating-conic-gradient(#f0f0f0 0% 25%, #e0e0e0 25% 50%) 50% / 20px 20px;
  margin: 0 auto;
}

.crop-area {
  position: absolute;
  border: 2px solid rgb(var(--v-theme-secondary));
  background: rgba(var(--v-theme-secondary), 0.2);
  border-radius: 2px;
}
</style>
