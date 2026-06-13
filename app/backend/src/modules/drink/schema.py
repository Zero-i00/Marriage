from pydantic import BaseModel, ConfigDict, Field


class SchemaDrinkIn(BaseModel):
    title: str = Field(min_length=1)


class SchemaDrinkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
