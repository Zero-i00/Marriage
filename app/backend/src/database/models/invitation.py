from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped, relationship

from database.annotation import CHAR_FIELD, CREATED_AT_FIELD, TEXT_FIELD, UPDATED_AT_FIELD
from database.declarative import Base
from database.models.associations import invitations_to_drinks

if TYPE_CHECKING:
    from database.models.drink import DrinkModel
    from database.models.guest import GuestModel


class InvitationModel(Base):
    __tablename__ = "invitations"

    is_plan_visit: Mapped[bool]

    music: Mapped[CHAR_FIELD | None]
    comment: Mapped[TEXT_FIELD | None]

    guests: Mapped[list[GuestModel]] = relationship(
        back_populates="invitation",
        cascade="all, delete-orphan",
    )

    drinks: Mapped[list[DrinkModel]] = relationship(
        secondary=invitations_to_drinks,
        back_populates="invitations",
    )

    created_at: Mapped[CREATED_AT_FIELD]
    updated_at: Mapped[UPDATED_AT_FIELD]
