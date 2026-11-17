from domain.dto import FileDataDTO
from abc import ABC, abstractmethod
from domain.entities import UniqueizationSettings

class UniqueizerInterface(ABC):
    @abstractmethod
    async def uniqueze(self, file_data: FileDataDTO, settings: UniqueizationSettings) -> FileDataDTO:
        raise NotImplementedError