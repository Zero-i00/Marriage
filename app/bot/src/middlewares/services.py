from collections.abc import Awaitable, Callable
from typing import Any

from aiogram import BaseMiddleware
from aiogram.types import TelegramObject
from soft_http import SoftClient

from services import DrinkService, GuestService, InvitationService


class QueryClientMiddleware(BaseMiddleware):
    """Создаёт доменные сервисы на каждый апдейт и инжектит их в хендлеры.

    Сервисы привязываются к общему `Client` и telegram id вызвавшего пользователя,
    чтобы каждый запрос к backend нёс корректный `X-BOT-USER-ID`. aiogram подставляет
    их в хендлеры по имени параметра: `drink_service` / `guest_service` / `invitation_service`.
    """

    def __init__(self, client: SoftClient) -> None:
        self._client = client

    async def __call__(
        self,
        handler: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: dict[str, Any],
    ) -> Any:
        user = data.get("event_from_user")
        if user is not None:
            user_id = user.id

            data["drink_service"] = DrinkService(self._client, user_id)
            data["guest_service"] = GuestService(self._client, user_id)
            data["invitation_service"] = InvitationService(self._client, user_id)

        return await handler(event, data)
