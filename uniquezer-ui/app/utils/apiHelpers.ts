// Shared API utilities for processing operations
import type { UniqueizationSettings } from '~/types'

/**
 * Enhanced API error handler with FastAPI validation support
 */
export const handleApiError = (error: any, context: string): Error => {
  console.error(`API Error (${context}):`, error)
  
  let message = 'An unexpected error occurred'
  
  if (error?.data?.detail) {
    // Handle FastAPI validation errors (array format)
    if (Array.isArray(error.data.detail)) {
      const validationErrors = error.data.detail
        .map((err: any) => {
          const location = err.loc?.slice(1).join('.') || 'unknown field' // Skip 'body' prefix
          return `${location}: ${err.msg}`
        })
        .join('; ')
      message = `Validation errors: ${validationErrors}`
    } else {
      // Single error message
      message = error.data.detail
    }
  } else if (error?.message) {
    message = error.message
  } else if (typeof error === 'string') {
    message = error
  }

  return new Error(message)
}

/**
 * Job polling with progress updates and notifications
 */
export const pollJobWithProgress = async (
  jobId: string,
  onProgress?: (progress: number) => void,
  maxAttempts: number = 30
): Promise<any> => {
  const { checkJobStatus } = useApi()
  let attempts = 0
  
  while (attempts < maxAttempts) {
    try {
      const result = await checkJobStatus(jobId)
      
      // If result has status 'processing', continue polling
      if (!['finished', 'failed', 'stopped', 'canceled'].includes(result.status)) {
        // Update progress based on polling attempts
        if (onProgress) {
          const progressIncrement = 70 / maxAttempts // From 30% to 100%
          const currentProgress = 30 + (attempts * progressIncrement)
          onProgress(Math.min(currentProgress, 95))
        }
        
        attempts++
        await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
        continue
      }
      
      // Job completed successfully
      if (result.file_id && result.url) {
        if (onProgress) onProgress(100)
        return result
      }
      
      // Unexpected response
      throw new Error('Unexpected job status response')
      
    } catch (error: any) {
      // If it's a 202 status (still processing), continue
      if (error.status === 202) {
        if (onProgress) {
          const progressIncrement = 70 / maxAttempts
          const currentProgress = 30 + (attempts * progressIncrement)
          onProgress(Math.min(currentProgress, 95))
        }
        
        attempts++
        await new Promise(resolve => setTimeout(resolve, 2000))
        continue
      }
      
      // Other errors should be thrown
      throw handleApiError(error, `polling job ${jobId}`)
    }
  }
  
  throw new Error('Processing timeout - job took too long to complete')
}

/**
 * Upload file with progress tracking
 */
export const uploadFileWithProgress = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ file_id: string }> => {
  try {
    const { getUploadData, uploadFile } = useApi()
    
    if (onProgress) onProgress(10)
    
    // Get upload URL and file ID
    const uploadData = await getUploadData()
    if (onProgress) onProgress(30)
    
    // Upload file to presigned URL
    await uploadFile(file, uploadData.url)
    if (onProgress) onProgress(90)
    
    if (onProgress) onProgress(100)
    
    return { file_id: uploadData.file_id }
    
  } catch (error: any) {
    throw handleApiError(error, 'uploading file')
  }
}

/**
 * Process image with job polling and progress updates
 */
export const processImageWithPolling = async (
  fileId: string,
  settings: UniqueizationSettings,
  onProgress?: (progress: number) => void
): Promise<any> => {
  try {
    const { uniqueizeImage } = useApi()
    
    if (onProgress) onProgress(10)
    
    console.log(`Submitting job for file: ${fileId}`)
    console.log('Settings being sent:', JSON.stringify(settings, null, 2))
    
    // Submit uniquization job
    const jobResponse = await uniqueizeImage(fileId, settings)
    if (onProgress) onProgress(30)
    
    console.log(`Job submitted successfully: ${jobResponse.job_id}`)
    
    // Poll for job completion with progress updates
    const result = await pollJobWithProgress(
      jobResponse.job_id,
      onProgress,
      30 // maxAttempts
    )
    
    console.log(`Job ${jobResponse.job_id} completed:`, result)
    return result
    
  } catch (error: any) {
    console.error('Image processing failed:', error)
    throw handleApiError(error, 'processing image')
  }
}

/**
 * Create archive with polling
 */
export const createArchiveWithPolling = async (
  fileIds: string[],
  onProgress?: (progress: number) => void
): Promise<any> => {
  try {
    const { createArchive } = useApi()
    
    if (onProgress) onProgress(10)
    
    console.log(`Creating archive with ${fileIds.length} files`)
    
    // Create archive job
    const archiveResponse = await createArchive(fileIds)
    if (onProgress) onProgress(30)
    
    console.log(`Archive job created: ${archiveResponse.job_id}`)
    
    // Poll for archive completion
    const result = await pollJobWithProgress(
      archiveResponse.job_id,
      onProgress,
      30 // maxAttempts
    )
    
    console.log(`Archive ${archiveResponse.job_id} completed:`, result)
    return result
    
  } catch (error: any) {
    console.error('Archive creation failed:', error)
    throw handleApiError(error, 'creating archive')
  }
}

/**
 * Simple job polling without progress (for batch processing)
 */
export const pollJobQuiet = async (
  jobId: string,
  maxAttempts: number = 30
): Promise<any> => {
  return await pollJobWithProgress(jobId, undefined, maxAttempts)
}

/**
 * Validate settings before processing
 */
export const validateSettings = (settings: UniqueizationSettings): boolean => {
  if (!settings || !Array.isArray(settings.settings)) {
    return false
  }
  
  if (settings.settings.length === 0) {
    return false
  }
  
  // Basic validation - each operation should have a type
  return settings.settings.every(operation => operation.type)
}

/**
 * Get operation count from settings
 */
export const getOperationsCount = (settings: UniqueizationSettings): number => {
  return settings?.settings?.length || 0
}

/**
 * Create settings object from operations array
 */
export const createSettings = (operations: any[]): UniqueizationSettings => {
  return {
    settings: operations
  }
}

/**
 * Download file helper
 */
export const downloadFile = async (url: string, filename?: string): Promise<void> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`)
    }
    
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || `download-${Date.now()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(downloadUrl)
    
  } catch (error: any) {
    throw handleApiError(error, 'downloading file')
  }
}
