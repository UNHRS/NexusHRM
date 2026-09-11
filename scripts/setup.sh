#!/usr/bin/env bash
set -euo pipefail

command -v docker >/dev/null || { echo "Docker is required."; exit 1; }
command -v node >/dev/null || { echo "Node.js is required."; exit 1; }
command -v npm >/dev/null || { echo "npm is required."; exit 1; }

echo "Starting Postgres and Adminer on localhost:55432..."
docker compose up -d postgres adminer

echo "Installing server dependencies..."
cd server
if [[ ! -f .env ]]; then
  cp .env.example .env
fi
npm install
echo "Applying Prisma migrations..."
npx prisma migrate deploy
echo "Seeding database..."
npm run seed

echo "Installing client dependencies..."
cd ../client
npm install

echo "Setup complete. Run ./scripts/run-dev.sh to start the app."
