import os
import json

TELEGRAM_BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
TELEGRAM_ALERT_GROUP_ID = int(os.environ["TELEGRAM_ALERT_GROUP_ID"])
GOOGLE_SHEET_ID = os.environ["GOOGLE_SHEET_ID"]

_raw_json = os.environ["GOOGLE_SERVICE_ACCOUNT_JSON"]
GOOGLE_SERVICE_ACCOUNT_INFO = json.loads(_raw_json)

EMERGENCY_KEYWORDS = [
    "fraud", "stolen", "lost", "blocked", "hack", "hacked",
    "unauthorized", "scam", "stolen card", "lost card", "block card",
    "compromised", "phishing", "suspicious", "unknown transaction",
    "card stolen", "account blocked", "freeze", "emergency",
]

TRIAGE_STATUS = {
    "EMERGENCY": "🔴 EMERGENCY",
    "NEEDS_REVIEW": "🟡 Needs Review",
    "FAQ_RESOLVED": "🟢 FAQ Resolved",
    "IN_QUEUE": "🔵 In Queue",
}
