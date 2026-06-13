from fastapi import APIRouter, Depends

from modules.guest.schema import SchemaGuestOut
from modules.guest.service import GuestService, get_guest_service


class GuestResolver:

    router = APIRouter(
        prefix="/guest",
        tags=["Guest"],
    )

    @staticmethod
    @router.get("")
    async def list(
        service: GuestService = Depends(get_guest_service)
    ) -> list[SchemaGuestOut]:
        return await service.list()


def get_guest_router() -> APIRouter:
    return GuestResolver().router
