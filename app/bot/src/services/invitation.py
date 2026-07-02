from pydantic import TypeAdapter
from soft_http import SoftClient

from schemas.invitation import SchemaInvitationResponse

TypeResponse = TypeAdapter(list[SchemaInvitationResponse])


class InvitationService:
    base_url = "invitation"

    def __init__(self, client: SoftClient) -> None:
        self._client = client

    async def list(self) -> list[SchemaInvitationResponse]:
        response = await self._client.get(self.base_url)
        return TypeResponse.validate_json(response.raw)

    async def destroy(self, invitation_id: int) -> None:
        await self._client.delete(f"{self.base_url}/{invitation_id}")


def get_invitation_service(client: SoftClient) -> InvitationService:
    return InvitationService(client)
