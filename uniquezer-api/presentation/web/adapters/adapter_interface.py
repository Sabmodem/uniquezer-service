from domain import entities
from presentation.web import schemas
from abc import ABC, abstractmethod

class AdapterInterface(ABC):
    @abstractmethod
    def to_entity(self, model: schemas.ImageOperationSchema) -> entities.ImageOperation:
        raise NotImplementedError
    
    @abstractmethod
    def to_model(self, entity: entities.ImageOperation) -> schemas.ImageOperationSchema:
        raise NotImplementedError

    @property
    @abstractmethod
    def model(self) -> schemas.ImageOperationSchema:
        raise NotImplementedError

    @property
    @abstractmethod
    def entity(self) -> entities.ImageOperation:
        raise NotImplementedError


