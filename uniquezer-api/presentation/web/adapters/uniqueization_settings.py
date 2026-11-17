from presentation.web.adapters._base_adapter import BaseAdapter
from domain import entities
from presentation.web import schemas

class UniqueizationSettingsAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(
            schemas.UniqueizationSettings,
            entities.UniqueizationSettings
        )

    def to_entity(self, model: schemas.UniqueizationSettings) -> entities.UniqueizationSettings:
        result = entities.UniqueizationSettings([])
        for operation in model.settings:
            if operation.type == entities.UniqueizationType.CROP:
                from .crop import CropAdapter
                adapter = CropAdapter()
            
            if operation.type == entities.UniqueizationType.RESIZE:
                from .resize import ResizeAdapter
                adapter = ResizeAdapter()

            if operation.type == entities.UniqueizationType.ROTATE:
                from .rotate import RotateAdapter
                adapter = RotateAdapter()

            if operation.type == entities.UniqueizationType.TRANSFORM:
                from .transform import TransformAdapter
                adapter = TransformAdapter()

            if operation.type == entities.UniqueizationType.TRANSPOSE:
                from .transpose import TransposeAdapter
                adapter = TransposeAdapter()

            if operation.type == entities.UniqueizationType.CONVERT:
                from .convert import ConvertAdapter
                adapter = ConvertAdapter()

            if operation.type == entities.UniqueizationType.ENHANCE:
                from .enhance import EnhanceAdapter
                adapter = EnhanceAdapter()

            if operation.type == entities.UniqueizationType.SIMPLE_FILTER:
                from .simple_filter import SimpleFilterAdapter
                adapter = SimpleFilterAdapter()

            if operation.type == entities.UniqueizationType.PIXEL_NOISE:
                from .pixel_noise import PixelNoiseAdapter
                adapter = PixelNoiseAdapter()

            result.settings.append(adapter.to_entity(operation))
        return result

    def to_model(self, entity: entities.UniqueizationSettings) -> schemas.UniqueizationSettings:
        result = schemas.UniqueizationSettings([])
        for operation in entity.settings:
            if operation.type == entities.UniqueizationType.CROP:
                from .crop import CropAdapter
                adapter = CropAdapter()
            
            if operation.type == entities.UniqueizationType.RESIZE:
                from .resize import ResizeAdapter
                adapter = ResizeAdapter()

            if operation.type == entities.UniqueizationType.ROTATE:
                from .rotate import RotateAdapter
                adapter = RotateAdapter()

            if operation.type == entities.UniqueizationType.TRANSFORM:
                from .transform import TransformAdapter
                adapter = TransformAdapter()

            if operation.type == entities.UniqueizationType.TRANSPOSE:
                from .transpose import TransposeAdapter
                adapter = TransposeAdapter()

            if operation.type == entities.UniqueizationType.CONVERT:
                from .convert import ConvertAdapter
                adapter = ConvertAdapter()

            if operation.type == entities.UniqueizationType.ENHANCE:
                from .enhance import EnhanceAdapter
                adapter = EnhanceAdapter()

            if operation.type == entities.UniqueizationType.SIMPLE_FILTER:
                from .simple_filter import SimpleFilterAdapter
                adapter = SimpleFilterAdapter()

            if operation.type == entities.UniqueizationType.PIXEL_NOISE:
                from .pixel_noise import PixelNoiseAdapter
                adapter = PixelNoiseAdapter()
            
            result.settings.append(adapter.to_model(operation))
        return result
