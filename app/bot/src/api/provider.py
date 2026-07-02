from functools import lru_cache

from soft_http import ClientConfig, RetryConfig, SoftClient

from core.config import get_settings

from .context import inject_bot_user_id


@lru_cache
def make_query_client() -> SoftClient:
    settings = get_settings()

    config = ClientConfig(
        prefix_url=settings.server.server_api_url,
        headers={"Content-Type": "application/json"},
        retry=RetryConfig(),
    )

    client = SoftClient(config=config)

    client.hooks.before_request.append(inject_bot_user_id)

    return client
