from typing import Generic, TypeVar

from sqlalchemy.ext.asyncio import AsyncSession

from database.declarative import Base

Table = TypeVar("Table", bound=Base)

class BaseRepository(Generic[Table]):
    """Describes basic methods for working with tables."""

    table: type[Table]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
