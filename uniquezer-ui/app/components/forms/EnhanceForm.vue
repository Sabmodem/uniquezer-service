<template>
  <div>
    <v-card variant="outlined">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-avatar color="warning" size="40">
            <v-icon color="white">mdi-brightness-6</v-icon>
          </v-avatar>
          <div class="ml-3">
            <h4>Enhance Image</h4>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Adjust brightness, contrast, sharpness, or color saturation
            </p>
          </div>
        </div>

        <v-row>
          <!-- Enhancement Method -->
          <v-col cols="12" md="6">
            <v-select
              v-model="localOperation.method"
              :items="enhanceOptions"
              label="Enhancement Type"
              variant="outlined"
              @update:model-value="updateOperation"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-icon :icon="item.raw.icon" :color="item.raw.color"></v-icon>
                  </template>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                </v-list-item>
              </template>
              
              <template #selection="{ item }">
                <div class="d-flex align-center">
                  <v-icon :icon="item.raw.icon" :color="item.raw.color" class="mr-2"></v-icon>
                  {{ item.title }}
                </div>
              </template>
            </v-select>
          </v-col>

          <!-- Enhancement Factor -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="localOperation.factor"
              label="Enhancement Factor"
              type="number"
              variant="outlined"
              step="0.1"
              min="0"
              max="3"
              :rules="factorRules"
              @update:model-value="updateOperation"
            >
              <template #prepend-inner>
                <v-icon>{{ getCurrentIcon() }}</v-icon>
              </template>
            </v-text-field>
          </v-col>
        </v-row>

        <!-- Factor Slider -->
        <div class="mb-4">
          <label class="text-body-2 text-medium-emphasis mb-2 d-block">
            Factor Slider ({{ localOperation.factor }})
          </label>
          <v-slider
            v-model="localOperation.factor"
            min="0"
            max="3"
            step="0.1"
            thumb-label="always"
            track-size="4"
            thumb-size="20"
            :color="getSliderColor()"
            @update:model-value="updateOperation"
          >
            <template #prepend>
              <v-icon>{{ getMinIcon() }}</v-icon>
            </template>
            <template #append>
              <v-icon>{{ getMaxIcon() }}</v-icon>
            </template>
          </v-slider>
        </div>

        <!-- Quick Presets -->
        <div class="mb-4">
          <h4 class="text-subtitle-1 mb-3">Quick Presets</h4>
          <div class="d-flex flex-wrap ga-2">
            <v-btn
              v-for="preset in quickPresets"
              :key="preset.value"
              size="small"
              variant="outlined"
              :color="Math.abs(localOperation.factor - preset.value) < 0.01 ? 'primary' : 'default'"
              @click="setFactor(preset.value)"
            >
              {{ preset.name }}
            </v-btn>
          </div>
        </div>

        <!-- Enhancement Info -->
        <v-card variant="tonal" class="pa-4 mb-4">
          <h4 class="text-subtitle-1 mb-2">Enhancement Guide</h4>
          <div class="enhancement-info">
            <div class="d-flex align-center mb-2">
              <v-icon size="small" class="mr-2">{{ getCurrentIcon() }}</v-icon>
              <strong>{{ getCurrentMethodName() }}</strong>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-2">
              {{ getCurrentDescription() }}
            </p>
            <div class="factor-guide">
              <v-row dense>
                <v-col cols="4" class="text-center">
                  <div class="text-body-2"><strong>0.0</strong></div>
                  <div class="text-caption text-medium-emphasis">{{ getMinLabel() }}</div>
                </v-col>
                <v-col cols="4" class="text-center">
                  <div class="text-body-2"><strong>1.0</strong></div>
                  <div class="text-caption text-medium-emphasis">Original</div>
                </v-col>
                <v-col cols="4" class="text-center">
                  <div class="text-body-2"><strong>3.0</strong></div>
                  <div class="text-caption text-medium-emphasis">{{ getMaxLabel() }}</div>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-card>

        <!-- Preview Summary -->
        <v-alert 
          :type="getAlertType()"
          variant="tonal" 
          class="mt-4"
          :text="getPreviewText()"
          title="Enhancement Preview"
        ></v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { EnhanceOperation } from '~/types'
import { EnhanceMethod } from '~/types'

interface Props {
  operation: EnhanceOperation
}

