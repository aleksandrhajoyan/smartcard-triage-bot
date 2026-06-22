import re
from config import EMERGENCY_KEYWORDS, TRIAGE_STATUS


def classify_text(text: str) -> str:
    lower = text.lower()
    for kw in EMERGENCY_KEYWORDS:
        if re.search(r'\b' + re.escape(kw) + r'\b', lower):
            return TRIAGE_STATUS["EMERGENCY"]
    return TRIAGE_STATUS["NEEDS_REVIEW"]


MENU_RESPONSES = {
    "lost_card": {
        "label": "🃏 Lost Card",
        "status": TRIAGE_STATUS["EMERGENCY"],
        "reply": (
            "🚨 <b>Lost Card — Emergency Protocol</b>\n\n"
            "Your case has been marked as <b>URGENT</b> and our emergency team has been notified.\n\n"
            "While you wait:\n"
            "• You can <b>temporarily freeze your card</b> via the mobile app → Cards → Freeze\n"
            "• Call our 24/7 hotline: <b>+X-XXX-XXX-XXXX</b>\n\n"
            "An agent will contact you shortly."
        ),
    },
    "fraud": {
        "label": "🚨 Fraud / Suspicious Activity",
        "status": TRIAGE_STATUS["EMERGENCY"],
        "reply": (
            "🚨 <b>Fraud Alert — Escalated to Security Team</b>\n\n"
            "Your report has been flagged as <b>HIGH PRIORITY</b>. Our fraud team has been alerted.\n\n"
            "Immediate steps:\n"
            "• Do <b>NOT</b> share OTPs or PINs with anyone\n"
            "• Freeze your card via app immediately if you haven't already\n"
            "• We will review your recent transactions within 15 minutes\n\n"
            "An agent will reach out to you very soon."
        ),
    },
    "blocked_account": {
        "label": "🔒 Blocked Account / Card",
        "status": TRIAGE_STATUS["EMERGENCY"],
        "reply": (
            "🔒 <b>Account Block — Urgent Review</b>\n\n"
            "Your blocked account case has been escalated.\n\n"
            "• If you blocked it yourself via the app, go to <b>Settings → Security → Unblock</b>\n"
            "• If it was blocked by our system, an agent will review it within 30 minutes\n\n"
            "We've logged your case and you'll hear from us shortly."
        ),
    },
    "app_issues": {
        "label": "📱 App / Tech Issues",
        "status": TRIAGE_STATUS["NEEDS_REVIEW"],
        "reply": (
            "📱 <b>App & Technical Support</b>\n\n"
            "Your issue has been queued for our tech support team.\n\n"
            "Quick fixes to try first:\n"
            "• Force-close and reopen the app\n"
            "• Check your internet connection\n"
            "• Update the app to the latest version\n"
            "• Try logging out and back in\n\n"
            "If the issue persists, a support agent will assist you within 2 hours."
        ),
    },
    "exchange_rate": {
        "label": "💱 Exchange Rates",
        "status": TRIAGE_STATUS["FAQ_RESOLVED"],
        "reply": (
            "💱 <b>Current Exchange Rates</b>\n\n"
            "You can find live exchange rates in the app:\n"
            "<b>Home → Currency Converter</b>\n\n"
            "Or visit our website: <b>bank.example.com/rates</b>\n\n"
            "Rates are updated every 15 minutes during business hours."
        ),
    },
    "atm_locations": {
        "label": "🏧 ATM Locations",
        "status": TRIAGE_STATUS["FAQ_RESOLVED"],
        "reply": (
            "🏧 <b>Find the Nearest ATM</b>\n\n"
            "Use our ATM locator:\n"
            "• <b>In-app:</b> Home → ATM Locator\n"
            "• <b>Website:</b> bank.example.com/atm-finder\n\n"
            "We have 2,000+ ATMs across the country with zero withdrawal fees for our customers."
        ),
    },
    "general_inquiry": {
        "label": "💬 General Inquiry",
        "status": TRIAGE_STATUS["IN_QUEUE"],
        "reply": (
            "💬 <b>General Support Queue</b>\n\n"
            "Your inquiry has been added to the support queue.\n\n"
            "Expected wait time: <b>1–3 hours</b> during business hours.\n\n"
            "You can also describe your issue here and our bot will try to help, "
            "or a human agent will pick it up shortly."
        ),
    },
}
