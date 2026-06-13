from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.exceptions import BadRequestException, NotFoundException
from database.session import get_session
from modules.invitation.repository import get_invitation_repository
from modules.invitation.schema import SchemaInvitationIn, SchemaInvitationOut


class InvitationService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repository = get_invitation_repository(session)

    async def list(self) -> list[SchemaInvitationOut]:
        items = await self.repository.list()
        return [SchemaInvitationOut.model_validate(item) for item in items]

    async def create(self, data: SchemaInvitationIn) -> SchemaInvitationOut:
        if not data.guests:
            raise BadRequestException("Invitation must have at least one guest")

        instance = await self.repository.create(
            is_plan_visit=data.is_plan_visit,
            music=data.music,
            comment=data.comment,
            guests=[guest.full_name for guest in data.guests],
            drink_ids=[drink.id for drink in data.drinks],
        )

        return SchemaInvitationOut.model_validate(instance)

    async def destroy(self, invitation_id: int) -> None:
        instance = await self.repository.get_by_id(invitation_id=invitation_id)
        if instance is None:
            raise NotFoundException(f"Invitation with id {invitation_id} not found")

        await self.repository.destroy(instance)


def get_invitation_service(
    session: AsyncSession = Depends(get_session),
) -> InvitationService:
    return InvitationService(session)
