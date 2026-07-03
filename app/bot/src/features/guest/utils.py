from .types import GuestResponse


def format_guest_list(items: list[GuestResponse]) -> str:
    if not items:
        return "👤 Список гостей пуст"
    lines = "\n".join(f"{i}. {g.full_name}" for i, g in enumerate(items, 1))
    return f"👤 Гости:\n{lines}"
