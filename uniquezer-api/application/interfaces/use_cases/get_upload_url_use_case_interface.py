from abc import ABC, abstractmethod

class GetUploadUrlUseCaseInterface(ABC):
    @abstractmethod
    async def execute(self, storage_path: str) -> str:
        raise NotImplementedError