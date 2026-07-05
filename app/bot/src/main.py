from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.enums import ParseMode

from features import root_router
from shared.api import make_query_client
from shared.config import get_settings
from shared.menu import set_super_user_menu
from shared.middlewares import SuperUserOnlyMiddleware, UserContextMiddleware

settings = get_settings()


def init_bot() -> Bot:
    session = AiohttpSession(proxy=settings.bot_proxy_url.get_secret_value())

    return Bot(
        session=session,
        token=settings.bot_token.get_secret_value(),
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )


def init_dispatcher() -> Dispatcher:
    dp = Dispatcher()

    dp.message.outer_middleware(SuperUserOnlyMiddleware(settings.tg_bot_super_user_id_list))
    dp.callback_query.outer_middleware(
        SuperUserOnlyMiddleware(settings.tg_bot_super_user_id_list)
    )

    dp.update.middleware(UserContextMiddleware())

    dp.include_router(root_router)

    return dp


async def main() -> None:
    bot = init_bot()
    dp = init_dispatcher()

    await bot.delete_webhook(True)
    await set_super_user_menu(bot, settings.tg_bot_super_user_id_list)

    async with make_query_client():
        await dp.start_polling(bot)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
