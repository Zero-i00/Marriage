import datetime

from pydantic import BaseModel, ConfigDict, Field

from modules.drink.schema import SchemaDrinkOut
from modules.guest.schema import SchemaGuestIn, SchemaGuestOut


class SchemaInvitationDrinkIn(BaseModel):
    id: int


class SchemaInvitationIn(BaseModel):
    is_plan_visit: bool

    music: str | None = None
    comment: str | None = None

    guests: list[SchemaGuestIn] = Field(default_factory=list)
    drinks: list[SchemaInvitationDrinkIn] = Field(default_factory=list)


class SchemaInvitationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int

    is_plan_visit: bool

    music: str | None
    comment: str | None

    guests: list[SchemaGuestOut]
    drinks: list[SchemaDrinkOut]

    created_at: datetime.datetime
    updated_at: datetime.datetime
