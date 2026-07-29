#!/usr/bin/env bash
set -euo pipefail

mkdir -p postman
npx -p newman -p newman-reporter-htmlextra newman run postman/Nexus-HRM.postman_collection.json \
  -e postman/Nexus-HRM.postman_environment.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export postman/report.html
