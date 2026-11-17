<template>
  <div>
    <!-- Dynamic form component based on operation type -->
    <component
      :is="formComponent"
      v-if="formComponent"
      :operation="operation"
      @update:operation="onUpdate"
    />
    
    <!-- Fallback for unsupported operations -->
    <div v-else class="text-center pa-8">
      <v-icon size="64" color="warning" class="mb-4">
        mdi-construction
      </v-icon>
      <h4 class="text-h6 mb-2">Form Not Available</h4>
      <p class="text-body-2 text-medium-emphasis mb-4">
        The form for <strong>{{ getOperationTypeLabel(operation.type) }}</strong> operations is not yet implemented.
      </p>
      <v-chip color="warning" variant="outlined">
        Coming Soon
      </v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AnyImageOperation } from '~/types'
import { UniqueizationType } from '~/types'
import { getOperationTypeLabel } from '~/utils/operationSummary'

// Import all form components
const RotateForm = defineAsyncComponent(() => import('@/components/forms/RotateForm.vue'))
const CropForm = defineAsyncComponent(() => import('./forms/CropForm.vue'))
const ResizeForm = defineAsyncComponent(() => import('./forms/ResizeForm.vue'))
const TransposeForm = defineAsyncComponent(() => import('./forms/TransposeForm.vue'))
// const TransformForm = defineAsyncComponent(() => import('./forms/TransformForm.vue'))
// const ConvertForm = defineAsyncComponent(() => import('./forms/ConvertForm.vue'))
const EnhanceForm = defineAsyncComponent(() => import('./forms/EnhanceForm.vue'))
const SimpleFilterForm = defineAsyncComponent(() => import('./forms/SimpleFilterForm.vue'))

interface Props {
  operation: AnyImageOperation
}

interface Emits {
  'update:operation': [operation: AnyImageOperation]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Form component mapping - now includes all implemented forms
const componentMap = {
  [UniqueizationType.ROTATE]: RotateForm,
  [UniqueizationType.CROP]: CropForm,
  [UniqueizationType.RESIZE]: ResizeForm,
  [UniqueizationType.TRANSPOSE]: TransposeForm,
  // [UniqueizationType.TRANSFORM]: TransformForm,
  // [UniqueizationType.CONVERT]: ConvertForm,
  [UniqueizationType.ENHANCE]: EnhanceForm,
  [UniqueizationType.SIMPLE_FILTER]: SimpleFilterForm,
}

// Get the appropriate form component
const formComponent = computed(() => {
  return componentMap[props.operation.type as keyof typeof componentMap] || null
})

// Handle updates from child form
const onUpdate = (updatedOperation: AnyImageOperation) => {
  emit('update:operation', updatedOperation)
}
</script>
