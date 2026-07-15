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

# Bir kolonun varlığını döndüren yardımcı (migration guard'ları için).
col_exists() { # $1=tablo $2=kolon
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" -N -e \
    "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='sekans' AND TABLE_NAME='$1' AND COLUMN_NAME='$2';" 2>/dev/null || echo "0"
}

echo ">>> 3/7 DB migration: sayilar.durum + editor_id (yalnızca yoksa uygulanır)..."
if [ "$(col_exists sayilar durum)" = "0" ]; then
  echo "    -> uygulanıyor: 2026-07-06_sayi_durum_editor.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-06_sayi_durum_editor.sql
  echo "    -> tamam."
else
  echo "    -> 'durum' kolonu zaten var, atlanıyor."
fi

echo ">>> 4/7 DB migration: menü/anasayfa + sayfalar + yarışma alanları (yalnızca yoksa)..."
if [ "$(col_exists sayilar menu_etiket)" = "0" ]; then
  echo "    -> uygulanıyor: 2026-07-14_menu_anasayfa_sayfalar.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-14_menu_anasayfa_sayfalar.sql
  echo "    -> tamam."
else
  echo "    -> 'menu_etiket' kolonu zaten var, atlanıyor."
fi

echo ">>> 5/8 DB migration: dinamik üst menü (menuler tablosu) (yalnızca yoksa)..."
if [ "$(col_exists menuler id)" = "0" ]; then
  echo "    -> uygulanıyor: 2026-07-15_menuler.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-15_menuler.sql
  echo "    -> tamam."
else
  echo "    -> 'menuler' tablosu zaten var, atlanıyor."
fi

echo ">>> 6/9 DB migration: ana sayfa blokları (anasayfa_bloklar tablosu) (yalnızca yoksa)..."
if [ "$(col_exists anasayfa_bloklar id)" = "0" ]; then
  echo "    -> uygulanıyor: 2026-07-16_anasayfa_bloklar.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-16_anasayfa_bloklar.sql
  echo "    -> tamam."
else
  echo "    -> 'anasayfa_bloklar' tablosu zaten var, atlanıyor."
fi

echo ">>> 7/10 DB migration: sabit sayfa genişletme (sayfalar.yayin_durumu vb.) (yalnızca yoksa)..."
if [ "$(col_exists sayfalar yayin_durumu)" = "0" ]; then
  echo "    -> uygulanıyor: 2026-07-17_sayfalar_genisletme.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-17_sayfalar_genisletme.sql
  echo "    -> tamam."
else
  echo "    -> 'sayfalar.yayin_durumu' kolonu zaten var, atlanıyor."
fi

echo ">>> 8/11 DB migration: filtre listeleme sayfaları (filtre_sayfalar tablosu) (yalnızca yoksa)..."
if [ "$(col_exists filtre_sayfalar id)" = "0" ]; then
  echo "    -> uygulanıyor: 2026-07-18_filtre_sayfalar.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-18_filtre_sayfalar.sql
  echo "    -> tamam."
else
  echo "    -> 'filtre_sayfalar' tablosu zaten var, atlanıyor."
fi

echo ">>> 9/11 DB migration: blog çoklu kategori (arayazi_kategorileri tablosu) (yalnızca yoksa)..."
if [ "$(col_exists arayazi_kategorileri id)" = "0" ]; then
  echo "    -> uygulanıyor: 2026-07-19_arayazi_cok_kategori.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-19_arayazi_cok_kategori.sql
  echo "    -> tamam."
else
  echo "    -> 'arayazi_kategorileri' tablosu zaten var, atlanıyor."
fi

echo ">>> 10/11 API konteyneri yeniden başlatılıyor..."
$DC restart api

echo ">>> 11/11 Kontrol — sayı durumları + kategori adları + menü:"
$DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans -N -e \
  "SELECT durum, COUNT(*) FROM sayilar GROUP BY durum;" 2>/dev/null || echo "    (DB kontrolü atlandı)"
$DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans -N -e \
  "SELECT ad FROM kategoriler WHERE ad IN ('Duyurular','Texts in English');" 2>/dev/null || true
$DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans -N -e \
  "SELECT CONCAT('menü öğesi: ', COUNT(*)) FROM menuler;" 2>/dev/null || true
$DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans -N -e \
  "SELECT CONCAT('ana sayfa paneli: ', COUNT(*)) FROM anasayfa_bloklar;" 2>/dev/null || true

echo ""
echo "==================== GÜNCELLEME TAMAM ===================="
echo " Site : https://sekans.65-21-234-84.sslip.io"
echo " CMS  : https://sekans.65-21-234-84.sslip.io/cms"
echo "========================================================="
