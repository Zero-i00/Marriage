from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.enums import ParseMode

from core.config import get_settings
from handlers import root_router

settings = get_settings()


async def main() -> None:
    session = AiohttpSession(proxy=settings.bot_proxy_url.get_secret_value())

    bot = Bot(
        session=session,
        token=settings.bot_token.get_secret_value(),
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )

    dp = Dispatcher()
    dp.include_router(root_router)

    await bot.delete_webhook(True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
