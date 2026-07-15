-- =============================================================================
-- Migration: Filtrelenmiş içerik listeleme sayfaları (Faz 4 — feedback maddesi 6).
--   Admin panelden belirli bir kategoriye bağlı içerik listeleme sayfaları
--   oluşturulabilir. Her sayfada yönetilebilir ayarlar:
--     - baslik, aciklama
--     - kategori (gösterilecek kategori adı)
--     - siralama (yeni | eski | alfabetik)
--     - sayfa_basina (sayfalama: sayfa başına içerik sayısı)
--     - kapak_goster (kapak görseli gösterimi)
--     - yazar_tarih_goster (yazar ve tarih gösterimi)
--   Seed: Ara Yazı (Blog filtresi), Sinema Kitaplığı, Texts in English, Duyurular.
--
-- CANLI VERİDE ÇALIŞTIRMADAN ÖNCE YEDEK ALIN (phpMyAdmin -> Export).
-- Bir kez çalıştırılır (seed @seed guard'ı ile korumalı).
-- =============================================================================

CREATE TABLE IF NOT EXISTS filtre_sayfalar (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug               VARCHAR(160)    NOT NULL,             -- URL adresi
  baslik             VARCHAR(255)    NOT NULL,
  aciklama           VARCHAR(500)    NULL,
  kategori           VARCHAR(160)    NULL,                 -- gösterilecek kategori adı
  siralama           ENUM('yeni','eski','alfabetik') NOT NULL DEFAULT 'yeni',
  sayfa_basina       INT             NOT NULL DEFAULT 12,
  kapak_goster       TINYINT(1)      NOT NULL DEFAULT 1,
  yazar_tarih_goster TINYINT(1)      NOT NULL DEFAULT 1,
  aktif              TINYINT(1)      NOT NULL DEFAULT 1,
  sira               INT             NOT NULL DEFAULT 0,
  created_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_filtre_sayfalar_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --- Seed: örnek filtre sayfaları (yalnızca tablo boşsa) -----------------------
SET @seed := (SELECT COUNT(*) FROM filtre_sayfalar);
INSERT INTO filtre_sayfalar (slug, baslik, aciklama, kategori, siralama, sayfa_basina, sira)
SELECT 'ara-yazi', 'Ara Yazılar', 'Sekans dergisinin rutin sayılarından ayrı yayınlanan güncel sinema yazıları.', 'Ara Yazı', 'yeni', 12, 0 FROM DUAL WHERE @seed = 0
UNION ALL SELECT 'sinema-kitapligi', 'Sinema Kitaplığı', 'Sinema üzerine kitap tanıtımları ve değerlendirmeleri.', 'Sinema Kitaplığı', 'yeni', 12, 1 FROM DUAL WHERE @seed = 0
UNION ALL SELECT 'texts-in-english', 'Texts in English', 'English translations of selected Sekans texts.', 'Texts in English', 'yeni', 12, 2 FROM DUAL WHERE @seed = 0
UNION ALL SELECT 'duyurular', 'Duyurular', 'Yarışma duyuruları, sonuçlar ve Sekans''tan haberler.', 'Duyurular', 'yeni', 12, 3 FROM DUAL WHERE @seed = 0;
