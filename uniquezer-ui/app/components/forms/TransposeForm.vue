<template>
  <div>
    <v-card variant="outlined">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-avatar color="info" size="40">
            <v-icon color="white">mdi-flip-horizontal</v-icon>
          </v-avatar>
          <div class="ml-3">
            <h4>Transpose Image</h4>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Flip or rotate the image in 90-degree increments
            </p>
          </div>
        </div>

        <!-- Transpose Method Selection -->
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="localOperation.transpose"
              :items="transposeOptions"
              label="Transpose Method"
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
        </v-row>

        <!-- Visual Preview -->
        <v-card variant="tonal" class="pa-4 mb-4">
          <h4 class="text-subtitle-1 mb-3">Visual Preview</h4>
          
          <div class="transpose-preview">
            <div class="original-preview">
              <div class="preview-box">
                <div class="preview-content original">
                  <div class="corner top-left">A</div>
                  <div class="corner top-right">B</div>
                  <div class="corner bottom-left">C</div>
                  <div class="corner bottom-right">D</div>
                </div>
                <div class="text-caption text-center mt-2">Original</div>
              </div>
            </div>

            <v-icon size="32" class="mx-4">mdi-arrow-right</v-icon>

            <div class="result-preview">
              <div class="preview-box">
                <div class="preview-content" :class="getPreviewClass()">
                  <div class="corner top-left">{{ getCornerLabel('top-left') }}</div>
                  <div class="corner top-right">{{ getCornerLabel('top-right') }}</div>
                  <div class="corner bottom-left">{{ getCornerLabel('bottom-left') }}</div>
                  <div class="corner bottom-right">{{ getCornerLabel('bottom-right') }}</div>
                </div>
                <div class="text-caption text-center mt-2">Result</div>
              </div>
            </div>
          </div>
        </v-card>

        <!-- Quick Actions -->
        <div class="mb-4">
          <h4 class="text-subtitle-1 mb-3">Quick Actions</h4>
          <div class="d-flex flex-wrap ga-2">
            <v-btn
              v-for="quick in quickActions"
              :key="quick.value"
              size="small"
              variant="outlined"
              :color="localOperation.transpose === quick.value ? 'primary' : 'default'"
              @click="setTranspose(quick.value)"
            >
              <v-icon :icon="quick.icon" class="mr-1"></v-icon>
              {{ quick.name }}
            </v-btn>
          </div>
        </div>

        <!-- Preview Summary -->
        <v-alert 
          type="info" 
          variant="tonal" 
          class="mt-4"
          :text="getPreviewText()"
          title="Transpose Preview"
        ></v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TransposeOperation } from '~/types'
import { Transpose } from '~/types'

interface Props {
  operation: TransposeOperation
}

