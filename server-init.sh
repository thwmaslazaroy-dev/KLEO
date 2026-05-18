#!/bin/bash
set -euo pipefail

REPO="https://github.com/thwmaslazaroy-dev/kleo.git"
APP_DIR="/opt/kleo"

echo ""
echo "================================================"
echo "  Kleo — Server Init"
echo "================================================"
echo ""

if [[ $EUID -ne 0 ]]; then
    echo "ERROR: Run as root: sudo bash server-init.sh"
    exit 1
fi

# ── 1. Install ───────────────────────────────────────────────────────────────
echo "[1/5] Installing Docker, git, certbot..."
apt-get update -qq
apt-get install -y -qq git certbot curl
curl -fsSL https://get.docker.com | sh
apt-get install -y -qq docker-compose-plugin
systemctl enable --now docker
echo "      Done."

# ── 2. Clone ─────────────────────────────────────────────────────────────────
echo ""
echo "[2/5] Cloning repository..."
if [ -d "$APP_DIR/.git" ]; then
    echo "      Already cloned — pulling latest..."
    git -C "$APP_DIR" pull
else
    git clone "$REPO" "$APP_DIR"
fi
echo "      Done."

# ── 3. HTTP-only nginx (no SSL for now) ──────────────────────────────────────
echo ""
echo "[3/5] Writing HTTP-only nginx config..."
cat > "$APP_DIR/nginx.conf" <<'NGINX'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    upstream nextjs {
        server web:3000;
        keepalive 64;
    }

    server {
        listen 80;
        server_name _;

        location /_next/static/ {
            proxy_pass http://nextjs;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        location / {
            proxy_pass http://nextjs;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
NGINX

# Remove letsencrypt volume from nginx (no SSL yet)
cat > "$APP_DIR/docker-compose.override.yml" <<'COMPOSE'
services:
  nginx:
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
COMPOSE
echo "      Done."

# ── 4. Env file — PAUSE until user fills it in ───────────────────────────────
echo ""
echo "[4/5] Setting up .env.production..."
if [ ! -f "$APP_DIR/.env.production" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env.production"
fi

SERVER_IP=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo ""
echo "================================================================"
echo "  ΣΗΜΑΝΤΙΚΟ: Συμπλήρωσε τα secrets σου τώρα:"
echo ""
echo "    nano $APP_DIR/.env.production"
echo ""
echo "  Υποχρεωτικά:"
echo "    NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co"
echo "    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb..."
echo "    SUPABASE_SERVICE_ROLE_KEY=eyJhb..."
echo "    GEMINI_API_KEY=AIza..."
echo "    RESEND_API_KEY=re_..."
echo "    NEXT_PUBLIC_APP_URL=http://$SERVER_IP"
echo "================================================================"
echo ""
read -rp "  Πάτα ENTER όταν είναι έτοιμο το .env.production..."
echo ""

# ── 5. Build & start ─────────────────────────────────────────────────────────
echo "[5/5] Building and starting (takes a few minutes)..."
cd "$APP_DIR"

# Export vars so NEXT_PUBLIC_ values are baked into the Next.js bundle at build time
set -a
# shellcheck disable=SC1091
source "$APP_DIR/.env.production"
set +a

docker compose up --build -d

echo ""
echo "================================================"
echo "  Kleo τρέχει στο http://$SERVER_IP"
echo "================================================"
echo ""
echo "  Logs:    docker compose -f $APP_DIR/docker-compose.yml logs -f web"
echo "  Update:  bash $APP_DIR/deploy.sh"
echo ""
