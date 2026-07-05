from schemas.drink import SchemaDrinkRequest, SchemaDrinkResponse

from .base import BaseService


class DrinkService(BaseService):
    async def list(self) -> list[SchemaDrinkResponse]:
        response = await self._client.get(
            "drink",
            response_type=list[SchemaDrinkResponse],
            config=self._auth(),
        )
        return response.data

    async def create(self, title: str) -> SchemaDrinkResponse:
        response = await self._client.post(
            "drink",
            response_type=SchemaDrinkResponse,
            data=SchemaDrinkRequest(title=title).model_dump(),
            config=self._auth(),
        )
        return response.data

    async def delete(self, drink_id: int) -> None:
        await self._client.delete(f"drink/{drink_id}", config=self._auth())
