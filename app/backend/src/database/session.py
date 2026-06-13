from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from core.config import Settings


def create_engine(settings: Settings) -> AsyncEngine:
    return create_async_engine(
        url=str(settings.db.url), echo=settings.app_debug, pool_pre_ping=True
    )


def create_session(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
    )
