class ClientException(Exception):
    """Базовая ошибка ответа backend (статус >= 400).

    Подклассы фиксируют свой `status_code`; для немапленных статусов поднимается
    сам `ClientException` с переданным статусом.
    """

    status_code: int = 0

    def __init__(self, message: str, *, status_code: int | None = None) -> None:
        if status_code is not None:
            self.status_code = status_code
        super().__init__(f"[{self.status_code}] {message}")
        self.message = message


class BadRequestError(ClientException):
    status_code = 400


class ForbiddenError(ClientException):
    status_code = 403


class NotFoundError(ClientException):
    status_code = 404


class ConflictError(ClientException):
    status_code = 409
