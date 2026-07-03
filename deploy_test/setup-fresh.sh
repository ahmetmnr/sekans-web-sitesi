#!/usr/bin/env bash
# ============================================================================
# Sekans — SIFIRDAN sunucu kurulumu (Ubuntu, root olarak).
# Klonlanmış repo kökünden çalıştırın:   bash deploy_test/setup-fresh.sh
#
# Yaptıkları: docker+nginx+certbot kurar, /opt/sekans yerleşimini hazırlar,
# frontend+api'yi koyar, config.php üretir, MariaDB'yi schema+seed ile ayağa
# kaldırır, CMS admin'i oluşturur, nginx + Let's Encrypt SSL ayarlar.
# Medya (kapaklar/PDF) AYRICA: bash deploy_test/fetch-media.sh
# ============================================================================
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP=/opt/sekans
DOMAIN=sekans.65-21-234-84.sslip.io
IP=65.21.234.84
DB_PASS=sekans-test-db-2026
EMAIL=mnrkcmn@gmail.com

echo ">>> 1/9 Gereksinimler kuruluyor (docker, nginx, certbot, wget)..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl wget ca-certificates nginx certbot python3-certbot-nginx
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

echo ">>> 2/9 Dizin yerleşimi..."
mkdir -p "$APP"/webroot/uploads "$APP"/webroot/images "$APP"/initdb "$APP"/sekans_config

echo ">>> 3/9 Frontend (dist) + API kopyalanıyor..."
cp -r "$REPO"/dist/. "$APP"/webroot/
rm -rf "$APP"/api
cp -r "$REPO"/api "$APP"/api
rm -f "$APP"/api/seed_admin.php

echo ">>> 4/9 docker-compose + DB şeması/seed..."
cp "$REPO"/deploy_test/docker-compose.yml "$APP"/docker-compose.yml
cp "$REPO"/db/schema.sql "$APP"/initdb/01-schema.sql
cp "$REPO"/db/seed.sql   "$APP"/initdb/02-seed.sql

echo ">>> 5/9 Gizli config.php üretiliyor..."
cat > "$APP"/sekans_config/config.php <<PHP
<?php
return [
    'db'     => [ 'host' => 'db', 'name' => 'sekans', 'user' => 'root', 'pass' => '${DB_PASS}', 'charset' => 'utf8mb4' ],
    'openai' => [ 'api_key' => '', 'model' => 'gpt-4o-mini', 'temperature' => 0.3, 'max_tokens' => 4096, 'timeout' => 30 ],
    'app'    => [
        'upload_dir'   => '/var/www/html/uploads',
        'upload_url'   => '/uploads',
        'base_url'     => 'https://${DOMAIN}',
        'dev'          => 0,
        'session_name' => 'SEKANSSESSID',
        'session_ttl'  => 86400,
    ],
];
PHP
chmod 600 "$APP"/sekans_config/config.php

echo ">>> 6/9 Docker stack (RAM limitli) ayağa kalkıyor..."
cd "$APP"
docker compose up -d --build
echo "    DB hazır olması bekleniyor (ilk açılışta seed import edilir, biraz sürebilir)..."
DB_OK=0
for i in $(seq 1 90); do
  if docker compose exec -T db mariadb -uroot -p"${DB_PASS}" sekans -e "SELECT 1" >/dev/null 2>&1; then DB_OK=1; break; fi
  sleep 3
done
if [ "$DB_OK" = "1" ]; then
  docker compose exec -T db mariadb -uroot -p"${DB_PASS}" sekans -N -e \
    "SELECT CONCAT('    DB -> sayilar=',(SELECT COUNT(*) FROM sayilar),' yazilar=',(SELECT COUNT(*) FROM yazilar));" || true
else
  echo "    UYARI: DB hazır olmadı. Loglara bakın:  docker compose logs db"
fi

echo ">>> 7/9 CMS admin kullanıcısı (admin / Sekans.Test.2026)..."
docker compose exec -T api php -r "\$p=new PDO('mysql:host=db;dbname=sekans;charset=utf8mb4','root','${DB_PASS}'); if((int)\$p->query('SELECT COUNT(*) FROM kullanicilar')->fetchColumn()===0){\$p->prepare('INSERT INTO kullanicilar (username,password_hash,role,name,is_active) VALUES (?,?,?,?,1)')->execute(['admin',password_hash('Sekans.Test.2026',PASSWORD_BCRYPT),'admin','Yonetici']); echo '    admin olusturuldu';} else echo '    kullanici zaten var';" || echo "    (admin olusturulamadi; DB'yi kontrol edin)"
echo ""

echo ">>> 8/9 nginx vhost..."
cp "$REPO"/deploy_test/sekans-nginx.conf /etc/nginx/sites-available/sekans.conf
ln -sf /etc/nginx/sites-available/sekans.conf /etc/nginx/sites-enabled/sekans.conf
rm -f /etc/nginx/sites-enabled/default
mkdir -p /var/www/certbot
nginx -t && systemctl reload nginx

echo ">>> 9/9 SSL (Let's Encrypt)..."
if certbot certonly --webroot -w /var/www/certbot -d "${DOMAIN}" --non-interactive --agree-tos -m "${EMAIL}" 2>&1 | tail -3; then
  cat > /etc/nginx/sites-available/sekans.conf <<NGINX
server {
    listen 80 default_server; listen [::]:80 default_server;
    server_name ${DOMAIN} ${IP} _;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://${DOMAIN}\$request_uri; }
}
server {
    listen 443 ssl http2; listen [::]:443 ssl http2;
    server_name ${DOMAIN};
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    root /opt/sekans/webroot; index index.html; client_max_body_size 64m;
    location /api/ {
        proxy_pass http://127.0.0.1:8091;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 90s;
    }
    location ~* \\.(js|css|woff2?|png|jpe?g|svg|webp|gif|pdf)\$ { try_files \$uri =404; expires 30d; add_header Cache-Control "public"; }
    location / { try_files \$uri \$uri/ /index.html; }
}
NGINX
  nginx -t && systemctl reload nginx
  echo "    HTTPS hazır."
else
  echo "    UYARI: sertifika alınamadı; site şimdilik HTTP: http://${IP}"
fi

echo ""
echo "==================== KURULUM TAMAM ===================="
echo " Site : https://${DOMAIN}"
echo " CMS  : https://${DOMAIN}/cms   (admin / Sekans.Test.2026)"
echo " Medya (kapaklar/PDF): bash ${REPO}/deploy_test/fetch-media.sh"
echo "======================================================"
