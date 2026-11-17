# AGENTS.md

## Architecture

- **Clean Architecture**: 4-layer structure
  - `domain/`: Entities, DTOs, interfaces (pure business logic)
  - `application/`: Use cases (orchestration)
  - `infrastructure/`: S3 storage, photo uniquezer, archive creator
  - `presentation/`: FastAPI web layer, jobs, config

- **Entry points**:
  - Main: `main.py` (asyncio runs `presentation.web.app.main`)
  - App: `presentation/web/app.py` (FastAPI + RQ queues)
  - Tests: `presentation/test/main.py` (manual integration test)

## Dependencies

- **Runtime**: FastAPI, uvicorn, RQ, Redis, aiobotocore (S3), Pillow
- **External services required**: Redis (job queue), S3-compatible storage (MinIO)

## Running

```bash
# Start dev server
uvicorn presentation.web.app:app --reload --host 0.0.0.0 --port 8000

# Run manual test (requires Redis + S3)
python -m presentation.test.main
```

## Environment variables

- `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET_NAME`
- `S3_INTERNAL_ENDPOINT_URL`, `S3_PUBLIC_ENDPOINT_URL`
- `REDIS_HOST`, `REDIS_PORT`

Defaults in `presentation/config.py` assume MinIO + local Redis.

## API endpoints

- `GET /uploading_data` - Get presigned URL for file upload
- `POST /uniqueze` - Enqueue uniqueze job (returns `job_id`)
- `POST /archive` - Enqueue archive job (returns `job_id`)
- `GET /jobs/status/{job_id}` - Check job status/result

## Job flow

1. Upload file to presigned URL (stored in S3 as file_id)
2. Enqueue `uniqueze` job with settings (returns `job_id`)
3. Poll `/jobs/status/{job_id}` for completion
4. On finish, `job.result` contains `StorageFileDTO` with result URL

## Image operations (UniqueizationSettings)

Defined in `domain/entities.py`:
- `Crop`, `Resize`, `Rotate`, `Transpose`
- `Transform`, `Convert`
- `Enhance` (brightness, contrast, sharpness, color)
- `SimpleFilter` (blur, contour, edge, emboss, etc.)
- `PixelNoise`

Adapters in `presentation/web/adapters/` convert schemas → entities.

## Key conventions

- RQ jobs store `StorageFileDTO` as result
- Jobs are synchronous (no `async` in `jobs.py`)
- Logger: `presentation/logger.py` configured via `setup_logger(__name__)`
- PhotoUniquezer uses type guards (`is_crop`, `is_resize`, etc.) for pattern matching
