# Inventory & Order Management System

A production-ready, fully containerized full-stack application for managing
**products, customers, orders, and inventory tracking**.

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (JavaScript) + Vite, React Router, Axios |
| Backend | Python + FastAPI + Uvicorn |
| Database | PostgreSQL 16 |
| ORM / Validation | SQLAlchemy 2.0 + Pydantic v2 |
| Containerization | Docker + Docker Compose |

---

## Architecture

```
┌──────────────┐   HTTP/CORS    ┌──────────────┐   SQL    ┌──────────────┐
│   frontend   │ ─────────────▶ │   backend    │ ───────▶ │  PostgreSQL  │
│ React + Nginx│   (browser)    │ FastAPI :8000│          │   db :5432   │
│    :3000     │                │              │          │ named volume │
└──────────────┘                └──────────────┘          └──────────────┘
```

The browser calls the backend API **directly** (`VITE_API_URL`); the backend
enables CORS for the frontend origin. PostgreSQL is only reachable on the
private Docker network and persists to a named volume (`pgdata`).

---

## Quick start (Docker — recommended)

> Requires Docker Desktop (or Docker Engine + Compose v2).

```bash
# 1. Clone and enter the project
git clone <your-repo-url> InventoryManagementSystem
cd InventoryManagementSystem

# 2. Create your environment file
cp .env.example .env          # edit credentials if you like

# 3. Build and start all three services
docker compose up --build
```

Then open:

- **Frontend UI** → http://localhost:3000
- **Backend API docs (Swagger)** → http://localhost:8000/docs
- **Health check** → http://localhost:8000/health

Stop with `Ctrl+C`, and remove containers with `docker compose down`
(add `-v` to also wipe the database volume).

---

## Running locally without Docker (optional)

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# point at a local Postgres instance:
export DATABASE_URL="postgresql+psycopg2://postgres:postgres@localhost:5432/inventory"
alembic upgrade head                      # create the schema
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env          # ensure VITE_API_URL=http://localhost:8000
npm run dev                   # serves on http://localhost:5173
```

---

## Environment variables

All configuration is via environment variables — **no credentials are
hardcoded**. See [.env.example](.env.example).

| Variable | Used by | Description |
|----------|---------|-------------|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | db, backend | Database credentials & name |
| `DATABASE_URL` | backend | Full SQLAlchemy connection string (built from the above in compose) |
| `CORS_ORIGINS` | backend | Comma-separated allowed frontend origins |
| `LOW_STOCK_THRESHOLD` | backend | Stock level at/below which products are "low stock" |
| `BACKEND_PORT` / `FRONTEND_PORT` | compose | Host ports |
| `VITE_API_URL` | frontend (build arg) | Backend base URL baked into the browser bundle |

---

## API reference

Base URL: `http://localhost:8000`. Interactive docs at `/docs`.

### Products
| Method | Path | Description |
|--------|------|-------------|
| POST | `/products` | Create a product |
| GET | `/products` | List all products |
| GET | `/products/{id}` | Get one product |
| PUT | `/products/{id}` | Update a product |
| DELETE | `/products/{id}` | Delete a product |

### Customers
| Method | Path | Description |
|--------|------|-------------|
| POST | `/customers` | Create a customer |
| GET | `/customers` | List all customers |
| GET | `/customers/{id}` | Get one customer |
| DELETE | `/customers/{id}` | Delete a customer |

### Orders
| Method | Path | Description |
|--------|------|-------------|
| POST | `/orders` | Create an order (checks stock, computes total, decrements inventory) |
| GET | `/orders` | List all orders |
| GET | `/orders/{id}` | Get order detail (line items, customer) |
| DELETE | `/orders/{id}` | Cancel an order (restores stock) |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/summary` | Totals + low-stock product list |

### Example requests
```bash
# Create a product (prices are in INR)
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Wireless Mouse","sku":"WM-001","price":1299,"quantity":100}'

# Create a customer
curl -X POST http://localhost:8000/customers \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Aarav Sharma","email":"aarav.sharma@example.com","phone":"+91 98765 43210"}'

# Create an order (one or more products)
curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_id":1,"items":[{"product_id":1,"quantity":3}]}'
```

---

## Business rules implemented

- ✅ Product SKU is unique → duplicate returns **409 Conflict**.
- ✅ Customer email is unique → duplicate returns **409 Conflict**.
- ✅ Product quantity can never be negative (Pydantic + DB `CHECK` constraint).
- ✅ Orders are rejected when stock is insufficient → **409 Conflict** with a
  clear message.
- ✅ Creating an order **atomically** reduces stock (row-level locking prevents
  overselling under concurrency).
- ✅ Order total is **computed by the backend** from current product prices —
  client-supplied totals are ignored.
- ✅ Cancelling an order **restores** the reserved stock.
- ✅ Full request validation (Pydantic) and appropriate HTTP status codes
  (`201`/`200`/`204`/`400`/`404`/`409`/`422`).

---

## Frontend features

- **Dashboard** — total products, customers, orders, and a low-stock table.
- **Products** — add, list, update, delete (modal forms, inline validation).
- **Customers** — add, list, delete.
- **Orders** — create multi-product orders with a live estimated total, view
  the order list, and open a detailed line-item breakdown.
- Responsive layout (desktop sidebar → mobile top nav), toast success/error
  messages, and confirm dialogs for destructive actions.

---

## Deploying for free

The browser-direct-CORS setup deploys cleanly to most free hosts. Below is a
**Render** walkthrough; **Railway** notes follow.

### Option A — Render (free tier)

1. **Push this repo to GitHub.**
2. **PostgreSQL**: Render dashboard → *New → PostgreSQL* (free). Copy the
   *Internal/External Database URL*. Render gives a `postgres://…` URL — the
   backend expects the SQLAlchemy form, so prefix it:
   `postgresql+psycopg2://…` (replace the leading `postgres://`).
