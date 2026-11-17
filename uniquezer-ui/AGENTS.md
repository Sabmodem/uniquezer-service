# Agent Instructions

## Setup & Commands

```bash
npm install         # Installs dependencies, runs `nuxt prepare`
npm run dev         # Start dev server on http://localhost:3000
npm run build       # Build for production
npm run typecheck   # TypeScript check via nuxt typecheck
```

## Architecture

**Nuxt 4.x + Vuetify 3 SSR app** (Photo Uniqueizer UI)

- `app/` - Application source
  - `pages/` - Nuxt pages (index, process, docs)
  - `components/` - Vue components
  - `composables/` - Vue composables (API, image processing, batch ops)
  - `utils/` - Helpers
  - `layouts/` - Layout templates
  - `plugins/` - Vuetify plugin
  - `types/index.ts` - TypeScript types
- `.nuxt/` - Generated Nuxt files (do not edit)
- `nuxt.config.ts` - Nuxt configuration
- `vuetify.config.ts` - Vuetify configuration

## Key Conventions

- **TypeScript**: Strict mode via `nuxt typecheck`
- **SSR**: Server-side rendering enabled (`ssr: true`)
- **Vuetify**: Configured for SSR with custom styles
- **Analytics**: Google Analytics and Yandex Metrika (env vars: `NUXT_PUBLIC_GTAG_ID`, `NUXT_PUBLIC_YANDEX_METRIKA_ID`)
- **Deploy**: Docker build push via CI (main branch only)

## Docker

CI builds and pushes to GHCR. Required secrets in CI:
- `NUXT_PUBLIC_GTAG_ID`, `NUXT_PUBLIC_YANDEX_METRIKA_ID`
- `NODE_ENV`
