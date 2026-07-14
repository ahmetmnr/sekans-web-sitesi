-- =============================================================================
-- Migration: Müşteri geri bildirimleri (Temmuz 2026)
--   1) Sayılar menüsü admin kontrolü: menü etiketi ("Lynch Sayısı" gibi),
--      menüde göster/gizle ve ana sayfada (yayındaki sayıya ek) gösterme bayrağı.
--   2) sayfalar tablosu: admin panelden düzenlenebilir statik sayfalar
--      (ilk kayıt: Sekans Yazı Standartları).
--   3) yarisma_bilgi genişletmesi: bilgi kartları + başvuru e-postası
--      admin panelden düzenlenebilir olsun.
--   4) yarisma_kazananlar.sira_no: api/routes/cms_writes.php'nin beklediği ama
--      şemada olmayan kolon (yarışma kaydetme hatasını giderir).
--   5) Kategori düzenlemeleri:
--      - 'Sekans Sinema Grubu' -> 'Duyurular' (eski 'Duyuru' yazıları da buraya taşınır)
--      - 'Arşiv Yazıları'      -> 'Texts in English'
--
-- CANLI VERİDE ÇALIŞTIRMADAN ÖNCE YEDEK ALIN (phpMyAdmin -> Export).
-- Bir kez çalıştırılır. phpMyAdmin -> SQL sekmesine yapıştırıp çalıştırın.
-- =============================================================================

-- 1) Sayılar menüsü / ana sayfa kolonları -------------------------------------
ALTER TABLE sayilar
  ADD COLUMN menu_etiket     VARCHAR(120) NULL     AFTER tam_baslik,  -- menüde görünen özel ad (boşsa "Sayı e26" gibi)
  ADD COLUMN menu_goster     TINYINT(1) NOT NULL DEFAULT 1 AFTER menu_etiket,   -- "Sayılar" menüsünde listelensin mi
  ADD COLUMN anasayfa_goster TINYINT(1) NOT NULL DEFAULT 0 AFTER menu_goster;   -- ana sayfada yayındaki sayıya EK olarak göster

-- Tüm sayılar varsayılan olarak menüde görünür (menu_goster=1). Üst menü, en yeni
-- birkaç sayıyı gösterir; admin panelden istenen sayı tek tıkla gizlenip
-- açılabilir. Yeni arşive inen sayı da varsayılan 1 ile otomatik menüye girer.

-- 2) Statik sayfalar ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS sayfalar (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(160)    NOT NULL,               -- ör. 'yazi-standartlari'
  baslik      VARCHAR(255)    NOT NULL,
  icerik      LONGTEXT        NULL,                   -- markdown-benzeri metin
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sayfalar_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO sayfalar (slug, baslik, icerik) VALUES
  ('yazi-standartlari', 'Sekans Yazı Standartları',
   'Sekans''a yazı göndermek isteyenler için yazı standartlarımız yakında burada yayınlanacaktır.\n\nSorularınız için info@sekans.org adresine yazabilirsiniz.')
ON DUPLICATE KEY UPDATE slug = slug;

-- 3) Yarışma bilgi kartları ---------------------------------------------------
ALTER TABLE yarisma_bilgi
  ADD COLUMN basvuru_tarihleri VARCHAR(255) NULL AFTER aciklama,  -- "Her yıl Mart-Nisan aylarında"
  ADD COLUMN kategori_metni    VARCHAR(255) NULL AFTER basvuru_tarihleri,
  ADD COLUMN odul_metni        VARCHAR(255) NULL AFTER kategori_metni,
  ADD COLUMN basvuru_email     VARCHAR(255) NULL AFTER odul_metni;

-- 4) yarisma_kazananlar.sira_no (kod bu kolonu bekliyor) -----------------------
ALTER TABLE yarisma_kazananlar
  ADD COLUMN sira_no INT NOT NULL DEFAULT 0 AFTER ikinci;

-- 5) Kategori adı düzenlemeleri -----------------------------------------------
-- 'Sekans Sinema Grubu' kategorisi artık 'Duyurular' adıyla görünür;
-- eski 'Duyuru' kategorisindeki yazılar da 'Duyurular' altında birleştirilir.
UPDATE kategoriler SET ad = 'Duyurular', slug = 'duyurular' WHERE ad = 'Sekans Sinema Grubu';
UPDATE ara_yazilar
SET kategori_ad = 'Duyurular',
    kategori_id = (SELECT id FROM kategoriler WHERE ad = 'Duyurular' LIMIT 1)
WHERE kategori_ad IN ('Duyuru', 'Sekans Sinema Grubu');

-- 'Arşiv Yazıları' (İngilizceye çevrilmiş yazılar) -> 'Texts in English'
UPDATE kategoriler SET ad = 'Texts in English', slug = 'texts-in-english' WHERE ad = 'Arşiv Yazıları';
UPDATE ara_yazilar
SET kategori_ad = 'Texts in English',
    kategori_id = (SELECT id FROM kategoriler WHERE ad = 'Texts in English' LIMIT 1)
WHERE kategori_ad = 'Arşiv Yazıları';
