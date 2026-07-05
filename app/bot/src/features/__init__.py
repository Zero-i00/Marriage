__all__ = ["root_router"]

from aiogram import Router

from features.drink import router as drink_router
from features.guest import router as guest_router
from features.invitation import router as invitation_router
from features.start import router as start_router
from shared.config import get_settings
from shared.middlewares import SuperUserOnlyMiddleware

# Управление (напитки/гости/приглашения) — только супер-юзеру; /start и Web App публичны.
_super_user_ids = get_settings().tg_bot_super_user_id_list
for _router in (drink_router, guest_router, invitation_router):
    _router.message.outer_middleware(SuperUserOnlyMiddleware(_super_user_ids))
    _router.callback_query.outer_middleware(SuperUserOnlyMiddleware(_super_user_ids))

root_router = Router(name="root")
root_router.include_router(start_router)
root_router.include_router(drink_router)
root_router.include_router(guest_router)
root_router.include_router(invitation_router)
