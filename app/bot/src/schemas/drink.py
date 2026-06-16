from pydantic import BaseModel


class SchemaDrinkRequest(BaseModel):
    title: str


class SchemaDrinkResponse(BaseModel):
    id: int
    title: str
