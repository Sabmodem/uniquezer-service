<template>
  <div>
    <v-card variant="outlined">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-avatar color="primary" size="40">
            <v-icon color="white">mdi-rotate-right</v-icon>
          </v-avatar>
          <div class="ml-3">
            <h4>Rotate Image</h4>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Rotate the image by a specified angle
            </p>
          </div>
        </div>

        <v-row>
          <!-- Angle Input -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="localOperation.angle"
              label="Rotation Angle"
              suffix="degrees"
              type="number"
              variant="outlined"
              :rules="angleRules"
              @update:model-value="updateOperation"
            >
              <template #prepend-inner>
                <v-icon>mdi-angle-acute</v-icon>
              </template>
            </v-text-field>

            <!-- Quick Angle Buttons -->
            <div class="d-flex flex-wrap ga-2 mb-4">
              <v-btn
                v-for="angle in quickAngles"
                :key="angle"
                size="small"
                variant="outlined"
                :color="localOperation.angle === angle ? 'primary' : 'default'"
                @click="setAngle(angle)"
              >
                {{ angle }}°
              </v-btn>
            </div>
          </v-col>

          <!-- Angle Slider -->
          <v-col cols="12" md="6">
            <label class="text-body-2 text-medium-emphasis mb-2 d-block">
              Angle Slider
            </label>
            <v-slider
              v-model="localOperation.angle"
              min="-360"
              max="360"
              step="1"
              thumb-label="always"
              track-size="4"
              thumb-size="20"
              class="mb-4"
              @update:model-value="updateOperation"
            >
              <template #append>
                <v-btn
                  icon="mdi-refresh"
                  size="small"
                  variant="text"
                  @click="resetAngle"
                  title="Reset to 0°"
                ></v-btn>
              </template>
            </v-slider>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <!-- Basic Options -->
        <v-row>
          <v-col cols="12" md="6">
            <v-switch
              v-model="localOperation.expand"
              label="Expand canvas to fit"
              color="primary"
              hide-details
              @update:model-value="updateOperation"
            >
              <template #label>
                <div>
                  <div>Expand canvas to fit</div>
                  <div class="text-caption text-medium-emphasis">
                    Expand the output canvas to fit the entire rotated image
                  </div>
                </div>
              </template>
            </v-switch>
          </v-col>

          <v-col cols="12" md="6">
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

        <!-- Advanced Options -->
        <v-expansion-panels class="mt-4" variant="accordion">
          <v-expansion-panel title="Advanced Options">
            <v-expansion-panel-text>
              <v-row>
                <!-- Fill Color -->
                <v-col cols="12" md="6">
                  <div class="mb-4">
                    <v-checkbox
                      v-model="useFillColor"
                      label="Use custom fill color"
                      color="primary"
                      hide-details
                      @update:model-value="onFillColorToggle"
                    ></v-checkbox>
                    
                    <div v-if="useFillColor" class="mt-3">
                      <label class="text-body-2 text-medium-emphasis mb-2 d-block">
                        Fill Color (RGB)
                      </label>
                      <v-row no-gutters>
                        <v-col cols="4" class="pr-1">
                          <v-text-field
                            v-model.number="fillColorR"
                            label="Red"
                            type="number"
                            min="0"
                            max="255"
                            density="compact"
                            variant="outlined"
                            @update:model-value="updateFillColor"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="4" class="px-1">
                          <v-text-field
                            v-model.number="fillColorG"
                            label="Green"
                            type="number"
                            min="0"
                            max="255"
                            density="compact"
                            variant="outlined"
                            @update:model-value="updateFillColor"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="4" class="pl-1">
                          <v-text-field
                            v-model.number="fillColorB"
                            label="Blue"
                            type="number"
                            min="0"
                            max="255"
                            density="compact"
                            variant="outlined"
                            @update:model-value="updateFillColor"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      
                      <!-- Color Preview -->
                      <div class="d-flex align-center mt-2">
                        <div
                          class="color-preview mr-3"
                          :style="{
                            backgroundColor: `rgb(${fillColorR}, ${fillColorG}, ${fillColorB})`
                          }"
                        ></div>
                        <span class="text-body-2">
                          RGB({{ fillColorR }}, {{ fillColorG }}, {{ fillColorB }})
                        </span>
                      </div>
                    </div>
                  </div>
                </v-col>

                <!-- Center Point -->
                <v-col cols="12" md="6">
                  <div class="mb-4">
                    <v-checkbox
                      v-model="useCustomCenter"
                      label="Use custom rotation center"
                      color="primary"
                      hide-details
                      @update:model-value="onCenterToggle"
                    ></v-checkbox>
                    
                    <div v-if="useCustomCenter" class="mt-3">
                      <label class="text-body-2 text-medium-emphasis mb-2 d-block">
                        Rotation Center (pixels)
                      </label>
                      <v-row no-gutters>
                        <v-col cols="6" class="pr-1">
                          <v-text-field
                            v-model.number="centerX"
                            label="X coordinate"
                            type="number"
                            min="0"
                            density="compact"
                            variant="outlined"
                            @update:model-value="updateCenter"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                          <v-text-field
                            v-model.number="centerY"
                            label="Y coordinate"
                            type="number"
                            min="0"
                            density="compact"
                            variant="outlined"
                            @update:model-value="updateCenter"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Preview Summary -->
        <v-alert 
          type="info" 
          variant="tonal" 
          class="mt-4"
          :text="getPreviewText()"
          title="Operation Preview"
        ></v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { RotateOperation } from '~/types'
