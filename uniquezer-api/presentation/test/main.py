from application.use_cases import GetUploadUrlUseCase, UniquezeUseCase
from infrastructure.s3_file_storage import S3FileStorage
from infrastructure.photo_uniquezer import PhotoUniquezer
from presentation import config
from domain.entities import UniqueizationSettings, Crop
import uuid

async def main():
    file_storage = S3FileStorage(
        bucket_name=config.BUCKET_NAME,
        access_key=config.ACCESS_KEY,
        secret_key=config.SECRET_KEY,
        endpoint_url=config.ENDPOINT_URL,
        region=config.REGION
    )

    file_id = str(uuid.uuid4())
    print(file_id)

    photo_uniquezer = PhotoUniquezer()
    get_upload_url_use_case = GetUploadUrlUseCase(file_storage)
    upload_url = await get_upload_url_use_case.execute(file_id)
    print(upload_url)

    uniqueze_use_case = UniquezeUseCase(photo_uniquezer, file_storage)
    result_url = await uniqueze_use_case.execute('b9788ebf-6b9a-42be-9b79-743cff7fce46', UniqueizationSettings([Crop(10, 10, 10, 10)]))
    print(result_url)


# summary flow:
'''
User sends a request to start flow endpoint, then gets a presigned url and task id. The task id is also file id in minio
User uploads file to presigned url then minio names it as task id
User sends a request to start uniqueze task endpoint, then gets a job id
User sends a request to get status of uniqueze task endpoint. If the job is finished, then user will receive the result url together with the status info
'''