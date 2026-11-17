from presentation.web.adapters._base_adapter import BaseAdapter
from domain import entities
from presentation.web import schemas

class ConvertAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(
            schemas.ConvertOperationSchema,
            entities.ConvertOperation
        )

    def to_entity(self, model: schemas.ConvertOperationSchema) -> entities.ConvertOperation:
        return entities.ConvertOperation(
            mode=model.mode,
            matrix=model.matrix,
            dither=model.dither,
            palette=model.palette,
            colors=model.colors
        )
    
    def to_model(self, entity: entities.ConvertOperation) -> schemas.ConvertOperationSchema:
        return schemas.ConvertOperationSchema(
            mode=entity.mode,
            matrix=entity.matrix,
            dither=entity.dither,
            palette=entity.palette,
            colors=entity.colors
        )