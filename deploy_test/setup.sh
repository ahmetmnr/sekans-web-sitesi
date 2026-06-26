#!/bin/bash
# Sekans TEST sunucusu kurulum betiği — /opt/sekans içinde çalıştırılır.
set -e
cd /opt/sekans

echo ">> 1/6 Dizin yerleşimi..."
mkdir -p webroot/uploads initdb sekans_config
# dist içeriği webroot'a (docs/images hariç geldi; onlar wget ile inecek)
cp -r dist/. webroot/
# default-cover.svg garanti
mkdir -p webroot/images
[ -f default-cover.svg ] && cp default-cover.svg webroot/images/
# seed_admin.php sunucuda durmasın (admin'i biz SQL ile oluşturacağız)
rm -f api/seed_admin.php
# config + db init
cp config.php sekans_config/config.php
cp schema.sql initdb/01-schema.sql
cp seed.sql  initdb/02-seed.sql

echo ">> 2/6 Medya canlı sekans.org'dan indiriliyor (850 dosya, ~516MB)..."
# -nH: host dizini yok; -x: URL yolunu koru; -c: yarım kalanı sürdür; -q: sessiz
wget -q -c -nH -x -i media-urls.txt -P webroot/ 2>&1 | tail -2 || true
echo "   indirilen docs: $(find webroot/docs -type f 2>/dev/null | wc -l) dosya, $(du -sh webroot/docs 2>/dev/null | cut -f1)"
echo "   indirilen images: $(find webroot/images -type f 2>/dev/null | wc -l) dosya, $(du -sh webroot/images 2>/dev/null | cut -f1)"

echo ">> 3/6 Docker stack..."
sudo docker compose up -d --build
echo "   DB hazır olması bekleniyor..."
for i in $(seq 1 60); do
  sudo docker compose exec -T db mariadb -uroot -psekans-test-db-2026 sekans -e "SELECT 1" >/dev/null 2>&1 && break
  sleep 3
done
sudo docker compose exec -T db mariadb -uroot -psekans-test-db-2026 sekans -N -e \
  "SELECT CONCAT('   sayilar=',(SELECT COUNT(*) FROM sayilar),' yazilar=',(SELECT COUNT(*) FROM yazilar),' ara_yazilar=',(SELECT COUNT(*) FROM ara_yazilar));"

echo ">> 4/6 CMS admin kullanıcısı..."
sudo docker compose exec -T api php -r '
$pdo = new PDO("mysql:host=db;dbname=sekans;charset=utf8mb4","root","sekans-test-db-2026");
$n = (int)$pdo->query("SELECT COUNT(*) FROM kullanicilar")->fetchColumn();
if ($n === 0) {
  $pdo->prepare("INSERT INTO kullanicilar (username,password_hash,role,name,is_active) VALUES (?,?,?,?,1)")
      ->execute(["admin", password_hash("Sekans.Test.2026", PASSWORD_BCRYPT), "admin", "Yönetici"]);
  echo "   admin oluşturuldu\n";
} else echo "   kullanıcı zaten var\n";'

echo ">> 5/6 Host nginx vhost..."
sudo cp sekans-nginx.conf /etc/nginx/sites-available/sekans.conf
sudo ln -sf /etc/nginx/sites-available/sekans.conf /etc/nginx/sites-enabled/sekans.conf
sudo mkdir -p /var/www/certbot
sudo nginx -t && sudo systemctl reload nginx

echo ">> 6/6 SSL sertifikası (Let's Encrypt, sslip.io alan adı)..."
if sudo certbot certonly --webroot -w /var/www/certbot -d sekans.65-21-234-84.sslip.io \
     --non-interactive --agree-tos -m mnrkcmn@gmail.com 2>&1 | tail -2; then
  # 443 bloğunu ekle + 80'i yönlendirmeye çevir
  sudo tee /etc/nginx/sites-available/sekans.conf > /dev/null << 'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name sekans.65-21-234-84.sslip.io 65.21.234.84 _;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://sekans.65-21-234-84.sslip.io$request_uri; }
}
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name sekans.65-21-234-84.sslip.io;

    ssl_certificate /etc/letsencrypt/live/sekans.65-21-234-84.sslip.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sekans.65-21-234-84.sslip.io/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /opt/sekans/webroot;
    index index.html;
    client_max_body_size 64m;

    location /api/ {
        proxy_pass http://127.0.0.1:8091;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90s;
    }
    location ~* \.(js|css|woff2?|png|jpe?g|svg|webp|gif|pdf)$ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public";
    }
    location / { try_files $uri $uri/ /index.html; }
}
NGINX
  sudo nginx -t && sudo systemctl reload nginx
  echo "   HTTPS hazır: https://sekans.65-21-234-84.sslip.io"
else
  echo "   UYARI: sertifika alınamadı; site HTTP olarak çalışıyor: http://65.21.234.84"
fi

echo ""
echo "=== KURULUM TAMAM ==="
