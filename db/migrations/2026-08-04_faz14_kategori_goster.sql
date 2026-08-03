-- =============================================================================
-- Faz 14 Migration: Yazı bazında "kategori adını içindekilerde göster" bayrağı.
--
--   Sorun: bir sayıda aynı kategoriden çok yazı olunca içindekiler menüsünde
--   "DOSYA: ... / DOSYA: ... / DOSYA: ..." alt alta tekrarlıyor ve sayfayı
--   kalabalıklaştırıyordu.
--
--   Çözüm: her yazının kendi ON/OFF bayrağı var. Editör, bir kategorinin İLK
--   yazısında bayrağı AÇIK bırakır, aynı kategorinin sonraki yazılarında
--   KAPATIR. Böylece kategori adı grubun tepesinde bir kez görünür.
--
--   Bayrak yalnızca kategori SATIRININ görünürlüğünü etkiler; yazının kategori
--   ataması, filtreler, arama ve Sekans İndeks bundan ETKİLENMEZ.
--
--   Girintiler de etkilenmez: başlık ve yazar adı, kategori satırı gizli olsa
--   da aynı hizada kalır (bkz. SonSayiSection / SonSayiDetay ızgara düzeni).
--
--   Varsayılan 1 (görünür) — migration sonrası mevcut tüm yazılar bugünkü
--   davranışını korur.
--
-- CANLI VERİDE ÇALIŞTIRMADAN ÖNCE YEDEK ALIN (phpMyAdmin -> Export).
-- Tekrar çalıştırılabilir: kolon varsa ADD COLUMN hata verir, önce kontrol edin.
-- =============================================================================

ALTER TABLE yazilar
  ADD COLUMN kategori_goster TINYINT(1) NOT NULL DEFAULT 1
  AFTER kategori_id;
