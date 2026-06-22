# SmartCard Triage & CRM Fullstack System

An automated routing, prioritization, and logging system for bank customer support via Telegram, integrated with a live Google Sheets CRM backend and a secure React-based Admin Dashboard.

## 🚀 Project Overview

**SmartCard Triage System** solves the problem of high-volume, repetitive support requests by filtering and prioritizing customer inquiries in real-time. It acts as an automated triage layer between the customer and human support agents. All interactions are logged into a centralized dashboard, instantly alerting the backend team for critical emergency events, while support operators can monitor, filter, and export live data via a secure web interface.

---

## 🛠 Core Features

### 1. Interactive Telegram Bot
Provides users with a structured 7-option interactive menu for instant navigation (Lost Card, Fraud, Blocked Account, App Issues, Exchange Rates, ATM Locations, General Inquiry).

### 2. Intelligent Keyword Scanner & Fallback Logic
* **Emergency Detection:** Free-text messages are continuously scanned. Typing emergency keywords (e.g., `fraud`, `stolen`, `lost`) automatically escalates the ticket.
* **Smart Fallback:** Unrecognized queries trigger a Fallback-handler, categorizing the ticket for human manual review rather than dropping the connection.

### 3. Full-Stack Admin Dashboard (React + FastAPI)
* **Live Monitoring:** React-based web interface fetching live triage data via a FastAPI backend layer.
* **Secure Access:** Password-protected entry with `localStorage` session management.
* **Search & Filter:** Instantly filter logs by User ID, Name, or specific Triage Status.
* **Data Export:** One-click CSV export of currently filtered data for operational reporting.

### 4. Live Google Sheets Backend Logging
Every interaction is synchronized instantly with a Google Spreadsheet via the **Google Sheets API v4**. Rows are color-coded dynamically based on urgency level:
* 🔴 **Red (`EMERGENCY`):** Critical alerts (e.g., fraud).
* 🟡 **Yellow (`Needs Review`):** Unmatched free-text messages.
* 🟢 **Green (`FAQ Resolved`):** Automated informational responses.
* 🔵 **Blue (`In Queue`):** Standard support tickets.

### 5. Instant Administrative Alerting
Emergency conditions bypass standard queues and fire high-priority alerts with full user telemetry directly to the internal administrative back-office Telegram group chat.

---

## 💻 Tech Stack

* **Core/Bot Engine:** Python 3.10+, `aiogram` (Asynchronous event handling)
* **Backend API:** FastAPI, Uvicorn
* **Frontend Dashboard:** React, Vite, Tailwind CSS
* **Proxy Server:** Node.js, Express
* **Database/Integration:** Google Sheets API v4
* **Deployment:** Replit Cloud (Concurrent execution via `asyncio.gather`)

---

## ⚙️ Setup & Installation

To deploy this project, configure the following **Environment Variables**:

1. `TELEGRAM_BOT_TOKEN`: The API token generated via `@BotFather`.
2. `TELEGRAM_ALERT_GROUP_ID`: Target chat ID for the internal administrative team.
3. `GOOGLE_SHEET_ID`: The ID extracted from your target Google Sheet URL.
4. `GOOGLE_SERVICE_ACCOUNT_JSON`: The flattened JSON key for a Google Service Account with Editor privileges.

*The system runs both the Telegram polling and FastAPI server concurrently in a single process.*
