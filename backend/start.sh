#!/bin/bash
set -e

echo "Running database migration..."
python init_db.py

echo "Starting server on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
