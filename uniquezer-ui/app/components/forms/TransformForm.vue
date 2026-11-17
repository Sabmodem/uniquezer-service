<template>
  <div>
    <v-card variant="outlined">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-avatar color="indigo" size="40">
            <v-icon color="white">mdi-vector-square</v-icon>
          </v-avatar>
          <div class="ml-3">
            <h4>Transform Image</h4>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Apply geometric transformations using matrices
            </p>
          </div>
        </div>

        <v-row>
          <!-- Transform Method -->
          <v-col cols="12" md="6">
            <v-select
              v-model="localOperation.method"
              :items="transformOptions"
              label="Transform Method"
              variant="outlined"
              @update:model-value="onMethodChange"
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

          <!-- Resampling Method -->
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

        <!-- Transform Data Input -->
        <div class="mb-4">
          <h4 class="text-subtitle-1 mb-3">{{ getCurrentMethodName() }} Data</h4>
          
          <v-card variant="tonal" class="pa-4 mb-4">
            <div class="mb-3">
              <strong>Required:</strong> {{ getRequiredDataDescription() }}
            </div>
            
            <!-- Dynamic data input based on method -->
            <div v-if="getCurrentMethod()">
              <v-row v-if="isAffineMethod()">
                <v-col v-for="(value, index) in dataValues" :key="index" cols="6" sm="4" md="2">
                  <v-text-field
                    v-model.number="dataValues[index]"
                    :label="getAffineLabel(index)"
                    type="number"
                    step="0.1"
                    variant="outlined"
                    density="compact"
                    @update:model-value="updateData"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row v-else-if="isExtentMethod()">
                <v-col v-for="(value, index) in dataValues" :key="index" cols="6" md="3">
                  <v-text-field
                    v-model.number="dataValues[index]"
                    :label="getExtentLabel(index)"
                    type="number"
                    variant="outlined"
                    density="compact"
                    @update:model-value="updateData"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row v-else-if="isPerspectiveOrQuadMethod()">
                <v-col v-for="(value, index) in dataValues" :key="index" cols="6" sm="3">
                  <v-text-field
                    v-model.number="dataValues[index]"
                    :label="getPointLabel(index)"
                    type="number"
                    variant="outlined"
                    density="compact"
                    @update:model-value="updateData"
                  ></v-text-field>
                </v-col>
              </v-row>

              <div v-else-if="isMeshMethod()">
                <v-alert type="info" variant="outlined" class="mb-3">
                  Mesh transformation requires complex data structure. Use advanced mode below.
                </v-alert>
                
                <v-textarea
                  v-model="meshDataInput"
                  label="Mesh Data (JSON format)"
                  variant="outlined"
                  rows="4"
                  placeholder='[[[0,0], [100,0], [100,100], [0,100]], [[10,10], [90,10], [90,90], [10,90]]]'
                  @update:model-value="updateMeshData"
                ></v-textarea>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Quick Presets -->
        <div class="mb-4">
          <h4 class="text-subtitle-1 mb-3">Quick Presets</h4>
          <div class="d-flex flex-wrap ga-2">
            <v-btn
              v-for="preset in getCurrentPresets()"
              :key="preset.name"
              size="small"
              variant="outlined"
              @click="applyPreset(preset)"
            >
              {{ preset.name }}
            </v-btn>
          </div>
        </div>

        <!-- Advanced Options -->
        <v-expansion-panels class="mb-4" variant="accordion">
          <v-expansion-panel title="Advanced Options">
            <v-expansion-panel-text>
              <!-- Fill Color -->
              <div class="mb-4">
                <v-checkbox
                  v-model="useFillColor"
                  label="Use custom fill color"
                  color="primary"
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

              <!-- Raw Data Input -->
              <div>
                <label class="text-body-2 text-medium-emphasis mb-2 d-block">
                  Raw Transform Data (Advanced)
                </label>
                <v-textarea
                  v-model="rawDataInput"
                  variant="outlined"
                  rows="3"
                  placeholder="[1, 0, 0, 0, 1, 0] for affine"
                  @update:model-value="updateRawData"
                ></v-textarea>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Transform Visualization -->
        <v-card variant="tonal" class="pa-4 mb-4">
          <h4 class="text-subtitle-1 mb-2">Transform Preview</h4>
          <div class="transform-preview">
            <div class="preview-grid">
              <div class="grid-item original">Original</div>
              <div class="grid-item transformed" :style="getPreviewTransform()">
                Transformed
              </div>
            </div>
          </div>
          
          <div class="mt-3">
            <strong>Data Points:</strong> {{ dataValues.length }}
            <br>
            <strong>Values:</strong> <code>[{{ dataValues.join(', ') }}]</code>
          </div>
        </v-card>

        <!-- Preview Summary -->
        <v-alert 
          type="info" 
          variant="tonal" 
          class="mt-4"
          :text="getPreviewText()"
          title="Transform Preview"
        ></v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { TransformOperation } from '~/types'