interface Emits {
  'update:operation': [operation: TransposeOperation]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local reactive copy
const localOperation = ref<TransposeOperation>({ ...props.operation })

// Transpose options
const transposeOptions = [
  {
    title: 'Flip Left-Right',
    value: Transpose.FLIP_LEFT_RIGHT,
    description: 'Mirror horizontally (flip along vertical axis)',
    icon: 'mdi-flip-horizontal',
    color: 'blue'
  },
  {
    title: 'Flip Top-Bottom',
    value: Transpose.FLIP_TOP_BOTTOM,
    description: 'Mirror vertically (flip along horizontal axis)',
    icon: 'mdi-flip-vertical',
    color: 'green'
  },
  {
    title: 'Rotate 90°',
    value: Transpose.ROTATE_90,
    description: 'Rotate 90 degrees clockwise',
    icon: 'mdi-rotate-right',
    color: 'orange'
  },
  {
    title: 'Rotate 180°',
    value: Transpose.ROTATE_180,
    description: 'Rotate 180 degrees (upside down)',
    icon: 'mdi-flip-vertical',
    color: 'red'
  },
  {
    title: 'Rotate 270°',
    value: Transpose.ROTATE_270,
    description: 'Rotate 270 degrees clockwise (90° counter-clockwise)',
    icon: 'mdi-rotate-left',
    color: 'purple'
  },
  {
    title: 'Transpose',
    value: Transpose.TRANSPOSE,
    description: 'Flip along main diagonal (swap X and Y)',
    icon: 'mdi-vector-line',
    color: 'teal'
  },
  {
    title: 'Transverse',
    value: Transpose.TRANSVERSE,
    description: 'Flip along anti-diagonal',
    icon: 'mdi-vector-line',
    color: 'indigo'
  }
]

// Quick actions (most common operations)
const quickActions = transposeOptions.filter(opt => 
  [Transpose.FLIP_LEFT_RIGHT, Transpose.FLIP_TOP_BOTTOM, Transpose.ROTATE_90, Transpose.ROTATE_180].includes(opt.value)
)

// Watch for prop changes
watch(() => props.operation, (newOp) => {
  localOperation.value = { ...newOp }
}, { deep: true })

// Methods
const updateOperation = () => {
  emit('update:operation', { ...localOperation.value })
}

const setTranspose = (method: Transpose) => {
  localOperation.value.transpose = method
  updateOperation()
}

const getPreviewClass = () => {
  const classMap = {
    [Transpose.FLIP_LEFT_RIGHT]: 'flip-horizontal',
    [Transpose.FLIP_TOP_BOTTOM]: 'flip-vertical',
    [Transpose.ROTATE_90]: 'rotate-90',
    [Transpose.ROTATE_180]: 'rotate-180',
    [Transpose.ROTATE_270]: 'rotate-270',
    [Transpose.TRANSPOSE]: 'transpose',
    [Transpose.TRANSVERSE]: 'transverse'
  }
  return classMap[localOperation.value.transpose] || ''
}

const getCornerLabel = (position: string) => {
  const transpose = localOperation.value.transpose
  
  // Original positions: A=top-left, B=top-right, C=bottom-left, D=bottom-right
  const labelMap = {
    [Transpose.FLIP_LEFT_RIGHT]: {
      'top-left': 'B', 'top-right': 'A', 'bottom-left': 'D', 'bottom-right': 'C'
    },
    [Transpose.FLIP_TOP_BOTTOM]: {
      'top-left': 'C', 'top-right': 'D', 'bottom-left': 'A', 'bottom-right': 'B'
    },
    [Transpose.ROTATE_90]: {
      'top-left': 'C', 'top-right': 'A', 'bottom-left': 'D', 'bottom-right': 'B'
    },
    [Transpose.ROTATE_180]: {
      'top-left': 'D', 'top-right': 'C', 'bottom-left': 'B', 'bottom-right': 'A'
    },
    [Transpose.ROTATE_270]: {
      'top-left': 'B', 'top-right': 'D', 'bottom-left': 'A', 'bottom-right': 'C'
    },
    [Transpose.TRANSPOSE]: {
      'top-left': 'A', 'top-right': 'C', 'bottom-left': 'B', 'bottom-right': 'D'
    },
    [Transpose.TRANSVERSE]: {
      'top-left': 'D', 'top-right': 'B', 'bottom-left': 'C', 'bottom-right': 'A'
    }
  }
  
  return labelMap[transpose]?.[position] || 'A'
}

const getPreviewText = () => {
  const option = transposeOptions.find(opt => opt.value === localOperation.value.transpose)
  return option ? `${option.title}: ${option.description}` : 'Transpose operation'
}
</script>

<style scoped>
.transpose-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}

.preview-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-content {
  position: relative;
  width: 80px;
  height: 60px;
  border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.preview-content.original {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
}

.corner {
  position: absolute;
  width: 16px;
  height: 16px;
  background: rgba(var(--v-theme-primary), 0.8);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

.corner.top-left { top: 2px; left: 2px; }
.corner.top-right { top: 2px; right: 2px; }
.corner.bottom-left { bottom: 2px; left: 2px; }
.corner.bottom-right { bottom: 2px; right: 2px; }

.preview-content.flip-horizontal { transform: scaleX(-1); }
.preview-content.flip-vertical { transform: scaleY(-1); }
.preview-content.rotate-90 { transform: rotate(90deg); }
.preview-content.rotate-180 { transform: rotate(180deg); }
.preview-content.rotate-270 { transform: rotate(270deg); }
.preview-content.transpose { transform: matrix(0, 1, 1, 0, 0, 0); }
.preview-content.transverse { transform: matrix(0, -1, -1, 0, 0, 0); }

@media (max-width: 600px) {
  .transpose-preview {
    flex-direction: column;
  }
}
</style>
