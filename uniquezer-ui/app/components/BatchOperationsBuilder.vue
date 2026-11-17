<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-3">mdi-content-duplicate</v-icon>
      Batch Operations Builder
      <v-spacer></v-spacer>
      <v-chip 
        :color="totalCombinations > 0 ? 'success' : 'grey'" 
        size="small"
      >
        {{ totalCombinations }} variations
      </v-chip>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-6">
      <!-- Instructions -->
      <v-alert type="info" variant="outlined" class="mb-6">
        <div class="text-body-2">
          <strong>Create multiple unique variations</strong> of your image by defining parameter ranges.
          Each enabled parameter will create variations, and all combinations will be processed.
        </div>
      </v-alert>

      <!-- Available Operations -->
      <div class="mb-6">
        <h4 class="text-h6 mb-4">Select Operations to Batch</h4>
        
        <!-- Rotate Operation -->
        <v-expansion-panels v-model="expandedPanels" multiple variant="accordion">
          <v-expansion-panel value="rotate">
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-checkbox
                  v-model="batchOperations.rotate.enabled"
                  @click.stop
                  color="primary"
                  hide-details
                  class="mr-3"
                ></v-checkbox>
                <v-icon class="mr-3" color="primary">mdi-rotate-right</v-icon>
                <div>
                  <strong>Rotation Angle</strong>
                  <div class="text-caption text-medium-emphasis">
                    Vary rotation angle in small increments
                  </div>
                </div>
                <v-spacer></v-spacer>
                <v-chip 
                  v-if="batchOperations.rotate.enabled" 
                  size="small" 
                  color="primary"
                >
                  {{ getRotateVariations() }} variations
                </v-chip>
              </div>
            </v-expansion-panel-title>
            
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="batchOperations.rotate.base"
                    label="Base Angle"
                    suffix="degrees"
                    type="number"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="6" md="2">
                  <v-text-field
                    v-model.number="batchOperations.rotate.rangeMin"
                    label="Min"
                    suffix="°"
                    type="number"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="6" md="2">
                  <v-text-field
                    v-model.number="batchOperations.rotate.rangeMax"
                    label="Max"
                    suffix="°"
                    type="number"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="batchOperations.rotate.step"
                    label="Step Size"
                    suffix="degrees"
                    type="number"
                    step="0.1"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <div class="mt-3">
                <strong class="text-body-2">Preview:</strong>
                <span class="text-body-2 ml-2">{{ getRotatePreview() }}</span>
              </div>
              
              <div class="mt-2">
                <strong class="text-body-2">Quick Presets:</strong>
                <div class="d-flex flex-wrap ga-2 mt-2">
                  <v-btn 
                    size="x-small" 
                    variant="outlined"
                    @click="applyRotatePreset('tiny')"
                  >
                    Tiny (±1°, 0.5° steps)
                  </v-btn>
                  <v-btn 
                    size="x-small" 
                    variant="outlined"
                    @click="applyRotatePreset('small')"
                  >
                    Small (±3°, 1° steps)
                  </v-btn>
                  <v-btn 
                    size="x-small" 
                    variant="outlined"
                    @click="applyRotatePreset('medium')"
                  >
                    Medium (±5°, 2° steps)
                  </v-btn>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Enhance Operation -->
          <v-expansion-panel value="enhance">
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-checkbox
                  v-model="batchOperations.enhance.enabled"
                  @click.stop
                  color="warning"
                  hide-details
                  class="mr-3"
                ></v-checkbox>
                <v-icon class="mr-3" color="warning">mdi-brightness-6</v-icon>
                <div>
                  <strong>Brightness Enhancement</strong>
                  <div class="text-caption text-medium-emphasis">
                    Vary brightness factor slightly
                  </div>
                </div>
                <v-spacer></v-spacer>
                <v-chip 
                  v-if="batchOperations.enhance.enabled" 
                  size="small" 
                  color="warning"
                >
                  {{ getEnhanceVariations() }} variations
                </v-chip>
              </div>
            </v-expansion-panel-title>
            
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="batchOperations.enhance.base"
                    label="Base Factor"
                    type="number"
                    step="0.01"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="6" md="2">
                  <v-text-field
                    v-model.number="batchOperations.enhance.rangeMin"
                    label="Min"
                    type="number"
                    step="0.01"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="6" md="2">
                  <v-text-field
                    v-model.number="batchOperations.enhance.rangeMax"
                    label="Max"
                    type="number"
                    step="0.01"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="batchOperations.enhance.step"
                    label="Step Size"
                    type="number"
                    step="0.01"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <div class="mt-3">
                <strong class="text-body-2">Preview:</strong>
                <span class="text-body-2 ml-2">{{ getEnhancePreview() }}</span>
              </div>
              
              <div class="mt-2">
                <strong class="text-body-2">Quick Presets:</strong>
                <div class="d-flex flex-wrap ga-2 mt-2">
                  <v-btn 
                    size="x-small" 
                    variant="outlined"
                    @click="applyEnhancePreset('subtle')"
                  >
                    Subtle (±0.05, 0.02 steps)
                  </v-btn>
                  <v-btn 
                    size="x-small" 
                    variant="outlined"
                    @click="applyEnhancePreset('noticeable')"
                  >
                    Noticeable (±0.1, 0.05 steps)
                  </v-btn>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Resize Operation -->
          <v-expansion-panel value="resize">
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-checkbox
                  v-model="batchOperations.resize.enabled"
                  @click.stop
                  color="success"
                  hide-details
                  class="mr-3"
                ></v-checkbox>
                <v-icon class="mr-3" color="success">mdi-resize</v-icon>
                <div>
                  <strong>Image Size</strong>
                  <div class="text-caption text-medium-emphasis">
                    Vary width and height slightly
                  </div>
                </div>
                <v-spacer></v-spacer>
                <v-chip 
                  v-if="batchOperations.resize.enabled" 
                  size="small" 
                  color="success"
                >
                  {{ getResizeVariations() }} variations
                </v-chip>
              </div>
            </v-expansion-panel-title>
            
            <v-expansion-panel-text>
              <h5 class="text-subtitle-2 mb-3">Width Variations</h5>
              <v-row>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model.number="batchOperations.resize.baseWidth"
                    label="Base Width"
                    suffix="px"
                    type="number"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="6" md="3">
                  <v-text-field
                    v-model.number="batchOperations.resize.widthMin"
                    label="Min Width"
                    suffix="px"
                    type="number"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="6" md="3">
                  <v-text-field
                    v-model.number="batchOperations.resize.widthMax"
                    label="Max Width"
                    suffix="px"
                    type="number"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model.number="batchOperations.resize.widthStep"
                    label="Width Step"
                    suffix="px"
                    type="number"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
              </v-row>

              <h5 class="text-subtitle-2 mb-3">Height Variations</h5>
              <v-row>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model.number="batchOperations.resize.baseHeight"
                    label="Base Height"
                    suffix="px"
                    type="number"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="6" md="3">
                  <v-text-field
                    v-model.number="batchOperations.resize.heightMin"
                    label="Min Height"
                    suffix="px"
                    type="number"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="6" md="3">
                  <v-text-field
                    v-model.number="batchOperations.resize.heightMax"
                    label="Max Height"
                    suffix="px"
                    type="number"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model.number="batchOperations.resize.heightStep"
                    label="Height Step"
                    suffix="px"
                    type="number"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <div class="mt-3">
                <strong class="text-body-2">Preview:</strong>
                <span class="text-body-2 ml-2">{{ getResizePreview() }}</span>
              </div>
              
              <div class="mt-2">
                <strong class="text-body-2">Quick Presets:</strong>
                <div class="d-flex flex-wrap ga-2 mt-2">
                  <v-btn 
                    size="x-small" 
                    variant="outlined"
                    @click="applyResizePreset('small')"
                  >
                    Small (±10px, 5px steps)
                  </v-btn>
                  <v-btn 
                    size="x-small" 
                    variant="outlined"
                    @click="applyResizePreset('medium')"
                  >
                    Medium (±25px, 10px steps)
                  </v-btn>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <!-- Combination Summary -->
      <v-card variant="tonal" class="pa-4 mb-6">
        <h4 class="text-h6 mb-3">
          <v-icon class="mr-2">mdi-calculator</v-icon>
          Combination Summary
        </h4>
        
        <v-row>
          <v-col cols="12" sm="4">
            <div class="text-center">
              <div class="text-h4 text-primary">{{ totalCombinations }}</div>
              <div class="text-caption text-medium-emphasis">Total Images</div>
            </div>
          </v-col>
          <v-col cols="12" sm="4">
            <div class="text-center">
              <div class="text-h4 text-success">{{ enabledOperationsCount }}</div>
              <div class="text-caption text-medium-emphasis">Operations</div>
            </div>
          </v-col>
          <v-col cols="12" sm="4">
            <div class="text-center">
              <div class="text-h4 text-warning">{{ estimatedTime }}</div>
              <div class="text-caption text-medium-emphasis">Est. Time</div>
            </div>
          </v-col>
        </v-row>

        <!-- Combination Breakdown -->
        <div v-if="totalCombinations > 0" class="mt-4">
          <h5 class="text-subtitle-1 mb-2">Breakdown:</h5>
          <div class="text-body-2">
            <span v-if="batchOperations.rotate.enabled">
              Rotation: {{ getRotateVariations() }} variations
            </span>
            <span v-if="batchOperations.rotate.enabled && batchOperations.enhance.enabled"> × </span>
            <span v-if="batchOperations.enhance.enabled">
              Brightness: {{ getEnhanceVariations() }} variations  
            </span>
            <span v-if="(batchOperations.rotate.enabled || batchOperations.enhance.enabled) && batchOperations.resize.enabled"> × </span>
            <span v-if="batchOperations.resize.enabled">
              Resize: {{ getResizeVariations() }} variations
            </span>
            = {{ totalCombinations }} unique combinations
          </div>
        </div>

        <!-- Warning for too many combinations -->
        <v-alert 
          v-if="totalCombinations > 50" 
          type="warning" 
          variant="outlined" 
          class="mt-4"
        >
          <strong>Large batch detected!</strong> 
          Processing {{ totalCombinations }} images may take significant time and storage.
        </v-alert>
      </v-card>

      <!-- Actions -->
      <v-row>
        <v-col>
          <v-btn
            color="primary"
            class="w-100"
            prepend-icon="mdi-play-circle"
            :disabled="totalCombinations === 0"
            @click="generateBatch"
          >
            Generate {{ totalCombinations }} Variations
          </v-btn>
        </v-col>
        <v-col>
          <v-btn
            class="w-100"
            variant="outlined"
            prepend-icon="mdi-eye"
            :disabled="totalCombinations === 0"
            @click="previewCombinations"
          >
            Preview Combinations
          </v-btn>
        </v-col>
        <v-col>          
          <v-btn
            class="w-100"
            variant="outlined"
            prepend-icon="mdi-refresh"
            @click="resetAll"
          >
            Reset All
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AnyImageOperation, RotateOperation, EnhanceOperation, ResizeOperation } from '~/types'
import { UniqueizationType, EnhanceMethod, Resampling } from '~/types'

