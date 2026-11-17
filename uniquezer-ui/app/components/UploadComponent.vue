<template>
  <v-card class="h-100">
    <v-card-title>
      <v-icon class="mr-3">mdi-upload</v-icon>
      Upload Your Image
    </v-card-title>

    <v-divider></v-divider>

    <!-- Upload Complete State -->
    <div v-if="hasUploadedFile" class="pa-6">
      <v-alert type="success" variant="tonal" class="mb-4">
        <div class="d-flex align-center">
          <div>
            <strong>File uploaded successfully!</strong>
            <div class="text-body-2 mt-1">
              File ID: {{ fileId }}
            </div>
          </div>
        </div>
      </v-alert>

      <v-row align="center">
        <v-col cols="12" sm="4">
          <v-img
            :src="filePreviewUrl"
            aspect-ratio="1"
            cover
            class="rounded elevation-2"
            max-height="200"
          >
            <template #placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular indeterminate></v-progress-circular>
              </div>
            </template>
          </v-img>
        </v-col>
        
        <v-col cols="12" sm="8">
          <div class="file-info">
            <h4 class="text-h6 mb-3">{{ uploadedFile?.name }}</h4>
            
            <v-row dense>
              <v-col cols="6">
                <div class="d-flex align-center mb-2">
                  <v-icon size="small" class="mr-2">mdi-file-outline</v-icon>
                  <span class="text-body-2">{{ formatFileSize(uploadedFile?.size || 0) }}</span>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="d-flex align-center mb-2">
                  <v-icon size="small" class="mr-2">mdi-palette</v-icon>
                  <span class="text-body-2">{{ uploadedFile?.type }}</span>
                </div>
              </v-col>
            </v-row>

            <div class="d-flex ga-2 mt-3">
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-upload"
                @click="resetUpload"
              >
                Upload Different Image
              </v-btn>              
            </div>
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- Upload Interface -->
    <v-card-text v-else>
      <div class="upload-area">
        <!-- Drag & Drop Zone -->
        <div
          ref="dropZone"
          class="drop-zone"
          :class="{
            'drop-zone--active': isDragOver,
            'drop-zone--error': hasError,
            'drop-zone--loading': isUploading
          }"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <!-- Loading State -->
          <div v-if="isUploading" class="text-center">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
              class="mb-4"
            ></v-progress-circular>
            <h3 class="text-h6 mb-2">Uploading...</h3>
            <p class="text-body-2 text-medium-emphasis">{{ selectedFile?.name }}</p>
            
            <v-progress-linear
              :value="uploadProgress"
              height="6"
              rounded
              class="mt-4"
              style="max-width: 300px; margin: 0 auto;"
            >
              <strong>{{ Math.round(uploadProgress) }}%</strong>
            </v-progress-linear>
          </div>
          
          <!-- Error State -->
          <div v-else-if="hasError" class="text-center">
            <v-icon size="80" color="error" class="mb-4">
              mdi-alert-circle
            </v-icon>
            <h3 class="text-h6 mb-2 text-error">Upload Failed</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">{{ errorMessage }}</p>
            <v-btn color="error" variant="outlined" @click="resetError">
              <v-icon class="mr-2">mdi-refresh</v-icon>
              Try Again
            </v-btn>
          </div>
          
          <!-- Default State -->
          <div v-else class="text-center">
            <v-icon
              size="80"
              color="primary"
              class="mb-4"
              :class="{ 'bounce': isDragOver }"
            >
              mdi-cloud-upload
            </v-icon>
            <h3 class="text-h6 mb-2">Drop your image here</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              or click to browse files
            </p>
            <v-btn color="primary" variant="outlined" @click.stop="triggerFileInput">
              <v-icon class="mr-2">mdi-file-image</v-icon>
              Choose File
            </v-btn>
          </div>
        </div>

        <!-- Hidden File Input -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleFileSelect"
        />

        <!-- File Preview (before upload) -->
        <div v-if="selectedFile && !isUploading && !hasError" class="mt-6">
          <v-card variant="outlined">
            <v-card-title class="text-h6">
              <v-icon class="mr-2">mdi-file-image</v-icon>
              Ready to Upload
            </v-card-title>
            <v-card-text>
              <v-row align="center">
                <v-col cols="12" sm="4">
                  <v-img
                    :src="tempPreviewUrl"
                    aspect-ratio="1"
                    cover
                    class="rounded"
                    max-height="150"
                  ></v-img>
                </v-col>
                <v-col cols="12" sm="8">
                  <div class="file-info">
                    <h4 class="text-subtitle-1 mb-2">{{ selectedFile.name }}</h4>
                    <v-row dense class="mb-3">
                      <v-col cols="6">
                        <div class="d-flex align-center">
                          <v-icon size="small" class="mr-1">mdi-file-outline</v-icon>
                          <span class="text-body-2">{{ formatFileSize(selectedFile.size) }}</span>
                        </div>
                      </v-col>
                      <v-col cols="6">
                        <div class="d-flex align-center">
                          <v-icon size="small" class="mr-1">mdi-palette</v-icon>
                          <span class="text-body-2">{{ selectedFile.type }}</span>
                        </div>
                      </v-col>
                    </v-row>
                    
                    <div class="d-flex ga-2">
                      <v-btn
                        color="primary"
                        prepend-icon="mdi-upload"
                        @click="uploadFileHandler"
                        :loading="isUploading"
                      >
                        Upload & Continue
                      </v-btn>
                      <v-btn variant="outlined" @click="resetSelection">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>

        <!-- Guidelines -->
        <v-alert type="info" variant="outlined" class="mt-6">
          <div class="text-body-2">
            <strong>Supported formats:</strong> JPEG, PNG, WebP, GIF<br>
            <strong>Maximum size:</strong> 10MB<br>
            <strong>Recommendation:</strong> Use high-quality images for best results
          </div>
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

