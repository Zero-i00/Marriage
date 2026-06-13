from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_session
from modules.guest.repository import get_guest_repository
from modules.guest.schema import SchemaGuestOut


class GuestService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repository = get_guest_repository(session)

    async def list(self) -> list[SchemaGuestOut]:
        items = await self.repository.list()
        return [SchemaGuestOut.model_validate(item) for item in items]


def get_guest_service(session: AsyncSession = Depends(get_session)) -> GuestService:
    return GuestService(session)
