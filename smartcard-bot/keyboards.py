from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from triage import MENU_RESPONSES


def main_menu() -> InlineKeyboardMarkup:
    buttons = []
    for key, item in MENU_RESPONSES.items():
        buttons.append([InlineKeyboardButton(text=item["label"], callback_data=f"menu:{key}")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)
