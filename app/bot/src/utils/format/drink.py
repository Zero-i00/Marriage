from schemas.drink import SchemaDrinkResponse


def format_drink_list(items: list[SchemaDrinkResponse]) -> str:
    if not items:
        return "🍷 Список напитков пуст"
    lines = "\n".join(f"{i}. {d.title}" for i, d in enumerate(items, 1))
    return f"🍷 Напитки:\n{lines}"
