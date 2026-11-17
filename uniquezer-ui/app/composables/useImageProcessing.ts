import type { UniqueizationSettings, AnyImageOperation } from '~/types'
import { useLocalStorage } from '~/composables/useLocalStorage'

export const useImageProcessing = () => {
  // Global state using Nuxt's useState
  const uploadedFile = useState<File | null>('uploadedFile', () => null)
  const fileId = useState<string | null>('fileId', () => null)
  /*
  const settings = useState<UniqueizationSettings>('processingSettings', () => ({
    settings: []
  }))
  */

  const settings = useLocalStorage<UniqueizationSettings>('processingSettings', {
    settings: []
  })
  
  const isProcessing = useState<boolean>('isProcessing', () => false)
  const processingProgress = useState<number>('processingProgress', () => 0)
  const processingError = useState<string | null>('processingError', () => null)
  const currentJobId = useState<string | null>('currentJobId', () => null)

  // Upload state
  const isUploading = useState<boolean>('isUploading', () => false)
  const uploadProgress = useState<number>('uploadProgress', () => 0)

  // Actions for managing operations
  const addOperation = (operation: AnyImageOperation) => {
    settings.value.settings.push(operation)
  }

  const updateOperation = (index: number, operation: AnyImageOperation) => {
    if (index >= 0 && index < settings.value.settings.length) {
      settings.value.settings[index] = operation
    }
  }

  const removeOperation = (index: number) => {
    if (index >= 0 && index < settings.value.settings.length) {
      settings.value.settings.splice(index, 1)
    }
  }

  const clearOperations = () => {
    settings.value.settings = []
  }

  // File management with direct API calls
  const setUploadedFile = (file: File | null, id: string | null) => {
    uploadedFile.value = file
    fileId.value = id
    
    // Clear processing state when new file is uploaded
    if (file && id) {
      processingError.value = null
      currentJobId.value = null
    }
  }

  const clearUploadedFile = () => {
    uploadedFile.value = null
    fileId.value = null
    processingError.value = null
    currentJobId.value = null
    resetUploadState()
  }

  // Upload with integrated API calls
  const uploadFileWithState = async (file: File) => {
    try {
      setUploading(true)
      
      const { uploadFileWithProgress } = await import('~/utils/apiHelpers')
      const { success } = useNotifications()
      
      const result = await uploadFileWithProgress(file, (progress) => {
        setUploadProgress(progress)
      })
      
      setUploadedFile(file, result.file_id)
      success('File uploaded successfully!')
      
      return result.file_id
      
    } catch (error: any) {
      const { error: showError } = useNotifications()
      showError(error.message || 'Upload failed. Please try again.')
      throw error
    } finally {
      resetUploadState()
    }
  }

  // Process image with integrated API calls and results management
  const processImageWithState = async () => {
    if (!fileId.value) {
      throw new Error('No file uploaded')
    }
    
    if (!settings.value.settings.length) {
      throw new Error('No operations configured')
    }

    try {
      setProcessing(true)
      
      // Import utilities dynamically
      const { processImageWithPolling, getOperationsCount } = await import('~/utils/apiHelpers')
      const { addResult } = useProcessingResults()
      const { success } = useNotifications()
      
      console.log('Processing image with settings:', settings.value)
      
      // Process image with progress updates
      const result = await processImageWithPolling(
        fileId.value,
        settings.value,
        (progress) => setProgress(progress)
      )
      
      // Add result to unified results store
      const operationsCount = getOperationsCount(settings.value)
      addResult(result, 'single', operationsCount)
      
      success('Image processing completed successfully!')
      return result
      
    } catch (error: any) {
      const { error: showError } = useNotifications()
      showError(error.message || 'Error during image processing.')
      console.error('Processing failed:', error)
      setError(error.message || 'Processing failed')
      throw error
    } finally {
      setProcessing(false)
    }
  }

  // Upload state management
  const setUploading = (uploading: boolean) => {
    isUploading.value = uploading
    if (uploading) {
      uploadProgress.value = 0
    }
  }

  const setUploadProgress = (progress: number) => {
    uploadProgress.value = Math.max(0, Math.min(100, progress))
  }

  const resetUploadState = () => {
    isUploading.value = false
    uploadProgress.value = 0
  }

  // Processing state management
  const setProcessing = (processing: boolean, jobId?: string) => {
    isProcessing.value = processing
    if (processing) {
      processingError.value = null
      processingProgress.value = 0
      currentJobId.value = jobId || null
    } else {
      currentJobId.value = null
    }
  }

  const setProgress = (progress: number) => {
    processingProgress.value = Math.max(0, Math.min(100, progress))
  }

  const setError = (error: string | null) => {
    processingError.value = error
    if (error) {
      isProcessing.value = false
      currentJobId.value = null
    }
  }

  const resetProcessingState = () => {
    isProcessing.value = false
    processingProgress.value = 0
    processingError.value = null
    currentJobId.value = null
  }

  const resetAll = () => {
    clearUploadedFile()
    clearOperations()
    resetProcessingState()
  }

  // Settings management with localStorage
  const exportSettings = (): string => {
    return JSON.stringify(settings.value, null, 2)
  }

  const importSettings = (settingsJson: string): boolean => {
    try {
      const imported = JSON.parse(settingsJson)
      if (imported && Array.isArray(imported.settings)) {
        settings.value = imported
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to import settings:', error)
      return false
    }
  }

  // Computed helpers
  const hasOperations = computed(() => settings.value.settings.length > 0)
  const canProcess = computed(() => !!fileId.value && hasOperations.value && !isProcessing.value)
  const hasUploadedFile = computed(() => !!uploadedFile.value && !!fileId.value)
  const operationsCount = computed(() => settings.value.settings.length)

  return {
    // === STATE (readonly) ===
    uploadedFile: readonly(uploadedFile),
    fileId: readonly(fileId),
    settings: readonly(settings),
    isProcessing: readonly(isProcessing),
    processingProgress: readonly(processingProgress),
    processingError: readonly(processingError),
    currentJobId: readonly(currentJobId),
    isUploading: readonly(isUploading),
    uploadProgress: readonly(uploadProgress),
    
    // === COMPUTED ===
    hasOperations,
    canProcess,
    hasUploadedFile,
    operationsCount,
    
    // === OPERATIONS ACTIONS ===
    addOperation,
    updateOperation,
    removeOperation,
    clearOperations,
    
    // === FILE ACTIONS ===
    setUploadedFile,
    clearUploadedFile,
    uploadFileWithState,
    
    // === PROCESSING ACTIONS ===
    processImageWithState,
    setProcessing,
    setProgress,
    setError,
    resetProcessingState,
    
    // === UPLOAD ACTIONS ===
    setUploading,
    setUploadProgress,
    resetUploadState,
    
    // === UTILITY ACTIONS ===
    resetAll,
    exportSettings,
    importSettings
  }
}