import { RESAMPLING_OPTIONS, Resampling } from '~/types'

interface Props {
  operation: RotateOperation
}

interface Emits {
  'update:operation': [operation: RotateOperation]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local reactive copy
const localOperation = ref<RotateOperation>({ ...props.operation })

// Advanced options state
const useFillColor = ref(false)
const useCustomCenter = ref(false)

// Fill color components
const fillColorR = ref(255)
const fillColorG = ref(255)
const fillColorB = ref(255)

// Center point components
const centerX = ref(0)
const centerY = ref(0)

// Quick angle presets
const quickAngles = [-180, -90, -45, 0, 45, 90, 180]

// Validation rules
const angleRules = [
  (v: number) => v !== null && v !== undefined || 'Angle is required',
  (v: number) => (v >= -360 && v <= 360) || 'Angle must be between -360 and 360'
]

// Resampling options for select
const resamplingOptions = computed(() => 
  RESAMPLING_OPTIONS.filter(option => [0,2,3].includes(option.value)).map(option => ({
    title: option.label,
    value: option.value,
    description: option.description
  }))
)

// Initialize advanced options based on props
onMounted(() => {
  if (props.operation.fillcolor) {
    useFillColor.value = true
    fillColorR.value = props.operation.fillcolor[0]
    fillColorG.value = props.operation.fillcolor[1]
    fillColorB.value = props.operation.fillcolor[2]
  }

  if (props.operation.center) {
    useCustomCenter.value = true
    centerX.value = props.operation.center[0]
    centerY.value = props.operation.center[1]
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

const setAngle = (angle: number) => {
  localOperation.value.angle = angle
  updateOperation()
}

const resetAngle = () => {
  localOperation.value.angle = 0
  updateOperation()
}

const onFillColorToggle = (enabled: boolean) => {
  if (enabled) {
    updateFillColor()
  } else {
    localOperation.value.fillcolor = null
    updateOperation()
  }
}

const updateFillColor = () => {
  if (useFillColor.value) {
    localOperation.value.fillcolor = [fillColorR.value, fillColorG.value, fillColorB.value]
  } else {
    localOperation.value.fillcolor = null
  }
  updateOperation()
}

const onCenterToggle = (enabled: boolean) => {
  if (enabled) {
    updateCenter()
  } else {
    localOperation.value.center = null
    updateOperation()
  }
}

const updateCenter = () => {
  if (useCustomCenter.value) {
    localOperation.value.center = [centerX.value, centerY.value]
  } else {
    localOperation.value.center = null
  }
  updateOperation()
}

const getPreviewText = () => {
  const parts = []
  
  parts.push(`Rotate ${localOperation.value.angle}°`)
  
  if (localOperation.value.expand) {
    parts.push('expand canvas')
  }
  
  const resamplingOption = RESAMPLING_OPTIONS.find(r => r.value === localOperation.value.resample)
  if (resamplingOption) {
    parts.push(`${resamplingOption.label.toLowerCase()} resampling`)
  }
  
  if (localOperation.value.fillcolor) {
    parts.push(`fill RGB(${localOperation.value.fillcolor.join(', ')})`)
  }
  
  if (localOperation.value.center) {
    parts.push(`center (${localOperation.value.center.join(', ')})`)
  }
  
  return parts.join(', ')
}
</script>

<style scoped>
.color-preview {
  width: 30px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
