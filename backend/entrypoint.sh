#!/usr/bin/env sh
# Container entrypoint: apply DB migrations, then start the API server.
set -e

echo "Running database migrations..."
alembic upgrade head

echo "Starting API server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
