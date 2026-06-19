from aiogram import Bot
from aiogram.types import BotCommand, BotCommandScopeChat

SUPER_USER_COMMAND_LIST = [
    BotCommand(command="start", description="Начать"),
    BotCommand(command="drink", description="Напитки"),
    BotCommand(command="invitation", description="Приглашения"),
]


async def set_super_user_menu(bot: Bot, super_user_id: int) -> None:
    await bot.set_my_commands(
        SUPER_USER_COMMAND_LIST, scope=BotCommandScopeChat(chat_id=super_user_id)
    )
