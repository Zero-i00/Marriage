from aiogram.filters.callback_data import CallbackData
from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder

from .types import DrinkResponse


class CallbackDrinkCreate(CallbackData, prefix="drink:create", sep="|"):
    pass


class CallbackDrinkListMenu(CallbackData, prefix="drink:list_menu", sep="|"):
    pass


class CallbackDrinkDestroyMenu(CallbackData, prefix="drink:destroy_menu", sep="|"):
    pass


class CallbackDrinkDestroy(CallbackData, prefix="drink:destroy", sep="|"):
    drink_id: int


def drink_menu_keyboard(items: list[DrinkResponse]) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="➕ Добавить", callback_data=CallbackDrinkCreate())
    if items:
        builder.button(text="🗑 Удалить", callback_data=CallbackDrinkDestroyMenu())
    builder.adjust(2)
    return builder.as_markup()


def drink_delete_keyboard(items: list[DrinkResponse]) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for item in items:
        builder.button(text=item.title, callback_data=CallbackDrinkDestroy(drink_id=item.id))
    builder.button(text="↩ Назад", callback_data=CallbackDrinkListMenu())

    n = len(items)
    row_sizes = [3] * (n // 3) + ([n % 3] if n % 3 else []) + [1]
    builder.adjust(*row_sizes)

    return builder.as_markup()
