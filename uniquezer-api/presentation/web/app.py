from fastapi import FastAPI, HTTPException, Body, Response, status
import uuid
import presentation.web.schemas as schemas
from application.use_cases import GetUploadUrlUseCase
from rq.job import Job
from .dependencies import file_storage, q, redis_conn, logger
from .jobs import uniqueze_job_runner, create_archive_job_runner
from domain.dto import StorageFileDTO

app = FastAPI()

@app.get("/uploading_data", response_model=schemas.UploadingStartData)
async def get_uploading_data():
    file_id = uuid.uuid4()
    url = await GetUploadUrlUseCase(file_storage=file_storage).execute(str(file_id))
    return schemas.UploadingStartData(file_id=file_id, url=url)

@app.post("/uniqueze", response_model=schemas.EnqueueFileDataResult)
async def uniqueze(
    settings: schemas.UniqueizationSettings,
    file_id: str = Body(..., alias="file_id")
):
    settings_dict = settings.model_dump()
    job = q.enqueue(uniqueze_job_runner, file_id, settings_dict)    
    return schemas.EnqueueFileDataResult(job_id=job.id)

@app.post('/archive', response_model=schemas.EnqueueFileDataResult)
async def archive(
    # file_ids: list[str] = Body(..., alias="file_ids")
    data: schemas.EnqueueArchiveData
):
    job = q.enqueue(create_archive_job_runner, data.file_ids)    
    return schemas.EnqueueFileDataResult(job_id=job.id)

@app.get("/jobs/status/{job_id}", response_model=schemas.FileDataResult)
async def uniqueze_status(job_id: str, response: Response):
    try:
        job = Job.fetch(job_id, connection=redis_conn)
    except Exception:
        raise HTTPException(status_code=404, detail=f"Job with ID '{job_id}' not found.")

    if job.is_finished:
        job_result: StorageFileDTO = job.result
        return schemas.FileDataResult(url=job_result.url, file_id=job_result.storage_path, status=job.get_status())
    
    elif job.is_failed:
        return schemas.FileDataResult(status=job.get_status())


    else:
        response.status_code = status.HTTP_202_ACCEPTED
        return schemas.FileDataResult(status=job.get_status())

def main():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    main()