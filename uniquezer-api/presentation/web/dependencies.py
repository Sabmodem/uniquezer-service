import redis
from presentation import config as config
from infrastructure.s3_file_storage import S3FileStorage
from infrastructure.photo_uniquezer import PhotoUniquezer
from infrastructure.archive_creator import ArchiveCreator
from rq import Queue
from presentation.logger import setup_logger

logger_labels = {
    "job": "uniqueizer_internal",
    "service": "uniqueizer_internal"
}

logger = setup_logger(__name__)
file_storage = S3FileStorage(
    bucket_name=config.S3_BUCKET_NAME,
    access_key=config.S3_ACCESS_KEY,
    secret_key=config.S3_SECRET_KEY,
    internal_endpoint_url=config.S3_INTERNAL_ENDPOINT_URL,
    public_endpoint_url=config.S3_PUBLIC_ENDPOINT_URL,
    region=config.S3_REGION
)
uniquezer = PhotoUniquezer(logger=logger)
archive_creator = ArchiveCreator(file_storage, logger=logger)
redis_conn = redis.Redis(host=config.REDIS_HOST, port=config.REDIS_PORT)
q = Queue(connection=redis_conn)