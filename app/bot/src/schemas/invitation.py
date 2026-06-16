from datetime import datetime

from pydantic import BaseModel, Field

from schemas.guest import SchemaGuestResponse


class SchemaInvitationResponse(BaseModel):
    id: int

    is_plan_visit: bool

    music: str | None
    comment: str | None

    guests: list[SchemaGuestResponse] = Field(default_factory=list)
    drinks: list[SchemaGuestResponse] = Field(default_factory=list)

    created_at: datetime
    updated_at: datetime
