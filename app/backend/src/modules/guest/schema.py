from pydantic import BaseModel, ConfigDict

from core.annotation import CHAR_FIELD


class SchemaGuestIn(BaseModel):
    full_name: CHAR_FIELD


class SchemaGuestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    invitation_id: int
