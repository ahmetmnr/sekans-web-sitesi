-- =============================================================================
-- Migration: Özel bölüm sayfalarını filtre_sayfalar sistemine taşı (Faz 9).
--   "Basılı Sayılar", "Yazarlarımızdan", "Sinema Kitaplığı", "Texts in English"
--   ve "Duyurular" sayfaları App.tsx'te SABİT KODLU başlık/açıklamayla render
--   ediliyordu (static — admin panelden düzenlenemiyordu). Artık her biri
--   filtre_sayfalar kaydına bağlanır; başlık, açıklama, sıralama, sayfalama,
--   kapak/yazar-tarih gösterimi CMS > Filtre Sayfaları'ndan yönetilir ve üst
--   menü (menuler) bu filtre sayfalarına yönlendirilir.
--
--   ÖNEMLİ — görünen ad != kategori adı. Kategori adları verinin GERÇEĞİYLE
--   eşlenir (kategoriler tablosundaki gerçek adlar):
--     - "Duyurular"        -> 'Duyuru' + 'Sekans Sinema Grubu'
--     - "Texts in English" -> 'Arşiv Yazıları'
--     - "Sinema Kitaplığı" -> 'Sinema Kitaplığı'
--     - "Basılı Sayılar"   -> 'Basılı Sayılar'
--     - "Yazarlarımızdan"  -> 'Yazarlarımızdan'
--   (Faz 4 seed'i "Duyurular"/"Texts in English" görünen adlarını kullanmıştı;
--    bunlar kategoriler tablosunda YOK, o yüzden o filtre sayfaları BOŞ geliyordu.)
--
--   Çoklu kategori: filtre_sayfalar.kategori artık '|' ile ayrılmış birden çok
--   kategori adı tutabilir. FiltreListeSayfasi bunları VEYA (OR) mantığıyla eşler.
--   Böylece "Duyurular" iki kategoriyi birden ('Duyuru' + 'Sekans Sinema Grubu')
--   kapsar (eski BOLUM_KATEGORILERI davranışı korunur, kayıt kaybı olmaz).
--
-- CANLI VERİDE ÇALIŞTIRMADAN ÖNCE YEDEK ALIN (phpMyAdmin -> Export).
-- Tümü idempotent: tekrar çalıştırmak güvenlidir.
-- phpMyAdmin -> SQL sekmesine yapıştırıp çalıştırın.
-- =============================================================================

-- 1) Beş özel bölüm için filtre sayfalarını garanti et -------------------------
--    INSERT IGNORE: slug UNIQUE (uq_filtre_sayfalar_slug) olduğundan zaten var
--    olan satırlar sessizce atlanır. Faz 4 seed'inde sinema-kitapligi /
--    texts-in-english / duyurular oluşmuş olabilir; kategori düzeltmesi adım 2'de.
INSERT IGNORE INTO filtre_sayfalar (slug, baslik, aciklama, kategori, siralama, sayfa_basina, sira) VALUES
  ('basili-sayilar',   'Basılı Sayılar',   'Sekans Sinema Yazıları Seçkisi ve diğer basılı yayınlarımız.', 'Basılı Sayılar',              'yeni', 12, 10),
  ('yazarlarimizdan',  'Yazarlarımızdan',  'Sekans yazarlarının dergi dışında kaleme aldığı yazılar.',      'Yazarlarımızdan',             'yeni', 12, 11),
  ('sinema-kitapligi', 'Sinema Kitaplığı', 'Sinema üzerine kitap tanıtımları ve değerlendirmeleri.',        'Sinema Kitaplığı',            'yeni', 12, 12),
  ('texts-in-english', 'Texts in English', 'English translations of selected Sekans texts.',                'Arşiv Yazıları',              'yeni', 12, 13),
  ('duyurular',        'Duyurular',        'Yarışma duyuruları, sonuçlar ve Sekans''tan haberler.',          'Duyuru|Sekans Sinema Grubu',  'yeni', 12, 14);

-- 2) Faz 4 seed'inin HATALI kategori adlarını düzelt (yalnızca eski değerdeyse) -
--    Admin daha önce elle değiştirdiyse (beklenmez) DOKUNMA.
UPDATE filtre_sayfalar SET kategori = 'Duyuru|Sekans Sinema Grubu'
WHERE slug = 'duyurular' AND (kategori IS NULL OR kategori = '' OR kategori = 'Duyurular');

UPDATE filtre_sayfalar SET kategori = 'Arşiv Yazıları'
WHERE slug = 'texts-in-english' AND (kategori IS NULL OR kategori = '' OR kategori = 'Texts in English');

-- 3) Üst menüyü (menuler) filtre sayfalarına yönlendir --------------------------
--    Gömülü (dahili) hedefleri filtre_liste'ye çevir. Bir kez çalışır: tur
--    'filtre_liste' olduktan sonra WHERE koşulu eşleşmez (idempotent).
UPDATE menuler SET tur = 'filtre_liste', hedef = 'basili-sayilar'
WHERE tur = 'dahili' AND hedef = 'basilisayilar';

UPDATE menuler SET tur = 'filtre_liste', hedef = 'sinema-kitapligi'
WHERE tur = 'dahili' AND hedef = 'sinemakitapligi';

UPDATE menuler SET tur = 'filtre_liste', hedef = 'texts-in-english'
WHERE tur = 'dahili' AND hedef = 'textsinenglish';

UPDATE menuler SET tur = 'filtre_liste', hedef = 'duyurular'
WHERE tur = 'dahili' AND hedef = 'duyurular';
