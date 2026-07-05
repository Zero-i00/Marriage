from fastapi import Header

from core.config import get_settings
from core.exceptions import ForbiddenException

BOT_USER_ID_HEADER = "X-BOT-USER-ID"


async def is_super_user_guard(
    x_bot_user_id: str | None = Header(default=None, alias=BOT_USER_ID_HEADER),
) -> str:
    settings = get_settings()
    if x_bot_user_id not in settings.tg.tg_bot_super_user_id_list:
        raise ForbiddenException("Only the super user can perform this action")
    return x_bot_user_id