import { Transform, RESAMPLING_OPTIONS, Resampling } from '~/types'

interface Props {
  operation: TransformOperation
}

interface Emits {
  'update:operation': [operation: TransformOperation]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local reactive copy
const localOperation = ref<TransformOperation>({ ...props.operation })
const dataValues = ref<number[]>([])
const meshDataInput = ref('')
const rawDataInput = ref('')

// Advanced options state
const useFillColor = ref(false)
const fillColorR = ref(255)
const fillColorG = ref(255)
const fillColorB = ref(255)

// Transform method options
const transformOptions = [
  {
    title: 'Affine',
    value: Transform.AFFINE,
    description: 'Linear transformation (6 parameters)',
    icon: 'mdi-vector-square-edit',
    color: 'primary',
    dataCount: 6
  },
  {
    title: 'Extent',
    value: Transform.EXTENT,
    description: 'Rectangle definition (4 parameters)',
    icon: 'mdi-rectangle-outline',
    color: 'secondary',
    dataCount: 4
  },
  {
    title: 'Perspective',
    value: Transform.PERSPECTIVE,
    description: 'Perspective transformation (8 points)',
    icon: 'mdi-view-perspective',
    color: 'accent',
    dataCount: 8
  },
  {
    title: 'Quad',
    value: Transform.QUAD,
    description: 'Quadrilateral mapping (8 points)',
    icon: 'mdi-vector-polygon',
    color: 'success',
    dataCount: 8
  },
  {
    title: 'Mesh',
    value: Transform.MESH,
    description: 'Complex mesh transformation',
    icon: 'mdi-grid',
    color: 'warning',
    dataCount: 0 // Variable
  }
]

// Resampling options for select
const resamplingOptions = computed(() => 
  RESAMPLING_OPTIONS.map(option => ({
    title: option.label,
    value: option.value,
    description: option.description
  }))
)

// Transform presets by method
const transformPresets = {
  [Transform.AFFINE]: [
    { name: 'Identity', data: [1, 0, 0, 0, 1, 0] },
    { name: 'Scale 2x', data: [2, 0, 0, 0, 2, 0] },
    { name: 'Scale 0.5x', data: [0.5, 0, 0, 0, 0.5, 0] },
    { name: 'Shear X', data: [1, 0.5, 0, 0, 1, 0] },
    { name: 'Shear Y', data: [1, 0, 0, 0.5, 1, 0] },
    { name: 'Rotate 45°', data: [0.707, -0.707, 0, 0.707, 0.707, 0] }
  ],
  [Transform.EXTENT]: [
    { name: 'Full Image', data: [0, 0, 100, 100] },
    { name: 'Top Half', data: [0, 0, 100, 50] },
    { name: 'Bottom Half', data: [0, 50, 100, 100] },
    { name: 'Center Square', data: [25, 25, 75, 75] }
  ],
  [Transform.PERSPECTIVE]: [
    { name: 'Trapezoid', data: [0, 0, 100, 10, 90, 90, 10, 100] },
    { name: 'Perspective', data: [10, 0, 90, 0, 100, 100, 0, 100] }
  ],
  [Transform.QUAD]: [
    { name: 'Rectangle', data: [0, 0, 100, 0, 100, 100, 0, 100] },
    { name: 'Diamond', data: [50, 0, 100, 50, 50, 100, 0, 50] }
  ]
}

// Initialize data based on current method
onMounted(() => {
  initializeDataFromOperation()
})

// Watch for prop changes
watch(() => props.operation, (newOp) => {
  localOperation.value = { ...newOp }
  initializeDataFromOperation()
}, { deep: true })

// Methods
const updateOperation = () => {
  emit('update:operation', { ...localOperation.value })
}

const getCurrentMethod = () => 
  transformOptions.find(opt => opt.value === localOperation.value.method)

const getCurrentMethodName = () => getCurrentMethod()?.title || 'Transform'

const getRequiredDataDescription = () => {
  const method = getCurrentMethod()
  if (!method) return 'Select a transform method'
  
  switch (method.value) {
    case Transform.AFFINE:
      return '6 values: [a, b, c, d, e, f] for matrix transformation'
    case Transform.EXTENT:
      return '4 values: [left, top, right, bottom] rectangle coordinates'
    case Transform.PERSPECTIVE:
      return '8 values: 4 corner points [x1,y1, x2,y2, x3,y3, x4,y4]'
    case Transform.QUAD:
      return '8 values: 4 corner points for quadrilateral mapping'
    case Transform.MESH:
      return 'Complex mesh data structure (JSON format)'
    default:
      return 'Transform data'
  }
}

const initializeDataFromOperation = () => {
  if (props.operation.data && Array.isArray(props.operation.data)) {
    dataValues.value = [...props.operation.data]
    rawDataInput.value = JSON.stringify(props.operation.data)
  } else {
    const method = getCurrentMethod()
    if (method && method.dataCount > 0) {
      dataValues.value = new Array(method.dataCount).fill(0)
    }
  }
  
  // Initialize advanced options
  if (props.operation.fillcolor) {
    useFillColor.value = true
    fillColorR.value = props.operation.fillcolor[0]
    fillColorG.value = props.operation.fillcolor[1]
    fillColorB.value = props.operation.fillcolor[2]
  }
}

const onMethodChange = () => {
  const method = getCurrentMethod()
  if (method && method.dataCount > 0) {
    // Initialize with default values based on method
    const presets = transformPresets[method.value]
    if (presets && presets.length > 0) {
      dataValues.value = [...presets[0].data]
    } else {
      dataValues.value = new Array(method.dataCount).fill(0)
    }
    updateData()
  }
  updateOperation()
}

const updateData = () => {
  localOperation.value.data = [...dataValues.value]
  rawDataInput.value = JSON.stringify(dataValues.value)
  updateOperation()
}

const updateMeshData = () => {
  try {
    const parsed = JSON.parse(meshDataInput.value)
    localOperation.value.data = parsed
    updateOperation()
  } catch (error) {
    console.warn('Invalid mesh data format')
  }
}

const updateRawData = () => {
  try {
    const parsed = JSON.parse(rawDataInput.value)
    if (Array.isArray(parsed)) {
      dataValues.value = parsed
      localOperation.value.data = parsed
      updateOperation()
    }
  } catch (error) {
    console.warn('Invalid raw data format')
  }
}

// Advanced options methods
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

// Label helpers
const getAffineLabel = (index: number) => {
  const labels = ['a (scale X)', 'b (shear X)', 'c (trans X)', 'd (shear Y)', 'e (scale Y)', 'f (trans Y)']
  return labels[index] || `Param ${index + 1}`
}

const getExtentLabel = (index: number) => {
  const labels = ['Left', 'Top', 'Right', 'Bottom']
  return labels[index] || `Coord ${index + 1}`
}

const getPointLabel = (index: number) => {
  const pointNum = Math.floor(index / 2) + 1
  const coord = index % 2 === 0 ? 'X' : 'Y'
  return `Point ${pointNum} ${coord}`
}

// Method type checks
const isAffineMethod = () => localOperation.value.method === Transform.AFFINE
const isExtentMethod = () => localOperation.value.method === Transform.EXTENT
const isPerspectiveOrQuadMethod = () => 
  localOperation.value.method === Transform.PERSPECTIVE || 
  localOperation.value.method === Transform.QUAD
const isMeshMethod = () => localOperation.value.method === Transform.MESH

const getCurrentPresets = () => 
  transformPresets[localOperation.value.method] || []

const applyPreset = (preset: { name: string, data: number[] }) => {
  dataValues.value = [...preset.data]
  updateData()
}

const getPreviewTransform = () => {
  if (isAffineMethod() && dataValues.value.length >= 6) {
    const [a, b, c, d, e, f] = dataValues.value
    return {
      transform: `matrix(${a}, ${d}, ${b}, ${e}, ${c}, ${f})`
    }
  }
  return {}
}

const getPreviewText = () => {
  const method = getCurrentMethodName()
  const resamplingOption = RESAMPLING_OPTIONS.find(r => r.value === localOperation.value.resample)
  const resampling = resamplingOption?.label || 'Default'
  
  let dataInfo = `${dataValues.value.length} parameters`
  if (localOperation.value.fillcolor) {
    dataInfo += `, fill RGB(${localOperation.value.fillcolor.join(', ')})`
  }
  
  return `${method} transformation with ${dataInfo} using ${resampling.toLowerCase()} resampling`
}
</script>

<style scoped>
.color-preview {
  width: 30px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.transform-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
}

.preview-grid {
  display: flex;
  gap: 20px;
  align-items: center;
}

.grid-item {
  width: 80px;
  height: 60px;
  border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.grid-item.original {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
}

.grid-item.transformed {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  transform-origin: center;
}
</style>