// Use batch processing composable
const { saveBatchCombinations, processBatchSequential, batchOperations, resetBatchOperations } = useBatchProcessing()

// Reactive state
const expandedPanels = ref(['rotate', 'enhance', 'resize'])

// Computed values
const getRotateVariations = () => {
  if (!batchOperations.value.rotate.enabled) return 0
  const { rangeMin, rangeMax, step } = batchOperations.value.rotate
  if (step <= 0 || rangeMax <= rangeMin) return 0
  return Math.floor((rangeMax - rangeMin) / step) + 1
}

const getEnhanceVariations = () => {
  if (!batchOperations.value.enhance.enabled) return 0
  const { rangeMin, rangeMax, step } = batchOperations.value.enhance
  if (step <= 0 || rangeMax <= rangeMin) return 0
  return Math.floor((rangeMax - rangeMin) / step) + 1
}

const getResizeVariations = () => {
  if (!batchOperations.value.resize.enabled) return 0
  const resize = batchOperations.value.resize
  
  const widthVars = resize.widthStep > 0 && resize.widthMax > resize.widthMin 
    ? Math.floor((resize.widthMax - resize.widthMin) / resize.widthStep) + 1 
    : 1
    
  const heightVars = resize.heightStep > 0 && resize.heightMax > resize.heightMin
    ? Math.floor((resize.heightMax - resize.heightMin) / resize.heightStep) + 1
    : 1
    
  return widthVars * heightVars
}

