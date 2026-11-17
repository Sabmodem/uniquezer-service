from presentation.web.adapters._base_adapter import BaseAdapter
from domain import entities
from presentation.web import schemas

class PixelNoiseAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(
            schemas.PixelNoiseOperationSchema,
            entities.PixelNoiseOperation
        )

    def to_entity(self, model: schemas.PixelNoiseOperationSchema) -> entities.PixelNoiseOperation:
        return entities.PixelNoiseOperation(
            pixels_max=model.pixels_max,
            pixels_min=model.pixels_min
        )

    def to_model(self, entity: entities.PixelNoiseOperation) -> schemas.PixelNoiseOperationSchema:
        return schemas.PixelNoiseOperationSchema(
            type=entity.type,
            pixels_max=entity.pixels_max,
            pixels_min=entity.pixels_min
        )