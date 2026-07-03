from aiogram.fsm.state import State, StatesGroup


class FSMDrinkState(StatesGroup):
    title = State()
