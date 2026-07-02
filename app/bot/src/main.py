from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.enums import ParseMode

from api import make_query_client
from core.config import get_settings
from handlers import root_router
from keyboards.menu import set_super_user_menu
from middlewares import SuperUserOnlyMiddleware, UserContextMiddleware

settings = get_settings()


def init_bot() -> Bot:
    session = AiohttpSession(proxy=settings.bot_proxy_url.get_secret_value())

    return Bot(
        session=session,
        token=settings.bot_token.get_secret_value(),
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )


def init_db() -> Dispatcher:
    dp = Dispatcher()

    dp.message.outer_middleware(SuperUserOnlyMiddleware(settings.bot_super_user_id))
    dp.callback_query.outer_middleware(SuperUserOnlyMiddleware(settings.bot_super_user_id))

    dp.update.middleware(UserContextMiddleware())

    dp.include_router(root_router)

    return dp


async def main() -> None:
    bot = init_bot()
    dp = init_db()

    await bot.delete_webhook(True)
    await set_super_user_menu(bot, settings.bot_super_user_id)

    async with make_query_client() as query_client:
        dp["query_client"] = query_client
        await dp.start_polling(bot)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
