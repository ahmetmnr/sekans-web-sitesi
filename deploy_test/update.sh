#!/usr/bin/env bash
# ============================================================================
# Sekans — TEST sunucusu GÜNCELLEME dağıtımı (setup-fresh.sh'tan SONRA tekrar tekrar).
# Kullanım (root, sunucuda klonlanmış repo kökünden):
#     git pull                       # önce yeni kodu çek (dist git'te hazır gelir)
#     bash deploy_test/update.sh
#
# Yaptıkları: yeni dist'i webroot'a, yeni api'yi /opt/sekans/api'ye kopyalar,
# bekleyen DB migration'larını (durum/editor_id) idempotent uygular, api'yi
# yeniden başlatır. DB verisi KORUNUR (dbdata volume'u silinmez).
# ============================================================================
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP=/opt/sekans
DB_PASS=sekans-test-db-2026
DC="docker compose -f ${APP}/docker-compose.yml"

echo ">>> 1/5 Frontend (dist) kopyalanıyor -> webroot..."
cp -r "$REPO"/dist/. "$APP"/webroot/

echo ">>> 2/5 API kopyalanıyor -> ${APP}/api..."
rm -rf "$APP"/api
cp -r "$REPO"/api "$APP"/api
rm -f "$APP"/api/seed_admin.php

echo ">>> 3/5 DB migration: sayilar.durum + editor_id (yalnızca yoksa uygulanır)..."
HAS_DURUM=$($DC exec -T db mariadb -uroot -p"${DB_PASS}" -N -e \
  "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='sekans' AND TABLE_NAME='sayilar' AND COLUMN_NAME='durum';" 2>/dev/null || echo "0")
if [ "${HAS_DURUM}" = "0" ]; then
  echo "    -> uygulanıyor: 2026-07-06_sayi_durum_editor.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-06_sayi_durum_editor.sql
  echo "    -> tamam."
else
  echo "    -> 'durum' kolonu zaten var, migration atlanıyor."
fi

echo ">>> 4/5 API konteyneri yeniden başlatılıyor..."
$DC restart api

echo ">>> 5/5 Kontrol — sayı durum dağılımı:"
$DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans -N -e \
  "SELECT durum, COUNT(*) FROM sayilar GROUP BY durum;" 2>/dev/null || echo "    (DB kontrolü atlandı)"

echo ""
echo "==================== GÜNCELLEME TAMAM ===================="
echo " Site : https://sekans.65-21-234-84.sslip.io"
echo " CMS  : https://sekans.65-21-234-84.sslip.io/cms"
echo "========================================================="
