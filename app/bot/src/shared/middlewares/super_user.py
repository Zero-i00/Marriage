from collections.abc import Awaitable, Callable
from typing import Any

from aiogram import BaseMiddleware
from aiogram.types import Message, TelegramObject, User

DENY_MESSAGE = (
    "Извините, этот бот — личный инструмент организатора свадьбы "
    "и недоступен для других пользователей. 🙏"
)


class SuperUserOnlyMiddleware(BaseMiddleware):
    """Пускает дальше только супер-юзера; остальным вежливо отказывает.

    Регистрируется как outer-middleware на dp.message, поэтому срабатывает
    до фильтров хендлеров — даже на неизвестную команду чужак получит отказ,
    а не тишину.
    """

    def __init__(self, super_user_id: int) -> None:
        self.super_user_id = super_user_id

    async def __call__(
        self,
        handler: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: dict[str, Any],
    ) -> Any:
        user: User | None = data.get("event_from_user")
        if user is None or user.id != self.super_user_id:
            if isinstance(event, Message):
                await event.answer(DENY_MESSAGE)
            return None
        return await handler(event, data)
