# Uniquezer API

An S3-compatible backend for image uniqueization using Clean Architecture principles.

## Features

- Presigned URLs for secure file uploads
- Asynchronous image transformations via RQ job queue
- S3-compatible storage (AWS S3, MinIO)
- Image operations: crop, resize, rotate, transpose, transform, convert, enhance, filters, pixel noise
- Archive creation from multiple files

## Architecture

```
domain/          # Entities, DTOs, interfaces (pure business logic)
application/     # Use cases (orchestration)
infrastructure/  # S3 storage, photo uniquezer, archive creator
presentation/    # FastAPI web layer, jobs, config
```

## Dependencies

- **Runtime**: FastAPI, uvicorn, RQ, Redis, aiobotocore (S3), Pillow
- **Required services**: Redis (job queue), S3-compatible storage (MinIO)

## Setup

### Environment Variables

```bash
# S3 Configuration
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_NAME=mytestbucket
S3_INTERNAL_ENDPOINT_URL=http://minio:9000
S3_PUBLIC_ENDPOINT_URL=http://localhost:9000

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
```

Defaults are configured in `presentation/config.py` for local development.

### Running

```bash
# Start dev server
uvicorn presentation.web.app:app --reload --host 0.0.0.0 --port 8000

# Run with docker
docker build -t uniquezer-api .
docker run -p 8000:8000 uniquezer-api
```

### Manual Testing

```bash
# Run integration test (requires Redis + S3)
python -m presentation.test.main
```

## API Endpoints

### `GET /uploading_data`
Get presigned URL for file upload.

**Response:**
```json
{
  "file_id": "uuid",
  "url": "https://s3.example.com/upload-url"
}
```

### `POST /uniqueze`
Enqueue image uniqueze job.

**Request:**
```json
{
  "file_id": "uuid",
  "settings": {
    "settings": [
      {
        "type": "crop",
        "left": 10,
        "top": 10,
        "right": 100,
        "bottom": 100
      },
      {
        "type": "resize",
        "width": 800,
        "height": 600
      }
    ]
  }
}
```

**Response:**
```json
{
  "job_id": "job-uuid"
}
```

### `POST /archive`
Enqueue archive creation job.

**Request:**
```json
{
  "file_ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response:**
```json
{
  "job_id": "job-uuid"
}
```

### `GET /jobs/status/{job_id}`
Check job status and retrieve result.

**Response (completed):**
```json
{
  "file_id": "uuid",
  "url": "https://s3.example.com/result-url",
  "status": "finished"
}
```

**Response (processing):**
```json
{
  "status": "started"
}
```

**Response (failed):**
```json
{
  "status": "failed"
}
```

## Image Operations

Available operations in `domain/entities.py`:

- **Crop**: Extract region from image
- **Resize**: Scale image with resampling
- **Rotate**: Rotate with optional blurred background
- **Transpose**: Flip/mirror image
- **Transform**: Perspective/affine transform
- **Convert**: Color mode conversion (RGB, CMYK, etc.)
- **Enhance**: Brightness, contrast, sharpness, color
- **SimpleFilter**: Blur, contour, edge detection, emboss, etc.
- **PixelNoise**: Random pixel color modification

## Job Flow

1. Client calls `/uploading_data` to get presigned URL
2. Client uploads file to the presigned URL (stored in S3 as `file_id`)
3. Client calls `/uniqueze` with `file_id` and transformation settings
4. Server enqueues job and returns `job_id`
5. Client polls `/jobs/status/{job_id}` until completion
6. On completion, `job.result` contains `StorageFileDTO` with result URL

## Development

### Directory Structure

```
├── domain/
│   ├── dto/          # Data transfer objects
│   ├── entities.py   # Business entities
│   └── interfaces/   # Pure interfaces
├── application/
│   ├── use_cases/    # Business use cases
│   └── interfaces/   # Use case interfaces
├── infrastructure/
│   ├── s3_file_storage.py   # S3 implementation
│   ├── photo_uniquezer.py   # Image processing
│   └── archive_creator.py   # ZIP archive creation
├── presentation/
│   ├── web/
│   │   ├── app.py         # FastAPI application
│   │   ├── jobs.py        # RQ job runners
│   │   ├── schemas.py     # Pydantic schemas
│   │   ├── dependencies.py # Dependency injection
│   │   └── adapters/      # Schema → entity adapters
│   ├── config.py          # Configuration
│   ├── logger.py          # Logging setup
│   └── test/main.py       # Integration tests
└── main.py                 # Application entry point
```

### Image Processing Flow

1. `presentation/web/app.py` receives request with schema
2. `presentation/web/jobs.py` converts schema to entity via adapters
3. `application/use_cases/uniqueze_use_case.py` orchestrates
4. `infrastructure/photo_uniquezer.py` applies operations using type guards
5. Result stored back to S3 via `infrastructure/s3_file_storage.py`

## Testing

Run the manual integration test:

```bash
python -m presentation.test.main
```

This tests the full flow: upload URL generation, uniqueization, and result retrieval.

## CI/CD

GitHub Actions workflow in `.github/workflows/ci.yaml`:
- Builds and pushes Docker image to GHCR on push to `main`
- Uses build caching for faster builds

## License

MIT
