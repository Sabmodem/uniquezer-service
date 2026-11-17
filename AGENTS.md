# Unified Repository

This repository contains both the API and UI components of Uniquezer.

## Structure

```
├── uniquezer-api/      # FastAPI backend service
├── uniquezer-ui/       # Nuxt.js frontend service
└── .github/workflows/  # CI/CD pipelines
```

## CI/CD

The unified CI pipeline builds and pushes both Docker images to GHCR:
- `uniquezer-api` - FastAPI backend
- `uniquezer-ui` - Nuxt.js frontend

Images are tagged with `latest` and `{{ github.sha }}` on push to main branch.

## Individual Service Documentation

See each service's `AGENTS.md` for specific details:
- [API Service](./uniquezer-api/AGENTS.md)
- [UI Service](./uniquezer-ui/AGENTS.md)
