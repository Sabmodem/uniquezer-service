# Photo Uniqueizer UI

Web interface for transforming images with advanced processing techniques. Built with Nuxt 4.x and Vuetify 3.

## Features

- **Batch Processing** - Process multiple variations at once
- **Rich Transformations** - Rotate, resize, enhance, and more
- **Save Presets** - Save and reuse your favorite settings
- **Mobile Friendly** - Works perfectly on all devices
- **Progress Tracking** - Real-time processing updates
- **Easy Downloads** - Individual or batch download options

## Setup

```bash
npm install  # Installs dependencies, runs `nuxt prepare`
```

## Development

```bash
npm run dev  # Start dev server on http://localhost:3000
```

## Production

```bash
npm run build   # Build for production
npm run preview # Locally preview production build
npm run typecheck # TypeScript check
```

## Environment Variables

Required for production builds:

- `NUXT_PUBLIC_GTAG_ID` - Google Analytics tracking ID
- `NUXT_PUBLIC_YANDEX_METRIKA_ID` - Yandex Metrika counter ID

Set these as build args when building Docker image:

```bash
docker build --build-arg NUXT_PUBLIC_GTAG_ID=YOUR_ID --build-arg NUXT_PUBLIC_YANDEX_METRIKA_ID=YOUR_ID -t uniquezer-ui .
```

## Architecture

- `app/` - Application source
  - `pages/` - Nuxt pages (index, process, docs)
  - `components/` - Vue components
  - `composables/` - API, image processing, batch operations
  - `utils/` - Helpers and defaults
  - `layouts/` - Layout templates
  - `plugins/` - Vuetify configuration
  - `types/` - TypeScript types
- `.nuxt/` - Generated Nuxt files (do not edit)

## API

The UI connects to a backend API at `/api/*`:

- `POST /api/uploading_data` - Get upload URL and file ID
- `PUT <presigned_url>` - Upload file directly to S3
- `POST /api/uniqueze` - Submit uniquization job
- `GET /api/jobs/status/:jobId` - Check job status
- `POST /api/archive` - Create archive from file IDs

## Docker

Build and run:

```bash
docker build -t uniquezer-ui .
docker run -p 8080:8080 uniquezer-ui
```

CI builds and pushes to GitHub Container Registry on main branch push.
