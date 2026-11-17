from presentation.web.adapters._base_adapter import BaseAdapter
from domain import entities
from presentation.web import schemas

class ResizeAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(
            schemas.ResizeSchema,
            entities.Resize
        )

    def to_model(self, entity: entities.Resize) -> schemas.ResizeSchema:
        return schemas.ResizeSchema(
            width=entity.width,
            height=entity.height
        )
    
    def to_entity(self, model: schemas.ResizeSchema) -> entities.Resize:
        return entities.Resize(
            width=model.width,
            height=model.height
        )