from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message

from features.invitation.service import invitation_service
from shared.routes import Route

from .utils import format_guest_list

router = Router(name="guest")


@router.message(Command(Route.GUEST))
async def get_guest_list_handler(message: Message) -> None:
    items = await invitation_service.list()
    await message.answer(format_guest_list(items))
