# Deployment Guide — 100% Free, No Credit Card

This deploys:

- **Backend + PostgreSQL → Render** (free tier, no card)
- **Frontend → Netlify** (free tier, no card)

Everything below costs **₹0**. Render and Netlify free tiers do **not** require
a credit card and never auto-bill you.

> **Free-tier behaviour (not charges):**
> - The Render backend **sleeps after ~15 min idle**; the next request wakes it
>   in ~50s, then it's fast again.
> - Render's free PostgreSQL is free but **expires after 30 days** (suspended,
>   never billed). For a DB that never expires, use the **Neon** option in
>   Step 2B — also free, no card.

---

## Overview

```
   Netlify (static React)              Render (Docker FastAPI)         Postgres
 ┌────────────────────────┐  HTTPS   ┌────────────────────────┐  SQL ┌─────────┐
 │ https://<you>.netlify  │ ───────▶ │ https://<you>.onrender │ ───▶ │ Render  │
 │  VITE_API_URL = backend│   CORS   │  CORS_ORIGINS = netlify│      │  or Neon│
 └────────────────────────┘          └────────────────────────┘      └─────────┘
```

Two env vars do all the wiring:
- Frontend `VITE_API_URL` → the backend's public URL (baked in at build time).
- Backend `CORS_ORIGINS` → the frontend's public URL (so the browser is allowed).

---

## Step 0 — Push the repo to GitHub (required by both platforms)

Both Render and Netlify deploy from a Git repo.

```bash
# create an empty repo on github.com first (e.g. "InventoryManagementSystem"),
# then from the project root:
git remote add origin https://github.com/<your-username>/InventoryManagementSystem.git
git push -u origin main
```

> `.env` is git-ignored, so no secrets are pushed. Good.

---

## Step 1 — Deploy the backend on Render

Pick **1A (Blueprint, one click)** — it creates the DB + backend together and
wires them automatically using the included `render.yaml`.

### 1A. Blueprint (recommended)

1. Go to <https://dashboard.render.com> → sign up (GitHub login, **no card**).
2. **New → Blueprint** → connect your GitHub repo.
3. Render detects `render.yaml` and shows a `inventory-db` (Postgres) + an
   `inventory-backend` (web service). Click **Apply**.
4. Wait for the build. The backend runs `alembic upgrade head` on boot, so the
   schema is created automatically. `DATABASE_URL` is injected for you.
5. Copy the backend URL, e.g. `https://inventory-backend.onrender.com`.
   Verify: open `https://inventory-backend.onrender.com/health` → `{"status":"ok"}`.

> Leave `CORS_ORIGINS` for now — you'll set it in Step 3 once you have the
> Netlify URL.

### 1B. Manual (if you prefer clicking through, or skip the Blueprint)

1. **New → PostgreSQL** → Name `inventory-db`, Plan **Free** → Create. Copy its
   **Internal Database URL**.
2. **New → Web Service** → connect the repo →
   - **Root Directory:** `backend`
   - **Runtime:** Docker (auto-detected from `backend/Dockerfile`)
   - **Instance Type:** Free
   - **Health Check Path:** `/health`
   - **Environment variables:**
     - `DATABASE_URL` = the Internal Database URL from step 1
     - `LOW_STOCK_THRESHOLD` = `10`
   - Create. (You'll add `CORS_ORIGINS` in Step 3.)

> The app auto-fixes the DB URL driver (`postgres://` → `postgresql+psycopg2://`),
> so paste Render's URL as-is.

---

## Step 2 — (Optional) Use Neon for a Postgres that never expires

Skip this if you used Render's Postgres and don't mind the 30-day reset.

### 2B. Neon (free, permanent, no card)

1. Go to <https://neon.tech> → sign up free.
2. Create a project → copy the **connection string**
   (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`).
3. In your Render **backend** service → **Environment** → set
   `DATABASE_URL` to that Neon string (replace Render's). Save → it redeploys.

`sslmode=require` in the URL is handled automatically. The app normalizes the
driver, so no edits needed.

---

## Step 3 — Deploy the frontend on Netlify

1. Go to <https://app.netlify.com> → **Add new site → Import an existing
   project** → pick your GitHub repo.
2. Netlify reads `frontend/netlify.toml`, so build settings auto-fill:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. **Before the first build**, add the environment variable
   (Site configuration → Environment variables):
   - `VITE_API_URL` = your Render backend URL from Step 1
     (e.g. `https://inventory-backend.onrender.com`) — **no trailing slash**.
4. **Deploy site.** Copy the resulting URL, e.g.
   `https://inventory-mgmt.netlify.app`.

> `VITE_API_URL` is baked in at build time. If you change it later, trigger a
> **redeploy** so the new value takes effect.

---

## Step 4 — Wire CORS (connect the two)

1. In Render → **backend** service → **Environment** → add/set:
   - `CORS_ORIGINS` = your Netlify URL (e.g. `https://inventory-mgmt.netlify.app`)
     — **exact origin, no trailing slash**. Multiple origins are comma-separated.
2. Save → Render redeploys the backend automatically.

---

## Step 5 — Verify it's live

```bash
# Backend health (first call may take ~50s if it was asleep)
curl https://inventory-backend.onrender.com/health        # {"status":"ok"}

# Create a product through the public API
curl -X POST https://inventory-backend.onrender.com/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","sku":"T-1","price":999,"quantity":5}'
```

Then open your Netlify URL and:
- the Dashboard loads,
- add a product / customer / order — and confirm no CORS error in the browser
  console (if you see one, re-check `CORS_ORIGINS` matches the Netlify origin
  exactly).

API docs are public too: `https://inventory-backend.onrender.com/docs`.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| First request hangs ~50s | Free backend was asleep; it's waking. Normal. |
| Browser console: CORS error | `CORS_ORIGINS` must equal the Netlify origin exactly (https, no trailing slash). Redeploy backend after changing. |
| Frontend calls `localhost:8000` | `VITE_API_URL` wasn't set at build time. Set it on Netlify and **redeploy**. |
| 404 on refreshing `/products` | SPA redirect missing — `frontend/netlify.toml` handles this; ensure base dir is `frontend`. |
| DB connection errors | Check `DATABASE_URL` is set; for Neon ensure `?sslmode=require` is present. |
| Backend build fails | Confirm Root Directory = `backend` so Render uses `backend/Dockerfile`. |
