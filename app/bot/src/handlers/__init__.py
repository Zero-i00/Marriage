__all__ = ["root_router"]

from aiogram import Router

from handlers.start import router as start_router

root_router = Router(name="root")
root_router.include_router(start_router)
