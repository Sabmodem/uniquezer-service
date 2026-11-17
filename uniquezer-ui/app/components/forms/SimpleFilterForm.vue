<template>
  <div>
    <v-card variant="outlined">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-avatar color="accent" size="40">
            <v-icon color="white">mdi-filter</v-icon>
          </v-avatar>
          <div class="ml-3">
            <h4>Apply Filter</h4>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Apply various image processing filters for different effects
            </p>
          </div>
        </div>

        <!-- Filter Selection -->
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="localOperation.method"
              :items="filterOptions"
              label="Filter Type"
              variant="outlined"
              @update:model-value="updateOperation"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-avatar size="32" :color="item.raw.color">
                      <v-icon :icon="item.raw.icon" color="white" size="16"></v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                </v-list-item>
              </template>
              
              <template #selection="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="24" :color="item.raw.color" class="mr-2">
                    <v-icon :icon="item.raw.icon" color="white" size="12"></v-icon>
                  </v-avatar>
                  {{ item.title }}
                </div>
              </template>
            </v-select>
          </v-col>
        </v-row>

        <!-- Filter Categories -->
        <div class="mb-4">
          <h4 class="text-subtitle-1 mb-3">Filter Categories</h4>
          
          <v-row>
            <v-col v-for="category in filterCategories" :key="category.name" cols="12" sm="6" md="4">
              <v-card 
                variant="outlined" 
                :class="{ 'category-selected': isCategorySelected(category.name) }"
                class="pa-3 category-card"
              >
                <div class="d-flex align-center mb-2">
                  <v-icon :color="category.color" class="mr-2">{{ category.icon }}</v-icon>
                  <strong class="text-body-1">{{ category.name }}</strong>
                </div>
                
                <div class="filter-buttons">
                  <v-btn
                    v-for="filter in category.filters"
                    :key="filter"
                    size="x-small"
                    variant="text"
                    :color="localOperation.method === filter ? 'primary' : 'default'"
                    class="mr-1 mb-1"
                    @click="setFilter(filter)"
                  >
                    {{ getFilterDisplayName(filter) }}
                  </v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Current Filter Info -->
        <v-card variant="tonal" class="pa-4 mb-4">
          <h4 class="text-subtitle-1 mb-2">{{ getCurrentFilterName() }}</h4>
          <div class="d-flex align-center mb-2">
            <v-avatar size="32" :color="getCurrentFilterColor()">
              <v-icon :icon="getCurrentFilterIcon()" color="white" size="16"></v-icon>
            </v-avatar>
            <div class="ml-3">
              <div class="text-body-2">{{ getCurrentFilterDescription() }}</div>
              <div class="text-caption text-medium-emphasis">
                Category: {{ getCurrentFilterCategory() }}
              </div>
            </div>
          </div>
          
          <!-- Use Cases -->
          <div class="mt-3">
            <strong class="text-body-2">Good for:</strong>
            <div class="text-caption text-medium-emphasis">
              {{ getCurrentFilterUseCases() }}
            </div>
          </div>
        </v-card>

        <!-- Preview Summary -->
        <v-alert 
          type="info" 
          variant="tonal" 
          class="mt-4"
          :text="getPreviewText()"
          title="Filter Preview"
        ></v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SimpleFilterOperation } from '~/types'
import { SimpleFilterMethod } from '~/types'

interface Props {
  operation: SimpleFilterOperation
}

