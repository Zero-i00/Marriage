from soft_http import ClientConfig, SoftClient


class BaseService:
    """Базовый доменный сервис.

    Привязан к общему `SoftClient` и telegram id вызвавшего пользователя. Каждый запрос
    к backend сопровождается заголовком `X-BOT-USER-ID` через per-request config —
    soft-http мерджит его поверх инстанс-конфига, сохраняя `prefix_url`.
    """

    def __init__(self, client: SoftClient, user_id: int) -> None:
        self._client = client
        self._user_id = user_id

    def _auth(self) -> ClientConfig:
        return ClientConfig(headers={"X-BOT-USER-ID": str(self._user_id)})
