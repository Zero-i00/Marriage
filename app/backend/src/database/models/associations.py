from sqlalchemy import Column, ForeignKey, Table

from database.declarative import Base

invitations_to_drinks = Table(
    "invitations_to_drinks",
    Base.metadata,
    Column("invitation_id", ForeignKey("invitations.id"), primary_key=True),
    Column("drink_id", ForeignKey("drinks.id"), primary_key=True),
)
