from datetime import datetime

from pydantic import BaseModel, Field

from features.drink.types import DrinkResponse
from features.guest.types import GuestResponse, GuestRequest


class InvitationRequest(BaseModel):
    is_plan_visit: bool
    music: str | None = None
    comment: str | None = None
    drink_ids: list[int] = Field(default_factory=list)
    guests: list[GuestRequest] = Field(default_factory=list)


class InvitationResponse(BaseModel):
    id: int

    is_plan_visit: bool

    music: str | None
    comment: str | None

    guests: list[GuestResponse] = Field(default_factory=list)
    drinks: list[DrinkResponse] = Field(default_factory=list)

    created_at: datetime
    updated_at: datetime
