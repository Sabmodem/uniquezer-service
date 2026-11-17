from presentation.web.adapters._base_adapter import BaseAdapter
from domain import entities
from presentation.web import schemas

class EnhanceAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(
            schemas.EnhanceOperationSchema,
            entities.EnhanceOperation
        )

    def to_entity(self, model: schemas.EnhanceOperationSchema) -> entities.EnhanceOperation:
        return entities.EnhanceOperation(
            method=model.method,
            factor=model.factor
        )

    def to_model(self, entity: entities.EnhanceOperation) -> schemas.EnhanceOperationSchema:
        return schemas.EnhanceOperationSchema(
            type=entity.type,
            method=entity.method,
            factor=entity.factor
        )