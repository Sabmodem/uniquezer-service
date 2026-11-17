export const useApi = () => {
  // Helper for API error handling with better FastAPI validation error parsing
  const handleApiError = (error: any, context: string) => {
    console.error(`API Error (${context}):`, error)
    
    // Extract meaningful error message
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

  // Get upload URL and file ID
  const getUploadData = async () => {
    try {
      const response = await $fetch<{
        file_id: string
        url: string
      }>('/api/uploading_data')
      
      console.log('Upload data received:', { fileId: response.file_id })
      return response
    } catch (error) {
      throw handleApiError(error, 'getting upload data')
    }
  }

  // Upload file to presigned URL (this goes directly to S3, not through nginx)
  const uploadFile = async (file: File, uploadUrl: string) => {
    try {
      console.log(`Uploading file: ${file.name} (${file.size} bytes)`)
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
      }

      console.log('File uploaded successfully')
      return true
    } catch (error) {
      throw handleApiError(error, 'uploading file')
    }
  }

  // Submit uniquization job
  const uniqueizeImage = async (fileId: string, settings: any) => {
    try {
      console.log(`Submitting uniquization job for file: ${fileId}`)
      console.log('Settings being sent:', JSON.stringify(settings, null, 2))
      
      const response = await $fetch<{
        job_id: string
      }>('/api/uniqueze', {
        method: 'POST',
        body: {
          file_id: fileId,
          settings: settings
        }
      })
      
      console.log(`Job submitted successfully: ${response.job_id}`)
      return response
    } catch (error) {
      console.error('Uniquization API error details:', error)
      throw handleApiError(error, 'submitting uniquization job')
    }
  }

  // Check job status (unified endpoint for both uniquize and archive jobs)
  const checkJobStatus = async (jobId: string) => {
    try {
      const response = await $fetch<{
        file_id: string
        url: string,
        status: string
      }>(`/api/jobs/status/${jobId}`) // Updated endpoint
      
      console.log(`Job ${jobId} has status`, response.status)
      return response
    } catch (error) {      
      throw handleApiError(error, `checking job status for ${jobId}`)
    }
  }

  // Create archive from file IDs (updated to match backend)
  const createArchive = async (fileIds: string[]) => {
    try {
      console.log(`Creating archive with ${fileIds.length} files`)
      console.log('File IDs:', fileIds)
      
      const response = await $fetch<{
        job_id: string
      }>('/api/archive', { // Updated endpoint
        method: 'POST',
        body: {
          file_ids: fileIds // Updated field name
        }
      })
      
      console.log(`Archive job created: ${response.job_id}`)
      return response
    } catch (error) {
      throw handleApiError(error, 'creating archive')
    }
  }

  // Check archive status (uses unified job status endpoint)
  const checkArchiveStatus = async (archiveJobId: string) => {
    // Archive status is handled by the same unified endpoint
    return await checkJobStatus(archiveJobId)
  }

  // Health check for API connectivity
  const healthCheck = async () => {
    try {
      // Try a simple endpoint to check if API is reachable
      await $fetch('/api/uploading_data')
      return true
    } catch (error) {
      console.warn('API health check failed:', error)
      return false
    }
  }

  return {
    getUploadData,
    uploadFile,
    uniqueizeImage,
    checkJobStatus,
    createArchive,
    checkArchiveStatus,
    healthCheck
  }
}
