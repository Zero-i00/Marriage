from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.strategies.repository import BaseRepository
from database.models import DrinkModel, GuestModel, InvitationModel


class InvitationRepository(BaseRepository[InvitationModel]):
    model = InvitationModel

    async def list(self) -> Sequence[InvitationModel]:
        query = select(self.model).options(
            selectinload(self.model.guests),
            selectinload(self.model.drinks),
        )
        stmt = await self.session.execute(query)

        return stmt.scalars().all()

    async def get_by_id(self, *, invitation_id: int) -> InvitationModel | None:
        return await self.session.get(self.model, invitation_id)

    async def get_drink_list(self, *, drink_ids: Sequence[int] | None) -> Sequence[DrinkModel]:
        query = select(DrinkModel)
        if drink_ids:
            query = query.where(DrinkModel.id.in_(drink_ids))

        stmt = await self.session.execute(query)
        return stmt.scalars().all()

    async def create(
        self,
        *,
        is_plan_visit: bool,
        music: str | None,
        comment: str | None,
        guests: Sequence[GuestModel],
        drinks: Sequence[DrinkModel],
    ) -> InvitationModel:
        instance = self.model(
            music=music,
            comment=comment,
            is_plan_visit=is_plan_visit,
            guests=guests,
            drinks=drinks,
        )

        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(
            instance,
            attribute_names=["guests", "drinks", "created_at", "updated_at"],
        )

        return instance

    async def destroy(self, instance: InvitationModel) -> None:
        await self.session.delete(instance)


def get_invitation_repository(session: AsyncSession) -> InvitationRepository:
    return InvitationRepository(session)
