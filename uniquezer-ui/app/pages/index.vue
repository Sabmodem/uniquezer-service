<template>
  <div>
    <v-row>
      <v-col cols="12">
        <!-- Hero Section -->
        <v-card
          class="mb-6"
          elevation="0"
          color="transparent"
        >
          <v-card-text class="text-center py-8">
            <v-icon
              size="80"
              color="primary"
              class="mb-4"
            >
              mdi-image-filter-vintage
            </v-icon>
            <h1 class="text-h3 font-weight-bold mb-4 text-primary">
              Photo Uniqueizer
            </h1>
            <p class="text-h6 text-grey-darken-1 mb-6 mx-auto" style="max-width: 600px;">
              Transform your images with advanced processing techniques. 
              Perfect for creating unique variations that bypass detection algorithms.
            </p>
          </v-card-text>
        </v-card>

        <!-- Quick Start Guide -->
        <v-card 
          class="mb-6"
          color="transparent"
          elevation="0"
        >
          <v-card-title align="center">
            <v-icon>mdi-rocket-launch-outline</v-icon>
            How It Works
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="3" class="text-center">
                <v-avatar color="primary" size="60" class="mb-3">
                  <v-icon color="white">mdi-upload</v-icon>
                </v-avatar>
                <h3 class="mb-2">1. Upload</h3>
                <p class="text-body-2">Upload your image</p>
              </v-col>
              <v-col cols="12" md="3" class="text-center">
                <v-avatar color="secondary" size="60" class="mb-3">
                  <v-icon color="white">mdi-cog</v-icon>
                </v-avatar>
                <h3 class="mb-2">2. Configure</h3>
                <p class="text-body-2">Choose transformation settings</p>
              </v-col>
              <v-col cols="12" md="3" class="text-center">
                <v-avatar color="accent" size="60" class="mb-3">
                  <v-icon color="white">mdi-play-circle</v-icon>
                </v-avatar>
                <h3 class="mb-2">3. Process</h3>
                <p class="text-body-2">Generate unique variations</p>
              </v-col>
              <v-col cols="12" md="3" class="text-center">
                <v-avatar color="success" size="60" class="mb-3">
                  <v-icon color="white">mdi-download</v-icon>
                </v-avatar>
                <h3 class="mb-2">4. Download</h3>
                <p class="text-body-2">Get your processed images</p>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Start Button -->
        <div class="text-center">
          <v-btn
            color="primary"
            size="x-large"
            elevation="2"
            to="/process"
          >
            <v-icon left>mdi-image-plus</v-icon>
            Start Processing Images
          </v-btn>
        </div>

        <!-- Features Preview -->
        <v-card
          class="mt-6"
          color="transparent"
          elevation="0"
        >
          <v-card-title align="center">
            <v-icon>mdi-feature-search</v-icon>
            Key Features
          </v-card-title>
          <v-card-text class="mt-5">
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <div class="d-flex align-center justify-center mb-3">
                  <v-icon color="primary" class="mr-3">mdi-file-multiple</v-icon>
                  <div>
                    <h4>Batch Processing</h4>
                    <p class="text-body-2 mb-0">Process multiple variations at once</p>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <div class="d-flex align-center justify-center mb-3">
                  <v-icon color="secondary" class="mr-3">mdi-palette</v-icon>
                  <div>
                    <h4>Rich Transformations</h4>
                    <p class="text-body-2 mb-0">Rotate, resize, enhance, and more</p>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <div class="d-flex align-center justify-center mb-3">
                  <v-icon color="accent" class="mr-3">mdi-content-save-outline</v-icon>
                  <div>
                    <h4>Save Presets</h4>
                    <p class="text-body-2 mb-0">Save and reuse your favorite settings</p>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <div class="d-flex align-center justify-center mb-3">
                  <v-icon color="success" class="mr-3">mdi-cellphone</v-icon>
                  <div>
                    <h4>Mobile Friendly</h4>
                    <p class="text-body-2 mb-0">Works perfectly on all devices</p>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <div class="d-flex align-center justify-center mb-3">
                  <v-icon color="warning" class="mr-3">mdi-progress-clock</v-icon>
                  <div>
                    <h4>Progress Tracking</h4>
                    <p class="text-body-2 mb-0">Real-time processing updates</p>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <div class="d-flex align-center justify-center mb-3">
                  <v-icon color="info" class="mr-3">mdi-cloud-download-outline</v-icon>
                  <div>
                    <h4>Easy Downloads</h4>
                    <p class="text-body-2 mb-0">Individual or batch download options</p>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
// Set page title
useHead({
  title: 'Photo Uniqueizer - Make images unique',
  meta: [
    {
      name: 'description',
      content: 'Transform your images with advanced processing techniques. Create unique variations perfect for social media and content creation.'
    }
  ]
})
</script>