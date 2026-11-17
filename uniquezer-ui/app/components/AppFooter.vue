<template>

      <!-- Footer -->
      <v-footer app>
        <v-container>
          <v-row class="text-center">
            <v-col cols="12" md="4" class="text-md-left hidden-sm-and-down">
              <NuxtLink to="/" class="text-decoration-none text-medium-emphasis font-weight-bold mb-2">Photo Uniqueizer</NuxtLink>
              <!-- <div class="text-caption text-medium-emphasis">
                Transform your images
              </div> -->
            </v-col>
            <v-col cols="12" md="4" class=" hidden-sm-and-down">
              <!-- <div class="text-caption">
                <NuxtLink class="text-decoration-none text-medium-emphasis mr-4">
                  Agreement
                </NuxtLink>
                <NuxtLink class="text-decoration-none text-medium-emphasis mr-4">
                  Docs
                </NuxtLink>
                <NuxtLink class="text-decoration-none text-medium-emphasis">
                  Contacts
                </NuxtLink>
              </div> -->
              <div class="text-caption mt-2">
                <NuxtLink to="https://vkhulled.ru" target="_blank" class="text-decoration-none text-medium-emphasis">
                  POWERED BY VK-HULLED
                </NuxtLink>
              </div>
            </v-col>
            <v-col cols="12" md="4" class="text-md-right">
              <div class="text-caption text-medium-emphasis">
                &copy; {{ new Date().getFullYear() }} Photo Uniqueizer. All rights reserved.
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>
