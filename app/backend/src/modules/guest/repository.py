from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.strategies.repository import BaseRepository
from database.models import GuestModel


class GuestRepository(BaseRepository[GuestModel]):
    model = GuestModel

    async def list(self) -> Sequence[GuestModel]:
        query = select(self.model)
        stmt = await self.session.execute(query)

        return stmt.scalars().all()


def get_guest_repository(session: AsyncSession) -> GuestRepository:
    return GuestRepository(session)