const totalCombinations = computed(() => {
  let total = 1
  
  if (batchOperations.value.rotate.enabled) {
    total *= getRotateVariations()
  }
  
  if (batchOperations.value.enhance.enabled) {
    total *= getEnhanceVariations()  
  }
  
  if (batchOperations.value.resize.enabled) {
    total *= getResizeVariations()
  }
  
  // If no batchOperations enabled, return 0
  if (total === 1 && !batchOperations.value.rotate.enabled && !batchOperations.value.enhance.enabled && !batchOperations.value.resize.enabled) {
    return 0
  }
  
  return total
})

const enabledOperationsCount = computed(() => {
  let count = 0
  if (batchOperations.value.rotate.enabled) count++
  if (batchOperations.value.enhance.enabled) count++  
  if (batchOperations.value.resize.enabled) count++
  return count
})

const estimatedTime = computed(() => {
  const timePerImage = 3 // seconds estimate
  const totalSeconds = totalCombinations.value * timePerImage
  
  if (totalSeconds < 60) return `${totalSeconds}s`
  if (totalSeconds < 3600) return `${Math.ceil(totalSeconds / 60)}m`
  return `${Math.ceil(totalSeconds / 3600)}h`
})

// Preview methods
const getRotatePreview = () => {
  const op = batchOperations.value.rotate
  if (!op.enabled) return 'Disabled'
  return `${op.rangeMin}° to ${op.rangeMax}° in ${op.step}° steps`
}

