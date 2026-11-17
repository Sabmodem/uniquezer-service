<template>
  <div>
    <v-card variant="outlined">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-avatar color="success" size="40">
            <v-icon color="white">mdi-resize</v-icon>
          </v-avatar>
          <div class="ml-3">
            <h4>Resize Image</h4>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Change the dimensions of the image
            </p>
          </div>
        </div>

        <v-row>
          <!-- Width -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="localOperation.width"
              label="Width"
              suffix="pixels"
              type="number"
              variant="outlined"
              min="1"
              :rules="sizeRules"
              @update:model-value="onWidthChange"
            >
              <template #prepend-inner>
                <v-icon>mdi-arrow-left-right</v-icon>
              </template>
            </v-text-field>
          </v-col>

          <!-- Height -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="localOperation.height"
              label="Height"
              suffix="pixels"
              type="number"
              variant="outlined"
              min="1"
              :rules="sizeRules"
              @update:model-value="onHeightChange"
            >
              <template #prepend-inner>
                <v-icon>mdi-arrow-up-down</v-icon>
              </template>
            </v-text-field>
          </v-col>
        </v-row>

        <!-- Aspect Ratio Lock -->
        <div class="mb-4">
          <v-checkbox
            v-model="lockAspectRatio"
            label="Lock aspect ratio"
            color="primary"
            hide-details
          >
            <template #label>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-link-variant</v-icon>
                <div>
                  <div>Lock aspect ratio</div>
                  <div class="text-caption text-medium-emphasis">
                    Maintain proportions when changing dimensions
                  </div>
                </div>
              </div>
            </template>
          </v-checkbox>
          
          <div v-if="lockAspectRatio" class="mt-2 ml-8">
            <span class="text-body-2">Current ratio: {{ aspectRatio }}</span>
          </div>
        </div>

        <!-- Quick Size Presets -->
        <div class="mb-4">
          <h4 class="text-subtitle-1 mb-3">Common Sizes</h4>
          <div class="d-flex flex-wrap ga-2">
            <v-btn
              v-for="preset in sizePresets"
              :key="preset.name"
              size="small"
              variant="outlined"
              @click="applyPreset(preset)"
            >
              {{ preset.name }}
            </v-btn>
          </div>
        </div>

        <!-- Resampling Method -->
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="localOperation.resample"
              :items="resamplingOptions"
              label="Resampling Method"
              variant="outlined"
              @update:model-value="updateOperation"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
        </v-row>

        <!-- Size Comparison -->
        <v-card variant="tonal" class="pa-4 mb-4">
          <h4 class="text-subtitle-1 mb-2">Size Information</h4>
          <v-row dense>
            <v-col cols="6">
              <div class="text-center">
                <div class="text-h6">{{ localOperation.width }}×{{ localOperation.height }}</div>
                <div class="text-caption text-medium-emphasis">New Size</div>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-center">
                <div class="text-h6">{{ (localOperation.width * localOperation.height / 1000000).toFixed(1) }}MP</div>
                <div class="text-caption text-medium-emphasis">Megapixels</div>
              </div>
            </v-col>
          </v-row>
        </v-card>

        <!-- Preview Summary -->
        <v-alert 
          type="info" 
          variant="tonal" 
          class="mt-4"
          :text="getPreviewText()"
          title="Resize Preview"
        ></v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ResizeOperation } from '~/types'
import { RESAMPLING_OPTIONS } from '~/types'

interface Props {
  operation: ResizeOperation
}

interface Emits {
  'update:operation': [operation: ResizeOperation]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local reactive copy
const localOperation = ref<ResizeOperation>({ ...props.operation })
const lockAspectRatio = ref(false)
const originalAspectRatio = ref(1)

// Initialize aspect ratio
if (localOperation.value.width && localOperation.value.height) {
  originalAspectRatio.value = localOperation.value.width / localOperation.value.height
}

// Size presets
const sizePresets = [
  { name: '1920×1080 (FHD)', width: 1920, height: 1080 },
  { name: '1280×720 (HD)', width: 1280, height: 720 },
  { name: '1024×768', width: 1024, height: 768 },
  { name: '800×600', width: 800, height: 600 },
  { name: '512×512', width: 512, height: 512 },
  { name: '256×256', width: 256, height: 256 },
]

// Validation rules
const sizeRules = [
  (v: number) => v !== null && v !== undefined || 'Size is required',
  (v: number) => v > 0 || 'Size must be positive',
  (v: number) => v <= 10000 || 'Size must be reasonable (≤10000px)'
]

// Resampling options for select
const resamplingOptions = computed(() => 
  RESAMPLING_OPTIONS.map(option => ({
    title: option.label,
    value: option.value,
    description: option.description
  }))
)

// Computed values
const aspectRatio = computed(() => {
  const ratio = localOperation.value.width / localOperation.value.height
  return ratio.toFixed(3)
})

// Watch for prop changes
watch(() => props.operation, (newOp) => {
  localOperation.value = { ...newOp }
}, { deep: true })

// Methods
const updateOperation = () => {
  emit('update:operation', { ...localOperation.value })
}

const onWidthChange = () => {
  if (lockAspectRatio.value && originalAspectRatio.value) {
    localOperation.value.height = Math.round(localOperation.value.width / originalAspectRatio.value)
  }
  updateOperation()
}

const onHeightChange = () => {
  if (lockAspectRatio.value && originalAspectRatio.value) {
    localOperation.value.width = Math.round(localOperation.value.height * originalAspectRatio.value)
  }
  updateOperation()
}

const applyPreset = (preset: typeof sizePresets[0]) => {
  localOperation.value.width = preset.width
  localOperation.value.height = preset.height
  
  // Update aspect ratio reference
  originalAspectRatio.value = preset.width / preset.height
  
  updateOperation()
}

const getPreviewText = () => {
  const resamplingOption = RESAMPLING_OPTIONS.find(r => r.value === localOperation.value.resample)
  const method = resamplingOption?.label || 'Default'
  const megapixels = (localOperation.value.width * localOperation.value.height / 1000000).toFixed(1)
  
  return `Resize to ${localOperation.value.width}×${localOperation.value.height}px (${megapixels}MP) using ${method.toLowerCase()} resampling | Aspect ratio: ${aspectRatio.value}`
}
</script>
