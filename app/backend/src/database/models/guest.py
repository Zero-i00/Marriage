from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.annotation import CHAR_FIELD
from database.declarative import Base

if TYPE_CHECKING:
    from database.models.invitation import InvitationModel


class GuestModel(Base):
    __tablename__ = "guests"

    full_name: Mapped[CHAR_FIELD]

    invitation_id: Mapped[int] = mapped_column(ForeignKey("invitations.id"))
    invitation: Mapped["InvitationModel"] = relationship(back_populates="guests")
