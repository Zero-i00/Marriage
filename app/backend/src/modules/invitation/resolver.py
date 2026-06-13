from fastapi import APIRouter, Depends, status

from core.guards.permissions import is_super_user_guard
from modules.invitation.schema import SchemaInvitationIn, SchemaInvitationOut
from modules.invitation.service import InvitationService, get_invitation_service


class InvitationResolver:
    router = APIRouter(
        prefix="/invitation",
        tags=["Invitation"],
    )

    @staticmethod
    @router.get("")
    async def list(
        service: InvitationService = Depends(get_invitation_service),
        _: str = Depends(is_super_user_guard),
    ) -> list[SchemaInvitationOut]:
        return await service.list()

    @staticmethod
    @router.post("", status_code=status.HTTP_201_CREATED)
    async def create(
        data: SchemaInvitationIn,
        service: InvitationService = Depends(get_invitation_service),
    ) -> SchemaInvitationOut:
        return await service.create(data)

    @staticmethod
    @router.delete("/{invitation_id}", status_code=status.HTTP_204_NO_CONTENT)
    async def destroy(
        invitation_id: int,
        service: InvitationService = Depends(get_invitation_service),
        _: str = Depends(is_super_user_guard),
    ) -> None:
        return await service.destroy(invitation_id)


def get_invitation_resolver() -> InvitationResolver:
    return InvitationResolver()
