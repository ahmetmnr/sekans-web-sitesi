-- =============================================================================
-- Migration: Kategori görünürlük bayrakları + yerleşik sayfa metinleri (Faz 12).
--
--   1) kategoriler.indeks_goster : "Sekans İndeks'te görünsün" (varsayılan AÇIK).
--      Kapalı kategoriler ve onlara ait içerikler İndeks kategori listesinde
--      ve "Tümü" dökümünde GÖRÜNMEZ. (Özellikle "Eski" kategorisi için.)
--   2) kategoriler.blog_goster  : "Blog'da sekme olarak görünsün" (varsayılan AÇIK).
--      Kapalı kategorilerin Blog sayfasında sekmesi çıkmaz; yalnızca kapalı
--      kategorilere ait yazılar Blog akışında listelenmez.
--   3) ayarlar.sayfa_metinleri  : Yerleşik sayfaların (Yazarlar / Blog) başlık ve
--      açıklama metinleri. Artık CMS > "Sayfa Metinleri" ekranından düzenlenir.
--   4) "Duyurular" filtre sayfasının geri butonu Blog'a yönlendirilir.
--
-- CANLI VERİDE ÇALIŞTIRMADAN ÖNCE YEDEK ALIN (phpMyAdmin -> Export).
-- Idempotent: ADD COLUMN IF NOT EXISTS + INSERT IGNORE + koşullu UPDATE.
-- phpMyAdmin -> SQL sekmesine yapıştırıp çalıştırın.
-- =============================================================================

ALTER TABLE kategoriler
  ADD COLUMN IF NOT EXISTS indeks_goster TINYINT(1) NOT NULL DEFAULT 1 AFTER aktif,
  ADD COLUMN IF NOT EXISTS blog_goster   TINYINT(1) NOT NULL DEFAULT 1 AFTER indeks_goster;

-- "Eski" kategorisi: yoksa oluştur, her hâlükârda İndeks ve Blog'da gizle.
-- (Eski duyurular vb. bu kategoriye taşınacak; sitede listelenmeyecek.)
INSERT IGNORE INTO kategoriler (code, ad, slug, sira_no, aktif, indeks_goster, blog_goster)
VALUES ('kat-eski', 'Eski', 'eski', 900, 1, 0, 0);

UPDATE kategoriler SET indeks_goster = 0, blog_goster = 0 WHERE ad = 'Eski';

-- Yerleşik sayfa metinleri: yalnızca kayıt yoksa varsayılanları yaz.
INSERT IGNORE INTO ayarlar (anahtar, deger) VALUES (
  'sayfa_metinleri',
  '{"yazarlar":{"baslik":"Yazarlar","aciklama":"Sekans''a katkıda bulunan yazarlar"},"blog":{"baslik":"Blog","aciklama":"Sekans dergisinin rutin sayılarından ayrı olarak yayınlanan, güncel sinema yazıları ve derinlemesine analizler."}}'
);

-- Duyurular: geri butonu -> Blog (admin değiştirmediyse ayarla).
UPDATE filtre_sayfalar
   SET geri_baslik = 'Blog', geri_hedef = 'arayazilar'
 WHERE slug = 'duyurular'
   AND (geri_hedef IS NULL OR geri_hedef = '');
