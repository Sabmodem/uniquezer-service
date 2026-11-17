import uuid, pydantic, abc
from typing import List, Literal, Union, Annotated, Optional, Tuple, Sequence, Any
from domain.entities import (
    Resampling, 
    UniqueizationType, 
    EnhanceMethod, 
    SimpleFilterMethod
)

# We need to import the PIL enums as well to use their members for default values/validation if needed
from PIL.Image import Transform, Transpose, Dither, Palette 
from rq.job import JobStatus

# --- Image Operation Schemas (Updated) ---

class ImageOperationSchema(pydantic.BaseModel, abc.ABC):
    """Base schema for all image transformations in the presentation layer."""
    type: UniqueizationType

class CropSchema(ImageOperationSchema):
    left: int
    top: int
    right: int
    bottom: int
    type: Literal[UniqueizationType.CROP] = UniqueizationType.CROP

class ResizeSchema(ImageOperationSchema):
    width: int
    height: int
    resample: Resampling = Resampling.NEAREST
    type: Literal[UniqueizationType.RESIZE] = UniqueizationType.RESIZE

class RotateSchema(ImageOperationSchema):
    angle: float
    expand: bool = False
    fillcolor: Optional[Tuple[int, int, int]] = None
    fill_with_average_color: bool = False
    blurred_background: bool = False
    blurred_background_blur_radius: int = 10
    center: Optional[Tuple[int, int]] = None
    resample: Resampling = Resampling.NEAREST
    type: Literal[UniqueizationType.ROTATE] = UniqueizationType.ROTATE

# --- New Operation Schemas ---

class TransposeOperationSchema(ImageOperationSchema):
    transpose: Transpose
    type: Literal[UniqueizationType.TRANSPOSE] = UniqueizationType.TRANSPOSE

class TransformOperationSchema(ImageOperationSchema):
    method: Transform
    data: Tuple[Any, ...]
    resample: Resampling = Resampling.NEAREST
    fillcolor: Optional[Tuple[int, int, int]] = None
    type: Literal[UniqueizationType.TRANSFORM] = UniqueizationType.TRANSFORM

class ConvertOperationSchema(ImageOperationSchema):
    mode: Optional[str] = None
    matrix: Optional[Tuple[float, ...]] = None
    dither: Optional[Dither] = None,
    palette: str = Palette.WEB
    colors: int = 256
    type: Literal[UniqueizationType.CONVERT] = UniqueizationType.CONVERT

class EnhanceOperationSchema(ImageOperationSchema):
    method: EnhanceMethod
    factor: float
    type: Literal[UniqueizationType.ENHANCE] = UniqueizationType.ENHANCE

class SimpleFilterOperationSchema(ImageOperationSchema):
    method: SimpleFilterMethod
    type: Literal[UniqueizationType.SIMPLE_FILTER] = UniqueizationType.SIMPLE_FILTER

class PixelNoiseOperationSchema(ImageOperationSchema):
    pixels_min: int
    pixels_max: int
    type: Literal[UniqueizationType.PIXEL_NOISE] = UniqueizationType.PIXEL_NOISE

# --- Updated Union and Settings Model ---

ImageOperationUnion = Annotated[
    Union[
        RotateSchema, 
        CropSchema, 
        ResizeSchema,
        TransposeOperationSchema,
        TransformOperationSchema,
        ConvertOperationSchema,
        EnhanceOperationSchema,
        SimpleFilterOperationSchema,
        PixelNoiseOperationSchema
    ],
    pydantic.Field(discriminator='type')
]

class UniqueizationSettings(pydantic.BaseModel):
    """
    Settings model using the base ImageOperationSchema for a clean list type.
    """
    settings: List[ImageOperationUnion]

# --- Presentation Layer Schemas (Unchanged) ---

class UploadingStartData(pydantic.BaseModel):
    file_id: uuid.UUID
    url: str

class EnqueueArchiveData(pydantic.BaseModel):
    file_ids: Sequence[str]

class EnqueueFileDataResult(pydantic.BaseModel):
    job_id: str

class FileDataResult(pydantic.BaseModel):
    file_id: Optional[uuid.UUID] = None
    url: Optional[str] = None
    status: Optional[JobStatus] = None