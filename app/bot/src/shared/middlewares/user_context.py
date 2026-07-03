from collections.abc import Awaitable, Callable
from typing import Any

from aiogram import BaseMiddleware
from aiogram.types import TelegramObject, User

from shared.api.context import current_user_id


class UserContextMiddleware(BaseMiddleware):
    """Кладёт id текущего Telegram-юзера в contextvar на время обработки апдейта.

    `shared.api.context.inject_bot_user_id` (before_request-хук soft-http) читает его и
    подставляет в заголовок `X-BOT-USER-ID` per-request — backend сам решает,
    супер-юзер это или нет. Без этого middleware заголовок нёс бы фиксированный
    admin id для любого вызывающего.
    """

    async def __call__(
        self,
        handler: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: dict[str, Any],
    ) -> Any:
        user: User | None = data.get("event_from_user")
        token = current_user_id.set(user.id if user else None)
        try:
            return await handler(event, data)
        finally:
            current_user_id.reset(token)
