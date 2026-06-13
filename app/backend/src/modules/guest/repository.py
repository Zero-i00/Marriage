from __future__ import annotations

from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.strategies.repository import BaseRepository
from database.models import GuestModel


class GuestRepository(BaseRepository[GuestModel]):
    table = GuestModel

    async def list(self) -> Sequence[GuestModel]:
        query = select(self.table)
        stmt = await self.session.execute(query)

        return stmt.scalars().all()

    async def get_by_id(self, *, guest_id: int) -> GuestModel | None:
        return await self.session.get(self.table, guest_id)

    async def create(self, *, full_name: str, invitation_id: int) -> GuestModel:
        instance = GuestModel(full_name=full_name, invitation_id=invitation_id)

        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)

        return instance

    async def bulk_create(
        self, *, full_name_list: Sequence[str], invitation_id: int
    ) -> list[GuestModel]:
        instances = [
            GuestModel(full_name=full_name, invitation_id=invitation_id)
            for full_name in full_name_list
        ]

        self.session.add_all(instances)
        await self.session.flush()
        for instance in instances:
            await self.session.refresh(instance)

        return instances


    async def destroy(self, instance: GuestModel) -> None:
        await self.session.delete(instance)


def get_guest_repository(session: AsyncSession) -> GuestRepository:
    return GuestRepository(session)
