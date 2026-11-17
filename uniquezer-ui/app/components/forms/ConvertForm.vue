<template>
  <div>
    <v-card variant="outlined">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-avatar color="error" size="40">
            <v-icon color="white">mdi-palette</v-icon>
          </v-avatar>
          <div class="ml-3">
            <h4>Convert Image</h4>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Convert image format and adjust color properties
            </p>
          </div>
        </div>

        <v-row>
          <!-- Color Mode -->
          <v-col cols="12">
            <v-select
              v-model="localOperation.mode"
              :items="colorModeOptions"
              label="Color Mode"
              variant="outlined"
              clearable
              @update:model-value="onModeChange"
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
            </v-select>
          </v-col>

          <!-- Dithering Method -->
          <!-- <v-col cols="12" md="6">
            <v-select
              v-model="localOperation.dither"
              :items="ditherOptions"
              label="Dithering Method"
              variant="outlined"
              clearable
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
            </v-select>
          </v-col> -->
        </v-row>

        <!-- Palette Options (when applicable) -->
        <div v-if="showPaletteOptions" class="mb-4">
          <h4 class="text-subtitle-1 mb-3">Palette Options</h4>
          
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="localOperation.palette"
                :items="paletteOptions"
                label="Palette Type"
                variant="outlined"
                clearable
                @update:model-value="updateOperation"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <div 
                        class="palette-preview"
                        :style="{ background: item.raw.preview }"
                      ></div>
                    </template>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <v-row v-if="localOperation.palette == PaletteMode.ADAPTIVE">
            <v-col cols="12">
              <v-text-field
                v-model.number="localOperation.colors"
                label="Number of Colors"
                type="number"
                variant="outlined"
                min="2"
                max="256"
                :rules="colorRules"
                @update:model-value="updateOperation"
              >
                <template #prepend-inner>
                  <v-icon>mdi-palette-swatch</v-icon>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </div>

        <v-expansion-panels class="mb-4" variant="accordion" v-if="localOperation.mode && ['RGB', 'L'].includes(localOperation.mode)">
          <v-expansion-panel title="Advanced: Custom Color Matrix">
            <v-expansion-panel-text>
              <div class="mb-3">
                <v-checkbox
                  v-model="useCustomMatrix"
                  label="Use custom color transformation matrix"
                  color="primary"
                  @update:model-value="onMatrixToggle"
                ></v-checkbox>
              </div>

              <div v-if="useCustomMatrix">
                <p class="text-body-2 text-medium-emphasis mb-3">
                  Define a custom color transformation matrix (4 values for RGBA channels)
                </p>

                <v-row>
                  <v-col v-for="(value, index) in matrixValues" :key="index" cols="6" sm="3">
                    <v-text-field
                      v-model.number="matrixValues[index]"
                      :label="getMatrixLabel(index)"
                      type="number"
                      step="0.1"
                      variant="outlined"
                      density="compact"
                      @update:model-value="updateMatrix"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <div class="d-flex ga-2 mb-3">
                  <v-btn size="small" variant="outlined" @click="resetMatrix">
                    Reset to Identity
                  </v-btn>
                  <v-btn size="small" variant="outlined" @click="applySepia">
                    Sepia Effect
                  </v-btn>
                  <v-btn size="small" variant="outlined" @click="applyGrayscale">
                    Grayscale
                  </v-btn>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Mode Information -->
        <v-card variant="tonal" class="pa-4 mb-4">
          <h4 class="text-subtitle-1 mb-2">Conversion Information</h4>
          <div class="conversion-info">
            <div class="d-flex align-center mb-2">
              <v-icon :color="getCurrentModeColor()" class="mr-2">{{ getCurrentModeIcon() }}</v-icon>
              <div>
                <strong>{{ getCurrentModeName() }}</strong>
                <div class="text-caption text-medium-emphasis">
                  {{ getCurrentModeDescription() }}
                </div>
              </div>
            </div>

            <div v-if="localOperation.dither !== null" class="mt-2">
              <strong class="text-body-2">Dithering:</strong>
              <span class="text-body-2 ml-2">{{ getCurrentDitherName() }}</span>
            </div>

            <div v-if="localOperation.palette" class="mt-2">
              <strong class="text-body-2">Palette:</strong>
              <span class="text-body-2 ml-2">{{ getCurrentPaletteName() }}</span>
              <span v-if="localOperation.colors" class="text-body-2 ml-1">({{ localOperation.colors }} colors)</span>
            </div>

            <div v-if="useCustomMatrix" class="mt-2">
              <strong class="text-body-2">Custom Matrix:</strong>
              <code class="text-caption ml-2">[{{ matrixValues.join(', ') }}]</code>
            </div>
          </div>
        </v-card>

        <!-- Quick Presets -->
        <div class="mb-4">
          <h4 class="text-subtitle-1 mb-3">Quick Presets</h4>
          <div class="d-flex flex-wrap ga-2">
            <v-btn
              v-for="preset in conversionPresets"
              :key="preset.name"
              size="small"
              variant="outlined"
              @click="applyPreset(preset)"
            >
              <v-icon :icon="preset.icon" class="mr-1" size="16"></v-icon>
              {{ preset.name }}
            </v-btn>
          </div>
        </div>

        <!-- Preview Summary -->
        <v-alert 
          type="info" 
          variant="tonal" 
          class="mt-4"
          :text="getPreviewText()"
          title="Conversion Preview"
        ></v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { ConvertOperation } from '~/types'
