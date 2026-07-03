from pydantic import TypeAdapter

from shared.api import make_query_client

from .types import InvitationRequest, InvitationResponse

TypeResponse = TypeAdapter(list[InvitationResponse])


class InvitationService:
    base_path = "invitation"

    def __init__(self) -> None:
        self._client = make_query_client()

    async def list(self) -> list[InvitationResponse]:
        response = await self._client.get(self.base_path)
        return TypeResponse.validate_json(response.raw)

    async def create(self, payload: InvitationRequest) -> InvitationResponse:
        response = await self._client.post(
            self.base_path,
            data=payload.model_dump_json(),
            response_type=InvitationResponse,
        )
        return response.data

    async def destroy(self, invitation_id: int) -> None:
        await self._client.delete(f"{self.base_path}/{invitation_id}")


invitation_service = InvitationService()
