from presentation.web.adapters._base_adapter import BaseAdapter
from domain import entities
from presentation.web import schemas

class TransposeAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(
            schemas.TransposeOperationSchema,
            entities.TransposeOperation
        )

    def to_model(self, entity: entities.TransposeOperation) -> schemas.TransposeOperationSchema:
        return schemas.TransposeOperationSchema(
            transpose=entity.transpose
        )
    
    def to_entity(self, model: schemas.TransposeOperationSchema) -> entities.TransposeOperation:
        return entities.TransposeOperation(
            transpose=model.transpose
        )