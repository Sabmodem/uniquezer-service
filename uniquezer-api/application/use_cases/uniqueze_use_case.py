from application.interfaces.use_cases import UniquezeUseCaseInterface
from domain.interfaces import UniqueizerInterface, FileStorageInterface
from domain.entities import UniqueizationSettings
from domain.dto import StorageFileDTO
import uuid

class UniquezeUseCase(UniquezeUseCaseInterface):
    def __init__(self, uniqueizer: UniqueizerInterface, file_storage: FileStorageInterface):
        self._uniqueizer = uniqueizer
        self._file_storage = file_storage

    async def execute(self, storage_path: str, settings: UniqueizationSettings) -> StorageFileDTO:
        file_data = await self._file_storage.download_file(storage_path)
        uniquezed_file_data = await self._uniqueizer.uniqueze(file_data, settings)
        result_storage_path = await self._file_storage.upload_file(str(uuid.uuid4()), uniquezed_file_data)
        url = await self._file_storage.get_file_url(result_storage_path)
        return StorageFileDTO(storage_path=result_storage_path, url=url)