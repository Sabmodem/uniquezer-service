from typing import List
from application.interfaces.use_cases import CreateArchiveUseCaseInterface
from domain.interfaces import FileStorageInterface, ArchiveCreatorInterface
from domain.dto import StorageFileDTO


class CreateArchiveUseCase(CreateArchiveUseCaseInterface):
    def __init__(self, file_storage: FileStorageInterface, archive_creator: ArchiveCreatorInterface):
        self._file_storage = file_storage
        self._archive_creator = archive_creator
    
    async def execute(self, storage_pats_to_archive: List[str]) -> StorageFileDTO:
        return await self._archive_creator.create_archive(storage_pats_to_archive)