from aiogram.fsm.state import State, StatesGroup


class FSMInvitationState(StatesGroup):
    plan_visit = State()
    guests = State()
    drinks = State()
    music = State()
    comment = State()
