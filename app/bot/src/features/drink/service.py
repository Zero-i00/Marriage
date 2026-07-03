from pydantic import TypeAdapter

from shared.api import make_query_client

from .types import DrinkRequest, DrinkResponse

TypeResponse = TypeAdapter(list[DrinkResponse])


class DrinkService:
    base_path = "drink"

    def __init__(self) -> None:
        self._client = make_query_client()

    async def list(self) -> list[DrinkResponse]:
        response = await self._client.get(self.base_path)
        return TypeResponse.validate_json(response.raw)

    async def create(self, payload: DrinkRequest) -> DrinkResponse:
        response = await self._client.post(
            self.base_path,
            data=payload.model_dump_json(),
            response_type=DrinkResponse,
        )

        return response.data

    async def destroy(self, drink_id: int) -> None:
        await self._client.delete(f"{self.base_path}/{drink_id}")


drink_service = DrinkService()
