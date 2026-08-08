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

echo ">>> 9/12 DB migration: blog çoklu kategori (arayazi_kategorileri tablosu) (yalnızca yoksa)..."
if [ "$(col_exists arayazi_kategorileri id)" = "0" ]; then
  echo "    -> uygulanıyor: 2026-07-19_arayazi_cok_kategori.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-19_arayazi_cok_kategori.sql
  echo "    -> tamam."
else
  echo "    -> 'arayazi_kategorileri' tablosu zaten var, atlanıyor."
fi

echo ">>> 10/12 DB migration: kategori aktif/pasif (kategoriler.aktif) (yalnızca yoksa)..."
if [ "$(col_exists kategoriler aktif)" = "0" ]; then
  echo "    -> uygulanıyor: 2026-07-20_kategori_aktif.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-20_kategori_aktif.sql
  echo "    -> tamam."
else
  echo "    -> 'kategoriler.aktif' kolonu zaten var, atlanıyor."
fi

echo ">>> 11/13 DB migration: özel bölüm sayfaları -> filtre_sayfalar (Basılı Sayılar, Yazarlarımızdan, Sinema Kitaplığı, Texts in English, Duyurular)..."
FILTRE_BASILI="$($DC exec -T db mariadb -uroot -p"${DB_PASS}" -N -e \
  "SELECT COUNT(*) FROM filtre_sayfalar WHERE slug='basili-sayilar';" 2>/dev/null || echo "0")"
if [ "${FILTRE_BASILI//[!0-9]/}" = "0" ]; then
  echo "    -> uygulanıyor: 2026-07-21_ozel_bolum_filtre.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-21_ozel_bolum_filtre.sql
  echo "    -> tamam."
else
  echo "    -> 'basili-sayilar' filtre sayfası zaten var, atlanıyor."
fi

echo ">>> 12/14 DB migration: ara_yazilar.tarih_etiketi (serbest metin tarih) (yalnızca yoksa)..."
if [ "$(col_exists ara_yazilar tarih_etiketi)" = "0" ]; then
  echo "    -> uygulanıyor: 2026-07-22_arayazi_tarih_etiketi.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-22_arayazi_tarih_etiketi.sql
  echo "    -> tamam."
else
  echo "    -> 'ara_yazilar.tarih_etiketi' kolonu zaten var, atlanıyor."
fi

echo ">>> 13/15 DB migration: filtre sayfası geri butonu (filtre_sayfalar.geri_hedef) (yalnızca yoksa)..."
if [ "$(col_exists filtre_sayfalar geri_hedef)" = "0" ]; then
  echo "    -> uygulanıyor: 2026-07-23_filtre_geri_link.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-23_filtre_geri_link.sql
  echo "    -> tamam."
else
  echo "    -> 'filtre_sayfalar.geri_hedef' kolonu zaten var, atlanıyor."
fi

echo ">>> 14/16 DB migration: kategori görünürlük bayrakları + sayfa metinleri (yalnızca yoksa)..."
if [ "$(col_exists kategoriler indeks_goster)" = "0" ]; then
  echo "    -> uygulanıyor: 2026-07-24_kategori_gorunurluk_sayfa_metinleri.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-24_kategori_gorunurluk_sayfa_metinleri.sql
  echo "    -> tamam."
else
  echo "    -> 'kategoriler.indeks_goster' kolonu zaten var, atlanıyor."
fi

echo ">>> 15/17 DB migration: yazilar.dizin_gorseli (içindekiler küçük görseli) (yalnızca yoksa)..."
if [ "$(col_exists yazilar dizin_gorseli)" = "0" ]; then
  echo "    -> uygulanıyor: 2026-07-25_yazi_dizin_gorseli.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-25_yazi_dizin_gorseli.sql
  echo "    -> tamam."
else
  echo "    -> 'yazilar.dizin_gorseli' kolonu zaten var, atlanıyor."
fi

echo ">>> 16/19 DB migration: çoklu yazar + kapak bandı görünürlüğü (yalnızca yoksa)..."
if [ "$(col_exists yazilar kapak_ustte)" = "0" ]; then
  echo "    -> uygulanıyor: 2026-07-26_faz13_cok_yazar_kapak_bandi.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-26_faz13_cok_yazar_kapak_bandi.sql
  echo "    -> tamam."
else
  echo "    -> 'yazilar.kapak_ustte' kolonu zaten var, atlanıyor."
fi

echo ">>> 17/19 DB migration: başlık/spot satır içi biçim (kolon genişletme)..."
BASLIK_UZ="$($DC exec -T db mariadb -uroot -p"${DB_PASS}" -N -e \
  "SELECT CHARACTER_MAXIMUM_LENGTH FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='sekans' AND TABLE_NAME='yazilar' AND COLUMN_NAME='baslik';" 2>/dev/null || echo "0")"
if [ "${BASLIK_UZ//[!0-9]/}" != "1000" ]; then
  echo "    -> uygulanıyor: 2026-07-27_baslik_spot_satirici_bicim.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-07-27_baslik_spot_satirici_bicim.sql
  echo "    -> tamam."
else
  echo "    -> 'yazilar.baslik' zaten VARCHAR(1000), atlanıyor."
fi

