from core.config import Settings
from soft_http import ClientConfig, SoftClient


def get_query_client(settings: Settings) -> SoftClient:
    config = ClientConfig(
        prefix_url=settings.server.server_api_url,
        timeout=10.0,
        retry=2,
    )

    return SoftClient(config=config)
