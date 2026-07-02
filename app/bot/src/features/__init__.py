__all__ = ["root_router"]

from aiogram import Router

from features.drink import router as drink_router
from features.guest import router as guest_router
from features.invitation import router as invitation_router
from features.start import router as start_router

root_router = Router(name="root")
root_router.include_router(start_router)
root_router.include_router(drink_router)
root_router.include_router(guest_router)
root_router.include_router(invitation_router)
