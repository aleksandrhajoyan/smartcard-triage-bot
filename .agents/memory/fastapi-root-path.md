---
name: FastAPI root_path ASGI behavior
description: Setting root_path in FastAPI() causes ASGI to strip that prefix before route matching — routes registered with the prefix will return 404.
---

## Rule
Do NOT pass `root_path` to `FastAPI(...)` when you want routes registered with a full path like `/triage-api/logs` to match incoming requests at that same path.

**Why:** FastAPI's `root_path` sets the ASGI root path, which tells Starlette to strip that prefix from the incoming path BEFORE matching routes. So a route declared as `@app.get("/triage-api/logs")` will only match the stripped path `/logs`, not the full `/triage-api/logs`. OpenAPI schema still shows the full path (misleading), but actual routing fails.

**How to apply:** When a FastAPI app serves routes under a prefix (e.g. `/triage-api`), just declare the full path in the route decorator and leave `root_path` unset:
```python
app = FastAPI(title="My API")  # no root_path
@app.get("/triage-api/logs")  # full path, works correctly
```

## Proxy registration for Python services
Cannot use `createArtifact` (no Python type) or write `artifact.toml` directly (blocked). Workaround: add a proxy route to the existing Express api-server that forwards to Python's localhost port. Use Node's native `fetch` inside an Express route handler — no extra packages needed.
