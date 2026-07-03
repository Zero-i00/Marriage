from pydantic import TypeAdapter

from shared.api import make_query_client

from .types import GuestResponse

TypeResponse = TypeAdapter(list[GuestResponse])


class GuestService:
    base_path = "guest"

    def __init__(self) -> None:
        self._client = make_query_client()

    async def list(self) -> list[GuestResponse]:
        response = await self._client.get(self.base_path)
        return TypeResponse.validate_json(response.raw)


guest_service = GuestService()
