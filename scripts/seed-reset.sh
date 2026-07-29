#!/usr/bin/env bash
set -euo pipefail

echo "Resetting database and reseeding..."
cd server
npx prisma migrate reset --force
npm run seed
echo "Database reset complete."