echo ">>> 18/20 DB migration: yazilar.kategori_goster (içindekilerde kategori adını gizleme) (yalnızca yoksa)..."
KAT_GOSTER="$($DC exec -T db mariadb -uroot -p"${DB_PASS}" -N -e \
  "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='sekans' AND TABLE_NAME='yazilar' AND COLUMN_NAME='kategori_goster';" 2>/dev/null || echo "0")"
if [ "${KAT_GOSTER//[!0-9]/}" != "1" ]; then
  echo "    -> uygulanıyor: 2026-08-04_faz14_kategori_goster.sql"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans < "$REPO"/db/migrations/2026-08-04_faz14_kategori_goster.sql
  echo "    -> tamam."
else
  echo "    -> 'yazilar.kategori_goster' kolonu zaten var, atlanıyor."
fi

echo ">>> 19/21 API konteyneri yeniden başlatılıyor..."
$DC restart api

# ---------------------------------------------------------------------------
# nginx ayarı: index.html'in cache'lenmemesi kuralı.
#
# Varlık adları (index-AbC123.js) içeriğe göre hash'lidir; hangi varlığın
# yükleneceğini SADECE index.html söyler. Bu dosya cache'lenirse tarayıcı yeni
# sürümden habersiz eski varlıkları istemeye devam eder — site "geç
# güncellenmiş" görünür ve hangi sürüme bakıldığı anlaşılamaz.
#
# Kural repodaki vhost dosyasında tanımlı. Sunucudaki kopya eskiyse güncellenir
# ve nginx yeniden yüklenir. Ayar zaten güncelse hiçbir şey yapılmaz.
# ---------------------------------------------------------------------------
echo ">>> 20/21 nginx ayarı (index.html cache kuralı) kontrol ediliyor..."
NGINX_HEDEF=/etc/nginx/sites-available/sekans.conf
if [ -f "$NGINX_HEDEF" ] && command -v nginx >/dev/null 2>&1; then
  if grep -q "no-store" "$NGINX_HEDEF"; then
    echo "    -> kural zaten var, atlanıyor."
  else
    echo "    -> kural ekleniyor (mevcut ayarın yedeği: ${NGINX_HEDEF}.bak)..."
    cp "$NGINX_HEDEF" "${NGINX_HEDEF}.bak"
    # server_name satırındaki alan adı sunucuya özel; yalnızca cache
    # bloklarını taşıyoruz, dosyanın tamamını EZMİYORUZ.
    python3 - "$NGINX_HEDEF" "$REPO/deploy_test/sekans-nginx.conf" <<'PY' || echo "    (otomatik güncelleme atlandı; kuralı elle ekleyin)"
import re, sys
hedef, kaynak = sys.argv[1], sys.argv[2]
mevcut = open(hedef, encoding="utf-8").read()
yeni_bloklar = re.search(
    r"( *# index\.html ASLA cache.*?\n *location / \{.*?\n *\}\n)",
    open(kaynak, encoding="utf-8").read(), re.S)
if not yeni_bloklar:
    sys.exit(1)
# Eski "location / { try_files ... }" bloğunu yenisiyle değiştir.
guncel, adet = re.subn(
    r" *# SPA geri donusu\n *location / \{[^}]*\}\n",
    yeni_bloklar.group(1), mevcut)
if adet == 0:
    guncel, adet = re.subn(r" *location / \{[^}]*\}\n", yeni_bloklar.group(1), mevcut)
if adet == 0:
    sys.exit(1)
open(hedef, "w", encoding="utf-8").write(guncel)
print("    -> vhost güncellendi.")
PY
    if nginx -t >/dev/null 2>&1; then
      systemctl reload nginx && echo "    -> nginx yeniden yüklendi."
    else
      echo "    !! nginx ayarı geçersiz; yedek geri alınıyor."
      cp "${NGINX_HEDEF}.bak" "$NGINX_HEDEF"
    fi
  fi
else
  echo "    -> vhost bulunamadı ya da nginx yok; atlanıyor."
fi

echo ">>> 21/21 Kontrol — sayı durumları + filtre sayfaları + menü:"
$DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans -N -e \
  "SELECT durum, COUNT(*) FROM sayilar GROUP BY durum;" 2>/dev/null || echo "    (DB kontrolü atlandı)"
$DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans -N -e \
  "SELECT CONCAT('filtre sayfası: ', slug, ' -> ', kategori) FROM filtre_sayfalar ORDER BY sira;" 2>/dev/null || true
$DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans -N -e \
  "SELECT CONCAT('filtre menü bağlantısı: ', COUNT(*)) FROM menuler WHERE tur='filtre_liste';" 2>/dev/null || true
$DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans -N -e \
  "SELECT CONCAT('menü öğesi: ', COUNT(*)) FROM menuler;" 2>/dev/null || true
$DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans -N -e \
  "SELECT CONCAT('ana sayfa paneli: ', COUNT(*)) FROM anasayfa_bloklar;" 2>/dev/null || true
$DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans -N -e \
  "SELECT CONCAT('yazi-yazar bagi: ', COUNT(*)) FROM yazi_yazarlari;" 2>/dev/null || true
$DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans -N -e \
  "SELECT CONCAT('arayazi-yazar bagi: ', COUNT(*)) FROM arayazi_yazarlari;" 2>/dev/null || true

echo ""
echo "==================== GÜNCELLEME TAMAM ===================="
echo " Site : https://sekans.65-21-234-84.sslip.io"
echo " CMS  : https://sekans.65-21-234-84.sslip.io/cms"
echo "========================================================="
