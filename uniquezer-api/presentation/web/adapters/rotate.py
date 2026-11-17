from presentation.web.adapters._base_adapter import BaseAdapter
from domain import entities
from presentation.web import schemas

class RotateAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(
            schemas.RotateSchema,
            entities.Rotate
        )

    def to_model(self, entity: entities.Rotate) -> schemas.RotateSchema:
        return schemas.RotateSchema(
            angle=entity.angle,
            resample=entity.resample,
            fillcolor=entity.fillcolor,
            fill_with_average_color=entity.fill_with_average_color,
            blurred_background=entity.blurred_background,
            blurred_background_blur_radius=entity.blurred_background_blur_radius,
            expand=entity.expand,
            center=entity.center
        )

    def to_entity(self, model: schemas.RotateSchema) -> entities.Rotate:
        return entities.Rotate(
            angle=model.angle,
            resample=model.resample,
            fillcolor=model.fillcolor,
            fill_with_average_color=model.fill_with_average_color,
            blurred_background=model.blurred_background,
            blurred_background_blur_radius=model.blurred_background_blur_radius,
            expand=model.expand,
            center=model.center
        )