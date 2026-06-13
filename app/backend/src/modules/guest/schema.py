from pydantic import BaseModel, ConfigDict, Field


class SchemaGuestIn(BaseModel):
    full_name: str = Field(min_length=1)


class SchemaGuestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    invitation_id: int
