from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import Message

router = Router(name="start")


@router.message(CommandStart())
async def start(message: Message) -> None:
    await message.answer(
        "💍 Здравствуйте! Мы рады пригласить вас на нашу свадьбу 💐\n\n"
        "Этот бот поможет отправить анкету: придёте ли вы, "
        "музыкальные пожелания и напитки 🥂\n\n"
        "Заполним вместе — начнём? 💌"
    )
