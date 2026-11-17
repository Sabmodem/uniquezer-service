from abc import ABC, abstractmethod
from typing import List
from domain.dto import StorageFileDTO

class CreateArchiveUseCaseInterface(ABC):
    @abstractmethod
    async def execute(self, storage_pats_to_archive: List[str]) -> StorageFileDTO:
        raise NotImplementedError        
