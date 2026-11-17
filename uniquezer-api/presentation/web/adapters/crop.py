from presentation.web.adapters._base_adapter import BaseAdapter
from domain import entities
from presentation.web import schemas

class CropAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(
            schemas.CropSchema,
            entities.Crop
        )

    def to_entity(self, model: schemas.CropSchema) -> entities.Crop:
        return entities.Crop(
            left=model.left,
            top=model.top,
            right=model.right,
            bottom=model.bottom
        )
    
    def to_model(self, entity: entities.Crop) -> schemas.CropSchema:
        return schemas.CropSchema(
            type=entity.type,
            left=entity.left,
            top=entity.top,
            right=entity.right,
            bottom=entity.bottom
        )