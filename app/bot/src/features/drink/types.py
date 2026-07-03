from pydantic import BaseModel


class DrinkRequest(BaseModel):
    title: str


class DrinkResponse(BaseModel):
    id: int
    title: str
