from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.exceptions import NotFoundException
from database.session import get_session
from modules.drink.repository import get_drink_repository
from modules.drink.schema import SchemaDrinkOut, SchemaDrinkIn


class DrinkService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repository = get_drink_repository(session)

    async def list(self) -> list[SchemaDrinkOut]:
        items = await self.repository.list()
        return [SchemaDrinkOut.model_validate(item) for item in items]

    async def create(self, data: SchemaDrinkIn) -> SchemaDrinkOut:
        instance = await self.repository.create(
            title=data.title
        )

        return SchemaDrinkOut.model_validate(instance)

    async def destroy(self, drink_id: int) -> None:
        instance = await self.repository.get_by_id(drink_id=drink_id)
        if instance is None:
            raise NotFoundException(f'Drink with id {drink_id} not found')

        await self.repository.destroy(instance)


def get_drink_service(session: AsyncSession = Depends(get_session)) -> DrinkService:
    return DrinkService(session)