// Global state
const {
  uploadedFile,
  fileId,
  hasUploadedFile,
  isUploading,
  uploadProgress,
  clearUploadedFile
} = useImageProcessing()

// API integration
const { uploadFileWithState } = useImageProcessing()

// Local state
const isDragOver = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const selectedFile = ref<File | null>(null)
const tempPreviewUrl = ref<string | null>(null)

// Create preview URL for uploaded file
const filePreviewUrl = computed(() => {
  if (uploadedFile.value) {
    return URL.createObjectURL(uploadedFile.value)
  }
  return null
})

// Template refs
const dropZone = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()

// Methods
const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  isDragOver.value = false
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    handleFileSelection(files[0])
  }
}

const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  
  if (files && files.length > 0) {
    handleFileSelection(files[0])
  }
}

const handleFileSelection = (file: File) => {
  resetError()
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    setError('Please select a valid image file (JPEG, PNG, WebP, or GIF)')
    return
  }
  
  // Validate file size
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    setError('File size must be less than 10MB')
    return
  }
  
  selectedFile.value = file
  
  // Create preview URL
  if (tempPreviewUrl.value) {
    URL.revokeObjectURL(tempPreviewUrl.value)
  }
  tempPreviewUrl.value = URL.createObjectURL(file)
}

const uploadFileHandler = async () => {
  if (!selectedFile.value) return
  
  try {
    await uploadFileWithState(selectedFile.value)
    // State is automatically updated by the API composable
    resetSelection()
  } catch (error) {
    // Error is automatically shown by the API composable
    console.error('Upload failed:', error)
  }
}

const resetUpload = () => {
  clearUploadedFile()
  resetSelection()
  resetError()
}

const resetSelection = () => {
  selectedFile.value = null
  
  if (tempPreviewUrl.value) {
    URL.revokeObjectURL(tempPreviewUrl.value)
    tempPreviewUrl.value = null
  }
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const setError = (message: string) => {
  hasError.value = true
  errorMessage.value = message
}

const resetError = () => {
  hasError.value = false
  errorMessage.value = ''
}

const testApiConnection = async () => {
  const { healthCheck } = useApi()
  try {
    const isHealthy = await healthCheck()
    const { success, error: showError } = useNotifications()
    if (isHealthy) {
      success("API connection successful!")
    } else {
      showError("API is not responding")
    }
  } catch (error: any) {
    const { error: showError } = useNotifications()
    showError("API connection failed: " + error.message)
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Cleanup on unmount
onUnmounted(() => {
  if (tempPreviewUrl.value) {
    URL.revokeObjectURL(tempPreviewUrl.value)
  }
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value)
  }
})
</script>

<style scoped>
.upload-area {
  max-width: 700px;
  margin: 0 auto;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone:hover:not(.drop-zone--loading) {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.drop-zone--active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.1);
  transform: scale(1.02);
}

.drop-zone--error {
  border-color: rgb(var(--v-theme-error));
  background-color: rgba(var(--v-theme-error), 0.05);
}

.drop-zone--loading {
  cursor: not-allowed;
  background-color: rgba(var(--v-theme-surface), 0.05);
}

.bounce {
  animation: bounce 0.6s ease-in-out infinite alternate;
}

@keyframes bounce {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-10px); }
}

@media (max-width: 600px) {
  .drop-zone {
    padding: 40px 15px;
    min-height: 250px;
  }
  
  .upload-area {
    max-width: 100%;
  }
}
</style>
