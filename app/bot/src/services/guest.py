from pydantic import TypeAdapter
from soft_http import SoftClient

from schemas.guest import SchemaGuestResponse

TypeResponse = TypeAdapter(list[SchemaGuestResponse])


class GuestService:
    base_url = "guest"

    def __init__(self, client: SoftClient) -> None:
        self._client = client

    async def list(self) -> list[SchemaGuestResponse]:
        response = await self._client.get(self.base_url)
        return TypeResponse.validate_json(response.raw)


def get_guest_service(client: SoftClient) -> GuestService:
    return GuestService(client)
