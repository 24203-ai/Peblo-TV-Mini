#!/bin/bash
set -e

# Run migrations
echo "Running database migrations..."
alembic upgrade head

# Run seed script
echo "Seeding database..."
python scripts/seed.py

# Start application
echo "Starting FastAPI application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
