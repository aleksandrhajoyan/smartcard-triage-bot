import asyncio
from datetime import datetime, timezone

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from sheets import _get_or_create_sheet, HEADER

BASE = "/triage-api"

app = FastAPI(title="SmartCard Triage API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

STATUS_ORDER = ["🔴 EMERGENCY", "🟡 Needs Review", "🟢 FAQ Resolved", "🔵 In Queue"]


def _parse_rows(rows: list[list[str]]) -> list[dict]:
    if not rows or len(rows) < 2:
        return []
    records = []
    for row in rows[1:]:
        padded = row + [""] * (len(HEADER) - len(row))
        records.append({
            "timestamp": padded[0],
            "user_id": padded[1],
            "username": padded[2],
            "full_name": padded[3],
            "message": padded[4],
            "status": padded[5],
            "menu_action": padded[6],
        })
    return records


@app.get(f"{BASE}/logs")
async def get_logs(
    status: str | None = Query(None, description="Filter by triage status"),
    search: str | None = Query(None, description="Search by user_id or username"),
    limit: int = Query(200, ge=1, le=1000),
):
    ws = await asyncio.to_thread(_get_or_create_sheet)
    rows = await asyncio.to_thread(ws.get_all_values)
    records = _parse_rows(rows)

    if status:
        records = [r for r in records if r["status"] == status]

    if search:
        q = search.lower()
        records = [
            r for r in records
            if q in r["user_id"].lower() or q in r["username"].lower() or q in r["full_name"].lower()
        ]

    records = list(reversed(records))[:limit]

    return {
        "total": len(records),
        "logs": records,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get(f"{BASE}/stats")
async def get_stats():
    ws = await asyncio.to_thread(_get_or_create_sheet)
    rows = await asyncio.to_thread(ws.get_all_values)
    records = _parse_rows(rows)

    counts: dict[str, int] = {}
    for r in records:
        s = r["status"] or "Unknown"
        counts[s] = counts.get(s, 0) + 1

    return {
        "total": len(records),
        "by_status": counts,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get(f"{BASE}/healthz")
async def healthz():
    return {"status": "ok"}
