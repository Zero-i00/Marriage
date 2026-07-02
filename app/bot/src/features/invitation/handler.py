from aiogram import Bot, Router
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from features.drink.service import drink_service
from shared.routes import Route

from .keyboard import (
    CallbackInvitationCreate,
    CallbackInvitationDestroy,
    CallbackInvitationDrinksConfirm,
    CallbackInvitationPage,
    CallbackInvitationPlanVisit,
    CallbackInvitationSkip,
    CallbackInvitationToggleDrink,
    drinks_select_keyboard,
    invitation_pagination_keyboard,
    invitation_empty_keyboard,
    plan_visit_keyboard,
    skip_keyboard,
)
from .service import invitation_service
from .state import FSMInvitationState
from .types import InvitationRequest
from ..guest.types import GuestRequest
from .utils import format_invitation_card

router = Router(name="invitation")


async def render_invitation_card(target: Message | CallbackQuery, page: int) -> None:
    items = await invitation_service.list()
    if not items:
        text = "📋 Приглашений пока нет"
        keyboard = invitation_empty_keyboard()
        if isinstance(target, CallbackQuery):
            await target.message.edit_text(text, reply_markup=keyboard)
            await target.answer()
        else:
            await target.answer(text, reply_markup=keyboard)
        return

    page = max(0, min(page, len(items) - 1))
    item = items[page]
    text = format_invitation_card(item, page + 1, len(items))
    keyboard = invitation_pagination_keyboard(page, len(items), item.id)
    if isinstance(target, CallbackQuery):
        await target.message.edit_text(text, reply_markup=keyboard, parse_mode="HTML")
        await target.answer()
    else:
        await target.answer(text, reply_markup=keyboard, parse_mode="HTML")


@router.message(Command(Route.INVITATION))
async def get_invitation_list_handler(message: Message) -> None:
    await render_invitation_card(message, page=0)


@router.callback_query(CallbackInvitationPage.filter())
async def paginate_invitation(
    callback: CallbackQuery, callback_data: CallbackInvitationPage
) -> None:
    await render_invitation_card(callback, callback_data.page)


@router.callback_query(CallbackInvitationDestroy.filter())
async def destroy_invitation(
    callback: CallbackQuery, callback_data: CallbackInvitationDestroy
) -> None:
    await invitation_service.destroy(callback_data.invitation_id)
    await callback.answer("Удалено")
    await render_invitation_card(callback, page=0)


# --- Creation FSM ---


@router.callback_query(CallbackInvitationCreate.filter())
async def create_start(callback: CallbackQuery, state: FSMContext) -> None:
    await state.update_data(menu_message_id=callback.message.message_id)
    await state.set_state(FSMInvitationState.plan_visit)
    await callback.message.edit_text(
        "Гости планируют прийти на свадьбу?",
        reply_markup=plan_visit_keyboard(),
    )
    await callback.answer()


@router.callback_query(CallbackInvitationPlanVisit.filter(), FSMInvitationState.plan_visit)
async def create_plan_visit(
    callback: CallbackQuery,
    callback_data: CallbackInvitationPlanVisit,
    state: FSMContext,
) -> None:
    await state.update_data(is_plan_visit=callback_data.value)
    await state.set_state(FSMInvitationState.guests)
    await callback.message.edit_text("Введи имена гостей (каждый с новой строки):")
    await callback.answer()


@router.message(FSMInvitationState.guests)
async def create_guests(message: Message, state: FSMContext, bot: Bot) -> None:
    names = [line.strip() for line in (message.text or "").splitlines() if line.strip()]
    if not names:
        await message.answer("Введи хотя бы одно имя:")
        return
    drinks = await drink_service.list()
    await state.update_data(guests=names, selected_drink_ids=[])
    await state.set_state(FSMInvitationState.drinks)
    data = await state.get_data()
    await bot.edit_message_text(
        chat_id=message.chat.id,
        message_id=data["menu_message_id"],
        text="Выбери напитки:",
        reply_markup=drinks_select_keyboard(drinks, []),
    )


@router.callback_query(CallbackInvitationToggleDrink.filter(), FSMInvitationState.drinks)
async def create_toggle_drink(
    callback: CallbackQuery,
    callback_data: CallbackInvitationToggleDrink,
    state: FSMContext,
) -> None:
    data = await state.get_data()
    selected: list[int] = list(data.get("selected_drink_ids", []))
    if callback_data.drink_id in selected:
        selected.remove(callback_data.drink_id)
    else:
        selected.append(callback_data.drink_id)
    await state.update_data(selected_drink_ids=selected)
    drinks = await drink_service.list()
    await callback.message.edit_reply_markup(reply_markup=drinks_select_keyboard(drinks, selected))
    await callback.answer()


@router.callback_query(CallbackInvitationDrinksConfirm.filter(), FSMInvitationState.drinks)
async def create_drinks_confirm(callback: CallbackQuery, state: FSMContext) -> None:
    await state.set_state(FSMInvitationState.music)
    await callback.message.edit_text("Музыкальные пожелания:", reply_markup=skip_keyboard())
    await callback.answer()


@router.callback_query(CallbackInvitationSkip.filter(), FSMInvitationState.music)
async def create_music_skip(callback: CallbackQuery, state: FSMContext) -> None:
    await state.update_data(music=None)
    await state.set_state(FSMInvitationState.comment)
    await callback.message.edit_text("Комментарий:", reply_markup=skip_keyboard())
    await callback.answer()


@router.message(FSMInvitationState.music)
async def create_music(message: Message, state: FSMContext, bot: Bot) -> None:
    await state.update_data(music=message.text.strip() or None)
    await state.set_state(FSMInvitationState.comment)
    data = await state.get_data()
    await bot.edit_message_text(
        chat_id=message.chat.id,
        message_id=data["menu_message_id"],
        text="Комментарий:",
        reply_markup=skip_keyboard(),
    )


@router.callback_query(CallbackInvitationSkip.filter(), FSMInvitationState.comment)
async def create_comment_skip(callback: CallbackQuery, state: FSMContext) -> None:
    await state.update_data(comment=None)
    data = await state.get_data()
    await state.clear()
    await _submit(data)
    await render_invitation_card(callback, page=0)


@router.message(FSMInvitationState.comment)
async def create_comment(message: Message, state: FSMContext, bot: Bot) -> None:
    await state.update_data(comment=message.text.strip() or None)
    data = await state.get_data()
    await state.clear()
    await _submit(data)
    items = await invitation_service.list()
    page = max(0, len(items) - 1)
    if items:
        item = items[page]
        await bot.edit_message_text(
            chat_id=message.chat.id,
            message_id=data["menu_message_id"],
            text=format_invitation_card(item, page + 1, len(items)),
            reply_markup=invitation_pagination_keyboard(page, len(items), item.id),
            parse_mode="HTML",
        )
    else:
        await bot.edit_message_text(
            chat_id=message.chat.id,
            message_id=data["menu_message_id"],
            text="📋 Приглашений пока нет",
            reply_markup=invitation_empty_keyboard(),
        )


async def _submit(data: dict) -> None:
    await invitation_service.create(
        InvitationRequest(
            is_plan_visit=data["is_plan_visit"],
            music=data.get("music"),
            comment=data.get("comment"),
            drink_ids=data.get("selected_drink_ids", []),
            guests=[GuestRequest(full_name=name) for name in data["guests"]],
        )
    )
