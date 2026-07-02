from .types import InvitationResponse


def format_invitation_card(item: InvitationResponse, page: int, total: int) -> str:
    visit = "✅ Придут" if item.is_plan_visit else "❌ Не придут"

    guests_lines = "\n".join(f"  {i}. {g.full_name}" for i, g in enumerate(item.guests, 1))
    guests_block = guests_lines if guests_lines else "  —"

    drinks = ", ".join(d.title for d in item.drinks) if item.drinks else "—"
    music = item.music or "—"
    comment = item.comment or "—"

    return (
        f"<b>Приглашение #{item.id}</b>  [{page}/{total}]\n"
        f"\n"
        f"{visit}\n"
        f"\n"
        f"<b>Гости:</b>\n{guests_block}\n"
        f"\n"
        f"<b>Напитки:</b> {drinks}\n"
        f"<b>Музыка:</b> {music}\n"
        f"<b>Комментарий:</b> {comment}"
    )
