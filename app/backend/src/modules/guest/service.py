from __future__ import annotations

from typing import Sequence

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.exceptions import NotFoundException
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

    async def get(self, guest_id: int) -> SchemaGuestOut:
        instance = await self.repository.get_by_id(guest_id=guest_id)
        if instance is None:
            raise NotFoundException(f'Guest with id {guest_id} not found')

        return SchemaGuestOut.model_validate(instance)

    async def create(self, full_name: str, invitation_id: int) -> SchemaGuestOut:
        instance = await self.repository.create(
            full_name=full_name,
            invitation_id=invitation_id,
        )

        return SchemaGuestOut.model_validate(instance)

    async def create_many(
        self, full_name_list: Sequence[str], invitation_id: int
    ) -> list[SchemaGuestOut]:
        instances = await self.repository.bulk_create(
            full_name_list=full_name_list,
            invitation_id=invitation_id,
        )

        return [SchemaGuestOut.model_validate(instance) for instance in instances]

    async def destroy(self, guest_id: int) -> None:
        instance = await self.repository.get_by_id(guest_id=guest_id)
        if instance is None:
            raise NotFoundException(f'Guest with id {guest_id} not found')

        await self.repository.destroy(instance)


def get_guest_service(session: AsyncSession = Depends(get_session)) -> GuestService:
    return GuestService(session)
