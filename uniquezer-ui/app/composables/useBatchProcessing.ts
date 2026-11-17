import type { UniqueizationSettings, AnyImageOperation } from '~/types'
import { useLocalStorage } from '~/composables/useLocalStorage'

export interface BatchCombination {
  id: string
  operations: AnyImageOperation[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
}

export interface BatchOperation {
  enabled: boolean
  base: number
  rangeMin: number
  rangeMax: number
  step: number
}

export interface BatchResizeOperation {
  enabled: boolean
  baseWidth: number
  widthMin: number
  widthMax: number
  widthStep: number
  baseHeight: number
  heightMin: number
  heightMax: number
  heightStep: number
}

export interface BatchOperations {
  rotate: BatchOperation
  enhance: BatchOperation
  resize: BatchResizeOperation
}

export const useBatchProcessing = () => {
  const batchOperationsDefaults = {
    rotate: {
      enabled: false,
      base: 45,
      rangeMin: 44,
      rangeMax: 46, 
      step: 0.5
    } as BatchOperation,
    
    enhance: {
      enabled: false,
      base: 1.0,
      rangeMin: 0.95,
      rangeMax: 1.05,
      step: 0.05
    } as BatchOperation,
    
    resize: {
      enabled: false,
      baseWidth: 800,
      widthMin: 790,
      widthMax: 810,
      widthStep: 5,
      baseHeight: 600,
      heightMin: 590,
      heightMax: 610,
      heightStep: 5
    } as BatchResizeOperation
  } as BatchOperations

  // Global batch state
  const batchCombinations = useState<BatchCombination[]>('batchCombinations', () => [])
  const isBatchMode = useState<boolean>('isBatchMode', () => false)
  const currentBatchIndex = useState<number>('currentBatchIndex', () => 0)
  const batchOperations = useLocalStorage<BatchOperations>('batchOperations', {...batchOperationsDefaults})

  const resetBatchOperations = () => {
    const deepCopyOfDefaults = JSON.parse(JSON.stringify(batchOperationsDefaults));
    batchOperations.value = deepCopyOfDefaults;
  };

  // Get global processing state from main composable
  const { 
    isProcessing,
    setProcessing,
    setProgress,
    setError,
    fileId
  } = useImageProcessing()

  // Computed
  const totalBatchCount = computed(() => batchCombinations.value.length)
  const completedBatchCount = computed(() => 
    batchCombinations.value.filter(c => c.status === 'completed').length
  )
  const failedBatchCount = computed(() => 
    batchCombinations.value.filter(c => c.status === 'failed').length
  )
  const pendingBatchCount = computed(() => 
    batchCombinations.value.filter(c => c.status === 'pending').length
  )
  const batchProgress = computed(() => 
    totalBatchCount.value > 0 ? (completedBatchCount.value / totalBatchCount.value) * 100 : 0
  )

  // Generate combinations and save to state
  const saveBatchCombinations = (operationSets: AnyImageOperation[][]) => {
    const combinations: BatchCombination[] = operationSets.map((operations, index) => ({
      id: `batch-${Date.now()}-${index}`,
      operations,
      status: 'pending' as const
    }))
    
    batchCombinations.value = combinations
    currentBatchIndex.value = 0
    
    const { info } = useNotifications()
    info(`Prepared ${combinations.length} combinations for batch processing`)
    return combinations
  }

  // Process all combinations sequentially with unified results management
  const processBatchSequential = async () => {
    if (!fileId.value) {
      const { error: showError } = useNotifications()
      showError('No file uploaded for batch processing')
      return
    }

    if (batchCombinations.value.length === 0) {
      const { error: showError } = useNotifications()
      showError('No batch combinations to process')
      return
    }

    try {
      setProcessing(true, 'batch-processing')
      
      const { info, success, error: showError } = useNotifications()
      const { addBatchResults } = useProcessingResults()
      const { pollJobQuiet, createSettings } = await import('~/utils/apiHelpers')
      
      info(`Starting batch processing of ${totalBatchCount.value} combinations`)
      
      const completedResults: any[] = []
      
      for (let i = 0; i < batchCombinations.value.length; i++) {
        const combination = batchCombinations.value[i]
        currentBatchIndex.value = i

        // Update combination status
        combination.status = 'processing'
        
        // Update overall progress
        const overallProgress = (i / totalBatchCount.value) * 100
        setProgress(overallProgress)

        try {
          // Create settings object for this combination
          const settings = createSettings(combination.operations)

          console.log(`Processing combination ${i + 1}/${totalBatchCount.value}:`, settings)

          // Process this specific combination using direct API calls
          const result = await processSingleCombination(settings, pollJobQuiet)
          
          // Update combination with result
          combination.status = 'completed'
          completedResults.push(result)

          console.log(`Combination ${i + 1} completed:`, result)

        } catch (error: any) {
          console.error(`Combination ${i + 1} failed:`, error)
          combination.status = 'failed'
          combination.error = error.message
          
          // Continue processing other combinations despite this failure
        }

        // Small delay between processes to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Add all successful results to unified results store
      if (completedResults.length > 0) {
        const operationsCount = batchCombinations.value[0]?.operations.length || 1
        addBatchResults(completedResults, operationsCount)
      }

      // Final status
      setProgress(100)
      setProcessing(false)
      
      const successCount = completedBatchCount.value
      const failureCount = failedBatchCount.value
      
      if (failureCount > 0) {
        showError(`Batch completed: ${successCount} successful, ${failureCount} failed`)
      } else {
        success(`Batch processing completed successfully! ${successCount} images processed`)
      }

    } catch (error: any) {
      console.error('Batch processing failed:', error)
      setError(error.message || 'Batch processing failed')
      setProcessing(false)
    }
  }

  // Process a single combination using direct API calls
  const processSingleCombination = async (settings: UniqueizationSettings, pollJobQuiet: any) => {
    // Direct API calls without state updates (for batch processing)
    const { uniqueizeImage } = useApi()
    
    // Submit job with specific settings
    const jobResponse = await uniqueizeImage(fileId.value!, settings)
    
    // Poll for completion quietly (no UI updates per job)
    const result = await pollJobQuiet(jobResponse.job_id)
    return result
  }

  // Switch between single and batch mode
  const setBatchMode = (enabled: boolean) => {
    isBatchMode.value = enabled
    
    if (!enabled) {
      // Clear batch state when switching to single mode
      clearBatch()
    }
  }

  // Clear all batch state
  const clearBatch = () => {
    batchCombinations.value = []
    currentBatchIndex.value = 0
  }

  // Get batch status summary
  const getBatchStatusSummary = () => {
    if (totalBatchCount.value === 0) return {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      progress: 0
    }
    
    const processing = batchCombinations.value.filter(c => c.status === 'processing').length
    
    return {
      total: totalBatchCount.value,
      pending: pendingBatchCount.value,
      processing,
      completed: completedBatchCount.value,
      failed: failedBatchCount.value,
      progress: batchProgress.value
    }
  }

  // Download batch results (delegates to unified results store)
  const downloadBatchResults = async () => {
    try {
      const { downloadSelected, getSelectedResults, selectAll } = useProcessingResults()
      const { info } = useNotifications()
      
      // Auto-select all batch results for download
      selectAll()
      const selectedResults = getSelectedResults()
      
      if (selectedResults.length === 0) {
        info('No batch results available for download')
        return
      }

      info(`Downloading ${selectedResults.length} batch results...`)
      await downloadSelected()
      
    } catch (error: any) {
      const { error: showError } = useNotifications()
      showError('Failed to download batch results: ' + error.message)
    }
  }

  return {
    // State (readonly)
    batchOperations: batchOperations,
    batchOperationsDefaults: readonly(batchOperationsDefaults),
    batchCombinations: readonly(batchCombinations),
    isBatchMode: readonly(isBatchMode),
    currentBatchIndex: readonly(currentBatchIndex),
    
    // Computed
    totalBatchCount,
    completedBatchCount,
    failedBatchCount,
    pendingBatchCount,
    batchProgress,
    
    // Actions
    saveBatchCombinations,
    processBatchSequential,
    setBatchMode,
    clearBatch,
    getBatchStatusSummary,
    downloadBatchResults,
    
    // Utils
    processSingleCombination,
    resetBatchOperations
  }
}
