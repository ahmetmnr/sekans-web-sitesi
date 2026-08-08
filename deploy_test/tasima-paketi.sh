#!/usr/bin/env bash
# ============================================================================
# Sekans — TEST sunucusundan cPanel'e TAŞIMA PAKETİ hazırlar.
#
# Kullanım (test sunucusunda, root, repo kökünden):
#     bash deploy_test/tasima-paketi.sh
#
# Ürettikleri (/root/sekans-tasima/ altında):
#     sekans-db.sql.gz     veritabanının tam dökümü (utf8mb4)
#     sekans-uploads.zip   panelden yüklenen görsel/PDF dosyaları
#     OZET.txt             içerik sayıları + kullanıcı listesi (kontrol için)
#
# Bu iki dosyayı indirip cPanel'e taşıyın. Ayrıntılı adımlar: DEPLOY.md
# "TEST SUNUCUSUNDAN cPANEL'E TAŞIMA" bölümü.
#
# NEDEN schema.sql + seed.sql DEĞİL: test sunucusunda gerçek çalışma var
# (hazırlanan sayı, editör hesapları, görünüm ayarları, yüklenen dosyalar).
# Döküm hepsini taşır; ayrıca uygulanmış tüm migration'ları da beraberinde
# getirir, cPanel'de tek tek uygulamaya gerek kalmaz.
# ============================================================================
set -uo pipefail

APP=/opt/sekans
DB_PASS=sekans-test-db-2026
DC="docker compose -f ${APP}/docker-compose.yml"
CIKTI=/root/sekans-tasima

mkdir -p "$CIKTI"
echo ">>> Taşıma paketi hazırlanıyor -> $CIKTI"

# --- 1) Veritabanı dökümü -----------------------------------------------------
# --single-transaction : InnoDB'de tutarlı anlık görüntü, tabloları kilitlemez
# --default-character-set=utf8mb4 : Türkçe karakterler bozulmasın
# --no-tablespaces : paylaşımlı hostingde PROCESS yetkisi gerekmesin
echo ">>> 1/3 Veritabanı dökümü alınıyor..."
$DC exec -T db mariadb-dump \
    -uroot -p"${DB_PASS}" \
    --single-transaction --routines --events \
    --default-character-set=utf8mb4 \
    --no-tablespaces \
    sekans 2>/dev/null | gzip -9 > "$CIKTI/sekans-db.sql.gz"

if [ ! -s "$CIKTI/sekans-db.sql.gz" ]; then
  echo "    !! Döküm boş. Eski sürümlerde komut 'mysqldump' olabilir, deneniyor..."
  $DC exec -T db mysqldump \
      -uroot -p"${DB_PASS}" \
      --single-transaction --routines --events \
      --default-character-set=utf8mb4 \
      --no-tablespaces \
      sekans 2>/dev/null | gzip -9 > "$CIKTI/sekans-db.sql.gz"
fi
echo "    -> sekans-db.sql.gz  ($(du -h "$CIKTI/sekans-db.sql.gz" | cut -f1))"

# --- 2) Yüklenen dosyalar -----------------------------------------------------
# Panelden yüklenen görseller ve PDF'ler burada; veritabanı bunlara /uploads/...
# yoluyla referans verir. Taşınmazsa kapaklar ve dizin görselleri kırık olur.
echo ">>> 2/3 Yüklenen dosyalar paketleniyor..."
YUKLEME_ARSIVI=""
if [ -d "$APP/webroot/uploads" ]; then
  ADET=$(find "$APP/webroot/uploads" -type f | wc -l)
  # zip tercih edilir (cPanel File Manager'da en tanıdık biçim), ama minimal
  # sunucularda kurulu olmayabilir. tar her yerde vardır ve cPanel File Manager
  # .tar.gz dosyalarını da "Extract" ile açar.
  if command -v zip >/dev/null 2>&1; then
    ( cd "$APP/webroot" && zip -qr "$CIKTI/sekans-uploads.zip" uploads )
    YUKLEME_ARSIVI="$CIKTI/sekans-uploads.zip"
  else
    echo "    (zip kurulu değil — tar.gz kullanılıyor; cPanel ikisini de açar)"
    tar -czf "$CIKTI/sekans-uploads.tar.gz" -C "$APP/webroot" uploads
    YUKLEME_ARSIVI="$CIKTI/sekans-uploads.tar.gz"
  fi

  # Arşiv gerçekten oluştu mu? Oluşmadıysa SESSİZ GEÇME — görseller taşınmazsa
  # sitedeki kapaklar ve dizin görselleri kırık çıkar.
  if [ -s "$YUKLEME_ARSIVI" ]; then
    echo "    -> $(basename "$YUKLEME_ARSIVI")  ($(du -h "$YUKLEME_ARSIVI" | cut -f1), $ADET dosya)"
  else
    echo "    !! HATA: yükleme arşivi oluşturulamadı. Görselleri elle paketleyin:"
    echo "       tar -czf $CIKTI/sekans-uploads.tar.gz -C $APP/webroot uploads"
    YUKLEME_ARSIVI=""
  fi