interface Emits {
  'update:operation': [operation: SimpleFilterOperation]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local reactive copy
const localOperation = ref<SimpleFilterOperation>({ ...props.operation })

// Filter options with metadata
const filterOptions = [
  {
    title: 'Blur',
    value: SimpleFilterMethod.BLUR,
    description: 'Apply Gaussian blur effect',
    icon: 'mdi-blur',
    color: 'blue',
    category: 'Blur & Smooth',
    useCases: 'Background blur, noise reduction, artistic effects'
  },
  {
    title: 'Contour',
    value: SimpleFilterMethod.CONTOUR,
    description: 'Highlight object boundaries and edges',
    icon: 'mdi-vector-polyline',
    color: 'green',
    category: 'Edge Detection',
    useCases: 'Object detection, line art, technical drawings'
  },
  {
    title: 'Detail',
    value: SimpleFilterMethod.DETAIL,
    description: 'Enhance fine details and textures',
    icon: 'mdi-details',
    color: 'orange',
    category: 'Enhancement',
    useCases: 'Texture enhancement, detail recovery, photo restoration'
  },
  {
    title: 'Edge Enhancement',
    value: SimpleFilterMethod.EDGE_ENHANCE,
    description: 'Moderate edge sharpening',
    icon: 'mdi-border-outside',
    color: 'purple',
    category: 'Enhancement',
    useCases: 'Portrait photos, general sharpening, clarity improvement'
  },
  {
    title: 'Edge Enhancement More',
    value: SimpleFilterMethod.EDGE_ENHANCE_MORE,
    description: 'Strong edge sharpening',
    icon: 'mdi-border-all-variant',
    color: 'deep-purple',
    category: 'Enhancement',
    useCases: 'Text documents, architectural photos, high-contrast images'
  },
  {
    title: 'Emboss',
    value: SimpleFilterMethod.EMBOSS,
    description: 'Create raised 3D relief effect',
    icon: 'mdi-cube-outline',
    color: 'brown',
    category: 'Artistic',
    useCases: 'Artistic effects, texture creation, embossed look'
  },
  {
    title: 'Find Edges',
    value: SimpleFilterMethod.FIND_EDGES,
    description: 'Detect and highlight all edges',
    icon: 'mdi-vector-square-edit',
    color: 'teal',
    category: 'Edge Detection',
    useCases: 'Computer vision, edge analysis, outline creation'
  },
  {
    title: 'Sharpen',
    value: SimpleFilterMethod.SHARPEN,
    description: 'General image sharpening',
    icon: 'mdi-image-filter-center-focus-strong',
    color: 'red',
    category: 'Enhancement',
    useCases: 'Blurry photos, focus improvement, general enhancement'
  },
  {
    title: 'Smooth',
    value: SimpleFilterMethod.SMOOTH,
    description: 'Light smoothing and noise reduction',
    icon: 'mdi-blur-linear',
    color: 'light-blue',
    category: 'Blur & Smooth',
    useCases: 'Noise reduction, skin smoothing, gentle blur'
  },
  {
    title: 'Smooth More',
    value: SimpleFilterMethod.SMOOTH_MORE,
    description: 'Strong smoothing effect',
    icon: 'mdi-blur-radial',
    color: 'cyan',
    category: 'Blur & Smooth',
    useCases: 'Heavy noise reduction, artistic smoothing, portrait effects'
  }
]

// Group filters by category
const filterCategories = computed(() => {
  const categories = new Map()
  
  filterOptions.forEach(filter => {
    const categoryName = filter.category
    if (!categories.has(categoryName)) {
      const categoryData = getCategoryData(categoryName)
      categories.set(categoryName, {
        name: categoryName,
        ...categoryData,
        filters: []
      })
    }
    categories.get(categoryName).filters.push(filter.value)
  })
  
  return Array.from(categories.values())
})

// Category metadata
const getCategoryData = (categoryName: string) => {
  const categoryMap = {
    'Enhancement': { icon: 'mdi-image-filter-hdr', color: 'primary' },
    'Blur & Smooth': { icon: 'mdi-blur', color: 'blue' },
    'Edge Detection': { icon: 'mdi-vector-line', color: 'green' },
    'Artistic': { icon: 'mdi-palette', color: 'purple' }
  }
  return categoryMap[categoryName] || { icon: 'mdi-filter', color: 'grey' }
}

// Watch for prop changes
watch(() => props.operation, (newOp) => {
  localOperation.value = { ...newOp }
}, { deep: true })

// Methods
const updateOperation = () => {
  emit('update:operation', { ...localOperation.value })
}

const setFilter = (method: SimpleFilterMethod) => {
  localOperation.value.method = method
  updateOperation()
}

const getFilterDisplayName = (method: SimpleFilterMethod) => {
  const option = filterOptions.find(opt => opt.value === method)
  return option?.title.replace(' More', '+') || method
}

const isCategorySelected = (categoryName: string) => {
  const currentFilter = filterOptions.find(opt => opt.value === localOperation.value.method)
  return currentFilter?.category === categoryName
}

// Current filter helpers
const getCurrentFilter = () => 
  filterOptions.find(opt => opt.value === localOperation.value.method)

const getCurrentFilterName = () => getCurrentFilter()?.title || 'Filter'
const getCurrentFilterDescription = () => getCurrentFilter()?.description || 'Apply image filter'
const getCurrentFilterIcon = () => getCurrentFilter()?.icon || 'mdi-filter'
const getCurrentFilterColor = () => getCurrentFilter()?.color || 'grey'
const getCurrentFilterCategory = () => getCurrentFilter()?.category || 'General'
const getCurrentFilterUseCases = () => getCurrentFilter()?.useCases || 'Various image effects'

const getPreviewText = () => {
  const filter = getCurrentFilter()
  return filter ? `Apply ${filter.title} filter: ${filter.description}` : 'Apply image filter'
}
</script>

<style scoped>
.category-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-selected {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
