__all__ = ["root_router"]

from aiogram import Router

from handlers.drink import router as drink_router
from handlers.start import router as start_router

root_router = Router(name="root")
root_router.include_router(start_router)
root_router.include_router(drink_router)
