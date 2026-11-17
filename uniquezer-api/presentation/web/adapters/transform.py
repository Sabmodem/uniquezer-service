from presentation.web.adapters._base_adapter import BaseAdapter
from domain import entities
from presentation.web import schemas

class TransformAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(
            schemas.TransformOperationSchema,
            entities.TransformOperation
        )

    def to_entity(self, model: schemas.TransformOperationSchema) -> entities.Transform:
        return entities.TransformOperation(
            method=model.method,
            resample=model.resample,
            data=model.data,
            fillcolor=model.fillcolor
        )
    
    def to_model(self, entity: entities.TransformOperation) -> schemas.TransformOperationSchema:
        return schemas.TransformOperationSchema(
            type=entity.type,
            method=entity.method,
            resample=entity.resample,
            data=entity.data,
            fillcolor=entity.fillcolor
        )