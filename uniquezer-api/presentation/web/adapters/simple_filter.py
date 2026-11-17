from presentation.web.adapters._base_adapter import BaseAdapter
from domain import entities
from presentation.web import schemas

class SimpleFilterAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(
            schemas.SimpleFilterOperationSchema,
            entities.SimpleFilterOperation
        )

    def to_entity(self, model: schemas.SimpleFilterOperationSchema) -> entities.SimpleFilterOperation:
        return entities.SimpleFilterOperation(
            method=model.method
        )
    
    def to_model(self, entity: entities.SimpleFilterOperation) -> schemas.SimpleFilterOperationSchema:
        return schemas.SimpleFilterOperationSchema(
            type=entity.type,
            method=entity.method
        )
