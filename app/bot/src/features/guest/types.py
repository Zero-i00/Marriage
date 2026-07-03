from pydantic import BaseModel


class GuestRequest(BaseModel):
    full_name: str


class GuestResponse(BaseModel):
    id: int
    full_name: str
