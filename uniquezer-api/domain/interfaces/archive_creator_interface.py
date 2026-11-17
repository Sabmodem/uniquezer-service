from domain.dto import StorageFileDTO
from abc import ABC, abstractmethod
from typing import List

class ArchiveCreatorInterface(ABC):
    @abstractmethod
    async def create_archive(self, storage_pats_to_archive: List[str]) -> StorageFileDTO:
        raise NotImplementedError