# Uniquezer

**A photo uniqueization service** that removes metadata and creates unique versions of images.

[![Build and Push](https://github.com/sabmodem/uniquezer/actions/workflows/ci.yaml/badge.svg)](https://github.com/sabmodem/uniquezer/actions/workflows/ci.yaml)
[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-lts-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Quick Links
- [API Documentation](./uniquezer-api/README.md)
- [UI Documentation](./uniquezer-ui/README.md)

## Architecture

```
uniquezer/
├── uniquezer-api/      # FastAPI backend service
├── uniquezer-ui/       # Nuxt.js frontend service
└── .github/workflows/  # CI/CD pipeline
```

## Services

### uniquezer-api

FastAPI backend that handles:
- File upload (presigned URLs)
- Photo uniqueization jobs via RQ/Redis
- Archive creation
- S3 storage integration

See [API documentation](./uniquezer-api/README.md) for details.

### uniquezer-ui

Nuxt.js SSR frontend that provides:
- Photo upload interface
- Batch processing
- Result viewing
- Documentation

See [UI documentation](./uniquezer-ui/README.md) for details.

## Local Development

### API Service

```bash
cd uniquezer-api
uvicorn presentation.web.app:app --reload --host 0.0.0.0 --port 8000
```

### UI Service

```bash
cd uniquezer-ui
npm install
npm run dev
```

## Docker

### Build Locally

```bash
# API
docker build -t uniquezer-api:latest ./uniquezer-api

# UI
docker build -t uniquezer-ui:latest ./uniquezer-ui
```

### Run with Docker Compose

```bash
docker-compose up -d
```

## CI/CD

The repository uses GitHub Actions to build and push Docker images to GHCR:

- **Trigger**: Push to `main` branch
- **Images**:
  - `ghcr.io/<owner>/uniquezer-api:latest` and `:{{sha}}`
  - `ghcr.io/<owner>/uniquezer-ui:latest` and `:{{sha}}`
- **Features**:
  - Docker Buildx for multi-platform builds
  - Registry caching for faster builds
  - Parallel job execution

## Environment Variables

### API Service

| Variable | Description |
|----------|-------------|
| `S3_REGION` | AWS S3 region |
| `S3_ACCESS_KEY` | S3 access key |
| `S3_SECRET_KEY` | S3 secret key |
| `S3_BUCKET_NAME` | S3 bucket name |
| `S3_INTERNAL_ENDPOINT_URL` | Internal S3 endpoint |
| `S3_PUBLIC_ENDPOINT_URL` | Public S3 endpoint |
| `REDIS_HOST` | Redis host |
| `REDIS_PORT` | Redis port |

### UI Service

| Variable | Description |
|----------|-------------|
| `NUXT_PUBLIC_API_BASE` | API base URL |
| `NUXT_PUBLIC_CASDOOR_URL` | Casdoor URL |
| `NUXT_PUBLIC_CASDOOR_CLIENT_ID` | Casdoor client ID |
| `NUXT_PUBLIC_CASDOOR_ORG` | Casdoor org |
| `NUXT_PUBLIC_CASDOOR_APP` | Casdoor app |
| `NUXT_PUBLIC_COOKIE_DOMAIN` | Cookie domain |
| `NUXT_PUBLIC_COOKIE_SECURE` | Cookie secure flag |
| `NUXT_PUBLIC_GTAG_ID` | Google Analytics ID |
| `NUXT_PUBLIC_YANDEX_METRIKA_ID` | Yandex Metrika ID |
| `NODE_ENV` | Node environment |

## Requirements

- **Runtime**:
  - API: Python 3.12+, Redis, S3-compatible storage
  - UI: Node.js LTS
- **CI/CD**: GitHub repository with GHCR enabled