else
  echo "    -> uploads klasörü yok, atlanıyor."
fi

# --- 3) Kontrol özeti ---------------------------------------------------------
# cPanel'e aktardıktan SONRA aynı sayıları orada görmelisiniz.
echo ">>> 3/3 Özet çıkarılıyor..."
{
  echo "SEKANS — TAŞIMA ÖZETİ"
  echo "Tarih: $(date '+%Y-%m-%d %H:%M')"
  echo
  echo "--- İçerik sayıları (cPanel'de AYNI olmalı) ---"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans -N -e "
    SELECT CONCAT('sayı            : ', COUNT(*)) FROM sayilar;
    SELECT CONCAT('  taslak        : ', COUNT(*)) FROM sayilar WHERE durum='taslak';
    SELECT CONCAT('  yayında       : ', COUNT(*)) FROM sayilar WHERE durum='yayinda';
    SELECT CONCAT('  arşiv         : ', COUNT(*)) FROM sayilar WHERE durum='arsiv';
    SELECT CONCAT('dergi yazısı    : ', COUNT(*)) FROM yazilar;
    SELECT CONCAT('blog yazısı     : ', COUNT(*)) FROM ara_yazilar;
    SELECT CONCAT('yazar           : ', COUNT(*)) FROM yazarlar;
    SELECT CONCAT('kategori        : ', COUNT(*)) FROM kategoriler;
    SELECT CONCAT('menü öğesi      : ', COUNT(*)) FROM menuler;
    SELECT CONCAT('statik sayfa    : ', COUNT(*)) FROM sayfalar;
    SELECT CONCAT('filtre sayfası  : ', COUNT(*)) FROM filtre_sayfalar;
  " 2>/dev/null
  echo
  echo "--- Kullanıcılar (TAŞIMADAN SONRA PAROLALARI DEĞİŞTİRİN) ---"
  echo "DİKKAT: test parolaları döküme dahildir. Canlıya geçmeden"
  echo "        admin parolasını değiştirin, test hesaplarını silin."
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans -N -e \
    "SELECT CONCAT('  ', username, '  (', role, ')  aktif=', is_active) FROM kullanicilar ORDER BY role, username;" 2>/dev/null
  echo
  echo "--- Görünüm ayarı (Dergi Görünümü) ---"
  $DC exec -T db mariadb -uroot -p"${DB_PASS}" sekans -N -e \
    "SELECT deger FROM ayarlar WHERE anahtar='icindekiler_gorunum';" 2>/dev/null || echo "  (ayar yok — varsayılan)"
} > "$CIKTI/OZET.txt"

cat "$CIKTI/OZET.txt"

echo
if [ -n "$YUKLEME_ARSIVI" ] && [ -s "$CIKTI/sekans-db.sql.gz" ]; then
  echo "==================== PAKET HAZIR ===================="
else
  echo "============ PAKET EKSİK — YUKARIYI OKUYUN ========="
fi
ls -la "$CIKTI"
echo
echo "Bu dosyaları yerel bilgisayarınıza indirin:"
echo "  scp root@<sunucu>:$CIKTI/* ./"
echo "Sonra DEPLOY.md > 'TEST SUNUCUSUNDAN cPANEL'E TAŞIMA' bölümünü izleyin."
echo "====================================================="
