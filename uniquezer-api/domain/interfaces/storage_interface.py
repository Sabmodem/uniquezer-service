from abc import ABC, abstractmethod
from domain.dto import FileDataDTO, StorageFileDTO

class FileStorageInterface(ABC):
    @abstractmethod
    async def upload_file(
        self,
        storage_path: str,
        file_data: FileDataDTO
    ) -> str:
        raise NotImplementedError
    
    @abstractmethod
    async def download_file(self, storage_path: str) -> FileDataDTO:
        raise NotImplementedError
    
    @abstractmethod
    async def delete_file(self, storage_path: str) -> bool:
        raise NotImplementedError
    
    @abstractmethod
    async def get_file_url(self, storage_path: str, expires_in: int = 3600) -> str:
        raise NotImplementedError
    
    @abstractmethod
    async def get_upload_url(self, storage_path: str, expires_in: int = 3600) -> str:
        raise NotImplementedError
    
    @abstractmethod
    async def file_exists(self, storage_path: str) -> bool:
        raise NotImplementedError