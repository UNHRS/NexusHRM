#!/usr/bin/env bash
set -euo pipefail

if ! curl -sf http://localhost:5173 >/dev/null; then
  echo "App not running at http://localhost:5173"
  exit 1
fi

cd qa
pytest --html=report.html --self-contained-html
