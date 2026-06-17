#!/usr/bin/env sh
# Container entrypoint: apply DB migrations, then start the API server.
set -e

echo "Running database migrations..."
alembic upgrade head

# Hosts like Render inject the port to bind via $PORT; default to 8000 locally.
PORT="${PORT:-8000}"
echo "Starting API server on port ${PORT}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT}"
