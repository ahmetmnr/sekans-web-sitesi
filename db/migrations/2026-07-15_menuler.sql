-- =============================================================================
-- Migration: Dinamik üst menü (Faz 1 — müşteri feedback maddesi 1, 9, 11).
--   Üst menü artık sabit kod yerine `menuler` tablosundan yönetilir:
--   admin panelden ekle/sil/yeniden adlandır/sırala/aktif-pasif yap ve başka bir
--   üst menünün altına taşı. Menü öğeleri şu hedef türlerine bağlanabilir:
--     - dahili          : yerleşik site sayfası (anasayfa, yazarlar, iletisim...)
--     - grup            : yalnızca açılır menü başlığı (tıklanınca alt öğeleri açar)
--     - sabit_sayfa     : statik sayfa (slug)
--     - kategori        : kategori adına göre filtrelenmiş liste
--     - filtre_liste    : admin tanımlı filtre sayfası (Faz 4 — slug)
--     - dergi_sayisi    : belirli bir dergi sayısı (code)
--     - dergi_sayilari  : "Sayılar" özel dinamik düğümü (sayıları otomatik listeler)
--     - harici_link     : haricî bağlantı (URL)
--
-- Seed, MEVCUT menü yapısını BİREBİR yeniden üretir; site görünümü değişmez.
-- Yeni dergi sayıları "Sayılar" (dergi_sayilari) düğümünde OTOMATİK görünür ve
-- Sayı Yönetimi'nden menu_etiket/menu_goster ile yeniden adlandırılıp gizlenir.
--
-- CANLI VERİDE ÇALIŞTIRMADAN ÖNCE YEDEK ALIN (phpMyAdmin -> Export).
-- Bir kez çalıştırılır (seed @seed guard'ı ile tekrar çalıştırmaya karşı korumalı).
-- phpMyAdmin -> SQL sekmesine yapıştırıp çalıştırın.
-- =============================================================================

CREATE TABLE IF NOT EXISTS menuler (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  parent_id      BIGINT UNSIGNED NULL,                 -- üst menü (NULL = en üst düzey)
  gorunen_baslik VARCHAR(160)    NOT NULL,             -- kullanıcıya görünen ad ("Lynch Sayısı")
  sistem_baslik  VARCHAR(160)    NULL,                 -- sistemin ürettiği ad ("Sayı özel")
  tur            ENUM('dahili','grup','sabit_sayfa','kategori','filtre_liste','dergi_sayisi','dergi_sayilari','harici_link')
                 NOT NULL DEFAULT 'dahili',            -- bağlantı türü
  hedef          VARCHAR(255)    NULL,                 -- pageId | slug | kategori adı | URL | sayı code
  sira           INT             NOT NULL DEFAULT 0,   -- aynı seviyedeki sıralama
  aktif          TINYINT(1)      NOT NULL DEFAULT 1,   -- menüde göster/gizle
  otomatik       TINYINT(1)      NOT NULL DEFAULT 0,   -- sistem tarafından otomatik eklendi mi
  yeni_sekme     TINYINT(1)      NOT NULL DEFAULT 0,   -- haricî bağlantı yeni sekmede açılsın mı
  created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_menuler_parent (parent_id),
  KEY idx_menuler_sira (parent_id, sira),
  CONSTRAINT fk_menuler_parent FOREIGN KEY (parent_id) REFERENCES menuler (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --- Seed: mevcut menü yapısını birebir kur (yalnızca tablo boşsa) --------------
SET @seed := (SELECT COUNT(*) FROM menuler);

-- 1) Ana Sayfa
INSERT INTO menuler (gorunen_baslik, tur, hedef, sira, aktif)
SELECT 'Ana Sayfa','dahili','anasayfa',0,1 FROM DUAL WHERE @seed = 0;

-- 2) Hakkımızda (açılır)
INSERT INTO menuler (gorunen_baslik, tur, sira, aktif)
SELECT 'Hakkımızda','grup',1,1 FROM DUAL WHERE @seed = 0;
SET @m_hakkimizda := LAST_INSERT_ID();
INSERT INTO menuler (parent_id, gorunen_baslik, tur, hedef, sira, aktif)
SELECT @m_hakkimizda,'Sekans Sinema Grubu','dahili','hakkimizda',0,1 FROM DUAL WHERE @seed = 0
UNION ALL SELECT @m_hakkimizda,'Sekans Yazı Standartları','sabit_sayfa','yazi-standartlari',1,1 FROM DUAL WHERE @seed = 0
UNION ALL SELECT @m_hakkimizda,'Duyurular','dahili','duyurular',2,1 FROM DUAL WHERE @seed = 0;

-- 3) Sayılar (dinamik — sayıları otomatik listeler)
INSERT INTO menuler (gorunen_baslik, tur, sira, aktif)
SELECT 'Sayılar','dergi_sayilari',2,1 FROM DUAL WHERE @seed = 0;

-- 4) Yarışma
INSERT INTO menuler (gorunen_baslik, tur, hedef, sira, aktif)
SELECT 'Yarışma','dahili','yarisma',3,1 FROM DUAL WHERE @seed = 0;

-- 5) Yazılar (açılır)
INSERT INTO menuler (gorunen_baslik, tur, sira, aktif)
SELECT 'Yazılar','grup',4,1 FROM DUAL WHERE @seed = 0;
SET @m_yazilar := LAST_INSERT_ID();
INSERT INTO menuler (parent_id, gorunen_baslik, tur, hedef, sira, aktif)
SELECT @m_yazilar,'Sekans İndeks','dahili','indeks',0,1 FROM DUAL WHERE @seed = 0
UNION ALL SELECT @m_yazilar,'Ara Yazılar','dahili','arayazilar-arayazi',1,1 FROM DUAL WHERE @seed = 0
UNION ALL SELECT @m_yazilar,'Sinema Kitaplığı','dahili','sinemakitapligi',2,1 FROM DUAL WHERE @seed = 0
UNION ALL SELECT @m_yazilar,'Texts in English','dahili','textsinenglish',3,1 FROM DUAL WHERE @seed = 0;

-- 6) Yazarlar
INSERT INTO menuler (gorunen_baslik, tur, hedef, sira, aktif)
SELECT 'Yazarlar','dahili','yazarlar',5,1 FROM DUAL WHERE @seed = 0;

-- 7) Arşiv (açılır)
INSERT INTO menuler (gorunen_baslik, tur, sira, aktif)
SELECT 'Arşiv','grup',6,1 FROM DUAL WHERE @seed = 0;
SET @m_arsiv := LAST_INSERT_ID();
INSERT INTO menuler (parent_id, gorunen_baslik, tur, hedef, sira, aktif)
SELECT @m_arsiv,'e-Sayılar','dahili','arsiv',0,1 FROM DUAL WHERE @seed = 0
UNION ALL SELECT @m_arsiv,'Basılı Sayılar','dahili','basilisayilar',1,1 FROM DUAL WHERE @seed = 0;

-- 8) İletişim
INSERT INTO menuler (gorunen_baslik, tur, hedef, sira, aktif)
SELECT 'İletişim','dahili','iletisim',7,1 FROM DUAL WHERE @seed = 0;
