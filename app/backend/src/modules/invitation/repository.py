from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.strategies.repository import BaseRepository
from database.models import DrinkModel, GuestModel, InvitationModel, invitations_to_drinks


class InvitationRepository(BaseRepository[InvitationModel]):
    table = InvitationModel

    async def list(self) -> Sequence[InvitationModel]:
        query = select(self.table).options(
            selectinload(self.table.guests),
            selectinload(self.table.drinks),
        )
        stmt = await self.session.execute(query)

        return stmt.scalars().all()

    async def get_by_id(self, *, invitation_id: int) -> InvitationModel | None:
        return await self.session.get(self.table, invitation_id)

    async def filter_existing_drink_ids(self, *, drink_ids: Sequence[int]) -> set[int]:
        if not drink_ids:
            return set()

        query = select(DrinkModel.id).where(DrinkModel.id.in_(drink_ids))
        stmt = await self.session.execute(query)

        return set(stmt.scalars().all())

    async def create(
        self,
        *,
        is_plan_visit: bool,
        music: str | None,
        comment: str | None,
        guests: Sequence[str],
        drink_ids: Sequence[int],
    ) -> InvitationModel:
        instance = InvitationModel(
            is_plan_visit=is_plan_visit,
            music=music,
            comment=comment,
            guests=[GuestModel(full_name=full_name) for full_name in guests],
        )

        self.session.add(instance)
        await self.session.flush()

        if drink_ids:
            await self.session.execute(
                insert(invitations_to_drinks),
                [{"invitation_id": instance.id, "drink_id": drink_id} for drink_id in drink_ids],
            )

        await self.session.refresh(instance, attribute_names=["created_at", "updated_at", "drinks"])

        return instance

    async def destroy(self, instance: InvitationModel) -> None:
        await self.session.delete(instance)


def get_invitation_repository(session: AsyncSession) -> InvitationRepository:
    return InvitationRepository(session)
