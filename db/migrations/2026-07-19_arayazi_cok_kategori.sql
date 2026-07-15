-- =============================================================================
-- Migration: Blog yazılarında çoklu kategori (Faz 6 — feedback maddesi 5).
--   Bir ara yazı (blog) artık birden fazla kategoriyle ilişkilendirilebilir.
--   Blog kategorileri serbest metin (kategori_ad) olduğundan join tablo da
--   kategori ADINI tutar. Birincil kategori (kart etiketi) ara_yazilar.kategori_ad
--   olarak korunur; join tablo tüm kategorileri (birincil dahil) tutar.
--   Mevcut kategori_ad değerleri join tabloya taşınır (backfill).
--
-- CANLI VERİDE ÇALIŞTIRMADAN ÖNCE YEDEK ALIN (phpMyAdmin -> Export).
-- Bir kez çalıştırılır (backfill INSERT IGNORE ile idempotent).
-- =============================================================================

CREATE TABLE IF NOT EXISTS arayazi_kategorileri (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  arayazi_id  BIGINT UNSIGNED NOT NULL,
  kategori_ad VARCHAR(160)    NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_arayazi_kat (arayazi_id, kategori_ad),
  KEY idx_arayazi_kat_ad (kategori_ad),
  CONSTRAINT fk_arayazi_kat_yazi FOREIGN KEY (arayazi_id) REFERENCES ara_yazilar (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Backfill: mevcut birincil kategori adlarını join tabloya taşı.
INSERT IGNORE INTO arayazi_kategorileri (arayazi_id, kategori_ad)
SELECT id, kategori_ad FROM ara_yazilar WHERE kategori_ad IS NOT NULL AND kategori_ad <> '';
