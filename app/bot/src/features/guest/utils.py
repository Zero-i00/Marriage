from features.invitation.types import InvitationResponse


def _format_group(title: str, names: list[str]) -> str:
    lines = "\n".join(f"{i}. {name}" for i, name in enumerate(names, 1)) if names else "—"
    return f"{title}\n{lines}"


def format_guest_list(items: list[InvitationResponse]) -> str:
    coming: list[str] = []
    not_coming: list[str] = []

    for item in items:
        target = coming if item.is_plan_visit else not_coming
        target.extend(g.full_name for g in item.guests)

    if not coming and not not_coming:
        return "👤 Список гостей пуст"

    return (
        "👤 Гости\n\n"
        f"{_format_group('✅ Придут:', coming)}\n\n"
        f"{_format_group('❌ Не придут:', not_coming)}"
    )
