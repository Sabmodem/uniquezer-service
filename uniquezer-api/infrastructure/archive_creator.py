from domain.interfaces import FileStorageInterface, ArchiveCreatorInterface
import tempfile, zipfile, os, uuid
from typing import List
from domain.dto import StorageFileDTO, FileDataDTO
import logging
import mimetypes

class ArchiveCreator(ArchiveCreatorInterface):
    def __init__(self, file_storage: FileStorageInterface, logger: logging.Logger):
        self._file_storage = file_storage
        self._logger = logger

    async def create_archive(self, storage_pats_to_archive: List[str]) -> StorageFileDTO:
        try:
            self._logger.info(f'ARCHIVING: {(", ").join(storage_pats_to_archive)}')
            with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as temp_zip:
                temp_zip_path = temp_zip.name

            with zipfile.ZipFile(temp_zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                for storage_path in storage_pats_to_archive:
                    try:
                        self._logger.info(f'ADDING TO ARCHIVE: {storage_path}')
                        file_data = await self._file_storage.download_file(storage_path)
                        filename = storage_path + mimetypes.guess_extension(file_data.mime)
                        zip_file.writestr(filename, file_data.content.read())

                    except Exception as e:
                        self._logger.warning(f"WARNING: FAILED TO DOWNLOAD {storage_path}: {e}", exc_info=True)
                        continue

            self._logger.info(f'UPLOADING THE ARCHIVE: {temp_zip_path}')
            with open(temp_zip_path, 'rb') as zip_data:
                archive_storage_path = await self._file_storage.upload_file(
                    storage_path=str(uuid.uuid4()),
                    file_data=FileDataDTO(
                        mime='application/zip',
                        content=zip_data
                    )
                )
                self._logger.info(f'GETTING THE URL: {temp_zip_path}')
                url = await self._file_storage.get_file_url(archive_storage_path)
            os.unlink(temp_zip_path)
            return StorageFileDTO(storage_path=archive_storage_path, url=url)

        except Exception as e:
            self._logger.error(f'ARCHIVING FAILED: {str(e)}', exc_info=True)
            if 'temp_zip_path' in locals() and os.path.exists(temp_zip_path):
                os.unlink(temp_zip_path)
            raise Exception(f"ARCHIVE CREATION FAILED: {str(e)}")