#!/usr/bin/env bash
set -euo pipefail

mkdir -p postman
npx newman run postman/Nexus-HRM.postman_collection.json \
  -e postman/Nexus-HRM.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export postman/report.html
