from sqlalchemy.ext.asyncio import AsyncSession

from database.declarative import Base


class BaseRepository[Table: Base]:
    """Describes basic methods for working with tables."""

    model: type[Table]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
