from application.interfaces.use_cases import GetUploadUrlUseCaseInterface
from domain.interfaces import FileStorageInterface

class GetUploadUrlUseCase(GetUploadUrlUseCaseInterface):
    def __init__(self, file_storage: FileStorageInterface):
        self._file_storage = file_storage

    async def execute(self, storage_path: str) -> str:
        return await self._file_storage.get_upload_url(storage_path=storage_path)