-- =============================================================================
-- Migration: Filtre sayfası "geri butonu" bağlantısı (Faz 11).
--   Filtre listeleme sayfalarının sol üstündeki geri butonu normalde "Ana Sayfa"ya
--   gider. Artık her filtre sayfası için admin panelden özelleştirilebilir:
--     - geri_baslik : buton metni (örn. "e-Sayılar")
--     - geri_hedef  : gidilecek yerleşik sayfa (örn. 'arsiv' = e-Sayılar)
--   Boşsa varsayılan davranış korunur (Ana Sayfa).
--
--   Seed: "Basılı Sayılar" sayfasının geri butonu okuru e-Sayılar arşivine
--   yönlendirir (müşteri isteği). Admin CMS > Filtre Sayfaları'ndan değiştirebilir.
--
-- CANLI VERİDE ÇALIŞTIRMADAN ÖNCE YEDEK ALIN (phpMyAdmin -> Export).
-- Idempotent: ADD COLUMN IF NOT EXISTS + koşullu UPDATE.
-- phpMyAdmin -> SQL sekmesine yapıştırıp çalıştırın.
-- =============================================================================

ALTER TABLE filtre_sayfalar
  ADD COLUMN IF NOT EXISTS geri_baslik VARCHAR(120) NULL AFTER aciklama,
  ADD COLUMN IF NOT EXISTS geri_hedef  VARCHAR(160) NULL AFTER geri_baslik;

-- Basılı Sayılar: geri butonu -> e-Sayılar (arsiv). Admin değiştirmediyse ayarla.
UPDATE filtre_sayfalar
   SET geri_baslik = 'e-Sayılar', geri_hedef = 'arsiv'
 WHERE slug = 'basili-sayilar'
   AND (geri_hedef IS NULL OR geri_hedef = '');
