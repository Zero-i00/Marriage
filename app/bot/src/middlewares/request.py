from collections.abc import Awaitable, Callable
from typing import Any

from aiogram import BaseMiddleware
from aiogram.types import TelegramObject, User


class RequestMiddleware(BaseMiddleware):
    """Прокидывает tg_user_id в хендлеры как именованный аргумент."""

    async def __call__(
        self,
        handlers: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: dict[str, Any],
    ) -> Any:
        user: User | None = data.get("event_from_user")
        data["tg_user_id"] = user.id if user else None
        return await handlers(event, data)