interface Emits {
  'update:operation': [operation: EnhanceOperation]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local reactive copy
const localOperation = ref<EnhanceOperation>({ ...props.operation })

// Enhancement options
const enhanceOptions = [
  {
    title: 'Brightness',
    value: EnhanceMethod.BRIGHTNESS,
    description: 'Adjust overall brightness of the image',
    icon: 'mdi-brightness-6',
    color: 'yellow-darken-2'
  },
  {
    title: 'Contrast',
    value: EnhanceMethod.CONTRAST,
    description: 'Adjust difference between light and dark areas',
    icon: 'mdi-contrast-circle',
    color: 'grey-darken-1'
  },
  {
    title: 'Sharpness',
    value: EnhanceMethod.SHARPNESS,
    description: 'Adjust edge definition and detail clarity',
    icon: 'mdi-details',
    color: 'blue'
  },
  {
    title: 'Color Saturation',
    value: EnhanceMethod.COLOR,
    description: 'Adjust color intensity and vibrancy',
    icon: 'mdi-palette',
    color: 'purple'
  }
]

// Quick factor presets
const quickPresets = [
  { name: 'None', value: 0.0 },
  { name: 'Low', value: 0.7 },
  { name: 'Original', value: 1.0 },
  { name: 'High', value: 1.3 },
  { name: 'Maximum', value: 2.0 },
]

// Validation rules
const factorRules = [
  (v: number) => v !== null && v !== undefined || 'Factor is required',
  (v: number) => v >= 0 || 'Factor cannot be negative',
  (v: number) => v <= 3 || 'Factor cannot exceed 3.0'
]

// Watch for prop changes
watch(() => props.operation, (newOp) => {
  localOperation.value = { ...newOp }
}, { deep: true })

// Computed helpers
const currentOption = computed(() => 
  enhanceOptions.find(opt => opt.value === localOperation.value.method)
)

// Methods
const updateOperation = () => {
  emit('update:operation', { ...localOperation.value })
}

const setFactor = (factor: number) => {
  localOperation.value.factor = factor
  updateOperation()
}

const getCurrentIcon = () => currentOption.value?.icon || 'mdi-brightness-6'
const getCurrentMethodName = () => currentOption.value?.title || 'Enhancement'
const getCurrentDescription = () => currentOption.value?.description || 'Adjust image properties'

const getSliderColor = () => {
  const colors = {
    [EnhanceMethod.BRIGHTNESS]: 'yellow-darken-2',
    [EnhanceMethod.CONTRAST]: 'grey-darken-1',
    [EnhanceMethod.SHARPNESS]: 'blue',
    [EnhanceMethod.COLOR]: 'purple'
  }
  return colors[localOperation.value.method] || 'primary'
}

const getMinIcon = () => {
  const icons = {
    [EnhanceMethod.BRIGHTNESS]: 'mdi-brightness-4',
    [EnhanceMethod.CONTRAST]: 'mdi-contrast-box',
    [EnhanceMethod.SHARPNESS]: 'mdi-blur',
    [EnhanceMethod.COLOR]: 'mdi-palette-outline'
  }
  return icons[localOperation.value.method] || 'mdi-minus'
}

const getMaxIcon = () => {
  const icons = {
    [EnhanceMethod.BRIGHTNESS]: 'mdi-brightness-7',
    [EnhanceMethod.CONTRAST]: 'mdi-contrast-circle',
    [EnhanceMethod.SHARPNESS]: 'mdi-details',
    [EnhanceMethod.COLOR]: 'mdi-palette'
  }
  return icons[localOperation.value.method] || 'mdi-plus'
}

const getMinLabel = () => {
  const labels = {
    [EnhanceMethod.BRIGHTNESS]: 'Dark',
    [EnhanceMethod.CONTRAST]: 'Flat',
    [EnhanceMethod.SHARPNESS]: 'Soft',
    [EnhanceMethod.COLOR]: 'Grayscale'
  }
  return labels[localOperation.value.method] || 'Minimum'
}

const getMaxLabel = () => {
  const labels = {
    [EnhanceMethod.BRIGHTNESS]: 'Bright',
    [EnhanceMethod.CONTRAST]: 'High',
    [EnhanceMethod.SHARPNESS]: 'Sharp',
    [EnhanceMethod.COLOR]: 'Vivid'
  }
  return labels[localOperation.value.method] || 'Maximum'
}

const getAlertType = () => {
  if (localOperation.value.factor < 0.5 || localOperation.value.factor > 2.0) {
    return 'warning'
  }
  return 'info'
}

const getPreviewText = () => {
  const method = getCurrentMethodName()
  const factor = localOperation.value.factor
  let intensity = 'original'
  
  if (factor < 0.3) intensity = 'very low'
  else if (factor < 0.7) intensity = 'low' 
  else if (factor < 0.9) intensity = 'slightly reduced'
  else if (factor < 1.1) intensity = 'original'
  else if (factor < 1.3) intensity = 'slightly enhanced'
  else if (factor < 1.7) intensity = 'enhanced'
  else if (factor < 2.5) intensity = 'highly enhanced'
  else intensity = 'extremely enhanced'
  
  let warning = ''
  if (factor < 0.3 || factor > 2.0) {
    warning = ' (Extreme values may cause artifacts)'
  }
  
  return `${method} enhancement: ${intensity} (factor: ${factor})${warning}`
}
</script>
