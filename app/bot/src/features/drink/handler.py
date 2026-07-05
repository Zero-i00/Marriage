from contextlib import suppress

from aiogram import Bot, Router
from aiogram.exceptions import TelegramBadRequest
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message
from soft_http.exceptions.response import ClientResponseException

from shared.routes import Route

from .keyboard import (
    CallbackDrinkCreate,
    CallbackDrinkDestroy,
    CallbackDrinkDestroyMenu,
    CallbackDrinkListMenu,
    drink_delete_keyboard,
    drink_menu_keyboard,
)
from .service import drink_service
from .state import FSMDrinkState
from .types import DrinkRequest
from .utils import format_drink_list

router = Router(name="drink")


async def render_drink_menu(target: Message | CallbackQuery) -> None:
    items = await drink_service.list()
    text = format_drink_list(items)
    keyboard = drink_menu_keyboard(items)

    if isinstance(target, CallbackQuery):
        await target.message.edit_text(text, reply_markup=keyboard)
        await target.answer()
    else:
        await target.answer(text, reply_markup=keyboard)


@router.message(Command(Route.DRINK))
async def get_drink_list_handler(message: Message) -> None:
    await render_drink_menu(message)


@router.callback_query(CallbackDrinkListMenu.filter())
async def back_to_menu(callback: CallbackQuery) -> None:
    await render_drink_menu(callback)


@router.callback_query(CallbackDrinkCreate.filter())
async def create_drink_start(callback: CallbackQuery, state: FSMContext) -> None:
    await state.update_data(menu_message_id=callback.message.message_id)
    await state.set_state(FSMDrinkState.title)
    await callback.message.edit_text("Пришли название напитка:")
    await callback.answer()


@router.message(FSMDrinkState.title)
async def create_drink_submit(message: Message, state: FSMContext, bot: Bot) -> None:
    title = message.text.strip() if message.text else ""

    if not (1 <= len(title) <= 255):
        await message.answer("Название должно быть от 1 до 255 символов. Попробуй ещё раз:")
        return

    try:
        await drink_service.create(DrinkRequest(title=title))
    except ClientResponseException as e:
        if e.status_code == 409:
            await message.answer("Такой напиток уже есть. Попробуй другое название:")
            return
        raise

    # чистим чат: убираем введённое админом название напитка
    with suppress(TelegramBadRequest):
        await message.delete()

    data = await state.get_data()
    await state.clear()

    items = await drink_service.list()
    text = format_drink_list(items)
    keyboard = drink_menu_keyboard(items)

    menu_message_id = data.get("menu_message_id")
    if menu_message_id:
        await bot.edit_message_text(
            chat_id=message.chat.id,
            message_id=menu_message_id,
            text=text,
            reply_markup=keyboard,
        )
    else:
        await message.answer(text, reply_markup=keyboard)


@router.callback_query(CallbackDrinkDestroyMenu.filter())
async def show_delete_menu(callback: CallbackQuery) -> None:
    items = await drink_service.list()
    await callback.message.edit_text(
        "Выбери напиток для удаления:",
        reply_markup=drink_delete_keyboard(items),
    )
    await callback.answer()


@router.callback_query(CallbackDrinkDestroy.filter())
async def delete_drink(callback: CallbackQuery, callback_data: CallbackDrinkDestroy) -> None:
    try:
        await drink_service.destroy(callback_data.drink_id)
    except ClientResponseException as e:
        if e.status_code == 404:
            await callback.answer("Напиток уже удалён")
        else:
            raise
    else:
        await callback.answer("Удалено")

    await render_drink_menu(callback)
