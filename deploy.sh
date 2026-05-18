#!/bin/bash
set -euo pipefail

APP_DIR="/opt/kleo"

echo "=== Deploying Kleo ==="
cd "$APP_DIR"

echo "[1/3] Pulling latest code..."
git pull origin main

echo "[2/3] Loading env vars for build..."
# NEXT_PUBLIC_ vars must be in the shell before docker compose build
# so Next.js can bake them into the browser bundle at compile time.
set -a
# shellcheck disable=SC1091
source "$APP_DIR/.env.production"
set +a

echo "[3/3] Rebuilding and starting..."
docker compose down
docker compose up --build -d

echo ""
echo "=== Deploy complete ==="
docker compose ps
