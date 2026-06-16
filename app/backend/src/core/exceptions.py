from fastapi import status


class DomainException(Exception):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_message = "Internal Server Error"

    def __init__(self, message: str | None = None) -> None:
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class BadRequestException(DomainException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_message = "Bad request"


class ForbiddenException(DomainException):
    status_code = status.HTTP_403_FORBIDDEN
    default_message = "Forbidden"


class NotFoundException(DomainException):
    status_code = status.HTTP_404_NOT_FOUND
    default_message = "Not found"


class ConflictException(DomainException):
    status_code = status.HTTP_409_CONFLICT
    default_message = "Conflict"
