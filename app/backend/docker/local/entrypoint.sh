#!/usr/bin/env bash
set -euo pipefail

echo "Applying database migrations (alembic upgrade head)..."
uv run --no-sync alembic upgrade head

echo "Starting backend (main.py)..."
exec uv run --no-sync src/main.py
