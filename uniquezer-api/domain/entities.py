from dataclasses import dataclass, field
from typing import List, Tuple, Any
from enum import StrEnum
import abc
from PIL.Image import Resampling, Transform, Transpose, Dither, Palette

class UniqueizationType(StrEnum):
    ROTATE = "rotate"
    CROP = "crop"
    RESIZE = "resize"
    TRANSFORM = "transform"
    TRANSPOSE = "transpose"
    CONVERT = "convert"
    ENHANCE  = "enhance"
    SIMPLE_FILTER = "simple_filter"
    PIXEL_NOISE = "pixel_noise"

class EnhanceMethod(StrEnum):
    BRIGHTNESS = "brightness"
    CONTRAST = "contrast"
    SHARPNESS = "sharpness"
    COLOR = "color"

class SimpleFilterMethod(StrEnum):
    BLUR = "Blur"
    CONTOUR = "Contour"
    DETAIL = "Detail"
    EDGE_ENHANCE = "Edge-enhancement"
    EDGE_ENHANCE_MORE = "Edge-enhancement More"
    EMBOSS = "Emboss"
    FIND_EDGES = "Find Edges"
    SHARPEN = "Sharpen"
    SMOOTH = "Smooth"
    SMOOTH_MORE = "Smooth More"

# --- New Base Class ---
@dataclass
class ImageOperation(abc.ABC):
    """Base class for all image transformations."""
    type: UniqueizationType

@dataclass
class Rotate(ImageOperation): # Inherits from ImageOperation
    angle: float
    expand: bool = False
    fillcolor: Tuple[int, int, int] | None = None
    fill_with_average_color: bool = False
    blurred_background: bool = False
    blurred_background_blur_radius: int = 10
    center: Tuple[int, int] | None = None
    type: UniqueizationType = field(default=UniqueizationType.ROTATE, init=False)
    resample: Resampling = Resampling.NEAREST # Use a default for cleaner init

@dataclass
class Crop(ImageOperation): # Inherits from ImageOperation
    left: int
    top: int
    right: int
    bottom: int
    type: UniqueizationType = field(default=UniqueizationType.CROP, init=False)

@dataclass
class Resize(ImageOperation): # Inherits from ImageOperation
    width: int
    height: int
    type: UniqueizationType = field(default=UniqueizationType.RESIZE, init=False)
    resample: Resampling = Resampling.NEAREST

@dataclass
class TransposeOperation(ImageOperation): # Inherits from ImageOperation
    type: UniqueizationType = field(default=UniqueizationType.TRANSPOSE, init=False)
    transpose: Transpose

@dataclass
class TransformOperation(ImageOperation): # Inherits from ImageOperation
    type: UniqueizationType = field(default=UniqueizationType.TRANSFORM, init=False)
    method: Transform
    data: Tuple[Any]
    resample: Resampling = Resampling.NEAREST
    fillcolor: Tuple[int, int, int] | None = None

@dataclass
class ConvertOperation(ImageOperation): # Inherits from ImageOperation
    type: UniqueizationType = field(default=UniqueizationType.CONVERT, init=False)
    mode: str | None = None
    matrix: tuple[float, ...] | None = None,
    dither: Dither | None = None,
    palette: Palette = Palette.WEB,
    colors: int = 256,

@dataclass
class EnhanceOperation(ImageOperation): # Inherits from ImageOperation
    type: UniqueizationType = field(default=UniqueizationType.ENHANCE, init=False)
    method: EnhanceMethod
    factor: float

@dataclass
class SimpleFilterOperation(ImageOperation): # Inherits from ImageOperation
    type: UniqueizationType = field(default=UniqueizationType.SIMPLE_FILTER, init=False)
    method: SimpleFilterMethod

@dataclass
class PixelNoiseOperation(ImageOperation): # Inherits from ImageOperation
    type: UniqueizationType = field(default=UniqueizationType.PIXEL_NOISE, init=False)
    pixels_min: int
    pixels_max: int

@dataclass
class UniqueizationSettings:
    """
    Holds a sequence of image transformations applied for 'uniqueization'.
    """
    settings: List[ImageOperation]