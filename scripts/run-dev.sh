#!/usr/bin/env bash
set -euo pipefail

echo "Starting Postgres..."
docker compose up -d postgres adminer

cleanup() {
  echo "Stopping dev processes..."
  kill "${SERVER_PID:-0}" "${CLIENT_PID:-0}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting API on http://localhost:5000..."
(cd server && npm run dev) &
SERVER_PID=$!

echo "Starting frontend on http://localhost:5173..."
(cd client && npm run dev) &
CLIENT_PID=$!

wait
