from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.strategies.repository import BaseRepository
from database.models import DrinkModel


class DrinkRepository(BaseRepository[DrinkModel]):
    model = DrinkModel

    async def list(self) -> Sequence[DrinkModel]:
        query = select(self.model)
        stmt = await self.session.execute(query)

        return stmt.scalars().all()

    async def get_by_id(self, *, drink_id: int) -> DrinkModel | None:
        return await self.session.get(self.model, drink_id)

    async def create(self, *, title: str) -> DrinkModel:
        instance = DrinkModel(title=title)

        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)

        return instance

    async def destroy(self, instance: DrinkModel) -> None:
        await self.session.delete(instance)


def get_drink_repository(session: AsyncSession) -> DrinkRepository:
    return DrinkRepository(session)
