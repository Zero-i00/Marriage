from pydantic import TypeAdapter
from soft_http import SoftClient

from schemas.drink import SchemaDrinkRequest, SchemaDrinkResponse

TypeResponse = TypeAdapter(list[SchemaDrinkResponse])


class DrinkService:
    base_url = "drink"

    def __init__(self, client: SoftClient) -> None:
        self._client = client

    async def list(self) -> list[SchemaDrinkResponse]:
        response = await self._client.get(self.base_url)
        return TypeResponse.validate_json(response.raw)

    async def create(self, payload: SchemaDrinkRequest) -> SchemaDrinkResponse:
        response = await self._client.post(
            self.base_url,
            data=payload.model_dump_json(),
            response_type=SchemaDrinkResponse,
        )

        return response.data

    async def destroy(self, drink_id: int) -> None:
        await self._client.delete(f"{self.base_url}/{drink_id}")


def get_drink_service(client: SoftClient) -> DrinkService:
    return DrinkService(client)