3. **Backend**: *New → Web Service* → connect the repo → set
   **Root Directory** to `backend`, **Runtime** to *Docker*. Add env vars:
   - `DATABASE_URL` = the adjusted URL from step 2
   - `CORS_ORIGINS` = your frontend URL (fill in after step 4, then redeploy)
   - `LOW_STOCK_THRESHOLD` = `10`
   Note the service URL, e.g. `https://ims-api.onrender.com`.
4. **Frontend**: *New → Static Site* → **Root Directory** `frontend`,
   **Build Command** `npm install && npm run build`, **Publish Directory**
   `dist`. Add env var `VITE_API_URL` = the backend URL from step 3.
   Note the static-site URL, e.g. `https://ims-ui.onrender.com`.
5. Go back to the **backend** and set `CORS_ORIGINS` to the frontend URL from
   step 4, then redeploy. Done.

### Option B — Railway

1. New project → *Deploy from GitHub repo*.
2. Add a **PostgreSQL** plugin; Railway provides `DATABASE_URL`
   (prefix it with `postgresql+psycopg2://` form as above).
3. Add two services pointing at `backend/` and `frontend/` (Docker). Set the
   same env vars (`DATABASE_URL`, `CORS_ORIGINS`, `VITE_API_URL`).
4. Generate public domains for both and cross-fill the URLs.

> **Note on free hosting:** the browser must reach the backend directly, so
> `VITE_API_URL` and `CORS_ORIGINS` must use the **public** URLs of the
> deployed services (not `localhost`).

---

## Backend architecture

The backend follows a layered architecture so HTTP concerns, business logic,
and data access stay decoupled and independently testable:

```
HTTP request
   │
   ▼
api/routes     →  thin controllers (validation via Pydantic schemas)
   │
   ▼
services       →  business logic & transaction boundaries; raise domain errors
   │
   ▼
repositories   →  data access (queries, row locking); never commit
   │
   ▼
models         →  SQLAlchemy ORM entities
```

Domain exceptions (`core/exceptions.py`) are raised by services and translated
to HTTP responses by a central handler (`api/error_handlers.py`), keeping the
business layer framework-agnostic.

## Running tests & migrations

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt

pytest                 # run the test suite (SQLite-backed, no DB needed)
alembic upgrade head   # apply migrations (needs a running Postgres)
alembic downgrade -1   # roll back the last migration
```

In Docker the container entrypoint runs `alembic upgrade head` automatically
before starting the API server.

## Project structure

```
InventoryManagementSystem/
├── docker-compose.yml              # orchestrates db + backend + frontend
├── .env.example                    # configuration template (no secrets)
├── .gitignore
├── README.md
├── backend/
│   ├── Dockerfile                  # python:3.12-slim, non-root, healthcheck
│   ├── entrypoint.sh               # run migrations, then start uvicorn
│   ├── .dockerignore
│   ├── alembic.ini
│   ├── pyproject.toml              # pytest & ruff config
│   ├── requirements.txt            # runtime deps
│   ├── requirements-dev.txt        # + test/lint deps
│   ├── migrations/                 # Alembic migration environment
│   │   ├── env.py
│   │   └── versions/0001_initial.py
│   ├── tests/                      # pytest suite (products/customers/orders)
│   │   ├── conftest.py
│   │   └── test_*.py
│   └── app/
│       ├── main.py                 # application factory (CORS, routers, errors)
│       ├── core/                   # config, logging, domain exceptions
│       ├── db/                     # engine, session, declarative base
│       ├── models/                 # Product, Customer, Order, OrderItem
│       ├── schemas/                # Pydantic request/response models
│       ├── repositories/           # data-access layer
│       ├── services/               # business logic (stock, totals, restock)
│       └── api/
│           ├── deps.py             # dependency providers
│           ├── error_handlers.py   # domain error → HTTP mapping
│           ├── router.py           # route aggregation
│           └── routes/             # products, customers, orders, dashboard, health
└── frontend/
    ├── Dockerfile                  # multi-stage node build → nginx:alpine
    ├── nginx.conf                  # SPA history fallback
    ├── .dockerignore
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx, App.jsx, routes.jsx
        ├── api/                    # axios client + per-resource service modules
        │   ├── client.js
        │   └── services/           # products, customers, orders, dashboard
        ├── components/
        │   ├── common/             # Button, Modal, DataTable, Badge, FormField, …
        │   └── layout/             # AppLayout, Sidebar
        ├── context/                # ToastContext
        ├── hooks/                  # useAsync
        ├── features/               # feature modules (page + form + hook each)
        │   ├── dashboard/
        │   ├── products/
        │   ├── customers/
        │   └── orders/
        ├── utils/                  # apiError, format, validators
        └── styles/                 # global.css
```
