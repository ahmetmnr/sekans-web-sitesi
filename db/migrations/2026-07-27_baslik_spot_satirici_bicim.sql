-- =============================================================================
-- Migration: Başlık ve spot alanlarında SATIR İÇİ biçimlendirme.
--
--   Başlık ve spot artık düz metin değil; sınırlı satır içi HTML taşıyabilir
--   (kalın, italik, altı/üstü çizili, alt/üst simge, bağlantı). Dergi
--   başlıklarında film/kitap adının italik yazılması için gerekli:
--       Ayna Çatladı Üzerine  ->  <em>Ayna Çatladı</em> Üzerine
--
--   Punto ve yazı tipi bu alanlarda DEĞİŞTİRİLEMEZ; sitenin başlık tipografisi
--   sabittir. Bu yüzden etiket yükü sınırlıdır, ama <em>…</em> gibi sarmalar
--   karakter yediği için başlık kolonları genişletilir.
--
--   Mevcut düz metin başlıklar hiç etiket içermez; oldukları gibi çalışır.
--   Geri dönüş: kolon daraltmak veri kaybettirebilir, gerekmez.
--
-- CANLI VERİDE ÇALIŞTIRMADAN ÖNCE YEDEK ALIN (phpMyAdmin -> Export).
-- Tekrar çalıştırılabilir (MODIFY aynı tanımı yeniden uygular).
-- =============================================================================

ALTER TABLE yazilar
  MODIFY baslik VARCHAR(1000) NOT NULL;

ALTER TABLE ara_yazilar
  MODIFY baslik VARCHAR(1000) NOT NULL;

-- spot alanları hâlihazırda TEXT; değişiklik gerekmez.
