from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from database.annotation import CHAR_FIELD
from database.declarative import Base
from database.models.associations import invitations_to_drinks

if TYPE_CHECKING:
    from database.models.invitation import InvitationModel


class DrinkModel(Base):
    __tablename__ = "drinks"

    title: Mapped[CHAR_FIELD] = mapped_column(unique=True)

    invitations: Mapped[list["InvitationModel"]] = relationship(
        secondary=invitations_to_drinks,
        back_populates="drinks",
    )

    @validates("title")
    def _capitalize_title(self, key: str, value: str) -> str:
        return value[:1].upper() + value[1:] if value else value
