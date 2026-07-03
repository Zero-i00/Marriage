from contextvars import ContextVar
from dataclasses import replace

from soft_http import ClientConfig

current_user_id: ContextVar[int | None] = ContextVar("current_user_id", default=None)


async def inject_bot_user_id(config: ClientConfig) -> ClientConfig:
    user_id = current_user_id.get()
    if user_id is None:
        return config

    return replace(config, headers={**config.headers, "X-BOT-USER-ID": str(user_id)})
