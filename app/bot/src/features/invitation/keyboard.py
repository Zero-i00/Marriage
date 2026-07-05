from aiogram.filters.callback_data import CallbackData
from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder

from features.drink.types import DrinkResponse


class CallbackInvitationPage(CallbackData, prefix="invitation:page", sep="|"):
    page: int


class CallbackInvitationCreate(CallbackData, prefix="invitation:create", sep="|"):
    pass


class CallbackInvitationDestroy(CallbackData, prefix="invitation:destroy", sep="|"):
    invitation_id: int


class CallbackInvitationPlanVisit(CallbackData, prefix="invitation:plan_visit", sep="|"):
    value: bool


class CallbackInvitationToggleDrink(CallbackData, prefix="invitation:toggle_drink", sep="|"):
    drink_id: int


class CallbackInvitationDrinksConfirm(CallbackData, prefix="invitation:drinks_confirm", sep="|"):
    pass


class CallbackInvitationSkip(CallbackData, prefix="invitation:skip", sep="|"):
    pass


def invitation_pagination_keyboard(
    page: int, total: int, invitation_id: int
) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    nav_count = 1
    if page > 0:
        builder.button(text="◀", callback_data=CallbackInvitationPage(page=page - 1))
        nav_count += 1
    builder.button(text=f"{page + 1}/{total}", callback_data=CallbackInvitationPage(page=page))
    if page < total - 1:
        builder.button(text="▶", callback_data=CallbackInvitationPage(page=page + 1))
        nav_count += 1
    builder.button(text="➕ Добавить", callback_data=CallbackInvitationCreate())
    builder.button(
        text="🗑 Удалить",
        callback_data=CallbackInvitationDestroy(invitation_id=invitation_id),
    )
    builder.adjust(nav_count, 2)
    return builder.as_markup()


def invitation_empty_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="➕ Добавить", callback_data=CallbackInvitationCreate())
    return builder.as_markup()


def plan_visit_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="✅ Да", callback_data=CallbackInvitationPlanVisit(value=True))
    builder.button(text="❌ Нет", callback_data=CallbackInvitationPlanVisit(value=False))
    builder.adjust(2)
    return builder.as_markup()


def drinks_select_keyboard(
    drinks: list[DrinkResponse], selected: list[int]
) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for drink in drinks:
        prefix = "✅ " if drink.id in selected else ""
        builder.button(
            text=f"{prefix}{drink.title}",
            callback_data=CallbackInvitationToggleDrink(drink_id=drink.id),
        )
    builder.button(text="Готово →", callback_data=CallbackInvitationDrinksConfirm())
    n = len(drinks)
    row_sizes = [2] * (n // 2) + ([1] if n % 2 else []) + [1]
    builder.adjust(*row_sizes)
    return builder.as_markup()


def skip_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="⏭ Пропустить", callback_data=CallbackInvitationSkip())
    return builder.as_markup()
