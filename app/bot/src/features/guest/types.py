from pydantic import BaseModel


class GuestResponse(BaseModel):
    id: int
    full_name: str
