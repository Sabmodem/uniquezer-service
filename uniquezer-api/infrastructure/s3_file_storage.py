import aiobotocore.session
from botocore.exceptions import ClientError
from io import BytesIO
from botocore.config import Config
from domain.interfaces import FileStorageInterface
from domain.dto import FileDataDTO, StorageFileDTO

class S3FileStorage(FileStorageInterface):
    """S3-compatible file storage implementation using aiobotocore (works with AWS S3, MinIO, etc.)"""
    def __init__(
        self,
        bucket_name: str,
        access_key: str,
        secret_key: str,
        internal_endpoint_url: str,  # For MinIO or other S3-compatible
        public_endpoint_url: str,  # For MinIO or other S3-compatible
        region: str = "us-east-1"
    ):
        self.bucket_name = bucket_name
        self.access_key = access_key
        self.secret_key = secret_key
        self.internal_endpoint_url = internal_endpoint_url
        self.public_endpoint_url = public_endpoint_url
        self.region = region

        self.session = aiobotocore.session.get_session()

    @property
    def _config(self):
        return Config(
            signature_version='s3v4',
            s3={'payload_signing_enabled': False, 'addressing_style': 'path'},
        )

    async def _get_client(self):
        """Get S3 client context manager"""
        return self.session.create_client(
            's3',
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            endpoint_url=self.internal_endpoint_url,
            region_name=self.region,
            config=self._config
        )
    
    async def _get_client_for_presigned_urls(self):
        session = aiobotocore.session.get_session()
        return session.create_client(
            's3',
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            endpoint_url=self.public_endpoint_url,
            region_name=self.region,
            config=self._config
        )        

    async def _ensure_bucket_exists(self):
        """Ensure the bucket exists, create if it doesn't"""
        async with self._get_client() as s3_client:
            try:
                await s3_client.head_bucket(Bucket=self.bucket_name)
            except ClientError as e:
                error_code = e.response['Error']['Code']
                if error_code == '404':
                    # Bucket doesn't exist, create it
                    await s3_client.create_bucket(Bucket=self.bucket_name)
                else:
                    raise

    async def upload_file(
        self,
        storage_path: str,
        file_data: FileDataDTO
    ) -> str:
        """Upload file to S3 and return storage path"""        
        async with await self._get_client() as s3_client:
            await s3_client.put_object(
                Bucket=self.bucket_name,
                Key=storage_path,
                Body=file_data.content.read() ,
                ContentType=file_data.mime,
                ChecksumAlgorithm='sha256'
            )
            
            return storage_path

    async def download_file(self, storage_path: str) -> FileDataDTO:
        """Download file from S3"""
        async with await self._get_client() as s3_client:
            response = await s3_client.get_object(Bucket=self.bucket_name, Key=storage_path)
            body = await response['Body'].read()
            mime = response['ContentType']
            return FileDataDTO(content=BytesIO(body), mime=mime) 

    async def delete_file(self, storage_path: str) -> bool:
        """Delete file from S3"""
        async with await self._get_client() as s3_client:
            try:
                await s3_client.delete_object(Bucket=self.bucket_name, Key=storage_path)
                return True
            except ClientError:
                return False

    async def get_file_url(self, storage_path: str, expires_in: int = 3600) -> str:
        """Generate presigned URL for file access"""
        async with await self._get_client_for_presigned_urls() as s3_client:
            return await s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': storage_path},
                ExpiresIn=expires_in
            )

    async def get_upload_url(self, storage_path: str, expires_in: int = 3600) -> str:
        """Generate presigned URL for file access"""
        async with await self._get_client_for_presigned_urls() as s3_client:
            return await s3_client.generate_presigned_url(
                'put_object',
                Params={'Bucket': self.bucket_name, 'Key': storage_path},
                ExpiresIn=expires_in
            )

    async def file_exists(self, storage_path: str) -> bool:
        """Check if file exists in S3"""
        async with await self._get_client() as s3_client:
            try:
                await s3_client.head_object(Bucket=self.bucket_name, Key=storage_path)
                return True
            except ClientError as e:
                if e.response['Error']['Code'] == '404':
                    return False
                raise