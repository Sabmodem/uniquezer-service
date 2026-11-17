// Unified results management for both single and batch processing
import type { AnyImageOperation } from '~/types'

export interface ProcessingResult {
  id: string
  file_id: string
  url: string
  created_at: string
  processing_mode: 'single' | 'batch'
  operations_count: number
}

export const useProcessingResults = () => {
  // Global results state
  const allResults = useState<ProcessingResult[]>('allProcessingResults', () => [])
  const selectedResults = useState<Set<string>>('selectedResults', () => new Set())

  // Computed values
  const resultsCount = computed(() => allResults.value.length)
  const selectedCount = computed(() => selectedResults.value.size)
  const hasResults = computed(() => resultsCount.value > 0)
  const hasSelection = computed(() => selectedCount.value > 0)
  const allSelected = computed(() => selectedCount.value === resultsCount.value)

  // Get results by mode
  const singleResults = computed(() => 
    allResults.value.filter(result => result.processing_mode === 'single')
  )
  const batchResults = computed(() => 
    allResults.value.filter(result => result.processing_mode === 'batch')
  )

  // Add single result
  const addResult = (apiResult: any, mode: 'single' | 'batch' = 'single', operationsCount: number = 1) => {
    const result: ProcessingResult = {
      id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file_id: apiResult.file_id,
      url: apiResult.url,
      created_at: new Date().toISOString(),
      processing_mode: mode,
      operations_count: operationsCount
    }

    allResults.value.unshift(result) // Add to beginning (most recent first)
    console.log(`Added ${mode} result:`, result)
  }

  // Add multiple batch results
  const addBatchResults = (apiResults: any[], operationsCount: number = 1) => {
    const timestamp = Date.now()
    const results: ProcessingResult[] = apiResults.map((apiResult, index) => ({
      id: `batch-${timestamp}-${index}`,
      file_id: apiResult.file_id,
      url: apiResult.url,
      created_at: new Date().toISOString(),
      processing_mode: 'batch' as const,
      operations_count: operationsCount
    }))

    // Add all batch results to the beginning
    allResults.value.unshift(...results)
    console.log(`Added ${results.length} batch results:`, results)
  }

  // Selection management
  const selectResult = (id: string, selected: boolean) => {
    const newSelection = new Set(selectedResults.value)
    
    if (selected) {
      newSelection.add(id)
    } else {
      newSelection.delete(id)
    }
    
    selectedResults.value = newSelection
  }

  const selectAll = () => {
    if (allSelected.value) {
      // If all selected, unselect all
      selectedResults.value = new Set()
    } else {
      // Select all results
      selectedResults.value = new Set(allResults.value.map(result => result.id))
    }
  }

  const clearSelection = () => {
    selectedResults.value = new Set()
  }

  // Get selected result objects
  const getSelectedResults = (): ProcessingResult[] => {
    return allResults.value.filter(result => selectedResults.value.has(result.id))
  }

  // Download management
  const downloadIndividual = async (resultId: string) => {
    const result = allResults.value.find(r => r.id === resultId)
    if (!result) {
      console.error('Result not found for download:', resultId)
      return
    }

    try {
      const response = await fetch(result.url)
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`)
      }
      
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${Date.now()}-${result.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(downloadUrl)
      
      const { success } = useNotifications()
      success('File downloaded successfully!')
      
    } catch (error: any) {
      console.error('Download failed:', error)
      const { error: showError } = useNotifications()
      showError(error.message || 'Download failed. Please try again.')
    }
  }

  const downloadSelected = async () => {
    const selected = getSelectedResults()
    
    if (selected.length === 0) {
      const { warning } = useNotifications()
      warning('No results selected for download')
      return
    }

    if (selected.length === 1) {
      // Single result - direct download
      await downloadIndividual(selected[0].id)
      return
    }

    // Multiple results - create archive
    try {
      const { success, info } = useNotifications()
      info(`Creating archive with ${selected.length} files...`)
      
      // Get file IDs for archive creation
      const fileIds = selected.map(result => result.file_id)
      
      // Use existing API to create archive
      const { createArchive } = useApi()
      const archiveJob = await createArchive(fileIds)
      
      // Poll for archive completion
      const archiveResult = await pollArchiveJob(archiveJob.job_id)
      
      // Download the archive
      const response = await fetch(archiveResult.url)
      if (!response.ok) {
        throw new Error(`Archive download failed: ${response.status}`)
      }
      
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${Date.now()}-${selected.length}-files.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(downloadUrl)
      success(`Archive with ${selected.length} files downloaded successfully!`)
      
    } catch (error: any) {
      console.error('Archive download failed:', error)
      const { error: showError } = useNotifications()
      showError(error.message || 'Archive download failed. Please try again.')
    }
  }

  // Helper for archive job polling (simplified)
  const pollArchiveJob = async (jobId: string): Promise<any> => {
    const { checkJobStatus } = useApi()
    let attempts = 0
    const maxAttempts = 30
    
    while (attempts < maxAttempts) {
      try {
        const result = await checkJobStatus(jobId)
        
        if (!['finished', 'failed', 'stopped', 'canceled'].includes(result.status)) {
          attempts++
          await new Promise(resolve => setTimeout(resolve, 2000))
          continue
        }
        
        if (result.file_id && result.url) {
          return result
        }
        
        throw new Error('Unexpected archive status response')
        
      } catch (error: any) {
        if (error.status === 202) {
          attempts++
          await new Promise(resolve => setTimeout(resolve, 2000))
          continue
        }
        throw error
      }
    }
    
    throw new Error('Archive creation timeout')
  }

  // Clear all results
  const clearResults = () => {
    allResults.value = []
    selectedResults.value = new Set()
    
    const { info } = useNotifications()
    info('All results cleared')
  }

  // Get result by ID
  const getResult = (id: string): ProcessingResult | undefined => {
    return allResults.value.find(result => result.id === id)
  }

  // Remove specific result
  const removeResult = (id: string) => {
    const index = allResults.value.findIndex(result => result.id === id)
    if (index !== -1) {
      allResults.value.splice(index, 1)
      
      // Remove from selection if selected
      const newSelection = new Set(selectedResults.value)
      newSelection.delete(id)
      selectedResults.value = newSelection
    }
  }

  // Get summary statistics
  const getResultsSummary = () => {
    const summary = {
      total: resultsCount.value,
      single: singleResults.value.length,
      batch: batchResults.value.length,
      selected: selectedCount.value,
      hasResults: hasResults.value,
      hasSelection: hasSelection.value
    }
    
    return summary
  }

  return {
    // State (readonly)
    allResults: readonly(allResults),
    selectedResults: readonly(selectedResults),
    
    // Computed
    resultsCount,
    selectedCount,
    hasResults,
    hasSelection,
    allSelected,
    singleResults,
    batchResults,
    
    // Actions - Add Results
    addResult,
    addBatchResults,
    
    // Actions - Selection
    selectResult,
    selectAll,
    clearSelection,
    getSelectedResults,
    
    // Actions - Download
    downloadIndividual,
    downloadSelected,
    
    // Actions - Management
    clearResults,
    getResult,
    removeResult,
    getResultsSummary
  }
}
