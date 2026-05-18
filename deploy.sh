#!/bin/bash
set -euo pipefail

APP_DIR="/opt/kleo"

echo "=== Deploying Kleo ==="
cd "$APP_DIR"

echo "[1/3] Pulling latest code..."
git pull origin main

echo "[2/3] Stopping current containers..."
docker compose down

echo "[3/3] Building and starting..."
docker compose up --build -d

echo ""
echo "=== Deploy complete ==="
docker compose ps
