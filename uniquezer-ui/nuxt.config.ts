// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  routeRules: {
    '/': { prerender: true },
    '/docs': { prerender: true },
    '/process': { prerender: true },
  },

  site: {
    url: 'https://uniqueizer.com/',
    name: 'Photo Uniqueizer',
  },

  sitemap: {},

  build: {
    transpile: ['vuetify'],
  },

  vite: {
    ssr: {
      noExternal: ['vuetify'],
    },
  },

  features: {
    inlineStyles: false,
    devLogs: false,
  },

  runtimeConfig: {    
    public: {
      isProduction: import.meta.env.NODE_ENV === 'production',
    }
  },

  css: [],
  modules: ['@nuxt/fonts', 'vuetify-nuxt-module', 'nuxt-gtag', 'nuxt-yandex-metrika', '@nuxtjs/sitemap'],

  gtag: {
    enabled: true,
    id: import.meta.env.NUXT_PUBLIC_GTAG_ID 
  },

  yandexMetrika: {
    id: import.meta.env.NUXT_PUBLIC_YANDEX_METRIKA_ID
  },

  vuetify: {
    moduleOptions: {
      ssrClientHints: {
        reloadOnFirstRequest: false,
        viewportSize: false,
        prefersColorScheme: false,
        prefersColorSchemeOptions: {
          useBrowserThemeOnly: false,
        },
      },
      styles: true,
    },
  },
})