const getEnhancePreview = () => {
  const op = batchOperations.value.enhance
  if (!op.enabled) return 'Disabled'
  return `${op.rangeMin} to ${op.rangeMax} in ${op.step} steps`
}

const getResizePreview = () => {
  const op = batchOperations.value.resize
  if (!op.enabled) return 'Disabled'
  return `W: ${op.widthMin}-${op.widthMax}px, H: ${op.heightMin}-${op.heightMax}px`
}

// Preset methods
const applyRotatePreset = (preset: string) => {
  const base = batchOperations.value.rotate.base
  
  switch (preset) {
    case 'tiny':
      batchOperations.value.rotate.rangeMin = base - 1
      batchOperations.value.rotate.rangeMax = base + 1
      batchOperations.value.rotate.step = 0.5
      break
    case 'small':
      batchOperations.value.rotate.rangeMin = base - 3
      batchOperations.value.rotate.rangeMax = base + 3
      batchOperations.value.rotate.step = 1
      break
    case 'medium':
      batchOperations.value.rotate.rangeMin = base - 5
      batchOperations.value.rotate.rangeMax = base + 5
      batchOperations.value.rotate.step = 2
      break
  }
}

const applyEnhancePreset = (preset: string) => {
  const base = batchOperations.value.enhance.base
  
  switch (preset) {
    case 'subtle':
      batchOperations.value.enhance.rangeMin = Math.max(0, base - 0.05)
      batchOperations.value.enhance.rangeMax = base + 0.05
      batchOperations.value.enhance.step = 0.02
      break
    case 'noticeable':
      batchOperations.value.enhance.rangeMin = Math.max(0, base - 0.1)
      batchOperations.value.enhance.rangeMax = base + 0.1
      batchOperations.value.enhance.step = 0.05
      break
  }
}

const applyResizePreset = (preset: string) => {
  const baseW = batchOperations.value.resize.baseWidth
  const baseH = batchOperations.value.resize.baseHeight
  
  switch (preset) {
    case 'small':
      batchOperations.value.resize.widthMin = baseW - 10
      batchOperations.value.resize.widthMax = baseW + 10
      batchOperations.value.resize.widthStep = 5
      batchOperations.value.resize.heightMin = baseH - 10
      batchOperations.value.resize.heightMax = baseH + 10
      batchOperations.value.resize.heightStep = 5
      break
    case 'medium':
      batchOperations.value.resize.widthMin = baseW - 25
      batchOperations.value.resize.widthMax = baseW + 25
      batchOperations.value.resize.widthStep = 10
      batchOperations.value.resize.heightMin = baseH - 25
      batchOperations.value.resize.heightMax = baseH + 25
      batchOperations.value.resize.heightStep = 10
      break
  }
}

