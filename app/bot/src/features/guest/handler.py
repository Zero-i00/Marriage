from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message

from shared.routes import Route

from .service import guest_service
from .utils import format_guest_list

router = Router(name="guest")


@router.message(Command(Route.GUEST))
async def get_guest_list_handler(message: Message) -> None:
    items = await guest_service.list()
    await message.answer(format_guest_list(items))
