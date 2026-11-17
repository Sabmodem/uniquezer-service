from domain import entities
from abc import abstractmethod
from presentation.web import schemas
from presentation.web.adapters.adapter_interface import AdapterInterface

class BaseAdapter(AdapterInterface):
    def __init__(
        self, 
        model: schemas.ImageOperationSchema,
        entity: entities.ImageOperation
    ):
        self._model = model
        self._entity = entity

    @property
    def model(self):
        return self._model

    @property
    def entity(self):
        return self._entity

    @abstractmethod
    def to_model(self):
        raise NotImplementedError

    @abstractmethod
    def to_entity(self):
        raise NotImplementedError
