from abc import ABC, abstractmethod
from domain.entities import UniqueizationSettings
from domain.dto import StorageFileDTO

class UniquezeUseCaseInterface(ABC):
    @abstractmethod
    async def execute(self, storage_path: str, settings: UniqueizationSettings) -> StorageFileDTO:
        raise NotImplementedError