// Action methods - Updated to use integrated batch processing
const generateBatch = async () => {
  const combinations = generateAllCombinations()
  console.log(`Generated ${combinations.length} combinations:`, combinations)
  
  // Save to global batch state
  saveBatchCombinations(combinations)
  
  try {
    await processBatchSequential()
  } catch (error: any) {
    console.error('Batch processing failed:', error)
    const { error: showError } = useNotifications()
    showError('Batch processing failed: ' + error.message)
  }
}

const previewCombinations = () => {
  const combinations = generateAllCombinations()
  console.log('Combination preview:', combinations)
  
  const { info } = useNotifications()
  info(`Preview: ${combinations.length} combinations ready`)
}

const resetAll = () => {
  resetBatchOperations();
  const { info } = useNotifications()
  info('All batch settings reset')
}

// Core combinatorics engine - UNCHANGED, working perfectly
const generateAllCombinations = (): AnyImageOperation[][] => {
  const rotateValues = generateRotateValues()
  const enhanceValues = generateEnhanceValues()
  const resizeValues = generateResizeValues()
  
  const combinations: AnyImageOperation[][] = []
  
  // Generate cartesian product of all enabled batchOperations
  if (rotateValues.length === 0) rotateValues.push(null)
  if (enhanceValues.length === 0) enhanceValues.push(null)
  if (resizeValues.length === 0) resizeValues.push(null)
  
  for (const rotate of rotateValues) {
    for (const enhance of enhanceValues) {
      for (const resize of resizeValues) {
        const combo: AnyImageOperation[] = []
        
        if (rotate) combo.push(rotate)
        if (enhance) combo.push(enhance)
        if (resize) combo.push(resize)
        
        if (combo.length > 0) {
          combinations.push(combo)
        }
      }
    }
  }
  
  return combinations
}

const generateRotateValues = (): (RotateOperation | null)[] => {
  if (!batchOperations.value.rotate.enabled) return []
  
  const { rangeMin, rangeMax, step } = batchOperations.value.rotate
  const values: RotateOperation[] = []
  
  for (let angle = rangeMin; angle <= rangeMax; angle += step) {
    values.push({
      type: UniqueizationType.ROTATE,
      angle: Math.round(angle * 100) / 100, // Round to 2 decimals
      expand: false,
      resample: Resampling.BILINEAR,
      fillcolor: null,
      center: null
    })
  }
  
  return values
}

const generateEnhanceValues = (): (EnhanceOperation | null)[] => {
  if (!batchOperations.value.enhance.enabled) return []
  
  const { rangeMin, rangeMax, step } = batchOperations.value.enhance
  const values: EnhanceOperation[] = []
  
  for (let factor = rangeMin; factor <= rangeMax; factor += step) {
    values.push({
      type: UniqueizationType.ENHANCE,
      method: EnhanceMethod.BRIGHTNESS,
      factor: Math.round(factor * 100) / 100 // Round to 2 decimals
    })
  }
  
  return values
}

const generateResizeValues = (): (ResizeOperation | null)[] => {
  if (!batchOperations.value.resize.enabled) return []
  
  const resize = batchOperations.value.resize
  const values: ResizeOperation[] = []
  
  for (let w = resize.widthMin; w <= resize.widthMax; w += resize.widthStep) {
    for (let h = resize.heightMin; h <= resize.heightMax; h += resize.heightStep) {
      values.push({
        type: UniqueizationType.RESIZE,
        width: w,
        height: h,
        resample: Resampling.BILINEAR
      })
    }
  }
  
  return values
}
</script>

<style scoped>
/* Custom styling for batch interface */
.v-expansion-panel-title {
  min-height: 60px;
}

.v-expansion-panel-text {
  background-color: rgba(var(--v-theme-surface), 0.5);
}
</style>
