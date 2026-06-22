import asyncio
import logging
from datetime import datetime, timezone

import uvicorn
from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import Message, CallbackQuery

from config import TELEGRAM_BOT_TOKEN, TELEGRAM_ALERT_GROUP_ID, TRIAGE_STATUS
from keyboards import main_menu
from triage import classify_text, MENU_RESPONSES
from sheets import log_interaction
from api import app as fastapi_app

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

bot = Bot(token=TELEGRAM_BOT_TOKEN)
dp = Dispatcher()

FASTAPI_PORT = 8000


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")


async def _send_emergency_alert(user_id: int, username: str, full_name: str, message: str, source: str):
    alert_text = (
        f"🚨 <b>EMERGENCY ALERT — SmartCard Triage Bot</b>\n\n"
        f"<b>User:</b> {full_name} (@{username}, ID: {user_id})\n"
        f"<b>Source:</b> {source}\n"
        f"<b>Message:</b>\n<i>{message[:500]}</i>\n\n"
        f"<b>Time:</b> {_now()}\n\n"
        f"⚠️ <b>Immediate attention required.</b>"
    )
    try:
        await bot.send_message(chat_id=TELEGRAM_ALERT_GROUP_ID, text=alert_text, parse_mode="HTML")
    except Exception as e:
        logger.error(f"Failed to send emergency alert: {e}")


@dp.message(CommandStart())
async def cmd_start(message: Message):
    name = message.from_user.full_name or "there"
    await message.answer(
        f"👋 Hello, <b>{name}</b>!\n\n"
        "Welcome to <b>SmartCard Support</b>.\n\n"
        "I can help you with card issues, account problems, and general inquiries.\n\n"
        "Please select a topic below, or simply <b>type your issue</b> and I'll route you to the right team:",
        parse_mode="HTML",
        reply_markup=main_menu(),
    )


@dp.message(F.text)
async def handle_free_text(message: Message):
    user = message.from_user
    text = message.text or ""
    status = classify_text(text)
    username = user.username or "no_username"
    full_name = user.full_name or "Unknown"

    try:
        log_interaction(
            timestamp=_now(),
            user_id=user.id,
            username=username,
            full_name=full_name,
            message=text,
            status=status,
        )
    except Exception as e:
        logger.error(f"Sheet logging error: {e}")

    if status == TRIAGE_STATUS["EMERGENCY"]:
        await _send_emergency_alert(user.id, username, full_name, text, source="Free Text")
        await message.answer(
            "🚨 <b>Emergency Detected</b>\n\n"
            "Your message has been flagged as <b>urgent</b> and our emergency team has been notified immediately.\n\n"
            "Please stay available — an agent will contact you very shortly.\n\n"
            "If this is a card emergency, you can also freeze your card now via the app.",
            parse_mode="HTML",
            reply_markup=main_menu(),
        )
    else:
        await message.answer(
            "🔵 <b>Your request has been logged</b>\n\n"
            "Our support team will review your message. If you need faster help, "
            "please select the most relevant option from the menu below:",
            parse_mode="HTML",
            reply_markup=main_menu(),
        )


@dp.callback_query(F.data.startswith("menu:"))
async def handle_menu_callback(callback: CallbackQuery):
    action_key = callback.data.split(":", 1)[1]
    user = callback.from_user
    username = user.username or "no_username"
    full_name = user.full_name or "Unknown"

    item = MENU_RESPONSES.get(action_key)
    if not item:
        await callback.answer("Unknown option. Please try again.")
        return

    status = item["status"]
    label = item["label"]

    try:
        log_interaction(
            timestamp=_now(),
            user_id=user.id,
            username=username,
            full_name=full_name,
            message=f"[Menu selection: {label}]",
            status=status,
            menu_action=label,
        )
    except Exception as e:
        logger.error(f"Sheet logging error: {e}")

    if status == TRIAGE_STATUS["EMERGENCY"]:
        await _send_emergency_alert(
            user.id, username, full_name,
            message=f"Selected menu option: {label}",
            source=f"Menu → {label}",
        )

    await callback.answer()
    await callback.message.answer(item["reply"], parse_mode="HTML", reply_markup=main_menu())


async def run_fastapi():
    config = uvicorn.Config(
        app=fastapi_app,
        host="0.0.0.0",
        port=FASTAPI_PORT,
        log_level="info",
    )
    server = uvicorn.Server(config)
    await server.serve()


async def main():
    logger.info(f"SmartCard Triage Bot starting (Telegram + FastAPI on :{FASTAPI_PORT})...")
    await asyncio.gather(
        dp.start_polling(bot),
        run_fastapi(),
    )


if __name__ == "__main__":
    asyncio.run(main())
