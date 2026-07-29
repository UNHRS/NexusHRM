#!/usr/bin/env bash
set -euo pipefail

mkdir -p backups
STAMP=$(date +%Y%m%d_%H%M%S)
OUT="backups/nexus_hrm_${STAMP}.sql"

echo "Writing ${OUT}..."
docker compose exec -T postgres pg_dump -U postgres nexus_hrm > "${OUT}"
echo "Backup complete."