import { Dither, PaletteMode } from '~/types'

interface Props {
  operation: ConvertOperation
}

interface Emits {
  'update:operation': [operation: ConvertOperation]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local reactive copy
const localOperation = ref<ConvertOperation>({ ...props.operation })
const useCustomMatrix = ref(false)
const matrixValues = ref([1.0, 1.0, 1.0, 1.0])

// Color mode options
const colorModeOptions = [
  {
    title: 'RGB (Color)',
    value: 'RGB',
    description: 'Full color RGB mode',
    icon: 'mdi-palette',
    color: 'red'
  },
  /*
  {
    title: 'RGBA (Color + Alpha)',
    value: 'RGBA',
    description: 'RGB with transparency channel',
    icon: 'mdi-palette-swatch',
    color: 'purple'
  },
  */
  {
    title: 'Grayscale (L)',
    value: 'L',
    description: 'Grayscale/luminance only',
    icon: 'mdi-circle-half-full',
    color: 'grey'
  },
  /*
  {
    title: 'Grayscale + Alpha (LA)',
    value: 'LA',
    description: 'Grayscale with transparency',
    icon: 'mdi-circle-half-full',
    color: 'blue-grey'
  },
  */
  {
    title: 'Palette (P)',
    value: 'P',
    description: 'Indexed color palette',
    icon: 'mdi-palette-swatch-outline',
    color: 'orange'
  },
  /*
  {
    title: 'CMYK',
    value: 'CMYK',
    description: 'Print-ready CMYK colors',
    icon: 'mdi-printer',
    color: 'cyan'
  }
  */
]

// Dithering options
const ditherOptions = [
  {
    title: 'None',
    value: Dither.NONE,
    description: 'No dithering applied',
    icon: 'mdi-texture-box',
    color: 'grey'
  },
  {
    title: 'Ordered',
    value: Dither.ORDERED,
    description: 'Ordered (Bayer) dithering pattern',
    icon: 'mdi-grid',
    color: 'blue'
  },
  {
    title: 'Floyd-Steinberg',
    value: Dither.FLOYDSTEINBERG,
    description: 'Error diffusion dithering',
    icon: 'mdi-dots-grid',
    color: 'green'
  },
  {
    title: 'Rasterize',
    value: Dither.RASTERIZE,
    description: 'Rasterization dithering',
    icon: 'mdi-dots-hexagon',
    color: 'purple'
  }
]

// Palette options
const paletteOptions = [
  {
    title: 'Web Safe',
    value: PaletteMode.WEB,
    description: '216-color web-safe palette',
    preview: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff, #ffff00)'
  },
  {
    title: 'Adaptive',
    value: PaletteMode.ADAPTIVE,
    description: 'Adaptive palette based on image colors',
    preview: 'linear-gradient(45deg, #8B4513, #228B22, #4169E1, #DC143C)'
  }
]

// Validation rules
const colorRules = [
  (v: number) => v !== null && v !== undefined || 'Number of colors is required',
  (v: number) => v >= 2 || 'Must have at least 2 colors',
  (v: number) => v <= 256 || 'Cannot exceed 256 colors'
]

// Conversion presets
const conversionPresets = [
  {
    name: 'Grayscale',
    icon: 'mdi-circle-half-full',
    mode: 'L',
    dither: null,
    palette: PaletteMode.WEB,
    colors: 256,
    matrix: null
  },
  {
    name: 'Web Palette',
    icon: 'mdi-web',
    mode: 'P',
    dither: Dither.FLOYDSTEINBERG,
    palette: PaletteMode.WEB,
    colors: 216,
    matrix: null
  },
  {
    name: '16 Colors',
    icon: 'mdi-palette-swatch',
    mode: 'P',
    dither: Dither.FLOYDSTEINBERG,
    palette: PaletteMode.ADAPTIVE,
    colors: 16,
    matrix: null
  }
]

// Computed
const showPaletteOptions = computed(() => 
  localOperation.value.mode === 'P' || localOperation.value.palette !== null
)

// Initialize matrix if exists
onMounted(() => {
  if (props.operation.matrix) {
    useCustomMatrix.value = true
    matrixValues.value = [...props.operation.matrix]
  }
})

// Watch for prop changes
watch(() => props.operation, (newOp) => {
  localOperation.value = { ...newOp }
  if (newOp.matrix) {
    useCustomMatrix.value = true
    matrixValues.value = [...newOp.matrix]
  }
}, { deep: true })

// Methods
const updateOperation = () => {
  emit('update:operation', { ...localOperation.value })
}

const onModeChange = () => {
  // Reset palette options when mode changes
  if (localOperation.value.mode !== 'P') {
    localOperation.value.palette = PaletteMode.WEB
    localOperation.value.colors = 256
  }
  updateOperation()
}

const onMatrixToggle = (enabled: boolean) => {
  if (enabled) {
    updateMatrix()
  } else {
    localOperation.value.matrix = null
    updateOperation()
  }
}

const updateMatrix = () => {
  if (useCustomMatrix.value) {
    localOperation.value.matrix = [...matrixValues.value]
  } else {
    localOperation.value.matrix = null
  }
  updateOperation()
}

const resetMatrix = () => {
  matrixValues.value = [1.0, 1.0, 1.0, 1.0]
  updateMatrix()
}

const applySepia = () => {
  matrixValues.value = [0.393, 0.769, 0.189, 1.0]
  updateMatrix()
}

const applyGrayscale = () => {
  matrixValues.value = [0.299, 0.587, 0.114, 1.0]
  updateMatrix()
}

const getMatrixLabel = (index: number) => {
  const labels = ['Red', 'Green', 'Blue', 'Alpha']
  return labels[index] || `Value ${index + 1}`
}

const applyPreset = (preset: any) => {
  localOperation.value.mode = preset.mode
  localOperation.value.dither = preset.dither
  localOperation.value.palette = preset.palette
  localOperation.value.colors = preset.colors
  localOperation.value.matrix = preset.matrix
  
  useCustomMatrix.value = preset.matrix !== null
  if (preset.matrix) {
    matrixValues.value = [...preset.matrix]
  }
  
  updateOperation()
}

// Current setting helpers
const getCurrentMode = () => 
  colorModeOptions.find(opt => opt.value === localOperation.value.mode)

const getCurrentDither = () =>
  ditherOptions.find(opt => opt.value === localOperation.value.dither)

const getCurrentPalette = () =>
  paletteOptions.find(opt => opt.value === localOperation.value.palette)

const getCurrentModeName = () => getCurrentMode()?.title || 'Auto'
const getCurrentModeDescription = () => getCurrentMode()?.description || 'Automatic mode selection'
const getCurrentModeIcon = () => getCurrentMode()?.icon || 'mdi-palette'
const getCurrentModeColor = () => getCurrentMode()?.color || 'primary'

const getCurrentDitherName = () => getCurrentDither()?.title || 'None'
const getCurrentPaletteName = () => getCurrentPalette()?.title || 'None'

const getPreviewText = () => {
  const parts = []
  
  if (localOperation.value.mode) {
    parts.push(`Convert to ${getCurrentModeName()}`)
  }
  
  if (localOperation.value.dither !== null) {
    parts.push(`${getCurrentDitherName().toLowerCase()} dithering`)
  }
  
  if (localOperation.value.palette) {
    const colorText = localOperation.value.colors ? ` (${localOperation.value.colors} colors)` : ''
    parts.push(`${getCurrentPaletteName().toLowerCase()} palette${colorText}`)
  }
  
  if (useCustomMatrix.value) {
    parts.push('custom color matrix')
  }
  
  return parts.length > 0 ? parts.join(', ') : 'Convert image format and colors'
}
</script>

<style scoped>
.palette-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.conversion-info {
  font-size: 0.875rem;
}
</style>
