from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    WebAppInfo,
)

from shared.config import get_settings

router = Router(name="start")


@router.message(CommandStart())
async def start(message: Message) -> None:
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="💌 Открыть приглашение",
                    web_app=WebAppInfo(url=get_settings().web_app_url),
                )
            ]
        ]
    )
    await message.answer(
        "💍 Здравствуйте! Мы рады пригласить вас на нашу свадьбу 💐\n\n"
        "Этот бот поможет отправить анкету: придёте ли вы, "
        "музыкальные пожелания и напитки 🥂\n\n"
        "Заполним вместе — начнём? 💌",
        reply_markup=keyboard,
    )
