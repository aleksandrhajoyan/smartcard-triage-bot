import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

const PYTHON_API = "http://localhost:8000/triage-api";

async function proxyToFastAPI(req: Request, res: Response, path: string) {
  const url = new URL(PYTHON_API + path);
  const searchParams = new URLSearchParams(req.query as Record<string, string>);
  url.search = searchParams.toString();

  try {
    const upstream = await fetch(url.toString(), {
      method: req.method,
      headers: { "Content-Type": "application/json" },
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: "Triage API unavailable. Make sure the bot is running." });
  }
}

router.get("/triage/logs", (req, res) => proxyToFastAPI(req, res, "/logs"));
router.get("/triage/stats", (req, res) => proxyToFastAPI(req, res, "/stats"));
router.get("/triage/healthz", (req, res) => proxyToFastAPI(req, res, "/healthz"));

export default router;
