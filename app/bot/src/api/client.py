from typing import Any, Literal, TypeVar

from aiohttp import ClientSession
from pydantic import TypeAdapter

Method = Literal["GET", "POST", "PATCH", "DELETE"]

# Без bound=BaseModel: TypeAdapter валидирует и одиночную модель, и list[Model].
TResponse = TypeVar("TResponse")


class Client:
    """Тонкая обёртка над aiohttp-сессией, привязанная к tg_user_id.

    Подставляет заголовок X-BOT-USER-ID в каждый запрос. Сессию не создаёт и не
    закрывает — её жизненный цикл снаружи.
    """

    def __init__(
        self,
        session: ClientSession,
        base_url: str,
        tg_user_id: int | None,
    ) -> None:
        self._session = session
        self._tg_user_id = tg_user_id
        self._base_url = base_url.rstrip("/")

    @property
    def _headers(self) -> dict[str, str]:
        if self._tg_user_id is None:
            return {}

        return {"X-BOT-USER-ID": str(self._tg_user_id)}

    async def _request(
        self,
        method: Method,
        path: str,
        *,
        json: Any | None = None,
        params: dict[str, Any] | None = None,
    ) -> Any:
        url = f"{self._base_url}{path}"

        async with self._session.request(
            method,
            url,
            json=json,
            params=params,
            headers=self._headers,
        ) as response:
            if response.status == 204:
                return None

            payload = await response.json()
            return payload

    async def get(
        self,
        path: str,
        response_model: type[TResponse],
        *,
        params: dict[str, Any] | None = None,
    ) -> TResponse:
        payload = await self._request("GET", path, params=params)
        return TypeAdapter(response_model).validate_python(payload)

    async def post(
        self,
        path: str,
        response_model: type[TResponse],
        *,
        json: Any | None = None,
    ) -> TResponse:
        payload = await self._request("POST", path, json=json)
        return TypeAdapter(response_model).validate_python(payload)

    async def patch(
        self,
        path: str,
        response_model: type[TResponse],
        *,
        json: Any | None = None,
    ) -> TResponse:
        payload = await self._request("PATCH", path, json=json)
        return TypeAdapter(response_model).validate_python(payload)

    async def delete(self, path: str) -> None:
        await self._request("DELETE", path)
