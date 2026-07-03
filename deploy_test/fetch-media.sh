#!/usr/bin/env bash
# ============================================================================
# Sekans — kapak/PDF/görsel medyasını canlı sekans.org'dan indirir (~500MB).
# Site medyasız da çalışır; bu adım kapakları ve PDF'leri getirir.
# Klonlanmış repo kökünden:  bash deploy_test/fetch-media.sh
# ============================================================================
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEBROOT=/opt/sekans/webroot
LIST="$REPO/db/media-urls.txt"

if [ ! -f "$LIST" ]; then
  echo "media-urls.txt bulunamadı: $LIST"; exit 1
fi

echo ">>> Medya indiriliyor ($(wc -l < "$LIST") dosya)... birkaç dakika sürebilir."
# -nH: host dizini yok, -x: URL yolunu koru, -c: yarım kalanı sürdür, -q: sessiz
wget -q -c -nH -x -i "$LIST" -P "$WEBROOT/" 2>&1 | tail -2 || true

echo "docs : $(find "$WEBROOT/docs" -type f 2>/dev/null | wc -l) dosya, $(du -sh "$WEBROOT/docs" 2>/dev/null | cut -f1)"
echo "images: $(find "$WEBROOT/images" -type f 2>/dev/null | wc -l) dosya, $(du -sh "$WEBROOT/images" 2>/dev/null | cut -f1)"
echo ">>> Medya indirildi."
