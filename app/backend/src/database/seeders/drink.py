from anyio.functools import lru_cache
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import DrinkModel


class DrinkSeeder:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.table = DrinkModel
        self.data = [
            "Игристое",
            "Красное сухое вино",
            "Красное полусладкое вино",
            "Белое сухое вино",
            "Белое полусладкое вино",
            "Коньяк",
            "Виски",
            "Водка",
            "Приду со своим",
        ]

    async def run(self) -> None:
        existing = await self.session.scalars(select(self.table.title))
        existing_titles = set(existing.all())

        new_drinks = [
            self.table(title=title) for title in self.data if title not in existing_titles
        ]

        if not new_drinks:
            return

        self.session.add_all(new_drinks)
        await self.session.commit()


@lru_cache
def get_drink_seeder(session: AsyncSession) -> DrinkSeeder:
    return DrinkSeeder(session)
