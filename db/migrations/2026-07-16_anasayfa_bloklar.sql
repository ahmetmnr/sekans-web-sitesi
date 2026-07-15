-- =============================================================================
-- Migration: Ana sayfa blok/panel sistemi (Faz 2 — müşteri feedback maddesi 2, 11).
--   Ana sayfadaki paneller artık sabit kod yerine `anasayfa_bloklar` tablosundan
--   yönetilir: hangi paneller gösterilecek, sıraları ve başlıkları admin panelden
--   ayarlanır (kod değişikliği / yeniden dağıtım gerekmez).
--   tip:
--     - sayilar  : ana sayfada gösterilecek dergi sayısı bölüm(ler)i
--                  (hangi sayılar => Sayı Yönetimi'ndeki anasayfa_goster)
--     - blog     : "Blog" (ara yazılar) paneli
--     - kategori : belirli bir kategorinin yazılarını gösteren panel
--   ayar (JSON): { "kategori": "...", "adet": 6 } — tip'e göre.
--
-- CANLI VERİDE ÇALIŞTIRMADAN ÖNCE YEDEK ALIN (phpMyAdmin -> Export).
-- Bir kez çalıştırılır (seed @seed guard'ı ile korumalı).
-- =============================================================================

CREATE TABLE IF NOT EXISTS anasayfa_bloklar (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tip         ENUM('sayilar','blog','kategori') NOT NULL DEFAULT 'blog',
  baslik      VARCHAR(200)    NULL,                 -- panel başlığı (düzenlenebilir; boş olabilir)
  sira        INT             NOT NULL DEFAULT 0,
  aktif       TINYINT(1)      NOT NULL DEFAULT 1,
  ayar        LONGTEXT        NULL,                 -- JSON: {kategori, adet}
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_anasayfa_bloklar_sira (sira)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --- Seed: mevcut ana sayfa yapısını birebir kur (yalnızca tablo boşsa) ---------
SET @seed := (SELECT COUNT(*) FROM anasayfa_bloklar);
INSERT INTO anasayfa_bloklar (tip, baslik, sira, aktif, ayar)
SELECT 'sayilar', NULL, 0, 1, NULL FROM DUAL WHERE @seed = 0
UNION ALL SELECT 'blog', 'Blog', 1, 1, '{"adet":6}' FROM DUAL WHERE @seed = 0;
