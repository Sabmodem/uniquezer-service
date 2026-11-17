from application.use_cases import UniquezeUseCase, CreateArchiveUseCase
from .dependencies import uniquezer, file_storage, archive_creator
import presentation.web.schemas as schemas 
from presentation.web.adapters import UniqueizationSettingsAdapter

def uniqueze_job_runner(file_id: str, settings_dict: dict):
    settings_schema = schemas.UniqueizationSettings(**settings_dict)
    adapter = UniqueizationSettingsAdapter()
    settings_entity = adapter.to_entity(settings_schema)
    use_case = UniquezeUseCase(uniqueizer=uniquezer, file_storage=file_storage)    
    return use_case.execute(file_id, settings_entity)

def create_archive_job_runner(file_ids: list[str]):
    use_case = CreateArchiveUseCase(file_storage=file_storage, archive_creator=archive_creator)
    return use_case.execute(file_ids)