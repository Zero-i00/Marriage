from pydantic import BaseModel, ConfigDict

from core.annotation import CHAR_FIELD


class SchemaDrinkIn(BaseModel):
    title: CHAR_FIELD


class SchemaDrinkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
