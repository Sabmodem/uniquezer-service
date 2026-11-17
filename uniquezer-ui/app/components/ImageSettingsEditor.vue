<template>
  <!-- <v-radio-group inline class="d-flex justify-center align-center">
    <v-radio label="Single" value="one"></v-radio>
    <v-radio label="Batch" value="two"></v-radio>
  </v-radio-group> -->
  <OperationsList
    @add-operation="openAddDialog"
    @edit-operation="openEditDialog"
  />
  <OperationDialog
    v-model="dialog"
    :mode="dialogMode"
    :operation="currentOperation"
    @save="handleOperationSave"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AnyImageOperation } from '~/types'

// Global state
const { addOperation, updateOperation } = useImageProcessing()
const { success } = useNotifications()

// Local state
const dialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const currentOperation = ref<AnyImageOperation | null>(null)
const editIndex = ref<number>(-1)

// Methods
const openAddDialog = () => {
  dialogMode.value = 'add'
  currentOperation.value = null
  editIndex.value = -1
  dialog.value = true
}

const openEditDialog = (index: number) => {
  const { settings } = useImageProcessing()
  
  dialogMode.value = 'edit'
  currentOperation.value = JSON.parse(JSON.stringify(settings.value.settings[index]))
  editIndex.value = index
  dialog.value = true
}

const handleOperationSave = (operation: AnyImageOperation) => {
  if (dialogMode.value === 'add') {
    addOperation(operation)
    success(`Added ${operation.type} operation`)
  } else if (dialogMode.value === 'edit') {
    updateOperation(editIndex.value, operation)
    success(`Updated ${operation.type} operation`)
  }
  
  dialog.value = false
}
</script>
