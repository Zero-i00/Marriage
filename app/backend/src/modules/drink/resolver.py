from fastapi import APIRouter, Depends, status

from core.guards.permissions import is_super_user_guard
from modules.drink.schema import SchemaDrinkIn, SchemaDrinkOut
from modules.drink.service import DrinkService, get_drink_service


class DrinkResolver:
    router = APIRouter(
        prefix="/drink",
        tags=["Drink"],
    )

    @staticmethod
    @router.get("")
    async def list(service: DrinkService = Depends(get_drink_service)) -> list[SchemaDrinkOut]:
        return await service.list()

    @staticmethod
    @router.post("", status_code=status.HTTP_201_CREATED)
    async def create(
        data: SchemaDrinkIn,
        service: DrinkService = Depends(get_drink_service),
        _: str = Depends(is_super_user_guard),
    ) -> SchemaDrinkOut:
        return await service.create(data)

    @staticmethod
    @router.delete("/{drink_id}", status_code=status.HTTP_204_NO_CONTENT)
    async def destroy(
        drink_id: int,
        service: DrinkService = Depends(get_drink_service),
        _: str = Depends(is_super_user_guard),
    ) -> None:
        return await service.destroy(drink_id)


def get_drink_resolver() -> DrinkResolver:
    return DrinkResolver()
