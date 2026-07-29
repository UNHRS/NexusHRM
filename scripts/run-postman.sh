#!/usr/bin/env bash
set -euo pipefail

mkdir -p postman
npx -p newman@4 -p newman-reporter-html@1.0.5 newman run postman/Nexus-HRM.postman_collection.json \
  -e postman/Nexus-HRM.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export postman/report.html
