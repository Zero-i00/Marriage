
from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message
from soft_http import SoftClient

from services.drink import get_drink_service

router = Router(name="drink")


@router.message(Command('drink'))
async def get_drink_list_handler(message: Message, query_client: SoftClient) -> None:
    service = get_drink_service(query_client)

    items = await service.list()

    if len(items) == 0:
        await message.answer("Не удалось найти напитки")
        return 

    for item in items:
        await message.answer(item.title)