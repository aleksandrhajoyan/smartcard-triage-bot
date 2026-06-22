import gspread
from google.oauth2.service_account import Credentials
from config import GOOGLE_SERVICE_ACCOUNT_INFO, GOOGLE_SHEET_ID, TRIAGE_STATUS

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

HEADER = ["Timestamp", "User ID", "Username", "Full Name", "Message", "Triage Status", "Menu Action"]

RED_BG = {"backgroundColor": {"red": 1.0, "green": 0.4, "blue": 0.4}}
YELLOW_BG = {"backgroundColor": {"red": 1.0, "green": 0.95, "blue": 0.4}}
GREEN_BG = {"backgroundColor": {"red": 0.6, "green": 0.95, "blue": 0.6}}
BLUE_BG = {"backgroundColor": {"red": 0.6, "green": 0.8, "blue": 1.0}}

STATUS_COLORS = {
    TRIAGE_STATUS["EMERGENCY"]: RED_BG,
    TRIAGE_STATUS["NEEDS_REVIEW"]: YELLOW_BG,
    TRIAGE_STATUS["FAQ_RESOLVED"]: GREEN_BG,
    TRIAGE_STATUS["IN_QUEUE"]: BLUE_BG,
}


def _get_client() -> gspread.Client:
    creds = Credentials.from_service_account_info(GOOGLE_SERVICE_ACCOUNT_INFO, scopes=SCOPES)
    return gspread.authorize(creds)


def _get_or_create_sheet() -> gspread.Worksheet:
    client = _get_client()
    spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
    try:
        ws = spreadsheet.worksheet("Triage Log")
    except gspread.WorksheetNotFound:
        ws = spreadsheet.add_worksheet(title="Triage Log", rows=1000, cols=10)
        ws.append_row(HEADER)
        _format_header(ws)
    return ws


def _format_header(ws: gspread.Worksheet):
    ws.format("A1:G1", {
        "textFormat": {"bold": True},
        "backgroundColor": {"red": 0.2, "green": 0.2, "blue": 0.2},
        "horizontalAlignment": "CENTER",
    })


def log_interaction(
    timestamp: str,
    user_id: int,
    username: str,
    full_name: str,
    message: str,
    status: str,
    menu_action: str = "",
) -> int:
    ws = _get_or_create_sheet()
    row = [timestamp, str(user_id), username, full_name, message, status, menu_action]
    ws.append_row(row, value_input_option="USER_ENTERED")

    all_values = ws.get_all_values()
    row_index = len(all_values)

    color = STATUS_COLORS.get(status, BLUE_BG)
    cell_range = f"A{row_index}:G{row_index}"
    ws.format(cell_range, color)

    return row_index
