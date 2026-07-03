from aiogram import Bot
from aiogram.types import BotCommand, BotCommandScopeChat

from .routes import Route

SUPER_USER_COMMAND_LIST = [
    BotCommand(command=Route.START, description="Начать"),
    BotCommand(command=Route.DRINK, description="Напитки"),
    BotCommand(command=Route.GUEST, description="Гости"),
    BotCommand(command=Route.INVITATION, description="Приглашения"),
]


async def set_super_user_menu(bot: Bot, super_user_id: int) -> None:
    await bot.set_my_commands(
        SUPER_USER_COMMAND_LIST, scope=BotCommandScopeChat(chat_id=super_user_id)
    )
