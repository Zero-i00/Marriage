from pydantic import BaseModel


class SchemaGuestResponse(BaseModel):
    id: int
    full_name: str
