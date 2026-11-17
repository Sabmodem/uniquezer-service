import os

S3_REGION = os.getenv("S3_REGION", 'us-east-1')
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", 'minioadmin')
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", 'minioadmin')
S3_INTERNAL_ENDPOINT_URL = os.getenv("S3_INTERNAL_ENDPOINT_URL", 'http://minio:9000')
S3_PUBLIC_ENDPOINT_URL = os.getenv("S3_PUBLIC_ENDPOINT_URL", 'http://localhost:9000')
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", 'mytestbucket')
S3_PRESIGNED_URL_EXPIRY_SECONDS = 3600  # 1 hour

REDIS_HOST = os.getenv("REDIS_HOST", 'redis')
REDIS_PORT = os.getenv("REDIS_PORT", 6379)